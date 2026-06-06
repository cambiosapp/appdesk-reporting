# AppDesk — Portal de Reportes

Portal interno de reportes (Bug/Task/Feature) con integración a Jira.

**Stack**: Next.js 14 + Supabase + Tailwind CSS + Docker

---

## 🚀 Desarrollo local

```bash
# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus valores

# Iniciar dev server
npm run dev
# → http://localhost:3000
```

## 🧪 Tests

```bash
npm test         # Una vez
npm run test:watch   # Watch mode
npm run test:coverage  # Con cobertura
```

## 🐳 Docker

### Build manual

```bash
docker build -t appdesk .
docker run -p 3000:3000 --env-file .env.local appdesk
```

## 📦 GitHub Container Registry (ghcr.io)

Las imágenes se publican automáticamente vía GitHub Actions:

| Evento | Tag |
|--------|-----|
| Push a `main` | `latest`, `sha-<commit>` |
| Tag `vX.Y.Z` | `X.Y.Z`, `X.Y`, `latest` |
| PR a `main` | `pr-<number>` (no se pushea) |

**Imagen**: `ghcr.io/cambiosapp/appdesk-reporting`

### Pull manual

```bash
echo $GITHUB_TOKEN | docker login ghcr.io -u <user> --password-stdin
docker pull ghcr.io/cambiosapp/appdesk-reporting:latest
```

## 🚢 Deploy en Swarm (Portainer)

```bash
# Stack name: appdesk
# Stack file: docker-stack.yml
# Env vars requeridas en Portainer:
#   - TAG (default: latest)
#   - NEXT_PUBLIC_SUPABASE_URL
#   - NEXT_PUBLIC_SUPABASE_ANON_KEY
#   - NEXT_PUBLIC_JIRA_URL
#   - SUPABASE_SERVICE_ROLE_KEY
#   - JIRA_URL
#   - JIRA_EMAIL
#   - JIRA_PAT
#   - JIRA_PROJECT_KEY
```

Ver `docker-stack.yml` para la configuración completa del servicio Swarm.

## 🗄️ Supabase

El schema SQL está en `scripts/supabase-setup.sql`. Incluye:
- Tablas: `profiles`, `modules`, `reports`
- RLS policies
- Storage bucket para adjuntos
- Trigger auto-create profile al registrarse
- Seed data con módulos por defecto

## 📁 Estructura

```
src/
├── app/
│   ├── login/          → Login con Supabase Auth
│   ├── dashboard/      → Tabla + filtros + paginación
│   ├── reportes/       → Formulario de reportes
│   ├── admin/          → Admin panel (usuarios, módulos, reportes)
│   └── api/            → API Routes (Jira integration)
├── components/
│   ├── Sidebar.tsx
│   ├── Header.tsx
│   └── AuthGuard.tsx
├── lib/
│   ├── supabase.ts
│   └── jira.ts
└── types.ts
```
