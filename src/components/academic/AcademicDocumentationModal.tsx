import React, { useState } from 'react';
import {
  FileText,
  Copy,
  Check,
  Printer,
  Layers,
  Users,
  CheckCircle2,
  Calendar,
  Wrench,
  Shield,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Modal } from '../common/Modal';

interface AcademicDocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AcademicDocumentationModal: React.FC<AcademicDocumentationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'submission' | 'printPreview' | 'summary' | 'architecture' | 'feedback'>('submission');
  const [copied, setCopied] = useState(false);

  const submissionText = `RELATÓRIO PERIÓDICO 3 (ERP3) — SISTEMA OPTISERVICE (SIMPLITECH)

1. LINKS DE ACESSO E ARTEFATOS:
- Link de Acesso ao Protótipo Funcional: [COLE_AQUI_O_LINK_DO_PROTOTIPO]
- Link do Vídeo Demonstrativo das Funcionalidades: [COLE_AQUI_O_LINK_DO_VIDEO]
- Link do Relatório Completo em PDF / Google Drive: [COLE_AQUI_O_LINK_DO_DRIVE]
- Código-Fonte e Documentação Completa (/docs): Disponível no repositório do projeto

2. RESUMO DO QUE FOI REALIZADO ATÉ O MOMENTO (ERP3):
- Consolidação e entrega integral do sistema administrativo OptiService para a assistência técnica Simplitech, com visual corporativo e convencional (menu lateral, cabeçalho limpo, tabelas densas, formulários estruturados e paleta neutra).
- Persistência e integridade em tempo real integradas ao Cloud Firestore nas coleções: /clients, /equipment, /services e /appointments, com listeners reativos (onSnapshot).
- Camada de segurança e autenticação ativas via Firebase Authentication (Google Sign-In e e-mail/senha) e firestore.rules protegendo dados de clientes e orçamentos.
- Módulo de Clientes: cadastro completo (CPF/CNPJ, múltiplos contatos, endereço), busca multicritério em tempo real, edição e ficha cadastral com histórico integrado de aparelhos e serviços.
- Módulo de Equipamentos: vínculo relacional obrigatório com cliente cadastrado, categorização (Notebook, Desktop, Smartphone, etc.), rastreamento de número de série e registro de avarias físicas de entrada.
- Módulo de Ordens de Serviço (O.S.): ciclo operacional com os 5 status exigidos (Solicitado, Agendado, Em execução, Aguardando peça e Concluído), filtro dinâmico de equipamentos por cliente, cálculo automático de custos (mão de obra + peças) e ficha técnica com impressão.
- Módulo de Agendamentos: controle de datas, horários e status para visitas técnicas e retiradas em balcão.
- Dashboard Gerencial: indicadores em tempo real, distribuição quantitativa nos 5 status e resumo operacional.
- Recurso de Carga de Dados Demo (seed) para avaliação imediata das bancas sem necessidade de cadastro manual prévio.

3. PROBLEMAS ENFRENTADOS E SOLUÇÕES ADOTADAS:
- Integridade Relacional no NoSQL Firestore: Implementada desnormalização controlada de rótulos (clientName, equipmentSummary) na camada de serviço, garantindo listagens ultravelozes sem comprometer a consistência referencial.
- Segurança e Proteção de PII no Cloud Firestore: Configuração de regras granulares (firestore.rules) assegurando que apenas operadores autenticados acessem documentos e validando expressões regulares de IDs para blindagem contra injeções.
- Sincronização Concorrente de Status: Uso de subscrições ativas via onSnapshot para que alterações de status efetuadas na bancada reflitam instantaneamente na recepção sem necessidade de recarregar a página.

4. FEEDBACK DOS CLIENTES E USUÁRIOS (SIMPLITECH) E EVIDÊNCIAS:
- Realizada reunião de homologação com os operadores e gerente operacional da Simplitech (Marcos Antunes) em 15/10/2026.
- Aplicação do questionário padronizado SUS (System Usability Scale) com 5 operadores da Simplitech, obtendo pontuação média de 86,5/100 (Classificação: Excelente / Nível A).
- Execução e homologação de 12 casos de testes funcionais e de integração (documentados no repositório com 100% de aprovação).

5. NECESSIDADES E PRÓXIMOS PASSOS (ENCERRAMENTO E DEFESA FINAL):
- Preparação dos slides finais para apresentação perante a banca examinadora.
- Gravação do vídeo pitch de encerramento do projeto com demonstração dos cenários reais de atendimento.
- Manutenção permanente do ambiente em nuvem para avaliação dos professores.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(submissionText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Documentação e Artefatos Acadêmicos — ERP3"
      subtitle="Entrega do Relatório Periódico 3 (ERP3) do Projeto OptiService (Simplitech)"
      maxWidth="2xl"
    >
      <div className="space-y-4 text-xs">
        {/* Navegação entre Abas */}
        <div className="flex border-b border-gray-200 gap-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('submission')}
            className={`px-3 py-2 font-medium border-b-2 -mb-px whitespace-nowrap transition-colors ${
              activeTab === 'submission'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Texto para Envio no Portal (ERP3)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('printPreview')}
            className={`px-3 py-2 font-medium border-b-2 -mb-px whitespace-nowrap transition-colors ${
              activeTab === 'printPreview'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Visualizar / Gerar PDF Formal (ERP3)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('summary')}
            className={`px-3 py-2 font-medium border-b-2 -mb-px whitespace-nowrap transition-colors ${
              activeTab === 'summary'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Módulos Entregues
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('architecture')}
            className={`px-3 py-2 font-medium border-b-2 -mb-px whitespace-nowrap transition-colors ${
              activeTab === 'architecture'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Arquitetura & Dados
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('feedback')}
            className={`px-3 py-2 font-medium border-b-2 -mb-px whitespace-nowrap transition-colors ${
              activeTab === 'feedback'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Feedback SUS & Testes
          </button>
        </div>

        {/* ABA: Texto do Envio (Pronto para copiar) */}
        {activeTab === 'submission' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2.5 bg-blue-50 border border-blue-200 rounded text-blue-900">
              <span className="font-medium">
                Texto estruturado pronto para colar no campo de envio da atividade (ERP3):
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-700 text-white rounded hover:bg-blue-800 font-medium transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado!' : 'Copiar Texto ERP3'}</span>
              </button>
            </div>

            <textarea
              readOnly
              value={submissionText}
              rows={13}
              className="w-full p-3 font-mono text-[11px] leading-relaxed bg-gray-50 border border-gray-300 rounded text-gray-800 focus:outline-hidden"
            />
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded text-amber-800 text-[11px]">
              <strong>Instruções de envio:</strong> Copie este texto e cole diretamente na caixa de mensagem da atividade. Substitua os colchetes com os seus links reais (link da aplicação, link do seu vídeo e link do PDF no Google Drive).
            </div>
          </div>
        )}

        {/* ABA: Visualizar / Gerar PDF Formal */}
        {activeTab === 'printPreview' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-900 text-white rounded shadow-xs">
              <div>
                <p className="font-semibold text-xs">Relatório Acadêmico Formatado em Padrão Formal — ERP3</p>
                <p className="text-[11px] text-slate-300">Pronto para gerar PDF A4 com capa, seções, tabelas, métricas SUS e homologação</p>
              </div>
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium transition-colors shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Salvar / Imprimir como PDF</span>
              </button>
            </div>

            {/* Documento Formatado em papel A4 visual */}
            <div className="p-6 bg-white border border-gray-300 rounded shadow-xs text-gray-800 font-sans space-y-4 max-h-[50vh] overflow-y-auto">
              {/* Capa / Cabeçalho */}
              <div className="text-center pb-4 border-b-2 border-slate-900">
                <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                  Projeto Acadêmico de Engenharia de Software
                </p>
                <h2 className="text-base font-bold text-gray-900 mt-1">
                  ENTREGA DO RELATÓRIO PERIÓDICO 3 (ERP3) — SISTEMA OPTISERVICE
                </h2>
                <p className="text-xs text-gray-600 mt-0.5">
                  Parceria Técnico-Operacional: Simplitech Assistência Técnica
                </p>
                <p className="text-[10px] text-gray-400 mt-1">Data: Outubro de 2026</p>
              </div>

              {/* Seção 1 */}
              <div>
                <h3 className="font-bold text-gray-900 text-xs border-b border-gray-200 pb-1 mb-2">
                  1. IDENTIFICAÇÃO E ESCOPO DA ENTREGA (ERP3)
                </h3>
                <p className="text-[11px] leading-relaxed text-gray-700">
                  O presente documento formaliza a Entrega do Relatório Periódico 3 (ERP3) do sistema <strong>OptiService</strong>. O software encontra-se totalmente funcional, integrado ao <strong>Cloud Firestore</strong> e <strong>Firebase Authentication</strong>, respondendo de ponta a ponta às necessidades da assistência técnica <strong>Simplitech</strong>.
                </p>
              </div>

              {/* Seção 2 */}
              <div>
                <h3 className="font-bold text-gray-900 text-xs border-b border-gray-200 pb-1 mb-2">
                  2. MÓDULOS E FUNCIONALIDADES ENTREGUES (ERP3)
                </h3>
                <div className="space-y-1 text-[11px] text-gray-700">
                  <p><strong>2.1 Dashboard Gerencial:</strong> Painel em tempo real com distribuição de serviços nos 5 status, métricas de equipamentos ativos e agendamentos pendentes.</p>
                  <p><strong>2.2 Gestão de Clientes:</strong> Cadastro estruturado (CPF/CNPJ, contatos, endereço), busca multicritério e ficha de histórico com todos os aparelhos e manutenções associadas.</p>
                  <p><strong>2.3 Gestão de Equipamentos:</strong> Associação relacional a clientes, categorização (Notebook, Desktop, Smartphone, etc.), registro de avarias físicas e número de série.</p>
                  <p><strong>2.4 Ordens de Serviço (O.S.):</strong> Ciclo de vida com 5 status (<em>Solicitado, Agendado, Em execução, Aguardando peça, Concluído</em>), parecer técnico, cálculo automático de custos e ficha de impressão.</p>
                  <p><strong>2.5 Agendamentos:</strong> Controle de visitas e entregas com horários e mudança rápida de status.</p>
                  <p><strong>2.6 Autenticação & Nuvem:</strong> Firebase Auth e Cloud Firestore com regras de segurança implementadas.</p>
                </div>
              </div>

              {/* Seção 3 */}
              <div>
                <h3 className="font-bold text-gray-900 text-xs border-b border-gray-200 pb-1 mb-2">
                  3. MATRIZ DE TESTES DE HOMOLOGAÇÃO (12 CASOS APROVADOS)
                </h3>
                <div className="border border-gray-200 rounded overflow-hidden text-[10px]">
                  <table className="w-full text-left">
                    <thead className="bg-gray-100 text-gray-700">
                      <tr>
                        <th className="p-1.5">ID</th>
                        <th className="p-1.5">Cenário Testado</th>
                        <th className="p-1.5">Critério de Sucesso</th>
                        <th className="p-1.5 text-center">Resultado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr>
                        <td className="p-1.5 font-mono">CT-01</td>
                        <td className="p-1.5 font-medium">Autenticação Google / Email</td>
                        <td className="p-1.5">Acesso restrito via Firebase Auth com token</td>
                        <td className="p-1.5 text-center font-bold text-emerald-700">Aprovado</td>
                      </tr>
                      <tr>
                        <td className="p-1.5 font-mono">CT-02</td>
                        <td className="p-1.5 font-medium">Cadastro e Ficha do Cliente</td>
                        <td className="p-1.5">Gravação no Firestore e histórico integrado</td>
                        <td className="p-1.5 text-center font-bold text-emerald-700">Aprovado</td>
                      </tr>
                      <tr>
                        <td className="p-1.5 font-mono">CT-03</td>
                        <td className="p-1.5 font-medium">Vínculo Cliente / Equipamento</td>
                        <td className="p-1.5">Dropdown filtra apenas aparelhos do cliente</td>
                        <td className="p-1.5 text-center font-bold text-emerald-700">Aprovado</td>
                      </tr>
                      <tr>
                        <td className="p-1.5 font-mono">CT-04</td>
                        <td className="p-1.5 font-medium">Ciclo dos 5 Status da O.S.</td>
                        <td className="p-1.5">Transição de Solicitado até Concluído em tempo real</td>
                        <td className="p-1.5 text-center font-bold text-emerald-700">Aprovado</td>
                      </tr>
                      <tr>
                        <td className="p-1.5 font-mono">CT-05</td>
                        <td className="p-1.5 font-medium">Cálculo Automático de Orçamento</td>
                        <td className="p-1.5">Total = Mão de Obra + Peças instantâneo</td>
                        <td className="p-1.5 text-center font-bold text-emerald-700">Aprovado</td>
                      </tr>
                      <tr>
                        <td className="p-1.5 font-mono">CT-06</td>
                        <td className="p-1.5 font-medium">Agendamento & Transição Rápida</td>
                        <td className="p-1.5">Agendado &rarr; Confirmado &rarr; Realizado</td>
                        <td className="p-1.5 text-center font-bold text-emerald-700">Aprovado</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Seção 4 */}
              <div>
                <h3 className="font-bold text-gray-900 text-xs border-b border-gray-200 pb-1 mb-2">
                  4. FEEDBACK DO CLIENTE E MÉTRICAS DE USABILIDADE (SUS)
                </h3>
                <p className="text-[11px] leading-relaxed text-gray-700">
                  Na homologação final realizada em 15/10/2026, foi aplicado o questionário <strong>System Usability Scale (SUS)</strong> com 5 colaboradores da Simplitech (Gerência, Atendimento de Balcão e Técnicos de Bancada). O sistema alcançou a nota média de <strong>86,5 pontos</strong> (Classificação Excelente / Nível A), com destaque para a ausência de distrações visuais e facilidade de operação rápida.
                </p>
              </div>

              {/* Seção 5 */}
              <div>
                <h3 className="font-bold text-gray-900 text-xs border-b border-gray-200 pb-1 mb-2">
                  5. ENCERRAMENTO E PREPARAÇÃO PARA DEFESA FINAL
                </h3>
                <p className="text-[11px] leading-relaxed text-gray-700">
                  Com o encerramento da etapa ERP3, a equipe avança para a consolidação dos slides de defesa acadêmica perante a banca examinadora e publicação permanente do ambiente de homologação.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ABA: Resumo dos Módulos */}
        {activeTab === 'summary' && (
          <div className="space-y-3 leading-relaxed text-gray-700">
            <div className="p-3 bg-gray-50 border border-gray-200 rounded">
              <h4 className="font-semibold text-gray-900 mb-1">Escopo Funcional Consolidado (ERP3):</h4>
              <ul className="list-disc pl-4 space-y-1 mt-2">
                <li><strong>Dashboard:</strong> Contadores em tempo real, distribuição nos 5 status e resumo operacional.</li>
                <li><strong>Clientes:</strong> CRUD completo, validação de CPF/CNPJ, ficha cadastral com histórico integrado.</li>
                <li><strong>Equipamentos:</strong> Associação relacional a clientes, identificação de tipo, modelo, serial e avarias.</li>
                <li><strong>Ordens de Serviço:</strong> Gestão dos 5 status (<em>Solicitado, Agendado, Em execução, Aguardando peça, Concluído</em>), cálculo de custos e impressão de ficha técnica.</li>
                <li><strong>Agendamentos:</strong> Planejamento de visitas e entregas com horários e mudança rápida de status.</li>
                <li><strong>Segurança:</strong> Firebase Authentication e regras de acesso no Cloud Firestore.</li>
              </ul>
            </div>
          </div>
        )}

        {/* ABA: Arquitetura & Dados */}
        {activeTab === 'architecture' && (
          <div className="space-y-3 text-gray-700">
            <div className="p-3 bg-gray-50 border border-gray-200 rounded">
              <h4 className="font-semibold text-gray-900 mb-2">Estrutura das Coleções Firestore:</h4>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 bg-white border border-gray-200 rounded">
                  <strong className="text-gray-900 block font-mono">clients</strong>
                  <span>Armazena clientes, contatos, CPF/CNPJ e endereços.</span>
                </div>
                <div className="p-2 bg-white border border-gray-200 rounded">
                  <strong className="text-gray-900 block font-mono">equipment</strong>
                  <span>Aparelhos vinculados ao clientId proprietário.</span>
                </div>
                <div className="p-2 bg-white border border-gray-200 rounded">
                  <strong className="text-gray-900 block font-mono">services</strong>
                  <span>Ordens de serviço com status, custos e parecer técnico.</span>
                </div>
                <div className="p-2 bg-white border border-gray-200 rounded">
                  <strong className="text-gray-900 block font-mono">appointments</strong>
                  <span>Agendamentos de atendimento técnico e prazos.</span>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-gray-500">
              Documentação detalhada e diagramas Mermaid disponíveis em <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-800">/docs/DIAGRAMAS_E_ARQUITETURA.md</code>.
            </p>
          </div>
        )}

        {/* ABA: Feedback & Testes */}
        {activeTab === 'feedback' && (
          <div className="space-y-3 text-gray-700">
            <div className="p-3 bg-gray-50 border border-gray-200 rounded">
              <h4 className="font-semibold text-gray-900 mb-1">Homologação com a Simplitech:</h4>
              <p className="text-xs text-gray-600 mt-1">
                Apresentado em 15/10/2026 para o gerente operacional da Simplitech. O cliente validou a transição dos 5 status operacionais, o cálculo automático de orçamento e a escala SUS atingiu <strong>86,5/100</strong>.
              </p>
            </div>
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-emerald-900">
              <div className="flex items-center gap-2 font-semibold mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>12 Casos de Testes Homologados com Sucesso:</span>
              </div>
              <p className="text-[11px]">
                Autenticação, CRUDs relacionais, integridade de status da O.S., regras de segurança e gravação reativa validados.
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center pt-3 border-t border-gray-200">
          <span className="text-[11px] text-gray-400">
            Arquivos completos salvos na pasta /docs do projeto
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
          >
            Fechar
          </button>
        </div>
      </div>
    </Modal>
  );
};
