import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { CompanyProfile, DataConflict } from '@shared/types';
import { useAuth } from './AuthContext';

interface CompanyContextType {
  profile: CompanyProfile | null;
  conflicts: DataConflict[];
  loadingProfile: boolean;
  fetchProfile: () => Promise<void>;
  updateField: (sectionKey: string, fieldKey: string, value: any, source?: string) => Promise<void>;
  updateBatch: (data: any) => Promise<void>;
  resolveConflict: (conflictId: string, selectedValue: any, sectionKey?: string, fieldKey?: string) => Promise<void>;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const CompanyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [conflicts, setConflicts] = useState<DataConflict[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const fetchProfile = async () => {
    if (!isAuthenticated) return;
    setLoadingProfile(true);
    try {
      const pData = await api.getProfile();
      setProfile(pData);

      const cData = await api.getConflicts();
      setConflicts(cData || []);
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    } else {
      setProfile(null);
      setConflicts([]);
    }
  }, [isAuthenticated]);

  const updateField = async (sectionKey: string, fieldKey: string, value: any, source = 'manual_edit') => {
    const res = await api.updateProfileField({ sectionKey, fieldKey, value, source });
    setProfile(res.profile);
    if (res.conflicts && res.conflicts.length > 0) {
      setConflicts(prev => [...prev, ...res.conflicts]);
    }
  };

  const updateBatch = async (data: any) => {
    const res = await api.updateProfileBatch(data);
    setProfile(res.profile);
  };

  const resolveConflict = async (conflictId: string, selectedValue: any, sectionKey?: string, fieldKey?: string) => {
    await api.resolveConflict(conflictId, { selectedValue, sectionKey, fieldKey });
    setConflicts(prev => prev.filter(c => c.id !== conflictId));
    fetchProfile();
  };

  return (
    <CompanyContext.Provider value={{
      profile,
      conflicts,
      loadingProfile,
      fetchProfile,
      updateField,
      updateBatch,
      resolveConflict
    }}>
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = () => {
  const ctx = useContext(CompanyContext);
  if (!ctx) throw new Error('useCompany must be used within CompanyProvider');
  return ctx;
};
