"use strict";

//
// generate machine bitmap class
//

class GenBitmapMachineClass extends GenBitmapClass
{
    constructor()
    {
        super();
        
            // types
            
        this.TYPE_COMPUTER=0;

        this.TYPE_NAMES=
                [
                    'Computer'
                ];
        
        Object.seal(this);
    }
    
        //
        // machine
        //
    
    generateComputerComponent(bitmapCTX,normalCTX,lft,top,rgt,bot,metalInsideColor)
    {
        var x,y,xCount,yCount,xOff,yOff,dx,dy,wid;
        var color,panelType;
        var n,nShutter,shutterSize,yAdd,shutterColor,shutterEdgeColor;
        var borderColor=new wsColor(0.0,0.0,0.0);
        
            // the plate of the component
            
        this.draw3DRect(bitmapCTX,normalCTX,lft,top,rgt,bot,5,metalInsideColor,false);
        
            // panel looks
        
        panelType=genRandom.randomIndex(4);
        if (panelType===0) return;          // 0 = none
        
            // shutter panels
            
        if (panelType===3) {
            lft+=5;
            rgt-=5;
            top+=5;
            bot-=5;
            
            shutterColor=this.getRandomColor();
            shutterEdgeColor=this.darkenColor(shutterColor,0.9);
            
            this.drawRect(bitmapCTX,lft,top,rgt,bot,shutterColor);
            
            nShutter=Math.trunc((bot-top)/30);

            yAdd=(bot-top)/nShutter;
            y=top+Math.trunc(yAdd/2);
            
            shutterSize=genRandom.randomInt(5,Math.trunc(yAdd*0.2));

            for (n=0;n!==nShutter;n++) {
                this.drawSlope(bitmapCTX,normalCTX,lft,y,rgt,(y+shutterSize),shutterEdgeColor,false);
                y+=yAdd;
            }
            
            return;
        }
        
            // circle or square lights
        
        wid=genRandom.randomInt(30,25);
        
        xCount=Math.trunc((rgt-lft)/wid)-1;
        yCount=Math.trunc((bot-top)/wid)-1;
        
        if ((xCount<=0) || (yCount<=0)) return;
        if (xCount>10) xCount=10;
        if (yCount>10) yCount=10;
        
        xOff=(lft+2)+Math.trunc(((rgt-lft)-(xCount*wid))/2);
        yOff=(top+2)+Math.trunc(((bot-top)-(yCount*wid))/2);
        
        for (y=0;y!==yCount;y++) {
            dy=yOff+(y*wid);
            
            for (x=0;x!==xCount;x++) {
                dx=xOff+(x*wid);
                color=this.getRandomColor();
                
                if (panelType===1) {
                    this.draw3DOval(bitmapCTX,normalCTX,dx,dy,(dx+(wid-5)),(dy+(wid-5)),0.0,1.0,3,0,color,borderColor);
                }
                else {
                    this.draw3DRect(bitmapCTX,normalCTX,dx,dy,(dx+wid),(dy+wid),2,color,false);
                }
            }
        }
    }
    
    generateComputer(bitmapCTX,normalCTX,specularCTX,wid,high)
    {
        var mx,my,sz,lft,top,rgt,bot;
        
        var metalColor=this.getDefaultPrimaryColor();
        var metalInsideColor=this.boostColor(metalColor,0.1);
       
            // face plate
            
        this.draw3DRect(bitmapCTX,normalCTX,0,0,wid,high,8,metalColor,true);
        
            // inside components
            // these are stacks of vertical or horizontal chunks
            
        mx=15;
        my=15;
        
        while (true) {
            
            lft=mx;
            top=my;
            sz=genRandom.randomInt(100,50);
            
                // vertical stack
                
            if (genRandom.randomPercentage(0.5)) {
                rgt=lft+sz;
                if (rgt>(wid-15)) rgt=wid-15;
                bot=high-15;
                
                mx+=(sz+5);
            }
            
                // horizontal stack
                
            else {
                bot=top+sz;
                if (bot>(high-15)) bot=high-15;
                rgt=wid-15;
                
                my+=(sz+5);
            }
            
                // draw the segment
            
            this.generateComputerComponent(bitmapCTX,normalCTX,lft,top,rgt,bot,metalInsideColor);
            
                // are we finished?
                
            if ((mx>=(wid-15)) || (my>=(high-15))) break;
        }
        
            // finish with the specular

        this.createSpecularMap(bitmapCTX,specularCTX,wid,high,0.4);
    }

        //
        // generate mainline
        //

    generate(generateType,inDebug)
    {
        var wid,high,segments;
        var shineFactor=1.0;
        var bitmapCanvas,bitmapCTX,normalCanvas,normalCTX,specularCanvas,specularCTX;

            // setup the canvas

        bitmapCanvas=document.createElement('canvas');
        bitmapCanvas.width=GEN_BITMAP_MAP_TEXTURE_SIZE;
        bitmapCanvas.height=GEN_BITMAP_MAP_TEXTURE_SIZE;
        bitmapCTX=bitmapCanvas.getContext('2d');

        normalCanvas=document.createElement('canvas');
        normalCanvas.width=GEN_BITMAP_MAP_TEXTURE_SIZE;
        normalCanvas.height=GEN_BITMAP_MAP_TEXTURE_SIZE;
        normalCTX=normalCanvas.getContext('2d');

        specularCanvas=document.createElement('canvas');
        specularCanvas.width=GEN_BITMAP_MAP_TEXTURE_SIZE;
        specularCanvas.height=GEN_BITMAP_MAP_TEXTURE_SIZE;
        specularCTX=specularCanvas.getContext('2d');

        wid=bitmapCanvas.width;
        high=bitmapCanvas.height;

            // create the bitmap

        switch (generateType) {

            case this.TYPE_COMPUTER:
                this.generateComputer(bitmapCTX,normalCTX,specularCTX,wid,high);
                shineFactor=2.0;
                break;

        }

            // debug just displays the canvases, so send
            // them back
        
        if (inDebug) return({bitmap:bitmapCanvas,normal:normalCanvas,specular:specularCanvas});
        
            // otherwise, create the wenGL
            // bitmap object

        return(new BitmapClass(bitmapCanvas,normalCanvas,specularCanvas,[(1.0/4000.0),(1.0/4000.0)],shineFactor));    
    }
    
    generateRandom(inDebug)
    {
        return(this.generate(genRandom.randomIndex(this.TYPE_NAMES.length),inDebug));
    }

}