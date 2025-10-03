const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const dotenv = require('dotenv');
const {addAlarm, checkAlarm, programAlarm, deleteAlarm, modifyAlarm} = require('./alarm')
const{setIDChannel, verifyFile} =require('./channel');
const {getLoot} = require('./loot');
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

setInterval(() => {
    checkAlarm(client);
}, 60000);

client.on('messageCreate', async message => {
  if (message.content.toLowerCase().includes("nerium")) {
        message.react("❤️").catch(console.error);
        message.react("1140344965654921341").catch(console.error);
  }
  if (message.content.toLowerCase().includes("stolas")) {
        message.react("1223755213953962155").catch(console.error);
  }
  if (message.content.toLowerCase().includes("thé")) {
        message.react("798904413787258880").catch(console.error);
  }
  if (message.content.toLowerCase().includes("sac")) {
        message.react("1279811862934061096").catch(console.error);
  }
  if (message.content.toLowerCase().includes("critique")) {
        message.react("807721226293870642").catch(console.error);
  }
  if ((message.content.toLowerCase().includes("mimic")) || ((message.content.toLowerCase().includes("salade")))) {
        message.react("1284922799948959834").catch(console.error);
  }
  //Help
  if(message.content === '!rolly' || message.content === '!help') {
    const helpEmbed = new EmbedBuilder()
        .setTitle("Petit récapitulatif de ce que je peux faire, aventuriers ! 🏹")
        .setColor(0x1abc9c)
        .setDescription(
            "**__Pour lancer un dé c'est tout simple :__**\n" +
            "`!r 1d20-1`\n" +
            "`!rolly 2d20+4`\n\n" +
            "**__Les alarmes :__**\n" +
            "`!setRappel` → Définit le salon des rappels\n" +
            "`!setProg` → Définit le salon des programmations\n\n" +
            "`!séance 24/12/2025 16h00 'TOA'`\n" +
            "`!s 14/01/2026 15h00 'Pathfinder: Mais où est Bernadette'`\n" +
            "Permet de créer une alarme pour la prochaine séance! Le format de la commande est important, n'oublie pas les **guillemets simples**, aventurier !\n\n" +
            "`!delete 03/12/2025`\n"+
            "`!d 12/12/2025`\n"+
            "Supprime une séance et ses rappels d'alarme, sinon je vais t'appeler dans la salle et tout le monde va te regarder !\n\n"+
            "`!edit 03/12/2025 04/12/2025 16h00 'TOA'`\n"+
            "`!e 24/12/2025 23/12/2025 16h00 'Les petites Vieilles'`\n"+
            "Modifie une séance, attention, précise-moi bien la date de l'ancienne séance et redonne moi TOUT les détails pour la replannifier "
        );

    message.channel.send({ embeds: [helpEmbed] });
    return;
}
  //Set ID pour les alarmes
  if(message.content==='!setRappel'){
    setIDChannel(message.channel.id, 'rappel');
    message.channel.send("C'est bien noté de mon côté! J'espère que vous savez utilisez cette commande")
  }
  if(message.content==='!setProg'){
    setIDChannel(message.channel.id, 'prog');
    message.channel.send("C'est bien noté de mon côté! J'espère que vous savez utilisez cette commande")
  }
  //Lancer un dé
  if (message.content.startsWith('!roll') || message.content.startsWith('!r')) {
    const args = message.content.split(' ')[1];
    let mod = 0;
    if (!args) {
        message.channel.send("Utilisation : `!roll 1d20` par exemple !");
        return;
    }
    if(args.includes('+')){
      mod = parseInt(args.split('+')[1]);
    }else if(args.includes('-')){
      mod = -parseInt(args.split('-')[1]);
    }
    const modSign = mod >= 0 ? `+ ${mod}` : `- ${Math.abs(mod)}`;
    const dice = args.split('d');
    const numDice = parseInt(dice[0], 10);
    const numSides = parseInt(dice[1], 10);
    let rollResult = 0;
    let rolls = [];
    for (let i = 0; i < numDice; i++) {
      rolls[i] = Math.floor(Math.random() * numSides) + 1;
    }
    for (let i =0; i< rolls.length; i++){
      rollResult += rolls[i];
    }
    let details = rolls.join('+');
    if(mod != 0){
      details += `${modSign}`;
    }
    rollResult += mod;
    let rollMessage ='';
    if(rollResult === 1 || rollResult < 0){
      rollMessage = "Et c'est ainsi qu'il meurt en ratant la marche... : ";
    }else if(rollResult === numSides*numDice){
      rollMessage ="On en attendais pas moins ! : ";
    }else if(rollResult > numSides*numDice){
      rollMessage = "Si le jet est raté c'est que le MJ prépare un mauvais coup : ";
    }else if( rollResult <= (numSides*numDice)/2 && rollResult >1){
      rollMessage = "On a vu mieux je crois : ";
    }else if (rollResult > (numSides*numDice)/2 && rollResult < numSides*numDice){
      rollMessage ="Plutôt pas mal pour une fois ! :";
    }
    message.channel.send(`${rollMessage} ${rollResult} ${numDice > 1 ? '('+ `${details}`+')': "" }`);
  }
  if(message.content.startsWith('!séance') || (message.content.startsWith('!s') && message.content !=='!setRappel' && message.content!=='!setProg')){
    const exist = verifyFile();
    if(exist){
      const args = message.content.split(' ');
      if (!args || args.length <4){
          message.channel.send("Utilisation : `!séance 24/12/2025 16h00 'TOA'` par exemple !");
          return;
      }
      const date = args[1];
      const heure = args[2];
      const label = args.slice(3).join(" ");
      const idMessage = await programAlarm(date, heure,label,client);
      addAlarm(date, heure,label,message.author.id, idMessage);
      message.channel.send(`Séance ajoutée : **${date} ${heure} - ${label}** ✅`);
    }else{
      message.channel.send("Tout d'abord tu dois définir là où tu veux que je te fasse les rappels! Pour cela fait `!setRappel` dans le salon où tu veux tes alarmes !")
    }

  }
  if(message.content.startsWith('!delete') || message.content.startsWith('!d')){
    const date = message.content.split(' ')[1];
    const canDel = deleteAlarm(date,client);
    if(canDel){
      message.channel.send('Bien pris aventuriers, la quête est enlevé!')
    }else{
      message.channel.send('Je pense que vous avez pris un verre de trop, je ne vois pas de quel quête vous parlez.');
    }
  }
  if(message.content.startsWith('!edit') || message.content.startsWith('!e')){
    const canModify = modifyAlarm(message.content, message.author.id,client);
    if(canModify){
      message.channel.send('C’est noté ! L’aventure attendra encore un peu.')
    }else{
      message.channel.send('Tu as du abuser de champignon mon brave, je ne vois pas de quel quête tu me parles.')
    }
  }
  if(message.content.startsWith('!loot') || message.content.startsWith('!l')){
    const haveCategory = message.content.split(' ');
    const categoriesDisponibles = ["arme", "armure", "potion", "équipement","récolte","trésor","monstre","provision","curse"];
    let loot;
    if (haveCategory.length === 1) {
        loot = getLoot();
    }
    else if (haveCategory[1].toLowerCase() === "catégories") {
      const lootEmbed = new EmbedBuilder()
        .setTitle('Catégories disponibles :')
        .setColor(0x1abc9c)
        .setDescription(categoriesDisponibles.map(c => `- ${c}`).join("\n"));
        message.channel.send({ embeds: [lootEmbed] });
        return;
    }
    else if (categoriesDisponibles.includes(haveCategory[1].toLowerCase())) {
        loot = getLoot(haveCategory[1].toLowerCase());
    }
    else {
        const lootEmbed = new EmbedBuilder()
          .setTitle('Catégories disponibles :')
          .setColor(0x1abc9c)
          .setDescription(categoriesDisponibles.map(c => `- ${c}`).join("\n"));
        message.channel.send({ embeds: [lootEmbed] });
        return;
    }
    const lootName = loot.name;
    const lootCategory = loot.category;
    const lootDescr = loot.description;
    let imageFile;
    switch (lootCategory) {
        case "arme":
            imageFile = "./asset/arme.png";
            break;
        case "armure":
            imageFile = "./asset/armure.png";
            break;
        case "potion":
            imageFile = "./asset/potion.png";
            break;
        case "équipement":
            imageFile = "./asset/equipement.png";
            break;
        case "trésor":
          imageFile = "./asset/tresor.png";
          break;
        case "provision":
          imageFile = "./asset/provision.png";
          break;
        case "récolte":
          imageFile = "./asset/recolte.png";
          break;
        case "monstre":
          imageFile = "./asset/monstre.png";
          break;
        case "curse":
          imageFile = "./asset/nerium.jpg";
          break;
        default:
            imageFile = null;
    }
    const lootEmbed = new EmbedBuilder()
      .setTitle(`${lootName}`)
      .setColor(0x1abc9c)
      .addFields(
            { 
                name: "Catégories : ", 
                value: `${lootCategory}`, 
                inline: false 
            },
            { 
                name: "Description : ", 
                value: `${lootDescr}`, 
                inline: false 
            }
      )
      if (imageFile) {
        lootEmbed.setThumbnail(`attachment://${imageFile.split('/').pop()}`);
        message.channel.send({ embeds: [lootEmbed], files: [imageFile] });
    } else {
        message.channel.send({ embeds: [lootEmbed] });
    }
  }

});

client.login(process.env.DISCORD_TOKEN);
