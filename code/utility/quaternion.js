export default class QuaternionClass
{
    constructor(x,y,z,w)
    {
        this.x=x;
        this.y=y;
        this.z=z;
        this.w=w;
        
        Object.seal(this);
    }
    
    setIdentity()
    {
        this.x=0;
        this.y=0;
        this.z=0;
        this.w=1;
    }
    
    setFromValues(x,y,z,w)
    {
        this.x=x;
        this.y=y;
        this.z=z;
        this.w=w;
    }
    
    setFromQuaternion(quat)
    {
        this.x=quat.x;
        this.y=quat.y;
        this.z=quat.z;
        this.w=quat.w;
    }
    
    setFromVectorAndAngle(x,y,z,ang)
    {
        let rd=ang*(Math.PI/180.0);
        let sn=Math.sin(rd*0.5);
        
        this.x=sn*x;
        this.y=sn*y;
        this.z=sn*z;
        this.w=Math.cos(rd*0.5);
    }
    
    normalize()
    {
        let f=Math.sqrt((this.x*this.x)+(this.y*this.y)+(this.z*this.z)+(this.w*this.w));
        if (f!==0.0) f=1.0/f;
        
        this.x*=f;
        this.y*=f;
        this.z*=f;
        this.w*=f;
    }
    
    setFromMultiply(q1,q2)
    {
        this.x=(q1.x*q2.w)+(q1.y*q2.z)-(q1.z*q2.y)+(q1.w*q2.x);
        this.y=(-q1.x*q2.z)+(q1.y*q2.w)+(q1.z*q2.x)+(q1.w*q2.y);
        this.z=(q1.x*q2.y)-(q1.y*q2.x)+(q1.z*q2.w)+(q1.w*q2.z);
        this.w=(-q1.x*q2.x)-(q1.y*q2.y)-(q1.z*q2.z)+(q1.w*q2.w);
    }
    
    multiply(quat)
    {
        let x2=(this.x*quat.w)+(this.y*quat.z)-(this.z*quat.y)+(this.w*quat.x);
        let y2=(-this.x*quat.z)+(this.y*quat.w)+(this.z*quat.x)+(this.w*quat.y);
        let z2=(this.x*quat.y)-(this.y*quat.x)+(this.z*quat.w)+(this.w*quat.z);
        let w2=(-this.x*quat.x)-(this.y*quat.y)-(this.z*quat.z)+(this.w*quat.w);
        
        this.x=x2;
        this.y=y2;
        this.z=z2;
        this.w=w2;
    }
    
    multiplyValues(qx,qy,qz,qw)
    {
        let x2=(this.x*qw)+(this.y*qz)-(this.z*qy)+(this.w*qx);
        let y2=(-this.x*qz)+(this.y*qw)+(this.z*qx)+(this.w*qy);
        let z2=(this.x*qy)-(this.y*qx)+(this.z*qw)+(this.w*qz);
        let w2=(-this.x*qx)-(this.y*qy)-(this.z*qz)+(this.w*qw);
        
        this.x=x2;
        this.y=y2;
        this.z=z2;
        this.w=w2;
    }
    
    fromMatrix(mat)
    {
        let w4;
        
        this.w=Math.sqrt(1.0+mat.data[0]+mat.data[5]+mat.data[10])/2.0;
	
        w4=this.w*4.0;
        this.x=(mat.data[6]-mat.data[9])/w4;
        this.y=(mat.data[8]-mat.data[2])/w4;
        this.z=(mat.data[1]-mat.data[4])/w4;
    }
    
    getEulerAngle(ang)
    {
        let sinRcosP,cosRcosP;
        let sinP;
        let sinYcosP,cosYcosP;
        
        sinRcosP=2*((this.w*this.x)+(this.y*this.z));
        cosRcosP=1-(2*((this.x*this.x)+(this.y*this.y)));
        ang.x=Math.atan2(sinRcosP,cosRcosP)*(180.0/Math.PI);
        
        sinP=2*((this.w*this.y)-(this.z*this.x));
        if (Math.abs(sinP)>=1.0) {
            ang.y=(Math.PI*0.5)*Math.sign(sinP);
        }
        else {
            ang.y=Math.asin(sinP);
        }
        ang.y*=(180.0/Math.PI);
        
        sinYcosP=2*((this.w*this.z)+(this.x*this.y));
        cosYcosP=1-(2*((this.y*this.y)+(this.z*this.z)));
        ang.z=Math.atan2(sinYcosP,cosYcosP)*(180.0/Math.PI);
    }
    
    copy()
    {
        return(new QuaternionClass(this.x,this.y,this.z,this.w));
    }
    
    toString()
    {
        return('('+this.x+','+this.y+','+this.z+','+this.w+')');
    }
}
