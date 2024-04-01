const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const GameThread = require("../../GameThread");
const formatInTimeZone = require("date-fns-tz/formatInTimeZone");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("gamethread")
		.setDescription("Creates a Game Day Thread, or tags it if it already exists.")
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageThreads),

	async execute(interaction) {
		await interaction.reply("Creating Game Day Thread...");

		const gameThread = new GameThread(interaction.client);
		let thread = await gameThread.getThread();
		// TODO: check db for created thread

		console.log(`Current time is: ${formatInTimeZone(new Date(), "America/Denver", "yyyy-MM-dd")}`);
		if (!thread) {
			thread = await gameThread.create();
		}

		await interaction.editReply(`Join the Game Day Thread: ${thread}`);
	},
};
