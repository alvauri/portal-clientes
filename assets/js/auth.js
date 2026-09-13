// assets/js/auth.js

let currentMode = 'login'; // 'login' o 'signup'

document.addEventListener('DOMContentLoaded', async () => {
  const { data: { session } } = await _supabase.auth.getSession();
  if (session) {
    window.location.href = 'dashboard.html';
  }
});

// Cambia la vista entre Login y Registro
function switchMode(mode) {
  currentMode = mode;
  const signupFields = document.querySelectorAll('.signup-only');
  const title = document.getElementById('form-title');
  const btnSubmit = document.getElementById('btn-submit');
  const tabLogin = document.getElementById('tab-login');
  const tabSignup = document.getElementById('tab-signup');
  const msgDiv = document.getElementById('message');

  msgDiv.innerText = '';

  if (mode === 'signup') {
    title.innerText = 'Crear Cuenta';
    btnSubmit.innerText = 'Registrarse';
    signupFields.forEach(el => el.style.display = 'block');
    tabSignup.classList.add('active');
    tabLogin.classList.remove('active');
  } else {
    title.innerText = 'Iniciar Sesión';
    btnSubmit.innerText = 'Iniciar Sesión';
    signupFields.forEach(el => el.style.display = 'none');
    tabLogin.classList.add('active');
    tabSignup.classList.remove('active');
  }
}

// Procesa el formulario según el modo actual
function handleSubmit() {
  if (currentMode === 'login') {
    handleLogin();
  } else {
    handleSignUp();
  }
}

async function handleLogin() {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const msgDiv = document.getElementById('message');

  if (!email || !password) {
    msgDiv.innerText = "Por favor ingresá tu email y contraseña.";
    return;
  }

  msgDiv.innerText = "Verificando credenciales...";

  const { data, error } = await _supabase.auth.signInWithPassword({ email, password });

  if (error) {
    msgDiv.innerText = "Error: " + error.message;
  } else {
    msgDiv.innerText = "¡Acceso correcto! Redirigiendo...";
    window.location.href = 'dashboard.html';
  }
}

async function handleSignUp() {
  const fullName = document.getElementById('fullname').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirm-password').value;
  const msgDiv = document.getElementById('message');

  if (!fullName) {
    msgDiv.innerText = "Ingresá tu nombre o nombre de empresa.";
    return;
  }

  if (!email || !email.includes('@')) {
    msgDiv.innerText = "Ingresá un correo electrónico válido.";
    return;
  }

  if (password.length < 6) {
    msgDiv.innerText = "La contraseña debe tener al menos 6 caracteres.";
    return;
  }

  if (password !== confirmPassword) {
    msgDiv.innerText = "Las contraseñas no coinciden.";
    return;
  }

  msgDiv.innerText = "Creando cuenta...";

  const { data, error } = await _supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      data: {
        full_name: fullName
      }
    }
  });

  if (error) {
    msgDiv.innerText = "Error: " + error.message;
  } else {
    msgDiv.innerText = "¡Cuenta creada con éxito! Ya podés iniciar sesión.";
    switchMode('login'); // Vuelve al modo login automáticamente
  }
}