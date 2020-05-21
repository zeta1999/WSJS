export default class UploadClass
{
    constructor(core)
    {
        this.core=core;
    }

    async upload(fileName,uploadType,data)
    {
        let idx;
        let path,url;
        let resp;
        
        console.info('uploading='+fileName+'>'+data.length);
        
            // get the upload path
            
        path=window.location.pathname;
        idx=path.indexOf('/',1);
        if (idx!==-1) path=path.substring(0,(idx+1));
        
        url=window.location.protocol+'//'+window.location.host+path;
        if (!url.endsWith('/')) url+='/';
        url+=encodeURIComponent(this.core.map.json.name)+'/'+uploadType+'/'+fileName;
        
            // upload
            
        try {
            resp=await fetch(url,{method:'POST',headers:{'Content-Type':'application/octet-stream'},body:data});
        }
        catch (e) {
            throw new Error('Unable to post to server '+fileName+'; '+e.message);
        }
    }
}
