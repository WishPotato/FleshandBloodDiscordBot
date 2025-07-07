const fs = require("fs/promises");
const eventDataFile = "./data/currentevent.json";
let currentbaseEventData;
let eventPlayerData;
let eventPath;
let userEventData;
let userEventFLPath;

async function setEventData(){
    try {
        currentbaseEventData = await getCurrentEventData();
        const FLpath = await getEventFLPath();
        userEventFLPath = FLpath;
        userEventData = await loadData(FLpath);
        //console.log(`Current User Event Data is accessed from: ${FLpath}`);
    } catch (e) {
        console.log("Error loading JSON: ", e);
        return [];
    }
}

async function loadData(path) {
    try {
        //console.log("Attempting to read:", path);
        const raw = await fs.readFile(path, "utf-8");
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        console.log("Error loading JSON: ", e);
        return [];
    }
}

async function saveData(path, data) {
    try {
        await fs.writeFile(path, JSON.stringify(data, null, 2));
    } catch (err) {
        console.log("ERROR: " + err);
    }
}

async function ensureJsonExists(path) {
    try {
        await fs.access(path);
    } catch (err) {
        await fs.writeFile(path, "[]", "utf8");
        console.log("Created new FL event file");
    }
}

async function getCurrentEventData() {
    try {
        return await loadData(eventDataFile);
    } catch (err) {
        console.log("ERROR: " + err);
    }
}

async function getEventFLPath() {
    try {
        const event = await loadData(eventDataFile);
        const eventFLPath = `./data/events/FL-${event.eventName}.json`;
        eventPlayerData = await loadData(`./data/events/${event.eventName}.json`);
        if (eventPath === "") {
            await ensureJsonExists(eventFLPath);
        }
        eventPath = eventFLPath;
        return eventPath;
    } catch (err) {
        console.log("ERROR: " + err);
        return false;
    }
}

function getEventDataPath(){
    return eventDataFile;
}

function getUserEventFLPath(){
    return userEventFLPath;
}

function getUserEventData(){
    return userEventData;
}

function getEventPlayerData(){
    return eventPlayerData;
}

module.exports = {
    loadData,
    saveData,
    ensureJsonExists,
    getEventFLPath,
    setEventData,
    getUserEventData,
    getUserEventFLPath,
    getCurrentEventData,
    getEventPlayerData,
    getEventDataPath,
};
