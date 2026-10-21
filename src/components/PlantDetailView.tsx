import React, { useState, useMemo } from 'react';
import { Plant, ObservationRecord } from '../types/plant';
import { GrowthChart } from './GrowthChart';
import { SpeciesInfoCard } from './SpeciesInfoCard';
import { PhotoModal } from './PhotoModal';
import { HealthScoreModal } from './HealthScoreModal';
import { getDriveThumbnailSrc } from '../utils/imageHelper';
import { LOCATION_DETAILS, SPECIES_INFO_MAP } from '../data/plantData';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  User,
  MapPin,
  Calendar,
  Ruler,
  Leaf,
  Maximize2,
  Sparkles,
  Camera,
  Printer,
  TrendingUp,
  Sun,
  Wind,
  Info,
  Award,
  HelpCircle,
} from 'lucide-react';

interface PlantDetailViewProps {
  plants: Plant[];
  selectedPlantId: string;
  onSelectPlantId: (plantId: string) => void;
  onNavigateToComparison?: (species: string) => void;
  onOpenReportPrint?: (plant: Plant) => void;
}

export const PlantDetailView: React.FC<PlantDetailViewProps> = ({
  plants,
  selectedPlantId,
  onSelectPlantId,
  onNavigateToComparison,
  onOpenReportPrint,
}) => {
  const [activePhotoRecord, setActivePhotoRecord] = useState<ObservationRecord | null>(null);
  const [filterLocation, setFilterLocation] = useState<'ALL' | 'A' | 'B' | 'C'>('ALL');
  const [showLocationPhotoModal, setShowLocationPhotoModal] = useState(false);
  const [isHealthScoreModalOpen, setIsHealthScoreModalOpen] = useState(false);

  // Filtered plant list
  const filteredPlants = filterLocation === 'ALL'
    ? plants
    : plants.filter(p => p.location === filterLocation);

  const currentPlant = plants.find(p => p.plantId === selectedPlantId) || plants[0];
  const currentIndex = plants.findIndex(p => p.plantId === currentPlant.plantId);

  const hasPrevPlant = currentIndex > 0;
  const hasNextPlant = currentIndex < plants.length - 1;

  const handlePrevPlant = () => {
    if (hasPrevPlant) {
      onSelectPlantId(plants[currentIndex - 1].plantId);
    }
  };

  const handleNextPlant = () => {
    if (hasNextPlant) {
      onSelectPlantId(plants[currentIndex + 1].plantId);
    }
  };

  const locationInfo = LOCATION_DETAILS[currentPlant.location];
  const speciesInfo = SPECIES_INFO_MAP[currentPlant.species] || {
    name: currentPlant.species,
    scientificName: '',
    family: '',
    characteristics: ['실내 환경에 적응력이 우수하며 공기정화 능력이 탁월합니다.'],
    airPurification: '실내 공기 정화',
  };

  // Requirement 2: Find the "best shot" photo taken by the student for this specific plant
  // Criteria: Highest health score (5점) and latest date
  const bestShotRecord = useMemo(() => {
    if (!currentPlant.records || currentPlant.records.length === 0) return null;
    const sorted = [...currentPlant.records].sort((a, b) => {
      // Prioritize 5 points, then latest timestamp
      if (b.healthScore !== a.healthScore) {
        return b.healthScore - a.healthScore;
      }
      return b.dateTimestamp - a.dateTimestamp;
    });
    return sorted[0];
  }, [currentPlant]);

  const bestPhotoThumb = bestShotRecord ? getDriveThumbnailSrc(bestShotRecord.photoUrl, 600) : '';

  // Requirement 2: 관찰 결과를 종합하여 1~2문장 정도로 정리한 식물 관찰 요약 생성
  const observationSummary = useMemo(() => {
    const hGrowth = currentPlant.heightGrowth;
    const hText = hGrowth > 0 ? `+${hGrowth}cm 성장` : hGrowth < 0 ? `${Math.abs(hGrowth)}cm 감소` : '유지';
    const lGrowth = currentPlant.leafGrowth;
    const lText = lGrowth > 0 ? `${lGrowth}장 증가` : lGrowth < 0 ? `${Math.abs(lGrowth)}장 감소` : '변동 없음';
    
    // Notes highlights from student observation log
    const notableNotes = currentPlant.records
      .map(r => r.notes?.trim())
      .filter(n => n && n !== '없음' && n !== '없슴!' && n !== '정상' && n !== '특이사항 없음' && n !== '특이사항은 딱히없음.' && n !== '특이사항 딱히없음. ' && n !== '상한 부분이나ㅜ망가진 곳이 없음');
    
    const highlightNote = notableNotes.length > 0 ? notableNotes[notableNotes.length - 1] : '';
    const noteSnippet = highlightNote ? ` (최근 특이사항: "${highlightNote}")` : '';

    const healthLevel = currentPlant.latestHealthScore >= 5
      ? '매우 활발하고 우수한 생육 상태'
      : currentPlant.latestHealthScore >= 4
      ? '건강하고 안정적인 생육 상태'
      : '환경 점검 및 주의가 필요한 보통 상태';

    return `총 ${currentPlant.records.length}회차 관찰 동안 식물 키는 초기 ${currentPlant.initialHeight}cm에서 최종 ${currentPlant.latestHeight}cm로 ${hText}하였고, 잎의 개수는 ${currentPlant.initialLeafCount}장에서 ${currentPlant.latestLeafCount}장으로 ${lText}하여 최종 건강 점수 ${currentPlant.latestHealthScore}점으로 ${healthLevel}를 유지하고 있습니다.${noteSnippet}`;
  }, [currentPlant]);

  return (
    <div className="space-y-6">
      {/* Top Controller Bar */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Plant Selector & Quick Location Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
          {/* Location quick filter pill */}
          <div className="flex items-center gap-1 bg-[#f4f5fa] p-1.5 rounded-2xl border border-slate-200/60 text-xs sm:text-sm">
            {(['ALL', 'A', 'B', 'C'] as const).map(loc => (
              <button
                key={loc}
                onClick={() => setFilterLocation(loc)}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  filterLocation === loc
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                {loc === 'ALL' ? '전체 위치' : `위치 ${loc}`}
              </button>
            ))}
          </div>

          {/* Plant Dropdown (관찰자 학번: "" 로 표시) */}
          <div className="relative flex-1 max-w-md">
            <label htmlFor="plant-select" className="sr-only">식물 선택</label>
            <div className="relative">
              <select
                id="plant-select"
                value={currentPlant.plantId}
                onChange={(e) => onSelectPlantId(e.target.value)}
                className="w-full appearance-none bg-[#f8f9fd] border border-slate-200 hover:border-slate-300 focus:border-emerald-600 text-slate-900 rounded-2xl px-4 py-3.5 pr-10 text-sm sm:text-base font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
              >
                {filteredPlants.map((p) => (
                  <option key={p.plantId} value={p.plantId}>
                    [{p.location}구역] {p.cleanName} · (관찰자 학번: {p.studentId})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Action Buttons: Comparison, Report Print, Prev/Next */}
        <div className="flex items-center gap-2 self-end md:self-auto flex-wrap">
          {onOpenReportPrint && (
            <button
              onClick={() => onOpenReportPrint(currentPlant)}
              className="flex items-center gap-2 px-4.5 py-3 rounded-2xl bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>1페이지 보고서 인쇄</span>
            </button>
          )}

          {onNavigateToComparison && (
            <button
              onClick={() => onNavigateToComparison(currentPlant.species)}
              className="px-4 py-3 text-xs sm:text-sm font-bold rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <TrendingUp className="w-4 h-4" />
              <span>동일 종 위치 비교</span>
            </button>
          )}

          <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
            <button
              onClick={handlePrevPlant}
              disabled={!hasPrevPlant}
              className={`p-2.5 rounded-2xl border transition-colors cursor-pointer ${
                hasPrevPlant
                  ? 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                  : 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'
              }`}
              title="이전 식물"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs sm:text-sm text-slate-600 font-mono font-bold px-2">
              {currentIndex + 1} / {plants.length}
            </span>
            <button
              onClick={handleNextPlant}
              disabled={!hasNextPlant}
              className={`p-2.5 rounded-2xl border transition-colors cursor-pointer ${
                hasNextPlant
                  ? 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                  : 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'
              }`}
              title="다음 식물"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modern Pastel Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Height */}
        <div className="bg-[#eaf8f2] border border-[#ceeedf] rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-bold text-emerald-800">식물 키 (초장)</span>
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-emerald-700 shadow-xs">
              <Ruler className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {currentPlant.latestHeight}
              <span className="text-sm sm:text-base font-normal text-slate-600 ml-1">cm</span>
            </div>
            <div className="flex items-center justify-between mt-2.5 text-xs sm:text-sm">
              <span className="text-emerald-700 font-bold">
                {currentPlant.heightGrowth >= 0
                  ? `+${currentPlant.heightGrowth}cm 성장`
                  : `${Math.abs(currentPlant.heightGrowth)}cm 감소`}
              </span>
              <span className="text-slate-500">초기 {currentPlant.initialHeight}cm</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Leaf Count (Requirement: 증가 시 앞의 + 빼고, 감소 시와 글자 크기 같게 text-sm font-bold 일치) */}
        <div className="bg-[#edeffb] border border-[#dadff8] rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-bold text-indigo-800">잎의 개수</span>
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-indigo-700 shadow-xs">
              <Leaf className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {currentPlant.latestLeafCount}
              <span className="text-sm sm:text-base font-normal text-slate-600 ml-1">장</span>
            </div>
            <div className="flex items-center justify-between mt-2.5 text-xs sm:text-sm">
              {/* Requirement: When increased, remove '+' and keep font size strictly identical to decreased */}
              <span className={`text-sm font-bold ${
                currentPlant.leafGrowth > 0
                  ? 'text-indigo-700'
                  : currentPlant.leafGrowth < 0
                  ? 'text-rose-600'
                  : 'text-slate-600'
              }`}>
                {currentPlant.leafGrowth > 0
                  ? `${currentPlant.leafGrowth}장 증가`
                  : currentPlant.leafGrowth < 0
                  ? `${Math.abs(currentPlant.leafGrowth)}장 감소`
                  : '변동 없음'}
              </span>
              <span className="text-slate-500">초기 {currentPlant.initialLeafCount}장</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Leaf Width */}
        <div className="bg-[#fcedf0] border border-[#f9d8de] rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-bold text-rose-800">대표 잎 폭</span>
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-rose-700 shadow-xs">
              <Maximize2 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {currentPlant.records[currentPlant.records.length - 1]?.leafWidth || 0}
              <span className="text-sm sm:text-base font-normal text-slate-600 ml-1">cm</span>
            </div>
            <div className="flex items-center justify-between mt-2.5 text-xs sm:text-sm">
              <span className="text-rose-700 font-bold">생육 잎너비</span>
              <span className="text-slate-500">초기 {currentPlant.records[0]?.leafWidth || 0}cm</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Health Score (Requirement: 점수 기준을 클릭하면 볼 수 있도록 모달 연결) */}
        <div
          onClick={() => setIsHealthScoreModalOpen(true)}
          className="bg-[#eaf4fe] hover:bg-[#deeeff] border border-[#cde4fb] hover:border-sky-400 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col justify-between cursor-pointer transition-all group"
          title="클릭하여 생육 건강 상태 평가 기준표 보기"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-bold text-sky-800 flex items-center gap-1.5">
              <span>생육 건강 상태</span>
              <HelpCircle className="w-3.5 h-3.5 text-sky-500 group-hover:text-sky-700 transition-colors" />
            </span>
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-sky-700 shadow-xs group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {currentPlant.latestHealthScore}
                <span className="text-sm sm:text-base font-normal text-slate-600 ml-1">/ 5점</span>
              </div>
              <span className="text-[11px] font-bold text-sky-700 bg-white/80 group-hover:bg-sky-600 group-hover:text-white px-2 py-0.5 rounded-full border border-sky-200 transition-colors">
                기준표 보기 ⓘ
              </span>
            </div>
            <div className="flex items-center justify-between mt-2.5 text-xs sm:text-sm">
              <span className="text-sky-800 font-bold">
                {currentPlant.latestHealthScore >= 5 ? '🌟 매우 양호' : currentPlant.latestHealthScore >= 4 ? '🙂 양호' : '😐 보통'}
              </span>
              <span className="text-slate-500">총 {currentPlant.records.length}회차 기록</span>
            </div>
          </div>
        </div>
      </div>

      {/* Requirement 2: 위치 특징 설명 + 학생 베스트 사진 + '식물 관찰 요약' */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* 학생이 찍은 그 식물의 사진 중 가장 잘 나온 사진 (Best Shot) */}
          <div
            onClick={() => bestShotRecord && setActivePhotoRecord(bestShotRecord)}
            className="relative w-full lg:w-72 aspect-4/3 rounded-2xl overflow-hidden bg-slate-200 border border-slate-200 cursor-pointer group flex-shrink-0 shadow-xs"
          >
            {bestShotRecord ? (
              <img
                src={bestPhotoThumb}
                alt={`${currentPlant.cleanName} 대표 사진`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                사진 로딩 중...
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            
            {/* Badge indicating this is student's best photograph */}
            <div className="absolute top-2.5 left-2.5">
              <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-amber-400 text-slate-950 shadow-md flex items-center gap-1">
                <Award className="w-3.5 h-3.5" />
                학생 관찰 대표 사진 (베스트)
              </span>
            </div>

            <div className="absolute bottom-2.5 left-3 right-3 text-white text-xs sm:text-sm flex items-center justify-between font-bold">
              <span>측정일: {bestShotRecord?.date} (건강 {bestShotRecord?.healthScore}점)</span>
              <span className="text-xs underline text-emerald-300">크게 보기</span>
            </div>
          </div>

          {/* Plant Observation Summary & Location Environment Explanations */}
          <div className="flex-1 space-y-3.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-black ${locationInfo.badgeClass}`}>
                {locationInfo.name}
              </span>
              <span className="px-3 py-1 rounded-full text-xs sm:text-sm font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1 font-mono">
                <User className="w-3.5 h-3.5" />
                관찰자 학번: {currentPlant.studentId}
              </span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                {currentPlant.cleanName}
                <span className="text-xs sm:text-sm px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
                  {speciesInfo.family}
                </span>
              </h2>
            </div>

            {/* Requirement 2: '식물 특징 요약' -> '식물 관찰 요약'으로 바꾸고, 관찰 결과를 종합하여 1~2문장 정도로 정리 */}
            <div className="p-4 sm:p-4.5 rounded-2xl bg-[#f0fdf4] border border-[#dcfce7] text-sm sm:text-base text-emerald-950 leading-relaxed shadow-xs">
              <div className="flex items-center justify-between mb-1.5">
                <strong className="text-emerald-900 font-black text-sm sm:text-base flex items-center gap-1.5">
                  🌿 식물 관찰 요약
                </strong>
                <span className="text-xs font-bold text-emerald-700 bg-white/80 px-2 py-0.5 rounded-full border border-emerald-200">
                  측정 데이터 종합 분석
                </span>
              </div>
              <p className="text-slate-800 text-xs sm:text-sm font-medium leading-relaxed">
                {observationSummary}
              </p>
            </div>

            {/* A, B, C 위치의 환경 특징 설명 (Location characteristics brief summary) */}
            <div className="p-4 rounded-2xl bg-[#f8f9fd] border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <strong className="text-slate-900 font-black flex items-center gap-1 mb-1 text-sm">
                📍 {locationInfo.name} 생육 환경 특징:
              </strong>
              <p className="text-xs sm:text-sm text-slate-600">{locationInfo.description}</p>
              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-600 pt-2.5 border-t border-slate-200/60 mt-2.5">
                <span className="flex items-center gap-1">
                  <Sun className="w-4 h-4 text-amber-500" />
                  <strong>채광/조명:</strong> {locationInfo.sunlightLevel}
                </span>
                <span className="flex items-center gap-1">
                  <Wind className="w-4 h-4 text-sky-500" />
                  <strong>환기:</strong> {locationInfo.ventilation}
                </span>
                <button
                  onClick={() => setShowLocationPhotoModal(true)}
                  className="ml-auto text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 underline cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  위치 현장 사진 보기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enlarged Growth Chart Component */}
      <GrowthChart
        records={currentPlant.records}
        onSelectRecord={(rec) => setActivePhotoRecord(rec)}
        selectedRecordId={activePhotoRecord?.id}
      />

      {/* Observation Journal & Photo Cards Strip */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Camera className="w-5 h-5 text-emerald-600" />
              측정 일자별 식물 관찰 일지 & 사진 갤러리
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              학생이 촬영한 원본 사진을 클릭하면 고화질 뷰어로 크게 확인하고 일지를 검토할 수 있습니다.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {currentPlant.records.map((rec, index) => {
            const thumbUrl = getDriveThumbnailSrc(rec.photoUrl, 450);
            const isLatest = index === currentPlant.records.length - 1;

            return (
              <div
                key={rec.id}
                onClick={() => setActivePhotoRecord(rec)}
                className="group cursor-pointer bg-[#f8f9fd] hover:bg-white rounded-2xl border border-slate-200/80 hover:border-emerald-500 p-3.5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-4/3 w-full rounded-xl bg-slate-200 overflow-hidden mb-3 border border-slate-100">
                    <img
                      src={thumbUrl}
                      alt={`${rec.plantDisplayName} ${rec.date}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />

                    <span className="absolute top-2 left-2 px-2.5 py-1 rounded-lg text-[10px] font-black bg-slate-900/80 text-white backdrop-blur-md">
                      {rec.date}
                    </span>

                    {isLatest && (
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-600 text-white shadow-sm">
                        최신 기록
                      </span>
                    )}

                    <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="px-3 py-1.5 rounded-xl bg-white text-slate-900 text-xs font-bold flex items-center gap-1 shadow-lg">
                        <Camera className="w-3.5 h-3.5 text-emerald-600" /> 사진 보기
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1 text-center py-2 px-2 bg-white rounded-xl text-xs mb-2.5 border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block">키</span>
                      <strong className="text-emerald-700 font-bold">{rec.height}</strong>
                      <span className="text-[10px] text-slate-400">cm</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">잎수</span>
                      <strong className="text-sky-700 font-bold">{rec.leafCount}</strong>
                      <span className="text-[10px] text-slate-400">장</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">잎폭</span>
                      <strong className="text-amber-700 font-bold">{rec.leafWidth}</strong>
                      <span className="text-[10px] text-slate-400">cm</span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-700 line-clamp-2 italic px-1 min-h-[34px]">
                    {rec.notes && rec.notes.trim() !== '없음' ? (
                      `"${rec.notes}"`
                    ) : (
                      <span className="text-slate-400 not-italic text-[11px]">특이사항 없음</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-200/60 text-xs">
                  <span className="text-slate-500 font-medium font-mono">
                    관찰자 학번: <strong className="text-slate-800">{rec.studentId}</strong>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px]">
                    건강 {rec.healthScore}점
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Plant Botanical Characteristics Card */}
      <SpeciesInfoCard speciesName={currentPlant.species} />

      {/* Photo Modal */}
      {activePhotoRecord && (
        <PhotoModal
          record={activePhotoRecord}
          recordsList={currentPlant.records}
          onClose={() => setActivePhotoRecord(null)}
          onSelectRecord={(rec) => setActivePhotoRecord(rec)}
        />
      )}

      {/* Location Photo Zoom Modal */}
      {showLocationPhotoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setShowLocationPhotoModal(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-3xl p-5 overflow-hidden shadow-2xl">
            <img
              src={locationInfo.photo}
              alt={locationInfo.name}
              className="w-full h-auto max-h-[75vh] object-contain rounded-2xl"
              referrerPolicy="no-referrer"
            />
            <div className="mt-3 text-slate-800">
              <h4 className="text-base font-bold">{locationInfo.name} - {locationInfo.subTitle}</h4>
              <p className="text-xs text-slate-500 mt-1">{locationInfo.description}</p>
            </div>
            <button
              onClick={() => setShowLocationPhotoModal(false)}
              className="absolute top-6 right-6 px-3.5 py-1.5 rounded-full bg-slate-900 text-white text-xs font-bold shadow-lg cursor-pointer"
            >
              닫기 ✕
            </button>
          </div>
        </div>
      )}

      {/* Health Score Criteria Modal */}
      <HealthScoreModal
        isOpen={isHealthScoreModalOpen}
        onClose={() => setIsHealthScoreModalOpen(false)}
      />
    </div>
  );
};

