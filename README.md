# Web Service E-Commerce - Arquitectura Multibase de Datos

Este proyecto es una API RESTful desarrollada con **Node.js** y **Express** que implementa una arquitectura multibase de datos combinando tres tipos de motores: relacional (**PostgreSQL**), documental (**MongoDB**) y clave-valor (**Redis**).

El sistema gestiona 6 recursos distribuidos entre los 3 motores y aplica una regla de negocio fundamental: **borrado lógico** en todos los endpoints `DELETE` (marcando `is_deleted: true`), garantizando que los métodos `GET` solo retornen registros activos.

---

## Estructura de Recursos y Motores

| Motor | Tipo | Recurso | Identificador / Clave | Formato / Estructura |
| :--- | :--- | :--- | :--- | :--- |
| **PostgreSQL** | Relacional | `roles` | `id` (SERIAL) | `id, nombre, descripcion, is_deleted` |
| **PostgreSQL** | Relacional | `usuarios` | `id` (SERIAL) | `id, nombre, email, password, rol_id, is_deleted` |
| **MongoDB** | Documental | `productos` | `_id` (ObjectId) | `nombre, precio, especificaciones, is_deleted` |
| **MongoDB** | Documental | `reviews` | `_id` (ObjectId) | `producto_id, usuario_id, calificacion, comentario, is_deleted` |
| **Redis** | Clave-Valor | `cupones` | `coupon:{codigo}` | JSON string: `{ descuento, fecha_expiracion, is_deleted }` |
| **Redis** | Clave-Valor | `carritos` | `cart:{usuario_id}` | JSON string: `{ items: [...], total, is_deleted }` |

---

## Requisitos Previos

Asegúrate de contar con lo siguiente instalado en tu entorno local o en servicios en la nube:

* **Node.js** (versión 18 o superior recomendada)
* **npm**
* **PostgreSQL** (servidor local en el puerto 5432 o instancia en la nube como Supabase/Neon)
* **MongoDB** (servidor local en el puerto 27017 o cluster en MongoDB Atlas)
* **Redis** (servidor local en el puerto 6379 o servicio gestionado como Upstash)

---

## Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone https://github.com/Elit-001/T3-01-Proyecto-Multibase-de-datos.git
cd T3-01-Proyecto-Multibase-de-datos
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Copia el archivo `.env.example` y crea tu archivo `.env`:

```bash
cp .env.example .env
```

Edita el archivo `.env` con las credenciales de tus bases de datos:

```env
# Servidor Express
PORT=3000

# PostgreSQL (Relacional)
PG_HOST=localhost
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=postgres
PG_DATABASE=ecommerce_db

# Redis (Clave-Valor)
REDIS_URL=redis://127.0.0.1:6379

# MongoDB (Documental)
MONGO_URI=mongodb://127.0.0.1:27017/ecommerce_db
```

> **Nota para PostgreSQL:** La aplicación crea automáticamente las tablas `roles` y `usuarios` al arrancar si no existen. Si prefieres crearlas de forma manual, puedes ejecutar el script ubicado en `sql/init.sql`.

---

## Ejecución del Proyecto

### Modo desarrollo (con recarga automática mediante Nodemon):
```bash
npm run dev
```

### Modo producción:
```bash
npm start
```

El servidor quedará disponible por defecto en: `http://localhost:3000`

---

## Endpoints de la API

### Healthcheck
* `GET /api/health` - Comprueba el estado del servicio.

---

### 1. Roles (PostgreSQL)
* `GET /api/roles` - Lista todos los roles activos.
* `GET /api/roles/:id` - Obtiene un rol por ID.
* `POST /api/roles` - Crea un nuevo rol.
  ```json
  {
    "nombre": "Administrador",
    "descripcion": "Acceso total al sistema"
  }
  ```
* `PATCH /api/roles/:id` - Actualiza parcialmente un rol.
* `DELETE /api/roles/:id` - Borrado lógico del rol (`is_deleted = true`).

---

### 2. Usuarios (PostgreSQL)
* `GET /api/usuarios` - Lista usuarios activos con datos de su rol asociado.
* `GET /api/usuarios/:id` - Obtiene un usuario activo por ID.
* `POST /api/usuarios` - Registra un nuevo usuario.
  ```json
  {
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "password": "password123",
    "rol_id": 1
  }
  ```
* `PATCH /api/usuarios/:id` - Actualiza campos de un usuario.
* `DELETE /api/usuarios/:id` - Borrado lógico del usuario (`is_deleted = true`).

---

### 3. Productos (MongoDB)
* `GET /api/productos` - Lista todos los productos activos.
* `GET /api/productos/:id` - Obtiene un producto por su `_id`.
* `POST /api/productos` - Crea un nuevo producto.
  ```json
  {
    "nombre": "Teclado Mecánico RGB",
    "precio": 89.99,
    "especificaciones": "Switches Red, retroiluminación RGB, cable desmontable"
  }
  ```
* `PATCH /api/productos/:id` - Actualiza nombre, precio o especificaciones.
* `DELETE /api/productos/:id` - Borrado lógico del producto (`is_deleted: true`).

---

### 4. Reseñas / Reviews (MongoDB)
* `GET /api/reviews` - Lista todas las reseñas activas (soporta filtros opcionales: `?producto_id=...` y `?usuario_id=...`).
* `GET /api/reviews/:id` - Obtiene una reseña por su `_id`.
* `POST /api/reviews` - Crea una nueva reseña.
  ```json
  {
    "producto_id": "672b1234abcd5678ef012345",
    "usuario_id": "1",
    "calificacion": 5,
    "comentario": "Excelente calidad, muy recomendado."
  }
  ```
* `PATCH /api/reviews/:id` - Actualiza calificación o comentario.
* `DELETE /api/reviews/:id` - Borrado lógico de la reseña (`is_deleted: true`).

---

### 5. Cupones (Redis)
* `GET /api/cupones` - Lista todos los cupones activos almacenados en Redis.
* `GET /api/cupones/:codigo` - Obtiene un cupón por su código.
* `POST /api/cupones` - Registra un cupón.
  ```json
  {
    "codigo": "DESCUENTO10",
    "descuento": 10,
    "fecha_expiracion": "2026-12-31"
  }
  ```
* `PATCH /api/cupones/:codigo` - Modifica descuento o fecha de expiración.
* `DELETE /api/cupones/:codigo` - Borrado lógico (actualiza el JSON con `is_deleted: true` sin eliminar la clave con `DEL`).

---

### 6. Carritos de Compra (Redis)
* `GET /api/carritos` - Lista todos los carritos activos.
* `GET /api/carritos/:usuario_id` - Obtiene el carrito activo asignado a un usuario.
* `POST /api/carritos` - Crea o inicializa el carrito de un usuario.
  ```json
  {
    "usuario_id": "1",
    "items": [
      {
        "producto_id": "672b1234abcd5678ef012345",
        "cantidad": 2,
        "precio_unitario": 89.99
      }
    ],
    "total": 179.98
  }
  ```
* `PATCH /api/carritos/:usuario_id` - Actualiza items o total del carrito.
* `DELETE /api/carritos/:usuario_id` - Borrado lógico (actualiza el JSON con `is_deleted: true` sin eliminar la clave con `DEL`).

---

## Verificación de Regla de Borrado Lógico

Para comprobar que el borrado lógico funciona en cualquiera de los 3 motores:
1. Realiza una petición `DELETE` a cualquier recurso (por ejemplo, `DELETE /api/productos/:id` o `DELETE /api/carritos/:usuario_id`).
2. Verifica que la respuesta devuelva un estado `200` confirmando el borrado lógico con `is_deleted: true`.
3. Vuelve a consultar el recurso con un `GET` general o individual; el recurso ya no aparecerá en el listado ni podrá ser consultado por su ID/clave (retornando `404`).
4. Revisa directamente en la base de datos correspondiente (PostgreSQL, MongoDB o Redis); el registro o clave sigue existiendo físicamente con la bandera `is_deleted = true`.
