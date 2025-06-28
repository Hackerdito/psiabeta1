// netlify/functions/protect.js
const fs    = require('fs');
const path  = require('path');
const admin = require('firebase-admin');

// Inicializa Admin SDK (una sola vez)
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

exports.handler = async (event) => {
  // 1) Extrae token de la cookie "idToken"
  const cookieHeader = event.headers.cookie || '';
  const match = cookieHeader.match(/idToken=([^;]+)/);
  if (!match) {
    // No autenticado → redirige al login
    return {
      statusCode: 302,
      headers: { Location: '/login.html' },
      body: ''
    };
  }
  const idToken = match[1];

  try {
    // 2) Verifica el token con Firebase Admin
    await admin.auth().verifyIdToken(idToken);

    // 3) Lee y sirve el HTML de la ruta solicitada
    //    El query param "file" indica qué página protegida queremos
    const file = event.queryStringParameters.file;
    const filePath = path.join(__dirname, '..', 'protected', file);
    const content  = fs.readFileSync(filePath, 'utf8');

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html' },
      body: content
    };

  } catch (err) {
    // Token inválido o expirado → redirige
    return {
      statusCode: 302,
      headers: { Location: '/login.html' },
      body: ''
    };
  }
};

