// Require the necessary discord.js classes
const { Client, Events, GatewayIntentBits } = require("discord.js");
const { token, threadsChannel } = require("./config.json");

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, (readyClient) => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// Log in to Discord with your client's token
client.login(token);

client.on(Events.ClientReady, async () => {
	const channel = client.channels.cache.get(threadsChannel);

	const thread = await channel.threads.create({
		name: "TOR @ COL (5pm MT)",
		autoArchiveDuration: 1440, // Archives in 24 hours
		reason: "TOR @ COL (5pm MT)",
	});

	console.log(`Created thread: ${thread.name}`);

	channel.send("thread created");
});
