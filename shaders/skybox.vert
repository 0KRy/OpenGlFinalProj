#version 300 es
    in vec4 aPosition;

    uniform mat4 uView;
    uniform mat4 uProjection;

    out vec4 texCoors;
    void main()
    {
         texCoors = aPosition;
         mat4 remView = mat4(mat3(uView));
         gl_Position = vec4((aPosition * remView * uProjection).xy,1.0, 1.0);


    }
