import config from '../main/config.js';
import ShaderClass from '../shader/shader.js';
import ShaderLightClass from '../shader/shader_light.js';

//
// map shader object
//

export default class MapMeshShaderClass extends ShaderClass
{
    constructor(view)
    {
        super(view);
        
        this.vertexShaderURL='shaders/map_mesh.vert';
        this.fragmentShaderURL='shaders/map_mesh.frag';
        
        this.vertexPositionAttribute=null;
        this.vertexNormalAttribute=null;
        this.vertexTangentAttribute=null;    
        this.vertexUVAttribute=null;
        this.vertexJointAttribute=null;         // unused in map mesh shader
        this.vertexWeightAttribute=null;        // unused in map mesh shader

        this.perspectiveMatrixUniform=null;
        this.viewMatrixUniform=null;
        this.normalMatrixUniform=null;
        
        this.alphaUniform=null;
        this.specularFactorUniform=null;
        this.glowFactorUniform=null; 
        this.ambientUniform=null;
        
        this.hasSkinUniform=null;               // we keep this hear as mesh drawing is generic between map and model and we need to know if this exists

        this.lights=[];
        
        Object.seal(this);
    }
    
        //
        // load finish
        //

    loadFinish()
    {
        let n,name;
        let gl=this.view.gl;

            // setup uniforms

        gl.useProgram(this.program);

        this.vertexPositionAttribute=gl.getAttribLocation(this.program,'vertexPosition');
        this.vertexNormalAttribute=gl.getAttribLocation(this.program,'vertexNormal');
        this.vertexTangentAttribute=gl.getAttribLocation(this.program,'vertexTangent');
        this.vertexUVAttribute=gl.getAttribLocation(this.program,'vertexUV');

        this.perspectiveMatrixUniform=gl.getUniformLocation(this.program,'perspectiveMatrix');
        this.viewMatrixUniform=gl.getUniformLocation(this.program,'viewMatrix');
        this.normalMatrixUniform=gl.getUniformLocation(this.program,'normalMatrix');

        this.alphaUniform=gl.getUniformLocation(this.program,'alpha');
        this.specularFactorUniform=gl.getUniformLocation(this.program,'specularFactor');
        this.glowFactorUniform=gl.getUniformLocation(this.program,'glowFactor');
        this.ambientUniform=gl.getUniformLocation(this.program,'ambient');
        
        for (n=0;n!==this.view.MAX_LIGHT_COUNT;n++) {
            this.lights.push(new ShaderLightClass());

            name='lights['+n+']';
            this.lights[n].positionIntensityUniform=gl.getUniformLocation(this.program,name+'.positionIntensity');
            this.lights[n].colorExponentUniform=gl.getUniformLocation(this.program,name+'.colorExponent');
        }

            // these uniforms are always the same

        gl.uniform1i(gl.getUniformLocation(this.program,'baseTex'),0);
        gl.uniform1i(gl.getUniformLocation(this.program,'normalTex'),1);
        gl.uniform1i(gl.getUniformLocation(this.program,'specularTex'),2);
        gl.uniform1i(gl.getUniformLocation(this.program,'glowTex'),3);

        gl.useProgram(null);
    }
    
        //
        // start/stop map shader drawing
        //

    drawStart()
    {
        let n;
        let light,viewLight;
        let gl=this.view.gl;

        gl.useProgram(this.program);

            // matrix

        gl.uniformMatrix4fv(this.perspectiveMatrixUniform,false,this.view.perspectiveMatrix.data);
        gl.uniformMatrix4fv(this.viewMatrixUniform,false,this.view.viewMatrix.data);
        gl.uniformMatrix3fv(this.normalMatrixUniform,false,this.view.normalMatrix.data);
        
            // ambient
            
        gl.uniform3f(this.ambientUniform,this.view.ambient.r,this.view.ambient.g,this.view.ambient.b);

            // lighting
            // these are packed, where the first vec4 is x,y,z,intensity (position and intensity)
            // and the second vec4 is r,g,b,exponent (color and exponent)
            
            // if intensity = 0 light is off
        
        for (n=0;n!==this.view.MAX_LIGHT_COUNT;n++) {

            light=this.lights[n];
            viewLight=this.view.lights[n];

                // no light sets intensity to 0

            if (viewLight===null) {
                gl.uniform4f(light.positionIntensityUniform,0.0,0.0,0.0,0.0);    // x,y,z,intensity
                gl.uniform4f(light.colorExponentUniform,1.0,1.0,1.0,1.0);       // r,g,b,exponent
                continue;
            }

                // otherwise setup the radial light

            gl.uniform4f(light.positionIntensityUniform,viewLight.eyePosition.x,viewLight.eyePosition.y,viewLight.eyePosition.z,viewLight.intensity);
            gl.uniform4f(light.colorExponentUniform,viewLight.color.r,viewLight.color.g,viewLight.color.b,viewLight.exponent);
        }

            // enable the vertex attributes

        gl.enableVertexAttribArray(this.vertexPositionAttribute);
        gl.enableVertexAttribArray(this.vertexNormalAttribute);
        gl.enableVertexAttribArray(this.vertexTangentAttribute);
        gl.enableVertexAttribArray(this.vertexUVAttribute);
    }

    drawEnd()
    {
        let gl=this.view.gl;

            // disable vertex attributes

        gl.disableVertexAttribArray(this.vertexPositionAttribute);
        gl.disableVertexAttribArray(this.vertexNormalAttribute);
        gl.disableVertexAttribArray(this.vertexTangentAttribute);
        gl.disableVertexAttribArray(this.vertexUVAttribute);

            // no longer using shader

        gl.useProgram(null);
    }

}
