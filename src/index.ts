import Discord from 'discord.js';
import privateConfig from './private-config.json';
import PirateBay from 'thepiratebay';
import { IncomingMessage, request } from 'http';
import { promisify } from 'util';

const client = new Discord.Client();

client.on('ready', () => {
    console.log(`Logged in as ${client.user?.tag}!`);
});

let asdf;
client.on('message', async (message) => {
    if (message.channel.type !== "dm") {
        message.reply("Please DM me to work!");
        return;
    }
    console.log(`Searching for ${message.content}`);
});

client.login(privateConfig.token);