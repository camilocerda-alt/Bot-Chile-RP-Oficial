const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});


// 🔥 BOT LISTO
client.once('clientReady', () => {
  console.log(`🔥 Bot listo como ${client.user.tag}`);
});


// 📌 COMANDOS NUEVOS
const commands = [

  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('🏓 Ver latencia'),

  new SlashCommandBuilder()
    .setName('redes')
    .setDescription('📱 Redes oficiales'),

  new SlashCommandBuilder()
    .setName('info')
    .setDescription('📊 Info del servidor'),

  new SlashCommandBuilder()
    .setName('evento')
    .setDescription('🎉 Crear evento')
    .addStringOption(o =>
      o.setName('nombre')
       .setDescription('Nombre del evento')
       .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('sorteo')
    .setDescription('🎁 Crear sorteo')
    .addStringOption(o =>
      o.setName('premio')
       .setDescription('Premio')
       .setRequired(true)
    )

].map(cmd => cmd.toJSON());


// 📡 REGISTRAR COMANDOS
const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    console.log('🧹 Borrando comandos viejos...');

    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: [] }
    );

    console.log('📡 Registrando comandos nuevos...');

    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );

    console.log('✅ Comandos registrados');
  } catch (error) {
    console.error(error);
  }
})();


// 🎮 INTERACCIONES
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const cmd = interaction.commandName;

  // 🏓 PING
  if (cmd === 'ping') {
    await interaction.reply('🏓 Pong culiao');
  }

  // 📱 REDES PRO
  if (cmd === 'redes') {
    await interaction.reply({
      embeds: [{
        title: "📱 Redes Oficiales",
        description:
          "📺 **YouTube:** https://youtube.com/Camiteboxea1\n\n" +
          "🎮 **Kick:** https://kick.com/camikgg9\n\n" +
          "🎵 **TikTok:** https://tiktok.com/@camikggg",
        color: 0x5865F2,
        footer: { text: "Chile RP 🇨🇱 | Síguenos ctm 😎" }
      }]
    });
  }

  // 📊 INFO
  if (cmd === 'info') {
    await interaction.reply({
      embeds: [{
        title: "📊 Info del servidor",
        description: `👥 Usuarios: ${interaction.guild.memberCount}`,
        color: 0x00ffff
      }]
    });
  }

  // 🎉 EVENTO
  if (cmd === 'evento') {
    const nombre = interaction.options.getString('nombre');

    await interaction.reply({
      content: "@everyone",
      embeds: [{
        title: "🎉 EVENTO",
        description: `Evento: ${nombre}`,
        color: 0xff9900
      }]
    });
  }

  // 🎁 SORTEO
  if (cmd === 'sorteo') {
    const premio = interaction.options.getString('premio');

    const msg = await interaction.channel.send({
      content: "@everyone",
      embeds: [{
        title: "🎁 SORTEO",
        description: `Premio: ${premio}\n\nReacciona 🎉`,
        color: 0xffd700
      }]
    });

    await msg.react("🎉");

    await interaction.reply({ content: "✅ Sorteo creado", ephemeral: true });
  }

});


// 🚀 LOGIN
client.login(TOKEN);


// 🟢 KEEP ALIVE (Railway)
require("http").createServer((req, res) => {
  res.end("Bot activo");
}).listen(process.env.PORT || 3000);
