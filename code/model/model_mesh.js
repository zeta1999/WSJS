"use strict";

//
// model mesh class
//

function ModelMeshObject(bitmap,vertices,normals,tangents,vertexUVs,boneAttaches,indexes,flag)
{
    this.bitmap=bitmap;
    this.vertices=vertices;
    this.normals=normals;
    this.tangents=tangents;
    this.vertexUVs=vertexUVs;
    this.boneAttaches=boneAttaches;
    this.indexes=indexes;
    this.flag=flag;
    
    this.vertexCount=Math.floor(this.vertices.length/3);
    this.indexCount=this.indexes.length;
    this.trigCount=Math.floor(this.indexCount/3);
    
        // gl buffers
        
    this.vertexPosBuffer=null;
    this.vertexNormalBuffer=null;
    this.vertexTangentBuffer=null;
    this.vertexUVAttribute=null;
    this.indexBuffer=null;
        
        //
        // close model mesh
        //

    this.close=function(view)
    {
        var gl=view.gl;

        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);

        if (this.vertexPosBuffer!==null) gl.deleteBuffer(this.vertexPosBuffer);
        if (this.vertexNormalBuffer!==null) gl.deleteBuffer(this.vertexNormalBuffer);
        if (this.vertexTangentBuffer!==null) gl.deleteBuffer(this.vertexTangentBuffer);
        if (this.vertexUVAttribute!==null) gl.deleteBuffer(this.vertexUVAttribute);

        if (this.indexBuffer!==null) gl.deleteBuffer(this.indexBuffer);
    };
    
        //
        // set vertices to pose and model position
        //
        
    this.updateVertexesToPoseAndPosition=function(view,skeleton,offsetPosition)
    {
        var n,vIdx;
        var bone;
        
            // move all the vertexes
            
        vIdx=0;
        var v2=new Float32Array(this.vertices.length);
        
        for (n=0;n!==this.vertexCount;n++) {
            bone=skeleton.bones[this.boneAttaches[n]];
            
            v2[vIdx]=this.vertices[vIdx]+bone.curPoseVector.x+offsetPosition.x;
            v2[vIdx+1]=this.vertices[vIdx+1]+bone.curPoseVector.y+offsetPosition.y;
            v2[vIdx+2]=this.vertices[vIdx+2]+bone.curPoseVector.z+offsetPosition.z;
            vIdx+=3;
        }
        
            // set the buffers
            
        var gl=view.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexPosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,v2,gl.DYNAMIC_DRAW);
    };

        //
        // model mesh gl binding
        //

    this.setupBuffers=function(view)
    {
            // create all the buffers
            // expects buffers to already be Float32Array
            // or Uint16Array

        var gl=view.gl;

        this.vertexPosBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexPosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.vertices,gl.DYNAMIC_DRAW);

        this.vertexNormalBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.normals,gl.STATIC_DRAW);

        this.vertexTangentBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexTangentBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.tangents,gl.STATIC_DRAW);

        this.vertexUVBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexUVBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.vertexUVs,gl.STATIC_DRAW);

        this.indexBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,this.indexes,gl.STATIC_DRAW);    
    };

    this.bindBuffers=function(view,modelShader)
    {
        var gl=view.gl;

        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexPosBuffer);
        gl.vertexAttribPointer(modelShader.vertexPositionAttribute,3,gl.FLOAT,false,0,0);

        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexNormalBuffer);
        gl.vertexAttribPointer(modelShader.vertexNormalAttribute,3,gl.FLOAT,false,0,0);

        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexTangentBuffer);
        gl.vertexAttribPointer(modelShader.vertexTangentAttribute,3,gl.FLOAT,false,0,0);

        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexUVBuffer);
        gl.vertexAttribPointer(modelShader.vertexUVAttribute,2,gl.FLOAT,false,0,0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);
    };

        //
        // model mesh drawing
        //

    this.draw=function(view)
    {
        var gl=view.gl;

        gl.drawElements(gl.TRIANGLES,this.indexCount,gl.UNSIGNED_SHORT,0);
    };

}
