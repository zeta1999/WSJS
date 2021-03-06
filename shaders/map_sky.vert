#version 300 es

in highp vec3 vertexPosition;
in highp vec2 vertexUV;

uniform highp mat4 perspectiveMatrix;
uniform highp mat4 viewMatrix;
uniform highp mat4 transformMatrix;

out highp vec2 fragUV;

void main(void)
{
    gl_Position=perspectiveMatrix*viewMatrix*transformMatrix*vec4(vertexPosition,1.0);

    fragUV=vertexUV;
}

