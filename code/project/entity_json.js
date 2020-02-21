import PointClass from '../utility/point.js';
import ProjectEntityClass from '../project/project_entity.js';

//
// json entity class
//

export default class EntityJsonClass extends ProjectEntityClass
{
    constructor(core,name,position,angle,data,overrideJsonName)
    {
        super(core,name,position,angle,data);
        
        this.MODEL_ROTATION_ORDER_XYZ=0;
        this.MODEL_ROTATION_ORDER_XZY=1;
        
        this.MODEL_ROTATION_ORDER_LIST=['XYZ','XZY'];
        
        this.overrideJsonName=overrideJsonName;     // supergumba -- hack to get this all to work while translating to blocks
    }
    
    getJsonName()
    {
        return(null);
    }
    
    initialize()
    {
        let block,blockCode;
        
        super.initialize();
        
            // load the json
            
        if (this.overrideJsonName===undefined) {
            this.json=this.core.game.getCachedJson(this.getJsonName());
        }
        else {
            this.json=this.core.game.getCachedJson(this.overrideJsonName);
        }
        if (this.json===null) return(false);
        
            // setup
            
        if ((this.json.setup.model!==null) && (this.json.setup.model!==undefined)) {
            this.setModel(this.json.setup.model);
            this.modelEntityAlter.rotationOrder=this.MODEL_ROTATION_ORDER_LIST.indexOf(this.json.setup.rotationOrder);
            this.scale.setFromValues(this.json.setup.scale.x,this.json.setup.scale.y,this.json.setup.scale.z);
        }
            
        this.radius=this.json.setup.radius;
        this.height=this.json.setup.height;
        
        this.eyeOffset=this.json.setup.eyeOffset;
        this.weight=this.json.setup.weight;
        
            // add any interface elements
            
        if (!this.core.interface.addFromJson(this.json.interface)) return(false);
        
            // setup the blocks
            
        this.blockCodes=[];
        
        if (this.json.blocks===undefined) return(true);
        /*
        for (block of this.json.blocks) {
            switch (block.type) {
                case 'fps_player':
                    this.blockCodes.push(new BlockFPSPlayerClass(this.core,block));
                    break;
                case 'vehicle':
                    this.blockCodes.push(new BlockVehicleClass(this.core,block));
                    break;
                case 'health':
                    this.blockCodes.push(new BlockHealthClass(this.core,block));
                    break;
                case 'developer':
                    this.blockCodes.push(new BlockDeveloperClass(this.core,block));
                    break;
                case 'fps_control':
                    this.blockCodes.push(new BlockFPSControlClass(this.core,block));
                    break;
                case 'vehicle_control':
                    this.blockCodes.push(new BlockVehicleControlClass(this.core,block));
                    break;
                case 'weapon_list':
                    this.blockCodes.push(new BlockWeaponListClass(this.core,block));
                    break;
                case 'weapon':
                    this.blockCodes.push(new BlockWeaponClass(this.core,block));
                    break;
                case 'fire_hitscan':
                    this.blockCodes.push(new BlockFireHitscanClass(this.core,block));
                    break;
                case 'fire_projectile':
                    this.blockCodes.push(new BlockFireProjectileClass(this.core,block));
                    break;
                case 'projectile':
                    this.blockCodes.push(new BlockProjectileClass(this.core,block));
                    break;
                case 'container':
                    this.blockCodes.push(new BlockContainerClass(this.core,block));
                    break;
                default:
                    console.log('Unknown block for '+this.name+': '+block.type);
                    return(false);
            }
        }

        for (blockCode of this.blockCodes) {
            if (!blockCode.initialize(this)) return(false);
        }
        */
        return(true);
    }
    
    release()
    {
        let blockCode;
        
        for (blockCode of this.blockCodes) {
            blockCode.release(this);
        }
    }
    
    ready()
    {
        let blockCode;
        
        for (blockCode of this.blockCodes) {
            blockCode.ready(this);
        }
    }
    
    run()
    {
        let blockCode;
        
        for (blockCode of this.blockCodes) {
            blockCode.run(this);
        }
    }
        
    drawSetup()
    {
        let blockCode;
        
        for (blockCode of this.blockCodes) {
            if (!blockCode.drawSetup(this)) return(false);
        }
        
        return(true);
    }

}
