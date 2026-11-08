## 2024-11-08 - Missing maxLength attributes on text inputs
**Vulnerability:** Missing `maxLength` attributes on user input fields (`<input>`, `<textarea>`).
**Learning:** Text inputs without length limits can lead to client-side memory bloat and Denial of Service (DoS) risks via unbounded data structures.
**Prevention:** Always ensure text input fields have explicit `maxLength` attributes to cap user input size.
