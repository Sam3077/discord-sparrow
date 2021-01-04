import Discord from 'discord.js';
import privateConfig from './private-config.json';
import SearchClient from './clients/SearchClient';
import resultsToMessage from './parsers/resultsToMessage';
import { exec } from 'child_process';
import { awaitVPNConnection, awaitVPNDisconnection } from './awaitVPNConnection';
import { emojiToIndex } from './parsers/indexEmoji';
import WebTorrent from 'webtorrent';
import torrentToMessage from './parsers/torrentToMessage';

const PAGE_SIZE = 5;
const client = new Discord.Client();
const activeSearchClients = new Map<string, SearchClient>();
const torrentClient = new WebTorrent();

client.on('ready', () => {
    console.log(`Logged in as ${client.user?.tag}!`);
});

client.on('message', async (message) => {
    if (message.channel.type !== "dm") return;
    if (message.author === client.user) return;
    const vpnMessage = await message.channel.send("Activating VPN...");
    exec('piactl connect');

    try {
        await awaitVPNConnection();
    } catch(e) {
        console.error(e);
        message.reply("Failed to activate VPN");
        return;
    }
    await vpnMessage.delete();
    console.log(`Searching for ${message.content}`);
    const searchClient = new SearchClient(message.content, PAGE_SIZE);
    const reply = await message.channel.send(`Searching for ${message.content}...`);
    activeSearchClients.set(reply.id, searchClient);

    if (!(await searchClient.ready)) {
        await reply.edit(":x: Couldn't find any results for " + message.content);
        return;
    }
    const searchResults = searchClient.current();
    await reply.edit(resultsToMessage(searchResults, searchClient.getDisplayPageNumber(), searchClient.getHasNext()));
});

client.on('disconnect', () => {
    console.log('disconnected!');
});

client.on('error', console.error);
client.on('warn', console.warn);
client.on('invalidated', () => {
    console.log('invalidated?')
})

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
        if (torrentClient.torrents.length === 0) {
            await reaction.message.channel.send("Deactivating VPN and awaiting reconnection to Discord servers...");
            exec("piactl disconnect");
            await awaitVPNDisconnection();
            await reaction.message.channel.send("Done!");
        }
        return;
    }

    const resultIndex = emojiToIndex(reaction.emoji.name);
    const currentList = searchClient.current();
    if (resultIndex > -1 && resultIndex < currentList.length) {
        activeSearchClients.delete(reaction.message.id);
        await reaction.message.delete();
        torrentClient.add(currentList[resultIndex].magnetLink, { path: './downloaded-media/' }, async (torrent) => {
            const updateMessage = await reaction.message.channel.send(torrentToMessage(torrent));
            
            let lastUpdateFinished = true;
            async function updateListener() {
                // only update every few seconds
                if (lastUpdateFinished) {
                    lastUpdateFinished = false;
                    await updateMessage.edit(torrentToMessage(torrent));
                    lastUpdateFinished = true;
                }
            }
            torrent.on('done', async () => {
                torrent.off('download', updateListener);
                await reaction.message.channel.send(`Finished downloading to ${torrent.path}`);
                torrent.destroy({}, async () => {
                    if (torrentClient.torrents.length === 0) {
                        await reaction.message.channel.send("Deactivating VPN and awaiting reconnection to Discord servers...");
                        exec("piactl disconnect");
                        await awaitVPNDisconnection();
                        await reaction.message.channel.send("Done!");
                    }
                });
                await updateMessage.delete();
            });

            torrent.on('download', updateListener);
        })
    }
});

client.login(privateConfig.token);