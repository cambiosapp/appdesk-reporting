'use client';

import DashboardLayout from '@/components/DashboardLayout';
import ReportForm from '@/components/ReportForm';

export default function NuevoReportePage() {
  return (
    <DashboardLayout
      title="Nuevo Reporte"
      subtitle="Reporta un error, tarea o mejora"
    >
      <ReportForm />
    </DashboardLayout>
  );
}
