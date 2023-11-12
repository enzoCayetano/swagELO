const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const global = require('../../globalvars.js')
// const join = require('./join')
const category = __dirname.split('/').pop()

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Check your current profile.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Which user would you like to view?')
                .setRequired(true)),
    category,
    async execute(interaction) {
        // Get user from userOption
        const targetUser = interaction.options.getUser('user')
        const targetUserId = targetUser.id

        // Fetch user data and put it into member
        const member = interaction.guild.members.cache.get(targetUserId)

        if (!member) return interaction.reply('User does not exist.')

        const joinDate = member.joinedAt.toLocaleDateString()
        const nickname = member.nickname || targetUser.username

        // Check if member has valid profile / has a valid role
        const requiredRole = member.roles.cache.find(role => role.name === global._REQUIREDROLE)

        if (!requiredRole)
            return interaction.reply('This user does not have a valid profile!')


        // Created embed builder
        const embedProfile = new EmbedBuilder()
            .setAuthor({ name: `${targetUser.username}`, iconURL: targetUser.displayAvatarURL({ dynamic: true, size: 256 }) })
            .setColor(0x00ff00)
            .addFields(
                { name: 'Name', value: nickname, inline: true },
                { name: '\u200b', value: '\u200b', inline: true }, // Invisible field for spacing
                { name: 'Join Date', value: joinDate, inline: true },
                { name: 'ELO', value: '287', inline: true },
                { name: '\u200b', value: '\u200b', inline: true }, // Invisible field for spacing
                { name: 'Rank', value: 'A+', inline: true },
                { name: 'Kills', value: '0', inline: true },
                { name: '\u200b', value: '\u200b', inline: true }, // Invisible field for spacing
                { name: 'Deaths', value: '0', inline: true },
                { name: 'KDR', value: '0', inline: true },
                { name: '\u200b', value: '\u200b', inline: true }, // Invisible field for spacing
                { name: 'MVP', value: '0', inline: true },
            )
            .setTimestamp()
            .setFooter({ 
                text: 'swagELO', 
                iconURL: 'https://s3.amazonaws.com/challonge_app/organizations/images/000/055/281/hdpi/ARCL_Logo_Square.png?1544117144'
            })

        await interaction.reply({ embeds: [embedProfile] })
    },
}