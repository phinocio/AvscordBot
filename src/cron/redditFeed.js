const { RedditPost } = require("../database/database");
const { execSync } = require("node:child_process");
const md5 = require("crypto-js/md5");
const { EmbedBuilder } = require("discord.js");

exports.RedditFeed = class RedditFeed {
	async getNewPosts(client) {
		try {
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

			if (!newPosts.data) {
				return;
			}
			const post = newPosts.data.children[0].data;
			const postHash = md5(post.title + post.author + post.created_utc).toString();
			const postExists = await RedditPost.findOne({ where: { post_id: postHash } });

			// If the post doesn't exist in the database, then we can be relatively sure that it
			// has not been sent in the reddit feed channel.
			if (!postExists) {
				const channel = client.channels.cache.get(process.env.REDDIT_CHANNEL);
				try {
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
						if (
							post.url.endsWith(".jpg") ||
							post.url.endsWith(".png") ||
							post.url.endsWith(".gif") ||
							post.url.endsWith(".jpsg")
						) {
							data.setImage(post.url);
						} else if (post.thumbnail !== "default" && post.thumbnail !== "self") {
							data.setImage(post.thumbnail);
						}
					}

					await channel.send({ embeds: [data] });
					await RedditPost.create({ post_id: postHash });
				} catch (e) {
					console.log(e);
				}
			}
		} catch (error) {
			console.error(`Error: ${error}`);
		}
	}
};
