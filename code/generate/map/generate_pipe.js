import PointClass from '../../utility/point.js';
import BoundClass from '../../utility/bound.js';
import MeshClass from '../../mesh/mesh.js';
import GenerateMeshClass from './generate_mesh.js';
import GenerateUtilityClass from '../utility/generate_utility.js';

//
// generate pipe decorations
//

export default class GeneratePipeClass 
{
    static PIPE_SIDE_COUNT=12;
    static PIPE_CURVE_SEGMENT_COUNT=5;
    
    constructor()
    {
        Object.seal(this);
    }
    
        //
        // pieces of pipes
        //

    static addPipeStraightChunk(core,room,name,bitmap,pnt,len,radius,pipeAng)
    {
        let n,rd,tx,tz,tx2,tz2,bx,bz,bx2,bz2;
        let u1,u2,vfact;
        let ang,ang2,angAdd;
        let mesh,iIdx;
        let vPnt=new PointClass(0,0,0);
        let nextPnt=new PointClass(0,0,0);
        let addPnt=new PointClass(0,0,0);
        let normal=new PointClass(0,0,0);
        let vertexArray=[];
        let normalArray=[];
        let uvArray=[];
        let tangentArray;
        let indexArray=[];
        
            // the end points
            
        nextPnt.setFromPoint(pnt);

        addPnt.setFromValues(0,len,0);
        addPnt.rotate(pipeAng);
        nextPnt.addPoint(addPnt);
        
            // the v factor
            
        vfact=len/radius;
        
            // cyliner faces

        iIdx=0;
        
        ang=0.0;
        angAdd=360.0/GeneratePipeClass.PIPE_SIDE_COUNT;

        for (n=0;n!==GeneratePipeClass.PIPE_SIDE_COUNT;n++) {
            ang2=ang+angAdd;

                // the two Us

            u1=(ang*GeneratePipeClass.PIPE_SIDE_COUNT)/360.0;
            u2=(ang2*GeneratePipeClass.PIPE_SIDE_COUNT)/360.0;

                // force last segment to wrap

            if (n===(GeneratePipeClass.PIPE_SIDE_COUNT-1)) ang2=0.0;

            rd=ang*PointClass.DEGREE_TO_RAD;
            tx=nextPnt.x+((radius*Math.sin(rd))+(radius*Math.cos(rd)));
            tz=nextPnt.z+((radius*Math.cos(rd))-(radius*Math.sin(rd)));

            bx=pnt.x+((radius*Math.sin(rd))+(radius*Math.cos(rd)));
            bz=pnt.z+((radius*Math.cos(rd))-(radius*Math.sin(rd)));

            rd=ang2*PointClass.DEGREE_TO_RAD;
            tx2=nextPnt.x+((radius*Math.sin(rd))+(radius*Math.cos(rd)));
            tz2=nextPnt.z+((radius*Math.cos(rd))-(radius*Math.sin(rd)));

            bx2=pnt.x+((radius*Math.sin(rd))+(radius*Math.cos(rd)));
            bz2=pnt.z+((radius*Math.cos(rd))-(radius*Math.sin(rd)));

                // the points

            vPnt.setFromValues(tx,nextPnt.y,tz);
            vPnt.rotateAroundPoint(nextPnt,pipeAng);
            vertexArray.push(vPnt.x,vPnt.y,vPnt.z);
            normal.setFromSubPoint(vPnt,nextPnt);
            normal.normalize();
            normalArray.push(normal.x,normal.y,normal.z);
            uvArray.push(u1,0.0);
            indexArray.push(iIdx++);

            vPnt.setFromValues(tx2,nextPnt.y,tz2);
            vPnt.rotateAroundPoint(nextPnt,pipeAng);
            vertexArray.push(vPnt.x,vPnt.y,vPnt.z);
            normal.setFromSubPoint(vPnt,nextPnt);
            normal.normalize();
            normalArray.push(normal.x,normal.y,normal.z);
            uvArray.push(u2,0.0);
            indexArray.push(iIdx++);

            vPnt.setFromValues(bx,pnt.y,bz);
            vPnt.rotateAroundPoint(pnt,pipeAng);
            vertexArray.push(vPnt.x,vPnt.y,vPnt.z);
            normal.setFromSubPoint(vPnt,pnt);
            normal.normalize();
            normalArray.push(normal.x,normal.y,normal.z);
            uvArray.push(u1,vfact);
            indexArray.push(iIdx++);

            vPnt.setFromValues(tx2,nextPnt.y,tz2);
            vPnt.rotateAroundPoint(nextPnt,pipeAng);
            vertexArray.push(vPnt.x,vPnt.y,vPnt.z);
            normal.setFromSubPoint(vPnt,nextPnt);
            normal.normalize();
            normalArray.push(normal.x,normal.y,normal.z);
            uvArray.push(u2,0.0);
            indexArray.push(iIdx++);

            vPnt.setFromValues(bx2,pnt.y,bz2);
            vPnt.rotateAroundPoint(pnt,pipeAng);
            vertexArray.push(vPnt.x,vPnt.y,vPnt.z);
            normal.setFromSubPoint(vPnt,pnt);
            normal.normalize();
            normalArray.push(normal.x,normal.y,normal.z);
            uvArray.push(u2,vfact);
            indexArray.push(iIdx++);

            vPnt.setFromValues(bx,pnt.y,bz);
            vPnt.rotateAroundPoint(pnt,pipeAng);
            vertexArray.push(vPnt.x,vPnt.y,vPnt.z);
            normal.setFromSubPoint(vPnt,pnt);
            normal.normalize();
            normalArray.push(normal.x,normal.y,normal.z);
            uvArray.push(u1,vfact);
            indexArray.push(iIdx++);

            ang=ang2;
        }
        
            // finally create the mesh

        tangentArray=GenerateUtilityClass.buildTangents(vertexArray,uvArray,indexArray);
        
        mesh=new MeshClass(core,name,bitmap,-1,-1,new Float32Array(vertexArray),new Float32Array(normalArray),tangentArray,new Float32Array(uvArray),null,null,new Uint16Array(indexArray));
        mesh.simpleCollisions=true;
        core.map.meshList.add(mesh);
    }

    static addPipeCornerChunk(core,room,name,bitmap,pnt,radius,xStart,zStart,xTurn,zTurn,yFlip)
    {
        let n,k,rd,tx,tz,tx2,tz2,bx,bz,bx2,bz2;
        let yAdd,xTurnAdd,zTurnAdd;
        let u1,u2;
        let ang,ang2,angAdd;
        let mesh,iIdx;
        let pipeAng=new PointClass(xStart,0,zStart);
        let nextPipeAng=new PointClass(0,0,0);
        let vPnt=new PointClass(0,0,0);
        let nextPnt=new PointClass(0,0,0);
        let addPnt=new PointClass(0,0,0);
        let normal=new PointClass(0,0,0);
        let vertexArray=[];
        let normalArray=[];
        let uvArray=[];
        let tangentArray;
        let indexArray=[];
        
        iIdx=0;
        
            // turn segments
            
        yAdd=Math.trunc((radius*2)/GeneratePipeClass.PIPE_CURVE_SEGMENT_COUNT);
        if (yFlip) yAdd=-yAdd;
        
        xTurnAdd=xTurn/GeneratePipeClass.PIPE_CURVE_SEGMENT_COUNT;
        zTurnAdd=zTurn/GeneratePipeClass.PIPE_CURVE_SEGMENT_COUNT;
        
        angAdd=360.0/GeneratePipeClass.PIPE_SIDE_COUNT;
        
        for (k=0;k!==GeneratePipeClass.PIPE_CURVE_SEGMENT_COUNT;k++) {
            
            nextPnt.setFromPoint(pnt);
            
            addPnt.setFromValues(0,-yAdd,0);
            addPnt.rotate(pipeAng);
            nextPnt.addPoint(addPnt);
            
            nextPipeAng.setFromPoint(pipeAng);
            nextPipeAng.x+=xTurnAdd;
            nextPipeAng.z+=zTurnAdd;
            

                // cyliner faces

            ang=0.0;

            for (n=0;n!==GeneratePipeClass.PIPE_SIDE_COUNT;n++) {
                ang2=ang+angAdd;
                
                    // the two Us
                    
                u1=(ang*GeneratePipeClass.PIPE_SIDE_COUNT)/360.0;
                u2=(ang2*GeneratePipeClass.PIPE_SIDE_COUNT)/360.0;

                    // force last segment to wrap
                    
                if (n===(GeneratePipeClass.PIPE_SIDE_COUNT-1)) ang2=0.0;

                rd=ang*PointClass.DEGREE_TO_RAD;
                tx=nextPnt.x+((radius*Math.sin(rd))+(radius*Math.cos(rd)));
                tz=nextPnt.z+((radius*Math.cos(rd))-(radius*Math.sin(rd)));
                
                bx=pnt.x+((radius*Math.sin(rd))+(radius*Math.cos(rd)));
                bz=pnt.z+((radius*Math.cos(rd))-(radius*Math.sin(rd)));

                rd=ang2*PointClass.DEGREE_TO_RAD;
                tx2=nextPnt.x+((radius*Math.sin(rd))+(radius*Math.cos(rd)));
                tz2=nextPnt.z+((radius*Math.cos(rd))-(radius*Math.sin(rd)));
                
                bx2=pnt.x+((radius*Math.sin(rd))+(radius*Math.cos(rd)));
                bz2=pnt.z+((radius*Math.cos(rd))-(radius*Math.sin(rd)));
                
                    // the points
                
                vPnt.setFromValues(tx,nextPnt.y,tz);
                vPnt.rotateAroundPoint(nextPnt,nextPipeAng);
                vertexArray.push(vPnt.x,vPnt.y,vPnt.z);
                normal.setFromSubPoint(vPnt,nextPnt);
                normal.normalize();
                normalArray.push(normal.x,normal.y,normal.z);
                uvArray.push(u1,0.0);
                indexArray.push(iIdx++);
                
                vPnt.setFromValues(tx2,nextPnt.y,tz2);
                vPnt.rotateAroundPoint(nextPnt,nextPipeAng);
                vertexArray.push(vPnt.x,vPnt.y,vPnt.z);
                normal.setFromSubPoint(vPnt,nextPnt);
                normal.normalize();
                normalArray.push(normal.x,normal.y,normal.z);
                uvArray.push(u2,0.0);
                indexArray.push(iIdx++);
                
                vPnt.setFromValues(bx,pnt.y,bz);
                vPnt.rotateAroundPoint(pnt,pipeAng);
                vertexArray.push(vPnt.x,vPnt.y,vPnt.z);
                normal.setFromSubPoint(vPnt,pnt);
                normal.normalize();
                normalArray.push(normal.x,normal.y,normal.z);
                uvArray.push(u1,1.0);
                indexArray.push(iIdx++);
                
                vPnt.setFromValues(tx2,nextPnt.y,tz2);
                vPnt.rotateAroundPoint(nextPnt,nextPipeAng);
                vertexArray.push(vPnt.x,vPnt.y,vPnt.z);
                normal.setFromSubPoint(vPnt,nextPnt);
                normal.normalize();
                normalArray.push(normal.x,normal.y,normal.z);
                uvArray.push(u2,0.0);
                indexArray.push(iIdx++);
                
                vPnt.setFromValues(bx2,pnt.y,bz2);
                vPnt.rotateAroundPoint(pnt,pipeAng);
                vertexArray.push(vPnt.x,vPnt.y,vPnt.z);
                normal.setFromSubPoint(vPnt,pnt);
                normal.normalize();
                normalArray.push(normal.x,normal.y,normal.z);
                uvArray.push(u2,1.0);
                indexArray.push(iIdx++);
                
                vPnt.setFromValues(bx,pnt.y,bz);
                vPnt.rotateAroundPoint(pnt,pipeAng);
                vertexArray.push(vPnt.x,vPnt.y,vPnt.z);
                normal.setFromSubPoint(vPnt,pnt);
                normal.normalize();
                normalArray.push(normal.x,normal.y,normal.z);
                uvArray.push(u1,1.0);
                indexArray.push(iIdx++);
                
                ang=ang2;
            }
            
            pnt.setFromPoint(nextPnt);
            pipeAng.setFromPoint(nextPipeAng);
        }
        
            // finally create the mesh

        tangentArray=GenerateUtilityClass.buildTangents(vertexArray,uvArray,indexArray);
        
        mesh=new MeshClass(core,name,bitmap,-1,-1,new Float32Array(vertexArray),new Float32Array(normalArray),tangentArray,new Float32Array(uvArray),null,null,new Uint16Array(indexArray));
        mesh.simpleCollisions=true;
        core.map.meshList.add(mesh);
    }
    
        //
        // build room pipe
        //

    static buildRoomPipes(core,room,name,pipeBitmap,segmentSize)
    {
        let n,pipeCount,pipeRadius;
        let x,z,x2,z2,xOff,zOff,lx,rx,tz,bz;
        let pnt,pipeAng,my,high;
        
            // available places for pipes
            
        lx=room.piece.margins[0];
        rx=room.piece.size.x-room.piece.margins[2];
        tz=room.piece.margins[1];
        bz=room.piece.size.z-room.piece.margins[3];
        
        pipeRadius=GenerateUtilityClass.randomInt(Math.trunc(segmentSize*0.15),Math.trunc(segmentSize*0.15));
        xOff=room.offset.x+Math.trunc((segmentSize-(pipeRadius*2))*0.5);
        zOff=room.offset.z+Math.trunc((segmentSize-(pipeRadius*2))*0.5);
        
            // pipe count
            
        pipeCount=GenerateUtilityClass.randomInt(2,3);
        
        for (n=0;n!==pipeCount;n++) {
            
                // start point
                
            x=GenerateUtilityClass.randomInBetween((lx+1),(rx-1));
            z=GenerateUtilityClass.randomInBetween((tz+1),(bz-1));
            
                // the split
                
            high=room.storyCount*segmentSize;
            my=(high*GenerateUtilityClass.randomFloat(0.2,0.6))+pipeRadius;
           
                // the top part
                
            pnt=new PointClass((xOff+(x*segmentSize)),(room.offset.y+(room.storyCount*segmentSize)),(zOff+(z*segmentSize)));
            pipeAng=new PointClass(0,0,180.0);     // force len to point down
            this.addPipeStraightChunk(core,room,name,pipeBitmap,pnt,((high-my)-pipeRadius),pipeRadius,pipeAng);
            
                // the cross over
                
            x2=x;
            z2=z;
                
            switch (GenerateUtilityClass.randomIndex(2)) {
                case 0:
                    pnt=new PointClass((xOff+(x*segmentSize)),((room.offset.y+my)+Math.trunc(pipeRadius*1.5)),(zOff+(z*segmentSize)));
                    this.addPipeCornerChunk(core,room,name,pipeBitmap,pnt,pipeRadius,0.0,0.0,0.0,90.0,false);
                    
                    x2=x+GenerateUtilityClass.randomInt(1,3);
                    if (x2>=rx) x2=(rx-1);
                    
                    pnt=new PointClass((xOff+(x*segmentSize)+pipeRadius),(room.offset.y+my),(zOff+(z*segmentSize)));
                    pipeAng=new PointClass(0,0,270.0);
                    this.addPipeStraightChunk(core,room,name,pipeBitmap,pnt,((segmentSize*Math.abs(x2-x))-(pipeRadius*2)),pipeRadius,pipeAng);
                    
                    pnt=new PointClass((xOff+(x2*segmentSize)),((room.offset.y+my)-Math.trunc(pipeRadius*1.5)),(zOff+(z*segmentSize)));
                    this.addPipeCornerChunk(core,room,name,pipeBitmap,pnt,pipeRadius,0.0,0.0,0.0,90.0,true);
                    break;
                    
                case 1:
                    pnt=new PointClass(((xOff+(x*segmentSize))-Math.trunc(pipeRadius*1.5)),(room.offset.y+my),(zOff+(z*segmentSize)));
                    this.addPipeCornerChunk(core,room,name,pipeBitmap,pnt,pipeRadius,0.0,90.0,0.0,90.0,false);
                    
                    x2=x-GenerateUtilityClass.randomInt(1,3);
                    if (x2<lx) x2=lx;
                    
                    pnt=new PointClass((xOff+(x*segmentSize)-pipeRadius),(room.offset.y+my),(zOff+(z*segmentSize)));
                    pipeAng=new PointClass(0,0,90.0);
                    this.addPipeStraightChunk(core,room,name,pipeBitmap,pnt,((segmentSize*Math.abs(x2-x))-(pipeRadius*2)),pipeRadius,pipeAng);
                    
                    pnt=new PointClass(((xOff+(x2*segmentSize))+Math.trunc(pipeRadius*1.5)),((room.offset.y+my)+Math.trunc(pipeRadius*0)),(zOff+(z*segmentSize)));
                    this.addPipeCornerChunk(core,room,name,pipeBitmap,pnt,pipeRadius,0.0,90.0,0.0,90.0,true);
                    break;
                    
                case 2:
                    pnt=new PointClass((xOff+(x*segmentSize)),(room.offset.y+my),((zOff+(z*segmentSize))+Math.trunc(pipeRadius*1.5)));
                    this.addPipeCornerChunk(core,room,name,pipeBitmap,pnt,pipeRadius,90.0,0.0,90.0,0.0,false);
                    
                    z2=z+GenerateUtilityClass.randomInt(1,3);
                    if (z2>=bz) z2=(bz-1);
                    
                    pnt=new PointClass((xOff+(x*segmentSize)),(room.offset.y+my),(zOff+(z*segmentSize)+pipeRadius));
                    pipeAng=new PointClass(90.0,0,0.0);
                    this.addPipeStraightChunk(core,room,name,pipeBitmap,pnt,((segmentSize*Math.abs(z2-z))-(pipeRadius*2)),pipeRadius,pipeAng);
                    
                    pnt=new PointClass((xOff+(x*segmentSize)),(room.offset.y+my),((zOff+(z2*segmentSize))-Math.trunc(pipeRadius*1.5)));
                    this.addPipeCornerChunk(core,room,name,pipeBitmap,pnt,pipeRadius,90.0,0.0,90.0,0.0,true);
                    break;
                    
                case 3:
                    pnt=new PointClass((xOff+(x*segmentSize)),((room.offset.y+my)+Math.trunc(pipeRadius*1.5)),(zOff+(z*segmentSize)));
                    this.addPipeCornerChunk(core,room,name,pipeBitmap,pnt,pipeRadius,0.0,0.0,90.0,0.0,false);
                    
                    z2=x-GenerateUtilityClass.randomInt(1,3);
                    if (z2<tz) z2=tz;
                    
                    pnt=new PointClass((xOff+(x*segmentSize)),(room.offset.y+my),(zOff+(z*segmentSize)-pipeRadius));
                    pipeAng=new PointClass(270.0,0,0.0);
                    this.addPipeStraightChunk(core,room,name,pipeBitmap,pnt,((segmentSize*Math.abs(z2-z))-(pipeRadius*2)),pipeRadius,pipeAng);
                    
                    pnt=new PointClass((xOff+(x*segmentSize)),((room.offset.y+my)-Math.trunc(pipeRadius*1.5)),(zOff+(z2*segmentSize)));
                    this.addPipeCornerChunk(core,room,name,pipeBitmap,pnt,pipeRadius,0.0,0.0,90.0,0.0,true);
                    break;
            }
                
            
                // the bottom part
                
            pnt=new PointClass((xOff+(x2*segmentSize)),((room.offset.y+my)-pipeRadius),(zOff+(z2*segmentSize)));
            pipeAng=new PointClass(0,0,180.0);     // force len to point down
            this.addPipeStraightChunk(core,room,name,pipeBitmap,pnt,my,pipeRadius,pipeAng);
        }
    }

}