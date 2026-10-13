import { Test, TestingModule } from '@nestjs/testing';
import { AnswersService } from './answers.service';
import { PrismaService } from '../database/prisma.service';
import { RedisService } from '../redis/redis.service';

jest.mock('../redis/redis.service', () => ({
  RedisService: jest.fn(),
}));

describe('Answers service', () => {
  let answersService: AnswersService;

  const mockPrismaService = {
    answers: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };
  const mockRedisService = {
    get: jest.fn(),
    set: jest.fn(),
    keys: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnswersService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    answersService = module.get<AnswersService>(AnswersService);

    mockRedisService.get.mockResolvedValue(null);
    mockRedisService.keys.mockResolvedValue([]);
  });
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('create', () => {
    it('Should create an answer', async () => {
      const createAnswerDto = { body: 'message' };
      const userId = 1;
      const questionId = 4;

      mockPrismaService.answers.create.mockResolvedValue({
        body: 'message',
        userId,
        questionId,
      });

      const result = await answersService.create(
        createAnswerDto,
        userId,
        questionId,
      );
      expect(result).toEqual({
        body: createAnswerDto.body,
        userId,
        questionId,
      });
    });

    it('Should call Prisma create with the correct data', async () => {
      const createAnswerDto = { body: 'message' };
      const userId = 1;
      const questionId = 4;

      mockPrismaService.answers.create.mockResolvedValue({
        body: 'message',
        userId,
        questionId,
      });
      await answersService.create(createAnswerDto, userId, questionId);
      expect(mockPrismaService.answers.create).toHaveBeenCalledWith({
        data: {
          body: createAnswerDto.body,
          userId,
          questionId,
        },
      });
    });
  });

  describe('findAll', () => {
    it('Should return all users if cache is empty', async () => {
      const paginationDto = { page: 1, limit: 10 };
      mockPrismaService.answers.findMany.mockResolvedValue([
        {
          id: 1,
          body: 'Minha resposta de teste',
          userId: 2,
          questionId: 1,
          question: {
            id: 1,
            title: 'Minha pergunta de teste',
            body: 'Conteúdo da pergunta',
          },
        },
      ]);

      mockPrismaService.answers.count.mockResolvedValue(1);

      const result = await answersService.findAll(paginationDto);

      expect(result).toEqual({
        data: [
          {
            id: 1,
            body: 'Minha resposta de teste',
            userId: 2,
            questionId: 1,
            question: {
              id: 1,
              title: 'Minha pergunta de teste',
              body: 'Conteúdo da pergunta',
            },
          },
        ],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
    });
    it('Should return if anwers are in the cache ', async () => {
      const paginationDto = { page: 1, limit: 10 };
      const cachedResult = {
        data: [
          {
            id: 1,
            body: 'Minha resposta',
            userId: 1,
            questionId: 1,
          },
        ],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };

      mockRedisService.get.mockResolvedValue(JSON.stringify(cachedResult));

      const result = await answersService.findAll(paginationDto);
      expect(result).toEqual(cachedResult);

      expect(mockPrismaService.answers.findMany).not.toHaveBeenCalled();
    });

    it('should use findMany with the correct object ', async () => {
      const page = 2;
      const limit = 5;
      const skip = (page - 1) * limit;
      mockPrismaService.answers.findMany.mockResolvedValue([
        {
          id: 1,
          body: 'Minha resposta de teste',
          userId: 2,
          questionId: 1,
          question: {
            id: 1,
            title: 'Minha pergunta de teste',
            body: 'Conteúdo da pergunta',
          },
        },
      ]);

      mockPrismaService.answers.count.mockResolvedValue(1);
      await answersService.findAll({ page, limit });

      expect(mockPrismaService.answers.findMany).toHaveBeenCalledWith({
        skip,
        take: limit,
        include: { question: true },
      });
    });
  });

  describe('finOne', () => {
    it('Should return an anwer', async () => {
      mockPrismaService.answers.findFirst.mockResolvedValue({
        id: 1,
        body: 'Minha resposta de teste',
        userId: 2,
        questionId: 1,
        question: {
          id: 1,
          title: 'Minha pergunta de teste',
          body: 'Conteúdo da pergunta',
        },
      });
      const result = await answersService.findOne(1);
      expect(result).toEqual({
        id: 1,
        body: 'Minha resposta de teste',
        userId: 2,
        questionId: 1,
        question: {
          id: 1,
          title: 'Minha pergunta de teste',
          body: 'Conteúdo da pergunta',
        },
      });
    });
    it('Should throw an error if answes not exist', async () => {
      mockPrismaService.answers.findFirst.mockResolvedValue(null);
      await expect(answersService.findOne(999)).rejects.toThrow(
        'Answer not found',
      );
    });
  });

  describe('update', () => {
    it('Should update an answer', async () => {
      const id = 2;
      const updateAnswerDto = { body: 'new message' };
      const requestId = 2;

      mockPrismaService.answers.findFirst.mockResolvedValue({
        id: 1,
        body: 'test',
        userId: 2,
      });
      mockPrismaService.answers.update.mockResolvedValue({
        id,
        body: updateAnswerDto.body,
        userId: requestId,
      });

      const updateAnswer = await answersService.update(
        id,
        updateAnswerDto,
        requestId,
      );
      expect(updateAnswer).toEqual({
        message: 'Updated answer',
        updateAnswer: {
          id,
          body: updateAnswerDto.body,
          userId: requestId,
        },
      });
    });

    it('Should throw an error if answer not found ', async () => {
      const id = 2;
      const updateAnswerDto = { body: 'new message' };
      const requestId = 2;
      mockPrismaService.answers.findFirst.mockResolvedValue(null);
      await expect(
        answersService.update(id, updateAnswerDto, requestId),
      ).rejects.toThrow('Answer not found');
    });

    it('Should throw an error if userId not match on id', async () => {
      const id = 2;
      const updateAnswerDto = { body: 'new message' };
      const requestId = 4;

      mockPrismaService.answers.findFirst.mockResolvedValue({
        id,
        body: 'message',
        userId: 2,
      });
      await expect(
        answersService.update(id, updateAnswerDto, requestId),
      ).rejects.toThrow('You can only edit your own answer');
      expect(mockPrismaService.answers.update).not.toHaveBeenCalled();
    });

    it('should check if prismaService update is being called with the correct data', async () => {
      const id = 1;
      const updateAnswerDto = { body: 'new message' };
      const requestId = 2;
      mockPrismaService.answers.findFirst.mockResolvedValue({
        id,
        body: 'message',
        userId: 2,
      });
      await answersService.update(id, updateAnswerDto, requestId);
      expect(mockPrismaService.answers.update).toHaveBeenCalledWith({
        where: { id },
        data: updateAnswerDto,
      });
    });
  });

  describe('delete', () => {
    it('Should delete an answer', async () => {
      const id = 1;
      const requestId = 2;
      mockPrismaService.answers.findFirst.mockResolvedValue({
        id: id,
        body: 'test',
        userId: 2,
      });
      mockPrismaService.answers.delete.mockResolvedValue({
        id: 1,
        body: 'test',
        userId: 2,
      });
      const result = await answersService.remove(id, requestId);

      expect(result).toEqual({
        message: 'Removed with success',
      });
    });

    it('Should throw an error if answer not exist', async () => {
      const id = 1;
      const requestId = 2;
      mockPrismaService.answers.findFirst.mockResolvedValue(null);
      await expect(answersService.remove(id, requestId)).rejects.toThrow(
        'Answer not found',
      );
    });

    it('Should throw an error if userId not match on id', async () => {
      const id = 1;
      const requestId = 2;
      mockPrismaService.answers.findFirst.mockResolvedValue({
        id: 1,
        body: 'test',
        userId: 5,
      });
      await expect(answersService.remove(id, requestId)).rejects.toThrow(
        'You can only delete your own answer',
      );
      expect(mockPrismaService.answers.delete).not.toHaveBeenCalled();
    });
  });
});
