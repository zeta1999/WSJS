import * as constants from '../../code/main/constants.js';
import PointClass from '../../code/utility/point.js';
import ModelBoneClass from '../../code/model/model_bone.js';
import ModelLimbClass from '../../code/model/model_limb.js';
import ModelSkeletonClass from '../../code/model/model_skeleton.js';
import GenSkeletonBaseClass from '../../generate/model/gen_skeleton_base.js';
import genRandom from '../../generate/utility/random.js';

//
// gen monster skeleton class
//

export default class GenSkeletonMonsterClass extends GenSkeletonBaseClass
{
    constructor(view,model,sizeFactor)
    {
        super(view,model,sizeFactor);
        Object.seal(this);
    }
    
        //
        // random limbs for monster
        //
    
    buildRandomLimbs(bodyLimbIdx,hunchAng)
    {
        let n,limbCount,limbType,limbRadius,limbAng,armLength,whipLength,angIdx;
        let neckLength,neckRadius,jawRadius,headRadius;
        let boneIdx,fingerCount,toeCount;
        let skeleton=this.model.skeleton;
        let bodyLimb=skeleton.limbs[bodyLimbIdx];
        let legSweepList=[0,45,90,135,180,225,270,315];
        let armWhipSweepList=[0,30,60,90,120,150,180,210,240,270,300,330];
        
        let randomLimbType=[constants.LIMB_TYPE_ARM,constants.LIMB_TYPE_WHIP];
        
            // random limb count
            
        limbCount=genRandom.randomInt(3,10);
        
            // limb sizes
            
        limbRadius=genRandom.randomInt(250,300);
        armLength=genRandom.randomInt(400,2000);
        whipLength=genRandom.randomInt(1000,1500);
        
        neckLength=genRandom.randomInt(250,300);
        neckRadius=genRandom.randomInt(150,200);
        
        jawRadius=genRandom.randomInt((neckRadius+200),500);
        headRadius=genRandom.randomInt((neckRadius+200),500);
        
            // extra piece counts

        fingerCount=genRandom.randomInt(0,5);
        toeCount=genRandom.randomInt(0,5);
        
            // the random limbs
        
        for (n=0;n!==limbCount;n++) {
            
                // always need two legs
                
            if (n<2) {
                limbType=constants.LIMB_TYPE_LEG;
            }
            else {
                limbType=randomLimbType[genRandom.randomIndex(randomLimbType.length)];
            }
            
                // get a bone, depending on hunch, legs can only go
                // in certain places
                
            if (limbType!==constants.LIMB_TYPE_LEG) {
                boneIdx=bodyLimb.boneIndexes[genRandom.randomIndex(bodyLimb.boneIndexes.length)];
            }
            else {
                if (hunchAng>30.0) {
                    boneIdx=bodyLimb.boneIndexes[genRandom.randomIndex(bodyLimb.boneIndexes.length)];
                }
                else {
                    boneIdx=bodyLimb.boneIndexes[0];
                }
            }
            
                // create the limb
                
            switch (limbType) {
                
                case constants.LIMB_TYPE_ARM:
                    angIdx=genRandom.randomIndex(armWhipSweepList.length);
                    limbAng=armWhipSweepList[angIdx];
                    armWhipSweepList.splice(angIdx,1);
                    this.buildLimbArm(n,boneIdx,limbRadius,armLength,limbAng,fingerCount);
                    break;
                    
                case constants.LIMB_TYPE_LEG:
                    angIdx=genRandom.randomIndex(legSweepList.length);
                    limbAng=legSweepList[angIdx];
                    legSweepList.splice(angIdx,1);
                    this.buildLimbLeg(n,boneIdx,limbRadius,limbAng,(90.0-genRandom.randomFloat(0.0,180.0)),toeCount,true);
                    break;
                    
                case constants.LIMB_TYPE_WHIP:
                    angIdx=genRandom.randomIndex(armWhipSweepList.length);
                    limbAng=armWhipSweepList[angIdx];
                    armWhipSweepList.splice(angIdx,1);
                    this.buildLimbWhip(n,boneIdx,limbRadius,whipLength,limbAng);
                    break;
            }
        }
        
            // the head
        
        boneIdx=bodyLimb.boneIndexes[3];
        this.buildLimbHead((limbCount+1),boneIdx,neckLength,neckRadius,jawRadius,headRadius);
    }
    
        //
        // build skeleton bones
        //

    build()
    {
        let bodyLimbIdx,hunchAng;
        
            // get a hunch angle which determines
            // where the legs go
            
        if (genRandom.randomPercentage(0.3)) {        
            hunchAng=genRandom.randomFloat(30.0,60.0);
        }
        else {
            hunchAng=genRandom.randomFloat(0.0,30.0);
        }
        
            // build the skeleton

        this.model.skeleton=new ModelSkeletonClass(this.view);
        
        bodyLimbIdx=this.buildBody(1500,2000,3000,2000,300,1000,1.0,hunchAng);
        this.buildRandomLimbs(bodyLimbIdx,hunchAng);
        
            // setup the bones for animation
            
        this.model.skeleton.precalcAnimationValues();
     }
    
}
