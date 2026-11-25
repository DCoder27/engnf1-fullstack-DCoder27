# AI Usage Disclosure

I used OpenAI ChatGPT/Codex as a development assistant during this assessment.

## How I used it

- To discuss implementation approaches and break larger requirements into smaller tasks
- To review selected code and help troubleshoot development issues
- To suggest test cases and improve the clarity of project documentation

## My responsibility

I made the final architecture and implementation decisions, reviewed suggested changes before using them, and verified the application with tests, API checks, linting, and a production build.

For example, I chose explicit `hashPassword` and `comparePassword` utilities with `bcryptjs` instead of automatic schema-level password hashing. This keeps password handling visible in the authentication flow and avoids accidentally hashing an existing hash during unrelated updates.

AI suggestions were treated as input for review, not as a substitute for understanding or validation.
