const { SlashCommandBuilder } = require("discord.js");
const { MessageFlags } = require("discord.js");
const heroData = require("../data/ccHeroes.json");
const eventScoreUpdater = require("../data/eventScoreUpdater.js");
const { ADMIN_ID: admin } = process.env;
const { getEventState } = require("../state/eventState");
const {
    saveData,
    getCurrentEventData,
    getEventDataPath,
} = require("../data/dataFunctions/dataFunctions");

const previewSlice = 20;

module.exports = {
    data: new SlashCommandBuilder()
        .setName("bb-adminevent")
        .setDescription("Fantasy League Admin Commands")
        .addStringOption((option) =>
            option
                .setName("update")
                .setDescription("Look up standings after given round number")
        ).addStringOption((option) =>
            option
                .setName("champion")
                .setDescription("ONLY USE AFTER FINALES HAS CONCLUDED")
                .setAutocomplete(true)
        ),
    async autocomplete(interaction, profileData) {
        const focusedOption = interaction.options.getFocused(true);
        if(focusedOption.name === "champion"){
            const focusedChamptionOption = interaction.options.getFocused();
            let choices = [];
            heroData.forEach((hero) => {
                choices.push(hero);
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
        if(interaction.options.getString("champion")){
            const inputChampion = interaction.options.getString("champion");
            const eventInfo = await getCurrentEventData();
            eventInfo.champion = inputChampion;
            await saveData(getEventDataPath(), eventInfo);
            console.log(interaction.user.tag + " has updated the Champion: " + inputChampion);
            return interaction.reply({
                content: `${inputChampion} has been chosen as the Champion`,
                flags: MessageFlags.Ephemeral,
            });
        }
        if (!interaction.options.getString("update")) {
            return interaction.reply({
                content: "❌ Specify the Round number",
                flags: MessageFlags.Ephemeral,
            });
        }

        const updateInput = parseInt(interaction.options.getString("update"));

        if (!Number.isInteger(updateInput)) {
            return interaction.reply({
                content: "❌ Input MUST be a numeric value",
                flags: MessageFlags.Ephemeral,
            });
        }
        try {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });
            const result = await eventScoreUpdater.getAndUpdateData(updateInput);
            return interaction.editReply({
                content: String(result),
            });
        } catch (err) {
            console.error("Error updating event:", err);
            if (!interaction.replied) {
                await interaction.reply({
                    content: "❌ Something went wrong.",
                    flags: MessageFlags.Ephemeral,
                });
            } else {
                await interaction.editReply({
                    content: "❌ An error occurred during processing.",
                });
            }
        }
    },
};
