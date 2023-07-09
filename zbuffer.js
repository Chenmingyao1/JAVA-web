// 定义三角形顶点信息
var vertices = [
	[-0.5, -0.5, 0.5],
	[0.5, -0.5, 0.5],
	[0, 0.5, 0.5],
];

// 定义顶点颜色信息
var colors = [
	[255, 0, 0],
	[0, 255, 0],
	[0, 0, 255],
];

// 定义深度缓存
var depthBuffer = [];

// 初始化深度缓存
function initDepthBuffer() {
	for (var i = 0; i < 400; i++) {
		depthBuffer[i] = [];
		for (var j = 0; j < 400; j++) {
			depthBuffer[i][j] = -Infinity;
		}
	}
}

// 计算三角形面积
function calcTriangleArea(v1, v2, v3) {
	var a = Math.sqrt(Math.pow(v1[0] - v2[0], 2) + Math.pow(v1[1] - v2[1], 2) + Math.pow(v1[2] - v2[2], 2));
	var b = Math.sqrt(Math.pow(v1[0] - v3[0], 2) + Math.pow(v1[1] - v3[1], 2) + Math.pow(v1[2] - v3[2], 2));
	var c = Math.sqrt(Math.pow(v2[0] - v3[0], 2) + Math.pow(v2[1] - v3[1], 2) + Math.pow(v2[2] - v3[2], 2));
	var p = (a + b + c) / 2;
	return Math.sqrt(p * (p - a) * (p - b) * (p - c));
}

// 绘制三角形
function drawTriangle(ctx, v1, v2, v3, c1, c2, c3) {
	// 计算三角形面积
	var area = calcTriangleArea(v1, v2, v3);

	// 将三角形顶点按y坐标从小到大排序
	var tmp;
	if (v1[1] > v2[1]) {
		tmp = v1; v1 = v2; v2 = tmp;
		tmp = c1; c1 = c2; c2 = tmp;
	}
	if (v1[1] > v3[1]) {
		tmp = v1; v1 = v3; v3 = tmp;
		tmp = c1; c1 = c3; c3 = tmp;
	}
	if (v2[1] > v3[1]) {
		tmp = v2; v2 = v3; v3 = tmp;
		tmp = c2; c2 = c3; c3 = tmp;
	}

	// 计算三角形投影到屏幕上的坐标
	var sx1 = (v1[0] + 1) * 200;
	var sy1 = (v1[1] + 1) * 200;
	var sx2 = (v2[0] + 1) * 200;
	var sy2 = (v2[1] + 1) * 200;
	var sx3 = (v3[0] + 1) * 200;
	var sy3 = (v3[1] + 1) * 200;

	// 分别计算每行的左右端点
	var x1, x2, y;
	var z1, z2, z3;
	var c11, c21, c31;
	var c12, c22, c32;
	for (y = Math.ceil(sy1); y <= sy2; y++) {
		// 计算左右端点的x坐标和深度值
		x1 = sx1 + (y - sy1) / (sy2 - sy1) * (sx2 - sx1);
		z1 = v1[2] + (y - sy1) / (sy2 - sy1) * (v2[2] - v1[2]);
		c11 = c1[0] + (y - sy1) / (sy2 - sy1) * (c2[0] - c1[0]);
		c21 = c1[1] + (y - sy1) / (sy2 - sy1) * (c2[1] - c1[1]);
		c31 = c1[2] + (y - sy1) / (sy2 - sy1) * (c2[2] - c1[2]);
		x2 = sx1 + (y - sy1) / (sy3 - sy1) * (sx3 - sx1);
		z2 = v1[2] + (y - sy1) / (sy3 - sy1) * (v3[2] - v1[2]);
		c12 = c1[0] + (y - sy1) / (sy3 - sy1) * (c3[0] - c1[0]);
		c22 = c1[1] + (y - sy1) / (sy3 - sy1) * (c3[1] - c1[1]);
		c32 = c1[2] + (y - sy1) / (sy3 - sy1) * (c3[2] - c1[2]);

		// 交换左右端点，保证x1 <= x2
		if (x1 > x2) {
			tmp = x1; x1 = x2; x2 = tmp;
			tmp = z1; z1 = z2; z2 = tmp;
			tmp = c11; c11 = c12; c12 = tmp;
			tmp = c21; c21 = c22; c22 = tmp;
			tmp = c31; c31 = c32; c32 = tmp;
		}

		// 在该行上进行扫描线填充
		for (var x = Math.ceil(x1); x <= x2; x++) {
			// 计算当前像素的深度值
			var z = z1 + (x - x1) / (x2 - x1) * (z2 - z1);

			// 判断是否需要更新深度缓存和像素颜色
			if (z > depthBuffer[x][y]) {
				depthBuffer[x][y] = z;
				var r = c11 + (x - x1) / (x2 - x1) * (c21 - c11);
				var g = c12 + (x - x1) / (x2 - x1) * (c22 - c12);
				var b = c31 + (x - x1) / (x2 - x1) * (c32 - c31);
				ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
				ctx.fillRect(x, y, 1, 1);
			}
		}
	}

	for (y = Math.ceil(sy2); y <= sy3; y++) {
		// 计算左右端点的x坐标和深度值
		x1 = sx2 + (y - sy2) / (sy3 - sy2) * (sx3 - sx2);
		z1 = v2[2] + (y - sy2) / (sy3 - sy2) * (v3[2] - v2[2]);
		c11 = c2[0] + (y - sy2) / (sy3 - sy2) * (c3[0] - c2[0]);
		c21 = c2[1] + (y - sy2) / (sy3 - sy2) * (c3[1] - c2[1]);
		c31 = c2[2] + (y - sy2) / (sy3 - sy2) * (c3[2] - c2[2]);
		x2 = sx1 + (y - sy1) / (sy3 - sy1) * (sx3 - sx1);
		z2 = v1[2] + (y - sy1) / (sy3 - sy1) * (v3[2] - v1[2]);
		c12 = c1[0] + (y - sy1) / (sy3 - sy1) * (c3[0] - c1[0]);
		c22 = c1[1] + (y - sy1) / (sy3 - sy1) * (c3[1] - c1[1]);
		c32 = c1[2] + (y - sy1) / (sy3 - sy1) * (c3[2] - c1[2]);

		// 交换左右端点，保证x1 <= x2
		if (x1 > x2) {
			tmp = x1; x1 = x2; x2 = tmp;
			tmp = z1; z1 = z2; z2 = tmp;
			tmp = c11; c11 = c12; c12 = tmp;
			tmp = c21; c21 = c22; c22 = tmp;
			tmp = c31; c31 = c32; c32 = tmp;
		}

		// 在该行上进行扫描线填充
		for (var x = Math.ceil(x1); x <= x2; x++) {
			// 计算当前像素的深度值
			var z = z1 + (x - x1) / (x2 - x1) * (z2 - z1);

			// 判断是否需要更新深度缓存和像素颜色
			if (z > depthBuffer[x][y]) {
				depthBuffer[x][y] = z;
				var r = c11 + (x - x1) / (x2 - x1) * (c21 - c11);
				var g = c12 + (x - x1) / (x2 - x1) * (c22 - c12);
				var b = c31 + (x - x1) / (x2 - x1) * (c32 - c31);
				ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
				ctx.fillRect(x, y, 1, 1);
			}
		}
	}
}

// 初始化深度缓存
initDepthBuffer();

// 获取canvas元素和绘制上下文
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

// 绘制三角形
drawTriangle(ctx, vertices[0], vertices[1], vertices[2], colors[0], colors[1], colors[2]);