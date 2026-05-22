const config = require('../settings');

module.exports = {
    name: 'forward',
    alias: ['fw'],
    desc: 'Forward replied message',
    category: 'utility',
    react: '📨',

    async execute(conn, mek, m, {
        from,
        reply,
        isOwner
    }) {
        try {

            if (!isOwner) {
                return reply('❌ Owner only command');
            }

            // command example
            // .forward 947XXXXXXXX@s.whatsapp.net

            const jid = m.body.split(' ')[1];

            if (!jid) {
                return reply('⚠️ Please provide target number\n\nExample:\n.forward 947XXXXXXXX@s.whatsapp.net');
            }

            if (!m.quoted) {
                return reply('⚠️ Reply to a message');
            }

            // Forward message
            await conn.forwardMessage(jid, m.quoted.message, false);

            reply('✅ Message forwarded successfully');

        } catch (e) {
            console.log(e);
            reply('❌ Error while forwarding');
        }
    }
}
