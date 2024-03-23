#version 300 es
    precision lowp float;
    in vec4 texCoors;

    uniform samplerCube uSampler;

    out vec4 outColor;
    void main()
    {
        vec4 color = texture(uSampler, texCoors.xyz);
        outColor = color;
//          outColor = vec4(0.5,0.5,0.5,1.0);
    }

