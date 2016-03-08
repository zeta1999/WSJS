//
// map shader object
//

class MapShader extends Shader
{
    constructor()
    {
        super();
        
        this.vertexPositionAttribute=null;
        this.vertexNormalAttribute=null;
        this.vertexTangentAttribute=null;    
        this.vertexAndLightmapUVAttribute=null;

        this.perspectiveMatrixUniform=null;
        this.modelMatrixUniform=null;
        this.normalMatrixUniform=null;

        this.shineFactorUniform=null;
        this.ambientUniform=null;

        this.lights=[];
    }
    
        //
        // initialize/release map shader
        //

    initialize(view)
    {
            // get a new shader object
            // and load/compile it

        if (!super.initialize(view,'map')) return(false);

            // setup uniforms

        var gl=view.gl;

        gl.useProgram(this.program);

        this.vertexPositionAttribute=gl.getAttribLocation(this.program,'vertexPosition');
        this.vertexNormalAttribute=gl.getAttribLocation(this.program,'vertexNormal');
        this.vertexTangentAttribute=gl.getAttribLocation(this.program,'vertexTangent');    
        this.vertexAndLightmapUVAttribute=gl.getAttribLocation(this.program,'vertexAndLightmapUV');

        this.perspectiveMatrixUniform=gl.getUniformLocation(this.program,'perspectiveMatrix');
        this.modelMatrixUniform=gl.getUniformLocation(this.program,'modelMatrix');
        this.normalMatrixUniform=gl.getUniformLocation(this.program,'normalMatrix');

        this.shineFactorUniform=gl.getUniformLocation(this.program,'shineFactor');    
        this.ambientUniform=gl.getUniformLocation(this.program,'ambient');

        var n,name;

        for (n=0;n!==view.LIGHT_COUNT;n++) {
            this.lights.push(new ShaderLight());

            name='light_'+n;
            this.lights[n].positionUniform=gl.getUniformLocation(this.program,name+'.position');
            this.lights[n].colorUniform=gl.getUniformLocation(this.program,name+'.color');
            this.lights[n].intensityUniform=gl.getUniformLocation(this.program,name+'.intensity');
            this.lights[n].invertIntensityUniform=gl.getUniformLocation(this.program,name+'.invertIntensity');
            this.lights[n].exponentUniform=gl.getUniformLocation(this.program,name+'.exponent');
        }

            // these uniforms are always the same

        gl.uniform1i(gl.getUniformLocation(this.program,'baseTex'),0);
        gl.uniform1i(gl.getUniformLocation(this.program,'normalTex'),1);
        gl.uniform1i(gl.getUniformLocation(this.program,'specularTex'),2);
        gl.uniform1i(gl.getUniformLocation(this.program,'lightmapTex'),3);

        gl.useProgram(null);

        return(true);
    }

    release(view)
    {
        super.release(view);
    }

        //
        // start/stop map shader drawing
        //

    drawStart(view)
    {
        var n;
        var light,viewLight;

            // using the map shader

        var gl=view.gl;

        gl.useProgram(this.program);

            // matrix

        gl.uniformMatrix4fv(this.perspectiveMatrixUniform,false,view.perspectiveMatrix);
        gl.uniformMatrix4fv(this.modelMatrixUniform,false,view.modelMatrix);
        gl.uniformMatrix3fv(this.normalMatrixUniform,false,view.normalMatrix);

            // lighting
            // SUPERGUMBA -- NOTE!!!!
            // windows has a dumb bug where two vec3 in a struct
            // will stomp on each other.  The work-around is to use
            // a vec4.  This is ugly. FIX LATER

        gl.uniform3f(this.ambientUniform,view.ambient.r,view.ambient.g,view.ambient.b);

        for (n=0;n!==view.LIGHT_COUNT;n++) {

            light=this.lights[n];
            viewLight=view.lights[n];

                // no light sets everything to 0

            if (viewLight===null) {
                gl.uniform4f(light.positionUniform,0.0,0.0,0.0,1.0);
                gl.uniform4f(light.colorUniform,1.0,1.0,0.0,0.0);
                gl.uniform1f(light.intensityUniform,0.0);
                gl.uniform1f(light.invertIntensityUniform,0.0);
                gl.uniform1f(light.exponentUniform,1.0);
                continue;
            }

                // otherwise setup the light

            gl.uniform4f(light.positionUniform,viewLight.eyePosition.x,viewLight.eyePosition.y,viewLight.eyePosition.z,1.0);
            if (viewLight.inLightmap) {
                gl.uniform4f(light.colorUniform,0.0,0.0,0.0,0.0);     // if in light map, then we set color to zero so it doesn't effect the pixel
            }
            else {
                gl.uniform4f(light.colorUniform,viewLight.color.r,viewLight.color.g,viewLight.color.b,0.0);
            }
            gl.uniform1f(light.intensityUniform,viewLight.intensity);
            gl.uniform1f(light.invertIntensityUniform,viewLight.invertIntensity);
            gl.uniform1f(light.exponentUniform,viewLight.exponent);
        }

            // enable the vertex attributes

        gl.enableVertexAttribArray(this.vertexPositionAttribute);
        gl.enableVertexAttribArray(this.vertexNormalAttribute);
        gl.enableVertexAttribArray(this.vertexTangentAttribute);
        gl.enableVertexAttribArray(this.vertexAndLightmapUVAttribute);
    }

    drawEnd(view)
    {
        var gl=view.gl;

            // disable vertex attributes

        gl.disableVertexAttribArray(this.vertexPositionAttribute);
        gl.disableVertexAttribArray(this.vertexNormalAttribute);
        gl.disableVertexAttribArray(this.vertexTangentAttribute);
        gl.disableVertexAttribArray(this.vertexAndLightmapUVAttribute);

            // no longer using shader

        gl.useProgram(null);
    }

}
