import { TorrentSearchResult } from 'thepiratebay';
import { EmbedFieldData, MessageEmbed } from 'discord.js';
import { indexToEmoji } from './indexEmoji';


export default function resultsToMessage(results: TorrentSearchResult[], pageNumber: number, hasNext: boolean): MessageEmbed {
    let controls: EmbedFieldData[] = [];
    if (pageNumber > 1) {
        controls.push({
            name: 'Previous page',
            value: ':arrow_left:',
            inline: true
        });
    }
    if (hasNext) {
        controls.push({
            name: 'Next page',
            value: ':arrow_right:',
            inline: true
        });
    }
    controls.push({
        name: 'Delete',
        value: ':x:',
        inline: true
    });

    return new MessageEmbed()
        .setTitle(`Results page ${pageNumber}`)
        .addFields(
            results.map((res, i) => {
                return {
                    name: `${indexToEmoji(i)} ${res.name}`,
                    value: `Size: ${res.size}, Seeders: ${res.seeders}, Leechers ${res.leechers}, Uled by: ${res.uploader}`
                }
            })
        )
        .addFields(controls)
        .setTimestamp()
        .setFooter('React to begin torrent or view next page');
}