import { Request } from "express";
import multer, { FileFilterCallback, StorageEngine } from "multer";

import { existsSync, mkdirSync } from "node:fs";
import { resolve, extname } from "node:path";
import { randomUUID } from "node:crypto";

import { BadRequestException } from "../../Utils/Response/Error.Response";

// ================= File Validation =================

export const fileValidation = {
  image: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  document: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  video: ["video/mp4", "video/quicktime"],
};

// ================= Upload Directory =================

export const uploadDir = resolve("./src/uploads");
// D:/assignment16/src/uploads

// ================= Types =================

interface ILocalFileUpload {
  validation?: string[];
  maxSizeMB?: number;
  folder?: string;
}

// Add finalPath to Multer File
declare global {
  namespace Express {
    namespace Multer {
      interface File {
        finalPath?: string;
      }
    }
  }
}
/**
 * file.originalname
file.mimetype
file.filename
file.path
file.size
file.finalPath


file.originalname // profile.png
file.mimetype     // image/png
 */
// ================= File Upload =================

export const localFileUpload = ({
  validation = fileValidation.image,
  maxSizeMB = 5,
  folder = "general",
}: ILocalFileUpload = {}) => {
  // Storage Configuration
  const storage: StorageEngine = multer.diskStorage({
    destination: (
      req: Request,
      file: Express.Multer.File,
      cb: (error: Error | null, destination: string) => void,
    ): void => {
      const destinationPath = resolve(uploadDir, folder);

      if (!existsSync(destinationPath)) {
        mkdirSync(destinationPath, { recursive: true });
      }

      cb(null, destinationPath);
    },

    filename: (
      req: Request,
      file: Express.Multer.File,
      cb: (error: Error | null, filename: string) => void,
    ): void => {
      const extension = extname(file.originalname).toLowerCase();
      // Pacture1.PNG => .png
      const uniqueFileName = `${randomUUID()}${extension}`;
      //550e8400-e29b-41d4-a716-446655440000.png

      file.finalPath = `/uploads/${folder}/${uniqueFileName}`;
      // /uploads/general/550e8400-e29b-41d4-a716-446655440000.png

      cb(null, uniqueFileName);
    },
  });

  // File Filter
  const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback,
  ): void => {
    if (!validation.includes(file.mimetype)) {
      return cb(
        new BadRequestException(`Invalid file format: ${file.mimetype}`),
      );
    }

    cb(null, true);
  };

  // Return Multer Middleware
  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: maxSizeMB * 1024 * 1024,
    },
  });
};

/**
 * 
Request	Type للـ HTTP Request من Express
multer	استقبال ورفع الملفات
FileFilterCallback	Type للـ Callback المسؤول عن قبول أو رفض الملف
StorageEngine	Type لنظام تخزين الملفات
existsSync	التأكد إن Folder موجود
mkdirSync	إنشاء Folder جديد
resolve	تكوين Absolute Path
extname	استخراج امتداد الملف
randomUUID	إنشاء Unique ID
 */
