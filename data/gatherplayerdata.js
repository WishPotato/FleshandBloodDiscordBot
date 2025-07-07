const cheerio = require("cheerio");
const axios = require("axios");
const fs = require("fs").promises;
const { loadData, saveData} = require('./dataFunctions/dataFunctions');

const eventDataFile = "./data/currentevent.json";
const maxPageRead = 6;

// Sort Data into the json specifically for FABTCG.COM Leaderboards
function SortDataFromFABTCG(data) {
    data = data.replaceAll("Dr.", "Dr~");
    return data
        .replaceAll(" ", "")
        .replaceAll("\n", ".")
        .replaceAll("..", ".")
        .replaceAll("\"", "")
        .slice(1, -1);
}

function isUpperCase(str) {
    return str !== str.toLowerCase() && str === str.toUpperCase();
}


function splitUpString(str) {
    let newString = "";
    for (let i = 0; i < str.length; i++) {
        const char = str.charAt(i);
        const prevChar = str.charAt(i - 1);
        if (i > 0 && isUpperCase(char) && prevChar !== " " && !isUpperCase(prevChar)) {
            newString += " ";
        }
        newString += char;
    }

    return newString;
}

function ratingToPoint(val) {
    if (val >= 1950) return 110;
    else if (val >= 1900) return 100;
    else if (val >= 1850) return 90;
    else if (val >= 1800) return 80;
    else if (val >= 1750) return 70;
    else if (val >= 1700) return 60;
    else if (val >= 1650) return 50;
    else if (val >= 1600) return 40;
    else if (val >= 1550) return 30;
    else if (val >= 1525) return 20;
    else return 10;
}

async function getData() {
    const eventData = await loadData(eventDataFile);
    try {
        if(eventData === null) return;

        let dataArray = [];
        let pageCount = eventData.internationalEvent ? maxPageRead : 1;
        for (let i = 1; i < pageCount + 1; i++) {
            let respone = await axios.get(eventData.leaderboard + i);
            let $ = cheerio.load(respone.data);
            let data = $("td").text();
            let splitData = SortDataFromFABTCG(data).split(".");
            dataArray.push(...splitData);
        }
        dataArray = dataArray.flatMap(item => item.split(",").map(s => s.trim()));
        fs.writeFile(
            `data/events/${eventData.eventName}.json`,
            JSON.stringify(JSON.parse(ConvertArrayToJSON(dataArray)), null, 2),"utf8",
            (err) => {
                if (err) {
                    console.error("Error writing to file", err);
                } else {
                    console.log("Data written to file");
                }
            }
        );
        
    } catch (e) {
        console.log(e);
    }
}

function ConvertArrayToJSON(array) {
  let result = [];
  let cnt = 0;
  let currentEntry = {};

  for (let i = 0; i < array.length; i++) {
    switch (cnt) {
      case 0:
        currentEntry.rank = parseInt(array[i]);
        currentEntry.eventScore = 0;
        cnt++;
        break;
      case 1:
        let str = array[i].trim();
        str = str.replaceAll("~", ".");
        let withoutNationality = str.slice(2).trim();
        let index = withoutNationality.indexOf('(');
        if (index === -1) index = withoutNationality.length;
        let namePart = withoutNationality.slice(0, index).trim();
        currentEntry.name = splitUpString(namePart);
        cnt++;
        break;
      case 2:
        currentEntry.rating = parseFloat(array[i]) || 0;
        currentEntry.points = ratingToPoint(currentEntry.rating) || 0;
        result.push(currentEntry);
        currentEntry = {};
        cnt = 0;
        break;
    }
  }

  return JSON.stringify(result, null, 2);
}

getData();
