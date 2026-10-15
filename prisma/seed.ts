import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Demo@123456', 10);

  const users = [
    { email: 'ana.demo@example.com', name: 'Ana Souza' },
    { email: 'carlos.demo@example.com', name: 'Carlos Lima' },
    { email: 'mariana.demo@example.com', name: 'Mariana Costa' },
    { email: 'pedro.demo@example.com', name: 'Pedro Oliveira' },
    { email: 'juliana.demo@example.com', name: 'Juliana Santos' },
    { email: 'lucas.demo@example.com', name: 'Lucas Ferreira' },
    { email: 'beatriz.demo@example.com', name: 'Beatriz Almeida' },
    { email: 'gabriel.demo@example.com', name: 'Gabriel Costa' },
    { email: 'larissa.demo@example.com', name: 'Larissa Ribeiro' },
    { email: 'matheus.demo@example.com', name: 'Matheus Carvalho' },
    { email: 'fernanda.demo@example.com', name: 'Fernanda Lima' },
    { email: 'rafael.demo@example.com', name: 'Rafael Gomes' },
    { email: 'camila.demo@example.com', name: 'Camila Martins' },
    { email: 'bruno.demo@example.com', name: 'Bruno Rocha' },
    { email: 'isabela.demo@example.com', name: 'Isabela Mendes' },
    { email: 'thiago.demo@example.com', name: 'Thiago Almeida' },
    { email: 'amanda.demo@example.com', name: 'Amanda Ribeiro' },
    { email: 'gustavo.demo@example.com', name: 'Gustavo Martins' },
    { email: 'leticia.demo@example.com', name: 'Leticia Ferreira' },
    { email: 'vinicius.demo@example.com', name: 'Vinicius Costa' },
    { email: 'isadora.demo@example.com', name: 'Isadora Lima' },
    { email: 'daniel.demo@example.com', name: 'Daniel Souza' },
    { email: 'patricia.demo@example.com', name: 'Patricia Santos' },
    { email: 'eduardo.demo@example.com', name: 'Eduardo Rocha' },
    { email: 'bianca.demo@example.com', name: 'Bianca Alves' },
    { email: 'henrique.demo@example.com', name: 'Henrique Gomes' },
    { email: 'natalia.demo@example.com', name: 'Natalia Carvalho' },
    { email: 'felipe.demo@example.com', name: 'Felipe Mendes' },
    { email: 'carolina.demo@example.com', name: 'Carolina Martins' },
    { email: 'rodrigo.demo@example.com', name: 'Rodrigo Oliveira' },
    { email: 'vitoria.demo@example.com', name: 'Vitoria Almeida' },
    { email: 'andre.demo@example.com', name: 'Andre Ribeiro' },
    { email: 'sabrina.demo@example.com', name: 'Sabrina Costa' },
    { email: 'leonardo.demo@example.com', name: 'Leonardo Santos' },
    { email: 'eduarda.demo@example.com', name: 'Eduarda Ferreira' },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: { ...user, password: passwordHash },
    });
  }

  const userByEmail = (email: string) =>
    prisma.user.findUniqueOrThrow({ where: { email } });

  const u = Object.fromEntries(
    await Promise.all(
      users.map(async (user) => [
        user.email.split('@')[0].split('.')[0],
        await userByEmail(user.email),
      ]),
    ),
  ) as Record<string, { id: number }>;

  const questionData = [
    {
      title: 'Como funciona a injeção de dependência no NestJS?',
      body: 'Estou estudando NestJS e quero entender como os providers são registrados e injetados nos services.',
      userId: u.ana.id,
      answers: [
        {
          body: 'No NestJS, a injeção de dependência permite que uma classe receba os providers de que precisa pelo construtor. Isso facilita a organização do código e os testes unitários.',
          userId: u.carlos.id,
        },
        {
          body: 'Você registra o provider no módulo e o Nest resolve as dependências automaticamente quando instancia o service.',
          userId: u.mariana.id,
        },
      ],
    },
    {
      title: 'Qual a vantagem de usar Prisma com MySQL?',
      body: 'Quais são as vantagens de usar um ORM como o Prisma para acessar um banco MySQL em uma API REST?',
      userId: u.carlos.id,
      answers: [
        {
          body: 'O Prisma oferece consultas tipadas, facilita o acesso ao banco e ajuda a manter o schema e as migrations organizados.',
          userId: u.pedro.id,
        },
        {
          body: 'Também reduz a necessidade de escrever SQL manualmente em operações comuns e melhora a experiência com TypeScript.',
          userId: u.ana.id,
        },
        {
          body: 'É importante lembrar que o ORM não elimina a necessidade de entender SQL e modelagem de dados.',
          userId: u.lucas.id,
        },
      ],
    },
    {
      title: 'Como testar services com Jest no NestJS?',
      body: 'Quero testar um service isoladamente sem precisar conectar ao banco de dados. Como posso fazer isso?',
      userId: u.mariana.id,
      answers: [
        {
          body: 'Crie uma suíte com Test.createTestingModule e substitua as dependências por mocks usando providers com useValue.',
          userId: u.beatriz.id,
        },
        {
          body: 'Depois, teste os resultados e os comportamentos esperados, como chamadas a métodos das dependências.',
          userId: u.gabriel.id,
        },
      ],
    },
    {
      title: 'Qual a diferença entre middleware e guard no NestJS?',
      body: 'Estou aprendendo NestJS e fiquei em dúvida sobre quando usar middleware e quando usar guards.',
      userId: u.pedro.id,
      answers: [
        {
          body: 'Middleware atua no fluxo da requisição antes do handler. Guards decidem se a requisição pode acessar determinada rota.',
          userId: u.juliana.id,
        },
      ],
    },
    {
      title: 'Como funciona a autenticação com JWT?',
      body: 'Depois que o usuário faz login, como o token JWT é validado nas próximas requisições?',
      userId: u.juliana.id,
      answers: [
        {
          body: 'O cliente envia o token normalmente no cabeçalho Authorization como Bearer. O backend verifica assinatura e validade antes de autorizar o acesso.',
          userId: u.rafael.id,
        },
        {
          body: 'Não coloque senhas ou outros segredos no payload do JWT, pois ele não é criptografado por padrão.',
          userId: u.fernanda.id,
        },
      ],
    },
    {
      title: 'Como organizar uma API em camadas?',
      body: 'Em um projeto backend, como separar controllers, services e acesso ao banco para manter o código organizado?',
      userId: u.lucas.id,
      answers: [],
    },
    {
      title: 'Quando devo usar transações no Prisma?',
      body: 'Tenho operações que precisam ser concluídas juntas. Como evitar que apenas parte delas seja salva no banco?',
      userId: u.beatriz.id,
      answers: [
        {
          body: 'Use uma transação quando um conjunto de operações precisa ser tratado como uma unidade: todas devem confirmar ou ser revertidas em caso de falha.',
          userId: u.matheus.id,
        },
      ],
    },
    {
      title: 'Como tratar erros em uma API REST com NestJS?',
      body: 'Qual é uma forma organizada de retornar erros HTTP sem espalhar lógica repetida pelos controllers?',
      userId: u.gabriel.id,
      answers: [],
    },
    {
      title: 'Como funcionam os relacionamentos no MySQL?',
      body: 'Quero relacionar usuários, perguntas e respostas. Quando devo usar chaves estrangeiras?',
      userId: u.larissa.id,
      answers: [
        {
          body: 'Chaves estrangeiras ajudam a garantir a integridade referencial. Por exemplo, uma resposta pode referenciar o usuário autor e a pergunta correspondente.',
          userId: u.bruno.id,
        },
        {
          body: 'Também é importante escolher regras de exclusão e índices considerando as consultas e o ciclo de vida dos registros.',
          userId: u.camila.id,
        },
      ],
    },
    {
      title: 'Qual a diferença entre mock e spy no Jest?',
      body: 'Estou praticando testes unitários. Quando faz sentido usar jest.fn e quando usar jest.spyOn?',
      userId: u.matheus.id,
      answers: [
        {
          body: 'Um mock pode substituir um comportamento. Um spy observa um método existente e permite verificar chamadas; por padrão, spyOn mantém a implementação original.',
          userId: u.isabela.id,
        },
      ],
    },
    {
      title: 'Como configurar variáveis de ambiente no NestJS?',
      body: 'Qual é uma forma segura de organizar DATABASE_URL e outras configurações entre desenvolvimento e produção?',
      userId: u.fernanda.id,
      answers: [],
    },
    {
      title: 'Como implementar paginação em uma API?',
      body: 'Tenho muitos registros e quero retornar apenas uma parte por requisição. Como funcionam page e limit?',
      userId: u.rafael.id,
      answers: [
        {
          body: 'page indica a página solicitada e limit define quantos registros vêm por página. O backend calcula o deslocamento e retorna metadados como total e totalPages.',
          userId: u.pedro.id,
        },
        {
          body: 'Também vale validar os valores recebidos e definir um limite máximo para evitar consultas excessivamente grandes.',
          userId: u.juliana.id,
        },
      ],
    },
    {
      title: 'Como usar Pipes para validar dados no NestJS?',
      body: 'Quero validar os dados recebidos nos parâmetros e no body das requisições.',
      userId: u.thiago.id,
      answers: [
        {
          body: 'Pipes podem transformar e validar valores antes que eles cheguem ao handler. ValidationPipe é comum com class-validator e DTOs.',
          userId: u.amanda.id,
        },
      ],
    },
    {
      title: 'Para que servem os interceptors no NestJS?',
      body: 'Em quais situações um interceptor é útil em uma API?',
      userId: u.amanda.id,
      answers: [
        {
          body: 'Interceptors podem executar lógica antes e depois do handler, transformar respostas e medir o tempo de execução.',
          userId: u.gustavo.id,
        },
      ],
    },
    {
      title: 'Qual a diferença entre PUT e PATCH?',
      body: 'Quero entender quando usar PUT e quando usar PATCH para atualizar recursos.',
      userId: u.gustavo.id,
      answers: [
        {
          body: 'PUT normalmente representa a substituição do recurso, enquanto PATCH aplica uma atualização parcial.',
          userId: u.leticia.id,
        },
      ],
    },
    {
      title: 'Como funciona o ciclo de vida dos módulos no NestJS?',
      body: 'Quero entender como organizar módulos e compartilhar providers entre eles.',
      userId: u.leticia.id,
      answers: [],
    },
    {
      title: 'Como proteger rotas com Guards?',
      body: 'Como verificar se um usuário autenticado pode acessar determinada rota?',
      userId: u.vinicius.id,
      answers: [
        {
          body: 'Um Guard implementa canActivate e pode consultar o usuário autenticado ou suas permissões antes de liberar a rota.',
          userId: u.isadora.id,
        },
      ],
    },
    {
      title: 'Como criar testes de integração para uma API?',
      body: 'Quero testar endpoints e verificar status HTTP e respostas.',
      userId: u.isadora.id,
      answers: [
        {
          body: 'Teste o fluxo da requisição HTTP usando uma aplicação de teste e prepare as dependências necessárias para isolar o cenário.',
          userId: u.daniel.id,
        },
      ],
    },
    {
      title: 'Quando usar relacionamentos um para muitos?',
      body: 'Um usuário pode criar várias perguntas. Como representar essa relação no Prisma?',
      userId: u.daniel.id,
      answers: [],
    },
    {
      title: 'Como evitar consultas N+1 no banco?',
      body: 'Minha API faz várias consultas para carregar dados relacionados. Como identificar e reduzir isso?',
      userId: u.patricia.id,
      answers: [
        {
          body: 'Analise as consultas geradas e use estratégias de carregamento de relações ou consultas agrupadas quando fizer sentido.',
          userId: u.eduardo.id,
        },
      ],
    },
    {
      title: 'Como usar Docker Compose no desenvolvimento?',
      body: 'Quero iniciar a API e os serviços de banco de dados com um único comando.',
      userId: u.eduardo.id,
      answers: [
        {
          body: 'Docker Compose define serviços, redes e volumes em um arquivo, permitindo subir os componentes com docker compose up.',
          userId: u.bianca.id,
        },
      ],
    },
    {
      title: 'Como configurar CORS no NestJS?',
      body: 'O navegador bloqueia chamadas do frontend para minha API. Como configurar as origens permitidas?',
      userId: u.bianca.id,
      answers: [],
    },
    {
      title: 'O que é Clean Architecture?',
      body: 'Como separar as regras de negócio dos detalhes de framework e banco de dados?',
      userId: u.henrique.id,
      answers: [
        {
          body: 'A ideia é manter as regras centrais independentes dos detalhes externos, usando abstrações para controlar as dependências.',
          userId: u.natalia.id,
        },
      ],
    },
    {
      title: 'Como implementar upload de arquivos?',
      body: 'Quero receber imagens por um endpoint da API e armazená-las com segurança.',
      userId: u.natalia.id,
      answers: [],
    },
    {
      title: 'Qual a diferença entre autenticação e autorização?',
      body: 'Quero entender a diferença entre confirmar a identidade do usuário e verificar suas permissões.',
      userId: u.felipe.id,
      answers: [
        {
          body: 'Autenticação verifica quem é o usuário. Autorização determina o que ele pode fazer ou acessar.',
          userId: u.carolina.id,
        },
      ],
    },
    {
      title: 'Como usar Redis em uma aplicação backend?',
      body: 'Quais são os usos comuns do Redis em APIs?',
      userId: u.carolina.id,
      answers: [
        {
          body: 'Redis é usado, entre outras coisas, para cache, armazenamento temporário e coordenação de tarefas, dependendo da arquitetura.',
          userId: u.rodrigo.id,
        },
      ],
    },
    {
      title: 'Como funciona o processamento assíncrono?',
      body: 'Quero executar tarefas demoradas sem deixar a requisição HTTP esperando.',
      userId: u.rodrigo.id,
      answers: [],
    },
    {
      title: 'Por que usar migrations no banco de dados?',
      body: 'Como versionar mudanças na estrutura do banco de forma controlada?',
      userId: u.vitoria.id,
      answers: [
        {
          body: 'Migrations registram alterações estruturais do banco, permitindo aplicá-las de forma controlada entre ambientes.',
          userId: u.andre.id,
        },
      ],
    },
    {
      title: 'Como validar DTOs no NestJS?',
      body: 'Como impedir que dados inválidos cheguem aos services?',
      userId: u.andre.id,
      answers: [],
    },
    {
      title: 'Como organizar logs em uma API?',
      body: 'Quero registrar erros e eventos importantes sem expor informações sensíveis.',
      userId: u.sabrina.id,
      answers: [
        {
          body: 'Registre contexto útil para diagnóstico, mas evite tokens, senhas e dados pessoais desnecessários nos logs.',
          userId: u.leonardo.id,
        },
      ],
    },
    {
      title: 'Como escolher entre SQL e NoSQL?',
      body: 'Quais fatores devo avaliar ao escolher o tipo de banco para um projeto?',
      userId: u.leonardo.id,
      answers: [],
    },
    {
      title: 'Como documentar endpoints com Swagger?',
      body: 'Quero deixar as rotas e os DTOs da API documentados para outros desenvolvedores.',
      userId: u.eduarda.id,
      answers: [
        {
          body: 'No NestJS, o pacote Swagger permite descrever endpoints e modelos DTO e gerar uma interface interativa de documentação.',
          userId: u.thiago.id,
        },
      ],
    },
  ];

  for (const question of questionData) {
    const { answers, ...questionFields } = question;

    let savedQuestion = await prisma.questions.findFirst({
      where: {
        title: questionFields.title,
        userId: questionFields.userId,
      },
    });

    if (!savedQuestion) {
      savedQuestion = await prisma.questions.create({
        data: questionFields,
      });
    }

    for (const answer of answers) {
      const existingAnswer = await prisma.answers.findFirst({
        where: {
          body: answer.body,
          userId: answer.userId,
          questionId: savedQuestion.id,
        },
      });

      if (!existingAnswer) {
        await prisma.answers.create({
          data: {
            body: answer.body,
            userId: answer.userId,
            questionId: savedQuestion.id,
          },
        });
      }
    }
  }

  console.log(
    `Seed concluída: ${users.length} usuários e ${questionData.length} perguntas processados.`,
  );
}

main()
  .catch((error) => {
    console.error('Erro ao executar seed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
