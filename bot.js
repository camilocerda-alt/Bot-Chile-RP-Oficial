const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const LINK_SERVIDOR = process.env.LINK_SERVIDOR;

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

let inicioSesion = null;
const warns = new Map();

client.once('clientReady', () => {
  console.log(`🔥 Bot listo como ${client.user.tag}`);
});


// 📌 COMANDOS
const commands = [

  new SlashCommandBuilder().setName('abrir').setDescription('🟢 Abrir sesión'),
  new SlashCommandBuilder().setName('cerrar').setDescription('🔴 Cerrar sesión'),

  new SlashCommandBuilder().setName('info').setDescription('📊 Info del servidor'),

  new SlashCommandBuilder()
    .setName('evento')
    .setDescription('🎉 Crear evento')
    .addStringOption(o => o.setName('nombre').setDescription('Nombre').setRequired(true)),

  new SlashCommandBuilder()
    .setName('sorteo')
    .setDescription('🎁 Crear sorteo')
    .addStringOption(o => o.setName('premio').setDescription('Premio').setRequired(true)),

  new SlashCommandBuilder()
    .setName('votar')
    .setDescription('📢 Crear votación')
    .addIntegerOption(o => o.setName('minimo').setDescription('Minimo votos').setRequired(true)),

  new SlashCommandBuilder().setName('resultado').setDescription('📊 Resultado votación'),

  new SlashCommandBuilder()
    .setName('warn')
    .setDescription('⚠️ Advertir')
    .addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)),

  new SlashCommandBuilder()
    .setName('golpe')
    .setDescription('👊 Golpear')
    .addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)),

  new SlashCommandBuilder()
    .setName('casarse')
    .setDescription('💍 Casarse')
    .addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)),

  new SlashCommandBuilder().setName('divorcio').setDescription('💔 Divorcio'),

  new SlashCommandBuilder().setName('redes').setDescription('📱 Redes oficiales')

].map(cmd => cmd.toJSON());


// 📡 REGISTRO
const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: [] });
  await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
})();


// 🎮 INTERACCIONES
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const cmd = interaction.commandName;

  // 🟢 ABRIR
  if (cmd === 'abrir') {
    inicioSesion = Date.now();

    await interaction.channel.send({
      content: "@everyone",
      embeds: [{ title: "🟢 SESIÓN ABIERTA", description: LINK_SERVIDOR, color: 0x00ff00 }]
    });

    await interaction.reply({ content: "✅ Sesión abierta", ephemeral: true });
  }

  // 🔴 CERRAR
  if (cmd === 'cerrar') {
    inicioSesion = null;

    await interaction.channel.send({
      content: "@everyone",
      embeds: [{ title: "🔴 SESIÓN CERRADA", color: 0xff0000 }]
    });

    await interaction.reply({ content: "❌ Sesión cerrada", ephemeral: true });
  }

  // 📊 INFO
  if (cmd === 'info') {
    if (!inicioSesion) return interaction.reply("❌ No hay sesión");

    const tiempo = Date.now() - inicioSesion;
    const min = Math.floor(tiempo / 60000);
    const hrs = Math.floor(min / 60);

    await interaction.reply({
      embeds: [{
        title: "📊 INFO",
        description: `👥 ${interaction.guild.memberCount}\n⏱️ ${hrs}h ${min % 60}m`,
        color: 0x00ffff
      }]
    });
  }

  // 📢 VOTAR
  if (cmd === 'votar') {
    const minimo = interaction.options.getInteger('minimo');

    const msg = await interaction.channel.send({
      content: "@everyone",
      embeds: [{ title: "📢 VOTACIÓN", description: `👍 / 👎\nMeta: ${minimo}`, color: 0x0099ff }]
    });

    await msg.react("👍");
    await msg.react("👎");

    await interaction.reply({ content: "✅ Votación creada", ephemeral: true });
  }

  // 📊 RESULTADO
  if (cmd === 'resultado') {
    const msgs = await interaction.channel.messages.fetch({ limit: 10 });
    const v = msgs.find(m => m.embeds[0]?.title === "📢 VOTACIÓN");

    if (!v) return interaction.reply("❌ No hay votación");

    const si = v.reactions.cache.get("👍")?.count - 1 || 0;
    const no = v.reactions.cache.get("👎")?.count - 1 || 0;

    await interaction.reply(`👍 ${si} | 👎 ${no}`);
  }

  // ⚠️ WARN
  if (cmd === 'warn') {
    const user = interaction.options.getMember('usuario');
    let count = warns.get(user.id) || 0;
    count++;
    warns.set(user.id, count);

    await interaction.reply(`⚠️ ${user} ${count}/3`);
  }

  // 👊 GOLPE
  if (cmd === 'golpe') {
    const user = interaction.options.getUser('usuario');
    await interaction.reply(`👊 ${interaction.user} golpeó a ${user}`);
  }

  // 💍 CASARSE
  if (cmd === 'casarse') {
    const user = interaction.options.getUser('usuario');
    await interaction.reply(`💍 ${interaction.user} quiere casarse con ${user}`);
  }

  // 💔 DIVORCIO
  if (cmd === 'divorcio') {
    await interaction.reply("💔 Soltero otra vez");
  }

  // 📱 REDES
  if (cmd === 'redes') {
    await interaction.reply({
      embeds: [{
        title: "📱 Redes",
        description:
          "📺 https://www.youtube.com/@Camiteboxea1\n\n" +
          "🎮 https://kick.com/camikgg9\n\n" +
          "🎵 https://tiktok.com/@camikgg9",
        color: 0x5865F2
      }]
    });
  }
});


// 🚀 LOGIN
client.login(TOKEN);


// 🟢 KEEP ALIVE
require("http").createServer((req, res) => {
  res.end("Bot activo");
}).listen(process.env.PORT || 3000);
