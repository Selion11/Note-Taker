import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Note } from '../entities/note.entity';
import { Category } from '../../categories/entities/category.entity';
import { CreateNoteDto } from '../dto/createNote.dto';
import { GetNotesFilterDto } from '../dto/getNoteFilter.dto';
import { UpdateNoteDto } from '../dto/updateNote.dto';

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note)
    private readonly notesRepository: Repository<Note>,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  private async resolveCategories(categoryIds?: number[]): Promise<Category[] | undefined> {
    if (!categoryIds) return undefined;
    if (categoryIds.length === 0) return [];

    const uniqueIds = Array.from(new Set(categoryIds));
    const categories = await this.categoriesRepository.find({
      where: { id: In(uniqueIds) },
    });

    if (categories.length !== uniqueIds.length) {
      const foundIds = new Set(categories.map((c) => c.id));
      const missing = uniqueIds.filter((id) => !foundIds.has(id));
      throw new BadRequestException(`Unknown categoryIds: ${missing.join(', ')}`);
    }

    return categories;
  }

  async create(createNoteDto: CreateNoteDto): Promise<Note> {
    const { categoryIds, ...noteData } = createNoteDto;

    const note = this.notesRepository.create(noteData);
    const categories = await this.resolveCategories(categoryIds);
    if (categories) note.categories = categories;

    return this.notesRepository.save(note);
  }

  async findAll(filterDto: GetNotesFilterDto): Promise<Note[]> {
    const { isArchived, category } = filterDto;

    const query = this.notesRepository
      .createQueryBuilder('note')
      .leftJoinAndSelect('note.categories', 'category');

    if (isArchived !== undefined) {
      query.andWhere('note.isArchived = :isArchived', { isArchived });
    }

    if (category) {
      query.andWhere('category.name = :categoryName', { categoryName: category });
    }

    return query.getMany();
  }

  async update(id: number, updateNoteDto: UpdateNoteDto): Promise<Note> {
    const { categoryIds, ...noteData } = updateNoteDto;

    const note = await this.notesRepository.preload({
      id,
      ...noteData,
    });

    if (!note) {
      throw new NotFoundException(`Note with ID ${id} not found`);
    }

    if (categoryIds !== undefined) {
      const categories = await this.resolveCategories(categoryIds);
      note.categories = categories ?? [];
    }

    await this.notesRepository.save(note);

    const updated = await this.notesRepository.findOne({
      where: { id },
      relations: ['categories'],
    });

    // Defensive: should exist after save, but keeps return type honest.
    if (!updated) throw new NotFoundException(`Note with ID ${id} not found`);
    return updated;
  }

  async remove(id: number): Promise<void> {
    const result = await this.notesRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Note with ID ${id} not found`);
    }
  }
}
