import { Client } from 'discord.js-selfbot-v13';
import axios from 'axios';
import { create, all } from 'mathjs';

const CHANNEL_IDS = ['782651599926984704', '1286362396213903442'];

const BANNED_IDS = ['1116009825042702366', '789531205908430868'];
const BANNED_NAMES = ['Rubuhhhh', 'oAikl'];

const client = new Client();
const math = create(all, {functions: ['add', 'subtract', 'multiply', 'divide', 'pow', 'sqrt'], unsafe: false});

async function executeOnlineCommand(msg) {
  try {
    const response = await axios.get('https://api.mcsrvstat.us/3/play.alinea.gg');
    if (response.data && response.data.players && response.data.players.list) {
      const playerCount = response.data.players.online;
      const playerNames = response.data.players.list.map(player => player.name);
      const formattedNames = playerNames.length > 0
        ? playerNames.slice(0, -1).join(', ') + (playerNames.length > 1 ? ` and ${playerNames[playerNames.length - 1]}` : playerNames[0])
        : 'No players online';
      await msg.reply(`Currently ${playerCount} player(s) online:\n\`\`\`${formattedNames}\`\`\``);
    } else {
      await msg.reply('No players online.');
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    await msg.reply('Error fetching player data.');
  }
}

async function executeKillCommand(msg) {
  if (!msg.reference) {
    await msg.reply("🔫💨");
  } else {
    const referencedMessage = await msg.fetchReference();
    await referencedMessage.reply("🔫💨");
  }
}

async function executeLobotomizeCommand(msg) {
  if (!msg.reference) {
    await msg.reply("🧠🔨");
  } else {
    const referencedMessage = await msg.fetchReference();
    await referencedMessage.reply("🧠🔨");
  }
}

async function executePingCommand(msg) {
  const pingMessage = await msg.reply('Pinging...');
  const latency = Math.round(client.ws.ping);
  await pingMessage.edit(`Pong! Latency: ${latency}ms`);
}

async function executeLoveCheckerCommand(msg) {
  let people = msg.content.split(' ').slice(2).filter(word => word.toLowerCase() !== 'and');
  if (people.length < 2) {
    await msg.reply('Please provide at least two people to check love for.');
    return;
  }
  await msg.reply(`The love between ${people.join(' and ')} is ${Math.floor(Math.random() * 100)}%`);
}


async function executeUnlobotomizeCommand(msg) {
  if (!msg.reference) {
    await msg.reply("🧠🤕");
  } else {
    const referencedMessage = await msg.fetchReference();
    await referencedMessage.reply("🧠🤕");
  }
}

async function executeHelpCommand(msg, commandActions) {
  const availableCommands = Object.keys(commandActions).sort().join(', ');
    await msg.reply(`Available commands: \`\`\`${availableCommands}\`\`\`\nUse \`meow, :command\` to execute`);
}

async function executeSkinCommand(msg) {
  const args = msg.content.split(' ');
  if (args.length !== 3) {
    await msg.reply('Please provide only one username.');
    return;
  }

  const username = args[2];

  try {
    const profileResponse = await axios.get(`https://api.mojang.com/users/profiles/minecraft/${username}`);
    if (!profileResponse.data) {
      return await msg.reply(`User ${username} not found.`);
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
      return await msg.reply(`No skin found for ${correctUsername}.`);
    }

    const skinJson = JSON.parse(Buffer.from(skinData.value, 'base64').toString('utf-8'));
    const skinUrl = skinJson.textures.SKIN.url;

    await msg.reply(`Here is the skin for:\n[${correctUsername}](${skinUrl})\n[Render](https://starlightskins.lunareclipse.studio/render/mojavatar/${uuid}/full)`);
  } catch (error) {
    console.error('Error fetching skin:', error);
    await msg.reply('Sorry, there was an error fetching the skin.');
  }
}

async function executeDiscordPingCommand(msg) {
  const id = msg.content.split(' ').slice(2)[0];
  await msg.reply(`Boop! :3 <@${id}>`);
}

async function executeGuacCommand(msg) {
  try {
    const response = await fetch('https://www.eepy.monster/api/images');
    const data = await response.json();
    const maxImages = data.images;

    const randomNumber = Math.floor(Math.random() * maxImages) + 1;

    msg.reply(`https://cdn.eepy.monster/guac${randomNumber}.jpg`);

  } catch (error) {
    console.error('Error fetching image:', error);
  }
}

async function executeMathCommand(msg) {
  // Extract the mathematical expression from the message
  let expression = msg.content.split(' ').slice(2).join(' ');

  // Replace ** with ^ and x with *
  expression = expression.replace(/\*\*/g, '^').replace(/x/g, '*');

  if (!expression) {
    await msg.reply('Please provide a mathematical expression to evaluate.');
    return;
  }

  try {
    // Evaluate the expression using mathjs
    const result = math.evaluate(expression);
    if (result >= 100000000000000000) return;
    await msg.reply(`Result: ${result}`);
  } catch (error) {
    console.error('Error evaluating expression:', error);
    await msg.reply('Invalid mathematical expression.');
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

  if (msg.author.id === client.user.id)
    return;

  if (BANNED_IDS.includes(msg.author.id) || BANNED_NAMES.includes(msg.author.displayName)){
    msg.reply("nuh uh, you're not allowed to use meow");
    return;
  }

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
    "repo": createReply("https://github.com/Maganoos/meow-bot"),
    "owner": createReply("https://magnuskari.cc"),
  };

  const match = Object.entries(commandActions)
    .find(([key]) => commandContent.startsWith(key));

  if (match) {
    const [_key, action] = match;
    await action(msg, commandActions);
  }
});

client.login(process.env.TOKEN);
