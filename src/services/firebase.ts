import { initializeApp } from "firebase/app";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import type { File } from "@koa/multer";
import sharp from "sharp";

import { ValidationError } from "@/exceptions";
import { UNAUTHORIZED_ERROR } from "@/errors/auth.errors";
import { UNEXPECTED_ERROR } from "@/errors/index.errors";

const app = initializeApp({
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "lfgapp-188e3.firebaseapp.com",
  projectId: "lfgapp-188e3",
  storageBucket: "lfgapp-188e3.appspot.com",
  messagingSenderId: "756895921238",
  appId: "1:756895921238:web:81ea035b208e56c505f7f7",
  measurementId: "G-F5GEG83ENX",
});

export const uploadFile = async (file: File, id: string) => {
  try {
    // convert to webp for reduce size
    const result = sharp(file.path).webp({ quality: 80 });
    // upload to firebase
    const snapshot = await uploadBytes(
      ref(getStorage(app), `images/${id}/${file.filename}.webp`),
      await result.toBuffer(),
    );

    return await getDownloadURL(snapshot.ref);
  } catch (error: any) {
    // https://firebase.google.com/docs/storage/web/handle-errors
    if (error.code === "storage/unauthorized") {
      throw new ValidationError(UNAUTHORIZED_ERROR);
    }

    throw new ValidationError(UNEXPECTED_ERROR);
  }
};
