# chatAI

Internal ChatGPT-style assistant for chatting with internal data through the OrgAI layer, scoped per client and product with entitlement checks.

- Design: [docs/architecture.md](docs/architecture.md)
- UI: [frontend/](frontend/README.md) — React + Vite, runs fully on mocked APIs (`cd frontend && npm install && npm run dev`)
- Audience dashboard: [audience-dashboard/](audience-dashboard/README.md) — local Node dashboard for Trade Desk audience segments (`cd audience-dashboard && npm start`)
- Backend: `backend/` (Spring Boot, Java 25) — coming next
