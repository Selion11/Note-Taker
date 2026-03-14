import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Category } from '../entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(name: string): Promise<Category> {
    const category = this.categoryRepository.create({ name });

    try {
      return await this.categoryRepository.save(category);
    } catch (err) {
      // Postgres unique violation = 23505
      if (err instanceof QueryFailedError && (err as any).driverError?.code === '23505') {
        throw new ConflictException(`Category '${name}' already exists`);
      }
      throw err;
    }
  }

  findAll(): Promise<Category[]> {
    return this.categoryRepository.find();
  }

  async remove(id: number): Promise<void> {
    const result = await this.categoryRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
  }
}
