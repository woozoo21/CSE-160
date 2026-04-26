// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  }`;

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`;

// Global Variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_ModelMatrix;
let u_GlobalRotateMatrix;

let g_globalAngle = 0;

let g_startTime = performance.now() / 1000.0;
let g_seconds = performance.now() / 1000.0 - g_startTime;
let g_lastFrameTime = performance.now();

let g_frontLegAngle = 30;
let g_backLegAngle = 30;
let g_crawlPhase = 0;
let g_animMode = 'none';
let g_bodyBounce = 0;

let g_tailBaseAngle = 0;
let g_tailMidAngle = 0;
let g_tailTipAngle = 0;

let g_mouseDown = false;
let g_lastMouseY = 0;
let g_mouseAngle = 0;
let g_mouseAngleX = 0;
let g_rollAngle = 0;

let g_pokeTime = 0;

function setupWebGL() {
  canvas = document.getElementById('webgl');
  gl = canvas.getContext('webgl', { preserveDrawingBuffer: true });
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to initialize shaders.');
    return;
  }

  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get a_Position');
    return;
  }

  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) { console.log('Failed to get u_FragColor'); return; }

  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) { console.log('Failed to get u_ModelMatrix'); return; }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) { console.log('Failed to get u_GlobalRotateMatrix'); return; }

  // Set identity matrix as default
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

function addActionsForHtmlUI() {
  document.getElementById('angleSlide').addEventListener('input', function() {
    g_globalAngle = this.value;
    renderScene();
  });

  document.getElementById('frontLegSlide').addEventListener('input', function() {
    g_frontLegAngle = parseFloat(this.value);
    renderScene();
  });

  document.getElementById('backLegSlide').addEventListener('input', function() {
    g_backLegAngle = parseFloat(this.value);
    renderScene();
  });

  document.getElementById('runBtn').onclick = function() {
    g_animMode = 'run';
    tick();
  };

  document.getElementById('crawlBtn').onclick = function() {
    g_animMode = 'crawl';
    tick();
  };

  document.getElementById('animOffBtn').onclick = function() {
    g_animMode = 'none';
  };
  document.getElementById('tailBaseSlide').addEventListener('input', function() {
    g_tailBaseAngle = parseFloat(this.value);
    renderScene();
  });
  document.getElementById('tailMidSlide').addEventListener('input', function() {
    g_tailMidAngle = parseFloat(this.value);
    renderScene();
  });
  document.getElementById('tailTipSlide').addEventListener('input', function() {
    g_tailTipAngle = parseFloat(this.value);
    renderScene();
  });
}

function tick() {
  if (g_animMode === 'none') return;
  updateAnimationAngles();
  renderScene();
  requestAnimationFrame(tick);
}

function updateAnimationAngles() {
  var t = performance.now() / 1000.0 - g_startTime;
  if (g_animMode === 'run') {
    g_frontLegAngle = 30 + 25 * Math.sin(t * 5);
    g_backLegAngle  = 30 + 25 * Math.sin(t * 5 + Math.PI);
    g_crawlPhase    = 0;
    g_bodyBounce    = -0.04 * Math.sin(t * 5);
    g_tailBaseAngle = 20 * Math.sin(t * 5);
    g_tailMidAngle  = 15 * Math.sin(t * 5 + 1);
    g_tailTipAngle  = 10 * Math.sin(t * 5 + 2);
  } else if (g_animMode === 'crawl') {
    g_frontLegAngle = 30;
    g_backLegAngle  = 30;
    g_crawlPhase    = 22 * Math.sin(t * 2);
    g_bodyBounce    = -0.015 * Math.abs(Math.sin(t * 2));
    g_tailBaseAngle = 10 * Math.sin(t * 2);
    g_tailMidAngle  = 8 * Math.sin(t * 2 + 1);
    g_tailTipAngle  = 5 * Math.sin(t * 2 + 2);
  } else if (g_animMode === 'poke') {
    var dt = performance.now() / 1000.0 - g_pokeTime;
    
    // jump
    g_bodyBounce = 0.4 * Math.sin(dt * Math.PI);
    
    // legs tucked
    g_frontLegAngle = 30 + 20 * Math.sin(dt * 6);
    g_backLegAngle  = 30 + 20 * Math.sin(dt * 6 + Math.PI);
    g_tailBaseAngle = 30 * Math.sin(dt * 6);
    g_tailMidAngle  = 20 * Math.sin(dt * 6 + 1);
    g_tailTipAngle  = 10 * Math.sin(dt * 6 + 2);
    
    if (dt > 1.0) {
      g_animMode = 'none';
      g_bodyBounce = 0;
      g_rollAngle = 0;
    }
  }
}

function drawCylinder(matrix, color, sides) {
  sides = sides || 12;
  gl.uniform4f(u_FragColor, color[0], color[1], color[2], color[3]);
  gl.uniformMatrix4fv(u_ModelMatrix, false, matrix.elements);
  
  var angleStep = 360 / sides;
  
  for (var angle = 0; angle < 360; angle += angleStep) {
    var a1 = angle * Math.PI / 180;
    var a2 = (angle + angleStep) * Math.PI / 180;
    
    var x1 = Math.cos(a1) * 0.5;
    var y1 = Math.sin(a1) * 0.5;
    var x2 = Math.cos(a2) * 0.5;
    var y2 = Math.sin(a2) * 0.5;
    
    // side face
    drawTriangle3D([x1,y1,0, x2,y2,0, x2,y2,1]);
    drawTriangle3D([x1,y1,0, x2,y2,1, x1,y1,1]);
    
    // front cap
    drawTriangle3D([0,0,1, x1,y1,1, x2,y2,1]);
    
    // back cap
    drawTriangle3D([0,0,0, x2,y2,0, x1,y1,0]);
  }
}

function main() {
  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHtmlUI();

  canvas.onmousedown = function(ev) {
    if (ev.shiftKey) {
      g_pokeTime = performance.now() / 1000.0;
      g_animMode = 'poke';
      tick();
    } else {
      g_mouseDown = true;
      g_lastMouseX = ev.clientX;
      g_lastMouseY = ev.clientY;
    }
  };

  canvas.onmousemove = function(ev) {
    if (!g_mouseDown) return;
    var dx = ev.clientX - g_lastMouseX;
    var dy = ev.clientY - g_lastMouseY;
    g_mouseAngle = (g_mouseAngle + dx * 1.0) % 360;
    g_mouseAngleX = Math.max(-90, Math.min(90, g_mouseAngleX + dy * 1.0));
    g_lastMouseX = ev.clientX;
    g_lastMouseY = ev.clientY;
    renderScene();
  };

  canvas.onmouseup = function(ev) {
    g_mouseDown = false;
  };

  gl.clearColor(0.1, 0.1, 0.1, 1.0);
  renderScene();
}

function renderScene() {
  var fLAngle  = g_frontLegAngle + g_crawlPhase;
  var fRAngle  = g_frontLegAngle - g_crawlPhase;
  var bLAngle  = g_backLegAngle  - g_crawlPhase;
  var bRAngle  = g_backLegAngle  + g_crawlPhase;
  var fPawLAng = 0.7 * (fLAngle - 30);
  var fPawRAng = 0.7 * (fRAngle - 30);
  var bPawLAng = 0.7 * (bLAngle - 30);
  var bPawRAng = 0.7 * (bRAngle - 30);

  var globalRotMat = new Matrix4()
    .translate(0, g_bodyBounce, 0)
    .rotate(g_globalAngle, 0, 1, 0)
    .rotate(g_mouseAngle, 0, 1, 0)
    .rotate(g_mouseAngleX, 1, 0, 0)
    .rotate(g_rollAngle, 0, 0, 1);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // --- BODY ---
  var body = new Cube();
  body.color = [0.45, 0.55, 0.65, 1.0];
  body.matrix.translate(-0.2, -0.1, -0.2);
  body.matrix.scale(0.4, 0.25, 0.45);
  body.render();

  // --- BODY FRONT TAPER ---
  var bodyF = new Cube();
  bodyF.color = [0.45, 0.55, 0.65, 1.0];
  bodyF.matrix.translate(-0.16, -0.08, -0.36);
  bodyF.matrix.scale(0.32, 0.22, 0.16);
  bodyF.render();

  // --- BODY BACK TAPER ---
  var bodyB = new Cube();
  bodyB.color = [0.45, 0.55, 0.65, 1.0];
  bodyB.matrix.translate(-0.14, -0.08, 0.24);
  bodyB.matrix.scale(0.28, 0.2, 0.14);
  bodyB.render();

  // --- NECK ---
  var neck = new Cube();
  neck.color = [0.45, 0.55, 0.65, 1.0];
  neck.matrix.translate(-0.13, -0.02, -0.48);
  neck.matrix.scale(0.26, 0.2, 0.12);
  neck.render();

  // --- HEAD ---
  var head = new Cube();
  head.color = [0.45, 0.55, 0.65, 1.0];
  head.matrix.translate(-0.22, 0.05, -0.72);
  head.matrix.scale(0.44, 0.36, 0.28);
  head.render();

  // --- SNOUT BASE ---
  var snoutBase = new Cube();
  snoutBase.color = [0.82, 0.65, 0.67, 1.0];
  snoutBase.matrix.translate(-0.13, 0.06, -0.82);
  snoutBase.matrix.scale(0.26, 0.16, 0.1);
  snoutBase.render();

  // --- SNOUT TIP ---
  var snoutTip = new Cube();
  snoutTip.color = [0.85, 0.68, 0.7, 1.0];
  snoutTip.matrix.translate(-0.1, 0.08, -0.9);
  snoutTip.matrix.scale(0.2, 0.14, 0.08);
  snoutTip.render();

  // --- NOSE ---
  var nose = new Cube();
  nose.color = [0.9, 0.52, 0.55, 1.0];
  nose.matrix.translate(-0.06, 0.1, -0.94);
  nose.matrix.scale(0.12, 0.09, 0.05);
  nose.render();

  // --- LEFT EAR - cylinder ---
  var earLMat = new Matrix4();
  earLMat.translate(-0.25, 0.42, -0.65);
  earLMat.rotate(90, 0, 0, 1);
  earLMat.scale(0.35, 0.4, 0.06);
  drawCylinder(earLMat, [0.75, 0.58, 0.6, 1.0], 16);

  // --- LEFT EAR INNER ---
  var earLIMat = new Matrix4();
  earLIMat.translate(-0.25, 0.42, -0.652);  // slightly forward
  earLIMat.rotate(90, 0, 0, 1);
  earLIMat.scale(0.22, 0.26, 0.05);  // slightly smaller
  drawCylinder(earLIMat, [0.95, 0.78, 0.78, 1.0], 16);

  // --- RIGHT EAR - cylinder ---
  var earRMat = new Matrix4();
  earRMat.translate(0.25, 0.42, -0.65);
  earRMat.rotate(90, 0, 0, 1);
  earRMat.scale(0.35, 0.4, 0.06);
  drawCylinder(earRMat, [0.75, 0.58, 0.6, 1.0], 16);

  // --- RIGHT EAR INNER ---
  var earRIMat = new Matrix4();
  earRIMat.translate(0.25, 0.42, -0.652);  // slightly forward
  earRIMat.rotate(90, 0, 0, 1);
  earRIMat.scale(0.22, 0.26, 0.05);  // slightly smaller
  drawCylinder(earRIMat, [0.95, 0.78, 0.78, 1.0], 16);

  // --- LEFT EYE WHITE ---
  var eyeLW = new Cube();
  eyeLW.color = [0.95, 0.95, 0.95, 1.0];
  eyeLW.matrix.translate(-0.16, 0.21, -0.73);
  eyeLW.matrix.scale(0.11, 0.11, 0.04);
  eyeLW.render();

  // --- LEFT EYE IRIS ---
  var eyeLI = new Cube();
  eyeLI.color = [0.35, 0.2, 0.1, 1.0];
  eyeLI.matrix.translate(-0.148, 0.222, -0.74);
  eyeLI.matrix.scale(0.075, 0.075, 0.03);
  eyeLI.render();

  // --- LEFT EYE PUPIL ---
  var eyeLP = new Cube();
  eyeLP.color = [0.05, 0.05, 0.05, 1.0];
  eyeLP.matrix.translate(-0.138, 0.232, -0.75);
  eyeLP.matrix.scale(0.045, 0.045, 0.025);
  eyeLP.render();

  // --- LEFT EYE HIGHLIGHT ---
  var eyeLH = new Cube();
  eyeLH.color = [1.0, 1.0, 1.0, 1.0];
  eyeLH.matrix.translate(-0.125, 0.245, -0.76);
  eyeLH.matrix.scale(0.02, 0.02, 0.02);
  eyeLH.render();

  // --- RIGHT EYE WHITE ---
  var eyeRW = new Cube();
  eyeRW.color = [0.95, 0.95, 0.95, 1.0];
  eyeRW.matrix.translate(0.05, 0.21, -0.73);
  eyeRW.matrix.scale(0.11, 0.11, 0.04);
  eyeRW.render();

  // --- RIGHT EYE IRIS ---
  var eyeRI = new Cube();
  eyeRI.color = [0.35, 0.2, 0.1, 1.0];
  eyeRI.matrix.translate(0.062, 0.222, -0.74);
  eyeRI.matrix.scale(0.075, 0.075, 0.03);
  eyeRI.render();

  // --- RIGHT EYE PUPIL ---
  var eyeRP = new Cube();
  eyeRP.color = [0.05, 0.05, 0.05, 1.0];
  eyeRP.matrix.translate(0.072, 0.232, -0.75);
  eyeRP.matrix.scale(0.045, 0.045, 0.025);
  eyeRP.render();

  // --- RIGHT EYE HIGHLIGHT ---
  var eyeRH = new Cube();
  eyeRH.color = [1.0, 1.0, 1.0, 1.0];
  eyeRH.matrix.translate(0.085, 0.245, -0.76);
  eyeRH.matrix.scale(0.02, 0.02, 0.02);
  eyeRH.render();

  // --- FRONT LEFT LEG ---
  var fLegL = new Cube();
  fLegL.color = [0.45, 0.55, 0.65, 1.0];
  fLegL.matrix.translate(-0.28, -0.1, -0.35);
  fLegL.matrix.rotate(fLAngle, 1, 0, 0);
  fLegL.matrix.scale(0.12, 0.18, 0.12);
  fLegL.render();

  // --- FRONT LEFT PAW - inherits leg matrix ---
  var fPawL = new Cube();
  fPawL.color = [0.82, 0.63, 0.66, 1.0];
  fPawL.matrix = new Matrix4(fLegL.matrix);
  fPawL.matrix.scale(1/0.12, 1/0.18, 1/0.12); // undo leg scale
  fPawL.matrix.translate(-0.02, -0.05, -0.09);
  fPawL.matrix.rotate(fPawLAng, 1, 0, 0);
  fPawL.matrix.scale(0.16, 0.05, 0.2);
  fPawL.render();

  // --- FRONT RIGHT LEG ---
  var fLegR = new Cube();
  fLegR.color = [0.45, 0.55, 0.65, 1.0];
  fLegR.matrix.translate(0.16, -0.1, -0.35);
  fLegR.matrix.rotate(fRAngle, 1, 0, 0);
  fLegR.matrix.scale(0.12, 0.18, 0.12);
  fLegR.render();

  // --- FRONT RIGHT PAW ---
  var fPawR = new Cube();
  fPawR.color = [0.82, 0.63, 0.66, 1.0];
  fPawR.matrix = new Matrix4(fLegR.matrix);
  fPawR.matrix.scale(1/0.12, 1/0.18, 1/0.12);
  fPawR.matrix.translate(-0.02, -0.05, -0.09);
  fPawR.matrix.rotate(fPawRAng, 1, 0, 0);
  fPawR.matrix.scale(0.16, 0.05, 0.2);
  fPawR.render();

  // --- BACK LEFT LEG ---
  var bLegL = new Cube();
  bLegL.color = [0.45, 0.55, 0.65, 1.0];
  bLegL.matrix.translate(-0.28, -0.1, 0.1);
  bLegL.matrix.rotate(bLAngle, 1, 0, 0);
  bLegL.matrix.scale(0.12, 0.18, 0.14);
  bLegL.render();

  // --- BACK LEFT PAW ---
  var bPawL = new Cube();
  bPawL.color = [0.82, 0.63, 0.66, 1.0];
  bPawL.matrix = new Matrix4(bLegL.matrix);
  bPawL.matrix.scale(1/0.12, 1/0.18, 1/0.14);
  bPawL.matrix.translate(-0.02, -0.05, -0.1);
  bPawL.matrix.rotate(bPawLAng, 1, 0, 0);
  bPawL.matrix.scale(0.16, 0.05, 0.24);
  bPawL.render();

  // --- BACK RIGHT LEG ---
  var bLegR = new Cube();
  bLegR.color = [0.45, 0.55, 0.65, 1.0];
  bLegR.matrix.translate(0.16, -0.1, 0.1);
  bLegR.matrix.rotate(bRAngle, 1, 0, 0);
  bLegR.matrix.scale(0.12, 0.18, 0.14);
  bLegR.render();

  // --- BACK RIGHT PAW ---
  var bPawR = new Cube();
  bPawR.color = [0.82, 0.63, 0.66, 1.0];
  bPawR.matrix = new Matrix4(bLegR.matrix);
  bPawR.matrix.scale(1/0.12, 1/0.18, 1/0.14);
  bPawR.matrix.translate(-0.02, -0.05, -0.1);
  bPawR.matrix.rotate(bPawRAng, 1, 0, 0);
  bPawR.matrix.scale(0.16, 0.05, 0.24);
  bPawR.render();

  // --- TAIL BASE ---
  var tail1 = new Cube();
  tail1.color = [0.82, 0.63, 0.66, 1.0];
  tail1.matrix.translate(-0.02, -0.05, 0.34);
  tail1.matrix.rotate(g_tailBaseAngle, 1, 0, 0);
  tail1.matrix.scale(0.05, 0.05, 0.2);
  tail1.render();

  // --- TAIL MID - inherits base rotation ---
  var tail2 = new Cube();
  tail2.color = [0.80, 0.61, 0.64, 1.0];
  tail2.matrix = new Matrix4(tail1.matrix);
  tail2.matrix.scale(1/0.05, 1/0.05, 1/0.2);
  tail2.matrix.translate(0, 0, 0.2);
  tail2.matrix.rotate(g_tailBaseAngle + g_tailMidAngle, 1, 0, 0);
  tail2.matrix.scale(0.04, 0.04, 0.2);
  tail2.render();

  // --- TAIL TIP - inherits base + mid rotation ---
  var tail3 = new Cube();
  tail3.color = [0.78, 0.59, 0.62, 1.0];
  tail3.matrix = new Matrix4(tail2.matrix);
  tail3.matrix.scale(1/0.04, 1/0.04, 1/0.2);
  tail3.matrix.translate(0, 0, 0.2);
  tail3.matrix.rotate(g_tailBaseAngle + g_tailMidAngle + g_tailTipAngle, 1, 0, 0);
  tail3.matrix.scale(0.03, 0.03, 0.2);
  tail3.render();

  // FPS
  var now = performance.now();
  var elapsed = now - g_lastFrameTime;
  g_lastFrameTime = now;
  document.getElementById('fps').innerHTML = 'FPS: ' + Math.floor(1000/elapsed);
}