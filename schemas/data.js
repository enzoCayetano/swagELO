const { Schema, model } = require('mongoose')

const dataSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  guildId: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  ELO: {
    type: Number,
    required: true,
  },
  Rank: {
    type: String,
    required: true,
  },
  Kills: {
    type: Number,
    required: true,
  },
  Deaths: {
    type: Number,
    required: true,
  },
  Wins: {
    type: Number,
    required: true,
  },
  Losses: {
    type: Number,
    required: true,
  },
  KDR: {
    type: Number,
    required: true,
  },
  MVP: {
    type: Number,
    required: true,
  },
})

module.exports = model('Data', dataSchema)
