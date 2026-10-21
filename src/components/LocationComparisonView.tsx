import React, { useState, useMemo } from 'react';
import { Plant, ObservationRecord } from '../types/plant';
import { LOCATION_DETAILS } from '../data/plantData';
import { PhotoModal } from './PhotoModal';
import { HealthScoreModal } from './HealthScoreModal';
import { getDriveThumbnailSrc } from '../utils/imageHelper';
import {
  Compass,
  Ruler,
  Leaf,
  Maximize2,
  Sparkles,
  TrendingUp,
  MapPin,
  Camera,
  ExternalLink,
  ChevronDown,
  Sun,
  Wind,
  CheckCircle2,
  BarChart2,
  Award,
  HelpCircle,
} from 'lucide-react';

interface LocationComparisonViewProps {
  plants: Plant[];
  initialSpecies?: string;
  onSelectPlantDetail?: (plantId: string) => void;
}

type MetricType = 'height' | 'leafCount' | 'leafWidth' | 'healthScore';

export const LocationComparisonView: React.FC<LocationComparisonViewProps> = ({
  plants,
  initialSpecies,
  onSelectPlantDetail,
}) => {
  const [isHealthScoreModalOpen, setIsHealthScoreModalOpen] = useState(false);
  // Find all distinct species
  const speciesList = useMemo(() => {
    const map = new Map<string, { locations: Set<string>; count: number }>();
    for (const p of plants) {
      if (!map.has(p.species)) {
        map.set(p.species, { locations: new Set(), count: 0 });
      }
      map.get(p.species)!.locations.add(p.location);
      map.get(p.species)!.count++;
    }
    return Array.from(map.entries())
      .map(([name, data]) => ({
        name,
        locations: Array.from(data.locations).sort(),
        count: data.count,
        isMultiLocation: data.locations.size > 1,
      }))
      .sort((a, b) => (b.isMultiLocation ? 1 : 0) - (a.isMultiLocation ? 1 : 0));
  }, [plants]);

  const [selectedSpecies, setSelectedSpecies] = useState<string>(
    initialSpecies || speciesList.find(s => s.isMultiLocation)?.name || speciesList[0]?.name || ''
  );

  const [metric, setMetric] = useState<MetricType>('height');
  const [activePhotoRecord, setActivePhotoRecord] = useState<ObservationRecord | null>(null);

  const matchingPlants = useMemo(() => {
    return plants.filter(p => p.species === selectedSpecies);
  }, [plants, selectedSpecies]);

  const allDates = useMemo(() => {
    const dateSet = new Set<string>();
    const dateMap = new Map<string, number>();
    for (const p of matchingPlants) {
      for (const r of p.records) {
        dateSet.add(r.date);
        dateMap.set(r.date, r.dateTimestamp);
      }
    }
    return Array.from(dateSet).sort((a, b) => (dateMap.get(a) || 0) - (dateMap.get(b) || 0));
  }, [matchingPlants]);

  const [selectedCompareDate, setSelectedCompareDate] = useState<string>(
    allDates[allDates.length - 1] || ''
  );

  const plantsByLocation = useMemo(() => {
    const locs: Record<'A' | 'B' | 'C', Plant[]> = { A: [], B: [], C: [] };
    for (const p of matchingPlants) {
      locs[p.location].push(p);
    }
    return locs;
  }, [matchingPlants]);

  const locationStats = useMemo(() => {
    const result: Record<string, {
      avgHeightGrowth: number;
      avgLeafGrowth: number;
      avgLeafWidth: number;
      avgHealth: number;
      latestAvgHeight: number;
      latestAvgLeafCount: number;
      count: number;
    }> = {};
    for (const loc of ['A', 'B', 'C'] as const) {
      const group = plantsByLocation[loc];
      if (group.length > 0) {
        const totalHeightGrowth = group.reduce((sum, p) => sum + p.heightGrowth, 0);
        const totalLeafGrowth = group.reduce((sum, p) => sum + p.leafGrowth, 0);
        const totalHealth = group.reduce((sum, p) => sum + p.latestHealthScore, 0);
        const totalLatestHeight = group.reduce((sum, p) => sum + p.latestHeight, 0);
        const totalLatestLeaf = group.reduce((sum, p) => sum + p.latestLeafCount, 0);
        const totalLeafWidth = group.reduce((sum, p) => {
          const lastRec = p.records[p.records.length - 1];
          return sum + (lastRec?.leafWidth || 0);
        }, 0);

        result[loc] = {
          avgHeightGrowth: Number((totalHeightGrowth / group.length).toFixed(2)),
          avgLeafGrowth: Number((totalLeafGrowth / group.length).toFixed(1)),
          avgLeafWidth: Number((totalLeafWidth / group.length).toFixed(2)),
          avgHealth: Number((totalHealth / group.length).toFixed(1)),
          latestAvgHeight: Number((totalLatestHeight / group.length).toFixed(1)),
          latestAvgLeafCount: Number((totalLatestLeaf / group.length).toFixed(1)),
          count: group.length,
        };
      }
    }
    return result;
  }, [plantsByLocation]);

  // Requirement 7: '비교 분석 지표'인 '식물 키, 잎의 개수, 대표 잎 폭, 건강 점수' 클릭 시 지표에 맞춘 동적 비교 분석 결과 제공
  const analysisSummary = useMemo(() => {
    const activeLocs = (['A', 'B', 'C'] as const).filter(loc => !!locationStats[loc]);
    if (activeLocs.length === 0) {
      return {
        bestLoc: 'A',
        title: `${selectedSpecies} 생육 분석`,
        text: '분석할 데이터가 충분하지 않습니다.',
      };
    }

    if (activeLocs.length === 1) {
      const loc = activeLocs[0];
      const s = locationStats[loc];
      const locName = LOCATION_DETAILS[loc]?.name;
      let text = '';
      if (metric === 'height') {
        text = `${selectedSpecies}은 현재 ${locName}에서만 재배 중이며, 관찰 기간 동안 평균 키 ${s.avgHeightGrowth > 0 ? `+${s.avgHeightGrowth}cm 성장` : `${s.avgHeightGrowth}cm 변화`}(최종 평균 ${s.latestAvgHeight}cm)하여 안정적인 신장을 보였습니다.`;
      } else if (metric === 'leafCount') {
        text = `${selectedSpecies}은 현재 ${locName}에서만 재배 중이며, 관찰 기간 동안 잎의 개수가 평균 ${s.avgLeafGrowth > 0 ? `${s.avgLeafGrowth}장 증가` : s.avgLeafGrowth < 0 ? `${Math.abs(s.avgLeafGrowth)}장 감소` : '변동 없이 유지'}(최종 평균 ${s.latestAvgLeafCount}장)되었습니다.`;
      } else if (metric === 'leafWidth') {
        text = `${selectedSpecies}은 현재 ${locName}에서만 재배 중이며, 대표 잎의 평균 너비는 ${s.avgLeafWidth}cm로 ${LOCATION_DETAILS[loc]?.sunlightLevel} 조건에 맞추어 정상적인 엽면적을 형성하고 있습니다.`;
      } else {
        text = `${selectedSpecies}은 현재 ${locName}에서만 재배 중이며, 평균 건강 점수 ${s.avgHealth}점으로 양호한 활력을 유지하고 있습니다.`;
      }
      return {
        bestLoc: loc,
        title: `${selectedSpecies} - ${metric === 'height' ? '식물 키' : metric === 'leafCount' ? '잎의 개수' : metric === 'leafWidth' ? '대표 잎 폭' : '건강 점수'} 분석 결과`,
        text,
      };
    }

    // Multiple locations comparison:
    const locA = locationStats['A'];
    const locB = locationStats['B'];
    const locC = locationStats['C'];

    let bestLoc = activeLocs[0];
    let text = '';

    if (metric === 'height') {
      let maxH = -999;
      for (const loc of activeLocs) {
        if ((locationStats[loc]?.avgHeightGrowth ?? -999) > maxH) {
          maxH = locationStats[loc]!.avgHeightGrowth;
          bestLoc = loc;
        }
      }
      if (locA && locB && !locC) {
        text = `식물 키(초장) 비교 결과, 위치 ${bestLoc}(평균 +${maxH}cm)가 상대 구역보다 더 왕성한 신장세를 기록했습니다. 위치 A(플랜트월 전용 조명+형광등 간접광)와 위치 B(창문 인접 우수한 환기+약한 자연 채광)를 비교했을 때, ${bestLoc === 'A' ? 'A구역의 플랜트월 전용 조명 지속 조사와 실내 보온 효과가 줄기 신장을 촉진' : 'B구역의 창가 자연 채광과 원활한 통풍이 마디를 굵고 튼튼하게 신장 유도'}한 것으로 분석됩니다.`;
      } else if (locB && locC) {
        text = `식물 키(초장) 비교 결과, B와 C 구역은 인접하여 환기 정도가 동일하게 매우 우수하며, 천창 유리창을 통해 풍부한 태양광이 들어오는 C구역과 측면 창문 자연 채광의 B구역 간 비교에서 위치 ${bestLoc}(평균 +${maxH}cm)의 성장이 가장 두드러졌습니다.`;
      } else {
        text = `식물 키(초장) 비교 분석 결과, 위치 ${bestLoc} 구역에서 평균 키 성장량(+${maxH}cm)이 가장 높게 나타났습니다. 채광 조건(A: 플랜트월 조명 간접광, B: 약한 자연 채광, C: 천창 자연광)에 따른 광합성 효율과 절간 신장 반응의 뚜렷한 차이를 확인할 수 있습니다.`;
      }
    } else if (metric === 'leafCount') {
      let maxL = -999;
      for (const loc of activeLocs) {
        if ((locationStats[loc]?.avgLeafGrowth ?? -999) > maxL) {
          maxL = locationStats[loc]!.avgLeafGrowth;
          bestLoc = loc;
        }
      }
      if (locA && locB && !locC) {
        text = `잎의 개수 비교 분석 결과, 위치 ${bestLoc}에서 평균 ${maxL > 0 ? `${maxL}장 증가` : maxL < 0 ? `${Math.abs(maxL)}장 감소` : '변동 없음'}하여 잎 생성 및 유지력이 가장 우수했습니다. 창문 옆 개방 공간인 위치 B는 A구역 대비 상대적으로 환기가 잘 되어 잎의 무름이나 과습 낙엽 현상이 방지되고 새순 분화가 안정적으로 유지되었습니다.`;
      } else if (locB && locC) {
        text = `잎의 개수 비교 분석 결과, 환기 정도가 동일하게 매우 우수한 B·C 구역 중 위치 ${bestLoc}에서 평균 ${maxL > 0 ? `${maxL}장 증가` : '유지'}로 우위를 보였습니다. 충분한 일조량과 신선한 공기 순환이 엽수 유지에 핵심적인 역할을 하고 있습니다.`;
      } else {
        text = `잎의 개수 비교 분석 결과, 위치 ${bestLoc} 구역에서 평균 ${maxL > 0 ? `${maxL}장 증가` : '유지'}로 가장 우수한 엽수 증가세를 나타냈습니다. 통풍이 우수한 B·C 구역에서 잎의 과습 피해나 낙엽이 적게 관찰되었습니다.`;
      }
    } else if (metric === 'leafWidth') {
      let maxW = -999;
      for (const loc of activeLocs) {
        if ((locationStats[loc]?.avgLeafWidth ?? -999) > maxW) {
          maxW = locationStats[loc]!.avgLeafWidth;
          bestLoc = loc;
        }
      }
      text = `대표 잎 폭(너비) 비교 분석 결과, 위치 ${bestLoc}에서 평균 ${maxW}cm로 가장 넓은 엽면적을 형성했습니다. 실내 간접광 구역(A)은 제한된 광량을 최대한 흡수하기 위해 잎 면적을 넓히는 적응 현상이 관찰되며, 자연 채광이 유입되는 구역(B, C)은 잎의 두께와 엽육 조직이 단단해지는 구조적 차이를 보입니다.`;
    } else {
      // healthScore
      let maxHealth = -999;
      for (const loc of activeLocs) {
        if ((locationStats[loc]?.avgHealth ?? -999) > maxHealth) {
          maxHealth = locationStats[loc]!.avgHealth;
          bestLoc = loc;
        }
      }
      const scoreExplanation = maxHealth >= 4.5 ? '새순 발생 및 잎의 광택이 뛰어난 최상위 활력' : '특별한 병충해 없이 안정적인 생육';
      text = `생육 건강 점수(1~5점) 비교 분석 결과, 위치 ${bestLoc} 구역이 평균 ${maxHealth}점으로 가장 건강한 생육 상태(${scoreExplanation})를 유지했습니다. 창가 인접 구역(B, C)의 시원한 환기와 자연 통풍이 잎 끝 갈변이나 검은 반점 발생을 크게 억제하여 높은 건강도를 유지하는 핵심 요인으로 작용했습니다.`;
    }

    return {
      bestLoc,
      title: `${selectedSpecies} - ${metric === 'height' ? '식물 키' : metric === 'leafCount' ? '잎의 개수' : metric === 'leafWidth' ? '대표 잎 폭' : '건강 점수'} 위치별 비교 분석 결과`,
      text,
    };
  }, [selectedSpecies, locationStats, metric]);

  const metricConfigs = {
    height: { label: '식물 키 (초장)', unit: 'cm', accessor: (r: ObservationRecord) => r.height },
    leafCount: { label: '잎의 개수', unit: '개', accessor: (r: ObservationRecord) => r.leafCount },
    leafWidth: { label: '대표 잎 폭', unit: 'cm', accessor: (r: ObservationRecord) => r.leafWidth },
    healthScore: { label: '건강 점수', unit: '점', accessor: (r: ObservationRecord) => r.healthScore },
  };
  const currentMetric = metricConfigs[metric];

  // Requirement 5: A구역과 B구역 식물의 그래프 색을 좀더 잘 구별되도록 명확한 대비 색상 적용
  const getLocationPlantColor = (plant: Plant, indexInLoc: number) => {
    if (plant.location === 'A') {
      // Vibrant Emerald / Forest Green palette for Area A
      return indexInLoc === 0 ? '#059669' : '#10b981';
    }
    if (plant.location === 'B') {
      // Vivid Royal Blue / Cobalt palette for Area B (Sharp contrast against Green A!)
      return indexInLoc === 0 ? '#1d4ed8' : '#3b82f6';
    }
    // Location C: Vibrant Deep Purple / Amber
    return indexInLoc === 0 ? '#9333ea' : '#f59e0b';
  };


  // Enlarged chart dimensions
  const width = 860;
  const height = 380;
  const paddingLeft = 65;
  const paddingRight = 45;
  const paddingTop = 45;
  const paddingBottom = 55;
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  let allMetricVals: number[] = [];
  for (const p of matchingPlants) {
    for (const r of p.records) {
      allMetricVals.push(currentMetric.accessor(r));
    }
  }
  if (allMetricVals.length === 0) allMetricVals = [0, 10];
  const globalMin = Math.min(...allMetricVals);
  const globalMax = Math.max(...allMetricVals);

  let yMin = globalMin === globalMax ? Math.max(0, globalMin - 2) : Math.max(0, globalMin - (globalMax - globalMin) * 0.2);
  let yMax = globalMin === globalMax ? globalMax + 2 : globalMax + (globalMax - globalMin) * 0.2;
  if (metric === 'healthScore') {
    yMin = 1;
    yMax = 5.4;
  }
  const yRange = yMax - yMin || 1;

  const tickCount = 4;
  const yTicks = Array.from({ length: tickCount + 1 }, (_, i) => {
    const val = yMin + (i / tickCount) * (yMax - yMin);
    const y = paddingTop + chartHeight - (i / tickCount) * chartHeight;
    return { val: Number(val.toFixed(1)), y };
  });

  return (
    <div className="space-y-6">
      {/* 1. Top Controller Bar */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-emerald-600" />
            비교할 식물 종(Species) 선택
          </label>
          <div className="relative">
            <select
              value={selectedSpecies}
              onChange={(e) => {
                setSelectedSpecies(e.target.value);
                const firstMatching = plants.filter(p => p.species === e.target.value);
                const dates = Array.from(new Set(firstMatching.flatMap(p => p.records.map(r => r.date))));
                if (dates.length > 0) setSelectedCompareDate(dates[dates.length - 1]);
              }}
              className="w-full appearance-none bg-[#f8f9fd] border border-slate-200 hover:border-slate-300 focus:border-emerald-600 text-slate-900 rounded-2xl px-4 py-3 pr-10 text-sm font-black focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
            >
              {speciesList.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name} ({s.locations.map(l => `위치 ${l}`).join(' vs ')} · 총 {s.count}개 개체)
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Metric Switcher */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm text-slate-700 font-bold">비교 분석 지표 선택</span>
            {metric === 'healthScore' && (
              <button
                onClick={() => setIsHealthScoreModalOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-900 text-xs font-bold transition-all cursor-pointer border border-sky-300"
              >
                <HelpCircle className="w-3.5 h-3.5 text-sky-700" />
                <span>점수 기준표 보기 ⓘ</span>
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2 p-1.5 bg-[#f4f5fa] rounded-2xl border border-slate-200/60">
            {(Object.keys(metricConfigs) as MetricType[]).map((key) => {
              const cfg = metricConfigs[key];
              const isSelected = metric === key;
              return (
                <button
                  key={key}
                  onClick={() => setMetric(key)}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. [NEW] 간단한 생육 비교 분석 결과 (Selected Metric-linked Dynamic Analysis) */}
      <div className="bg-white border border-emerald-100 rounded-3xl p-6 sm:p-7 shadow-sm bg-gradient-to-r from-emerald-50/60 via-teal-50/30 to-sky-50/40">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-black text-slate-900">
                📊 {analysisSummary.title}
              </h4>
              <span className="text-xs text-emerald-800 font-bold">
                선택된 지표({currentMetric.label}) 기준 데이터 자동 종합 분석
              </span>
            </div>
          </div>

          {metric === 'healthScore' && (
            <button
              onClick={() => setIsHealthScoreModalOpen(true)}
              className="px-3 py-1 rounded-xl bg-white hover:bg-sky-50 text-sky-800 text-xs font-bold border border-sky-200 shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              <span>건강 1~5점 평가 기준표 확인</span>
            </button>
          )}
        </div>

        {/* Dynamic Analysis Text focused on selected metric */}
        <p className="text-sm sm:text-base text-slate-800 leading-relaxed bg-white/90 p-4 sm:p-5 rounded-2xl border border-emerald-200/80 mb-4 shadow-xs">
          {analysisSummary.text}
        </p>

        {/* Quick Comparison Pills tailored to active metric */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {(['A', 'B', 'C'] as const).map(code => {
            const stat = locationStats[code];
            if (!stat) return null;
            const locInfo = LOCATION_DETAILS[code];

            return (
              <div key={code} className="p-3.5 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm flex items-center justify-between shadow-2xs">
                <div>
                  <span className="font-black text-slate-900 block text-sm">
                    {locInfo.name} ({stat.count}개체)
                  </span>
                  <span className="text-xs text-slate-500">
                    {code === 'A' ? '플랜트월 조명' : code === 'B' ? '창가 환기 우수' : '천창 직하 태양광'}
                  </span>
                </div>

                <div className="text-right">
                  {metric === 'height' && (
                    <>
                      <div className="text-sm sm:text-base font-black text-emerald-700">
                        {stat.avgHeightGrowth > 0 ? `+${stat.avgHeightGrowth}` : stat.avgHeightGrowth}cm
                      </div>
                      <div className="text-xs text-slate-500">
                        최종 {stat.latestAvgHeight}cm
                      </div>
                    </>
                  )}

                  {metric === 'leafCount' && (
                    <>
                      <div className={`text-sm sm:text-base font-black ${stat.avgLeafGrowth < 0 ? 'text-rose-600' : 'text-indigo-700'}`}>
                        {stat.avgLeafGrowth > 0 ? `${stat.avgLeafGrowth}장 증가` : stat.avgLeafGrowth < 0 ? `${Math.abs(stat.avgLeafGrowth)}장 감소` : '0장'}
                      </div>
                      <div className="text-xs text-slate-500">
                        최종 {stat.latestAvgLeafCount}장
                      </div>
                    </>
                  )}

                  {metric === 'leafWidth' && (
                    <>
                      <div className="text-sm sm:text-base font-black text-rose-700">
                        평균 {stat.avgLeafWidth}cm
                      </div>
                      <div className="text-xs text-slate-500">
                        대표 잎 너비
                      </div>
                    </>
                  )}

                  {metric === 'healthScore' && (
                    <div
                      onClick={() => setIsHealthScoreModalOpen(true)}
                      className="cursor-pointer group"
                      title="클릭하여 점수 기준 보기"
                    >
                      <div className="text-sm sm:text-base font-black text-sky-700 group-hover:underline">
                        평균 {stat.avgHealth}점
                      </div>
                      <div className="text-[11px] font-bold text-sky-600">
                        기준표 보기 ⓘ
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. 식물 비교 그래프 (Multi-line Comparative Growth Chart) */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5 mb-5">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {selectedSpecies} 위치별 {currentMetric.label} 오버레이 비교 그래프
              </h3>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                📸 포인트 클릭 시 사진 확인
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              * A구역(실선 녹색)과 B구역(점선 파란색)은 색상과 선 스타일이 구분되어 있습니다.
            </p>
          </div>

          {/* Plant Legend with Clear Distinguishable Colors */}
          <div className="flex flex-wrap items-center gap-2.5">
            {matchingPlants.map((plant) => {
              const locCount = matchingPlants.filter(p => p.location === plant.location);
              const indexInLoc = locCount.findIndex(p => p.plantId === plant.plantId);
              const color = getLocationPlantColor(plant, indexInLoc);
              const isLocB = plant.location === 'B';

              return (
                <div key={plant.plantId} className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-800 bg-[#f8f9fd] px-3 py-1.5 rounded-xl border border-slate-200/80">
                  <span
                    className={`w-4 h-2.5 rounded-xs flex-shrink-0 ${isLocB ? 'border-b-2 border-dashed' : ''}`}
                    style={{ backgroundColor: color, borderBottomColor: isLocB ? '#1e3a8a' : undefined }}
                  />
                  <span>
                    <span className="font-black text-slate-900">[{plant.location}구역{isLocB ? '·점선' : '·실선'}]</span> {plant.cleanName}
                    <span className="font-mono text-slate-500 ml-1">(학번: {plant.studentId})</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Large SVG Comparative Chart */}
        <div className="relative w-full overflow-x-auto select-none pt-2">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto min-w-[650px] overflow-visible"
          >
            {/* Grid lines and Y-axis ticks */}
            {yTicks.map((tick, i) => (
              <g key={i}>
                <line
                  x1={paddingLeft}
                  y1={tick.y}
                  x2={width - paddingRight}
                  y2={tick.y}
                  stroke="#e2e8f0"
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

            {/* X-axis date lines */}
            {allDates.map((date, dateIdx) => {
              const x = allDates.length <= 1
                ? paddingLeft + chartWidth / 2
                : paddingLeft + (dateIdx / (allDates.length - 1)) * chartWidth;

              return (
                <g key={date}>
                  <line
                    x1={x}
                    y1={paddingTop}
                    x2={x}
                    y2={paddingTop + chartHeight}
                    stroke="#e2e8f0"
                    strokeWidth="1"
                  />
                  <text
                    x={x}
                    y={paddingTop + chartHeight + 26}
                    textAnchor="middle"
                    className="text-xs fill-slate-700 font-bold"
                  >
                    {date}
                  </text>
                </g>
              );
            })}

            {/* Lines and Data Dots */}
            {matchingPlants.map((plant) => {
              const locCount = matchingPlants.filter(p => p.location === plant.location);
              const indexInLoc = locCount.findIndex(p => p.plantId === plant.plantId);
              const color = getLocationPlantColor(plant, indexInLoc);

              const plantPoints = plant.records.map((rec) => {
                const dateIdx = allDates.indexOf(rec.date);
                const x = allDates.length <= 1
                  ? paddingLeft + chartWidth / 2
                  : paddingLeft + (dateIdx / (allDates.length - 1)) * chartWidth;
                const val = currentMetric.accessor(rec);
                const y = paddingTop + chartHeight - ((val - yMin) / yRange) * chartHeight;
                return { x, y, val, rec };
              });

              const pathD = plantPoints.reduce((acc, pt, i) => {
                if (i === 0) return `M ${pt.x} ${pt.y}`;
                return `${acc} L ${pt.x} ${pt.y}`;
              }, '');

              return (
                <g key={plant.plantId}>
                  <path
                    d={pathD}
                    fill="none"
                    stroke={color}
                    strokeWidth={plant.location === 'B' ? '4.5' : '4'}
                    strokeDasharray={plant.location === 'B' ? '8 4' : undefined}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={0.95}
                  />

                  {plantPoints.map((pt) => (
                    <g
                      key={pt.rec.id}
                      className="cursor-pointer group"
                      onClick={() => setActivePhotoRecord(pt.rec)}
                    >
                      <circle cx={pt.x} cy={pt.y} r="22" fill="transparent" />
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="7"
                        fill="#ffffff"
                        stroke={color}
                        strokeWidth="3.5"
                        className="transition-transform group-hover:scale-130"
                      />
                      <g transform={`translate(${pt.x}, ${pt.y - 13})`}>
                        <text
                          x="0"
                          y="0"
                          textAnchor="middle"
                          className="text-xs font-black fill-slate-900 drop-shadow-xs"
                        >
                          {pt.val}
                        </text>
                      </g>
                    </g>
                  ))}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* 4. 동일 일자 사진 및 관찰 비교 (Side-by-Side Date Photo & Observation Comparison - MOVED UP!) */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5 mb-6">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Camera className="w-5 h-5 text-emerald-600" />
              동일 일자 위치별 사진 및 관찰 비교 (A vs B vs C)
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              동일한 측정 일자에 촬영된 각 위치 식물의 사진과 관찰 기록을 나란히 비교합니다.
            </p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {allDates.map((d) => (
              <button
                key={d}
                onClick={() => setSelectedCompareDate(d)}
                className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                  selectedCompareDate === d
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matchingPlants.map((plant) => {
            const recordOnDate = plant.records.find(r => r.date === selectedCompareDate);
            const thumbUrl = recordOnDate ? getDriveThumbnailSrc(recordOnDate.photoUrl, 500) : '';

            return (
              <div
                key={plant.plantId}
                className="bg-[#f8f9fd] rounded-2xl border border-slate-200/80 p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${LOCATION_DETAILS[plant.location].badgeClass}`}>
                        위치 {plant.location}
                      </span>
                      <strong className="text-sm font-black text-slate-900">{plant.cleanName}</strong>
                    </div>
                    <span className="text-xs text-amber-700 font-mono font-bold">
                      관찰자 학번: {plant.studentId}
                    </span>
                  </div>

                  {recordOnDate ? (
                    <div
                      onClick={() => setActivePhotoRecord(recordOnDate)}
                      className="cursor-pointer group relative aspect-4/3 w-full rounded-xl bg-slate-200 overflow-hidden mb-3 border border-slate-200 shadow-xs"
                    >
                      <img
                        src={thumbUrl}
                        alt={`${plant.cleanName} ${selectedCompareDate}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="px-3.5 py-2 rounded-xl bg-white text-slate-900 text-xs font-bold flex items-center gap-1.5 shadow-lg">
                          <Camera className="w-4 h-4 text-emerald-600" /> 크게 보기
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-4/3 w-full rounded-xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-center p-4 mb-3 text-slate-400">
                      <Camera className="w-8 h-8 mb-1 opacity-50" />
                      <span className="text-xs font-bold">{selectedCompareDate}에는</span>
                      <span className="text-[11px]">기록된 측정이 없습니다.</span>
                    </div>
                  )}

                  {recordOnDate && (
                    <div className="grid grid-cols-3 gap-1.5 text-center p-2 rounded-xl bg-white border border-slate-100 text-xs mb-3">
                      <div>
                        <span className="text-[10px] text-slate-400 block">키</span>
                        <strong className="text-emerald-700 font-bold">{recordOnDate.height}cm</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">잎 수</span>
                        <strong className="text-sky-700 font-bold">{recordOnDate.leafCount}장</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">잎 폭</span>
                        <strong className="text-amber-700 font-bold">{recordOnDate.leafWidth}cm</strong>
                      </div>
                    </div>
                  )}

                  {recordOnDate && (
                    <div className="text-xs text-slate-700 italic bg-white p-3 rounded-xl border border-slate-100 min-h-[44px]">
                      {recordOnDate.notes && recordOnDate.notes !== '없음'
                        ? `"${recordOnDate.notes}"`
                        : '특이사항 없음'}
                    </div>
                  )}
                </div>

                {onSelectPlantDetail && (
                  <button
                    onClick={() => onSelectPlantDetail(plant.plantId)}
                    className="w-full mt-4 py-2.5 px-3 text-xs font-bold rounded-xl bg-white hover:bg-slate-900 hover:text-white text-slate-800 border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>이 식물 단독 상세 차트 보기</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. 위치에 대한 사진과 환경 설명 (MOVED TO BOTTOM AS REQUESTED!) */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-emerald-600" />
          <h3 className="text-lg font-black text-slate-900">
            재배 구역별 (A · B · C) 현장 사진 및 환경 조건 상세
          </h3>
        </div>
        <p className="text-xs text-slate-500">
          * B와 C 공간은 바로 옆에 위치하고 있어 환기 정도가 동일하게 매우 우수합니다. C공간은 천창이 가까워 자연 태양광이 풍부합니다.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {(['A', 'B', 'C'] as const).map((locCode) => {
            const env = LOCATION_DETAILS[locCode];
            const stats = locationStats[locCode];
            const hasPlants = !!stats;

            return (
              <div
                key={locCode}
                className={`bg-white rounded-3xl border overflow-hidden shadow-sm flex flex-col justify-between transition-all ${
                  hasPlants
                    ? 'border-slate-200/80 hover:shadow-md'
                    : 'border-slate-100 opacity-60'
                }`}
              >
                <div>
                  {/* Photo Thumbnail of Location */}
                  <div className="relative aspect-16/10 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={env.photo}
                      alt={env.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-white text-slate-900 shadow-md">
                        {env.name}
                      </span>
                    </div>
                    <div className="absolute bottom-2.5 left-3 right-3 text-white">
                      <p className="text-xs font-bold leading-tight drop-shadow-md">
                        {env.subTitle}
                      </p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-5 space-y-3">
                    <p className="text-xs text-slate-600 leading-relaxed bg-[#f8f9fd] p-3 rounded-2xl border border-slate-100">
                      {env.description}
                    </p>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Sun className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                        <span className="text-slate-400">채광:</span>
                        <strong className="text-slate-800 truncate">{env.sunlightLevel}</strong>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Wind className="w-3.5 h-3.5 text-sky-500 flex-shrink-0" />
                        <span className="text-slate-400">환기:</span>
                        <strong className="text-slate-800 truncate">{env.ventilation}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Footer */}
                <div className="p-5 pt-0">
                  {hasPlants ? (
                    <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 rounded-xl bg-[#eaf8f2] text-emerald-900">
                        <span className="text-[10px] text-emerald-700 block mb-0.5">평균 키성장</span>
                        <strong className="text-sm font-black">
                          {stats.avgHeightGrowth > 0 ? `+${stats.avgHeightGrowth}` : stats.avgHeightGrowth}cm
                        </strong>
                      </div>
                      <div className="p-2 rounded-xl bg-[#edeffb] text-indigo-900">
                        <span className="text-[10px] text-indigo-700 block mb-0.5">평균 잎증감</span>
                        <strong className={`text-sm font-black ${stats.avgLeafGrowth < 0 ? 'text-rose-600' : ''}`}>
                          {stats.avgLeafGrowth > 0 ? `+${stats.avgLeafGrowth}장` : stats.avgLeafGrowth < 0 ? `${Math.abs(stats.avgLeafGrowth)}장 감소` : '0장'}
                        </strong>
                      </div>
                      <div className="p-2 rounded-xl bg-[#eaf4fe] text-sky-900">
                        <span className="text-[10px] text-sky-700 block mb-0.5">평균 건강</span>
                        <strong className="text-sm font-black">
                          {stats.avgHealth}점
                        </strong>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-400 py-2">
                      해당 위치에는 {selectedSpecies} 개체가 없습니다.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Photo Modal */}
      {activePhotoRecord && (
        <PhotoModal
          record={activePhotoRecord}
          onClose={() => setActivePhotoRecord(null)}
        />
      )}

      {/* Health Score Criteria Modal */}
      <HealthScoreModal
        isOpen={isHealthScoreModalOpen}
        onClose={() => setIsHealthScoreModalOpen(false)}
      />
    </div>
  );
};
