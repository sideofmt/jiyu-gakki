
var ids = new Map();

class Test{
    
    static start(){
        /*
        var id=0;
        while(true){
            if(!ids.has(id)){
                ids.set(id,performance.now());
                break;
            }
            id++;
        }
        console.log(ids);
        */
        return performance.now();
    }
    
    static stop(starttime){
        
        var time = null;
        /*
        var basis = 0;
        if(!ids.has(id)){
            return null;
        }
        try{
            basis = ids.get(id);
            time = performance.now() - basis;
            ids.delete(id);
        }catch(e){
            console.error(e);
            return null;
        }*/
        try{
        time = performance.now() - starttime;
        }catch(e){
            console.error(e);
        }
        
        console.log("time:"+time);
        return time;
    }
}