## 2023-10-20 - [File Type Validation]
**Vulnerability:** Missing file type validation in `readAndDownscaleImage` allowed potentially malicious files like SVGs to be processed.
**Learning:** Client-side file inputs can be bypassed, requiring explicit validation of `file.type` before processing.
**Prevention:** Always validate file types against an allowlist before processing file uploads, even if the HTML input restricts them.
