/*
��ʼ����ɫ���Ĳ��裺
1. ������ɫ������
2. ����ɫ�����������ɫ�������Դ����
3. ������ɫ��
4. �����������
5. Ϊ������������ɫ��
6. ���ӳ������
7. ʹ�ó������
*/
function loadShader(gl, type, source) {
    // ����shader
    var shader = gl.createShader(type);
    // shader����Դ��
    gl.shaderSource(shader, source);
    // ����shader
    gl.compileShader(shader);
    // ��������
    var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!compiled) {
        var error = gl.getShaderInfoLog(shader);
        console.log("��ɫ������ʧ�ܣ�" + error);
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}
function createProgram(gl, vshader, fshader) {
    // ����������ɫ����ƬԪ��ɫ
    var vertex_shader = loadShader(gl, gl.VERTEX_SHADER, vshader);
    var frag_shader = loadShader(gl, gl.FRAGMENT_SHADER, fshader);
    if (!vertex_shader || !frag_shader) {
        return null;
    }
    // �����������
    var program = gl.createProgram();
    // ������󸽼���ɫ��
    gl.attachShader(program, vertex_shader);
    gl.attachShader(program, frag_shader);
    // ���ӳ������
    gl.linkProgram(program);
    var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!linked) {
        var error = gl.getProgramInfoLog(program);
        console.log("�����������ʧ�ܣ�" + error);
        gl.deleteProgram(program);
        gl.deleteShader(vertex_shader);
        gl.deleteShader(frag_shader);
        return null;
    }
    return program;
}
/*
* gl: ΪWebGL������
* vshaer: ���붥����ɫ��Դ��
* fshader: ����ƬԪ��ɫ��Դ��
*/
function initShaders(gl, vshader, fshader) {
    // һ���������������������ɫ����ƬԪ��ɫ��
    var program = createProgram(gl, vshader, fshader);
    if (!program) {
        console.log("������󴴽�ʧ�ܣ�");
        return false;
    }
    // ʹ�ó������
    gl.useProgram(program);
    gl["program"] = program;
    return true;
}


class Mat4x4 {
    // ������ת��
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
    // ͶӰ����
    projection(width, height, depth) {
        // ��ΪWebGLΪ������������Ҫ����ת�ý������е�����Ϊ������
        return this.transpose([
            2 / width, 0, 0, -1,
            0, -2 / height, 0, 1,
            0, 0, 2 / depth, 0,
            0, 0, 0, 1
        ]);
    }
    // ����ͶӰ�任
    orthographic(left, right, top, bottom, near, far) {
        return this.transpose([
            2 / (right - left), 0, 0, (right + left) / (left - right),
            0, 2 / (top - bottom), 0, (top + bottom) / (bottom - top),
            0, 0, 2 / (near - far), (near + far) / (far - near),
            0, 0, 0, 1
        ]);
    }
    // ƽ�ƾ���
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
    // ��ת����
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
    // ���ž���
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
    // �����m1*m2�ĳ˻�
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
// ������ɫ��Դ��
const VSHADER_SOURCE = readShaderSource("vshader-source");
// ƬԪ��ɫ��Դ��
const FSHADER_SOURCE = readShaderSource("fshader-source");
// ����canvas���������سߴ����Ļһ��
function resizeCanvasToDisplaySize(canvas) {
    if (canvas.width != canvas.clientWidth ||
        canvas.height != canvas.clientHeight) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
    }
}
function main() {
    let canvas = document.getElementById("canvas");
    // ��ȡWebGL������
    let gl = canvas.getContext("webgl");
    if (!gl) {
        console.log("����WebGL������ʧ��!");
        return;
    }
    // canvas�������ú�css���سߴ�һ��
    resizeCanvasToDisplaySize(canvas);
    gl.viewport(0, 0, canvas.width, canvas.height);
    // ��ʼ����ɫ��
    initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE);
    // ��ɫ���������
    var program = gl["program"];
    // ��ȡattribute�����Ĵ洢λ��
    let a_Color = gl.getAttribLocation(program, "a_Color");
    gl.vertexAttrib3f(a_Color, 0.0, 0.0, 1.0);
    let a_Position = gl.getAttribLocation(program, 'a_Position');
    let u_Project = gl.getUniformLocation(program, "u_Project");
    let project_matrix = mat4x4.projection(canvas.width, canvas.height, canvas.height);
    gl.uniformMatrix4fv(u_Project, false, project_matrix);
    // ָ��canvas�ı�����ɫ
    // gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // ��ջ�������Ȼ���
    gl.clear(gl.COLOR_BUFFER_BIT);
    drawLineSegements();
    // ��������
    function drawLineSegements() {
        // ��ȷ����ѡ�е������
        var points_data = [];
        // �������ʵʱ����
        var mouse_point = [0, 0];
        var points_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, points_buffer);
        canvas.onclick = function (event) {
            // ���������굽��������
            points_data.push(event.clientX);
            points_data.push(event.clientY);
            // ͬʱ��������ƶ��¼�
            canvas.onmousemove = function (event) {
                mouse_point[0] = event.clientX;
                mouse_point[1] = event.clientY;
                draw();
            };
            // ����ESC��Enter�����¼���ȡ���������߻���
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