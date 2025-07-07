const cheerio = require("cheerio");
const axios = require("axios");
const { saveData } = require("./dataFunctions/dataFunctions");
const url = "https://fabtcg.com/en/resources/rules-and-policy-center/living-legend/";
const heroDataFile = "./data/ccHeroes.json";

async function getHeroData() {
    try {
        const respone = await axios.get(url);
        const $ = cheerio.load(respone.data);
        $("table caption").each((i, el) => {`Caption ${i}: "${$(el).text().trim()}"`;});
        const cap = $("table caption")
            .filter((i, el) =>
                $(el)
                    .text()
                    .trim()
                    .includes("Classic Constructed Living Legend Leaderboard")
            )
            .first();
        if (!cap.length) throw new Error("Caption not found");
        const table = cap.closest("table");
        const heroes = [];
        table.find("tbody tr").each((_, tr) => {
            const cells = $(tr).find("td");
            const hero = $(cells[1]).text().trim();
            heroes.push(hero);
        });
        await saveData(heroDataFile, heroes);
        console.log(`${heroDataFile} has been updated`);
    } catch (err) {
        console.log(err);
    }
}

getHeroData();
