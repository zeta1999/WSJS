import PointClass from '../utility/point.js';
import EntityClass from '../project/entity.js';

export default class EntityPlatformMonsterClass extends EntityClass
{
    constructor(core,name,jsonName,position,angle,data,mapSpawn,spawnedBy,heldBy,show)
    {
        super(core,name,jsonName,position,angle,data,mapSpawn,spawnedBy,heldBy,show);
        
        this.walkSpeed=0;
        this.chaseSpeed=0;
        this.turnSpeed=0;
        this.initialWalkDirection=0;
        this.jumpHeight=0;
        this.jumpWaitTick=0;
        
        this.patrolDistance=0;
        
        this.walkAnimation=null;
        
            // variables
            
        this.startX=0;
        
        this.walkDirection=1;
        this.nextJumpTick=0;

            // pre-allocates
            
        this.movement=new PointClass(0,0,0);
        this.drawAngle=new PointClass(0,90,0);
        
        Object.seal(this);
    }
    
    initialize()
    {
        if (!super.initialize()) return(false);
        
        this.walkSpeed=this.core.game.lookupValue(this.json.config.walkSpeed,this.data,150);
        this.chaseSpeed=this.core.game.lookupValue(this.json.config.chaseSpeed,this.data,200);
        this.initialWalkDirection=this.core.game.lookupValue(this.json.config.initialWalkDirection,this.data,1);
        this.turnSpeed=this.core.game.lookupValue(this.json.config.turnSpeed,this.data,20);
        this.jumpHeight=this.core.game.lookupValue(this.json.config.jumpHeight,this.data,0);
        this.jumpWaitTick=this.core.game.lookupValue(this.json.config.jumpWaitTick,this.data,0);
        
        this.patrolDistance=this.core.game.lookupValue(this.json.config.patrolDistance,this.data,200);
        
        this.walkAnimation=this.core.game.lookupAnimationValue(this.json.animations.walkAnimation);
        
        return(true);
    }
    
    ready()
    {
        super.ready();
        
        this.startX=this.position.x;
        this.walkDirection=this.initialWalkDirection;
        this.nextJumpTick=0;
        
        this.movement.setFromValues(0,0,0);
        this.angle.setFromValues(0,90,0);           // monsters don't have the camera so they can use the regular angle
        
        this.modelEntityAlter.startAnimationChunkInFrames(this.walkAnimation);
    }
        
    run()
    {
        super.run();
        
            // movement keys
            
        this.movement.x=0;
        
        if (this.walkDirection>0) {
            if (this.angle.turnYTowards(90,this.turnSpeed)===0) this.movement.x=this.walkSpeed;
        }
        else {
            if (this.angle.turnYTowards(270,this.turnSpeed)===0) this.movement.x=-this.walkSpeed;
        }
        
            // jumping
            
        if (this.jumpHeight!==0) {
            if ((this.standOnMeshIdx!==-1) || (this.standOnEntity!==null)) {
                if (this.core.timestamp>this.nextJumpTick) {
                    this.nextJumpTick=this.core.timestamp+this.jumpWaitTick;

                    this.movement.y=this.jumpHeight;
                }
            }
            else {
                this.nextJumpTick=this.core.timestamp+this.jumpWaitTick;
            }
        }
        
            // run the movement
            
        this.movement.y=this.moveInMapY(this.movement,1.0,false);
        this.moveInMapXZ(this.movement,false,false);
        
            // hitting something turns patrols around
            
        if (this.collideWallMeshIdx!==-1) {
            this.walkDirection=-this.walkDirection;
        }
        else {
        
                // time to turn around

            if (this.walkDirection>0) {
                if ((this.position.x-this.startX)>this.patrolDistance) {
                    this.position.x=this.startX+this.patrolDistance;
                    this.walkDirection=-1;
                }
            }
            else {
                if ((this.startX-this.position.x)>this.patrolDistance) {
                    this.position.x=this.startX-this.patrolDistance;
                    this.walkDirection=1;
                }
            }
        }
    }

    drawSetup()
    {
        if (this.model===null) return(false);
        
        this.modelEntityAlter.position.setFromPoint(this.position);
        this.modelEntityAlter.angle.setFromPoint(this.angle);
        this.modelEntityAlter.scale.setFromPoint(this.scale);
        this.modelEntityAlter.inCameraSpace=false;

        return(true);
    }
}

