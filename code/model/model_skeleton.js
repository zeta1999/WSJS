"use strict";

//
// model bone class
//

function ModelBoneObject(name,parentBoneIdx,position)
{
    this.name=name;
    this.parentBoneIdx=parentBoneIdx;
    this.position=position;
    
        //
        // bone types
        //
        
    this.isBase=function()
    {
        return(this.name==='Base');
    };
    
    this.isHead=function()
    {
        return(this.name==='Head');
    };
    
    this.isNeck=function()
    {
        return(this.name==='Neck');
    };
    
    this.isTorso=function()
    {
        return(this.name==='Torso');
    };
    
    this.isWaist=function()
    {
        return(this.name==='Waist');
    };
    
    this.isHip=function()
    {
        return(this.name==='Hip');
    };
    
    this.isHand=function()
    {
        return(this.name.indexOf('Hand')!==-1);
    };
    
    this.isWrist=function()
    {
        return(this.name.indexOf('Wrist')!==-1);
    };
    
    this.isElbow=function()
    {
        return(this.name.indexOf('Elbow')!==-1);
    };
    
    this.isShoulder=function()
    {
        return(this.name.indexOf('Shoulder')!==-1);
    };
    
    this.isFoot=function()
    {
        return(this.name.indexOf('Foot')!==-1);
    };
    
    this.isAnkle=function()
    {
        return(this.name.indexOf('Ankle')!==-1);
    };
    
    this.isKnee=function()
    {
        return(this.name.indexOf('Knee')!==-1);
    };
    
        //
        // bone flags
        //
    
    this.hasParent=function()
    {
        return(this.parentBoneIdx!==-1);
    };
}

//
// model skeleton class
//

function ModelSkeletonObject()
{
    this.bones=[];
    
        //
        // close skeleton
        //

    this.close=function()
    {
        this.bones=[];
    };
    
        //
        // find bone
        //
        
    this.findBoneIndex=function(name)
    {
        var n;
        var nBone=this.bones.length;
        
        for (n=0;n!==nBone;n++) {
            if (this.bones[n].name===name) return(n);
        }
        
        return(-1);
    };
    
    this.findBone=function(name)
    {
        var idx=this.findBoneIndex(name);
        if (idx===-1) return(null);
        return(this.bones[idx]);
    };

}
