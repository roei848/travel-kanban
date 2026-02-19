import {
  collection, onSnapshot, doc, updateDoc, addDoc, deleteDoc, query, orderBy
} from 'firebase/firestore'
import { db } from './config'

export function subscribeTasks(callback) {
  const q = query(collection(db, 'tasks'), orderBy('order'))
  return onSnapshot(q, snapshot => {
    const tasks = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
    callback(tasks)
  })
}

export async function updateTask(id, fields) {
  await updateDoc(doc(db, 'tasks', id), fields)
}

export async function addTask(fields) {
  await addDoc(collection(db, 'tasks'), fields)
}

export async function deleteTask(id) {
  await deleteDoc(doc(db, 'tasks', id))
}
