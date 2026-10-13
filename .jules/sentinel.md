## 2025-02-28 - [Strict MIME Type Validation for Uploads]
**Vulnerability:** File upload allowed any file whose type started with `image/` (e.g., `image/svg+xml`), opening an XSS attack vector via SVGs since small images bypassed canvas downscaling and returned raw data URLs.
**Learning:** `startsWith('image/')` is not a secure way to validate images, as it permits unsafe formats like SVGs which can execute embedded JavaScript.
**Prevention:** Always use a strict allowlist of known-safe MIME types (e.g., `['image/jpeg', 'image/png', 'image/webp']`) for file upload endpoints and client-side processing.
