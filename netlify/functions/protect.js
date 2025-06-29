// netlify/functions/protect.js
const fs    = require('fs');
const path  = require('path');
const admin = require('firebase-admin');

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

exports.handler = async (event) => {
  const cookieHeader = event.headers.cookie || '';
  const match = cookieHeader.match(/idToken=([^;]+)/);
  if (!match) {
    return { statusCode: 302, headers: { Location: '/login.html' }, body: '' };
  }
  const idToken = match[1];

  try {
    await admin.auth().verifyIdToken(idToken);

    // Aquí está el cambio clave:
    const file = event.queryStringParameters.file;
    const filePath = path.join(process.cwd(), 'protected', file);
    const content  = fs.readFileSync(filePath, 'utf8');

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html' },
      body: content
    };
  } catch (err) {
    return { statusCode: 302, headers: { Location: '/login.html' }, body: '' };
  }
};
