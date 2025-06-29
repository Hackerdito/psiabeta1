// netlify/functions/protect.js
const fs    = require('fs');
const path  = require('path');
const admin = require('firebase-admin');

// Inicializa Admin SDK UNA vez
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

exports.handler = async (event) => {
  // 1) Log de las cookies recibidas
  console.log('🍪 Cookies recibidas:', event.headers.cookie);

  const cookieHeader = event.headers.cookie || '';
  const match = cookieHeader.match(/idToken=([^;]+)/);
  if (!match) {
    console.log('🔒 No se encontró idToken → redirigiendo a login');
    return {
      statusCode: 302,
      headers: { Location: '/login.html' },
      body: ''
    };
  }
  const idToken = match[1];

  try {
    // 2) Verifica el token con Firebase Admin
    const decoded = await admin.auth().verifyIdToken(idToken);
    console.log('✅ Token verificado para uid:', decoded.uid);

    // 3) Determina la ruta del archivo protegido
    const file = event.queryStringParameters.file;
    const filePath = path.join(process.cwd(), 'protected', file);
    console.log('📄 Intentando leer archivo en:', filePath);

    // 4) Lee y sirve el HTML
    const content = fs.readFileSync(filePath, 'utf8');
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html' },
      body: content
    };

  } catch (err) {
    // 5) En caso de error (token inválido, archivo no encontrado, etc.)
    console.error('❌ Error en protect.js:', err);
    return {
      statusCode: 302,
      headers: { Location: '/login.html' },
      body: ''
    };
  }
};
