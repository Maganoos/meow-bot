import { Client } from 'discord.js-selfbot-v13';
import axios from 'axios';
import { create, all } from 'mathjs';
const wash = await import('washyourmouthoutwithsoap');

const { CHANNEL_IDS, BANNED_PHRASES, BANNED_IDS, BANNED_NAMES, TOKEN } = process.env;
const client = new Client();
const math = create(all, {unsafe: false });

const splitEnvVar = (envVar) => envVar.split(',');

const executeAvatarCommand = async (msg) => {
  const msgMentions = msg.mentions.users;
  if (msgMentions.size <= 0) return msg.reply('who?');
  let response = msgMentions.size > 1 ? 'Here are the avatars:' : 'Here is the avatar for:';
  msgMentions.forEach(user => response += `\n[${user.username}](${user.displayAvatarURL()}?size=4096)`);
  await msg.reply(response);
};

const executeGuacCommand = async (msg) => {
  try {
    const { data: { images: maxImages } } = await axios.get('https://www.eepy.monster/api/images');
    const randomNumber = Math.floor(Math.random() * maxImages) + 1;
    await msg.reply(`https://cdn.eepy.monster/guac${randomNumber}.jpg`);
  } catch (error) {
    console.error('Error fetching image:', error);
  }
};

const executeHowCommands = async (msg) => {
  const command = msg.content.replace(/meow, how/i, '').replace(/[?!.,;]/g, '').trim().split(/\b is \b/i).filter(word => word.trim() !== '');
  if (command.length < 2) return msg.reply('who?');
  const [description, subject] = [command.slice(0, -1).join(' is ').trim(), command[command.length - 1].trim()];
  msg.reply(`${subject} is ${Math.floor(Math.random() * 101)}% ${description}`);
};

const executeLoveCheckerCommand = async (msg) => {
  const people = msg.content.split(' ').slice(2).filter(word => word.toLowerCase() !== 'and');
  if (people.length < 2) return msg.reply('Please provide at least two people to check love for.');
  msg.reply(`The love between ${people.join(' and ')} is ${Math.floor(Math.random() * 100)}%`);
};

const executeMathCommand = async (msg) => {
  const expression = msg.content.split(' ').slice(2).join(' ').replace(/\*\*/g, '^').replace(/x/g, '*');
  if (!expression) return msg.reply('Please provide a mathematical expression to evaluate.');
  if (expression.replace(/\s+/g, '') === "9+10") return msg.reply('Result: `21` :3');
  try {
    const result = math.evaluate(expression);
    if (result < 100000000000000000) await msg.reply(`Result: \`${result}\``);
  } catch (error) {
    console.error('Error evaluating expression:', error);
    msg.reply('Invalid mathematical expression.');
  }
};

const executeOnlineCommand = async (msg) => {
  try {
    const { data: { players: { online: playerCount, list: playerNames = [] } = {} } = {} } = await axios.get('https://api.mcsrvstat.us/3/play.alinea.gg');
    playerNames.push(...["Diddy", "Luigi Mangione", "Xi Jingping"]);

    const invalidEntries = [];
    playerNames.forEach((name, index) => {
      if (typeof name !== 'string') {
        console.error(`Invalid entry at index ${index}:`, name);
        invalidEntries.push(`Index ${index}: ${name}`);
      }
    });

    const validPlayerNames = playerNames.filter(name => typeof name === 'string');
    validPlayerNames.sort((a, b) => a.localeCompare(b));

    if (validPlayerNames.length === 0) {
      msg.reply(`All entries are invalid:\n\`\`\`${invalidEntries.join('\n')}\`\`\``);
      return;
    }

    const formattedNames = validPlayerNames.length > 0 
      ? validPlayerNames.slice(0, -1).join(', ') + (validPlayerNames.length > 1 ? ` and ${validPlayerNames[validPlayerNames.length - 1]}` : validPlayerNames[0]) 
      : 'No players online';

    msg.reply(`Currently ${playerCount} ${playerCount > 1 ? "players" : "player"} online:\n\`\`\`${formattedNames}\`\`\``);
  } catch (error) {
    console.error('Error fetching data:', error);
    msg.reply('Error fetching player data.');
  }
};

const executePingCommand = async (msg) => {
  const pingMessage = await msg.reply('Pinging...');
  const latency = Math.round(client.ws.ping);
  await pingMessage.edit(`Pong! Latency: ${latency}ms`);
};

const executePurgeCommand = async (msg) => {
  if (!['885157323880935474', '1050780466137026671'].includes(msg.author.id.toString()) && msg.author.displayName !== 'Maganoos') return;
  try {
    let messages = await msg.channel.messages.fetch({ limit: 50 });
    messages = messages.filter(message => message.author.id === client.user.id);
    for (const message of messages.values()) await message.delete();
    msg.reply(`Deleted ${messages.size} messages sent by ${client.user.username}`);
  } catch (error) {
    console.error('Error occurred while purging messages:', error);
  }
};

const executeSkinCommand = async (msg) => {
  const args = msg.content.split(' ');
  if (args.length !== 3) return msg.reply('Please provide only one username.');
  const username = args[2];
  try {
    const { data: { name: correctUsername, id: uuid } } = await axios.get(`https://api.mojang.com/users/profiles/minecraft/${username}`);
    const { data: { properties } } = await axios.get(`https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`, { headers: { 'Accept': 'application/json' } });
    const skinData = properties.find(prop => prop.name === 'textures');
    if (!skinData) return msg.reply(`No skin found for ${correctUsername}.`);
    const { textures: { SKIN: { url: skinUrl } } } = JSON.parse(Buffer.from(skinData.value, 'base64').toString('utf-8'));
    msg.reply(`Here is the skin for:\n[${correctUsername}](${skinUrl})\n[Render](https://starlightskins.lunareclipse.studio/render/mojavatar/${uuid}/full)`);
  } catch (error) {
    console.error('Error fetching skin:', error);
    msg.reply(error.response?.status === 404 ? `User ${username} not found.` : `There was an issue with the API: ${error.response?.status} ${error.response?.statusText}`);
  }
};

const createReply = (replyText) => async (msg) => {
  try {
    const referencedMessage = msg.reference ? await msg.fetchReference() : null;
    await (referencedMessage ? referencedMessage.reply(replyText) : msg.reply(replyText));
  } catch (error) {
    console.error("erm wattesigma", error);
    msg.reply("oops");
  }
};

client.once('ready', () => console.log(`${client.user.username} is ready!`));

client.on('messageCreate', async (msg) => {
  const messageContent = msg.content.toLowerCase();
  if (!splitEnvVar(CHANNEL_IDS).includes(msg.channel.id) || !messageContent.startsWith('meow,') || msg.author.id === client.user.id) return;
  if (splitEnvVar(BANNED_IDS).includes(msg.author.id) || splitEnvVar(BANNED_NAMES).includes(msg.author.displayName)) return msg.reply("nuh uh, you're not allowed to use meow");
  if (splitEnvVar(BANNED_PHRASES).some(phrase => messageContent.includes(phrase)) || (msg.mentions.length > 5) || (messageContent.length > 100) || wash.default.check("en", messageContent.replace(/[^A-Za-z0-9\s]/g, ''))) return msg.reply("Nope");

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
    "purge": executePurgeCommand,
    "repo": createReply("https://github.com/Maganoos/meow-bot"),
    "1-100": createReply(String(Math.floor(Math.random() * 101))),
    "skin": executeSkinCommand,
    "unlobotomize": createReply("🧠🤕"),
    "yes or no": createReply(Math.floor(Math.random() * 2) === 0 ? "Yes" : "No"),
    "what is the meaning of life": createReply("being silly"),
    "who is the most sigma out of all people on earth": createReply("It is I, meow the third of meowington"),
  };
  commandActions["help"] = createReply(`Available commands: \`\`\`${Object.keys(commandActions).sort().join(', ')}\`\`\`\nUse \`meow, :command\` to execute`)

  const commandContent = messageContent.replace(/^meow,\s/i, '');
  const match = Object.entries(commandActions).find(([key]) => commandContent.startsWith(key));
  if (match) await match[1](msg); else await msg.reply("huh?");
});

client.login(TOKEN);