const { SlashCommandBuilder } = require("discord.js");
const { MessageFlags } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("roll")
        .setDescription("General commands for Fantasy League")
        ,
    async execute(interaction, profileData) {
        await interaction.reply({
                content: `<@${interaction.user.id}> rolled ${Math.floor(Math.random() * 100) + 1}`,
        });
    },
};
