"use strict";

//
// Light Map Generation
// 
// This code generates light maps.  We have to pass
// everything through instead of relying on variables in
// the object because the callbacks make the "this" equal
// to the window object.
//

var genLightmap={};

//
// lightmap bitmap object
// records each generated lightmap
// canvas and the last chunk written to
//

function genLightmapBitmapObject(canvas)
{
    this.chunkIdx=0;
    this.canvas=canvas;
}

//
// this object keeps a list of which
// light map and UVs go to which mesh
//

function genLightmapMeshObject()
{
    this.lightmapIdx=0;
    this.lightmapUVs=null;
}

//
// constants
//

const GEN_LIGHTMAP_TIMEOUT_MSEC=100;
const GEN_LIGHTMAP_TEXTURE_SIZE=1024;

// chunk is one block available to draw a light map
const GEN_LIGHTMAP_CHUNK_SPLIT=16;                  // how many chunks in both the X and Y direction
const GEN_LIGHTMAP_CHUNK_SIZE=Math.floor(GEN_LIGHTMAP_TEXTURE_SIZE/GEN_LIGHTMAP_CHUNK_SPLIT);    // square pixel size of chunks
const GEN_LIGHTMAP_CHUNK_PER_TEXTURE=(GEN_LIGHTMAP_CHUNK_SPLIT*GEN_LIGHTMAP_CHUNK_SPLIT);        // how many chunks in a single texture

const GEN_LIGHTMAP_RENDER_MARGIN=2;                // margin around each light map triangle
const GEN_LIGHTMAP_BLUR_COUNT=3;

//
// start light map canvas
//

genLightmap.startCanvas=function()
{
        // setup the canvas
        
    var canvas=document.createElement('canvas');
    canvas.width=GEN_LIGHTMAP_TEXTURE_SIZE;
    canvas.height=GEN_LIGHTMAP_TEXTURE_SIZE;
    var ctx=canvas.getContext('2d');
    
        // clear to black with
        // open alpha (we use this later
        // for smearing)
        
    var imgData=ctx.getImageData(0,0,GEN_LIGHTMAP_TEXTURE_SIZE,GEN_LIGHTMAP_TEXTURE_SIZE);
    var data=imgData.data;
    
    var n;
    var pixelCount=GEN_LIGHTMAP_TEXTURE_SIZE*GEN_LIGHTMAP_TEXTURE_SIZE;
    var idx=0;
    
    for (n=0;n!==pixelCount;n++) {
        data[idx++]=0;
        data[idx++]=0;
        data[idx++]=0;
        data[idx++]=0;
    }
    
        // replace image data
        
    ctx.putImageData(imgData,0,0);
    
        // return new canvas
    
    return(canvas);
};

//
// border and smear polygons
//

genLightmap.smudgeChunk=function(data,wid,high)
{
    var x,y,cx,cy,cxs,cxe,cys,cye;
    var idx,idx2;
    var colCount,r,g,b;
    var noFill;

        // we constantly add and re-add
        // the pixel border until the entire
        // block is filled.  we use the
        // alpha channel to determine this
		
    while (true) {
	
        noFill=true;

        for (y=0;y!==high;y++) {
            
            cys=y-1;
            if (cys<0) cys=0;
            cye=y+2;
            if (cye>=high) cye=high-1;

            for (x=0;x!==wid;x++) {

                idx=((y*wid)+x)*4;

                    // already touched then
                    // ignore

                if (data[idx+3]!==0) continue;

                    // find all the touched pixels around
                    // it to make the new border
                    // smear pixel

                colCount=0;
                r=g=b=0;

                cxs=x-1;
                if (cxs<0) cxs=0;
                cxe=x+2;
                if (cxe>=wid) cxe=wid-1;

                for (cy=cys;cy!==cye;cy++) {
                    for (cx=cxs;cx!==cxe;cx++) {

                            // only use touched pixels

                        idx2=((cy*wid)+cx)*4;
                        if (data[idx2+3]===0) continue;

                            // add in the color

                        r+=data[idx2];
                        g+=data[idx2+1];
                        b+=data[idx2+2];
                        colCount++;
                    }
                }

                    // if we had a pixel to smear
                    // with, then add the smear

                if (colCount!==0) {
                    data[idx]=Math.floor(r/colCount);
                    data[idx+1]=Math.floor(g/colCount);
                    data[idx+2]=Math.floor(b/colCount);
                    data[idx+3]=255;		// next time this is part of the smear

                    noFill=false;
                }
            }
        }
				
            // have we filled everything?

        if (noFill) break;
    }
};

genLightmap.blurChunk=function(data,wid,high)
{
    var n,k,idx,pixelCount;
    var x,y,cx,cy,cxs,cxe,cys,cye;
    var colCount,r,g,b;
    var backData;
    
        // create a copy of the data
        
    var backData=new Uint8ClampedArray(data);
    
        // blur pixels to count
		
    for (n=0;n!==GEN_LIGHTMAP_BLUR_COUNT;n++) {

        for (y=0;y!==high;y++) {
            
            cys=y-1;
            if (cys<0) cys=0;
            cye=y+2;
            if (cye>=high) cye=high-1;
	
            for (x=0;x!==wid;x++) {

                    // get blur from 8 surrounding pixels

                colCount=0;
                r=g=b=0;
                
                cxs=x-1;
                if (cxs<0) cxs=0;
                cxe=x+2;
                if (cxe>=wid) cxe=wid-1;
				
                for (cy=cys;cy!==cye;cy++) {
                    for (cx=cxs;cx!==cxe;cx++) {
                        if ((cy===y) && (cx===x)) continue;       // ignore self

                            // add up blur from the
                            // original pixels

                        idx=((cy*wid)+cx)*4;

                        r+=data[idx];
                        b+=data[idx+1];
                        g+=data[idx+2];
                        colCount++;
                    }
                }
				
                r/=colCount;
                if (r>255) r=255;

                g/=colCount;
                if (g>255) g=255;

                b/=colCount;
                if (b>255) b=255;
                
                idx=((y*wid)+x)*4;
                
                backData[idx]=r;
                backData[idx+1]=g;
                backData[idx+2]=b;
            }
        }

            // transfer over the changed pixels

        pixelCount=wid*high;
        idx=0;

        for (k=0;k!==pixelCount;k++) {
            data[idx]=backData[idx];
            data[idx+1]=backData[idx+1];
            data[idx+2]=backData[idx+2];
            idx+=4;
        }
    } 
};

//
// ray tracing
//

genLightmap.rayTraceCollision=function(vx,vy,vz,vctX,vctY,vctZ,t0x,t0y,t0z,tv1x,tv1y,tv1z,tv2x,tv2y,tv2z)
{
        // we pass in a single vertex (t0x,t0y,t0z) and
        // these pre-calculated vectors for the other
        // sides of the triangle
        // tv1[x,y,z]=t1[x,y,z]-t0[x,y,z]
        // tv2[x,y,z]=t2[x,y,z]-t0[x,y,z]
	
        // calculate the determinate
        // perpVector is cross(vector,v2)
        // det is dot(v1,perpVector)
        
    var perpVectorX=(vctY*tv2z)-(vctZ*tv2y);
    var perpVectorY=(vctZ*tv2x)-(vctX*tv2z);
    var perpVectorZ=(vctX*tv2y)-(vctY*tv2x);

    var det=(tv1x*perpVectorX)+(tv1y*perpVectorY)+(tv1z*perpVectorZ);

        // is line on the same plane as triangle?

    if ((det>-0.00001) && (det<0.00001)) return(false);

        // get the inverse determinate

    var invDet=1.0/det;

        // calculate triangle U and test
        // lineToTrigPointVector is vector from vertex to triangle point 0
        // u is invDet * dot(lineToTrigPointVector,perpVector)
        
    var lineToTrigPointVectorX=vx-t0x;
    var lineToTrigPointVectorY=vy-t0y;
    var lineToTrigPointVectorZ=vz-t0z;

    var u=invDet*((lineToTrigPointVectorX*perpVectorX)+(lineToTrigPointVectorY*perpVectorY)+(lineToTrigPointVectorZ*perpVectorZ));
    if ((u<0.0) || (u>1.0)) return(false);
	
        // calculate triangle V and test
        // lineToTrigPerpVector is cross(lineToTrigPointVector,v1)
        // v is invDet * dot(vector,lineToTrigPerpVector)
        
    var lineToTrigPerpVectorX=(lineToTrigPointVectorY*tv1z)-(lineToTrigPointVectorZ*tv1y);
    var lineToTrigPerpVectorY=(lineToTrigPointVectorZ*tv1x)-(lineToTrigPointVectorX*tv1z);
    var lineToTrigPerpVectorZ=(lineToTrigPointVectorX*tv1y)-(lineToTrigPointVectorY*tv1x);

    var v=invDet*((vctX*lineToTrigPerpVectorX)+(vctY*lineToTrigPerpVectorY)+(vctZ*lineToTrigPerpVectorZ));
    if ((v<0.0) || ((u+v)>1.0)) return(false);
	
        // t is the point on the line, from the
        // invDet*dot(v2,lineToTrigPerpVector)
		
        // this is a little different then normal ray trace
        // hits, we add in an extra 0.01f slop so polygons that are
        // touching each other don't have edges grayed in

    var t=invDet*((tv2x*lineToTrigPerpVectorX)+(tv2y*lineToTrigPerpVectorY)+(tv2z*lineToTrigPerpVectorZ));
    return((t>0.01)&&(t<1.0));
};

genLightmap.rayTraceVertex=function(map,meshIdx,trigIdx,simpleLightmap,vx,vy,vz,normal)
{
    var n,nLight,trigCount;
    var light;
    var k,p,hit,lightMesh,mesh,nMesh,cIdx;
    var trigRayTraceCache;
    var lightVectorX,lightVectorY,lightVectorZ;
    var lightBoundX,lightBoundY,lightBoundZ;
    var dist,att;
    var col=new wsColor(0.0,0.0,0.0);
    var lightVectorNormal=vec3.create();
    
        // we have a list of mesh/light intersections we
        // use to reduce the number of lights we check for
        // a mesh
    
        // we precalculated a list of a single point on the
        // triangle and two vectors for each side around that point
        // to speed this up.  That's what the trigRayTraceCache is for
    
    lightMesh=map.meshes[meshIdx];
    nLight=lightMesh.lightIntersectList.length;
    
    for (n=0;n!==nLight;n++) {
        light=map.lights[lightMesh.lightIntersectList[n]];
        
            // light within light range?
            
        dist=light.distanceByTriplet(vx,vy,vz);
        if (dist>light.intensity) continue;
        
            // light vector
            // break this up into X,Y,Z to avoid
            // lookup penalities for this code
            
        lightVectorX=light.position.x-vx;
        lightVectorY=light.position.y-vy;
        lightVectorZ=light.position.z-vz;
        
            // ignore all triangles that are facing
            // away from the light
        
        lightVectorNormal=vec3.fromValues(lightVectorX,lightVectorY,lightVectorZ);
        vec3.normalize(lightVectorNormal,lightVectorNormal);
        if (vec3.dot(lightVectorNormal,normal)<0.0) continue;
        
            // light bounding
        
        lightBoundX=new wsBound(vx,light.position.x);
        lightBoundY=new wsBound(vy,light.position.y);
        lightBoundZ=new wsBound(vz,light.position.z);
            
            // if simple light map, don't
            // ray trace, only light by attenuation
        
        if (!simpleLightmap) {
            
                // each light has a list of meshes within
                // it's light cone, these are the only meshes
                // that can block
                
            nMesh=light.meshIntersectList.length;
            
                // any hits?

            hit=false;

            for (k=0;k!==nMesh;k++) {
                mesh=map.meshes[light.meshIntersectList[k]];
                if (!mesh.boxBoundCollision(lightBoundX,lightBoundY,lightBoundZ)) continue;

                cIdx=0;
                trigCount=mesh.trigCount;
                trigRayTraceCache=mesh.trigRayTraceCache;

                for (p=0;p!==trigCount;p++) {

                    if (genLightmap.rayTraceCollision(vx,vy,vz,lightVectorX,lightVectorY,lightVectorZ,trigRayTraceCache[cIdx],trigRayTraceCache[cIdx+1],trigRayTraceCache[cIdx+2],trigRayTraceCache[cIdx+3],trigRayTraceCache[cIdx+4],trigRayTraceCache[cIdx+5],trigRayTraceCache[cIdx+6],trigRayTraceCache[cIdx+7],trigRayTraceCache[cIdx+8])) {
                        hit=true;
                        break;
                    }

                    cIdx+=9;
                }

                if (hit) break;
            }

                // if a hit, don't add in light

            if (hit) continue;
        }
        
            // get the color, attenuate
            // it and add it to base color
        
        att=1.0-(dist*light.invertIntensity);
        att+=Math.pow(att,light.exponent);
        col.add(light.color.attenuate(att));
    }
    
    col.fixOverflow();
    
    return(col);
};

//
// render a triangle
//

genLightmap.renderTriangle=function(map,meshIdx,trigIdx,simpleLightmap,ctx,pts,vs,normal,lft,top,rgt,bot)
{
    var x,y,lx,rx,tempX,ty,by,idx;
    var lxFactor,rxFactor,vFactor;
    var vx,vy,vz;
    var vlx=new wsPoint(0,0,0);
    var vrx=new wsPoint(0,0,0);
    var col;
    
    var wid=rgt-lft;
    var high=bot-top;
    
    if ((wid<=0) || (high<=0)) return;
    
        // get the image data to render to
        
    var imgData=ctx.getImageData(lft,top,wid,high);
    var data=imgData.data;
    
        // find the top and bottom points
        
    var topPtIdx=0;
    if (pts[1].y<pts[topPtIdx].y) topPtIdx=1;
    if (pts[2].y<pts[topPtIdx].y) topPtIdx=2;
   
    var botPtIdx=0;
    if (pts[1].y>pts[botPtIdx].y) botPtIdx=1;
    if (pts[2].y>pts[botPtIdx].y) botPtIdx=2;
    
        // find the current lines to
        // scan against
    
    var l1StartPtIdx=topPtIdx;
    var l1EndPtIdx=topPtIdx-1;
    if (l1EndPtIdx===-1) l1EndPtIdx=2;
    
    var l2StartPtIdx=topPtIdx;
    var l2EndPtIdx=topPtIdx+1;
    if (l2EndPtIdx===3) l2EndPtIdx=0;
    
        // render the triangle by scan
        // lines from top to bottom
    
    ty=pts[topPtIdx].y;
    by=pts[botPtIdx].y;
    if (ty>=by) return;

    for (y=ty;y!==by;y++) {
        
            // time to switch lines?
        
        if (y>=pts[l1EndPtIdx].y) {
            l1StartPtIdx=l1EndPtIdx;
            l1EndPtIdx--;
            if (l1EndPtIdx===-1) l1EndPtIdx=2;
        }
        
        if (y>=pts[l2EndPtIdx].y) {
            l2StartPtIdx=l2EndPtIdx;
            l2EndPtIdx++;
            if (l2EndPtIdx===3) l2EndPtIdx=0;
        }
        
            // get the left right
        
        lxFactor=(y-pts[l1StartPtIdx].y)/(pts[l1EndPtIdx].y-pts[l1StartPtIdx].y);
        lx=pts[l1StartPtIdx].x+Math.floor((pts[l1EndPtIdx].x-pts[l1StartPtIdx].x)*lxFactor);
        
        rxFactor=(y-pts[l2StartPtIdx].y)/(pts[l2EndPtIdx].y-pts[l2StartPtIdx].y);
        rx=pts[l2StartPtIdx].x+Math.floor((pts[l2EndPtIdx].x-pts[l2StartPtIdx].x)*rxFactor);
        
            // get the vertex left and right
            
        vlx.x=vs[l1StartPtIdx].x+((vs[l1EndPtIdx].x-vs[l1StartPtIdx].x)*lxFactor);
        vlx.y=vs[l1StartPtIdx].y+((vs[l1EndPtIdx].y-vs[l1StartPtIdx].y)*lxFactor);
        vlx.z=vs[l1StartPtIdx].z+((vs[l1EndPtIdx].z-vs[l1StartPtIdx].z)*lxFactor);
        
        vrx.x=vs[l2StartPtIdx].x+((vs[l2EndPtIdx].x-vs[l2StartPtIdx].x)*rxFactor);
        vrx.y=vs[l2StartPtIdx].y+((vs[l2EndPtIdx].y-vs[l2StartPtIdx].y)*rxFactor);
        vrx.z=vs[l2StartPtIdx].z+((vs[l2EndPtIdx].z-vs[l2StartPtIdx].z)*rxFactor);
        
            // sometimes we need to swap
            // left and right
            
        if (lx>rx) {
            tempX=lx;
            lx=rx;
            rx=tempX;
            
            tempX=vlx;
            vlx=vrx;
            vrx=tempX;
        }
        
            // get the bitmap data index
            
        idx=((y*wid)+lx)*4;
        
            // render the scan line
            
        for (x=lx;x!==rx;x++) {
            
                // get the ray trace vetex
            
            vFactor=(x-lx)/(rx-lx);
            vx=vlx.x+((vrx.x-vlx.x)*vFactor);
            vy=vlx.y+((vrx.y-vlx.y)*vFactor);
            vz=vlx.z+((vrx.z-vlx.z)*vFactor);
            
                // write the pixel
                
            col=genLightmap.rayTraceVertex(map,meshIdx,trigIdx,simpleLightmap,vx,vy,vz,normal);
            data[idx++]=Math.floor(col.r*255.0);
            data[idx++]=Math.floor(col.g*255.0);
            data[idx++]=Math.floor(col.b*255.0);
            data[idx++]=255;
        }
    }
    
        // smear and blur chunk
        
    genLightmap.smudgeChunk(data,wid,high);
    genLightmap.blurChunk(data,wid,high);

        // replace image data
        
    ctx.putImageData(imgData,lft,top);
};

//
// build light map in chunk
//

genLightmap.writePolyToChunk=function(map,meshIdx,trigIdx,simpleLightmap,lightmapIdx,ctx,lft,top,lightmapUVs)
{
    var mesh=map.meshes[meshIdx];
    var vIdx,uvIdx;
    var pt0,pt1,pt2;
    
        // get the vertexes for the triangle
        // and one normal
        
    vIdx=mesh.indexes[trigIdx*3]*3;
    var v0=new wsPoint(mesh.vertices[vIdx],mesh.vertices[vIdx+1],mesh.vertices[vIdx+2]);
    var normal=vec3.fromValues(mesh.normals[vIdx],mesh.normals[vIdx+1],mesh.normals[vIdx+2]);

    vIdx=mesh.indexes[(trigIdx*3)+1]*3;
    var v1=new wsPoint(mesh.vertices[vIdx],mesh.vertices[vIdx+1],mesh.vertices[vIdx+2]);

    vIdx=mesh.indexes[(trigIdx*3)+2]*3;
    var v2=new wsPoint(mesh.vertices[vIdx],mesh.vertices[vIdx+1],mesh.vertices[vIdx+2]);

        // look at one of the normal to determine if it's
        // wall or floor like

    var wallLike=(Math.abs(mesh.normals[vIdx+1])<=0.3);
    
        // get the bounds of the 3D point
        
    var xBound=new wsBound(v0.x,v0.x);
    xBound.adjust(v1.x);
    xBound.adjust(v2.x);
    
    var yBound=new wsBound(v0.y,v0.y);
    yBound.adjust(v1.y);
    yBound.adjust(v2.y);
    
    var zBound=new wsBound(v0.z,v0.z);
    zBound.adjust(v1.z);
    zBound.adjust(v2.z);
    
        // 2D reduction factors
        
    var renderSize=GEN_LIGHTMAP_CHUNK_SIZE-(GEN_LIGHTMAP_RENDER_MARGIN*2);

    var sz=xBound.max-xBound.min;
    var xFactor=(sz===0)?0:renderSize/sz;
    
    var sz=yBound.max-yBound.min;
    var yFactor=(sz===0)?0:renderSize/sz;
    
    var sz=zBound.max-zBound.min;
    var zFactor=(sz===0)?0:renderSize/sz;

        // now create the 2D version of it
        // these points are offsets WITHIN the margin box
        
    if (wallLike) {
        if (xBound.getSize()>zBound.getSize()) {
            pt0=new ws2DPoint(((v0.x-xBound.min)*xFactor),((v0.y-yBound.min)*yFactor));
            pt1=new ws2DPoint(((v1.x-xBound.min)*xFactor),((v1.y-yBound.min)*yFactor));
            pt2=new ws2DPoint(((v2.x-xBound.min)*xFactor),((v2.y-yBound.min)*yFactor));
        }
        else {
            pt0=new ws2DPoint(((v0.z-zBound.min)*zFactor),((v0.y-yBound.min)*yFactor));
            pt1=new ws2DPoint(((v1.z-zBound.min)*zFactor),((v1.y-yBound.min)*yFactor));
            pt2=new ws2DPoint(((v2.z-zBound.min)*zFactor),((v2.y-yBound.min)*yFactor));
        }
    }
    else {
        pt0=new ws2DPoint(((v0.x-xBound.min)*xFactor),((v0.z-zBound.min)*zFactor));
        pt1=new ws2DPoint(((v1.x-xBound.min)*xFactor),((v1.z-zBound.min)*zFactor));
        pt2=new ws2DPoint(((v2.x-xBound.min)*xFactor),((v2.z-zBound.min)*zFactor));
    }
    
        // move so the triangle renders within
        // the margins so we have area to smear
        
    pt0.move(GEN_LIGHTMAP_RENDER_MARGIN,GEN_LIGHTMAP_RENDER_MARGIN);
    pt1.move(GEN_LIGHTMAP_RENDER_MARGIN,GEN_LIGHTMAP_RENDER_MARGIN);
    pt2.move(GEN_LIGHTMAP_RENDER_MARGIN,GEN_LIGHTMAP_RENDER_MARGIN);
    
        // ray trace the triangle
       
    genLightmap.renderTriangle(map,meshIdx,trigIdx,simpleLightmap,ctx,[pt0,pt1,pt2],[v0,v1,v2],normal,lft,top,(lft+GEN_LIGHTMAP_CHUNK_SIZE),(top+GEN_LIGHTMAP_CHUNK_SIZE));

        // add the UV
    
    var renderLft=lft+GEN_LIGHTMAP_RENDER_MARGIN;
    var renderTop=top+GEN_LIGHTMAP_RENDER_MARGIN;

    uvIdx=mesh.indexes[trigIdx*3]*2;
    lightmapUVs[uvIdx]=(pt0.x+renderLft)/GEN_LIGHTMAP_TEXTURE_SIZE;
    lightmapUVs[uvIdx+1]=(pt0.y+renderTop)/GEN_LIGHTMAP_TEXTURE_SIZE;
    
    uvIdx=mesh.indexes[(trigIdx*3)+1]*2;
    lightmapUVs[uvIdx]=(pt1.x+renderLft)/GEN_LIGHTMAP_TEXTURE_SIZE;
    lightmapUVs[uvIdx+1]=(pt1.y+renderTop)/GEN_LIGHTMAP_TEXTURE_SIZE;
    
    uvIdx=mesh.indexes[(trigIdx*3)+2]*2;
    lightmapUVs[uvIdx]=(pt2.x+renderLft)/GEN_LIGHTMAP_TEXTURE_SIZE;
    lightmapUVs[uvIdx+1]=(pt2.y+renderTop)/GEN_LIGHTMAP_TEXTURE_SIZE;
};
    
//
// create lightmap
//

genLightmap.createLightmapForMesh=function(view,map,meshIdx,simpleLightmap,lightmapList,meshList,callbackFunc)
{
    var n,lightmapIdx,chunkIdx,nTrig;
    var lft,top;
    var mesh,ctx;
    var lightmapUVs;
    
    wsNextStatusBar();
    
    mesh=map.meshes[meshIdx];
    nTrig=mesh.trigCount;

        // find a lightmap to put mesh into

    lightmapIdx=-1;

    for (n=0;n!==lightmapList.length;n++) {

            // check to see if we can fit

        if ((GEN_LIGHTMAP_CHUNK_PER_TEXTURE-lightmapList[n].chunkIdx)>nTrig) {
            lightmapIdx=n;
            break;
        }
    }

        // if we didn't find a lightmap, make a new one

    if (lightmapIdx===-1) {
        lightmapIdx=lightmapList.length;
        lightmapList[lightmapIdx]=new genLightmapBitmapObject(genLightmap.startCanvas());
    }

        // UVs for this mesh

    lightmapUVs=new Float32Array(mesh.vertexCount*2);

        // write polys to chunk

    chunkIdx=lightmapList[lightmapIdx].chunkIdx;
    ctx=lightmapList[lightmapIdx].canvas.getContext('2d');

    for (n=0;n!==nTrig;n++) {

        lft=(chunkIdx%GEN_LIGHTMAP_CHUNK_SPLIT)*GEN_LIGHTMAP_CHUNK_SIZE;
        top=Math.floor(chunkIdx/GEN_LIGHTMAP_CHUNK_SPLIT)*GEN_LIGHTMAP_CHUNK_SIZE;

        genLightmap.writePolyToChunk(map,meshIdx,n,simpleLightmap,lightmapIdx,ctx,lft,top,lightmapUVs);

        chunkIdx++;
    }

    lightmapList[lightmapIdx].chunkIdx=chunkIdx;

        // set this data in the meshList
        // will be used later to setup the meshes
        // themselves

    meshList[meshIdx].lightmapIdx=lightmapIdx;
    meshList[meshIdx].lightmapUVs=lightmapUVs;
    
        // move on to next mesh
        // if out of mesh, finish up creation
        // by saving the light maps
        
    meshIdx++;
    if (meshIdx>=map.meshes.length) {
        setTimeout(function() { genLightmap.createFinish(view,lightmapList,meshList,callbackFunc); },GEN_LIGHTMAP_TIMEOUT_MSEC);
        return;
    }
    
        // next mesh
    
    setTimeout(function() { genLightmap.createLightmapForMesh(view,map,meshIdx,simpleLightmap,lightmapList,meshList,callbackFunc); },GEN_LIGHTMAP_TIMEOUT_MSEC);
};

//
// create lightmap
// creation has to be done by a timer because this
// is too slow and browsers will bounce the script
//

genLightmap.create=function(view,map,simpleLightmap,callbackFunc)
{
    var n;
    var nMesh=map.meshes.length;
    
    wsStartStatusBar(map.meshes.length+2);
    
        // array of bitmaps that make up the lightmap
        // each is an object with a canvas and the last chunk
        // drawn to (the chunkIdx)
        
    var lightmapList=[];
    
        // a list paralell to the meshes that keeps
        // a record of indexes and UVs so we can set
        // all the meshes at the end (because the light
        // map object isn't created until then)
        
    var meshList=[];
    
        // run through the meshes and build
        // cahce to speed up ray tracing
    
    for (n=0;n!==nMesh;n++) {
        meshList.push(new genLightmapMeshObject());
        map.meshes[n].buildTrigRayTraceCache();
    }
    
    wsNextStatusBar();
    
        // run through the meshes
        // by a timer so we don't trigger the
        // script time out problem
        
    setTimeout(function() { genLightmap.createLightmapForMesh(view,map,0,simpleLightmap,lightmapList,meshList,callbackFunc); },GEN_LIGHTMAP_TIMEOUT_MSEC);
};
    
genLightmap.createFinish=function(view,lightmapList,meshList,callbackFunc)
{
    var n;
    
        // turn canvas into lightmap
        // and put lightmap in map
        
        // the index is used as the id
        
    for (n=0;n!==lightmapList.length;n++) {
        map.addLightmap(new mapLightmapObject(view,n,lightmapList[n].canvas));
    }
    
        // and finally push all the required
        // data to the meshes
    
    var lightMesh;
    var nMesh=map.meshes.length;
    
    for (n=0;n!==nMesh;n++) {
        lightMesh=meshList[n];
        map.meshes[n].setLightmap(map.lightmaps[lightMesh.lightmapIdx],lightMesh.lightmapUVs);
    }
    
    wsNextStatusBar();
    
        // finish with the callback
        
    callbackFunc();
};
