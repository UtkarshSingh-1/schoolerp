import React from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ message, type, onClose }) => {
    const configs = {
        success: { icon: <CheckCircle size={18} />, bg: 'bg-emerald-500', shadow: 'shadow-emerald-200' },
        error: { icon: <AlertCircle size={18} />, bg: 'bg-red-500', shadow: 'shadow-red-200' },
        info: { icon: <Info size={18} />, bg: 'bg-blue-500', shadow: 'shadow-blue-200' },
    };

    const config = configs[type] || configs.success;

    return (
        <div className={`flex items-center gap-4 px-6 py-4 rounded-2xl text-white shadow-2xl ${config.bg} ${config.shadow} animate-in slide-in-from-right-full duration-300`}>
            {config.icon}
            <span className="font-bold text-sm tracking-wide">{message}</span>
            <button onClick={onClose} className="ml-4 p-1 hover:bg-white/20 rounded-lg transition-all">
                <X size={16} />
            </button>
        </div>
    );
};

export default Toast;
