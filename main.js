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
   const username = message.content.split(' ').slice(2); // Get the username from the command message

  if (username.length !== 1) {  // Ensure that exactly one username is provided
    await message.reply('Please provide only one username.');
    return;
  }

  try {
    // Step 1: Fetch the user's Minecraft UUID
    const profileResponse = await axios.get(`https://api.mojang.com/users/profiles/minecraft/${username[0]}`);
    if (!profileResponse.data) {
      return await message.reply(`User ${username[0]} not found.`);
    }

    // Step 2: Fetch the skin from the UUID
    const uuid = profileResponse.data.id; // Get the UUID
    const username = profile.response.data.name;
    const skinResponse = await axios.get(`https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    // Step 3: Extract the skin URL from the response
    const skinData = skinResponse.data.properties.find(prop => prop.name === 'textures');
    if (!skinData) {
      return await message.reply(`No skin found for ${username[0]}.`);
    }

    const skinJson = JSON.parse(Buffer.from(skinData.value, 'base64').toString('utf-8'));
    const skinUrl = skinJson.textures.SKIN.url;

    await message.reply(`Here is the skin for:\n\\[${username[0]}](${skinUrl})\n[Render](https://starlightskins.lunareclipse.studio/render/default/${username[0]}/full)`);
  } catch (error) {
    console.error('Error fetching skin:', error);
    await message.reply('Sorry, there was an error fetching the skin.');
  }
}

async function executeDiscordPingCommand(message) {
  const id = message.content.split(' ').slice(2)[0];
  await message.reply('<@' + id + '>');
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
  };

  const match = Object.entries(commandActions)
    .find(([key]) => commandContent.startsWith(key));

  if (match) {
    const [_key, action] = match;
    await action(msg, commandActions);
  }
});

client.login(process.env.TOKEN);