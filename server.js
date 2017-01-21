var testflag = false;


var main = require("./src/main.js");
var testmain = require("./test/testmain.js");

if(testflag){
  testmain();
}else{
  main();
}