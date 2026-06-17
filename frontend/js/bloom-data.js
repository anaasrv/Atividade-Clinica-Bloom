/**
 * ============================================================================
 * ARQUIVO: bloom-data.js
 * PROJETO: Bloom Maternity - Clínica de Obstetrícia
 * DESCRIÇÃO: Dados completos dos médicos da Bloom Maternity.
 *            Usados como fallback quando a API não está disponível.
 *            Cada médico possui dados completos para todas as abas do perfil.
 * VERSÃO: 2.0.0
 * ============================================================================
 */
window.BLOOM_DOCTORS = [
  // ========================================================================
  // DR. GUSTAVO HENRIQUE MARTINS
  // ========================================================================
  {
    id: 1,
    nome: 'Dr. Gustavo Henrique Martins',
    crm: '145987-SP',
    rqe: '45210',
    especialidade: 'Reprodução Humana',
    foto: '../assets/images/dr-gustavo-henrique-martins.png',
    disponivel: true,
    avaliacao: 4.9,
    total_avaliacoes: 128,
    experiencia_anos: 12,
    idiomas: ['Português', 'Inglês', 'Espanhol'],

    resumo: 'Especialista em Reprodução Humana com foco em fertilidade do casal, inseminação artificial e fertilização in vitro.',
    descricao: 'O Dr. Gustavo Henrique Martins é referência em Reprodução Humana no estado de São Paulo. Com mais de 12 anos de experiência, dedicou sua carreira ao cuidado de casais que desejam engravidar, utilizando as técnicas mais avançadas de reprodução assistida. Sua abordagem combina excelência técnica com acolhimento humanizado, garantindo que cada etapa do tratamento seja compreendida e tranquila para os pacientes. É membro ativo da Sociedade Brasileira de Reprodução Assistida (SBRA) e participa regularmente de congressos internacionais sobre fertilidade.',

    formacao: [
      { titulo: 'Graduação em Medicina', instituicao: 'Universidade de São Paulo (USP)', ano: '2012', tipo: 'Graduação' },
      { titulo: 'Residência em Ginecologia e Obstetrícia', instituicao: 'Hospital das Clínicas - FMUSP', ano: '2015', tipo: 'Residência' },
      { titulo: 'Fellowship em Reprodução Humana', instituicao: 'Hospital Sírio-Libanês', ano: '2017', tipo: 'Especialização' },
      { titulo: 'Curso de Microinjeção Intracitoplasmática de Espermatozoides (ICSI)', instituicao: 'Clinic Center - Bauru', ano: '2018', tipo: 'Certificação' },
      { titulo: 'Membro da Sociedade Brasileira de Reprodução Assistida', instituicao: 'SBRA', ano: '2017', tipo: 'Certificação' },
      { titulo: 'Congresso Internacional de Reprodução Humana', instituicao: 'ESHRE - Barcelona', ano: '2023', tipo: 'Atualização' }
    ],

    experiencia: [
      { titulo: 'Coordenador do Setor de Reprodução Assistida', local: 'Hospital Albert Einstein', periodo: '2019 - Atual', descricao: 'Coordenação de equipe multidisciplinar em tratamentos de fertilidade, incluindo FIV, ICSI e preservação de fertilidade.' },
      { titulo: 'Médico Especialista em Reprodução Humana', local: 'Clínica Bloom Maternity', periodo: '2017 - Atual', descricao: 'Atendimento completo em reprodução assistida: investigação de infertilidade, IAD, FIV e criopreservação.' },
      { titulo: 'Médico Assistente - Departamento de Ginecologia', local: 'Hospital das Clínicas - FMUSP', periodo: '2015 - 2019', descricao: 'Atendimento ambulatorial e hospitalar em ginecologia e obstetrícia com foco em infertilidade.' },
      { titulo: 'Pesquisador em Biologia Reprodutiva', local: 'Laboratório de Reprodução Assistida - USP', periodo: '2013 - 2015', descricao: 'Pesquisa em embriologia e técnicas de cultivo embrionário.' }
    ],

    areas: ['Fertilidade do casal', 'Inseminação artificial (IAD)', 'Fertilização in vitro (FIV)', 'Preservação da fertilidade', 'Congelamento de óvulos', 'ICSI (Injeção Intracitoplasmática)', 'Diagnóstico genético pré-implantacional'],

    exames: [
      { nome: 'Avaliação de Fertilidade', descricao: 'Investigação completa da fertilidade masculina e feminina', duracao: '60 min', preco: 450 },
      { nome: 'Fertilização in Vitro (FIV)', descricao: 'Tratamento completo de FIV com acompanhamento especializado', duracao: 'Procedimento', preco: 12000 },
      { nome: 'Inseminação Artificial (IAD)', descricao: 'Inseminação intrauterina com preparação de sêmen', duracao: '30 min', preco: 3500 },
      { nome: 'Preservação de Óvulos', descricao: 'Congelamento e criopreservação de óvulos para futuro uso', duracao: 'Procedimento', preco: 8000 },
      { nome: 'ICSI', descricao: 'Injeção intracitoplasmática de espermatozoides', duracao: 'Procedimento', preco: 6500 },
      { nome: 'Acompanhamento de Ciclo', descricao: 'Monitoramento por ultrassom e exames hormonais durante tratamento', duracao: '20 min', preco: 350 },
      { nome: 'Consulta de Retorno', descricao: 'Avaliação de resultados e planejamento de próximos passos', duracao: '30 min', preco: 280 }
    ],

    avaliacoes: {
      media: 4.9,
      total: 128,
      satisfacao: 98,
      distribuicao: { 5: 98, 4: 22, 3: 5, 2: 2, 1: 1 },
      comentarios: [
        { nome: 'Mariana Silva', nota: 5, texto: 'O Dr. Gustavo é simplesmente incrível! Após 2 anos tentando, ele nos deu a maior notícia da nossa vida. Profissionalismo e acolhimento de outro nível.', data: 'Há 2 semanas', verificado: true },
        { nome: 'Ana Carolina Souza', nota: 5, texto: 'Excelente médico! Explica tudo com muita paciência, nunca me senti pressionada. O tratamento de FIV foi muito bem conduzido.', data: 'Há 1 mês', verificado: true },
        { nome: 'Juliana Ferreira', nota: 5, texto: 'Melhor especialista em reprodução que já conheci. Super atencioso, retorno sempre rápido. Recomendo de olhos fechados.', data: 'Há 3 semanas', verificado: true },
        { nome: 'Patricia Mendes', nota: 4, texto: 'Ótimo profissional, muito capacitado. O único ponto é a espera na consulta, mas vale cada minuto.', data: 'Há 2 meses', verificado: true },
        { nome: 'Camila Rodrigues', nota: 5, texto: 'Fiz IAD com o Dr. Gustavo e deu certo na primeira tentativa! Equipe maravilhosa, muito cuidado e carinho.', data: 'Há 6 semanas', verificado: true }
      ]
    }
  },

  // ========================================================================
  // DR. RICARDO ALMEIDA COSTA
  // ========================================================================
  {
    id: 2,
    nome: 'Dr. Ricardo Almeida Costa',
    crm: '132456-SP',
    rqe: '38764',
    especialidade: 'Medicina Fetal e Ultrassonografia',
    foto: '../assets/images/dr-ricardo-almeida-costa.png',
    disponivel: true,
    avaliacao: 4.8,
    total_avaliacoes: 95,
    experiencia_anos: 10,
    idiomas: ['Português', 'Inglês'],

    resumo: 'Especialista em Medicina Fetal com foco em ultrassom morfológico, acompanhamento fetal e gestação de risco.',
    descricao: 'O Dr. Ricardo Almeida Costa é um dos principais especialistas em Medicina Fetal de São Paulo. Com 10 anos de experiência em ultrassonografia obstétrica avançada, realizou mais de 8.000 exames de ultrassom morfológico. Seu trabalho combina tecnologia de ponta com diagnóstico preciso, auxiliando casais e obstetras no acompanhamento seguro da gestação. É fellow em Medicina Fetal pelo Hospital Mês de São Paulo e membro da Sociedade Brasileira de Ultrassonografia em Obstetrícia e Ginecologia (SBUOG).',

    formacao: [
      { titulo: 'Graduação em Medicina', instituicao: 'Universidade Estadual de Campinas (UNICAMP)', ano: '2014', tipo: 'Graduação' },
      { titulo: 'Residência em Ginecologia e Obstetrícia', instituicao: 'Hospital de Clínicas - UNICAMP', ano: '2017', tipo: 'Residência' },
      { titulo: 'Fellowship em Medicina Fetal', instituicao: 'Hospital Mês de São Paulo', ano: '2019', tipo: 'Especialização' },
      { titulo: 'Curso de Ultrassonografia Obstétrica Avançada', instituicao: 'SBUOG - Sociedade Brasileira de Ultrassonografia', ano: '2018', tipo: 'Certificação' },
      { titulo: 'Diploma em Medicina Materno-Fetal', instituicao: 'Faculdade de Medicina - USP', ano: '2020', tipo: 'Pós-graduação' }
    ],

    experiencia: [
      { titulo: 'Coordenador de Medicina Fetal', local: 'Hospital Albert Einstein', periodo: '2020 - Atual', descricao: 'Coordenação do departamento de medicina fetal com diagnóstico pré-natal avançado e acompanhamento de gestações de alto risco.' },
      { titulo: 'Especialista em Ultrassonografia', local: 'Clínica Bloom Maternity', periodo: '2019 - Atual', descricao: 'Realização de ultrassonografias morfológicas 2D/3D/4D, doppler obstétrico e avaliação do bem-estar fetal.' },
      { titulo: 'Médico Assistente - Obstetrícia', local: 'Hospital Mês de São Paulo', periodo: '2017 - 2020', descricao: 'Acompanhamento de gestações de alto risco e realização de exames de medicina fetal.' },
      { titulo: 'Residente - Ginecologia e Obstetrícia', local: 'Hospital de Clínicas - UNICAMP', periodo: '2014 - 2017', descricao: 'Treinamento em ultrassonografia, parto e patologias obstétricas.' }
    ],

    areas: ['Ultrassom morfológico 2D/3D/4D', 'Acompanhamento fetal', 'Gestação de alto risco', 'Doppler obstétrico', 'Biopsia de vilosidades coriônicas', 'Amniocentese', 'Avaliação do crescimento fetal'],

    exames: [
      { nome: 'Ultrassom Morfológico 2D', descricao: 'Avaliação anatômica detalhada do feto em 2 dimensões', duracao: '40 min', preco: 380 },
      { nome: 'Ultrassom 3D/4D', descricao: 'Imagem tridimensional do feto com visualização detalhada', duracao: '45 min', preco: 550 },
      { nome: 'Doppler Obstétrico', descricao: 'Avaliação do fluxo sanguíneo uteroplacentário e fetal', duracao: '30 min', preco: 320 },
      { nome: 'Ultrassom de Crescimento Fetal', descricao: 'Monitoramento do peso e desenvolvimento fetal', duracao: '30 min', preco: 280 },
      { nome: 'Avaliação do Bem-Estar Fetal', descricao: 'Cardiotocografia e avaliação de movimentações fetais', duracao: '40 min', preco: 250 },
      { nome: 'Ultrassom Transvaginal', descricao: 'Avaliação detalhada do útero e anexos', duracao: '25 min', preco: 300 },
      { nome: 'Consulta de Medicina Fetal', descricao: 'Avaliação especializada com planejamento de conduta', duracao: '45 min', preco: 420 }
    ],

    avaliacoes: {
      media: 4.8,
      total: 95,
      satisfacao: 97,
      distribuicao: { 5: 72, 4: 16, 3: 4, 2: 2, 1: 1 },
      comentarios: [
        { nome: 'Fernanda Lima', nota: 5, texto: 'O Dr. Ricardo fez o ultrassom 4D do meu bebê e foi incrível! Imagens nítidas, explicou tudo com muito cuidado. Profissional excepcional.', data: 'Há 1 semana', verificado: true },
        { nome: 'Beatriz Santos', nota: 5, texto: 'Minha gestação de risco foi muito bem acompanhada pelo Dr. Ricardo. Sempre atento, sempre disponível. Salvo minha bebê e minha saúde.', data: 'Há 3 semanas', verificado: true },
        { nome: 'Luciana Oliveira', nota: 4, texto: 'Ótimo médico, muito competente. O ultrassom morfológico foi super detalhado. Recomendo!', data: 'Há 1 mês', verificado: true },
        { nome: 'Carla Ferreira', nota: 5, texto: 'Profissional exemplar. Diagnosticou uma alteração que outros médicos não viram. Muito grata pelo cuidado.', data: 'Há 2 meses', verificado: true }
      ]
    }
  },

  // ========================================================================
  // DRA. FERNANDA RIBEIRO ALVES
  // ========================================================================
  {
    id: 3,
    nome: 'Dra. Fernanda Ribeiro Alves',
    crm: '149876-SP',
    rqe: '49872',
    especialidade: 'Fertilidade e Ginecologia Endócrina',
    foto: '../assets/images/dra-fernanda-ribeiro-alves.png',
    disponivel: true,
    avaliacao: 4.9,
    total_avaliacoes: 87,
    experiencia_anos: 8,
    idiomas: ['Português', 'Inglês', 'Francês'],

    resumo: 'Especialista em Fertilidade e Ginecologia Endócrina, dedicada ao cuidado hormonal feminino, infertilidade e menopausa.',
    descricao: 'A Dra. Fernanda Ribeiro Alves é especialista em Fertilidade e Ginecologia Endócrina, com foco no equilíbrio hormonal feminino ao longo de todas as fases da vida. Com 8 anos de experiência, atua na investigação e tratamento da infertilidade, distúrbios hormonais, síndrome dos ovários policísticos (SOP), menopausa e climatério. Sua abordagem é integral, combinando tratamento médico com orientação sobre qualidade de vida, alimentação e exercício físico. É membro da Sociedade Brasileira de Ginecologia Endócrina e pesquisadora ativa em hormônios reprodutivos.',

    formacao: [
      { titulo: 'Graduação em Medicina', instituicao: 'Universidade Federal de São Paulo (UNIFESP)', ano: '2016', tipo: 'Graduação' },
      { titulo: 'Residência em Ginecologia e Obstetrícia', instituicao: 'Hospital São Paulo - UNIFESP', ano: '2019', tipo: 'Residência' },
      { titulo: 'Pós-graduação em Reprodução Humana', instituicao: 'Universidade de São Paulo (USP)', ano: '2021', tipo: 'Pós-graduação' },
      { titulo: 'Especialização em Ginecologia Endócrina', instituicao: 'Hospital das Clínicas - FMUSP', ano: '2022', tipo: 'Especialização' },
      { titulo: 'Curso de Hormônios Reprodutivos', instituicao: 'Sociedade Brasileira de Ginecologia Endócrina', ano: '2020', tipo: 'Certificação' }
    ],

    experiencia: [
      { titulo: 'Especialista em Ginecologia Endócrina', local: 'Clínica Bloom Maternity', periodo: '2022 - Atual', descricao: 'Atendimento especialado em distúrbios hormonais, SOP, infertilidade e menopausa com abordagem integrativa.' },
      { titulo: 'Médica Ginecologista - Ambulatório de Hormônios', local: 'Hospital Federal do Rio de Janeiro', periodo: '2019 - 2022', descricao: 'Atendimento de mulheres com distúrbios hormonais, síndrome dos ovários policísticos e pré-menopausa.' },
      { titulo: 'Pesquisadora em Endocrinologia Reprodutiva', local: 'Laboratório de Hormônios - UNIFESP', periodo: '2017 - 2019', descricao: 'Pesquisa em eixo hipotálamo-hipófise-ovário eimpacto do estilo de vida na fertilidade.' },
      { titulo: 'Residente em Ginecologia e Obstetrícia', local: 'Hospital São Paulo - UNIFESP', periodo: '2016 - 2019', descricao: 'Treinamento em ginecologia clínica, cirúrgica e endócrina.' }
    ],

    areas: ['Hormônios femininos', 'Infertilidade', 'Síndrome dos ovários policísticos (SOP)', 'Menopausa e climatério', 'Ginecologia endócrina', 'Planejamento familiar', 'Tratamento de acne hormonal'],

    exames: [
      { nome: 'Avaliação Hormonal Completa', descricao: 'Exames de sangue para avaliação do perfil hormonal feminino', duracao: '30 min', preco: 380 },
      { nome: 'Consulta de Ginecologia Endócrina', descricao: 'Avaliação especializada de distúrbios hormonais', duracao: '45 min', preco: 350 },
      { nome: 'Avaliação de Infertilidade', descricao: 'Investigação completa das causas de infertilidade feminina', duracao: '60 min', preco: 480 },
      { nome: 'Ultrassom Transvaginal', descricao: 'Avaliação do útero, ovários e endométrio', duracao: '25 min', preco: 300 },
      { nome: 'Acompanhamento de Indução de Ovulação', descricao: 'Monitoramento por ultrassom e exames hormonais', duracao: '20 min', preco: 280 },
      { nome: 'Consulta de Menopausa', descricao: 'Avaliação e tratamento de sintomas do climatério', duracao: '40 min', preco: 320 },
      { nome: 'Orientação de Planejamento Familiar', descricao: 'Escolha do método contraceptivo mais adequado', duracao: '30 min', preco: 250 }
    ],

    avaliacoes: {
      media: 4.9,
      total: 87,
      satisfacao: 98,
      distribuicao: { 5: 72, 4: 11, 3: 3, 2: 1, 1: 0 },
      comentarios: [
        { nome: 'Renata Gomes', nota: 5, texto: 'A Dra. Fernanda transformou minha vida! Depois de anos com SOP sem diagnóstico, ela identificou o problema e iniciou o tratamento. Em 6 meses minha vida mudou completamente.', data: 'Há 1 semana', verificado: true },
        { nome: 'Amanda Costa', nota: 5, texto: 'Profissional excepcional! Muito atenciosa, explica tudo com paciência. Minha menopausa está sendo muito mais tranquila graças ao tratamento dela.', data: 'Há 2 semanas', verificado: true },
        { nome: 'Vanessa Rodrigues', nota: 5, texto: 'Dra. Fernanda é um amor de pessoa! Super profissional, muito competente. Me ajudou muito com questões hormonais. Super recomendo!', data: 'Há 1 mês', verificado: true },
        { nome: 'Tatiana Martins', nota: 4, texto: 'Ótima médica, muito bem preparada. As consultas são completas e bem orientadas.', data: 'Há 6 semanas', verificado: true }
      ]
    }
  },

  // ========================================================================
  // DRA. MARIANA COSTA FERREIRA
  // ========================================================================
  {
    id: 4,
    nome: 'Dra. Mariana Costa Ferreira',
    crm: '181654-SP',
    rqe: '61204',
    especialidade: 'Obstetrícia e Parto Humanizado',
    foto: '../assets/images/dra-mariana-costa-ferreira.png',
    disponivel: true,
    avaliacao: 5.0,
    total_avaliacoes: 156,
    experiencia_anos: 15,
    idiomas: ['Português', 'Inglês'],

    resumo: 'Especialista em Obstetrícia e Parto Humanizado, com atendimento voltado para gestação, parto normal, puerpério e amamentação.',
    descricao: 'A Dra. Mariana Costa Ferreira é uma das maiores referências em Parto Humanizado em São Paulo, com 15 anos de experiência e mais de 3.000 partos realizados. Sua filosofia de trabalho é baseada no respeito à fisiologia, escuta ativa e protagonismo da paciente. É certificada pela Federação Brasileira das Associações de Obstetrícia e Ginecologia (Febragasgo) e participa ativamente de projetos de humanização do parto em hospitais públicos. Acredita que cada parto é único e merece ser vivido com segurança, conforto e dignidade.',

    formacao: [
      { titulo: 'Graduação em Medicina', instituicao: 'Pontifícia Universidade Católica de São Paulo (PUC-SP)', ano: '2009', tipo: 'Graduação' },
      { titulo: 'Residência em Ginecologia e Obstetrícia', instituicao: 'Santa Casa de Misericórdia de São Paulo', ano: '2012', tipo: 'Residência' },
      { titulo: 'Certificação em Assistência ao Parto Humanizado', instituicao: 'Febragasgo / Federação Brasileira de Obstetrícia', ano: '2014', tipo: 'Certificação' },
      { titulo: 'Curso de Acupuntura Obstétrica', instituicao: 'Escola Brasileira de Medicina Chinesa', ano: '2016', tipo: 'Especialização' },
      { titulo: 'Diploma em Saúde Materno-Infantil', instituicao: 'Universidade de São Paulo (USP)', ano: '2018', tipo: 'Pós-graduação' },
      { titulo: 'Certificação em Rebozo e Tecnologias Não Farmacológicas', instituicao: 'Associação Brasileira de Parto Humanizado', ano: '2020', tipo: 'Certificação' }
    ],

    experiencia: [
      { titulo: 'Coordenadora do Programa de Parto Humanizado', local: 'Hospital Beneficência Portuguesa', periodo: '2018 - Atual', descricao: 'Coordenação do programa de humanização com redução de taxas de cesárea e aumento da satisfação das pacientes.' },
      { titulo: 'Obstetra e Especialista em Parto Humanizado', local: 'Clínica Bloom Maternity', periodo: '2012 - Atual', descricao: 'Acompanhamento pré-natal humanizado, parto normal, parto na água e cuidados no puerpério.' },
      { titulo: 'Médica Obstetra - Serviço de Urgência', local: 'Hospital Municipal Dr. Arthur Ribeiro de Saboya', periodo: '2012 - 2018', descricao: 'Atendimento de urgência e emergência obstétrica com mais de 1.500 partos assistidos.' },
      { titulo: 'Voluntária - Projeto Parto do Meu Jeito', local: 'Rede de Hospitais Amigáveis da OMS', periodo: '2015 - Atual', descricao: 'Capacitação de profissionais de saúde em práticas de parto humanizado em hospitais públicos.' }
    ],

    areas: ['Pré-natal humanizado', 'Parto normal', 'Parto na água', 'Puerpério e amamentação', 'Rebozo e acupuntura obstétrica', 'Cesárea humanizada', 'Acompanhamento de gestação de alto risco'],

    exames: [
      { nome: 'Consulta de Pré-Natal', descricao: 'Acompanhamento completo da gestação com orientações individualizadas', duracao: '45 min', preco: 380 },
      { nome: 'Parto Normal', descricao: 'Assistência ao parto com práticas de humanização e acolhimento', duracao: 'Procedimento', preco: 8500 },
      { nome: 'Parto na Água', descricao: 'Parto em posição vertical em tanque de dilatação', duracao: 'Procedimento', preco: 12000 },
      { nome: 'Cesárea Humanizada', descricao: 'Cesárea com práticas de acolhimento e vínculo precoce', duracao: 'Procedimento', preco: 9500 },
      { nome: 'Consulta de Puerpério', descricao: 'Avaliação pós-parto, amamentação e saúde materna', duracao: '40 min', preco: 300 },
      { nome: 'Apoio à Amamentação', descricao: 'Orientação profissional para aleitamento materno', duracao: '30 min', preco: 220 },
      { nome: 'Acompanhamento Pré-Natal de Alto Risco', descricao: 'Pré-natal especializado com monitoramento intensivo', duracao: '60 min', preco: 520 }
    ],

    avaliacoes: {
      media: 5.0,
      total: 156,
      satisfacao: 100,
      distribuicao: { 5: 148, 4: 6, 3: 2, 2: 0, 1: 0 },
      comentarios: [
        { nome: 'Isabela Fernandes', nota: 5, texto: 'A Dra. Mariana fez o parto da minha filha ser a experiência mais linda da minha vida. Humanizada do início ao fim, me senti segura e acolhida. Eternamente grata!', data: 'Há 3 dias', verificado: true },
        { nome: 'Priscila Almeida', nota: 5, texto: 'Melhor obstetra do mundo! Após uma cesárea traumática, ela me ajudou a ter um parto normal na água. Uma experiência transformadora.', data: 'Há 1 semana', verificado: true },
        { nome: 'Juliana Mendes', nota: 5, texto: 'Dra. Mariana é um anjo! Cuidou de mim durante toda a gestação, sempre atenciosa, sempre disponível. Meu parto foi perfeito.', data: 'Há 2 semanas', verificado: true },
        { nome: 'Camila Santos', nota: 5, texto: 'Profissional extraordinária! Não apenas uma médica, uma verdadeira parceira nessa jornada. Recomendo para todas as mães.', data: 'Há 1 mês', verificado: true },
        { nome: 'Letícia Oliveira', nota: 5, texto: 'Fiz parto na água com a Dra. Mariana e foi mágico. O cuidado, o carinho, o profissionalismo... Tudo perfeito!', data: 'Há 5 semanas', verificado: true }
      ]
    }
  },

  // ========================================================================
  // DRA. ANA CAROLINA MENDES
  // ========================================================================
  {
    id: 5,
    nome: 'Dra. Ana Carolina Mendes',
    crm: '154789-SP',
    rqe: '55432',
    especialidade: 'Ginecologia e Obstetrícia',
    foto: '../assets/images/dra-ana-carolina-mendes.png',
    disponivel: true,
    avaliacao: 4.9,
    total_avaliacoes: 142,
    experiencia_anos: 11,
    idiomas: ['Português', 'Inglês', 'Espanhol'],

    resumo: 'Especialista em Ginecologia e Obstetrícia, com atuação em pré-natal, parto humanizado, contracepção e saúde feminina.',
    descricao: 'A Dra. Ana Carolina Mendes é uma ginecologista e obstetra comprometida com a saúde integral da mulher em todas as fases da vida. Com 11 anos de experiência, atua desde consultas ginecológicas preventivas até acompanhamento obstétrico completo. É conhecida por sua capacidade de comunicar-se com empatia, explicando cada procedimento de forma clara e acolhedora. É membro da Federação Brasileira das Associações de Obstetrícia e Ginecologia (Febragasgo) e especialista em saúde da mulher.',

    formacao: [
      { titulo: 'Graduação em Medicina', instituicao: 'Universidade de São Paulo (USP)', ano: '2013', tipo: 'Graduação' },
      { titulo: 'Residência em Ginecologia e Obstetrícia', instituicao: 'Hospital das Clínicas - FMUSP', ano: '2016', tipo: 'Residência' },
      { titulo: 'Título de Especialista pela Febragasgo/AMB', instituicao: 'Federação Brasileira de Obstetrícia e Ginecologia', ano: '2017', tipo: 'Certificação' },
      { titulo: 'Pós-graduação em Saúde da Mulher', instituicao: 'Universidade Federal de São Paulo (UNIFESP)', ano: '2019', tipo: 'Pós-graduação' },
      { titulo: 'Curso de Laparoscopia Ginecológica', instituicao: 'Hospital Sírio-Libanês', ano: '2020', tipo: 'Especialização' }
    ],

    experiencia: [
      { titulo: 'Coordenadora de Ginecologia Preventiva', local: 'Hospital Sírio-Libanês', periodo: '2021 - Atual', descricao: 'Coordenação do programa de rastreamento de câncer ginecológico e saúde preventiva da mulher.' },
      { titulo: 'Ginecologista e Obstetra', local: 'Clínica Bloom Maternity', periodo: '2016 - Atual', descricao: 'Atendimento completo em ginecologia, obstetrícia, pré-natal, parto e saúde da mulher.' },
      { titulo: 'Médica Ginecologista - Ambulatório de Saúde da Mulher', local: 'Hospital das Clínicas - FMUSP', periodo: '2016 - 2021', descricao: 'Atendimento ambulatorial em ginecologia clínica e preventiva com mais de 3.000 pacientes atendidas.' },
      { titulo: 'Voluntária - Projeto de Saúde da Mulher', local: 'ONG Saúde Feminina', periodo: '2014 - Atual', descricao: 'Atendimento ginecológico preventivo para mulheres em situação de vulnerabilidade social.' }
    ],

    areas: ['Pré-natal de baixo e alto risco', 'Parto humanizado', 'Contracepção e planejamento familiar', 'Saúde preventiva da mulher', 'Climatério e menopausa', 'Laparoscopia ginecológica', 'Tratamento de endometriose'],

    exames: [
      { nome: 'Consulta Ginecológica Preventiva', descricao: 'Check-up completo da saúde feminina com exame clínico', duracao: '40 min', preco: 320 },
      { nome: 'Pré-Natal Completo', descricao: 'Acompanhamento da gestação com exames periódicos e ultrassons', duracao: '45 min', preco: 420 },
      { nome: 'Colpocitologia Oncológica (Papanicolaou)', descricao: 'Exame preventivo para detecção de alterações cervicais', duracao: '15 min', preco: 150 },
      { nome: 'Ultrassom Pélvico', descricao: 'Avaliação do útero, ovários e bexiga', duracao: '25 min', preco: 280 },
      { nome: 'Orientação Contraceptiva', descricao: 'Escolha do melhor método anticoncepcional para cada paciente', duracao: '30 min', preco: 220 },
      { nome: 'Consulta de Climatério', descricao: 'Avaliação e tratamento dos sintomas da menopausa', duracao: '40 min', preco: 350 },
      { nome: 'Acompanhamento de Endometriose', descricao: 'Diagnóstico e tratamento de endometriose', duracao: '45 min', preco: 380 },
      { nome: 'Avaliação de Infertilidade', descricao: 'Investigação das causas de dificuldade para engravidar', duracao: '60 min', preco: 450 }
    ],

    avaliacoes: {
      media: 4.9,
      total: 142,
      satisfacao: 98,
      distribuicao: { 5: 118, 4: 18, 3: 4, 2: 1, 1: 1 },
      comentarios: [
        { nome: 'Mariana Ribeiro', nota: 5, texto: 'Dra. Ana Carolina é a melhor ginecologista que já fui! Super atenciosa, explica tudo com paciência. Meu pré-natal foi tranquilo e seguro.', data: 'Há 4 dias', verificado: true },
        { nome: 'Beatriz Campos', nota: 5, texto: 'Profissional excepcional! Me ajudou a escolher o melhor método contraceptivo e sempre disposta a tirar dúvidas.', data: 'Há 1 semana', verificado: true },
        { nome: 'Daniela Nascimento', nota: 5, texto: 'Dra. Ana Carolina fez meu parto e foi incrível. Humanizada, atenciosa, gentil. A melhor escolha que fiz na minha gestação.', data: 'Há 2 semanas', verificado: true },
        { nome: 'Fernanda Castro', nota: 4, texto: 'Ótima médica, muito competente. Atendimento rápido mas completo. Super recomendo.', data: 'Há 1 mês', verificado: true },
        { nome: 'Patrícia Lopes', nota: 5, texto: 'Dra. Ana Carolina não é apenas uma médica, é uma amiga. Sempre disponível, sempre acolhedora. Minha saúde está nas melhores mãos.', data: 'Há 3 semanas', verificado: true }
      ]
    }
  }
];
