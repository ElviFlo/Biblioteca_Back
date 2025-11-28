# Biblioteca Backend

API sencilla para gestionar usuarios, libros y reservas de una biblioteca.

## 📦 Requisitos

- Node.js 18+
- npm

## Instalación y arranque

```bash
# Clonar el repo
git clone https://github.com/ElviFlo/Biblioteca_Back.git
cd Biblioteca_Back

# Instalar dependencias
npm install
````

### Variables de entorno

Copia el ejemplo y edita:

```bash
cp .env.example .env
```

En `.env` asegúrate de tener algo así:

```env
PORT=3000
JWT_SECRET=un_secreto_largo_y_seguro
```

---

## Tests

Para ejecutar los tests (Jest):

```bash
npm test
```

---

### Levantar el servidor

```bash
npm run start
# o en desarrollo (si usas nodemon)
npm run dev
```

Al arrancar por primera vez se crea automáticamente un usuario admin:

* **email:** `admin@biblio.com`
* **password:** `admin123`

En consola verás algo como:

```txt
Usuario admin creado: admin@biblio.com / admin123
Servidor escuchando en puerto 3000
```

---

## Autenticación

La API usa **JWT Bearer Token**.

1. Haz login:

```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@biblio.com",
  "password": "admin123"
}
```

Respuesta (ejemplo):

```json
{
  "token": "eyJh...",
  "user": {
    "id": 1,
    "name": "Admin",
    "email": "admin@biblio.com",
    "permissions": { ... }
  }
}
```

2. En las peticiones protegidas envía:

```http
Authorization: Bearer <TOKEN>
```

---

## Endpoints de usuarios

### Registrar usuario

```http
POST /users
Content-Type: application/json

{
  "name": "Usuario Normal",
  "email": "user@biblio.com",
  "password": "user123",
  "permissions": {
    "canCreateBook": false,
    "canUpdateBook": false,
    "canDeleteBook": false,
    "canUpdateUser": false,
    "canDeleteUser": false,
    "canReadUsers": false
  }
}
```

### Obtener usuario por id (requiere token)

```http
GET /users/:id
Authorization: Bearer <TOKEN>
```

### Actualizar usuario (requiere token)

```http
PUT /users/:id
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "name": "Nuevo Nombre"
}
```

### Desactivar usuario (soft delete, requiere token)

```http
DELETE /users/:id
Authorization: Bearer <TOKEN>
```

---

## Endpoints de libros

### Listar libros (público)

```http
GET /books
```

Puedes añadir filtros por query string (si están implementados), por ejemplo:

```http
GET /books?genre=Programming&available=true
```

### Obtener libro por id (público)

```http
GET /books/:id
```

### Crear libro (requiere token con `canCreateBook: true`)

```http
POST /books
Authorization: Bearer <TOKEN_ADMIN>
Content-Type: application/json

{
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "genre": "Programming",
  "publisher": "Prentice Hall",
  "publishedAt": "2008-08-01",
  "available": true
}
```

### Actualizar libro (requiere `canUpdateBook: true`)

```http
PUT /books/:id
Authorization: Bearer <TOKEN_ADMIN>
Content-Type: application/json

{
  "title": "Clean Code (Edición Revisada)",
  "available": false
}
```

### Desactivar libro (soft delete, requiere `canDeleteBook: true`)

```http
DELETE /books/:id
Authorization: Bearer <TOKEN_ADMIN>
```

---

## Endpoints de reservas

Todas las rutas de reservas requieren token.

### Reservar un libro

```http
POST /reservations/books/:bookId/reserve
Authorization: Bearer <TOKEN_USER>
Content-Type: application/json

{
  "reservationDate": "2025-11-28",
  "returnDate": "2025-12-05"
}
```

### Devolver un libro

```http
POST /reservations/books/:bookId/return
Authorization: Bearer <TOKEN_USER>
Content-Type: application/json

{
  "returnDate": "2025-12-02"
}
```

### Historial de reservas de un usuario

```http
GET /reservations/users/:userId
Authorization: Bearer <TOKEN>
```

### Historial de reservas de un libro

```http
GET /reservations/books/:bookId
Authorization: Bearer <TOKEN>
```