import ShaderClass from '../shader/shader.js';

//
// sky shader class
//

export default class SkyShaderClass extends ShaderClass
{
    constructor(view)
    {
        super(view);
        
        this.vertexShaderURL='shaders/sky.vert';
        this.fragmentShaderURL='shaders/sky.frag';
        
        this.vertexPositionAttribute=null;
        this.vertexUVAttribute=null;
        this.perspectiveMatrixUniform=null;
        this.viewMatrixUniform=null;
        
        Object.seal(this);
    }
    
        //
        // load finish
        //

    loadFinish()
    {
        let gl=this.view.gl;

            // setup uniforms

        gl.useProgram(this.program);

        this.vertexPositionAttribute=gl.getAttribLocation(this.program,'vertexPosition');
        this.vertexUVAttribute=gl.getAttribLocation(this.program,'vertexUV');

        this.perspectiveMatrixUniform=gl.getUniformLocation(this.program,'perspectiveMatrix');
        this.viewMatrixUniform=gl.getUniformLocation(this.program,'viewMatrix');

        gl.useProgram(null);
    }

        //
        // start/stop interface shader drawing
        //

    drawStart()
    {
        let gl=this.view.gl;
        
        gl.useProgram(this.program);

            // setup the uniforms

        gl.uniformMatrix4fv(this.perspectiveMatrixUniform,false,this.view.perspectiveMatrix.data);
        gl.uniformMatrix4fv(this.viewMatrixUniform,false,this.view.viewMatrix.data);

            // enable the vertex attributes

        gl.enableVertexAttribArray(this.vertexPositionAttribute);
        gl.enableVertexAttribArray(this.vertexUVAttribute);
    }

    drawEnd()
    {
        let gl=this.view.gl;
        
            // disable vertex attributes

        gl.disableVertexAttribArray(this.vertexPositionAttribute);
        gl.disableVertexAttribArray(this.vertexUVAttribute);

            // no longer using program

        gl.useProgram(null);
    }

}