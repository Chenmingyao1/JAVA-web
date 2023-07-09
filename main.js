"use strict";
function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }

    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(log);
}

function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        return program;
    }

    const log = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(log);
}

function resize(canvas) {
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    if (canvas.width != displayWidth || canvas.height != displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
    }
}

function drawLine(gl, program, x1, y1, x2, y2, color) {
    var resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);

    var offsetLocation = gl.getUniformLocation(program, "u_offset");
    gl.uniform2f(offsetLocation, 0.5, 0.5);

    var colorLocation = gl.getUniformLocation(program, "u_color");
    gl.uniform4fv(colorLocation, color);

    var positionLocation = gl.getAttribLocation(program, "a_position");
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    const vertices = new Float32Array([x1, y1, x2, y2]);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.LINES, 0, 2);
}

function main() {
    const canvas = document.querySelector("#canvas");
    const gl = canvas.getContext("webgl");
    if (!gl) {
        alert("Unable to initialize WebGL. Your browser or machine may not support it.");
        return;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const program = createProgram(gl, vertexShader, fragmentShader);

    resize(canvas);
    window.addEventListener("resize", () => {
        resize(canvas);
    });

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0.0, 1.0, 1.0, 1.0);//背景白色
    gl.clear(gl.COLOR_BUFFER_BIT);
    drawLine(gl, program, 100, 100, 700, 500, [0.0, 0.0, 0.0, 1.0]);//黑色线
}

main();