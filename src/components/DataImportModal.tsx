import React, { useState, useEffect } from 'react';
import { parseCSVData } from '../data/plantData';
import { ObservationRecord } from '../types/plant';
import { X, Upload, CheckCircle, RotateCcw, AlertCircle, HelpCircle, ShieldCheck, Folder, Link2, RefreshCw, Sparkles } from 'lucide-react';

interface DataImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportData: (newRecords: ObservationRecord[]) => void;
  onResetDefault: () => void;
}

export const DataImportModal: React.FC<DataImportModalProps> = ({
  isOpen,
  onClose,
  onImportData,
  onResetDefault,
}) => {
  const [sheetUrl, setSheetUrl] = useState(() => localStorage.getItem('saved_sheet_url') || '');
  const [csvInput, setCsvInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successCount, setSuccessCount] = useState<number | null>(null);
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [showPermissionGuide, setShowPermissionGuide] = useState(false);
  const [activeMode, setActiveMode] = useState<'url' | 'paste'>('url');

  if (!isOpen) return null;

  const handleFetchFromUrl = async () => {
    setErrorMsg('');
    setSuccessCount(null);
    const trimmed = sheetUrl.trim();
    if (!trimmed) {
      setErrorMsg('구글 스프레드시트 URL(웹 게시 링크 또는 공유 링크)을 입력해주세요.');
      return;
    }

    try {
      setIsLoadingUrl(true);
      // Format Google Spreadsheet URL to CSV export format if standard sheet link
      let fetchUrl = trimmed;
      if (fetchUrl.includes('docs.google.com/spreadsheets') && !fetchUrl.includes('export?format=csv') && !fetchUrl.includes('/pub?output=csv')) {
        const idMatch = fetchUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
        if (idMatch && idMatch[1]) {
          fetchUrl = `https://docs.google.com/spreadsheets/d/${idMatch[1]}/export?format=csv`;
        }
      }

      const res = await fetch(fetchUrl);
      if (!res.ok) {
        throw new Error(`시트 응답 오류 (HTTP ${res.status}). 시트가 [웹에 게시] 또는 [링크가 있는 모든 사용자에게 공개]되어 있는지 확인해주세요.`);
      }

      const csvText = await res.text();
      const parsed = parseCSVData(csvText);

      if (parsed.length === 0) {
        throw new Error('시트에서 유효한 관찰 데이터를 찾지 못했습니다. 헤더 열 순서를 확인해주세요.');
      }

      // Save for automatic sync on startup
      localStorage.setItem('saved_sheet_url', trimmed);
      localStorage.setItem('cached_plant_records', JSON.stringify(parsed));
      setSuccessCount(parsed.length);

      setTimeout(() => {
        onImportData(parsed);
        setIsLoadingUrl(false);
        onClose();
      }, 700);
    } catch (err: any) {
      setIsLoadingUrl(false);
      setErrorMsg(`시트 자동 연동 실패: ${err.message}. 링크가 웹에 게시되었는지 확인하거나 아래 [직접 복사하여 붙여넣기] 탭을 이용하세요.`);
    }
  };

  const handleParseAndImport = () => {
    setErrorMsg('');
    setSuccessCount(null);
    if (!csvInput.trim()) {
      setErrorMsg('구글 스프레드시트에서 복사한 데이터를 입력해주세요.');
      return;
    }

    try {
      // If user copied tab-separated data from Google sheets, convert tabs to commas
      let formattedText = csvInput;
      if (formattedText.includes('\t') && !formattedText.includes(',')) {
        formattedText = formattedText.split('\n').map(line => {
          return line.split('\t').map(cell => `"${cell.replace(/"/g, '""')}"`).join(',');
        }).join('\n');
      }

      // If user forgot header, check if first line looks like header
      if (!formattedText.includes('타임스탬프') && !formattedText.includes('학번')) {
        const dummyHeader = '타임스탬프,학번/이름,나의 식물 ID/위치,측정 일자,식물 키/ 초장,잎의 개수(개),대표 잎의 폭/너비(cm),식물 건강 상태,오늘의 관찰 일지 & 특이사항,오늘의 식물 사진 업로드\n';
        formattedText = dummyHeader + formattedText;
      }

      const parsed = parseCSVData(formattedText);
      if (parsed.length === 0) {
        setErrorMsg('유효한 측정 데이터를 파싱하지 못했습니다. 열 순서(타임스탬프, 학번, 식물ID, 측정일자, 키, 잎수, 잎폭, 건강상태, 일지, 사진)를 확인해주세요.');
        return;
      }

      localStorage.setItem('cached_plant_records', JSON.stringify(parsed));
      setSuccessCount(parsed.length);
      setTimeout(() => {
        onImportData(parsed);
        onClose();
      }, 700);
    } catch (e: any) {
      setErrorMsg(`데이터 파싱 중 오류가 발생했습니다: ${e.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-[#f8f9fd]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-xs">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900">
                  구글 스프레드시트 데이터 연동
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  자동 연동 지원
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                URL을 등록해두면 접속 시마다 1회 자동으로 최신 시트 데이터를 동기화합니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-2xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {/* Mode Switcher */}
          <div className="flex rounded-2xl bg-[#f4f5fa] p-1 border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveMode('url')}
              className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeMode === 'url' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>구글 시트 URL 자동 연동 (추천)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('paste')}
              className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeMode === 'paste' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>시트 내용 직접 복사 · 붙여넣기</span>
            </button>
          </div>

          {/* Permission Quick Guide Accordion */}
          <div className="p-4 rounded-2xl bg-[#eaf4fe] border border-[#cde4fb] text-xs text-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-black text-sky-950">
                <ShieldCheck className="w-4 h-4 text-sky-700" />
                <span>📸 구글 시트 사진이 대시보드에 바로 보이게 하는 권한 설정법</span>
              </div>
              <button
                type="button"
                onClick={() => setShowPermissionGuide(!showPermissionGuide)}
                className="text-[11px] font-bold text-sky-700 underline cursor-pointer"
              >
                {showPermissionGuide ? '접기' : '자세히 보기'}
              </button>
            </div>

            {showPermissionGuide && (
              <div className="pt-2 border-t border-sky-200/80 space-y-2 text-[11px] text-slate-600 leading-relaxed bg-white/80 p-3 rounded-xl mt-2">
                <p>
                  <strong>1단계 (드라이브 폴더 찾기):</strong> 구글 설문지로 업로드된 학생 사진은 구글 드라이브 내 <code>[설문지명] (File responses)</code> 폴더에 자동 저장됩니다.
                </p>
                <p>
                  <strong>2단계 (공유 설정):</strong> 해당 사진 폴더 우클릭 → <strong>[공유]</strong> 클릭 → 일반 액세스를 <strong>'링크가 있는 모든 사용자 (뷰어)'</strong>로 변경합니다.
                </p>
                <p>
                  <strong>3단계 (결과):</strong> 폴더 내 모든 학생 사진에 공개 뷰어 권한이 부여되어, 대시보드에서 로그인 없이도 학생들의 식물 사진이 고화질로 즉시 표시됩니다.
                </p>
              </div>
            )}
          </div>

          {activeMode === 'url' ? (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-[#f0fdf4] border border-[#dcfce7] text-xs text-emerald-950 leading-relaxed">
                <strong className="text-emerald-900 block mb-1 font-black">
                  🔗 구글 시트 URL 자동 연동 안내:
                </strong>
                구글 스프레드시트의 <strong>[파일] → [공유] → [웹에 게시]</strong>(CSV 형식) 또는 시트 공유 링크를 등록해두시면, 앱에 접속할 때마다 '시트 동기화' 버튼을 누르지 않아도 자동으로 1회 연동되어 최신 일지가 반영됩니다.
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  구글 스프레드시트 웹 게시 URL 또는 공유 링크
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://docs.google.com/spreadsheets/d/.../export?format=csv 또는 공유 링크"
                    value={sheetUrl}
                    onChange={(e) => setSheetUrl(e.target.value)}
                    className="flex-1 bg-[#f8f9fd] border border-slate-200 rounded-2xl px-4 py-3 text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                  <button
                    type="button"
                    disabled={isLoadingUrl}
                    onClick={handleFetchFromUrl}
                    className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-black text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    {isLoadingUrl ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>동기화 중...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>지금 시트 연동</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-xs text-slate-600 bg-[#f8f9fd] p-3.5 rounded-2xl border border-slate-200 leading-relaxed">
                <strong className="text-emerald-700 block mb-1">📋 간편 복사 & 붙여넣기:</strong>
                구글 시트에서 행들을 복사(<kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[11px] shadow-xs">Ctrl+C</kbd>)한 뒤 아래 창에 붙여넣기(<kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[11px] shadow-xs">Ctrl+V</kbd>)하세요.
                학생 이름은 자동으로 안전하게 제거되어 <strong>학번</strong>만 등록됩니다.
              </div>

              <textarea
                rows={7}
                placeholder={`2026. 9. 14 오전 12:27:30\t1118 최인찬\tA-01 아글라오네마(흰)(인찬)\t2026. 9. 14\t24.2\t6\t7.2\t4점 - 🙂 양호...\thttps://drive.google.com/open?id=...`}
                value={csvInput}
                onChange={(e) => setCsvInput(e.target.value)}
                className="w-full bg-[#f8f9fd] border border-slate-200 rounded-2xl p-3.5 text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
              />

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleParseAndImport}
                  className="px-5 py-2.5 text-xs font-black rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>붙여넣은 데이터 반영하기</span>
                </button>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successCount !== null && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>총 {successCount}건의 데이터가 성공적으로 동기화되었습니다! 대시보드를 갱신합니다.</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-[#f8f9fd]">
          <button
            onClick={() => {
              localStorage.removeItem('cached_plant_records');
              localStorage.removeItem('saved_sheet_url');
              setSheetUrl('');
              onResetDefault();
              onClose();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-2xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>기본 데이터로 초기화</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold rounded-2xl text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
