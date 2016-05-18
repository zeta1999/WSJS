"use strict";

//
// input class
//

class InputClass
{
    constructor()
    {
            // the single player entity
            
        this.playerEntity=null;

            // input flags

        this.eventsAttached=false;
        
        this.keyFlags=new Uint8Array(255);
        
        this.mouseChangeX=0;
        this.mouseChangeY=0;
        
        this.mouseButtonFlags=new Uint8Array(8);
        
            // listeners
            // need to set them to a variables so remove
            // can find them later
            
        this.keyDownListener=this.keyDownEvent.bind(this);
        this.keyUpListener=this.keyUpEvent.bind(this);
        
        this.pointerLockChangeListener=this.pointerLockChange.bind(this);
        this.pointerLockErrorListener=this.pointerLockError.bind(this);
        
        this.mouseDownListener=this.mouseDown.bind(this);
        this.mouseUpListener=this.mouseUp.bind(this);
        this.mouseMovedListener=this.mouseMove.bind(this);
        
        Object.seal(this);
    }
    
        //
        // initialize/release input
        //

    initialize(playerEntity)
    {
        var n;
        
            // set to player entity
            
        this.playerEntity=playerEntity;

            // clear any flags

        this.keyClear();
        this.mouseButtonClear();
    }

    release()
    {
        if (this.eventsAttached) {
            this.keyEnd();
            this.mouseEnd();
        }
    }
    
        //
        // pause state
        //
        
    setPauseState(pause)
    {
        if (pause) {
            
                // unattach any events
                
            if (this.eventsAttached) {
                this.keyEnd();
                this.mouseEnd();
                this.eventsAttached=false;
            }
            
                // and make sure a click
                // unpaused
                
            view.canvas.onclick=view.setPauseState.bind(view,false,false);
        }
        else {
            
                // clear the unpause click
                
            view.canvas.onclick=null;
            
                // attach events
                
            this.keyStart();
            this.mouseStart();
            this.eventsAttached=true;
        }
    }
    
        //
        // run input from main loop
        //

    run()
    {
        this.playerEntity.setTurnSpeed(0.0);
        this.playerEntity.setLookSpeed(0.0);
        this.playerEntity.setForwardSpeed(0.0);
        this.playerEntity.setSideSpeed(0.0);
        this.playerEntity.setVerticalSpeed(0.0);        // supergumba -- this is all temporary, we need to do start/stop here so acc/decl can take place
        
            // left arrow and right arrow
            // turning

        if (this.keyFlags[37]) this.playerEntity.setTurnSpeed(-3.0);
        if (this.keyFlags[39]) this.playerEntity.setTurnSpeed(3.0);

            // up arrow or W
            // down arrow or S
            // forward and backwards

        if ((this.keyFlags[38]) || (this.keyFlags[87])) this.playerEntity.setForwardSpeed(125.0);
        if ((this.keyFlags[40]) || (this.keyFlags[83])) this.playerEntity.setForwardSpeed(-125.0);

            // A and D
            // sidestep

        if (this.keyFlags[65]) this.playerEntity.setSideSpeed(-75.0);
        if (this.keyFlags[68]) this.playerEntity.setSideSpeed(75.0);
        
            // space jump
            
        if (this.keyFlags[32]) this.playerEntity.startJump();
        
            // mouse 0 fire
            
        if (this.mouseButtonFlags[0]) this.playerEntity.fireCurrentWeapon();
        
            // m flips map on/off
            
        if (this.keyFlags[77]) {
            this.keyFlags[77]=0;        // force it up
            view.mapOverlayStateFlip();
        }

            // - and +
            // up or down

        if (this.keyFlags[61]) this.playerEntity.setVerticalSpeed(-125.0);
        if (this.keyFlags[173]) this.playerEntity.setVerticalSpeed(125.0);

            // [ and ]
            // look up or down

        if (this.keyFlags[219]) this.playerEntity.setLookSpeed(1.5);
        if (this.keyFlags[221]) this.playerEntity.setLookSpeed(-1.5);
        
            // mouse turning
            
        if (this.mouseChangeX!==0) {
            this.playerEntity.setTurnSpeed(this.mouseChangeX);
            this.mouseChangeX=0;
        }
        
        if (this.mouseChangeY!==0) {
            this.playerEntity.setLookSpeed(-this.mouseChangeY);
            this.mouseChangeY=0;
        }
    }

        //
        // start/stop key events
        //

    keyStart()
    {
        this.keyClear();
            
        document.addEventListener('keydown',this.keyDownListener,true);
        document.addEventListener('keyup',this.keyUpListener.bind(this),true);
    }
    
    keyEnd()
    {
        document.removeEventListener('keydown',this.keyDownListener,true);
        document.removeEventListener('keyup',this.keyUpListener,true);
    }
   
    keyDownEvent(event)
    {
        this.keyFlags[event.keyCode]=1;
    }
    
    keyClear()
    {
        var n;
            
        for (n=0;n!==255;n++) {
            this.keyFlags[n]=0;
        }
    }
    
        //
        // key event callbacks
        //
        
    keyUpEvent(event)
    {
        this.keyFlags[event.keyCode]=0;
    }
    
        // start/stop mouse events
        // supergumba -- eventually get rid of moz/webkit stuff
    
    mouseStart()
    {
        this.mouseButtonClear();
        
            // request the pointer lock
            
        if (view.canvas.requestPointerLock) {
            document.addEventListener('pointerlockchange',this.pointerLockChangeListener,false);
            document.addEventListener('pointerlockerror',this.pointerLockErrorListener,false);
            view.canvas.requestPointerLock();
            console.log('did pointer lock');
        }
        else {
            if (view.canvas.mozRequestPointerLock) {
                document.addEventListener('mozpointerlockchange',this.pointerLockChangeListener,false);
                document.addEventListener('mozpointerlockerror',this.pointerLockErrorListener,false);
                view.canvas.mozRequestPointerLock();
                console.log('did moz pointer lock');
            }
            else {
                if (view.canvas.webkitRequestPointerLock) {
                    document.addEventListener('webkitpointerlockchange',pointerLockChangeListener,false);
                    document.addEventListener('webkitpointerlockerror',this.pointerLockErrorListener,false);
                    view.canvas.webkitRequestPointerLoc();
                    console.log('did webkit pointer lock');
                }
                else {
                    console.log('Pointer lock not supported, no mouse control');
                    return;
                }
            }
        }
    }
    
    mouseEnd()
    {
            // stop pointer lock
            
        if (document.exitPointerLock) {
            document.exitPointerLock();
            document.addEventListener('pointerlockchange',this.pointerLockChangeListener,false);
            document.addEventListener('pointerlockerror',this.pointerLockErrorListener,false);
        }
        else {
            if (document.mozExitPointerLock) {
                document.mozExitPointerLock();
                document.addEventListener('mozpointerlockchange',this.pointerLockChangeListener,false);
                document.addEventListener('mozpointerlockerror',this.pointerLockErrorListener,false);
            }
            else {
                if (document.webkitExitPointerLock) {
                    document.webkitExitPointerLock();
                    document.addEventListener('webkitpointerlockchange',this.pointerLockChangeListener,false);
                    document.addEventListener('webkitpointerlockerror',this.pointerLockErrorListener,false);
                }
            }
        }
    }
    
    mouseButtonClear()
    {
        var n;
        
        this.mouseChangeX=0;
        this.mouseChangeY=0;
            
        for (n=0;n!==8;n++) {
            this.mouseButtonFlags[n]=0;
        }
    }
    
        // mouse event callbacks
    
    pointerLockChange(event)
    {
        var elem=null;
        if (document.pointerLockElement) elem=document.pointerLockElement;
        if (document.mozPointerLockElement) elem=document.mozPointerLockElement;
        if (document.webkitPointerLockElement) elem=document.webkitPointerLockElement;
        
        if (elem===view.canvas) {
            document.addEventListener('mousedown',this.mouseDownListener,false);
            document.addEventListener('mouseup',this.mouseUpListener,false);
            document.addEventListener('mousemove',this.mouseMovedListener,false);
        }
        else {
            document.removeEventListener('mousedown',this.mouseDownListener,false);
            document.removeEventListener('mouseup',this.mouseUpListener,false);
            document.removeEventListener('mousemove',this.mouseMovedListener,false);
            view.setPauseState(true,false);       // go into pause
        }
    }
    
    pointerLockError(err)
    {
        console.log('PointerLock: '+err);
    }
    
    mouseDown(event)
    {
        this.mouseButtonFlags[event.button]=1;
    }
    
    mouseUp(event)
    {
        this.mouseButtonFlags[event.button]=0;
    }
    
    mouseMove(event)
    {
        this.mouseChangeX+=event.movementX;
        this.mouseChangeY+=event.movementY;
    }

}

//
// the input global object
//

var input=new InputClass();
