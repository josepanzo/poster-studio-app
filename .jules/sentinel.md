## 2023-10-24 - [Insecure File Upload]
**Vulnerability:** File upload validation broadly accepted any `image/*` MIME type, allowing SVG uploads (`image/svg+xml`) which can harbor XSS payloads.
**Learning:** Broad MIME type checks like `startsWith('image/')` are insufficient and can permit executable or malicious image formats.
**Prevention:** Always use a strict allowlist of safe, non-executable image formats (e.g., `['image/jpeg', 'image/png', 'image/webp']`).
