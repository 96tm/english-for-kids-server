import { promises as fs } from 'fs';

import { v2 as cloudinary } from 'cloudinary';

const VALID_STRING = /^[a-zA-Z0-9 ()-_]+$/;

const ACCEPTABLE_CHARACTERS = 'latin letters, digits, (,),-,_ and spaces';

const MONGO_DUPLICATION_ERROR_CODE = 11000;

function isValidNumber(number: number): boolean {
  return 0 <= number && number <= Number.MAX_SAFE_INTEGER;
}

function checkStrings(...strings: string[]): boolean {
  return strings.every((currentString) => VALID_STRING.test(currentString));
}

async function uploadFile(
  path: string,
  publicId: string,
  resourceType = 'image'
): Promise<void> {
  cloudinary.uploader
    .upload(path, {
      public_id: publicId,
      resource_type: resourceType,
      overwrite: true,
      invalidate: true,
    })
    .then(() => {
      fs.unlink(path);
    })
    .catch((err) => {
      console.error(`Error during file upload: ${err}`);
    });
}

export {
  isValidNumber,
  checkStrings,
  uploadFile,
  VALID_STRING,
  MONGO_DUPLICATION_ERROR_CODE,
  ACCEPTABLE_CHARACTERS,
};
