

//------------------------------------------------------------------
//
// Helper function used to load a file from the server
//
//------------------------------------------------------------------
async function loadFileFromServer(filename) {
    return fetch(filename)
        .then(res => res.text());
}

function loadTextureFromServer(filename) {
    return new Promise((resolve, reject) => {
        let asset = new Image();
        asset.src = filename;
        asset.decode()
        .then(() => {
            console.log('loaded');
            resolve(asset);
        })
        .catch(err => {
            console.log('bad things happened');
            reject(err);
        });
    });
}

function calcPly(verFile) {
    let header = verFile.indexOf('end_header')
    let headerInfo = []
    let preVert = [];
    let preInd = [];
    let normal = [];
    let vert = [];
    let vertNormal = [];
    let preVertColors = [];
    let max = 0;
    // finds inportant header data.
    for (let i = 0; i < header; i++) {
        if (((verFile[i]).split(' '))[0] == ('element')) {
            headerInfo.push(parseInt(verFile[i].split(' ')[2])+header);

        }
    }

    // creates prevert colors and normal lists
    for (let j = header+1; j <= headerInfo[0]; j++) {

        let line = verFile[j].split(' ');
        if (max < parseFloat(line[0])) {
            max = parseFloat(line[0]);
        }
        if (max < parseFloat(line[1])) {
            max = parseFloat(line[1]);
        }
        if (max < parseFloat(line[2])) {
            max = parseFloat(line[2]);
        }

        preVert.push(parseFloat(line[0]));
        preVert.push(parseFloat(line[1]));
        preVert.push(parseFloat(line[2]));

        preVertColors.push(1);
        preVertColors.push(1);
        preVertColors.push(1);

        normal.push([])
    }

    //unit space conversion

    for (let k = 0; k < preVert.length; k++) {
        preVert[k] = (preVert[k]/max);

    }

    //creates preInd and calcs normals
    for (let f = headerInfo[0]+1; f <= headerInfo[1]+headerInfo[0]-header; f++) {
        let line = verFile[f].split(' ');

        preInd.push(parseInt(line[1]));
        preInd.push(parseInt(line[2]));
        preInd.push(parseInt(line[3]));

        let x1 = preVert[parseInt(line[1]) * 3];
        let y1 = preVert[parseInt(line[1]) * 3 + 1];
        let z1 = preVert[parseInt(line[1]) * 3 + 2];

        let x2 = preVert[parseInt(line[2]) * 3];
        let y2 = preVert[parseInt(line[2]) * 3 + 1];
        let z2 = preVert[parseInt(line[2]) * 3 + 2];

        let x3 = preVert[parseInt(line[3]) * 3];
        let y3 = preVert[parseInt(line[3]) * 3 + 1];
        let z3 = preVert[parseInt(line[3]) * 3 + 2];
`
        let a = (y2*z3) - (y3*z2) + (y3*z1) - (y1*z3) + (y1*z2) - (y2*z1);
        let b = - (x2*z3) + (x3*z2) - (x3*z1) + (x1*z3) - (x1*z2) + (x2*z1);
        let c = (x2*y3) - (x3*y2) + (x3*y1) - (x1*y3) + (x1*y2) - (x2*y1);
`
        let v = [x1-x3,y1-y3,z1-z3];

        let w = [x2-x3,y2-y3,z2-z3];

        let triNormal = [(w[1]*v[2]) - (w[2]*v[1]),(w[2]*v[0]) - (w[0]*v[2]),(w[0]*v[1]) - (w[1]*v[0])];

        normal[parseInt(line[1])].push(triNormal);
        normal[parseInt(line[2])].push(triNormal);
        normal[parseInt(line[3])].push(triNormal);

    };


        // normalizing vertices
    for (let v = 0; v < preVert.length; v+=3) {
        let avgX = 0.0;
        let avgY = 0.0;
        let avgZ = 0.0;
        for (let n = 0; n < normal[v/3].length; n++) {
            avgX += parseFloat(normal[v/3][n][0]);
            avgY += parseFloat(normal[v/3][n][1]);
            avgZ += parseFloat(normal[v/3][n][2]);
        }
        avgX *= 1/normal[v/3].length;
        avgY *= 1/normal[v/3].length;
        avgZ *= 1/normal[v/3].length;

        let magnatude = Math.sqrt((avgX ** 2)+(avgY ** 2)+(avgZ ** 2));
        // let magnatude = 1;

        if (magnatude != 0) {
            vertNormal.push(avgX/magnatude);
            vertNormal.push(avgY/magnatude);
            vertNormal.push(avgZ/magnatude);
        } else {
            vertNormal.push(0);
            vertNormal.push(0);
            vertNormal.push(0);
        }
    };

    return [preVert, preVertColors, vertNormal, preInd]
}

//------------------------------------------------------------------
//
// Helper function to multiply two 4x4 matrices.
//
//------------------------------------------------------------------
function multiplyMatrix4x4(m1, m2) {
    let r = [
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0];

    // Iterative multiplication
    // for (let i = 0; i < 4; i++) {
    //     for (let j = 0; j < 4; j++) {
    //         for (let k = 0; k < 4; k++) {
    //             r[i * 4 + j] += m1[i * 4 + k] * m2[k * 4 + j];
    //         }
    //     }
    // }

    // "Optimized" manual multiplication
    r[0] = m1[0] * m2[0] + m1[1] * m2[4] + m1[2] * m2[8] + m1[3] * m2[12];
    r[1] = m1[0] * m2[1] + m1[1] * m2[5] + m1[2] * m2[9] + m1[3] * m2[13];
    r[2] = m1[0] * m2[2] + m1[1] * m2[6] + m1[2] * m2[10] + m1[3] * m2[14];
    r[3] = m1[0] * m2[3] + m1[1] * m2[7] + m1[2] * m2[11] + m1[3] * m2[15];

    r[4] = m1[4] * m2[0] + m1[5] * m2[4] + m1[6] * m2[8] + m1[7] * m2[12];
    r[5] = m1[4] * m2[1] + m1[5] * m2[5] + m1[6] * m2[9] + m1[7] * m2[13];
    r[6] = m1[4] * m2[2] + m1[5] * m2[6] + m1[6] * m2[10] + m1[7] * m2[14];
    r[7] = m1[4] * m2[3] + m1[5] * m2[7] + m1[6] * m2[11] + m1[7] * m2[15];

    r[8] = m1[8] * m2[0] + m1[9] * m2[4] + m1[10] * m2[8] + m1[11] * m2[12];
    r[9] = m1[8] * m2[1] + m1[9] * m2[5] + m1[10] * m2[9] + m1[11] * m2[13];
    r[10] = m1[8] * m2[2] + m1[9] * m2[6] + m1[10] * m2[10] + m1[11] * m2[14];
    r[11] = m1[8] * m2[3] + m1[9] * m2[7] + m1[10] * m2[11] + m1[11] * m2[15];

    r[12] = m1[12] * m2[0] + m1[13] * m2[4] + m1[14] * m2[8] + m1[15] * m2[12];
    r[13] = m1[12] * m2[1] + m1[13] * m2[5] + m1[14] * m2[9] + m1[15] * m2[13];
    r[14] = m1[12] * m2[2] + m1[13] * m2[6] + m1[14] * m2[10] + m1[15] * m2[14];
    r[15] = m1[12] * m2[3] + m1[13] * m2[7] + m1[14] * m2[11] + m1[15] * m2[15];

    return r;
}

//------------------------------------------------------------------
//
// Transpose a matrix.
// Reference: https://jsperf.com/transpose-2d-array
//
//------------------------------------------------------------------
function transposeMatrix4x4(m) {
    let t = [
        m[0], m[4], m[8], m[12],
        m[1], m[5], m[9], m[13],
        m[2], m[6], m[10], m[14],
        m[3], m[7], m[11], m[15]
    ];
    return t;
}
