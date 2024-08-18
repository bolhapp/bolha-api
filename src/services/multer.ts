import { join } from "path";
import multer from "@koa/multer";
import { extension } from "mime-types";

import { ValidationError } from "@/exceptions";
import { UNSUPPORTED_FORMAT } from "@/errors/index.errors";
import { genToken } from "@/utils";

const ALLOWED_EXTENSIONS = ["jpg", "png", "webp", "jpeg"];

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, "tmp/"),

  // we're sure extesion will be string because it gets validated in the fileFilter
  filename: (_, __, cb) => cb(null, genToken(24)),
});

export default multer({
  storage,
  fileFilter: (_, file, cb) => {
    const ext = extension(file.mimetype);

    if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
      throw new ValidationError(UNSUPPORTED_FORMAT);
    }

    cb(null, true);
  },
  limits: {
    /** Max number of non- file fields (Default: Infinity) */
    fields: 10,
    /** For multipart forms, the max file size (in bytes)(Default: Infinity) */
    fileSize: 2000000,
    /** For multipart forms, the max number of file fields (Default: Infinity) */
    files: 10,
    /** For multipart forms, the max number of parts (fields + files)(Default: Infinity) */
    parts: 20,
  },
});
