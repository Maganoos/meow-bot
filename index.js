import { Client } from 'discord.js-selfbot-v13';
import axios from 'axios';
import { create, all } from 'mathjs';
const wash = await import('washyourmouthoutwithsoap')

const CHANNEL_IDS = process.env.CHANNEL_IDS.split(",");
const BANNED_PHRASES = process.env.BANNED_PHRASES.split(',');
const BANNED_IDS = process.env.BANNED_IDS.split(",");

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
  const command = msg.content
    .replace(/meow, how/i, '')
    .replace(/[?!.,;]/g, '')
    .trim()
    .split(/\b is \b/i)
    .filter(word => word.trim() !== '');

  if (command.length < 2) {
      msg.reply('who?');
      return;
  }

  const subject = command[command.length - 1].trim();
  const description = command.slice(0, command.length - 1).join(' is ').trim();

  msg.reply(`${subject} is ${Math.floor(Math.random() * 101)}% ${description}`);
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
  const expression = msg.content.split(' ').slice(2).join(' ').replace(/\*\*/g, '^').replace(/x/g, '*');

  if (!expression) {
    await msg.reply('Please provide a mathematical expression to evaluate.');
    return;
  }

  if (expression.replace(/\s+/g, '') === "9+10") {
    await msg.reply('Result: `21` :3');
    return;
  }

  try {
    const result = math.evaluate(expression);
    if (result >= 100000000000000000) return;
    await msg.reply(`Result: \`${result}\``);
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
      
      playerNames.push(...["Diddy", "Luigi Mangione", "Xi Jingping"]); 
      playerNames.sort(function (a, b) {return a.localeCompare(b)});

      const formattedNames = playerNames.length > 0
        ? playerNames.slice(0, -1).join(', ') + (playerNames.length > 1 ? ` and ${playerNames[playerNames.length - 1]}` : playerNames[0])
        : 'No players online';

      await msg.reply(`Currently ${playerCount} player(s) online:\n\`\`\`${formattedNames}\`\`\``);
    } else {
      await msg.reply('Server might be offline.');
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
    
    if (profileResponse.status === 404|| !profileResponse.data) {
      await msg.reply(`User ${username} not found.`);
      return;
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
      await msg.reply(`No skin found for ${correctUsername}.`);
      return;
    }

    const skinJson = JSON.parse(Buffer.from(skinData.value, 'base64').toString('utf-8'));
    const skinUrl = skinJson.textures.SKIN.url;

    await msg.reply(`Here is the skin for:\n[${correctUsername}](${skinUrl})\n[Render](https://starlightskins.lunareclipse.studio/render/mojavatar/${uuid}/full)`);
  } catch (error) {
    console.error('Error fetching skin:', error);
    if (error.response && error.response.status === 404) {
      await msg.reply(`User ${username} not found.`);
    } else if (error.response) {
      await msg.reply(`There was an issue with the API: ${error.response.status} ${error.response.statusText}`);
    } else {
      await msg.reply('Sorry, there was an error fetching the skin.');
    }
  }
}

function createReply(replyText) {
  return async function(msg) {
    if (!msg.reference) {
      await msg.reply(replyText);
    } else {
      const referencedMessage = await msg.fetchReference();
      await referencedMessage.reply(replyText);
    }
  };
}

client.once('ready', () => {
  console.log(`${client.user.username} is ready!`);
});

client.on('messageCreate', async (msg) => {
  const messageContent = msg.content.toLowerCase();

  if (!CHANNEL_IDS.includes(msg.channel.id))
    return;

  if (!messageContent.startsWith('meow,'))
    return;

  if (msg.author.id === client.user.id)
    return;

  if (BANNED_IDS.includes(msg.author.id) || process.env.BANNED_NAMES.includes(msg.author.displayName)){
    await msg.reply("nuh uh, you're not allowed to use meow");
    return;
  }

  if (
    BANNED_PHRASES.some(phrase => messageContent.includes(phrase)) ||
    (msg.mentions?.length > 5) ||
    (messageContent.length > 100) ||
    wash.default.check("en", messageContent.replace(/[^A-Za-z0-9\s]/g, ''))
  ) {
    await msg.reply("Nope");
    return;
  }
  const commandActions = {
    "avatar": executeAvatarCommand,
    "brutally murder": createReply("🔫💨"),  
    "elevator": createReply(`The elevator is in the ${new Date().getMinutes() % 10 <= 5 ? "Overworld" : "Underground"}`),
    "guac": executeGuacCommand,
    "how": executeHowCommands,
    "kill": createReply("🔫💨"),
    "lobotomize": createReply("🧠🔨"),
    "lovechecker": executeLoveCheckerCommand,
    "math": executeMathCommand,
    "murder": createReply("🔫💨"),
    "online": executeOnlineCommand,
    "ping": executePingCommand,
    "pingforme": executePingForMeCommand,
    "repo": createReply("https://github.com/Maganoos/meow-bot"),
    "1-100": createReply(String(Math.floor(Math.random() * 101))),
    "skin": executeSkinCommand,
    "unlobotomize": createReply("🧠🤕"),
    "yes or no": createReply(Math.floor(Math.random() * 2) == 0 ? "Yes" : "No"),
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