const { Client, GatewayIntentBits } = require('discord.js');
const dotenv = require('dotenv');

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once('ready', () => {
  console.log(`Connecté en tant que ${client.user.tag}!`);
});

client.on('messageCreate', message => {
  if (message.content.startsWith('!roll') || message.content.startsWith('!r')) {
    const args = message.content.split(' ')[1];
    if (!args) {
        message.channel.send("Utilisation : `!roll 1d20` par exemple !");
        return;
    }
    const dice = args.split('d');
    const numDice = parseInt(dice[0], 10);
    const numSides = parseInt(dice[1], 10);
    
    let rollResult = 0;
    for (let i = 0; i < numDice; i++) {
      rollResult += Math.floor(Math.random() * numSides) + 1;
    }
    
    if (rollResult === 1){
        message.channel.send(`Et c'est ainsi qu'il meurt en ratant la marche... : ${rollResult}`);
    }else if (rollResult <= (numSides*numDice)/2 && rollResult >1){
        message.channel.send(`C'est pas trop ça... : ${rollResult} `)
    }else if (rollResult > (numSides*numDice)/2 && rollResult < numSides*numDice){
        message.channel.send(`Pas mal ! : ${rollResult}`)
    }else{
        message.channel.send(`Juste le meilleur en faite ! : ${rollResult}`)
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
