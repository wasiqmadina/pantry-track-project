// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD9JLQSouu0WSmkc3cCfPFJg903hvQDJyQ",
  authDomain: "inventory-management-486d6.firebaseapp.com",
  projectId: "inventory-management-486d6",
  storageBucket: "inventory-management-486d6.appspot.com",
  messagingSenderId: "315409040418",
  appId: "1:315409040418:web:ff8727d8b6098211d5f67b",
  measurementId: "G-7K5MT2TSSD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
export { firestore };