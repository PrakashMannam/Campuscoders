# Campus Coders

Open learning portal for students and early-career engineers.
**Campus** is the brand — not an access restriction.

## Stack

| Layer | Tech |
|---|---|
| Backend | Java 21, Spring Boot 3, Spring Security (JWT), Spring Data JPA, MySQL |
| Frontend | React (CRA), React Router, Axios |
| Mail | Spring Mail (SMTP) for email verification OTP and password reset |

## Local setup

### Prerequisites

- JDK 21+, Maven
- Node.js 18+
- MySQL with database `campuscoders`

### Backend

```bash
cd backend
# Optional mail (Gmail App Password recommended):
# set MAIL_HOST, MAIL_PORT, MAIL_USERNAME, MAIL_PASSWORD, MAIL_FROM, FRONTEND_URL
mvn spring-boot:run
```

API base: `http://localhost:8080/api`

Dev seed users (when `dev` profile / DataInitializer runs):

- `admin@campus.com` / `admin123`
- `student@campus.com` / `student123`

### Frontend

```bash
cd frontend/campus_coders
npm install
npm start
```

App: `http://localhost:3000`  
Optional: `REACT_APP_API_URL=http://localhost:8080/api`

### Environment variables (backend)

| Variable | Purpose | Default |
|---|---|---|
| `DB_URL` | JDBC URL | `jdbc:mysql://localhost:3306/campuscoders` |
| `DB_USERNAME` / `DB_PASSWORD` | MySQL credentials | `root` / `root` |
| `JWT_SECRET` | JWT signing key | local default (change for deploy) |
| `JWT_EXPIRATION_MS` | Token lifetime | `86400000` |
| `MAIL_HOST` / `MAIL_PORT` | SMTP | empty / `587` |
| `MAIL_USERNAME` / `MAIL_PASSWORD` | SMTP auth | empty |
| `MAIL_FROM` | From address | empty |
| `FRONTEND_URL` | Reset-link base + CORS | `http://localhost:3000` |
| `GITHUB_TOKEN` | Optional GitHub calendar | empty |

If `MAIL_HOST` and `MAIL_FROM` are unset, new accounts are auto-verified for local development.

### Useful seed scripts

```bash
# Admin catalog (paths/topics/resources) — requires admin login
node backend/scripts/seed-admin-catalog.js

# Placement path + today's POTD + sample events
node backend/scripts/seed-placement-potd.js
```

## Product boundaries

Included: learning paths, resources, bookmarks, discussions, announcements, events, placement, today's problem (external link), profile, email verification.

Not in scope: in-app judge, OAuth, campus-only email lock, XP/leaderboard as identity, check-in.

## Deployment notes

- Set a strong `JWT_SECRET`, production `DB_*`, SMTP, and hosted `FRONTEND_URL` / `REACT_APP_API_URL`.
- Prefer managed MySQL; do not commit secrets or `.env` files.
