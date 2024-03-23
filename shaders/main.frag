#version 300 es
    precision lowp float;
    in vec4 vColor;
    in vec3 normal;
    in vec3 fPos;
    in vec3 lightPos;
    in vec3 lightColor;
    in vec3 ambient;
    in vec3 vPos;


    out vec4 outColor;
    void main()
    {

        //diffuse
        vec3 lightVec = normalize(lightPos - fPos);

        float dotVec0 = dot(normal, lightVec);

        float dotChk0 = max(dotVec0, 0.0);

        vec3 diffuse = dotChk0 * lightColor;

        //specular

        float shine = 200.0;

        vec3 viewVec = normalize(vPos - fPos);

        vec3 reVec = reflect(-lightVec, normal);

        float dotVec1 = dot(viewVec, reVec);

        float dotChk1 = max(dotVec1, 0.0);

        float spec = pow(dotChk1,64.0);

        vec3 specular = shine * spec * lightColor;


        //all
         vec3 result = (specular + diffuse + ambient) * vColor.xyz;

         outColor = vec4(result, 1.0);
    }
