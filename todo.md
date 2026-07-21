# Campus Coders Backend TODO

## Current Backend Checkpoint

- User entity created.
- Role enum created with `STUDENT` and `ADMIN`.
- UserRepository created.
- Auth DTOs created.
- PasswordEncoder config created.
- AuthService register and login flows created.
- AuthController register and login endpoints created.
- MySQL config added in `application.yml`.
- JWT dependencies added.
- JwtService created.
- CustomUserDetails and CustomUserDetailsService created.
- JwtAuthenticationFilter created.
- SecurityConfig updated for stateless JWT authentication.
- Register/login tested in Postman and JWT token is returned.

## Immediate Cleanup

- Remove unused imports from `JwtService`.
- Clean extra blank lines/formatting in auth/security files.
- Add a simple protected test endpoint.
- Test protected endpoint without token.
- Test protected endpoint with token.

## Tomorrow's Backend Session

1. Run Maven compile.
2. Create `GET /api/test/protected`.
3. Test without token: request should be blocked.
4. Test with token: request should succeed.
5. Add role-based authorization rules for future admin APIs.
6. Create `GET /api/auth/me`.
7. Start learning resource module design.

## Later Backend Modules

- Current user API: `GET /api/auth/me`.
- Learning paths.
- Topics.
- Resources with external links and uploaded files.
- Bookmarks.
- Progress tracking.
- Admin resource upload.
- Announcements.
- Discussions.

## Product Direction

Campus Coders should be a clean, trusted learning resource portal maintained by seniors for juniors.
