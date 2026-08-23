# Remaining work

## Done in current tree

- Email verification OTP + disposable-domain guard + SMTP mail
- Password reset mail templates
- Bookmarks, campus events, placement/POTD surfaces
- Removed check-in, leaderboard, unused frontend mock catalogs
- Dark theme (dashboard/admin), privacy/terms, settings aligned to API

## Before production deploy

- [ ] Strong `JWT_SECRET` (no local default)
- [ ] Production MySQL + credentials via env only
- [ ] SMTP env verified on host (`MAIL_*`, `MAIL_FROM`, `FRONTEND_URL`)
- [ ] Hosted CORS / `REACT_APP_API_URL`
- [ ] Consider Flyway (or similar) instead of `ddl-auto: update`
- [ ] Drop leftover DB columns if any remain after confirming app writes without them

## Optional polish

- [ ] Rate-limit resend-verification / forgot-password
- [ ] Session invalidation when `email_verified` flips off (currently JWT remains until expiry/logout)
