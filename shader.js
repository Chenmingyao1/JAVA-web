const vertexShaderSource = `
    attribute vec2 a_position;

    void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
    }
`;

const fragmentShaderSource = `
    precision mediump float;

    uniform vec4 u_color;
    uniform vec2 u_resolution;
    uniform vec2 u_offset;

    float lineWidth = 1.0;

    void main() {
        vec2 st = gl_FragCoord.xy - u_offset;
        vec2 px = 1.0 / u_resolution.xy;

        vec2 width = vec2(lineWidth) * px;
        vec2 d = abs(width - 1.0);
        vec2 offset = width * 0.5 - 0.5;

        vec4 color = vec4(0.0, 0.0, 0.0, 0.0);
        float alpha = 0.0;

        vec2 q = st - offset;
        vec2 r = vec2(d.x, -d.y);
        vec2 p = max(abs(r) - abs(q), vec2(0.0));
        alpha = length(p) + min(max(r.x, r.y), 0.0);
        color = mix(vec4(0.0), u_color, step(alpha, 0.0));

        gl_FragColor = color;
    }
`;
