import PointClass from '../utility/point.js';
import EntityKartBaseClass from '../project/entity_kart_base.js';

//
// kart player module
//

export default class EntityKartPlayerClass extends EntityKartBaseClass
{
    constructor(core,name,jsonName,position,angle,data,mapSpawn,spawnedBy,heldBy,show)
    {
        super(core,name,jsonName,position,angle,data,mapSpawn,spawnedBy,heldBy,show);
        
        this.thirdPersonCameraDistance=0;
        this.thirdPersonCameraLookAngle=null;

        this.interfaceSpeedItem=null;
        
        Object.seal(this);
    }
    
    initialize()
    {
        super.initialize();
        
            // player specific json
            
        this.thirdPersonCameraDistance=this.core.game.lookupValue(this.json.config.thirdPersonCameraDistance,this.data,0);
        this.thirdPersonCameraLookAngle=new PointClass(this.json.config.thirdPersonCameraLookAngle.x,this.json.config.thirdPersonCameraLookAngle.y,this.json.config.thirdPersonCameraLookAngle.z);
        
        this.interfaceSpeedItem=this.core.game.lookupValue(this.json.config.interfaceSpeedItem,this.data,null);
            
        return(true);
    }
    
    release()
    {
        super.release();
    }
    
        //
        // ready
        //
        
    ready()
    {
        super.ready();
        
        this.core.camera.gotoThirdPerson(this.thirdPersonCameraDistance,this.thirdPersonCameraLookAngle);
    }
        
        //
        // run kart player
        //
    
    run()
    {
        let x,y,turnAdd,fire;
        let forward,reverse,drifting,brake,jump;
        let textLap;
        let input=this.core.input;
        let setup=this.getSetup();
        
            // interface updates
            
        if (this.interfaceSpeedItem!==null) this.core.interface.setCount(this.interfaceSpeedItem,this.speedItemCount);
        
            // keys
            
        forward=input.isKeyDown('w');
        reverse=input.isKeyDown('s');
        drifting=(input.isKeyDown('a')||input.isKeyDown('d'));
        brake=input.isKeyDown('q');
        jump=input.isKeyDown(' ');
        
            // turning
            
        turnAdd=0;

        x=input.getMouseMoveX();
        if (x!==0) {
            turnAdd=-(x*setup.mouseXSensitivity);
            turnAdd+=(turnAdd*setup.mouseXAcceleration);
            if (setup.mouseXInvert) turnAdd=-turnAdd;
        }
        
            // run the kart
        
        fire=input.mouseButtonFlags[0];  
        this.moveKart(turnAdd,forward,reverse,drifting,brake,fire,jump);
                
            // calculate place
            
        this.calculatePlaces();
        
            // update the UI
            
        textLap=(this.lap===-1)?1:(this.lap+1);
            
        this.core.interface.updateText('place',(this.place+1));
        this.core.interface.updateText('lap',(textLap+'/3'));
        this.core.interface.updateText('speed',this.movement.z);      // testing
        
        if ((this.place!==this.previousPlace) || (this.lap!==this.previousLap)) {
            if ((this.previousPlace!==-1) && (this.previousLap!==-1)) this.core.interface.pulseElement('lap_background',500,10);
            this.previousPlace=this.place;
            this.previousLap=this.lap;
        }
    }
}
