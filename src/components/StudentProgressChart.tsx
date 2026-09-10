import React, { useState, useMemo } from 'react';
import { HandoverRecord } from '../types';
import { calculateCompletionStats } from '../utils/completionTracker';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ReferenceLine, 
  Cell 
} from 'recharts';
import { 
  BarChart3, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowUpDown, 
  TrendingUp, 
  Users, 
  Sparkles,
  Info,
  Clock
} from 'lucide-react';

interface Props {
  records: HandoverRecord[];
  onSelectRecord: (id: string) => void;
  selectedRecordId?: string;
}

export const StudentProgressChart: React.FC<Props> = ({
  records,
  onSelectRecord,
  selectedRecordId,
}) => {
  const [sortBy, setSortBy] = useState<'lagging_first' | 'highest_first' | 'default'>('lagging_first');

  // Compute chart data items
  const chartData = useMemo(() => {
    const data = records.map((r, index) => {
      const stats = calculateCompletionStats(r);
      const studentName = r.internship?.studentName || `護生 ${index + 1}`;
      const studentId = r.internship?.studentId || '';
      const week = r.internship?.week || '1';
      const isGraded = Boolean(r.signatures?.instructorSignature || r.signatures?.score);
      const studentSigned = Boolean(r.signatures?.studentSignature);

      return {
        id: r.id,
        rawName: studentName,
        displayName: `${studentName} (W${week})`,
        studentId,
        week,
        percentage: stats.totalPercentage,
        filledCount: stats.totalFilled,
        totalFields: stats.totalFields,
        isGraded,
        studentSigned,
        score: r.signatures?.score || '',
        isLagging: stats.totalPercentage < 60,
      };
    });

    if (sortBy === 'lagging_first') {
      return [...data].sort((a, b) => a.percentage - b.percentage);
    } else if (sortBy === 'highest_first') {
      return [...data].sort((a, b) => b.percentage - a.percentage);
    }
    return data;
  }, [records, sortBy]);

  // Statistics
  const laggingStudents = useMemo(() => {
    return chartData.filter((d) => d.percentage < 60);
  }, [chartData]);

  const averageCompletion = useMemo(() => {
    if (chartData.length === 0) return 0;
    const sum = chartData.reduce((acc, curr) => acc + curr.percentage, 0);
    return Math.round(sum / chartData.length);
  }, [chartData]);

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-slate-900/95 text-white p-3 rounded-xl shadow-xl text-xs border border-slate-700 min-w-[200px] space-y-1.5 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-100">
          <div className="flex items-center justify-between border-b border-slate-700 pb-1.5 font-bold">
            <span className="text-emerald-400 text-sm">{item.rawName}</span>
            <span className="text-[11px] text-slate-300 font-mono">第 {item.week} 週</span>
          </div>

          <div className="grid grid-cols-2 gap-1 text-[11px] pt-0.5">
            <span className="text-slate-400">完成進度：</span>
            <strong className={`font-mono ${item.percentage < 60 ? 'text-rose-400' : 'text-emerald-300'}`}>
              {item.percentage}% ({item.filledCount}/{item.totalFields}項)
            </strong>

            <span className="text-slate-400">學號：</span>
            <span className="text-slate-200 font-mono">{item.studentId || '未填'}</span>

            <span className="text-slate-400">學生簽章：</span>
            <span className={item.studentSigned ? 'text-emerald-400 font-medium' : 'text-amber-400 font-medium'}>
              {item.studentSigned ? '✓ 已簽名' : '⏳ 待簽章'}
            </span>

            <span className="text-slate-400">教師評分：</span>
            <span className="text-amber-300 font-bold">{item.score || (item.isGraded ? '已核章' : '待評閱')}</span>
          </div>

          <div className="text-[10px] text-emerald-300 pt-1 text-center font-medium border-t border-slate-800">
            👉 點擊長條圖直接開啟此份作業批閱
          </div>
        </div>
      );
    }
    return null;
  };

  if (records.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
      {/* Header & Quick stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
              全班實習作業完成進度分佈圖 (Student Progress Distribution)
              <span className="text-[10px] font-normal text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                視覺化落後預警
              </span>
            </h4>
            <p className="text-[11px] text-slate-500">
              全班平均完成度 <strong className="text-emerald-700 font-mono">{averageCompletion}%</strong>，共 {chartData.length} 份作業
            </p>
          </div>
        </div>

        {/* Sort and Filters */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setSortBy('lagging_first')}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition-all flex items-center gap-1 ${
                sortBy === 'lagging_first'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="優先排序列出完成度落後之同學"
            >
              <AlertTriangle className="w-3 h-3" />
              <span>落後優先</span>
            </button>

            <button
              type="button"
              onClick={() => setSortBy('highest_first')}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition-all ${
                sortBy === 'highest_first'
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              進度最高
            </button>

            <button
              type="button"
              onClick={() => setSortBy('default')}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition-all ${
                sortBy === 'default'
                  ? 'bg-slate-700 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              預設順序
            </button>
          </div>
        </div>
      </div>

      {/* Lagging students warning banner */}
      {laggingStudents.length > 0 ? (
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-2.5 flex items-start justify-between gap-2 text-xs">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-rose-900">
                🚨 注意：發現 {laggingStudents.length} 位同學目前作業完成度低於 60%：
              </span>
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                {laggingStudents.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => onSelectRecord(s.id)}
                    className="inline-flex items-center gap-1 bg-white hover:bg-rose-100 border border-rose-300 text-rose-800 px-2 py-0.5 rounded text-[11px] font-bold transition-colors shadow-2xs"
                  >
                    <span>{s.rawName} (W{s.week}): {s.percentage}%</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2 flex items-center gap-2 text-xs text-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>全班同學目前填寫進度皆達到 60% 以上合格進度指標！</span>
        </div>
      )}

      {/* Bar Chart Container */}
      <div className="w-full h-56 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
            onClick={(data: any) => {
              if (data && data.activePayload && data.activePayload.length) {
                const item = data.activePayload[0].payload;
                onSelectRecord(item.id);
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            
            <XAxis 
              dataKey="displayName" 
              tick={{ fontSize: 10, fill: '#64748b' }}
              interval={0}
              angle={-20}
              textAnchor="end"
            />
            
            <YAxis 
              domain={[0, 100]} 
              ticks={[0, 25, 50, 60, 75, 100]}
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              unit="%"
            />

            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />

            {/* Benchmark 60% threshold line */}
            <ReferenceLine 
              y={60} 
              stroke="#f43f5e" 
              strokeDasharray="4 4" 
              label={{ 
                value: '60% 門檻', 
                fill: '#e11d48', 
                fontSize: 10, 
                position: 'insideTopRight' 
              }} 
            />

            {/* Benchmark 80% excellence line */}
            <ReferenceLine 
              y={80} 
              stroke="#10b981" 
              strokeDasharray="4 4" 
              label={{ 
                value: '80% 完稿標準', 
                fill: '#059669', 
                fontSize: 10, 
                position: 'insideTopRight' 
              }} 
            />

            <Bar 
              dataKey="percentage" 
              radius={[6, 6, 0, 0]}
              maxBarSize={36}
              className="cursor-pointer"
            >
              {chartData.map((entry) => {
                const isSelected = entry.id === selectedRecordId;
                let barColor = '#10b981'; // Green for >= 80%
                if (entry.percentage < 60) {
                  barColor = '#f43f5e'; // Rose/Red for < 60%
                } else if (entry.percentage < 80) {
                  barColor = '#3b82f6'; // Blue for 60-79%
                }

                return (
                  <Cell 
                    key={`cell-${entry.id}`} 
                    fill={barColor}
                    stroke={isSelected ? '#0f172a' : undefined}
                    strokeWidth={isSelected ? 2 : 0}
                    opacity={isSelected ? 1 : 0.88}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend & Hint */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 pt-1 border-t border-slate-100">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block" />
            <span>&lt; 60% 進度落後</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block" />
            <span>60% ~ 79% 正常進度</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
            <span>&ge; 80% 完稿標準</span>
          </span>
        </div>
        <span className="text-slate-400">💡 提示：點擊任一長條柱可立即鎖定並開啟該學生之作業</span>
      </div>
    </div>
  );
};
