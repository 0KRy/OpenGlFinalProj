#version 300 es
    in vec4 aPosition;
    in vec3 aNormal;
    in vec4 aColor;

    uniform mat4 uModel;
    uniform mat4 uView;
    uniform mat4 uProjection;
    uniform vec3 view;
    uniform vec3 lPos;
    uniform vec3 lColor;
    uniform vec3 lAmb;

    out vec3 fPos;
    out vec4 vColor;
    out vec3 normal;
    out vec3 lightPos;
    out vec3 lightColor;
    out vec3 ambient;
    out vec3 vPos;
    void main()
    {
         gl_Position = uProjection * (uView * uModel * aPosition);
         vColor = aColor;
         fPos = (uModel * aPosition).xyz;
         normal = normalize(mat3(transpose(inverse(uModel))) * aNormal);
         lightPos = lPos;
         lightColor = lColor;
         ambient = lAmb;
         vPos = view;

    }
