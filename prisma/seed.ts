import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Demo@123456', 10);

  const users = [
    {
      email: 'ana.demo@example.com',
      name: 'Ana Souza',
    },
    {
      email: 'carlos.demo@example.com',
      name: 'Carlos Lima',
    },
    {
      email: 'mariana.demo@example.com',
      name: 'Mariana Costa',
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
      },
      create: {
        ...user,
        password: passwordHash,
      },
    });
  }
  const ana = await prisma.user.findUniqueOrThrow({
    where: { email: 'ana.demo@example.com' },
  });

  const carlos = await prisma.user.findUniqueOrThrow({
    where: { email: 'carlos.demo@example.com' },
  });

  const questionData = [
    {
      title: 'Como funciona a injeção de dependência no NestJS?',
      body: 'Estou estudando NestJS e quero entender como os providers são registrados e injetados nos services.',
      userId: ana.id,
    },
    {
      title: 'Qual a vantagem de usar Prisma com MySQL?',
      body: 'Quais são as vantagens de usar um ORM como o Prisma para acessar um banco MySQL em uma API REST?',
      userId: carlos.id,
    },
  ];

  for (const question of questionData) {
    const existingQuestion = await prisma.questions.findFirst({
      where: {
        title: question.title,
        userId: question.userId,
      },
    });

    if (!existingQuestion) {
      await prisma.questions.create({
        data: question,
      });
    }
  }

  const question = await prisma.questions.findFirstOrThrow({
    where: {
      title: 'Como funciona a injeção de dependência no NestJS?',
      userId: ana.id,
    },
  });

  const answerData = {
    body: 'No NestJS, a injeção de dependência permite que uma classe receba os providers de que precisa pelo construtor. Isso facilita a organização do código e os testes unitários.',
    userId: carlos.id,
    questionId: question.id,
  };

  const existingAnswer = await prisma.answers.findFirst({
    where: {
      body: answerData.body,
      userId: answerData.userId,
      questionId: answerData.questionId,
    },
  });

  if (!existingAnswer) {
    await prisma.answers.create({
      data: answerData,
    });
  }
}

main()
  .catch((error) => {
    console.error('Erro ao executar seed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
