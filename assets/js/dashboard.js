// assets/js/dashboard.js

// Validación Funcional: Verificar si hay token activo
document.addEventListener('DOMContentLoaded', async () => {
  const { data: { session } } = await _supabase.auth.getSession();
  
  if (!session) {
    // Si no hay sesión válida, rebota a la pantalla de Login
    window.location.href = 'index.html';
  } else {
    document.getElementById('user-email').innerText = session.user.email;
  }
});

async function handleLogout() {
  await _supabase.auth.signOut();
  window.location.href = 'index.html';
}