import React from 'react';
import { MetricStatus, ProfileSource } from '@shared/types';

interface MetricStatusBadgeProps {
  status: MetricStatus;
}

export const MetricStatusBadge: React.FC<MetricStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'AVAILABLE':
      return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">AVAILABLE</span>;
    case 'CALCULATED':
      return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">CALCULATED</span>;
    case 'ESTIMATED':
      return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">ESTIMATED</span>;
    case 'INSUFFICIENT_DATA':
    default:
      return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">INSUFFICIENT DATA</span>;
  }
};

interface SourceBadgeProps {
  source: ProfileSource | string;
  confidence?: number;
}

export const SourceBadge: React.FC<SourceBadgeProps> = ({ source, confidence }) => {
  const confText = confidence !== undefined ? ` (${Math.round(confidence * 100)}%)` : '';

  switch (source) {
    case 'user_chat':
      return <span className="px-2 py-0.5 text-[11px] rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">Chat Conversation{confText}</span>;
    case 'uploaded_document':
      return <span className="px-2 py-0.5 text-[11px] rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">Uploaded Document{confText}</span>;
    case 'manual_edit':
      return <span className="px-2 py-0.5 text-[11px] rounded bg-slate-500/20 text-slate-300 border border-slate-500/30">Manual Edit{confText}</span>;
    case 'ai_inference':
      return <span className="px-2 py-0.5 text-[11px] rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">AI Hypothesis{confText}</span>;
    default:
      return <span className="px-2 py-0.5 text-[11px] rounded bg-slate-800 text-slate-400">{source}{confText}</span>;
  }
};
