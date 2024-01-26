import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { extname } from 'path';

export const multerConfig = (newDirectory?: string): MulterOptions => ({
  storage: diskStorage({
    destination: (req, file, callback) => {
      const defaultPath = './public/uploads';
      const dir = newDirectory ? `${defaultPath}/${newDirectory}` : defaultPath;
      callback(null, dir);
    },
    filename: (req, file, callback) => {
      const name = file.originalname.split('.')[0];
      const extension = extname(file.originalname);
      const randomName = Array(32)
        .fill(null)
        .map(() => Math.round(Math.random() * 16).toString(16))
        .join('');
      callback(null, `${name}-${randomName}${extension}`);
    },
  }),
});
