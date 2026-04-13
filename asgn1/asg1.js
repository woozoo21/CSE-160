// Global variables
var gl;
var canvas;
var a_Position;
var u_FragColor;

// var g_points = [];
// var g_colors = [];

// var u_PointSize;
// var g_sizes = [];
var g_shapesList = [];
// var g_selectedShape = 'point';
var g_selectedShape = 'square';

var g_rainbowMode = false;
var g_hue = 0;

var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  // 'uniform float u_PointSize;\n' +
  'void main() {\n' +
  '  gl_Position = a_Position;\n' +
  // '  gl_PointSize = u_PointSize;\n' +
  '}\n';

var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform vec4 u_FragColor;\n' +
  'void main() {\n' +
  '  gl_FragColor = u_FragColor;\n' +
  '}\n';

function main() {
  setupWebGL();
  connectVariablesToGLSL();

  canvas.onmousedown = function(ev) { 
    click(ev); 
  };
  canvas.onmousemove = function(ev) { 
    if (ev.buttons == 1) {
        click(ev); 
    }
  };  

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  updateColor();
}

function setupWebGL() {
  canvas = document.getElementById('webgl');
  gl = getWebGLContext(canvas, { preserveDrawingBuffer: true });
  if (!gl) {
    console.log('Failed to get WebGL context');
    return;
  }
}

function connectVariablesToGLSL() {
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to initialize shaders');
    return;
  }
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  // u_PointSize = gl.getUniformLocation(gl.program, 'u_PointSize');

}
function click(ev) {
  var rect = canvas.getBoundingClientRect();
  var x = ((ev.clientX - rect.left) - canvas.width/2) / (canvas.width/2);
  var y = (canvas.height/2 - (ev.clientY - rect.top)) / (canvas.height/2);

  var size = parseFloat(document.getElementById('size').value);
  var segments = parseInt(document.getElementById('segments').value);

  var r,g,b;
  var shape;
  if (g_rainbowMode) {
    g_hue += 5;
    var rgb = hueToRGB(g_hue);
    var r = rgb[0], g = rgb[1], b = rgb[2];
  } else {
    var r = document.getElementById('red').value / 100;
    var g = document.getElementById('green').value / 100;
    var b = document.getElementById('blue').value / 100;
  }
  // if (g_selectedShape == 'point') {
  //   shape = new Point();
  if (g_selectedShape == 'square') {
    shape = new Square();
  } else if (g_selectedShape == 'triangle') {
    shape = new Triangle();
  } else if (g_selectedShape == 'circle') {
    shape = new Circle();
    shape.segments = segments;
  }

  console.log('selected shape:', g_selectedShape);
  shape.position = [x, y];
  shape.color = [r, g, b, 1.0];
  shape.size = size;

  g_shapesList.push(shape);
  renderAllShapes();
}

function renderAllShapes() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  for (var i = 0; i < g_shapesList.length; i++) {
    g_shapesList[i].render();
  }
}

function clearCanvas() {
  g_shapesList = [];
  renderAllShapes();
}

function drawTriangle(verts, color) {
  var shape = new Triangle();
  shape.color = color;
  shape.size = 1;
  shape.vertices = verts;
  g_shapesList.push(shape);
}

function drawCircleSolid(cx, cy, r, segs, color) {
  var c = new Circle();
  c.position = [cx, cy];
  c.color = color;
  c.size = r * 200;
  c.segments = segs;
  g_shapesList.push(c);
}

function drawRect(x1, y1, x2, y2, color) {
  drawTriangle([x1, y1, x2, y1, x2, y2], color);
  drawTriangle([x1, y1, x1, y2, x2, y2], color);
}

function drawPicture() {
  g_shapesList = [];

  function addTri(x1,y1, x2,y2, x3,y3, r,g,b) {
    var t = new Triangle();
    t.color = [r, g, b, 1.0];
    t.size = 1;
    t.position = [0, 0];
    t.vertices = [x1,y1, x2,y2, x3,y3];
    g_shapesList.push(t);
  }

  // bckgrd sunset yellow
  addTri(-1.0,-1.0,  1.0,-1.0,  1.0, 1.0,   1.0, 0.85, 0.4);
  addTri(-1.0,-1.0,  1.0, 1.0, -1.0, 1.0,   1.0, 0.85, 0.4);
  // water blue
  addTri(-1.0,-1.0,  1.0,-1.0,  1.0,-0.6,   0.3,0.7,1.0);
  addTri(-1.0,-1.0,  1.0,-0.6, -1.0,-0.6,   0.3,0.7,1.0);
  addTri(-1.0,-0.6, -0.5,-0.7,  0.0,-0.6,   0.2,0.6,0.9);
  addTri( 0.0,-0.6,  0.5,-0.65, 1.0,-0.6,   0.2,0.6,0.9);

  // // --- BODY (gray) ---
  // addTri(-0.875,0.0,  -0.75,0.125,  -0.625,0.0,    0.9,0.9,0.9);
  // addTri(-0.875,0.0,  -0.625,0.0,   -0.5,0.0,      0.9,0.9,0.9);
  // addTri(-0.875,0.0,  -0.5,0.0,      0.25,-0.75,   0.9,0.9,0.9);
  // addTri(-0.875,0.0,   0.25,-0.75,  -0.75,-0.75,   0.9,0.9,0.9);
  // addTri(-0.875,0.0,  -0.75,-0.75,  -0.625,-0.625, 0.9,0.9,0.9);
  // addTri(-0.875,0.0,  -0.625,-0.625,-0.75,-0.5,    0.9,0.9,0.9);
  // addTri(-0.875,0.0,  -0.75,-0.5,   -0.75,-0.125,  0.9,0.9,0.9);
  
  // body white
  addTri(-0.875,0.0,  -0.75,0.125,  -0.625,0.0,    1.0,1.0,1.0);
  addTri(-0.875,0.0,  -0.625,0.0,   -0.5,0.0,      1.0,1.0,1.0);

  // bottom left corner shape
  addTri(-0.75,-0.125,  -0.75,-0.5,   -0.5,-0.75,  1.0,1.0,1.0);
  addTri(-0.75,-0.125,  -0.5,-0.75,    0.25,-0.75,  1.0,1.0,1.0);
  addTri(-0.75,-0.125,   0.25,-0.75,  -0.5,  0.0,   1.0,1.0,1.0);
  addTri(-0.875,0.0,    -0.75,-0.125, -0.5,  0.0,   1.0,1.0,1.0);

  // lower s curve
  addTri(-0.5,0.25,  -0.375,0.25,  0.125,-0.25,   0.8,0.8,0.8);
  addTri(-0.5,0.25,   0.125,-0.25,  0.25,-0.25,   0.8,0.8,0.8);
  addTri(-0.5,0.25,   0.25,-0.25,   0.25,-0.75,   0.8,0.8,0.8);
  addTri(-0.5,0.25,   0.25,-0.75,  -0.5,  0.0,    0.8,0.8,0.8);
  
  addTri(0.5,-0.375,  0.25,-0.25,   0.375,-0.125,  0.8,0.8,0.8);
  addTri(0.5,-0.375,  0.375,-0.125, 0.375, 0.0,    0.8,0.8,0.8);
  addTri(0.5,-0.375,  0.375, 0.0,   0.625, 0.0,    0.8,0.8,0.8);
  addTri(0.5,-0.375,  0.625, 0.0,   0.75,-0.125,   0.8,0.8,0.8);
  addTri(0.5,-0.375,  0.75,-0.125,  0.75,-0.5,     0.8,0.8,0.8);
  addTri(0.5,-0.375,  0.75,-0.5,    0.5,-0.75,     0.8,0.8,0.8);
  addTri(0.5,-0.375,  0.5,-0.75,    0.25,-0.75,    0.8,0.8,0.8);
  addTri(0.5,-0.375,  0.25,-0.75,   0.25,-0.25,    0.8,0.8,0.8);
  
  // mid s curve
  addTri(0.375,0.2,  0.375,0.0,   0.0,0.375,    0.8,0.8,0.8);
  addTri(0.375,0.2,  0.0,0.375,   0.125,0.375,  0.8,0.8,0.8);
  addTri(0.375,0.2,  0.125,0.375, 0.375,0.125,  0.8,0.8,0.8);
  addTri(0.375,0.2,  0.375,0.125, 0.5,0.125,    0.8,0.8,0.8);
  addTri(0.375,0.2,  0.5,0.125,   0.625,0.0,    0.8,0.8,0.8);
  addTri(0.375,0.2,  0.625,0.0,   0.375,0.0,    0.8,0.8,0.8);
  
  addTri(0.375,0.0,   0.0,0.375,  0.0,0.5,     0.8,0.8,0.8);
  addTri(0.375,0.0,   0.0,0.5,    0.375,0.125,  0.8,0.8,0.8);
  addTri(0.375,0.125, 0.0,0.5,    0.5,0.125,    0.8,0.8,0.8);

  // upper s curve
  addTri(0.3,0.625,  0.0,0.375,    0.0,0.625,    0.8,0.8,0.8);
  addTri(0.3,0.625,  0.0,0.625,    0.25,0.875,   0.8,0.8,0.8);
  addTri(0.3,0.625,  0.25,0.875,   0.5,0.875,    0.8,0.8,0.8);
  addTri(0.3,0.625,  0.5,0.875,    0.625,0.75,   0.8,0.8,0.8);
  addTri(0.3,0.625,  0.625,0.75,   0.625,0.625,  0.8,0.8,0.8);
  addTri(0.3,0.625,  0.625,0.625,  0.25,0.625,   0.8,0.8,0.8);
  addTri(0.3,0.625,  0.25,0.625,   0.125,0.5,    0.8,0.8,0.8);
  addTri(0.3,0.625,  0.125,0.5,    0.125,0.375,  0.8,0.8,0.8);
  addTri(0.3,0.625,  0.125,0.375,  0.0,0.375,    0.8,0.8,0.8);
  
  // black part
  addTri(0.375,0.625,  0.625,0.625,  0.625,0.375,  0.1,0.1,0.1);
  addTri(0.375,0.625,  0.625,0.375,  0.5,0.375,    0.1,0.1,0.1);
  addTri(0.375,0.625,  0.5,0.375,    0.375,0.5,    0.1,0.1,0.1);

  // eyes? white part
  addTri(0.5,0.625,  0.625,0.625,  0.625,0.5,    1.0,1.0,1.0);
  addTri(0.5,0.625,  0.625,0.5,    0.5,0.5,      1.0,1.0,1.0);
  
  // orange beak R
  addTri(0.375,0.5,  0.5,0.375,   0.625,0.375,  1.0,0.5,0.0);
  addTri(0.375,0.5,  0.625,0.375, 0.625,0.25,   1.0,0.5,0.0);
  addTri(0.375,0.5,  0.625,0.25,  0.5,0.25,     1.0,0.5,0.0);
  addTri(0.375,0.5,  0.5,0.25,    0.375,0.25,   1.0,0.5,0.0);
  
  // beak triangle between
  addTri(0.5,0.25,  0.5,0.375,  0.625,0.25,  1.0, 0.85, 0.4);
  renderAllShapes();
}

// for rainbow mode
function hueToRGB(h) {
  h = h % 360;
  var s = 1, l = 0.5;
  var c = 1 - Math.abs(2*l - 1);
  var x = c * (1 - Math.abs((h/60) % 2 - 1));
  var m = l - c/2;
  var r,g,b;
  if(h < 60)      { r=c; g=x; b=0; }
  else if(h < 120){ r=x; g=c; b=0; }
  else if(h < 180){ r=0; g=c; b=x; }
  else if(h < 240){ r=0; g=x; b=c; }
  else if(h < 300){ r=x; g=0; b=c; }
  else            { r=c; g=0; b=x; }
  return [r+m, g+m, b+m];
}

// for toggling rainbow mode
function toggleRainbow() {
  g_rainbowMode = !g_rainbowMode;
  var btn = document.getElementById('rainbowBtn');
  if (g_rainbowMode) {
    btn.textContent = 'Rainbow Mode: ON';
  } else {
    btn.textContent = 'Rainbow Mode: OFF';
  }
}

// for hexslider
function updateColor() {
  if (g_rainbowMode) return; // don't update when rainbow is on
  
  var r = Math.round(document.getElementById('red').value * 2.55);
  var g = Math.round(document.getElementById('green').value * 2.55);
  var b = Math.round(document.getElementById('blue').value * 2.55);

  // update hex display
  var hex = r.toString(16).padStart(2,'0') + 
            g.toString(16).padStart(2,'0') + 
            b.toString(16).padStart(2,'0');
  document.getElementById('hexDisplay').value = hex.toUpperCase();

  // update color preview box
  document.getElementById('colorPreview').style.background = '#' + hex;
}

function applyHex() {
  var hex = document.getElementById('hexDisplay').value.replace('#','');
  if (hex.length != 6) { alert('Enter a valid 6 digit hex code!'); return; }

  var r = parseInt(hex.substring(0,2), 16);
  var g = parseInt(hex.substring(2,4), 16);
  var b = parseInt(hex.substring(4,6), 16);

  // update sliders
  document.getElementById('red').value   = Math.round(r / 2.55);
  document.getElementById('green').value = Math.round(g / 2.55);
  document.getElementById('blue').value  = Math.round(b / 2.55);

  // update preview
  document.getElementById('colorPreview').style.background = '#' + hex;
  document.getElementById('hexDisplay').value = hex.toUpperCase();
}

