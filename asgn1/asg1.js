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

  function addTri(a, b, c, color) {
    var t = new Triangle();
    t.color = color;
    t.size = 1;
    t.position = [0, 0];
    t.vertices = [
      a[0], a[1],
      b[0], b[1],
      c[0], c[1]
    ];
    g_shapesList.push(t);
  }

  function addQuad(a, b, c, d, color) {
    addTri(a, b, c, color);
    addTri(a, c, d, color);
  }

  var WHITE = [1.0, 1.0, 1.0, 1.0];
  var WATER = [0.30, 0.72, 0.95, 1.0];
  var SWAN = [0.84, 0.84, 0.86, 1.0];
  var SWAN_DARK = [0.73, 0.73, 0.78, 1.0];
  var BEAK_DARK = [0.12, 0.12, 0.12, 1.0];
  var BEAK_ORANGE = [1.00, 0.48, 0.12, 1.0];

  // Background
  addQuad([-1.0, -1.0], [-1.0, 1.0], [1.0, 1.0], [1.0, -1.0], WHITE);

  // Water band: flatter center, raised edges like the sketch.
  addTri([-1.0, -1.0], [-1.0, -0.53], [-0.62, -0.56], WATER);
  addTri([-1.0, -1.0], [-0.62, -0.56], [-0.40, -0.72], WATER);
  addTri([-1.0, -1.0], [-0.40, -0.72], [0.38, -0.68], WATER);
  addTri([-1.0, -1.0], [0.38, -0.68], [0.62, -0.74], WATER);
  addTri([-1.0, -1.0], [0.62, -0.74], [1.0, -0.54], WATER);
  addTri([-1.0, -1.0], [1.0, -0.54], [1.0, -1.0], WATER);

  // Tail flap on the left.
  var tailTip = [-0.82, 0.03];
  var tailTop = [-0.70, 0.16];
  var tailBase = [-0.58, 0.02];
  var tailBottom = [-0.67, -0.11];
  addTri(tailTip, tailTop, tailBase, SWAN);
  addTri(tailTip, tailBase, tailBottom, SWAN);

  // Small connector from tail to body shoulder.
  addQuad([-0.58, 0.02], [-0.48, 0.02], [-0.48, -0.02], [-0.58, -0.02], SWAN);

  // Main body silhouette: intentionally large and right-heavy.
  var bodyCenter = [0.08, -0.28];
  var shoulderTop = [-0.48, 0.28];
  var leftMid = [-0.48, 0.02];
  var leftLower = [-0.32, -0.30];
  var chestLow = [-0.06, -0.62];
  var bellyLow = [0.22, -0.92];
  var rearFoot = [0.56, -0.86];
  var rearLow = [0.72, -0.60];
  var rearMid = [0.72, -0.28];
  var rearUpper = [0.58, -0.08];
  var rearTop = [0.42, 0.02];
  var bodyTop = [-0.06, 0.04];
  addTri(bodyCenter, shoulderTop, leftMid, SWAN);
  addTri(bodyCenter, leftMid, leftLower, SWAN);
  addTri(bodyCenter, leftLower, chestLow, SWAN);
  addTri(bodyCenter, chestLow, bellyLow, SWAN);
  addTri(bodyCenter, bellyLow, rearFoot, SWAN);
  addTri(bodyCenter, rearFoot, rearLow, SWAN);
  addTri(bodyCenter, rearLow, rearMid, SWAN);
  addTri(bodyCenter, rearMid, rearUpper, SWAN_DARK);
  addTri(bodyCenter, rearUpper, rearTop, SWAN_DARK);
  addTri(bodyCenter, rearTop, bodyTop, SWAN);
  addTri(bodyCenter, bodyTop, shoulderTop, SWAN);

  // Neck ribbon: thicker at the base and bending up into the head.
  var neckBaseOuter = [0.03, 0.05];
  var neckMidOuter = [0.11, 0.30];
  var neckUpperOuter = [0.18, 0.56];
  var neckHeadOuter = [0.28, 0.70];
  var neckBaseInner = [0.14, -0.01];
  var neckMidInner = [0.24, 0.18];
  var neckUpperInner = [0.34, 0.40];
  var neckHeadInner = [0.40, 0.38];
  addQuad(neckBaseOuter, neckMidOuter, neckMidInner, neckBaseInner, SWAN_DARK);
  addQuad(neckMidOuter, neckUpperOuter, neckUpperInner, neckMidInner, SWAN_DARK);
  addQuad(neckUpperOuter, neckHeadOuter, neckHeadInner, neckUpperInner, SWAN_DARK);

  // Head: larger, blockier, and closer to the sketch proportions.
  var headBaseLeft = [0.30, 0.34];
  var headTopLeft = [0.36, 0.82];
  var headTopMid = [0.62, 0.82];
  var headTopRight = [0.78, 0.68];
  var headRight = [0.80, 0.32];
  var headBottom = [0.54, 0.32];
  var headLowerLeft = [0.36, 0.32];
  addTri(headBaseLeft, headTopLeft, headTopMid, SWAN);
  addTri(headBaseLeft, headTopMid, headTopRight, SWAN);
  addTri(headBaseLeft, headTopRight, headRight, SWAN);
  addTri(headBaseLeft, headRight, headBottom, SWAN_DARK);
  addTri(headBaseLeft, headBottom, headLowerLeft, SWAN);

  // Large inner white cutout under the neck and inside the body.
  var cutBase = [0.10, 0.02];
  var cutNeck = [0.22, 0.24];
  var cutTop = [0.40, 0.36];
  var cutFar = [0.58, 0.32];
  var cutMid = [0.48, 0.10];
  var cutLow = [0.26, -0.08];
  addTri(cutBase, cutNeck, cutTop, WHITE);
  addTri(cutBase, cutTop, cutFar, WHITE);
  addTri(cutBase, cutFar, cutMid, WHITE);
  addTri(cutBase, cutMid, cutLow, WHITE);

  // Beak: dark upper beak and orange lower beak.
  var beakUpperLeft = [0.52, 0.32];
  var beakUpperRight = [0.66, 0.32];
  var beakUpperTip = [0.74, 0.22];
  var beakUpperLow = [0.60, 0.14];
  var beakLowerLeft = [0.50, 0.14];
  var beakLowerRight = [0.66, 0.14];
  var beakLowerTip = [0.82, -0.02];
  var beakLowerLow = [0.60, -0.05];
  addTri(beakUpperLeft, beakUpperRight, beakUpperTip, BEAK_DARK);
  addTri(beakUpperLeft, beakUpperTip, beakUpperLow, BEAK_DARK);
  addTri(beakLowerLeft, beakLowerRight, beakLowerTip, BEAK_ORANGE);
  addTri(beakLowerLeft, beakLowerTip, beakLowerLow, BEAK_ORANGE);

  renderAllShapes();
}


