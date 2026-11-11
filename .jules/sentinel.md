## 2026-11-11 - [Input Validation] Added Max Length to User Input
**Vulnerability:** Client-side memory bloat and Denial of Service (DoS) risk via unbounded text data structures.
**Learning:** Text input fields did not restrict character count, opening a potential avenue for excessive client-side memory usage if large payloads were pasted.
**Prevention:** Always enforce `maxLength` properties on text `<input>` and `<textarea>` elements, particularly when user text data is processed locally without immediate server-side truncation.
