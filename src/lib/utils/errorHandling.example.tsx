/**
 * Error Handling Examples
 * Exemples d'utilisation du système de gestion d'erreurs
 */

'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api/client';
import { useToast } from '@/hooks/useToast';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { logError } from '@/lib/utils/errorLogger';
import { formatErrorForDisplay } from '@/lib/utils/errorMessages';

/**
 * Exemple 1: Gestion d'erreur dans un formulaire
 */
export function CreateUserExample() {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Appel API qui peut échouer
      await apiClient.post('/users', {
        email: 'test@example.com',
        username: 'testuser',
      });

      // Succès
      toast.success('Utilisateur créé avec succès');
    } catch (error) {
      // Logger l'erreur avec contexte
      logError(error, {
        action: 'createUser',
        component: 'CreateUserExample',
      });

      // Afficher un message d'erreur localisé
      const message = formatErrorForDisplay(error, 'fr');
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit" disabled={loading}>
        {loading ? 'Création...' : 'Créer utilisateur'}
      </button>
    </form>
  );
}

/**
 * Exemple 2: Composant qui peut lancer une erreur
 */
function ComponentThatMayFail() {
  const [shouldFail, setShouldFail] = useState(false);

  if (shouldFail) {
    throw new Error('Erreur de test dans le composant');
  }

  return (
    <div>
      <p>Ce composant fonctionne normalement</p>
      <button onClick={() => setShouldFail(true)}>Déclencher une erreur</button>
    </div>
  );
}

/**
 * Exemple 3: Utilisation d'ErrorBoundary
 */
export function ErrorBoundaryExample() {
  return (
    <ErrorBoundary>
      <ComponentThatMayFail />
    </ErrorBoundary>
  );
}

/**
 * Exemple 4: ErrorBoundary avec fallback personnalisé
 */
export function CustomErrorBoundaryExample() {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-red-800 font-semibold mb-2">
            Erreur personnalisée
          </h3>
          <p className="text-red-600">Ce composant a rencontré une erreur.</p>
        </div>
      }
    >
      <ComponentThatMayFail />
    </ErrorBoundary>
  );
}

/**
 * Exemple 5: Gestion des différents codes HTTP
 */
export function HttpErrorHandlingExample() {
  const toast = useToast();

  const testError = async (status: number) => {
    try {
      // Simuler une erreur HTTP
      throw new Error(`HTTP error! status: ${status}`);
    } catch (error) {
      logError(error, { testStatus: status });
      const message = formatErrorForDisplay(error, 'fr');
      toast.error(message);
    }
  };

  return (
    <div className="space-y-2">
      <button onClick={() => testError(401)}>Test 401 (Unauthorized)</button>
      <button onClick={() => testError(403)}>Test 403 (Forbidden)</button>
      <button onClick={() => testError(404)}>Test 404 (Not Found)</button>
      <button onClick={() => testError(409)}>Test 409 (Conflict)</button>
      <button onClick={() => testError(500)}>Test 500 (Server Error)</button>
    </div>
  );
}

/**
 * Exemple 6: Gestion d'erreur réseau
 */
export function NetworkErrorExample() {
  const toast = useToast();

  const testNetworkError = async () => {
    try {
      // Simuler une erreur réseau
      throw new TypeError('fetch failed');
    } catch (error) {
      logError(error, { type: 'network-test' });
      const message = formatErrorForDisplay(error, 'fr');
      toast.error(message);
    }
  };

  return <button onClick={testNetworkError}>Tester erreur réseau</button>;
}

/**
 * Exemple 7: Utilisation dans un composant de page
 */
export function PageWithErrorHandling() {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);

    try {
      const result = await apiClient.get('/users');
      setData(result);
    } catch (error) {
      logError(error, {
        action: 'fetchUsers',
        page: 'PageWithErrorHandling',
      });

      const message = formatErrorForDisplay(error, 'fr');
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ErrorBoundary>
      <div>
        <h1>Page avec gestion d&apos;erreurs</h1>
        <button onClick={fetchData} disabled={loading}>
          {loading ? 'Chargement...' : 'Charger les données'}
        </button>
        {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
      </div>
    </ErrorBoundary>
  );
}
