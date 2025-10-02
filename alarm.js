const fs = require('fs');
const {EmbedBuilder } = require('discord.js');
const path = require('path');
const{getIDChannel} =require('./channel');

const alarmFile = path.join(__dirname, 'alarm.txt');

function addAlarm(date, heure,label,id, messageId){
    const alarmLine = `${date}|${heure}|${label}|${id}|0|0|${messageId}\n`;
    if (!fs.existsSync(alarmFile)) {
      fs.writeFileSync(alarmFile, alarmLine, 'utf8');
    } else {
      fs.appendFileSync(alarmFile, alarmLine, 'utf8');
    }
}
function deleteAlarm(date, client) {
    const alarms = readFile();
    let deleted = false;
    const newAlarms = alarms.filter(element => {
        const e = element.split('|');
        if (e[0] === date) {
            deleted = true;
            const messageID = e[6];
            deleteMessage(client, messageID);
            return false;
        }
        return true;
    });

    fs.writeFileSync(alarmFile, newAlarms.join('\n') + '\n', 'utf8');
    return deleted;
}

function modifyAlarm(message, id, client) {
    const args = message.split(" ");
    const oldDate = args[1];
    const newDate = args[2];
    const hour = args[3];
    const label = args.slice(4).join(" ");
    const alarms = readFile();
    const oldAlarm = alarms.find(element => 
        element.split('|')[0] === oldDate
    );
    if (oldAlarm) {
        const e = oldAlarm.split('|');
        const messageID = e[6];
        deleteMessage(client, messageID);
        deleteAlarm(oldDate);
        addAlarm(newDate, hour, label, id);
        programAlarm(newDate, hour, label, client);
        return true;
    } else {
        return false;
    }
}

async function deleteMessage(client, messageID) {
    const channelID = getIDChannel('prog');
    const channel = client.channels.cache.get(channelID);
    if (!channel) return;

    try {
        const message = await channel.messages.fetch(messageID);
        await message.delete();
    } catch (err) {
        console.error(`Impossible de supprimer le message ${messageID}:`, err);
    }
}

async function programAlarm(date, heure,label,client){
    const [day,month,year] = date.split('/');
    const monthDate = parseInt(month, 10) - 1;
    const sessionDate = new Date(parseInt(year, 10),monthDate,parseInt(day, 10));
    const weekday = sessionDate.toLocaleDateString('fr-FR', { weekday: 'long' });
    const monthName = sessionDate.toLocaleDateString('fr-FR', { month: 'long' });
    const channelProg = getIDChannel('prog');
    const labelSplit = label.split('\'');
    const embed = new EmbedBuilder()
        .setTitle(`📅\u00A0Prochaine séance ${labelSplit[1]} :`)
        .setColor(0x1abc9c)
        .addFields(
            { 
                name: "Détails :", 
                value: `${weekday} ${day} ${monthName}\n${heure}`, 
                inline: false 
            },
            { name: '\u200B', value: '\u200B' }
        )

        .setFooter({ text: "Ok 👍 | Nope 👎" });

    const sentMessage = await client.channels.cache.get(channelProg).send({embeds: [embed],});
    return sentMessage.id;
}
function readFile(){
    const data = fs.readFileSync(alarmFile, 'utf8').trim();
    return data.split('\n').filter(line => line.trim() !== "");
}
function sendMessage(client,time){
    if(time ==='day'){
        const channelRappel = getIDChannel('rappel')
        const hour = fs.readFileSync(alarmFile,'utf8').split('|')[1];
        client.channels.cache.get(channelRappel).send(`@everyone Une quête est arrivé! Demain à ${hour}, vous partez à l'aventure! Pensez à vérifier votre équipement et réviser vos sorts.`);
    }else if (time === 'hour'){
        const channelRappel = getIDChannel('rappel')
        client.channels.cache.get(channelRappel).send("@everyone Très cher aventuriers, il est temps. Pensez à vos rations de survie, votre journal pour noter vos aventures, dans une heure vous embarquez !");
    }
}
function checkAlarm(client) {
    const alarms = readFile();
    const now = Date.now();
    const newAlarms = alarms.filter(element => {
        const e = element.split('|');
        const [day, month, year] = e[0].split('/');
        const [hour, min] = e[1].split('h');
        const monthDate = parseInt(month, 10) - 1;
        const alarmDate = new Date(
            parseInt(year, 10),
            monthDate,
            parseInt(day, 10),
            parseInt(hour, 10),
            parseInt(min, 10),
        );
        if (alarmDate.getTime() < now) {
            return false;
        }
        const diff = alarmDate.getTime() - now;
        if (diff <= 86400000 + 30000 && diff >= 86400000 - 30000 && e[4] === "0") {
            e[4] = "1";
            sendMessage(client, 'day');
        }
        if (diff <= 3600000 + 30000 && diff >= 3600000 - 30000 && e[5] === "0") {
            e[5] = "1";
            sendMessage(client, 'hour');
        }
        return e.join('|');
    });
    fs.writeFileSync(alarmFile, newAlarms.join('\n') + '\n', 'utf8');
}



module.exports ={addAlarm, checkAlarm,programAlarm,deleteAlarm,modifyAlarm};