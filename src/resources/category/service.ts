import { ICategory, CategoryModel } from './Category';
import { IWord, WordModel } from '../word/Word';
import { deleteWord } from '../word/service';
import IWordDTO from '../word/IWordDTO';

async function getAll(): Promise<ICategory[]> {
  const categories = await CategoryModel.find({}).populate('words');
  const result = categories.map(
    (categoryDTO: { name: string; words: string[] }) => {
      return {
        name: categoryDTO.name,
        numberOfWords: categoryDTO.words.length,
      };
    }
  );
  return result;
}

async function getByName(name: string): Promise<ICategory | null> {
  return CategoryModel.findOne({ name });
}

async function getWords(name: string): Promise<IWord[]> {
  const category = await CategoryModel.findOne({ name }).populate('words');
  return WordModel.find({ category: category._id });
}

async function update(name: string, newName: string): Promise<ICategory> {
  return CategoryModel.findOneAndUpdate({ name }, { name: newName });
}

async function deleteCategory(name: string): Promise<ICategory> {
  const category = await CategoryModel.findOne({ name }).populate('words');
  (category.words as IWordDTO[]).forEach((word) => {
    deleteWord(word.word);
  });
  return CategoryModel.deleteOne({ name });
}

async function add(name: string): Promise<ICategory> {
  const category = new CategoryModel({ name });
  await category.save();
  return category;
}

export { getAll, getWords, getByName, update, deleteCategory, add };
