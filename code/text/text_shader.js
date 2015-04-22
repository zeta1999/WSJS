"use strict";

//
// initialize/release text shader
//

function textShaderInitialize(view)
{
        // get a new shader object
        // and load/compile it
        
    this.shader=new shaderObject();
    if (!this.shader.initialize(view,'wsTextVertShader','wsTextFragShader')) return(false);
    
        // setup uniforms
    
    view.gl.useProgram(this.shader.program);
    
    this.vertexPositionAttribute=view.gl.getAttribLocation(this.shader.program,'vertexPosition');
    this.vertexUVAttribute=view.gl.getAttribLocation(this.shader.program,'vertexUV');
    
    this.orthoMatrixUniform=view.gl.getUniformLocation(this.shader.program,'orthoMatrix');    
    this.colorUniform=view.gl.getUniformLocation(this.shader.program,'color');
    
        // these uniforms are always the same
        
    view.gl.uniform1i(view.gl.getUniformLocation(this.shader.program,'baseTex'),0);
    
    view.gl.useProgram(null);
    
    return(true);
}

function textShaderRelease(view)
{
    this.shader.release(view);
}

//
// start/stop text shader drawing
//

function textShaderDrawStart(view)
{
    view.gl.useProgram(this.shader.program);

        // setup the uniforms
        
    view.gl.uniformMatrix4fv(this.orthoMatrixUniform,false,view.orthoMatrix);
    
        // enable the vertex attributes
        
    view.gl.enableVertexAttribArray(this.vertexPositionAttribute);
    view.gl.enableVertexAttribArray(this.vertexUVAttribute);
}

function textShaderDrawEnd(view)
{
        // disable vertex attributes
        
    view.gl.disableVertexAttribArray(this.vertexPositionAttribute);
    view.gl.disableVertexAttribArray(this.vertexUVAttribute);
    
        // no longer using program
        
    view.gl.useProgram(null);
}

//
// text shader object
//

function textShaderObject()
{
    this.shader=null;

    this.vertexPositionAttribute=null;
    this.vertexUVAttribute=null;

    this.orthoMatrixUniform=null;
    this.colorUniform=null;

    this.initialize=textShaderInitialize;
    this.release=textShaderRelease;
    this.drawStart=textShaderDrawStart;
    this.drawEnd=textShaderDrawEnd;
}