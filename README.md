# OptiService — Simplitech Assistência Técnica

Sistema integrado de gestão operacional, ordens de serviço e controle financeiro desenvolvido para a assistência técnica **Simplitech**. O projeto prioriza uma interface corporativa sóbria, produtividade em bancada e sincronização em tempo real de dados.

---

## 📌 Visão Geral do Sistema

O **OptiService** foi concebido para atender às demandas diárias de uma oficina de manutenção de equipamentos eletrônicos e computadores, eliminando controles manuais em papel e planilhas descentralizadas.

### Principais Módulos

* **Dashboard Geral e Financeiro:**
  * Visão consolidada de clientes, equipamentos e ordens ativas.
  * Distribuição das manutenções por status com atalhos de filtragem direta.
  * Painel de desempenho financeiro da oficina: Faturamento Concluído, Ticket Médio, Total de Mão de Obra e Total de Peças aplicadas.
* **Gestão de Clientes:**
  * Cadastro completo de clientes (Pessoa Física e Jurídica), documentos, contatos e endereços.
  * Ficha cadastral integrada com histórico de equipamentos e manutenções vinculadas.
  * Validações de integridade referencial para prevenir registros órfãos.
* **Controle de Equipamentos:**
  * Inventário detalhado de aparelhos sob custódia (Notebook, Desktop, Smartphone, Servidor, etc.).
  * Histórico de condições físicas de recepção, avarias e números de série.
  * Ação rápida de "Abrir O.S." diretamente a partir do registro do equipamento.
* **Ordens de Serviço (O.S.):**
  * Fluxo de trabalho estruturado nos 5 status operacionais:
    1. **Solicitado** (Triagem e entrada)
    2. **Agendado** (Data e técnico previstos)
    3. **Em execução** (Manutenção ativa em bancada)
    4. **Aguardando peça** (Reposição em fornecedor/estoque)
    5. **Concluído** (Serviço finalizado e liberado para entrega)
  * Troca rápida de status operacional diretamente na tabela.
  * Ficha técnica formal com impressão em layout A4 corporativo, contemplando cabeçalho oficial, termos de garantia legal de 90 dias conforme o **Artigo 26 do Código de Defesa do Consumidor (CDC)** e campos para assinatura dupla.
* **Agenda de Atendimentos:**
  * Controle cronológico de visitas técnicas, entregas e retiradas em balcão.
  * Transição de estados de agendamento (*Agendado*, *Confirmado*, *Realizado*, *Cancelado*).
* **Exportação de Dados:**
  * Exportação de todas as tabelas em formato CSV com codificação UTF-8 BOM, garantindo abertura perfeita de acentos e formatação no Microsoft Excel e Google Planilhas.

---

## 🛠️ Tecnologias Utilizadas

* **Frontend:** [React 19](https://react.dev/) com [TypeScript](https://www.typescriptlang.org/)
* **Build Tool:** [Vite](https://vitejs.dev/)
* **Estilização:** [Tailwind CSS v4](https://tailwindcss.com/)
* **Ícones:** [Lucide React](https://lucide.dev/)
* **Backend como Serviço (BaaS):** [Google Firebase](https://firebase.google.com/)
  * **Firebase Authentication:** Autenticação segura de operadores e técnicos (E-mail/Senha e Google OAuth).
  * **Cloud Firestore:** Banco de dados NoSQL com sincronização em tempo real via listeners `onSnapshot`.

---

## 📂 Estrutura do Projeto

```text
├── docs/                     # Documentação de arquitetura, diagramas e relatórios
│   ├── DIAGRAMAS_E_ARQUITETURA.md
│   ├── EVIDENCIAS_E_FEEDBACK.md
│   └── RELATORIO_PERIODICO_3_ERP3.md
├── src/
│   ├── components/
│   │   ├── academic/         # Componentes auxiliares de avaliação
│   │   ├── appointments/     # Gestão e formulários de agendamentos
│   │   ├── auth/             # Telas de login e autenticação
│   │   ├── clients/          # Módulo de cadastro e consulta de clientes
│   │   ├── common/           # Modais, badges e diálogos reutilizáveis
│   │   ├── dashboard/        # Painel de métricas e indicadores financeiros
│   │   ├── equipment/        # Gestão do parque de equipamentos
│   │   ├── layout/           # Sidebar lateral e cabeçalho administrativo
│   │   └── services/         # Gestão de Ordens de Serviço e ficha de impressão
│   ├── context/
│   │   ├── AuthContext.tsx   # Gerenciamento de sessão de usuário
│   │   └── ToastContext.tsx  # Sistema de notificações em tempo real
│   ├── lib/
│   │   ├── firebase.ts       # Inicialização das instâncias de Auth e Firestore
│   │   └── firebaseConfig.ts # Parâmetros de configuração e variáveis de ambiente
│   ├── services/
│   │   └── dataService.ts    # Camada de comunicação e queries no Cloud Firestore
│   ├── utils/
│   │   └── exportCsv.ts      # Utilitário de exportação de dados em CSV
│   ├── types.ts              # Definições de tipos e interfaces TypeScript
│   ├── App.tsx               # Roteamento e estrutura principal
│   └── main.tsx              # Ponto de entrada da aplicação
├── firestore.rules           # Regras de segurança do Cloud Firestore
├── index.html                # Ponto de montagem HTML
├── package.json              # Dependências e scripts do projeto
├── tsconfig.json             # Configurações do compilador TypeScript
└── vite.config.ts            # Configuração do Vite
```

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
* [Node.js](https://nodejs.org/) versão 18 ou superior instalada.
* Gerenciador de pacotes `npm` ou `yarn`.

### Passo a Passo

1. **Clonar o Repositório:**
   ```bash
   git clone https://github.com/SEU_USUARIO/optiservice-simplitech.git
   cd optiservice-simplitech
   ```

2. **Instalar as Dependências:**
   ```bash
   npm install
   ```

3. **Configuração de Variáveis de Ambiente (Opcional):**
   O projeto já possui credenciais de demonstração pré-configuradas no Firestore. Caso deseje conectar ao seu próprio projeto Firebase, copie o arquivo de exemplo:
   ```bash
   cp .env.example .env
   ```
   Preencha as variáveis correspondentes no arquivo `.env`.

4. **Executar em Modo de Desenvolvimento:**
   ```bash
   npm run dev
   ```
   Acesse a aplicação no navegador em: `http://localhost:3000`

5. **Compilar para Produção:**
   ```bash
   npm run build
   ```
   Os arquivos otimizados serão gerados no diretório `dist/`.

---

## 👥 Modelo de Dados (Cloud Firestore)

* **`clients`**: Documentos com dados cadastrais de clientes (`name`, `document`, `phone`, `email`, `address`, `notes`).
* **`equipment`**: Aparelhos registrados (`type`, `brand`, `model`, `serialNumber`, `clientId`, `conditionNotes`).
* **`services`**: Ordens de serviço (`serviceCode`, `clientId`, `equipmentId`, `status`, `priority`, `reportedIssue`, `technicalDiagnosis`, `solution`, `laborCost`, `partsCost`, `totalCost`).
* **`appointments`**: Agendamentos técnicos de bancada e visitas (`clientId`, `equipmentId`, `scheduledDate`, `scheduledTime`, `status`, `notes`).

---

## 📄 Licença

Este projeto é desenvolvido para fins corporativos e acadêmicos da **Simplitech Assistência Técnica**.
Todos os direitos reservados.
