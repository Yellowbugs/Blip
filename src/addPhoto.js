import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { storage, db, auth } from "./firebase.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function uploadLocalFile(localPath, filename) {
  const fileBuffer = fs.readFileSync(path.join(__dirname, localPath));
  const file = new File([fileBuffer], filename, { type: "image/jpeg" });

  const photoRef = ref(storage, `photos/${Date.now()}-${filename}`);
  await uploadBytes(photoRef, file);
  const url = await getDownloadURL(photoRef);

  await addDoc(collection(db, "photos"), {
    url,
    day: 0,
    comments: []
  });

  console.log("✅ Photo uploaded successfully:", url);
}

await uploadLocalFile("./day1.JPG", "day1.JPG");