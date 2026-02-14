# Environment Variables Guide

## Setup Instructions

1. **Copy the example file**:

   ```bash
   cp .env.example .env
   ```

2. **Generate secure secrets**:

   ```bash
   # Generate SESSION_SECRET
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

   # Generate JWT_SECRET
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. **Update `.env` with your values**:
   - Database credentials (DB_PASSWORD, etc.)
   - Generated session and JWT secrets
   - Email credentials (if needed)

4. **Never commit `.env`** - It's already in `.gitignore`

## Environment Variables

### Server

- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 5000)

### Database

- `DB_HOST` - PostgreSQL host
- `DB_PORT` - PostgreSQL port (default: 5432)
- `DB_USER` - Database username
- `DB_PASSWORD` - Database password ⚠️ **REQUIRED**
- `DB_NAME` - Database name

### Security

- `SESSION_SECRET` - Session encryption key ⚠️ **REQUIRED**
- `JWT_SECRET` - JWT signing key (for future use)
- `JWT_EXPIRES_IN` - Access token expiry
- `JWT_REFRESH_EXPIRES_IN` - Refresh token expiry

### CORS

- `FRONTEND_URL` - Allowed frontend origin

### Email (Future)

- `SMTP_HOST` - Email server
- `SMTP_PORT` - Email port
- `SMTP_USER` - Email username
- `SMTP_PASSWORD` - Email password

## Production Checklist

- [ ] Generate strong random secrets
- [ ] Set `NODE_ENV=production`
- [ ] Use strong database password
- [ ] Enable HTTPS (secure cookies)
- [ ] Set proper `FRONTEND_URL`
- [ ] Do NOT use default/example values
