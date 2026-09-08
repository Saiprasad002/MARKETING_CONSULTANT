import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { ExecutiveReport } from '@shared/types';
import { useAuth } from './AuthContext';
import { useCompany } from './CompanyContext';

interface AnalyticsContextType {
  report: ExecutiveReport | null;
  loadingAnalytics: boolean;
  recalculating: boolean;
  fetchAnalytics: () => Promise<void>;
  recalculate: () => Promise<void>;
  updateRecommendationStatus: (id: string, status: string) => Promise<void>;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { profile } = useCompany();

  const [report, setReport] = useState<ExecutiveReport | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [recalculating, setRecalculating] = useState(false);

  const fetchAnalytics = async () => {
    if (!isAuthenticated) return;
    setLoadingAnalytics(true);
    try {
      const data = await api.getAnalytics();
      setReport(data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAnalytics();
    }
  }, [isAuthenticated, profile]);

  const recalculate = async () => {
    setRecalculating(true);
    try {
      const res = await api.recalculateAnalytics();
      setReport(res.report);
    } catch (err) {
      console.error('Failed to recalculate:', err);
    } finally {
      setRecalculating(false);
    }
  };

  const updateRecommendationStatus = async (id: string, status: string) => {
    await api.updateRecommendationStatus(id, status);
    if (report) {
      setReport({
        ...report,
        recommendations: report.recommendations.map(r => r.id === id ? { ...r, status: status as any } : r)
      });
    }
  };

  return (
    <AnalyticsContext.Provider value={{
      report,
      loadingAnalytics,
      recalculating,
      fetchAnalytics,
      recalculate,
      updateRecommendationStatus
    }}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => {
  const ctx = useContext(AnalyticsContext);
  if (!ctx) throw new Error('useAnalytics must be used within AnalyticsProvider');
  return ctx;
};
