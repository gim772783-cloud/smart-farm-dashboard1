import React from 'react';
import { Sprout, TrendingUp, BarChart3, Table, Printer, RefreshCw, MapPin, Camera } from 'lucide-react';

export type ActiveTab = 'detail' | 'comparison' | 'locations' | 'overview' | 'table';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  plantCount: number;
  recordCount: number;
  onOpenImport: () => void;
  onOpenReportPrint: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  plantCount,
  recordCount,
  onOpenImport,
  onOpenReportPrint,
}) => {
  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 backdrop-blur-md bg-white/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between py-4 gap-4">
          {/* Logo & School Title */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white shadow-md shadow-emerald-900/20 ring-4 ring-emerald-50">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                  홍천농업고등학교
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  초록 성장 일지
                </h1>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  스마트 원예 대시보드
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                식물 생육 과정 추적 · A·B·C 구역별 환경 비교 · 1페이지 포트폴리오 인쇄
              </p>
            </div>
          </div>

          {/* Quick Stats & Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={onOpenReportPrint}
              className="flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold rounded-2xl bg-slate-900 hover:bg-emerald-600 text-white shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>1페이지 보고서 인쇄</span>
            </button>

            <button
              onClick={onOpenImport}
              className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold rounded-2xl bg-[#f4f5fa] hover:bg-slate-200 text-slate-700 border border-slate-200/80 transition-colors cursor-pointer"
              title="새 데이터 추가 또는 시트 동기화"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">시트 동기화</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Navigation Bar */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto border-t border-slate-100 pt-2 pb-2.5 scrollbar-none">
          <button
            onClick={() => onTabChange('detail')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'detail'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sprout className="w-4 h-4" />
            <span>개별 식물 성장 & 사진</span>
          </button>

          <button
            onClick={() => onTabChange('comparison')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'comparison'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>같은 종 위치별(A/B/C) 비교</span>
          </button>

          <button
            onClick={() => onTabChange('locations')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'locations'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>A·B·C 위치 사진 & 환경 분석</span>
          </button>

          <button
            onClick={() => onTabChange('overview')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>전체 현황 종합 요약</span>
          </button>

          <button
            onClick={() => onTabChange('table')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'table'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Table className="w-4 h-4" />
            <span>정제 데이터 전체 표</span>
          </button>
        </div>
      </div>
    </header>
  );
};
