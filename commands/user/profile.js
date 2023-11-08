const { SlashCommandBuilder } = require('discord.js')
const category = __dirname.split('/').pop()

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Check your current profile.'),
    category,
    async execute(interaction) {
        // Created embed
        const embedProfile = {
            title: 'Your Profile',
            description: 'This is my profile.',
            color: 0x00f00, // Color
            fields: [
                {
                    name: 'Username',
                    value: interaction.user.username,
                },
                {
                    name: 'User ID',
                    value: interaction.user.id,
                },
            ],
        }

        await interaction.reply({ embeds: [embedProfile] })
    },
}