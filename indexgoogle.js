//require('dotenv').config({ path: 'config.env' }); //local variables
require('dotenv').config(); //heroku environment variables
console.log(process.env);
const Discord = require("discord.js");
const { GoogleSpreadsheet } = require('google-spreadsheet');//load libraries


const doc = new GoogleSpreadsheet(process.env.spreadsheet);
async function uploadmovie(username, movie) {
await doc.useServiceAccountAuth({
  client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  private_key: JSON.parse(process.env.GOOGLE_PRIVATE_KEY)
});
await doc.loadInfo(); // load worksheet
console.log(doc.title);
const sheet = doc.sheetsByIndex[0]; // select sheet 1
const uploadmovie = await sheet.addRow({ username: username, movie: movie });

}

const client = new Discord.Client();


client.on("ready", () => {
  console.log(`Bot started.`); 
  client.user.setActivity(`suggest a film for movie night with !movie`); //set discord status on launch
});


client.on("message", async message => {
//run on every message
  if(message.author.bot) return;
  if(message.content.indexOf(process.env.discordprefix) !== 0) return;
  //if bot or not prefix, exit loop
  const args = message.content.slice(process.env.discordprefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  //split text from prefix and save first word as command, rest as args
  
  
  if(command === "movie") {
    if(!message.member.roles.cache.has("686007629209927682") ){ //check if user has sub role
       message.channel.send({embed: {
            color: 0x0E0D40,
            title: "Movie Night",
            description: "Sorry, <@"+ message.author.id + ">, movie nights are every other weekend for Twitch subscribers.\nWe host them here in discord!",
            footer:{ text: "if you think this is in error, please contact TacticalTot#0001" }
        }});
    } else {

    if (!args.length)//if no text after command, display help text
        message.channel.send({embed: {
            color: 0x0E0D40,
            title: "Movie Night",
            description: "Movie nights are every other weekend for Twitch subscribers.\nUse '!movie *title*' to suggest a movie!"
        }});
    if (args.length){//if movie, echo movie name, delete initial message to reduce spam
        const addmovie = args.join(" ");
        message.delete();
        message.channel.send({embed: {
            color: 0x0E0D40,
            description: "<@"+ message.author.id + "> suggested the movie \"" + addmovie +"\"" ,
            footer:{ text: "saved" }
        }});
        uploadmovie(message.author.username, addmovie); //call function to login and upload movie to spreadsheet

    }

  }}
});

client.login(process.env.discordtoken); //start bot