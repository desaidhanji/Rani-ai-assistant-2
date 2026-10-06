import React from 'react';
import {
  Mic,
  ShieldCheck,
  Smartphone,
  Bell,
  Layers,
  PhoneCall,
  MessageSquare,
  Users,
  Calendar,
  CheckCircle2,
  XCircle,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { PermissionItem } from '../types';

interface PermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  permissions: PermissionItem[];
  onTogglePermission: (id: string) => void;
  onGrantAll: () => void;
  onPlayReason: (reason: string) => void;
}

export const PermissionsModal: React.FC<PermissionsModalProps> = ({
  isOpen,
  onClose,
  permissions,
  onTogglePermission,
  onGrantAll,
  onPlayReason,
}) => {
  if (!isOpen) return null;

  const grantedCount = permissions.filter((p) => p.granted).length;
  const allGranted = grantedCount === permissions.length;

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'mic':
        return <Mic className="w-5 h-5 text-pink-400" />;
      case 'accessibility':
        return <Smartphone className="w-5 h-5 text-emerald-400" />;
      case 'notification':
        return <Bell className="w-5 h-5 text-amber-400" />;
      case 'overlay':
        return <Layers className="w-5 h-5 text-purple-400" />;
      case 'phone':
        return <PhoneCall className="w-5 h-5 text-blue-400" />;
      case 'sms':
        return <MessageSquare className="w-5 h-5 text-indigo-400" />;
      case 'contacts':
        return <Users className="w-5 h-5 text-rose-400" />;
      case 'calendar':
        return <Calendar className="w-5 h-5 text-teal-400" />;
      default:
        return <ShieldCheck className="w-5 h-5 text-pink-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-pink-500/30 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-pink-950/40 via-purple-950/30 to-slate-900 border-b border-pink-500/20 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 p-0.5 shadow-lg shadow-pink-500/30 flex items-center justify-center">
              <span className="text-2xl">🌸</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">Rani Permissions Guide</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-mono">
                  {grantedCount}/{permissions.length} Granted
                </span>
              </div>
              <p className="text-xs text-pink-200/80 mt-0.5">
                "Mujhe aapke phone ka poora dhyan rakhne ke liye ye thode se permissions chahiye 💕"
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-800 h-1.5">
          <div
            className="bg-gradient-to-r from-pink-500 to-purple-500 h-1.5 transition-all duration-500"
            style={{ width: `${(grantedCount / permissions.length) * 100}%` }}
          />
        </div>

        {/* Permissions List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {permissions.map((perm) => (
            <div
              key={perm.id}
              className={`p-3.5 rounded-xl border transition-all ${
                perm.granted
                  ? 'bg-slate-950/80 border-emerald-500/30 shadow-sm'
                  : 'bg-slate-950/40 border-pink-500/15'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700 mt-0.5">
                    {getIcon(perm.icon)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-white">{perm.name}</h4>
                      <code className="text-[10px] text-slate-400 font-mono bg-slate-800 px-1.5 py-0.5 rounded">
                        {perm.androidPermission}
                      </code>
                    </div>
                    {/* Rani's explanation in her sweet voice */}
                    <p className="text-xs text-pink-200/90 mt-1 italic flex items-center gap-1.5">
                      <span>"{perm.raniReason}"</span>
                      <button
                        onClick={() => onPlayReason(perm.raniReason)}
                        className="text-pink-400 hover:text-pink-200 transition-colors"
                        title="Hear Rani explain"
                      >
                        <Volume2 className="w-3.5 h-3.5 inline" />
                      </button>
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{perm.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onTogglePermission(perm.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                      perm.granted
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                        : 'bg-pink-600 hover:bg-pink-500 text-white shadow-md shadow-pink-600/30'
                    }`}
                  >
                    {perm.granted ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Granted</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Allow</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-pink-500/20 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            {allGranted
              ? '✨ All Android permissions granted! Rani has full device control.'
              : `${permissions.length - grantedCount} permissions remaining.`}
          </p>
          <div className="flex items-center gap-3">
            {!allGranted && (
              <button
                onClick={onGrantAll}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-semibold hover:opacity-90 shadow-lg shadow-pink-500/25 transition-all cursor-pointer active:scale-95"
              >
                Grant All Permissions
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
            >
              Done (शुरू करें)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
