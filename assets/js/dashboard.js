// assets/js/dashboard.js
document.addEventListener('DOMContentLoaded', async () => {
  // 1. Verificamos la sesión activa en Supabase
  const { data: { session }, error } = await _supabase.auth.getSession();
  
  // Guard de seguridad: Si no hay usuario autenticado, redirigimos al login
  if (error || !session) {
    window.location.href = 'index.html';
    return;
  }

  // 2. Extraemos la metadata (Nombre Completo) o usamos el email como fallback
  const user = session.user;
  const userName = user.user_metadata?.full_name || user.email;

  // 3. Renderizamos en pantalla
  const userEmailSpan = document.getElementById('user-email');
  if (userEmailSpan) {
    userEmailSpan.innerText = userName;
  }
});

// Función para cerrar sesión
async function handleLogout() {
  const { error } = await _supabase.auth.signOut();
  if (error) {
    alert('Error al cerrar sesión: ' + error.message);
  } else {
    window.location.href = 'index.html';
  }
}