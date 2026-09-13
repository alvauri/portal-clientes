// assets/js/dashboard.js

let currentUserEmail = '';
let currentSelectedService = null;

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

  // Cargar datos desde Supabase
  await loadCustomerServices();
  await loadCustomerTickets();
});

/* --- MÓDULO DE SERVICIOS --- */

// Cargar servicios desde Supabase y habilitar evento de clic
async function loadCustomerServices() {
  const container = document.getElementById('service-container');
  if (!container) return;

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

  // Guardamos la lista globalmente para acceder al hacer clic
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

/* --- CONTROL DEL MODAL DE DETALLE DE SERVICIO --- */

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
  const modal = document.getElementById('service-detail-modal');
  if (modal) modal.classList.add('hidden');
  currentSelectedService = null;
}

/* --- MÓDULO DE TICKETS DE SOPORTE --- */

async function loadCustomerTickets() {
  const container = document.getElementById('tickets-container');
  if (!container) return;

  const { data: tickets, error } = await _supabase
    .from('tickets')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error al cargar tickets:', error);
    container.innerHTML = `<li style="color: var(--danger); text-align: center;">Error al cargar tickets.</li>`;
    return;
  }

  if (!tickets || tickets.length === 0) {
    container.innerHTML = `<li style="color: var(--text-muted); text-align: center; cursor: default;">No tienes tickets de soporte registrados.</li>`;
    return;
  }

  container.innerHTML = tickets.map(ticket => {
    const isClosed = ticket.status.toLowerCase() === 'resuelto';
    const badgeClass = isClosed ? 'badge active' : 'badge';

    return `
      <li style="cursor: default;">
        <div class="service-item">
          <span class="material-symbols-outlined icon">confirmation_number</span>
          <div>
            <strong style="display: block; font-size: 0.95rem;">${ticket.subject}</strong>
            <small style="color: var(--text-muted); font-size: 0.8rem;">Prioridad: ${ticket.priority}</small>
          </div>
        </div>
        <span class="${badgeClass}">${ticket.status}</span>
      </li>
    `;
  }).join('');
}

function openTicketModal(serviceId = null) {
  const modal = document.getElementById('ticket-modal');
  const serviceSelect = document.getElementById('ticket-service-id');
  
  if (window.customerServicesList && window.customerServicesList.length > 0) {
    serviceSelect.innerHTML = `<option value="">-- General / Consulta global --</option>` +
      window.customerServicesList.map(s => `<option value="${s.id}">${s.title}</option>`).join('');
  }

  if (serviceId) {
    serviceSelect.value = serviceId;
  }

  document.getElementById('ticket-form').reset();
  document.getElementById('ticket-response-msg').innerText = '';
  modal.classList.remove('hidden');
}

function closeTicketModal() {
  const modal = document.getElementById('ticket-modal');
  if (modal) modal.classList.add('hidden');
}

function openTicketFromService() {
  if (currentSelectedService) {
    const serviceId = currentSelectedService.id;
    closeServiceModal();
    openTicketModal(serviceId);
  }
}

async function handleCreateTicket(event) {
  event.preventDefault();
  
  const submitBtn = document.getElementById('btn-submit-ticket');
  const msgDiv = document.getElementById('ticket-response-msg');

  const serviceId = document.getElementById('ticket-service-id').value || null;
  const subject = document.getElementById('ticket-subject').value.trim();
  const priority = document.getElementById('ticket-priority').value;
  const message = document.getElementById('ticket-message').value.trim();

  const { data: { session } } = await _supabase.auth.getSession();
  if (!session) return;

  submitBtn.disabled = true;
  submitBtn.innerText = "Enviando...";
  msgDiv.style.color = "var(--text-muted)";
  msgDiv.innerText = "Guardando solicitud...";

  const { error } = await _supabase
    .from('tickets')
    .insert([
      {
        user_id: session.user.id,
        service_id: serviceId,
        subject: subject,
        priority: priority,
        message: message,
        status: 'Abierto'
      }
    ]);

  submitBtn.disabled = false;
  submitBtn.innerText = "Enviar Ticket";

  if (error) {
    console.error("Error al crear ticket:", error);
    msgDiv.style.color = "var(--danger)";
    msgDiv.innerText = "Error al enviar: " + error.message;
  } else {
    msgDiv.style.color = "var(--accent)";
    msgDiv.innerText = "¡Ticket enviado con éxito!";
    await loadCustomerTickets();
    setTimeout(() => {
      closeTicketModal();
    }, 1200);
  }
}

/* --- CONTROL DE DROPDOWN Y MODAL DE PERFIL --- */

function toggleUserMenu() {
  const dropdown = document.getElementById('user-dropdown');
  if (dropdown) dropdown.classList.toggle('hidden');
}

document.addEventListener('click', (e) => {
  const avatarBtn = document.getElementById('user-avatar-btn');
  const dropdown = document.getElementById('user-dropdown');
  if (avatarBtn && dropdown && !avatarBtn.contains(e.target) && !dropdown.contains(e.target)) {
    dropdown.classList.add('hidden');
  }
});

function openProfileModal() {
  const dropdown = document.getElementById('user-dropdown');
  if (dropdown) dropdown.classList.add('hidden');
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

  const { error } = await _supabase.auth.updateUser({
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

  const { error } = await _supabase.auth.resetPasswordForEmail(currentUserEmail, {
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