import { IWord } from '../word/Word';
import { deleteWord } from '../word/service';
import IWordDTO from '../word/IWordDTO';

import ICategoryDTO from './ICategoryDTO';
import { ICategory, CategoryModel } from './Category';

async function getCategories(page = 1, limit = 0): Promise<ICategoryDTO[]> {
  const categories: ICategory[] = await CategoryModel.find({})
    .skip(page - 1)
    .limit(limit)
    .populate('words');
  const result = categories.map((category) => {
    const wordsLength = category.words.length;
    const randomWordImage = wordsLength
      ? category.words[Math.floor(Math.random() * wordsLength)].image
      : '';
    return {
      name: category.name,
      numberOfWords: category.words.length,
      randomWordImage,
    };
  });
  return result;
}

async function getByName(name: string): Promise<ICategory | null> {
  return CategoryModel.findOne({ name });
}

async function update(name: string, newName: string): Promise<ICategory> {
  return CategoryModel.findOneAndUpdate(
    { name },
    { name: newName },
    { returnOriginal: false }
  );
}

async function deleteCategory(name: string): Promise<ICategory> {
  const category = await CategoryModel.findOne({ name }).populate('words');
  const promises: Promise<IWord>[] = [];
  (category.words as IWordDTO[]).forEach((word) => {
    promises.push(deleteWord(name, word.word));
  });
  await Promise.all(promises);
  await CategoryModel.deleteOne({ name });
  return category;
}

async function add(name: string): Promise<ICategory> {
  const category = new CategoryModel({ name });
  await category.save();
  return category;
}

export { getCategories, getByName, update, deleteCategory, add };
