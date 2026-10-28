import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  ALLOWED_IMAGE_TYPES,
  MAX_FILE_SIZE,
  readAndDownscaleImage,
  validateUploadFile,
} from './uploads';

const UNSUPPORTED_TYPE =
  'Tipo de ficheiro não suportado. Apenas imagens JPG, PNG e WebP são aceites.';
const FILE_TOO_LARGE = 'Ficheiro demasiado grande. O limite é 10 MB.';

/** Build a File with an exact declared size, without allocating that many bytes. */
function makeFile(type: string, size = 1024, name = 'poster.png'): File {
  const file = new File(['x'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
}

describe('validateUploadFile', () => {
  it('declares exactly the three supported image types', () => {
    expect([...ALLOWED_IMAGE_TYPES]).toEqual(['image/jpeg', 'image/png', 'image/webp']);
  });

  it.each(['image/jpeg', 'image/png', 'image/webp'])('accepts %s', (type) => {
    expect(validateUploadFile(makeFile(type))).toBeNull();
  });

  it.each([
    ['image/svg+xml', 'poster.svg'],
    ['application/pdf', 'poster.pdf'],
    ['image/gif', 'poster.gif'],
    ['', 'poster'],
  ])('rejects %s', (type, name) => {
    expect(validateUploadFile(makeFile(type, 1024, name))).toBe(UNSUPPORTED_TYPE);
  });

  it('accepts one byte below the size limit', () => {
    expect(validateUploadFile(makeFile('image/png', MAX_FILE_SIZE - 1))).toBeNull();
  });

  it('accepts a file exactly at the size limit', () => {
    expect(validateUploadFile(makeFile('image/png', MAX_FILE_SIZE))).toBeNull();
  });

  it('rejects one byte above the size limit', () => {
    expect(validateUploadFile(makeFile('image/png', MAX_FILE_SIZE + 1))).toBe(FILE_TOO_LARGE);
  });

  it('reports the type error before the size error', () => {
    expect(validateUploadFile(makeFile('image/gif', MAX_FILE_SIZE + 1, 'poster.gif'))).toBe(
      UNSUPPORTED_TYPE
    );
  });
});

describe('readAndDownscaleImage validation gate', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('rejects an unsupported type before constructing a FileReader', async () => {
    let constructed = 0;
    vi.stubGlobal(
      'FileReader',
      class {
        constructor() {
          constructed += 1;
        }
      }
    );

    await expect(
      readAndDownscaleImage(makeFile('image/svg+xml', 1024, 'poster.svg'))
    ).rejects.toThrow(UNSUPPORTED_TYPE);
    expect(constructed).toBe(0);
  });

  it('rejects an oversized file before constructing a FileReader', async () => {
    let constructed = 0;
    vi.stubGlobal(
      'FileReader',
      class {
        constructor() {
          constructed += 1;
        }
      }
    );

    await expect(
      readAndDownscaleImage(makeFile('image/png', MAX_FILE_SIZE + 1))
    ).rejects.toThrow(FILE_TOO_LARGE);
    expect(constructed).toBe(0);
  });

  it('starts reading a file that passes validation', async () => {
    let constructed = 0;
    vi.stubGlobal(
      'FileReader',
      class {
        onerror: (() => void) | null = null;
        result: string | null = null;
        constructor() {
          constructed += 1;
        }
        readAsDataURL() {
          queueMicrotask(() => this.onerror?.());
        }
      }
    );

    await expect(readAndDownscaleImage(makeFile('image/webp'))).rejects.toThrow(
      'Não foi possível ler o ficheiro. Tente novamente.'
    );
    expect(constructed).toBe(1);
  });

  it('reports a Portuguese error when the image cannot be decoded', async () => {
    vi.stubGlobal(
      'FileReader',
      class {
        onerror: (() => void) | null = null;
        onload: (() => void) | null = null;
        result = 'data:image/png;base64,AAAA';
        readAsDataURL() {
          queueMicrotask(() => this.onload?.());
        }
      }
    );
    vi.stubGlobal(
      'Image',
      class {
        onerror: (() => void) | null = null;
        onload: (() => void) | null = null;
        set src(_value: string) {
          queueMicrotask(() => this.onerror?.());
        }
      }
    );

    await expect(readAndDownscaleImage(makeFile('image/png'))).rejects.toThrow(
      'Não foi possível descodificar a imagem. O ficheiro pode estar corrompido.'
    );
  });
});
