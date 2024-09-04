import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: 'reactchat-eaa52.firebaseapp.com',
  projectId: 'reactchat-eaa52',
  storageBucket: 'reactchat-eaa52.appspot.com',
  messagingSenderId: '743940814536',
  appId: '1:743940814536:web:aba1dbd948d4a8c05ad7fd',
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth()
export const db = getFirestore()
export const storage = getStorage()