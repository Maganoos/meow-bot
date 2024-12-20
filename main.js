import { Client } from 'discord.js-selfbot-v13';
import axios from 'axios';
import { create, all } from 'mathjs';

const CHANNEL_IDS = ['782651599926984704', '1286362396213903442'];

const config = {
  // Allow basic arithmetic, power, and root functions
  functions: ['add', 'subtract', 'multiply', 'divide', 'pow', 'sqrt'],
  // Disable access to potentially unsafe functions
  unsafe: false
};
const math = create(all, config);

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
  await message.reply(`The love between ${people.join(' and ')} is ${Math.floor(Math.random() * 100)}%`);
}


async function executeUnlobotomizeCommand(message) {
  if (!message.reference) {
    await message.reply("🧠🤕");
  } else {
    const referencedMessage = await message.fetchReference();
    await referencedMessage.reply("🧠🤕");
  }
}

async function executeHelpCommand(message, commandActions) {
  const availableCommands = Object.keys(commandActions)
    .sort()
    .join(', ');
    await message.reply(`Available commands: ${availableCommands}`);
}

async function executeSkinCommand(message) {
  const args = message.content.split(' ');
  if (args.length !== 3) {
    await message.reply('Please provide only one username.');
    return;
  }

  const username = args[2];

  try {
    const profileResponse = await axios.get(`https://api.mojang.com/users/profiles/minecraft/${username}`);
    if (!profileResponse.data) {
      return await message.reply(`User ${username} not found.`);
    }

    const correctUsername = profileResponse.data.name;
    const uuid = profileResponse.data.id;
    const skinResponse = await axios.get(`https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    const skinData = skinResponse.data.properties.find(prop => prop.name === 'textures');
    if (!skinData) {
      return await message.reply(`No skin found for ${correctUsername}.`);
    }

    const skinJson = JSON.parse(Buffer.from(skinData.value, 'base64').toString('utf-8'));
    const skinUrl = skinJson.textures.SKIN.url;

    await message.reply(`Here is the skin for:\n[${correctUsername}](${skinUrl})\n[Render](https://starlightskins.lunareclipse.studio/render/default/${correctUsername}/full)`);
  } catch (error) {
    console.error('Error fetching skin:', error);
    await message.reply('Sorry, there was an error fetching the skin.');
  }
}

async function executeDiscordPingCommand(message) {
  const id = message.content.split(' ').slice(2)[0];
  await message.reply('<@' + id + '>');
}

async function executeGuacCommand(message) {
  try {
    const response = await fetch('https://www.eepy.monster/api/images');
    const data = await response.json();
    const maxImages = data.images;

    const randomNumber = Math.floor(Math.random() * maxImages) + 1;

    message.reply(`https://cdn.eepy.monster/guac${randomNumber}.jpg`);

  } catch (error) {
    console.error('Error fetching image:', error);
  }
}

async function executeMathCommand(message) {
  // Extract the mathematical expression from the message
  let expression = message.content.split(' ').slice(2).join(' ');

  // Replace ** with ^ and x with *
  expression = expression.replace(/\*\*/g, '^').replace(/x/g, '*');

  if (!expression) {
    await message.reply('Please provide a mathematical expression to evaluate.');
    return;
  }

  try {
    // Evaluate the expression using mathjs
    const result = math.evaluate(expression);
    await message.reply(`Result: ${result}`);
  } catch (error) {
    console.error('Error evaluating expression:', error);
    await message.reply('Invalid mathematical expression.');
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
    "pingforme": executeDiscordPingCommand,
    "ping": executePingCommand,
    "lovechecker": executeLoveCheckerCommand,
    "unlobotomize": executeUnlobotomizeCommand,
    "help": executeHelpCommand,
    "skin": executeSkinCommand,
    "guac": executeGuacCommand,
    "math": executeMathCommand,
  };

  const match = Object.entries(commandActions)
    .find(([key]) => commandContent.startsWith(key));

  if (match) {
    const [_key, action] = match;
    await action(msg, commandActions);
  }
});

client.login(process.env.TOKEN);