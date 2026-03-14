import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CategoriesService } from './category.service';
import { Category } from '../entities/category.entity';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let repository: Repository<Category>;

  const mockCategoryRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
          useValue: mockCategoryRepository,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    repository = module.get<Repository<Category>>(getRepositoryToken(Category));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should successfully create and return a category', async () => {
      const categoryName = 'Work';
      const savedCategory = { id: 1, name: categoryName };

      mockCategoryRepository.create.mockReturnValue(savedCategory);
      mockCategoryRepository.save.mockResolvedValue(savedCategory);

      const result = await service.create(categoryName);

      expect(mockCategoryRepository.create).toHaveBeenCalledWith({ name: categoryName });
      expect(mockCategoryRepository.save).toHaveBeenCalledWith(savedCategory);
      expect(result).toEqual(savedCategory);
    });
  });

  describe('findAll', () => {
    it('should return an array of categories', async () => {
      const categories = [
        { id: 1, name: 'Work' },
        { id: 2, name: 'Personal' },
      ];
      mockCategoryRepository.find.mockResolvedValue(categories);

      const result = await service.findAll();

      expect(result).toEqual(categories);
      expect(mockCategoryRepository.find).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a category if it exists', async () => {
      mockCategoryRepository.delete.mockResolvedValue({ affected: 1 });

      await expect(service.remove(1)).resolves.toBeUndefined();
      expect(mockCategoryRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if category does not exist', async () => {
      mockCategoryRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});