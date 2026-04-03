function main() {  
  // Retrieve <canvas> element
  var canvas = document.getElementById('example');  
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  } 

  // Get the rendering context for 2DCG
  var ctx = canvas.getContext('2d');

  // Draw a blue rectangle
//   ctx.fillStyle = 'rgba(0, 0, 255, 1.0)'; // Set color to blue
//   ctx.fillRect(120, 10, 150, 150);        // Fill a rectangle with the color
  // Draw black background
    ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set color to black
    ctx.fillRect(0, 0, 400, 400);

    // instantaite vector
    var v1 = new Vector3([2.25,2.25,0]);
    drawVector(v1, 'red');
}

function drawVector(v, color) {
    var canvas = document.getElementById('example');
    var ctx = canvas.getContext('2d');
    var centx = 200;
    var centy = 200;
    var scale = 20;

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.moveTo(centx, centy);

    ctx.lineTo(centx + v.elements[0] * scale, centy - v.elements[1] * scale);
    ctx.stroke();
}

function handleDrawEvent(){
    var canvas = document.getElementById('example');
    var ctx = canvas.getContext('2d');

    // clear canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // color = black
    ctx.fillRect(0, 0, 400, 400); // fill the canvas with black

    // read values of text boxes to create v1
    var v1 = new Vector3([
        parseFloat(document.getElementById('v1x').value),
        parseFloat(document.getElementById('v1y').value),
        0
    ]);

    var v2 = new Vector3([
        parseFloat(document.getElementById('v2x').value),
        parseFloat(document.getElementById('v2y').value),
        0
    ]);

    drawVector(v1, 'red');
    drawVector(v2, 'blue');
}
function handleDrawOperationEvent(){
    var canvas = document.getElementById('example');
    var ctx = canvas.getContext('2d');

    // clear canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // color = black
    ctx.fillRect(0, 0, 400, 400); // fill the canvas with black

    // read values of text boxes to create v1
    var v1 = new Vector3([
        parseFloat(document.getElementById('v1x').value),
        parseFloat(document.getElementById('v1y').value),
        0
    ]);

    var v2 = new Vector3([
        parseFloat(document.getElementById('v2x').value),
        parseFloat(document.getElementById('v2y').value),
        0
    ]);

    var op = document.getElementById('operation').value;
    var scalar = parseFloat(document.getElementById('scalar').value);
    drawVector(v1, 'red');
    drawVector(v2, 'blue');

    if (op == 'add'){
        var v3 = new Vector3(v1.elements);
        v3.add(v2);
        drawVector(v3, 'green');
    }
    else if (op == 'sub'){
        var v3 = new Vector3(v1.elements);
        v3.sub(v2);
        drawVector(v3, 'green');
    }
    else if (op === 'mul') {
        var v3 = new Vector3(v1.elements); v3.mul(scalar);
        var v4 = new Vector3(v2.elements); v4.mul(scalar);
        drawVector(v3, 'green');
        drawVector(v4, 'green');
    } 
    else if (op === 'div') {
        var v3 = new Vector3(v1.elements); v3.div(scalar);
        var v4 = new Vector3(v2.elements); v4.div(scalar);
        drawVector(v3, 'green');
        drawVector(v4, 'green');
    }
    else if (op == 'magnitude') {
        console.log('Magnitude v1:', v1.magnitude());
        console.log('Magnitude v2:', v2.magnitude());
    }
    else if (op == 'normalize') {
        var v3 = new Vector3(v1.elements); v3.normalize();
        var v4 = new Vector3(v2.elements); v4.normalize();
        drawVector(v3, 'green');
        drawVector(v4, 'green');
    }
    else if (op == 'angle'){
        console.log('Angle: ', angleBetween(v1, v2));
    }
    else if (op == 'area'){
        console.log('Area of triangle: ', areaTriangle(v1, v2));
    }
}
function angleBetween(v1, v2){
    var dot = Vector3.dot(v1, v2);
    var mag1 = v1.magnitude();
    var mag2 = v2.magnitude();
    var cosAngle = dot / (mag1 * mag2);
    cosAngle = Math.max(-1, Math.min(1, cosAngle));
    return Math.acos(cosAngle) * (180 / Math.PI);
}
function areaTriangle(v1, v2){
    var cross = Vector3.cross(v1, v2);
    return cross.magnitude() / 2;
}