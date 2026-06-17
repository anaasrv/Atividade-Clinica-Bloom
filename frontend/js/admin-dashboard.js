const adminState = { consultas: [], medicos: [], usuarios: [], especialidades: [], procedimentos: [] };

function qs(id) { return document.getElementById(id); }
function token() { return localStorage.getItem('bloom_token') || sessionStorage.getItem('bloom_token'); }
function currentUser() { try { return JSON.parse(localStorage.getItem('bloom_user') || sessionStorage.getItem('bloom_user') || 'null'); } catch { return null; } }
function money(v) { return Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }
function dateBR(v) { return v ? new Date(`${v}T12:00:00`).toLocaleDateString('pt-BR') : '-'; }
function time(v) { return String(v || '').slice(0,5); }
function safe(v) { return String(v ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch])); }
function statusBadge(status) { return `<span class="status-badge status-${safe(status)}">${safe(status)}</span>`; }

async function request(endpoint, options = {}) {
  const res = await fetch(`http://localhost:5000/api${endpoint}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}`, ...(options.headers || {}) }
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Erro na comunicação com a API');
  return data;
}

function toast(message, type = 'success') {
  const area = qs('toastArea');
  if (!area) return alert(message);
  const el = document.createElement('div');
  el.className = `alert alert-${type === 'error' ? 'danger' : type} shadow-sm rounded-4 mb-2`;
  el.textContent = message;
  area.appendChild(el);
  setTimeout(() => el.remove(), 4200);
}

function requireAdmin() {
  const user = currentUser();
  if (!token() || !user) {
    location.href = 'login.html?redirect=admin-painel.html';
    return false;
  }
  if (!(user.is_admin || user.tipo_usuario === 'admin')) {
    qs('adminApp').innerHTML = `<main class="container py-5"><div class="integrated-card p-5 text-center"><h1>Acesso restrito</h1><p class="integrated-muted">Você está logado, mas não possui permissão de administrador.</p><a class="btn btn-gradient rounded-pill" href="index.html">Voltar ao site</a></div></main>`;
    return false;
  }
  qs('adminUserName').textContent = user.nome || 'Admin';
  return true;
}

function bindNav() {
  document.querySelectorAll('[data-admin-section]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-admin-section]').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
      btn.classList.add('active');
      qs(`section-${btn.dataset.adminSection}`)?.classList.add('active');
    });
  });
}

async function loadAll() {
  await Promise.allSettled([loadDashboard(), loadConsultas(), loadMedicos(), loadUsuarios(), loadEspecialidades(), loadProcedimentos(), loadNotificacoes()]);
  fillSelects();
}

async function loadDashboard() {
  const data = await request('/admin/dashboard');
  const cards = data.cards || {};
  qs('statsCards').innerHTML = [
    ['Consultas', cards.totalConsultas, 'bi-calendar-check'],
    ['Hoje', cards.consultasHoje, 'bi-calendar-day'],
    ['Pendentes', cards.pendentes, 'bi-hourglass-split'],
    ['Confirmadas', cards.confirmadas, 'bi-check-circle'],
    ['Pacientes', cards.pacientes, 'bi-people'],
    ['Médicos', cards.medicos, 'bi-person-badge']
  ].map(([label, value, icon]) => `<div class="integrated-card p-4"><i class="bi ${icon} fs-2 text-pink"></i><h3 class="fw-bold mt-3 mb-0">${value ?? 0}</h3><p class="integrated-muted mb-0">${label}</p></div>`).join('');
  qs('statusChart').innerHTML = (data.porStatus || []).map(row => `<div class="d-flex justify-content-between align-items-center border-bottom py-2"><span>${statusBadge(row.status)}</span><strong>${row.total}</strong></div>`).join('') || '<p class="integrated-muted">Sem dados ainda.</p>';
  qs('proximasConsultas').innerHTML = (data.proximas || []).map(renderConsultaMini).join('') || '<p class="integrated-muted">Nenhuma próxima consulta.</p>';
}

function renderConsultaMini(c) {
  return `<div class="integrated-card consulta-card p-3 mb-2"><div class="d-flex justify-content-between gap-2"><strong>${safe(c.paciente?.nome || 'Paciente')}</strong>${statusBadge(c.status)}</div><div class="small integrated-muted">${dateBR(c.data)} às ${time(c.horario)} • ${safe(c.medico?.nome || '-')}</div><div class="small">${safe(c.exame?.nome || '-')} • ${safe(c.convenio || 'Particular')}</div></div>`;
}

async function loadConsultas() {
  const data = await request('/agendamentos?limit=100');
  adminState.consultas = data.agendamentos || [];
  renderConsultas();
}

function renderConsultas() {
  const term = (qs('consultaSearch')?.value || '').toLowerCase();
  const rows = adminState.consultas.filter(c => JSON.stringify(c).toLowerCase().includes(term));
  qs('consultasTable').innerHTML = `<div class="table-responsive"><table class="table align-middle admin-table"><thead><tr><th>Paciente</th><th>Marcado em</th><th>Consulta</th><th>Médico</th><th>Procedimento</th><th>Convênio</th><th>Status</th><th>Ações</th></tr></thead><tbody>${rows.map(c => `<tr><td>${safe(c.paciente?.nome || '-')}<br><small class="integrated-muted">${safe(c.paciente?.email || '')}</small></td><td>${new Date(c.data_agendamento || c.created_at).toLocaleString('pt-BR')}</td><td>${dateBR(c.data)}<br><strong>${time(c.horario)}</strong></td><td>${safe(c.medico?.nome || '-')}</td><td>${safe(c.exame?.nome || '-')}</td><td>${safe(c.convenio || 'Particular')}</td><td>${statusBadge(c.status)}</td><td><div class="btn-group btn-group-sm"><button class="btn btn-outline-success" onclick="confirmarConsulta(${c.id})">Confirmar</button><button class="btn btn-outline-primary" onclick="openConsultaModal(${c.id})">Editar</button><button class="btn btn-outline-danger" onclick="cancelarConsulta(${c.id})">Cancelar</button></div></td></tr>`).join('')}</tbody></table></div>`;
}

async function confirmarConsulta(id) { try { await request(`/agendamentos/${id}/confirmar`, { method: 'PUT', body: '{}' }); toast('Consulta confirmada'); await loadConsultas(); await loadDashboard(); } catch(e) { toast(e.message, 'error'); } }
async function cancelarConsulta(id) { if (!confirm('Cancelar esta consulta?')) return; try { await request(`/agendamentos/${id}/cancelar`, { method: 'PUT', body: JSON.stringify({ motivo: 'Cancelado pelo administrador' }) }); toast('Consulta cancelada'); await loadConsultas(); await loadDashboard(); } catch(e) { toast(e.message, 'error'); } }

function openConsultaModal(id = null) {
  const c = adminState.consultas.find(x => Number(x.id) === Number(id)) || {};
  qs('consultaId').value = c.id || '';
  qs('consultaMedico').value = c.medico_id || c.medico?.id || '';
  qs('consultaProcedimento').value = c.exame_id || c.exame?.id || '';
  qs('consultaData').value = c.data || '';
  qs('consultaHorario').value = time(c.horario) || '';
  qs('consultaConvenio').value = c.convenio || 'Particular';
  qs('consultaStatus').value = c.status || 'agendado';
  new bootstrap.Modal(qs('consultaModal')).show();
}

async function saveConsulta() {
  const id = qs('consultaId').value;
  const payload = { medico_id: Number(qs('consultaMedico').value), exame_id: Number(qs('consultaProcedimento').value), data: qs('consultaData').value, horario: qs('consultaHorario').value, convenio: qs('consultaConvenio').value, status: qs('consultaStatus').value };
  try { await request(`/agendamentos/${id}`, { method: 'PUT', body: JSON.stringify(payload) }); toast('Consulta atualizada'); bootstrap.Modal.getInstance(qs('consultaModal')).hide(); await loadConsultas(); await loadDashboard(); } catch(e) { toast(e.message, 'error'); }
}

async function loadMedicos() { const data = await request('/medicos?limit=100'); adminState.medicos = data.medicos || []; renderMedicos(); }
function renderMedicos() { qs('medicosTable').innerHTML = `<div class="table-responsive"><table class="table align-middle"><thead><tr><th>Nome</th><th>CRM</th><th>Especialidade</th><th>Status</th><th>Ações</th></tr></thead><tbody>${adminState.medicos.map(m => `<tr><td>${safe(m.nome)}</td><td>${safe(m.crm)}</td><td>${safe(m.especialidade_info?.nome || '-')}</td><td>${m.disponivel ? 'Disponível' : 'Indisponível'}</td><td><button class="btn btn-sm btn-outline-primary" onclick="openMedicoModal(${m.id})">Editar</button></td></tr>`).join('')}</tbody></table></div>`; }
function openMedicoModal(id = null) { const m = adminState.medicos.find(x => Number(x.id) === Number(id)) || {}; qs('medicoId').value = m.id || ''; qs('medicoNome').value = m.nome || ''; qs('medicoCrm').value = m.crm || ''; qs('medicoEspecialidade').value = m.especialidade_id || ''; qs('medicoEmail').value = m.email || ''; qs('medicoTelefone').value = m.telefone || ''; qs('medicoResumo').value = m.resumo || ''; qs('medicoDisponivel').checked = m.disponivel !== false; new bootstrap.Modal(qs('medicoModal')).show(); }
async function saveMedico() { const id = qs('medicoId').value; const payload = { nome: qs('medicoNome').value, crm: qs('medicoCrm').value, especialidade_id: Number(qs('medicoEspecialidade').value), email: qs('medicoEmail').value, telefone: qs('medicoTelefone').value, resumo: qs('medicoResumo').value, disponivel: qs('medicoDisponivel').checked, ativo: true }; try { await request(id ? `/medicos/${id}` : '/medicos', { method: id ? 'PUT' : 'POST', body: JSON.stringify(payload) }); toast('Médico salvo'); bootstrap.Modal.getInstance(qs('medicoModal')).hide(); await loadMedicos(); fillSelects(); } catch(e) { toast(e.message, 'error'); } }

async function loadUsuarios() { const data = await request('/pacientes?limit=100'); adminState.usuarios = data.usuarios || data.pacientes || []; renderUsuarios(); }
function renderUsuarios() { qs('usuariosTable').innerHTML = `<div class="table-responsive"><table class="table align-middle"><thead><tr><th>Nome</th><th>Email</th><th>Perfil</th><th>Ativo</th><th>Ações</th></tr></thead><tbody>${adminState.usuarios.map(u => `<tr><td>${safe(u.nome)}</td><td>${safe(u.email)}</td><td>${safe(u.tipo_usuario)}</td><td>${u.ativo ? 'Sim' : 'Não'}</td><td><button class="btn btn-sm btn-outline-primary" onclick="openUsuarioModal(${u.id})">Editar</button></td></tr>`).join('')}</tbody></table></div>`; }
function openUsuarioModal(id = null) { const u = adminState.usuarios.find(x => Number(x.id) === Number(id)) || {}; qs('usuarioId').value = u.id || ''; qs('usuarioNome').value = u.nome || ''; qs('usuarioEmail').value = u.email || ''; qs('usuarioTelefone').value = u.telefone || ''; qs('usuarioTipo').value = u.tipo_usuario || 'paciente'; qs('usuarioAtivo').checked = u.ativo !== false; new bootstrap.Modal(qs('usuarioModal')).show(); }
async function saveUsuario() { const id = qs('usuarioId').value; const payload = { nome: qs('usuarioNome').value, email: qs('usuarioEmail').value, telefone: qs('usuarioTelefone').value, tipo_usuario: qs('usuarioTipo').value, is_admin: qs('usuarioTipo').value === 'admin', ativo: qs('usuarioAtivo').checked }; try { await request(id ? `/pacientes/${id}` : '/pacientes', { method: id ? 'PUT' : 'POST', body: JSON.stringify(payload) }); toast('Usuário salvo'); bootstrap.Modal.getInstance(qs('usuarioModal')).hide(); await loadUsuarios(); } catch(e) { toast(e.message, 'error'); } }

async function loadEspecialidades() { const data = await request('/especialidades'); adminState.especialidades = data.especialidades || []; renderEspecialidades(); }
function renderEspecialidades() { qs('especialidadesList').innerHTML = adminState.especialidades.map(e => `<div class="integrated-card p-3 mb-2 d-flex justify-content-between align-items-center"><div><strong>${safe(e.nome)}</strong><br><small class="integrated-muted">${safe(e.descricao || '')}</small></div><button class="btn btn-sm btn-outline-primary" onclick="openEspecialidadeModal(${e.id})">Editar</button></div>`).join(''); }
function openEspecialidadeModal(id = null) { const e = adminState.especialidades.find(x => Number(x.id) === Number(id)) || {}; qs('especialidadeId').value = e.id || ''; qs('especialidadeNome').value = e.nome || ''; qs('especialidadeDescricao').value = e.descricao || ''; new bootstrap.Modal(qs('especialidadeModal')).show(); }
async function saveEspecialidade() { const id = qs('especialidadeId').value; const payload = { nome: qs('especialidadeNome').value, descricao: qs('especialidadeDescricao').value, ativo: true }; try { await request(id ? `/especialidades/${id}` : '/especialidades', { method: id ? 'PUT' : 'POST', body: JSON.stringify(payload) }); toast('Especialidade salva'); bootstrap.Modal.getInstance(qs('especialidadeModal')).hide(); await loadEspecialidades(); fillSelects(); } catch(e) { toast(e.message, 'error'); } }

async function loadProcedimentos() { const data = await request('/procedimentos?limit=100'); adminState.procedimentos = data.procedimentos || data.exames || []; renderProcedimentos(); }
function renderProcedimentos() { qs('procedimentosTable').innerHTML = `<div class="table-responsive"><table class="table align-middle"><thead><tr><th>Nome</th><th>Categoria</th><th>Duração</th><th>Preço</th><th>Ações</th></tr></thead><tbody>${adminState.procedimentos.map(p => `<tr><td>${safe(p.nome)}</td><td>${safe(p.categoria || '-')}</td><td>${p.duracao || 30} min</td><td>${money(p.preco)}</td><td><button class="btn btn-sm btn-outline-primary" onclick="openProcedimentoModal(${p.id})">Editar</button></td></tr>`).join('')}</tbody></table></div>`; }
function openProcedimentoModal(id = null) { const p = adminState.procedimentos.find(x => Number(x.id) === Number(id)) || {}; qs('procedimentoId').value = p.id || ''; qs('procedimentoNome').value = p.nome || ''; qs('procedimentoCategoria').value = p.categoria || ''; qs('procedimentoPreco').value = p.preco || 0; qs('procedimentoDuracao').value = p.duracao || 30; qs('procedimentoDescricao').value = p.descricao || ''; new bootstrap.Modal(qs('procedimentoModal')).show(); }
async function saveProcedimento() { const id = qs('procedimentoId').value; const payload = { nome: qs('procedimentoNome').value, categoria: qs('procedimentoCategoria').value, preco: Number(qs('procedimentoPreco').value || 0), duracao: Number(qs('procedimentoDuracao').value || 30), descricao: qs('procedimentoDescricao').value, ativo: true }; try { await request(id ? `/procedimentos/${id}` : '/procedimentos', { method: id ? 'PUT' : 'POST', body: JSON.stringify(payload) }); toast('Procedimento salvo'); bootstrap.Modal.getInstance(qs('procedimentoModal')).hide(); await loadProcedimentos(); fillSelects(); } catch(e) { toast(e.message, 'error'); } }

async function loadNotificacoes() { const data = await request('/admin/notificacoes'); qs('notificacoesList').innerHTML = (data.notificacoes || []).map(n => `<div class="integrated-card p-3 mb-2"><strong>${safe(n.titulo)}</strong><br><span class="integrated-muted">${safe(n.mensagem)}</span></div>`).join(''); }

function fillSelects() {
  const medicoOptions = adminState.medicos.map(m => `<option value="${m.id}">${safe(m.nome)}</option>`).join('');
  const procOptions = adminState.procedimentos.map(p => `<option value="${p.id}">${safe(p.nome)}</option>`).join('');
  const espOptions = adminState.especialidades.map(e => `<option value="${e.id}">${safe(e.nome)}</option>`).join('');
  ['consultaMedico'].forEach(id => { if(qs(id)) qs(id).innerHTML = '<option value="">Selecione</option>' + medicoOptions; });
  ['consultaProcedimento'].forEach(id => { if(qs(id)) qs(id).innerHTML = '<option value="">Selecione</option>' + procOptions; });
  ['medicoEspecialidade'].forEach(id => { if(qs(id)) qs(id).innerHTML = '<option value="">Selecione</option>' + espOptions; });
}

function logoutAdmin() { localStorage.removeItem('bloom_token'); localStorage.removeItem('bloom_user'); sessionStorage.removeItem('bloom_token'); sessionStorage.removeItem('bloom_user'); location.href = 'login.html'; }

window.openConsultaModal = openConsultaModal; window.confirmarConsulta = confirmarConsulta; window.cancelarConsulta = cancelarConsulta; window.openMedicoModal = openMedicoModal; window.openUsuarioModal = openUsuarioModal; window.openEspecialidadeModal = openEspecialidadeModal; window.openProcedimentoModal = openProcedimentoModal; window.logoutAdmin = logoutAdmin;

document.addEventListener('DOMContentLoaded', () => {
  if (!requireAdmin()) return;
  bindNav();
  qs('consultaSearch')?.addEventListener('input', renderConsultas);
  qs('consultaForm')?.addEventListener('submit', e => { e.preventDefault(); saveConsulta(); });
  qs('medicoForm')?.addEventListener('submit', e => { e.preventDefault(); saveMedico(); });
  qs('usuarioForm')?.addEventListener('submit', e => { e.preventDefault(); saveUsuario(); });
  qs('especialidadeForm')?.addEventListener('submit', e => { e.preventDefault(); saveEspecialidade(); });
  qs('procedimentoForm')?.addEventListener('submit', e => { e.preventDefault(); saveProcedimento(); });
  loadAll().catch(err => toast(err.message, 'error'));
});
