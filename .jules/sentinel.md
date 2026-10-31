## 2025-05-18 - [Add Input Length Limits]
**Vulnerability:** Missing input length limits on form inputs (DoS/localStorage exhaustion risk).
**Learning:** React state inputs in the LeftPanel did not restrict the number of characters, which could lead to large payloads in state/localStorage or performance hits during rendering.
**Prevention:** Always add sensible `maxLength` limits to text inputs.
