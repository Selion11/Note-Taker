import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { In } from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { Note } from '../entities/note.entity';
import { NotesService } from './note.service';

describe('NotesService', () => {
  let service: NotesService;

  const mockNotesRepository = {
    create: jest.fn(),
    save: jest.fn(),
    preload: jest.fn(),
    delete: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockCategoriesRepository = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotesService,
        { provide: getRepositoryToken(Note), useValue: mockNotesRepository },
        { provide: getRepositoryToken(Category), useValue: mockCategoriesRepository },
      ],
    }).compile();

    service = module.get<NotesService>(NotesService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('creates a note without categories', async () => {
      mockNotesRepository.create.mockReturnValue({ title: 't', content: 'c' });
      mockNotesRepository.save.mockResolvedValue({ id: 1, title: 't', content: 'c', categories: [] });

      const result = await service.create({ title: 't', content: 'c' } as any);

      expect(mockNotesRepository.create).toHaveBeenCalled();
      expect(mockNotesRepository.save).toHaveBeenCalled();
      expect(result.id).toBe(1);
    });

    it('throws BadRequestException when categoryIds include unknown ids', async () => {
      mockNotesRepository.create.mockReturnValue({ title: 't', content: 'c' });
      mockCategoriesRepository.find.mockResolvedValue([{ id: 1, name: 'a' }]);

      await expect(service.create({ title: 't', content: 'c', categoryIds: [1, 2] } as any)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockCategoriesRepository.find).toHaveBeenCalledWith({ where: { id: In([1, 2]) } });
    });
  });

  describe('findAll', () => {
    it('builds query and returns results', async () => {
      const qb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([{ id: 1 }]),
      };
      mockNotesRepository.createQueryBuilder.mockReturnValue(qb);

      const res = await service.findAll({ isArchived: false } as any);

      expect(qb.leftJoinAndSelect).toHaveBeenCalled();
      expect(qb.andWhere).toHaveBeenCalledWith('note.isArchived = :isArchived', { isArchived: false });
      expect(res).toHaveLength(1);
    });
  });

  describe('update', () => {
    it('throws NotFoundException if note does not exist', async () => {
      mockNotesRepository.preload.mockResolvedValue(null);
      await expect(service.update(99, { title: 'x' } as any)).rejects.toThrow(NotFoundException);
    });

    it('updates a note and returns it with relations', async () => {
      mockNotesRepository.preload.mockResolvedValue({ id: 1, title: 'x' });
      mockNotesRepository.save.mockResolvedValue(undefined);
      mockNotesRepository.findOne.mockResolvedValue({ id: 1, title: 'x', categories: [] });

      const res = await service.update(1, { title: 'x' } as any);

      expect(mockNotesRepository.save).toHaveBeenCalled();
      expect(res.id).toBe(1);
    });
  });

  describe('remove', () => {
    it('throws NotFoundException if delete affects 0 rows', async () => {
      mockNotesRepository.delete.mockResolvedValue({ affected: 0 });
      await expect(service.remove(123)).rejects.toThrow(NotFoundException);
    });
  });
});
