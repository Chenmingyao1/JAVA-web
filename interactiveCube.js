//用于绘制模型
var canvas, gl;
var numVertices = 36;
var points = [], colors = [];
 
//用于HTML按钮交互
var xAixs = 0;
var yAixs = 1;
var zAixs = 2;
var axis = 0;
var theta = [0,0,0];
var currentAngle = [0.0, 0.0];
var rotate = false;
var thetaLoc;
 
 
//鼠标键盘交互
var isShiftDown = false;//用于shift+鼠标键交互
var vRotateMatrix, rotateMatrix, u_rotateMatrix;//旋转
var vTranslateMatrix, translateMatrix, u_translateMatrix, Tx = 0, Ty = 0;//平移
var vScalingMatrix, scalingMatrix, u_scalingMatrix, factor = 0, Sx = 1, Sy = 1, Sz = 1;//缩放
 
 
 
window.onload = function cube (){
 
    canvas = document.getElementById('WebGL-mouseCube');
    // gl = WebGLUtils.setupWebGL(canvas);
    gl = canvas.getContext('experimental-webgl',{antialias:true});
 
    colorCube();
 
    if(!gl){
        console.log('浏览器不支持WebGL');
    }
 
    //设置视口大小
    gl.viewport(0,0,canvas.width,canvas.height);
    //清除canvas
    gl.clearColor(0, 0, 0, 1.0);
    //消除隐藏面
    gl.enable(gl.DEPTH_TEST);
 
    //初始化着色器
    var program = initShaders(gl,"shader/cube/mouseCubeVshader.glsl","shader/cube/fragmentShader.glsl");
    gl.useProgram(program);//将着色器程序设置为有效
 
 
    //颜色数据
    var cBuffer = gl.createBuffer();//创建缓冲区对象
    gl.bindBuffer(gl.ARRAY_BUFFER,cBuffer);//绑定对象
    gl.bufferData(gl.ARRAY_BUFFER,flatten(colors),gl.STATIC_DRAW);//向缓冲区对象写入数据
 
    var vColor = gl.getAttribLocation(program, 'vColor');//获取着色器中的Attribute变量
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT,false,0,0);//将缓冲区对象分配给attribute变量
    gl.enableVertexAttribArray(vColor);//建立attribute变量与缓冲区之间的连接
 
    //顶点数据
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,flatten(points),gl.STATIC_DRAW);
 
    var vPosition = gl.getAttribLocation(program, 'vPosition');
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false,0,0);
    gl.enableVertexAttribArray(vPosition);
 
    //旋转变换矩阵
    vRotateMatrix = gl.getUniformLocation(program,'vRotateMatrix');
    rotateMatrix =  new Matrix4();
    rotateMatrix.setPerspective(45,canvas.width/canvas.height,1.0,10000);
    rotateMatrix.lookAt(1.0,1.0,2.0, 0.0,0.0,0.0, 0.0,1.0,0.0);
    initMouseControl(canvas,currentAngle);
 
    //平移矩阵
    vTranslateMatrix = gl.getUniformLocation(program, 'vTranslateMatrix');
    translateMatrix = new Matrix4();
 
    //缩放矩阵
    vScalingMatrix = gl.getUniformLocation(program,'vScalingMatrix');
    scalingMatrix = new Matrix4();
 
    thetaLoc = gl.getUniformLocation(program, 'theta');
 
    //添加交互按钮的函数功能
    document.getElementById('xRotate').onclick = function (){
        axis = xAixs;
    };//绕x轴
    document.getElementById('yRotate').onclick = function (){
        axis = yAixs;
    };//绕y轴
    document.getElementById('zRotate').onclick = function (){
        axis = zAixs;
    };//绕z轴
    document.getElementById('sRotate').onclick = function (){
      rotate = !rotate;
    };//控制是否旋转
 
    //添加键盘监听事件
    document.addEventListener('keydown',onDocumentKeyDown,false);
    document.addEventListener('keyup',onDocumentKeyUp,false);
 
    //绘制渲染
    render();
};
//立方体与的顶点索引和面
function colorCube(){
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}
 
function quad(a, b, c, d)
{
    var vertices = [
        vec4( -0.25, -0.25,  0.25, 1.0 ),
        vec4( -0.25,  0.25,  0.25, 1.0 ),
        vec4(  0.25,  0.25,  0.25, 1.0 ),
        vec4(  0.25, -0.25,  0.25, 1.0 ),
        vec4( -0.25, -0.25, -0.25, 1.0 ),
        vec4( -0.25,  0.25, -0.25, 1.0 ),
        vec4(  0.25,  0.25, -0.25, 1.0 ),
        vec4(  0.25, -0.25, -0.25, 1.0 )
    ];
 
    var vertexColors = [
        [ 0.0, 0.0, 0.0, 1.0 ],  // black
        [ 1.0, 0.0, 0.0, 1.0 ],  // red
        [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
        [ 0.0, 1.0, 0.0, 1.0 ],  // green
        [ 0.0, 0.0, 1.0, 1.0 ],  // blue
        [ 1.0, 0.0, 1.0, 1.0 ],  // magenta
        [ 0.0, 1.0, 1.0, 1.0 ],  // cyan
        [ 1.0, 1.0, 1.0, 1.0 ]   // white
    ];
 
 
    var indices = [a,b,c,a,c,d];
    for (var i=0; i<indices.length;++i){
        points.push(vertices[indices[i]]);
        colors.push(vertexColors[a]);
    }
}
 
//键盘监听事件响应函数
function onDocumentKeyDown(event){
 
    switch(event.keyCode){
        case 16:
            isShiftDown = true;
            break;
    }
 
}
 
function onDocumentKeyUp(event){
 
    switch(event.keyCode){
        case 16:
            isShiftDown = false;
            break;
    }
}
 
//在canvas上添加鼠标交互
function initMouseControl(canvas,currentAngle){
 
    var dragging1 = false, dragging2 = false, dragging3 = false;
    var lastX = -1, lastY = -1;
 
        canvas.onmousedown = function (event) {//按下鼠标触发监听事件
 
            var x = event.clientX, y = event.clientY;
            switch (event.button) {
                case 0:
                case 1:      //鼠标左键及中键
                    var rect1 = event.target.getBoundingClientRect();
                    if (rect1.left <= x && x < rect1.right && rect1.top <= y && y < rect1.bottom) {
                        lastX = x;
                        lastY = y;
                        dragging1 = true;
                        dragging3 = true;
                    }
                    break;
 
                case 2:      //鼠标右键
                    var rect2 = event.target.getBoundingClientRect();
                    if (rect2.left <= x && x < rect2.right && rect2.top <= y && y < rect2.bottom) {
                        lastX = x;
                        lastY = y;
                        dragging2 = true;
                        canvas.oncontextmenu = function () {//在canvas里屏蔽浏览器右键菜单,不兼容火狐
                            return false;
                        }
                    }
                    break;
            }
 
 
        };
 
 
        //滚轮缩放操作
           canvas.onmousewheel = function (event) {
 
               if (isShiftDown){
                   console.log(event.wheelDelta);
                   factor = event.wheelDelta / 1200;
                   Sx += factor / 5;//x方向的缩放范围
                   Sy += factor / 5;//y方向的缩放范围
                   Sz += factor / 5;//z方向的缩放范围
               }
 
           };
 
        //松开鼠标
        canvas.onmouseup = function (event) {
 
            switch (event.button) {
                case 0:
                case 1:
                    dragging1 = false;
                    dragging3 = false;
                    break;
                case 2:
                    dragging2 = false;
            }
 
        };
 
        //移动鼠标
        canvas.onmousemove = function (event) {//鼠标移动监听
            var x = event.clientX, y = event.clientY;
 
            //旋转
            if ((dragging1 || dragging3) && isShiftDown) {
                var factor1 = 200 / canvas.height;//旋转速度
                var dx1 = factor1 * (x - lastX);
                var dy1 = factor1 * (y - lastY);
 
                //限制x轴旋转范围
                currentAngle[0] = Math.max(Math.min(currentAngle[0] + dy1, 90), -90);
                currentAngle[1] = currentAngle[1] + dx1;
            }
 
            //平移
            if (isShiftDown && dragging2) {
                var factor2 = 2 / canvas.height;//平移速度
                var dx2 = factor2 * (x - lastX);
                var dy2 = factor2 * (y - lastY);
 
                //限制平移范围
                Tx = Math.max(Math.min(Tx + dx2, 500), -500);
                Ty = Math.max(Math.min(Ty - dy2, 300), -300);
            }
 
            //更新上一个位置为开始位置
            lastX = x;
            lastY = y;
        };
 
    }
 
//绘制函数
function render(){
 
    //旋转矩阵
    u_rotateMatrix = new Matrix4();
    u_rotateMatrix.set(rotateMatrix);
    u_rotateMatrix.rotate(currentAngle[0], 1.0, 0.0, 0.0);
    u_rotateMatrix.rotate(currentAngle[1], 0.0, 1.0, 0.0);
    gl.uniformMatrix4fv(vRotateMatrix, false, u_rotateMatrix.elements);
 
    //平移矩阵
    u_translateMatrix = new Matrix4();
    u_translateMatrix.set(translateMatrix);
    u_translateMatrix.translate(Tx, 0.0, 0.0);
    u_translateMatrix.translate(0.0, Ty, 0.0);
    gl.uniformMatrix4fv(vTranslateMatrix, false, u_translateMatrix.elements);
 
    //缩放矩阵，这里的if主要是为了限制
    // 模型的缩放范围保持正常范围
    if(Sx>=0&&Sy>=0&&Sz>=0) {
        u_scalingMatrix = new Matrix4();
        u_scalingMatrix.set(scalingMatrix);
        u_scalingMatrix.scale(Sx, Sy, Sz);
        gl.uniformMatrix4fv(vScalingMatrix, false, u_scalingMatrix.elements);
    }
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    if(rotate)theta[axis] += 0.8;//绕坐标轴运动的旋转角
    gl.uniform3fv(thetaLoc, theta);
    gl.drawArrays(gl.TRIANGLES, 0, numVertices);//绘制图形
    requestAnimFrame( render );//动画
}
