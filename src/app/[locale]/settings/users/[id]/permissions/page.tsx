'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import {
  ArrowLeft,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Badge } from '@/components/ui/Badge/Badge';
import { Button } from '@/components/ui/Button/Button';
import { Skeleton } from '@/components/ui/Skeleton/Skeleton';
import { useDebounce } from '@/hooks/useDebounce';
import { useToast } from '@/hooks/useToast';
import { permissionsAPI } from '@/lib/api/permissions';
import { usersAPI } from '@/lib/api/users';
import type { Permission } from '@/types/permission';
import type { User } from '@/types/user';

interface ChangeSet {
  toAssign: number[];
  toRevoke: number[];
  count: number;
}

interface PermissionGroup {
  resource: string;
  items: Permission[];
}

const collator = new Intl.Collator('fr', {
  sensitivity: 'base',
  numeric: true,
});

const BATCH_SIZE = 20;

const buildChangeSet = (
  selectedIds: Set<number>,
  initialIds: Set<number>
): ChangeSet => {
  const toAssign: number[] = [];
  const toRevoke: number[] = [];

  selectedIds.forEach(id => {
    if (!initialIds.has(id)) {
      toAssign.push(id);
    }
  });

  initialIds.forEach(id => {
    if (!selectedIds.has(id)) {
      toRevoke.push(id);
    }
  });

  return {
    toAssign,
    toRevoke,
    count: toAssign.length + toRevoke.length,
  };
};

const sortPermissions = (permissions: Permission[]): Permission[] => {
  return [...permissions].sort((a, b) => {
    const byResource = collator.compare(a.resource || '', b.resource || '');
    if (byResource !== 0) return byResource;

    const byAction = collator.compare(a.action || '', b.action || '');
    if (byAction !== 0) return byAction;

    return collator.compare(a.name, b.name);
  });
};

const groupPermissionsByResource = (
  permissions: Permission[]
): PermissionGroup[] => {
  const grouped = permissions.reduce<Record<string, Permission[]>>(
    (accumulator, permission) => {
      const key = permission.resource || 'autres';
      accumulator[key] = accumulator[key] || [];
      accumulator[key].push(permission);
      return accumulator;
    },
    {}
  );

  return Object.entries(grouped)
    .sort(([a], [b]) => collator.compare(a, b))
    .map(([resource, items]) => ({
      resource,
      items: sortPermissions(items),
    }));
};

const areAllGroupSelected = (items: Permission[], selectedIds: Set<number>) => {
  return (
    items.length > 0 &&
    items.every(permission => selectedIds.has(permission.id))
  );
};

const runBatched = async (
  tasks: Array<() => Promise<unknown>>
): Promise<number> => {
  let failures = 0;

  for (let index = 0; index < tasks.length; index += BATCH_SIZE) {
    const chunk = tasks.slice(index, index + BATCH_SIZE);
    const results = await Promise.allSettled(chunk.map(task => task()));
    failures += results.filter(result => result.status === 'rejected').length;
  }

  return failures;
};

export default function UserPermissionsPage() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const { showToast } = useToast();

  const userId = Number(params.id);

  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [initialIds, setInitialIds] = useState<Set<number>>(new Set());
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const debouncedSearch = useDebounce(searchInput, 250);

  const loadData = useCallback(
    async (options?: { background?: boolean }) => {
      const background = options?.background ?? false;

      if (!Number.isFinite(userId) || userId <= 0) {
        showToast({
          message: 'Identifiant utilisateur invalide',
          variant: 'error',
        });
        router.push(`/${locale}/settings/users`);
        return;
      }

      if (background) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setLoadError(null);

      try {
        const [userResponse, permissionsByCategoryResponse, assignedResponse] =
          await Promise.all([
            usersAPI.getById(userId),
            permissionsAPI.getByCategory(),
            permissionsAPI.getByUserId(userId),
          ]);

        if (!userResponse.data) {
          throw new Error('Utilisateur introuvable');
        }

        const categoryMap = permissionsByCategoryResponse.data || {};
        const uniquePermissions = new Map<number, Permission>();

        Object.values(categoryMap).forEach(categoryPermissions => {
          categoryPermissions.forEach(permission => {
            uniquePermissions.set(permission.id, permission);
          });
        });

        const allPermissions = sortPermissions(
          Array.from(uniquePermissions.values())
        );
        const assignedPermissions = assignedResponse.data || [];
        const assignedIds = new Set(
          assignedPermissions.map(permission => permission.id)
        );

        setUser(userResponse.data);
        setPermissions(allPermissions);
        setSelectedIds(new Set(assignedIds));
        setInitialIds(new Set(assignedIds));
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Erreur lors du chargement des permissions de l'utilisateur";

        if (errorMessage.toLowerCase().includes('introuvable')) {
          showToast({ message: errorMessage, variant: 'error' });
          router.push(`/${locale}/settings/users`);
          return;
        }

        setLoadError(errorMessage);
        showToast({ message: errorMessage, variant: 'error' });
      } finally {
        if (background) {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    },
    [locale, router, showToast, userId]
  );

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredPermissions = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    if (!query) return permissions;

    return permissions.filter(permission => {
      const searchableText = [
        permission.name,
        permission.resource,
        permission.action,
        permission.description || '',
      ]
        .join(' ')
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [permissions, debouncedSearch]);

  const groupedPermissions = useMemo(
    () => groupPermissionsByResource(filteredPermissions),
    [filteredPermissions]
  );

  const selectedCount = useMemo(
    () =>
      permissions.reduce(
        (count, permission) => count + (selectedIds.has(permission.id) ? 1 : 0),
        0
      ),
    [permissions, selectedIds]
  );

  const changeSet = useMemo(
    () => buildChangeSet(selectedIds, initialIds),
    [selectedIds, initialIds]
  );

  const hasVisiblePermissions = filteredPermissions.length > 0;
  const allVisibleSelected =
    hasVisiblePermissions &&
    filteredPermissions.every(permission => selectedIds.has(permission.id));

  const togglePermission = (permissionId: number) => {
    if (isSubmitting) return;

    setSelectedIds(previous => {
      const next = new Set(previous);
      if (next.has(permissionId)) {
        next.delete(permissionId);
      } else {
        next.add(permissionId);
      }
      return next;
    });
  };

  const toggleVisiblePermissions = (checked: boolean) => {
    if (isSubmitting || !hasVisiblePermissions) return;

    setSelectedIds(previous => {
      const next = new Set(previous);

      filteredPermissions.forEach(permission => {
        if (checked) {
          next.add(permission.id);
        } else {
          next.delete(permission.id);
        }
      });

      return next;
    });
  };

  const toggleResourcePermissions = (resource: string, checked: boolean) => {
    if (isSubmitting) return;

    const group = groupedPermissions.find(item => item.resource === resource);
    if (!group) return;

    setSelectedIds(previous => {
      const next = new Set(previous);

      group.items.forEach(permission => {
        if (checked) {
          next.add(permission.id);
        } else {
          next.delete(permission.id);
        }
      });

      return next;
    });
  };

  const handleResetChanges = () => {
    if (isSubmitting) return;
    setSelectedIds(new Set(initialIds));
  };

  const handleSave = async () => {
    if (changeSet.count === 0) {
      showToast({
        message: 'Aucune modification à enregistrer',
        variant: 'info',
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const assignTasks = changeSet.toAssign.map(permissionId => {
        return () => permissionsAPI.assignToUser({ userId, permissionId });
      });

      const revokeTasks = changeSet.toRevoke.map(permissionId => {
        return () => permissionsAPI.revokeFromUser({ userId, permissionId });
      });

      const failures = await runBatched([...assignTasks, ...revokeTasks]);

      if (failures === 0) {
        setInitialIds(new Set(selectedIds));
        showToast({
          message: `Permissions mises à jour (${changeSet.toAssign.length} ajoutée(s), ${changeSet.toRevoke.length} retirée(s))`,
          variant: 'success',
        });
        return;
      }

      showToast({
        message: `${failures} opération(s) ont échoué. Synchronisation en cours...`,
        variant: 'warning',
      });

      await loadData({ background: true });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erreur lors de l'enregistrement des permissions";
      showToast({ message: errorMessage, variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const userLabel = user
    ? `${user.firstName} ${user.lastName} (${user.username})`
    : '';

  return (
    <ProtectedRoute permission="permissions:manage">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Permissions Utilisateur
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              {user
                ? `Ajustez les permissions directes pour ${userLabel}.`
                : 'Chargement de l’utilisateur...'}
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="secondary"
              icon={<ArrowLeft className="w-4 h-4" />}
              iconPosition="left"
              onClick={() => router.push(`/${locale}/settings/users`)}
              disabled={isSubmitting}
            >
              Retour aux utilisateurs
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              loading={isSubmitting}
              disabled={loading || isSubmitting || changeSet.count === 0}
            >
              Enregistrer ({changeSet.count})
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5">
          {loading ? (
            <div className="space-y-2">
              <Skeleton variant="rectangular" height={20} width="45%" />
              <Skeleton variant="rectangular" height={20} width="30%" />
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="flex items-center gap-1.5">
                <UserRound className="w-3.5 h-3.5" />
                Permissions directes utilisateur
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                {selectedCount} sélectionnée(s)
              </Badge>
              <Badge variant="info">
                {permissions.length} permission(s) totale(s)
              </Badge>
              {changeSet.count > 0 && (
                <Badge variant="warning">
                  {changeSet.count} modification(s) en attente
                </Badge>
              )}
              {refreshing && (
                <Badge variant="neutral">Synchronisation...</Badge>
              )}
            </div>
          )}
        </div>

        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 space-y-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={event => setSearchInput(event.target.value)}
              placeholder="Rechercher une permission (nom, ressource, action)..."
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#356ca5]"
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-gray-500">
              {filteredPermissions.length} permission(s) visible(s)
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => toggleVisiblePermissions(!allVisibleSelected)}
                disabled={!hasVisiblePermissions || isSubmitting}
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#356ca5] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {allVisibleSelected
                  ? 'Tout désélectionner (filtre)'
                  : 'Tout sélectionner (filtre)'}
              </button>

              <button
                type="button"
                onClick={handleResetChanges}
                disabled={isSubmitting || changeSet.count === 0}
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#356ca5] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Réinitialiser
              </button>

              <button
                type="button"
                onClick={() => {
                  void loadData({ background: true });
                }}
                disabled={loading || refreshing || isSubmitting}
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#356ca5] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`}
                />
                Actualiser
              </button>
            </div>
          </div>
        </div>

        {loadError && !loading && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <p className="font-medium">Erreur de chargement</p>
            <p className="mt-1">{loadError}</p>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="rounded-lg border border-gray-200 bg-white p-4 space-y-3"
              >
                <Skeleton variant="rectangular" height={18} width="35%" />
                <Skeleton variant="rectangular" height={16} count={3} />
              </div>
            ))}
          </div>
        ) : groupedPermissions.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 bg-white py-12 text-center text-gray-500">
            Aucune permission trouvée avec ce filtre.
          </div>
        ) : (
          <div className="space-y-4">
            {groupedPermissions.map(group => {
              const selectedInGroup = group.items.filter(permission =>
                selectedIds.has(permission.id)
              ).length;
              const allGroupSelected = areAllGroupSelected(
                group.items,
                selectedIds
              );

              return (
                <section
                  key={group.resource}
                  className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
                >
                  <div className="flex flex-col gap-2 border-b border-gray-200 bg-gray-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-800">
                        {group.resource}
                      </h2>
                      <Badge variant="secondary" size="sm">
                        {selectedInGroup}/{group.items.length}
                      </Badge>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        toggleResourcePermissions(
                          group.resource,
                          !allGroupSelected
                        )
                      }
                      disabled={isSubmitting}
                      className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#356ca5] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {allGroupSelected ? 'Tout retirer' : 'Tout sélectionner'}
                    </button>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {group.items.map(permission => {
                      const checked = selectedIds.has(permission.id);

                      return (
                        <label
                          key={permission.id}
                          className={`flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors ${checked ? 'bg-blue-50/40' : 'hover:bg-gray-50'} ${isSubmitting ? 'cursor-not-allowed' : ''}`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => togglePermission(permission.id)}
                            disabled={isSubmitting}
                            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#356ca5] focus:ring-[#356ca5] disabled:opacity-50"
                          />

                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {permission.name}
                            </p>
                            <p className="mt-0.5 text-xs text-gray-600">
                              {permission.description || 'Aucune description'}
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {permission.isSystem && (
                              <Badge variant="neutral" size="sm">
                                Système
                              </Badge>
                            )}
                            <Badge
                              variant={checked ? 'info' : 'neutral'}
                              size="sm"
                              className="capitalize"
                            >
                              {permission.action}
                            </Badge>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
