const { SlashCommandBuilder } = require("discord.js");
const { MessageFlags } = require("discord.js");
const playerData = require("../data/events/PT-Singapore2025.json");
const { getEventState } = require("../state/eventState");
const {
    getCurrentEventData,
    saveData,
    getUserEventData,
    getUserEventFLPath,
} = require("../data/dataFunctions/dataFunctions");

let profiles;

module.exports = {
    data: new SlashCommandBuilder()
        .setName("fl-team")
        .setDescription("General commands for Fantasy League")
        .addSubcommand((command) =>
            command
                .setName("showteam")
                .setDescription("Display your full roster and chosen champion")
        )
        .addSubcommand((command) =>
            command.setName("reset").setDescription("Reset your roster")
        ),

    async execute(interaction, profileData) {
        const eventFLPath = getUserEventFLPath();
        const subcommand = interaction.options.getSubcommand();
        if (subcommand === "") return;
        const currentEventData = await getCurrentEventData();
        profiles = getUserEventData();

        if (!profileData) {
            const newPlayer = {
                id: interaction.user.id,
                name: interaction.user.tag,
                fantasyPoints: currentEventData.points,
                fantasyChampion: "",
                fantasyTeam: [],
            };
            profiles.push(newPlayer);
            await saveData(eventFLPath, profiles);
            console.log(`Player added: \n`, JSON.stringify(newPlayer, null, 2));
        }
        const userProfile = profiles.find((p) => (p.id = interaction.user.id));
        const team = userProfile.fantasyTeam;
        // SHOW TEAM
        if (subcommand === "showteam") {
            console.log(`${interaction.user.tag}: Show Team`);

            if (!team || team.length === 0) {
                if (userProfile.fantasyChampion === "") {
                    return interaction.reply({
                        content: "Your fantasy team is currently empty.",
                        flags: MessageFlags.Ephemeral,
                    });
                }
            }

            let txt = "Your team is as follows:";
            if(team.length === 0) txt += `\n- TEAM IS EMPTY`;
            for (const player of team) {
                txt += `\n- ${player.name}`;
            }
            txt += `\nChampion: **${userProfile.fantasyChampion}**`;

            return interaction.reply({
                content: txt,
                flags: MessageFlags.Ephemeral,
            });
        }
        // RESET TEAM
        if (subcommand === "reset") {
            if (!getEventState()) {
                return interaction.reply({
                    content:
                        "🔒 Admin has closed the event. You cannot edit your team currently.",
                    ephemeral: true,
                });
            }

            for (const player of team) {
                userProfile.fantasyTeam = userProfile.fantasyTeam.filter(
                    (p) => p.name.toLowerCase() !== player.name.toLowerCase()
                );
            }
            userProfile.fantasyPoints = currentEventData.points;
            await saveData(eventFLPath, profiles);
            console.log(`${interaction.user.tag}: Reset Team`);

            return interaction.reply({
                content: `🫥 Your team has been reset and you now have ${
                    currentEventData.points
                } points to spend.`,
                flags: MessageFlags.Ephemeral,
            });
        }
    },
};
