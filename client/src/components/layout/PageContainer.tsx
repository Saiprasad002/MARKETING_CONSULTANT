import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useCompany } from '../../context/CompanyContext';
import { DataConflictModal } from '../ui/DataConflictModal';

export const PageContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { conflicts, resolveConflict } = useCompany();

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Render first pending conflict modal if any exist */}
      {conflicts.length > 0 && (
        <DataConflictModal
          conflict={conflicts[0]}
          onResolve={async (val, sectionKey, fieldKey) => {
            await resolveConflict(conflicts[0].id, val, sectionKey, fieldKey);
          }}
        />
      )}
    </div>
  );
};
