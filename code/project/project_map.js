export default class ProjectMapClass
{
    constructor(core)
    {
        this.core=core;
    }
    
        //
        // initialize and release
        //
        
    initialize()
    {
    }
    
    release()
    {
    }
    
        //
        // override this to load in map
        //
        
    async loadMap()
    {
    }
    
        //
        // override this to add entities to map
        //
        
    loadEntities()
    {
    }
}
