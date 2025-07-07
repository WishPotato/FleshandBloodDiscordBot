const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const playerData = require("../data/events/PT-Singapore2025.json");
const heroData = require("../data/ccHeroes.json");
const { getEventState } = require("../state/eventState");
const {
    saveData,
    getUserEventData,
    getUserEventFLPath,
} = require("../data/dataFunctions/dataFunctions");

const maxTeamSize = 5;
const previewSlice = 20;

let eventFLPath;
let profiles;

module.exports = {
    data: new SlashCommandBuilder()
        .setName("fl")
        .setDescription("Start Fantasy League")
        .addStringOption((option) =>
            option
                .setName("buy")
                .setDescription("Search if you can't find the player")
                .setAutocomplete(true)
        )
        .addStringOption((option) =>
            option
                .setName("sell")
                .setDescription("Remove a player from your team")
                .setAutocomplete(true)
        )
        .addStringOption((option) =>
            option
                .setName("champion")
                .setDescription("Select your Champion")
                .setAutocomplete(true)
        ),
    async autocomplete(interaction, profileData) {
        const focusedOption = interaction.options.getFocused(true);
        eventFLPath = getUserEventFLPath();
        profiles = getUserEventData();
    
        const profile = profiles.find(p => p.id === interaction.user.id);
        const team = profile.fantasyTeam;
        // BUY
        if (focusedOption.name === "buy") {
            const focusedBuyOption = interaction.options.getFocused();
            let choices = [];

            const currentTeam = team?.map((player) => player.name) || [];

            playerData.forEach((player) => {
                if (!currentTeam.includes(player.name)) {
                    choices.push(`${player.name} - ${player.points} points`);
                }
            });

            const filtered = choices.filter((player) =>
                player.toLowerCase().startsWith(focusedBuyOption.toLowerCase())
            );

            const results = filtered.slice(0, previewSlice).map((choice) => ({
                name: choice,
                value: choice,
            }));

            await interaction.respond(results);
        } // SELL 
        else if (focusedOption.name === "sell") {
            const focusedRemoveOption = interaction.options.getFocused();

            const choices =
                team?.map(
                    (player) => `${player.name} - ${player.cost} points`
                ) || [];

            const filtered = choices.filter((player) =>
                player
                    .toLowerCase()
                    .startsWith(focusedRemoveOption.toLowerCase())
            );

            const results = filtered.map((choice) => ({
                name: choice,
                value: choice,
            }));

            await interaction.respond(results);
        } // CHAMPION 
        else if(focusedOption.name === "champion"){
            const focusedChamptionOption = interaction.options.getFocused();
            let choices = [];
            heroData.forEach((hero) => {
                if (profile.fantasyChampion != hero) {
                    choices.push(hero);
                }
            });
            
            const choice = choices.filter((champion) => champion.toLowerCase().startsWith(focusedChamptionOption.toLowerCase()));
            const result = choice.slice(0, previewSlice).map((choice) => ({
                name: choice,
                value: choice,
            }));
            await interaction.respond(result);
        }
    },
    async execute(interaction, profileData) {
        if (!getEventState()) {
            return interaction.reply({
                content:
                    "🔒 Admin has **LOCKED** the event. Team editing has been disabled.",
                flags: MessageFlags.Ephemeral,
            });
        }
        const playerProfile = profiles.find((p) => (p.id = profileData.id));

        const inputSell = interaction.options.getString("sell");
        const inputBuy = interaction.options.getString("buy");
        const inputChampion = interaction.options.getString("champion");
        const input = inputSell || inputBuy || inputChampion;
        let action;
        let option;

        if (!input) {
            return interaction.reply({
                content:
                    "❌ Specify a player to buy or sell... or the champion to select.",
                flags: MessageFlags.Ephemeral,
            });
        }
        // SELL OR BUY
        if (inputSell || inputBuy) {
            const match = input.match(/(.+?) - (\d+) points/);
            if (!match) {
                return interaction.reply({
                    content: "❌ Invalid. Use autocomplete to select player.",
                    flags: MessageFlags.Ephemeral,
                });
            }
            option = match[1].trim();
            const _cost = parseInt(match[2]);
            const fantasyPoints = profileData.fantasyPoints;
            const remainingPoints = inputSell
                ? fantasyPoints + _cost
                : fantasyPoints - _cost;
            // BUY
            if (inputBuy) {
                const currentTeamSize = playerProfile.fantasyTeam.length;

                if (currentTeamSize >= maxTeamSize) {
                    return interaction.reply({
                        content: `You can't buy any more players, as your team is full.`,
                        flags: MessageFlags.Ephemeral,
                    });
                }

                if (remainingPoints < 0) {
                    return interaction.reply({
                        content: `You can't buy ${option} as you only have ${fantasyPoints} points left.`,
                        flags: MessageFlags.Ephemeral,
                    });
                }

                const playerChoice = {
                    name: option,
                    cost: _cost,
                };
                playerProfile.fantasyTeam.push(playerChoice);
                await saveData(eventFLPath, profiles);
            }

            // SELL
            if (inputSell) {
                playerProfile.fantasyTeam = playerProfile.fantasyTeam.filter(
                    (p) => p.name.toLowerCase() !== option.toLowerCase()
                );
            }
            // Update points
            playerProfile.fantasyPoints = remainingPoints;
            await saveData(eventFLPath, profiles);

            action = inputBuy ? "bought" : "sold";

            await interaction.reply({
                content: `You ${action} ${option} and have ${remainingPoints} points left.`,
                flags: MessageFlags.Ephemeral,
            });
        }
        // CHAMPION
        else if (inputChampion) {
            option = input;
            action = `selected`;
            playerProfile.fantasyChampion = input;
            await saveData(eventFLPath, profiles);
            await interaction.reply({
                content: `You ${action} ${option} as your champion!`,
                flags: MessageFlags.Ephemeral,
            });
        }
        console.log(`${interaction.user.tag}: ${action} ${option}`);
    },
};
