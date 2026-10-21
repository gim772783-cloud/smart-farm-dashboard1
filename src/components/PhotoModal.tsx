import React, { useState } from 'react';
import { ObservationRecord } from '../types/plant';
import { getDriveImageSrc, getDriveViewerLink } from '../utils/imageHelper';
import { X, ExternalLink, Calendar, User, Ruler, Sparkles, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

interface PhotoModalProps {
  record: ObservationRecord | null;
  recordsList?: ObservationRecord[];
  onClose: () => void;
  onSelectRecord?: (record: ObservationRecord) => void;
}

export const PhotoModal: React.FC<PhotoModalProps> = ({
  record,
  recordsList = [],
  onClose,
  onSelectRecord,
}) => {
  const [imgError, setImgError] = useState(false);

  if (!record) return null;

  const currentIndex = recordsList.findIndex(r => r.id === record.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < recordsList.length - 1;

  const handlePrev = () => {
    if (hasPrev && onSelectRecord) {
      setImgError(false);
      onSelectRecord(recordsList[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (hasNext && onSelectRecord) {
      setImgError(false);
      onSelectRecord(recordsList[currentIndex + 1]);
    }
  };

  const driveViewUrl = getDriveViewerLink(record.photoUrl);
  const driveImgSrc = getDriveImageSrc(record.photoUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl max-h-[92vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-800 border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-[#f8f9fd]">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-800 font-black text-sm">
              {record.location}
            </span>
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                {record.plantDisplayName}
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-200/70 text-slate-700 font-bold">
                  위치 {record.location}구역
                </span>
              </h3>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  측정일: <strong className="text-slate-800">{record.date}</strong>
                </span>
                <span className="flex items-center gap-1 font-mono font-bold text-amber-700">
                  <User className="w-3.5 h-3.5" />
                  관찰자 학번: {record.studentId}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={driveViewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Google Drive 원본 열기"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">구글 드라이브 원본</span>
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 min-h-0">
          {/* Photo Preview Container */}
          <div className="lg:col-span-7 bg-slate-950 flex flex-col items-center justify-center p-4 relative min-h-[320px] sm:min-h-[420px]">
            {imgError ? (
              <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400 max-w-sm">
                <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 mb-4">
                  <ImageIcon className="w-8 h-8" />
                </div>
                <h4 className="text-slate-200 font-bold mb-1">구글 드라이브 사진 미리보기</h4>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  구글 드라이브 보안 정책에 따라 인라인 로드가 차단된 경우 아래 버튼으로 원본을 바로 확인할 수 있습니다.
                </p>
                <a
                  href={driveViewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Google Drive 원본 사진 열기
                </a>
              </div>
            ) : (
              <div className="relative w-full h-full flex items-center justify-center group">
                <img
                  src={driveImgSrc}
                  alt={`${record.plantDisplayName} - ${record.date}`}
                  onError={() => setImgError(true)}
                  className="max-h-[500px] w-auto max-w-full object-contain rounded-2xl shadow-2xl"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            {/* Prev/Next buttons over photo */}
            {recordsList.length > 1 && (
              <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
                <button
                  onClick={handlePrev}
                  disabled={!hasPrev}
                  className={`pointer-events-auto p-2.5 rounded-full backdrop-blur-md transition-all cursor-pointer ${
                    hasPrev
                      ? 'bg-black/60 text-white hover:bg-emerald-600 hover:scale-105 shadow-lg'
                      : 'bg-black/20 text-slate-600 cursor-not-allowed'
                  }`}
                  title="이전 측정일 사진"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNext}
                  disabled={!hasNext}
                  className={`pointer-events-auto p-2.5 rounded-full backdrop-blur-md transition-all cursor-pointer ${
                    hasNext
                      ? 'bg-black/60 text-white hover:bg-emerald-600 hover:scale-105 shadow-lg'
                      : 'bg-black/20 text-slate-600 cursor-not-allowed'
                  }`}
                  title="다음 측정일 사진"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Measurements & Observation Notes */}
          <div className="lg:col-span-5 p-6 bg-white flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-100">
            <div className="space-y-5">
              <div>
                <span className="text-xs uppercase tracking-wider text-emerald-800 font-black">
                  측정 지표 요약
                </span>
                <div className="grid grid-cols-3 gap-2.5 mt-2.5">
                  <div className="p-3 rounded-2xl bg-[#eaf8f2] border border-[#ceeedf] text-center">
                    <span className="text-[11px] text-emerald-800 font-bold block mb-0.5">식물 키</span>
                    <span className="text-xl font-black text-slate-900">{record.height}</span>
                    <span className="text-xs text-slate-500 ml-0.5">cm</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#edeffb] border border-[#dadff8] text-center">
                    <span className="text-[11px] text-indigo-800 font-bold block mb-0.5">잎의 개수</span>
                    <span className="text-xl font-black text-slate-900">{record.leafCount}</span>
                    <span className="text-xs text-slate-500 ml-0.5">개</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#fcedf0] border border-[#f9d8de] text-center">
                    <span className="text-[11px] text-rose-800 font-bold block mb-0.5">대표 잎 폭</span>
                    <span className="text-xl font-black text-slate-900">{record.leafWidth}</span>
                    <span className="text-xs text-slate-500 ml-0.5">cm</span>
                  </div>
                </div>
              </div>

              {/* Health Score */}
              <div className="p-4 rounded-2xl bg-[#eaf4fe] border border-[#cde4fb]">
                <span className="text-xs text-sky-800 block mb-1 font-bold">식물 건강 상태</span>
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-xl bg-white text-sky-800 font-black text-xs shadow-xs">
                    {record.healthScore}점
                  </span>
                  <span className="text-xs text-slate-800 leading-snug font-bold">
                    {record.healthText}
                  </span>
                </div>
              </div>

              {/* Observation Notes */}
              <div>
                <span className="text-xs uppercase tracking-wider text-emerald-800 font-black block mb-2">
                  오늘의 관찰 일지 & 특이사항
                </span>
                <div className="p-4 rounded-2xl bg-[#f8f9fd] border border-slate-200 text-slate-800 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap min-h-[90px]">
                  {record.notes && record.notes.trim() !== '없음' ? (
                    `"${record.notes}"`
                  ) : (
                    <span className="text-slate-400 italic">특이사항 없이 건강하게 자라는 중입니다.</span>
                  )}
                </div>
              </div>

              <div className="text-[11px] text-slate-400">
                기록 제출 시각: {record.timestamp}
              </div>
            </div>

            {/* Timeline selector strip */}
            {recordsList.length > 1 && (
              <div className="mt-6 pt-4 border-t border-slate-100">
                <span className="text-xs text-slate-400 block mb-2 font-bold">
                  전체 측정 일자 ({currentIndex + 1} / {recordsList.length})
                </span>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {recordsList.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setImgError(false);
                        onSelectRecord && onSelectRecord(item);
                      }}
                      className={`px-3.5 py-2 text-xs rounded-xl whitespace-nowrap transition-all font-bold cursor-pointer ${
                        item.id === record.id
                          ? 'bg-slate-900 text-white shadow-md'
                          : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                      }`}
                    >
                      {item.date}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
