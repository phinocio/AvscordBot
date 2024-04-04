const { Events } = require("discord.js");
const { checkIfBot } = require("../moderation/checkBot");

module.exports = {
	name: Events.MessageCreate,
	async execute(message) {
		if (!message.author.bot) {
			checkIfBot(message);
		}
	},
};
