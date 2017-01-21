'use strict';

var fs = require('fs');

class Test{
    
    static write(txt){
        
        fs.appendFile('test/testlog.txt', txt ,'utf8', function (err) {
            console.log(err);
            return;
        });
        //console.log("write data:"+txt);
    }
}

module.exports = Test;