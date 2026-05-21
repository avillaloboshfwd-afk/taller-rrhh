# Garnier RH — Asistente Inteligente + Pulso Garnier

Aplicativo demo de Recursos Humanos para **Garnier** que combina:

- Un **asistente conversacional** que responde dudas sobre reglamentos internos usando un LLM real (Groq · Llama 3.3 70B) con contexto RAG inyectado desde los documentos vigentes.
- **Pulso Garnier**, un módulo de bienestar organizacional con micro-pulsos diarios, reportes de clima por equipo y alertas de patrones negativos.

El backend está simulado con **json-server** sobre [db.json](db.json) (no requiere base de datos). El chat sí hace llamadas reales al LLM si configurás una API key.

---

## Stack y dependencias

### Runtime
| Paquete            | Versión   | Para qué sirve                                                       |
|--------------------|-----------|----------------------------------------------------------------------|
| `react`            | 18.3.1    | UI                                                                   |
| `react-dom`        | 18.3.1    | Renderizado web                                                      |
| `react-router-dom` | 7.1.0     | Enrutamiento entre vistas                                            |
| `axios`            | 1.16.1    | Cliente HTTP contra json-server                                      |
| `lucide-react`     | 0.460.0   | Iconografía                                                          |
| `recharts`         | 2.15.0    | Gráficos del dashboard y reportes de clima                           |

### Desarrollo / build
| Paquete                  | Versión     | Para qué sirve                                                                          |
|--------------------------|-------------|-----------------------------------------------------------------------------------------|
| `vite`                   | 6.0.5       | Dev server (HMR) y bundler de producción                                                |
| `@vitejs/plugin-react`   | 4.3.4       | Plugin React para Vite                                                                  |
| `typescript`             | 5.6.2       | Tipos estrictos                                                                         |
| `tailwindcss`            | 3.4.17      | Estilado utility-first con paleta corporativa `brand`                                   |
| `postcss` + `autoprefixer` | 8.4 / 10.4 | Pipeline CSS de Tailwind                                                                |
| `json-server`            | 1.0.0-beta  | Mock REST API (lee/escribe sobre [db.json](db.json))                                    |
| `concurrently`           | 9.2.1       | Levanta Vite + json-server en paralelo con un solo comando                              |
| `@types/react`, `@types/react-dom` | 18.3 | Tipos de React                                                                          |

---

## Requisitos previos

- **Node.js 18 o superior** (recomendado 20 LTS o 22+).
- **npm 9+** (viene con Node).
- (Opcional) Una **cuenta gratuita en Groq** si querés el chat con LLM real — sin tarjeta, lleva 1 minuto: <https://console.groq.com>.

Verificá las versiones:

```bash
node -v
npm -v
```

---

## Instalación

```bash
# 1. Posicionate en la carpeta del proyecto
cd taller-rrhh

# 2. Instalá todas las dependencias (runtime + dev)
npm install
```

Esto descarga los paquetes listados arriba en `node_modules/`. Tarda ~30–60 s la primera vez.

---

## Variables de entorno

Copiá la plantilla a `.env` en la raíz del proyecto:

```bash
# Windows PowerShell
Copy-Item .env.example .env

# macOS / Linux / Git Bash
cp .env.example .env
```

Editá [.env](.env) y completá:

```dotenv
# Obligatoria solo si querés el chat con IA real.
# Sin esta key el chat muestra un error pidiéndote configurarla.
VITE_GROQ_API_KEY=gsk_XXXXXXXXXXXXXXXXXXXXXXXX

# Opcional: por defecto llama-3.3-70b-versatile.
# Alternativas: llama-3.1-8b-instant (más rápido), mixtral-8x7b-32768
# VITE_GROQ_MODEL=llama-3.3-70b-versatile

# URL del backend mock (json-server). Dejala así si corrés todo local.
VITE_API_URL=http://localhost:3001
```

Cómo obtener la API key de Groq:

1. Creá cuenta en <https://console.groq.com>.
2. Andá a **API Keys → Create API Key**.
3. Copiala (empieza con `gsk_…`) y pegala en `.env`.

> ⚠️ Las variables `VITE_*` quedan compiladas en el bundle del frontend. Está OK para una demo local, pero en producción la API key debería vivir detrás de un backend proxy.

---

## Cómo levantarlo

### Modo desarrollo (recomendado)

Un solo comando levanta **Vite + json-server** en paralelo:

```bash
npm run dev
```

- Frontend Vite: <http://localhost:5173> (se abre solo en el navegador).
- API mock json-server: <http://localhost:3001> (endpoints REST sobre `db.json`).

Ctrl+C detiene ambos procesos juntos (`concurrently -k`).

### Levantar cada parte por separado

Si necesitás tener el frontend o la API corriendo de forma aislada:

```bash
npm run client   # solo Vite en :5173
npm run api      # solo json-server en :3001
```

### Producción

```bash
npm run build    # type-check con tsc + bundle de Vite a dist/
npm run preview  # sirve dist/ en :4173 para verificar el build
```

> Nota: `npm run preview` **no** levanta json-server. Si tu build de producción depende de los endpoints mock, corré `npm run api` aparte en otra terminal.

---

## Scripts disponibles

| Script              | Qué hace                                                                 |
|---------------------|--------------------------------------------------------------------------|
| `npm run dev`       | Vite + json-server en paralelo (modo desarrollo con HMR).                |
| `npm run client`    | Solo el dev server de Vite.                                              |
| `npm run api`       | Solo json-server sobre `db.json` en el puerto 3001.                      |
| `npm run build`     | `tsc -b && vite build` → genera `dist/` para producción.                 |
| `npm run preview`   | Sirve el build de producción localmente para QA.                         |

---

## Backend mock (json-server)

[db.json](db.json) expone estas colecciones REST en `http://localhost:3001`:

| Colección         | Endpoint                       | Para qué se usa                                  |
|-------------------|--------------------------------|--------------------------------------------------|
| `emotions`        | `/emotions`                    | Catálogo de emociones del micro-pulso            |
| `factors`         | `/factors`                     | Factores que afectan el estado emocional         |
| `teams`           | `/teams`                       | Equipos / áreas organizacionales                 |
| `entries`         | `/entries`                     | Registros diarios de bienestar                   |
| `climateReports`  | `/climateReports`              | Reportes agregados por equipo                    |
| `alerts`          | `/alerts`                      | Alertas de patrones negativos sostenidos         |
| `wellbeingTips`   | `/wellbeingTips`               | Tips de bienestar mostrados al funcionario       |

Soporta `GET`, `POST`, `PUT`, `PATCH`, `DELETE`. Los cambios persisten en `db.json` mientras `npm run api` esté corriendo.

---

## Estructura del proyecto

```
taller-rrhh/
├── db.json                     # Datos del backend mock (json-server)
├── .env / .env.example         # Variables de entorno (Groq + API URL)
├── index.html                  # Entry HTML de Vite
├── vite.config.ts              # Config de Vite (puerto 5173, abre navegador)
├── tailwind.config.js          # Paleta corporativa y extensiones
├── tsconfig*.json              # Config de TypeScript (referencias app/node)
└── src/
    ├── main.tsx                # Punto de entrada React
    ├── App.tsx                 # Estado global, navegación por tabs, auth/check-in
    ├── index.css               # Tailwind base + animaciones
    ├── components/
    │   ├── layout/Sidebar.tsx
    │   ├── auth/               # UserSelectionScreen, CheckInScreen
    │   ├── chat/               # ChatContainer, MessageBubble, DocumentViewerModal
    │   ├── analytics/          # DashboardView
    │   ├── documents/          # DocumentManager
    │   ├── admin/              # UnansweredQueriesView
    │   └── common/             # Toast
    ├── services/
    │   ├── aiService.ts        # Llamada real a Groq (Llama 3.3 70B) con RAG inyectado
    │   ├── apiClient.ts        # Axios contra json-server
    │   ├── catalogsService.ts  # Emociones, factores, tips
    │   ├── teamsService.ts     # Equipos
    │   ├── entriesService.ts   # Registros del micro-pulso
    │   ├── reportsService.ts   # Reportes de clima
    │   └── alertsService.ts    # Alertas de bienestar
    ├── data/mockData.ts        # Documentos, sesiones de chat, QA pairs, usuarios demo
    └── types/index.ts          # Tipos compartidos
```

---

## Troubleshooting

- **`EADDRINUSE: :5173` o `:3001`** — algún proceso ya está usando el puerto. Cerralo o cambiá el puerto en [vite.config.ts](vite.config.ts) / el script `api` de [package.json](package.json).
- **El chat dice "La IA no está configurada"** — falta `VITE_GROQ_API_KEY` en `.env`. Agregala y reiniciá `npm run dev` (las variables `VITE_*` se leen al arrancar).
- **`Module not found` después de instalar** — borrá `node_modules/` y `package-lock.json` y volvé a correr `npm install`.
- **El navegador no se abre solo** — entrá manualmente a <http://localhost:5173>. La apertura automática está controlada por `server.open: true` en [vite.config.ts](vite.config.ts).
- **json-server no arranca** — verificá que [db.json](db.json) esté presente y tenga JSON válido (`node -e "require('./db.json')"`).

---

## Flujo de uso típico

1. `npm install` (una sola vez).
2. Configurar `.env` con la API key de Groq (opcional pero recomendado).
3. `npm run dev`.
4. Abrir <http://localhost:5173> y elegir un usuario en la **pantalla de selección**.
5. Si entrás como empleado: completar el **check-in emocional**, después al chat.
6. Si entrás como admin: acceso directo al dashboard, documentos, panel HR y módulos de Pulso Garnier.
