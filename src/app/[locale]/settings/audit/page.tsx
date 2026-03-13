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
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [action, setAction] = useState('');
  const [severity, setSeverity] = useState('');

  const loadAuditData = useCallback(async () => {
    try {
      setLoading(true);

      const [logsResponse, statsResponse] = await Promise.all([
        auditAPI.getAll({
          page,
          limit,
          action: action || undefined,
          severity: severity || undefined,
        }),
        auditAPI.getStats(),
      ]);

      setLogs(logsResponse.data);
      setTotal(logsResponse.pagination.total);
      setStats(statsResponse.data || null);
    } catch (error) {
      showToast({
        message: "Erreur lors du chargement des données d'audit",
        variant: 'error',
      });
      console.error('Error loading audit data:', error);
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
    },
    {
      key: 'resource',
      label: 'Ressource',
      sortable: false,
      filterable: false,
      render: value => <span>{String(value || '-')}</span>,
    },
    {
      key: 'severity',
      label: 'Gravité',
      sortable: false,
      filterable: true,
      render: value => <span>{severityLabel(String(value || ''))}</span>,
    },
    {
      key: 'email',
      label: 'Utilisateur',
      sortable: false,
      filterable: false,
      render: value => <span>{String(value || '-')}</span>,
    },
    {
      key: 'created_at',
      label: 'Date',
      sortable: false,
      filterable: false,
      render: value => {
        if (!value) return <span>-</span>;
        const date = new Date(String(value));
        return (
          <span>
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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
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
