## 2025-02-28 - [Security] Prevent Client-Side Memory Bloat via Unbounded Text Fields
**Vulnerability:** Text input fields (`<input>`, `<textarea>`) in the UI lacked `maxLength` constraints, allowing users to paste excessively large amounts of text.
**Learning:** This can lead to client-side memory bloat and potential Denial of Service (DoS) risks, particularly when this state is synchronized or stored (e.g., in `localStorage`).
**Prevention:** Always ensure text input fields have explicit `maxLength` attributes to cap the data size at the source.
