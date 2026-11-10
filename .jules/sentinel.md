## 2024-05-24 - [DoS Prevention] Add explicit maxLength to input fields
**Vulnerability:** Unbounded text inputs and textareas in client-side state.
**Learning:** React state bound to input fields without length limits allows users or scripts to paste excessively large amounts of text. This can cause client-side memory bloat and Denial of Service (DoS) risks via unbounded data structures, especially when state is synced to `localStorage` or `IndexedDB`.
**Prevention:** Always ensure text input fields (e.g., `<input>`, `<textarea>`) have explicit `maxLength` attributes to prevent unbounded data growth.
