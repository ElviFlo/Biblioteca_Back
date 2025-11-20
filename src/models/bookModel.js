export function createBookModel({
  title,
  author,
  genre,
  publisher,
  publishDate,
  available = true
}) {
  return {
    id: null,
    title,
    author,
    genre,
    publisher,
    publishDate: publishDate ? new Date(publishDate) : null,
    available: !!available,      
    isActive: true,            
    createdAt: new Date(),
    updatedAt: new Date()
  };
}
