import { useEffect, useState } from 'react';
import { onIdTokenChanged } from 'firebase/auth';
import { getFirebaseAuth, isFirebaseConfigured } from '../lib/firebase';

/**
 * Indica si la sesión de Firebase abierta en este navegador pertenece a un
 * administrador. El rol viaja como custom claim dentro del token, así que no se
 * puede falsificar desde el navegador.
 *
 * La sesión de Firebase se comparte entre la tienda y el panel porque ambos
 * viven en el mismo dominio, por eso el acceso aparece sin volver a entrar.
 *
 * `activeUserId` es el id del perfil que la app muestra en ese momento (el de
 * `zyplaza_user`). Se exige que coincida con el uid de la sesión de Firebase
 * para evitar que una sesión de Firebase vieja (de un administrador o cuenta
 * de Google usada antes en el mismo navegador) se filtre a un perfil local
 * distinto que se haya abierto después.
 */
export function useAdminClaim(activeUserId?: string | null): boolean {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!isFirebaseConfigured) return;

    return onIdTokenChanged(getFirebaseAuth(), async (user) => {
      if (!user || (activeUserId && user.uid !== activeUserId)) {
        setIsAdmin(false);
        return;
      }

      try {
        const token = await user.getIdTokenResult();
        setIsAdmin(token.claims.role === 'admin');
      } catch {
        setIsAdmin(false);
      }
    });
  }, [activeUserId]);

  return isAdmin;
}
