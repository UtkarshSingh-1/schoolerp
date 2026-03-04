# Environment, Security & DevOps (v3)

## 1. Security Standards

### Authentication
- **JWT (Auth Service)**: Decentralized token validation.
- **Bcrypt**: For all credential hashing.
- **RBAC**: Per-service permission validation via decorators.

### Data Protection
- **TLS 1.3**: Encryption-in-transit for all service-to-service and client-to-server traffic.
- **Point-in-Time Recovery**: Enabled via Neon PG managed backups.
- **SQLi Prevention**: TypeORM strictly enforces parameterized queries.

## 2. Infrastructure (v3)
- **API Gateway**: NestJS Main API.
- **Cloud Database**: Neon PostgreSQL (Serverless).
- **Compute**: Ready for AWS EC2/ECS or Vercel Serverless.
- **Caching/Task Queue**: Redis (BullMQ) for asynchronous operations.

## 3. CI/CD & Deployment
- **Monorepo Management**: Optimized for `npm workspaces`.
- **Linting**: Automated Prettier and ESLint rules.
- **Environment Management**: Decoupled `.env` configurations for each microservice.
