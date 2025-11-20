import {
  createBook,
  getBookById,
  listBooks,
  updateBook,
  deactivateBook
} from '../src/controllers/bookController.js';
import { db, nextId } from '../src/data/database.js';
import { createBookModel } from '../src/models/bookModel.js';

function mockRes() {
  const res = {};
  res.statusCode = 200;
  res.body = null;
  res.status = code => {
    res.statusCode = code;
    return res;
  };
  res.json = data => {
    res.body = data;
    return res;
  };
  return res;
}

describe('bookController', () => {
  beforeEach(() => {
    db.books.length = 0;
  });

  test('createBook - creación exitosa', async () => {
    const req = {
      body: {
        title: 'Libro 1',
        author: 'Autor 1',
        genre: 'Ficción',
        publisher: 'Editorial X',
        publishDate: '2024-01-01'
      }
    };
    const res = mockRes();

    await createBook(req, res);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.title).toBe('Libro 1');
    expect(db.books.length).toBe(1);
  });

  test('createBook - falla si faltan campos requeridos', async () => {
    const req = {
      body: {
        author: 'Autor 1',
        genre: 'Ficción',
        publisher: 'Editorial X',
        publishDate: '2024-01-01'
      }
    };
    const res = mockRes();

    await createBook(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('getBookById - devuelve libro existente', async () => {
    const book = createBookModel({
      title: 'Libro 2',
      author: 'Autor 2',
      genre: 'No Ficción',
      publisher: 'Editorial Y',
      publishDate: '2024-02-02'
    });
    book.id = nextId('book');
    db.books.push(book);

    const req = { params: { id: book.id }, query: {} };
    const res = mockRes();

    await getBookById(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(book.id);
  });

  test('getBookById - falla si libro no existe', async () => {
    const req = { params: { id: '999' }, query: {} };
    const res = mockRes();

    await getBookById(req, res);

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  test('listBooks - devuelve solo títulos con paginación', async () => {
    const b1 = createBookModel({
      title: 'Libro A',
      author: 'Autor A',
      genre: 'Ficción',
      publisher: 'Ed A',
      publishDate: '2024-01-01'
    });
    b1.id = nextId('book');

    const b2 = createBookModel({
      title: 'Libro B',
      author: 'Autor B',
      genre: 'Ficción',
      publisher: 'Ed B',
      publishDate: '2024-01-02'
    });
    b2.id = nextId('book');

    const b3 = createBookModel({
      title: 'Libro C',
      author: 'Autor C',
      genre: 'Ficción',
      publisher: 'Ed C',
      publishDate: '2024-01-03'
    });
    b3.id = nextId('book');

    db.books.push(b1, b2, b3);

    const req = {
      query: {
        page: '1',
        pageSize: '2'
      }
    };
    const res = mockRes();

    await listBooks(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data.length).toBe(2);
    expect(res.body.data[0]).toHaveProperty('id');
    expect(res.body.data[0]).toHaveProperty('title');
    expect(res.body.data[0].author).toBeUndefined();
  });

  test('updateBook - actualización exitosa', async () => {
    const book = createBookModel({
      title: 'Viejo título',
      author: 'Autor',
      genre: 'Género',
      publisher: 'Ed',
      publishDate: '2024-01-01'
    });
    book.id = nextId('book');
    db.books.push(book);

    const req = {
      params: { id: book.id },
      body: {
        title: 'Nuevo título'
      }
    };
    const res = mockRes();

    await updateBook(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe('Nuevo título');
  });

  test('updateBook - falla si libro no existe', async () => {
    const req = {
      params: { id: '999' },
      body: { title: 'Algo' }
    };
    const res = mockRes();

    await updateBook(req, res);

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  test('deactivateBook - inhabilita libro correctamente', async () => {
    const book = createBookModel({
      title: 'Libro Activo',
      author: 'Autor',
      genre: 'Género',
      publisher: 'Ed',
      publishDate: '2024-01-01'
    });
    book.id = nextId('book');
    db.books.push(book);

    const req = { params: { id: book.id } };
    const res = mockRes();

    await deactivateBook(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(book.isActive).toBe(false);
  });

  test('deactivateBook - falla si libro no existe', async () => {
    const req = { params: { id: '999' } };
    const res = mockRes();

    await deactivateBook(req, res);

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});
