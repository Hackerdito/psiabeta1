// login.js

// Al cargar la página, añade listener a los inputs
document.addEventListener("DOMContentLoaded", () => {
  const emailEl = document.getElementById("email");
  const passEl  = document.getElementById("password");

  [emailEl, passEl].forEach(el => {
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();    // evita el comportamiento por defecto
        loginUser();           // llama a tu función
      }
    });
  });
});

// Tu loginUser() existente...
function loginUser() {
  // … código que ya tienes …
}

// Espera a que Firebase esté listo
document.addEventListener("DOMContentLoaded", () => {
  // 1) Instancia el UI
  const ui = new firebaseui.auth.AuthUI(firebase.auth());

  // 2) Configuración
  const uiConfig = {
    callbacks: {
      signInSuccessWithAuthResult: () => {
        // Al terminar el login, redirige a psia
        window.location.href = "psia";
        return false; // No recarga la página
      },
      uiShown: () => {
        // Oculta el loader cuando UI esté listo
        document.getElementById("loader").style.display = "none";
      }
    },
    // ¿Qué métodos quieres? Aquí solo Google
    signInOptions: [
      firebase.auth.GoogleAuthProvider.PROVIDER_ID
    ],
    // No mostrar el resto de flujos
    signInFlow: "popup"
  };

  // 3) Arranca el UI
  ui.start("#firebaseui-auth-container", uiConfig);
});
// login.js (tras signInWithPopup o signInWithEmailAndPassword)
firebase.auth().signInWithEmailAndPassword(email, pass)
  .then(() => {
    // usa la ruta Netlify que quieres proteger
    window.location.href = "/psia";
  });


  // login.js

function loginUser() {
  const emailEl    = document.getElementById("email");
  const passwordEl = document.getElementById("password");
  const errorMsg   = document.getElementById("error-msg");

  const email    = emailEl.value.trim();
  const password = passwordEl.value.trim();

  // Oculta errores previos
  errorMsg.style.display   = "none";
  errorMsg.textContent     = "";

  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(() => {
      // Login exitoso
      window.location.href = "/psia";
    })
    .catch((error) => {
      // Aquí decides qué mensaje mostrar según el error.code
      let friendlyMessage;
      switch (error.code) {
        case "auth/user-not-found":
        case "auth/wrong-password":
          friendlyMessage = "Usuario o contraseña incorrectos.";
          break;
        case "auth/invalid-email":
          friendlyMessage = "El formato del correo no es válido.";
          break;
        case "auth/user-disabled":
          friendlyMessage = "Esta cuenta ha sido deshabilitada.";
          break;
        default:
          friendlyMessage = "Error al iniciar sesión. Intenta de nuevo más tarde.";
      }

      // Muestra tu mensaje amigable
      errorMsg.textContent   = friendlyMessage;
      errorMsg.style.display = "block";

      // (Opcional) sigue imprimiendo en consola para depuración
      console.error("Login error", error.code, error.message);
    });
}
function logoutUser() {
  firebase.auth().signOut()
    .then(() => {
      // Redirige a la página de login
      window.location.href = "login.html";
    })
    .catch((error) => {
      console.error("Error al cerrar sesión:", error);
    });
}

// enter tecla

  function loginUser() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const errorMsg = document.getElementById('error-msg');
  errorMsg.style.display = 'none';

  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(() => {
      window.location.href = "psia"; // Cambia a la página que desees tras login
    })
    .catch((error) => {
      errorMsg.textContent = error.message;
      errorMsg.style.display = 'block';
    });
}
