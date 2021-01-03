import Discord from 'discord.js';
import privateConfig from './private-config.json';
import SearchClient from './clients/SearchClient';
import resultsToMessage from './parsers/resultsToMessage';
import { TorrentSearchResult } from 'thepiratebay';
import { indexToEmoji } from './parsers/indexEmoji';

const PAGE_SIZE = 5;
const client = new Discord.Client();
const activeSearchClients = new Map<string, SearchClient>();
const NUMBER_EMOJIS = [
    '1️⃣',
    '2️⃣',
    '3️⃣',
    '4️⃣',
    '5️⃣',
    '6️⃣',
    '7️⃣',
    '8️⃣',
    '9️⃣',
    '🔟'
];

client.on('ready', () => {
    console.log(`Logged in as ${client.user?.tag}!`);
});

client.on('message', async (message) => {
    if (message.channel.type !== "dm") return;
    if (message.author === client.user) return;

    console.log(`Searching for ${message.content}`);
    const searchClient = new SearchClient(message.content, PAGE_SIZE);
    const reply = await message.channel.send(`Searching for ${message.content}...`);
    activeSearchClients.set(reply.id, searchClient);

    const searchResults = await searchClient.next();
    await reply.edit(resultsToMessage(searchResults, searchClient.getDisplayPageNumber(), searchClient.getHasNext()));
});

client.on('messageReactionAdd', async (reaction) => {
    if (reaction.partial) {
        try {
            await reaction.fetch();
        } catch (error) {
            console.error(error);
            return;
        }
    }

    if (!activeSearchClients.has(reaction.message.id)) return;
    const searchClient = activeSearchClients.get(reaction.message.id)!;

    if (reaction.emoji.name === '➡️') {
        const next = await searchClient.next();
        reaction.message.edit(resultsToMessage(
            next,
            searchClient.getDisplayPageNumber(),
            searchClient.getHasNext()
        ));
        return;
    }
    if (reaction.emoji.name === '⬅️') {
        const previous = searchClient.previous();
        reaction.message.edit(resultsToMessage(
            previous,
            searchClient.getDisplayPageNumber(),
            searchClient.getHasNext()
        ));
        return;
    }
    if (reaction.emoji.name === '❌') {
        activeSearchClients.delete(reaction.message.id);
        await reaction.message.delete();
        return;
    }

    if (NUMBER_EMOJIS.includes(reaction.emoji.name)) {
        activeSearchClients.delete(reaction.message.id);
        await Promise.all([
            reaction.message.channel.send("Okay so now start the torrent... (TODO)"),
            reaction.message.delete()
        ]);
    }
});
client.login(privateConfig.token);