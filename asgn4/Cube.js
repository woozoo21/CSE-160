class Cube {
  constructor() {
    this.type = 'cube';
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
    this.normalMatrix = new Matrix4();
    this.textureNum = -2; // default: solid color
  }

  render() {
    var rgba = this.color;
    gl.uniform1i(u_whichTexture, this.textureNum);
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.uniformMatrix4fv(u_ModelMatrix,   false, this.matrix.elements);
    gl.uniformMatrix4fv(u_NormalMatrix,  false, this.normalMatrix.elements);

    // Front  (+Z)  normal = (0, 0, 1)
    drawTriangle3DUVNormal(
      [0,0,1, 1,1,1, 1,0,1], [0,0, 1,1, 1,0], [0,0,1, 0,0,1, 0,0,1]);
    drawTriangle3DUVNormal(
      [0,0,1, 0,1,1, 1,1,1], [0,0, 0,1, 1,1], [0,0,1, 0,0,1, 0,0,1]);

    // Back   (-Z)  normal = (0, 0,-1)
    drawTriangle3DUVNormal(
      [0,0,0, 1,0,0, 1,1,0], [1,0, 0,0, 0,1], [0,0,-1, 0,0,-1, 0,0,-1]);
    drawTriangle3DUVNormal(
      [0,0,0, 1,1,0, 0,1,0], [1,0, 0,1, 1,1], [0,0,-1, 0,0,-1, 0,0,-1]);

    // Top    (+Y)  normal = (0, 1, 0)
    drawTriangle3DUVNormal(
      [0,1,0, 1,1,1, 0,1,1], [0,0, 1,1, 0,1], [0,1,0, 0,1,0, 0,1,0]);
    drawTriangle3DUVNormal(
      [0,1,0, 1,1,0, 1,1,1], [0,0, 1,0, 1,1], [0,1,0, 0,1,0, 0,1,0]);

    // Bottom (-Y)  normal = (0,-1, 0)
    drawTriangle3DUVNormal(
      [0,0,0, 0,0,1, 1,0,1], [0,0, 0,1, 1,1], [0,-1,0, 0,-1,0, 0,-1,0]);
    drawTriangle3DUVNormal(
      [0,0,0, 1,0,1, 1,0,0], [0,0, 1,1, 1,0], [0,-1,0, 0,-1,0, 0,-1,0]);

    // Left   (-X)  normal = (-1, 0, 0)
    drawTriangle3DUVNormal(
      [0,0,0, 0,1,1, 0,0,1], [0,0, 1,1, 1,0], [-1,0,0, -1,0,0, -1,0,0]);
    drawTriangle3DUVNormal(
      [0,0,0, 0,1,0, 0,1,1], [0,0, 0,1, 1,1], [-1,0,0, -1,0,0, -1,0,0]);

    // Right  (+X)  normal = (1, 0, 0)
    drawTriangle3DUVNormal(
      [1,0,0, 1,0,1, 1,1,1], [0,0, 1,0, 1,1], [1,0,0, 1,0,0, 1,0,0]);
    drawTriangle3DUVNormal(
      [1,0,0, 1,1,1, 1,1,0], [0,0, 1,1, 0,1], [1,0,0, 1,0,0, 1,0,0]);
  }

  renderfast() {
    var rgba = this.color;
    gl.uniform1i(u_whichTexture, this.textureNum);
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.uniformMatrix4fv(u_ModelMatrix,  false, this.matrix.elements);
    gl.uniformMatrix4fv(u_NormalMatrix, false, this.normalMatrix.elements);

    var verts = [], uvs = [], normals = [];

    // Front
    verts  = verts.concat([0,0,1, 1,1,1, 1,0,1,  0,0,1, 0,1,1, 1,1,1]);
    normals= normals.concat(Array(6).fill([0,0,1]).flat());
    uvs    = uvs.concat([0,0,1,1,1,0, 0,0,0,1,1,1]);
    // Back
    verts  = verts.concat([0,0,0, 1,0,0, 1,1,0,  0,0,0, 1,1,0, 0,1,0]);
    normals= normals.concat(Array(6).fill([0,0,-1]).flat());
    uvs    = uvs.concat([1,0,0,0,0,1, 1,0,0,1,1,1]);
    // Top
    verts  = verts.concat([0,1,0, 1,1,1, 0,1,1,  0,1,0, 1,1,0, 1,1,1]);
    normals= normals.concat(Array(6).fill([0,1,0]).flat());
    uvs    = uvs.concat([0,0,1,1,0,1, 0,0,1,0,1,1]);
    // Bottom
    verts  = verts.concat([0,0,0, 0,0,1, 1,0,1,  0,0,0, 1,0,1, 1,0,0]);
    normals= normals.concat(Array(6).fill([0,-1,0]).flat());
    uvs    = uvs.concat([0,0,0,1,1,1, 0,0,1,1,1,0]);
    // Left
    verts  = verts.concat([0,0,0, 0,1,1, 0,0,1,  0,0,0, 0,1,0, 0,1,1]);
    normals= normals.concat(Array(6).fill([-1,0,0]).flat());
    uvs    = uvs.concat([0,0,1,1,1,0, 0,0,0,1,1,1]);
    // Right
    verts  = verts.concat([1,0,0, 1,0,1, 1,1,1,  1,0,0, 1,1,1, 1,1,0]);
    normals= normals.concat(Array(6).fill([1,0,0]).flat());
    uvs    = uvs.concat([0,0,1,0,1,1, 0,0,1,1,0,1]);

    var vBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    var uvBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_TexCoord);

    var nBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Normal);

    gl.drawArrays(gl.TRIANGLES, 0, 36);
  }
}

function drawTriangle3DUVNormal(verts, uvs, normals) {
  var vBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.DYNAMIC_DRAW);
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);

  var uvBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.DYNAMIC_DRAW);
  gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_TexCoord);

  var nBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, nBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.DYNAMIC_DRAW);
  gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Normal);

  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

// keep old one working for drawCylinder calls
function drawTriangle3DUV(verts, uvs) {
  if (!uvs) uvs = [0,0, 1,0, 1,1];
  var normals = [0,1,0, 0,1,0, 0,1,0]; // dummy normal
  drawTriangle3DUVNormal(verts, uvs, normals);
}