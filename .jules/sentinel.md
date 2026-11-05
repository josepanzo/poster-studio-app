## 2024-05-24 - [Add Content Security Policy (CSP) Headers]
**Vulnerability:** Missing Content Security Policy (CSP) headers in index.html.
**Learning:** CSP is crucial for preventing XSS and other injection attacks by defining which dynamic resources are allowed to load. Client-side only React applications should still implement a CSP in the meta tag to restrict loading of external scripts, styles, and other resources.
**Prevention:** Always include a basic CSP meta tag in the main HTML file of a frontend application, especially if not served by a backend server that provides these headers.
