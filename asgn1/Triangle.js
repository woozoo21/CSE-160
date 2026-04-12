class Triangle {
  constructor() {
    this.position = [0, 0];
    this.color = [1, 0, 0, 1];
    this.size = 10;
    this.vertices = null;
  }

  render() {
    var verts;
    if (this.vertices) {
      verts = new Float32Array(this.vertices);
    } else {
      var s = this.size / 100;
      var x = this.position[0];
      var y = this.position[1];
      verts = new Float32Array([
        x,     y + s,
        x - s, y - s,
        x + s, y - s
      ]);
    }

    gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
}