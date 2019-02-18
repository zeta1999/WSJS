import PointClass from '../utility/point.js';
import Point2DClass from '../utility/2D_point.js';

//
// mesh vertex
//

export default class MeshVertexClass
{
    constructor()
    {
        this.position=new PointClass(0,0,0);
        this.normal=new PointClass(0.0,0.0,0.0);
        this.tangent=new PointClass(0.0,0.0,0.0);
        this.uv=new Point2DClass(0.0,0.0);
        
        this.boneConnects=[];
        
        Object.seal(this);
    }
}
