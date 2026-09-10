import React, { useState } from 'react';
import { Clock, Check } from 'lucide-react';
import {
  getNowDateTimeLocal,
  getNowDateTimeString,
  getNowDateString,
  getNowTimeString,
} from '../utils/timeService';

export type TimeFormatType = 'datetime' | 'datetime-local' | 'date' | 'time';

interface ClockButtonProps {
  onInsert: (value: string) => void;
  format?: TimeFormatType;
  className?: string;
  title?: string;
  id?: string;
  size?: 'sm' | 'xs';
}

export const ClockButton: React.FC<ClockButtonProps> = ({
  onInsert,
  format = 'datetime',
  className = '',
  title = '插入當前時間',
  id,
  size = 'xs',
}) => {
  const [copied, setCopied] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    let val = '';
    switch (format) {
      case 'datetime-local':
        val = getNowDateTimeLocal();
        break;
      case 'date':
        val = getNowDateString();
        break;
      case 'time':
        val = getNowTimeString();
        break;
      case 'datetime':
      default:
        val = getNowDateTimeString();
        break;
    }

    onInsert(val);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1500);
  };

  const isSmall = size === 'xs';

  return (
    <button
      id={id}
      type="button"
      onClick={handleClick}
      title={title}
      className={`inline-flex items-center gap-1 ${
        isSmall ? 'px-2 py-1 text-[11px]' : 'px-2.5 py-1.5 text-xs'
      } rounded-md border font-semibold transition-all shrink-0 select-none ${
        copied
          ? 'bg-emerald-50 border-emerald-400 text-emerald-700 shadow-2xs'
          : 'bg-white hover:bg-blue-50 text-slate-600 hover:text-blue-700 border-slate-300 hover:border-blue-300 shadow-2xs active:scale-95'
      } ${className}`}
    >
      {copied ? (
        <>
          <Check className={`${isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-emerald-600 animate-in zoom-in`} />
          <span className="text-[10px] text-emerald-700 font-bold">已填入</span>
        </>
      ) : (
        <>
          <Clock className={`${isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-blue-600`} />
          <span>填入當前時間</span>
        </>
      )}
    </button>
  );
};
