import mongoose from 'mongoose';

import { IWord } from '../word/Word';

interface ICategory {
  name: string;
  words: IWord[];
}

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, maxlength: 50 },
  words: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Word',
    },
  ],
});
const CategoryModel = mongoose.model('Category', categorySchema);

export { CategoryModel, ICategory };
