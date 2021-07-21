import IWordDTO from './IWordDTO';
import { IWord, WordModel } from './Word';
import { CategoryModel } from '../category/Category';

async function update(
  word: string,
  { word: newWord, translation, audioSrc, image }: IWordDTO
): Promise<IWord> {
  const wordModel = await WordModel.findOne({ word });
  Object.assign(wordModel, {
    word: newWord,
    translation,
    audioSrc: audioSrc || wordModel.audioSrc,
    image: image || wordModel.image,
  });
  await wordModel.save();
  return wordModel;
}

async function deleteWord(category: string, word: string): Promise<IWord> {
  const categoryModel = await CategoryModel.findOne({
    name: category,
  }).populate('words');
  const wordModel = await WordModel.findOne({ word });
  try {
    categoryModel.words = (categoryModel.words as IWordDTO[]).filter(
      (currentWord) => currentWord.word !== word
    );
    return WordModel.deleteOne({ word });
  } catch (err) {
    console.error('Error while deleting word: ', err);
  }
  return wordModel;
}

async function getWords(name: string, page = 1, limit = 0): Promise<IWord[]> {
  const category = await CategoryModel.findOne({ name });
  return WordModel.find({ category: category._id })
    .skip(page - 1)
    .limit(limit);
}

async function add({
  category,
  word,
  translation,
  audioSrc,
  image,
}: IWordDTO): Promise<IWord> {
  const categoryModel = await CategoryModel.findOne({ name: category });
  const wordModel = new WordModel({
    category: categoryModel._id,
    word,
    translation,
    audioSrc,
    image,
  });
  await wordModel.save();
  categoryModel.words.push(wordModel);
  await categoryModel.save();
  return wordModel;
}

export { getWords, update, deleteWord, add };
