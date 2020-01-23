import PointClass from '../utility/point.js';
import BoundClass from '../utility/bound.js';
import CoreClass from '../main/core.js';
import ProjectEntityClass from '../project/project_entity.js';
import ModelClass from '../model/model.js';
import ImportModelClass from '../import/import_model.js';
import MapPathNodeClass from '../map/map_path_node.js';

export default class ProjectEntityRemoteClass extends ProjectEntityClass
{
    constructor(core,remoteId,name)
    {
            // remotes have no position, angle, etc until their first
            // update
            
        super(core,name,new PointClass(0,0,0),new PointClass(0,0,0),null);
        
        this.remoteId=remoteId;
        this.filter='remote';
        
        this.active=false;
        this.show=true;
    }


}