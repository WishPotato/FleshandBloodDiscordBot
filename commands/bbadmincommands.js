const { SlashCommandBuilder } = require("discord.js");
const { ADMIN_ID: admin } = process.env;
const { getEventState, setEventState } = require("../state/eventState");
const {
    loadData,
    saveData,
    getEventFLPath,
    getUserEventData,
    getCurrentEventData,
    getEventPlayerData,
} = require("../data/dataFunctions/dataFunctions");

championPoints = 5;

module.exports = {
    data: new SlashCommandBuilder()
        .setName("bb-admin")
        .setDescription("Fantasy League Admin Commands")
        .addSubcommand((command) =>
            command
                .setName("lock")
                .setDescription(
                    "Lock event - Players cannot edit teams anylonger"
                )
        )
        .addSubcommand((command) =>
            command
                .setName("unlock")
                .setDescription("Unlock event - Players may edit teams again")
        )
        .addSubcommand((command) =>
            command
                .setName("showleaderboard")
                .setDescription("Show current FL Leaderboard")
        ),
    async execute(interaction, profileData) {
        if (!interaction.options.getSubcommand()) return;

        const requiredRoleID = admin;
        // Checks Role ID
        if (!interaction.member.roles.cache.has(requiredRoleID)) {
            return interaction.reply({
                content: "You do not have permission to use this command.",
                ephemeral: true,
            });
        }

        // Lock Event
        if (interaction.options.getSubcommand() === "lock") {
            setEventState(false);
            return interaction.reply({
                content: "🔒 Fantasy League has been **LOCKED**!",
            });
        }
        // Unlock Event
        else if (interaction.options.getSubcommand() === "unlock") {
            setEventState(true);
            return interaction.reply({
                content: "🔑🔓 Fantasy League has been **Unlocked**!",
            });
        }
        // STILL WORKING ON SHOWING LEADERBOARD!
        else if (interaction.options.getSubcommand() === "showleaderboard") {
            try {
                let leaderboard = [];
                const users = getUserEventData();
                const players = getEventPlayerData();
                const champ = await getCurrentEventData();
                for (let j = 0; j < users.length; j++) {
                    let teamPoints = 0;
                    if (users[j].fantasyChampion === champ.champion) teamPoints += championPoints;
                    for (let i = 0; i < users[j].fantasyTeam.length; i++) {
                        const player = players.find(
                            (p) =>
                                p.name.toLowerCase() ===
                                users[j].fantasyTeam[i].name.toLowerCase()
                        );
                        teamPoints += player.eventScore;
                    }
                    let user = {
                        id: users[j].id,
                        points: teamPoints,
                    };
                    leaderboard.push(user);
                    sortLeaderboard(leaderboard);
                }
                let txt = "The Leaderboard is as following:";
                for (let i = 0; i < leaderboard.length; i++) {
                    txt += `\n${i}. <@${leaderboard[i].id}> - ${leaderboard[i].points}`;
                }
                console.log(
                    "Leaderboard has been published by " + interaction.user.tag
                );
                return interaction.reply(txt);
            } catch (err) {
                console.log(err);
            }
        }
    },
};

function sortLeaderboard(array) {
    for (let i = 0; i < array.length - 1; i++) {
        let swapped = false;
        for (let j = 0; j < array.length - 1; j++) {
            if (array[j].points < array[j + 1].points) {
                let holder = array[j];
                array[j] = array[j + 1];
                array[j + 1] = holder;
                swapped = true;
            }
        }
        if (!swapped) break;
    }
}
