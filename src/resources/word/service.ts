import { IWord, WordModel } from './Word';
// import { getByName } from '../category/service';
import IWordDTO from './IWordDTO';
import { CategoryModel } from '../category/Category';

import { v2 as cloudinary } from 'cloudinary';

// async function getAllByCategory(category: string): Promise<IWord[]> {
//   const categoryDocument = await getByName(category).populate('words');
//   console.log('found cat', categoryDocument, categoryDocument.words);
//   const words = categoryDocument.words; //await WordModel.find({ category: categoryDocument });
//   return words;
// }

async function getByWord(word: string): Promise<IWord | null> {
  return WordModel.findOne({ word });
}

async function update(
  word: string,
  { word: newWord, translation, audioSrc, image }: IWordDTO
): Promise<IWord> {
  const wordModel = await WordModel.findOne({ word });
  console.log('service update', wordModel, word, newWord);
  try {
    if (wordModel.image) {
      const imageId = wordModel.image.split('/').slice(-1)[0].slice(0, -4);
      cloudinary.uploader.destroy(imageId);
    }
    const audioId = wordModel.audioSrc.split('/').slice(-1)[0].slice(0, -4);
    cloudinary.uploader.destroy(audioId, {
      resource_type: 'video',
    });
  } catch (err) {
    console.log('Error while updating word: ', err);
  }
  Object.assign(wordModel, { word: newWord, translation, audioSrc, image });
  await wordModel.save();
  return wordModel;
}

async function deleteWord(word: string): Promise<IWord> {
  const wordModel = await WordModel.findOne({ word });
  try {
    if (wordModel.image) {
      const imageId = wordModel.image.split('/').slice(-1)[0].slice(0, -4);
      cloudinary.uploader.destroy(imageId);
    }
    const audioId = wordModel.audioSrc.split('/').slice(-1)[0].slice(0, -4);
    cloudinary.uploader.destroy(audioId, {
      resource_type: 'video',
    });
    return WordModel.deleteOne({ word });
  } catch (err) {
    console.log('Error while deleting word: ', err);
  }
  return wordModel;
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

export { getByWord, update, deleteWord, add };
