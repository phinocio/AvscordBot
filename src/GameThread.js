const formatInTimeZone = require("date-fns-tz/formatInTimeZone");
const NHLApi = require("./api/NHLApi");
const { threadsChannel, teamName } = require("../config.json");
const { ThreadAutoArchiveDuration, EmbedBuilder } = require("discord.js");

module.exports = class GameThread {
	constructor(client) {
		this.client = client;
		this.api = new NHLApi(teamName);
	}

	async getGame() {
		const game = await this.api.getNextGame();
		const date = formatInTimeZone(new Date(game.startTimeUTC), "America/Denver", "MMM dd h:mmb zzz");
		return { threadName: `${game.awayTeam.abbrev} @ ${game.homeTeam.abbrev} (${date})`, game: game };
	}

	async create() {
		const channel = this.client.channels.cache.get(threadsChannel);
		const { game, threadName } = await this.getGame();
		const thread = await channel.threads.create({
			name: threadName,
			autoArchiveDuration: ThreadAutoArchiveDuration.OneDay, // Archives in 24 hours
			reason: threadName,
		});

		// inside a command, event listener, etc.
		const gameEmbed = new EmbedBuilder()
			.setColor(0x0099ff)
			.setTitle(threadName)
			.setAuthor({
				name: "Game Day!",
				iconURL: "https://cms.nhl.bamgrid.com/images/photos/281721016/256x256/cut.png",
			})
			.setDescription("Go team, do the sport.")
			.setFooter({
				text: `${game.venue.default} - ${game.tvBroadcasts.reduce((acc, x) => {
					return acc + x.network + " ";
				}, "")}`,
				iconURL: "https://cms.nhl.bamgrid.com/images/photos/281721016/256x256/cut.png",
			});

		const msg = await thread.send({ embeds: [gameEmbed] });
		msg.pin();
		thread.send(`${game.awayTeam.abbrev} @ ${game.homeTeam.abbrev}: <@&1211849064921047100>`);
		return thread;
	}

	// This also serves as a way to check if the thread exists.
	async getThread() {
		const channel = this.client.channels.cache.get(threadsChannel);
		const { threadName } = await this.getGame();
		return channel.threads.cache.find((x) => x.name === threadName);
	}
};
