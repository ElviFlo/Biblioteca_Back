export function createReservationModel({ userId, bookId }) {
  const now = new Date();
  return {
    id: null,
    userId,
    bookId,
    reservedAt: now,
    returnedAt: null
  };
}
