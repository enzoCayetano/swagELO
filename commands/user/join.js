const { SlashCommandBuilder } = require('discord.js')
const category = __dirname.split('/').pop()

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('join')
        .setDescription('Creates a profile for you and joins swagELO.'),
    category,
    async execute(interaction) {
        const profileEmbed = {
            title: 'Profile',
                description: 'This is your profile.',
            color: 0x00ff00,
            fields: [
                {
                    name: 'Username',
                    value: interaction.user.username,
                },
                {
                    name: 'User ID',
                    value: interaction.user.id,
                },
            ]
        }

        await interaction.reply({ embeds: [profileEmbed] })
    },
}