const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js')
const category = __dirname.split('/').pop()
const UserModel = require('../../schemas/user.js')
const SquadModel = require('../../schemas/squad.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('invitesquad')
    .setDescription('Invite a person to the squad.')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to invite.')
        .setRequired(true)),
  category,
  async execute(interaction) {
    const query = {
      userId: interaction.user.id,
      guildId: interaction.guild.id,
    }

    const userData = await UserModel.findOne(query)

    if (!userData) return interaction.reply('You do not have an existing profile!')

    if (userData.Squad === 'None') return interaction.reply('You are not an existing member of a squad.')

    const squad = await SquadModel.findOne({ name: userData.Squad })

    if (squad && squad.owner !== userData.userId) return interaction.reply('You are not the owner of this squad.')

    const targetUser = interaction.options.getUser('user')

    const targetUserProfile = await UserModel.findOne({ userId: targetUser.id, guildId: interaction.guild.id })
    if (!targetUserProfile) return interaction.reply(`${targetUser.tag} does not have an existing profile!`)

    if (squad.members.some(member => member.userId === targetUser.id)) return interaction.reply('This user is already part of this squad.')

    const existingSquad = await SquadModel.findOne({ 'members.userId': targetUser.id })
    if (existingSquad) return interaction.reply(`This user is a current member of squad: ${existingSquad.name}`)

    const buttonRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('accept_invite')
        .setLabel('Accept')
        .setStyle(1),
      new ButtonBuilder()
        .setCustomId('decline_invite')
        .setLabel('Decline')
        .setStyle(2),
    )

    const targetUserMention = targetUser.toString()

    await interaction.reply({
      content: `${targetUserMention}, you have been invited to join ${squad.name}!`,
      components: [buttonRow]
    })

    const filter = (buttonInteraction) => {
      return  buttonInteraction.user.id === targetUser.id && (buttonInteraction.customId === 'accept_invite' || buttonInteraction.customId === 'decline_invite')
    }

    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: 60000,
    })

    collector.on('collect', async (buttonInteraction) => {
      buttonRow.components.forEach((component) => {
        component.setDisabled(true)
      })

      interaction.editReply({ components: [buttonRow] })

      if (buttonInteraction.customId === 'accept_invite') {
        await buttonInteraction.reply(`You have accepted the invitation! Welcome to **${squad.name}**`)
        
        try {
          squad.members.push({
            userId: targetUser.id,
            username: targetUser.username,
          })

          targetUserProfile.Squad = userData.Squad

          squad.save()
          targetUserProfile.save()
        } catch (error) {
          console.error('Error: ', error)
        }
      } else if (buttonInteraction.customId === 'decline_invite') {
        await buttonInteraction.reply('You have declined the invitation.')
      }

      collector.stop()
    })

    collector.on('end', () => {
      buttonRow.components.forEach((component) => {
        component.setDisabled(true)
      })

      interaction.editReply({ components: [buttonRow] })
    })
  }
}