import React, { useRef, useState, useEffect } from 'react';
import { 
  X, 
  RotateCcw, 
  Check, 
  PenTool, 
  Eraser, 
  Calendar, 
  User, 
  Award, 
  MessageSquare,
  Sparkles,
  Stamp
} from 'lucide-react';
import { generateTeacherStampDataUrl } from '../utils/stampGenerator';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  role: 'student' | 'instructor';
  signerName: string;
  currentSignature?: string;
  currentSignedAt?: string;
  currentComment?: string;
  currentScore?: string;
  onSave: (data: {
    signatureDataUrl: string;
    signedAt: string;
    comment?: string;
    score?: string;
  }) => void;
}

export const SignatureModal: React.FC<Props> = ({
  isOpen,
  onClose,
  title,
  role,
  signerName,
  currentSignature,
  currentSignedAt,
  currentComment,
  currentScore,
  onSave,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [penColor, setPenColor] = useState<'#1e3a8a' | '#0f172a' | '#047857'>('#1e3a8a'); // Dark blue default
  const [penWidth, setPenWidth] = useState<number>(2.5);
  const [comment, setComment] = useState(currentComment || '');
  const [score, setScore] = useState(currentScore || '');
  const [signedDate, setSignedDate] = useState(
    currentSignedAt || new Date().toISOString().replace('T', ' ').substring(0, 16)
  );

  // Sync props when opening
  useEffect(() => {
    if (isOpen) {
      setComment(currentComment || '');
      setScore(currentScore || '');
      setSignedDate(currentSignedAt || new Date().toISOString().replace('T', ' ').substring(0, 16));
      
      // Load current signature image onto canvas if exists
      const timer = setTimeout(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas resolution to match its display width
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * 2;
        canvas.height = rect.height * 2;
        ctx.scale(2, 2);

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, rect.width, rect.height);

        if (currentSignature) {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            ctx.drawImage(img, 0, 0, rect.width, rect.height);
            setHasDrawn(true);
          };
          img.src = currentSignature;
        } else {
          setHasDrawn(false);
        }
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [isOpen, currentSignature, currentSignedAt, currentComment, currentScore]);

  if (!isOpen) return null;

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);
    setHasDrawn(false);
  };

  const handleApplyStamp = () => {
    const stampData = generateTeacherStampDataUrl(signerName || '實習指導教師', signedDate);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, rect.width, rect.height);
      const aspect = img.width / img.height;
      const targetH = Math.min(rect.height * 0.75, 95);
      const targetW = targetH * aspect;
      const posX = (rect.width - targetW) / 2;
      const posY = (rect.height - targetH) / 2;
      ctx.drawImage(img, posX, posY, targetW, targetH);
      setHasDrawn(true);
    };
    img.src = stampData;
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let dataUrl = '';
    if (hasDrawn) {
      dataUrl = canvas.toDataURL('image/png');
    }

    onSave({
      signatureDataUrl: dataUrl,
      signedAt: signedDate,
      comment: role === 'instructor' ? comment : undefined,
      score: role === 'instructor' ? score : undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${
              role === 'student' ? 'bg-blue-600' : 'bg-emerald-700'
            }`}>
              <PenTool className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">{title}</h3>
              <p className="text-xs text-slate-500">
                {role === 'student' ? '實習護生手寫簽名確認' : '實習指導教師評閱簽核與等第評定'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          
          {/* Signer Info Banner */}
          <div className="flex items-center justify-between text-xs bg-slate-100 p-2.5 rounded-lg border border-slate-200">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700">
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span>簽署人：</span>
              <strong className="text-slate-900">{signerName || (role === 'student' ? '實習同學' : '指導教師')}</strong>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <Calendar className="w-3.5 h-3.5" />
              <span>時間：{signedDate}</span>
            </div>
          </div>

          {/* Drawing Canvas Area */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-700">請在下方虛線框內手寫簽名 (觸控 / 滑鼠)：</span>
              
              {/* Color Selector & Quick Stamp */}
              <div className="flex items-center gap-2">
                {role === 'instructor' && (
                  <button
                    type="button"
                    onClick={handleApplyStamp}
                    className="flex items-center gap-1 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-bold transition-all"
                    title="套用指導教師紅色標楷體核定章"
                  >
                    <Stamp className="w-3.5 h-3.5 text-rose-600" />
                    <span>一鍵蓋標楷體紅章</span>
                  </button>
                )}
                
                <div className="flex items-center gap-1.5 pl-1 border-l border-slate-200">
                  <span className="text-[11px] text-slate-400">筆觸：</span>
                  <button
                    type="button"
                    onClick={() => setPenColor('#1e3a8a')}
                    className={`w-4 h-4 rounded-full border transition-all ${
                      penColor === '#1e3a8a' ? 'ring-2 ring-blue-500 scale-110' : 'opacity-70'
                    }`}
                    style={{ backgroundColor: '#1e3a8a' }}
                    title="專業深藍"
                  />
                  <button
                    type="button"
                    onClick={() => setPenColor('#0f172a')}
                    className={`w-4 h-4 rounded-full border transition-all ${
                      penColor === '#0f172a' ? 'ring-2 ring-slate-800 scale-110' : 'opacity-70'
                    }`}
                    style={{ backgroundColor: '#0f172a' }}
                    title="標準黑色"
                  />
                  <button
                    type="button"
                    onClick={() => setPenColor('#047857')}
                    className={`w-4 h-4 rounded-full border transition-all ${
                      penColor === '#047857' ? 'ring-2 ring-emerald-600 scale-110' : 'opacity-70'
                    }`}
                    style={{ backgroundColor: '#047857' }}
                    title="墨綠色"
                  />
                </div>
              </div>
            </div>

            <div className="relative border-2 border-dashed border-slate-300 rounded-xl overflow-hidden bg-white shadow-inner">
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-36 sm:h-44 touch-none cursor-crosshair block"
              />
              {!hasDrawn && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-300 text-sm font-medium">
                  在此手寫簽名
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-2">
              <span className="text-[11px] text-slate-400">支援 iPad 觸控筆、手機手指與電腦滑鼠流暢手繪</span>
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-semibold px-2 py-1 rounded hover:bg-rose-50 transition-colors"
              >
                <Eraser className="w-3.5 h-3.5" />
                <span>清除重簽</span>
              </button>
            </div>
          </div>

          {/* Instructor Specific Evaluation Fields */}
          {role === 'instructor' && (
            <div className="pt-3 border-t border-slate-200 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    <span>實習評核等第 / 成績：</span>
                  </label>
                  <input
                    type="text"
                    placeholder="例：96分、A+、通過、優等"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    簽核時間：
                  </label>
                  <input
                    type="text"
                    value={signedDate}
                    onChange={(e) => setSignedDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1 text-xs">
                  <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                  <span>實習指導教師評語與指導建議：</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="例：交班條理分明、DART重點掌握精確、產婦會陰傷口及子宮復舊衛教完整到位，表現優良！"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-medium text-slate-800 resize-y"
                />
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSave}
            className={`flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-bold text-white shadow-xs transition-all ${
              role === 'student'
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>儲存並套用簽章</span>
          </button>
        </div>

      </div>
    </div>
  );
};
