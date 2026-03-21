'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DataTable } from '@/components/ui/DataTable/DataTable';
import { Column } from '@/components/ui/DataTable/types';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useToast } from '@/hooks/useToast';
import { auditAPI } from '@/lib/api/aud/audit';
import type { AuditLog, AuditStats } from '@/types/audit';

const severityLabel = (severity?: string) => {
  switch (severity) {
    case 'critical':
      return 'Critique';
    case 'error':
      return 'Erreur';
    case 'warning':
      return 'Alerte';
    case 'info':
      return 'Info';
    default:
      return 'N/A';
  }
};

export default function AuditPage() {
  const { showToast } = useToast();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [total, setTotal] = useState(0);
  const [action, setAction] = useState('');
  const [severity, setSeverity] = useState('');

  const loadAuditData = useCallback(async () => {
    try {
      setLoading(true);
      const [logsResult, statsResult] = await Promise.allSettled([
        auditAPI.getAll({
          page,
          limit,
          action: action || undefined,
          severity: severity || undefined,
        }),
        auditAPI.getStats(),
      ]);

      if (logsResult.status === 'fulfilled') {
        setLogs(logsResult.value.data);
        setTotal(logsResult.value.pagination.total);
      } else {
        setLogs([]);
        setTotal(0);
        showToast({
          message: "Erreur lors du chargement des logs d'audit",
          variant: 'error',
        });
        console.error('Error loading audit logs:', logsResult.reason);
      }

      if (statsResult.status === 'fulfilled') {
        setStats(statsResult.value.data || null);
      } else {
        setStats(null);
        console.error('Error loading audit stats:', statsResult.reason);
      }
    } catch (error) {
      setLogs([]);
      setTotal(0);
      setStats(null);
      showToast({
        message: "Erreur lors du chargement des données d'audit",
        variant: 'error',
      });
      console.error('Unexpected error while loading audit data:', error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, action, severity, showToast]);

  useEffect(() => {
    loadAuditData();
  }, [loadAuditData]);

  const columns: Column<AuditLog>[] = [
    {
      key: 'action',
      label: 'Action',
      sortable: false,
      filterable: true,
      render: value => (
        <span className="text-gray-900">{String(value || '-')}</span>
      ),
    },
    {
      key: 'resource',
      label: 'Ressource',
      sortable: false,
      filterable: false,
      render: value => (
        <span className="text-gray-900">{String(value || '-')}</span>
      ),
    },
    {
      key: 'severity',
      label: 'Gravité',
      sortable: false,
      filterable: true,
      render: value => (
        <span className="text-gray-900">
          {severityLabel(String(value || 'info'))}
        </span>
      ),
    },
    {
      key: 'email',
      label: 'Utilisateur',
      sortable: false,
      filterable: false,
      render: (_value, row) => (
        <span className="text-gray-900">
          {row.email || row.user?.email || row.user?.username || '-'}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Date',
      sortable: false,
      filterable: false,
      render: (value, row) => {
        const dateValue = value || row.timestamp;
        if (!dateValue) return <span>-</span>;
        const date = new Date(String(dateValue));
        return (
          <span className="text-gray-900">
            {date.toLocaleDateString()} {date.toLocaleTimeString()}
          </span>
        );
      },
    },
  ];

  const handleFilter = (filters: Record<string, unknown>) => {
    setAction((filters.action as string) || '');
    setSeverity((filters.severity as string) || '');
    setPage(1);
  };

  return (
    <ProtectedRoute permission="audit:read">
      <div className="w-full px-1 sm:px-2 lg:px-2 py-2 sm:py-3 space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Journal d&apos;audit
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Suivi des actions sensibles et événements système
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-sm text-gray-500">Total logs affichés</p>
            <p className="text-2xl font-semibold text-gray-900">{total}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-sm text-gray-500">Actions distinctes</p>
            <p className="text-2xl font-semibold text-gray-900">
              {stats?.stats?.length || 0}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-sm text-gray-500">Page courante</p>
            <p className="text-2xl font-semibold text-gray-900">{page}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-sm text-gray-500">Par page</p>
            <p className="text-2xl font-semibold text-gray-900">{limit}</p>
          </div>
        </div>

        <DataTable
          data={logs}
          columns={columns}
          loading={loading}
          pagination={{
            page,
            limit,
            total,
            onPageChange: setPage,
            onLimitChange: setLimit,
          }}
          onFilter={handleFilter}
          emptyMessage="Aucun log d'audit trouvé"
        />
      </div>
    </ProtectedRoute>
  );
}
