import PointClass from '../utility/point.js';
import Matrix4Class from '../utility/matrix4.js';
import QuaternionClass from '../utility/quaternion.js';

//
// model node class
//

export default class ModelNodeClass
{
    constructor(name,childNodeIdxs,translation,rotation,scale)
    {
        this.name=name;
        this.childNodeIdxs=childNodeIdxs;
        this.translation=translation;   // a point
        this.rotation=rotation;         // a quaternion
        this.scale=scale;               // a point

        this.parentNodeIdx=-1;          // set later in import

        Object.seal(this);
    }
}
