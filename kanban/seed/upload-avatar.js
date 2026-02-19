import 'dotenv/config'
import { initializeApp } from 'firebase/app'
import { getFirestore, doc, updateDoc } from 'firebase/firestore'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const app = initializeApp({
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
})

const db = getFirestore(app)
const storage = getStorage(app)

const userId = 'forest'
const filePath = resolve(`avatars/${userId}.jpg`)

const file = readFileSync(filePath)
const storageRef = ref(storage, `avatars/${userId}`)
await uploadBytes(storageRef, file)
const url = await getDownloadURL(storageRef)
await updateDoc(doc(db, 'users', userId), { avatarUrl: url })

console.log(`✓ Avatar updated for ${userId}: ${url}`)
process.exit(0)
