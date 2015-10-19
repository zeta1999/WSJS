"use strict";

//
// resource IDs
//

var TEXTURE_WALL=0;
var TEXTURE_FLOOR=1;
var TEXTURE_CEILING=2;
var TEXTURE_STAIR=3;
var TEXTURE_PLATFORM=4;
var TEXTURE_LIGHT=5;
var TEXTURE_BOX=6;
var TEXTURE_PILLAR=7;

//
// textures to build
//

var wsTextureBuildList=
    [
        [TEXTURE_WALL,[GEN_BITMAP_TYPE_BRICK_STACK,GEN_BITMAP_TYPE_BRICK_RANDOM,GEN_BITMAP_TYPE_STONE]],
        [TEXTURE_FLOOR,[GEN_BITMAP_TYPE_TILE_SIMPLE,GEN_BITMAP_TYPE_TILE_COMPLEX,GEN_BITMAP_TYPE_TILE_SMALL,GEN_BITMAP_TYPE_MOSAIC]],
        [TEXTURE_CEILING,[GEN_BITMAP_TYPE_METAL,GEN_BITMAP_TYPE_METAL_BAR,GEN_BITMAP_TYPE_CONCRETE,GEN_BITMAP_TYPE_WOOD_PLANK]],
        [TEXTURE_STAIR,[GEN_BITMAP_TYPE_TILE_SIMPLE,GEN_BITMAP_TYPE_TILE_SMALL,GEN_BITMAP_TYPE_CONCRETE]],
        [TEXTURE_PLATFORM,[GEN_BITMAP_TYPE_METAL,GEN_BITMAP_TYPE_WOOD_PLANK]],
        [TEXTURE_LIGHT,[GEN_BITMAP_TYPE_METAL]],
        [TEXTURE_BOX,[GEN_BITMAP_TYPE_WOOD_BOX,GEN_BITMAP_TYPE_METAL]],
        [TEXTURE_PILLAR,[GEN_BITMAP_TYPE_TILE_SMALL,GEN_BITMAP_TYPE_CONCRETE]]
    ];

//
// global objects
//

var view=new ViewObject();
var map=new MapObject();
var modelList=new ModelListObject();
var entityList=new EntityListObject();
var input=new InputObject();
var debug=new DebugObject();

//
// main loop
//

function wsLoopRun(timeStamp)
{
        // next frame
        
    if (view.loopCancel) return;
    window.requestAnimationFrame(wsLoopRun);
    
        // get integer msec timestamp
    
    var ts=Math.floor(timeStamp);
    
        // run the input
        
    input.run();
   
        // entities and physics
    
    var physicsTick=ts-view.loopLastPhysicTimeStamp;
    view.loopLastPhysicTimeStamp=ts;
    
    if (physicsTick>settings.bailMilliseconds) return;
    
    while (physicsTick>settings.physicsMilliseconds) {
        physicsTick-=settings.physicsMilliseconds;
        
        entityList.run(map);
    }
    
        // drawing
        
    var drawTick=ts-view.loopLastDrawTimeStamp;
    
    if (drawTick>settings.drawMilliseconds) {
        view.loopLastDrawTimeStamp=ts; 

        view.draw(map,entityList);
        
        view.fpsTotal+=drawTick;
        view.fpsCount++;
    }
    
        // the fps
    
    var fpsTime=ts-view.fpsStartTimeStamp;
    if (fpsTime>=1000) {
        view.fps=((view.fpsTotal/view.fpsCount)*1000.0)/fpsTime;
        view.fpsStartTimeStamp=ts;
        
        view.fpsTotal=0;
        view.fpsCount=0;
    }
}

function wsLoopStart()
{
    var timeStamp=window.performance.now();
    var ts=Math.floor(timeStamp);
    
    view.loopLastPhysicTimeStamp=ts;
    view.loopLastDrawTimeStamp=ts;
    
    view.fps=0.0;
    view.fpsTotal=0;
    view.fpsCount=0;
    view.fpsStartTimeStamp=ts;

    view.loopCancel=false;
    
    wsLoopRun(timeStamp);    
}

//
// initialize web-shooter
//
// we do this in a couple timeout steps so
// browser doesn't halt a long running script
//

function wsInit()
{
        // init view
        // webgl and canvas stuff
    
    if (!view.initialize("wsCanvas")) return;
    
        // next step
        
    view.loadingScreenUpdate();
    view.loadingScreenAddString('Initialized WebGL');
    view.loadingScreenAddString('Initializing Internal Structures');
    view.loadingScreenDraw(null);
    
    setTimeout(wsInitInternal,10);
}
    
function wsInitInternal()
{
    if (!map.initialize(view)) return;
    if (!modelList.initialize(view)) return;
    if (!entityList.initialize(view)) return;
    if (!debug.initialize(view)) return;
    
        // create list of dynamic textures
        
    var textureGenRandom=new GenRandomObject(settings.randomSeedMapBitmap);
    
        // next step
    
    view.loadingScreenUpdate();
    view.loadingScreenAddString('Generating Dynamic Textures');
    view.loadingScreenDraw(null);
    
    setTimeout(function() { wsInitBuildTextures(0,textureGenRandom); },10);
}

function wsInitBuildTextures(idx,textureGenRandom)
{
    var bitmapCount=wsTextureBuildList.length;
    
        // pick a random image to generate
        // a texture type
    
    var bitmapId=wsTextureBuildList[idx][0];
    var bitmapTypeList=wsTextureBuildList[idx][1];
    var k=textureGenRandom.randomInt(0,bitmapTypeList.length);
    var bitmapType=bitmapTypeList[k];
    
        // generate bitmap
    
    var genBitmap=new GenBitmapObject(textureGenRandom);
    map.addBitmap(genBitmap.generate(view,bitmapId,bitmapType,debug));
    
        // if more textures, then loop back around
        
    idx++;
    if (idx<bitmapCount) {
        view.loadingScreenDraw(idx/bitmapCount);
        setTimeout(function() { wsInitBuildTextures(idx,textureGenRandom); },10);
        return;
    }
    
        // next step
        
    view.loadingScreenUpdate();
    view.loadingScreenAddString('Generating Dynamic Map');
    view.loadingScreenDraw(null);

    setTimeout(wsInitBuildMap,10);
}

function wsInitBuildMap()
{
        // random seed

    var mapGenRandom=new GenRandomObject(settings.randomSeedMap);

        // build the map
        
    var genMap=new GenMapObject(view,map,mapGenRandom,wsInitBuildMapFinish);
    genMap.build();
}

function wsInitBuildMapFinish()
{
    view.loadingScreenUpdate();
    view.loadingScreenAddString('Building Collision Geometry');
    view.loadingScreenDraw(null);

    setTimeout(wsInitBuildCollisionGeometry,10);
}

function wsInitBuildCollisionGeometry()
{
        // build the collision geometry

    map.buildCollisionGeometry();

        // build the light/mesh intersection lists

    map.buildLightMeshIntersectLists();
    
        // next step
    
    view.loadingScreenUpdate();
    view.loadingScreenAddString('Building Light Map');
    view.loadingScreenDraw(null);

    setTimeout(wsInitBuildLightmap,10);
}

function wsInitBuildLightmap()
{
        // build the light map
        // light maps are a long running
        // process so we need a callback

    var genLightmap=new GenLightmapObject(view,map,debug,settings.generateLightmap,wsInitBuildLightmapFinish);
    genLightmap.create();
}

function wsInitBuildLightmapFinish()
{
    var textureGenRandom=new GenRandomObject(settings.randomSeedModelBitmap);
    var modelGenRandom=new GenRandomObject(settings.randomSeedModel);
    
    view.loadingScreenUpdate();
    view.loadingScreenAddString('Building Models');
    view.loadingScreenDraw(null);

    setTimeout(function() { wsInitBuildModels(0,textureGenRandom,modelGenRandom); },10);
}

function wsInitBuildModels(idx,textureGenRandom,modelGenRandom)
{
    var model,genSkeleton,genModelMesh;
    
        // get a model texture
        
    var genBitmap=new GenBitmapObject(textureGenRandom);    
    var modelBitmap=genBitmap.generate(view,0,GEN_BITMAP_TYPE_SKIN,debug);
    
        // player model if 0
        // else a monster
        
    if (idx===0) {
        model=new ModelObject('player');
    }
    else {
        model=new ModelObject('monster_'+(idx-1));
    }
    
        // build the skeleton and mesh
        
    genSkeleton=new GenSkeletonObject(model,modelGenRandom);
    genSkeleton.build();
    
    genModelMesh=new GenModelMeshObject(model,modelBitmap,modelGenRandom);
    genModelMesh.build(view);
    
    modelList.add(model);
    
        // if more models, then loop back around
        
    idx++;
    if (idx<(settings.modelMonsterCount+1)) {
        view.loadingScreenDraw(idx/settings.modelMonsterCount);    
        setTimeout(function() { wsInitBuildModels(idx,textureGenRandom,modelGenRandom); },10);
        return;
    }
    
        // next step
        
    view.loadingScreenUpdate();
    view.loadingScreenAddString('Building Entities');
    view.loadingScreenDraw(null);
    
    setTimeout(wsInitBuildEntities,10);
}

function wsInitBuildEntities()
{
    var n,monsterModelName;
    
    var entityGenRandom=new GenRandomObject(settings.randomSeedEntity);
    
        // make player entity
        
    entityList.addPlayer(new EntityObject(map.findPlayerStartPosition(),new wsAngle(0.0,0.0,0.0),800,modelList.get('player'),true));
    
        // make monster entities
        
    for (n=0;n!==settings.monsterEntityCount;n++) {
        monsterModelName='monster_'+entityGenRandom.randomInt(0,settings.modelMonsterCount);
        entityList.add(new EntityObject(map.findRandomPosition(entityGenRandom),new wsAngle(0.0,0.0,0.0),800,modelList.get(monsterModelName),false));
    }
    
        // finished
        
    view.loadingScreenUpdate();
    view.loadingScreenAddString('Running');
    view.loadingScreenDraw(null);
        
    setTimeout(wsInitFinish,10);    
}

function wsInitFinish()
{
        // finish by setting up all the mesh
        // buffers and indexes
        
    map.setupBuffers(view);
    
        // ambient
        
    view.ambient.set(settings.ambient[0],settings.ambient[1],settings.ambient[2]);
    
        // start the input
        
    input.initialize(view,entityList.getPlayer());

        // start the main loop
    
    wsLoopStart();
}


