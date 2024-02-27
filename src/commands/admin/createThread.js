const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const GameThread = require("../../GameThread");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("gamethread")
		.setDescription("Creates a Game Day Thread, or tags it if it already exists.")
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageThreads),

	async execute(interaction) {
		await interaction.reply("Creating Game Day Thread...");

		const gameThread = new GameThread(interaction.client);
		let thread = await gameThread.getThread();

		if (!thread) {
			thread = await gameThread.create();
		}

		await interaction.editReply(`Join the Game Day Thread: ${thread}`);
	},
};
