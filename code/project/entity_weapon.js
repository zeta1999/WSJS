import PointClass from '../utility/point.js';
import BoundClass from '../utility/bound.js';
import EntityClass from '../project/entity.js';

class EntityWeaponFireClass
{
    constructor(core,weapon,fireObj)
    {
        this.core=core;
        this.weapon=weapon;
        
        this.ammo=0;
        this.ammoInitialCount=this.core.game.lookupValue(fireObj.ammoInitialCount,weapon.data,0);
        this.ammoMaxCount=this.core.game.lookupValue(fireObj.ammoMaxCount,weapon.data,0);
        this.ammoRegenerateTick=this.core.game.lookupValue(fireObj.ammoRegenerateTick,weapon.data,-1);
        
        this.interfaceAmmoIcon=this.core.game.lookupValue(fireObj.interfaceAmmoIcon,weapon.data,null);
        this.interfaceAmmoText=this.core.game.lookupValue(fireObj.interfaceAmmoText,weapon.data,null);
        this.interfaceAmmoCount=this.core.game.lookupValue(fireObj.interfaceAmmoCount,weapon.data,null);
                
        this.type=weapon.FIRE_TYPE_LIST.indexOf(this.core.game.lookupValue(fireObj.type,weapon.data,null));
        this.waitTick=this.core.game.lookupValue(fireObj.waitTick,weapon.data,0);
        
        this.damage=this.core.game.lookupValue(fireObj.damage,weapon.data,0);
        this.distance=this.core.game.lookupValue(fireObj.distance,weapon.data,0);
        this.hitEffect=this.core.game.lookupValue(fireObj.hitEffect,weapon.data,null);
        
        this.projectileJson=this.core.game.lookupValue(fireObj.projectileJson,weapon.data,null);
        
        this.animation=this.core.game.lookupAnimationValue(fireObj.animation);
        this.fireSound=this.core.game.lookupSoundValue(fireObj.sounds.fire);
        
        this.lastFireTimestamp=0;
        this.lastRegenerateTimestamp=0;
        
        Object.seal(this);
    }
    
    ready()
    {
        this.ammo=this.ammoInitialCount;
        
        this.lastFireTimestamp=0;
        this.lastRegenerateTimestamp=this.core.timestamp+this.ammoRegenerateTick;
    }
    
    addAmmo(count)
    {
        if ((this.interfaceAmmoIcon!==null) && (this.weapon.heldBy===this.core.map.entityList.getPlayer())) this.core.interface.pulseElement(this.interfaceAmmoIcon,500,10);
        
        this.ammo+=count;
        if (this.ammo>this.ammoMaxCount) this.ammo=this.ammoMaxCount;
    }
    
    updateUI()
    {
        if (this.interfaceAmmoText!==null) this.core.interface.updateText(this.interfaceAmmoText,this.ammo);
        if (this.interfaceAmmoCount!==null) this.core.interface.setCount(this.interfaceAmmoCount,this.ammo);
    }
    
    resetRegenerateAmmo()
    {
        this.lastRegenerateTimestamp=this.core.timestamp+this.ammoRegenerateTick;
    }
    
    regenerateAmmo()
    {
        if (this.ammoRegenerateTick!==-1) {
            if (this.core.timestamp>this.lastRegenerateTimestamp) {
                this.lastRegenerateTimestamp=this.core.timestamp+this.ammoRegenerateTick;
                this.addAmmo(1);
            }
        }
    }
}

export default class EntityWeaponClass extends EntityClass
{
    constructor(core,name,json,position,angle,data,mapSpawn,spawnedBy,heldBy,show)
    {
        super(core,name,json,position,angle,data,mapSpawn,spawnedBy,heldBy,show);
        
        this.FIRE_TYPE_HIT_SCAN=0;
        this.FIRE_TYPE_PROJECTILE=1;
        
        this.FIRE_TYPE_LIST=['hit_scan','projectile'];
        
        this.idleAnimation=null;
        
        this.interfaceCrosshair=null;
        
        this.primary=null;
        this.secondary=null;
        this.tertiary=null;
        
        this.initiallyAvailable=false;
        this.available=false;
        this.fireYSlop=0;
        
        this.lastFireTimestamp=0;
        
        this.handOffset=new PointClass(0,0,0);
        this.handAngle=new PointClass(0,0,0);
        this.fireOffsetAdd=new PointClass(0,0,0);
        this.fireAngleAdd=new PointClass(0,0,0);
        this.botFireRange=new BoundClass(0,0);
        
        this.parentIdleAnimation=null;
        this.parentRunAnimation=null; 
        this.parentFireIdleAnimation=null;
        this.parentPrimaryFireRunAnimation=null;
        this.parentPrimaryFireFreezeMovement=false;
        this.parentSecondaryFireRunAnimation=null;
        this.parentSecondaryFireFreezeMovement=false;
        this.parentTertiaryFireRunAnimation=null;
        this.parentTertiaryFireFreezeMovement=false;
        
            // pre-allocates
        
        this.firePoint=new PointClass(0,0,0);
        this.fireAng=new PointClass(0,0,0);
        this.fireVector=new PointClass(0,0,0);
        this.fireHitPoint=new PointClass(0,0,0);
    }

    initialize()
    {
        if (!super.initialize()) return(false);
        
        this.idleAnimation=this.json.animations.idleAnimation;
        
        this.interfaceCrosshair=this.core.game.lookupValue(this.json.config.interfaceCrosshair,this.data);
       
            // model setup, skip if no model
            
        if (this.model!==null) {
            this.handOffset=new PointClass(this.json.config.handOffset.x,this.json.config.handOffset.y,this.json.config.handOffset.z);
            this.handAngle=new PointClass(this.json.config.handAngle.x,this.json.config.handAngle.y,this.json.config.handAngle.z);

            this.modelEntityAlter.startAnimationChunkInFrames(this.idleAnimation);
        }
        
            // fire setup
        
        this.fireOffsetAdd=new PointClass(this.json.config.fireOffsetAdd.x,this.json.config.fireOffsetAdd.y,this.json.config.fireOffsetAdd.z);
        this.fireAngleAdd=new PointClass(this.json.config.fireAngleAdd.x,this.json.config.fireAngleAdd.y,this.json.config.fireAngleAdd.z);
            
        if (this.json.config.primary!==null) this.primary=new EntityWeaponFireClass(this.core,this,this.json.config.primary);
        if (this.json.config.secondary!==null) this.secondary=new EntityWeaponFireClass(this.core,this,this.json.config.secondary);
        if (this.json.config.tertiary!==null) this.tertiary=new EntityWeaponFireClass(this.core,this,this.json.config.tertiary);
        
            // misc bot setup
            
        this.botFireRange.setFromValues(this.json.config.botFireRange[0],this.json.config.botFireRange[1]);
        
            // some items added to entity so fire methods
            // can have access to parent animations
            
        this.parentIdleAnimation=null;
        this.parentRunAnimation=null; 
        this.parentFireIdleAnimation=null;
        this.parentPrimaryFireRunAnimation=null;
        this.parentPrimaryFireFreezeMovement=false;
        this.parentSecondaryFireRunAnimation=null;
        this.parentSecondaryFireFreezeMovement=false;
        this.parentTertiaryFireRunAnimation=null;
        this.parentTertiaryFireFreezeMovement=false;
        
        return(true);    
    }
    
    ready()
    {
        super.ready();
        
        this.available=this.initiallyAvailable;
        
        if (this.primary!==null) this.primary.ready();
        if (this.secondary!==null) this.secondary.ready();
        if (this.tertiary!==null) this.tertiary.ready();
    }
    
        //
        // ammo
        //
        
    addAmmo(fireMethod,count)
    {
        switch (fireMethod) {
            case 'primary':
                if (this.primary!==null) this.primary.addAmmo(count);
                break;
            case 'secondary':
                if (this.secondary!==null) this.secondary.addAmmo(count);
                break;
            case 'tertiary':
                if (this.tertiary!==null) this.tertiary.addAmmo(count);
                break;
        }
    }
    
    hasAnyAmmo()
    {
        if (this.primary!==null) {
            if (this.primary.ammo!==0) return(true);
        }
        if (this.secondary!==null) {
            if (this.secondary.ammo!==0) return(true);
        }
        if (this.tertiary!==null) {
            if (this.tertiary.ammo!==0) return(true);
        }
        return(false);
    }
    
        //
        // hit scans
        //
        
    hitScan(parentEntity,fire,firePosition,fireAngle)
    {
        let y;
        
            // the hit scan
          
        this.firePoint.setFromPoint(firePosition);
        this.fireAng.setFromAddPoint(fireAngle,this.fireAngleAdd);
        
        this.fireVector.setFromValues(0,0,fire.distance);
        this.fireVector.rotateX(null,this.fireAng.x);
        
        y=this.fireAng.y;
        if (this.fireYSlop!==0) {
            y+=(this.fireYSlop-(Math.random()*(this.fireYSlop*2)));
            if (y<0) y=360+y;
            if (y>360) y-=360;
        }
        this.fireVector.rotateY(null,y);
        
        if (parentEntity.rayCollision(this.firePoint,this.fireVector,this.fireHitPoint)) {
            
                // is this an entity we can hit?
                
            if (parentEntity.hitEntity) {
                if (parentEntity.hitEntity.damage!==undefined) {
                    parentEntity.hitEntity.damage(parentEntity,fire.damage,this.fireHitPoint);
                }
            }
            
                // hit effect
                // push effect point towards entity firing so it shows up better

            if (fire.hitEffect!==null) {
                this.fireVector.normalize();
                this.fireVector.scale(-100);
                this.fireHitPoint.addPoint(this.fireVector);
                this.addEffect(this,fire.hitEffect,this.fireHitPoint,null,true);
            }
        }
    }
    
        //
        // projectiles
        //
        
    projectile(parentEntity,fire,firePosition,fireAngle)
    {
        let y,projEntity;
        
            // fire position
            
        this.firePoint.setFromPoint(this.fireOffsetAdd);
        this.fireAng.setFromAddPoint(fireAngle,this.fireAngleAdd);
        
        this.firePoint.rotateX(null,this.fireAng.x);
        
        y=this.fireAng.y;
        if (this.fireYSlop!==0) {
            y+=(this.fireYSlop-(Math.random()*(this.fireYSlop*2)));
            if (y<0) y=360+y;
            if (y>360) y-=360;
        }
        this.firePoint.rotateY(null,y);

        this.firePoint.addPoint(firePosition);
        
            // spawn from whatever is holding this weapon
            // so it counts as the spawnBy for any damage calculations, etc

        projEntity=this.addEntity(fire.projectileJson,('projectile_'+this.name),this.firePoint,this.fireAng,null,parentEntity,null,true);
        if (projEntity!==null) projEntity.ready();
    }
    
        //
        // fire for type
        //
        
    fireForType(parentEntity,fire,fireAnimation,fireAnimationFreezeMovement,firePosition,fireAngle)
    {
        if (fire.ammo===0) return;
        
        if ((fire.lastFireTimestamp+fire.waitTick)>this.core.timestamp) return;
        fire.lastFireTimestamp=this.core.timestamp;
        
            // fire
            
        fire.ammo--;
        fire.resetRegenerateAmmo();
        
        fire.core.soundList.playJson(firePosition,fire.fireSound);
           
           // weapon animation
           
        if (this.model!==null) {
            if (fireAnimation!==null) this.modelEntityAlter.startAnimationChunkInFrames(fire.animation);
            if (this.idleAnimation!==null) this.modelEntityAlter.queueAnimationChunkInFrames(this.idleAnimation);
        }
        
            // parent animation
            
        if (parentEntity.model!==null) {
            if (!parentEntity.modelEntityAlter.isAnimationQueued()) {   // don't do this if we have a queue, which means another fire is still going on
                if ((parentEntity.movement.x!==0) || (parentEntity.movement.z!==0)) {
                    if (fireAnimation!==null) {
                        parentEntity.modelEntityAlter.interuptAnimationChunkInFrames(fireAnimation);
                        if ((fireAnimationFreezeMovement) && (parentEntity.movementFreezeTick!==undefined)) {
                            parentEntity.movementFreezeTick=this.core.timestamp+parentEntity.modelEntityAlter.getAnimationTickCount(fireAnimation[0],fireAnimation[1]);
                        }
                    }
                }
                else {
                    if (this.parentFireIdleAnimation!==null) parentEntity.modelEntityAlter.interuptAnimationChunkInFrames(this.parentFireIdleAnimation);
                }
            }
        }
        
            // and the fire method
            
        switch (fire.type) {
            case this.FIRE_TYPE_HIT_SCAN:
                this.hitScan(parentEntity,fire,firePosition,fireAngle);
                return;
            case this.FIRE_TYPE_PROJECTILE:
                this.projectile(parentEntity,fire,firePosition,fireAngle);
                return;
        }
    }
    
        //
        // firing
        //
        
    firePrimary(firePosition,fireAngle)
    {
        if (this.primary!==null) this.fireForType(this.heldBy,this.primary,this.parentPrimaryFireRunAnimation,this.parentPrimaryFireFreezeMovement,firePosition,fireAngle);
    }
    
    fireSecondary(firePosition,fireAngle)
    {
        if (this.secondary!==null) this.fireForType(this.heldBy,this.secondary,this.parentSecondaryFireRunAnimation,this.parentSecondaryFireFreezeMovement,firePosition,fireAngle);
    }
    
    fireTertiary(firePosition,fireAngle)
    {
        if (this.tertiary!==null) this.fireForType(this.heldBy,this.tertiary,this.parentTertiaryFireRunAnimation,this.parentTertiaryFireFreezeMovement,firePosition,fireAngle);
    }
    
    fireAny(firePosition,fireAngle)
    {
        if (this.primary!==null) {
            if (this.primary.ammo!==0) {
                this.firePrimary(firePosition,fireAngle);
                return(true);
            }
        }
        
        if (this.secondary!==null) {
            if (this.secondary.ammo!==0) {
                this.fireSecondary(firePosition,fireAngle);
                return(true);
            }
        }
        
        if (this.tertiary!==null) {
            if (this.tertiary.ammo!==0) {
                this.fireTertiary(firePosition,fireAngle);
                return(true);
            }
        }
        
        return(false);
    }
    
        //
        // main run
        //
        
    run()
    {
        let parentEntity=this.heldBy;
      
        super.run();
        
            // do any ammo regen
            
        if (this.primary!==null) this.primary.regenerateAmmo();
        if (this.secondary!==null) this.secondary.regenerateAmmo();
        if (this.tertiary!==null) this.tertiary.regenerateAmmo();
        
            // update any UI if player
            
        if (parentEntity===this.core.map.entityList.getPlayer()) {
            if (this.interfaceCrosshair!==null) this.core.interface.showElement(this.interfaceCrosshair,((this.show)&&(this.core.camera.isFirstPerson())));
            if (this.primary!==null) this.primary.updateUI();
            if (this.secondary!==null) this.secondary.updateUI();
            if (this.tertiary!==null) this.tertiary.updateUI();
        }
    }
        
    drawSetup()
    {
        if (this.model===null) return(false);
        
        this.modelEntityAlter.position.setFromPoint(this.handOffset);
        this.modelEntityAlter.angle.setFromPoint(this.handAngle);
        this.modelEntityAlter.scale.setFromPoint(this.scale);
        this.modelEntityAlter.inCameraSpace=true;
        
        return(this.core.camera.isFirstPerson());
    }

}
