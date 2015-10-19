"use strict";

//
// map platforms
//

function GenRoomPlatform(map,genRandom)
{
    this.map=map;
    this.genRandom=genRandom;
    
        // platform constants
        
    this.SIDE_MIN_Z=0;
    this.SIDE_MIN_X=1;
    this.SIDE_MAX_Z=2;
    this.SIDE_MAX_X=3;
    
        //
        // platform mainline
        // 
    
    this.createPlatforms=function(storyCount,yStoryAdd,roomBitmap,xBound,yBound,zBound)
    {
        var n,platformSide,platformSize,platformSideSize;
        var platformSideMin,platformSideMax,platformSideOpposite;
        var xPlatformBound,xSidePlatformBound,xOppositePlatformBound,zPlatformBound,zSidePlatformBound,zOppositePlatformBound;
        var xStairBound,yStairBound,zStairBound;
        
            // bitmaps
            
        var platformBitmap=this.map.getBitmapById(TEXTURE_PLATFORM);
        var stairBitmap=this.map.getBitmapById(TEXTURE_STAIR);
        
            // stairs
            
        var genRoomStairs=new GenRoomStairs(this.map,this.genRandom);
        
            // do a platform for each story

        var yPlatformBound=yBound.copy();
        var yPlatformBound=new wsBound((yBound.min-500),yBound.min);
        
            // platform for each story
            
        for (n=1;n!==storyCount;n++) {
            
                // get random side to start
                // platform and steps on
                
            platformSide=this.genRandom.randomInt(0,4);
            
                // tell if there is a side or parallel
                // platforms
                
            platformSideMin=this.genRandom.random()<settings.storyPlatformSidePercentage;
            platformSideMax=this.genRandom.random()<settings.storyPlatformSidePercentage;
            platformSideOpposite=this.genRandom.random()<settings.storyPlatformOppositePercentage;
            
                // get random platform size for
                // this side
                
            platformSize=this.genRandom.randomInt(10,20)/100;
            platformSideSize=this.genRandom.randomInt(15,25)/100;
            
                // add the first platform, opposite platform
                // and steps
                
            switch (platformSide) {
                case this.SIDE_MIN_Z:
                    xPlatformBound=xBound;
                    zPlatformBound=new wsBound(zBound.min,(zBound.min+(zBound.getSize()*platformSize)));
                    this.map.addMesh(meshPrimitives.createMeshCube(platformBitmap,xPlatformBound,yPlatformBound,zPlatformBound,false,false,false,true,true,true,true,this.map.MESH_FLAG_ROOM_PLATFORM));
                    
                    xStairBound=new wsBound(xBound.min+((xBound.getSize()*0.50)-2000),xBound.min+((xBound.getSize()*0.50)+2000));
                    zStairBound=new wsBound(zPlatformBound.max,(zPlatformBound.max+5000));
                    genRoomStairs.createStairsZ(roomBitmap,stairBitmap,xStairBound,yBound,zStairBound,true,false);
                    break;
                    
                case this.SIDE_MIN_X:
                    xPlatformBound=new wsBound(xBound.min,(xBound.min+(xBound.getSize()*platformSize)));
                    zPlatformBound=zBound;
                    this.map.addMesh(meshPrimitives.createMeshCube(platformBitmap,xPlatformBound,yPlatformBound,zPlatformBound,false,true,true,false,false,true,true,this.map.MESH_FLAG_ROOM_PLATFORM));
                    
                    xStairBound=new wsBound(xPlatformBound.max,(xPlatformBound.max+5000));
                    zStairBound=new wsBound(zBound.min+((zBound.getSize()*0.50)-2000),zBound.min+((zBound.getSize()*0.50)+2000));
                    genRoomStairs.createStairsX(roomBitmap,stairBitmap,xStairBound,yBound,zStairBound,true,false);
                    
                    if (platformSideOpposite) {
                        xPlatformBound=new wsBound((xBound.max-(xBound.getSize()*platformSize)),xBound.max);
                        this.map.addMesh(meshPrimitives.createMeshCube(platformBitmap,xOppositePlatformBound,yPlatformBound,zPlatformBound,false,true,true,false,false,true,true,this.map.MESH_FLAG_ROOM_PLATFORM));
                        
                        xSidePlatformBound=new wsBound(xOppositePlatformBound.max,xPlatformBound.min);
                    }
                    else {
                        xSidePlatformBound=new wsBound(xBound.min,xPlatformBound.min);
                    }
                    break;
                    
                case this.SIDE_MAX_Z:
                    xPlatformBound=xBound;
                    zPlatformBound=new wsBound((zBound.max-(zBound.getSize()*platformSize)),zBound.max);
                    this.map.addMesh(meshPrimitives.createMeshCube(platformBitmap,xPlatformBound,yPlatformBound,zPlatformBound,false,false,false,true,true,true,true,this.map.MESH_FLAG_ROOM_PLATFORM));
                    
                    xStairBound=new wsBound(xBound.min+((xBound.getSize()*0.50)-2000),xBound.min+((xBound.getSize()*0.50)+2000));
                    zStairBound=new wsBound((zPlatformBound.min-5000),zPlatformBound.min);
                    genRoomStairs.createStairsZ(roomBitmap,stairBitmap,xStairBound,yBound,zStairBound,true,true);
                    break;
                    
                case this.SIDE_MAX_X:
                    xPlatformBound=new wsBound((xBound.max-(xBound.getSize()*platformSize)),xBound.max);
                    zPlatformBound=zBound;
                    this.map.addMesh(meshPrimitives.createMeshCube(platformBitmap,xPlatformBound,yPlatformBound,zPlatformBound,false,true,true,false,false,true,true,this.map.MESH_FLAG_ROOM_PLATFORM));
                    
                    xStairBound=new wsBound((xPlatformBound.min-5000),xPlatformBound.min);
                    zStairBound=new wsBound(zBound.min+((zBound.getSize()*0.50)-2000),zBound.min+((zBound.getSize()*0.50)+2000));
                    genRoomStairs.createStairsX(roomBitmap,stairBitmap,xStairBound,yBound,zStairBound,true,true);
                    
                    if (platformSideOpposite) {
                        xOppositePlatformBound=new wsBound(xBound.min,(xBound.min+(xBound.getSize()*platformSize)));
                        this.map.addMesh(meshPrimitives.createMeshCube(platformBitmap,xOppositePlatformBound,yPlatformBound,zPlatformBound,false,true,true,false,false,true,true,this.map.MESH_FLAG_ROOM_PLATFORM));
                        
                        xSidePlatformBound=new wsBound(xOppositePlatformBound.max,xPlatformBound.min);
                    }
                    else {
                        xSidePlatformBound=new wsBound(xBound.min,xPlatformBound.min);
                    }
                    break;
            }
            
                // add any side platforms
                
            switch (platformSide) {
                case this.SIDE_MIN_Z:
                case this.SIDE_MAX_Z:
                    break;
                case this.SIDE_MIN_X:
                case this.SIDE_MAX_X:
                    if (platformSideMin) {
                        zSidePlatformBound=new wsBound(zBound.min,(zBound.min+(zBound.getSize()*platformSideSize)));
                        this.map.addMesh(meshPrimitives.createMeshCube(platformBitmap,xSidePlatformBound,yPlatformBound,zSidePlatformBound,false,false,false,true,true,true,true,this.map.MESH_FLAG_ROOM_PLATFORM));
                    }
                    if (platformSideMax) {
                        zSidePlatformBound=new wsBound((zBound.max-(zBound.getSize()*platformSize)),zBound.max);
                        this.map.addMesh(meshPrimitives.createMeshCube(platformBitmap,xSidePlatformBound,yPlatformBound,zSidePlatformBound,false,false,false,true,true,true,true,this.map.MESH_FLAG_ROOM_PLATFORM));
                    }
                    break;
            
            }

                // next story

            yPlatformBound.add(-yStoryAdd);
        }
    };
    
}
