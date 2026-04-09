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

// 🚫 NO dotenv en Railway

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const LINK_SERVIDOR = process.env.LINK_SERVIDOR;

// 👀 DEBUG
console.log("TOKEN:", TOKEN);

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once('ready', () => {
  console.log(`🔥 Bot listo como ${client.user.tag}`);
});

// 📌 COMANDOS
const commands = [
  new SlashCommandBuilder()
    .setName('redes')
    .setDescription('Muestra redes del server')
].map(cmd => cmd.toJSON());

// 📡 REGISTRAR COMANDOS
const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    console.log('⏳ Registrando comandos...');
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

  if (cmd === 'redes') {
    await interaction.reply({
      embeds: [{
        title: "🌐 REDES",
        description:
          "🎥 https://youtube.com/Camiteboxea1\n\n" +
          "🎮 https://kick.com/camikgg9\n\n" +
          "📱 https://tiktok.com/@camikggg",
        color: 0x5865F2
      }]
    });
  }
});

// 🚀 LOGIN
client.login(TOKEN);

// deploy
