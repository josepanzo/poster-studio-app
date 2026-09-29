## 2025-02-27 - Security Fixes for DoS and MIME Check

**Vulnerability:**
1. Insecure file upload validation: User file types were only being checked with `startsWith('image/')`, allowing dangerous image types such as `image/svg+xml`.
2. Missing input length limits: Text inputs and textareas allowed unbounded user input lengths, creating a DoS risk in parsing, rendering, and particularly in generating exported images with `html-to-image`.

**Learning:**
1. `startsWith('image/')` is an overly permissive and insecure method to validate user images because the `image/` MIME namespace contains many types with varying features. SVGs, for example, allow embedded scripts and can lead to code execution or XSS.
2. Missing `maxLength` on form elements is easy to miss during early development but presents an easy attack vector when a user interacts with systems (like saving, rendering in React, or executing `html-to-image`). React struggles handling massive text inputs natively.

**Prevention:**
1. Always validate file uploads against a strict allowlist of known safe MIME types (`image/jpeg`, `image/png`, `image/webp`).
2. Always add sane `maxLength` boundaries to user-facing inputs and textareas to constrain the size of data processed by the application.
