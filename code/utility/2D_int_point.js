import wsBound from '../../code/utility/bound.js';

const DEGREE_TO_RAD=Math.PI/180.0;
const RAD_TO_DEGREE=180.0/Math.PI;

export default class ws2DIntPoint
{
    constructor(x,y)
    {
        this.x=Math.trunc(x);
        this.y=Math.trunc(y);
        
        Object.seal(this);
    }
    
    setFromValues(xSet,ySet)
    {
        this.x=Math.trunc(xSet);
        this.y=Math.trunc(ySet);
    }
                
    addValues(xAdd,yAdd)
    {
        this.x=Math.trunc(this.x+xAdd);
        this.y=Math.trunc(this.y+yAdd);
    }
    
    noSquareDistance(pt)
    {
        let px=this.x-pt.x;
        let py=this.y-pt.y;
        return((px*px)+(py*py));
    }
                
    distance(pt)
    {
        return(Math.sqrt(this.noSquareDistance(pt)));
    }
    
    equals(pt)
    {
        return((this.x===pt.x)&&(this.y===pt.y));
    }
    
    rotate(centerPt,rot)
    {
        let rd,x,y;
        
        if (centerPt!==null) {
            this.x-=centerPt.x;
            this.y-=centerPt.y;
        }
        
        rd=rot*DEGREE_TO_RAD;
        
        x=(this.y*Math.sin(rd))+(this.x*Math.cos(rd));
        y=(this.y*Math.cos(rd))-(this.x*Math.sin(rd));
        
        if (centerPt!==null) {
            x+=centerPt.x;
            y+=centerPt.y;
        }
        
        this.x=Math.trunc(x);
        this.y=Math.trunc(y);
    }
    
    copy()
    {
        return(new ws2DIntPoint(this.x,this.y));
    }
}