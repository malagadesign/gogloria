# Configurar Supabase para QR Studio

Guía paso a paso para conectar el proyecto a PostgreSQL en Supabase.

## 1. Crear proyecto en Supabase

1. Entrá a [supabase.com/dashboard](https://supabase.com/dashboard)
2. **New project**
3. Nombre sugerido: `qr-studio` (o `gloria-go`)
4. Elegí región cercana (ej. `South America (São Paulo)`)
5. Definí una **database password** fuerte y guardala (la vas a necesitar)

Esperá a que el proyecto termine de provisionarse (~1–2 min).

## 2. Obtener la connection string

1. En el proyecto: **Project Settings** (engranaje) → **Database**
2. En **Connection string**, elegí **URI**
3. Copiá la URL. Se ve así:

```text
postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
```

4. Reemplazá `[YOUR-PASSWORD]` por la contraseña del paso 1

> Si la contraseña tiene caracteres especiales (`@`, `#`, `%`, etc.), codificala en URL encoding. Ejemplo: `@` → `%40`

### Tipos de conexión en Supabase

| Modo | Puerto | Uso |
|---|---|---|
| **Direct** | 5432 | Desarrollo local, migraciones Prisma |
| **Transaction pooler** | 6543 | Vercel / serverless (con `?pgbouncer=true`) |
| **Session pooler** | 5432 | Alternativa en algunos entornos |

Para **desarrollo local**, usá **Direct connection** en ambas variables.

## 3. Crear `.env.local`

En la raíz del repo:

```bash
cp .env.example .env.local
```

Editá `.env.local` con tus valores reales:

```env
DATABASE_URL="postgresql://postgres.xxxxx:TU_PASSWORD@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"
DIRECT_URL="postgresql://postgres.xxxxx:TU_PASSWORD@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"

AUTH_SECRET="nrQI1QvXNR4oY7JJiZdTyZSFYEiPodQUbYVyzwq+PMg="
AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_QR_BASE_URL="http://localhost:3000"
```

Generá tu propio `AUTH_SECRET` (no uses el de ejemplo en producción):

```bash
openssl rand -base64 32
```

> Next.js carga `.env.local` automáticamente. No commitees este archivo.

## 4. Aplicar schema y seed

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

Si preferís un push rápido sin historial de migraciones:

```bash
npm run db:push
npm run db:seed
```

### Verificar en Supabase

1. **Table Editor** → deberías ver: `User`, `Client`, `Campaign`, `QrCode`, `QrScan`
2. La tabla `Client` debería tener Mozoo, Achával Cornejo y Agencia Gloria

## 5. Probar la app

```bash
npm run dev
```

Login: `admin@agenciagloria.com` / `demo1234`

## 6. Variables para Vercel (cuando deployes)

En Vercel → Project → Settings → Environment Variables:

| Variable | Valor |
|---|---|
| `DATABASE_URL` | Transaction pooler `:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | Direct connection `:5432/postgres` |
| `AUTH_SECRET` | Secreto único de producción |
| `AUTH_URL` | `https://tu-dominio.vercel.app` |
| `NEXT_PUBLIC_QR_BASE_URL` | `https://go.agenciagloria.com` |

Build command recomendado (post-deploy o en CI):

```bash
npx prisma migrate deploy
```

## Troubleshooting

### `Can't reach database server` (P1001)

El host directo `db.xxxx.supabase.co` a veces **solo tiene IPv6** y falla en macOS/redes locales.

**Solución:** en Supabase → Database → Connection string:
1. Cambiá el método de **Direct** a **Session pooler**
2. Copiá la URI (usuario `postgres.bwcemwxahorviraljbnl`, host `aws-0-REGION.pooler.supabase.com`)
3. Pegala en `DATABASE_URL` y `DIRECT_URL` de `.env.local` (misma URL en dev)

Formato esperado:

```env
DATABASE_URL="postgresql://postgres.bwcemwxahorviraljbnl:PASSWORD@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"
DIRECT_URL="postgresql://postgres.bwcemwxahorviraljbnl:PASSWORD@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"
```

### `Can't reach database server` (proyecto pausado)

### `password authentication failed`
- Revisá la contraseña y el URL encoding de caracteres especiales

### Prisma migrate pide `directUrl`
- Asegurate de tener `DIRECT_URL` en `.env.local` (ya configurado en `schema.prisma`)

### `Environment variable not found: DIRECT_URL`
- En dev local, podés usar la misma URL en `DATABASE_URL` y `DIRECT_URL`

## Qué NO usamos de Supabase (por ahora)

- **Supabase Auth** → usamos NextAuth con usuarios en tabla `User`
- **Supabase Storage** → logos por URL externa en el MVP
- **RLS (Row Level Security)** → permisos en la app Next.js por rol

Podemos migrar a Supabase Auth más adelante si conviene.
