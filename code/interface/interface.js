import ColorClass from '../utility/color.js';
import RectClass from '../../../code/utility/rect.js';
import InterfaceElementClass from '../interface/interface_element.js';
import InterfaceTextClass from '../interface/interface_text.js';
import TouchStickClass from '../interface/interface_touch_stick.js';

//
// interface class
//

export default class InterfaceClass
{
    constructor(core)
    {
        this.TEXT_TEXTURE_WIDTH=512;
        this.TEXT_TEXTURE_HEIGHT=512;
        this.TEXT_CHAR_PER_ROW=10;
        this.TEXT_CHAR_WIDTH=50;
        this.TEXT_CHAR_HEIGHT=50;
        this.TEXT_FONT_NAME='Arial';
        this.TEXT_FONT_SIZE=48;
        
        this.TEXT_ALIGN_LEFT=0;
        this.TEXT_ALIGN_CENTER=1;
        this.TEXT_ALIGN_RIGHT=2;
        
        this.TEXT_ALIGN_LIST=['left','center','right'];
        
        this.POSITION_MODE_TOP_LEFT=0;
        this.POSITION_MODE_TOP_RIGHT=1;
        this.POSITION_MODE_BOTTOM_LEFT=2;
        this.POSITION_MODE_BOTTOM_RIGHT=3;
        this.POSITION_MODE_MIDDLE=4;
        
        this.POSITION_MODE_LIST=['topLeft','topRight','bottomLeft','bottomRight','middle'];
        
        this.core=core;
        
        this.elements=new Map();
        this.texts=new Map();
            
        this.uiTextColor=new ColorClass(1,1,0);
        
        this.tintVertexArray=new Float32Array(2*6);     // 2D, only 2 vertex coordinates
        this.tintVertexBuffer=null;
        this.tintColor=new ColorClass(0,0,0);
        
        this.fontTexture=null;
        this.fontCharWidths=new Float32Array(128);
        
        this.touchStickLeft=null;
        this.touchStickRight=null;
        
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
        
            // create the font texture
            
        this.createFontTexture();
        
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
        
            // touch sticks
            
        this.touchStickLeft=new TouchStickClass(this.core);
        this.touchStickLeft.initialize();
        
        this.touchStickRight=new TouchStickClass(this.core);
        this.touchStickRight.initialize();

        return(true);
    }

    release()
    {
        let element,text;
        
            // release touch sticks
            
        this.touchStickLeft.release();
        this.touchStickRight.release();
        
            // release tint
            
        this.core.gl.deleteBuffer(this.tintVertexBuffer);
        
            // release all elements and texts
            
        for (element of this.elements) {
            element.release();
        }
        
        for (text of this.texts) {
            text.release();
        }
        
            // and the font texture
            
        this.deleteFontTexture();
    }
    
        //
        // build font bitmap
        //
        
    createFontTexture()
    {
        let x,y,yAdd,cIdx,charStr,ch;
        let canvas,ctx;
        let gl=this.core.gl;
        
            // create the text bitmap

        canvas=document.createElement('canvas');
        canvas.width=this.TEXT_TEXTURE_WIDTH;
        canvas.height=this.TEXT_TEXTURE_HEIGHT;
        ctx=canvas.getContext('2d');
        
            // background is black, text is white
            // so it can be colored
            
        ctx.fillStyle='#000000';
        ctx.fillRect(0,0,this.TEXT_TEXTURE_WIDTH,this.TEXT_TEXTURE_HEIGHT);

            // draw the text

        ctx.font=(this.TEXT_FONT_SIZE+'px ')+this.TEXT_FONT_NAME;
        ctx.textAlign='left';
        ctx.textBaseline='middle';
        ctx.fillStyle='#FFFFFF';

        yAdd=Math.trunc(this.TEXT_CHAR_HEIGHT/2);

        for (ch=32;ch!==127;ch++) {
            cIdx=ch-32;
            x=(cIdx%this.TEXT_CHAR_PER_ROW)*this.TEXT_CHAR_WIDTH;
            y=Math.trunc(cIdx/this.TEXT_CHAR_PER_ROW)*this.TEXT_CHAR_HEIGHT;
            y+=yAdd;

            charStr=String.fromCharCode(ch);
            this.fontCharWidths[cIdx]=((ctx.measureText(charStr).width+4)/this.TEXT_CHAR_WIDTH);
            if (this.fontCharWidths[cIdx]>1.0) this.fontCharWidths[cIdx]=1.0;

            ctx.fillText(charStr,(x+2),(y-1));

            x+=this.TEXT_CHAR_WIDTH;
        }

            // finally load into webGL
            
        this.fontTexture=gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D,this.fontTexture);
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,canvas);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D,null);
    }
    
    deleteFontTexture()
    {
        this.core.gl.deleteTexture(this.fontTexture);
    }
    
        //
        // add interface chunks
        //
        
    addElement(id,bitmap,width,height,positionMode,positionOffset,color,alpha)
    {
        let element;
        let rect=new RectClass(positionOffset.x,positionOffset.y,(positionOffset.x+width),(positionOffset.y+height));
        
        switch (positionMode) {
            case this.POSITION_MODE_TOP_RIGHT:
                rect.move(this.core.canvas.width,0);
                break;
            case this.POSITION_MODE_BOTTOM_LEFT:
                rect.move(0,this.core.canvas.height);
                break;
            case this.POSITION_MODE_BOTTOM_RIGHT:
                rect.move(this.core.canvas.width,this.core.canvas.height);
                break;
            case this.POSITION_MODE_MIDDLE:
                rect.move(Math.trunc(this.core.canvas.width*0.5),Math.trunc(this.core.canvas.height*0.5));
                break;
        }
            
        element=new InterfaceElementClass(this.core,bitmap,rect,color,alpha);
        element.initialize();
        this.elements.set(id,element);
    }
    
    showElement(id,show)
    {
        let element=this.elements.get(id);
        if (element===undefined) {
            console.log('Interface element ID does not exist: '+id);
            return;
        }
        
        element.show=show;
    }
    
    pulseElement(id,tick,expand)
    {
        let element=this.elements.get(id);
        if (element===undefined) {
            console.log('Interface element ID does not exist: '+id);
            return;
        }
        
        element.pulse(tick,expand);
    }
    
    addText(id,str,positionMode,positionOffset,fontSize,align,color,alpha)
    {
        let text;
        let x=positionOffset.x;
        let y=positionOffset.y;
        
        switch (positionMode) {
            case this.POSITION_MODE_TOP_RIGHT:
                x+=this.core.canvas.width;
                break;
            case this.POSITION_MODE_BOTTOM_LEFT:
                y+=this.core.canvas.height;
                break;
            case this.POSITION_MODE_BOTTOM_RIGHT:
                x+=this.core.canvas.width;
                y+=this.core.canvas.height;
                break;
            case this.POSITION_MODE_MIDDLE:
                x+=Math.trunc(this.core.canvas.width*0.5);
                y+=Math.trunc(this.core.canvas.height*0.5);
                break;
        }

        text=new InterfaceTextClass(this.core,(''+str),x,y,fontSize,align,color,alpha);
        text.initialize();
        this.texts.set(id,text);
    }
    
    removeText(id)
    {
        let text;
        if (text===undefined) {
            console.log('Interface text ID does not exist: '+id);
            return;
        }
                
        text=this.texts.get(id);
        if (text!==undefined) {
            text.release();
            this.texts.delete(id);
        }
    }
    
    showText(id,show)
    {
        let text=this.texts.get(id);
        if (text===undefined) {
            console.log('Interface text ID does not exist: '+id);
            return;
        }
        
        text.show=show;
        text.hideTick=-1;
    }
    
    updateText(id,str)
    {
        let text=this.texts.get(id);
        if (text===undefined) {
            console.log('Interface text ID does not exist: '+id);
            return;
        }
        
        text.str=''+str;      // make sure it's a string
        text.hideTick=-1;
    }
    
    updateTemporaryText(id,str,tick)
    {
        let text=this.texts.get(id);
        if (text===undefined) {
            console.log('Interface text ID does not exist: '+id);
            return;
        }
        
        text.str=''+str;      // make sure it's a string
        text.show=true;
        text.hideTick=this.core.timestamp+tick;
    }
    
        //
        // drawing
        //
        
    drawTint()
    {
        let player=this.core.map.entityList.getPlayer();
        let shader=this.core.shaderList.tintShader;
        let gl=this.core.gl;
        
            // setup tint
            
        if (!player.getScreenTint(this.tintColor)) return;
        
            // draw tint
            
        gl.blendFunc(gl.ONE,gl.SRC_COLOR);
        
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
        
            // sticks
            
        if (this.core.input.hasTouch) {
            this.core.shaderList.interfaceShader.drawStart();
            
            this.touchStickLeft.draw();
            this.touchStickRight.draw();
            
            this.core.shaderList.interfaceShader.drawEnd();
        }

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
            text=new InterfaceTextClass(this.core,consoleStrings[n],5,y,20,this.TEXT_ALIGN_LEFT,col,1);
            text.initialize();
            text.draw();
            text.release();
            
            y+=22;
        }
        
        this.core.shaderList.textShader.drawEnd();

        gl.disable(gl.BLEND);
        gl.enable(gl.DEPTH_TEST);
    }
}
