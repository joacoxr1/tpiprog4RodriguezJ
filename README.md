# Food Store

Trabajo Práctico Integrador **Programación 4 UTN**

- **Backend:** FastAPI + SQLModel + PostgreSQL (JWT en cookie HttpOnly, Unit of Work).
- **Frontend:** React + TypeScript + Vite + Tailwind CSS (TanStack Query, Form y Table, Zustand, Axios).

## Enlaces

- **Repositorio:** https://github.com/joacoxr1/tpiprog4RodriguezJ
- **Video de demostración:** https://drive.google.com/file/d/14F7ME9y1Y0XW_HeSKUEO4xQjjF7Bw4qj/view?usp=sharing

## Requisitos

- Python 3.11 a 3.13 
- PostgreSQL 15 o superior
- Node.js 20.19 o superior
- pnpm 9 o superior

## Estructura

```
backend/    API REST (FastAPI)
frontend/   Aplicación web (React)
```

## Backend

Desde la carpeta `backend/`:

1. Crear y activar un entorno virtual:

   ```bash
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # Linux / macOS
   source venv/bin/activate
   ```

2. Instalar las dependencias:

   ```bash
   pip install -r requirements.txt
   ```

3. Crear la base de datos en PostgreSQL (por ejemplo `foodstore_db`).

4. Copiar `.env.example` a `.env` y completar los valores:

   ```bash
   # Windows
   copy .env.example .env
   # Linux / macOS
   cp .env.example .env
   ```

5. Cargar los datos iniciales (idempotente):

   ```bash
   python -m app.db.seed
   ```

6. Levantar el servidor:

   ```bash
   uvicorn app.main:app --reload
   ```

### Variables de entorno del backend (`backend/.env`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | Conexión a la base | `postgresql://user:pass@localhost:5432/foodstore_db` (desarrollo: `sqlite:///./foodstore.db`) |
| `SECRET_KEY` | Clave para firmar el JWT (mínimo 32 caracteres)
| `ALGORITHM` | Algoritmo del JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Expiración del token y la cookie | `30` |
| `FRONTEND_ORIGIN` | Origen permitido en CORS | `http://localhost:5173` |

## Frontend

Desde la carpeta `frontend/`:

1. Instalar las dependencias:

   ```bash
   pnpm install
   ```

2. Copiar `.env.example` a `.env`:

   ```bash
   # Windows
   copy .env.example .env
   # Linux / macOS
   cp .env.example .env
   ```

3. Verificar los tipos y compilar:

   ```bash
   pnpm build
   ```

4. Levantar el servidor de desarrollo:

   ```bash
   pnpm dev
   ```

## Usuario administrador (seed)

El seed crea el siguiente usuario, además de 3 categorías y 8 productos con stock de prueba:

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `Admin1234!` | `admin` |

Los clientes se crean desde la pantalla de registro (rol `user`).

## Roles

- **Cliente (`user`):** navega el catálogo, arma el carrito, confirma pedidos y consulta o cancela sus pedidos (solo en estado `PENDIENTE`).
- **Administrador (`admin`):** gestiona categorías, productos, stock, usuarios y pedidos (cambio de estado y cancelación), y ve el resumen del negocio.
