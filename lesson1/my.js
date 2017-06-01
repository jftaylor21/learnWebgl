window.onload = function() {
    main();
}

function main() {
    var canvas = document.getElementById("myCanvas");
    if (canvas === null) {
        alert("Could not find canvas");
        return;
    }
    
    var gl = initGL(canvas);
    var shaderProgram = initShaders(gl);
    var triangleVertexPositionBuffer = initTriangleBuffer(gl);
    var squareVertexPositionBuffer = initSquareBuffer(gl);
    
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    
    drawScene(gl, shaderProgram, triangleVertexPositionBuffer, squareVertexPositionBuffer);
}

function initTriangleBuffer(gl) {
    var triangleVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
    var vertices = [
         0.0,  1.0,  0.0,
        -1.0, -1.0,  0.0,
         1.0, -1.0,  0.0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    triangleVertexPositionBuffer.itemSize = 3;
    triangleVertexPositionBuffer.numItems = 3;
    return triangleVertexPositionBuffer;
}

function initSquareBuffer(gl) { 
    var squareVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
    vertices = [
         1.0,  1.0,  0.0,
        -1.0,  1.0,  0.0,
         1.0, -1.0,  0.0,
        -1.0, -1.0,  0.0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    squareVertexPositionBuffer.itemSize = 3;
    squareVertexPositionBuffer.numItems = 4;
    return squareVertexPositionBuffer;
}

function drawScene(gl, shaderProgram, triangleVertexPositionBuffer, squareVertexPositionBuffer) {
    var mvMatrix = mat4.create();
    var pMatrix = mat4.create();

    // setup viewport
    var viewportX = 0;
    var viewportY = 0;
    gl.viewport(viewportX, viewportY, gl.viewportWidth, gl.viewportHeight);
    
    // clear canvas
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    // setup perspective
    var fovy = 45;
    var aspect = gl.viewportWidth / gl.viewportHeight;
    var zNear = 0.1;
    var zFar = 100;
    mat4.perspective(pMatrix, fovy, aspect, zNear, zFar, pMatrix);
    
    mat4.identity(mvMatrix);
    
    // draw triangle
    mat4.translate(mvMatrix, mvMatrix, [-1.5, 0.0, -7.0]);
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, triangleVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    setMatrixUniforms(gl, shaderProgram, pMatrix, mvMatrix);
    gl.drawArrays(gl.TRIANGLES, 0, triangleVertexPositionBuffer.numItems);
    
    // draw square
    mat4.translate(mvMatrix, mvMatrix, [3.0, 0.0, 0.0]);
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    setMatrixUniforms(gl, shaderProgram, pMatrix, mvMatrix);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems);
}

function initGL(canvas) {
    var gl;
    try {
        gl = canvas.getContext("experimental-webgl");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    } catch(e) {
    }
    if (!gl) {
        alert("Could not initialise WebGL, sorry :-( ");
    }
    return gl;
}

function initShaders(gl){   
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    prepShader(gl, fragmentShader,
        "\
        precision mediump float; \
        \
        void main(void) { \
            gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0); \
        }"
    );

    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    prepShader(gl, vertexShader,
    "\
    attribute vec3 aVertexPosition;\
    \
    uniform mat4 uMVMatrix;\
    uniform mat4 uPMatrix;\
    \
    void main(void) {\
        gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);\
    }\
    "
    );

    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }

    gl.useProgram(shaderProgram);
    
    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
    
    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    
    return shaderProgram;
}

function prepShader(gl, shader, shaderStr) {
    gl.shaderSource(shader, shaderStr);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

function setMatrixUniforms(gl, shaderProgram, pMatrix, mvMatrix) {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}

