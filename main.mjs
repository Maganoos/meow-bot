import { Client } from 'discord.js-selfbot-v13';
import axios from 'axios';

const CHANNEL_IDS = ['782651599926984704', '1286362396213903442'];

const client = new Client();

async function fetchOnlinePlayers() {
  try {
    const response = await axios.get('https://api.mcsrvstat.us/3/play.alinea.gg');
    if (response.data && response.data.players && response.data.players.list) {
      const playerCount = response.data.players.online;
      const playerNames = response.data.players.list.map(player => player.name);
      const formattedNames = playerNames.length > 0
        ? playerNames.slice(0, -1).join(', ') + (playerNames.length > 1 ? ` and ${playerNames[playerNames.length - 1]}` : playerNames[0])
        : 'No players online';
      return `Currently ${playerCount} player(s) online:\n\`\`\`${formattedNames}\`\`\``;
    } else {
      return 'No players online.';
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    return 'Error fetching player data.';
  }
}

client.once('ready', () => {
  console.log(`${client.user.username} is ready!`);
});

client.on('messageCreate', async (message) => {
  if (CHANNEL_IDS.includes(message.channel.id)) {
    const messageContent = message.content.toLowerCase();
    if (messageContent.startsWith('meow,' )) {
      const commandContent = messageContent.replace(/^meow,\s*/, '');

      switch (true) {
        case commandContent.startsWith('online'):
          message.reply(await fetchOnlinePlayers());
          break;

        case commandContent.startsWith("kill"):
          if (!message.reference) {
            message.reply("🔫💨");
          } else {
            try {
              const referencedMessage = await message.fetchReference();
              referencedMessage.reply("🔫💨");
            } catch (error) {
              console.error('Error fetching referenced message:', error);
            }
          }
          break;

        case commandContent.startsWith("lobotomize"):
          if (!message.reference) {
            message.reply("🧠🔨");
          } else {
            try {
              const referencedMessage = await message.fetchReference();
              referencedMessage.reply("🧠🔨");
            } catch (error) {
              console.error('Error fetching referenced message:', error);
            }
          }
          break;

        case commandContent.startsWith("who is the most sigma out of all people on earth"):
          message.reply("It is I, meow the third of meowington");
          break;

        case commandContent.startsWith("what is the meaning of life"):
          message.reply("being silly");
          break;

        case commandContent.startsWith('ping'):
          const msg = await message.reply('Pinging...');
          const latency = Math.round(client.ws.ping);
          await msg.edit(`Pong! Latency: ${latency}ms`); 
          break;

        default:
          break;
      }
    }
  }
});

client.login(process.env.TOKEN);