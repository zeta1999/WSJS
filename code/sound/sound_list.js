import PointClass from '../utility/point.js';
import SoundClass from '../sound/sound.js';
import SoundPlayClass from '../sound/sound_play.js';

//
// core sound list class
//

export default class SoundListClass
{
    constructor(core)
    {
        this.MAX_CONCURRENT_SOUNDS=8;                   // maximum number of concurrent sounds you can have playing
        
        this.core=core;
        
        this.sounds=new Map();
        
            // global audio setup
            
        this.ctx=null;
        this.listener=null;
        
        this.currentListenerEntity=null;
        this.listenerForwardVector=new PointClass(0.0,0.0,1.0);            // local to global to avoid GC
        
            // playing sounds

        this.soundPlays=null;

        Object.seal(this);
    }
    
        //
        // initialize and release
        //

    initialize()
    {
        let n;
        
            // initialize the audio context
            
        let initAudioContext=window.AudioContext||window.webkitAudioContext;
        this.ctx=new initAudioContext();
        
        if (this.ctx===null) {
            alert('Could not initialize audio context');
            return(false);
        }
        
            // list of playing sounds
        
        this.soundPlays=[];
        
        for (n=0;n!==this.MAX_CONCURRENT_SOUNDS;n++) {
            this.soundPlays.push(new SoundPlayClass(this));
        }
       
            // get a reference to the listener
            
        this.listener=this.ctx.listener;
        
        return(true);
    }

    release()
    {
        let n;
        
        for (n=0;n!==this.MAX_CONCURRENT_SOUNDS;n++) {
            this.soundPlays[n].close();
        }
        
        this.soundPlays=[];
    }
    
        //
        // suspend and resume all sound context
        //
        
    suspend()
    {
        this.ctx.suspend();
    }
    
    resume()
    {
        this.ctx.resume();
    }
    
        //
        // get a sound
        //
        
    get(name)
    {
        return(this.sounds.get(name));
    }
    
        //
        // loading
        //
        
    addSound(name)
    {
        let sound;
        
        if ((name===undefined) || (name===null)) return;        // name can come from json
        
        if (this.sounds.has(name)) return;
        
        sound=new SoundClass(this.core,this.ctx,name);
        sound.initialize();
            
        this.sounds.set(name,sound);
    }
    
    addSoundByNameAttribute(elem)
    {
        if ((elem===undefined) || (elem===null)) return;
        if ((elem.name!==undefined) && (elem.name!==null)) this.addSound(elem.name);
    }
    
    addSoundBySoundNameAttribute(elem)
    {
        if ((elem===undefined) || (elem===null)) return;  
        this.addSoundByNameAttribute(elem.sound);
    }

    async loadAllSounds()
    {
        let entityDef,effectDef,keys,key;
        let mesh,move,liquid;
        let keyIter,rtn;
        let success,promises;
        let game=this.core.game;
        
            // map based sounds
            
        for (mesh of this.core.map.meshList.meshes) {
            if (mesh.movement!==null) {
                for (move of mesh.movement.moves) {
                    if (move.sound!==null) this.addSound(move.sound.name);
                }
            }
        }
        
        for (liquid of this.core.map.liquidList.liquids) {
            if (liquid.soundIn!==null) this.addSound(liquid.soundIn.name);
            if (liquid.soundOut!==null) this.addSound(liquid.soundOut.name);
        }
            
        keys=Object.keys(game.jsonEntityCache);
        
        for (key of keys)
        {
            entityDef=game.jsonEntityCache[key];

            this.addSoundBySoundNameAttribute(entityDef.config.primary);
            this.addSoundBySoundNameAttribute(entityDef.config.secondary);
            this.addSoundBySoundNameAttribute(entityDef.config.tertiary);
            
            if (entityDef.sounds!==undefined) {
                this.addSoundByNameAttribute(entityDef.sounds.hurtSound);
                this.addSoundByNameAttribute(entityDef.sounds.dieSound);
                this.addSoundByNameAttribute(entityDef.sounds.pickupSound);
                this.addSoundByNameAttribute(entityDef.sounds.bounceSound);
                this.addSoundByNameAttribute(entityDef.sounds.reflectSound);
                this.addSoundByNameAttribute(entityDef.sounds.spawnSound);
                this.addSoundByNameAttribute(entityDef.sounds.openSound);
                this.addSoundByNameAttribute(entityDef.sounds.closeSound);
                this.addSoundByNameAttribute(entityDef.sounds.wakeUpSound);
                this.addSoundByNameAttribute(entityDef.sounds.meleeSound);
                this.addSoundByNameAttribute(entityDef.sounds.deathSound);
                this.addSoundByNameAttribute(entityDef.sounds.fallSound);
                this.addSoundByNameAttribute(entityDef.sounds.engineSound);
                this.addSoundByNameAttribute(entityDef.sounds.skidSound);
                this.addSoundByNameAttribute(entityDef.sounds.crashKartSound);
                this.addSoundByNameAttribute(entityDef.sounds.crashWallSound);
            }
        }
        
        keys=Object.keys(game.jsonEffectCache);
        
        for (key of keys)
        {
            effectDef=game.jsonEffectCache[key];
            this.addSoundBySoundNameAttribute(effectDef);
        }
        
            // load the sounds
            
        promises=[];
        
        keyIter=this.sounds.keys();
        
        while (true) {
            rtn=keyIter.next();
            if (rtn.done) break;
            
            promises.push(this.sounds.get(rtn.value).load());
        }

            // and await them all
            
        success=true;
        
        await Promise.all(promises)
            .then
                (
                    (values)=>{
                        success=!values.includes(false);
                    },
                );

        return(success);
    }
    
        //
        // setup listener
        //
        
    setListenerToEntity(entity)
    {
        this.currentListenerEntity=entity;
    }
    
    updateListener()
    {
        let n;
        
        if (this.listener===null) return;
        
            // update listener
            
        this.listenerForwardVector.setFromValues(0,0,1);
        this.listenerForwardVector.rotateY(null,this.currentListenerEntity.angle.y);
        
        if (this.listener.positionX) {        // backwards compatiablity
            this.listener.positionX.value=this.currentListenerEntity.position.x;
            this.listener.positionY.value=this.currentListenerEntity.position.y;
            this.listener.positionZ.value=this.currentListenerEntity.position.z;
        }
        else {
            this.listener.setPosition(this.currentListenerEntity.position.x,this.currentListenerEntity.position.y,this.currentListenerEntity.position.z);
        }
        if (this.listener.forwardX) {        // backwards compatiablity
            this.listener.forwardX.value=this.listenerForwardVector.x;
            this.listener.forwardY.value=this.listenerForwardVector.y;
            this.listener.forwardZ.value=this.listenerForwardVector.z;
            this.listener.upX.value=0.0;
            this.listener.upY.value=1.0;
            this.listener.upZ.value=0.0;
        }
        else {
            this.listener.setOrientation(this.listenerForwardVector.x,this.listenerForwardVector.y,this.listenerForwardVector.z,0,1,0);
        }
        
            // update all playing sounds
            
        for (n=0;n!==this.MAX_CONCURRENT_SOUNDS;n++) {
            if (!this.soundPlays[n].free) this.soundPlays[n].update(this.currentListenerEntity);
        }
    }
        //
        // start playing a sound attached to an entity or mesh
        // (or if no attachment, a global sound)
        //
        
    play(position,name,rate,distance,loopStart,loopEnd,loop)
    {
        let n,idx,sound;
        let soundPlay=null;
        
            // find sound
            
        sound=this.sounds.get(name);
        if (sound===undefined) {
            console.log('warning: unknown sound: '+name);
            return(-1);
        }
        
            // find a free sound play
            
        for (n=0;n!==this.MAX_CONCURRENT_SOUNDS;n++) {
            if (this.soundPlays[n].free) {
                idx=n;
                soundPlay=this.soundPlays[n];
                break;
            }
        }
        
        if (soundPlay===null) return(-1);
        
            // set it to entity
            
        soundPlay.play(this.ctx,this.currentListenerEntity,position,sound,rate,distance,loopStart,loopEnd,loop);
        
        return(idx);
    }
    
    playJson(position,obj)
    {
        let rate;
        
        if (obj===undefined) return(-1);
        if ((obj.name===undefined) || (obj.name==='')) return(-1);
        
        rate=obj.rate;
        if (obj.randomRateAdd!==0) rate+=(Math.random()*obj.randomRateAdd);
        
        return(this.play(position,obj.name,rate,obj.distance,obj.loopStart,obj.loopEnd,obj.loop));
    }
    
    stop(playIdx)
    {
        let soundPlay=this.soundPlays[playIdx];
        
        if (!soundPlay.free) soundPlay.stop();
    }
    
    stopAll()
    {
        let n;
        
        for (n=0;n!==this.MAX_CONCURRENT_SOUNDS;n++) {
            if (!this.soundPlays[n].free) this.soundPlays[n].stop();
        }
    }
    
    changeRate(playIdx,rate)
    {
        let soundPlay=this.soundPlays[playIdx];
        
        if (!soundPlay.free) soundPlay.changeRate(rate);
    }
    
}
