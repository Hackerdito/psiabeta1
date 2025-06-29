// netlify/functions/protect.js
const fs    = require('fs');
const path  = require('path');
const admin = require('firebase-admin');

// Inicializa Firebase Admin SDK UNA vez
if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('🔧 Firebase Admin inicializado');
  } catch (e) {
    console.error('❌ Error al inicializar Admin SDK:', e.message);
  }
}

exports.handler = async (event) => {
  // 1) Mostrar cookies recibidas
  console.log('🍪 Cookies recibidas:', event.headers.cookie || '(ninguna)');

  // 2) Extraer idToken
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
    // 3) Verificar token
    console.log('🔑 Verificando idToken…');
    const decoded = await admin.auth().verifyIdToken(idToken);
    console.log('✅ Token verificado, uid:', decoded.uid);

    // 4) Leer y servir el HTML protegido
    const file = event.queryStringParameters.file;
    const filePath = path.join(process.cwd(), 'protected', file);
    console.log('📄 Intentando leer archivo en:', filePath);

    const content = fs.readFileSync(filePath, 'utf8');
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html' },
      body: content
    };

  } catch (err) {
    // 5) Error en verificación o lectura
    console.error('❌ Falló verifyIdToken o lectura de archivo:', err.message);
    return {
      statusCode: 302,
      headers: { Location: '/login.html' },
      body: ''
    };
  }
};
