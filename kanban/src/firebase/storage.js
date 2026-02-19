import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from './config'

export async function uploadAvatar(userId, file) {
  const storageRef = ref(storage, `avatars/${userId}`)
  await uploadBytes(storageRef, file)
  return getDownloadURL(storageRef)
}
