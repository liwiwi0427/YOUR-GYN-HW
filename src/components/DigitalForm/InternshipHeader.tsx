import React from 'react';
import { HandoverRecord } from '../../types';
import { School, User, Calendar, Award } from 'lucide-react';
import { ClockButton } from '../ClockButton';

interface Props {
  record: HandoverRecord;
  onChange: (updater: (prev: HandoverRecord) => HandoverRecord) => void;
}

export const InternshipHeader: React.FC<Props> = ({ record, onChange }) => {
  const updateInternship = (field: keyof HandoverRecord['internship'], value: string) => {
    onChange((prev) => ({
      ...prev,
      internship: {
        ...prev.internship,
        [field]: value,
      },
    }));
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs">
      <div className="text-center pb-4 mb-4 border-b border-slate-100">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-blue-50 text-blue-800 border border-blue-200 text-xs font-semibold mb-1.5">
          <School className="w-3.5 h-3.5 text-blue-600" />
          新生學校財團法人新生醫護管理專科學校
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
          五專產科護理學實習個案交班過程記錄
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 mb-1.5">
            實習單位
          </label>
          <input
            id="input-internship-unit"
            type="text"
            placeholder="例：5B 婦產科病房"
            value={record.internship.unit}
            onChange={(e) => updateInternship('unit', e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-slate-800 bg-white"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1.5">
            學生姓名
          </label>
          <input
            id="input-internship-studentName"
            type="text"
            placeholder="例：陳美玲"
            value={record.internship.studentName}
            onChange={(e) => updateInternship('studentName', e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-slate-800 bg-white"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1.5">
            學號
          </label>
          <input
            id="input-internship-studentId"
            type="text"
            placeholder="例：N1100342"
            value={record.internship.studentId}
            onChange={(e) => updateInternship('studentId', e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-slate-800 bg-white"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1.5">
            實習指導教師
          </label>
          <input
            id="input-internship-instructor"
            type="text"
            placeholder="例：林素真 老師"
            value={record.internship.instructor}
            onChange={(e) => updateInternship('instructor', e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-slate-800 bg-white"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="font-semibold text-slate-700">
              交班日期
            </label>
            <ClockButton
              id="btn-clock-internship-date"
              format="date"
              onInsert={(val) => updateInternship('date', val)}
            />
          </div>
          <input
            id="input-internship-date"
            type="date"
            value={record.internship.date}
            onChange={(e) => updateInternship('date', e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-slate-800 bg-white"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1.5">
            實習週次
          </label>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">第</span>
            <input
              id="input-internship-week"
              type="text"
              placeholder="2"
              value={record.internship.week}
              onChange={(e) => updateInternship('week', e.target.value)}
              className="w-16 text-center px-2 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-slate-800 bg-white"
            />
            <span className="text-slate-500 font-medium">週</span>
          </div>
        </div>
      </div>
    </div>
  );
};
