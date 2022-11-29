import mongoose, { Types } from 'mongoose';

interface Note {
  note: string;
  owner_id: Types.ObjectId;
}

const noteModel = new mongoose.Schema<Note>(
  {
    note: { type: String, required: true },
    owner_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);


const Note = mongoose.model<Note>('Note', noteModel);

export default Note;
