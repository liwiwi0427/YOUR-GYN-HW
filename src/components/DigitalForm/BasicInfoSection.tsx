import React from 'react';
import { HandoverRecord } from '../../types';
import { User, Activity, AlertCircle } from 'lucide-react';
import { ClockButton } from '../ClockButton';
import { SectionClinicalTip } from './SectionClinicalTip';

interface Props {
  record: HandoverRecord;
  onChange: (updater: (prev: HandoverRecord) => HandoverRecord) => void;
}

export const BasicInfoSection: React.FC<Props> = ({ record, onChange }) => {
  const updateField = (field: keyof HandoverRecord['basicInfo'], value: any) => {
    onChange((prev) => ({
      ...prev,
      basicInfo: {
        ...prev.basicInfo,
        [field]: value,
      },
    }));
  };

  const secondaryList = record.basicInfo.secondaryDiagnoses && Array.isArray(record.basicInfo.secondaryDiagnoses)
    ? [...record.basicInfo.secondaryDiagnoses, '', '', '', '', ''].slice(0, 5)
    : ['', '', '', '', ''];

  const updateSecondaryDiagnosis = (index: number, value: string) => {
    const updated = [...secondaryList];
    updated[index] = value;
    onChange((prev) => ({
      ...prev,
      basicInfo: {
        ...prev.basicInfo,
        secondaryDiagnoses: updated,
      },
    }));
  };

  return (
    <section className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs">
      <div className="flex items-center justify-between pb-3 mb-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold text-xs shadow-2xs">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">基本資料</h3>
            <p className="text-[11px] text-slate-500 font-medium">產婦基本辨識資料、主治醫療團隊與診斷明細</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        {/* 床號 */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1.5">
            床號 <span className="text-rose-500">*</span>
          </label>
          <input
            id="input-bedNumber"
            type="text"
            placeholder="例：502-1"
            value={record.basicInfo.bedNumber}
            onChange={(e) => updateField('bedNumber', e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-slate-800 bg-white"
          />
        </div>

        {/* 姓名 */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1.5">
            姓名 <span className="text-rose-500">*</span>
          </label>
          <input
            id="input-patientName"
            type="text"
            placeholder="例：王○婷"
            value={record.basicInfo.patientName}
            onChange={(e) => updateField('patientName', e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-slate-800 bg-white"
          />
        </div>

        {/* 入院日期 */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="font-semibold text-slate-700">
              入院日期
            </label>
            <ClockButton
              id="btn-clock-admission-date"
              format="datetime"
              onInsert={(val) => updateField('admissionDate', val)}
            />
          </div>
          <input
            id="input-admissionDate"
            type="text"
            placeholder="YYYY-MM-DD HH:mm"
            value={record.basicInfo.admissionDate}
            onChange={(e) => updateField('admissionDate', e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-slate-800 bg-white"
          />
        </div>

        {/* 預產日 */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="font-semibold text-slate-700">
              預產日 EDC
            </label>
            <ClockButton
              id="btn-clock-edc-date"
              format="date"
              onInsert={(val) => updateField('expectedDeliveryDate', val)}
            />
          </div>
          <input
            id="input-expectedDeliveryDate"
            type="text"
            placeholder="YYYY-MM-DD"
            value={record.basicInfo.expectedDeliveryDate}
            onChange={(e) => updateField('expectedDeliveryDate', e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-slate-800 bg-white"
          />
        </div>

        {/* 中英文診斷 (1 主診斷 + 5 次診斷) */}
        <div className="sm:col-span-2 md:col-span-4 bg-slate-50/70 border border-slate-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <label className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-blue-600" />
              中英文診斷架構：1 項主診斷 + 5 項次診斷 <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] text-slate-500 font-medium">請依產科常規填寫標準中英文診斷與次要診斷</span>
          </div>

          {/* 主診斷 */}
          <div>
            <label className="block font-bold text-blue-900 mb-1 text-xs">
              ★ 主診斷 <span className="text-rose-500">*</span>
            </label>
            <input
              id="input-primaryDiagnosis"
              type="text"
              placeholder="例：G1P1, Term Pregnancy with Normal Spontaneous Delivery (NSD, 妊娠39+3週自然產)"
              value={record.basicInfo.primaryDiagnosis || record.basicInfo.diagnosis || ''}
              onChange={(e) => updateField('primaryDiagnosis', e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-blue-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-slate-900 shadow-2xs"
            />
          </div>

          {/* 5 個次診斷 */}
          <div className="pt-2 border-t border-slate-200 space-y-2">
            <div className="text-[11px] font-bold text-slate-700">次診斷 1 ~ 5：</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {secondaryList.map((secDiag, idx) => (
                <div key={idx} className={idx === 4 ? 'md:col-span-2' : ''}>
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-md bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      id={`input-secondaryDiagnosis-${idx + 1}`}
                      type="text"
                      placeholder={`次診斷 ${idx + 1}`}
                      value={secDiag}
                      onChange={(e) => updateSecondaryDiagnosis(idx, e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-800 text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 生產日 */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="font-semibold text-slate-700">
              生產日
            </label>
            <ClockButton
              id="btn-clock-delivery-date"
              format="datetime"
              onInsert={(val) => updateField('deliveryDate', val)}
            />
          </div>
          <input
            id="input-deliveryDate"
            type="text"
            placeholder="YYYY-MM-DD HH:mm"
            value={record.basicInfo.deliveryDate}
            onChange={(e) => updateField('deliveryDate', e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-slate-800 bg-white"
          />
        </div>

        {/* 懷孕週數 */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1.5">
            懷孕週數 GA
          </label>
          <input
            id="input-gestationalWeeks"
            type="text"
            placeholder="例：39+3 週"
            value={record.basicInfo.gestationalWeeks}
            onChange={(e) => updateField('gestationalWeeks', e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-slate-800 bg-white"
          />
        </div>

        {/* 生產史 */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1.5">
            孕產史 G/P
          </label>
          <input
            id="input-obstetricHistory"
            type="text"
            placeholder="例：G1P1 AA0 SA0"
            value={record.basicInfo.obstetricHistory}
            onChange={(e) => updateField('obstetricHistory', e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-slate-800 bg-white"
          />
        </div>

        {/* 婚姻狀況 */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1.5">
            婚姻狀況
          </label>
          <select
            id="select-maritalStatus"
            value={record.basicInfo.maritalStatus}
            onChange={(e) => updateField('maritalStatus', e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-slate-800 bg-white"
          >
            <option value="">-- 請選擇 --</option>
            <option value="已婚">已婚</option>
            <option value="未婚">未婚</option>
            <option value="離異">離異</option>
            <option value="其他">其他</option>
          </select>
        </div>

        {/* 慢性病史 */}
        <div className="sm:col-span-2">
          <label className="block font-semibold text-slate-700 mb-1.5">
            慢性病史與過敏史
          </label>
          <input
            id="input-chronicDiseases"
            type="text"
            placeholder="例：無慢性病史，無過敏史 / 妊娠糖尿病 GDM"
            value={record.basicInfo.chronicDiseases}
            onChange={(e) => updateField('chronicDiseases', e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-slate-800 bg-white"
          />
        </div>

        {/* 主治醫師 */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1.5">
            主治醫師
          </label>
          <input
            id="input-attendingPhysician"
            type="text"
            placeholder="例：張建銘 醫師"
            value={record.basicInfo.attendingPhysician}
            onChange={(e) => updateField('attendingPhysician', e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-slate-800 bg-white"
          />
        </div>

        {/* 主護 */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1.5">
            主護護理師
          </label>
          <input
            id="input-primaryNurse"
            type="text"
            placeholder="例：李佩珊 護理師"
            value={record.basicInfo.primaryNurse}
            onChange={(e) => updateField('primaryNurse', e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-slate-800 bg-white"
          />
        </div>

        {/* 入院經過 (Full Width) */}
        <div className="sm:col-span-2 md:col-span-4">
          <label className="block font-semibold text-slate-700 mb-1.5">
            入院經過
          </label>
          <textarea
            id="textarea-admissionCourse"
            rows={3}
            placeholder="描述產婦入院主訴、落紅/破水/規律陣痛經過、待產與轉入病房狀況..."
            value={record.basicInfo.admissionCourse}
            onChange={(e) => updateField('admissionCourse', e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-slate-800 resize-y bg-white"
          />
        </div>
      </div>

      {/* 臨床小叮嚀 (數位版專屬) */}
      <SectionClinicalTip
        sectionKey="basicInfo"
        sectionTitle="基本資料"
        record={record}
        onChange={onChange}
        quickTags={['📌 高危險妊娠因子', '💡 主訴與用藥注意', '⚠️ 過敏與特殊疾病', '🔄 產科 G/P 史追蹤']}
      />
    </section>
  );
};
