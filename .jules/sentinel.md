## 2023-10-25 - [File Upload DoS Vulnerability]
**Vulnerability:** Missing file size limit in `readAndDownscaleImage` allowed loading arbitrarily large files into memory.
**Learning:** Even client-side applications can suffer from DoS if unconstrained file reading exhausts browser memory before downscaling can occur.
**Prevention:** Always enforce a strict `file.size` check before invoking `FileReader.readAsDataURL()`.
