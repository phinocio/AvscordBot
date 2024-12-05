require("dotenv").config();

const { Client, Collection, Events, GatewayIntentBits, ActivityType } = require("discord.js");
const cron = require("node-cron");
const fs = require("node:fs");
const path = require("node:path");
const { RedditFeed } = require("./src/cron/redditFeed");
const { RedditPost } = require("./src/database/database");
const createGameThread = require("./src/helpers/createGameThread");
const { sarcasmify } = require("./src/helpers/sarcasmify");

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  presence: { activities: [{ type: ActivityType.Watching, name: "Georgiev let in four" }], status: "online" },
});

client.commands = new Collection();
const foldersPath = path.join(__dirname, "src/commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
  }
}

const eventsPath = path.join(__dirname, "src/events");
const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

client.once(Events.ClientReady, (readyClient) => {
  RedditPost.sync();
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.login(process.env.TOKEN);

// 0 14 * * * is 7am MT/2pm UTC. Server is in UTC.
cron.schedule("0 14 * * *", async () => {
  await createGameThread(client);
});

const redditFeed = new RedditFeed();
// * * * * * is every minute
cron.schedule("* * * * *", () => {
  redditFeed.getNewPosts(client);
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) {
    return;
  }

  if (message.content.toLowerCase() === "where thread") {
    message.reply(sarcasmify("Where thread"));

    // only create GDT if it's at least 7am on game day
    if (new Date().getUTCHours() < 14) {
      message.reply("https://i.imgur.com/rY09A7Z.jpeg")  // todo: store locally and embed as image
    } else {
      await createGameThread(client);
    }
  }

  if (message.content.toLowerCase() === "first") {
    if (message.channel.isThread() && message.channel.parent === process.env.THREADS_CHANNEL) {
      message.reply(sarcasmify("first"));
    }
  }

  console.log(message.content);
});
