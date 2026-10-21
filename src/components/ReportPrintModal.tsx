import React, { useState } from 'react';
import { Plant, ObservationRecord } from '../types/plant';
import { LOCATION_DETAILS } from '../data/plantData';
import { getDriveThumbnailSrc } from '../utils/imageHelper';
import { Printer, X, Download, ChevronDown, CheckCircle, Award, Sprout, Calendar, MapPin, Ruler, Leaf, Sparkles } from 'lucide-react';

interface ReportPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  plant: Plant;
  allPlants: Plant[];
  onSelectPlant: (plantId: string) => void;
}

export const ReportPrintModal: React.FC<ReportPrintModalProps> = ({
  isOpen,
  onClose,
  plant,
  allPlants,
  onSelectPlant,
}) => {
  if (!isOpen) return null;

  const locInfo = LOCATION_DETAILS[plant.location];
  const records = plant.records;

  const handlePrint = () => {
    window.print();
  };

  // Min/Max for small chart
  const heights = records.map(r => r.height);
  const minH = Math.min(...heights);
  const maxH = Math.max(...heights);
  const hRange = maxH - minH || 1;

  const chartW = 540;
  const chartH = 130;
  const padL = 40;
  const padR = 25;
  const padT = 20;
  const padB = 25;
  const innerW = chartW - padL - padR;
  const innerH = chartH - padT - padB;

  const pts = records.map((r, i) => {
    const x = records.length <= 1 ? padL + innerW / 2 : padL + (i / (records.length - 1)) * innerW;
    const y = padT + innerH - ((r.height - minH) / hRange) * innerH;
    return { x, y, r };
  });

  const pathD = pts.reduce((acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:static">
      <div 
        className="w-full max-w-4xl bg-white text-slate-800 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto print:border-none print:shadow-none print:rounded-none print:max-w-none print:w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Actions Bar (Hidden on print) */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200 print:hidden">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Printer className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                초록 성장 일지 관찰 포트폴리오 (1페이지 인쇄/PDF)
              </h3>
              <p className="text-xs text-slate-500">
                A4 한 페이지 규격으로 정돈된 공식 관찰 보고서 레이아웃입니다.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Quick plant selector */}
            <div className="relative">
              <select
                value={plant.plantId}
                onChange={(e) => onSelectPlant(e.target.value)}
                className="appearance-none bg-white border border-slate-300 hover:border-emerald-500 text-slate-700 text-xs font-semibold rounded-xl pl-3 pr-8 py-2 focus:outline-none cursor-pointer"
              >
                {allPlants.map(p => (
                  <option key={p.plantId} value={p.plantId}>
                    [{p.location}구역] {p.cleanName} (관찰자 학번: {p.studentId})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>인쇄 / PDF 저장</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Canvas (A4 Optimized) */}
        <div id="print-area" className="p-8 sm:p-10 bg-white space-y-5 print:p-6 print:space-y-4 print:text-black">
          {/* School & Report Header */}
          <div className="border-b-2 border-emerald-600 pb-4 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  홍천농업고등학교 스마트 원예 생육 실습
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  스마트 식물 관찰 포트폴리오
                </span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                초록 성장 일지 식물 생육 보고서
              </h1>
            </div>

            {/* Verification Stamp Box */}
            <div className="border border-slate-300 rounded-lg text-center text-[10px] w-28 bg-slate-50/70">
              <div className="bg-slate-100 py-0.5 border-b border-slate-300 font-bold text-slate-600">
                지도교사 확인
              </div>
              <div className="h-12 flex items-center justify-center text-slate-400 font-serif text-xs">
                ( 서 명 / 인 )
              </div>
            </div>
          </div>

          {/* Plant & Student Metadata Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 block font-medium">관찰자 학번</span>
              <strong className="text-sm font-black text-slate-900">{plant.studentId}</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block font-medium">식물 ID / 명칭</span>
              <strong className="text-sm font-bold text-emerald-700">{plant.cleanName}</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block font-medium">재배 위치 & 환경</span>
              <strong className="text-xs font-semibold text-slate-800">
                위치 {plant.location}구역 ({locInfo.subTitle})
              </strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block font-medium">관찰 기간 (회차)</span>
              <strong className="text-xs font-semibold text-slate-800">
                {records[0]?.date} ~ {records[records.length - 1]?.date} ({records.length}회)
              </strong>
            </div>
          </div>

          {/* Environment Description Brief */}
          <div className="text-[11px] text-slate-600 bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100 leading-snug">
            <strong>🌱 위치 {plant.location} 환경 조건:</strong> {locInfo.description} (광원: {locInfo.sunlightLevel} / 환기: {locInfo.ventilation})
          </div>

          {/* Growth Summary Metrics Table */}
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-[10px] text-slate-500 block">초장(키) 성장</span>
              <div className="text-base font-black text-emerald-700 mt-0.5">
                {plant.heightGrowth >= 0 ? `+${plant.heightGrowth}` : `${plant.heightGrowth}`} <span className="text-[10px] font-normal">cm</span>
              </div>
              <span className="text-[10px] text-slate-400">
                {plant.initialHeight}cm → {plant.latestHeight}cm
              </span>
            </div>
            <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-[10px] text-slate-500 block">잎 수 증감</span>
              <div className={`text-base font-black mt-0.5 ${plant.leafGrowth >= 0 ? 'text-cyan-700' : 'text-rose-600'}`}>
                {plant.leafGrowth > 0
                  ? `+${plant.leafGrowth}장 증가`
                  : plant.leafGrowth < 0
                  ? `${Math.abs(plant.leafGrowth)}장 감소`
                  : '변동 없음'}
              </div>
              <span className="text-[10px] text-slate-400">
                {plant.initialLeafCount}장 → {plant.latestLeafCount}장
              </span>
            </div>
            <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-[10px] text-slate-500 block">대표 잎 폭</span>
              <div className="text-base font-black text-amber-700 mt-0.5">
                {records[records.length - 1]?.leafWidth} <span className="text-[10px] font-normal">cm</span>
              </div>
              <span className="text-[10px] text-slate-400">
                초기 {records[0]?.leafWidth}cm
              </span>
            </div>
            <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-[10px] text-slate-500 block">최종 생육 건강도</span>
              <div className="text-base font-black text-emerald-600 mt-0.5">
                {plant.latestHealthScore} <span className="text-[10px] font-normal">/ 5점</span>
              </div>
              <span className="text-[10px] text-slate-500 truncate block">
                {plant.latestHealthScore >= 5 ? '🌟 매우 양호' : '🙂 양호'}
              </span>
            </div>
          </div>

          {/* Growth Curve Chart */}
          <div className="border border-slate-200 rounded-2xl p-3 bg-white">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-bold text-slate-800">📈 식물 키(초장) 주차별 성장 궤적</span>
              <span className="text-[10px] text-slate-500">단위: cm</span>
            </div>
            <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-24">
              <line x1={padL} y1={padT + innerH} x2={chartW - padR} y2={padT + innerH} stroke="#cbd5e1" strokeWidth="1" />
              <path d={pathD} fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" />
              {pts.map((p, i) => (
                <g key={i}>
                  <circle cx={p.x} cy={p.y} r="3.5" fill="#059669" stroke="#ffffff" strokeWidth="1.5" />
                  <text x={p.x} y={p.y - 6} textAnchor="middle" className="text-[9px] font-bold fill-slate-700">
                    {p.r.height}
                  </text>
                  <text x={p.x} y={padT + innerH + 14} textAnchor="middle" className="text-[8px] fill-slate-500">
                    {p.r.date}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          {/* Chronological Photo & Journal Grid */}
          <div>
            <div className="text-xs font-bold text-slate-800 mb-2 flex items-center justify-between">
              <span>📷 주차별 식물 관찰 사진 및 생육 일지</span>
              <span className="text-[10px] text-slate-500">총 {records.length}회차 기록</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {records.map((r, i) => {
                const thumb = getDriveThumbnailSrc(r.photoUrl, 300);
                return (
                  <div key={r.id} className="border border-slate-200 rounded-xl p-2 bg-slate-50 text-[10px]">
                    <div className="aspect-4/3 w-full bg-slate-200 rounded-lg overflow-hidden mb-1.5">
                      <img
                        src={thumb}
                        alt={r.date}
                        className="w-full h-full object-cover"
                        crossOrigin="anonymous"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex items-center justify-between font-bold text-slate-800 mb-0.5">
                      <span>{r.date}</span>
                      <span className="text-emerald-700">{r.height}cm · {r.leafCount}장</span>
                    </div>
                    <p className="text-slate-600 line-clamp-2 italic leading-tight">
                      "{r.notes && r.notes !== '없음' ? r.notes : '특이사항 없음'}"
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Student Self-Reflection & Teacher Evaluation Section */}
          <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
            <div className="border border-slate-300 rounded-xl p-3 bg-slate-50/70">
              <span className="font-bold text-slate-800 block mb-1">
                📝 학생 자기 성찰 및 관찰 소감
              </span>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                위치 {plant.location} 환경에서 식물을 관찰하며 광도와 통풍이 신초 형성에 미치는 영향을 학습했습니다.
                규칙적인 수분 공급과 잎 상태 점검을 통해 건강하게 생육을 유지하였습니다.
              </p>
            </div>
            <div className="border border-slate-300 rounded-xl p-3 bg-slate-50/70 flex flex-col justify-between">
              <div>
                <span className="font-bold text-slate-800 block mb-1">
                  👨‍🏫 종합 평가 및 피드백
                </span>
                <div className="flex items-center gap-3 text-[11px] text-slate-700 mt-1">
                  <label className="flex items-center gap-1">
                    <input type="checkbox" defaultChecked className="rounded text-emerald-600" />
                    <span>매우 우수</span>
                  </label>
                  <label className="flex items-center gap-1">
                    <input type="checkbox" className="rounded text-emerald-600" />
                    <span>우수</span>
                  </label>
                  <label className="flex items-center gap-1">
                    <input type="checkbox" className="rounded text-emerald-600" />
                    <span>보통</span>
                  </label>
                </div>
              </div>
              <div className="text-right text-[10px] text-slate-400 mt-2">
                홍천농업고등학교 농업생명과학과
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
