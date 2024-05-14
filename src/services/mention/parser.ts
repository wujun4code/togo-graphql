export interface Mention {
    type: 'u' | 'uoid' | 'usns';
    id: string;
    displayName: string;
}

export function parseMentions(text: string): Mention[] {
    const mentionRegex = /@\[@(.*?)\]\(user:(.*?)\)/g;
    const mentions: Mention[] = [];
    let match;
    while ((match = mentionRegex.exec(text)) !== null) {
        const displayName = match[1];
        const id = match[2];
        const mention: Mention = { id, displayName, type: 'usns' };
        mentions.push(mention);
    }
    return mentions;
}
