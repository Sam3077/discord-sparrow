
function indexToEmoji(index: number): string {
    const emojis = [
        ':one:',
        ':two:',
        ':three:',
        ':four:',
        ':five:',
        ':six:',
        ':seven:',
        ':eight:',
        ':nine:',
        ':ten:'
    ]
    return emojis[index];
}

function emojiToIndex(emoji: string): number {
    const numberEmojis = [
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
    return numberEmojis.indexOf(emoji);;
}

export { indexToEmoji, emojiToIndex };