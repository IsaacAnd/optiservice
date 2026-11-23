# OptiService - Tarefa 9 / RP8

## Escopo da entrega

Esta etapa disponibiliza a aplicação para avaliação da banca, o código-fonte e a documentação técnica atualizada.

- Aplicação: https://isaacand.github.io/optiservice/
- Repositório: https://github.com/IsaacAnd/optiservice
- CI/CD: https://github.com/IsaacAnd/optiservice/actions/runs/43983248554
- Monitoramento: https://github.com/IsaacAnd/optiservice/actions/runs/45131703682

## Evoluções desta etapa

- Manifesto e service worker para instalação como aplicativo web e cache dos recursos já acessados.
- Remoção de credenciais de demonstração expostas e do cadastro automático no cliente.
- Dados de seed explicitamente fictícios.
- Testes automatizados para a serialização CSV e proteção contra fórmulas.
- CI/CD atualizado para executar testes, lint e build antes da publicação.

## Limites e cuidados para avaliação

- A banca deve usar uma conta de demonstração previamente autorizada no Firebase Authentication.
- O cache offline não substitui Firebase Authentication ou Cloud Firestore: operações autenticadas ainda exigem conexão.
- O monitoramento HTTP confirma a disponibilidade do frontend; ele não substitui testes de fluxos autenticados.
- Não utilizar dados pessoais reais no ambiente acadêmico.

## Material complementar

Os PDFs de entrega devem ser disponibilizados na pasta compartilhada informada no campo de submissão. Antes da entrega, testar o link em janela anônima.
