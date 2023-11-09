const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const icon = 'https://s3.amazonaws.com/challonge_app/organizations/images/000/055/281/hdpi/ARCL_Logo_Square.png?1544117144'
const join = require('./join')
const category = __dirname.split('/').pop()

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Check your current profile.'),
    category,
    async execute(interaction) {
        const member = interaction.member
        const joinDate = member.joinedAt.toLocaleDateString()
        const nickname = member.nickname || interaction.user.username

        // Created embed builder
        const embedProfile = new EmbedBuilder()
            .setTitle(`${interaction.user.username}'s profile`)
            .setAuthor({ name: 'swagELO', iconURL: icon })
            .setColor(0x00f00)
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true, size: 1024 }))
            .addFields(
                { name: 'Name', value: nickname, inline: true },
                { name: '\u200b', value: '\u200b', inline: true }, // Invisible field for spacing
                { name: 'Join Date', value: joinDate, inline: true },
                { name: 'ELO', value: '287', inline: true },
                { name: '\u200b', value: '\u200b', inline: true }, // Invisible field for spacing
                { name: 'Rank', value: 'A+', inline: true }
            )
            .setTimestamp()

        await interaction.reply({ embeds: [embedProfile] })
    },
}