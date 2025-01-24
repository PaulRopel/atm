hooks.ts
Runs on both client and server
Can only access:

- Public environment variables
- Public APIs
- No sensitive data

hooks.server.ts
Only runs on the server
Can access:

- Database
- Environment secrets
- Session data
- Private APIs
