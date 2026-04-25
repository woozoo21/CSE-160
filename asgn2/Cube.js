class Cube {
    constructor() {
        this.type = 'cube';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
    }

    render() {
        var rgba = this.color;

        // Send matrix to shader
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Front face - full brightness
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        drawTriangle3D([0,0,1,  1,1,1,  1,0,1]);
        drawTriangle3D([0,0,1,  0,1,1,  1,1,1]);

        // Back face - slightly darker
        gl.uniform4f(u_FragColor, rgba[0]*0.7, rgba[1]*0.7, rgba[2]*0.7, rgba[3]);
        drawTriangle3D([0,0,0,  1,0,0,  1,1,0]);
        drawTriangle3D([0,0,0,  1,1,0,  0,1,0]);

        // Top face - slightly lighter
        gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3]);
        drawTriangle3D([0,1,0,  1,1,1,  0,1,1]);
        drawTriangle3D([0,1,0,  1,1,0,  1,1,1]);

        // Bottom face - darkest
        gl.uniform4f(u_FragColor, rgba[0]*0.5, rgba[1]*0.5, rgba[2]*0.5, rgba[3]);
        drawTriangle3D([0,0,0,  0,0,1,  1,0,1]);
        drawTriangle3D([0,0,0,  1,0,1,  1,0,0]);

        // Left face - medium dark
        gl.uniform4f(u_FragColor, rgba[0]*0.6, rgba[1]*0.6, rgba[2]*0.6, rgba[3]);
        drawTriangle3D([0,0,0,  0,1,1,  0,0,1]);
        drawTriangle3D([0,0,0,  0,1,0,  0,1,1]);

        // Right face - medium
        gl.uniform4f(u_FragColor, rgba[0]*0.8, rgba[1]*0.8, rgba[2]*0.8, rgba[3]);
        drawTriangle3D([1,0,0,  1,0,1,  1,1,1]);
        drawTriangle3D([1,0,0,  1,1,1,  1,1,0]);
    }
}