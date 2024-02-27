const { formatInTimeZone } = require("date-fns-tz");

module.exports = class NHLApi {
	constructor(team) {
		this.seasonSchedule = "https://api-web.nhle.com/v1/club-schedule-season/" + team + "/";
		this.weekSchedule = "https://api-web.nhle.com/v1/club-schedule/" + team + "/week/";
	}

	async getSeasonSchedule() {
		return await fetch(this.seasonSchedule);
	}

	async getWeekSchedule(week) {
		return await fetch(this.weekSchedule + week);
	}

	async getNextGame() {
		const date = formatInTimeZone(new Date(), "America/Denver", "yyyy-MM-dd");
		const resp = await this.getWeekSchedule(date);
		const data = await resp.json();

		return data.games[0];
	}
};
