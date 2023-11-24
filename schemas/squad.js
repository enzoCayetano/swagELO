const { Schema, model } = require('mongoose')

const memberSchema = new Schema ({
  userId: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  }
})

const squadSchema = new Schema ({
  name: {
    type: String,
    required: true,
  },
  tag: {
    type: String,
    required: true,
    maxLength: 4,
  },
  description: {
    type: String,
  },
  owner: {
    type: String,
    required: true,
  },
  overallELO: {
    type: Number,
  },
  ranking: {
    type: Number,
  },
  members: {
    type: [memberSchema],
    default: [],
  }
})

module.exports = model('Squad', squadSchema)