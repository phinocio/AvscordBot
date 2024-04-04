/**
 * File checks if a message is from a suspected bot. Generally by checking if it contains known
 * bad URLs, or tries to @everyone.
 */

const { PermissionsBitField } = require("discord.js");

exports.checkIfBot = async function checkMsg(msg) {
	// If the message is from an admin, or a mod, ignore it.
	if (
		msg.member.permissions.has(PermissionsBitField.Flags.Administrator) ||
		msg.member.permissions.has(PermissionsBitField.Flags.KickMembers)
	) {
		return false;
	}

	const msgContent = msg.content.toLocaleLowerCase();
	if (
		msgContent.includes("@everyone") ||
		msgContent.includes("free nitro") ||
		msgContent.includes("discord nitro for free") ||
		msgContent.includes("airdrop")
	) {
		reportMessage(msg);
		await msg.member.roles.add(process.env.MUTE_ROLE);
		await msg.delete();

		return true;
	}

	// return false as the last thing to hopefully minimize false positives
	return false;
};

async function reportMessage(msg) {
	const user = `${msg.member.user.username}#${msg.member.user.discriminator}`;
	const data = {
		embeds: [
			{
				title: "Scam Protectatron",
				description: `${user} muted as potential bot.`,
				thumbnail: {
					url: "https://cdn.discordapp.com/emojis/689897969146789938.png?size=128",
				},
				fields: [
					{
						name: "User ID",
						value: `${msg.member.user.id}`,
						inline: "true",
					},
					{
						name: "Offending Message",
						value: `${msg.content}`,
						inline: "false",
					},
					{
						name: "Channel",
						value: `${msg.channel}`,
						inline: "false",
					},
				],
			},
		],
	};

	try {
		await fetch(process.env.SCAM_REPORT_WEBHOOK, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		});
	} catch (e) {
		console.log("scam reporting error: " + e.message);
	}
}
