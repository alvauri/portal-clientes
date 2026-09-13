// assets/js/dashboard.js

let currentUserEmail = '';

document.addEventListener('DOMContentLoaded', async () => {
  const { data: { session }, error } = await _supabase.auth.getSession();
  
  if (error || !session) {
    window.location.href = 'index.html';
    return;
  }

  const user = session.user;
  currentUserEmail = user.email;
  const userName = user.user_metadata?.full_name || 'Cliente';

  // Seteamos datos en el Dropdown
  document.getElementById('dropdown-name').innerText = userName;
  document.getElementById('dropdown-email').innerText = currentUserEmail;

  // Pre-cargamos input del modal
  const nameInput = document.getElementById('update-fullname');
  if (nameInput) {
    nameInput.value = user.user_metadata?.full_name || '';
  }
});

/* Control de Menú Desplegable */
function toggleUserMenu() {
  const dropdown = document.getElementById('user-dropdown');
  dropdown.classList.toggle('hidden');
}

// Cierra el menú al hacer clic fuera
document.addEventListener('click', (e) => {
  const avatarBtn = document.getElementById('user-avatar-btn');
  const dropdown = document.getElementById('user-dropdown');
  if (avatarBtn && dropdown && !avatarBtn.contains(e.target) && !dropdown.contains(e.target)) {
    dropdown.classList.add('hidden');
  }
});

/* Control de Modal */
function openProfileModal() {
  document.getElementById('user-dropdown').classList.add('hidden');
  document.getElementById('profile-modal').classList.remove('hidden');
}

function closeProfileModal() {
  document.getElementById('profile-modal').classList.add('hidden');
  document.getElementById('profile-message').innerText = '';
}

/* Funciones de Backend */
async function handleUpdateProfile() {
  const newName = document.getElementById('update-fullname').value.trim();
  const msgDiv = document.getElementById('profile-message');

  if (!newName) {
    msgDiv.style.color = '#ef4444';
    msgDiv.innerText = "Ingresá un nombre válido.";
    return;
  }

  msgDiv.style.color = '#cbd5e1';
  msgDiv.innerText = "Guardando...";

  const { data, error } = await _supabase.auth.updateUser({
    data: { full_name: newName }
  });

  if (error) {
    msgDiv.style.color = '#ef4444';
    msgDiv.innerText = "Error: " + error.message;
  } else {
    msgDiv.style.color = '#38bdf8';
    msgDiv.innerText = "¡Perfil actualizado!";
    document.getElementById('dropdown-name').innerText = newName;
    setTimeout(() => closeProfileModal(), 1200);
  }
}

async function handleResetPassword() {
  const msgDiv = document.getElementById('profile-message');
  msgDiv.style.color = '#cbd5e1';
  msgDiv.innerText = "Enviando correo...";

  const { data, error } = await _supabase.auth.resetPasswordForEmail(currentUserEmail, {
    redirectTo: window.location.origin + '/index.html'
  });

  if (error) {
    msgDiv.style.color = '#ef4444';
    msgDiv.innerText = "Error: " + error.message;
  } else {
    msgDiv.style.color = '#38bdf8';
    msgDiv.innerText = "Revisá tu casilla de correo.";
  }
}

async function handleLogout() {
  const { error } = await _supabase.auth.signOut();
  if (!error) {
    window.location.href = 'index.html';
  }
}