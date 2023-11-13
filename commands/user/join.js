const { SlashCommandBuilder } = require('discord.js')
const Model = require('../../schemas/data.js')
const category = __dirname.split('/').pop()

module.exports = {
    cooldown: 15,
    data: new SlashCommandBuilder()
        .setName('join')
        .setDescription('Create a new profile!'),
    category,
    async execute(interaction) {
        // Look if profile exists
        const query = {
            userId: interaction.user.id,
            guildId: interaction.guild.id,
        }

        try {
            const model = await Model.findOne(query)
            
            if (model) {
                await interaction.reply({ content: 'You already have a profile!', ephemeral: true })
            } else {
                const newModel = new Model({
                    userId: interaction.user.id,
                    guildId: interaction.guild.id,
                    username: interaction.user.username,
                    ELO: 0,
                    Rank: 'F',
                    Kills: 0,
                    Deaths: 0,
                    KDR: 0,
                    MVP: 0,
                })
                await newModel.save()

                const currentTime = new Date()
                
                await interaction.reply({ content: `${interaction.user.username} has created joined matchmaking at ${currentTime}.` })
            }

        } catch (error) {
            console.log(`Error creating profile: ${error}`)
            await interaction.reply(`Error creating profile. ${error}`)
        }

    },
}