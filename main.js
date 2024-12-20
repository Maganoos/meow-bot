import { Client } from 'discord.js-selfbot-v13';
import axios from 'axios';

const CHANNEL_IDS = ['782651599926984704', '1286362396213903442'];

const client = new Client();

async function executeOnlineCommand(message) {
  try {
    const response = await axios.get('https://api.mcsrvstat.us/3/play.alinea.gg');
    if (response.data && response.data.players && response.data.players.list) {
      const playerCount = response.data.players.online;
      const playerNames = response.data.players.list.map(player => player.name);
      const formattedNames = playerNames.length > 0
        ? playerNames.slice(0, -1).join(', ') + (playerNames.length > 1 ? ` and ${playerNames[playerNames.length - 1]}` : playerNames[0])
        : 'No players online';
      await message.reply(`Currently ${playerCount} player(s) online:\n\`\`\`${formattedNames}\`\`\``);
    } else {
      await message.reply('No players online.');
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    await message.reply('Error fetching player data.');
  }
}

async function executeKillCommand(message) {
  if (!message.reference) {
    await message.reply("🔫💨");
  } else {
    const referencedMessage = await message.fetchReference();
    await referencedMessage.reply("🔫💨");
  }
}

async function executeLobotomizeCommand(message) {
  if (!message.reference) {
    await message.reply("🧠🔨");
  } else {
    const referencedMessage = await message.fetchReference();
    await referencedMessage.reply("🧠🔨");
  }
}

async function executePingCommand(message) {
  const msg = await message.reply('Pinging...');
  const latency = Math.round(client.ws.ping);
  await msg.edit(`Pong! Latency: ${latency}ms`); 
}

async function executeLoveCheckerCommand(message) {
  let people = message.content.split(' ').slice(2).filter(word => word.toLowerCase() !== 'and');
  if (people.length < 2) {
    await message.reply('Please provide at least two people to check love for.');
    return;
  }
  const percentage = Math.floor(Math.random() * 100);
  await message.reply(`The love between ${people.join(', and ')} is ${percentage}%`);
  if (percentage >= 50) {
    await message.channel.send('You are loved! 💕'); 
  } else {
    await message.channel.send('You are not loved. 💔');
  }
}
client.once('ready', () => {
  console.log(`${client.user.username} is ready!`);
});

function createReply(replyText) {
  return async function(msg) {
    await msg.reply(replyText);
  };
}

client.on('messageCreate', async (msg) => {
  if (!CHANNEL_IDS.includes(msg.channel.id))
    return;

  const messageContent = msg.content.toLowerCase();
  
  if (!messageContent.startsWith('meow,'))
    return;

  const commandContent = messageContent.replace(/^meow,\s*/, '');

  const commandActions = {
    "online": executeOnlineCommand,
    "kill": executeKillCommand,
    "lobotomize": executeLobotomizeCommand,
    "who is the most sigma out of all people on earth": createReply("It is I, meow the third of meowington"),
    "what is the meaning of life": createReply("being silly"),
    "ping": executePingCommand,
    "lovechecker": executeLoveCheckerCommand,
  };

  const match = Object.entries(commandActions)
    .find(([key]) => commandContent.startsWith(key));

  if (match) {
    const [_key, action] = match;
    await action(msg);
  }
});



client.login(process.env.TOKEN);