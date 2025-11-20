import { db, nextId } from '../data/database.js';
import { createBookModel } from '../models/bookModel.js';
import { ApiError, handleError } from '../utils/errorResponse.js';
import { requireFields } from '../utils/validators.js';

export async function createBook(req, res) {
  try {
    const errorMsg = requireFields(req.body, [
      'title',
      'author',
      'genre',
      'publisher',
      'publishDate'
    ]);
    if (errorMsg) throw new ApiError(400, errorMsg);

    const book = createBookModel(req.body);
    book.id = nextId('book');

    db.books.push(book);

    res.status(201).json(book);
  } catch (error) {
    handleError(res, error);
  }
}

export async function getBookById(req, res) {
  try {
    const { id } = req.params;
    const includeInactive = req.query.includeInactive === 'true';

    const book = db.books.find(b =>
      includeInactive ? b.id === id : b.id === id && b.isActive
    );
    if (!book) throw new ApiError(404, 'Libro no encontrado');

    res.json(book);
  } catch (error) {
    handleError(res, error);
  }
}

export async function listBooks(req, res) {
  try {
    const {
      genre,
      publishDate,
      publisher,
      author,
      title,
      available,
      page = 1,
      pageSize = 10,
      includeInactive
    } = req.query;

    let books = db.books.slice();

    if (includeInactive !== 'true') {
      books = books.filter(b => b.isActive);
    }

    if (genre) books = books.filter(b => b.genre === genre);
    if (publisher) books = books.filter(b => b.publisher === publisher);
    if (author) books = books.filter(b => b.author === author);
    if (title) books = books.filter(b => b.title.includes(title));
    if (publishDate) {
      const d = new Date(publishDate);
      books = books.filter(b => b.publishDate && b.publishDate.toISOString().startsWith(d.toISOString().slice(0, 10)));
    }
    if (available === 'true') books = books.filter(b => b.available);
    if (available === 'false') books = books.filter(b => !b.available);

    const p = Number(page) || 1;
    const size = Number(pageSize) || 10;

    const totalItems = books.length;
    const totalPages = Math.ceil(totalItems / size) || 1;

    const start = (p - 1) * size;
    const end = start + size;

    const pageItems = books.slice(start, end);

    res.json({
      data: pageItems.map(b => ({ id: b.id, title: b.title })), // solo nombre
      pagination: {
        page: p,
        pageSize: size,
        totalPages,
        totalItems
      }
    });
  } catch (error) {
    handleError(res, error);
  }
}

export async function updateBook(req, res) {
  try {
    const { id } = req.params;
    const book = db.books.find(b => b.id === id && b.isActive);
    if (!book) throw new ApiError(404, 'Libro no encontrado');

    const { title, author, genre, publisher, publishDate, available } = req.body;

    if (title) book.title = title;
    if (author) book.author = author;
    if (genre) book.genre = genre;
    if (publisher) book.publisher = publisher;
    if (publishDate) book.publishDate = new Date(publishDate);
    if (available !== undefined) book.available = !!available;

    book.updatedAt = new Date();

    res.json(book);
  } catch (error) {
    handleError(res, error);
  }
}

export async function deactivateBook(req, res) {
  try {
    const { id } = req.params;
    const book = db.books.find(b => b.id === id);
    if (!book) throw new ApiError(404, 'Libro no encontrado');

    book.isActive = false;
    book.updatedAt = new Date();

    res.json({ message: 'Libro inhabilitado correctamente' });
  } catch (error) {
    handleError(res, error);
  }
}
