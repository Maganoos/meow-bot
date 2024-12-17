import { Client } from 'discord.js-selfbot-v13';
import axios from 'axios';
import 'dotenv/config';

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
    if (message.content.toLowerCase().startsWith('!online') || message.content.toLowerCase().startsWith('--online')) {
      const onlinePlayers = await fetchOnlinePlayers();
      message.reply(onlinePlayers);
    } 
    else if (message.content.toLowerCase().startsWith("meow, kill")) {
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
    } 
    else if (message.content.toLowerCase().startsWith("meow, lobotomize")) {
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
    }
  }
});

client.login(process.env.TOKEN);