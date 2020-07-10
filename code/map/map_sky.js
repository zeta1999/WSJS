//
// sky class
//

export default class MapSkyClass
{
    constructor(core)
    {
        this.core=core;
        
        this.on=false;
        this.size=0;
        this.bitmap=null;

        this.vertexBuffer=null;
        this.uvBuffer=null;
        
            // this is vertexes and UVs for a globe
            
        this.vertexes=new Float32Array([
            0,1,0,0,0.92388,-0.382683,0.270598,0.92388,-0.270598,
            0,0.382684,-0.923879,0.5,0.707107,-0.5,0,0.707107,-0.707107,
            0,-0.382683,-0.923879,0.707107,0,-0.707107,0,0,-1,
            0,-0.707107,-0.707107,0.270598,-0.92388,-0.270598,0.5,-0.707107,-0.5,
            0,0.707107,-0.707107,0.270598,0.92388,-0.270598,0,0.92388,-0.382683,
            0,0.382684,-0.923879,0.707107,0,-0.707107,0.653281,0.382684,-0.653282,
            0,-0.382683,-0.923879,0.5,-0.707107,-0.5,0.653281,-0.382683,-0.653282,
            0,-0.92388,-0.382683,0,-1,0,0.270598,-0.92388,-0.270598,
            0.270598,0.92388,-0.270598,0.707107,0.707107,0,0.382683,0.92388,0,
            0.707107,0,-0.707107,0.923879,0.382684,0,0.653281,0.382684,-0.653282,
            0.5,-0.707107,-0.5,0.923879,-0.382683,0,0.653281,-0.382683,-0.653282,
            0.270598,-0.92388,-0.270598,0,-1,0,0.382683,-0.92388,0,
            0,1,0,0.270598,0.92388,-0.270598,0.382683,0.92388,0,
            0.653281,0.382684,-0.653282,0.707107,0.707107,0,0.5,0.707107,-0.5,
            0.653281,-0.382683,-0.653282,1,0,0,0.707107,0,-0.707107,
            0.270598,-0.92388,-0.270598,0.707107,-0.707107,0,0.5,-0.707107,-0.5,
            1,0,0,0.653281,0.382684,0.653281,0.923879,0.382684,0,
            0.707107,-0.707107,0,0.653281,-0.382683,0.653281,0.923879,-0.382683,0,
            0.382683,-0.92388,0,0,-1,0,0.270598,-0.92388,0.270598,
            0,1,0,0.382683,0.92388,0,0.270598,0.92388,0.270598,
            0.923879,0.382684,0,0.5,0.707107,0.5,0.707107,0.707107,0,
            0.923879,-0.382683,0,0.707107,0,0.707106,1,0,0,
            0.382683,-0.92388,0,0.5,-0.707107,0.5,0.707107,-0.707107,0,
            0.707107,0.707107,0,0.270598,0.92388,0.270598,0.382683,0.92388,0,
            0,1,0,0.270598,0.92388,0.270598,0,0.92388,0.382683,
            0.5,0.707107,0.5,0,0.382684,0.923879,0,0.707107,0.707106,
            0.653281,-0.382683,0.653281,0,0,1,0.707107,0,0.707106,
            0.270598,-0.92388,0.270598,0,-0.707107,0.707106,0.5,-0.707107,0.5,
            0.5,0.707107,0.5,0,0.92388,0.382683,0.270598,0.92388,0.270598,
            0.707107,0,0.707106,0,0.382684,0.923879,0.653281,0.382684,0.653281,
            0.5,-0.707107,0.5,0,-0.382683,0.923879,0.653281,-0.382683,0.653281,
            0.270598,-0.92388,0.270598,0,-1,0,0,-0.92388,0.382683,
            0,0,1,-0.653281,-0.382683,0.653281,-0.707107,0,0.707106,
            0,-0.707107,0.707106,-0.270598,-0.92388,0.270598,-0.5,-0.707107,0.5,
            0,0.707107,0.707106,-0.270598,0.92388,0.270598,0,0.92388,0.382683,
            0,0,1,-0.653281,0.382684,0.653281,0,0.382684,0.923879,
            0,-0.707107,0.707106,-0.653281,-0.382683,0.653281,0,-0.382683,0.923879,
            0,-0.92388,0.382683,0,-1,0,-0.270598,-0.92388,0.270598,
            0,1,0,0,0.92388,0.382683,-0.270598,0.92388,0.270598,
            0,0.707107,0.707106,-0.653281,0.382684,0.653281,-0.5,0.707107,0.5,
            -0.5,0.707107,0.5,-0.382683,0.92388,0,-0.270598,0.92388,0.270598,
            -0.707107,0,0.707106,-0.923879,0.382684,0,-0.653281,0.382684,0.653281,
            -0.5,-0.707107,0.5,-0.923879,-0.382683,0,-0.653281,-0.382683,0.653281,
            -0.270598,-0.92388,0.270598,0,-1,0,-0.382683,-0.92388,0,
            0,1,0,-0.270598,0.92388,0.270598,-0.382683,0.92388,0,
            -0.653281,0.382684,0.653281,-0.707107,0.707107,0,-0.5,0.707107,0.5,
            -0.707107,0,0.707106,-0.923879,-0.382683,0,-1,0,0,
            -0.270598,-0.92388,0.270598,-0.707107,-0.707107,0,-0.5,-0.707107,0.5,
            -0.707107,-0.707107,0,-0.653281,-0.382683,-0.653281,-0.923879,-0.382683,0,
            -0.382683,-0.92388,0,0,-1,0,-0.270598,-0.92388,-0.270598,
            0,1,0,-0.382683,0.92388,0,-0.270598,0.92388,-0.270598,
            -0.707107,0.707107,0,-0.653281,0.382684,-0.653281,-0.5,0.707107,-0.5,
            -1,0,0,-0.653281,-0.382683,-0.653281,-0.707107,0,-0.707107,
            -0.382683,-0.92388,0,-0.5,-0.707107,-0.5,-0.707107,-0.707107,0,
            -0.382683,0.92388,0,-0.5,0.707107,-0.5,-0.270598,0.92388,-0.270598,
            -1,0,0,-0.653281,0.382684,-0.653281,-0.923879,0.382684,0,
            0,1,0,-0.270598,0.92388,-0.270598,0,0.92388,-0.382683,
            -0.653281,0.382684,-0.653281,0,0.707107,-0.707107,-0.5,0.707107,-0.5,
            -0.653281,-0.382683,-0.653281,0,0,-1,-0.707107,0,-0.707107,
            -0.270598,-0.92388,-0.270598,0,-0.707107,-0.707107,-0.5,-0.707107,-0.5,
            -0.5,0.707107,-0.5,0,0.92388,-0.382683,-0.270598,0.92388,-0.270598,
            -0.707107,0,-0.707107,0,0.382684,-0.923879,-0.653281,0.382684,-0.653281,
            -0.5,-0.707107,-0.5,0,-0.382683,-0.923879,-0.653281,-0.382683,-0.653281,
            -0.270598,-0.92388,-0.270598,0,-1,0,0,-0.92388,-0.382683,
            0,0.382684,-0.923879,0.653281,0.382684,-0.653282,0.5,0.707107,-0.5,
            0,-0.382683,-0.923879,0.653281,-0.382683,-0.653282,0.707107,0,-0.707107,
            0,-0.707107,-0.707107,0,-0.92388,-0.382683,0.270598,-0.92388,-0.270598,
            0,0.707107,-0.707107,0.5,0.707107,-0.5,0.270598,0.92388,-0.270598,
            0,0.382684,-0.923879,0,0,-1,0.707107,0,-0.707107,
            0,-0.382683,-0.923879,0,-0.707107,-0.707107,0.5,-0.707107,-0.5,
            0.270598,0.92388,-0.270598,0.5,0.707107,-0.5,0.707107,0.707107,0,
            0.707107,0,-0.707107,1,0,0,0.923879,0.382684,0,
            0.5,-0.707107,-0.5,0.707107,-0.707107,0,0.923879,-0.382683,0,
            0.653281,0.382684,-0.653282,0.923879,0.382684,0,0.707107,0.707107,0,
            0.653281,-0.382683,-0.653282,0.923879,-0.382683,0,1,0,0,
            0.270598,-0.92388,-0.270598,0.382683,-0.92388,0,0.707107,-0.707107,0,
            1,0,0,0.707107,0,0.707106,0.653281,0.382684,0.653281,
            0.707107,-0.707107,0,0.5,-0.707107,0.5,0.653281,-0.382683,0.653281,
            0.923879,0.382684,0,0.653281,0.382684,0.653281,0.5,0.707107,0.5,
            0.923879,-0.382683,0,0.653281,-0.382683,0.653281,0.707107,0,0.707106,
            0.382683,-0.92388,0,0.270598,-0.92388,0.270598,0.5,-0.707107,0.5,
            0.707107,0.707107,0,0.5,0.707107,0.5,0.270598,0.92388,0.270598,
            0.5,0.707107,0.5,0.653281,0.382684,0.653281,0,0.382684,0.923879,
            0.653281,-0.382683,0.653281,0,-0.382683,0.923879,0,0,1,
            0.270598,-0.92388,0.270598,0,-0.92388,0.382683,0,-0.707107,0.707106,
            0.5,0.707107,0.5,0,0.707107,0.707106,0,0.92388,0.382683,
            0.707107,0,0.707106,0,0,1,0,0.382684,0.923879,
            0.5,-0.707107,0.5,0,-0.707107,0.707106,0,-0.382683,0.923879,
            0,0,1,0,-0.382683,0.923879,-0.653281,-0.382683,0.653281,
            0,-0.707107,0.707106,0,-0.92388,0.382683,-0.270598,-0.92388,0.270598,
            0,0.707107,0.707106,-0.5,0.707107,0.5,-0.270598,0.92388,0.270598,
            0,0,1,-0.707107,0,0.707106,-0.653281,0.382684,0.653281,
            0,-0.707107,0.707106,-0.5,-0.707107,0.5,-0.653281,-0.382683,0.653281,
            0,0.707107,0.707106,0,0.382684,0.923879,-0.653281,0.382684,0.653281,
            -0.5,0.707107,0.5,-0.707107,0.707107,0,-0.382683,0.92388,0,
            -0.707107,0,0.707106,-1,0,0,-0.923879,0.382684,0,
            -0.5,-0.707107,0.5,-0.707107,-0.707107,0,-0.923879,-0.382683,0,
            -0.653281,0.382684,0.653281,-0.923879,0.382684,0,-0.707107,0.707107,0,
            -0.707107,0,0.707106,-0.653281,-0.382683,0.653281,-0.923879,-0.382683,0,
            -0.270598,-0.92388,0.270598,-0.382683,-0.92388,0,-0.707107,-0.707107,0,
            -0.707107,-0.707107,0,-0.5,-0.707107,-0.5,-0.653281,-0.382683,-0.653281,
            -0.707107,0.707107,0,-0.923879,0.382684,0,-0.653281,0.382684,-0.653281,
            -1,0,0,-0.923879,-0.382683,0,-0.653281,-0.382683,-0.653281,
            -0.382683,-0.92388,0,-0.270598,-0.92388,-0.270598,-0.5,-0.707107,-0.5,
            -0.382683,0.92388,0,-0.707107,0.707107,0,-0.5,0.707107,-0.5,
            -1,0,0,-0.707107,0,-0.707107,-0.653281,0.382684,-0.653281,
            -0.653281,0.382684,-0.653281,0,0.382684,-0.923879,0,0.707107,-0.707107,
            -0.653281,-0.382683,-0.653281,0,-0.382683,-0.923879,0,0,-1,
            -0.270598,-0.92388,-0.270598,0,-0.92388,-0.382683,0,-0.707107,-0.707107,
            -0.5,0.707107,-0.5,0,0.707107,-0.707107,0,0.92388,-0.382683,
            -0.707107,0,-0.707107,0,0,-1,0,0.382684,-0.923879,
            -0.5,-0.707107,-0.5,0,-0.707107,-0.707107,0,-0.382683,-0.923879
        ]);

        this.uvs=new Float32Array([
            0.6875,0,0.75,0.125,0.625,0.125,
            0.75,0.375,0.625,0.25,0.75,0.25,
            0.75,0.625,0.625,0.5,0.75,0.5,
            0.75,0.75,0.625,0.875,0.625,0.75,
            0.75,0.25,0.625,0.125,0.75,0.125,
            0.75,0.375,0.625,0.5,0.625,0.375,
            0.75,0.625,0.625,0.75,0.625,0.625,
            0.75,0.875,0.6875,1,0.625,0.875,
            0.625,0.125,0.5,0.25,0.5,0.125,
            0.625,0.5,0.5,0.375,0.625,0.375,
            0.625,0.75,0.5,0.625,0.625,0.625,
            0.625,0.875,0.5625,1,0.5,0.875,
            0.5625,0,0.625,0.125,0.5,0.125,
            0.625,0.375,0.5,0.25,0.625,0.25,
            0.625,0.625,0.5,0.5,0.625,0.5,
            0.625,0.875,0.5,0.75,0.625,0.75,
            0.5,0.5,0.375,0.375,0.5,0.375,
            0.5,0.75,0.375,0.625,0.5,0.625,
            0.5,0.875,0.4375,1,0.375,0.875,
            0.4375,0,0.5,0.125,0.375,0.125,
            0.5,0.375,0.375,0.25,0.5,0.25,
            0.5,0.625,0.375,0.5,0.5,0.5,
            0.5,0.875,0.375,0.75,0.5,0.75,
            0.5,0.25,0.375,0.125,0.5,0.125,
            0.3125,0,0.375,0.125,0.25,0.125,
            0.375,0.25,0.25,0.375,0.25,0.25,
            0.375,0.625,0.25,0.5,0.375,0.5,
            0.375,0.875,0.25,0.75,0.375,0.75,
            0.375,0.25,0.25,0.125,0.375,0.125,
            0.375,0.5,0.25,0.375,0.375,0.375,
            0.375,0.75,0.25,0.625,0.375,0.625,
            0.375,0.875,0.3125,1,0.25,0.875,
            0.25,0.5,0.125,0.625,0.125,0.5,
            0.25,0.75,0.125,0.875,0.125,0.75,
            0.25,0.25,0.125,0.125,0.25,0.125,
            0.25,0.5,0.125,0.375,0.25,0.375,
            0.25,0.75,0.125,0.625,0.25,0.625,
            0.25,0.875,0.1875,1,0.125,0.875,
            0.1875,0,0.25,0.125,0.125,0.125,
            0.25,0.25,0.125,0.375,0.125,0.25,
            0.125,0.25,0,0.125,0.125,0.125,
            0.125,0.5,0,0.375,0.125,0.375,
            0.125,0.75,0,0.625,0.125,0.625,
            0.125,0.875,0.0625,1,0,0.875,
            0.0625,0,0.125,0.125,0,0.125,
            0.125,0.375,0,0.25,0.125,0.25,
            0.125,0.5,0,0.625,0,0.5,
            0.125,0.875,0,0.75,0.125,0.75,
            1,0.75,0.875,0.625,1,0.625,
            1,0.875,0.9375,1,0.875,0.875,
            0.9375,0,1,0.125,0.875,0.125,
            1,0.25,0.875,0.375,0.875,0.25,
            1,0.5,0.875,0.625,0.875,0.5,
            1,0.875,0.875,0.75,1,0.75,
            1,0.125,0.875,0.25,0.875,0.125,
            1,0.5,0.875,0.375,1,0.375,
            0.8125,0,0.875,0.125,0.75,0.125,
            0.875,0.375,0.75,0.25,0.875,0.25,
            0.875,0.625,0.75,0.5,0.875,0.5,
            0.875,0.875,0.75,0.75,0.875,0.75,
            0.875,0.25,0.75,0.125,0.875,0.125,
            0.875,0.5,0.75,0.375,0.875,0.375,
            0.875,0.75,0.75,0.625,0.875,0.625,
            0.875,0.875,0.8125,1,0.75,0.875,
            0.75,0.375,0.625,0.375,0.625,0.25,
            0.75,0.625,0.625,0.625,0.625,0.5,
            0.75,0.75,0.75,0.875,0.625,0.875,
            0.75,0.25,0.625,0.25,0.625,0.125,
            0.75,0.375,0.75,0.5,0.625,0.5,
            0.75,0.625,0.75,0.75,0.625,0.75,
            0.625,0.125,0.625,0.25,0.5,0.25,
            0.625,0.5,0.5,0.5,0.5,0.375,
            0.625,0.75,0.5,0.75,0.5,0.625,
            0.625,0.375,0.5,0.375,0.5,0.25,
            0.625,0.625,0.5,0.625,0.5,0.5,
            0.625,0.875,0.5,0.875,0.5,0.75,
            0.5,0.5,0.375,0.5,0.375,0.375,
            0.5,0.75,0.375,0.75,0.375,0.625,
            0.5,0.375,0.375,0.375,0.375,0.25,
            0.5,0.625,0.375,0.625,0.375,0.5,
            0.5,0.875,0.375,0.875,0.375,0.75,
            0.5,0.25,0.375,0.25,0.375,0.125,
            0.375,0.25,0.375,0.375,0.25,0.375,
            0.375,0.625,0.25,0.625,0.25,0.5,
            0.375,0.875,0.25,0.875,0.25,0.75,
            0.375,0.25,0.25,0.25,0.25,0.125,
            0.375,0.5,0.25,0.5,0.25,0.375,
            0.375,0.75,0.25,0.75,0.25,0.625,
            0.25,0.5,0.25,0.625,0.125,0.625,
            0.25,0.75,0.25,0.875,0.125,0.875,
            0.25,0.25,0.125,0.25,0.125,0.125,
            0.25,0.5,0.125,0.5,0.125,0.375,
            0.25,0.75,0.125,0.75,0.125,0.625,
            0.25,0.25,0.25,0.375,0.125,0.375,
            0.125,0.25,0,0.25,0,0.125,
            0.125,0.5,0,0.5,0,0.375,
            0.125,0.75,0,0.75,0,0.625,
            0.125,0.375,0,0.375,0,0.25,
            0.125,0.5,0.125,0.625,0,0.625,
            0.125,0.875,0,0.875,0,0.75,
            1,0.75,0.875,0.75,0.875,0.625,
            1,0.25,1,0.375,0.875,0.375,
            1,0.5,1,0.625,0.875,0.625,
            1,0.875,0.875,0.875,0.875,0.75,
            1,0.125,1,0.25,0.875,0.25,
            1,0.5,0.875,0.5,0.875,0.375,
            0.875,0.375,0.75,0.375,0.75,0.25,
            0.875,0.625,0.75,0.625,0.75,0.5,
            0.875,0.875,0.75,0.875,0.75,0.75,
            0.875,0.25,0.75,0.25,0.75,0.125,
            0.875,0.5,0.75,0.5,0.75,0.375,
            0.875,0.75,0.75,0.75,0.75,0.625
        ]);

        this.trigCount=Math.trunc(this.vertexes.length/3);
        
        Object.seal(this);
    }
    
        //
        // initialize/release interface
        //

    initialize()
    {
        let gl=this.core.gl;
        
            // build the globe vertex and uv buffers
            
        this.vertexBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.vertexes,gl.STATIC_DRAW);

        this.uvBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.uvs,gl.STATIC_DRAW);
        
        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        
        return(true);
    }

    release()
    {
        let gl=this.core.gl;

        gl.deleteBuffer(this.vertexBuffer);
        gl.deleteBuffer(this.uvBuffer);
    }
    
        //
        // draw
        //

    draw()
    {
        let gl=this.core.gl;
        let shader=this.core.shaderList.mapSkyShader;
        
        if (!this.on) return;
        
            // setup shader

        shader.drawStart();
        
            // the sky texture
            
        this.bitmap.attach(shader);
        
        gl.disable(gl.DEPTH_TEST);

        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
        gl.vertexAttribPointer(shader.vertexPositionAttribute,3,gl.FLOAT,false,0,0);
        
        gl.bindBuffer(gl.ARRAY_BUFFER,this.uvBuffer);
        gl.vertexAttribPointer(shader.vertexUVAttribute,2,gl.FLOAT,false,0,0);
            
        gl.drawArrays(gl.TRIANGLES,0,this.trigCount);

        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        
            // end shader
            
        shader.drawEnd();

        gl.enable(gl.DEPTH_TEST);
    }
    
}

