

MySample.main = (async function() {

    'use strict';

    //shaders
    let vertexShaderSource = await loadFileFromServer('/shaders/main.vert');
    let fragmentShaderSource = await loadFileFromServer('/shaders/main.frag');

    let vertexShaderSkybox = await loadFileFromServer('/shaders/skybox.vert');
    let fragmentShaderSkybox = await loadFileFromServer('/shaders/skybox.frag');

    //textures
    let texSkybox = await loadTextureFromServer('/assets/textures/skybox.jpg');
    //const texSkybox = new Image(512,512);
    //texSkybox.src = 'assets/textures/skybox.png';

    //models
    let verFile = (await loadFileFromServer('/assets/models/bun.ply')).split('\n');

    let i = 0;
    let x = 0.01;
    let scale = 1;

    let canvas = document.getElementById('canvas-main');
    let gl = canvas.getContext('webgl2');

    let model = new Float32Array([
            Math.cos(i),0,Math.sin(i),0,
            0,1,0,0,
            -Math.sin(i),0,Math.cos(i),0,
            0,0,0,1

    ]);

    let camera = new Float32Array([0.0,0.5,1.0])

    let lightAmbient = new Float32Array([0.1,0.1,0.1]);

    let light1 = new Float32Array([-0.5,1.0,1.0]);

    let light1Color = new Float32Array([1.0,1.0,1.0]);

    let view = new Float32Array([
        1,0,0,1,
        0,1,0,0,
        0,0,1,0,
        0.7,-0.7,1.0,1
    ]);

    let viewInv = new Float32Array([
        1,0.7,1,-1,
        0,1,0,0,
        0,0,1,0,
        0,0.7,-1.0,1
    ]);
    // perspective vars
`
    let projections = new Float32Array([
        1.0,0.0,0.0,0.0,
        0.0,1.0,0.0,0.0,
        0.0,0.0,1.0,0.0,
        0.0,0.0,0.0,1.0
    ]);
`
    let n = 3; // near
    let r = 1; // right and left

    let f = 10; // far
    let t = 1; // top and bottom

    let projections = new Float32Array([
        (n/r),0.0,0.0,0.0,
        0.0,(n/t),0.0,0.0,
        0.0,0.0, ((-f-n)/(f-n)), -(((-2)*f*n)/(f-n)),
        0.0,0.0,-1.0,0.0
    ]);

    // make bun model
    let bunData = calcPly(verFile)

    let vert = new Float32Array(bunData[0]);
    let vertexColors = new Float32Array(bunData[1]);
    let vertNormal = new Float32Array(bunData[2]);
    let indices = new Uint32Array(bunData[3]);

    // make skybox model
    let vertCube = new Float32Array([
        -2.0, -2.0,  2.0,
        2.0, -2.0,  2.0,
        2.0,  2.0,  2.0,
        -2.0,  2.0,  2.0,
        -2.0, -2.0, -2.0,
        2.0, -2.0, -2.0,
        2.0,  2.0, -2.0,
        -2.0,  2.0, -2.0,
        -2.0,  2.0,  2.0,
        2.0,  2.0,  2.0,
        2.0,  2.0, -2.0,
        -2.0,  2.0, -2.0,
        2.0, -2.0,  2.0,
        2.0, -2.0, -2.0,
        2.0,  2.0, -2.0,
        2.0,  2.0,  2.0,
        -2.0, -2.0,  2.0,
        -2.0, -2.0, -2.0,
        -2.0,  2.0, -2.0,
        -2.0,  2.0,  2.0
    ]);
    let indicesCube = new Uint32Array([
        1, 2, 0,
        0, 2, 3,
        4, 6, 5,
        7, 6, 4,
        8, 9, 10,
        8, 10, 11,
        12, 13, 14,
        12, 14, 15,
        18, 17, 16,
        19, 18, 16,
    ]);
    let texCoords = new Uint32Array([
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
        1.0, 0.0,
        0.0, 0.0,
        0.0, 1.0,
        1.0, 1.0,
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
        1.0, 0.0,
        0.0, 0.0,
        0.0, 1.0,
        1.0, 1.0
    ]);

    // vert stuff
    let vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);
    console.log(gl.getShaderInfoLog(vertexShader)); // for debugging

    //frag stuff
    let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    // Buffer data

    let vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vert, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    let normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertNormal, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    let vertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexColors, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    let indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    let shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    gl.useProgram(shaderProgram);

    var pMat = gl.getUniformLocation(shaderProgram, 'uProjection');
    var mMat = gl.getUniformLocation(shaderProgram, 'uModel');
    var vMat = gl.getUniformLocation(shaderProgram, 'uView');
    var lPos = gl.getUniformLocation(shaderProgram, 'lPos');
    var lColor = gl.getUniformLocation(shaderProgram, 'lColor');
    var lAmb = gl.getUniformLocation(shaderProgram, 'lAmb');
    var cam = gl.getUniformLocation(shaderProgram, 'view');

    // texture Data

    let cubeMap = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeMap);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);

    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, (texSkybox));
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texSkybox);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texSkybox);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texSkybox);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texSkybox);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texSkybox);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // vert stuff
    let vertexSky = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexSky, vertexShaderSkybox);
    gl.compileShader(vertexSky);
    console.log(gl.getShaderInfoLog(vertexSky)); // for debugging

    //frag stuff
    let fragmentSky = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentSky, fragmentShaderSkybox);
    gl.compileShader(fragmentSky);

    let vertexBufferSky = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferSky);
    gl.bufferData(gl.ARRAY_BUFFER, vertCube, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    let indexBufferSky = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferSky);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indicesCube, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    let textureCoordsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    let shaderProgramSky = gl.createProgram();
    gl.attachShader(shaderProgramSky, vertexSky);
    gl.attachShader(shaderProgramSky, fragmentSky);
    gl.linkProgram(shaderProgramSky);
    gl.useProgram(shaderProgramSky);


    var pMatSky = gl.getUniformLocation(shaderProgramSky, 'uProjection');
    var vMatSky = gl.getUniformLocation(shaderProgramSky, 'uView');

    //------------------------------------------------------------------
    //
    // Scene updates go here.
    //
    //------------------------------------------------------------------
    function update() {
    }

    //------------------------------------------------------------------
    //
    // Rendering code goes here
    //
    //------------------------------------------------------------------
    function render() {

       //draw bun
        gl.useProgram(shaderProgram);

        gl.uniformMatrix4fv(pMat, false, (projections));
        gl.uniformMatrix4fv(mMat, false, (model));
        gl.uniformMatrix4fv(vMat, false, (view));
        gl.uniform3fv(lPos, (light1));
        gl.uniform3fv(lColor, (light1Color));
        gl.uniform3fv(lAmb, (lightAmbient));
        gl.uniform3fv(cam, (camera));

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        let position = gl.getAttribLocation(shaderProgram, 'aPosition');
        gl.enableVertexAttribArray(position);
        gl.vertexAttribPointer(position, 3, gl.FLOAT, false, vert.BYTES_PER_ELEMENT * 3, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        let norm = gl.getAttribLocation(shaderProgram, 'aNormal');
        gl.enableVertexAttribArray(norm);
        gl.vertexAttribPointer(norm, 3, gl.FLOAT, false, vertNormal.BYTES_PER_ELEMENT * 3, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
        let color = gl.getAttribLocation(shaderProgram, 'aColor');
        gl.enableVertexAttribArray(color);
        gl.vertexAttribPointer(color, 3, gl.FLOAT, false, vertexColors.BYTES_PER_ELEMENT * 3, 0);

        gl.clearColor(
           0.0,
           0.0,
           0.0,
           0.0);

       gl.clearDepth(1.0);
       gl.depthFunc(gl.LEQUAL);
       gl.enable(gl.DEPTH_TEST);
       //gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

       gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
       gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_INT, 0);

       //skybox rendering
       gl.useProgram(shaderProgramSky);


       gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferSky);
       let positionSky = gl.getAttribLocation(shaderProgramSky, 'aPosition');
       gl.enableVertexAttribArray(positionSky);
       gl.vertexAttribPointer(positionSky, 3, gl.FLOAT, false, vertCube.BYTES_PER_ELEMENT * 3, 0);
       `
       gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordsBuffer);
        let positionvSky = gl.getAttribLocation(shaderProgramSky, 'aPositionCoords');
        gl.enableVertexAttribArray(positionvSky);
        gl.vertexAttribPointer(positionvSky, 2, gl.FLOAT, false, texCoords.BYTES_PER_ELEMENT * 2, 0);
`
       gl.depthFunc(gl.LEQUAL);

       gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferSky);

       gl.uniformMatrix4fv(pMatSky, false, (projections));
       gl.uniformMatrix4fv(vMatSky, false, (view));

       let uSampler = gl.getUniformLocation(shaderProgramSky, 'uSampler');
       gl.activeTexture(gl.TEXTURE0);
       gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeMap);
       gl.uniform1i(uSampler, 0);

       gl.drawElements(gl.TRIANGLES, indicesCube.length, gl.UNSIGNED_INT, 0);



       i+=0.025;


       // creates transformation matrix for shader to computer
       view = new Float32Array([
           1,0,0,1,
           0,1,0,0,
           0,0,1,0,
           0.0,-0.5,1.00,1
        ]);

       model = multiplyMatrix4x4(new Float32Array([
            scale,0,0,0,
            0,scale,0,0,
            0,0,scale,0,
            0,0,0,1
        ]), new Float32Array([
            Math.cos(i),0,Math.sin(i),0,
            0,1,0,0,
            -Math.sin(i),0,Math.cos(i),0,
            0,0,0,1
        ]));




    };

    //------------------------------------------------------------------
    //
    // This is the animation loop.
    //
    //------------------------------------------------------------------
    function animationLoop(time) {

        update();
        render();

        requestAnimationFrame(animationLoop);
    }


    console.log('initializing...');
    requestAnimationFrame(animationLoop);

}());
