// const { subreddit, redditChannel } = require("../../config.json");
const Storage = require("../helpers/storage");
const { execSync } = require("node:child_process");
const md5 = require("crypto-js/md5");
const { EmbedBuilder } = require("discord.js");

exports.RedditFeed = class RedditFeed {
	async getNewPosts(client) {
		const url = `https://www.reddit.com/r/${process.env.SUBREDDIT}/new.json`;

		let newPosts = undefined;

		const cmd = `curl -Ss ${url}`;
		const resp = execSync(cmd, (error, stdout, stderr) => {
			if (error) {
				console.log(`error: ${error.message}`);
				return;
			}
			if (stderr) {
				console.log(`stderr: ${stderr}`);
				return;
			}
		});

		newPosts = JSON.parse(resp);

		const post = newPosts.data.children[0].data;

		// const response = await fetch(url, {
		// 	method: "GET",
		// 	headers: {
		// 		"Content-Type": "application/json",
		// 		"User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0",
		// 	},
		// });
		// console.log(response);

		this.newestPost = await Storage.readTxt("redditfeed.txt");

		const postHash = md5(post.title + post.author + post.created_utc).toString();

		if (this.newestPost !== postHash) {
			// It's a new post, so overwrite the hash in the file.
			await Storage.store("redditfeed.txt", postHash);
			const channel = client.channels.cache.get(process.env.REDDIT_CHANNEL);

			const data = new EmbedBuilder()
				.setTitle(post.title)
				.setURL(`https://reddit.com${post.permalink}`)
				.setThumbnail("https://i.imgur.com/lnZCKgN.png")

				.addFields(
					{ name: "Author", value: `/u/${post.author}`, inline: true },
					{ name: "Content Warning", value: post.over_18 ? "18+" : "None", inline: true }
				)
				.setFooter({ text: `/r/ColoradoAvalanche`, iconURL: "https://i.imgur.com/yTWkQnj.png" });

			if (post.selftext) {
				data.setDescription(post.selftext);
			}

			if (!post.over_18) {
				if (post.url.endsWith(".jpg") || post.url.endsWith(".png") || post.url.endsWith(".gif")) {
					data.setImage(post.url);
				} else {
					data.setImage(post.thumbnail);
				}
			}

			await channel.send({ embeds: [data] });
			// try {
			// 	await fetch(webhooks.redditFeed, {
			// 		method: "POST",
			// 		headers: {
			// 			"Content-Type": "application/json",
			// 		},
			// 		body: JSON.stringify(data),
			// 	});
			// } catch (e) {
			// 	console.log("reddit feed error: " + e.message);
			// }
		}
	}
};
