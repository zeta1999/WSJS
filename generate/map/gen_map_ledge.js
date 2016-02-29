"use strict";

//
// map ledges
//

function GenRoomLedgeObject(bitmapList,map,genRandom)
{
    this.map=map;
    this.bitmapList=bitmapList;
    this.genRandom=genRandom;
    
        //
        // add ledge chunk
        //

    this.addLedgeChunk=function(room,pts,nSide,high,skipSides,bitmap)
    {
        var n,k,idx;
        var vertexCount,vertexList;
        
            // height
            
        var by=room.yBound.max;
        var ty=by-high;
        
            // get vertex count
        
        vertexCount=(nSide-2)*3;          // the top
        
        for (n=0;n!==nSide;n++) {
            if (!skipSides[n]) vertexCount+=6;
        }
        
            // get cube size

        idx=0;
        vertexList=meshUtility.createMapVertexList(vertexCount);

            // sides

        for (n=0;n!==nSide;n++) {
            if (skipSides[n]) continue;
            
            k=n+1;
            if (k===nSide) k=0;

            vertexList[idx++].position.set(pts[n].x,ty,pts[n].z); 
            vertexList[idx++].position.set(pts[k].x,ty,pts[k].z);        
            vertexList[idx++].position.set(pts[k].x,by,pts[k].z);     
            vertexList[idx++].position.set(pts[n].x,ty,pts[n].z);    
            vertexList[idx++].position.set(pts[k].x,by,pts[k].z);  
            vertexList[idx++].position.set(pts[n].x,by,pts[n].z);
        }

            // top

        for (n=0;n!==(nSide-2);n++) {
            vertexList[idx++].position.set(pts[0].x,ty,pts[0].z);
            vertexList[idx++].position.set(pts[n+1].x,ty,pts[n+1].z);
            vertexList[idx++].position.set(pts[n+2].x,ty,pts[n+2].z);
        }

        var n;

        var indexes=new Uint16Array(vertexCount);

        for (n=0;n!==vertexCount;n++) {
            indexes[n]=n;
        }

            // calculate the normals, then use those to
            // calcualte the uvs, and finally the UVs to
            // calculate the tangents

        meshUtility.buildVertexListNormals(vertexList,indexes,null,false);
        meshUtility.buildVertexListUVs(bitmap,vertexList);
        meshUtility.buildVertexListTangents(vertexList,indexes);

            // finally create the mesh

        this.map.addMesh(new MapMeshObject(bitmap,vertexList,indexes,MESH_FLAG_ROOM_PLATFORM));
    };
        
        //
        // create ledges
        // 
    
    this.createLedges=function(room)
    {
        var x,z;
        var ledgeBitmap=this.bitmapList.get('Map Ledge');
        
            // does this room have a ledge?
            
        if (!this.genRandom.randomPercentage(ROOM_LEDGE_PERCENTAGE)) return;
        
            // ledge width and height
            
        var wid=this.genRandom.randomInt(ROOM_LEDGE_MIN_WIDTH,ROOM_LEDGE_EXTRA_WIDTH);
        var high=this.genRandom.randomInt(ROOM_LEDGE_MIN_HEIGHT,ROOM_LEDGE_EXTRA_HEIGHT);
        
        var xMax=room.xBlockSize*ROOM_BLOCK_WIDTH;
        var zMax=room.zBlockSize*ROOM_BLOCK_WIDTH;
        
        var pts=[new wsPoint(0,0,0),new wsPoint(0,0,0),new wsPoint(0,0,0),new wsPoint(0,0,0),new wsPoint(0,0,0)];

            // left and right sides
        
        for (z=1;z<(room.zBlockSize-1);z++) {
            
            if (room.getEdgeGridValue(0,z)===0) {
                pts[0].set(0,0,(z*ROOM_BLOCK_WIDTH));
                pts[0].move(room.xBound.min,0,room.zBound.min);
                
                pts[1].set(wid,0,(z*ROOM_BLOCK_WIDTH));
                pts[1].move(room.xBound.min,0,room.zBound.min);
                
                pts[2].set(wid,0,((z+1)*ROOM_BLOCK_WIDTH));
                pts[2].move(room.xBound.min,0,room.zBound.min);
                
                pts[3].set(0,0,((z+1)*ROOM_BLOCK_WIDTH));
                pts[3].move(room.xBound.min,0,room.zBound.min);
                
                this.addLedgeChunk(room,pts,4,high,[false,false,false,true],ledgeBitmap);
            }
            
            if (room.getEdgeGridValue((room.xBlockSize-1),z)===0) {
                pts[0].set((xMax-wid),0,(z*ROOM_BLOCK_WIDTH));
                pts[0].move(room.xBound.min,0,room.zBound.min);
                
                pts[1].set(xMax,0,(z*ROOM_BLOCK_WIDTH));
                pts[1].move(room.xBound.min,0,room.zBound.min);
                
                pts[2].set(xMax,0,((z+1)*ROOM_BLOCK_WIDTH));
                pts[2].move(room.xBound.min,0,room.zBound.min);
                
                pts[3].set((xMax-wid),0,((z+1)*ROOM_BLOCK_WIDTH));
                pts[3].move(room.xBound.min,0,room.zBound.min);
                
                this.addLedgeChunk(room,pts,4,high,[false,true,false,false],ledgeBitmap);
            }
        }
        
            // top and bottom sides
            
        for (x=1;x<(room.xBlockSize-1);x++) {
            
            if (room.getEdgeGridValue(x,0)===0) {
                pts[0].set((x*ROOM_BLOCK_WIDTH),0,0);
                pts[0].move(room.xBound.min,0,room.zBound.min);
                
                pts[1].set((x*ROOM_BLOCK_WIDTH),0,wid);
                pts[1].move(room.xBound.min,0,room.zBound.min);
                
                pts[2].set(((x+1)*ROOM_BLOCK_WIDTH),0,wid);
                pts[2].move(room.xBound.min,0,room.zBound.min);
                
                pts[3].set(((x+1)*ROOM_BLOCK_WIDTH),0,0);
                pts[3].move(room.xBound.min,0,room.zBound.min);
                
                this.addLedgeChunk(room,pts,4,high,[false,false,false,true],ledgeBitmap);
            }
            
            if (room.getEdgeGridValue(x,(room.zBlockSize-1))===0) {
                pts[0].set((x*ROOM_BLOCK_WIDTH),0,(zMax-wid));
                pts[0].move(room.xBound.min,0,room.zBound.min);
                
                pts[1].set((x*ROOM_BLOCK_WIDTH),0,zMax);
                pts[1].move(room.xBound.min,0,room.zBound.min);
                
                pts[2].set(((x+1)*ROOM_BLOCK_WIDTH),0,zMax);
                pts[2].move(room.xBound.min,0,room.zBound.min);
                
                pts[3].set(((x+1)*ROOM_BLOCK_WIDTH),0,(zMax-wid));
                pts[3].move(room.xBound.min,0,room.zBound.min);
                
                this.addLedgeChunk(room,pts,4,high,[false,true,false,false],ledgeBitmap);
            }
        }
        
            // corners
            // they can have different heights
            
        high=this.genRandom.randomInt(ROOM_LEDGE_MIN_HEIGHT,ROOM_LEDGE_EXTRA_HEIGHT);
            
        if (room.getEdgeGridValue(0,0)===0) {
            pts[0].set(0,0,0);
            pts[0].move(room.xBound.min,0,room.zBound.min);

            pts[1].set(ROOM_BLOCK_WIDTH,0,0);
            pts[1].move(room.xBound.min,0,room.zBound.min);

            pts[2].set(ROOM_BLOCK_WIDTH,0,wid);
            pts[2].move(room.xBound.min,0,room.zBound.min);

            pts[3].set(wid,0,ROOM_BLOCK_WIDTH);
            pts[3].move(room.xBound.min,0,room.zBound.min);
            
            pts[4].set(0,0,ROOM_BLOCK_WIDTH);
            pts[4].move(room.xBound.min,0,room.zBound.min);

            this.addLedgeChunk(room,pts,5,high,[true,false,false,false,true],ledgeBitmap);
        }
        
        if (room.getEdgeGridValue((room.xBlockSize-1),0)===0) {
            pts[0].set((xMax-ROOM_BLOCK_WIDTH),0,0);
            pts[0].move(room.xBound.min,0,room.zBound.min);

            pts[1].set(xMax,0,0);
            pts[1].move(room.xBound.min,0,room.zBound.min);

            pts[2].set(xMax,0,ROOM_BLOCK_WIDTH);
            pts[2].move(room.xBound.min,0,room.zBound.min);

            pts[3].set((xMax-wid),0,ROOM_BLOCK_WIDTH);
            pts[3].move(room.xBound.min,0,room.zBound.min);
            
            pts[4].set((xMax-ROOM_BLOCK_WIDTH),0,wid);
            pts[4].move(room.xBound.min,0,room.zBound.min);

            this.addLedgeChunk(room,pts,5,high,[true,true,false,false,false],ledgeBitmap);
        }
        
        if (room.getEdgeGridValue((room.xBlockSize-1),(room.zBlockSize-1))===0) {
            pts[0].set((xMax-wid),0,(zMax-ROOM_BLOCK_WIDTH));
            pts[0].move(room.xBound.min,0,room.zBound.min);

            pts[1].set(xMax,0,(zMax-ROOM_BLOCK_WIDTH));
            pts[1].move(room.xBound.min,0,room.zBound.min);

            pts[2].set(xMax,0,zMax);
            pts[2].move(room.xBound.min,0,room.zBound.min);

            pts[3].set((xMax-ROOM_BLOCK_WIDTH),0,zMax);
            pts[3].move(room.xBound.min,0,room.zBound.min);
            
            pts[4].set((xMax-ROOM_BLOCK_WIDTH),0,(zMax-wid));
            pts[4].move(room.xBound.min,0,room.zBound.min);

            this.addLedgeChunk(room,pts,5,high,[false,true,true,false,false],ledgeBitmap);
        }
        
        if (room.getEdgeGridValue(0,(room.zBlockSize-1))===0) {
            pts[0].set(0,0,(zMax-ROOM_BLOCK_WIDTH));
            pts[0].move(room.xBound.min,0,room.zBound.min);

            pts[1].set(wid,0,(zMax-ROOM_BLOCK_WIDTH));
            pts[1].move(room.xBound.min,0,room.zBound.min);

            pts[2].set(ROOM_BLOCK_WIDTH,0,(zMax-wid));
            pts[2].move(room.xBound.min,0,room.zBound.min);

            pts[3].set(ROOM_BLOCK_WIDTH,0,zMax);
            pts[3].move(room.xBound.min,0,room.zBound.min);
            
            pts[4].set(0,0,zMax);
            pts[4].move(room.xBound.min,0,room.zBound.min);

            this.addLedgeChunk(room,pts,5,high,[false,false,false,true,true],ledgeBitmap);
        }
    };
    
}

