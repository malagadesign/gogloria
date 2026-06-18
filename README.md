# QR Studio

Plataforma interna/cliente de **Agencia Gloria** para generar, administrar y medir **QRs dinámicos**. Cada QR impreso apunta a una URL corta editable (`/r/[slug]`) que redirige al destino real configurado en base de datos.

## Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS + shadcn/ui
- Prisma + PostgreSQL (Supabase/Neon compatible)
- NextAuth v5 (credentials)
- Deploy pensado para Vercel

## Requisitos

- Node.js 20+
- PostgreSQL accesible vía `DATABASE_URL`

## Instalación local

```bash
npm install
cp .env.example .env
```

Completá `.env.local` (copiá desde `.env.example`):

```bash
cp .env.example .env.local
```

```env
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@..."
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@..."
AUTH_SECRET="generar-con-openssl-rand-base64-32"
AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_QR_BASE_URL="http://localhost:3000"
```

Guía completa Supabase: [docs/SUPABASE.md](docs/SUPABASE.md)

Generá `AUTH_SECRET`:

```bash
openssl rand -base64 32
```

### Base de datos

Opción A — migraciones (recomendado):

```bash
npm run db:migrate
npm run db:seed
```

Opción B — push rápido para desarrollo:

```bash
npm run db:push
npm run db:seed
```

### Desarrollo

```bash
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000)

## Usuarios demo (seed)

| Email | Contraseña | Rol |
|---|---|---|
| admin@agenciagloria.com | demo1234 | ADMIN |
| mozoo@demo.com | demo1234 | CLIENT (Mozoo) |
| achaval@demo.com | demo1234 | CLIENT (Achával Cornejo) |

## Variables de entorno

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Conexión PostgreSQL (pooler en Vercel) |
| `DIRECT_URL` | Conexión directa para migraciones Prisma |
| `AUTH_SECRET` | Secreto de NextAuth |
| `AUTH_URL` | URL base de la app (local o producción) |
| `NEXT_PUBLIC_QR_BASE_URL` | Dominio público de los QRs (ej. `https://go.agenciagloria.com`) |
| `IPINFO_TOKEN` | Token de [ipinfo.io](https://ipinfo.io) para geo en local (opcional) |

## Deploy en Vercel

1. Importá el repositorio en Vercel.
2. Configurá las variables de entorno anteriores.
3. Usá una base PostgreSQL (Supabase, Neon, Vercel Postgres).
4. En el build o post-deploy, ejecutá migraciones:

```bash
npx prisma migrate deploy
npx prisma db seed
```

5. Asigná el dominio corto (`go.agenciagloria.com`) al proyecto y seteá `NEXT_PUBLIC_QR_BASE_URL`.

## Estado del MVP

### Etapa 1 (implementada)

- Modelo Prisma: `User`, `Client`, `Campaign`, `QrCode`, `QrScan`
- Auth con roles `ADMIN` / `CLIENT`
- Seed con clientes Mozoo, Achával Cornejo y Agencia Gloria
- Dashboard con resumen, clientes, QRs
- CRUD de clientes (admin) y QRs
- Permisos por cliente

### Etapa 2 (implementada)

- Ruta pública `/r/[slug]` con Route Handler
- Registro de escaneos en `QrScan`
- Página `/qr-unavailable`
- Analytics básicos en dashboard y detalle de QR

### Etapa 3 (implementada)

- Vista previa del QR en detalle (apunta a URL corta)
- Descarga PNG y SVG
- Gráfico de escaneos por día (últimos 30 días) con Recharts
- Color del QR según `primaryColor` del registro

## Estructura principal

```text
prisma/
  schema.prisma
  seed.ts
src/
  app/
    login/
    dashboard/
    api/auth/[...nextauth]/
  components/
  lib/
    actions/
    permissions.ts
    validators.ts
  auth.ts
```

## Seguridad

- No se guarda IP cruda (modelo preparado para `ipHash`)
- URLs de destino validadas (`http`/`https` solamente)
- Redirect futuro solo desde destinos persistidos en DB
- Usuarios `CLIENT` limitados a su `clientId`
