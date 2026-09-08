import React, { useState } from 'react';
import { DataConflict } from '@shared/types';
import { AlertTriangle, CheckCircle, Edit3 } from 'lucide-react';

interface DataConflictModalProps {
  conflict: DataConflict;
  onResolve: (selectedValue: any, sectionKey?: string, fieldKey?: string) => Promise<void>;
}

export const DataConflictModal: React.FC<DataConflictModalProps> = ({ conflict, onResolve }) => {
  const [customValue, setCustomValue] = useState<string>('');
  const [isCustom, setIsCustom] = useState(false);
  const [resolving, setResolving] = useState(false);

  const formatVal = (val: any) => {
    if (val === null || val === undefined) return 'Not set';
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
  };

  // Determine section mapping for profile update
  const mapFieldToSection = (field: string) => {
    if (field === 'monthlyBudget') return { sectionKey: 'marketing', fieldKey: 'monthlyBudget' };
    if (field === 'companyName') return { sectionKey: 'identity', fieldKey: 'name' };
    if (field === 'industry') return { sectionKey: 'identity', fieldKey: 'industry' };
    if (field === 'primaryGoal') return { sectionKey: 'goals', fieldKey: 'primaryGoal' };
    return { sectionKey: 'identity', fieldKey: field };
  };

  const handleChoose = async (val: any) => {
    setResolving(true);
    const { sectionKey, fieldKey } = mapFieldToSection(conflict.field);
    try {
      await onResolve(val, sectionKey, fieldKey);
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-amber-500/30 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center space-x-3 text-amber-400">
          <AlertTriangle className="w-7 h-7 flex-shrink-0" />
          <h3 className="text-xl font-bold text-slate-100">Data Conflict Detected</h3>
        </div>

        <p className="text-sm text-slate-300">
          We detected conflicting business information for field <span className="font-semibold text-indigo-400">{conflict.field}</span>. Which value should we use?
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div 
            onClick={() => handleChoose(conflict.previousValue)}
            className="p-4 rounded-lg bg-slate-800/80 border border-slate-700 hover:border-indigo-500 cursor-pointer transition-all space-y-2 group"
          >
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Previous Value</div>
            <div className="text-base font-bold text-slate-100 group-hover:text-indigo-400">
              {formatVal(conflict.previousValue)}
            </div>
            <div className="text-xs text-slate-500">Stored in company profile</div>
          </div>

          <div 
            onClick={() => handleChoose(conflict.newValue)}
            className="p-4 rounded-lg bg-indigo-950/40 border border-indigo-500/40 hover:border-indigo-400 cursor-pointer transition-all space-y-2 group"
          >
            <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">New Value</div>
            <div className="text-base font-bold text-slate-100 group-hover:text-indigo-300">
              {formatVal(conflict.newValue)}
            </div>
            <div className="text-xs text-indigo-400/70">{conflict.source || 'Latest input'}</div>
          </div>
        </div>

        {isCustom ? (
          <div className="space-y-3 pt-2">
            <input
              type="text"
              placeholder="Enter custom corrected value..."
              value={customValue}
              onChange={e => setCustomValue(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500"
            />
            <div className="flex space-x-2 justify-end">
              <button
                onClick={() => setIsCustom(false)}
                className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleChoose(customValue)}
                disabled={!customValue.trim() || resolving}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-lg"
              >
                Save Custom Value
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsCustom(true)}
            className="w-full py-2.5 border border-dashed border-slate-700 hover:border-slate-500 text-slate-400 hover:text-slate-200 rounded-lg text-sm flex items-center justify-center space-x-2 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit value manually</span>
          </button>
        )}
      </div>
    </div>
  );
};
