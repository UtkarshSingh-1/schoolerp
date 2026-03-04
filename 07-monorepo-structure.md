# Monorepo / Project Structure

```text
school-erp/
│
├── docs/                      # Documentation and schemas
├── school-erp-backend/        # Backend implementation
│   ├── src/
│   │   ├── config/            # DB, App configs
│   │   ├── controllers/       # Route handlers
│   │   ├── services/          # Business logic
│   │   ├── models/            # DB models (if using ORM)
│   │   ├── routes/            # Express routes
│   │   ├── middlewares/       # Auth, error handling
│   │   ├── utils/             # Helpers (ID gen, Logger)
│   │   └── app.js             # Express app setup
│   ├── tests/                 # Unit & Integration tests
│   ├── .env                   # Environment variables
│   ├── package.json
│   └── server.js              # Entry point
│
└── school-erp-frontend/       # Frontend implementation
    ├── src/
    │   ├── components/        # Reusable UI components
    │   ├── pages/             # Route pages
    │   ├── services/          # API calling logic
    │   ├── hooks/             # Custom React hooks
    │   ├── context/           # State management
    │   └── App.jsx            # Main container
    ├── tailwind.config.js
    └── package.json
```
