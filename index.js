import { Client } from 'discord.js-selfbot-v13';
import axios from 'axios';
import { create, all } from 'mathjs';
const wash = await import('washyourmouthoutwithsoap');

const { CHANNEL_IDS, BANNED_PHRASES, BANNED_IDS, BANNED_NAMES, PREFIXES, TOKEN } = process.env;
const client = new Client();
const math = create(all, {unsafe: false });

const splitEnvVar = (envVar) => envVar.match(/meow, |[^,]+/g);

const removePrefixes = (str, cmd) => {
  let result = String(str);
  for (const prefix of splitEnvVar(PREFIXES)) {
    if (str.toLowerCase().startsWith(prefix)) {
      result = str.slice(prefix.length + cmd.length);
      break;
    }
  }
  return result.trim();
}

const executeAvatarCommand = async (msg) => {
  const msgMentions = msg.mentions.users;
  if (msgMentions.size <= 0) return await msg.reply('who?');
  let response = msgMentions.size > 1 ? 'Here are the avatars:' : 'Here is the avatar for:';
  msgMentions.forEach(user => response += `\n[${user.username}](${user.displayAvatarURL()}?size=4096)`);
  await msg.reply(response);
};

const executeBreakingBadQuoteCommand = async (msg) => {
  try {
    const { data } = await axios.get('https://api.breakingbadquotes.xyz/v1/quotes');
    const { quote, author } = data[0];
    await msg.reply(`"${quote}" - ${author}`);
  } catch (error) {
    console.error('Error fetching Breaking Bad quote:', error);
    await msg.reply('Error fetching Breaking Bad quote.');
  }
};

const executeCurrencyConverterCommand = async (msg) => {
  const args = removePrefixes(msg.content, 'currency').split(' ').filter(arg => !['to', 'in'].includes(arg.toLowerCase()) && arg !== '');
  if (args.length < 3) {
    await msg.reply('Please provide the amount, from currency, and to currency.');
    return;
  }
  const [amount, fromCurrency, toCurrency] = [args[0], args[1].toUpperCase(), args[2].toUpperCase()];

  try {
    const message = await msg.reply("Hold on...");
    const { data } = await axios.get(`https://moneymorph.dev/api/convert/${amount}/${fromCurrency}/${toCurrency}`);
    const convertedAmount = data.response.toFixed(2);
    const formattedAmount = parseFloat(amount).toLocaleString('de-DE', { style: 'currency', currency: fromCurrency });
    const formattedConvertedAmount = parseFloat(convertedAmount).toLocaleString('de-DE', { style: 'currency', currency: toCurrency });

    await message.delete();
    await msg.reply(`\`${formattedAmount}\` is approximately \`${formattedConvertedAmount}\`.`)
  } catch (error) {
    console.error('Error fetching currency data:', error);
    await msg.reply('Error fetching currency data.')
  }
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
  const command = removePrefixes(msg.content, 'how').replace(/[?!.,;]/g, '').split(/\b is \b/i).filter(word => word.trim() !== '');
  if (command.length < 2) return await msg.reply('who?');
  const [description, subject] = [command.slice(0, -1).join(' is '), command[command.length - 1]];
  await msg.reply(`${subject} is ${Math.floor(Math.random() * 101)}% ${description}`);
};

const executeLoveCheckerCommand = async (msg) => {
  const people = removePrefixes(msg.content, 'lovechecker').split(' and ').filter(word => word.toLowerCase() !== 'and');
  if (people.length < 2) return await msg.reply('Please provide at least two people to check love for.');
  await msg.reply(`The love between ${people.join(' and ')} is ${Math.floor(Math.random() * 100)}%`);
};

const executeMathCommand = async (msg) => {
  const expression = removePrefixes(msg.content, 'math').replace(/\*\*/g, '^').replace(/x/g, '*');
  if (!expression) return await msg.reply('Please provide a mathematical expression to evaluate.');
  if (expression.replace(/\s+/g, '') === "9+10") return await msg.reply('Result: `21` :3');
  try {
    const result = math.evaluate(expression);
    if (result < 100000000000000000) await msg.reply(`Result: \`${result}\``);
    else await msg.reply(Math.floor(Math.random() * 2) == 1 ? "icl ts pmo sm n sb rn ngl, r u srsly srs n fr rn vro? Smh lol atp js go 💔... b fr vro, idek nm, brb gng gtg atm lmao, bt ts pmo 2 js lmk lol onb fr, ac nvm b wt istg ts vro keys🙏💔 ts pmo" : "ngl ts pmo sm lk icl vro 💔")
  } catch (error) {
    console.error('Error evaluating expression:', error);
    await msg.reply('Invalid mathematical expression.');
  }
};

async function executeMcWikiCommand(msg) {
  try {
    const searchTerm = removePrefixes(msg.content, 'mcwiki');

    if (!searchTerm) {
      return await msg.reply("Please provide a search term after `mcwiki` (e.g., `meow, mcwiki Cats`).");
    }

    const mcWikiUrl = `https://minecraft.wiki/w/${encodeURIComponent(searchTerm.replace(/ /g, '_'))}`;

    const response = await axios.head(mcWikiUrl);

    if (response.status === 200) {
      await msg.reply(mcWikiUrl);
    } else {
      await msg.reply("No Minecraft Wiki page found for this search term. Please try a different term.");
    }
  } catch (error) {
    await msg.reply("An error occurred while searching the Minecraft Wiki. Please try again later.");
    console.error("Error in executeMcWikiCommand:", error);
  }
}

const executeOnlineCommand = async (msg) => {
  const srv = removePrefixes(msg.content, 'online').split(/\s/)[0] || "play.alinea.gg";

  try {
    const response = await axios.get(`https://api.mcstatus.io/v2/status/java/${srv}`);

    if (response.data.online) {
      const numPlayers = response.data.players.online;
      const playerNames = response.data.players.list.map(player => player.name_clean);

      if (numPlayers === 0) {
        await msg.reply(`No players online on \`${srv}\`.`);
        return;
      }

      playerNames.sort((a, b) => a.localeCompare(b));

      const formattedNames =
        playerNames.length > 2
          ? playerNames.slice(0, -1).join(', ') + `, and ${playerNames[playerNames.length - 1]}`
          : playerNames.length === 2
          ? `${playerNames[0]} and ${playerNames[1]}`
          : playerNames[0];

      await msg.reply(`Currently ${numPlayers} ${numPlayers > 1 ? "players" : "player"} online:\n\`\`\`${formattedNames}\`\`\``);
    } else {
      await msg.reply('Server is offline.');
    }
  } catch (error) {
    if (error.status === 404) return await msg.reply(`Server \`${srv}\` not found.`);
    console.error('Error fetching data:', error);
    await msg.reply('Error fetching player data.');
  }
};

const executePingCommand = async (msg) => {
  try {
    const sentMessage = await msg.reply('Pinging...');
    const latency = Date.now() - sentMessage.createdTimestamp;
    const apiLatency = sentMessage.createdTimestamp - msg.createdTimestamp;
    await sentMessage.delete();
    await msg.reply(`Pong! Latency: ${latency}ms, API Latency: ${apiLatency}ms.`)
  } catch (error) {
    console.error('Error sending ping response:', error);
  }
};

const executePurgeCommand = async (msg) => {
  if (String(msg.author.id) !== "885157323880935474" && !(String(msg.author.id) === "1050780466137026671" && msg.author.username === "Maganoos")) return await msg.reply("You don't have permission to use this command.");
  try {
    let messages = await msg.channel.messages.fetch({ limit: 50 });
    messages = messages.filter(message => message.author.id === client.user.id);
    for (const message of messages.values()) await message.delete();
    await msg.reply(`Deleted ${messages.size} messages sent by ${client.user.username}`);
  } catch (error) {
    console.error('Error occurred while purging messages:', error);
  }
};

const executeShrekCommand = async (msg) => {
  try {
    const { data: quote } = await axios.get('https://shrekofficial.com/quotes/random');
    await msg.reply(quote);
  } catch (error) {
    console.error('Error fetching Shrek quote:', error);
    await msg.reply('Error fetching Shrek quote.');
  }
};

const executeSkinCommand = async (msg) => {
  const username = removePrefixes(msg.content, 'skin');
  if (!username) return await msg.reply('Please provide only one username.');
  try {
    const { data: { name: correctUsername, id: uuid } } = await axios.get(`https://api.mojang.com/users/profiles/minecraft/${username}`);
    const { data: { properties } } = await axios.get(`https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`, { headers: { 'Accept': 'application/json' } });
    const skinData = properties.find(prop => prop.name === 'textures');
    if (!skinData) return await msg.reply(`No skin found for ${correctUsername}.`);
    const { textures: { SKIN: { url: skinUrl } } } = JSON.parse(Buffer.from(skinData.value, 'base64').toString('utf-8'));
    await msg.reply(`Here is the skin for:\n[${correctUsername}](${skinUrl})\n[Render](https://starlightskins.lunareclipse.studio/render/mojavatar/${uuid}/full)`);
  } catch (error) {
    await msg.reply(error.response?.status === 404 ? `User ${username} not found.` : `There was an issue with the API: ${error.response?.status} ${error.response?.statusText}`);
    if (error.response && error.response.status !== 404) console.log(error)
  }
};

async function executeWikiCommand(msg) {
  try {
    const searchTerm = removePrefixes(msg.content, 'wiki');

    if (!searchTerm) {
      return await msg.reply("Please provide a search term after `wiki` (e.g., `meow, wiki Cats`).");
    }

    const response = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(searchTerm.replace(/ /g, '_'))}`);
    await msg.reply(`https://en.wikipedia.org/wiki/${response.data.title.replace(/ /g, '_')}`);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      await msg.reply("No Wikipedia page was found for your search term. Please try a different term.");
    } else {
      await msg.reply("An error occurred while searching Wikipedia. Please try again later.");
    }
    console.error("Error in executeWikiCommand:", error);
  }
}

const createReply = (replyText) => async (msg) => {
  try {
    const referencedMessage = msg.reference ? await msg.fetchReference() : null;
    await (referencedMessage ? referencedMessage.reply(replyText) : await msg.reply(replyText));
  } catch (error) {
    console.error("erm wattesigma", error);
    await msg.reply("oops");
  }
};

client.once('ready', () => console.log(`${client.user.username} is ready!`));

client.on('messageUpdate', async (oldMessage, newMessage) => {
  if (newMessage.partial) await newMessage.fetch();
  if (newMessage.author && newMessage.author.id !== client.user.id) {
    client.emit('messageCreate', newMessage);
  }
});

client.on('messageCreate', async (msg) => {
  const messageContent = msg.content.toLowerCase();
  if (messageContent.startsWith("fline")) executeOnlineCommand(msg);
  if (!splitEnvVar(CHANNEL_IDS).includes(msg.channel.id) || !splitEnvVar(PREFIXES).some(prefix => messageContent.startsWith(prefix)) || msg.author.id === client.user.id) return;
  if (splitEnvVar(BANNED_IDS).includes(msg.author.id) || splitEnvVar(BANNED_NAMES).includes(msg.author.displayName)) return await msg.reply("nuh uh, you're not allowed to use meow");
  if (splitEnvVar(BANNED_PHRASES).some(phrase => messageContent.includes(phrase)) || (msg.mentions.length > 5) || (messageContent.length > 100) || wash.default.check("en", messageContent.replace(/[^A-Za-z0-9\s]/g, ''))) return await msg.reply("Nope");
  if (!splitEnvVar(PREFIXES).some(prefix => messageContent.startsWith(prefix) && /^[a-zA-Z]$/.test(messageContent[prefix.length + 1]))) return;

  const commandActions = {
    "1-100": createReply(String(Math.floor(Math.random() * 101))),
    "avatar": executeAvatarCommand,
    "brutally murder": createReply("🔫💨"),
    "currency": executeCurrencyConverterCommand,
    "elevator": createReply(`The elevator is in the ${new Date().getMinutes() % 10 <= 5 ? "Overworld" : "Underground"}`),
    "give me a ": createReply(`*${removePrefixes(msg.content, 'give me a')}*`),
    "guac": executeGuacCommand,
    "how": executeHowCommands,
    "kill": createReply("🔫💨"),
    "lobotomize": createReply("🧠🔨"),
    "lovechecker": executeLoveCheckerCommand,
    "math": executeMathCommand,
    "mcwiki": executeMcWikiCommand,
    "murder": createReply("🔫💨"),
    "offline": createReply("Hmmm..... Just about every minecraft player I think. 🧠🔨"),
    "online": executeOnlineCommand,
    "ping": executePingCommand,
    "purge": executePurgeCommand,
    "repo": createReply("https://github.com/Maganoos/meow-bot"),
    "shrek": executeShrekCommand,
    "skin": executeSkinCommand,
    "spawn": createReply("The Overworld spawn is located at -1520 108 1300.\nThe Underground elevator is located at -1499 40 1297."),
    "unlobotomize": createReply("🧠🤕"),
    "we need to cook": executeBreakingBadQuoteCommand,
    "what is the meaning of life": createReply("being silly"),
    "who is the most sigma out of all people on earth": createReply("It is I, meow the third of meowington"),
    "wiki" : executeWikiCommand,
    "yes or no": createReply(Math.floor(Math.random() * 2) === 0 ? "Yes" : "No"),
  };

  const commandContent = splitEnvVar(PREFIXES).reduce((content, prefix) => content.replace(new RegExp(`^${prefix}`, 'i'), ''), messageContent).trim();
  const match = Object.entries(commandActions).find(([key]) => commandContent.startsWith(key));
  if (match) await match[1](msg); else await msg.reply("huh?");
});

client.login(TOKEN);

/* I walk to burger king, then I walk back home from burger king..
Our house, in the middle of our house, Our house, in the middle of our house... */
