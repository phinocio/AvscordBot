const Sequelize = require("sequelize");

const database = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
	host: process.env.DB_HOST,
	dialect: "sqlite",
	logging: false,
	storage: "./storage/database.sqlite3",
});

// Define database tables
exports.RedditPost = database.define("reddit_posts", {
	post_id: {
		type: Sequelize.STRING,
		primaryKey: true,
	},
});

exports.database = database;
