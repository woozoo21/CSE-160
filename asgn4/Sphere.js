class Sphere {
  constructor() {
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
    this.normalMatrix = new Matrix4();
    this.textureNum = -2;
  }

  render() {
    var rgba = this.color;
    gl.uniform1i(u_whichTexture, this.textureNum);
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.uniformMatrix4fv(u_ModelMatrix,  false, this.matrix.elements);
    gl.uniformMatrix4fv(u_NormalMatrix, false, this.normalMatrix.elements);

    var verts = [], normals = [], uvs = [];
    var n = 20; // subdivisions

    for (let lat = 0; lat < n; lat++) {
      for (let lon = 0; lon < n; lon++) {
        // 4 corners of this quad
        var t1 = lat     / n * Math.PI;
        var t2 = (lat+1) / n * Math.PI;
        var p1 = lon     / n * 2 * Math.PI;
        var p2 = (lon+1) / n * 2 * Math.PI;

        var x1 = Math.sin(t1)*Math.cos(p1), y1 = Math.cos(t1), z1 = Math.sin(t1)*Math.sin(p1);
        var x2 = Math.sin(t2)*Math.cos(p1), y2 = Math.cos(t2), z2 = Math.sin(t2)*Math.sin(p1);
        var x3 = Math.sin(t1)*Math.cos(p2), y3 = Math.cos(t1), z3 = Math.sin(t1)*Math.sin(p2);
        var x4 = Math.sin(t2)*Math.cos(p2), y4 = Math.cos(t2), z4 = Math.sin(t2)*Math.sin(p2);

        // triangle 1
        verts.push(x1,y1,z1, x2,y2,z2, x4,y4,z4);
        normals.push(x1,y1,z1, x2,y2,z2, x4,y4,z4); // normal = position for unit sphere
        uvs.push(lon/n, lat/n,  lon/n, (lat+1)/n,  (lon+1)/n, (lat+1)/n);

        // triangle 2
        verts.push(x1,y1,z1, x4,y4,z4, x3,y3,z3);
        normals.push(x1,y1,z1, x4,y4,z4, x3,y3,z3);
        uvs.push(lon/n, lat/n,  (lon+1)/n, (lat+1)/n,  (lon+1)/n, lat/n);
      }
    }

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

    gl.drawArrays(gl.TRIANGLES, 0, verts.length / 3);
  }
}