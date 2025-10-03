const loots = require('./loot.json');
function getLoot(category){
    if(category === undefined){
        const random = Math.floor(Math.random() * loots.loot.length);
        return loots.loot[random];
    }else{
        const findLoot = loots.loot.filter(loot => loot.category === category);
        const random = Math.floor(Math.random() * findLoot.length);
        return findLoot[random];
    }
}

module.exports ={getLoot};