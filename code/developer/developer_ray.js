import PointClass from '../utility/point.js';
import BoundClass from '../utility/bound.js';
import CollisionClass from '../collision/collisions.js';

export default class DeveloperRayClass
{
    constructor(core)
    {
        this.core=core;
        
        this.LOOK_DISTANCE=80000;
        this.ICON_CLICK_SIZE=500;
        
        this.targetItemType=-1;
        this.targetItemIndex=0;
        
        this.collision=new CollisionClass(core);
        
            // pre-allocates
            
        this.lookPoint=new PointClass(0,0,0);
        this.lookVector=new PointClass(0,0,0);
        this.lookEndPoint=new PointClass(0,0,0);
        
        this.iconPosition=new PointClass(0,0,0);
        this.rayIntersectPnt=new PointClass(0,0,0);
        
        this.rayXBound=new BoundClass(0,0,0);
        this.rayYBound=new BoundClass(0,0,0);
        this.rayZBound=new BoundClass(0,0,0);
        
            // some developer bitmaps
            
        this.core.bitmapList.addEffect('../developer/sprites/target.png');
    }
    
        //
        // initialize and release
        //
    
    initialize()
    {
        return(true);
    }
    
    release()
    {
    }
    
        //
        // ray collisions and selection
        //
        
    rayCollision(pnt,vector,hitPnt)
    {
        let n,k;
        let mesh;
        let collisionTrig,nCollisionTrig;
        let entity,nEntity,light,nLight,effect,nEffect,node,nNode;
        let dist,currentDist;
        
            // the rough collide boxes
            
        this.rayXBound.setFromValues(pnt.x,(pnt.x+vector.x));
        this.rayYBound.setFromValues(pnt.y,(pnt.y+vector.y));
        this.rayZBound.setFromValues(pnt.z,(pnt.z+vector.z));
        
            // no collisions yet

        currentDist=-1;
        
        this.targetItemType=this.core.game.developer.SELECT_ITEM_NONE;
        this.targetItemIndex=0;

            // run through the meshes and
            // check against all trigs

        for (n of this.core.map.meshList.collisionMeshIndexList) {
            mesh=this.core.map.meshList.meshes[n];

                // skip any mesh we don't collide with

            if (!mesh.boxBoundCollision(this.rayXBound,this.rayYBound,this.rayZBound)) continue;

                // check the wall trigs

            nCollisionTrig=mesh.collisionWallTrigs.length;

            for (k=0;k!==nCollisionTrig;k++) {
                collisionTrig=mesh.collisionWallTrigs[k];
                if (!collisionTrig.overlapBounds(this.rayXBound,this.rayYBound,this.rayZBound)) continue;

                if (collisionTrig.rayTrace(pnt,vector,this.rayIntersectPnt)) {
                    dist=pnt.distance(this.rayIntersectPnt);
                    if ((dist<currentDist) || (currentDist===-1)) {
                        this.targetItemType=this.core.game.developer.SELECT_ITEM_MESH;
                        this.targetItemIndex=n;
                        hitPnt.setFromPoint(this.rayIntersectPnt);
                        currentDist=dist;
                    }
                }
            }
            
                // check the floor trigs

            nCollisionTrig=mesh.collisionFloorTrigs.length;

            for (k=0;k!==nCollisionTrig;k++) {
                collisionTrig=mesh.collisionFloorTrigs[k];
                if (!collisionTrig.overlapBounds(this.rayXBound,this.rayYBound,this.rayZBound)) continue;

                if (collisionTrig.rayTrace(pnt,vector,this.rayIntersectPnt)) {
                    dist=pnt.distance(this.rayIntersectPnt);
                    if ((dist<currentDist) || (currentDist===-1)) {
                        this.targetItemType=this.core.game.developer.SELECT_ITEM_MESH;
                        this.targetItemIndex=n;
                        hitPnt.setFromPoint(this.rayIntersectPnt);
                        currentDist=dist;
                    }
                }
            }
            
                // check the ceiling trigs

            nCollisionTrig=mesh.collisionCeilingTrigs.length;

            for (k=0;k!==nCollisionTrig;k++) {
                collisionTrig=mesh.collisionCeilingTrigs[k];
                if (!collisionTrig.overlapBounds(this.rayXBound,this.rayYBound,this.rayZBound)) continue;

                if (collisionTrig.rayTrace(pnt,vector,this.rayIntersectPnt)) {
                    dist=pnt.distance(this.rayIntersectPnt);
                    if ((dist<currentDist) || (currentDist===-1)) {
                        this.targetItemType=this.core.game.developer.SELECT_ITEM_MESH;
                        this.targetItemIndex=n;
                        hitPnt.setFromPoint(this.rayIntersectPnt);
                        currentDist=dist;
                    }
                }
            }
        }

            // check entities

        nEntity=this.core.map.entityList.entities.length;
        
        for (n=0;n!==nEntity;n++) {
            entity=this.core.map.entityList.entities[n];
            if (!entity.mapSpawn) continue;
            
            if (this.collision.rayCylinderIntersection(pnt,vector,entity.originalPosition,entity.radius,entity.height,this.rayIntersectPnt)) {
                dist=pnt.distance(this.rayIntersectPnt);
                if ((dist<currentDist) || (currentDist===-1)) {
                    this.targetItemType=this.core.game.developer.SELECT_ITEM_ENTITY;
                    this.targetItemIndex=n;
                    hitPnt.setFromPoint(this.rayIntersectPnt);
                    currentDist=dist;
                }
            }
        }
        
            // check lights

        nLight=this.core.map.lightList.lights.length;
        
        for (n=0;n!==nLight;n++) {
            light=this.core.map.lightList.lights[n];
            
            this.iconPosition.setFromPoint(light.position);
            this.iconPosition.y-this.ICON_CLICK_SIZE;
            
            if (this.collision.rayCylinderIntersection(pnt,vector,this.iconPosition,this.ICON_CLICK_SIZE,(this.ICON_CLICK_SIZE*2),this.rayIntersectPnt)) {
                dist=pnt.distance(this.rayIntersectPnt);
                if ((dist<currentDist) || (currentDist===-1)) {
                    this.targetItemType=this.core.game.developer.SELECT_ITEM_LIGHT;
                    this.targetItemIndex=n;
                    hitPnt.setFromPoint(this.rayIntersectPnt);
                    currentDist=dist;
                }
            }
        }
        
            // check effects

        nEffect=this.core.map.effectList.effects.length;
        
        for (n=0;n!==nEffect;n++) {
            effect=this.core.map.effectList.effects[n];
            if (!effect.mapSpawn) continue;
            
            this.iconPosition.setFromPoint(effect.position);
            this.iconPosition.y-this.ICON_CLICK_SIZE;
            
            if (this.collision.rayCylinderIntersection(pnt,vector,this.iconPosition,this.ICON_CLICK_SIZE,(this.ICON_CLICK_SIZE*2),this.rayIntersectPnt)) {
                dist=pnt.distance(this.rayIntersectPnt);
                if ((dist<currentDist) || (currentDist===-1)) {
                    this.targetItemType=this.core.game.developer.SELECT_ITEM_EFFECT;
                    this.targetItemIndex=n;
                    hitPnt.setFromPoint(this.rayIntersectPnt);
                    currentDist=dist;
                }
            }
        }
        
            // check nodes

        nNode=this.core.map.path.nodes.length;
        
        for (n=0;n!==nNode;n++) {
            node=this.core.map.path.nodes[n];
            
            this.iconPosition.setFromPoint(node.position);
            this.iconPosition.y-this.ICON_CLICK_SIZE;
            
            if (this.collision.rayCylinderIntersection(pnt,vector,this.iconPosition,this.ICON_CLICK_SIZE,(this.ICON_CLICK_SIZE*2),this.rayIntersectPnt)) {
                dist=pnt.distance(this.rayIntersectPnt);
                if ((dist<currentDist) || (currentDist===-1)) {
                    this.targetItemType=this.core.game.developer.SELECT_ITEM_NODE;
                    this.targetItemIndex=n;
                    hitPnt.setFromPoint(this.rayIntersectPnt);
                    currentDist=dist;
                }
            }
        }

            // any hits
            
        return(currentDist!==-1);
    }
    
        //
        // main run and draw
        //
        
    run(position,angle)
    {
        this.lookPoint.setFromPoint(position);
        
        this.lookVector.setFromValues(0,0,this.LOOK_DISTANCE);
        this.lookVector.rotateX(null,angle.x);
        this.lookVector.rotateY(null,angle.y);
        
        if (this.rayCollision(this.lookPoint,this.lookVector,this.lookEndPoint)) {
            this.core.interface.updateText('wsTarget',('target:'+this.core.game.developer.getSelectName(this.targetItemType,this.targetItemIndex)));
        }
        else {
            this.lookEndPoint.setFromAddPoint(this.lookPoint,this.lookVector);
            this.core.interface.updateText('wsTarget','target:');
        }
    }

    draw()
    {
        let bitmap;
        let gl=this.core.gl;
        
            // the target
            
        gl.disable(gl.DEPTH_TEST);
            
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
        
        bitmap=this.core.bitmapList.get('../developer/sprites/target.png');
        this.core.game.developer.developerSprite.drawBillboardSprite(bitmap,this.lookEndPoint,false);
        
        gl.disable(gl.BLEND);
        
        gl.enable(gl.DEPTH_TEST);
    }
}
