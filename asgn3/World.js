// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  attribute vec2 a_TexCoord;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  varying vec2 v_TexCoord;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;
    v_TexCoord = a_TexCoord;
  }`;

var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform float u_texColorWeight;
  uniform int u_whichTexture;
  varying vec2 v_TexCoord;
  void main() {
    vec4 texColor;
    if (u_whichTexture == 0) {
      texColor = texture2D(u_Sampler0, v_TexCoord);
    } else {
      texColor = texture2D(u_Sampler1, v_TexCoord);
    }
    gl_FragColor = mix(u_FragColor, texColor, u_texColorWeight);
  }`;

// Global Variables
let canvas, gl;
let a_Position, a_TexCoord;
let u_FragColor, u_ModelMatrix, u_ViewMatrix, u_ProjectionMatrix;
let u_Sampler0, u_Sampler1, u_texColorWeight, u_whichTexture;
let camera;

let g_startTime = performance.now() / 1000.0;
let g_lastFrameTime = performance.now();

// Rat animation angles
let g_frontLegAngle = 30;
let g_backLegAngle  = 30;
let g_crawlPhase    = 0;
let g_tailBaseAngle = 0;
let g_tailMidAngle  = 0;
let g_tailTipAngle  = 0;
let g_bodyBounce    = 0;
let g_eyesClosed    = false;

// Mouse
let g_mouseDown  = false;
let g_lastMouseX = 0;
let g_lastMouseY = 0;

let g_cheese = [
  {x: 1,  z: 1,  eaten: false},
  {x: 5,  z: 1,  eaten: false},
  {x: 6,  z: 2,  eaten: false},
  {x: 7,  z: 3,  eaten: false},
  {x: 9,  z: 5,  eaten: false},
  {x: 12, z: 6,  eaten: false},
  {x: 15, z: 7,  eaten: false},
  {x: 18, z: 8,  eaten: false},
  {x: 18, z: 12, eaten: false},
  {x: 18, z: 16, eaten: false},
  {x: 18, z: 20, eaten: false},
  {x: 20, z: 22, eaten: false},
  {x: 22, z: 24, eaten: false},
  {x: 26, z: 24, eaten: false},
  {x: 30, z: 24, eaten: false},
  {x: 30, z: 28, eaten: false},
];

let g_map = [
  [4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
  [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
  [4,0,2,2,2,2,0,2,2,2,2,2,0,2,2,2,0,2,2,2,2,0,2,2,2,2,2,0,2,2,0,4],
  [4,0,2,0,0,0,0,0,0,0,0,2,0,0,0,2,0,2,0,0,0,0,0,0,0,0,2,0,0,2,0,4],
  [4,0,3,0,3,3,3,3,3,0,3,3,3,3,0,3,0,3,0,3,3,3,3,0,3,0,3,3,0,3,0,4],
  [4,0,2,0,2,0,0,0,2,0,0,0,0,2,0,2,0,2,0,2,0,0,2,0,2,0,0,2,0,2,0,4],
  [4,0,2,0,2,0,2,0,2,2,2,2,0,2,0,2,0,2,0,2,0,2,2,0,2,2,0,2,0,2,0,4],
  [4,0,0,0,2,0,2,0,0,0,0,2,0,0,0,0,0,0,0,2,0,2,0,0,0,2,0,0,0,2,0,4],
  [4,3,3,0,3,0,3,3,3,0,0,3,3,3,3,3,3,3,0,3,0,3,3,3,0,3,3,3,0,3,0,4],
  [4,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,2,0,2,0,0,0,2,0,0,0,2,0,2,0,4],
  [4,0,2,2,2,2,2,0,2,0,2,2,2,2,2,0,0,2,0,2,2,2,0,2,2,2,0,2,0,0,0,4],
  [4,0,0,0,0,0,2,0,2,0,2,0,0,0,2,2,0,2,0,0,0,2,0,0,0,2,0,2,2,2,0,4],
  [4,3,3,3,3,0,3,0,0,0,3,0,3,0,0,3,0,0,0,3,0,3,3,3,0,3,0,0,0,3,0,4],
  [4,0,0,0,2,0,2,2,2,0,2,0,2,2,0,2,2,2,0,2,0,0,0,2,0,2,2,2,0,2,0,4],
  [4,0,2,0,0,0,0,0,2,0,0,0,0,2,0,0,0,2,0,2,2,2,0,2,0,0,0,2,0,0,0,4],
  [4,0,2,2,2,2,2,0,2,2,2,2,0,2,2,2,0,2,0,0,0,2,0,2,2,2,0,2,2,2,0,4],
  [4,0,0,0,0,0,3,0,0,0,0,3,0,0,0,3,0,3,0,3,0,3,0,0,0,3,0,0,0,0,0,4],
  [4,2,2,2,2,0,2,2,2,2,0,2,2,2,0,2,0,2,0,2,0,2,2,2,0,2,2,2,2,2,0,4],
  [4,0,0,0,2,0,0,0,0,2,0,0,0,2,0,0,0,2,0,2,0,0,0,2,0,0,0,0,0,2,0,4],
  [4,0,2,0,2,2,2,0,0,2,2,2,0,2,2,2,2,2,0,2,2,2,0,2,2,2,2,0,0,2,0,4],
  [4,0,3,0,0,0,3,0,0,0,0,3,0,0,0,0,0,0,0,0,0,3,0,0,0,0,3,0,0,0,0,4],
  [4,0,2,2,2,0,2,2,2,2,0,2,2,2,2,2,2,2,2,2,0,2,2,2,2,0,2,2,2,2,0,4],
  [4,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,2,0,0,0,0,0,0,4],
  [4,2,2,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,2,2,2,0,0,2,2,2,2,2,2,0,4],
  [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,3,0,0,0,0,0,0,0,0,0,4],
  [4,0,2,2,2,2,2,2,2,2,2,2,2,0,2,2,0,2,2,2,0,2,2,2,2,2,2,2,2,2,0,4],
  [4,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,4],
  [4,2,2,2,2,2,2,0,2,2,0,2,2,2,0,2,2,2,0,2,2,2,2,2,0,2,2,2,2,2,0,4],
  [4,0,0,0,0,0,3,0,0,3,0,0,0,3,0,0,0,3,0,0,0,0,3,0,0,0,0,0,0,3,0,4],
  [4,0,2,2,2,0,2,0,0,2,2,2,0,2,2,2,0,2,2,2,2,0,2,2,2,2,2,2,0,2,0,4],
  [4,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
  [4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
];

function setupWebGL() {
  canvas = document.getElementById('webgl');
  gl = canvas.getContext('webgl', { preserveDrawingBuffer: true });
  if (!gl) { console.log('Failed to get WebGL context'); return; }
  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to initialize shaders.'); return;
  }
  a_Position       = gl.getAttribLocation(gl.program,  'a_Position');
  a_TexCoord       = gl.getAttribLocation(gl.program,  'a_TexCoord');
  u_FragColor      = gl.getUniformLocation(gl.program, 'u_FragColor');
  u_ModelMatrix    = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  u_ViewMatrix     = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  u_Sampler0       = gl.getUniformLocation(gl.program, 'u_Sampler0');
  u_Sampler1       = gl.getUniformLocation(gl.program, 'u_Sampler1');
  u_texColorWeight = gl.getUniformLocation(gl.program, 'u_texColorWeight');
  u_whichTexture   = gl.getUniformLocation(gl.program, 'u_whichTexture');
  gl.uniformMatrix4fv(u_ModelMatrix, false, new Matrix4().elements);
}

function initTextures() {
  var wallImg = new Image();
  wallImg.onload = function() {
    var tex = gl.createTexture();
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, wallImg);
    gl.uniform1i(u_Sampler0, 0);
    renderScene();
  };
  wallImg.src = 'wall.png';

  var cheeseImg = new Image();
  cheeseImg.onload = function() {
    var tex = gl.createTexture();
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cheeseImg);
    gl.uniform1i(u_Sampler1, 1);
  };
  cheeseImg.src = 'cheese.png';
}

function main() {
  setupWebGL();
  connectVariablesToGLSL();
  initTextures();

  canvas.onmousedown = function(ev) {
    g_mouseDown  = true;
    g_lastMouseX = ev.clientX;
    g_lastMouseY = ev.clientY;
  };
  canvas.onmouseup   = function() { g_mouseDown = false; };
  canvas.onmousemove = function(ev) {
    if (!g_mouseDown) return;
    var dx = ev.clientX - g_lastMouseX;
    g_lastMouseX = ev.clientX;
    g_lastMouseY = ev.clientY;
    camera.panLeft(dx * 0.3);
    renderScene();
  };

  gl.clearColor(0.1, 0.1, 0.1, 1.0);
  camera = new Camera();

  document.onkeydown = function(ev) {
    if      (ev.key === 'w' || ev.key === 'W') camera.moveForward();
    else if (ev.key === 's' || ev.key === 'S') camera.moveBackwards();
    else if (ev.key === 'a' || ev.key === 'A') camera.moveLeft();
    else if (ev.key === 'd' || ev.key === 'D') camera.moveRight();
    else if (ev.key === 'q' || ev.key === 'Q') camera.panLeft();
    else if (ev.key === 'e' || ev.key === 'E') camera.panRight();

    for (let i = 0; i < g_cheese.length; i++) {
      if (g_cheese[i].eaten) continue;
      let dx   = camera.eye.elements[0] - g_cheese[i].x;
      let dz   = camera.eye.elements[2] - g_cheese[i].z;
      if (Math.sqrt(dx*dx + dz*dz) < 1.0) {
        g_cheese[i].eaten = true;
        let eaten = g_cheese.filter(c => c.eaten).length;
        document.getElementById('fps').innerHTML = 'YOU WIN! cheese collected: ' + eaten;
      }
    }
    let rdx = camera.eye.elements[0] - 1.5;
    let rdz = camera.eye.elements[2] - 4;
    let bubble = document.getElementById('speechbubble');
    bubble.style.display = Math.sqrt(rdx*rdx + rdz*rdz) < 4.0 ? 'block' : 'none';
    renderScene();
  };

  renderScene();
}

function drawRat(ox, oy, oz) {
  // auto-animate using time
  var t = performance.now() / 1000.0 - g_startTime;
  var fLAngle = 30 + 25 * Math.sin(t * 5);
  var fRAngle = 30 + 25 * Math.sin(t * 5 + Math.PI);
  var bLAngle = 30 + 25 * Math.sin(t * 5 + Math.PI);
  var bRAngle = 30 + 25 * Math.sin(t * 5);
  var fPawLAng = 0.7 * (fLAngle - 30);
  var fPawRAng = 0.7 * (fRAngle - 30);
  var bPawLAng = 0.7 * (bLAngle - 30);
  var bPawRAng = 0.7 * (bRAngle - 30);
  var tailBase = 20 * Math.sin(t * 5);
  var tailMid  = 15 * Math.sin(t * 5 + 1);
  var tailTip  = 10 * Math.sin(t * 5 + 2);

  // helper: make a cube with offset baked in
  function rc(color, tx, ty, tz, sx, sy, sz, baseMatrix) {
    var c = new Cube();
    c.color = color;
    if (baseMatrix) {
      c.matrix = new Matrix4(baseMatrix);
    } else {
      c.matrix.translate(ox, oy, oz); // base world offset
    }
    c.matrix.translate(tx, ty, tz);
    c.matrix.scale(sx, sy, sz);
    c.render();
    return c;
  }

  var blue = [0.45, 0.55, 0.65, 1.0];
  var pink = [0.82, 0.63, 0.66, 1.0];

  rc(blue, -0.2, -0.1, -0.2,  0.4,  0.25, 0.45); // body
  rc(blue, -0.16,-0.08,-0.36, 0.32, 0.22, 0.16);  // body front taper
  rc(blue, -0.14,-0.08, 0.24, 0.28, 0.2,  0.14);  // body back taper
  rc(blue, -0.13,-0.02,-0.48, 0.26, 0.2,  0.12);  // neck
  rc(blue, -0.22, 0.05,-0.72, 0.44, 0.36, 0.28);  // head
  rc([0.82,0.65,0.67,1.0], -0.13,0.06,-0.82, 0.26,0.16,0.1); // snout base
  rc([0.85,0.68,0.70,1.0], -0.1, 0.08,-0.9,  0.2, 0.14,0.08); // snout tip
  rc([0.9, 0.52,0.55,1.0], -0.06,0.1, -0.94, 0.12,0.09,0.05); // nose

  // ears (cylinders need manual offset)
  var earLMat = new Matrix4().translate(ox,oy,oz).translate(-0.25,0.42,-0.65).rotate(90,0,0,1).scale(0.35,0.4,0.06);
  drawCylinder(earLMat, [0.75,0.58,0.6,1.0], 16);
  var earLIMat = new Matrix4().translate(ox,oy,oz).translate(-0.25,0.42,-0.652).rotate(90,0,0,1).scale(0.22,0.26,0.05);
  drawCylinder(earLIMat, [0.95,0.78,0.78,1.0], 16);
  var earRMat = new Matrix4().translate(ox,oy,oz).translate(0.25,0.42,-0.65).rotate(90,0,0,1).scale(0.35,0.4,0.06);
  drawCylinder(earRMat, [0.75,0.58,0.6,1.0], 16);
  var earRIMat = new Matrix4().translate(ox,oy,oz).translate(0.25,0.42,-0.652).rotate(90,0,0,1).scale(0.22,0.26,0.05);
  drawCylinder(earRIMat, [0.95,0.78,0.78,1.0], 16);

  // eyes
  rc([0.95,0.95,0.95,1.0], -0.16,0.21,-0.73, 0.11,0.11,0.04); // L white
  rc([0.35,0.2, 0.1, 1.0], -0.148,0.222,-0.74,0.075,0.075,0.03); // L iris
  rc([0.05,0.05,0.05,1.0], -0.138,0.232,-0.75,0.045,0.045,0.025); // L pupil
  rc([1.0, 1.0, 1.0, 1.0], -0.125,0.245,-0.76,0.02,0.02,0.02);   // L highlight
  rc([0.95,0.95,0.95,1.0],  0.05, 0.21,-0.73, 0.11,0.11,0.04);   // R white
  rc([0.35,0.2, 0.1, 1.0],  0.062,0.222,-0.74,0.075,0.075,0.03); // R iris
  rc([0.05,0.05,0.05,1.0],  0.072,0.232,-0.75,0.045,0.045,0.025);// R pupil
  rc([1.0, 1.0, 1.0, 1.0],  0.085,0.245,-0.76,0.02,0.02,0.02);   // R highlight

  // front left leg + paw
  var fLL = new Cube(); fLL.color = blue;
  fLL.matrix.translate(ox,oy,oz); fLL.matrix.translate(-0.28,-0.1,-0.35);
  fLL.matrix.rotate(fLAngle,1,0,0); fLL.matrix.scale(0.12,0.18,0.12); fLL.render();
  var fPL = new Cube(); fPL.color = pink;
  fPL.matrix = new Matrix4(fLL.matrix);
  fPL.matrix.scale(1/0.12,1/0.18,1/0.12);
  fPL.matrix.translate(-0.02,-0.05,-0.09); fPL.matrix.rotate(fPawLAng,1,0,0);
  fPL.matrix.scale(0.16,0.05,0.2); fPL.render();

  // front right leg + paw
  var fLR = new Cube(); fLR.color = blue;
  fLR.matrix.translate(ox,oy,oz); fLR.matrix.translate(0.16,-0.1,-0.35);
  fLR.matrix.rotate(fRAngle,1,0,0); fLR.matrix.scale(0.12,0.18,0.12); fLR.render();
  var fPR = new Cube(); fPR.color = pink;
  fPR.matrix = new Matrix4(fLR.matrix);
  fPR.matrix.scale(1/0.12,1/0.18,1/0.12);
  fPR.matrix.translate(-0.02,-0.05,-0.09); fPR.matrix.rotate(fPawRAng,1,0,0);
  fPR.matrix.scale(0.16,0.05,0.2); fPR.render();

  // back left leg + paw
  var bLL = new Cube(); bLL.color = blue;
  bLL.matrix.translate(ox,oy,oz); bLL.matrix.translate(-0.28,-0.1,0.1);
  bLL.matrix.rotate(bLAngle,1,0,0); bLL.matrix.scale(0.12,0.18,0.14); bLL.render();
  var bPL = new Cube(); bPL.color = pink;
  bPL.matrix = new Matrix4(bLL.matrix);
  bPL.matrix.scale(1/0.12,1/0.18,1/0.14);
  bPL.matrix.translate(-0.02,-0.05,-0.1); bPL.matrix.rotate(bPawLAng,1,0,0);
  bPL.matrix.scale(0.16,0.05,0.24); bPL.render();

  // back right leg + paw
  var bLR = new Cube(); bLR.color = blue;
  bLR.matrix.translate(ox,oy,oz); bLR.matrix.translate(0.16,-0.1,0.1);
  bLR.matrix.rotate(bRAngle,1,0,0); bLR.matrix.scale(0.12,0.18,0.14); bLR.render();
  var bPR = new Cube(); bPR.color = pink;
  bPR.matrix = new Matrix4(bLR.matrix);
  bPR.matrix.scale(1/0.12,1/0.18,1/0.14);
  bPR.matrix.translate(-0.02,-0.05,-0.1); bPR.matrix.rotate(bPawRAng,1,0,0);
  bPR.matrix.scale(0.16,0.05,0.24); bPR.render();

  // tail
  var t1 = new Cube(); t1.color = pink;
  t1.matrix.translate(ox,oy,oz); t1.matrix.translate(-0.02,-0.05,0.34);
  t1.matrix.rotate(tailBase,1,0,0); t1.matrix.scale(0.05,0.05,0.2); t1.render();

  var t2 = new Cube(); t2.color = [0.80,0.61,0.64,1.0];
  t2.matrix = new Matrix4(t1.matrix);
  t2.matrix.scale(1/0.05,1/0.05,1/0.2);
  t2.matrix.translate(0,0,0.2); t2.matrix.rotate(tailBase+tailMid,1,0,0);
  t2.matrix.scale(0.04,0.04,0.2); t2.render();

  var t3 = new Cube(); t3.color = [0.78,0.59,0.62,1.0];
  t3.matrix = new Matrix4(t2.matrix);
  t3.matrix.scale(1/0.04,1/0.04,1/0.2);
  t3.matrix.translate(0,0,0.2); t3.matrix.rotate(tailBase+tailMid+tailTip,1,0,0);
  t3.matrix.scale(0.03,0.03,0.2); t3.render();
}

function drawCylinder(matrix, color, sides) {
  sides = sides || 12;
  gl.uniform4f(u_FragColor, color[0], color[1], color[2], color[3]);
  gl.uniformMatrix4fv(u_ModelMatrix, false, matrix.elements);
  var angleStep = 360 / sides;
  for (var angle = 0; angle < 360; angle += angleStep) {
    var a1 = angle * Math.PI / 180;
    var a2 = (angle + angleStep) * Math.PI / 180;
    var x1 = Math.cos(a1)*0.5, y1 = Math.sin(a1)*0.5;
    var x2 = Math.cos(a2)*0.5, y2 = Math.sin(a2)*0.5;
    drawTriangle3DUV([x1,y1,0, x2,y2,0, x2,y2,1]);
    drawTriangle3DUV([x1,y1,0, x2,y2,1, x1,y1,1]);
    drawTriangle3DUV([0,0,1,   x1,y1,1, x2,y2,1]);
    drawTriangle3DUV([0,0,0,   x2,y2,0, x1,y1,0]);
  }
}

function renderScene() {
  gl.uniformMatrix4fv(u_ViewMatrix,       false, camera.viewMatrix.elements);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, camera.projectionMatrix.elements);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // SKY
  gl.uniform1i(u_whichTexture, 0);
  gl.uniform1f(u_texColorWeight, 0.0);
  var sky = new Cube();
  sky.color = [0.3, 0.5, 0.9, 1.0];
  sky.matrix.translate(-0.5,-0.5,-0.5);
  sky.matrix.scale(1000,1000,1000);
  sky.render();

  // GROUND
  gl.uniform1f(u_texColorWeight, 0.0);
  var ground = new Cube();
  ground.color = [0.3, 0.6, 0.2, 1.0];
  ground.matrix.translate(0,-0.11,0);
  ground.matrix.scale(64, 0.1, 64);
  ground.renderfast();

  // WALLS
  gl.uniform1i(u_whichTexture, 0);
  gl.uniform1f(u_texColorWeight, 1.0);
  for (let x = 0; x < g_map.length; x++) {
    for (let z = 0; z < g_map[x].length; z++) {
      let h = g_map[x][z];
      for (let y = 0; y < h; y++) {
        let wall = new Cube();
        wall.color = [1,1,1,1];
        wall.matrix.translate(x, y, z);
        wall.renderfast();
      }
    }
  }

  // RAT (near start, auto-animated)
  gl.uniform1f(u_texColorWeight, 0.0);
  drawRat(1.5, 0.2, 3);

  // CHEESE
  gl.uniform1i(u_whichTexture, 1);
  gl.uniform1f(u_texColorWeight, 1.0);
  for (let i = 0; i < g_cheese.length; i++) {
    if (g_cheese[i].eaten) continue;
    let c = new Cube();
    c.color = [1.0, 0.85, 0.0, 1.0];
    c.matrix.translate(g_cheese[i].x + 0.35, 0.0, g_cheese[i].z + 0.35);
    c.matrix.scale(0.15, 0.15, 0.15);
    c.renderfast();
  }

  // FPS
  var now = performance.now();
  var elapsed = now - g_lastFrameTime;
  g_lastFrameTime = now;
  document.getElementById('fps').innerHTML = 'FPS: ' + Math.floor(1000/elapsed);
}