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
  const userName = user.user_metadata?.full_name || user.email;

  // Actualizar interfaz con datos del usuario
  const userEmailSpan = document.getElementById('user-email');
  if (userEmailSpan) userEmailSpan.innerText = userName;

  const dropdownName = document.getElementById('dropdown-name');
  if (dropdownName) dropdownName.innerText = userName;
  
  const dropdownEmail = document.getElementById('dropdown-email');
  if (dropdownEmail) dropdownEmail.innerText = currentUserEmail;

  const nameInput = document.getElementById('update-fullname');
  if (nameInput) nameInput.value = user.user_metadata?.full_name || '';

  // CARGAR SERVICIOS REALES DESDE SUPABASE
  let currentSelectedService = null;

// Cargar servicios desde Supabase y habilitar evento de clic
async function loadCustomerServices() {
  const container = document.getElementById('service-container');

  const { data: services, error } = await _supabase
    .from('services')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error al cargar servicios:', error);
    container.innerHTML = `<li style="color: var(--danger); text-align: center;">Error al cargar tus servicios.</li>`;
    return;
  }

  if (!services || services.length === 0) {
    container.innerHTML = `<li style="color: var(--text-muted); text-align: center;">No tienes servicios activos asignados por el momento.</li>`;
    return;
  }

  // Guardamos la lista en window para acceder rápidamente al hacer clic
  window.customerServicesList = services;

  container.innerHTML = services.map((service, index) => {
    const statusLower = service.status.toLowerCase();
    const isActive = statusLower === 'activo' || statusLower === 'al día';
    const badgeClass = isActive ? 'badge active' : 'badge';

    return `
      <li onclick="openServiceModal(${index})">
        <div class="service-item">
          <span class="material-symbols-outlined icon">${service.icon || 'language'}</span>
          <span>${service.title}</span>
        </div>
        <span class="${badgeClass}">${service.status}</span>
      </li>
    `;
  }).join('');
}

/* --- Control del Modal de Detalle de Servicio --- */
function openServiceModal(index) {
  const service = window.customerServicesList[index];
  if (!service) return;

  currentSelectedService = service;

  document.getElementById('modal-service-title').innerText = service.title;
  document.getElementById('modal-service-icon').innerText = service.icon || 'language';
  document.getElementById('modal-service-desc').innerText = service.description || 'Sin información detallada por el momento.';
  
  // Estado y badge
  const statusBadge = document.getElementById('modal-service-status');
  statusBadge.innerText = service.status;
  const isActive = service.status.toLowerCase() === 'activo' || service.status.toLowerCase() === 'al día';
  statusBadge.className = isActive ? 'badge active' : 'badge';

  // Enlace externo (si existe)
  const linkContainer = document.getElementById('modal-service-link-container');
  const linkAnchor = document.getElementById('modal-service-link');
  if (service.external_link && service.external_link.trim() !== '') {
    linkAnchor.href = service.external_link;
    linkContainer.classList.remove('hidden');
  } else {
    linkContainer.classList.add('hidden');
  }

  document.getElementById('service-detail-modal').classList.remove('hidden');
}

function closeServiceModal() {
  document.getElementById('service-detail-modal').classList.add('hidden');
  currentSelectedService = null;
}

function openTicketFromService() {
  alert(`Abriendo solicitud de soporte para: ${currentSelectedService?.title}`);
  closeServiceModal();
}
  await loadCustomerServices();
});

// Función para obtener e inyectar los servicios
async function loadCustomerServices() {
  const container = document.getElementById('service-container');

  // Supabase filtra automáticamente los datos por el user_id logueado gracias al RLS
  const { data: services, error } = await _supabase
    .from('services')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error al cargar servicios:', error);
    container.innerHTML = `<li style="color: var(--danger); text-align: center;">Error al cargar tus servicios.</li>`;
    return;
  }

  if (!services || services.length === 0) {
    container.innerHTML = `<li style="color: var(--text-muted); text-align: center;">No tienes servicios activos asignados por el momento.</li>`;
    return;
  }

  // Renderizado dinámico del HTML
  container.innerHTML = services.map(service => {
    const statusLower = service.status.toLowerCase();
    const isActive = statusLower === 'activo' || statusLower === 'al día';
    const badgeClass = isActive ? 'badge active' : 'badge';

    return `
      <li>
        <div class="service-item">
          <span class="material-symbols-outlined icon">${service.icon || 'language'}</span>
          <span>${service.title}</span>
        </div>
        <span class="${badgeClass}">${service.status}</span>
      </li>
    `;
  }).join('');
}

/* --- Control de Dropdown Menú & Modal --- */
function toggleUserMenu() {
  const dropdown = document.getElementById('user-dropdown');
  dropdown.classList.toggle('hidden');
}

document.addEventListener('click', (e) => {
  const avatarBtn = document.getElementById('user-avatar-btn');
  const dropdown = document.getElementById('user-dropdown');
  if (avatarBtn && dropdown && !avatarBtn.contains(e.target) && !dropdown.contains(e.target)) {
    dropdown.classList.add('hidden');
  }
});

function openProfileModal() {
  document.getElementById('user-dropdown').classList.add('hidden');
  document.getElementById('profile-modal').classList.remove('hidden');
}

function closeProfileModal() {
  document.getElementById('profile-modal').classList.add('hidden');
  document.getElementById('profile-message').innerText = '';
}

async function handleUpdateProfile() {
  const newName = document.getElementById('update-fullname').value.trim();
  const msgDiv = document.getElementById('profile-message');

  if (!newName) {
    msgDiv.style.color = 'var(--danger)';
    msgDiv.innerText = "Ingresá un nombre válido.";
    return;
  }

  msgDiv.style.color = 'var(--text-muted)';
  msgDiv.innerText = "Guardando...";

  const { data, error } = await _supabase.auth.updateUser({
    data: { full_name: newName }
  });

  if (error) {
    msgDiv.style.color = 'var(--danger)';
    msgDiv.innerText = "Error: " + error.message;
  } else {
    msgDiv.style.color = 'var(--accent)';
    msgDiv.innerText = "¡Perfil actualizado!";
    document.getElementById('dropdown-name').innerText = newName;
    document.getElementById('user-email').innerText = newName;
    setTimeout(() => closeProfileModal(), 1200);
  }
}

async function handleResetPassword() {
  const msgDiv = document.getElementById('profile-message');
  msgDiv.style.color = 'var(--text-muted)';
  msgDiv.innerText = "Enviando correo...";

  const { data, error } = await _supabase.auth.resetPasswordForEmail(currentUserEmail, {
    redirectTo: window.location.origin + '/index.html'
  });

  if (error) {
    msgDiv.style.color = 'var(--danger)';
    msgDiv.innerText = "Error: " + error.message;
  } else {
    msgDiv.style.color = 'var(--accent)';
    msgDiv.innerText = "Revisá tu casilla de correo.";
  }
}

async function handleLogout() {
  const { error } = await _supabase.auth.signOut();
  if (!error) {
    window.location.href = 'index.html';
  }
}