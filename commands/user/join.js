const { SlashCommandBuilder } = require('discord.js')
const Model = require('../../schemas/data.js')
const category = __dirname.split('/').pop()

module.exports = {
    cooldown: 15,
    data: new SlashCommandBuilder()
        .setName('join')
        .setDescription('Join swagELO!'),
    category,
    async execute(interaction) {
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
                
                await interaction.reply({ content: 'Created profile!', ephemeral: true })
            }

        } catch (error) {
            console.log(`Error joining: ${error}`)
        }

    },
}