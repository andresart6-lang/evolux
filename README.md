# Evolux

Dashboard personal de finanzas y productividad con Supabase, React 19 y Vite.

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19 + Vite 7 (JSX) |
| Estilos | TailwindCSS 3 + CSS custom properties |
| Backend | Supabase (Postgres + Auth + RLS) |
| Estado | React Context |
| Routing | react-router-dom v6 |
| Formularios | react-hook-form + Zod |
| Animaciones | Framer Motion |
| Gráficos | Recharts |
| Notificaciones | Sonner |

## Setup

```bash
npm install
cp .env.example .env   # editar credenciales de Supabase
npm run dev             # http://localhost:5173
```

### Variables de entorno (`.env`)

| Variable | Descripción |
|----------|-------------|
| `VITE_SUPABASE_URL` | URL del proyecto Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Clave pública (anon key) de Supabase |
| `VITE_APPS_SCRIPT_URL` | URL de Google Apps Script (legacy) |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID |

### Base de datos

Ejecutar `sql/supabase_schema.sql` en el editor SQL de Supabase para crear tablas, índices, políticas RLS y triggers.

## Funcionalidades

### Dashboard (Home)
- **Gastos Anuales** — pagos una vez al año (impuestos, seguros, suscripciones)
- **Ingresos Fijos** — ingresos mensuales recurrentes (salario, freelance)
- **Gastos Fijos Mensuales** — gastos fijos cada mes (arriendo, internet)
- **Gastos Variables Mensuales** — gastos que varían (transporte, mercado)
- Stat cards con totales y tendencias vs mes anterior
- Navegación por mes/año, modo edición con toggle de lápiz
- Status bulb: `0` pendiente (gris), `1` pagado (verde), `2` error (rojo)
- Totales solo suman items con status `1`

### Billetera (Finance)
- Gestión de cuentas (Principal, Nequi, DaviPlata, etc.)
- CRUD de cuentas con montos
- Stat cards: Ingresos Mes, Gastos Fijos, Gastos Variables, Cuentas Actuales

### Metas (Goals)
- Crear metas de ahorro con nombre, monto objetivo y monto inicial
- Agregar/restar dinero con historial de transacciones
- Barra de progreso visual con color personalizable

### Hábitos (Fitness)
- Tracking mensual de hábitos con grid de 30 días
- Frecuencia configurable (diario/semanal/mensual)
- Stats: Mejor Racha, Hábito Top, Menor Racha
- Gráfico de líneas de progreso mensual

### Tareas (Tasks)
- Organización por espacios y columnas tipo Kanban
- Columnas default: Por Hacer, En Progreso, Terminado
- Checklist de subtareas por tarea
- Fecha límite y categorización

### Análisis (Analytics)
- Ingresos vs Gastos (últimos 6 meses) — gráfico de barras
- Distribución de Gastos (fijos vs variables) — gráfico de pie
- Tendencia de Ahorro — gráfico de líneas
- Productividad por espacio (% tareas completadas)

### Perfil (Profile)
- Nombre, email y plan
- Selector de color de acento
- Toggle dark/light mode
- Configuración general y notificaciones

## Arquitectura

```
src/
├── features/           # Features autónomas
│   ├── finance/        #   components, context, hooks, services, utils
│   ├── tasks/          #   components, context, hooks, services
│   ├── goals/          #   components, hooks, services
│   ├── fitness/        #   components, hooks, services
│   ├── auth/           #   components, context, hooks, services
│   ├── analytics/      #   components, hooks
│   ├── profile/        #   components, hooks
│   └── dashboard/      #   components, hooks
├── shared/             # Código compartido entre features
│   ├── components/     #   StatCard, DatePicker, ColorPicker, etc.
│   ├── services/       #   supabase.js (cliente), api.js (Google Apps Script)
│   └── lib/            #   constants.js, validation.js
├── context/            # Contextos app-wide (Theme, User, Toast)
├── layout/             # MainLayout + Sidebar
├── hooks/              # useAuth (re-export)
├── App.jsx
├── main.jsx
└── index.css
```

## Comandos

```bash
npm run dev       # servidor de desarrollo
npm run build     # build de producción → dist/
npm run lint      # ESLint
npm run preview   # previsualizar build
```

## Auth

- Email/password + Google OAuth vía Supabase Auth
- Perfil auto-creado al registrarse (trigger SQL + fallback en `AuthContext`)
- Timeout de 10s en inicialización de auth
- RLS en todas las tablas: `auth.uid() = user_id`
