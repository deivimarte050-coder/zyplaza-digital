import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import AdminApp from './admin/AdminApp.tsx';
import { PublicCatalogPage } from './pages/PublicCatalogPage.tsx';
import './index.css';

const isAdminPath = window.location.pathname.startsWith('/admin');
const isCatalogPath = window.location.pathname.startsWith('/catalogo/');

function renderRoot() {
  if (isCatalogPath) return <PublicCatalogPage />;
  if (isAdminPath) return <AdminApp />;
  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {renderRoot()}
  </StrictMode>,
);
