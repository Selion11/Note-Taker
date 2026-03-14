import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request = require('supertest');
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';

describe('Notes System (E2E)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Global Configuration
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));

    await app.init();

    // Get DataSource to clean the database before tests
    dataSource = moduleFixture.get<DataSource>(DataSource);
    await dataSource.query('TRUNCATE TABLE "notes", "categories" RESTART IDENTITY CASCADE');
  });

  describe('POST /api/notes', () => {
    it('should fail with 400 if title is empty', () => {
      return request(app.getHttpServer())
        .post('/api/notes')
        .send({ 
          title: '', 
          content: 'This is a valid content' 
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('Title cannot be empty');
        });
    });

    it('should fail with 400 if content exceeds 4000 characters', () => {
      const extremelyLongContent = 'a'.repeat(4001);
      return request(app.getHttpServer())
        .post('/api/notes')
        .send({ 
          title: 'Valid Title', 
          content: extremelyLongContent 
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('Content exceeds 4000 chars');
        });
    });

    it('should successfully create a note and return 201', () => {
      return request(app.getHttpServer())
        .post('/api/notes')
        .send({ 
          title: 'E2E Test Note', 
          content: 'Testing the full flow' 
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.title).toBe('E2E Test Note');
        });
    });
  });

  describe('GET /api/notes', () => {
    it('should return 200 and an array of notes', () => {
      return request(app.getHttpServer())
        .get('/api/notes')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should filter by archived status correctly', () => {
      return request(app.getHttpServer())
        .get('/api/notes?isArchived=false')
        .expect(200)
        .expect((res) => {
          res.body.forEach((note: any) => {
            expect(note.isArchived).toBe(false);
          });
        });
    });
  });

  describe('PATCH /api/notes/:id', () => {
    it('should update a note and return 200', async () => {
      const notes = await request(app.getHttpServer()).get('/api/notes');
      const noteId = notes.body[0].id;

      return request(app.getHttpServer())
        .patch(`/api/notes/${noteId}`)
        .send({ title: 'Updated via E2E' })
        .expect(200)
        .expect((res) => {
          expect(res.body.title).toBe('Updated via E2E');
        });
    });

    it('should return 404 for a non-existing note ID', () => {
      return request(app.getHttpServer())
        .patch('/api/notes/99999')
        .send({ title: 'Should Fail' })
        .expect(404);
    });
  });

  describe('DELETE /api/notes/:id', () => {
    it('should return 404 when deleting a non-existing note', () => {
      return request(app.getHttpServer())
        .delete('/api/notes/99999')
        .expect(404);
    });
  });

  describe('Notes & Categories Integration (E2E)', () => {
    let categoryId: number;

    it('should create a category first for testing purposes', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/categories')
        .send({ name: 'Initial Category' })
        .expect(201);
      categoryId = res.body.id;
    });

    it('should create a note WITH an existing category', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/notes')
        .send({
          title: 'Note with Category',
          content: 'Testing initial link',
          categoryIds: [categoryId]
        })
        .expect(201);

      expect(res.body.categories).toBeDefined();
      expect(res.body.categories[0].id).toBe(categoryId);
    });

    it('should create a note THEN add an existing category via PATCH', async () => {
      const noteRes = await request(app.getHttpServer())
        .post('/api/notes')
        .send({ title: 'Temporary Note', content: 'Updating later' });
      const tempNoteId = noteRes.body.id;

      const patchRes = await request(app.getHttpServer())
        .patch(`/api/notes/${tempNoteId}`)
        .send({ categoryIds: [categoryId] })
        .expect(200);

      expect(patchRes.body.categories[0].id).toBe(categoryId);
    });

    it('should handle: create note (no cat) -> create cat -> add cat to note', async () => {
      const noteRes = await request(app.getHttpServer())
        .post('/api/notes')
        .send({ title: 'Empty Note', content: 'No categories yet' });
      const emptyNoteId = noteRes.body.id;

      const catRes = await request(app.getHttpServer())
        .post('/api/categories')
        .send({ name: 'Fresh Category' })
        .expect(201);
      const freshCatId = catRes.body.id;

      const finalRes = await request(app.getHttpServer())
        .patch(`/api/notes/${emptyNoteId}`)
        .send({ categoryIds: [freshCatId] })
        .expect(200);

      expect(finalRes.body.categories.some((c: any) => c.name === 'Fresh Category')).toBe(true);
    });

    it('should archive a note WITH NO CATEGORY', async () => {
      const noteRes = await request(app.getHttpServer())
        .post('/api/notes')
        .send({ title: 'Simple Note', content: 'Content' });
      
      const archiveRes = await request(app.getHttpServer())
        .patch(`/api/notes/${noteRes.body.id}`)
        .send({ isArchived: true })
        .expect(200);

      expect(archiveRes.body.isArchived).toBe(true);
      expect(archiveRes.body.categories).toHaveLength(0);
    });

    it('should archive a note WITH a category', async () => {
      const noteRes = await request(app.getHttpServer())
        .post('/api/notes')
        .send({ title: 'Cat Note', content: 'Content', categoryIds: [categoryId] });
      
      const archiveRes = await request(app.getHttpServer())
        .patch(`/api/notes/${noteRes.body.id}`)
        .send({ isArchived: true })
        .expect(200);

      expect(archiveRes.body.isArchived).toBe(true);
      expect(archiveRes.body.categories[0].id).toBe(categoryId);
    });

    it('should create 5 categories and then create a note that uses all of them', async () => {
      const categoryIds: number[] = [];
      
      for (let i = 1; i <= 5; i++) {
        const res = await request(app.getHttpServer())
          .post('/api/categories')
          .send({ name: `Bulk Cat ${i}` });
        categoryIds.push(res.body.id);
      }

      const finalNoteRes = await request(app.getHttpServer())
        .post('/api/notes')
        .send({
          title: 'Mega Note',
          content: 'Full of tags',
          categoryIds: categoryIds
        })
        .expect(201);

      expect(finalNoteRes.body.categories).toHaveLength(5);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});