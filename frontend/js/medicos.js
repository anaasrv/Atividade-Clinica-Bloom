/**
 * ============================================================================
 * ARQUIVO: medicos.js
 * PROJETO: Bloom Maternity - Clínica de Obstetrícia
 * DESCRIÇÃO: Gerenciamento de médicos, incluindo listagem, filtros,
 *            busca, detalhes do médico e integração com agendamento.
 * AUTOR: Bloom Maternity Team
 * VERSÃO: 1.0.0
 * ============================================================================
 */

// ============================================================================
// VARIÁVEIS GLOBAIS DE MÉDICOS
// ============================================================================
let medicosCompletos = [];
let medicoSelecionado = null;

function getBloomDoctorsFallback() {
    return Array.isArray(window.BLOOM_DOCTORS) ? window.BLOOM_DOCTORS : [];
}

function normalizarMedico(medico) {
    if (!medico) return medico;
    const especialidadeNome = medico.especialidade || medico.especialidade_info?.nome || 'Obstetrícia';
    return { ...medico, especialidade: especialidadeNome };
}
let currentFilter = 'all';
let searchTerm = '';
let currentPage = 1;
const itemsPerPage = 12;

// ============================================================================
// INICIALIZAÇÃO DA PÁGINA DE MÉDICOS
// ============================================================================
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar página de médicos se estiver na página correta
    if (document.getElementById('doctorsGrid')) {
        carregarMedicosGrid();
    }
    
    // Inicializar carrossel de médicos na home (se existir)
    if (document.getElementById('doctorsTrack')) {
        initDoctorCarousel();
    }
    
    // Inicializar página de detalhe do médico
    if (document.querySelector('.doctor-details-section')) {
        carregarDetalhesMedico();
    }
    
    // Inicializar busca e filtros de médicos
    initDoctorSearch();
    initDoctorFilters();
});

// ============================================================================
// CARREGAMENTO DE MÉDICOS PARA GRID (PÁGINA DE MÉDICOS)
// ============================================================================
async function carregarMedicosGrid() {
    const doctorsGrid = document.getElementById('doctorsGrid');
    const loadingDiv = document.getElementById('loadingDoctors');
    
    if (!doctorsGrid) return;
    
    try {
        if (loadingDiv) loadingDiv.style.display = 'block';
        
        const response = await fetch(`${API_BASE_URL}/medicos`);
        const data = await response.json();
        
        if (data.medicos && data.medicos.length > 0) {
            medicosCompletos = data.medicos.map(normalizarMedico);
            renderDoctorsGrid(medicosCompletos);
        } else {
            doctorsGrid.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="bi bi-people fs-1 text-muted"></i>
                    <h4 class="mt-3">Nenhum médico encontrado</h4>
                    <p class="text-muted">Tente novamente mais tarde.</p>
                </div>
            `;
        }
        
        if (loadingDiv) loadingDiv.style.display = 'none';
        
    } catch (error) {
        console.warn('API de médicos indisponível. Usando dados locais oficiais:', error);
        if (loadingDiv) loadingDiv.style.display = 'none';
        const fallback = getBloomDoctorsFallback().map(normalizarMedico);
        if (fallback.length) {
            medicosCompletos = fallback;
            renderDoctorsGrid(medicosCompletos);
        } else {
            doctorsGrid.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="bi bi-bug fs-1 text-danger"></i>
                    <h4 class="mt-3">Erro ao carregar médicos</h4>
                    <p class="text-muted">Verifique sua conexão e tente novamente.</p>
                    <button class="btn btn-pink rounded-pill" onclick="carregarMedicosGrid()">
                        <i class="bi bi-arrow-repeat"></i> Tentar novamente
                    </button>
                </div>
            `;
        }
    }
}

function renderDoctorsGrid(medicos) {
    const doctorsGrid = document.getElementById('doctorsGrid');
    if (!doctorsGrid) return;
    
    // Aplicar filtros e busca
    let filteredMedicos = medicos;
    
    // Filtrar por especialidade. Usa comparação flexível para funcionar com
    // especialidades compostas, como "Medicina Fetal e Ultrassonografia".
    if (currentFilter !== 'all') {
        const filterTerm = String(currentFilter).trim().toLowerCase();
        filteredMedicos = filteredMedicos.filter(m => {
            const specialty = String(m.especialidade || '').trim().toLowerCase();
            const areas = Array.isArray(m.areas) ? m.areas.join(' ').toLowerCase() : '';
            return specialty === filterTerm ||
                   specialty.includes(filterTerm) ||
                   filterTerm.includes(specialty) ||
                   areas.includes(filterTerm);
        });
    }
    
    // Filtrar por busca
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filteredMedicos = filteredMedicos.filter(m => 
            m.nome.toLowerCase().includes(term) ||
            m.especialidade?.toLowerCase().includes(term) ||
            m.crm?.toLowerCase().includes(term)
        );
    }
    
    // Paginação
    const totalPages = Math.ceil(filteredMedicos.length / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage;
    const paginatedMedicos = filteredMedicos.slice(start, start + itemsPerPage);
    
    if (paginatedMedicos.length === 0) {
        doctorsGrid.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="bi bi-search fs-1 text-muted"></i>
                <h4 class="mt-3">Nenhum médico encontrado</h4>
                <p class="text-muted">Tente ajustar seus filtros de busca.</p>
            </div>
        `;
        return;
    }
    
    doctorsGrid.innerHTML = paginatedMedicos.map(medico => `
        <div class="col-lg-4 col-md-6 doctor-card-item" data-especialidade="${medico.especialidade}">
            <div class="card h-100 border-0 shadow-sm rounded-4 overflow-hidden transition">
                <div class="doctor-image-wrapper position-relative">
                    <img src="${medico.foto || 'https://randomuser.me/api/portraits/women/68.jpg'}" 
                         class="card-img-top" 
                         alt="${medico.nome}"
                         style="height: 280px; object-fit: cover;">
                    <div class="doctor-social-overlay">
                        <a href="#" class="btn-social" onclick="event.preventDefault()"><i class="bi bi-instagram"></i></a>
                        <a href="#" class="btn-social" onclick="event.preventDefault()"><i class="bi bi-linkedin"></i></a>
                        <a href="#" class="btn-social" onclick="event.preventDefault()"><i class="bi bi-envelope"></i></a>
                    </div>
                    ${medico.disponivel ? '<span class="badge bg-success position-absolute top-0 start-0 m-3">Disponível</span>' : ''}
                </div>
                <div class="card-body text-center p-4">
                    <h4 class="card-title fw-bold mb-1">${medico.nome}</h4>
                    <p class="text-pink fw-semibold mb-2">${medico.especialidade || 'Obstetrícia'}</p>
                    <p class="text-muted small">CRM: ${medico.crm || '12345-SP'}</p>
                    <div class="rating mb-3">
                        ${gerarEstrelasGrid(medico.avaliacao || 5)}
                        <span class="ms-2 small">(${medico.total_avaliacoes || 0} avaliações)</span>
                    </div>
                    <p class="card-text text-muted small">${medico.resumo || 'Especialista em obstetrícia e cuidados maternos.'}</p>
                    <div class="d-flex gap-2 mt-3">
                        <a href="medico-detalhe.html?id=${medico.id}" class="btn btn-outline-pink rounded-pill flex-grow-1">
                            <i class="bi bi-person"></i> Perfil
                        </a>
                        <button class="btn btn-gradient rounded-pill flex-grow-1" onclick="agendarComMedico(${medico.id})">
                            <i class="bi bi-calendar-heart"></i> Agendar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    // Adicionar paginação se necessário
    if (totalPages > 1) {
        renderPagination(totalPages);
    } else {
        const existingPagination = document.getElementById('paginationContainer');
        if (existingPagination) existingPagination.remove();
    }
}

function gerarEstrelasGrid(avaliacao) {
    const estrelasCheias = Math.floor(avaliacao);
    const temMeiaEstrela = avaliacao % 1 >= 0.5;
    let html = '';
    
    for (let i = 1; i <= 5; i++) {
        if (i <= estrelasCheias) {
            html += '<i class="bi bi-star-fill text-warning"></i>';
        } else if (temMeiaEstrela && i === estrelasCheias + 1) {
            html += '<i class="bi bi-star-half text-warning"></i>';
        } else {
            html += '<i class="bi bi-star text-warning"></i>';
        }
    }
    
    return html;
}

function renderPagination(totalPages) {
    let paginationContainer = document.getElementById('paginationContainer');
    
    if (!paginationContainer) {
        paginationContainer = document.createElement('div');
        paginationContainer.id = 'paginationContainer';
        paginationContainer.className = 'd-flex justify-content-center mt-5';
        document.getElementById('doctorsGrid')?.parentNode?.appendChild(paginationContainer);
    }
    
    let paginationHtml = '<nav><ul class="pagination">';
    
    // Botão anterior
    paginationHtml += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <button class="page-link" onclick="mudarPagina(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
                <i class="bi bi-chevron-left"></i>
            </button>
        </li>
    `;
    
    // Números das páginas
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage + 1 < maxVisible) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    if (startPage > 1) {
        paginationHtml += `<li class="page-item"><button class="page-link" onclick="mudarPagina(1)">1</button></li>`;
        if (startPage > 2) {
            paginationHtml += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHtml += `
            <li class="page-item ${currentPage === i ? 'active' : ''}">
                <button class="page-link" onclick="mudarPagina(${i})">${i}</button>
            </li>
        `;
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHtml += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
        paginationHtml += `<li class="page-item"><button class="page-link" onclick="mudarPagina(${totalPages})">${totalPages}</button></li>`;
    }
    
    // Botão próximo
    paginationHtml += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <button class="page-link" onclick="mudarPagina(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
                <i class="bi bi-chevron-right"></i>
            </button>
        </li>
    `;
    
    paginationHtml += '</ul></nav>';
    paginationContainer.innerHTML = paginationHtml;
}

function mudarPagina(page) {
    if (page < 1) return;
    currentPage = page;
    renderDoctorsGrid(medicosCompletos);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function agendarComMedico(medicoId) {
    const token = getAuthToken();
    if (!token) {
        showToast('Por favor, faça login para agendar uma consulta', 'warning');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }
    window.location.href = `agendamento.html?medico=${medicoId}`;
}

// ============================================================================
// FILTROS E BUSCA DE MÉDICOS
// ============================================================================
function initDoctorSearch() {
    const searchInput = document.getElementById('doctorSearch');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(function(e) {
            searchTerm = e.target.value;
            currentPage = 1;
            renderDoctorsGrid(medicosCompletos);
        }, 500));
    }
}

function initDoctorFilters() {
    const filterButtons = document.querySelectorAll('#filterButtons .filter-btn');
    if (!filterButtons.length) return;

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.dataset.filter || 'all';

            filterButtons.forEach(btn => {
                btn.classList.remove('active', 'btn-pink');
                btn.classList.add('btn-outline-pink');
            });

            button.classList.add('active', 'btn-pink');
            button.classList.remove('btn-outline-pink');
            aplicarFiltro(filter);
        });
    });
}

function aplicarFiltro(filter) {
    currentFilter = filter || 'all';
    currentPage = 1;
    renderDoctorsGrid(medicosCompletos);
}

// ============================================================================
// CARROSSEL DE MÉDICOS (HOME PAGE)
// ============================================================================
function initDoctorCarousel() {
    const track = document.getElementById('doctorsTrack');
    const prevBtn = document.getElementById('doctorsPrev');
    const nextBtn = document.getElementById('doctorsNext');
    
    if (!track) return;
    
    let currentPosition = 0;
    const getCardStep = () => {
        const card = track.querySelector('.doctor-card');
        const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || 24) || 24;
        return card ? card.getBoundingClientRect().width + gap : 344;
    };
    const getMaxScroll = () => Math.max(0, track.scrollWidth - track.clientWidth);
    const updateNavButtons = () => {
        currentPosition = track.scrollLeft;
        if (prevBtn) prevBtn.disabled = currentPosition <= 2;
        if (nextBtn) nextBtn.disabled = currentPosition >= getMaxScroll() - 2;
    };
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentPosition = Math.max(0, track.scrollLeft - getCardStep());
            track.scrollTo({ left: currentPosition, behavior: 'smooth' });
            setTimeout(updateNavButtons, 350);
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentPosition = Math.min(getMaxScroll(), track.scrollLeft + getCardStep());
            track.scrollTo({ left: currentPosition, behavior: 'smooth' });
            setTimeout(updateNavButtons, 350);
        });
    }

    track.addEventListener('scroll', debounce(updateNavButtons, 80));
    window.addEventListener('resize', debounce(updateNavButtons, 120));
    updateNavButtons();
    
    // Carregar médicos para o carrossel
    carregarMedicosCarrossel();
}

async function carregarMedicosCarrossel() {
    const track = document.getElementById('doctorsTrack');
    if (!track) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/medicos?limite=8`);
        const data = await response.json();
        
        if (data.medicos && data.medicos.length > 0) {
            track.innerHTML = data.medicos.map(normalizarMedico).map(medico => `
                <div class="doctor-card">
                    <div class="card h-100 border-0 shadow-lg rounded-4 overflow-hidden">
                        <div class="doctor-image-wrapper">
                            <img src="${medico.foto || 'https://randomuser.me/api/portraits/women/68.jpg'}" 
                                 class="card-img-top" 
                                 alt="${medico.nome}"
                                 style="height: 280px; object-fit: cover;">
                            <div class="doctor-social-overlay">
                                <a href="#" class="btn-social" onclick="event.preventDefault()"><i class="bi bi-instagram"></i></a>
                                <a href="#" class="btn-social" onclick="event.preventDefault()"><i class="bi bi-linkedin"></i></a>
                            </div>
                        </div>
                        <div class="card-body text-center p-4">
                            <h4 class="card-title fw-bold mb-1">${medico.nome}</h4>
                            <p class="text-pink fw-semibold mb-2">${medico.especialidade || 'Obstetrícia'}</p>
                            <p class="text-muted small">CRM: ${medico.crm || '12345-SP'}</p>
                            <div class="rating mb-3">
                                ${gerarEstrelasGrid(medico.avaliacao || 5)}
                                <span class="ms-2 small">(${medico.total_avaliacoes || 0})</span>
                            </div>
                            <p class="card-text text-muted small">${(medico.resumo || 'Especialista em obstetrícia').substring(0, 80)}...</p>
                            <a href="medico-detalhe.html?id=${medico.id}" class="btn btn-pink rounded-pill w-100 mt-2">
                                Ver Perfil <i class="bi bi-arrow-right"></i>
                            </a>
                        </div>
                    </div>
                </div>
            `).join('');
            harmonizarCarrosselMedicos(track);
        }
        
    } catch (error) {
        console.warn('API do carrossel indisponível. Usando dados locais oficiais:', error);
        const fallback = getBloomDoctorsFallback();
        if (fallback.length) {
            track.innerHTML = fallback.map(medico => `
                <div class="doctor-card">
                    <div class="card h-100 border-0 shadow-lg rounded-4 overflow-hidden">
                        <div class="doctor-image-wrapper">
                            <img src="${medico.foto}" class="card-img-top" alt="${medico.nome}" style="height: 280px; object-fit: cover;">
                        </div>
                        <div class="card-body text-center p-4">
                            <h4 class="card-title fw-bold mb-1">${medico.nome}</h4>
                            <p class="text-pink fw-semibold mb-2">${medico.especialidade}</p>
                            <p class="text-muted small">CRM: ${medico.crm} | RQE: ${medico.rqe}</p>
                            <div class="rating mb-3">${gerarEstrelasGrid(medico.avaliacao || 5)} <span class="ms-2 small">(${medico.total_avaliacoes || 0})</span></div>
                            <p class="card-text text-muted small">${medico.resumo}</p>
                            <a href="medico-detalhe.html?id=${medico.id}" class="btn btn-pink rounded-pill w-100 mt-2">Ver Perfil <i class="bi bi-arrow-right"></i></a>
                        </div>
                    </div>
                </div>`).join('');
            harmonizarCarrosselMedicos(track);
        }
    }
}

function harmonizarCarrosselMedicos(track) {
    if (!track) return;
    track.scrollLeft = 0;
    track.querySelectorAll('.doctor-card .card-body').forEach(body => {
        body.classList.add('d-flex', 'flex-column');
    });
    track.querySelectorAll('.doctor-card .btn').forEach(btn => {
        btn.classList.add('mt-auto');
    });
}

// ============================================================================
// PÁGINA DE DETALHES DO MÉDICO
// ============================================================================
async function carregarDetalhesMedico() {
    const urlParams = new URLSearchParams(window.location.search);
    const medicoId = urlParams.get('id');
    
    if (!medicoId) {
        showToast('Médico não encontrado', 'error');
        setTimeout(() => {
            window.location.href = 'medicos.html';
        }, 1200);
        return;
    }

    const medicoLocal = getBloomDoctorsFallback().find(m => String(m.id) === String(medicoId));

    // Renderiza primeiro os dados locais oficiais. Assim a página nunca aparece
    // temporariamente com a Dra. Ana e depois troca para outro médico.
    if (medicoLocal) {
        medicoSelecionado = medicoLocal;
        window.medicoSelecionado = medicoLocal;
        renderizarDetalhesMedico(medicoLocal);
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/medicos/${medicoId}`);
        if (!response.ok) throw new Error('API indisponível');
        const data = await response.json();
        
        if (data.medico && String(data.medico.id) === String(medicoId)) {
            // Mesclar: API tem prioridade, mas campos null não sobrescrevem dados locais
            const merged = { ...(medicoLocal || {}) };
            for (const [key, val] of Object.entries(data.medico)) {
                if (val !== null && val !== undefined) merged[key] = val;
            }
            medicoSelecionado = normalizarMedico(merged);
            window.medicoSelecionado = medicoSelecionado;
            renderizarDetalhesMedico(medicoSelecionado);
        } else if (!medicoLocal) {
            throw new Error('Médico não encontrado');
        }
        
    } catch (error) {
        console.warn('API de detalhes indisponível ou divergente. Usando dados locais oficiais:', error);
        if (!medicoLocal) {
            showToast('Médico não encontrado', 'error');
        }
    }
}

function renderizarDetalhesMedico(medico) {
    medico = normalizarMedico(medico);

    const setText = (selector, value) => {
        const el = document.querySelector(selector);
        if (el && value !== undefined && value !== null) el.textContent = value;
    };
    const setHTML = (selector, value) => {
        const el = document.querySelector(selector);
        if (el && value !== undefined && value !== null) el.innerHTML = value;
    };

    const foto = medico.foto || '../assets/images/dra-ana-carolina-mendes.png';
    const img = document.querySelector('.doctor-profile-image img');
    if (img) {
        img.src = foto;
        img.alt = medico.nome;
    }

    document.title = `${medico.nome} | Bloom Maternity`;
    setText('.doctor-info h1', medico.nome);
    setText('.doctor-info .lead.text-pink', medico.especialidade);
    setText('.doctor-info p.lead.mb-4', medico.descricao || medico.resumo);

    // Formatar dias de atendimento
    const diasNomes = { 0: 'Dom', 1: 'Seg', 2: 'Ter', 3: 'Qua', 4: 'Qui', 5: 'Sex', 6: 'Sáb' };
    const dias = medico.dias_atendimento ? medico.dias_atendimento.split(',').map(Number).filter(d => !isNaN(d)) : [];
    const diasTexto = dias.length ? dias.map(d => diasNomes[d]).filter(Boolean).join(', ') : 'Seg a Sex';

    // Formatar horários de atendimento
    const formatHora = (h) => h ? h.substring(0, 5) : '—';
    const horarioTexto = `${formatHora(medico.horario_inicio)} às ${formatHora(medico.horario_fim)}`;

    const idiomas = medico.idiomas && medico.idiomas.length ? medico.idiomas : ['Português'];
    setHTML('.doctor-meta', `
        <span class="badge rounded-pill"><i class="bi bi-person-badge me-1"></i> CRM: ${medico.crm || '—'}</span>
        <span class="badge rounded-pill"><i class="bi bi-award me-1"></i> RQE: ${medico.rqe || '—'}</span>
        <span class="badge rounded-pill"><i class="bi bi-clock-history me-1"></i> ${medico.experiencia_anos || 0} anos</span>
        <span class="badge rounded-pill"><i class="bi bi-translate me-1"></i> ${idiomas.join(' / ')}</span>
        <span class="badge rounded-pill"><i class="bi bi-calendar-week me-1"></i> ${diasTexto}</span>
    `);

    // Contato e horários
    setHTML('.doctor-info .doctor-contact-info', `
        <div class="d-flex flex-wrap gap-3 mt-3 pt-3 border-top border-pink border-opacity-10">
            ${medico.email ? `<span class="text-muted small"><i class="bi bi-envelope text-pink me-1"></i> ${medico.email}</span>` : ''}
            ${medico.telefone ? `<span class="text-muted small"><i class="bi bi-telephone text-pink me-1"></i> ${medico.telefone}</span>` : ''}
            <span class="text-muted small"><i class="bi bi-clock text-pink me-1"></i> ${diasTexto} • ${horarioTexto}</span>
            ${medico.intervalo_consulta ? `<span class="text-muted small"><i class="bi bi-hourglass-split text-pink me-1"></i> Consultas de ${medico.intervalo_consulta}min</span>` : ''}
        </div>
    `);

    setHTML('.rating', `
        ${gerarEstrelasGrid(medico.avaliacao || 5)}
        <span class="ms-2 fw-semibold"><span class="text-pink">${Number(medico.avaliacao || 5).toFixed(1)}</span> (${medico.total_avaliacoes || 0} avaliações)</span>
    `);

    // === ABA SOBRE ===
    const areas = medico.areas && medico.areas.length ? medico.areas : ['Atendimento geral'];
    const subespecialidades = areas.slice(0, 5);
    const especialidadeDesc = medico.especialidade_info?.descricao || '';
    const premios = medico.premios ? (typeof medico.premios === 'string' ? medico.premios : Array.isArray(medico.premios) ? medico.premios.join(', ') : '') : '';
    const formacaoItems = medico.formacao && medico.formacao.length ? medico.formacao : [];

    setHTML('#sobreCard', `
        <h3 class="fw-bold mb-4 text-center text-lg-start"><i class="bi bi-person-lines-fill text-pink me-2"></i>Sobre ${medico.nome}</h3>

        ${especialidadeDesc ? `
        <div class="sobre-desc-box mb-5">
            <div class="d-flex align-items-start gap-4">
                <div class="sobre-desc-icon">
                    <i class="bi bi-quote"></i>
                </div>
                <div class="sobre-desc-content">
                    <p class="sobre-desc-text mb-0">${especialidadeDesc}</p>
                    <div class="sobre-desc-decoration">
                        <span></span><span></span><span></span>
                    </div>
                </div>
            </div>
        </div>` : ''}

        <div class="sobre-grid">
            <div class="sobre-card h-100">
                <div class="sobre-card-header">
                    <div class="sobre-card-icon"><i class="bi bi-check2-circle"></i></div>
                    <h6 class="sobre-section-title mb-0">Áreas de Atuação</h6>
                </div>
                <div class="sobre-card-body">
                    <div class="areas-grid">
                        ${areas.map(a => `<div class="area-item"><span class="area-dot"></span><span class="area-text">${a}</span></div>`).join('')}
                    </div>
                </div>
            </div>
            <div class="sobre-card h-100">
                <div class="sobre-card-header">
                    <div class="sobre-card-icon"><i class="bi bi-translate"></i></div>
                    <h6 class="sobre-section-title mb-0">Idiomas</h6>
                </div>
                <div class="sobre-card-body">
                    <div class="idiomas-grid">
                        ${idiomas.map(i => `<div class="idioma-item"><span class="idioma-dot"></span><span class="idioma-text">${i}</span></div>`).join('')}
                    </div>
                </div>
            </div>
            <div class="sobre-card h-100">
                <div class="sobre-card-header">
                    <div class="sobre-card-icon"><i class="bi bi-clock-history"></i></div>
                    <h6 class="sobre-section-title mb-0">Experiência</h6>
                </div>
                <div class="sobre-card-body">
                    <div class="experiencia-stats">
                        <div class="experiencia-stat">
                            <div class="experiencia-stat-value">${medico.experiencia_anos || 0}</div>
                            <div class="experiencia-stat-label">Anos de atuação</div>
                            <div class="experiencia-stat-icon"><i class="bi bi-briefcase"></i></div>
                        </div>
                        <div class="experiencia-stat">
                            <div class="experiencia-stat-value">${medico.especialidade}</div>
                            <div class="experiencia-stat-label">Especialidade</div>
                            <div class="experiencia-stat-icon"><i class="bi bi-star"></i></div>
                        </div>
                    </div>
                    <div class="experiencia-details">
                        <div class="experiencia-detail"><i class="bi bi-calendar-week me-2"></i> ${diasTexto}</div>
                        <div class="experiencia-detail"><i class="bi bi-clock me-2"></i> ${horarioTexto}</div>
                    </div>
                </div>
            </div>
            <div class="sobre-card h-100">
                <div class="sobre-card-header">
                    <div class="sobre-card-icon"><i class="bi bi-patch-check"></i></div>
                    <h6 class="sobre-section-title mb-0">Registros Profissionais</h6>
                </div>
                <div class="sobre-card-body">
                    <div class="registros-container">
                        <div class="registro-item">
                            <div class="registro-icon"><i class="bi bi-file-medical"></i></div>
                            <div class="registro-content">
                                <span class="registro-label">CRM</span>
                                <span class="registro-value">${medico.crm || '—'}</span>
                            </div>
                        </div>
                        <div class="registro-item">
                            <div class="registro-icon"><i class="bi bi-file-earmark-check"></i></div>
                            <div class="registro-content">
                                <span class="registro-label">RQE</span>
                                <span class="registro-value">${medico.rqe || '—'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        ${premios ? `
        <div class="sobre-card mt-4">
            <div class="sobre-card-header">
                <div class="sobre-card-icon"><i class="bi bi-trophy"></i></div>
                <h6 class="sobre-section-title mb-0">Prêmios e Reconhecimentos</h6>
            </div>
            <div class="sobre-card-body">
                <div class="premios-content">
                    <p class="mb-0 sobre-premios-text">${premios}</p>
                    <div class="premios-decoration">
                        <i class="bi bi-award"></i><i class="bi bi-star"></i><i class="bi bi-heart"></i>
                    </div>
                </div>
            </div>
        </div>` : ''}
        ${subespecialidades.length ? `
        <div class="sobre-grid mt-4" style="grid-template-columns: ${premios ? '1fr 1fr' : '1.4fr 1fr'}; justify-content: center;">
            <div class="sobre-card h-100">
                <div class="sobre-card-header">
                    <div class="sobre-card-icon" style="width:32px;height:32px;font-size:0.9rem"><i class="bi bi-star"></i></div>
                    <h6 class="sobre-section-title mb-0">Especialidades</h6>
                </div>
                <div class="sobre-card-body">
                    <div class="especialidades-badges">
                        ${subespecialidades.map(s => `<span class="badge rounded-pill px-3 py-2 shadow-sm tag-badge"><i class="bi bi-dot me-1"></i>${s}</span>`).join('')}
                    </div>
                </div>
            </div>
            <div class="sobre-card h-100">
                <div class="sobre-card-header">
                    <div class="sobre-card-icon" style="width:32px;height:32px;font-size:0.9rem"><i class="bi bi-heart-pulse"></i></div>
                    <h6 class="sobre-section-title mb-0">Perfil de Atendimento</h6>
                </div>
                <div class="sobre-card-body">
                    <div class="perfil-badges">
                        <span class="badge rounded-pill px-3 py-2 tag-badge-alt"><i class="bi bi-heart me-1"></i> Humanizado</span>
                        <span class="badge rounded-pill px-3 py-2 tag-badge-alt"><i class="bi bi-clipboard-check me-1"></i> Individualizado</span>
                        <span class="badge rounded-pill px-3 py-2 tag-badge-alt"><i class="bi bi-chat-dots me-1"></i> Comunicação clara</span>
                        <span class="badge rounded-pill px-3 py-2 tag-badge-alt"><i class="bi bi-shield-check me-1"></i> Cuidado seguro</span>
                    </div>
                </div>
            </div>
        </div>` : ''}
    `);

    // === ABA FORMAÇÃO ===
    setHTML('#formacao .card', `
        <h3 class="fw-bold mb-4 text-center text-lg-start"><i class="bi bi-mortarboard text-pink me-2"></i>Formação Acadêmica</h3>
        ${formacaoItems.length ? `
            <div class="timeline">${formacaoItems.map(item => {
                const icon = item.tipo === 'Graduação' ? 'bi-book' : item.tipo === 'Residência' ? 'bi-hospital' : item.tipo === 'Especialização' || item.tipo === 'Pós-graduação' ? 'bi-award' : 'bi-patch-check';
                const badgeClass = item.tipo === 'Graduação' ? 'bg-primary' : item.tipo === 'Residência' ? 'bg-info' : item.tipo === 'Especialização' ? 'bg-success' : item.tipo === 'Pós-graduação' ? 'bg-warning text-dark' : 'bg-secondary';
                return `
                    <div class="timeline-item mb-4">
                        <div class="timeline-icon bg-gradient-pink shadow-sm"><i class="bi ${icon} text-white"></i></div>
                        <div class="timeline-content">
                            <div class="d-flex justify-content-between align-items-start flex-wrap">
                                <h5 class="mb-1 fw-bold">${item.titulo}</h5>
                                <span class="badge bg-light-pink text-pink rounded-pill">${item.ano}</span>
                            </div>
                            <p class="text-muted mb-1"><i class="bi bi-building me-1"></i> ${item.instituicao}</p>
                            <span class="badge ${badgeClass} text-white rounded-pill">${item.tipo}</span>
                        </div>
                    </div>`;
            }).join('')}</div>
        ` : '<p class="text-muted">Informações de formação não disponíveis.</p>'}
    `);

    // === ABA EXPERIÊNCIA ===
    const experienciaItems = medico.experiencia && medico.experiencia.length ? medico.experiencia : [];
    setHTML('#experiencia .card', `
        <h3 class="fw-bold mb-4 text-center text-lg-start"><i class="bi bi-briefcase text-pink me-2"></i>Experiência Profissional</h3>
        <div class="d-flex align-items-center gap-3 mb-4 p-3 rounded-3" style="background:rgba(255,107,157,0.05)">
            <div class="rounded-circle bg-gradient-pink text-white d-flex align-items-center justify-content-center flex-shrink-0" style="width:44px;height:44px">
                <i class="bi bi-clock-history fs-5"></i>
            </div>
            <div>
                <strong class="d-block" style="font-size:0.95rem">${medico.experiencia_anos || 0} anos de trajetória</strong>
                <span class="text-muted small">Atuação ininterrupta na área da saúde</span>
            </div>
        </div>
        ${experienciaItems.length ? `
            <div class="row g-4">${experienciaItems.map((item, idx) => {
                const icons = ['bi-building', 'bi-hospital', 'bi-heart-pulse', 'bi-people', 'bi-clipboard2-pulse', 'bi-shield-check'];
                const icon = icons[idx % icons.length];
                return `
                <div class="col-md-6">
                    <div class="exp-card h-100 p-4">
                        <div class="d-flex align-items-start gap-3 mb-3">
                            <div class="exp-icon flex-shrink-0">
                                <i class="bi ${icon}"></i>
                            </div>
                            <div class="flex-grow-1 min-w-0">
                                <h6 class="fw-bold mb-1" style="font-size:0.95rem">${item.titulo}</h6>
                                <p class="mb-0 small" style="color:#b3547a;font-weight:500">${item.local}</p>
                            </div>
                        </div>
                        <div class="d-flex align-items-center gap-2 mb-3">
                            <span class="badge rounded-pill exp-badge"><i class="bi bi-calendar3 me-1"></i> ${item.periodo}</span>
                        </div>
                        <p class="text-muted mb-0" style="line-height:1.6;font-size:0.88rem">${item.descricao}</p>
                    </div>
                </div>`;
            }).join('')}</div>
        ` : '<div class="text-center py-5"><i class="bi bi-briefcase display-4 d-block mb-3 text-pink opacity-50"></i><h5>Nenhuma experiência cadastrada</h5></div>'}
    `);

    // === ABA EXAMES ===
    const examesItems = medico.exames && medico.exames.length ? medico.exames : [];
    const examesRow = document.querySelector('#exames .card .row') || document.querySelector('#examesGrid');
    if (examesRow) {
        const icons = ['bi-clipboard2-pulse','bi-heart-pulse','bi-eyedropper','bi-mother','bi-cpu','bi-magic','bi-activity','bi-droplet'];
        examesRow.innerHTML = examesItems.length ? examesItems.map((exame, idx) => `
        <div class="col-md-6 col-lg-4">
            <div class="exam-card h-100 p-4">
                <div class="d-flex justify-content-between align-items-start mb-3">
                    <div class="exam-card-icon">
                        <i class="bi ${icons[idx % icons.length]}"></i>
                    </div>
                    <span class="exam-duration"><i class="bi bi-clock me-1"></i> ${exame.duracao}</span>
                </div>
                <h6 class="fw-bold mb-2" style="font-size:0.95rem">${exame.nome}</h6>
                <p class="text-muted mb-3" style="line-height:1.6;font-size:0.85rem">${exame.descricao}</p>
                <div class="d-flex justify-content-between align-items-center pt-3" style="border-top:1px solid rgba(255,107,157,0.08)">
                    <span class="exam-price">R$ ${(exame.preco || 0).toLocaleString('pt-BR')}</span>
                    <a href="agendamento.html?medico=${medico.id}&exame=${encodeURIComponent(exame.nome)}" class="btn btn-sm exam-btn rounded-pill px-3">
                        <i class="bi bi-calendar-heart me-1"></i> Agendar
                    </a>
                </div>
            </div>
        </div>
    `).join('') : '<div class="col-12 text-center text-muted py-5"><i class="bi bi-clipboard-x display-4 d-block mb-3 text-pink opacity-50"></i><h5>Nenhum exame cadastrado</h5><p>Este médico ainda não possui exames ou procedimentos cadastrados.</p></div>';
    }

    // === ABA AVALIAÇÕES ===
    const avalData = medico.avaliacoes || {};
    const totalAvaliacoes = avalData.total || medico.total_avaliacoes || 0;
    const media = avalData.media || medico.avaliacao || 5;
    const satisfacao = avalData.satisfacao || Math.round((media / 5) * 100);
    const dist = avalData.distribuicao || { 5: Math.round(totalAvaliacoes*0.7), 4: Math.round(totalAvaliacoes*0.2), 3: Math.round(totalAvaliacoes*0.07), 2: Math.round(totalAvaliacoes*0.02), 1: Math.round(totalAvaliacoes*0.01) };
    const comentarios = (avalData.comentarios || []).slice();

    const usuarioNome = (() => {
        try {
            const u = JSON.parse(localStorage.getItem('bloom_user') || sessionStorage.getItem('bloom_user') || '{}');
            return u.nome || '';
        } catch(e) { return ''; }
    })();

    setHTML('#avaliacoes .card .reviews-list', `
        <div class="row g-4 mb-4">
            <div class="col-md-4 text-center p-4 bg-light-pink rounded-4">
                <div class="display-4 fw-bold text-pink">${Number(media).toFixed(1)}</div>
                <div class="mb-2">${gerarEstrelasGrid(media)}</div>
                <p class="text-muted mb-0">Média de ${totalAvaliacoes} avaliações</p>
            </div>
            <div class="col-md-4 text-center p-4 bg-light-pink rounded-4">
                <div class="display-4 fw-bold text-pink">${satisfacao}%</div>
                <p class="fw-semibold mb-1">Satisfação</p>
                <p class="text-muted mb-0">das pacientes recomendam</p>
            </div>
            <div class="col-md-4 p-4 bg-light-pink rounded-4">
                <h6 class="fw-bold text-pink mb-3">Distribuição das Avaliações</h6>
                ${[5,4,3,2,1].map(star => {
                    const count = dist[star] || 0;
                    const pct = totalAvaliacoes > 0 ? Math.round((count / totalAvaliacoes) * 100) : 0;
                    return `<div class="d-flex align-items-center gap-2 mb-1">
                        <small class="text-muted fw-bold" style="width:25px">${star}★</small>
                        <div class="progress flex-grow-1" style="height:8px;border-radius:4px;background:#e9ecef">
                            <div class="progress-bar bg-warning rounded-pill" style="width:${pct}%;transition:width 0.8s ease"></div>
                        </div>
                        <small class="text-muted" style="width:30px;text-align:right">${count}</small>
                    </div>`;
                }).join('')}
            </div>
        </div>
        ${comentarios.length ? `
            <h5 class="fw-bold mb-4"><i class="bi bi-chat-left-text text-pink me-2"></i>Comentários de Pacientes</h5>
            <div id="comentariosList">${comentarios.slice(0, 3).map(c => `
                <div class="review-item mb-3 p-4 border rounded-4 shadow-sm">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <div>
                            <h6 class="fw-bold mb-1">${c.nome}</h6>
                            <small class="text-muted"><i class="bi bi-calendar me-1"></i> ${c.data}</small>
                        </div>
                        <div class="rating">${gerarEstrelasGrid(c.nota)}</div>
                    </div>
                    <p class="mb-2" style="line-height:1.7">${c.texto}</p>
                    ${c.verificado ? '<small class="text-success fw-semibold"><i class="bi bi-patch-check-fill me-1"></i> Avaliação verificada</small>' : ''}
                </div>
            `).join('')}</div>
            ${comentarios.length > 3 ? `
            <div class="text-center mt-4">
                <button class="btn btn-outline-pink rounded-pill px-5" onclick="mostrarMaisAvaliacoes(this, ${medico.id})">
                    <i class="bi bi-arrow-down-circle me-1"></i> Ver mais ${comentarios.length - 3} avaliações
                </button>
            </div>` : ''}
        ` : '<div class="text-center py-5" id="semAvaliacoes"><i class="bi bi-chat-square-text display-4 d-block mb-3 text-pink opacity-50"></i><h5>Nenhuma avaliação ainda</h5><p class="text-muted">Seja o primeiro a avaliar este profissional.</p></div>'}
        <hr class="my-4">
        <div class="bg-white rounded-4 p-4 shadow-sm border">
            <h5 class="fw-bold mb-3"><i class="bi bi-pencil-square text-pink me-2"></i>Deixe sua Avaliação</h5>
            <form id="formAvaliacao" onsubmit="return enviarAvaliacao(event, ${medico.id})">
                <div class="mb-3">
                    <label class="form-label fw-semibold small text-muted">Sua nota</label>
                    <div class="rating-input d-flex gap-1 fs-3" id="ratingStars">
                        ${[1,2,3,4,5].map(s => `<i class="bi bi-star text-pink" data-value="${s}" style="cursor:pointer;transition:all .15s" onmouseenter="hoverStar(this)" onmouseleave="unhoverStar(this)" onclick="setStar(this)"></i>`).join('')}
                    </div>
                    <input type="hidden" name="nota" id="notaInput" value="0">
                </div>
                <div class="mb-3">
                    <label for="comentarioInput" class="form-label fw-semibold small text-muted">Seu comentário</label>
                    <textarea class="form-control rounded-3" id="comentarioInput" rows="3" placeholder="Conte sua experiência com este profissional..." style="resize:vertical"></textarea>
                </div>
                <button type="submit" class="btn btn-gradient rounded-pill px-5">
                    <i class="bi bi-send me-2"></i> Enviar Avaliação
                </button>
            </form>
        </div>
    `);

    window.mostrarMaisAvaliacoes = function(btn, medicoId) {
        const med = getBloomDoctorsFallback().find(m => String(m.id) === String(medicoId)) || medicoSelecionado;
        if (!med || !med.avaliacoes || !med.avaliacoes.comentarios) return;
        const extras = med.avaliacoes.comentarios.slice(3);
        if (!extras.length) return;
        const container = document.querySelector('#avaliacoes .card .reviews-list');
        if (!container) return;
        extras.forEach(c => {
            const div = document.createElement('div');
            div.className = 'review-item mb-3 p-4 border rounded-4 shadow-sm bg-white';
            div.innerHTML = `
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <div>
                        <h6 class="fw-bold mb-1">${c.nome}</h6>
                        <small class="text-muted"><i class="bi bi-calendar me-1"></i> ${c.data}</small>
                    </div>
                    <div class="rating">${gerarEstrelasGrid(c.nota)}</div>
                </div>
                <p class="mb-2" style="line-height:1.7">${c.texto}</p>
                ${c.verificado ? '<small class="text-success fw-semibold"><i class="bi bi-patch-check-fill me-1"></i>Avaliação verificada</small>' : ''}
            `;
            container.appendChild(div);
        });
        btn.disabled = true;
        btn.innerHTML = '<i class="bi bi-check-circle me-1"></i> Todas as avaliações exibidas';
        btn.classList.remove('btn-outline-pink');
        btn.classList.add('btn-success');
    };

    const fixedLink = document.querySelector('.fixed-booking-btn a');
    if (fixedLink) fixedLink.href = `agendamento.html?medico=${medico.id}`;
    document.querySelectorAll('[onclick^="agendarHorario"]').forEach(btn => {
        btn.onclick = () => { window.location.href = `agendamento.html?medico=${medico.id}`; };
    });
}

// ============================================================================
// FUNÇÕES DE AVALIAÇÃO (estrelas e envio)
// ============================================================================
window.hoverStar = function(el) {
    const stars = el.parentElement.querySelectorAll('i');
    const val = parseInt(el.dataset.value);
    stars.forEach((s, i) => {
        if (i < val) { s.className = 'bi bi-star-fill text-pink'; }
        else { s.className = 'bi bi-star text-pink'; }
    });
};
window.unhoverStar = function(el) {
    const container = el.parentElement;
    const selected = parseInt(document.getElementById('notaInput').value);
    const stars = container.querySelectorAll('i');
    stars.forEach((s, i) => {
        if (selected > 0 && i < selected) { s.className = 'bi bi-star-fill text-pink'; }
        else { s.className = 'bi bi-star text-pink'; }
    });
};
window.setStar = function(el) {
    const val = parseInt(el.dataset.value);
    document.getElementById('notaInput').value = val;
    const stars = el.parentElement.querySelectorAll('i');
    stars.forEach((s, i) => {
        if (i < val) { s.className = 'bi bi-star-fill text-pink'; }
        else { s.className = 'bi bi-star text-pink'; }
    });
};
window.enviarAvaliacao = function(event, medicoId) {
    event.preventDefault();
    const nota = parseInt(document.getElementById('notaInput').value);
    if (!nota) { alert('Selecione uma nota de 1 a 5 estrelas.'); return false; }
    const texto = document.getElementById('comentarioInput').value.trim();
    if (!texto) { alert('Escreva um comentário sobre sua experiência.'); return false; }
    const usuario = (() => { try { return JSON.parse(localStorage.getItem('bloom_user') || sessionStorage.getItem('bloom_user') || '{}'); } catch(e) { return {}; } })();
    const nome = usuario.nome || 'Paciente';
    const hoje = new Date().toLocaleDateString('pt-BR');
    const novaAval = { nome, nota, texto, data: hoje, verificado: true };
    // Adicionar à lista
    const lista = document.getElementById('comentariosList') || document.getElementById('semAvaliacoes');
    if (lista) {
        const div = document.createElement('div');
        div.className = 'review-item mb-3 p-4 border rounded-4 shadow-sm';
        div.innerHTML = `
            <div class="d-flex justify-content-between align-items-start mb-2">
                <div>
                    <h6 class="fw-bold mb-1">${novaAval.nome}</h6>
                    <small class="text-muted"><i class="bi bi-calendar me-1"></i> ${novaAval.data}</small>
                </div>
                <div class="rating">${gerarEstrelasGrid(novaAval.nota)}</div>
            </div>
            <p class="mb-2" style="line-height:1.7">${novaAval.texto}</p>
            <small class="text-success fw-semibold"><i class="bi bi-patch-check-fill me-1"></i> Avaliação verificada</small>
        `;
        if (lista.id === 'semAvaliacoes') {
            lista.innerHTML = '<h5 class="fw-bold mb-4"><i class="bi bi-chat-left-text text-pink me-2"></i>Comentários de Pacientes</h5><div id="comentariosList"></div>';
            document.getElementById('comentariosList').appendChild(div);
        } else {
            lista.insertBefore(div, lista.firstChild);
        }
    }
    document.getElementById('formAvaliacao').reset();
    document.getElementById('notaInput').value = 0;
    document.querySelectorAll('#ratingStars i').forEach(s => s.className = 'bi bi-star text-pink');
    alert('Avaliação enviada com sucesso! Obrigado por compartilhar sua experiência.');
    return false;
};

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================
window.mudarPagina = mudarPagina;
window.aplicarFiltro = aplicarFiltro;
window.agendarComMedico = agendarComMedico;

// ============================================================================
// ESTILOS DINÂMICOS PARA PÁGINA DE MÉDICOS
// ============================================================================
const medicosStyles = document.createElement('style');
medicosStyles.textContent = `
    .doctor-card-item {
        transition: all 0.3s ease;
    }
    .doctor-card-item:hover {
        transform: translateY(-5px);
    }
    .filter-btn {
        transition: all 0.3s ease;
    }
    .filter-btn:hover {
        transform: translateY(-2px);
    }
    .pagination .page-link {
        cursor: pointer;
        border-radius: 8px;
        margin: 0 3px;
    }
    .pagination .page-item.active .page-link {
        background: linear-gradient(135deg, #ff6b9d, #c8a2c8);
        border-color: transparent;
        color: white;
    }
    @media (max-width: 768px) {
        .doctor-profile-image img {
            width: 200px !important;
            height: 200px !important;
        }
        .doctor-info h1 {
            font-size: 1.75rem;
        }
    }
`;
document.head.appendChild(medicosStyles);

/* === BLOOM FIX V3: carrossel independente, sem atraso e com scroll no container correto === */
(function () {
    'use strict';

    function getCarouselParts() {
        const track = document.getElementById('doctorsTrack');
        if (!track) return null;
        const container = track.closest('.doctors-carousel-container') || track.parentElement || track;
        return {
            track,
            container,
            prevBtn: document.getElementById('doctorsPrev'),
            nextBtn: document.getElementById('doctorsNext')
        };
    }

    function doctorsFallbackSafe() {
        return Array.isArray(window.BLOOM_DOCTORS) ? window.BLOOM_DOCTORS : [];
    }

    function renderDoctorCarouselCards(doctors) {
        const parts = getCarouselParts();
        if (!parts || !doctors || !doctors.length) return;

        parts.track.innerHTML = doctors.map((doctor) => {
            const id = doctor.id;
            const nome = doctor.nome || 'Médico Bloom';
            const foto = doctor.foto || '../assets/images/logo-bloom.png';
            const especialidade = doctor.especialidade || 'Obstetrícia';
            const crm = doctor.crm || 'CRM não informado';
            const rqe = doctor.rqe ? ` | RQE: ${doctor.rqe}` : '';
            const total = doctor.total_avaliacoes || 0;
            const resumo = doctor.resumo || 'Atendimento humanizado e especializado na Bloom Maternity.';
            return `
                <div class="doctor-card">
                    <article class="card h-100 border-0 shadow-lg rounded-4 overflow-hidden">
                        <div class="doctor-image-wrapper">
                            <img src="${foto}" class="card-img-top" alt="${nome}">
                        </div>
                        <div class="card-body text-center p-4">
                            <h4 class="card-title fw-bold mb-1">${nome}</h4>
                            <p class="text-pink fw-semibold mb-2">${especialidade}</p>
                            <p class="text-muted small">CRM: ${crm}${rqe}</p>
                            <div class="rating mb-3">${typeof gerarEstrelasGrid === 'function' ? gerarEstrelasGrid(doctor.avaliacao || 5) : ''}<span class="ms-2 small">(${total} avaliações)</span></div>
                            <p class="card-text text-muted small">${resumo}</p>
                            <a href="medico-detalhe.html?id=${id}" class="btn btn-pink rounded-pill w-100 mt-auto">Ver Perfil <i class="bi bi-arrow-right"></i></a>
                        </div>
                    </article>
                </div>`;
        }).join('');

        parts.container.scrollLeft = 0;
        requestAnimationFrame(updateDoctorCarouselButtons);
    }

    function updateDoctorCarouselButtons() {
        const parts = getCarouselParts();
        if (!parts) return;
        const maxScroll = Math.max(0, parts.container.scrollWidth - parts.container.clientWidth);
        if (parts.prevBtn) parts.prevBtn.disabled = parts.container.scrollLeft <= 2;
        if (parts.nextBtn) parts.nextBtn.disabled = parts.container.scrollLeft >= maxScroll - 2;
    }

    window.initDoctorCarousel = function initDoctorCarouselFixed() {
        const parts = getCarouselParts();
        if (!parts) return;

        renderDoctorCarouselCards(doctorsFallbackSafe());

        const getStep = () => {
            const card = parts.track.querySelector('.doctor-card');
            const style = window.getComputedStyle(parts.track);
            const gap = parseFloat(style.columnGap || style.gap || '24') || 24;
            return card ? Math.round(card.getBoundingClientRect().width + gap) : 344;
        };

        if (parts.prevBtn && !parts.prevBtn.dataset.bloomFixed) {
            parts.prevBtn.dataset.bloomFixed = 'true';
            parts.prevBtn.addEventListener('click', function () {
                parts.container.scrollBy({ left: -getStep(), behavior: 'smooth' });
                setTimeout(updateDoctorCarouselButtons, 350);
            });
        }

        if (parts.nextBtn && !parts.nextBtn.dataset.bloomFixed) {
            parts.nextBtn.dataset.bloomFixed = 'true';
            parts.nextBtn.addEventListener('click', function () {
                parts.container.scrollBy({ left: getStep(), behavior: 'smooth' });
                setTimeout(updateDoctorCarouselButtons, 350);
            });
        }

        if (!parts.container.dataset.bloomFixed) {
            parts.container.dataset.bloomFixed = 'true';
            parts.container.addEventListener('scroll', function () {
                window.requestAnimationFrame(updateDoctorCarouselButtons);
            }, { passive: true });
            window.addEventListener('resize', updateDoctorCarouselButtons);
        }

        window.carregarMedicosCarrossel();
        updateDoctorCarouselButtons();
    };

    window.carregarMedicosCarrossel = async function carregarMedicosCarrosselFixed() {
        const fallback = doctorsFallbackSafe();
        if (fallback.length) renderDoctorCarouselCards(fallback);

        if (typeof API_BASE_URL === 'undefined' || !window.fetch) {
            updateDoctorCarouselButtons();
            return;
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 1200);
        try {
            const response = await fetch(`${API_BASE_URL}/medicos?limite=8`, { signal: controller.signal });
            clearTimeout(timeout);
            if (!response.ok) throw new Error('API indisponível');
            const data = await response.json();
            if (data && Array.isArray(data.medicos) && data.medicos.length) {
                const normalized = typeof normalizarMedico === 'function' ? data.medicos.map(normalizarMedico) : data.medicos;
                renderDoctorCarouselCards(normalized);
            }
        } catch (error) {
            clearTimeout(timeout);
            console.warn('Carrossel usando dados locais oficiais:', error.message || error);
            updateDoctorCarouselButtons();
        }
    };
})();
