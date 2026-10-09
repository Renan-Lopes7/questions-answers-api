import { QuestionsService } from './questions.service';
import { PrismaService } from '../database/prisma.service';
import { RedisService } from '../redis/redis.service';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { escape } from 'querystring';
import { CreateQuestionDto } from './dto/create-question.dto';
import { table } from 'console';
import { PaginationDto } from '../common/dto/pagination.dto';

jest.mock('../redis/redis.service', () => ({
  RedisService: jest.fn(),
}));

describe('QuestionsService', () => {
  let questionsService: QuestionsService;

  const mockPrismaService = {
    questions: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };

  const mockRedisService = {
    get: jest.fn(),
    keys: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    questionsService = module.get<QuestionsService>(QuestionsService);

    mockRedisService.get.mockResolvedValue(null);
    mockRedisService.keys.mockResolvedValue([]);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('findOne', () => {
    it('Should find one question', async () => {
      const id = 5;

      mockPrismaService.questions.findUnique.mockResolvedValue({
        id: 5,
        title: 'test',
        body: 'test.',
        userId: 1,
      });

      const result = await questionsService.findOne(id);

      expect(result).toEqual({
        id: 5,
        title: 'test',
        body: 'test.',
        userId: 1,
      });
    });
    it('Should throw an error if question not found', async () => {
      mockPrismaService.questions.findUnique.mockResolvedValue(null);
      const result = questionsService.findOne(3);
      await expect(result).rejects.toThrow(
        new NotFoundException('Question not found'),
      );
    });
  });

  describe('remove', () => {
    it('Should throw an error if question not exist', async () => {
      const id = 5;
      const requestId = 1;

      mockPrismaService.questions.findFirst.mockResolvedValue(null);
      const result = questionsService.remove(id, requestId);
      await expect(result).rejects.toThrow('Question not found');
    });

    it('Should throw an error if requestID is not the owner of the question ', async () => {
      const id = 5;
      const requestId = 1;

      mockPrismaService.questions.findFirst.mockResolvedValue({
        id: 5,
        title: 'test',
        body: 'test.',
        userId: 2,
      });
      const result = questionsService.remove(id, requestId);
      await expect(result).rejects.toThrow(
        'You can only remove your own question',
      );
    });

    it('Should delete an question', async () => {
      const id = 5;
      const requestId = 1;

      mockPrismaService.questions.findFirst.mockResolvedValue({
        id: 5,
        title: 'test',
        body: 'test.',
        userId: 1,
      });

      const result = await questionsService.remove(id, requestId);

      expect(mockPrismaService.questions.delete).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual({
        message: 'Question deleted',
      });
    });
  });

  describe('update', () => {
    it('Should throw an error if question not exist', async () => {
      const id = 1;
      const requestId = 2;
      const updateQuestionDto: UpdateQuestionDto = {
        title: 'titulo',
        body: 'body',
      };

      mockPrismaService.questions.findFirst.mockResolvedValue(null);

      const result = questionsService.update(id, updateQuestionDto, requestId);
      await expect(result).rejects.toThrow('This question not exist');
    });

    it('Should throw error if requestiD not owner the question', async () => {
      const id = 1;
      const requestId = 2;
      const updateQuestionDto: UpdateQuestionDto = {
        title: 'titulo',
        body: 'body',
      };

      mockPrismaService.questions.findFirst.mockResolvedValue({
        id: 1,
        title: 'test',
        body: 'test',
        userId: 3,
      });
      const result = questionsService.update(id, updateQuestionDto, requestId);
      await expect(result).rejects.toThrow(
        'You can only edit your own question',
      );
    });
    it('Should return question updated', async () => {
      const id = 1;
      const requestId = 2;
      const updateQuestionDto: UpdateQuestionDto = {
        title: 'titulo',
        body: 'body',
      };
      mockPrismaService.questions.findFirst.mockResolvedValue({
        id: 1,
        title: 'test',
        body: 'test',
        userId: 2,
      });

      mockPrismaService.questions.update.mockResolvedValue({
        where: { id },
        data: updateQuestionDto,
      });

      const result = await questionsService.update(
        id,
        updateQuestionDto,
        requestId,
      );

      expect(mockPrismaService.questions.update).toHaveBeenCalledWith({
        where: { id },
        data: updateQuestionDto,
      });
      expect(result).toEqual({
        message: 'Updated question',
      });
    });
  });

  describe('create', () => {
    it('Should create un question', async () => {
      const userId = 1;
      const createQuestionDto: CreateQuestionDto = {
        title: 'titulo',
        body: 'body',
      };

      mockPrismaService.questions.create.mockResolvedValue({
        userId,
        title: 'test',
        body: 'test.',
      });

      const result = await questionsService.create(createQuestionDto, userId);

      expect(mockPrismaService.questions.create).toHaveBeenCalledWith({
        data: { ...createQuestionDto, userId },
      });

      expect(result).toEqual({
        userId,
        title: 'test',
        body: 'test.',
      });
    });
  });

  describe('findAll', () => {
    it('Should return question when cache is empty', async () => {
      const paginationDto = { page: 1, limit: 10 };
      mockPrismaService.questions.findMany.mockResolvedValue([
        {
          id: 1,
          title: 'Título',
          body: 'Corpo',
          userId: 1,
        },
      ]);
      mockPrismaService.questions.count.mockResolvedValue(1);

      const result = await questionsService.findAll(paginationDto);

      expect(result).toEqual({
        data: [
          {
            id: 1,
            title: 'Título',
            body: 'Corpo',
            userId: 1,
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

    it('should return whether the questions are in the service', async () => {
      const paginationDto = { page: 1, limit: 10 };

      const cachedResult = {
        data: [
          {
            id: 1,
            title: 'Título',
            body: 'Corpo',
            userId: 1,
          },
        ],
        meta: {
          total: 1,
          page: 1,
          limit: 1,
          totalPages: 1,
        },
      };

      mockRedisService.get.mockResolvedValue(JSON.stringify(cachedResult));

      const result = await questionsService.findAll(paginationDto);
      expect(result).toEqual(cachedResult);

      expect(mockPrismaService.questions.findMany).not.toHaveBeenCalled();
    });
    it('Should validate pagination', async () => {
      const page = 2;
      const limit = 5;

      const skip = (page - 1) * limit;

      mockPrismaService.questions.findMany.mockResolvedValue([
        {
          id: 1,
          title: 'Título',
          body: 'Corpo',
          userId: 1,
        },
      ]);

      mockPrismaService.questions.count.mockResolvedValue(10);

      const result = await questionsService.findAll({ page, limit });
      expect(mockPrismaService.questions.findMany).toHaveBeenCalledWith({
        skip,
        take: limit,
        include: {
          user: { select: { name: true } },
          answers: true,
        },
      });
      expect(result).toEqual({
        data: [
          {
            id: 1,
            title: 'Título',
            body: 'Corpo',
            userId: 1,
          },
        ],
        meta: {
          total: 10,
          page: 2,
          limit: 5,
          totalPages: 2,
        },
      });
    });
  });
});
