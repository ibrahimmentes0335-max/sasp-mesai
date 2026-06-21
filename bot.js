const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// ================== AYARLAR KISMI ==================
const BOT_TOKEN = process.env.DISCORD_TOKEN;
const ONAY_KANAL_ID = 1505518540537597969; // Onay butonlarının düşeceği kanal ID'si
const LOG_KANAL_ID = 1505518539254005921;  // Herkesin göreceği mesai log kanal ID'si
// ===================================================

client.once('ready', () => {
    console.log(`[SASP PANEL] Bot başarıyla bağlandı!`);
});

// Memur komutu: !mesai 1saat Açmayı Unuttum :(
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.content.startsWith('!mesai')) {
        const args = message.content.slice('!mesai'.length).trim().split(/ +/);
        const sure = args.shift();
        const sebep = args.join(' ');

        if (!sure || !sebep) {
            return message.reply('❌ **Yanlış Kullanım!** Doğru şekli: `!mesai [süre] [sebep]`\nÖrnek: `!mesai 1saat Açmayı unuttum`');
        }

        const onayKanali = client.channels.cache.get(ONAY_KANAL_ID);
        if (!onayKanali) return message.reply('❌ Ayarlanan onay kanalı bulunamadı!');

        // Panel Tasarımı (Sitedeki gibi koyu turuncu şeritli şık kutu)
        const embed = new EmbedBuilder()
            .setTitle('⏳ Ek Mesai Talebi')
            .setDescription('Memurların unutulan mesaileri için ek süre talepleri')
            .setColor('#e67e22') // Koyu turuncu tonu
            .addFields(
                { name: '👤 Memur:', value: `${message.author} (${message.author.tag})`, inline: false },
                { name: '⏱️ TALEP EDİLEN SÜRE:', value: `**${sure}**`, inline: true },
                { name: '📝 SEBEP:', value: `*${sebep}*`, inline: false }
            )
            .setTimestamp();

        // Web sitesindeki yeşil Onayla ve kırmızı Reddet butonları
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder().setCustomId('onayla_btn').setLabel('✔ Onayla').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('reddet_btn').setLabel('✖ Reddet').setStyle(ButtonStyle.Danger)
            );

        await onayKanali.send({ embeds: [embed], components: [row] });
        await message.reply('✅ Mesai talebiniz Albay ve yetkililere iletildi.');
    }
});

// Butonlara basıldığında olacaklar
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    const eskiEmbed = interaction.message.embeds[0];
    const logKanali = client.channels.cache.get(LOG_KANAL_ID);

    if (interaction.customId === 'onayla_btn') {
        const onaylandiEmbed = EmbedBuilder.from(eskiEmbed)
            .setColor('#2ecc71') // Yeşil renk
            .setTitle('✅ Ek Mesai Onaylandı')
            .addFields({ name: '👮 İşlem Yapan Yetkili (Albay):', value: `${interaction.user}`, inline: false });

        // Butonları yok et ve mesajı güncelle
        await interaction.update({ embeds: [onaylandiEmbed], components: [] });
        if (logKanali) await logKanali.send({ embeds: [onaylandiEmbed] });
    }

    if (interaction.customId === 'reddet_btn') {
        const reddedildiEmbed = EmbedBuilder.from(eskiEmbed)
            .setColor('#e74c3c') // Kırmızı renk
            .setTitle('❌ Ek Mesai Reddedildi')
            .addFields({ name: '👮 İşlem Yapan Yetkili (Albay):', value: `${interaction.user}`, inline: false });

        await interaction.update({ embeds: [reddedildiEmbed], components: [] });
    }
});

client.login(BOT_TOKEN);
