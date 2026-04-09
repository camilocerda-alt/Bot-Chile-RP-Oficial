const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle
} = require('discord.js');

require('dotenv').config();

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const LINK_SERVIDOR = process.env.LINK_SERVIDOR;

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

const warns = new Map();
let inicioSesion = null;

process.on('unhandledRejection', console.error);

// COMANDOS
const commands = [

  new SlashCommandBuilder().setName('abrir').setDescription('🟢 Abrir sesión'),
  new SlashCommandBuilder().setName('cerrar').setDescription('🔴 Cerrar sesión'),

  new SlashCommandBuilder()
    .setName('votar')
    .setDescription('📢 Crear votación')
    .addIntegerOption(o =>
      o.setName('minimo')
       .setDescription('Cantidad mínima de votos')
       .setRequired(true)
    ),

  new SlashCommandBuilder().setName('resultado').setDescription('📊 Ver resultados'),

  new SlashCommandBuilder()
    .setName('golpe')
    .setDescription('👊 Golpear a alguien')
    .addUserOption(o =>
      o.setName('usuario')
       .setDescription('Usuario a golpear')
       .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('casarse')
    .setDescription('💍 Pedir matrimonio')
    .addUserOption(o =>
      o.setName('usuario')
       .setDescription('Persona')
       .setRequired(true)
    ),

  new SlashCommandBuilder().setName('divorcio').setDescription('💔 Divorciarse'),

  new SlashCommandBuilder()
    .setName('warn')
    .setDescription('⚠️ Advertir usuario')
    .addUserOption(o =>
      o.setName('usuario')
       .setDescription('Usuario a advertir')
       .setRequired(true)
    ),

  new SlashCommandBuilder().setName('redes').setDescription('🌐 Ver redes'),

  new SlashCommandBuilder().setName('info').setDescription('📊 Info del servidor'),

  new SlashCommandBuilder()
    .setName('sorteo')
    .setDescription('🎁 Crear sorteo')
    .addStringOption(o =>
      o.setName('premio')
       .setDescription('Premio del sorteo')
       .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('evento')
    .setDescription('🎉 Crear evento')
    .addStringOption(o =>
      o.setName('nombre')
       .setDescription('Nombre del evento')
       .setRequired(true)
    )

].map(c => c.toJSON());

// REGISTRAR
const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  await rest.put(
    Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
    { body: commands }
  );
})();

client.on('clientReady', () => {
  console.log(`🔥 Bot listo ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {

  if (!interaction.isChatInputCommand()) return;

  const cmd = interaction.commandName;

  // 🟢 ABRIR
  if (cmd === 'abrir') {
    inicioSesion = Date.now();

    await interaction.deferReply();

    await interaction.channel.send({
      content: "@everyone",
      embeds: [{
        title: "🟢 SESIÓN ABIERTA",
        description: `🔗 ${LINK_SERVIDOR}`,
        color: 0x00ff00
      }]
    });

    await interaction.editReply("✅ Sesión iniciada");
  }

  // 🔴 CERRAR
  if (cmd === 'cerrar') {
    inicioSesion = null;

    await interaction.deferReply();

    await interaction.channel.send({
      content: "@everyone",
      embeds: [{
        title: "🔴 SESIÓN CERRADA",
        color: 0xff0000
      }]
    });

    await interaction.editReply("❌ Sesión cerrada");
  }

  // 📊 INFO
  if (cmd === 'info') {

    if (!inicioSesion) return interaction.reply("❌ No hay sesión activa");

    const tiempo = Date.now() - inicioSesion;
    const minutos = Math.floor(tiempo / 60000);
    const horas = Math.floor(minutos / 60);

    await interaction.reply({
      embeds: [{
        title: "📊 INFO ROLEPLAY",
        description:
          `👥 Usuarios: ${interaction.guild.memberCount}\n\n` +
          `⏱️ Tiempo: ${horas}h ${minutos % 60}m`,
        color: 0x00ffff
      }]
    });
  }

  // 📢 VOTAR
  if (cmd === 'votar') {
    const minimo = interaction.options.getInteger('minimo');

    await interaction.deferReply({ ephemeral: true });

    const msg = await interaction.channel.send({
      content: "@everyone",
      embeds: [{
        title: "📢 VOTACIÓN",
        description: `👍 Sí\n👎 No\n🎯 ${minimo}`,
        color: 0x0099ff
      }]
    });

    await msg.react("👍");
    await msg.react("👎");

    await interaction.editReply("✅ Votación creada");
  }

  // 📊 RESULTADO
  if (cmd === 'resultado') {
    await interaction.deferReply();

    const msgs = await interaction.channel.messages.fetch({ limit: 10 });
    const v = msgs.find(m => m.embeds[0]?.title === "📢 VOTACIÓN");

    if (!v) return interaction.editReply("❌ No hay votación");

    const si = v.reactions.cache.get("👍")?.count - 1 || 0;
    const no = v.reactions.cache.get("👎")?.count - 1 || 0;

    await interaction.editReply(`👍 ${si} | 👎 ${no}`);
  }

  // 👊 GOLPE
  if (cmd === 'golpe') {
    const user = interaction.options.getUser('usuario');

    await interaction.reply({
      embeds: [{
        title: "👊 GOLPE",
        description: `${interaction.user} golpeó a ${user}`,
        color: 0xff0000
      }]
    });
  }

  // 💍 CASARSE
  if (cmd === 'casarse') {
    const user = interaction.options.getUser('usuario');

    await interaction.reply({
      embeds: [{
        title: "💍 MATRIMONIO",
        description: `${interaction.user} quiere casarse con ${user}`,
        color: 0xff69b4
      }]
    });
  }

  // 💔 DIVORCIO
  if (cmd === 'divorcio') {
    await interaction.reply("💔 Ahora estás soltero");
  }

  // ⚠️ WARN
  if (cmd === 'warn') {
    const user = interaction.options.getMember('usuario');

    let count = warns.get(user.id) || 0;
    count++;
    warns.set(user.id, count);

    if (count >= 3) {
      await user.timeout(20 * 60 * 1000);
      warns.set(user.id, 0);
      return interaction.reply(`🚫 ${user} muteado 20 minutos`);
    }

    await interaction.reply(`⚠️ ${user} ${count}/3`);
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

  // 🌐 REDES
  if (cmd === 'redes') {
    await interaction.reply({
      embeds: [{
        title: "🌐 REDES",
        description:
          "🎥 https://youtube.com/Camiteboxea1\n\n" +
          "🎮 https://kick.com/camikgg9\n\n" +
          "📱 https://tiktok.com/@camikgg9",
        color: 0x5865F2
      }]
    });
  }

});

client.login(TOKEN);

// deploy
