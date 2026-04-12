// Global variables
var gl;
var canvas;
var a_Position;
var u_FragColor;

// var g_points = [];
// var g_colors = [];

var u_PointSize;
// var g_sizes = [];
var g_shapesList = [];
var g_selectedShape = 'point';

var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'uniform float u_PointSize;\n' +
  'void main() {\n' +
  '  gl_Position = a_Position;\n' +
  '  gl_PointSize = u_PointSize;\n' +
  '}\n';

var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform vec4 u_FragColor;\n' +
  'void main() {\n' +
  '  gl_FragColor = u_FragColor;\n' +
  '}\n';

// ---- MAIN ----
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
}

// ---- 1. Setup WebGL ----
function setupWebGL() {
  canvas = document.getElementById('webgl');
  gl = getWebGLContext(canvas, { preserveDrawingBuffer: true });
  if (!gl) {
    console.log('Failed to get WebGL context');
    return;
  }
}

// ---- 2. Connect JS variables to GLSL ----
function connectVariablesToGLSL() {
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to initialize shaders');
    return;
  }
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  u_PointSize = gl.getUniformLocation(gl.program, 'u_PointSize');

}

// ---- 3. Handle click ----
function click(ev) {
  var rect = canvas.getBoundingClientRect();
  var x = ((ev.clientX - rect.left) - canvas.width/2) / (canvas.width/2);
  var y = (canvas.height/2 - (ev.clientY - rect.top)) / (canvas.height/2);

  var r = document.getElementById('red').value / 100;
  var g = document.getElementById('green').value / 100;
  var b = document.getElementById('blue').value / 100;
  var size = parseFloat(document.getElementById('size').value);
  var segments = parseInt(document.getElementById('segments').value);

  var shape;
  if (g_selectedShape == 'point') {
    shape = new Point();
  } else if (g_selectedShape == 'triangle') {
    shape = new Triangle();
  } else if (g_selectedShape == 'circle') {
    shape = new Circle();
    shape.segments = segments;
  }

  shape.position = [x, y];
  shape.color = [r, g, b, 1.0];
  shape.size = size;

  g_shapesList.push(shape);
  renderAllShapes();
}

// ---- 4. Render all shapes ----
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

  // BACKGROUND - warm sunset yellow
  addTri(-1.0,-1.0,  1.0,-1.0,  1.0, 1.0,   1.0, 0.85, 0.4);
  addTri(-1.0,-1.0,  1.0, 1.0, -1.0, 1.0,   1.0, 0.85, 0.4);
  // --- WATER (blue) ---
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
  
  // --- BODY (white) ---
  addTri(-0.875,0.0,  -0.75,0.125,  -0.625,0.0,    1.0,1.0,1.0);
  addTri(-0.875,0.0,  -0.625,0.0,   -0.5,0.0,      1.0,1.0,1.0);
  addTri(-0.875,0.0,  -0.5,0.0,      0.25,-0.75,   1.0,1.0,1.0);
  addTri(-0.875,0.0,   0.25,-0.75,  -0.75,-0.75,   1.0,1.0,1.0);
  addTri(-0.875,0.0,  -0.75,-0.75,  -0.625,-0.625, 1.0,1.0,1.0);
  addTri(-0.875,0.0,  -0.625,-0.625,-0.75,-0.5,    1.0,1.0,1.0);
  addTri(-0.875,0.0,  -0.75,-0.5,   -0.75,-0.125,  1.0,1.0,1.0);
  
  // LOWER S BODY
  addTri(-0.5,0.25,  -0.375,0.25,  0.125,-0.25,   0.8,0.8,0.8);
  addTri(-0.5,0.25,   0.125,-0.25,  0.25,-0.25,   0.8,0.8,0.8);
  addTri(-0.5,0.25,   0.25,-0.25,   0.25,-0.75,   0.8,0.8,0.8);
  addTri(-0.5,0.25,   0.25,-0.75,  -0.5,  0.0,    0.8,0.8,0.8);
  
  // LOWER S CURVE
  addTri(0.5,-0.375,  0.25,-0.25,   0.375,-0.125,  0.8,0.8,0.8);
  addTri(0.5,-0.375,  0.375,-0.125, 0.375, 0.0,    0.8,0.8,0.8);
  addTri(0.5,-0.375,  0.375, 0.0,   0.625, 0.0,    0.8,0.8,0.8);
  addTri(0.5,-0.375,  0.625, 0.0,   0.75,-0.125,   0.8,0.8,0.8);
  addTri(0.5,-0.375,  0.75,-0.125,  0.75,-0.5,     0.8,0.8,0.8);
  addTri(0.5,-0.375,  0.75,-0.5,    0.5,-0.75,     0.8,0.8,0.8);
  addTri(0.5,-0.375,  0.5,-0.75,    0.25,-0.75,    0.8,0.8,0.8);
  addTri(0.5,-0.375,  0.25,-0.75,   0.25,-0.25,    0.8,0.8,0.8);
  
  // MIDDLE S CONNECTOR
  addTri(0.375,0.2,  0.375,0.0,   0.0,0.375,    0.8,0.8,0.8);
  addTri(0.375,0.2,  0.0,0.375,   0.125,0.375,  0.8,0.8,0.8);
  addTri(0.375,0.2,  0.125,0.375, 0.375,0.125,  0.8,0.8,0.8);
  addTri(0.375,0.2,  0.375,0.125, 0.5,0.125,    0.8,0.8,0.8);
  addTri(0.375,0.2,  0.5,0.125,   0.625,0.0,    0.8,0.8,0.8);
  addTri(0.375,0.2,  0.625,0.0,   0.375,0.0,    0.8,0.8,0.8);

  // UPPER S CURVE
  addTri(0.3,0.625,  0.0,0.375,    0.0,0.625,    0.8,0.8,0.8);
  addTri(0.3,0.625,  0.0,0.625,    0.25,0.875,   0.8,0.8,0.8);
  addTri(0.3,0.625,  0.25,0.875,   0.5,0.875,    0.8,0.8,0.8);
  addTri(0.3,0.625,  0.5,0.875,    0.625,0.75,   0.8,0.8,0.8);
  addTri(0.3,0.625,  0.625,0.75,   0.625,0.625,  0.8,0.8,0.8);
  addTri(0.3,0.625,  0.625,0.625,  0.25,0.625,   0.8,0.8,0.8);
  addTri(0.3,0.625,  0.25,0.625,   0.125,0.5,    0.8,0.8,0.8);
  addTri(0.3,0.625,  0.125,0.5,    0.125,0.375,  0.8,0.8,0.8);
  addTri(0.3,0.625,  0.125,0.375,  0.0,0.375,    0.8,0.8,0.8);
  
  // BLACK MOUTH
  addTri(0.375,0.625,  0.625,0.625,  0.625,0.375,  0.1,0.1,0.1);
  addTri(0.375,0.625,  0.625,0.375,  0.5,0.375,    0.1,0.1,0.1);
  addTri(0.375,0.625,  0.5,0.375,    0.375,0.5,    0.1,0.1,0.1);

  // WHITE SQUARE inside mouth
  addTri(0.5,0.625,  0.625,0.625,  0.625,0.5,    1.0,1.0,1.0);
  addTri(0.5,0.625,  0.625,0.5,    0.5,0.5,      1.0,1.0,1.0);
  // ORANGE BEAK
  addTri(0.375,0.5,  0.5,0.375,   0.625,0.375,  1.0,0.5,0.0);
  addTri(0.375,0.5,  0.625,0.375, 0.625,0.25,   1.0,0.5,0.0);
  addTri(0.375,0.5,  0.625,0.25,  0.5,0.25,     1.0,0.5,0.0);
  addTri(0.375,0.5,  0.5,0.25,    0.375,0.25,   1.0,0.5,0.0);
  // BEAK BACKGROUND - match sunset
  addTri(0.5,0.25,  0.5,0.375,  0.625,0.25,  1.0, 0.85, 0.4);
  renderAllShapes();
}