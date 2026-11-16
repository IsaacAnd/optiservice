# CI/CD e monitoramento — RP7

Os workflows em `.github/workflows` foram preparados para executar instalação com Bun e lockfile, checagem TypeScript, build Vite e publicação no GitHub Pages após aprovação do build na main. A checagem HTTP pós-publicação e o workflow agendado a cada seis horas verificam disponibilidade básica do frontend. A aba Actions registra resultados e logs; não monitora transações Firebase nem substitui testes funcionais.

## Ativação e verificação
1. Enviar todos os arquivos ao GitHub, incluindo `.github`, `src`, `docs` e `bun.lock`.
2. Settings > Pages > Build and deployment > Source: GitHub Actions.
3. Firebase Authentication > Settings > Authorized domains: adicionar `isaacand.github.io` ao projeto de demonstração. Confirmar provedores e regras publicados no banco correto. Não usar dados reais em ambiente acadêmico aberto.
4. Actions > CI/CD OptiService > Run workflow; verificar build, deploy e teste HTTP. Executar também Monitoramento HTTP.
5. Abrir a URL informada pelo deploy, testar login e operações com dados fictícios; registrar evidências. O endereço esperado é https://isaacand.github.io/optiservice/.

O workflow não publica regras Firestore automaticamente. O código não foi compilado neste ambiente por indisponibilidade de acesso ao registro de pacotes. Nenhuma execução bem-sucedida é afirmada até conferir Actions.
