import PointClass from '../utility/point.js';
import CoreClass from '../main/core.js';

//
// main class
//

class MainClass
{
    constructor()
    {
            // core is the global root
            // object for all game objects

        this.core=new CoreClass();

        Object.seal(this);
    }
    
    run(gameClass,isMultiplayer,data)
    {
            // setup networking
            
        this.core.isMultiplayer=isMultiplayer;
        
            // remove any old html and start
            // the canvas
            
        document.body.innerHTML='';
        this.core.createCanvas();
        
            // the project objects
            
        this.core.projectGame=new gameClass(this.core,data);
        this.core.projectMap=this.core.projectGame.getStartProjectMap();
        
        setTimeout(this.initCore.bind(this),1);
    }

    async initCore()
    {
        this.core.initialize();
        if (!(await this.core.loadShaders())) return;

        this.core.loadingScreenUpdate();
        this.core.loadingScreenAddString('Initializing Internal Structures');
        this.core.loadingScreenDraw();

        setTimeout(this.initInternal.bind(this),1);
    }

    initInternal()
    {
        if (!this.core.map.initialize()) return;
        this.core.projectGame.initialize();

            // next step

        if (!this.core.isMultiplayer) {
            this.core.loadingScreenUpdate();
            this.core.loadingScreenAddString('Loading Map');
            this.core.loadingScreenDraw();

            setTimeout(this.initLoadMap.bind(this),1);
        }
        else {
            this.core.loadingScreenUpdate();
            this.core.loadingScreenAddString('Waiting for Setup');
            this.core.loadingScreenDraw();
            
            setTimeout(this.runMultiplayerDialog.bind(this),1);
        }
    }
    
    runMultiplayerDialog()
    {
        this.core.connectDialog.open(this.runMultiplayerDialogContinueLoad.bind(this));     // return here, exit of this dialog will continue on to runMultiplayerDialogContinueLoad()
    }
        
    runMultiplayerDialogContinueLoad()
    {
        this.core.connectDialog.close();
        
            // local games don't connect
            
        if (this.core.setup.localGame) {
            this.runMultiplayerConnectedOK();
            return;
        }
        
            // connect to server
            
        this.core.loadingScreenUpdate();
        this.core.loadingScreenAddString('Connecting to Server');
        this.core.loadingScreenDraw();
        
        this.core.network.connect(this.runMultiplayerConnectedOK.bind(this),this.runMultiplayerConnectedError.bind(this));     // return here, callback from connection or error
    }
    
    runMultiplayerConnectedOK()
    {
        this.core.loadingScreenUpdate();
        this.core.loadingScreenAddString('Loading Map');
        this.core.loadingScreenDraw();
        
        setTimeout(this.initLoadMap.bind(this),1);
    }
    
    runMultiplayerConnectedError()
    {
        alert(this.core.network.lastErrorMessage);
        this.runMultiplayerDialog();
    }
    
    async initLoadMap()
    {
        this.core.projectMap.initialize();
        if (!(await this.core.projectMap.loadMap())) return;
        
        this.core.loadingScreenUpdate();
        this.core.loadingScreenAddString('Building Collision Geometry');
        this.core.loadingScreenDraw();
        
        setTimeout(this.initCollisionGeomtry.bind(this),1);
    }
    
    initCollisionGeomtry()
    {
        this.core.map.meshList.buildCollisionGeometry();
        
        this.core.loadingScreenUpdate();
        this.core.loadingScreenAddString('Loading Entities');
        this.core.loadingScreenDraw();
        
        setTimeout(this.initLoadEntityModels.bind(this),1);
    }
    
    async initLoadEntityModels()
    {
        if (!(await this.core.modelList.loadAllModels())) return;
        
        this.core.map.entityList.setupModelEntityAlters();
        
        this.core.loadingScreenUpdate();
        this.core.loadingScreenAddString('Loading Images');
        this.core.loadingScreenDraw();
        
        setTimeout(this.initLoadImages.bind(this),1);
    }
    
    async initLoadImages()
    {
        if (!(await this.core.bitmapList.loadAllBitmaps())) return;
        
        this.core.loadingScreenUpdate();
        this.core.loadingScreenAddString('Loading Sounds');
        this.core.loadingScreenDraw();

        setTimeout(this.initLoadSounds.bind(this),1);
    }
    
    async initLoadSounds()
    {
        if (!(await this.core.soundList.loadAllSounds())) return;
        
        this.core.loadingScreenUpdate();
        this.core.loadingScreenAddString('Final Setup');
        this.core.loadingScreenDraw();

        setTimeout(this.initFinalSetup.bind(this),1);
    }
    
    initFinalSetup()
    {
            // finish by setting up all the mesh
            // buffers and indexes

        this.core.map.setupBuffers();
        
            // set the listener to this entity
            
        this.core.soundList.setListenerToEntity(this.core.map.entityList.getPlayer());

            // start the input

        this.core.input.initialize(this.core.map.entityList.getPlayer());
        
            // ready all the entities
            
        this.core.map.entityList.ready();
        
            // the cancel loop flag
            
        this.core.loopCancel=false;
        
            // start the main loop in paused mode

        this.core.setPauseState(true,true);
        
            // start the main loop
        
        window.requestAnimationFrame(mainLoop);
    }
}

//
// single global object is the main class
// and contains all other global objects
// (this elimates a bunch of circular logic
// and simplifies imports)
//

let main=new MainClass();

//
// main loop
//

const PHYSICS_MILLISECONDS=16;
const DRAW_MILLISECONDS=16;
const BAIL_MILLISECONDS=5000;

function mainLoop(timestamp)
{
    let fpsTime,tick;
    let core=main.core;
    let map=core.map;
    
        // next frame
        
    if (core.loopCancel) return;
    window.requestAnimationFrame(mainLoop);
    
        // if paused, nothing to do
        
    if (core.paused) return;
    
        // recalculate the timestamp by adding
        // offset from last time we calculated it
        // this seems odd but it's so we can pause
        // without jumps in the timestamp
        
    tick=Math.trunc(window.performance.now());
    core.timestamp+=(tick-core.lastTimestamp);
    core.lastTimestamp=tick;
    
        // map movement, entities, and
        // other physics, we only do this if we've
        // moved unto another physics tick
        
        // this timing needs to be precise so
        // physics remains constants
    
    core.physicsTick=core.timestamp-core.lastPhysicTimestamp;

    if (core.physicsTick>PHYSICS_MILLISECONDS) {

        if (core.physicsTick<BAIL_MILLISECONDS) {       // this is a temporary bail measure in case something held the browser up for a long time

            while (core.physicsTick>PHYSICS_MILLISECONDS) {
                core.physicsTick-=PHYSICS_MILLISECONDS;
                core.lastPhysicTimestamp+=PHYSICS_MILLISECONDS;

                map.movementList.run();
                core.projectGame.run();
                map.entityList.run();
            }
        }
        else {
            core.lastPhysicTimestamp=core.timestamp;
        }

            // update the listener and all current
            // playing sound positions

        core.soundList.updateListener();
    }
    
        // if multiplayer, update the server
        // with player information
        
    if ((core.isMultiplayer) && (!core.setup.localGame)) core.network.sendEntityUpdate(map.entityList.getPlayer());
    
        // drawing
        
        // this timing is loose, as it's only there to
        // draw frames
        
    core.drawTick=core.timestamp-core.lastDrawTimestamp;
    
    if (core.drawTick>DRAW_MILLISECONDS) {
        core.lastDrawTimestamp=core.timestamp; 

        core.draw();
        
        core.fpsTotal+=core.drawTick;
        core.fpsCount++;
    }
    
        // the fps
        
    if (core.fpsStartTimestamp===-1) core.fpsStartTimestamp=core.timestamp; // a reset from paused state
    
    fpsTime=core.timestamp-core.fpsStartTimestamp;
    if (fpsTime>=1000) {
        core.fps=(core.fpsCount*1000.0)/core.fpsTotal;
        core.fpsStartTimestamp=core.timestamp;

        core.fpsTotal=0;
        core.fpsCount=0;
    }
}

//
// export the global main
//

export default main;
