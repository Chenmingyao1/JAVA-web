import * as martinez from "martinez-polygon-clipping";

export function geoJSON2RadiusShapeJSON(geoJSON) {
    let radiusShapeJSON = [];

    geoJSON.geometry.coordinates.forEach((element)=>{
        let childRadiusShapeJSON = [];
        element[0].forEach((element, index, array) => {
            if (index !== array.length - 1) {
                childRadiusShapeJSON.push({x: element[0], y: element[1], radius: 0});
            }
        });
        radiusShapeJSON.push(childRadiusShapeJSON)
    })
    return radiusShapeJSON;
}

// 将绘制所用的json转化为GoeJSON
export function radiusShapeJSON2GeoJSON(radiusShapeJSON) {
    let coordinatesArr = [];
    radiusShapeJSON.forEach((element) => {
        coordinatesArr.push([element.x, element.y]);
    });
    coordinatesArr.push([radiusShapeJSON[0].x, radiusShapeJSON[0].y]);


    return {
        "type": "Feature",
        "geometry": {
            "type": "Polygon", "coordinates": [
                coordinatesArr
            ]
        }
    }
}

//交集
export function intersection(radiusShapeJSON1, radiusShapeJSON2) {
    return geoJSON2RadiusShapeJSON(
        {
            "type": "Feature",
            "geometry": {
                "type": "Polygon", "coordinates":
                    martinez.intersection(
                        radiusShapeJSON2GeoJSON(radiusShapeJSON1).geometry.coordinates,
                        radiusShapeJSON2GeoJSON(radiusShapeJSON2).geometry.coordinates
                    )

            }
        }

    )
}

//差
export function diff(radiusShapeJSON1, radiusShapeJSON2) {
    return geoJSON2RadiusShapeJSON(
        {
            "type": "Feature",
            "geometry": {
                "type": "Polygon", "coordinates":
                    martinez.diff(
                        radiusShapeJSON2GeoJSON(radiusShapeJSON1).geometry.coordinates,
                        radiusShapeJSON2GeoJSON(radiusShapeJSON2).geometry.coordinates
                    )

            }
        }

    )
}

//并集
export function union(radiusShapeJSON1, radiusShapeJSON2) {
    return geoJSON2RadiusShapeJSON(
        {
            "type": "Feature",
            "geometry": {
                "type": "Polygon", "coordinates":
                    martinez.union(
                        radiusShapeJSON2GeoJSON(radiusShapeJSON1).geometry.coordinates,
                        radiusShapeJSON2GeoJSON(radiusShapeJSON2).geometry.coordinates
                    )

            }
        }

    )
}

//异或
export function xor(radiusShapeJSON1, radiusShapeJSON2) {
    return geoJSON2RadiusShapeJSON(
        {
            "type": "Feature",
            "geometry": {
                "type": "Polygon", "coordinates":
                    martinez.xor(
                        radiusShapeJSON2GeoJSON(radiusShapeJSON1).geometry.coordinates,
                        radiusShapeJSON2GeoJSON(radiusShapeJSON2).geometry.coordinates
                    )

            }
        }

    )
}

/**
 * 已知A、B、C三点坐标，求半径为r的内切圆与AC的切点坐标
 * @param A
 * @param B
 * @param C
 * @param r
 * @returns {{x: *, y: *}}
 */
export function _toOrigin(A, B, C, r) {
    let {pow, acos, tan} = Math;

    //ab的长度
    const ab = pow(pow(A.x - B.x, 2) + pow(A.y - B.y, 2), 0.5);
    //bc的长度
    const bc = pow(pow(C.x - B.x, 2) + pow(C.y - B.y, 2), 0.5);

    //B的角度
    const angleB = acos(((A.x - B.x) * (C.x - B.x) + (A.y - B.y) * (C.y - B.y)) / (ab * bc));

    //BM的长度,即B到切线的长度
    const M = r / tan(angleB / 2);


    const k = (C.y - B.y) / (C.x - B.x);


    if (k === '-Infinity') {
        return {
            x: B.x,
            y: B.y - M
        };
    } else if (k === 'Infinity') {
        return {
            x: B.x,
            y: B.y + M
        };
    } else {
        let i = 1;

        if (1 / k === '-Infinity') {
            i = -1;
        }

        if (k < 0) {
            if ((C.y - B.y) < 0) {
                i = 1;
            } else {
                i = -1;
            }
        }

        if (k > 0) {
            if (C.y - B.y < 0) {
                i = -1;
            }
        }


        return {
            x: B.x + (1 / pow(1 + k * k, 0.5)) * M * i,
            y: B.y + (k / pow(1 + k * k, 0.5)) * M * i
        };
    }


}

/**
 * 将json点集转化为可操作点handlePoints
 */
export function json2HandlePoint(json) {
    //矫正radius
    fixRadius(json);
    //将所有可操作点保存handlePoint变量中
    let handlePoints = [];

    //第一个点
    handlePoints.push({
        start: {x: json[json.length - 1].x, y: json[json.length - 1].y},
        middle: {x: json[0].x, y: json[0].y},
        end: {x: json[1].x, y: json[1].y},
        radius: json[0].radius
    });

    //中间所有点
    for (let i = 1; i < json.length - 1; i++) {
        handlePoints.push({
            start: {x: json[i - 1].x, y: json[i - 1].y},
            middle: {x: json[i].x, y: json[i].y},
            end: {x: json[i + 1].x, y: json[i + 1].y},
            radius: json[i].radius
        });
    }

    //最后一个点
    handlePoints.push({
        start: {x: json[json.length - 2].x, y: json[json.length - 2].y},
        middle: {x: json[json.length - 1].x, y: json[json.length - 1].y},
        end: {x: json[0].x, y: json[0].y},
        radius: json[json.length - 1].radius
    });


    return handlePoints;
}

/**
 * 将异常json的radius按照Sketch模式矫正
 * sketch圆角异常数据处理方法：

 用户可设定radius值，当出现不合法值的时候，原值不变，图像自行优化

 说明：如100*50的矩形，可以在50像素的边对应的角，各设置成radius=25，也可以其中一个设为0，另一个设为50，总之就是radius1+radius2=50。当radius1+radius2>50的时候，在绘制里，radius_min不变，radius_max = 50/2,而在json数据中不改变这些数据，已保存用户的数据记录
 */
export function fixRadius(json) {
    //第一个点
    _fixRadius(json[json.length - 1], json[0], json[1]);

    for (let i = 1; i < json.length - 1; i++) {
        _fixRadius(json[i - 1], json[i], json[i + 1]);
    }

    //最后一个点
    _fixRadius(json[json.length - 2], json[json.length - 1], json[0]);
}

export function _fixRadius(left, curr, right) {
    let {pow, acos, tan} = Math;

    const leftLine = pow(pow(left.x - curr.x, 2) + pow(left.y - curr.y, 2), 0.5);
    const rightLine = pow(pow(right.x - curr.x, 2) + pow(right.y - curr.y, 2), 0.5);

    //两边最短边
    const minLine = leftLine < rightLine ? leftLine : rightLine;
    //中间角度
    const angleCurr = acos(((left.x - curr.x) * (right.x - curr.x) + (left.y - curr.y) * (right.y - curr.y)) / (leftLine * rightLine));
    //理论上能实现的最大弧度半径
    let maxRadius = minLine * tan(angleCurr / 2);


    /*
        当左右都为0且，当前radius超过理论最大弧度半径时
        将radius缩减到最大弧度半径
     */
    if (left.radius === 0 && right.radius === 0) {
        if (curr.radius > maxRadius) {
            curr.radius = maxRadius;
        }
    }

    /*
        当左右任意一边有值，且radius超过理论最大弧度半径的一半时
        将radius缩减到最大弧度半径的一半
     */

    if (left.radius > 0 || right.radius > 0) {
        if (curr.radius > maxRadius / 2) {
            curr.radius = maxRadius / 2;
        }
    }

}

export function drawShape(handlePoints,graphics) {
    //重置路径
    graphics.beginFill(0x66CCFF);
    let currPoint = undefined;

    const origin = _toOrigin(handlePoints[0].start, handlePoints[0].middle, handlePoints[0].end, handlePoints[0].radius);

    graphics.moveTo(origin.x, origin.y);

    for (let i = 1; i < handlePoints.length; i++) {
        currPoint = handlePoints[i];

        //绘制圆弧
        graphics.arcTo(currPoint.middle.x, currPoint.middle.y, currPoint.end.x, currPoint.end.y, currPoint.radius);
    }

    currPoint = handlePoints[0];
    graphics.arcTo(currPoint.middle.x, currPoint.middle.y, currPoint.end.x, currPoint.end.y, currPoint.radius);

    graphics.endFill();
    graphics.closePath();
}

//绘制经布尔运算后的图形
export function drawAll(arr,graphics) {
    arr.forEach(element => {
        drawShape(json2HandlePoint(element),graphics)
    })
};

