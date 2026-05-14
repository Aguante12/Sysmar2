// Configuración de Firebase de tu proyecto "clothesem"
const firebaseConfig = {
    apiKey: "AIzaSyB6wrMLXfsv5eRILWiuHGcW6lQVUyEnr9E",
    authDomain: "clothesem.firebaseapp.com",
    projectId: "clothesem",
    storageBucket: "clothesem.firebasestorage.app",
    messagingSenderId: "44501902222",
    appId: "1:44501902222:web:7482f7e172e4849767badf",
    measurementId: "G-MC0E2VWBK2"
};

// Inicializar Firebase (Sintaxis v8)
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

