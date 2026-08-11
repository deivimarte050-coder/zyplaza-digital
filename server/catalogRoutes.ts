import { adminDb, isAdminConfigured } from './firebaseAdmin.js';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

interface CatalogMeta {
  name: string;
  description: string;
  image: string;
  productCount: number;
}

/** Busca la tienda por slug y cuenta sus productos visibles, usando el Admin SDK. */
export async function fetchCatalogMeta(slug: string): Promise<CatalogMeta | null> {
  if (!isAdminConfigured() || !slug) return null;

  try {
    const db = adminDb();
    const storeSnap = await db.collection('stores').where('slug', '==', slug).limit(1).get();
    if (storeSnap.empty) return null;

    const storeDoc = storeSnap.docs[0];
    const store = storeDoc.data();

    if (store.status !== 'active' && store.status !== 'approved') return null;

    const productsSnap = await db.collection('products').where('storeId', '==', storeDoc.id).get();
    const visibleCount = productsSnap.docs.filter(
      (d) => d.data().status === 'active' || d.data().status === 'approved'
    ).length;

    return {
      name: typeof store.name === 'string' && store.name ? store.name : 'Tienda',
      description: typeof store.description === 'string' ? store.description : '',
      image: (store.coverImage || store.logo || '') as string,
      productCount: visibleCount,
    };
  } catch (error) {
    console.error('No se pudo obtener metadata del catálogo:', error);
    return null;
  }
}

/**
 * Inyecta metadatos Open Graph / Twitter Card en el HTML base de la SPA para
 * que WhatsApp, Facebook y Telegram muestren una vista previa rica del
 * catálogo, sin necesidad de renderizar la app completa en el servidor.
 */
export function injectCatalogMeta(baseHtml: string, meta: CatalogMeta | null, pageUrl: string): string {
  const title = meta ? `Catálogo de ${meta.name} · Zyplaza` : 'Catálogo no disponible · Zyplaza';
  const description = meta
    ? meta.description?.trim() ||
      `Explora los ${meta.productCount} producto${meta.productCount === 1 ? '' : 's'} de ${meta.name} en Zyplaza.`
    : 'Esta tienda no está disponible en este momento.';
  const image = meta?.image || '';

  const tags = [
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="Zyplaza" />`,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta property="og:url" content="${escapeHtml(pageUrl)}" />`,
    image ? `<meta property="og:image" content="${escapeHtml(image)}" />` : '',
    image ? `<meta property="og:image:width" content="1200" />` : '',
    image ? `<meta property="og:image:height" content="630" />` : '',
    `<meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}" />`,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
    image ? `<meta name="twitter:image" content="${escapeHtml(image)}" />` : '',
    `<meta name="description" content="${escapeHtml(description)}" />`,
  ]
    .filter(Boolean)
    .join('\n    ');

  let html = baseHtml.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
  html = html.replace('</head>', `    ${tags}\n  </head>`);
  return html;
}

/** Genera el HTML final para una ruta /catalogo/:slug a partir del HTML base de la SPA. */
export async function renderCatalogHtml(baseHtml: string, slug: string, pageUrl: string): Promise<string> {
  const meta = await fetchCatalogMeta(slug);
  return injectCatalogMeta(baseHtml, meta, pageUrl);
}
