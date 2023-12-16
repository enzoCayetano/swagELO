const { Schema, model } = require('mongoose')

const gameModeSchema = new Schema({
  Kills: {
    type: Number,
    default: 0,
    required: true,
  },
  Deaths: {
    type: Number,
    default: 0,
    required: true,
  },
  Wins: {
    type: Number,
    default: 0,
    required: true,
  },
  Losses: {
    type: Number,
    default: 0,
    required: true,
  },
  KDR: {
    type: Number,
    default: 0,
    required: true,
  },
  MVP: {
    type: Number,
    default: 0,
    required: true,
  },
  LastMatch: {
    type: String,
    default: "+0",
  },
})

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
    default: 0,
    required: true,
  },
  Rank: {
    type: String,
    required: true,
  },
  Squad: {
    type: String,
    default: "None",
  },
  NeedsUpdate: {
    type: Boolean,
    default: false,
  },
  Unranked: {
    type: gameModeSchema,
    default: {},
  },
  Ranked: {
    type: gameModeSchema,
    default: {},
  },
})

module.exports = model('Data', dataSchema)
