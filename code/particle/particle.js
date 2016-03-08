//
// particle class
//

class Particle
{
    constructor()
    {
        this.radiusStart=0;
        this.radiusEnd=0;

        this.movement=0.0;

        this.colorStart=new wsColor(0,0,0);
        this.colorEnd=new wsColor(0,0,0);

        this.alphaStart=0.0;
        this.alphaEnd=0.0;

        this.startTimeStamp=0;
        this.endTimeStamp=0;
        this.lifeTime=0;

        this.noDepthTest=false;

        this.centerPt=new wsPoint(0,0,0);

        this.count=0;
        this.points=[];

        this.topLeft=new wsPoint(0,0,0);            // global variables so we don't GC
        this.topRight=new wsPoint(0,0,0);
        this.bottomLeft=new wsPoint(0,0,0);
        this.bottomRight=new wsPoint(0,0,0);

        this.randomRot=new wsPoint(0.0,0.0,0.0);

        this.vertices=new Float32Array((PARTICLE_MAX_POINTS*4)*3);
        this.indexes=new Uint16Array((PARTICLE_MAX_POINTS*2)*3);
    }
    
        //
        // initialize and release particle
        //
        
    initialize(view)
    {
        for (var n=0;n!==PARTICLE_MAX_POINTS;n++) {     // supergumba -- move to constructor
            this.points.push(new wsPoint(0,0,0));
        }

        this.vertexPosBuffer=view.gl.createBuffer();
        this.indexBuffer=view.gl.createBuffer();
    }
    
    release(view)
    {
        this.points=[];

        view.gl.deleteBuffer(this.vertexPosBuffer);
        view.gl.deleteBuffer(this.indexBuffer);
    }
    
        //
        // determine free particles
        //
        
    isFree()
    {
        return(this.count===0);
    }
    
    timeout(view)
    {
        if (view.timeStamp>this.endTimeStamp) this.count=0;
    }
    
        //
        // setup
        //
        
    setRadius(radiusStart,radiusEnd)
    {
        this.radiusStart=radiusStart;
        this.radiusEnd=radiusEnd;
    }
    
    setMovement(movement)
    {
        this.movement=movement;
    }
    
    setCenterPointFromPoint(pt)
    {
        this.centerPt.setFromPoint(pt);
    }

    setColor(colorStartR,colorStartG,colorStartB,colorEndR,colorEndG,colorEndB)
    {
        this.colorStart.set(colorStartR,colorStartG,colorStartB);
        this.colorEnd.set(colorEndR,colorEndG,colorEndB);
    }
    
    setAlpha(alphaStart,alphaEnd)
    {
        this.alphaStart=alphaStart;
        this.alphaEnd=alphaEnd;
    }
    
    setTiming(timeStamp,lifeTime)
    {
        this.startTimeStamp=timeStamp;
        this.lifeTime=lifeTime;
        this.endTimeStamp=timeStamp+lifeTime;
    }
    
    setNoDepthTest(noDepthTest)
    {
        this.noDepthTest=noDepthTest;
    }
    
    setCount(count)
    {
        this.count=count;
    }
    
    getPoint(pointIdx)
    {
        return(this.points[pointIdx]);
    }
    
    setPoint(pointIdx,x,y,z)
    {
        this.points[pointIdx].set(x,y,z);
    }
    
        //
        // point utilities
        //
        
    createRandomGlobePoints(view,pointCount)
    {
        var n,pnt;
        
        for (n=0;n!==pointCount;n++) {
            pnt=this.points[n];
            
            pnt.set(0.0,0.0,1.0);
            this.randomRot.set((view.genRandom.random()*360.0),(view.genRandom.random()*360.0),(view.genRandom.random()*360.0));
            pnt.rotate(this.randomRot);
        }
        
        this.count=pointCount;
    }

        //
        // draw single particle effect
        //

    draw(view,particleShader)
    {
        var n,pnt,vIdx,iIdx,elementIdx;
        var timeFactor,radius,moveFactor,r,g,b,alpha;
        var gl=view.gl;
        
            // get the radius and color
        
        timeFactor=0.0;
        if (this.lifeTime!==0) timeFactor=(view.timeStamp-this.startTimeStamp)/this.lifeTime;
        
        radius=this.radiusStart+(this.radiusEnd-this.radiusStart)*timeFactor;
        moveFactor=this.movement*timeFactor;
        if (moveFactor<1.0) moveFactor=1.0;
        
        r=this.colorStart.r+(this.colorEnd.r-this.colorStart.r)*timeFactor;
        g=this.colorStart.g+(this.colorEnd.g-this.colorStart.g)*timeFactor;
        b=this.colorStart.b+(this.colorEnd.b-this.colorStart.b)*timeFactor;
        alpha=this.alphaStart+(this.alphaEnd-this.alphaStart)*timeFactor;
        
            // get # of trigs
        
        var nTrig=this.count*2;

            // build the vertices

        vIdx=0;
        iIdx=0;
        elementIdx=0;
        
        for (n=0;n!==this.count;n++) {
            pnt=this.points[n];
            
                // billboard the pieces
                
            this.topLeft.x=-radius;
            this.topLeft.y=-radius;
            this.topLeft.z=0.0;
            this.topLeft.matrixMultiplyIgnoreTransform(view.billboardXMatrix);
            this.topLeft.matrixMultiplyIgnoreTransform(view.billboardYMatrix);
            
            this.vertices[vIdx++]=this.topLeft.x+(pnt.x*moveFactor)+this.centerPt.x;
            this.vertices[vIdx++]=this.topLeft.y+(pnt.y*moveFactor)+this.centerPt.y;
            this.vertices[vIdx++]=this.topLeft.z+(pnt.z*moveFactor)+this.centerPt.z;
            
            this.topRight.x=radius;
            this.topRight.y=-radius;
            this.topRight.z=0.0;
            this.topRight.matrixMultiplyIgnoreTransform(view.billboardXMatrix);
            this.topRight.matrixMultiplyIgnoreTransform(view.billboardYMatrix);
            this.vertices[vIdx++]=this.topRight.x+(pnt.x*moveFactor)+this.centerPt.x;
            this.vertices[vIdx++]=this.topRight.y+(pnt.y*moveFactor)+this.centerPt.y;
            this.vertices[vIdx++]=this.topRight.z+(pnt.z*moveFactor)+this.centerPt.z;
            
            this.bottomRight.x=radius;
            this.bottomRight.y=radius;
            this.bottomRight.z=0.0;
            this.bottomRight.matrixMultiplyIgnoreTransform(view.billboardXMatrix);
            this.bottomRight.matrixMultiplyIgnoreTransform(view.billboardYMatrix);
            this.vertices[vIdx++]=this.bottomRight.x+(pnt.x*moveFactor)+this.centerPt.x;
            this.vertices[vIdx++]=this.bottomRight.y+(pnt.y*moveFactor)+this.centerPt.y;
            this.vertices[vIdx++]=this.bottomRight.z+(pnt.z*moveFactor)+this.centerPt.z;
            
            this.bottomLeft.x=-radius;
            this.bottomLeft.y=radius;
            this.bottomLeft.z=0.0;
            this.bottomLeft.matrixMultiplyIgnoreTransform(view.billboardXMatrix);
            this.bottomLeft.matrixMultiplyIgnoreTransform(view.billboardYMatrix);
            this.vertices[vIdx++]=this.bottomLeft.x+(pnt.x*moveFactor)+this.centerPt.x;
            this.vertices[vIdx++]=this.bottomLeft.y+(pnt.y*moveFactor)+this.centerPt.y;
            this.vertices[vIdx++]=this.bottomLeft.z+(pnt.z*moveFactor)+this.centerPt.z;
            
                // build the triangles
            
            this.indexes[iIdx++]=elementIdx;     // triangle 1
            this.indexes[iIdx++]=elementIdx+1;
            this.indexes[iIdx++]=elementIdx+2;

            this.indexes[iIdx++]=elementIdx;     // triangle 2
            this.indexes[iIdx++]=elementIdx+2;
            this.indexes[iIdx++]=elementIdx+3;

            elementIdx+=4;
        }

            // set the color and alpha

        gl.uniform4f(particleShader.colorAlphaUniform,r,g,b,alpha);

            // setup the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexPosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.vertices,gl.STREAM_DRAW);

        gl.vertexAttribPointer(particleShader.vertexPositionAttribute,3,gl.FLOAT,false,0,0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,this.indexes,gl.STREAM_DRAW);

            // draw the indexes
            
        if (this.noDepthTest) gl.disable(gl.DEPTH_TEST);

        gl.drawElements(gl.TRIANGLES,(nTrig*3),gl.UNSIGNED_SHORT,0);
        
        if (this.noDepthTest) gl.enable(gl.DEPTH_TEST);

            // remove the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);
    }

}
