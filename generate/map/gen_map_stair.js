"use strict";

//
// map stairs
//

function GenRoomStairs(map,genRandom)
{
    this.map=map;
    this.genRandom=genRandom;
    
        // constants
        
    this.STEP_COUNT=10;
    
        //
        // create a single wall in vertexes
        //
        
    this.createSingleWallX=function(idx,vertexList,x,yBoundBottom,yBoundTop,zBound)
    {
        vertexList[idx++].position.set(x,yBoundBottom.min,zBound.min);
        vertexList[idx++].position.set(x,yBoundTop.min,zBound.max);
        vertexList[idx++].position.set(x,yBoundTop.max,zBound.max);
        vertexList[idx++].position.set(x,yBoundBottom.max,zBound.min);
        return(idx);
    };
    
    this.createSingleWallZ=function(idx,vertexList,xBound,yBoundBottom,yBoundTop,z)
    {
        vertexList[idx++].position.set(xBound.min,yBoundBottom.min,z);
        vertexList[idx++].position.set(xBound.max,yBoundTop.min,z);
        vertexList[idx++].position.set(xBound.max,yBoundTop.max,z);
        vertexList[idx++].position.set(xBound.min,yBoundBottom.max,z);
        return(idx);
    };
    
    this.createSingleCeilingX=function(idx,vertexList,xBound,yBoundBottom,yBoundTop,zBound)
    {
        vertexList[idx++].position.set(xBound.min,yBoundBottom.min,zBound.min);
        vertexList[idx++].position.set(xBound.max,yBoundTop.min,zBound.min);
        vertexList[idx++].position.set(xBound.max,yBoundTop.min,zBound.max);
        vertexList[idx++].position.set(xBound.min,yBoundBottom.min,zBound.max);
        return(idx);
    };
    
    this.createSingleCeilingZ=function(idx,vertexList,xBound,yBoundBottom,yBoundTop,zBound)
    {
        vertexList[idx++].position.set(xBound.min,yBoundBottom.min,zBound.min);
        vertexList[idx++].position.set(xBound.min,yBoundTop.min,zBound.max);
        vertexList[idx++].position.set(xBound.max,yBoundTop.min,zBound.max);
        vertexList[idx++].position.set(xBound.max,yBoundBottom.min,zBound.min);
        return(idx);
    };
    
        //
        // normal utilities
        //
        
    this.createNormalsForPolygon=function(nIdx,vertexList,nx,ny,nz)
    {
        var n;
        
        for (n=0;n!==4;n++) {
            vertexList[nIdx++].normal.set(nx,ny,nz);
        }
        
        return(nIdx);
    };
    
        //
        // utility routine to complete sets of
        // stair vertices into meshes
        //
        
    this.finishStairMesh=function(bitmap,vertexList,buildNormals,meshCenterPoint,normalsIn,flags)
    {
            // build the indexes
            // everything we build is a quad so
            // we have 6 * # of quads in indexes
            
        var n;
        var iCount=Math.floor(Math.floor(vertexList.length)/4)*6;

        var indexes=new Uint16Array(iCount);
        
        var vIdx=0;

        for (n=0;n!==iCount;n+=6) {
            indexes[n]=vIdx;
            indexes[n+1]=vIdx+1;
            indexes[n+2]=vIdx+2;
            
            indexes[n+3]=vIdx;
            indexes[n+4]=vIdx+2;
            indexes[n+5]=vIdx+3;
            
            vIdx+=4;
        }
        
            // create the mesh and
            // add to map
               
        if (buildNormals) meshUtility.buildVertexListNormals(vertexList,indexes,meshCenterPoint,normalsIn);
        meshUtility.buildVertexListUVs(bitmap,vertexList);
        meshUtility.buildVertexListTangents(vertexList,indexes);

        var mesh=new MapMeshObject(bitmap,vertexList,indexes,flags);        
        this.map.addMesh(mesh);
    };

        //
        // create stairs
        //

    this.createStairsX=function(roomBitmap,stairBitmap,xBound,yBound,zBound,toPlatform,includeBack,flip)
    {
        var n,idx,stepAdd;
        var vertexList;
        var xStepBound,yStepBound,yBoundTop,yBoundBottom,zStepBound,zThickBound;
        
            // need a center point to better
            // create normals
            
        var meshCenterPoint=new wsPoint(xBound.getMidPoint(),yBound.getMidPoint(),zBound.getMidPoint());
        
            // stairs need to be pushed in on
            // the edges so they have a wall thickness
            
        var thickSize=Math.floor(zBound.getSize()*0.05);
        
            // height of stairs and steps
            
        var stairHigh=yBound.getSize();
        var stepDrop=stairHigh/this.STEP_COUNT;
        
            // the stair room

        if (!toPlatform) {
            
            if (!flip) {
                yBoundTop=yBound.copy();
                yBoundTop.add(-stairHigh);
                yBoundBottom=yBound;
            }
            else {
                yBoundTop=yBound;
                yBoundBottom=yBound.copy();
                yBoundBottom.add(-stairHigh);
            }
            
            yBoundTop.min+=settings.roomFloorDepth;
            yBoundBottom.min+=settings.roomFloorDepth;

                // internal walls

            idx=0;
            vertexList=meshUtility.createMapVertexList(16);

            idx=this.createSingleWallX(idx,vertexList,xBound.min,yBoundTop,yBoundTop,zBound);
            idx=this.createSingleWallX(idx,vertexList,xBound.max,yBoundBottom,yBoundBottom,zBound);
            idx=this.createSingleWallZ(idx,vertexList,xBound,yBoundTop,yBoundBottom,(zBound.min+thickSize));
            idx=this.createSingleWallZ(idx,vertexList,xBound,yBoundTop,yBoundBottom,(zBound.max-thickSize));
            this.finishStairMesh(roomBitmap,vertexList,true,meshCenterPoint,true,this.map.MESH_FLAG_ROOM_WALL);
            
                // external walls
  
            idx=0;
            vertexList=meshUtility.createMapVertexList(16);
            
            zThickBound=new wsBound(zBound.min,(zBound.min+thickSize));
            idx=this.createSingleWallX(idx,vertexList,xBound.min,yBoundTop,yBoundTop,zThickBound);
            idx=this.createSingleWallX(idx,vertexList,xBound.max,yBoundBottom,yBoundBottom,zThickBound); 
            zThickBound=new wsBound((zBound.max-thickSize),zBound.max);
            idx=this.createSingleWallX(idx,vertexList,xBound.min,yBoundTop,yBoundTop,zThickBound);
            idx=this.createSingleWallX(idx,vertexList,xBound.max,yBoundBottom,yBoundBottom,zThickBound);
            this.finishStairMesh(roomBitmap,vertexList,true,meshCenterPoint,false,this.map.MESH_FLAG_ROOM_WALL);

               // the ceiling

            idx=0;
            vertexList=meshUtility.createMapVertexList(4);

            zStepBound=new wsBound((zBound.min+thickSize),(zBound.max-thickSize));
            this.createSingleCeilingX(idx,vertexList,xBound,yBoundTop,yBoundBottom,zStepBound);
            this.finishStairMesh(roomBitmap,vertexList,true,meshCenterPoint,true,this.map.MESH_FLAG_ROOM_CEILING);
        }
        
            // the stair edges
        
        if (toPlatform) {
            if (!flip) {
                yBoundTop=new wsBound((yBound.max-stepDrop),yBound.max);
                yBoundBottom=new wsBound((yBound.min-stepDrop),yBound.max);
            }
            else {
                yBoundTop=new wsBound((yBound.min-stepDrop),yBound.max);
                yBoundBottom=new wsBound((yBound.max-stepDrop),yBound.max);
            }
            
            var yBoundFront=new wsBound((yBound.max-stepDrop),yBound.max);
            
                // the edges
                
            idx=0;
            vertexList=meshUtility.createMapVertexList(16);
            
            zStepBound=new wsBound(zBound.min,(zBound.min+thickSize));
            
            idx=this.createSingleWallZ(idx,vertexList,xBound,yBoundBottom,yBoundTop,zStepBound.min);
            idx=this.createSingleWallZ(idx,vertexList,xBound,yBoundBottom,yBoundTop,zStepBound.max);
            idx=this.createSingleWallX(idx,vertexList,(flip?xBound.min:xBound.max),yBoundFront,yBoundFront,zStepBound);
            this.createSingleCeilingX(idx,vertexList,xBound,yBoundBottom,yBoundTop,zStepBound);
            this.finishStairMesh(stairBitmap,vertexList,true,meshCenterPoint,false,this.map.MESH_FLAG_STAIR);
            
            idx=0;
            vertexList=meshUtility.createMapVertexList(16);
            
            zStepBound=new wsBound((zBound.max-thickSize),zBound.max);
            
            idx=this.createSingleWallZ(idx,vertexList,xBound,yBoundBottom,yBoundTop,zStepBound.min);
            idx=this.createSingleWallZ(idx,vertexList,xBound,yBoundBottom,yBoundTop,zStepBound.max);
            idx=this.createSingleWallX(idx,vertexList,(flip?xBound.min:xBound.max),yBoundFront,yBoundFront,zStepBound);
            this.createSingleCeilingX(idx,vertexList,xBound,yBoundBottom,yBoundTop,zStepBound);
            this.finishStairMesh(stairBitmap,vertexList,true,meshCenterPoint,false,this.map.MESH_FLAG_STAIR);
            
                // the behind box brace
            
            if (includeBack) {
                var xBraceBound;
                var braceSize=Math.floor(xBound.getSize()*0.4);

                if (!flip) {
                    xBraceBound=new wsBound((xBound.min-braceSize),xBound.min);
                }
                else {
                    xBraceBound=new wsBound(xBound.max,(xBound.max+braceSize));
                }
                this.map.addMesh(meshPrimitives.createMeshCube(stairBitmap,xBraceBound,yBound,zBound,false,!flip,flip,true,true,false,false,this.map.MESH_FLAG_STAIR));
            }
        }
        
            // the steps
        
        idx=0;
        vertexList=meshUtility.createMapVertexList((this.STEP_COUNT*4)*2);
        
        var nIdx=0;
        if (!flip) {
            stepAdd=xBound.getSize()/this.STEP_COUNT;
            xStepBound=new wsBound(xBound.min,(xBound.min+stepAdd));
        }
        else {
            stepAdd=-(xBound.getSize()/this.STEP_COUNT);
            xStepBound=new wsBound((xBound.max+stepAdd),xBound.max);
        }
        
        yStepBound=new wsBound(yBound.min,(yBound.min+stepDrop));
        if (!toPlatform) yStepBound.add(-settings.roomFloorDepth);
        
        zStepBound=new wsBound((zBound.min+thickSize),(zBound.max-thickSize));
        
        for (n=0;n!==this.STEP_COUNT;n++) {
            if (!flip) {
                idx=this.createSingleWallX(idx,vertexList,xStepBound.max,yStepBound,yStepBound,zStepBound);
                nIdx=this.createNormalsForPolygon(nIdx,vertexList,1.0,0.0,0.0);
            }
            else {
                idx=this.createSingleWallX(idx,vertexList,xStepBound.min,yStepBound,yStepBound,zStepBound);
                nIdx=this.createNormalsForPolygon(nIdx,vertexList,-1.0,0.0,0.0);
            }
            
            idx=this.createSingleCeilingX(idx,vertexList,xStepBound,yStepBound,yStepBound,zStepBound);
            nIdx=this.createNormalsForPolygon(nIdx,vertexList,0.0,-1.0,0.0);
           
            yStepBound.add(stepDrop);
            xStepBound.add(stepAdd);
        }
        
        this.finishStairMesh(stairBitmap,vertexList,false,meshCenterPoint,true,this.map.MESH_FLAG_STAIR);
    };

    this.createStairsZ=function(roomBitmap,stairBitmap,xBound,yBound,zBound,toPlatform,includeBack,flip)
    {
        var n,idx,stepAdd;
        var vertexList;
        var xStepBound,yStepBound,yBoundTop,yBoundBottom,zStepBound,xThickBound;
        
            // need a center point to better
            // create normals
            
        var meshCenterPoint=new wsPoint(xBound.getMidPoint(),yBound.getMidPoint(),zBound.getMidPoint());
        
            // stairs need to be pushed in on
            // the edges so they have a wall thickness
            
        var thickSize=Math.floor(zBound.getSize()*0.05);
        
            // height of stairs and steps
            
        var stairHigh=yBound.getSize();
        var stepDrop=stairHigh/this.STEP_COUNT;
        
            // the stair room
            
        if (!toPlatform) {
            
            if (!flip) {
                yBoundTop=yBound.copy();
                yBoundTop.add(-stairHigh);
                yBoundBottom=yBound;
            }
            else {
                yBoundTop=yBound;
                yBoundBottom=yBound.copy();
                yBoundBottom.add(-stairHigh);
            }
            
            yBoundTop.min+=settings.roomFloorDepth;
            yBoundBottom.min+=settings.roomFloorDepth;

                // internal walls

            idx=0;
            vertexList=meshUtility.createMapVertexList(16);

            idx=this.createSingleWallZ(idx,vertexList,xBound,yBoundTop,yBoundTop,zBound.min);
            idx=this.createSingleWallZ(idx,vertexList,xBound,yBoundBottom,yBoundBottom,zBound.max);
            idx=this.createSingleWallX(idx,vertexList,(xBound.min+thickSize),yBoundTop,yBoundBottom,zBound);
            idx=this.createSingleWallX(idx,vertexList,(xBound.max-thickSize),yBoundTop,yBoundBottom,zBound);
            this.finishStairMesh(roomBitmap,vertexList,true,meshCenterPoint,true,this.map.MESH_FLAG_ROOM_WALL);

                // external walls
            
            idx=0;
            vertexList=meshUtility.createMapVertexList(16);
            
            xThickBound=new wsBound(xBound.min,(xBound.min+thickSize));
            idx=this.createSingleWallZ(idx,vertexList,xThickBound,yBoundTop,yBoundTop,zBound.min);
            idx=this.createSingleWallZ(idx,vertexList,xThickBound,yBoundBottom,yBoundBottom,zBound.max);
            xThickBound=new wsBound((xBound.max-thickSize),xBound.max);
            idx=this.createSingleWallZ(idx,vertexList,xThickBound,yBoundTop,yBoundTop,zBound.min);
            idx=this.createSingleWallZ(idx,vertexList,xThickBound,yBoundBottom,yBoundBottom,zBound.max);
            this.finishStairMesh(roomBitmap,vertexList,true,meshCenterPoint,false,this.map.MESH_FLAG_ROOM_WALL);
           
               // the ceiling

            idx=0;
            vertexList=meshUtility.createMapVertexList(4);

            xStepBound=new wsBound((xBound.min+thickSize),(xBound.max-thickSize));
            this.createSingleCeilingZ(idx,vertexList,xStepBound,yBoundTop,yBoundBottom,zBound);
            this.finishStairMesh(roomBitmap,vertexList,true,meshCenterPoint,true,this.map.MESH_FLAG_ROOM_CEILING);
        }
        
            // the stair edges
        
        if (toPlatform) {
            if (!flip) {
                yBoundTop=new wsBound((yBound.max-stepDrop),yBound.max);
                yBoundBottom=new wsBound((yBound.min-stepDrop),yBound.max);
            }
            else {
                yBoundTop=new wsBound((yBound.min-stepDrop),yBound.max);
                yBoundBottom=new wsBound((yBound.max-stepDrop),yBound.max);
            }
            
            var yBoundFront=new wsBound((yBound.max-stepDrop),yBound.max);
            
                // the edges
                
            idx=0;
            vertexList=meshUtility.createMapVertexList(16);
            
            xStepBound=new wsBound(xBound.min,(xBound.min+thickSize));
            
            idx=this.createSingleWallX(idx,vertexList,xStepBound.min,yBoundBottom,yBoundTop,zBound);
            idx=this.createSingleWallX(idx,vertexList,xStepBound.max,yBoundBottom,yBoundTop,zBound);
            idx=this.createSingleWallZ(idx,vertexList,xStepBound,yBoundFront,yBoundFront,(flip?zBound.min:zBound.max));
            this.createSingleCeilingZ(idx,vertexList,xStepBound,yBoundBottom,yBoundTop,zBound);
            this.finishStairMesh(stairBitmap,vertexList,true,meshCenterPoint,false,this.map.MESH_FLAG_STAIR);
            
            idx=0;
            vertexList=meshUtility.createMapVertexList(16);
            
            xStepBound=new wsBound((xBound.max-thickSize),xBound.max);
            
            idx=this.createSingleWallX(idx,vertexList,xStepBound.min,yBoundBottom,yBoundTop,zBound);
            idx=this.createSingleWallX(idx,vertexList,xStepBound.max,yBoundBottom,yBoundTop,zBound);
            idx=this.createSingleWallZ(idx,vertexList,xStepBound,yBoundFront,yBoundFront,(flip?zBound.min:zBound.max));
            this.createSingleCeilingZ(idx,vertexList,xStepBound,yBoundBottom,yBoundTop,zBound);
            this.finishStairMesh(stairBitmap,vertexList,true,meshCenterPoint,false,this.map.MESH_FLAG_STAIR);
            
                // the behind box brace
            
            if (includeBack) {
                var zBraceBound;
                var braceSize=Math.floor(zBound.getSize()*0.4);

                if (!flip) {
                    zBraceBound=new wsBound((zBound.min-braceSize),zBound.min);
                }
                else {
                    zBraceBound=new wsBound(zBound.max,(zBound.max+braceSize));
                }
                this.map.addMesh(meshPrimitives.createMeshCube(stairBitmap,xBound,yBound,zBraceBound,false,true,true,!flip,flip,false,false,this.map.MESH_FLAG_STAIR));
            }
        }
        
            // the steps
        
        idx=0;
        vertexList=meshUtility.createMapVertexList((this.STEP_COUNT*4)*2);
        
        var nIdx=0;
        if (!flip) {
            stepAdd=zBound.getSize()/this.STEP_COUNT;
            zStepBound=new wsBound(zBound.min,(zBound.min+stepAdd));

        }
        else {
            stepAdd=-(zBound.getSize()/this.STEP_COUNT);
            zStepBound=new wsBound((zBound.max+stepAdd),zBound.max);
        }
        
        yStepBound=new wsBound(yBound.min,(yBound.min+stepDrop));
        if (!toPlatform) yStepBound.add(-settings.roomFloorDepth);
        
        xStepBound=new wsBound((xBound.min+thickSize),(xBound.max-thickSize));

        for (n=0;n!==this.STEP_COUNT;n++) {
            if (!flip) {
                idx=this.createSingleWallZ(idx,vertexList,xStepBound,yStepBound,yStepBound,zStepBound.max);
                nIdx=this.createNormalsForPolygon(nIdx,vertexList,0.0,0.0,1.0);
            }
            else {
                idx=this.createSingleWallZ(idx,vertexList,xStepBound,yStepBound,yStepBound,zStepBound.min);
                nIdx=this.createNormalsForPolygon(nIdx,vertexList,0.0,0.0,-1.0);
            }
            
            idx=this.createSingleCeilingZ(idx,vertexList,xStepBound,yStepBound,yStepBound,zStepBound);
            nIdx=this.createNormalsForPolygon(nIdx,vertexList,0.0,-1.0,0.0);
           
            yStepBound.add(stepDrop);
            zStepBound.add(stepAdd);
        }
        
        this.finishStairMesh(stairBitmap,vertexList,false,meshCenterPoint,true,this.map.MESH_FLAG_STAIR);
    };
    
}

