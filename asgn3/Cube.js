class Cube {
    constructor() {
        this.type = 'cube';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
    }

    render() {
        var rgba = this.color;
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Front face
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        drawTriangle3DUV([0,0,1, 1,1,1, 1,0,1], [0,0, 1,1, 1,0]);
        drawTriangle3DUV([0,0,1, 0,1,1, 1,1,1], [0,0, 0,1, 1,1]);

        // Back face
        gl.uniform4f(u_FragColor, rgba[0]*0.7, rgba[1]*0.7, rgba[2]*0.7, rgba[3]);
        drawTriangle3DUV([0,0,0, 1,0,0, 1,1,0], [1,0, 0,0, 0,1]);
        drawTriangle3DUV([0,0,0, 1,1,0, 0,1,0], [1,0, 0,1, 1,1]);

        // Top face
        gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3]);
        drawTriangle3DUV([0,1,0, 1,1,1, 0,1,1], [0,0, 1,1, 0,1]);
        drawTriangle3DUV([0,1,0, 1,1,0, 1,1,1], [0,0, 1,0, 1,1]);

        // Bottom face
        gl.uniform4f(u_FragColor, rgba[0]*0.5, rgba[1]*0.5, rgba[2]*0.5, rgba[3]);
        drawTriangle3DUV([0,0,0, 0,0,1, 1,0,1], [0,0, 0,1, 1,1]);
        drawTriangle3DUV([0,0,0, 1,0,1, 1,0,0], [0,0, 1,1, 1,0]);

        // Left face
        gl.uniform4f(u_FragColor, rgba[0]*0.6, rgba[1]*0.6, rgba[2]*0.6, rgba[3]);
        drawTriangle3DUV([0,0,0, 0,1,1, 0,0,1], [0,0, 1,1, 1,0]);
        drawTriangle3DUV([0,0,0, 0,1,0, 0,1,1], [0,0, 0,1, 1,1]);

        // Right face
        gl.uniform4f(u_FragColor, rgba[0]*0.8, rgba[1]*0.8, rgba[2]*0.8, rgba[3]);
        drawTriangle3DUV([1,0,0, 1,0,1, 1,1,1], [0,0, 1,0, 1,1]);
        drawTriangle3DUV([1,0,0, 1,1,1, 1,1,0], [0,0, 1,1, 0,1]);
    }

    renderfast() {
        var rgba = this.color;
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        var allverts = [];

        // Front
        allverts = allverts.concat([0,0,1, 1,1,1, 1,0,1]);
        allverts = allverts.concat([0,0,1, 0,1,1, 1,1,1]);
        // Back
        allverts = allverts.concat([0,0,0, 1,0,0, 1,1,0]);
        allverts = allverts.concat([0,0,0, 1,1,0, 0,1,0]);
        // Top
        allverts = allverts.concat([0,1,0, 1,1,1, 0,1,1]);
        allverts = allverts.concat([0,1,0, 1,1,0, 1,1,1]);
        // Bottom
        allverts = allverts.concat([0,0,0, 0,0,1, 1,0,1]);
        allverts = allverts.concat([0,0,0, 1,0,1, 1,0,0]);
        // Left
        allverts = allverts.concat([0,0,0, 0,1,1, 0,0,1]);
        allverts = allverts.concat([0,0,0, 0,1,0, 0,1,1]);
        // Right
        allverts = allverts.concat([1,0,0, 1,0,1, 1,1,1]);
        allverts = allverts.concat([1,0,0, 1,1,1, 1,1,0]);

        // UVs for all 12 triangles
        var alluvs = [];
        for (var i = 0; i < 12; i++) {
            alluvs = alluvs.concat([0,0, 1,1, 1,0]);
        }

        var vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(allverts), gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);

        var uvBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(alluvs), gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_TexCoord);

        gl.drawArrays(gl.TRIANGLES, 0, 36);
    }
}

function drawTriangle3DUV(verts, uvs) {
    // if no uvs provided, use defaults so it never crashes
    if (!uvs) uvs = [0,0, 1,0, 1,1];
    
    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    var uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_TexCoord);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
}