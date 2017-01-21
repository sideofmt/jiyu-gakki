'use strict';

var indexList = new Array(); // player's index
var limitMax = 20;


class Player{
  constructor(instrument,pan,octave){
    this.index = null;
    var i=0;
    while(true){
      if(indexList.indexOf(i) == -1){
        this.index = i;
        indexList.push(i);
        break;
      }
      i++;
    }
    this.instrument = instrument;
    this.pan = pan;
    this.note = new Array();
    this.noteLimit = new Map();
    this.base = 60;
    this.melody = null;
  }
  
  remove(){
    var i = indexList.indexOf(this.index);
    indexList.splice(i,1);
    this.index = null;
    return;
  }
  
  setIndex(index){
    if(indexList.includes(index)){
      console.error("index "+ index +" is still existed.");
      return;
    }
    indexList[this.index] = index;
    this.index = index;
    return;
  }
  getIndex(){
      return this.index;
  }
  setInst(instrument){
    this.instrument = instrument;
  }
  getInst(){
    return this.instrument;
  }
  
  pushNote(key){
    var isNoteOn = false;
    
    if(this.note.indexOf(key) == -1){
      this.note.push(key);
      isNoteOn = true;
    }
    this.noteLimit.set(key,limitMax);
    return isNoteOn;
  }
  getNote(){
    return this.note.slice();
  }
  updateLimit(key){
    var notelimit = this.noteLimit;
    var limit = notelimit.get(key);
    limit--;
    if(limit<=0){
      this.noteLimit.delete(key);
      this.note.splice(this.note.indexOf(key), 1);
      return false;
    }
    //console.log(notelimit);
    notelimit.set(key,limit);
    return true;
  }
  updateLimit2(key){
    var notelimit = this.noteLimit;
    var limit = notelimit.get(key);
    limit--;
    notelimit.set(key,limit);
  }
  
  limitZero(key){
    try{
      var limit = this.noteLimit.get(key);
      limit = 0;
      this.noteLimit.set(key,limit);
    }catch(e){
      console.error(e);
    }
  }
  
  getLimit(key){
    let limit = this.noteLimit.get(key);
    return limit;
  }
  
  static getIndexList(){
    return indexList;
  }
  
  static setLimitMax(limitmax){
    limitMax = limitmax;
  }
  
  
  setBase(base){
    this.base = base;
  }
  getBase(){
    return this.base;
  }
  
  
  setMelody(melody){
    this.melody = melody;
  }
  getMelody(){
    return this.melody;
  }
  
}


module.exports = Player;