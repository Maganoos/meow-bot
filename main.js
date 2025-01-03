import { Client } from 'discord.js-selfbot-v13';
import axios from 'axios';
import { create, all } from 'mathjs';

const CHANNEL_IDS = process.env.CHANNEL_IDS.split(",");
const BANNED_PHRASES = process.env.BANNED_PHRASES.split(',');

const client = new Client();
const math = create(all, {functions: ['add', 'subtract', 'multiply', 'divide', 'pow', 'sqrt'], unsafe: false});

async function executeAvatarCommand(msg) {
  const msgMentions = msg.mentions.users;
  if (msgMentions.size <= 0) {await msg.reply('who?'); return;}
  let response = msgMentions.size > 1 ? 'Here are the avatars:' : 'Here is the avatar for:';

  msgMentions.forEach(user => response += `\n[${user.username}](${user.displayAvatarURL()}?size=4096)`);

  await msg.reply(response);
}

async function executeGuacCommand(msg) {
  try {
    const response = await fetch('https://www.eepy.monster/api/images');
    const data = await response.json();
    const maxImages = data.images;

    const randomNumber = Math.floor(Math.random() * maxImages) + 1;

    await msg.reply(`https://cdn.eepy.monster/guac${randomNumber}.jpg`);

  } catch (error) {
    console.error('Error fetching image:', error);
  }
}

async function executeHowCommands(msg) {
  let command = msg.content.replace(/meow, how/i, '').replace(/[?!.,;]$/, '').trim().split(/\s+/);
  command = command.filter(word => word.toLowerCase() !== 'is');
  if (command.length < 2) {await msg.reply('who?'); return};
  await msg.reply(`${command.splice(1).join(' ')} is ${Math.floor(Math.random() * 100)}% ${command[0]}`);
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

async function executeLoveCheckerCommand(msg) {
  let people = msg.content.split(' ').slice(2).filter(word => word.toLowerCase() !== 'and');
  if (people.length < 2) {
    await msg.reply('Please provide at least two people to check love for.');
    return;
  }
  await msg.reply(`The love between ${people.join(' and ')} is ${Math.floor(Math.random() * 100)}%`);
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

async function executePingCommand(msg) {
  const pingMessage = await msg.reply('Pinging...');
  const latency = Math.round(client.ws.ping);
  await pingMessage.edit(`Pong! Latency: ${latency}ms`);
}

async function executePingForMeCommand(msg) {
  msg.reply(`Boop! :3 <@${msg.content.split(' ').slice(2)[0]}>`)
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

async function executeUnlobotomizeCommand(msg) {
  if (!msg.reference) {
    await msg.reply("🧠🤕");
  } else {
    const referencedMessage = await msg.fetchReference();
    await referencedMessage.reply("🧠🤕");
  }
}

function createReply(replyText) {
  return async function(msg) {
    await msg.reply(replyText);
  };
}

client.once('ready', () => {
  console.log(`${client.user.username} is ready!`);
});

client.on('messageCreate', async (msg) => {
  if (!CHANNEL_IDS.includes(msg.channel.id))
    return;

  const messageContent = msg.content.toLowerCase();

  if (!messageContent.startsWith('meow,'))
    return;

  if (msg.author.id === client.user.id)
    return;

  if (process.env.BANNED_IDS.split(",").includes(msg.author.id) || process.env.BANNED_NAMES.includes(msg.author.displayName)){
    await msg.reply("nuh uh, you're not allowed to use meow");
    return;
  }

  if (BANNED_PHRASES.some(phrase => messageContent.includes(phrase)) || msg.mentions > 5 || messageContent.length > 50) {
    await msg.reply("Jump. Like actually");
    return;
  }

  const commandActions = {
    "avatar": executeAvatarCommand,
    "elevator": createReply(`The elevator is in the ${new Date().getMinutes() % 10 <= 5 ? "Overworld" : "Underground"}`),
    "guac": executeGuacCommand,
    "how": executeHowCommands,
    "kill": executeKillCommand,
    "lobotomize": executeLobotomizeCommand,
    "lovechecker": executeLoveCheckerCommand,
    "math": executeMathCommand,
    "online": executeOnlineCommand,
    "ping": executePingCommand,
    "pingforme": executePingForMeCommand,
    "repo": createReply("https://github.com/Maganoos/meow-bot"),
    "skin": executeSkinCommand,
    "unlobotomize": executeUnlobotomizeCommand,
    "what is the meaning of life": createReply("being silly"),
    "who is the most sigma out of all people on earth": createReply("It is I, meow the third of meowington"),
  };

  commandActions["help"] = createReply(`Available commands: \`\`\`${Object.keys(commandActions).sort().join(', ')}\`\`\`\nUse \`meow, :command\` to execute`);

  const commandContent = messageContent.replace(/^(?:meow,\s*)/i, '')

  const match = Object.entries(commandActions)
    .find(([key]) => commandContent.startsWith(key));

  if (match) {
    const [_key, action] = match;
    await action(msg);
  } else msg.reply("huh?");
});

client.login(process.env.TOKEN);
