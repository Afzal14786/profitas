# Profit AS 

```markdown
profitas/
│
├── src/
│   │
│   ├── config/
│   │   ├── env.js
│   │   └── logger.js
│   │
│   ├── db/
│   │   ├── index.js
│   │   ├── schema/
│   │   │   ├── index.js
│   │   │   ├── users.schema.js
│   │   │   ├── organizations.schema.js
│   │   │   ├── properties.schema.js
│   │   │   ├── partners.schema.js
│   │   │   ├── documents.schema.js
│   │   │   ├── verifications.schema.js
│   │   │   ├── compliance.schema.js
│   │   │   ├── liquidity.schema.js
│   │   │   └── relations.js
│   │   └── seed.js
│   │
│   ├── modules/
│   │   │
│   │   ├── auth/
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.service.js
│   │   │   ├── auth.routes.js
│   │   │   ├── auth.validation.js
│   │   │   └── auth.constants.js
│   │   │
│   │   ├── users/
│   │   │   ├── user.controller.js
│   │   │   ├── user.service.js
│   │   │   ├── user.routes.js
│   │   │   └── user.validation.js
│   │   │
│   │   ├── organizations/
│   │   │   ├── organization.controller.js
│   │   │   ├── organization.service.js
│   │   │   ├── organization.routes.js
│   │   │   └── organization.validation.js
│   │   │
│   │   ├── properties/
│   │   │   ├── property.controller.js
│   │   │   ├── property.service.js
│   │   │   ├── property.routes.js
│   │   │   └── property.validation.js
│   │   │
│   │   ├── partners/
│   │   │   ├── partner.controller.js
│   │   │   ├── partner.service.js
│   │   │   ├── partner.routes.js
│   │   │   └── partner.validation.js
│   │   │
│   │   ├── documents/
│   │   │   ├── document.controller.js
│   │   │   ├── document.service.js
│   │   │   ├── document.routes.js
│   │   │   └── document.validation.js
│   │   │
│   │   ├── verification/
│   │   │   ├── verification.controller.js
│   │   │   ├── verification.service.js
│   │   │   ├── verification.routes.js
│   │   │   └── verification.validation.js
│   │   │
│   │   ├── compliance/
│   │   │   ├── compliance.controller.js
│   │   │   ├── compliance.service.js
│   │   │   ├── compliance.routes.js
│   │   │   └── compliance.validation.js
│   │   │
│   │   └── liquidity/
│   │       ├── liquidity.controller.js
│   │       ├── liquidity.service.js
│   │       ├── liquidity.routes.js
│   │       └── liquidity.validation.js
│   │
│   ├── shared/
│   │   ├── constants/
│   │   │   ├── http-status.js
│   │   │   ├── error-codes.js
│   │   │   └── roles.js
│   │   │
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js
│   │   │   ├── error.middleware.js
│   │   │   ├── validate.middleware.js
│   │   │   └── not-found.middleware.js
│   │   │
│   │   ├── utils/
│   │   │   ├── app-error.js
│   │   │   ├── async-handler.js
│   │   │   ├── api-response.js
│   │   │   ├── jwt.js
│   │   │   └── password.js
│   │   │
│   │   └── infra/
│   │       └── health-check.js
│   │
│   ├── routes/
│   │   └── index.js
│   │
│   ├── app.js
│   └── server.js
│
├── drizzle/
│
├── .env
├── .env.example
├── .gitignore
├── drizzle.config.js
├── package.json
├── package-lock.json
├── README.md
└── CHANGELOG.md
```