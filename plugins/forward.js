const { getContentType } = require('@whiskeysockets/baileys');

commands.push({
    pattern: 'forward',
    alias: ['fw'],
    react: '📨',
    desc: 'Forward replied message',
    category: 'owner',

    async function(danuwa, mek, m, {
        from,
        body,
        isOwner,
        reply
    }) {

        try {

            if (!isOwner) {
                return reply('❌ Owner only');
            }

            // check replied message
            const quoted = mek.message?.extendedTextMessage?.contextInfo;

            if (!quoted) {
                return reply('⚠️ Reply to a message');
            }

            // jid
            const args = body.trim().split(' ');
            const jid = args[1];

            if (!jid) {
                return reply(
`⚠️ Example:

.forward 94761234567@s.whatsapp.net`
                );
            }

            // get replied message
            const quotedMessage = await danuwa.loadMessageFromWA(
                from,
                quoted.stanzaId
            );

            if (!quotedMessage) {
                return reply('❌ Cannot load replied message');
            }

            // forward anything
            await danuwa.forwardMessage(
                jid,
                quotedMessage.message,
                false
            );

            return reply('✅ Forwarded Successfully');

        } catch (e) {
            console.log(e);

            return reply(
`❌ Error

${e}`
            );
        }
    }
});
