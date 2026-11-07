## 2024-05-14 - [Denial of Service] Missing Max Length on Inputs
**Vulnerability:** Found multiple text inputs (`<input>`, `<textarea>`) in `src/app/components/LeftPanel.tsx` missing `maxLength` limits. An attacker could paste extremely large strings into the fields (e.g. body, title, subtitle), causing memory bloat, lag, or crashing the application during state serialization or rendering, which constitutes a Denial of Service (DoS) risk.
**Learning:** Always implement length constraints on user input fields to prevent unbounded data structures, even on client-side state.
**Prevention:** Ensure input and textarea components have sensible `maxLength` attributes applied.
