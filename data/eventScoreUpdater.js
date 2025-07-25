const cheerio = require("cheerio");
const axios = require("axios");
const { loadData, saveData } = require("./dataFunctions/dataFunctions");

let url = "https://fabtcg.com/en/coverage/pro-tour-singapore-2025";
const playerDataFile = "data/events/PT-Singapore2025.json";
const eventDataFile = "data/currentevent.json";
let data;

async function getAndUpdateData(roundNum) {
    const eventData = await loadData(eventDataFile);
    if (eventData.lastRound >= roundNum) {
        return "Already gathered info from round " + eventData.lastRound;
    }
    // Get data from Event Coverage Round Results Page
    try {
        for (let x = eventData.lastRound + 1; x <= roundNum; x++) {
            const respone = await axios.get(`${url}/results/${x}/`);
            const $ = cheerio.load(respone.data);
            const winners = [];

            $(".tournament-coverage__row--results").each((_, el) => {
                const result = $(el)
                    .find(".tournament-coverage__result")
                    .text()
                    .replace(/\s+/g, " ")
                    .trim();

                let section;
                if (result.includes("Player 1 Wins")) {
                    section = $(el).find(".tournament-coverage__p1");
                } else if (result.includes("Player 2 Wins")) {
                    section = $(el).find(".tournament-coverage__p2");
                } else if (result.includes("Draw") || result.includes("Double Loss")) {
                    section = "Draw";
                }

                if (section === "Draw") {
                    winners.push("Draw");
                } else if (section) {
                    const name = section
                        .find(".tournament-coverage__player-name-and-flag span")
                        .text()
                        .trim();
                    winners.push(name);
                } else {
                    winners.push(null);
                }
            });
            // Check X rounds. Update every until a round has not finished
            let roundComplete = true;
            for (let i = 0; i < winners.length; i++) {
                if (winners[i] === null) {
                    roundComplete = false;
                    break;
                }
            }

            if (!roundComplete) {
                if (eventData.lastRound !== x - 1) {
                    await saveData(playerDataFile, data);
                    eventData.lastRound = x - 1;
                    await saveData(eventDataFile, eventData);
                    return `❌ Round ${x} is not complete yet. Round ${
                        x - 1
                    } was updated.`;
                } else {
                    return `❌ Round ${x} is not complete yet. No new rounds updated.`;
                }
            }

            //  Update wins
            if (!data) data = await loadData(playerDataFile);
            for (let i = 0; i < winners.length; i++) {
                const player = data.find(
                    (entry) =>
                        entry.name?.toLowerCase() === winners[i].toLowerCase()
                );
                if (player) player.eventScore += 1;
            }
        }
        await saveData(playerDataFile, data);
        eventData.lastRound = roundNum;
        await saveData(eventDataFile, eventData);
        return `✅ Round ${roundNum} has been updated!`;
    } catch (e) {
        console.log(e);
        return `❌ An error occurred while updating round ${roundNum}. Check logs for details.`;
    }
}

module.exports = {
    getAndUpdateData,
};
