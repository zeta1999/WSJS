import genRandom from '../../generate/utility/random.js';
import GenBitmapBaseClass from '../../generate/bitmap/gen_bitmap_base.js';
import BitmapClass from '../../code/bitmap/bitmap.js';

//
// generate skin bitmap class
//

export default class GenBitmapMonsterClass extends GenBitmapBaseClass
{
    constructor(view)
    {    
        super(view);
        Object.seal(this);
    }
        
        //
        // fur
        //
        
    generateFurChunk(bitmapCTX,normalCTX,lft,top,rgt,bot,furColor)
    {
        let n,x,y;
        let darken,boost,lineColor;
        let wid=rgt-lft;
        let high=bot-top;
        let halfHigh=Math.trunc(high*0.5);

            // hair
            
        for (x=lft;x!==rgt;x++) {
            
                // hair color
                
            if ((n%2)===0) {
                darken=0.5+(genRandom.random()*0.3);
                lineColor=this.darkenColor(furColor,darken);
            }
            else {
                boost=0.1+(genRandom.random()*0.3);
                lineColor=this.boostColor(furColor,boost);
            }
            
                // hair half from top
                
            y=halfHigh+genRandom.randomInt(top,halfHigh);
            this.drawRandomLine(bitmapCTX,normalCTX,x,(top-5),x,(y+5),lft,top,rgt,bot,10,lineColor,false);
            
                // hair half from bottom
                
            y=high-(halfHigh+genRandom.randomInt(top,halfHigh));
            this.drawRandomLine(bitmapCTX,normalCTX,x,(y-5),x,(bot+5),lft,top,rgt,bot,10,lineColor,false);
        }
    }
    
        //
        // leather
        //
        
    generateLeatherChunk(bitmapCTX,normalCTX,lft,top,rgt,bot,clothColor)
    {
        let n,x,x2,y,y2,lineCount;
        let darken,lineColor;
        let wid=rgt-lft;
        let high=bot-top;
         
        this.addNoiseRect(bitmapCTX,lft,top,rgt,bot,0.8,0.9,0.5);        
 
            // lines
            
        lineCount=genRandom.randomInt(30,30);
            
        for (n=0;n!==lineCount;n++) {
            x=genRandom.randomInt(lft,wid);
            y=genRandom.randomInt(top,high);
            y2=genRandom.randomInt(top,high);
            
            darken=0.6+(genRandom.random()*0.25);
            lineColor=this.darkenColor(clothColor,darken);
            
            this.drawRandomLine(bitmapCTX,normalCTX,x,y,x,y2,lft,top,rgt,bot,30,lineColor,false);
        }
        
        lineCount=genRandom.randomInt(30,30);
            
        for (n=0;n!==lineCount;n++) {
            x=genRandom.randomInt(lft,wid);
            x2=genRandom.randomInt(lft,wid);
            y=genRandom.randomInt(top,high);
            
            darken=0.6+(genRandom.random()*0.25);
            lineColor=this.darkenColor(clothColor,darken);
            
            this.drawRandomLine(bitmapCTX,normalCTX,x,y,x2,y,lft,top,rgt,bot,30,lineColor,false);
        }
        
            // blur it
            
        this.blur(bitmapCTX,lft,top,rgt,bot,25,false);
    }
    
        //
        // scales
        //
        
    generateScaleChunk(bitmapCTX,normalCTX,lft,top,rgt,bot,skinColor,scaleCount)
    {
        let x,y,dx,dy,sx,sy,sx2,sy2;
        let xCount,col;

        let borderColor=this.darkenColor(skinColor,0.7);

        let wid=rgt-lft;
        let high=bot-top;
        let sWid=wid/scaleCount;
        let sHigh=high/scaleCount;
        
        this.startClip(bitmapCTX,lft,top,rgt,bot);
         
            // background

        this.drawRect(bitmapCTX,lft,top,rgt,bot,skinColor);
        this.addNoiseRect(bitmapCTX,lft,top,rgt,bot,0.5,0.7,0.6);
        this.blur(bitmapCTX,lft,top,rgt,bot,5,false);
        
            // scales (need extra row for overlap)

        dy=bot-sHigh;
        
        for (y=0;y!==(scaleCount+1);y++) {

            if ((y%2)===0) {
                dx=lft;
                xCount=scaleCount;
            }
            else {
                dx=lft-Math.trunc(sWid*0.5);
                xCount=scaleCount+1;
            }
            
            for (x=0;x!==xCount;x++) {
                
                    // can have darkened scale if not on
                    // wrapping rows
                    
                col=skinColor;
                
                if ((y!==0) && (y!==scaleCount) && (x!==0) && (x!==(xCount-1))) {
                    if (genRandom.randomPercentage(0.2)) {
                        col=this.darkenColor(skinColor,genRandom.randomFloat(0.6,0.3));
                    }
                }
                
                    // some slight offsets
                    
                sx=Math.trunc(dx)+(5-genRandom.randomInt(0,10));
                sy=Math.trunc(dy)+(5-genRandom.randomInt(0,10));
                sx2=Math.trunc(dx+sWid);
                sy2=Math.trunc(dy+(sHigh*2));
                
                    // the scale itself
                    // we draw the scale as a solid, flat oval and
                    // then redraw the border with normals
                    
                this.draw3DOval(bitmapCTX,normalCTX,sx,sy,sx2,sy2,0.25,0.75,3,0,null,borderColor);
                this.drawOval(bitmapCTX,sx,sy,sx2,sy2,0.0,1.0,3,0,col,null);
                
                dx+=sWid;
            }
            
            dy-=sHigh;
        }
        
        this.endClip(bitmapCTX);
    }
    
        //
        // metal
        //
        
    generateMetalChunk(bitmapCTX,normalCTX,lft,top,rgt,bot,wid,high,skinColor)
    {
        this.draw3DRect(bitmapCTX,normalCTX,lft,top,rgt,bot,0,skinColor,genRandom.randomPercentage(0.5));
        this.generateMetalStreakShine(bitmapCTX,lft,top,rgt,bot,wid,high,skinColor);
    }
    
        //
        // random chunk
        //
    
    generateRandomChunk(bitmapCTX,normalCTX,glowCTX,lft,top,rgt,bot,wid,high,baseColor,isFace)
    {
        let scaleCount;
        
        switch (genRandom.randomIndex(4)) {
            
            case 0:
                this.generateFurChunk(bitmapCTX,normalCTX,lft,top,rgt,bot,baseColor);
                break;
            
            case 1:
                this.generateLeatherChunk(bitmapCTX,normalCTX,lft,top,rgt,bot,baseColor);
                break;
                
            case 2:
                scaleCount=genRandom.randomInt(8,10);
                this.generateScaleChunk(bitmapCTX,normalCTX,lft,top,rgt,bot,baseColor,scaleCount);
                break;
                
            case 3:
                this.generateMetalChunk(bitmapCTX,normalCTX,lft,top,rgt,bot,wid,high,baseColor);
                break;
        }
        
        if (isFace) this.generateFaceChunk(bitmapCTX,normalCTX,glowCTX,lft,top,rgt,bot);
    }

        //
        // generate mainline
        //

    generate(inDebug)
    {
        let wid,high,mx,my,baseColor;
        let bitmapCanvas,bitmapCTX,normalCanvas,normalCTX,specularCanvas,specularCTX,glowCanvas,glowCTX;

            // setup the canvas

        bitmapCanvas=document.createElement('canvas');
        bitmapCanvas.width=this.BITMAP_MODEL_TEXTURE_SIZE;
        bitmapCanvas.height=this.BITMAP_MODEL_TEXTURE_SIZE;
        bitmapCTX=bitmapCanvas.getContext('2d');

        normalCanvas=document.createElement('canvas');
        normalCanvas.width=this.BITMAP_MODEL_TEXTURE_SIZE;
        normalCanvas.height=this.BITMAP_MODEL_TEXTURE_SIZE;
        normalCTX=normalCanvas.getContext('2d');

        specularCanvas=document.createElement('canvas');
        specularCanvas.width=this.BITMAP_MODEL_TEXTURE_SIZE;
        specularCanvas.height=this.BITMAP_MODEL_TEXTURE_SIZE;
        specularCTX=specularCanvas.getContext('2d');
        
        glowCanvas=document.createElement('canvas');
        glowCanvas.width=this.BITMAP_MODEL_TEXTURE_SIZE;
        glowCanvas.height=this.BITMAP_MODEL_TEXTURE_SIZE;
        glowCTX=glowCanvas.getContext('2d');
        this.clearGlowRect(glowCTX,0,0,this.BITMAP_MODEL_TEXTURE_SIZE,this.BITMAP_MODEL_TEXTURE_SIZE);

        wid=bitmapCanvas.width;
        high=bitmapCanvas.height;
        
        mx=Math.trunc(wid*0.5);
        my=Math.trunc(high*0.5);
        baseColor=this.getRandomColor();
         
            // clear canvases

        this.drawRect(bitmapCTX,0,0,wid,high,baseColor);       
        this.clearNormalsRect(normalCTX,0,0,wid,high);

            // chunks
            
        this.generateRandomChunk(bitmapCTX,normalCTX,glowCTX,0,0,mx,my,wid,high,baseColor,false);
        this.generateRandomChunk(bitmapCTX,normalCTX,glowCTX,mx,0,wid,my,wid,high,baseColor,true);
        baseColor=this.darkenColor(baseColor,0.8);
        this.generateRandomChunk(bitmapCTX,normalCTX,glowCTX,0,my,mx,high,wid,high,baseColor,false);

            // finish with the specular

        this.createSpecularMap(bitmapCTX,specularCTX,wid,high,0.4);

            // debug just displays the canvases, so send
            // them back
        
        if (inDebug) return({bitmap:bitmapCanvas,normal:normalCanvas,specular:specularCanvas,glow:glowCanvas});
        
            // otherwise, create the webGL
            // bitmap object

        return(new BitmapClass(this.view,bitmapCanvas,normalCanvas,specularCanvas,glowCanvas,1.0,[(1.0/4000.0),(1.0/4000.0)],0.5));    
    }

}
