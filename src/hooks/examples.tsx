/**
 * Exemples d'utilisation des hooks utilitaires
 *
 * Ce fichier contient des exemples concrets d'utilisation des hooks
 * dans différents contextes de l'application.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  useDebounce,
  useToast,
  useIsMobile,
  useIsDesktop,
  useScreenType,
} from './index';

/**
 * Exemple 1: Composant de recherche avec debouncing
 *
 * Utilise useDebounce pour éviter trop de requêtes API pendant la saisie
 */
export function SearchUsersExample() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const toast = useToast();

  useEffect(() => {
    if (debouncedSearchTerm) {
      setLoading(true);

      // Simuler une recherche API
      fetch(`/api/v1/users?search=${debouncedSearchTerm}`)
        .then(res => res.json())
        .then(data => {
          setResults(data.items);
          setLoading(false);
        })
        .catch(() => {
          toast.error('Erreur lors de la recherche');
          setLoading(false);
        });
    } else {
      setResults([]);
    }
  }, [debouncedSearchTerm, toast]);

  return (
    <div>
      <input
        type="text"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        placeholder="Rechercher des utilisateurs..."
        className="w-full px-4 py-2 border rounded-lg"
      />
      {loading && <p>Recherche en cours...</p>}
      <ul>
        {results.map((user: any) => (
          <li key={user.id}>{user.username}</li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Exemple 2: Formulaire avec notifications toast
 *
 * Utilise useToast pour afficher des notifications de succès/erreur
 */
export function UserFormExample() {
  const [formData, setFormData] = useState({ username: '', email: '' });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/v1/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création');
      }

      toast.success('Utilisateur créé avec succès', { duration: 3000 });
      setFormData({ username: '', email: '' });
    } catch {
      toast.error("Erreur lors de la création de l'utilisateur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        value={formData.username}
        onChange={e => setFormData({ ...formData, username: e.target.value })}
        placeholder="Nom d'utilisateur"
        className="w-full px-4 py-2 border rounded-lg"
      />
      <input
        type="email"
        value={formData.email}
        onChange={e => setFormData({ ...formData, email: e.target.value })}
        placeholder="Email"
        className="w-full px-4 py-2 border rounded-lg"
      />
      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
      >
        {loading ? 'Création...' : 'Créer'}
      </button>
    </form>
  );
}

/**
 * Exemple 3: Navigation responsive
 *
 * Utilise useIsMobile et useIsDesktop pour adapter l'interface
 */
export function ResponsiveNavigationExample() {
  const isMobile = useIsMobile();
  const isDesktop = useIsDesktop();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-lg">
      {isMobile && (
        <div className="p-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          {mobileMenuOpen && (
            <div className="mt-4 space-y-2">
              <Link
                href="/dashboard"
                className="block px-4 py-2 hover:bg-gray-100 rounded"
              >
                Dashboard
              </Link>
              <Link
                href="/users"
                className="block px-4 py-2 hover:bg-gray-100 rounded"
              >
                Utilisateurs
              </Link>
              <Link
                href="/roles"
                className="block px-4 py-2 hover:bg-gray-100 rounded"
              >
                Rôles
              </Link>
            </div>
          )}
        </div>
      )}

      {isDesktop && (
        <div className="flex items-center space-x-6 px-6 py-4">
          <Link href="/dashboard" className="hover:text-blue-600">
            Dashboard
          </Link>
          <Link href="/users" className="hover:text-blue-600">
            Utilisateurs
          </Link>
          <Link href="/roles" className="hover:text-blue-600">
            Rôles
          </Link>
          <Link href="/permissions" className="hover:text-blue-600">
            Permissions
          </Link>
          <Link href="/audit" className="hover:text-blue-600">
            Audit
          </Link>
        </div>
      )}
    </nav>
  );
}

/**
 * Exemple 4: Layout adaptatif selon le type d'écran
 *
 * Utilise useScreenType pour adapter complètement le layout
 */
export function AdaptiveLayoutExample() {
  const screenType = useScreenType();

  const layouts = {
    mobile: (
      <div className="flex flex-col">
        <header className="p-4 bg-gray-100">Mobile Header</header>
        <main className="flex-1 p-4">Mobile Content</main>
        <footer className="p-4 bg-gray-100">Mobile Footer</footer>
      </div>
    ),
    tablet: (
      <div className="grid grid-cols-[200px_1fr]">
        <aside className="bg-gray-100 p-4">Tablet Sidebar</aside>
        <div className="flex flex-col">
          <header className="p-4 bg-gray-50">Tablet Header</header>
          <main className="flex-1 p-4">Tablet Content</main>
        </div>
      </div>
    ),
    desktop: (
      <div className="grid grid-cols-[250px_1fr]">
        <aside className="bg-gray-100 p-6">Desktop Sidebar</aside>
        <div className="flex flex-col">
          <header className="p-6 bg-gray-50">Desktop Header</header>
          <main className="flex-1 p-6">Desktop Content</main>
        </div>
      </div>
    ),
    wide: (
      <div className="grid grid-cols-[300px_1fr_300px]">
        <aside className="bg-gray-100 p-6">Left Sidebar</aside>
        <div className="flex flex-col">
          <header className="p-6 bg-gray-50">Wide Header</header>
          <main className="flex-1 p-6">Wide Content</main>
        </div>
        <aside className="bg-gray-100 p-6">Right Sidebar</aside>
      </div>
    ),
  };

  return layouts[screenType];
}

/**
 * Exemple 5: Filtres de DataTable avec debouncing
 *
 * Combine useDebounce et useToast pour une expérience utilisateur optimale
 */
export function DataTableFiltersExample() {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    profile: '',
  });
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const debouncedSearch = useDebounce(filters.search, 300);
  const toast = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          search: debouncedSearch,
          status: filters.status,
          profile: filters.profile,
        });

        const response = await fetch(`/api/v1/users?${params}`);
        const result = await response.json();
        setData(result.items);
      } catch {
        toast.error('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [debouncedSearch, filters.status, filters.profile, toast]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          value={filters.search}
          onChange={e => setFilters({ ...filters, search: e.target.value })}
          placeholder="Rechercher..."
          className="px-4 py-2 border rounded-lg"
        />
        <select
          value={filters.status}
          onChange={e => setFilters({ ...filters, status: e.target.value })}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="">Tous les statuts</option>
          <option value="active">Actif</option>
          <option value="inactive">Inactif</option>
        </select>
        <select
          value={filters.profile}
          onChange={e => setFilters({ ...filters, profile: e.target.value })}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="">Tous les profils</option>
          <option value="admin">Admin</option>
          <option value="user">Utilisateur</option>
        </select>
      </div>

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <table className="w-full">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>Statut</th>
              <th>Profil</th>
            </tr>
          </thead>
          <tbody>
            {data.map((user: any) => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.status}</td>
                <td>{user.profile}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

/**
 * Exemple 6: Notifications multiples avec différents variants
 *
 * Démontre l'utilisation de tous les variants de toast
 */
export function ToastVariantsExample() {
  const toast = useToast();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Exemples de notifications</h2>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => toast.success('Opération réussie!')}
          className="px-4 py-2 bg-green-600 text-white rounded-lg"
        >
          Success
        </button>
        <button
          onClick={() => toast.error('Une erreur est survenue')}
          className="px-4 py-2 bg-red-600 text-white rounded-lg"
        >
          Error
        </button>
        <button
          onClick={() => toast.info('Information importante')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Info
        </button>
        <button
          onClick={() => toast.warning('Attention!')}
          className="px-4 py-2 bg-yellow-600 text-white rounded-lg"
        >
          Warning
        </button>
        <button
          onClick={() =>
            toast.success('Notification longue durée', { duration: 10000 })
          }
          className="px-4 py-2 bg-purple-600 text-white rounded-lg"
        >
          Long Duration
        </button>
        <button
          onClick={() => toast.dismiss()}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg"
        >
          Dismiss All
        </button>
      </div>
    </div>
  );
}
