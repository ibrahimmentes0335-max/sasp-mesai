const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

let oyunAktif = false, sonKelime = "", skorlar = {};

client.on('messageCreate', async message => {
    if (message.author.bot) return;

    if (message.content === "!baslat") {
        oyunAktif = true; sonKelime = "sistem";
        message.channel.send("🎮 Oyun başladı! İlk kelime: **sistem**");
    }

    if (!oyunAktif || !message.content.includes(" ")) return; // Sadece kelime bekliyoruz

    const kelime = message.content.toLowerCase().trim();
    if (sonKelime !== "" && kelime[0] !== sonKelime.slice(-1)) return;

    const res = await fetch(`https://sozluk.gov.tr/gts?ara=${encodeURIComponent(kelime)}`);
    const data = await res.json();

    if (!data.error) {
        message.react('✅');
        sonKelime = kelime;
        skorlar[message.author.id] = (skorlar[message.author.id] || 0) + 1;
        
        if (skorlar[message.author.id] >= 10) {
            oyunAktif = false;
            const embed = new EmbedBuilder()
                .setTitle('🏆 Oyun Bitti!')
                .setThumbnail(message.author.displayAvatarURL())
                .setDescription(`**${message.author.username}** kazandı! \n\nKadim Dost Birincisi`)
                .setColor(0xFFFF00);
            message.channel.send({ embeds: [embed] });
        }
    } else {
        message.delete();
    }
});

client.login(process.env.DISCORD_TOKEN);
