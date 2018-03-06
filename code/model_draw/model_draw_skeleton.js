import * as constants from '../../code/main/constants.js';
import PointClass from '../../code/utility/point.js';
import ModelBoneClass from '../../code/model/model_bone.js';
import ModelLimbClass from '../../code/model/model_limb.js';
import genRandom from '../../generate/utility/random.js';

//
// model draw skeleton class
//

export default class ModelDrawSkeletonClass
{
    constructor(view,model)
    {
        this.view=view;
        this.model=model;
        
            // animations

        this.lastAnimationTick=0;
        this.lastAnimationMillisec=1;
        this.lastAnimationFlip=false;          // supergumba -- temporary for random animations
        
        Object.seal(this);
    }
    
        //
        // functions to handle clear, moving
        // and tweening the prev, next, and current
        // pose
        //
        
    moveNextPoseToPrevPose()
    {
        let n,bone;
        let nBone=this.bones.length;
        
        for (n=0;n!==nBone;n++) {
            bone=this.bones[n];
            bone.prevPoseAngle.setFromPoint(bone.nextPoseAngle);
        }
    }
    
    clearNextPose()
    {
        let n,bone;
        let nBone=this.bones.length;
        
        for (n=0;n!==nBone;n++) {
            bone=this.bones[n];
            bone.nextPoseAngle.setFromValues(0.0,0.0,0.0);
        }
    }
    
        //
        // animate bones
        //
    
    rotatePoseBoneRecursive(boneIdx,ang)
    {
        let n,nChild,bone,parentBone;
        let rotVector;
        
            // get the bone
            
        bone=this.bones[boneIdx];
        
            // if it has a parent, then rotate around
            // the parent, otherwise, the bone remains
            // at it's neutral position
            
        if (bone.parentBoneIdx!==-1) {
            parentBone=this.bones[bone.parentBoneIdx];
            
            rotVector=new PointClass(bone.vectorFromParent.x,bone.vectorFromParent.y,bone.vectorFromParent.z);
            rotVector.rotate(ang);
            
            bone.curPosePosition.setFromAddPoint(parentBone.curPosePosition,rotVector);
        }
        else {
            bone.curPosePosition.setFromPoint(bone.position);
        }
        
            // need to pass this bone's rotation on
            // to it's children
            
        bone.curPoseAngle.addPoint(ang);
        
            // now move all children
        
        nChild=bone.childBoneIndexes.length;
        
        for (n=0;n!==nChild;n++) {
            this.rotatePoseBoneRecursive(bone.childBoneIndexes[n],bone.curPoseAngle);
        }
    }
    
    animate()
    {
        let n,bone;
        let nBone=this.bones.length;
        
            // the current factor
            
        let factor=1.0-((this.lastAnimationTick-this.view.timeStamp)/this.lastAnimationMillisec);

            // tween the current angles
            
        for (n=0;n!==nBone;n++) {
            bone=this.bones[n];
            bone.curPoseAngle.tween(bone.prevPoseAngle,bone.nextPoseAngle,factor);
        }
        
            // now move all the bones, starting at
            // the base
            
        this.rotatePoseBoneRecursive(this.baseBoneIdx,new PointClass(0.0,0.0,0.0));
    }
    
    resetAnimation()
    {
        this.lastAnimationTick=0;
        this.lastAnimationMillisec=1;
        this.lastAnimationFlip=false;
    }
    
        //
        // pose utilities
        //
        
    poseSetLeg(limb,walking)
    {
        let r,flipLeg;

        r=0.0;
        if (walking) r=genRandom.randomInBetween(20.0,40.0);
        
        flipLeg=limb.flipped;
        if (this.lastAnimationFlip) flipLeg=!flipLeg;
        
        if (flipLeg) {
            this.bones[limb.boneIndexes[0]].nextPoseAngle.setFromValues(r,0.0,0.0);
            this.bones[limb.boneIndexes[1]].nextPoseAngle.setFromValues((r*0.7),0.0,0.0);
            this.bones[limb.boneIndexes[2]].nextPoseAngle.setFromValues(-(r*0.8),0.0,0.0);
        }
        else {
            this.bones[limb.boneIndexes[0]].nextPoseAngle.setFromValues(-r,0.0,0.0);
            this.bones[limb.boneIndexes[1]].nextPoseAngle.setFromValues(-(r*2.0),0.0,0.0);
            this.bones[limb.boneIndexes[2]].nextPoseAngle.setFromValues(0.0,0.0,0.0);
        }
    }
    
    poseSetArm(limb,armAngle,walking)
    {
        let r,z;
        
        r=0.0;
        if (walking) r=genRandom.randomInBetween(20.0,40.0);
        
        z=limb.flipped?-armAngle:armAngle;
        if (this.lastAnimationFlip) r=-r;
        
        this.bones[limb.boneIndexes[0]].nextPoseAngle.setFromValues(0.0,-r,z);
        this.bones[limb.boneIndexes[1]].nextPoseAngle.setFromValues(0.0,-(r*0.5),(z*0.9));
    }
    
    poseSetBody(limb,startAng,extraAng)
    {
        let n,x;
        let nBone=limb.boneIndexes.length;

        x=genRandom.randomInBetween(startAng,extraAng);
        if (this.lastAnimationFlip) x=-x;
        
            // always start past hip bone as we don't
            // want to rotate against the base bone
            
        for (n=1;n!==nBone;n++) {
            this.bones[limb.boneIndexes[n]].nextPoseAngle.setFromValues(x,0.0,0.0);
            x*=0.75;
        }
    }
    
    poseSetWhip(limb)
    {
        let n,x,z;
        let nBone=limb.boneIndexes.length;

        if (this.lastAnimationFlip) {
            x=genRandom.randomInBetween(5,10);
            z=genRandom.randomInBetween(5,10);
        }
        else {
            x=-genRandom.randomInBetween(15,45);
            z=-genRandom.randomInBetween(15,45);
        }
            
        for (n=0;n!==nBone;n++) {
            this.bones[limb.boneIndexes[n]].nextPoseAngle.setFromValues(x,0.0,z);
            x*=1.1;
            z*=1.1;
        }
    }
    
    poseSetHeadSnout(limb)
    {
        let n,y;
        let nBone=limb.boneIndexes.length;

        y=genRandom.randomInBetween(5,10);
        if (this.lastAnimationFlip) y=-y;
            
        for (n=0;n!==nBone;n++) {
            this.bones[limb.boneIndexes[n]].nextPoseAngle.setFromValues(0.0,y,0.0);
            y*=1.1;
        }
    }
    
    poseSetHeadJaw(limb)
    {
        let n,x;
        let nBone=limb.boneIndexes.length;

        x=-genRandom.randomInBetween(25,40);
        if (this.lastAnimationFlip) x=-10;
            
        for (n=0;n!==nBone;n++) {
            this.bones[limb.boneIndexes[n]].nextPoseAngle.setFromValues(x,0.0,0.0);
        }
    }
   
        //
        // walk poses
        //
        
    walkNextPose()
    {
        let n,limb;
        let nLimb=this.limbs.length;
        
        let armLeftZAngle=45.0;
        let armRightZAngle=45.0;
        
        for (n=0;n!==nLimb;n++) {
            limb=this.limbs[n];
            
            switch (limb.limbType) {
                case constants.LIMB_TYPE_BODY:
                    this.poseSetBody(limb,5.0,5.0);
                    break;
                case constants.LIMB_TYPE_HEAD:
                    this.poseSetBody(limb,5.0,15.0);
                    break;
                case constants.LIMB_TYPE_LEG:
                    this.poseSetLeg(limb,true);
                    break;
                case constants.LIMB_TYPE_ARM:
                    if (limb.side===constants.LIMB_SIDE_LEFT) {
                        this.poseSetArm(limb,armLeftZAngle,true);
                        armLeftZAngle+=5.0;
                    }
                    else {
                        this.poseSetArm(limb,armRightZAngle,true);
                        armRightZAngle+=5.0;
                    }
                    break;
                case constants.LIMB_TYPE_WHIP:
                    this.poseSetWhip(limb);
                    break;
            }
        }
        
        this.lastAnimationFlip=!this.lastAnimationFlip;
    }
    
    walkPose()
    {
            // time for a new pose?
            
        if (this.view.timeStamp<this.lastAnimationTick) return;
        
            // next pose 3 seconds away (testing)
        
        this.lastAnimationMillisec=2000;
        this.lastAnimationTick=this.view.timeStamp+this.lastAnimationMillisec;
        
            // move current next pose to last pose
            
        this.moveNextPoseToPrevPose();
        
            // construct new pose

        this.clearNextPose();
        this.walkNextPose();
    }
    
        //
        // idle poses
        //
        
    idleNextPose()
    {
        let n,limb;
        let nLimb=this.limbs.length;
        
        let armLeftZAngle=45.0;
        let armRightZAngle=45.0;
        
        for (n=0;n!==nLimb;n++) {
            limb=this.limbs[n];
            
            switch (limb.limbType) {
                case constants.LIMB_TYPE_BODY:
                    this.poseSetBody(limb,3.0,3.0);
                    break;
                case constants.LIMB_TYPE_HEAD:
                    this.poseSetBody(limb,0.0,10.0);
                    break;
                case constants.LIMB_TYPE_LEG:
                    this.poseSetLeg(limb,false);
                    break;
                case constants.LIMB_TYPE_ARM:
                    if (limb.side===constants.LIMB_SIDE_LEFT) {
                        this.poseSetArm(limb,armLeftZAngle,false);
                        armLeftZAngle+=5.0;
                    }
                    else {
                        this.poseSetArm(limb,armRightZAngle,false);
                        armRightZAngle+=5.0;
                    }
                    break;
                case constants.LIMB_TYPE_WHIP:
                    this.poseSetWhip(limb);
                    break;
            }
        }
        
        this.lastAnimationFlip=!this.lastAnimationFlip;
    }
        
    idlePose()
    {
            // time for a new pose?
            
        if (this.view.timeStamp<this.lastAnimationTick) return;
        
            // next pose 4 seconds away
            
        this.lastAnimationMillisec=4000;
        this.lastAnimationTick=this.view.timeStamp+this.lastAnimationMillisec;
        
            // move current next pose to last pose
            
        this.moveNextPoseToPrevPose();
        
            // construct new pose

        this.clearNextPose();
        this.idleNextPose();
    }

}
