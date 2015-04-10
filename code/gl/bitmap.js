"use strict";

//
// close bitmaps
//

function bitmapClose()
{
    if (this.texture!==null) gl.deleteTexture(this.texture);
    if (this.normalMap!==null) gl.deleteTexture(this.normalMap);
    if (this.specularMap!==null) gl.deleteTexture(this.specularMap);
}

//
// attaching bitmaps
//

function bitmapAttach(shader)
{
        // shine factor in shader
        
    if (shader!==nul) gl.uniform1f(shader.shineFactorUniform,this.shineFactor);
    
        // the textures
        
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D,this.specularMap);
    
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D,this.normalMap);
    
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D,this.texture);
}

//
// bitmap object
//

function bitmapObject(bitmapId,bitmapCanvas,normalMapCanvas,specularMapCanvas,uvScale,shineFactor)
{
    this.bitmapId=bitmapId;
    this.texture=null;
    this.normalMap=null;
    this.specularMap=null;
    
    this.uvScale=uvScale;
    this.shineFactor=shineFactor;
    
        // setup the texture
        
    this.texture=gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D,this.texture);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,bitmapCanvas);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D,null);
    
        // setup the normal map
    
    if (normalMapCanvas!==null) {
        this.normalMap=gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D,this.normalMap);
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,normalMapCanvas);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D,null);
    }
    
        // setup the specular map
    
    if (specularMapCanvas!==null) {
        this.specularMap=gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D,this.specularMap);
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,specularMapCanvas);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D,null);
    }
    
        // functions
        
    this.close=bitmapClose;
    this.attach=bitmapAttach;
}
