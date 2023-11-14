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
                // Profile exists
                await interaction.reply({ content: 'You already have a profile!', ephemeral: true })
            } else {
                // Create new profile
                const newModel = new Model({
                    userId: interaction.user.id,
                    guildId: interaction.guild.id,
                    username: interaction.user.username,
                    ELO: 0,
                    Rank: 'F',
                    Kills: 0,
                    Deaths: 0,
                    Wins: 0,
                    Loses: 0,
                    KDR: 0,
                    MVP: 0,
                })
                await newModel.save()

                const currentTime = new Date()
                
                await interaction.reply({ content: `${interaction.user.username} has joined matchmaking at ${currentTime}.` })
            }

        } catch (error) {
            console.log(`Error creating profile: ${error}`)
            await interaction.reply(`Error creating profile. ${error}`)
        }

    },
}