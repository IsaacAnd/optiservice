# EVIDÊNCIAS DE TRABALHO E FEEDBACK DOS CLIENTES (RP2)
## OptiService — Assistência Técnica Simplitech

---

### 1. Ata de Reunião de Acompanhamento (Stakeholder: Simplitech)
- **Data da Reunião:** 13/10/2026
- **Horário:** 10:00 às 11:30
- **Local:** Sala de Reunião da Assistência Técnica Simplitech / Videoconferência
- **Participantes:**
  - Marcos Antunes (Gerente Operacional da Simplitech)
  - Camila Duarte (Supervisora de Atendimento e Balcão)
  - Equipe de Desenvolvimento do OptiService
- **Objetivo:** Apresentação do protótipo funcional para validação dos fluxos de atendimento, cadastro de clientes, controle de equipamentos e ciclo de vida das Ordens de Serviço.

#### Deliberações e Parecer do Cliente:
1. **Layout e Facilidade de Uso:** O cliente elogiou a sobriedade das telas. Segundo Marcos: *"Evitar elementos visuais chamativos e focar em tabelas limpas facilita muito o dia a dia do nosso balcão, onde precisamos cadastrar entradas em menos de 2 minutos."*
2. **Ciclo dos 5 Status:** O fluxo de status (`Solicitado`, `Agendado`, `Em execução`, `Aguardando peça`, `Concluído`) foi homologado sem ressalvas, pois reflete exatamente as etapas físicas da assistência.
3. **Persistência Real:** O cliente testou em tempo real cadastrar um equipamento pelo navegador do escritório e verificar o aparecimento imediato na bancada de testes sem precisar recarregar a página.

---

### 2. Matriz de Testes de Software Executados (RP2)

| ID | Cenário de Teste | Resultado Esperado | Resultado Obtido | Situação |
| :--- | :--- | :--- | :--- | :--- |
| **CT-01** | Autenticação com Google e E-mail/Senha via Firebase Auth | Redirecionar usuário autenticado para o Dashboard e bloquear acessos não autorizados | Sessão iniciada com token seguro e perfil carregado no cabeçalho | **Aprovado** |
| **CT-02** | Cadastro de Cliente no Cloud Firestore | Gravar documento na coleção `clients` com timestamp e exibir na tabela imediatamente | Documento salvo e listado em tempo real via listener `onSnapshot` | **Aprovado** |
| **CT-03** | Vínculo de Equipamento a Cliente | Exigir cliente existente e permitir seleção rápida | Vínculo salvo com chave relacional `clientId` e integridade preservada | **Aprovado** |
| **CT-04** | Abertura de O.S. com filtro de equipamentos | Ao escolher o cliente, o dropdown de equipamentos deve exibir apenas os aparelhos daquele cliente | Filtro dinâmico executado corretamente | **Aprovado** |
| **CT-05** | Transição entre os 5 Status da O.S. | Permitir alterar status de `Solicitado` até `Concluído`, refletindo no Dashboard | Todos os 5 status atualizam contadores no painel geral | **Aprovado** |
| **CT-06** | Cálculo automático de custos da O.S. | Somar Mão de Obra + Peças instantaneamente | Cálculo em tempo real sem divergência de arredondamento | **Aprovado** |
| **CT-07** | Agendamento de Atendimento | Registrar data, horário e cliente, permitindo confirmação rápida | Lista organizada cronologicamente | **Aprovado** |
| **CT-08** | Carga de Dados de Demonstração (Seed Acadêmico) | Popular base vazia com dados realistas para testes de bancada | Clientes, equipamentos, serviços e agendamentos inseridos com sucesso | **Aprovado** |

---

### 3. Registro de Fotos / Evidências Visuais do Protótipo

- **Tela de Login Corporativa:** Acesso unificado via Firebase Authentication.
- **Painel Geral (Dashboard):** Visão executiva com cartões de indicadores e gráfico de distribuição dos 5 status.
- **Gestão de Clientes:** Tabela com busca dinâmica e modal de ficha cadastral com equipamentos e serviços vinculados.
- **Ficha Técnica da O.S.:** Modal formatado estilo Ordem de Serviço da Simplitech pronto para impressão/conferência.
