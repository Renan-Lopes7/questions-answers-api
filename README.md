<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# DevDúvida

Uma API de perguntas e respostas voltada para dúvidas técnicas de programação — um espaço para devs perguntarem, responderem e aprenderem entre si.

Construída do zero com NestJS, Prisma, MySQL e Redis, com autenticação JWT, autorização por dono de recurso, cache, documentação interativa e um frontend de apoio em React.

## 🔗 Links

- **Aplicação (frontend):** https://questions-answers-api-1.onrender.com
- **Documentação da API (Swagger):** https://questions-answers-api-fb0z.onrender.com/api

## ⚠️ Nota sobre hospedagem

Este projeto está hospedado em serviços gratuitos (Render para a aplicação, Aiven para o banco de dados e o cache). O backend "dorme" após períodos de inatividade — a primeira requisição pode levar de 30 segundos a 1 minuto para responder, enquanto o servidor "acorda". Depois disso, as respostas voltam ao normal.

## 🧱 Stack

- **Backend:** NestJS + TypeScript
- **Banco de dados:** MySQL (via Prisma ORM)
- **Cache:** Redis / Valkey
- **Autenticação:** JWT
- **Documentação:** Swagger (OpenAPI)
- **Testes:** Jest (testes unitários)
- **Frontend:** React + Vite
- **Infraestrutura:** Docker (ambiente local), Render + Aiven (produção)

## ✨ Funcionalidades

- Cadastro e login de usuários, com senha em hash (bcrypt)
- Autenticação via JWT
- CRUD completo de perguntas e respostas
- Autorização por dono de recurso — apenas quem criou uma pergunta ou resposta pode editá-la ou excluí-la
- Listagem paginada de perguntas e usuários
- Cache de leitura (cache-aside) na listagem de perguntas, com invalidação automática a cada criação, edição ou exclusão
- Validação de dados em todas as entradas (class-validator)
- Documentação interativa da API via Swagger

## 🧪 Sobre o uso do Redis

O Redis foi incorporado ao projeto principalmente como exercício de aprendizado — a aplicação, no seu volume atual, não exigiria cache para funcionar bem. A ideia foi entender na prática o padrão cache-aside: verificar se o dado já está em cache antes de consultar o banco, armazenar o resultado com expiração (TTL) e invalidar o cache sempre que os dados mudam. Esse é o tipo de decisão que, em um sistema com volume real de tráfego, passa a fazer diferença de verdade.

## 🧪 Testes

O projeto conta com testes unitários (Jest) cobrindo a camada de serviços de `User`, `Questions` e `Answers` — incluindo casos de sucesso, validações de negócio e cenários de erro (recurso não encontrado, tentativa de editar/excluir algo que não é seu, senha incorreta, etc.), com Prisma e Redis mockados.

```bash
npm run test
npm run test:cov   # com relatório de cobertura
```

**Resultado:**

```
Test Suites: 3 passed, 3 total
Tests:       39 passed, 39 total
```

**Cobertura (services):**

```
File                  | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-----------------------|---------|----------|---------|---------|-------------------
answers.service.ts     |  97.61  |  79.16   |  100    |  97.29  | 22
questions.service.ts   |  97.56  |  79.16   |  100    |  97.22  | 23
user.service.ts        |  94.44  |  79.41   |  100    |  95.91  | 25,158
```

Controllers e módulos não possuem testes unitários dedicados — por serem camadas finas, que apenas repassam dados aos services, o foco de cobertura foi direcionado para a lógica de negócio.

## 🚀 Rodando localmente

### Pré-requisitos

- Node.js
- Docker (para subir MySQL e Redis localmente)

### Passos

1. Clone o repositório:
```bash
git clone https://github.com/Renan-Lopes7/questions-answers-api.git
cd questions-answers-api
```

2. Copie o arquivo de exemplo de variáveis de ambiente:
```bash
cp .env.example .env
```

3. Suba o banco de dados e o cache:
```bash
docker compose up -d
```

4. Instale as dependências:
```bash
npm install
```

5. Rode as migrations do Prisma:
```bash
npx prisma migrate dev
```

6. Inicie a aplicação:
```bash
npm run start:dev
```

7. Acesse a documentação interativa:
```
http://localhost:3000/api
```

### Rodando o frontend

```bash
cd frontend
npm install
npm run dev
```

Acesse em `http://localhost:5173`. Certifique-se de que o backend está rodando e que o CORS está liberado para essa origem.

## 📋 Roadmap

- [x] CRUD de perguntas e respostas
- [x] Autenticação JWT
- [x] Autorização por dono de recurso
- [x] Validação de dados
- [x] Paginação
- [x] Cache com Redis (cache-aside)
- [x] Dockerização (MySQL + Redis)
- [x] Documentação com Swagger
- [x] Testes unitários (Jest)
- [x] Frontend de apoio em React
- [x] Deploy (Render + Aiven)

