/*
初始化着色器的步骤：
1. 创建着色器对象
2. 向着色器对象填充着色器程序的源代码
3. 编译着色器
4. 创建程序对象
5. 为程序对象分配着色器
6. 连接程序对象
7. 使用程序对象
*/
function loadShader(gl, type, source) {
    // 创建shader
    var shader = gl.createShader(type);
    // shader加载源码
    gl.shaderSource(shader, source);
    // 编译shader
    gl.compileShader(shader);
    // 检查编译结果
    var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!compiled) {
        var error = gl.getShaderInfoLog(shader);
        console.log("着色器编译失败：" + error);
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}
function createProgram(gl, vshader, fshader) {
    // 创建顶点着色器、片元着色
    var vertex_shader = loadShader(gl, gl.VERTEX_SHADER, vshader);
    var frag_shader = loadShader(gl, gl.FRAGMENT_SHADER, fshader);
    if (!vertex_shader || !frag_shader) {
        return null;
    }
    // 创建程序对象
    var program = gl.createProgram();
    // 程序对象附加着色器
    gl.attachShader(program, vertex_shader);
    gl.attachShader(program, frag_shader);
    // 连接程序对象
    gl.linkProgram(program);
    var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!linked) {
        var error = gl.getProgramInfoLog(program);
        console.log("创建程序对象失败：" + error);
        gl.deleteProgram(program);
        gl.deleteShader(vertex_shader);
        gl.deleteShader(frag_shader);
        return null;
    }
    return program;
}
/*
* gl: 为WebGL上下文
* vshaer: 传入顶点着色器源码
* fshader: 传入片元着色器源码
*/
function initShaders(gl, vshader, fshader) {
    // 一个程序对象必须包含顶点着色器和片元着色器
    var program = createProgram(gl, vshader, fshader);
    if (!program) {
        console.log("程序对象创建失败！");
        return false;
    }
    // 使用程序对象
    gl.useProgram(program);
    gl["program"] = program;
    return true;
}


class Mat4x4 {
    // 求矩阵的转置
    transpose(m1) {
        var t_m1 = [];
        for (let i = 0; i < m1.length; i++) {
            let col = Math.floor(i / 4);
            let row = i % 4;
            t_m1.push(m1[row * 4 + col]);
        }
        return t_m1;
    }
    identity() {
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ];
    }
    // 投影矩阵
    projection(width, height, depth) {
        // 因为WebGL为列主序，这里需要进行转置进行行列调换变为列主序
        return this.transpose([
            2 / width, 0, 0, -1,
            0, -2 / height, 0, 1,
            0, 0, 2 / depth, 0,
            0, 0, 0, 1
        ]);
    }
    // 正交投影变换
    orthographic(left, right, top, bottom, near, far) {
        return this.transpose([
            2 / (right - left), 0, 0, (right + left) / (left - right),
            0, 2 / (top - bottom), 0, (top + bottom) / (bottom - top),
            0, 0, 2 / (near - far), (near + far) / (far - near),
            0, 0, 0, 1
        ]);
    }
    // 平移矩阵
    translation(tx, ty, tz) {
        return this.transpose([
            1, 0, 0, tx,
            0, 1, 0, ty,
            0, 0, 1, tz,
            0, 0, 0, 1
        ]);
    }
    translate(m, tx, ty, tz) {
        return this.multiply(m, this.translation(tx, ty, tz));
    }
    // 旋转矩阵
    zRotation(angle_in_radius) {
        let cos = Math.cos(angle_in_radius);
        let sin = Math.sin(angle_in_radius);
        return this.transpose([
            cos, -sin, 0, 0,
            sin, cos, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
    }
    zRotate(m, angle_in_radius) {
        return this.multiply(m, this.zRotation(angle_in_radius));
    }
    xRotation(angle_in_radius) {
        let cos = Math.cos(angle_in_radius);
        let sin = Math.sin(angle_in_radius);
        return this.transpose([
            1, 0, 0, 0,
            0, cos, -sin, 0,
            0, sin, cos, 0,
            0, 0, 0, 1
        ]);
    }
    xRotate(m, angle_in_radius) {
        return this.multiply(m, this.xRotation(angle_in_radius));
    }
    yRotation(angle_in_radius) {
        let cos = Math.cos(angle_in_radius);
        let sin = Math.sin(angle_in_radius);
        return this.transpose([
            cos, 0, -sin, 0,
            0, 1, 0, 0,
            sin, 0, cos, 0,
            0, 0, 0, 1
        ]);
    }
    yRotate(m, angle_in_radius) {
        return this.multiply(m, this.yRotation(angle_in_radius));
    }
    // 缩放矩阵
    scaling(sx, sy, sz) {
        return this.transpose([
            sx, 0, 0, 0,
            0, sy, 0, 0,
            0, 0, sz, 0,
            0, 0, 0, 1
        ]);
    }
    scale(m, sx, sy, sz) {
        return this.multiply(m, this.scaling(sx, sy, sz));
    }
    // 求矩阵m1*m2的乘积
    multiply(m1, m2) {
        let result = [];
        let mat1 = this.transpose(m1);
        let mat2 = this.transpose(m2);
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                result.push(mat1[r * 4 + 0] * mat2[0 * 4 + c] +
                    mat1[r * 4 + 1] * mat2[1 * 4 + c] +
                    mat1[r * 4 + 2] * mat2[2 * 4 + c] +
                    mat1[r * 4 + 3] * mat2[3 * 4 + c]);
            }
        }
        return this.transpose(result);
    }
}
var mat4x4 = new Mat4x4();

function readShaderSource(script_id) {
    var share_script = document.getElementById(script_id);
    return share_script.textContent;
}
// 顶点着色器源码
const VSHADER_SOURCE = readShaderSource("vshader-source");
// 片元着色器源码
const FSHADER_SOURCE = readShaderSource("fshader-source");
// 重置canvas画布的像素尺寸和屏幕一致
function resizeCanvasToDisplaySize(canvas) {
    if (canvas.width != canvas.clientWidth ||
        canvas.height != canvas.clientHeight) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
    }
}
function main() {
    let canvas = document.getElementById("canvas");
    // 获取WebGL上下文
    let gl = canvas.getContext("webgl");
    if (!gl) {
        console.log("加载WebGL上下文失败!");
        return;
    }
    // canvas像素设置和css像素尺寸一致
    resizeCanvasToDisplaySize(canvas);
    gl.viewport(0, 0, canvas.width, canvas.height);
    // 初始化着色器
    initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE);
    // 着色器程序对象
    var program = gl["program"];
    // 获取attribute变量的存储位置
    let a_Color = gl.getAttribLocation(program, "a_Color");
    gl.vertexAttrib3f(a_Color, 0.0, 0.0, 1.0);
    let a_Position = gl.getAttribLocation(program, 'a_Position');
    let u_Project = gl.getUniformLocation(program, "u_Project");
    let project_matrix = mat4x4.projection(canvas.width, canvas.height, canvas.height);
    gl.uniformMatrix4fv(u_Project, false, project_matrix);
    // 指定canvas的背景颜色
    // gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // 清空画布和深度缓冲
    gl.clear(gl.COLOR_BUFFER_BIT);
    drawLineSegements();
    // 绘制折线
    function drawLineSegements() {
        // 已确定的选中的坐标点
        var points_data = [];
        // 跟踪鼠标实时坐标
        var mouse_point = [0, 0];
        var points_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, points_buffer);
        canvas.onclick = function (event) {
            // 添加鼠标坐标到点数据中
            points_data.push(event.clientX);
            points_data.push(event.clientY);
            // 同时监听鼠标移动事件
            canvas.onmousemove = function (event) {
                mouse_point[0] = event.clientX;
                mouse_point[1] = event.clientY;
                draw();
            };
            // 监听ESC或Enter键盘事件以取消本次折线绘制
            document.onkeydown = function (event) {
                if (event.key == "Enter" || event.key == "Escape") {
                    canvas.onmousemove = null;
                    mouse_point = [];
                    draw();
                    points_data = [];
                }
            };
            function draw() {
                let lines_data = points_data.concat(mouse_point);
                let num = lines_data.length / 2;
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lines_data), gl.STATIC_DRAW);
                gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(a_Position);
                gl.drawArrays(gl.LINE_STRIP, 0, num);
            }
        };
    }
}
main();