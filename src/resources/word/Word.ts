import mongoose from 'mongoose';

interface IWord {
  [key: string]: string;
  word: string;
  translation: string;
  audioSrc: string;
  image: string;
}

const wordSchema = new mongoose.Schema({
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  },
  word: { type: String, required: true, unique: true, maxlength: 50 },
  translation: { type: String, required: true, maxlength: 50 },
  audioSrc: { type: String, required: true, maxlength: 100 },
  image: { type: String, maxlength: 100 },
});

const WordModel = mongoose.model('Word', wordSchema);

export { WordModel, IWord };
