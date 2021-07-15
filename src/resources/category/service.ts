import { ICategory, CategoryModel } from './Category';

async function getAll(): Promise<ICategory[]> {
  const categories = await CategoryModel.find({}).populate('words');
  console.log('got cats', categories);
  const result = categories.map(
    (categoryDTO: { name: any; words: string[] }) => {
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

async function update(name: string, newName: string): Promise<ICategory> {
  return CategoryModel.findOneAndUpdate({ name }, { name: newName });
}

async function deleteCategory(name: string): Promise<ICategory> {
  return CategoryModel.findOneAndRemove({ name });
}

async function add(name: string): Promise<ICategory> {
  const category = new CategoryModel({ name });
  await category.save();
  return category;
}

export { getAll, getByName, update, deleteCategory, add };
