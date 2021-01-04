import { Torrent } from 'webtorrent';
import { MessageEmbed } from 'discord.js';
import prettyms from 'pretty-ms';

function bytesToReadableString(bytes: number): string { 
    if (bytes == 0) { 
        return "0.00 B"; 
    } 
    var e = Math.floor(Math.log(bytes) / Math.log(1024)); 
    return (bytes / Math.pow(1024, e)).toFixed(2) + 
      ' ' + ' KMGTP'.charAt(e) + 'B'; 
} 

export default function torrentToMessage(torrent: Torrent): MessageEmbed {
    let progressBar = '[';
    const progressAmount = Math.round(torrent.progress * 20);
    for (let i = 0; i < progressAmount; i++) {
        progressBar += '■';
    }
    for (let i = progressAmount; i < 20; i++) {
        progressBar += '□';
    }
    progressBar += ']'
    const embed = new MessageEmbed()
        .setTitle(`Download progress for ${torrent.name}`)
        .addFields([
            {
                name: 'Downloading',
                value: `${progressBar} ${Math.round(torrent.progress * 10000) / 100}%` 
            },
            {
                name: 'Downloaded',
                value: bytesToReadableString(torrent.downloaded),
                inline: true
            },
            {
                name: 'Size',
                value: bytesToReadableString(torrent.length),
                inline: true
            },
            {
                name: 'Peers',
                value: torrent.numPeers,
                inline: true
            },
            {
                name: 'Download speed',
                value: `${bytesToReadableString(torrent.downloadSpeed)}/s`,
                inline: true
            },
            {
                name: 'Upload speed',
                value: `${bytesToReadableString(torrent.uploadSpeed)}/s`,
                inline: true
            },
            {
                name: 'U/D ratio',
                value: torrent.ratio,
                inline: true
            },
            {
                name: 'Time remaining',
                value: Number.isNaN(torrent.timeRemaining) || !Number.isFinite(torrent.timeRemaining) ? 'Unknown' : prettyms(torrent.timeRemaining)
            }
        ])
        .setTimestamp();
    return embed;
}