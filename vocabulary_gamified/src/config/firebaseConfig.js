import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

export const firebaseConfig = { 
   apiKey: "AIzaSyDTkKVmntt5-ybspd5KKs8BA8hzPxSQwYo", 
   authDomain: "vocabularystudent-a6eaf.firebaseapp.com", 
   projectId: "vocabularystudent-a6eaf", 
   storageBucket: "vocabularystudent-a6eaf.firebasestorage.app", 
   messagingSenderId: "912862279337", 
   appId: "1:912862279337:web:7af985558bd57f1b3d9bb8", 
   measurementId: "G-5N2JJN2Y9C" 
 };

const app = initializeApp(firebaseConfig);
export const initializeRealtimeDB = () => getDatabase(app);