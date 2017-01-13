'use strict';

class Melody{
    constructor(name,instrument){
        this.notes = new Array();
        this.name = name;
        this.instrument = instrument;
        this.num = 0;
        this.time = 0;
    }
    timeCount(){
        this.time++;
    }
    timeReset(){
        this.time = 0;
    }
    
    push(OnOff,key){
        this.notes.push([this.time,OnOff,key]);
    }
    
    pop(){
        var note = this.note[this.num];
        this.num++;
        if(this.num >= this.notes.length){
            this.num = 0;
            return "EOF";
        }
        return note;
    }
    
    setName(name){
        this.name = name;
    }
    getName(){
        return this.name;
    }
    setInst(instrument){
        this.instrument = instrument;
    }
    getInst(){
        return this.instrument;
    }
}

module.exports = Melody;