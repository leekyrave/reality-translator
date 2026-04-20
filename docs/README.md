# Skyfi.stack — KDI 2026 Hackathon

**Team:** skyfi.stack

---

## What we built

Two AI-powered tools for real people dealing with complex language:

**Tłumacz Rzeczywistości** — paste any dense document (legal, medical, bureaucratic) and get an instant plain-language
version adapted to your chosen audience: a child, a senior, or a non-specialist. The app shows the original and adapted
text side by side, and collects feedback on whether the simplified version was actually understandable.

particularry
**Kielecki Ekspres** — a chat assistant that answers questions strictly from uploaded PDF documents (city regulations,
grant tables, council resolutions). Every answer includes a direct quote and page/paragraph reference. No
hallucinations, no guessing.

---

## Tech stack

- **Backend:** NestJS (TypeScript) + OpenAI API
- **Frontend:** React
- **Auth:** JWT — secure password hashing, session persistence
- **AI safety:** Jailbreak protection, prompt injection prevention

---

## API

| Method             | Endpoint                         | Description                              |
|--------------------|----------------------------------|------------------------------------------|
| `POST`             | `/api/auth/register`             | Register new user                        |
| `POST`             | `/api/auth/login`                | Login, receive JWT                       |
| `POST`             | `/api/auth/logout`               | End session                              |
| `GET`              | `/api/auth/me`                   | Current user info                        |
| `GET/POST`         | `/api/template`                  | List / create prompt templates           |
| `GET`              | `/api/template/default`          | Get default template                     |
| `GET/PATCH/DELETE` | `/api/template/:id`              | Read / update / delete template          |
| `GET/POST`         | `/api/workspace`                 | List / create workspaces                 |
| `GET/PATCH/DELETE` | `/api/workspace/:id`             | Read / update / delete workspace         |
| `POST`             | `/api/chat/message`              | Send message (multipart, supports files) |
| `GET`              | `/api/chat/stream/:workspaceId`  | Stream AI response tokens (SSE)          |
| `GET`              | `/api/chat/history/:workspaceId` | Retrieve chat history                    |

### Template system

Templates inject a configurable system prompt into every AI request — controlling tone, audience profile, and answer
style without touching application code.

---

## Security

- Passwords hashed at rest
- JWT-based session management
- Jailbreak / prompt injection protection on all AI endpoints
- Throttler / rate limiting




# Frontend structure

## Tech stack

| Warstwa | Technologia |
|---|---|
| Framework UI | React 19 + TypeScript 6 |
| Routing | React Router v7 |
| Style | Tailwind CSS v4 + własne pliki CSS |
| HTTP client | Fetch API (własny wrapper `apiClient`) |
| Streaming | Server-Sent Events (SSE) |
| Bundler | Vite 8 |
| Linter | ESLint 9 + typescript-eslint |
| Konteneryzacja | Docker + Nginx |