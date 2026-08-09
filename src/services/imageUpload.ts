import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirebaseStorage } from '../lib/firebase';

const MAX_DIMENSION = 1280;
const JPEG_QUALITY = 0.82;

/**
 * Comprime una imagen en el navegador antes de subirla: la redimensiona a un
 * máximo de 1280px en su lado mayor y la convierte a JPEG. Esto reduce mucho
 * el peso de las subidas y acelera la carga en toda la app.
 */
async function compressImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return file;

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob ?? file),
      'image/jpeg',
      JPEG_QUALITY
    );
  });
}

/**
 * Sube una imagen a Firebase Storage y devuelve su URL pública.
 * El nombre incluye una marca de tiempo para que al reemplazar una imagen
 * la URL cambie y todos los clientes vean la nueva versión de inmediato.
 */
export async function uploadImage(file: File, path: string): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('El archivo seleccionado no es una imagen válida.');
  }

  if (file.size > 8 * 1024 * 1024) {
    throw new Error('La imagen no puede pesar más de 8 MB.');
  }

  const compressed = await compressImage(file);
  const fileRef = ref(getFirebaseStorage(), path);
  await uploadBytes(fileRef, compressed, { contentType: 'image/jpeg' });
  return getDownloadURL(fileRef);
}

/** Lee un archivo de imagen como data URL para previsualizarlo antes de subirlo. */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
    reader.onerror = () => reject(new Error('No se pudo leer la imagen.'));
    reader.readAsDataURL(file);
  });
}
