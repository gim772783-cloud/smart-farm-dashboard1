import React, { useState } from 'react';
import { ObservationRecord } from '../types/plant';
import { Camera, TrendingUp, Sparkles, Ruler, Leaf, Maximize2 } from 'lucide-react';

export type MetricType = 'height' | 'leafCount' | 'leafWidth' | 'healthScore';

interface GrowthChartProps {
  records: ObservationRecord[];
  onSelectRecord: (record: ObservationRecord) => void;
  selectedRecordId?: string;
}

export const GrowthChart: React.FC<GrowthChartProps> = ({
  records,
  onSelectRecord,
  selectedRecordId,
}) => {
  const [metric, setMetric] = useState<MetricType>('height');
  const [hoveredRecord, setHoveredRecord] = useState<ObservationRecord | null>(null);

  if (!records || records.length === 0) {
    return (
      <div className="h-72 flex items-center justify-center text-slate-400 text-base">
        기록된 측정 데이터가 없습니다.
      </div>
    );
  }

  // Metric configurations styled like modern SaaS dashboard
  const metricConfigs = {
    height: {
      label: '식물 키 / 초장',
      unit: 'cm',
      icon: Ruler,
      color: '#059669', // emerald-600
      barColor: '#a7f3d0', // emerald-200
      badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      accessor: (r: ObservationRecord) => r.height,
    },
    leafCount: {
      label: '잎의 개수',
      unit: '개',
      icon: Leaf,
      color: '#0284c7', // sky-600
      barColor: '#bae6fd', // sky-200
      badgeBg: 'bg-sky-50 text-sky-800 border-sky-200',
      accessor: (r: ObservationRecord) => r.leafCount,
    },
    leafWidth: {
      label: '대표 잎의 폭',
      unit: 'cm',
      icon: Maximize2,
      color: '#d97706', // amber-600
      barColor: '#fde68a', // amber-200
      badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
      accessor: (r: ObservationRecord) => r.leafWidth,
    },
    healthScore: {
      label: '건강 상태 점수',
      unit: '점',
      icon: Sparkles,
      color: '#7c3aed', // violet-600
      barColor: '#ddd6fe', // violet-200
      badgeBg: 'bg-violet-50 text-violet-800 border-violet-200',
      accessor: (r: ObservationRecord) => r.healthScore,
    },
  };

  const currentConfig = metricConfigs[metric];
  const values = records.map(currentConfig.accessor);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  
  // Growth delta calculation
  const initialVal = values[0];
  const latestVal = values[values.length - 1];
  const delta = Number((latestVal - initialVal).toFixed(2));
  const percentChange = initialVal !== 0 ? ((delta / initialVal) * 100).toFixed(1) : '0';

  // SVG Chart dimensions - Enlarged for clear readability!
  const width = 860;
  const height = 360;
  const paddingLeft = 65;
  const paddingRight = 45;
  const paddingTop = 45;
  const paddingBottom = 55;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Y-axis bounds with gentle padding
  let yMin = minVal === maxVal ? Math.max(0, minVal - 2) : Math.max(0, minVal - (maxVal - minVal) * 0.2);
  let yMax = minVal === maxVal ? maxVal + 2 : maxVal + (maxVal - minVal) * 0.2;
  if (metric === 'healthScore') {
    yMin = 1;
    yMax = 5.4;
  }
  const yRange = yMax - yMin || 1;

  // Coordinate mapping
  const points = records.map((record, index) => {
    const x =
      records.length === 1
        ? paddingLeft + chartWidth / 2
        : paddingLeft + (index / (records.length - 1)) * chartWidth;
    const val = currentConfig.accessor(record);
    const y = paddingTop + chartHeight - ((val - yMin) / yRange) * chartHeight;
    return { x, y, val, record, index };
  });

  // Smooth curve path
  const linePath = points.reduce((acc, point, i, arr) => {
    if (i === 0) return `M ${point.x} ${point.y}`;
    if (arr.length <= 2) {
      return `${acc} L ${point.x} ${point.y}`;
    }
    const prev = arr[i - 1];
    const cp1x = prev.x + (point.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (point.x - prev.x) / 2;
    const cp2y = point.y;
    return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${point.x} ${point.y}`;
  }, '');

  // Area path
  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`
    : '';

  // 4 Y-axis ticks
  const tickCount = 4;
  const yTicks = Array.from({ length: tickCount + 1 }, (_, i) => {
    const val = yMin + (i / tickCount) * (yMax - yMin);
    const y = paddingTop + chartHeight - (i / tickCount) * chartHeight;
    return { val: Number(val.toFixed(1)), y };
  });

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col gap-6">
      {/* Chart Header & Large Metric Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              식물 주차별 성장 궤적 그래프
            </h3>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              📸 날짜 클릭 시 당시 사진 표시
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            그래프의 날짜 지점을 클릭하면 당시 학생이 직접 촬영한 식물 사진과 관찰 일지를 확인할 수 있습니다.
          </p>
        </div>

        {/* Metric Selector Pills */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-[#f4f5fa] rounded-2xl border border-slate-200/60">
          {(Object.keys(metricConfigs) as MetricType[]).map((key) => {
            const config = metricConfigs[key];
            const Icon = config.icon;
            const isSelected = metric === key;
            return (
              <button
                key={key}
                onClick={() => setMetric(key)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200 scale-102'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <Icon className="w-4 h-4" style={{ color: config.color }} />
                <span>{config.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Delta Stat Summary Strip (Bigger Fonts!) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#f8f9fd] p-4 rounded-2xl border border-slate-100">
        <div className="p-2">
          <span className="text-xs text-slate-400 block font-medium">초기 측정값</span>
          <div className="text-2xl font-black text-slate-800 mt-0.5">
            {initialVal} <span className="text-xs font-normal text-slate-500">{currentConfig.unit}</span>
          </div>
          <span className="text-xs text-slate-400 block mt-0.5">{records[0]?.date}</span>
        </div>
        <div className="p-2">
          <span className="text-xs text-slate-400 block font-medium">최근 측정값</span>
          <div className="text-2xl font-black text-emerald-700 mt-0.5">
            {latestVal} <span className="text-xs font-normal text-slate-500">{currentConfig.unit}</span>
          </div>
          <span className="text-xs text-slate-400 block mt-0.5">{records[records.length - 1]?.date}</span>
        </div>
        <div className="p-2">
          <span className="text-xs text-slate-400 block font-medium">총 누적 성장량</span>
          <div className={`text-2xl font-black flex items-center gap-1 mt-0.5 ${
            delta > 0 ? 'text-emerald-700' : delta < 0 ? 'text-rose-600' : 'text-slate-700'
          }`}>
            <TrendingUp className="w-5 h-5 inline" />
            {delta > 0 ? `+${delta}` : delta} <span className="text-xs font-normal text-slate-500">{currentConfig.unit}</span>
          </div>
          <span className={`text-xs font-bold block mt-0.5 ${
            delta > 0 ? 'text-emerald-600' : delta < 0 ? 'text-rose-600' : 'text-slate-500'
          }`}>
            {delta > 0 ? `+${percentChange}% 성장 달성` : delta < 0 ? `${Math.abs(Number(percentChange))}% 감소` : '변화 없음'}
          </span>
        </div>
        <div className="p-2">
          <span className="text-xs text-slate-400 block font-medium">누적 관찰 횟수</span>
          <div className="text-2xl font-black text-slate-900 mt-0.5">
            {records.length} <span className="text-xs font-normal text-slate-500">회차</span>
          </div>
          <span className="text-xs text-slate-400 block mt-0.5">전 기간 관찰 완료</span>
        </div>
      </div>

      {/* Responsive Big SVG Chart */}
      <div className="relative w-full overflow-x-auto select-none pt-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[620px] overflow-visible"
        >
          <defs>
            <linearGradient id={`grad-${metric}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={currentConfig.color} stopOpacity="0.20" />
              <stop offset="100%" stopColor={currentConfig.color} stopOpacity="0.01" />
            </linearGradient>
            <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#000000" floodOpacity="0.12" />
            </filter>
          </defs>

          {/* Grid lines and Y-axis ticks */}
          {yTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1={paddingLeft}
                y1={tick.y}
                x2={width - paddingRight}
                y2={tick.y}
                stroke="#e2e8f0" // slate-200
                strokeDasharray="5 5"
                strokeWidth="1.2"
              />
              <text
                x={paddingLeft - 12}
                y={tick.y + 5}
                textAnchor="end"
                className="text-xs fill-slate-400 font-bold font-mono"
              >
                {tick.val}
              </text>
            </g>
          ))}

          {/* Subtle column background bars for modern aesthetic like image.png */}
          {points.map((pt) => (
            <rect
              key={`bar-${pt.record.id}`}
              x={pt.x - 22}
              y={pt.y}
              width="44"
              height={paddingTop + chartHeight - pt.y}
              rx="12"
              fill={currentConfig.color}
              fillOpacity={hoveredRecord?.id === pt.record.id ? "0.15" : "0.06"}
              className="transition-all duration-200"
            />
          ))}

          {/* Area under curve */}
          <path d={areaPath} fill={`url(#grad-${metric})`} />

          {/* Main Line */}
          <path
            d={linePath}
            fill="none"
            stroke={currentConfig.color}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive Data Points with Big Visible Labels */}
          {points.map((pt) => {
            const isSelected = selectedRecordId === pt.record.id;
            const isHovered = hoveredRecord?.id === pt.record.id;

            return (
              <g
                key={pt.record.id}
                className="cursor-pointer transition-transform duration-150"
                onClick={() => onSelectRecord(pt.record)}
                onMouseEnter={() => setHoveredRecord(pt.record)}
                onMouseLeave={() => setHoveredRecord(null)}
              >
                {/* Click hitbox */}
                <circle cx={pt.x} cy={pt.y} r="28" fill="transparent" />

                {/* Outer halo */}
                {(isHovered || isSelected) && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="15"
                    fill={currentConfig.color}
                    fillOpacity="0.25"
                  />
                )}

                {/* Point dot */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isSelected ? 8 : 6.5}
                  fill={isSelected ? '#18181b' : '#ffffff'}
                  stroke={currentConfig.color}
                  strokeWidth="3.5"
                  filter="url(#softShadow)"
                />

                {/* Big Prominent Value Pill Badge Above Dot (just like image.png) */}
                <g transform={`translate(${pt.x}, ${pt.y - 34})`}>
                  <rect
                    x="-32"
                    y="-14"
                    width="64"
                    height="24"
                    rx="12"
                    fill={isSelected ? '#18181b' : '#ffffff'}
                    stroke={isSelected ? '#18181b' : '#e2e8f0'}
                    strokeWidth="1.5"
                    filter="url(#softShadow)"
                  />
                  <text
                    x="0"
                    y="3"
                    textAnchor="middle"
                    className={`text-xs font-black ${
                      isSelected ? 'fill-white' : 'fill-slate-900'
                    }`}
                  >
                    {pt.val}
                    <tspan className={`text-[10px] font-bold ${
                      isSelected ? 'fill-emerald-400' : 'fill-slate-500'
                    }`}>
                      {currentConfig.unit}
                    </tspan>
                  </text>
                </g>

                {/* X-axis date label below (Bigger, bolder!) */}
                <text
                  x={pt.x}
                  y={paddingTop + chartHeight + 26}
                  textAnchor="middle"
                  className={`text-xs font-bold transition-colors ${
                    isSelected ? 'fill-emerald-700 font-extrabold text-sm' : 'fill-slate-600'
                  }`}
                >
                  {pt.record.date}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover / Tooltip Card */}
        {hoveredRecord && (
          <div className="absolute top-2 right-4 bg-white/95 border border-slate-200 rounded-2xl p-4 shadow-xl text-xs max-w-xs pointer-events-none backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between gap-2 mb-2 border-b border-slate-100 pb-2">
              <span className="font-black text-sm text-slate-900">{hoveredRecord.date}</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                클릭 시 사진 보기 📸
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-xs text-slate-600 mb-2">
              <span>식물 키: <strong className="text-slate-900 font-bold">{hoveredRecord.height}cm</strong></span>
              <span>잎 개수: <strong className="text-slate-900 font-bold">{hoveredRecord.leafCount}개</strong></span>
              <span>잎 폭: <strong className="text-slate-900 font-bold">{hoveredRecord.leafWidth}cm</strong></span>
              <span>건강도: <strong className="text-slate-900 font-bold">{hoveredRecord.healthScore}점</strong></span>
            </div>
            {hoveredRecord.notes && (
              <p className="text-xs text-slate-700 line-clamp-2 italic bg-slate-50 p-2 rounded-xl border border-slate-100">
                "{hoveredRecord.notes}"
              </p>
            )}
          </div>
        )}
      </div>

      {/* Quick Date Click Buttons */}
      <div className="flex items-center gap-2 pt-3 border-t border-slate-100 overflow-x-auto pb-1">
        <span className="text-xs text-slate-500 font-bold whitespace-nowrap flex items-center gap-1.5">
          <Camera className="w-4 h-4 text-emerald-600" />
          날짜별 사진 바로보기:
        </span>
        {records.map((record) => {
          const isSelected = selectedRecordId === record.id;
          return (
            <button
              key={record.id}
              onClick={() => onSelectRecord(record)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>{record.date}</span>
              <span className="text-[11px] opacity-75">
                ({currentConfig.accessor(record)}{currentConfig.unit})
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
