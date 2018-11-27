//
// generic shader light class
//

export default class ShaderLightClass
{
    constructor()
    {
        this.positionIntensityUniform=null;
        this.colorExponentUniform=null;
        this.boxXBoundUniform=null;
        this.boxZBoundUniform=null;
        
        Object.seal(this);
    }
}
