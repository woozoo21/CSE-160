class Circle {
  constructor() {
    this.position = [0, 0];
    this.color = [1, 0, 0, 1];
    this.size = 10;
    this.segments = 12;
  }

  render() {
    var r = this.size / 200;
    var x = this.position[0];
    var y = this.position[1];
    var n = this.segments;

    gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);

    var verts = [];
    for (var i = 0; i < n; i++) {
      var a1 = (i / n) * 2 * Math.PI;
      var a2 = ((i + 1) / n) * 2 * Math.PI;
      // each slice is a triangle from center to edge
      verts.push(x, y);                                    // center
      verts.push(x + r * Math.cos(a1), y + r * Math.sin(a1)); // point 1
      verts.push(x + r * Math.cos(a2), y + r * Math.sin(a2)); // point 2
    }

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
    gl.drawArrays(gl.TRIANGLES, 0, n * 3);
  }
}