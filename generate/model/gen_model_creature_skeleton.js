/* global modelLimbConstants, genRandom, config, modelConstants, map */

"use strict";

//
// gen creature skeleton class
//

class GenModelCreatureSkeletonClass
{
    constructor(model,sizeFactor)
    {
        this.model=model;
        this.sizeFactor=sizeFactor;
        
        this.SKELETON_GENERAL_HEIGHT=8000;
        
        Object.seal(this);
    }
    
        //
        // build chunks
        //
        
    
    buildLimbLeg(side,index,nameSuffix,vct,boneIdx,hipHigh,kneeHigh,ankleHigh,footHigh,legRadius,footLength,toeCount,toeLength,bodyLimbIdx)
    {
        let legHipBoneIdx,kneeBoneIdx,ankleBoneIdx,footBoneIdx,heelBoneIdx,knuckleBoneIdx,toeBoneIdx;
        let n,knuckleLength,toeRadius,toeTotalLength,fx,fz,vct2,legLimbIdx,footLimbIdx;
        let skeleton=this.model.skeleton;
        let bones=skeleton.bones;
        
            // leg bones
            
        legHipBoneIdx=bones.push(new ModelBoneClass(('LegHip'+nameSuffix),boneIdx,new wsPoint(vct.x,hipHigh,vct.z)))-1;
        kneeBoneIdx=bones.push(new ModelBoneClass(('Knee'+nameSuffix),legHipBoneIdx,new wsPoint(vct.x,kneeHigh,vct.z)))-1;
        ankleBoneIdx=bones.push(new ModelBoneClass(('Ankle'+nameSuffix),kneeBoneIdx,new wsPoint(vct.x,ankleHigh,vct.z)))-1;
        heelBoneIdx=bones.push(new ModelBoneClass(('Heel'+nameSuffix),ankleBoneIdx,new wsPoint(vct.x,footHigh,vct.z)))-1;

        bones[legHipBoneIdx].gravityLockDistance=legRadius; //Math.trunc(genRandom.randomInt(300,1000)*this.sizeFactor);
        bones[kneeBoneIdx].gravityLockDistance=legRadius;
        bones[ankleBoneIdx].gravityLockDistance=legRadius;
        bones[heelBoneIdx].gravityLockDistance=legRadius;

            // foot bones and limb

        vct2=new wsPoint(0.0,0.0,footLength);
        fz=vct.z+vct2.z;
        footBoneIdx=bones.push(new ModelBoneClass(('Foot'+nameSuffix),heelBoneIdx,new wsPoint((vct.x+vct2.x),footHigh,fz)))-1;

        bones[footBoneIdx].gravityLockDistance=legRadius;
        
        footLimbIdx=this.model.skeleton.limbs.push(new ModelLimbClass(modelLimbConstants.LIMB_TYPE_FOOT,index,modelLimbConstants.LIMB_AXIS_Z,5,5,[heelBoneIdx,footBoneIdx]))-1;

            // create leg limb as it connects to both
            // body and foot
            
        legLimbIdx=this.model.skeleton.limbs.push(new ModelLimbClass(modelLimbConstants.LIMB_TYPE_LEG,index,modelLimbConstants.LIMB_AXIS_Y,8,5,[legHipBoneIdx,kneeBoneIdx,ankleBoneIdx]))-1;
        
            // toe bones and limbs
            
        if (toeCount===0) return;
            
        toeRadius=Math.trunc(legRadius*0.5);
        if (toeRadius<100) toeRadius=100;
        
        knuckleLength=Math.trunc(footLength*0.5);
        toeTotalLength=knuckleLength+toeLength;

        fx=(vct.x-Math.trunc((toeCount/2)*150))+75;
        
        for (n=0;n!==toeCount;n++) {
            knuckleBoneIdx=bones.push(new ModelBoneClass(('Toe Knuckle'+n+nameSuffix),footBoneIdx,new wsPoint(fx,footHigh,(fz+knuckleLength))))-1;
            toeBoneIdx=bones.push(new ModelBoneClass(('Toe'+n+nameSuffix),knuckleBoneIdx,new wsPoint(fx,footHigh,(fz+toeTotalLength))))-1;
            
            bones[knuckleBoneIdx].gravityLockDistance=toeRadius;
            bones[toeBoneIdx].gravityLockDistance=toeRadius;
            
            skeleton.limbs.push(new ModelLimbClass(modelLimbConstants.LIMB_TYPE_TOE,index,modelLimbConstants.LIMB_AXIS_Z,4,4,[knuckleBoneIdx,toeBoneIdx]));
            
            fx+=150;
        }
    }
    
    buildLimbLegSet(sideLeft,sideRight,boneIdx,legIndex,boneOffset,rotOffset,hipRadius,hipHigh,legRadius,footLength,bodyLimbIdx)
    {
        let toeCount,toeLength;
        let vct;
        let kneeHigh=Math.trunc(hipHigh*0.5);
        let ankleHigh=-(legRadius*2);
        let footHigh=-Math.trunc(legRadius*0.5);
        
        if (genRandom.randomPercentage(0.2)) {
            toeCount=0;
            toeLength=0;
        }
        else {
            toeCount=genRandom.randomInt(1,3);
            toeLength=genRandom.randomInt(Math.trunc(legRadius*0.5),legRadius);
        }
        
        hipHigh+=hipRadius;         // need legs to start below body so they can be connected later
        
        vct=new wsPoint(hipRadius,0.0,0.0);
        vct.rotateY(null,rotOffset);
        vct.z+=boneOffset;
        this.buildLimbLeg(sideLeft,legIndex,('Left'+legIndex),vct,boneIdx,hipHigh,kneeHigh,ankleHigh,footHigh,legRadius,footLength,toeCount,toeLength,bodyLimbIdx);

        vct=new wsPoint(-hipRadius,0.0,0.0);
        vct.rotateY(null,-rotOffset);
        vct.z+=boneOffset;
        this.buildLimbLeg(sideRight,legIndex,('Right'+legIndex),vct,boneIdx,hipHigh,kneeHigh,ankleHigh,footHigh,legRadius,footLength,toeCount,toeLength,bodyLimbIdx);
    }
    
        //
        // build skeleton body
        //
        
    buildHumanoid()
    {
        let n,bones;
        let bodyLimb,bodyLimbIdx,headLimbIdx;
        let hipHigh,waistHigh,torsoHigh,torsoTopHigh;
        let neckHigh,jawHigh,headHigh,armLength;
        let baseBoneIdx,hipBoneIdx,waistBoneIdx,torsoBoneIdx,torsoTopBoneIdx;
        let neckBoneIdx,jawBoneIdx,headBoneIdx;
        let y,rotOffset,vct;
        let armCount,armRadius,shoulderLength,elbowLength,wristLength,handLength,fingerCount,fingerLength;
        let legRadius,footLength;
        
        this.model.skeleton=new ModelSkeletonClass();
        bones=this.model.skeleton.bones;
        
            // random heights
            
        hipHigh=Math.trunc(genRandom.randomInt(600,Math.trunc(this.SKELETON_GENERAL_HEIGHT*0.4))*this.sizeFactor);
        waistHigh=hipHigh+Math.trunc(genRandom.randomInt(200,Math.trunc(this.SKELETON_GENERAL_HEIGHT*0.15))*this.sizeFactor);
        torsoHigh=waistHigh+Math.trunc(genRandom.randomInt(200,Math.trunc(this.SKELETON_GENERAL_HEIGHT*0.2))*this.sizeFactor);
        torsoTopHigh=torsoHigh+Math.trunc(genRandom.randomInt(200,Math.trunc(this.SKELETON_GENERAL_HEIGHT*0.15))*this.sizeFactor);
        
            // the base bone
            
        baseBoneIdx=bones.push(new ModelBoneClass('Base',-1,new wsPoint(0,0,0)))-1;

            // create body limb
            
        hipBoneIdx=bones.push(new ModelBoneClass('Hip',baseBoneIdx,new wsPoint(0,-hipHigh,0)))-1;
        waistBoneIdx=bones.push(new ModelBoneClass('Waist',hipBoneIdx,new wsPoint(0,-waistHigh,0)))-1;
        torsoBoneIdx=bones.push(new ModelBoneClass('Torso',waistBoneIdx,new wsPoint(0,-torsoHigh,0)))-1;
        torsoTopBoneIdx=bones.push(new ModelBoneClass('Torso_Top',torsoBoneIdx,new wsPoint(0,-torsoTopHigh,0)))-1;
        
        bones[hipBoneIdx].gravityLockDistance=Math.trunc(genRandom.randomInt(300,1000)*this.sizeFactor);
        bones[waistBoneIdx].gravityLockDistance=Math.trunc(genRandom.randomInt(300,1000)*this.sizeFactor);
        bones[torsoBoneIdx].gravityLockDistance=Math.trunc(genRandom.randomInt(300,1000)*this.sizeFactor);
        bones[torsoTopBoneIdx].gravityLockDistance=Math.trunc(genRandom.randomInt(300,1000)*this.sizeFactor);
        
        bodyLimb=new ModelLimbClass(modelLimbConstants.LIMB_TYPE_BODY,0,modelLimbConstants.LIMB_AXIS_Y,10,10,[hipBoneIdx,waistBoneIdx,torsoBoneIdx,torsoTopBoneIdx]);
        bodyLimbIdx=this.model.skeleton.limbs.push(bodyLimb)-1;
        
        bodyLimb.hunchAngle=genRandom.randomInt(0,20);
        
            // create neck and head limb
            
        neckHigh=torsoTopHigh+Math.trunc(bones[torsoTopBoneIdx].gravityLockDistance*0.5);
        jawHigh=neckHigh+Math.trunc(genRandom.randomInt(100,Math.trunc(this.SKELETON_GENERAL_HEIGHT*0.1))*this.sizeFactor);
        headHigh=jawHigh+Math.trunc(genRandom.randomInt(200,Math.trunc(this.SKELETON_GENERAL_HEIGHT*0.2))*this.sizeFactor);
            
        neckBoneIdx=bones.push(new ModelBoneClass('Neck',torsoTopBoneIdx,new wsPoint(0,-neckHigh,0)))-1;
        jawBoneIdx=bones.push(new ModelBoneClass('Jaw',neckBoneIdx,new wsPoint(0,-jawHigh,0)))-1;
        headBoneIdx=bones.push(new ModelBoneClass('Head',jawBoneIdx,new wsPoint(0,-headHigh,0)))-1;

        bones[headBoneIdx].gravityLockDistance=Math.trunc(genRandom.randomInt(300,400)*this.sizeFactor);
        bones[jawBoneIdx].gravityLockDistance=Math.trunc(genRandom.randomInt(300,400)*this.sizeFactor);
        
        headLimbIdx=this.model.skeleton.limbs.push(new ModelLimbClass(modelLimbConstants.LIMB_TYPE_HEAD,0,modelLimbConstants.LIMB_AXIS_Y,10,10,[headBoneIdx,jawBoneIdx]))-1;
        this.model.skeleton.limbs.push(new ModelLimbClass(modelLimbConstants.LIMB_TYPE_NECK,0,modelLimbConstants.LIMB_AXIS_Y,5,5,[neckBoneIdx,jawBoneIdx]));
        
            // create arm limbs
            // arm length is about quarter body size + some random
        
        y=Math.trunc((bones[torsoTopBoneIdx].position.y+bones[torsoBoneIdx].position.y)*0.5);
        
        armCount=genRandom.randomPercentage(0.8)?1:2;
        armLength=genRandom.randomInt((torsoTopHigh-hipHigh),Math.trunc(hipHigh*0.5));

        rotOffset=(genRandom.random()*20.0)-10.0;

        armRadius=Math.trunc(bones[torsoTopBoneIdx].gravityLockDistance*0.45);
        if (armRadius<250) armRadius=250;

        shoulderLength=bones[torsoTopBoneIdx].gravityLockDistance;
        if (bones[torsoBoneIdx].gravityLockDistance>shoulderLength) shoulderLength=bones[torsoBoneIdx].gravityLockDistance;
        elbowLength=shoulderLength+Math.trunc(armLength*0.42);
        wristLength=shoulderLength+Math.trunc(armLength*0.84);
        handLength=shoulderLength+Math.trunc(armLength*0.9);

        if (genRandom.randomPercentage(0.2)) {
            fingerCount=0;
            fingerLength=0;
        }
        else {
            fingerCount=genRandom.randomInt(1,3);
            fingerLength=genRandom.randomInt(500,500);
        }

        for (n=0;n!==armCount;n++) {
            vct=new wsPoint(1.0,0.0,0.0);
            vct.rotateY(null,rotOffset);
            //this.buildLimbArm(n,('Left'+n),vct,torsoTopBoneIdx,armRadius,y,shoulderLength,elbowLength,wristLength,handLength,fingerCount,fingerLength,bodyLimbIdx);

            vct=new wsPoint(-1.0,0.0,0.0);
            vct.rotateY(null,-rotOffset);
            //this.buildLimbArm(n,('Right'+n),vct,torsoTopBoneIdx,armRadius,y,shoulderLength,elbowLength,wristLength,handLength,fingerCount,fingerLength,bodyLimbIdx);

            y+=Math.trunc(armRadius*1.8);
        }
        
            // create leg limbs
        
        legRadius=Math.trunc(bones[hipBoneIdx].gravityLockDistance*0.45);
        if (legRadius<250) legRadius=250;
        footLength=Math.trunc(legRadius*1.5);
       
        rotOffset=(genRandom.random()*20.0)-10.0;
        
        this.buildLimbLegSet(modelLimbConstants.LIMB_SIDE_LEFT,modelLimbConstants.LIMB_SIDE_RIGHT,hipBoneIdx,0,0,rotOffset,Math.trunc(bones[hipBoneIdx].gravityLockDistance*0.5),bones[hipBoneIdx].position.y,legRadius,footLength,bodyLimbIdx);
    }

        //
        // build animal bones
        //

    buildAnimal()
    {
        let whipRadius,whipLength;
        let bones,baseBoneIdx,bodyLimbIdx,headLimbIdx;
        let high,totalHigh,bodyLength;
        let torsoBoneIdx,waistBoneIdx,hipBoneIdx,torsoTopBoneIdx;
        let headRadius,snoutRadius,neckLength,headLength,jawPivotLength,jawLength,jawHigh,headHigh;
        let neckBoneIdx,headBoneIdx,snoutBoneIdx,jawPivotBoneIdx,jawBoneIdx;
        let rotOffset,legRadius,footLength;
        
        this.model.skeleton=new ModelSkeletonClass();
        bones=this.model.skeleton.bones;
        
            // the base bone
            
        baseBoneIdx=bones.push(new ModelBoneClass('Base',-1,new wsPoint(0,0,0)))-1;

            // create body limbs
        
        totalHigh=Math.trunc(genRandom.randomInt(800,2500)*this.sizeFactor);
        bodyLength=Math.trunc(genRandom.randomInt(600,2000)*this.sizeFactor);
        high=totalHigh+Math.trunc(genRandom.randomInt(0,400)*this.sizeFactor);
        
        hipBoneIdx=bones.push(new ModelBoneClass('Hip',baseBoneIdx,new wsPoint(0,-high,-Math.trunc(bodyLength*0.5))))-1;
        waistBoneIdx=bones.push(new ModelBoneClass('Waist',hipBoneIdx,new wsPoint(0,-high,-Math.trunc(bodyLength*0.25))))-1;
        torsoBoneIdx=bones.push(new ModelBoneClass('Torso',waistBoneIdx,new wsPoint(0,-high,Math.trunc(bodyLength*0.25))))-1;
        torsoTopBoneIdx=bones.push(new ModelBoneClass('Torso_Top',torsoBoneIdx,new wsPoint(0,-high,Math.trunc(bodyLength*0.5))))-1;
        
        bones[hipBoneIdx].gravityLockDistance=Math.trunc(genRandom.randomInt(300,700)*this.sizeFactor);
        bones[waistBoneIdx].gravityLockDistance=Math.trunc(genRandom.randomInt(300,700)*this.sizeFactor);
        bones[torsoBoneIdx].gravityLockDistance=Math.trunc(genRandom.randomInt(300,700)*this.sizeFactor);
        bones[torsoTopBoneIdx].gravityLockDistance=Math.trunc(genRandom.randomInt(300,700)*this.sizeFactor);
        
        bodyLimbIdx=this.model.skeleton.limbs.push(new ModelLimbClass(modelLimbConstants.LIMB_TYPE_BODY,0,modelLimbConstants.LIMB_AXIS_Z,10,10,[hipBoneIdx,waistBoneIdx,torsoBoneIdx,torsoTopBoneIdx]))-1;
        
            // create the head and jaw limbs

        headRadius=Math.trunc(genRandom.randomInt(300,700)*this.sizeFactor);
        snoutRadius=Math.trunc(genRandom.randomInt(300,700)*this.sizeFactor);
        
        high=-bones[torsoTopBoneIdx].position.y;
        neckLength=bones[torsoTopBoneIdx].position.z+Math.trunc(bones[torsoTopBoneIdx].gravityLockDistance*0.5);
        headLength=neckLength+genRandom.randomInt(300,800);
        jawPivotLength=neckLength+genRandom.randomInt(50,50);
        jawLength=jawPivotLength+genRandom.randomInt(headRadius,snoutRadius);
        jawHigh=high-genRandom.randomInt(Math.trunc(headRadius*0.4),100);
        headHigh=high;
        
        neckBoneIdx=bones.push(new ModelBoneClass('Head',torsoTopBoneIdx,new wsPoint(0,-high,neckLength)))-1;
        headBoneIdx=bones.push(new ModelBoneClass('Head',neckBoneIdx,new wsPoint(0,-high,headLength)))-1;
        snoutBoneIdx=bones.push(new ModelBoneClass('Snout',headBoneIdx,new wsPoint(0,-headHigh,jawLength)))-1;
        jawPivotBoneIdx=bones.push(new ModelBoneClass('Jaw_Pivot',headBoneIdx,new wsPoint(0,-jawHigh,jawPivotLength)))-1;
        jawBoneIdx=bones.push(new ModelBoneClass('Jaw',jawPivotBoneIdx,new wsPoint(0,-jawHigh,jawLength)))-1;
        
        bones[headBoneIdx].gravityLockDistance=headRadius;
        bones[snoutBoneIdx].gravityLockDistance=snoutRadius;
        bones[jawPivotBoneIdx].gravityLockDistance=bones[jawBoneIdx].gravityLockDistance=Math.trunc(headRadius*0.8);
        bones[jawBoneIdx].gravityLockDistance=genRandom.randomInt(100,150);
        
        headLimbIdx=this.model.skeleton.limbs.push(new ModelLimbClass(modelLimbConstants.LIMB_TYPE_HEAD_SNOUT,0,modelLimbConstants.LIMB_AXIS_Z,8,8,[headBoneIdx,snoutBoneIdx]))-1;
        this.model.skeleton.limbs.push(new ModelLimbClass(modelLimbConstants.LIMB_TYPE_HEAD_JAW,0,modelLimbConstants.LIMB_AXIS_Z,8,8,[jawBoneIdx,jawPivotBoneIdx]));
        this.model.skeleton.limbs.push(new ModelLimbClass(modelLimbConstants.LIMB_TYPE_NECK,0,modelLimbConstants.LIMB_AXIS_Z,8,8,[neckBoneIdx,headBoneIdx]));

            // create legs
        
        rotOffset=(genRandom.random()*20.0)-10.0;
        
        legRadius=Math.trunc(bones[hipBoneIdx].gravityLockDistance*0.45);
        if (legRadius<250) legRadius=250;
        footLength=Math.trunc(legRadius*1.5);
        
        this.buildLimbLegSet(modelLimbConstants.LIMB_SIDE_BACK_LEFT,modelLimbConstants.LIMB_SIDE_BACK_RIGHT,hipBoneIdx,0,bones[hipBoneIdx].position.z,rotOffset,Math.trunc(bones[hipBoneIdx].gravityLockDistance*0.5),bones[hipBoneIdx].position.y,legRadius,footLength,bodyLimbIdx);
        this.buildLimbLegSet(modelLimbConstants.LIMB_SIDE_FRONT_LEFT,modelLimbConstants.LIMB_SIDE_FRONT_RIGHT,torsoTopBoneIdx,0,bones[torsoTopBoneIdx].position.z,rotOffset,Math.trunc(bones[torsoTopBoneIdx].gravityLockDistance*0.5),bones[torsoTopBoneIdx].position.y,legRadius,footLength,bodyLimbIdx);

            // tail
            
        if (genRandom.randomPercentage(0.75)) {
            whipRadius=Math.trunc(genRandom.randomInt(250,300)*this.sizeFactor);
            whipLength=Math.trunc(genRandom.randomInt(400,2000)*this.sizeFactor);
            
            //this.buildLimbWhip(0,hipBoneIdx,whipRadius,bones[hipBoneIdx].position.y,whipLength,90.0,true);
        }
    }
     
        //
        // build blob bones
        //

    buildBlob()
    {
        let n,bones,boneIdx,rotOffset;
        let bodyLimb,bodyLimbIdx,headLimbIdx,whipRadius,whipLength;
        let totalHigh,baseBoneIdx;
        let hipBoneIdx,waistBoneIdx,torsoBoneIdx,torsoTopBoneIdx;
        let xScale,zScale;
        let neckHigh,jawHigh,headHigh;
        let neckBoneIdx,jawBoneIdx,headBoneIdx;
        let whipCount;
        
        this.model.skeleton=new ModelSkeletonClass();
        bones=this.model.skeleton.bones;
        
            // random height
            // can never be taller than a single floor height
            // and always shorter than humanoids (no legs)
        
        totalHigh=Math.trunc(genRandom.randomInt(Math.trunc(this.SKELETON_GENERAL_HEIGHT*0.05),Math.trunc(this.SKELETON_GENERAL_HEIGHT*0.8))*this.sizeFactor);
        
            // the base bone
            
        baseBoneIdx=bones.push(new ModelBoneClass('Base',-1,new wsPoint(0,0,0)))-1;

            // create body limb
            
        hipBoneIdx=bones.push(new ModelBoneClass('Hip',baseBoneIdx,new wsPoint(0,0,0)))-1;
        waistBoneIdx=bones.push(new ModelBoneClass('Waist',hipBoneIdx,new wsPoint(0,-Math.trunc(totalHigh*0.25),0)))-1;
        torsoBoneIdx=bones.push(new ModelBoneClass('Torso',waistBoneIdx,new wsPoint(0,-Math.trunc(totalHigh*0.5),0)))-1;
        torsoTopBoneIdx=bones.push(new ModelBoneClass('Torso_Top',torsoBoneIdx,new wsPoint(0,-Math.trunc(totalHigh*0.75),0)))-1;
        
        bones[hipBoneIdx].gravityLockDistance=Math.trunc(genRandom.randomInt(200,2000)*this.sizeFactor);
        bones[waistBoneIdx].gravityLockDistance=Math.trunc(genRandom.randomInt(200,2000)*this.sizeFactor);
        bones[torsoBoneIdx].gravityLockDistance=Math.trunc(genRandom.randomInt(200,2000)*this.sizeFactor);
        bones[torsoTopBoneIdx].gravityLockDistance=Math.trunc(genRandom.randomInt(200,2000)*this.sizeFactor);
        
        xScale=(genRandom.randomInt(70,50)/100.0)*this.sizeFactor;
        zScale=(genRandom.randomInt(70,50)/100.0)*this.sizeFactor;
        
        bodyLimb=new ModelLimbClass(modelLimbConstants.LIMB_TYPE_BODY,0,modelLimbConstants.LIMB_AXIS_Y,10,10,[hipBoneIdx,waistBoneIdx,torsoBoneIdx,torsoTopBoneIdx]);
        bodyLimbIdx=this.model.skeleton.limbs.push(bodyLimb)-1;
        
            // create head and neck limbs
        
        if (genRandom.randomPercentage(0.5)) {
            neckHigh=Math.abs(bones[torsoTopBoneIdx].position.y)+Math.trunc(bones[torsoTopBoneIdx].gravityLockDistance*0.5);
            jawHigh=neckHigh+genRandom.randomInt((totalHigh*0.1),(totalHigh*0.1));
            headHigh=jawHigh+genRandom.randomInt((totalHigh*0.1),(totalHigh*0.2));

            neckBoneIdx=bones.push(new ModelBoneClass('Neck',torsoTopBoneIdx,new wsPoint(0,-neckHigh,0)))-1;
            jawBoneIdx=bones.push(new ModelBoneClass('Jaw',neckBoneIdx,new wsPoint(0,-jawHigh,0)))-1;
            headBoneIdx=bones.push(new ModelBoneClass('Head',jawBoneIdx,new wsPoint(0,-headHigh,0)))-1;

            bones[neckBoneIdx].gravityLockDistance=genRandom.randomInt(100,500);
            bones[headBoneIdx].gravityLockDistance=genRandom.randomInt(200,1000);
            bones[jawBoneIdx].gravityLockDistance=genRandom.randomInt(200,1000);

            headLimbIdx=this.model.skeleton.limbs.push(new ModelLimbClass(modelLimbConstants.LIMB_TYPE_HEAD,0,modelLimbConstants.LIMB_AXIS_Y,8,8,[headBoneIdx,jawBoneIdx]))-1;
            this.model.skeleton.limbs.push(new ModelLimbClass(modelLimbConstants.LIMB_TYPE_NECK,0,modelLimbConstants.LIMB_AXIS_Y,8,8,[neckBoneIdx,jawBoneIdx]));
        }
        
            // create any whips
            
        whipCount=genRandom.randomInt(0,10);
            
        for (n=0;n!==whipCount;n++) {
            boneIdx=bodyLimb.getRandomBoneIndex();
            if (boneIdx===hipBoneIdx) continue;         // at bottom, no whips there
            
            rotOffset=genRandom.random()*360.0;
            
            whipRadius=Math.trunc(genRandom.randomInt(250,300)*this.sizeFactor);
            whipLength=Math.trunc(genRandom.randomInt(400,2000)*this.sizeFactor);
            
            //this.buildLimbWhip(n,boneIdx,whipRadius,bones[boneIdx].position.y,whipLength,rotOffset,true);
        }
    }

    
        //
        // arm limb
        //
    
    buildLimbArm(limbIdx,parentBoneIdx,pnt,vct,axis,armRadius,bodyLimbIdx,needConnectBone)
    {
        let shoulderBoneIdx,elbowBoneIdx,wristBoneIdx,handBoneIdx,knuckleBoneIdx,fingerBoneIdx;
        let handPnt,handRadius,armLimbIdx,handLimbIdx;
        let n,fy,fingerCount,fingerRadius,fingerDistance;
        let knucklePnt,knuckleVct,fingerPnt,fingerVct;
        let skeleton=this.model.skeleton;
        let bones=skeleton.bones;
        
            // arm bones
            // we might already have a shoulder, so don't rebuild if we do
            
        if (needConnectBone) {
            shoulderBoneIdx=bones.push(new ModelBoneClass(('Shoulder_'+limbIdx),parentBoneIdx,new wsPoint(pnt.x,pnt.y,pnt.z)))-1;
        }
        else {
            shoulderBoneIdx=parentBoneIdx;
        }
        elbowBoneIdx=bones.push(new ModelBoneClass(('Elbow_'+limbIdx),shoulderBoneIdx,new wsPoint((pnt.x+(vct.x*0.45)),(pnt.y+(vct.y*0.45)),(pnt.z+(vct.z*0.45)))))-1;
        wristBoneIdx=bones.push(new ModelBoneClass(('Wrist_'+limbIdx),elbowBoneIdx,new wsPoint((pnt.x+(vct.x*0.9)),(pnt.y+(vct.y*0.9)),(pnt.z+(vct.z*0.9)))))-1;
        
        bones[shoulderBoneIdx].gravityLockDistance=Math.trunc(armRadius*1.1);
        bones[elbowBoneIdx].gravityLockDistance=armRadius;
        bones[wristBoneIdx].gravityLockDistance=armRadius;
        
            // hand bone and hand limb
            
        handRadius=Math.trunc(armRadius*1.3);
        handPnt=new wsPoint((pnt.x+vct.x),(pnt.y+vct.y),(pnt.z+vct.z));
        
        handBoneIdx=bones.push(new ModelBoneClass(('Hand_'+limbIdx),wristBoneIdx,handPnt))-1;
        
        bones[handBoneIdx].gravityLockDistance=handRadius;
        
        handLimbIdx=this.model.skeleton.limbs.push(new ModelLimbClass(modelLimbConstants.LIMB_TYPE_HAND,limbIdx,axis,5,5,[handBoneIdx],-1,-1))-1;
        
            // now create the arm limb because it connects
            // to both the hand and body
            
        armLimbIdx=skeleton.limbs.push(new ModelLimbClass(modelLimbConstants.LIMB_TYPE_ARM,limbIdx,axis,8,5,[shoulderBoneIdx,elbowBoneIdx,wristBoneIdx]))-1;

            // finger bones and limbs
        
        fingerCount=genRandom.randomInt(0,5);
        if (fingerCount===0) return;
        
        fingerRadius=Math.trunc((armRadius/fingerCount)*0.8);
        if (fingerRadius<100) fingerRadius=100;
        
        fingerDistance=Math.trunc(fingerRadius*1.1);
        
        knuckleVct=new wsPoint(vct.x,vct.y,vct.z);
        knuckleVct.normalize();
        knuckleVct.scale(Math.trunc(handRadius*0.4));
        knucklePnt=new wsPoint((handPnt.x+knuckleVct.x),(handPnt.y+knuckleVct.y),(handPnt.z+knuckleVct.z));
        
        fingerVct=new wsPoint(vct.x,vct.y,vct.z);
        fingerVct.normalize();
        fingerVct.scale(genRandom.randomInt(armRadius,armRadius));
        fingerPnt=new wsPoint((knucklePnt.x+fingerVct.x),(knucklePnt.y+fingerVct.y),(knucklePnt.z+fingerVct.z));

        fy=knucklePnt.y-Math.trunc(fingerCount*0.5)*fingerDistance;
        
        for (n=0;n!==fingerCount;n++) {
            knuckleBoneIdx=bones.push(new ModelBoneClass(('Finger_Knuckle_'+limbIdx+'_'+n),handBoneIdx,new wsPoint(knucklePnt.x,fy,knucklePnt.z)))-1;
            fingerBoneIdx=bones.push(new ModelBoneClass(('Finger'+limbIdx+'_'+n),knuckleBoneIdx,new wsPoint(fingerPnt.x,fy,fingerPnt.z)))-1;
            
            bones[knuckleBoneIdx].gravityLockDistance=fingerRadius;
            bones[fingerBoneIdx].gravityLockDistance=fingerRadius;
            
            skeleton.limbs.push(new ModelLimbClass(modelLimbConstants.LIMB_TYPE_FINGER,limbIdx,axis,4,4,[knuckleBoneIdx,fingerBoneIdx]));
            
            fy+=fingerDistance;
        }
    }
    
        //
        // whip limbs
        //
    
    buildLimbWhip(limbIdx,parentBoneIdx,pnt,vct,axis,whipRadius,bodyLimbIdx,needConnectBone)
    {
        let whip0BoneIdx,whip1BoneIdx,whip2BoneIdx,whip3BoneIdx;
        let skeleton=this.model.skeleton;
        let bones=skeleton.bones;
        
            // the whip
            
        if (needConnectBone) {
            whip0BoneIdx=bones.push(new ModelBoneClass(('Whip_'+limbIdx+'_0'),parentBoneIdx,new wsPoint(pnt.x,pnt.y,pnt.z)))-1;
        }
        else {
            whip0BoneIdx=parentBoneIdx;
        }
        whip1BoneIdx=bones.push(new ModelBoneClass(('Whip_'+limbIdx+'_1'),whip0BoneIdx,new wsPoint((pnt.x+(vct.x*0.33)),(pnt.y+(vct.y*0.33)),(pnt.z+(vct.z*0.33)))))-1;
        whip2BoneIdx=bones.push(new ModelBoneClass(('Whip_'+limbIdx+'_2'),whip1BoneIdx,new wsPoint((pnt.x+(vct.x*0.66)),(pnt.y+(vct.y*0.66)),(pnt.z+(vct.z*0.66)))))-1;
        whip3BoneIdx=bones.push(new ModelBoneClass(('Whip_'+limbIdx+'_3'),whip2BoneIdx,new wsPoint((pnt.x+vct.x),(pnt.y+vct.y),(pnt.z+vct.z))))-1;

        bones[whip0BoneIdx].gravityLockDistance=whipRadius;
        bones[whip1BoneIdx].gravityLockDistance=Math.trunc(whipRadius*0.8);
        bones[whip2BoneIdx].gravityLockDistance=Math.trunc(whipRadius*0.6);
        bones[whip3BoneIdx].gravityLockDistance=Math.trunc(whipRadius*0.3);

        skeleton.limbs.push(new ModelLimbClass(modelLimbConstants.LIMB_TYPE_WHIP,limbIdx,axis,8,5,[whip0BoneIdx,whip1BoneIdx,whip2BoneIdx,whip3BoneIdx]));
    }
    
        //
        // head
        //
        
    buildLimbHead(limbIdx,parentBoneIdx,pnt,vct,axis,neckRadius,bodyLimbIdx,needConnectBone)
    {
        let neckStartBoneIdx,neckEndBoneIdx;
        let skeleton=this.model.skeleton;
        let bones=skeleton.bones;
        
            // create the neck
            
        if (needConnectBone) {
            neckStartBoneIdx=bones.push(new ModelBoneClass(('Neck_Start_'+limbIdx),parentBoneIdx,new wsPoint(pnt.x,pnt.y,pnt.z)))-1;
        }
        else {
            neckStartBoneIdx=parentBoneIdx;
        }
        neckEndBoneIdx=bones.push(new ModelBoneClass(('Neck_End_'+limbIdx),neckStartBoneIdx,new wsPoint((pnt.x+(vct.x*0.33)),(pnt.y+(vct.y*0.33)),(pnt.z+(vct.z*0.33)))))-1;

        this.model.skeleton.limbs.push(new ModelLimbClass(modelLimbConstants.LIMB_TYPE_NECK,0,axis,5,5,[neckStartBoneIdx,neckEndBoneIdx]));

        /*
        torsoTopBoneIdx=skeleton.findBoneIndex('Torso_Top');
        
            // create neck and head limb
            
        neckHigh=(-bones[torsoTopBoneIdx].position.y)+genRandom.randomInt(200,500);
        jawHigh=neckHigh+Math.trunc(genRandom.randomInt(100,Math.trunc(this.SKELETON_GENERAL_HEIGHT*0.1))*this.sizeFactor);
        headHigh=jawHigh+Math.trunc(genRandom.randomInt(200,Math.trunc(this.SKELETON_GENERAL_HEIGHT*0.2))*this.sizeFactor);
        neckBoneIdx=bones.push(new ModelBoneClass('Neck',torsoTopBoneIdx,new wsPoint(0,-neckHigh,0)))-1;

        jawBoneIdx=bones.push(new ModelBoneClass('Jaw',neckBoneIdx,new wsPoint(0,-jawHigh,0)))-1;
        headBoneIdx=bones.push(new ModelBoneClass('Head',jawBoneIdx,new wsPoint(0,-headHigh,0)))-1;

        bones[headBoneIdx].gravityLockDistance=Math.trunc(genRandom.randomInt(300,400)*this.sizeFactor);
        bones[jawBoneIdx].gravityLockDistance=Math.trunc(genRandom.randomInt(300,400)*this.sizeFactor);
        
        
        //headLimbIdx=this.model.skeleton.limbs.push(new ModelLimbClass(modelLimbConstants.LIMB_TYPE_HEAD,0,modelLimbConstants.LIMB_AXIS_Y,10,10,[headBoneIdx,jawBoneIdx]))-1;
*/
    }
    
        //
        // general body for creature
        //
        
    buildBody()
    {
        let bodyLimb,bodyLimbIdx;
        let hipHigh,waistHigh,torsoHigh,torsoTopHigh;
        let shoulderSize,hipSize;
        let baseBoneIdx,hipBoneIdx,waistBoneIdx,torsoBoneIdx,torsoTopBoneIdx;
        let leftShoulderBoneIdx,rightShoulderBoneIdx,leftHipBoneIdx,rightHipBoneIdx;
        let skeleton=this.model.skeleton;
        let bones=skeleton.bones;
        
            // random heights
            
        hipHigh=Math.trunc(genRandom.randomInt(600,Math.trunc(this.SKELETON_GENERAL_HEIGHT*0.4))*this.sizeFactor);
        waistHigh=hipHigh+Math.trunc(genRandom.randomInt(200,Math.trunc(this.SKELETON_GENERAL_HEIGHT*0.15))*this.sizeFactor);
        torsoHigh=waistHigh+Math.trunc(genRandom.randomInt(200,Math.trunc(this.SKELETON_GENERAL_HEIGHT*0.2))*this.sizeFactor);
        torsoTopHigh=torsoHigh+Math.trunc(genRandom.randomInt(200,Math.trunc(this.SKELETON_GENERAL_HEIGHT*0.15))*this.sizeFactor);
        
            // the base bone
            
        baseBoneIdx=bones.push(new ModelBoneClass('Base',-1,new wsPoint(0,0,0)))-1;

            // the spine
            
        hipBoneIdx=bones.push(new ModelBoneClass('Hip',baseBoneIdx,new wsPoint(0,-hipHigh,0)))-1;
        waistBoneIdx=bones.push(new ModelBoneClass('Waist',hipBoneIdx,new wsPoint(0,-waistHigh,0)))-1;
        torsoBoneIdx=bones.push(new ModelBoneClass('Torso',waistBoneIdx,new wsPoint(0,-torsoHigh,0)))-1;
        torsoTopBoneIdx=bones.push(new ModelBoneClass('Torso_Top',torsoBoneIdx,new wsPoint(0,-torsoTopHigh,0)))-1;
        
        bones[hipBoneIdx].gravityLockDistance=Math.trunc(genRandom.randomInt(300,1000)*this.sizeFactor);
        bones[waistBoneIdx].gravityLockDistance=Math.trunc(genRandom.randomInt(300,1000)*this.sizeFactor);
        bones[torsoBoneIdx].gravityLockDistance=Math.trunc(genRandom.randomInt(300,1000)*this.sizeFactor);
        bones[torsoTopBoneIdx].gravityLockDistance=Math.trunc(genRandom.randomInt(300,1000)*this.sizeFactor);
        
            // the shoulders
            
        leftShoulderBoneIdx=bones.push(new ModelBoneClass('Left_Shoulder',torsoTopBoneIdx,new wsPoint(500,-torsoTopHigh,0)))-1;
        rightShoulderBoneIdx=bones.push(new ModelBoneClass('Right_Shoulder',torsoTopBoneIdx,new wsPoint(-500,-torsoTopHigh,0)))-1;
        
        shoulderSize=genRandom.randomInt(300,300)*this.sizeFactor;
        bones[leftShoulderBoneIdx].gravityLockDistance=Math.trunc(shoulderSize);
        bones[rightShoulderBoneIdx].gravityLockDistance=Math.trunc(shoulderSize);
        
            // the hips
            
        leftHipBoneIdx=bones.push(new ModelBoneClass('Left_Hip',hipBoneIdx,new wsPoint(500,-hipHigh,0)))-1;
        rightHipBoneIdx=bones.push(new ModelBoneClass('Right_Hip',hipBoneIdx,new wsPoint(-500,-hipHigh,0)))-1;
        
        hipSize=genRandom.randomInt(300,300)*this.sizeFactor;
        bones[leftHipBoneIdx].gravityLockDistance=Math.trunc(hipSize);
        bones[rightHipBoneIdx].gravityLockDistance=Math.trunc(hipSize);

            // the body limb
            
        bodyLimb=new ModelLimbClass(modelLimbConstants.LIMB_TYPE_BODY,0,modelLimbConstants.LIMB_AXIS_Y,12,12,[hipBoneIdx,waistBoneIdx,torsoBoneIdx,torsoTopBoneIdx,leftShoulderBoneIdx,rightShoulderBoneIdx,leftHipBoneIdx,rightHipBoneIdx]);
        bodyLimbIdx=skeleton.limbs.push(bodyLimb)-1;
        
        bodyLimb.hunchAngle=genRandom.randomInt(0,20);
        
        return(bodyLimbIdx);
    }
    
        //
        // limbs for creature
        //
    
    buildLimbs(bodyLimbIdx)
    {
        let n,limbCount;
        let bone,boneIdx,rotOffset,pushPastParentBoneGravity;
        let axis,radius,length,needConnectBone;
        let vct,pushVct,pnt;
        let skeleton=this.model.skeleton;
        let bones=skeleton.bones;
        let bodyLimb=skeleton.limbs[bodyLimbIdx];

                // random limb count
            
        limbCount=genRandom.randomInt(2,10);
        
        limbCount=3;        // supergumba -- testing
            
        for (n=0;n!==limbCount;n++) {
            boneIdx=bodyLimb.getRandomBoneIndex();
            
                // random positioning
                
            radius=Math.trunc(genRandom.randomInt(250,300)*this.sizeFactor);
            length=Math.trunc(genRandom.randomInt(400,2000)*this.sizeFactor);
            
            needConnectBone=true;                 // turn this off if connecting to something that already has an extra bone, like shoulders and hips
            pushPastParentBoneGravity=false;
            
                // special directions for bone types
                
            bone=bones[boneIdx];
            
            switch (bone.name) {
                
                case 'Torso_Top':
                    axis=modelLimbConstants.LIMB_AXIS_Y;
                    rotOffset=genRandom.randomInt(180,15)-30;
                    break;
                
                case 'Left_Shoulder':
                    axis=modelLimbConstants.LIMB_AXIS_X;
                    rotOffset=rotOffset=genRandom.randomInt(0,15)-30;
                    needConnectBone=false;
                    break;
                    
                case 'Right_Shoulder':
                    axis=modelLimbConstants.LIMB_AXIS_X;
                    rotOffset=rotOffset=genRandom.randomInt(180,15)-30;
                    needConnectBone=false;
                    break;
                    
                case 'Left_Hip':
                    axis=modelLimbConstants.LIMB_AXIS_Y;
                    rotOffset=genRandom.randomInt(0,15)-30;
                    length=-bone.position.y;
                    needConnectBone=false;
                    break;
                    
                case 'Right_Hip':
                    axis=modelLimbConstants.LIMB_AXIS_Y;
                    rotOffset=genRandom.randomInt(0,15)-30;
                    length=-bone.position.y;
                    needConnectBone=false;
                    break;
                    
                default:
                    if (genRandom.randomPercentage(0.5)) {
                        axis=modelLimbConstants.LIMB_AXIS_X;
                        rotOffset=genRandom.randomInt(0,15)-30;
                    }
                    else {
                        axis=modelLimbConstants.LIMB_AXIS_Z;
                        rotOffset=genRandom.randomInt(90,15)-30;
                    }
                    if (genRandom.randomPercentage(0.5)) rotOffset+=180;
                    
                    pushPastParentBoneGravity=true;
                    break;
            }
            
                // get starting point, limb vector,
                // and any necessary push off of original bone
            
            if (axis!==modelLimbConstants.LIMB_AXIS_Y) {
                vct=new wsPoint(length,0.0,0.0);
                vct.rotateY(null,rotOffset);

                pushVct=new wsPoint(Math.trunc(bone.gravityLockDistance*0.95),0.0,0.0);
                pushVct.rotateY(null,rotOffset);
            }
            else {
                vct=new wsPoint(0.0,length,0.0);
                vct.rotateX(null,rotOffset);

                pushVct=new wsPoint(0.0,Math.trunc(bone.gravityLockDistance*0.95),0.0);
                pushVct.rotateX(null,rotOffset);
            }
            
            pnt=new wsPoint(bone.position.x,bone.position.y,bone.position.z);
            if (pushPastParentBoneGravity) pnt.addPoint(pushVct);
            
                // create the limb

            //this.buildLimbWhip(n,boneIdx,pnt,vct,axis,radius,bodyLimbIdx,needConnectBone);
            //this.buildLimbArm(n,boneIdx,pnt,vct,axis,radius,bodyLimbIdx,needConnectBone);
            this.buildLimbHead(n,boneIdx,pnt,vct,axis,radius,bodyLimbIdx,needConnectBone);
        }
    }
    
        //
        // build skeleton bones
        //

    build()
    {
        let bodyLimbIdx;
        
            // build the skeleton

        this.model.skeleton=new ModelSkeletonClass();
        
        bodyLimbIdx=this.buildBody();
        this.buildLimbs(bodyLimbIdx);
        
            // setup the bones for animation
            
        this.model.skeleton.precalcAnimationValues();
     }
    
}
