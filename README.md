# ID Gestão: Seu Acesso Seguro

Quero criar a primeira tela de autenticação do sistema:

ID Gestão 
Instituto Designio
Plataforma de Gestão e Projetos

IMPORTANTE — REGRAS DE ARQUITETURA

Este projeto já possui backend, banco de dados, autenticação, segurança e estrutura de permissões sendo desenvolvidos manualmente.

NÃO FAÇA:
- não crie tabelas no Supabase;
- não altere tabelas existentes;
- não crie migrations;
- não crie policies RLS;
- não altere RLS;
- não crie roles;
- não crie permissions;
- não crie triggers;
- não crie usuários manualmente;
- não crie autenticação por e-mail/senha;
- não implemente autorização baseada apenas no frontend;
- não exponha service_role key;
- não coloque secrets no código frontend.

O Supabase existente deve ser CONECTADO ao frontend, e não recriado.

==================================================
OBJETIVO DESTA ETAPA
==================================================

Criar exclusivamente:

1. tela de login;
2. integração do botão "Entrar com Google" com Supabase Auth;
3. tratamento do retorno OAuth;
4. gerenciamento básico da sessão autenticada;
5. tela temporária de pós-login para validarmos a autenticação.

Não desenvolver ainda o dashboard completo.

==================================================
IDENTIDADE VISUAL
==================================================

Utilize o logo anexado do ID Gestão como elemento principal da identidade visual.

A aplicação pertence ao Instituto Designio.

Nome:
ID Gestão

Subtítulo:
Plataforma de Gestão e Projetos

Quero uma identidade visual institucional relacionada a:

- saúde;
- saúde mental;
- cuidado;
- organização;
- confiança;
- acolhimento;
- tecnologia;
- segurança;
- profissionalismo.

Mas NÃO quero aparência de hospital tradicional.

Evitar:
- excesso de cruzes médicas;
- estética hospitalar;
- imagens genéricas de médicos;
- excesso de azul clínico;
- aparência de sistema público antigo;
- aparência de template administrativo genérico.

Quero uma interface contemporânea, elegante e sofisticada.

A tela deve transmitir a sensação de uma clínica/instituição de saúde mental moderna e humanizada.

==================================================
LAYOUT
==================================================

Desktop:

Criar layout dividido em duas áreas.

LADO ESQUERDO:

Área institucional e visual.

Pode utilizar elementos gráficos abstratos e discretos relacionados a:
- cuidado;
- conexão humana;
- saúde mental;
- acolhimento;
- desenvolvimento humano.

Utilizar o logo do ID Gestão.

Apresentar:

ID Gestão

Plataforma de Gestão e Projetos

Instituto Designio

Adicionar uma frase institucional discreta:

"Cuidado, gestão e impacto em um só ambiente."

LADO DIREITO:

Criar um card de autenticação elegante.

Título:

Bem-vindo ao ID Gestão

Texto:

"Acesse o ambiente institucional com sua conta do Instituto Designio."

Botão principal:

[ ícone Google ] Entrar com Google

Abaixo:

"Acesso exclusivo para colaboradores autorizados do Instituto Designio."

Adicionar discretamente:

"Ambiente seguro • Acesso institucional"

==================================================
MOBILE
==================================================

A página precisa ser completamente responsiva.

Em celulares:

- priorizar logo;
- card de autenticação;
- botão Google;
- reduzir elementos decorativos;
- manter excelente legibilidade.

==================================================
AUTENTICAÇÃO
==================================================

Usar a integração Supabase já existente.

O botão deve executar autenticação OAuth:

supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`
  }
})

Não criar autenticação alternativa.

Não oferecer:
- cadastro;
- criar conta;
- senha;
- recuperar senha;
- login por magic link.

O único método de acesso nesta etapa será:

ENTRAR COM GOOGLE

==================================================
DOMÍNIO
==================================================

O backend/Supabase já possui uma regra de segurança para permitir somente usuários institucionais.

O frontend pode informar ao usuário que o acesso requer conta:

@institutodesignio.org

Mas NÃO considere essa validação frontend como mecanismo de segurança.

A segurança real continuará sendo feita pelo backend/Supabase.

==================================================
CALLBACK
==================================================

Criar rota:

/auth/callback

Ela deve:

1. aguardar o Supabase concluir a sessão OAuth;
2. recuperar a sessão autenticada;
3. tratar estado de carregamento;
4. tratar erro de autenticação;
5. redirecionar o usuário autenticado para:

/app

Se ocorrer erro, voltar para:

/login

e apresentar mensagem amigável.

==================================================
SESSÃO
==================================================

Criar gerenciamento básico de sessão usando Supabase Auth.

Ao carregar uma rota protegida:

- verificar se existe sessão;
- se não existir, redirecionar para /login.

Não implementar ainda nossa matriz completa de autorização.

Roles, permissions e scopes serão fornecidos posteriormente pelo backend.

==================================================
ROTA TEMPORÁRIA /app
==================================================

Criar uma tela temporária simples apenas para confirmar que o OAuth funcionou.

Mostrar:

ID Gestão

"Autenticação realizada com sucesso."

Mostrar somente informações não sensíveis da sessão:

- nome;
- e-mail;
- avatar Google, se disponível.

Adicionar botão:

"Sair"

O botão deve executar:

supabase.auth.signOut()

e retornar para:

/login

IMPORTANTE:

Esta tela é temporária.

NÃO criar dashboard administrativo ainda.

==================================================
ESTRUTURA DE CÓDIGO
==================================================

Organizar os componentes para permitir evolução posterior.

Sugestão:

/pages
  Login
  AuthCallback
  App

/components
  auth
  ui
  branding

/lib
  supabase

/hooks
  useAuth

Não concentrar toda a lógica de autenticação em um único componente.

==================================================
SEGURANÇA
==================================================

Nunca usar service_role no frontend.

Usar somente configuração pública necessária ao Supabase client.

Não armazenar tokens manualmente em localStorage.

Deixar o SDK oficial do Supabase administrar a sessão.

Não confiar em role ou permission enviada manualmente pelo frontend.

Não criar dados fictícios de autorização.

==================================================
DESIGN SYSTEM INICIAL
==================================================

Usar como referência principal as cores presentes no logo anexado.

Criar uma pequena base de design system:

- background;
- surface;
- primary;
- primary foreground;
- text;
- muted text;
- border;
- success;
- warning;
- error.

Preferir CSS variables/design tokens.

Tipografia moderna, limpa e institucional.

Boa hierarquia visual.

Bordas discretas.

Sombras suaves.

Microinterações elegantes.

Evitar animações excessivas.

==================================================
ACESSIBILIDADE
==================================================

Garantir:

- contraste adequado;
- foco visível;
- navegação por teclado;
- labels;
- aria-label quando necessário;
- estados loading e disabled;
- mensagens de erro compreensíveis.

==================================================
RESULTADO DESTA ENTREGA
==================================================

Ao final desta etapa eu quero conseguir:

1. abrir /login;
2. visualizar uma tela profissional do ID Gestão;
3. clicar em "Entrar com Google";
4. autenticar usando Google;
5. retornar para /auth/callback;
6. entrar em /app;
7. visualizar meu nome e e-mail;
8. clicar em sair;
9. retornar para /login.

NÃO avance além disso.

Antes de fazer qualquer alteração no Supabase, banco de dados ou arquitetura backend existente, pare e informe o que seria necessário.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://idgestaoplaforma.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/abc7cef2-170b-4bae-b829-776cfc52fb1b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
