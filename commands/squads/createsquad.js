const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js')
const category = __dirname.split('/').pop()
const UserModel = require('../../schemas/user.js')
const SquadModel = require('../../schemas/squad.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('createsquad')
    .setDescription('Create a squad.'),
  category,
  async execute(interaction) {
    const query = {
      userId: interaction.user.id,
      guildId: interaction.guild.id,
    }

    const userData = await UserModel.findOne(query)

    if (!userData) return interaction.reply('You do not have an existing profile! Create one first to create a squad!')
    if (userData.ELO < 200) return interaction.reply('You do not meet the requirements to create a squad. REQUIRED: 200 ELO')

    const modal = new ModalBuilder()
      .setCustomId('create_squad')
      .setTitle('Create Squad')

    const nameInput = new TextInputBuilder()
      .setCustomId('setSquadName')
      .setLabel('Name your squad...')
      .setStyle(TextInputStyle.Short)
      .setMaxLength(20)

    const tagInput = new TextInputBuilder()
      .setCustomId('setSquadTag')
      .setLabel('Set squad tag [4 CHARS]')
      .setStyle(TextInputStyle.Short)
      .setMaxLength(4)

    const descInput = new TextInputBuilder()
      .setCustomId('setSquadDesc')
      .setLabel('Set a description...')
      .setStyle(TextInputStyle.Paragraph)
      .setMaxLength(100)

    const firstRow = new ActionRowBuilder().addComponents(nameInput)
    const secondRow = new ActionRowBuilder().addComponents(tagInput)
    const thirdRow = new ActionRowBuilder().addComponents(descInput)

    modal.addComponents(firstRow, secondRow, thirdRow)

    await interaction.showModal(modal)

    const filter = (interaction) => interaction.customId === 'create_squad'
    interaction
      .awaitModalSubmit({ filter, time: 60000 })
      .then((modalInteraction) => {
        const squadName = modalInteraction.fields.getTextInputValue('setSquadName')
        const squadTag = modalInteraction.fields.getTextInputValue('setSquadTag')
        const squadDesc = modalInteraction.fields.getTextInputValue('setSquadDesc')
        const newSquad = new SquadModel({
          name: squadName,
          tag: squadTag,
          description: squadDesc,
          owner: userData.userId,
          overallELO: 0,
          ranking: 0,
          members: [
            {
              userId: userData.userId,
              username: userData.username,
            }
          ],
        })

        userData.Squad = newSquad.name

        newSquad.save()
        userData.save()

        modalInteraction.reply(`New Squad: ${squadName} created successfully!`)
      })
      .catch((err) => { 
        console.log(`Error: ${err}`)
      })
  }
}