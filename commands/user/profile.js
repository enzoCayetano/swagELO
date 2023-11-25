const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const Model = require('../../schemas/user.js')
const SquadModel = require('../../schemas/squad.js');
const category = __dirname.split('/').pop()

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Check your current profile.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Which user would you like to view?')
                .setRequired(false)),
    category,
    async execute(interaction) {
        // Get user from userOption
        const targetUser = interaction.options.getUser('user') || interaction.user

        // Query for user in db
        const query = {
            userId: targetUser.id,
            guildId: interaction.guild.id,
        }
        try {
            const userData = await Model.findOne(query)
            
            if (!userData) return interaction.reply('This user does not have an existing profile!')
            
            const existingSquad = await SquadModel.findOne({ 'members.userId': targetUser.id })
            if (!existingSquad) {
                userData.Squad = 'None'
                userData.save()
            }
            
            const member = await interaction.guild.members.fetch({
                user: userData.userId,
                force: true,
            })
            const joinDate = member.joinedAt ? member.joinedAt.toLocaleDateString() : 'Member is not in the server.'

            // Created embed builder    
            const embedProfile = new EmbedBuilder()
            .setAuthor({ name: `${targetUser.username}`, iconURL: targetUser.displayAvatarURL({ dynamic: true, size: 256 }) })
            .setColor(0x8B0000)
            .addFields(
                { name: 'Name', value: userData.username, inline: true },
                { name: 'Join Date', value: joinDate, inline: true },
                { name: 'ELO', value: userData.ELO.toString(), inline: true },
                { name: 'Rank', value: userData.Rank, inline: true },
                { name: 'Kills', value: userData.Kills.toString(), inline: true },
                { name: 'Deaths', value: userData.Deaths.toString(), inline: true },
                { name: 'Wins', value: userData.Wins.toString(), inline: true },
                { name: 'Losses', value: userData.Losses.toString(), inline: true },
                { name: 'KDR', value: userData.KDR.toString(), inline: true },
                { name: 'MVP', value: userData.MVP.toString(), inline: true },
                { name: 'LM', value: userData.LastMatch, inline: true },
                { name: 'Squad', value: userData.Squad, inline: true },
            )
            .setTimestamp()
            .setFooter({ 
                text: 'ARMM', 
                iconURL: 'https://s3.amazonaws.com/challonge_app/organizations/images/000/055/281/hdpi/ARCL_Logo_Square.png?1544117144'
            })

            await interaction.reply({ embeds: [embedProfile] })
        } catch (error) {
            console.error('Error querying the database.', error)
            await interaction.reply('Error querying the database. Check the console for more details.')
        }
    },
}