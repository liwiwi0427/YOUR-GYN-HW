import React from 'react';
import { HandoverRecord } from '../../types';
import { CLINICAL_TERMS } from '../../data/clinicalTerms';
import { Activity, Clock } from 'lucide-react';
import { ClockButton } from '../ClockButton';
import { SectionClinicalTip } from './SectionClinicalTip';

interface Props {
  record: HandoverRecord;
  onChange: (updater: (prev: HandoverRecord) => HandoverRecord) => void;
}

export const DeliverySection: React.FC<Props> = ({ record, onChange }) => {
  const updateGeneral = (field: keyof HandoverRecord['deliveryProcess'], value: string) => {
    onChange((prev) => ({
      ...prev,
      deliveryProcess: {
        ...prev.deliveryProcess,
        [field]: value,
      },
    }));
  };

  const updateNatural = (field: keyof HandoverRecord['deliveryProcess']['naturalDelivery'], value: string) => {
    onChange((prev) => ({
      ...prev,
      deliveryProcess: {
        ...prev.deliveryProcess,
        naturalDelivery: {
          ...prev.deliveryProcess.naturalDelivery,
          [field]: value,
        },
      },
    }));
  };

  const updateCesarean = (field: keyof HandoverRecord['deliveryProcess']['cesareanDelivery'], value: string) => {
    onChange((prev) => ({
      ...prev,
      deliveryProcess: {
        ...prev.deliveryProcess,
        cesareanDelivery: {
          ...prev.deliveryProcess.cesareanDelivery,
          [field]: value,
        },
      },
    }));
  };

  const isCesarean = record.deliveryProcess.deliveryMode.includes('剖腹') || record.deliveryProcess.deliveryMode.includes('C/S');

  return (
    <section className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs">
      <div className="flex items-center justify-between pb-3 mb-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold text-xs shadow-2xs">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">生產過程</h3>
            <p className="text-[11px] text-slate-500 font-medium">分娩方式、產程進展時間與手術出血量評估</p>
          </div>
        </div>
      </div>

      {/* General Delivery Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs mb-6">
        
        {/* 分娩方式 */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1.5">
            分娩方式 <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { label: '自然產 NSD', code: 'NSD' },
              { label: '剖腹產 C/S', code: 'C/S' },
              { label: '真空吸引 V/D', code: 'V/D' },
              { label: '產鉗分娩 FD', code: 'FD' }
            ].map((item) => {
              const isSelected = record.deliveryProcess.deliveryMode === item.label || 
                (item.code && record.deliveryProcess.deliveryMode.includes(item.code));
              return (
                <button
                  key={item.label}
                  id={`btn-mode-${item.code.toLowerCase().replace('/', '')}`}
                  type="button"
                  onClick={() => updateGeneral('deliveryMode', item.label)}
                  className={`py-2 px-2 rounded-lg text-xs font-bold border transition-all text-center flex items-center justify-center gap-1 ${
                    isSelected
                      ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 胎盤剝離方式 */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1.5">
            胎盤剝離方式
          </label>
          <select
            id="select-placentaExpulsionMode"
            value={record.deliveryProcess.placentaExpulsionMode}
            onChange={(e) => updateGeneral('placentaExpulsionMode', e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-slate-800 bg-white"
          >
            <option value="">-- 請選擇 --</option>
            {CLINICAL_TERMS.placentaModes.map((m, i) => (
              <option key={i} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* 會陰裂傷程度 */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1.5">
            會陰裂傷程度
          </label>
          <select
            id="select-perinealLaceration"
            value={record.deliveryProcess.perinealLaceration}
            onChange={(e) => updateGeneral('perinealLaceration', e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-slate-800 bg-white"
          >
            <option value="">-- 請選擇裂傷等級 --</option>
            {CLINICAL_TERMS.perinealLacerations.map((l, i) => (
              <option key={i} value={l}>{l}</option>
            ))}
          </select>
        </div>

        {/* 娩出時間 */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="font-semibold text-slate-700">
              娩出時間
            </label>
            <ClockButton
              id="btn-clock-delivery-time"
              format="time"
              onInsert={(val) => updateGeneral('deliveryTime', val)}
            />
          </div>
          <input
            id="input-deliveryTime"
            type="text"
            placeholder="例：14:25"
            value={record.deliveryProcess.deliveryTime}
            onChange={(e) => updateGeneral('deliveryTime', e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-slate-800 bg-white"
          />
        </div>

        {/* 失血量 */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1.5">
            失血量
          </label>
          <div className="flex items-center gap-1.5">
            <input
              id="input-bloodLoss"
              type="number"
              min="0"
              step="10"
              inputMode="numeric"
              placeholder="例：250"
              value={record.deliveryProcess.bloodLoss}
              onChange={(e) => updateGeneral('bloodLoss', e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-slate-800 bg-white"
            />
            <span className="text-slate-500 font-medium shrink-0">ml</span>
          </div>
        </div>

        {/* 胎盤重量 */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1.5">
            胎盤重量
          </label>
          <div className="flex items-center gap-1.5">
            <input
              id="input-placentaWeight"
              type="number"
              min="0"
              step="10"
              inputMode="numeric"
              placeholder="例：550"
              value={record.deliveryProcess.placentaWeight}
              onChange={(e) => updateGeneral('placentaWeight', e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-slate-800 bg-white"
            />
            <span className="text-slate-500 font-medium shrink-0">g</span>
          </div>
        </div>

        {/* 會陰／腹部傷口大小 */}
        <div className="sm:col-span-2">
          <label className="block font-semibold text-slate-700 mb-1.5">
            會陰／腹部傷口大小
          </label>
          <div className="flex items-center gap-1.5">
            <input
              id="input-woundSize"
              type="number"
              min="0"
              max="50"
              step="0.1"
              inputMode="decimal"
              placeholder="例：3.5 或 12"
              value={record.deliveryProcess.woundSize}
              onChange={(e) => updateGeneral('woundSize', e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-slate-800 bg-white"
            />
            <span className="text-slate-500 font-medium shrink-0">cm</span>
          </div>
        </div>
      </div>

      {/* Comparison Table: 自然產 vs 剖腹產 */}
      <div className="border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
          
          {/* 自然產 */}
          <div className={`p-4 ${isCesarean ? 'opacity-70 bg-slate-50/50' : 'bg-white'}`}>
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
              <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-600" />
                自然產各產程時間
              </span>
              <span className="text-[11px] text-slate-500 font-medium">產程階段耗時</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between gap-2">
                <label className="font-semibold text-slate-700 w-32 shrink-0">第一產程時間：</label>
                <input
                  id="input-stage1Time"
                  type="text"
                  placeholder="例：7 小時 20 分"
                  value={record.deliveryProcess.naturalDelivery.stage1Time}
                  onChange={(e) => updateNatural('stage1Time', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium bg-white"
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <label className="font-semibold text-slate-700 w-32 shrink-0">第二產程時間：</label>
                <input
                  id="input-stage2Time"
                  type="text"
                  placeholder="例：35 分鐘"
                  value={record.deliveryProcess.naturalDelivery.stage2Time}
                  onChange={(e) => updateNatural('stage2Time', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium bg-white"
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <label className="font-semibold text-slate-700 w-32 shrink-0">第三產程時間：</label>
                <input
                  id="input-stage3Time"
                  type="text"
                  placeholder="例：8 分鐘"
                  value={record.deliveryProcess.naturalDelivery.stage3Time}
                  onChange={(e) => updateNatural('stage3Time', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium bg-white"
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <label className="font-semibold text-slate-700 w-32 shrink-0">第四產程時間：</label>
                <input
                  id="input-stage4Time"
                  type="text"
                  placeholder="例：2 小時"
                  value={record.deliveryProcess.naturalDelivery.stage4Time}
                  onChange={(e) => updateNatural('stage4Time', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium bg-white"
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200">
                <label className="font-bold text-slate-900 w-32 shrink-0">總產程耗費時間：</label>
                <input
                  id="input-totalLaborTime"
                  type="text"
                  placeholder="例：10 小時 03 分"
                  value={record.deliveryProcess.naturalDelivery.totalLaborTime}
                  onChange={(e) => updateNatural('totalLaborTime', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-md border border-blue-300 bg-blue-50/60 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-blue-900"
                />
              </div>
            </div>
          </div>

          {/* 剖腹產 */}
          <div className={`p-4 ${!isCesarean && record.deliveryProcess.deliveryMode ? 'opacity-70 bg-slate-50/50' : 'bg-white'}`}>
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
              <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-slate-700" />
                剖腹產手術時間節點
              </span>
              <span className="text-[11px] text-slate-500 font-medium">時間節點</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 w-32 shrink-0">
                  <label className="font-semibold text-slate-700">進入手術室：</label>
                  <ClockButton
                    id="btn-clock-enter-or"
                    format="time"
                    onInsert={(val) => updateCesarean('enterOrTime', val)}
                  />
                </div>
                <input
                  id="input-enterOrTime"
                  type="text"
                  placeholder="例：08:50"
                  value={record.deliveryProcess.cesareanDelivery.enterOrTime}
                  onChange={(e) => updateCesarean('enterOrTime', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium bg-white"
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 w-32 shrink-0">
                  <label className="font-semibold text-slate-700">麻醉開始：</label>
                  <ClockButton
                    id="btn-clock-anesthesia-start"
                    format="time"
                    onInsert={(val) => updateCesarean('anesthesiaStartTime', val)}
                  />
                </div>
                <input
                  id="input-anesthesiaStartTime"
                  type="text"
                  placeholder="例：09:05"
                  value={record.deliveryProcess.cesareanDelivery.anesthesiaStartTime}
                  onChange={(e) => updateCesarean('anesthesiaStartTime', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium bg-white"
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <label className="font-semibold text-slate-700 w-32 shrink-0">麻醉方式：</label>
                <div className="w-full">
                  <select
                    id="select-anesthesiaMode"
                    value={record.deliveryProcess.cesareanDelivery.anesthesiaMode}
                    onChange={(e) => updateCesarean('anesthesiaMode', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium bg-white"
                  >
                    <option value="">-- 請選擇麻醉方式 --</option>
                    {CLINICAL_TERMS.anesthesiaModes.map((m, i) => (
                      <option key={i} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 w-32 shrink-0">
                  <label className="font-semibold text-slate-700">手術開始：</label>
                  <ClockButton
                    id="btn-clock-surgery-start"
                    format="time"
                    onInsert={(val) => updateCesarean('surgeryStartTime', val)}
                  />
                </div>
                <input
                  id="input-surgeryStartTime"
                  type="text"
                  placeholder="例：09:20"
                  value={record.deliveryProcess.cesareanDelivery.surgeryStartTime}
                  onChange={(e) => updateCesarean('surgeryStartTime', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium bg-white"
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200">
                <div className="flex items-center gap-1 w-32 shrink-0">
                  <label className="font-bold text-slate-900">手術結束：</label>
                  <ClockButton
                    id="btn-clock-surgery-end"
                    format="time"
                    onInsert={(val) => updateCesarean('surgeryEndTime', val)}
                  />
                </div>
                <input
                  id="input-surgeryEndTime"
                  type="text"
                  placeholder="例：10:35"
                  value={record.deliveryProcess.cesareanDelivery.surgeryEndTime}
                  onChange={(e) => updateCesarean('surgeryEndTime', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-md border border-slate-300 bg-slate-100/70 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900"
                />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 臨床小叮嚀 (數位版專屬) */}
      <SectionClinicalTip
        sectionKey="delivery"
        sectionTitle="生產過程"
        record={record}
        onChange={onChange}
        quickTags={['📌 產程耗時異常', '💡 產後立即出血量(PPH)', '⚠️ 胎盤完整性與副胎盤', '🔄 麻醉消退評估']}
      />
    </section>
  );
};
