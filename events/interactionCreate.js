const { Events} = require("discord.js");
const { loadData, saveData, getCurrentEventData, getEventFLPath, getUserEventData, setEventData} = require('../data/dataFunctions/dataFunctions');
const eventDataFile = "./data/currentevent.json";
 
const allowedChannelIds = ['1369989427601870918'];
const adminCommands = ['enablefl', 'disablefl'];

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        // Get UserDB Info and pass to command
        let profileData;
        await setEventData();
        let eventInfo = await getCurrentEventData();
        try {
            const path = await getEventFLPath();
            profiles = getUserEventData();

            profileData = profiles?.find(p => p.id === interaction.user.id);
            if(!profileData) {
                const newPlayer = {
                    id: interaction.user.id, 
                    name: interaction.user.tag,
                    fantasyPoints: eventInfo.points,
                    fantasyChampion: "",
                    fantasyTeam: []
                };
                profiles.push(newPlayer);
                await saveData(path, profiles);
                //console.log(`Player added: \n`, JSON.stringify(newPlayer, null, 2));
                console.log("New Player added to " + path);
                await setEventData();
            }

        } catch (err) {
            console.log(err);
        }

        const cmdName = interaction.commandName;
        const restrictedCommands = ['buy', 'sell', 'showteam', 'reset', 'champion', 'showleaderboard'];

        if (interaction.isChatInputCommand()) {
            
            const command = interaction.client.commands.get(interaction.commandName);
            
            if (adminCommands.includes(cmdName)) {
                const member = interaction.member;
            
                if (!member.permissions.has('Administrator')) {
                    return interaction.reply({
                        content: 'ÔØî You do not have permission to use this command.',
                        ephemeral: true,
                    });
                }
            }

            if(restrictedCommands.includes(cmdName) && !allowedChannelIds.includes(interaction.channelId)) {
                return interaction.reply({
                    content: `ÔØî The \`${cmdName}\` command can only be used in <#${allowedChannelId}>.`,
                    ephemeral: true,
                });
            }

            if (!command) {
                console.error(
                    `No command matching ${interaction.commandName} was found.`
                );
                return;
            }

            try {
                await command.execute(interaction, profileData);
            } catch (error) {
                console.error(`Error executing ${interaction.commandName}`);
                console.error(error);
            }
        }
        else if(interaction.isAutocomplete()){
            const command = interaction.client.commands.get(interaction.commandName);

            if (restrictedCommands.includes(cmdName) && interaction.channelId !== allowedChannelId) {
                return interaction.reply({
                    content: `The \`${cmdName}\` command can only be used in <#${allowedChannelId}>.`,
                    ephemeral: true,
                });
            }

            if(!command) {
                console.error(`No [Auto Complete] command matching ${interaction.commandName} was found.`);
                return;
            }

            try {
                await command.autocomplete(interaction, profileData);
            } catch (err) {
                console.error(err);
            }
        }
    },
};
