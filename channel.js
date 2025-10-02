const fs = require('fs');
const path = require('path');

const channelFile = path.join(__dirname, 'channel.txt');

function setIDChannel(id, type){
    const data = fs.readFileSync(channelFile,'utf8');
    const channelsID = data.split('\n');
    if(type==='rappel'){
        channelsID[0] = id;
    }else if(type==='prog'){
        channelsID[1]=id;
    }
    fs.writeFileSync(channelFile, channelsID.join('\n'), 'utf8');
}
function getIDChannel(type){
    const data =fs.readFileSync(channelFile,'utf8');
    const channelsID = data.split('\n');
    if(type==='rappel'){
        return channelsID[0];
    }else if(type==='prog'){
        return channelsID[1];
    }
}
function verifyFile(){
    if(!fs.existsSync(channelFile) || fs.readFileSync(channelFile, 'utf8').trim()===""){
        return false;
    }else{
        return true;
    }
}

module.exports ={setIDChannel, verifyFile, getIDChannel};