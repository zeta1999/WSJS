import ColorClass from '../../code/utility/color.js';
import InterfaceElementClass from '../interface/interface_element.js';
import InterfaceTextClass from '../interface/interface_text.js';

//
// interface class
//

export default class InterfaceClass
{
    constructor(core)
    {
        this.core=core;
        
        this.elements=new Map();
        this.texts=new Map();
            
        this.uiTextColor=new ColorClass(1,1,0);
        
        this.tintVertexArray=new Float32Array(2*6);     // 2D, only 2 vertex coordinates
        this.tintVertexBuffer=null;
        this.tintColor=new ColorClass(0,0,0);
        
        Object.seal(this);
    }
    
        //
        // initialize/release interface
        //

    initialize()
    {
        let gl=this.core.gl;
        
            // clear all current elements and texts
            
        this.elements.clear();
        this.texts.clear();
        
            // create the static font texture
            
        InterfaceTextClass.createStaticFontTexture(this.core.gl);
        
            // tint vertexes
            // (two triangles)
            
        this.tintVertexArray[0]=0;
        this.tintVertexArray[1]=0;
        this.tintVertexArray[2]=this.core.wid;
        this.tintVertexArray[3]=0;
        this.tintVertexArray[4]=this.core.wid;
        this.tintVertexArray[5]=this.core.high;
        
        this.tintVertexArray[6]=0;
        this.tintVertexArray[7]=0;
        this.tintVertexArray[8]=this.core.wid;
        this.tintVertexArray[9]=this.core.high;
        this.tintVertexArray[10]=0;
        this.tintVertexArray[11]=this.core.high;
            
        this.tintVertexBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.tintVertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.tintVertexArray,gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER,null);

        return(true);
    }

    release()
    {
        let element,text;
        
            // release tint
            
        this.core.gl.deleteBuffer(this.tintVertexBuffer);
        
            // release all elements and texts
            
        for (element of this.elements) {
            element.release();
        }
        
        for (text of this.texts) {
            text.release();
        }
        
            // and the static font texture
            
        InterfaceTextClass.deleteStaticFontTexture(this.core.gl);
    }
    
        //
        // add interface chunks
        //
        
    addElement(id,bitmap,uvOffset,uvSize,rect,color,alpha)
    {
        let element=new InterfaceElementClass(this.core,bitmap,uvOffset,uvSize,rect,color,alpha);
        
        element.initialize();
        this.elements.set(id,element);
    }
    
    addText(id,str,x,y,fontSize,align,color,alpha)
    {
        let text=new InterfaceTextClass(this.core,str,x,y,fontSize,align,color,alpha);
        
        text.initialize();
        this.texts.set(id,text);
    }
    
    updateText(id,str)
    {
        this.texts.get(id).str=str;
    }
    
        //
        // drawing
        //
        
    drawTint()
    {
        let tintOn,tintAtt,liquidIdx,liquid;
        let player=this.core.map.entityList.getPlayer();
        let shader=this.core.shaderList.tintShader;
        let gl=this.core.gl;
        
            // setup tint
            
        tintOn=false;
        this.tintColor.setFromValues(0.0,0.0,0.0);
        
        tintAtt=player.getDamageTintAttenuation();
        if (tintAtt!==0.0) {
            tintOn=true;
            this.tintColor.addFromValues(tintAtt,0.0,0.0);
        }
        
        liquidIdx=player.getUnderLiquidIndex();
        if (liquidIdx!==-1) {
            tintOn=true;
            liquid=this.core.map.liquidList.liquids[liquidIdx];
            this.tintColor.addFromValues(liquid.tint.r,liquid.tint.g,liquid.tint.b);
        }
        
        if (!tintOn) return;
        
            // draw tint
            
        gl.blendFunc(gl.ONE,gl.ONE);
        
        shader.drawStart();
        
        this.tintColor.fixOverflow();
        gl.uniform4f(shader.colorUniform,this.tintColor.r,this.tintColor.g,this.tintColor.b,1.0);
        
            // setup the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,this.tintVertexBuffer);
        gl.vertexAttribPointer(shader.vertexPositionAttribute,2,gl.FLOAT,false,0,0);
        
            // draw the quad
            
        gl.drawArrays(gl.TRIANGLES,0,6);

            // remove the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        
        shader.drawEnd();
    }

    draw()
    {
        let key,element,text;
        let gl=this.core.gl;
        
        gl.disable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        
            // tinting
        
        this.drawTint();
            
            // elements
            
        gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
            
        this.core.shaderList.interfaceShader.drawStart();
        
        for ([key,element] of this.elements) {
            element.draw();
        }
        
        this.core.shaderList.interfaceShader.drawEnd();
        
            // text
            
        this.core.shaderList.textShader.drawStart();
        
        for ([key,text] of this.texts) {
            text.draw();
        }
        
        this.core.shaderList.textShader.drawEnd();

        gl.disable(gl.BLEND);
        gl.enable(gl.DEPTH_TEST);
    }
    
        //
        // special core drawing
        // note: none of these are optimized, this is
        // debug stuff only, it'll be slow
        //
        
    drawDebugConsole(consoleStrings)
    {
        let n,y,col,text;
        let nLine=consoleStrings.length;
        let gl=this.core.gl;
        
        gl.disable(gl.DEPTH_TEST);

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);

        this.core.shaderList.textShader.drawStart();
        
        y=(this.core.high-5)-((nLine-1)*22);
        col=new ColorClass(1.0,1.0,1.0);
        
        for (n=0;n!==nLine;n++) {
            if (n===(nLine-1)) col=new ColorClass(1,0.3,0.3);
            text=new InterfaceTextClass(this.core,consoleStrings[n],5,y,20,InterfaceTextClass.TEXT_ALIGN_LEFT,col,1);
            text.initialize();
            text.draw();
            text.release();
            
            y+=22;
        }
        
        this.core.shaderList.textShader.drawEnd();

        gl.disable(gl.BLEND);
        gl.enable(gl.DEPTH_TEST);
    }
        
    drawPauseMessage()
    {
        let text;
        let x=Math.trunc(this.core.wid*0.5);
        let y=Math.trunc(this.core.high*0.5);
        let gl=this.core.gl;
        
        gl.disable(gl.DEPTH_TEST);

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);

        this.core.shaderList.textShader.drawStart();
        
        text=new InterfaceTextClass(this.core,'Paused',x,(y-20),48,InterfaceTextClass.TEXT_ALIGN_CENTER,this.uiTextColor,1);
        text.initialize();
        text.draw();
        text.release();
        
        text=new InterfaceTextClass(this.core,'click to start - esc to pause',x,(y+20),36,InterfaceTextClass.TEXT_ALIGN_CENTER,this.uiTextColor,1);
        text.initialize();
        text.draw();
        text.release();
        
        this.core.shaderList.textShader.drawEnd();

        gl.disable(gl.BLEND);
        gl.enable(gl.DEPTH_TEST);
    }
}
