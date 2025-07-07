require("dotenv").config();
const fs = require("node:fs");
const path = require("node:path");
const {Client, GatewayIntentBits, Events, Collection} = require("discord.js");
const {updateCommands} = require("./deploy-commands.js");
const {setEventData, getEventPlayerData} = require("./data/dataFunctions/dataFunctions.js");

const { TOKEN: token } = process.env;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
    ]
});
updateCommands();
// Events Handling
const eventsPath = path.join(__dirname, "events");
const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith(".js"));

for(const file of eventFiles){
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if(event.once){
        client.once(event.name, (...args) => event.execute(...args));
    }
    else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

//Command Handling
client.commands = new Collection();
const commandPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandPath).filter((file) => file.endsWith(".js"));

for(const file of commandFiles){
    const filePath = path.join(commandPath, file);
    const command = require(filePath);
    if ("data" in command && "execute" in command) {
        client.commands.set(command.data.name, command);
    } 
    else {
        console.log(`[WARNINING] The command @ ${filePath} is missing a required "data" or "execute property...`);
    }
}
(async () => {
  await setEventData();
})();
client.login(token);