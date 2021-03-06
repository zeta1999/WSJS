import PointClass from '../utility/point.js';
import CoreClass from '../main/core.js';
import GameClass from '../project/game.js';
import MapClass from '../map/map.js';
import ShadowmapLoadClass from '../light/shadowmap_load.js';

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
        this.data=null;

        Object.seal(this);
    }
    
    run(isMultiplayer,data)
    {
            // misc setup
            
        this.core.isMultiplayer=isMultiplayer;
        this.data=data;
        
            // remove any old html and start
            // the canvas
            
        document.body.innerHTML='';
        this.core.createCanvas();
        
            // the project objects
            
        
        setTimeout(this.initCore.bind(this),1);
    }

    async initCore()
    {
        if (!(await this.core.initialize())) return;
        if (!(await this.core.loadShaders())) return;

        this.core.loadingScreenUpdate();
        this.core.loadingScreenAddString('Initializing Game');
        this.core.loadingScreenDraw();

        setTimeout(this.initGame.bind(this),1);
    }

    async initGame()
    {
        let startMap;
        
          // initialize the map
          
        startMap=this.core.game.lookupValue(this.core.game.json.startMap,this.data);
        
        this.core.map=new MapClass(this.core,startMap,this.core.game.autoGenerate);
        if (!this.core.map.initialize()) return;

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
        if (!(await this.core.map.loadMap())) return;
        
        this.core.loadingScreenUpdate();
        this.core.loadingScreenAddString('Building Collision Geometry');
        this.core.loadingScreenDraw();
        
        setTimeout(this.initCollisionGeometry.bind(this),1);
    }
    
    initCollisionGeometry()
    {
        this.core.map.meshList.buildCollisionGeometry();
        
        this.core.loadingScreenUpdate();

        this.core.loadingScreenAddString('Loading Shadowmap');
        this.core.loadingScreenDraw();

        setTimeout(this.initLoadShadowmap.bind(this),1);
    }
    
    async initLoadShadowmap()
    {
        let shadowmapLoad=new ShadowmapLoadClass(this.core);
        
        if (!(await shadowmapLoad.load())) return;
        
        this.core.loadingScreenUpdate();
        this.core.loadingScreenAddString('Load Models');
        this.core.loadingScreenDraw();
       
        setTimeout(this.initLoadModels.bind(this),1);    
    }
    
    async initLoadModels()
    {
        if (!(await this.core.modelList.loadAllModels())) return;
        
        this.core.loadingScreenUpdate();
        this.core.loadingScreenAddString('Load Sounds');
        this.core.loadingScreenDraw();
        
        setTimeout(this.initLoadSounds.bind(this),1);
    }
    
    async initLoadSounds()
    {
        if (!(await this.core.soundList.loadAllSounds())) return;
    
        this.core.loadingScreenUpdate();
        this.core.loadingScreenAddString('Load Images');
        this.core.loadingScreenDraw();

        setTimeout(this.initLoadImages.bind(this),1);
    }
    
    async initLoadImages()
    {
        if (!(await this.core.bitmapList.loadAllBitmaps())) return;
        
        this.core.loadingScreenUpdate();
        this.core.loadingScreenAddString('Initializing Entities and Effects');
        this.core.loadingScreenDraw();
        
        setTimeout(this.initLoadEntities.bind(this),1);
    }
    
    initLoadEntities()
    {
            // call the map ready
        
        this.core.map.ready();
        
            // initialize any map effects
            
        if (!this.core.map.effectList.initializeMapEffects()) return;        // halt on bad effect start

            // initialize any map entities
            
        if (!this.core.map.entityList.initializeMapEntities()) return;    // halt on bad entity start
        
        this.core.loadingScreenUpdate();
        this.core.loadingScreenAddString('Final Setup');
        this.core.loadingScreenDraw();

        setTimeout(this.initFinalSetup.bind(this),1);
    }
    
    initFinalSetup()
    {
            // setup the interface

        if (!this.core.game.ready()) return;       // halt on bad ready
        
            // setup draw buffers

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
        
            // if we are in a networked game, last thing to
            // do is request a map_sync to get the map in the right time
            
        if (this.core.isMultiplayer) {
            this.core.loadingScreenUpdate();
            this.core.loadingScreenAddString('Connecting to Server');
            this.core.loadingScreenDraw();
        
            this.core.network.sync(this.runMultiplayerSyncOK.bind(this),this.runMultiplayerSyncError.bind(this));     // return here, callback from connection or error
            return;
        }
        
            // start the main loop
        
        window.requestAnimationFrame(mainLoop);
    }
    
    runMultiplayerSyncOK()
    {
        window.requestAnimationFrame(mainLoop);
    }
    
    runMultiplayerSyncError()
    {
        alert(this.core.network.lastErrorMessage);
        this.network.disconnect();
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
    let fpsTime,tick,isNetworkGame;
    let core=main.core;
    let map=core.map;
    
        // next frame
        
    if (core.loopCancel) return;
    window.requestAnimationFrame(mainLoop);
    
        // if paused, and not in a network
        // game than nothing to do
        
    isNetworkGame=(core.isMultiplayer) && (!core.setup.localGame);
    if ((core.paused) && (!isNetworkGame)) return;
    
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

                map.meshList.run();
                core.game.run();
                map.entityList.run();
            }
        }
        else {
            core.lastPhysicTimestamp=core.timestamp;
        }

            // update the listener and all current
            // playing sound positions

        core.soundList.updateListener();
    
            // if multiplayer, handle all
            // the network updates and messages
        
        if (isNetworkGame) core.network.run();
    }
    
        // clean up deleted entities
        // and effects
        
    map.entityList.cleanUpMarkedAsDeleted();
    map.effectList.cleanUpMarkedAsDeleted();
    
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
    
        // special check for touch controls
        // pausing the game

    if (core.input.touchMenuTrigger) core.setPauseState(true,false);
}

//
// export the global main
//

export default main;
