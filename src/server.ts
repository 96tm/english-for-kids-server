import app from './app';

import { PORT } from './config';

import { UserModel } from './resources/user/User';
import { CategoryModel } from './resources/category/Category';
import { WordModel } from './resources/word/Word';

(async () => {
  await CategoryModel.remove({});
  await UserModel.remove({});
  await WordModel.remove({});
})();

app.listen(PORT, () =>
  console.log(`App is running on http://localhost:${PORT}`)
);
