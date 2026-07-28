/**
 * Crea (o repara) la cuenta de administrador inicial de Zyplaza.
 *
 * Uso:  npm run seed:admin
 *
 * Requiere en .env.local las credenciales del Admin SDK:
 *   FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
 * Opcionales:
 *   ADMIN_EMAIL (por defecto admin@zyplaza.com)
 *   ADMIN_INITIAL_PASSWORD (si no se define, se genera una segura al azar)
 *
 * La contraseña nunca se guarda en el código: se muestra una sola vez al terminar
 * y el administrador está obligado a cambiarla en su primer inicio de sesión.
 */
import { randomInt } from 'crypto';
import dotenv from 'dotenv';
import { FieldValue } from 'firebase-admin/firestore';
import { adminAuth, adminDb, missingAdminEnv } from '../server/firebaseAdmin.js';

dotenv.config({ path: '.env.local' });
dotenv.config();

const UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const LOWER = 'abcdefghijkmnopqrstuvwxyz';
const DIGITS = '23456789';
const SYMBOLS = '!@#$%&*?-_';

/** Genera una contraseña aleatoria con al menos un carácter de cada tipo */
function generatePassword(length = 16): string {
  const all = UPPER + LOWER + DIGITS + SYMBOLS;
  const chars = [
    UPPER[randomInt(UPPER.length)],
    LOWER[randomInt(LOWER.length)],
    DIGITS[randomInt(DIGITS.length)],
    SYMBOLS[randomInt(SYMBOLS.length)]
  ];

  while (chars.length < length) {
    chars.push(all[randomInt(all.length)]);
  }

  // Mezcla Fisher-Yates para que los primeros caracteres no sean predecibles
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join('');
}

async function main(): Promise<void> {
  const missing = missingAdminEnv();

  if (missing.length > 0) {
    console.error('\n  No se puede crear el administrador.');
    console.error(`  Faltan estas variables en .env.local: ${missing.join(', ')}\n`);
    console.error('  Obtenlas en: consola de Firebase → Configuración del proyecto →');
    console.error('  Cuentas de servicio → Generar nueva clave privada.\n');
    process.exitCode = 1;
    return;
  }

  const email = (process.env.ADMIN_EMAIL || 'admin@zyplaza.com').trim().toLowerCase();
  const password = process.env.ADMIN_INITIAL_PASSWORD || generatePassword();
  const generated = !process.env.ADMIN_INITIAL_PASSWORD;

  const auth = adminAuth();
  const db = adminDb();

  let uid: string;
  let created = false;

  try {
    const existing = await auth.getUserByEmail(email);
    uid = existing.uid;
    await auth.updateUser(uid, { password, emailVerified: true, disabled: false });
    console.log(`\n  La cuenta ${email} ya existía: se restableció su contraseña.`);
  } catch (error) {
    const code = (error as { code?: string }).code;

    if (code !== 'auth/user-not-found') throw error;

    const user = await auth.createUser({
      email,
      password,
      displayName: 'Administrador Zyplaza',
      emailVerified: true
    });

    uid = user.uid;
    created = true;
    console.log(`\n  Cuenta de administrador creada: ${email}`);
  }

  // El rol viaja en el token, así lo leen las reglas de seguridad de Firestore.
  await auth.setCustomUserClaims(uid, { role: 'admin' });

  await db
    .collection('users')
    .doc(uid)
    .set(
      {
        name: 'Administrador Zyplaza',
        email,
        phone: '',
        city: '',
        avatar: '',
        role: 'admin',
        status: 'active',
        mustChangePassword: generated,
        updatedAt: FieldValue.serverTimestamp(),
        ...(created ? { createdAt: FieldValue.serverTimestamp(), lastLoginAt: null } : {})
      },
      { merge: true }
    );

  // Documento de configuración inicial, solo si aún no existe.
  const settingsRef = db.collection('settings').doc('general');
  const settingsSnap = await settingsRef.get();

  if (!settingsSnap.exists) {
    await settingsRef.set({
      siteName: 'Zyplaza',
      logoUrl: '',
      commissionRate: 5,
      whatsapp: '',
      supportEmail: email,
      facebook: '',
      instagram: '',
      tiktok: '',
      paymentMethods: [
        { id: 'cash', label: 'Efectivo al recibir', enabled: true },
        { id: 'transfer', label: 'Transferencia bancaria', enabled: true },
        { id: 'card', label: 'Tarjeta de crédito o débito', enabled: false },
        { id: 'paypal', label: 'PayPal', enabled: false }
      ],
      maintenanceMode: false,
      maintenanceMessage: 'Estamos realizando mejoras. Vuelve en unos minutos.',
      updatedAt: FieldValue.serverTimestamp()
    });

    console.log('  Configuración inicial de Zyplaza creada.');
  }

  console.log('\n  ─────────────────────────────────────────────');
  console.log('   CREDENCIALES DE ACCESO AL PANEL');
  console.log('  ─────────────────────────────────────────────');
  console.log(`   Correo:     ${email}`);
  console.log(`   Contraseña: ${password}`);
  console.log('  ─────────────────────────────────────────────');

  if (generated) {
    console.log('   Guárdala ahora: no se volverá a mostrar.');
  }

  console.log('   Deberás cambiarla al iniciar sesión.\n');
}

main().catch((error) => {
  console.error('\n  Falló la creación del administrador:', error);
  process.exitCode = 1;
});
