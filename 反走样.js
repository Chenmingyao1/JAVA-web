// 获取canvas元素
var canvas = document.getElementById('canvas');
var gl = canvas.getContext('webgl', { antialias: false });

// 顶点着色器代码
var vertexShaderSource = `
    attribute vec2 position;

    void main() {
        gl_Position = vec4(position, 0.0, 1.0);
    }
`;

// 片元着色器代码
var fragmentShaderSource = `
    precision highp float;

    uniform vec4 color;

    void main() {
        gl_FragColor = color;
    }
`;

// 创建着色器
function createShader(gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

// 创建程序
function createProgram(gl, vertexShader, fragmentShader) {
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program link error:', gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }
    return program;
}

// 创建直线顶点数据
function createLineVertices(x1, y1, x2, y2) {
    return new Float32Array([
        x1, y1,
        x2, y2
    ]);
}

// 创建直线索引数据
function createLineIndices() {
    return new Uint16Array([0, 1]);
}

// 创建缓冲区
function createBuffer(gl, data) {
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    return buffer;
}

// 渲染直线
function renderLine(gl, program, verticesBuffer, indicesBuffer, color) {
    // 设置颜色
    var colorLocation = gl.getUniformLocation(program, 'color');
    gl.uniform4fv(colorLocation, color);

    // 绑定顶点缓冲区
    var positionLocation = gl.getAttribLocation(program, 'position');
    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLocation);

    // 绑定索引缓冲区
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);

    // 渲染直线
    gl.drawElements(gl.LINES, 2, gl.UNSIGNED_SHORT, 0);
}

// 渲染函数
function render() {
    // 清空画布
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // 渲染直线
    renderLine(gl, program, verticesBuffer, indicesBuffer, [1.0, 0.0, 0.0, 1.0]);
}

// 创建顶点着色器
var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);

// 创建片元着色器
var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

// 创建程序
var program = createProgram(gl, vertexShader, fragmentShader);

// 创建直线数据
var vertices = createLineVertices(-0.5, -0.5, 0.5, 0.5);
var indices = createLineIndices();

// 创建缓冲区
var verticesBuffer = createBuffer(gl, vertices);
var indicesBuffer = createBuffer(gl, indices);

// 开始渲染
render();