/**
 * ============================================================================
 * ARQUIVO: agendamento.js
 * PROJETO: Bloom Maternity - Clínica de Obstetrícia
 * DESCRIÇÃO: Gerenciamento completo do fluxo de agendamento de consultas,
 *            incluindo seleção de médico, procedimento, data, horário, dados do paciente
 *            e confirmação em wizard de 6 etapas.
 * AUTOR: Bloom Maternity Team
 * VERSÃO: 3.0.0
 * ============================================================================
 */

// ============================================================================
// VARIÁVEIS GLOBAIS DO AGENDAMENTO
// ============================================================================
let currentStep = 1;
let selectedMedico = null;
let selectedProcedimento = null;
let selectedData = null;
let selectedHorario = null;
let selectedConvenio = 'Particular';
let medicosList = [];
let horariosDisponiveis = [];
let procedimentosDisponiveis = [];

// Dados do paciente (Step 5)
let pacienteData = {
    nome: '',
    telefone: '',
    email: '',
    cpf: '',
    nascimento: '',
    obs: ''
};

// Elementos DOM
let step1Content, step2Content, step3Content, step4Content, step5Content, step6Content;
let nextButtons, prevButtons;
let resumoAgendamento;

// ============================================================================
// INICIALIZAÇÃO DO AGENDAMENTO
// ============================================================================
document.addEventListener('DOMContentLoaded', function() {
    step1Content = document.getElementById('step1Content');
    step2Content = document.getElementById('step2Content');
    step3Content = document.getElementById('step3Content');
    step4Content = document.getElementById('step4Content');
    step5Content = document.getElementById('step5Content');
    step6Content = document.getElementById('step6Content');
    resumoAgendamento = document.getElementById('resumoAgendamento');

    initNavigationButtons();
    initDatePicker();
    initPacienteFormListeners();
    initConvenioListener();
    handleURLParamsAgendamento();
});

// ============================================================================
// NAVEGAÇÃO ENTRE ETAPAS
// ============================================================================
function initNavigationButtons() {
    nextButtons = document.querySelectorAll('.next-step');
    prevButtons = document.querySelectorAll('.prev-step');

    nextButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const nextStep = parseInt(btn.getAttribute('data-next'));
            goToStep(nextStep);
        });
    });

    prevButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const prevStep = parseInt(btn.getAttribute('data-prev'));
            goToStep(prevStep);
        });
    });
}

function goToStep(step) {
    if (step > currentStep) {
        if (!validateCurrentStep()) {
            return;
        }
    }

    step1Content.style.display = 'none';
    step2Content.style.display = 'none';
    step3Content.style.display = 'none';
    step4Content.style.display = 'none';
    step5Content.style.display = 'none';
    if (step6Content) step6Content.style.display = 'none';

    switch(step) {
        case 1:
            step1Content.style.display = 'block';
            break;
        case 2:
            step2Content.style.display = 'block';
            if (selectedMedico) {
                renderProcedimentosGrid();
            }
            break;
        case 3:
            step3Content.style.display = 'block';
            if (selectedData) {
                carregarHorariosPorData(selectedData);
            }
            break;
        case 4:
            step4Content.style.display = 'block';
            if (selectedHorario === null && selectedData) {
                carregarHorariosPorData(selectedData);
            }
            break;
        case 5:
            step5Content.style.display = 'block';
            preencherDadosPaciente();
            break;
        case 6:
            if (step6Content) step6Content.style.display = 'block';
            atualizarResumoConfirmacao();
            break;
    }

    updateStepIndicators(step);
    currentStep = step;
}

function updateStepIndicators(step) {
    const steps = document.querySelectorAll('.step');
    steps.forEach((s, index) => {
        const stepNum = index + 1;
        if (stepNum < step) {
            s.classList.add('completed');
            s.classList.remove('active');
        } else if (stepNum === step) {
            s.classList.add('active');
            s.classList.remove('completed');
        } else {
            s.classList.remove('active', 'completed');
        }
    });
}

function validateCurrentStep() {
    switch(currentStep) {
        case 1:
            if (!selectedMedico) {
                showToast('Por favor, selecione um médico', 'warning');
                return false;
            }
            return true;
        case 2:
            if (!selectedProcedimento) {
                showToast('Por favor, selecione um procedimento', 'warning');
                return false;
            }
            return true;
        case 3:
            if (!selectedData) {
                showToast('Por favor, selecione uma data', 'warning');
                return false;
            }
            return true;
        case 4:
            if (!selectedHorario) {
                showToast('Por favor, selecione um horário', 'warning');
                return false;
            }
            return true;
        case 5:
            if (!validarDadosPaciente()) {
                return false;
            }
            return true;
        default:
            return true;
    }
}

// ============================================================================
// CARREGAMENTO DE MÉDICOS
// ============================================================================
async function carregarMedicos() {
    const medicosListDiv = document.getElementById('medicosList');

    if (!medicosListDiv) return;

    try {
        medicosListDiv.innerHTML = `
            <div class="text-center py-5">
                <div class="spinner-border text-pink" role="status">
                    <span class="visually-hidden">Carregando...</span>
                </div>
                <p class="mt-3 text-muted">Carregando médicos disponíveis...</p>
            </div>
        `;

        const response = await fetch(`${API_BASE_URL}/medicos`);
        const data = await response.json();

        if (data.medicos && data.medicos.length > 0) {
            medicosList = data.medicos.map(m => ({
                ...m,
                especialidade: m.especialidade || m.especialidade_info?.nome || 'Obstetrícia'
            }));
            renderMedicosList(medicosList);
        } else {
            medicosListDiv.innerHTML = `
                <div class="alert alert-warning text-center">
                    <i class="bi bi-exclamation-triangle"></i>
                    Nenhum médico disponível no momento. Tente novamente mais tarde.
                </div>
            `;
        }

    } catch (error) {
        console.warn('API de médicos indisponível no agendamento. Usando dados locais oficiais:', error);
        medicosList = Array.isArray(window.BLOOM_DOCTORS) ? window.BLOOM_DOCTORS : [];
        if (medicosList.length) {
            renderMedicosList(medicosList);
        } else {
            medicosListDiv.innerHTML = `
                <div class="alert alert-danger text-center">
                    <i class="bi bi-bug"></i>
                    Erro ao carregar médicos. Verifique sua conexão.
                </div>
            `;
        }
    }
}

function renderMedicosList(medicos) {
    const medicosListDiv = document.getElementById('medicosList');

    if (!medicosListDiv) return;

    medicosListDiv.innerHTML = `
        <div class="row g-3">
            ${medicos.map(medico => {
                const isSelected = selectedMedico?.id === medico.id;
                return `
                <div class="col-md-6">
                    <div class="schedule-medico-card card h-100 border-0 shadow-sm cursor-pointer ${isSelected ? 'selected' : ''}" 
                         onclick="selecionarMedico(${medico.id})"
                         data-medico-id="${medico.id}">
                        <div class="schedule-check">
                            <i class="bi bi-check-lg"></i>
                        </div>
                        <div class="card-body p-3">
                            <div class="d-flex gap-3">
                                <div class="flex-shrink-0 position-relative">
                                    <img src="${medico.foto || 'https://randomuser.me/api/portraits/women/68.jpg'}" 
                                         class="rounded-3 shadow-sm" 
                                         style="width: 72px; height: 72px; object-fit: cover;">
                                    <span class="badge bg-success position-absolute bottom-0 end-0 rounded-circle p-1" style="width:16px;height:16px;border:2px solid white;">
                                        <span class="visually-hidden">Disponível</span>
                                    </span>
                                </div>
                                <div class="flex-grow-1">
                                    <h5 class="fw-bold mb-1" style="font-size:0.95rem">${medico.nome}</h5>
                                    <p class="text-pink mb-1 fw-semibold" style="font-size:0.85rem">${medico.especialidade}</p>
                                    <div class="d-flex align-items-center gap-2 mb-1">
                                        <div class="rating">
                                            ${gerarEstrelas(medico.avaliacao || 5)}
                                        </div>
                                        <span class="small text-muted">(${medico.total_avaliacoes || 0})</span>
                                    </div>
                                    <div class="d-flex align-items-center gap-2 small text-muted">
                                        <span><i class="bi bi-award text-pink me-1"></i>${medico.experiencia_anos || 0} anos</span>
                                        <span><i class="bi bi-person-badge text-pink me-1"></i>CRM: ${medico.crm || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;
            }).join('')}
        </div>
    `;
}

function gerarEstrelas(avaliacao) {
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

function selecionarMedico(medicoId) {
    selectedMedico = medicosList.find(m => m.id === medicoId);
    selectedProcedimento = null;

    document.querySelectorAll('.schedule-medico-card').forEach(card => {
        card.classList.remove('selected');
        if (parseInt(card.getAttribute('data-medico-id')) === medicoId) {
            card.classList.add('selected');
        }
    });

    atualizarResumoAgendamento();
    showToast(`Médico ${selectedMedico.nome} selecionado!`, 'success');
}

// ============================================================================
// PROCEDIMENTOS POR MÉDICO
// ============================================================================
const procedimentosPorMedico = {
    1: [
        { id: 'consulta-prenatal', nome: 'Consulta Pré-Natal', descricao: 'Acompanhamento completo da gestação', duracao: '30 min', preco: 250, categoria: 'consulta', icone: 'bi-person-heart' },
        { id: 'ultrassom-obstetrico', nome: 'Ultrassonografia Obstétrica', descricao: 'Avaliação detalhada do desenvolvimento fetal', duracao: '45 min', preco: 280, categoria: 'exame', icone: 'bi-camera' },
        { id: 'planejamento-familiar', nome: 'Planejamento Familiar', descricao: 'Orientação contraceptiva e reprodutiva', duracao: '30 min', preco: 200, categoria: 'consulta', icone: 'bi-heart' },
        { id: 'acompanhamento-gestacional', nome: 'Acompanhamento Gestacional', descricao: 'Monitoramento contínuo da gravidez', duracao: '40 min', preco: 250, categoria: 'consulta', icone: 'bi-calendar-heart' }
    ],
    2: [
        { id: 'ultrassom-morfologico', nome: 'Ultrassom Morfológico', descricao: 'Avaliação anatômica do feto em 2D/3D/4D', duracao: '60 min', preco: 380, categoria: 'exame', icone: 'bi-camera' },
        { id: 'medicina-fetal', nome: 'Medicina Fetal', descricao: 'Acompanhamento de gestação de alto risco', duracao: '45 min', preco: 350, categoria: 'consulta', icone: 'bi-heart-pulse' },
        { id: 'doppler-fetal', nome: 'Doppler Fetal', descricao: 'Avaliação do fluxo sanguíneo fetal', duracao: '30 min', preco: 220, categoria: 'exame', icone: 'bi-activity' }
    ],
    3: [
        { id: 'consulta-ginecologica', nome: 'Consulta Ginecológica', descricao: 'Check-up completo da saúde feminina', duracao: '30 min', preco: 220, categoria: 'consulta', icone: 'bi-person' },
        { id: 'preventivo', nome: 'Citologia Oncótica (Preventivo)', descricao: 'Rastreamento de câncer de colo uterino', duracao: '20 min', preco: 150, categoria: 'exame', icone: 'bi-shield-check' },
        { id: 'colposcopia', nome: 'Colposcopia', descricao: 'Exame detalhado do colo uterino', duracao: '30 min', preco: 280, categoria: 'exame', icone: 'bi-eye' },
        { id: 'insercao-diu', nome: 'Inserção de DIU', descricao: 'Colocação de dispositivo intrauterino', duracao: '40 min', preco: 450, categoria: 'procedimento', icone: 'bi-plus-circle' }
    ],
    4: [
        { id: 'consulta-obstetrica', nome: 'Consulta Obstétrica', descricao: 'Pré-natal, parto humanizado e puerpério', duracao: '35 min', preco: 250, categoria: 'consulta', icone: 'bi-person-heart' },
        { id: 'parto-humanizado', nome: 'Parto Humanizado', descricao: 'Acompanhamento do trabalho de parto natural', duracao: '120 min', preco: 1500, categoria: 'procedimento', icone: 'bi-heart' },
        { id: 'amamentacao', nome: 'Consultoria em Amamentação', descricao: 'Orientação e apoio para aleitamento materno', duracao: '45 min', preco: 200, categoria: 'consulta', icone: 'bi-droplet' }
    ],
    5: [
        { id: 'consulta-geral', nome: 'Consulta Ginecologia e Obstetrícia', descricao: 'Pré-natal, contracepção e saúde feminina', duracao: '30 min', preco: 230, categoria: 'consulta', icone: 'bi-person' },
        { id: 'ultrassom-geral', nome: 'Ultrassonografia Geral', descricao: 'Exames de imagem obstétricos e ginecológicos', duracao: '40 min', preco: 260, categoria: 'exame', icone: 'bi-camera' },
        { id: 'contraceptivo', nome: 'Orientação Contraceptiva', descricao: 'Escolha do método anticoncepcional ideal', duracao: '25 min', preco: 180, categoria: 'consulta', icone: 'bi-shield' }
    ]
};

function getProcedimentosDoMedico(medicoId) {
    return procedimentosPorMedico[medicoId] || [];
}

function renderProcedimentosGrid() {
    const container = document.getElementById('procedimentosGrid');
    const badgeContainer = document.getElementById('selectedDoctorBadgeProc');
    const nextBtn = document.getElementById('nextStep2Btn');
    
    if (!container) return;

    if (!selectedMedico) {
        container.innerHTML = `
            <div class="col-12 text-center py-4">
                <i class="bi bi-clipboard2-pulse fs-1 text-muted"></i>
                <p class="text-muted mt-2">Selecione um médico primeiro</p>
            </div>
        `;
        if (badgeContainer) badgeContainer.innerHTML = '';
        if (nextBtn) nextBtn.disabled = true;
        return;
    }

    const procedimentos = getProcedimentosDoMedico(selectedMedico.id);
    
    if (badgeContainer) {
        badgeContainer.innerHTML = `
            <div class="alert alert-light-pink border-pink d-flex align-items-center gap-2">
                <i class="bi bi-person-badge text-pink fs-5"></i>
                <div>
                    <strong>${selectedMedico.nome}</strong> - ${selectedMedico.especialidade}
                </div>
            </div>
        `;
    }

    if (procedimentos.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-4">
                <i class="bi bi-clipboard-x fs-1 text-muted"></i>
                <p class="text-muted mt-2">Nenhum procedimento cadastrado para este médico</p>
            </div>
        `;
        if (nextBtn) nextBtn.disabled = true;
        return;
    }

    container.innerHTML = procedimentos.map(proc => `
        <div class="col-md-6 col-lg-4">
            <div class="procedure-card h-100 p-4 rounded-4 border-2 cursor-pointer ${selectedProcedimento?.id === proc.id ? 'selected' : ''}" 
                 onclick="selecionarProcedimento('${proc.id}')"
                 data-proc-id="${proc.id}"
                 style="border-color: ${selectedProcedimento?.id === proc.id ? '#ff6b9d' : 'rgba(238,130,170,0.12)'}; background: ${selectedProcedimento?.id === proc.id ? '#fff5f8' : '#fef8fa'};">
                <div class="d-flex justify-content-between align-items-start mb-3">
                    <div class="procedure-icon" style="width: 48px; height: 48px; background: linear-gradient(135deg, #fce4ec, #fef0f5); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #ee82aa; font-size: 1.3rem;">
                        <i class="bi ${proc.icone}"></i>
                    </div>
                    <span class="badge bg-light-pink text-pink rounded-pill px-3 py-1 small">${proc.categoria}</span>
                </div>
                <h6 class="fw-bold mb-2" style="font-size: 0.95rem">${proc.nome}</h6>
                <p class="text-muted mb-3 small" style="line-height: 1.5">${proc.descricao}</p>
                <div class="d-flex justify-content-between align-items-center pt-3" style="border-top: 1px solid rgba(238,130,170,0.08)">
                    <div>
                        <span class="text-muted small"><i class="bi bi-clock me-1"></i> ${proc.duracao}</span>
                        ${proc.preco > 0 ? `<span class="text-muted small ms-3"><i class="bi bi-currency-dollar me-1"></i> R$ ${proc.preco.toLocaleString('pt-BR')}</span>` : ''}
                    </div>
                    ${selectedProcedimento?.id === proc.id ? '<i class="bi bi-check-circle-fill text-pink fs-4"></i>' : ''}
                </div>
            </div>
        </div>
    `).join('');

    if (nextBtn) nextBtn.disabled = !selectedProcedimento;
}

function selecionarProcedimento(procId) {
    const procedimentos = getProcedimentosDoMedico(selectedMedico.id);
    selectedProcedimento = procedimentos.find(p => p.id === procId);

    document.querySelectorAll('.procedure-card').forEach(card => {
        card.classList.remove('selected');
        card.style.borderColor = 'rgba(238,130,170,0.12)';
        card.style.background = '#fef8fa';
        if (card.getAttribute('data-proc-id') === procId) {
            card.classList.add('selected');
            card.style.borderColor = '#ff6b9d';
            card.style.background = '#fff5f8';
        }
    });

    const nextBtn = document.getElementById('nextStep2Btn');
    if (nextBtn) nextBtn.disabled = false;

    atualizarResumoAgendamento();
    showToast(`Procedimento "${selectedProcedimento.nome}" selecionado!`, 'success');
}

// ============================================================================
// SELEÇÃO DE DATA (STEP 3 - FLATPICKR)
// ============================================================================
function initDatePicker() {
    const datePicker = document.getElementById('datePicker');
    if (!datePicker) return;

    flatpickr(datePicker, {
        locale: 'pt',
        dateFormat: 'd/m/Y',
        minDate: 'today',
        maxDate: new Date().fp_incr(60),
        disable: [
            function(date) {
                return date.getDay() === 0;
            }
        ],
        onChange: function(selectedDates, dateStr, instance) {
            if (selectedDates.length > 0) {
                selectedData = selectedDates[0];
                selectedHorario = null;
                atualizarResumoAgendamento();
                showToast(`Data selecionada: ${formatDate(selectedData)}`, 'success');
            }
        }
    });
}

// ============================================================================
// CARREGAMENTO DE HORÁRIOS (STEP 3)
// ============================================================================
function initConvenioListener() {
    const convenioSelect = document.getElementById('convenioSelect');
    if (convenioSelect) {
        selectedConvenio = convenioSelect.value || 'Particular';
        convenioSelect.addEventListener('change', function() {
            selectedConvenio = this.value || 'Particular';
            atualizarResumoAgendamento();
        });
    }
}

async function carregarHorariosPorData(data) {
    const horariosGrid = document.getElementById('horariosGrid');
    if (!horariosGrid || !selectedMedico || !data) return;

    try {
        horariosGrid.innerHTML = `
            <div class="text-center py-4 col-12">
                <div class="spinner-border text-pink spinner-border-sm" role="status"></div>
                <p class="mt-2 text-muted small">Carregando horários...</p>
            </div>
        `;

        const dataFormatada = formatDateForAPI(data);
        const response = await fetch(`${API_BASE_URL}/medicos/${selectedMedico.id}/horarios?data=${dataFormatada}`);
        const result = await response.json();

        if (result.horarios && result.horarios.length > 0) {
            horariosDisponiveis = result.horarios;
        } else {
            horariosDisponiveis = gerarHorariosMock();
        }

    } catch (error) {
        console.warn('API de horários indisponível. Usando horários mock:', error);
        horariosDisponiveis = gerarHorariosMock();
    }

    renderHorariosGrid(horariosGrid);
}

function gerarHorariosMock() {
    const horarios = [];
    for (let h = 8; h < 18; h++) {
        horarios.push(`${String(h).padStart(2, '0')}:00`);
        horarios.push(`${String(h).padStart(2, '0')}:30`);
    }
    return horarios;
}

function renderHorariosGrid(container) {
    if (!container) return;

    if (horariosDisponiveis.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4 col-12">
                <i class="bi bi-calendar-x fs-1 text-muted"></i>
                <p class="mt-2 text-muted">Nenhum horário disponível para esta data.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = horariosDisponiveis.map(horario => `
        <div class="col-4 col-md-3 col-lg-2">
            <div class="time-slot-card shadow-sm cursor-pointer ${selectedHorario === horario ? 'selected' : ''}" 
                 onclick="selecionarHorario('${horario}')"
                 data-horario="${horario}">
                <div class="text-center py-2">
                    <i class="bi bi-clock fs-5 ${selectedHorario === horario ? 'text-white' : 'text-pink'}"></i>
                    <p class="fw-bold mb-0 mt-1 time-text">${horario}</p>
                    <p class="time-sub mb-0">Disponível</p>
                </div>
            </div>
        </div>
    `).join('');
}

function selecionarHorario(horario) {
    selectedHorario = horario;

    document.querySelectorAll('.time-slot-card').forEach(card => {
        card.classList.remove('selected');
        if (card.getAttribute('data-horario') === horario) {
            card.classList.add('selected');
        }
    });

    atualizarResumoAgendamento();
    showToast(`Horário ${selectedHorario} selecionado!`, 'success');
}

// ============================================================================
// DADOS DO PACIENTE (STEP 4)
// ============================================================================
function initPacienteFormListeners() {
    const fields = ['pacienteNome', 'pacienteTelefone', 'pacienteEmail', 'pacienteCPF', 'pacienteNascimento', 'pacienteObs'];
    fields.forEach(fieldId => {
        const el = document.getElementById(fieldId);
        if (el) {
            el.addEventListener('input', function() {
                const key = fieldId.replace('paciente', '').toLowerCase();
                pacienteData[key] = this.value;
                atualizarResumoAgendamento();
            });
        }
    });
}

function preencherDadosPaciente() {
    const usuario = getCurrentUser();
    if (!usuario) return;

    const fields = {
        pacienteNome: usuario.nome || '',
        pacienteTelefone: usuario.telefone || '',
        pacienteEmail: usuario.email || '',
        pacienteCPF: usuario.cpf || '',
        pacienteNascimento: usuario.data_nascimento || usuario.nascimento || ''
    };

    Object.entries(fields).forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el && value) {
            el.value = value;
            const key = id.replace('paciente', '').toLowerCase();
            pacienteData[key] = value;
        }
    });
}

function validarDadosPaciente() {
    const nome = document.getElementById('pacienteNome')?.value?.trim();
    const telefone = document.getElementById('pacienteTelefone')?.value?.trim();
    const email = document.getElementById('pacienteEmail')?.value?.trim();

    if (!nome) {
        showToast('Por favor, informe o nome do paciente', 'warning');
        return false;
    }
    if (!telefone) {
        showToast('Por favor, informe o telefone do paciente', 'warning');
        return false;
    }
    if (!email) {
        showToast('Por favor, informe o e-mail do paciente', 'warning');
        return false;
    }

    pacienteData.nome = nome;
    pacienteData.telefone = telefone;
    pacienteData.email = email;
    pacienteData.cpf = document.getElementById('pacienteCPF')?.value?.trim() || '';
    pacienteData.nascimento = document.getElementById('pacienteNascimento')?.value?.trim() || '';
    pacienteData.obs = document.getElementById('pacienteObs')?.value?.trim() || '';

    return true;
}

// ============================================================================
// RESUMO E CONFIRMAÇÃO
// ============================================================================
function atualizarResumoAgendamento() {
    if (!resumoAgendamento) return;

    let html = '';

    if (selectedMedico) {
        html += `
            <div class="resumo-item mb-2">
                <small>Médico</small>
                <strong>${selectedMedico.nome}</strong>
                <br><small class="text-muted">${selectedMedico.especialidade}</small>
            </div>
        `;
    }

    if (selectedProcedimento) {
        html += `
            <div class="resumo-item mb-2">
                <small>Procedimento</small>
                <strong>${selectedProcedimento.nome}</strong>
                <br><small class="text-muted">${selectedProcedimento.categoria} • ${selectedProcedimento.duracao}</small>
            </div>
        `;
    }

    if (selectedData) {
        html += `
            <div class="resumo-item mb-2">
                <small>Data</small>
                <strong>${formatDate(selectedData)}</strong>
            </div>
        `;
    }

    if (selectedHorario) {
        html += `
            <div class="resumo-item mb-2">
                <small>Horário</small>
                <strong>${selectedHorario}</strong>
            </div>
        `;
    }

    if (selectedConvenio) {
        html += `
            <div class="resumo-item mb-2">
                <small>Convênio</small>
                <strong>${selectedConvenio}</strong>
            </div>
        `;
    }

    if (pacienteData.nome) {
        html += `
            <div class="resumo-item mb-2">
                <small>Paciente</small>
                <strong>${pacienteData.nome}</strong>
            </div>
        `;
    }

    if (!selectedMedico && !selectedProcedimento && !selectedData && !selectedHorario) {
        html = '<div class="text-center py-4"><i class="bi bi-inbox text-pink fs-1"></i><p class="text-muted mt-2 mb-0">Nenhum item selecionado</p></div>';
    }

    resumoAgendamento.innerHTML = html;
}

function atualizarResumoConfirmacao() {
    const confirmationDetails = document.getElementById('confirmationDetails');
    if (!confirmationDetails) return;

    confirmationDetails.innerHTML = `
        <div class="row g-3">
            <div class="col-md-6">
                <div class="info-group">
                    <label class="text-muted small">Médico</label>
                    <p class="fw-bold mb-0">${selectedMedico?.nome || 'Não selecionado'}</p>
                    <small class="text-muted">${selectedMedico?.especialidade || ''}</small>
                </div>
            </div>
            <div class="col-md-6">
                <div class="info-group">
                    <label class="text-muted small">Procedimento</label>
                    <p class="fw-bold mb-0">${selectedProcedimento?.nome || 'Não selecionado'}</p>
                    <small class="text-muted">${selectedProcedimento?.categoria || ''} • ${selectedProcedimento?.duracao || ''}</small>
                </div>
            </div>
            <div class="col-md-6">
                <div class="info-group">
                    <label class="text-muted small">Convênio</label>
                    <p class="fw-bold mb-0">${selectedConvenio || 'Particular'}</p>
                </div>
            </div>
            <div class="col-md-6">
                <div class="info-group">
                    <label class="text-muted small">Data</label>
                    <p class="fw-bold mb-0">${selectedData ? formatDate(selectedData) : 'Não selecionada'}</p>
                </div>
            </div>
            <div class="col-md-6">
                <div class="info-group">
                    <label class="text-muted small">Horário</label>
                    <p class="fw-bold mb-0">${selectedHorario || 'Não selecionado'}</p>
                </div>
            </div>
        </div>
        <hr class="my-3">
        <h6 class="fw-bold text-pink mb-3">Dados do Paciente</h6>
        <div class="row g-3">
            <div class="col-md-6">
                <div class="info-group">
                    <label class="text-muted small">Nome</label>
                    <p class="fw-bold mb-0">${pacienteData.nome || 'Não informado'}</p>
                </div>
            </div>
            <div class="col-md-6">
                <div class="info-group">
                    <label class="text-muted small">Telefone</label>
                    <p class="fw-bold mb-0">${pacienteData.telefone || 'Não informado'}</p>
                </div>
            </div>
            <div class="col-md-6">
                <div class="info-group">
                    <label class="text-muted small">E-mail</label>
                    <p class="fw-bold mb-0">${pacienteData.email || 'Não informado'}</p>
                </div>
            </div>
            <div class="col-md-6">
                <div class="info-group">
                    <label class="text-muted small">CPF</label>
                    <p class="fw-bold mb-0">${pacienteData.cpf || 'Não informado'}</p>
                </div>
            </div>
            <div class="col-md-6">
                <div class="info-group">
                    <label class="text-muted small">Data de Nascimento</label>
                    <p class="fw-bold mb-0">${pacienteData.nascimento || 'Não informado'}</p>
                </div>
            </div>
            ${pacienteData.obs ? `
            <div class="col-12">
                <div class="info-group">
                    <label class="text-muted small">Observações</label>
                    <p class="fw-bold mb-0">${pacienteData.obs}</p>
                </div>
            </div>
            ` : ''}
        </div>
    `;
}

// ============================================================================
// CONFIRMAR AGENDAMENTO
// ============================================================================
async function confirmarAgendamento() {
    const confirmBtn = document.getElementById('confirmarAgendamento');
    if (!confirmBtn) return;

    if (!selectedMedico || !selectedProcedimento || !selectedData || !selectedHorario) {
        showToast('Por favor, complete todas as etapas do agendamento', 'warning');
        return;
    }

    if (!pacienteData.nome || !pacienteData.telefone || !pacienteData.email) {
        showToast('Por favor, preencha os dados do paciente', 'warning');
        return;
    }

    try {
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Processando...';

        const userId = getCurrentUserId();
        const agendamentoData = {
            paciente_id: userId,
            medico_id: selectedMedico.id,
            procedimento_id: selectedProcedimento.id,
            procedimento_nome: selectedProcedimento.nome,
            procedimento_categoria: selectedProcedimento.categoria,
            exame_id: selectedMedico.exame_id || 1,
            data: formatDateForAPI(selectedData),
            horario: selectedHorario,
            convenio: selectedConvenio || 'Particular',
            especialidade_id: selectedMedico.especialidade_id || selectedMedico.especialidade_info?.id || null,
            status: 'agendado',
            observacoes: pacienteData.obs || ''
        };

        const response = await fetch(`${API_BASE_URL}/agendamentos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify(agendamentoData)
        });

        const result = await response.json();

        if (response.ok) {
            showToast('Agendamento realizado com sucesso!', 'success');

            localStorage.removeItem('agendamento_temp');

            setTimeout(() => {
                window.location.href = 'meus-agendamentos.html';
            }, 2000);
        } else {
            throw new Error(result.message || 'Erro ao realizar agendamento');
        }

    } catch (error) {
        console.error('Erro no agendamento:', error);
        showToast(error.message || 'Erro ao realizar agendamento. Tente novamente.', 'error');
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = '<i class="bi bi-check2-circle"></i> Confirmar Agendamento';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const confirmBtn = document.getElementById('confirmarAgendamento');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', confirmarAgendamento);
    }
});

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================
function formatDateForAPI(date) {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
}

function handleURLParamsAgendamento() {
    const urlParams = new URLSearchParams(window.location.search);

    const medicoId = urlParams.get('medico');
    const procedimentoId = urlParams.get('procedimento');
    const dataParam = urlParams.get('data');
    const horarioParam = urlParams.get('horario');
    const unidadeParam = urlParams.get('unidade');

    if (medicoId) {
        setTimeout(() => {
            const medicoCard = document.querySelector(`.schedule-medico-card[data-medico-id="${medicoId}"]`);
            if (medicoCard) {
                medicoCard.click();
                
                if (procedimentoId) {
                    setTimeout(() => {
                        const procCard = document.querySelector(`.procedure-card[data-proc-id="${procedimentoId}"]`);
                        if (procCard) procCard.click();
                    }, 1500);
                }
            }
        }, 1000);
    }

    if (unidadeParam) {
        showToast(`Agendamento para unidade ${unidadeParam}`, 'info');
    }
}

// ============================================================================
// ESTILOS DINÂMICOS
// ============================================================================
const style = document.createElement('style');
style.textContent = `
    .schedule-medico-card, .time-slot-card, .procedure-card {
        transition: all 0.3s ease;
        cursor: pointer;
    }
    .schedule-medico-card:hover, .time-slot-card:hover, .procedure-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important;
    }
    .schedule-medico-card.selected, .time-slot-card.selected, .procedure-card.selected {
        border-color: #ff6b9d !important;
        border-width: 2px !important;
        background-color: #fff0f5;
        box-shadow: 0 0 0 3px rgba(255,107,157,0.15) !important;
    }
    .procedure-card {
        border: 2px solid rgba(238,130,170,0.12);
        border-radius: 14px;
        background: #fef8fa;
    }
    .procedure-card.selected {
        border-color: #ff6b9d !important;
        background: #fff5f8;
    }
    .procedure-icon {
        transition: all 0.3s ease;
    }
    .procedure-card:hover .procedure-icon {
        background: linear-gradient(135deg, #f8d4e0, #fce4ec);
        transform: scale(1.05);
    }
    .badge-disponivel {
        position: absolute;
        bottom: 0;
        right: 0;
        font-size: 0.6rem;
        padding: 2px 6px;
        border-radius: 10px;
    }
    .border-pink {
        border-color: #ff6b9d !important;
    }
    .resumo-item {
        transition: all 0.3s ease;
    }
`;
document.head.appendChild(style);
