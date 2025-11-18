export const db = {
  users: [],
  books: [],
  reservations: []
};

let counters = {
  user: 1,
  book: 1,
  reservation: 1
};

export function nextId(type) {
  const id = counters[type]++;
  return String(id);
}