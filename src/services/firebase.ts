// import { initializeApp } from "firebase/app";
// import { deleteObject, getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
// import type { File } from "@koa/multer";
// import sharp from "sharp";
// import { unlinkSync } from "fs";

// import { ValidationError } from "@/exceptions";
// import { UNAUTHENTICATED_ERROR, UNAUTHORIZED_ERROR } from "@/errors/auth.errors";
// import { UNEXPECTED_ERROR } from "@/errors/index.errors";

// const app = initializeApp({
//   apiKey: process.env.FIREBASE_API_KEY,
//   authDomain: "lfgapp-188e3.firebaseapp.com",
//   projectId: "lfgapp-188e3",
//   storageBucket: "lfgapp-188e3.appspot.com",
//   messagingSenderId: "756895921238",
//   appId: "1:756895921238:web:81ea035b208e56c505f7f7",
//   measurementId: "G-F5GEG83ENX",
// });

// export const uploadFile = async (file: File, id: string) => {
//   try {
//     // convert to webp for reduce size
//     const result = sharp(file.path).webp({ quality: 80 });
//     // upload to firebase
//     const snapshot = await uploadBytes(
//       ref(getStorage(app), `images/${id}/${file.filename}.webp`),
//       await result.toBuffer(),
//     );

//     // remove local file
//     unlinkSync(file.path);

//     return (await getDownloadURL(snapshot.ref)).split("?")[0];
//   } catch (error: any) {
//     // https://firebase.google.com/docs/storage/web/handle-errors
//     if (error.code === "storage/unauthorized") {
//       throw new ValidationError(UNAUTHORIZED_ERROR);
//     }

//     if (error.code === "storage/unauthenticated") {
//       throw new ValidationError(UNAUTHENTICATED_ERROR);
//     }

//     throw new LfgError(UNEXPECTED_ERROR);
//   }
// };

// const parseNameFromUrl = (url: string) => {
//   // coming from request, after joi sanitizes it
//   let parts = url.split("&#x2F;o&#x2F;");

//   if (!parts || parts.length === 1) {
//     // coming from db
//     parts = url.split("/o/");
//   }

//   return parts[1].split("?")[0].replaceAll("%2F", "/");
// };

// export const deleteFile = async (file: string) => {
//   try {
//     await deleteObject(ref(getStorage(app), parseNameFromUrl(file)));
//   } catch (error: any) {
//     console.log(error);
//     // https://firebase.google.com/docs/storage/web/handle-errors
//     if (error.code === "storage/object-not-found") {
//       return;
//     }

//     if (error.code === "storage/unauthorized") {
//       throw new ValidationError(UNAUTHORIZED_ERROR);
//     }

//     if (error.code === "storage/unauthenticated") {
//       throw new ValidationError(UNAUTHENTICATED_ERROR);
//     }

//     throw new LfgError(UNEXPECTED_ERROR);
//   }
// };
