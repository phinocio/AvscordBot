const { TZDate } = require("@date-fns/tz");
const { format } = require("date-fns");
const GameThread = require("../GameThread");

module.exports = async function createGameThread(client) {
	const gameThread = new GameThread(client);

	const { game } = await gameThread.getGame();

	const currentDate = format(new TZDate(new Date(), "America/Denver"), "yyyy-MM-dd");
	const gameDate = format(new TZDate(game.startTimeUTC, "America/Denver"), "yyyy-MM-dd");
	const channel = client.channels.cache.get(process.env.THREADS_CHANNEL);

	if (currentDate === gameDate) {
		let thread = await gameThread.getThread();

		if (!thread) {
			thread = await gameThread.create();
		} else {
			channel.send(`Join the Game Day Thread: ${thread}`);
		}
	} else {
		channel.send("It's not game day dummy.");
	}
};
