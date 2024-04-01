require("dotenv").config();

const { Client, Collection, Events, GatewayIntentBits, ActivityType } = require("discord.js");
const GameThread = require("./src/GameThread");
const cron = require("node-cron");
const fs = require("node:fs");
const path = require("node:path");
const formatInTimeZone = require("date-fns-tz/formatInTimeZone");
const { RedditFeed } = require("./src/cron/redditFeed");
const { RedditPost } = require("./src/database/database");

// Create a new client instance
const client = new Client({
	intents: [GatewayIntentBits.Guilds],
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
	const gameThread = new GameThread(client);

	const { game } = await gameThread.getGame();

	if (
		formatInTimeZone(new Date(), "America/Denver", "yyyy-MM-dd") ===
		formatInTimeZone(game.startTimeUTC, "America/Denver", "yyyy-MM-dd")
	) {
		const channel = client.channels.cache.get(process.env.THREADS_CHANNEL);
		let thread = await gameThread.getThread();

		if (!thread) {
			thread = await gameThread.create();

			if (thread.joinable()) {
				await thread.join();
			}
		}

		channel.send(`Join the Game Day Thread: ${thread}`);
		console.log("Game Day Thread created");
	} else {
		console.log("Game Day Thread not created");
		console.log(
			formatInTimeZone(new Date(), "America/Denver", "yyyy-MM-dd") ===
				formatInTimeZone(game.startTimeUTC, "America/Denver", "yyyy-MM-dd")
		);
	}
});

const redditFeed = new RedditFeed();
// * * * * * is every minute
cron.schedule("* * * * *", () => {
	redditFeed.getNewPosts(client);
});
