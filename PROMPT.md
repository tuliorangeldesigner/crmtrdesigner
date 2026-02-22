# 📌 Documento de Requisitos de Produto (PRD): CRM de Prospecção de Leads

## 1. VISÃO GERAL DO PROJETO
Você atuará como um Desenvolvedor Full-Stack Sênior. Nosso objetivo é desenvolver um sistema web completo (CRM) focado exclusivamente na gestão de prospecção de clientes. 

O sistema será utilizado por uma equipe interna de prospectadores. Cada usuário terá login próprio. O foco do CRM é organizar e escalar a captação de clientes via prospecção manual (Instagram, Google Maps, WhatsApp). O administrador terá visão global, enquanto os prospectadores gerenciarão apenas seus próprios leads.

O sistema não será público. A interface deve ser simples, rápida e altamente funcional, inspirada no Notion, Trello e Pipedrive.

## 2. TECNOLOGIA E ARQUITETURA (Tech Stack)
- **Frontend:** React + Tailwind CSS (Vite ou Next.js)
- **Backend/Database/Auth:** Supabase
- **Hospedagem:** Vercel
- **Ícones/UI:** Lucide React / Shadcn UI (recomendado para componentes rápidos e acessíveis)

## 3. USUÁRIOS E AUTENTICAÇÃO (Role-Based Access Control)
O sistema terá autenticação via email/senha gerenciada pelo Supabase Auth. Existem dois perfis:

### 3.1. ADMIN
- Acesso total ao sistema e configurações.
- Visualiza e edita **todos** os leads de todos os usuários.
- Visualiza o desempenho de todos os prospectadores.
- Controla comissões e métricas financeiras.

### 3.2. PROSPECTADOR
- Acesso restrito aos **próprios leads** (owner_id).
- Pode criar, editar e mover seus leads no funil.
- **CRÍTICO:** Não pode, sob nenhuma hipótese, visualizar dados ou leads de outros usuários.

*⚠️ IMPORTANTE DE BACKEND:* A separação de dados deve ser garantida no backend usando **Supabase Row Level Security (RLS)**. Não confie apenas em filtros no frontend.

## 4. FUNCIONALIDADES PRINCIPAIS E REGRAS DE NEGÓCIO

### 4.1. Gestão de Leads (CRUD)
Campos obrigatórios do Lead:
- `Nome do Cliente` (string)
- `Nome da Empresa` (string)
- `Nicho` (string - ex: dentista, estética, restaurante)
- `Contato` (string - WhatsApp ou link do Instagram)
- `Origem` (enum - Instagram, Google Maps, Indicação, Outros)
- `Observações` (text - notas do prospectador)
- `Valor do Serviço` (decimal/numeric)
- `Tipo de Serviço` (enum - Logo, Site, Social Media, Vídeo, etc)
- `Status do Pagamento` (enum - Pendente, Pago)
- `Owner_id` (UUID vinculado ao Supabase Auth)
- `Created_at` e `Updated_at` (timestamps)

### 4.2. Sistema de Kanban (Pipeline)
Interface visual de colunas drag-and-drop (ou botões rápidos de mudança de status).
Os status do pipeline são fixos:
1. Contatado
2. Respondeu
3. Interessado
4. Em negociação
5. Fechado (Gera cálculo de comissão)
6. Perdido

### 4.3. Sistema de Comissões e Vendas
- O sistema deve calcular automaticamente a comissão com base em uma porcentagem fixa sobre as vendas com status "Fechado" e Pagamento "Pago".
- O Admin vê as comissões a pagar para toda a equipe.
- O Prospectador vê apenas as suas próprias comissões geradas.

### 4.4. Dashboard (Visão do Admin)
Cards e gráficos simples mostrando:
- Total de leads (Geral e por status)
- Vendas totais (R$)
- Ranking de prospectadores (quem fechou mais negócios)
- Taxa de conversão por usuário (Leads Cadastrados vs. Leads Fechados)

## 5. DESIGN SYSTEM & UI/UX
O design deve transmitir profissionalismo, foco e leveza.

- **Tema:** Light mode por padrão (Dark mode opcional).
- **Cores base:** - Fundo geral: `#F8FAFC` (Slate 50) ou branco.
  - Cards e painéis: `#FFFFFF` com sombras muito suaves (`shadow-sm`).
  - Cor primária (Botões de ação principal): `#0F172A` (Slate 900) ou um azul moderno `#2563EB`.
  - Cores de Status (Tags):
    - *Fechado:* Verde (`bg-green-100 text-green-800`)
    - *Perdido:* Vermelho (`bg-red-100 text-red-800`)
    - *Em negociação:* Amarelo/Laranja (`bg-orange-100 text-orange-800`)
    - *Contatado/Respondeu:* Azul/Cinza.
- **Tipografia:** Inter ou Roboto (sem serifa, limpa, legível).
- **Layout:** - Sidebar lateral enxuta para navegação (Dashboard, Kanban de Leads, Minhas Comissões).
  - Topbar para perfil e botão de "Novo Lead".
  - O Kanban deve ter scroll horizontal se necessário, sem quebrar o layout da página.
- **Responsividade:** O Kanban pode virar uma lista expansível no mobile, e os formulários de cadastro devem ocupar 100% da largura em telas pequenas.

## 6. INSTRUÇÕES DE EXECUÇÃO PARA A IA
Por favor, confirme que entendeu todos os requisitos acima. Em seguida, proponha o plano de ação passo a passo para iniciarmos o desenvolvimento, começando pela estruturação das tabelas e RLS no Supabase, seguido pela configuração do projeto React/Vite. Não escreva todo o código de uma vez; vamos construir módulo por módulo, de forma iterativa.