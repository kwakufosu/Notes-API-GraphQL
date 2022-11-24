const mongoose = require('mongoose');

const Note = mongoose.model('Note', {
  note: {
    type: String,
    required: true,
  },
  owner_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});
module.exports = Note;
