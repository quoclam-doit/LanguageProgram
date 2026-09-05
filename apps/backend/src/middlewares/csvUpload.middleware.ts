import multer from 'multer';

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

export const csvUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    const isCsv = file.mimetype === 'text/csv' || file.originalname.toLowerCase().endsWith('.csv');
    if (!isCsv) {
      const err: any = new Error('Chỉ chấp nhận file .csv');
      err.status = 400;
      cb(err);
      return;
    }
    cb(null, true);
  },
});
