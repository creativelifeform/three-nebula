
class ParticlePool extends ParticleBuffer{

    len(x,y,z){return Math.sqrt((x*x)+(y*y)+(z?(z*z):0))}
    lenSq(x,y,z){return (x*x)+(y*y)+(z?(z*z):0);}

    constructor(params){

        super(params)
        this.free={}
        this.active={}
        this.freeCount=0
        this.activeCount=0
        this.behaviors={}
        this.types={}

        this.sin=Math.sin
        this.cos=Math.cos
        this.acos=Math.acos
        this.tan=Math.tan
        this.atan=Math.atan
        this.atan2=Math.atan2
        this.sqrt=Math.sqrt
        this.cbrt=Math.cbrt
        this.pi=Math.PI
        this.pi2=Math.PI*2
        this.rnd = Math.random
        this.srnd = () => (Math.random()*2)-1
        

        for(var i=0,l=this.maxParticles;i<l;i++){
            var p=new Particle(this,i*this.stride)
            p.next=this.free.next;
            this.free.next = p;
        }
        this.freeCount=this.maxParticles;
        this.frustumCulled = false
    }
    reset(){
        super.reset();
        this.colorTab = this.tileTab = this.behavior = this.simulate = undefined;
        while(this.activeCount)
            this.dealloc(this.active,this.active.next)
       
    }

    set(p,props){
        for(var i in props)p[i]=props[i]
    }
/*
    a = number of particles to allocate

    b = params.. if params is string, use as name of template
*/

    alloc(a,b){
        var params=a;
        if(typeof a==='number'){
            params=b;
            for(var i=0,ct=a<this.freeCount?a:this.freeCount;i<a;i++)
                this.alloc(params)
            return;
        }
        if(typeof params==='string'){
            if(!this.lib[params]){
                console.log("No lib in system named:"+params)
                debugger;
                return;
            }
        }
        var i
        var p=this.free.next;
        if(!p)
            return;//throw "Out of particles!"
        this.free.next = p.next
        p.next=this.active.next;
        this.active.next = p;
        p.reset();

        if(params){
            if(typeof params=='function')
                params(p);
            else this.set(p,params)
        }else
            for(var i=p.i,l=i+this.stride,d=p.d;i<l;i++)d[i]=0;
        
        this.activeCount++
        this.freeCount--
        return p;
    }
    dealloc(p,pp){
        pp.s=pp.cr=pp.cg=pp.cb=pp.ca=0;
        pp.vx=pp.vy=pp.vz=pp.behavior=pp.colorTab=pp.tileTab=pp.previous=pp.ribbon=undefined;
        
        p.next=pp.next;
        pp.next=this.free.next;
        this.free.next = pp;
        this.freeCount++
        this.activeCount--
    }
    getIndex(){
        if(!this._indexBuffer){
            var pdim = (Math.sqrt(this.maxParticles)-1)|0
            this._indexBuffer=new Array(pdim*pdim*6);
            for(var i=0,il=this._indexBuffer.length;i<il;i++)this._indexBuffer[i]=(Math.random()*100000)|0;
            this._indexBuffer=new THREE.Uint32BufferAttribute(this._indexBuffer,1)
            this._indexBuffer.setUsage(THREE.DynamicDrawUsage)
            this.ribbonGeometry.setIndex(this._indexBuffer)
        }
        return this._indexBuffer;
    }
    transform(fn){
        var par = this.active;
        var imin=Infinity;
        var imax=-1;
        var stride = this.stride;

        var ribTop=0;
        
        while(par.next){
            var pp=par.next;
            if(pp.i<imin)imin=pp.i;
            if(pp.i>imax)imax=pp.i+stride;
            if(fn(pp)===false)
                this.dealloc(par,pp)
            else
                par=par.next;
            if(pp.ribbon){
                var ib = this.getIndex().array;
                var p0=pp.ribbon.i/stride;
                var p1=pp.i/stride;
                var p2=pp.previous.i/stride;
                var p3=pp.ribbon.previous.i/stride;
                ib[ribTop++]=p0;
                ib[ribTop++]=p1;
                ib[ribTop++]=p2;
                ib[ribTop++]=p2;
                ib[ribTop++]=p3;
                ib[ribTop++]=p0;
            }
        }
        if(imax>imin){
            var ct = imax-imin;//this.count*this.stride
            this.interleavedBuffer.updateRange.offset = imin;
            //ct = ct<1000?ct:1000;
            this.interleavedBuffer.updateRange.count = ct;
            this.pointsGeometry.setDrawRange(imin/stride,ct/stride);
            this.interleavedBuffer.needsUpdate = true;
        }

        if(ribTop>0){
            var ib = this.getIndex();
            ib.count = ribTop;
            ib.updateRange.count=ribTop;
            ib.needsUpdate = true;
            this.ribbonGeometry.setDrawRange(0,ribTop);
        }
    }
}

class Particle{
    get px(){return this.d[this.i+0]}
    get py(){return this.d[this.i+1]}
    get pz(){return this.d[this.i+2]}
    get cr(){return this.d[this.i+3]}
    get cg(){return this.d[this.i+4]}
    get cb(){return this.d[this.i+5]}
    get ca(){return this.d[this.i+6]}
    get r(){return this.d[this.i+7]}
    get s(){return this.d[this.i+8]}
    get age(){return this.d[this.i+9]}

    set px(v){return this.d[this.i+0]=v}
    set py(v){return this.d[this.i+1]=v}
    set pz(v){return this.d[this.i+2]=v}
    set cr(v){return this.d[this.i+3]=v}
    set cg(v){return this.d[this.i+4]=v}
    set cb(v){return this.d[this.i+5]=v}
    set ca(v){return this.d[this.i+6]=v}
    set r(v){return this.d[this.i+7]=v}
    set s(v){return this.d[this.i+8]=v}
    set age(v){return this.d[this.i+9]=v}

//Not all particles will have this...
    get t0(){return this.d[this.i+10]}
    get t1b(){return this.d[this.i+11]}

    set t0(v){return this.d[this.i+10]=v}
    set t1b(v){return this.d[this.i+11]=v}


    constructor(system,i){

        this.sys=system;
        this.d=system.data;
        this.i=i;
    }

    set(props){
        for(var i in props)this[i]=props[i]
    }

    reset(){
        this.parent=0
        this.vx=0
        this.vy=0
        this.vz=0
        this.px=0
        this.py=0
        this.pz=0
        this.cr=0
        this.cg=1
        this.cb=1
        this.ca=1
        this.r=1
        this.s=0.01
        this.age=0
        this.tile0=0
        this.tile1blend=0
        this.dead=this.ribbon=this.previous = undefined;
    }

}