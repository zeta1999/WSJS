import BoundClass from '../utility/bound.js';

export default class LineClass
{
    constructor(p1,p2)
    {
        this.p1=p1;
        this.p2=p2;
        
        this.xBound=new BoundClass(0,0);   // cached to avoid GC
        this.yBound=new BoundClass(0,0);
        this.zBound=new BoundClass(0,0);
        
        Object.seal(this);
    }
    
    setFromValues(p1,p2)
    {
        this.p1=p1;
        this.p2=p2;
    }
    
    addPoint(pnt)
    {
        this.p1.addPoint(pnt);
        this.p2.addPoint(pnt);
    }
    
    equals(line)
    {
        if ((this.p1.equals(line.p1)) && (this.p2.equals(line.p2))) return(true);
        return((this.p1.equals(line.p2)) && (this.p2.equals(line.p1)));
    }
    
    boxBoundCollision(xBound,yBound,zBound)
    {
        if ((this.p1.x<xBound.min) && (this.p2.x<xBound.min)) return(false);
        if ((this.p1.x>xBound.max) && (this.p2.x>xBound.max)) return(false);
        if ((this.p1.y<yBound.min) && (this.p2.y<yBound.min)) return(false);
        if ((this.p1.y>yBound.max) && (this.p2.y>yBound.max)) return(false);
        if ((this.p1.z<zBound.min) && (this.p2.z<zBound.min)) return(false);
        return(!((this.p1.z>zBound.max) && (this.p2.z>zBound.max)));
    }
    
    getXBound()
    {
        this.xBound.setFromValues(this.p1.x,this.p2.x);
        return(this.xBound);
    }
    
    getYBound()
    {
        this.yBound.setFromValues(this.p1.y,this.p2.y);
        return(this.yBound);
    }
    
    getZBound()
    {
        this.zBound.setFromValues(this.p1.z,this.p2.z);
        return(this.zBound);
    }
}
