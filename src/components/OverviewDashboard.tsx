import React from 'react';
import { Plant, ObservationRecord } from '../types/plant';
import { LOCATION_DETAILS } from '../data/plantData';
import { LocationGalleryCard } from './LocationGalleryCard';
import { getDriveThumbnailSrc } from '../utils/imageHelper';
import {
  Sprout,
  Ruler,
  Leaf,
  Calendar,
  Award,
  Camera,
  MapPin,
  TrendingUp,
  ExternalLink,
} from 'lucide-react';

interface OverviewDashboardProps {
  plants: Plant[];
  records: ObservationRecord[];
  onSelectPlant: (plantId: string) => void;
  onSelectSpeciesComparison: (species: string) => void;
  onOpenPhoto: (record: ObservationRecord) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  plants,
  records,
  onSelectPlant,
  onSelectSpeciesComparison,
  onOpenPhoto,
}) => {
  const totalPlants = plants.length;
  const totalRecords = records.length;
  
  const avgHeightGrowth = (
    plants.reduce((sum, p) => sum + p.heightGrowth, 0) / (plants.length || 1)
  ).toFixed(2);

  const avgLeafGrowth = (
    plants.reduce((sum, p) => sum + p.leafGrowth, 0) / (plants.length || 1)
  ).toFixed(1);

  const topGrowthPlants = [...plants]
    .sort((a, b) => b.heightGrowth - a.heightGrowth)
    .slice(0, 4);

  const topLeafPlants = [...plants]
    .sort((a, b) => b.leafGrowth - a.leafGrowth)
    .slice(0, 4);

  const recentRecords = [...records]
    .sort((a, b) => b.dateTimestamp - a.dateTimestamp)
    .slice(0, 6);

  return (
    <div className="space-y-8">
      {/* Top 4 Pastel KPI Cards (Matching image.png!) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Plants (Soft Mint Pastel) */}
        <div className="bg-[#eaf8f2] border border-[#ceeedf] rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-emerald-800">총 관찰 식물</span>
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-emerald-700 shadow-xs">
              <Sprout className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {totalPlants} <span className="text-base font-normal text-slate-600">개체</span>
            </div>
            <span className="text-xs font-bold text-emerald-700 mt-2 block">
              위치 A · B · C 전 구역 정상 생육
            </span>
          </div>
        </div>

        {/* Total Records (Soft Lavender Pastel) */}
        <div className="bg-[#edeffb] border border-[#dadff8] rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-indigo-800">누적 관찰 일지</span>
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-indigo-700 shadow-xs">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {totalRecords} <span className="text-base font-normal text-slate-600">건</span>
            </div>
            <span className="text-xs font-bold text-indigo-700 mt-2 block">
              사진 및 관찰 측정값 등록 완료
            </span>
          </div>
        </div>

        {/* Height Growth (Soft Rose Pastel) */}
        <div className="bg-[#fcedf0] border border-[#f9d8de] rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-rose-800">평균 키 성장량</span>
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-rose-700 shadow-xs">
              <Ruler className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-1">
              +{avgHeightGrowth} <span className="text-base font-normal text-slate-600">cm</span>
            </div>
            <span className="text-xs font-bold text-rose-700 mt-2 block">
              전체 개체 평균 초장 성장 달성
            </span>
          </div>
        </div>

        {/* Leaf Increase (Soft Sky Pastel) */}
        <div className="bg-[#eaf4fe] border border-[#cde4fb] rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-sky-800">평균 잎 수 증가</span>
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-sky-700 shadow-xs">
              <Leaf className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-1">
              +{avgLeafGrowth} <span className="text-base font-normal text-slate-600">장</span>
            </div>
            <span className="text-xs font-bold text-sky-700 mt-2 block">
              신초 및 새 잎 건강 전개
            </span>
          </div>
        </div>
      </div>

      {/* Requirement 2: Real Photos of Location A, B, C */}
      <LocationGalleryCard
        plants={plants}
        onSelectPlant={onSelectPlant}
      />

      {/* Growth Leaderboards (Big bold cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Height Gain */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-7 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-6 h-6 text-amber-500" />
            <div>
              <h3 className="text-lg font-black text-slate-900">
                키 성장 우수 식물 TOP 4 (초장 증가량)
              </h3>
              <p className="text-xs text-slate-500">가장 왕성하게 키가 자란 식물 목록</p>
            </div>
          </div>
          <div className="space-y-3">
            {topGrowthPlants.map((plant, rank) => (
              <div
                key={plant.plantId}
                onClick={() => onSelectPlant(plant.plantId)}
                className="group cursor-pointer flex items-center justify-between p-3.5 rounded-2xl bg-[#f8f9fd] hover:bg-white border border-slate-200/80 hover:border-emerald-500 transition-all shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shadow-xs ${
                    rank === 0 ? 'bg-amber-400 text-slate-900' : rank === 1 ? 'bg-slate-300 text-slate-800' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {rank + 1}
                  </span>
                  <div>
                    <div className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors flex items-center gap-2">
                      {plant.cleanName}
                      <span className="text-xs text-amber-700 font-mono font-bold">
                        (관찰자 학번: {plant.studentId})
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">
                      위치 {plant.location}구역 · 초기 {plant.initialHeight}cm → 현재 {plant.latestHeight}cm
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-emerald-700">+{plant.heightGrowth}cm</span>
                  <span className="text-[11px] text-slate-400 block font-medium">
                    {plant.records.length}회차 측정
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Leaf Gain */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-7 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Leaf className="w-6 h-6 text-sky-500" />
            <div>
              <h3 className="text-lg font-black text-slate-900">
                새 잎 발생 우수 식물 TOP 4 (잎 증가량)
              </h3>
              <p className="text-xs text-slate-500">새 잎과 가지가 가장 많이 번성한 식물 목록</p>
            </div>
          </div>
          <div className="space-y-3">
            {topLeafPlants.map((plant, rank) => (
              <div
                key={plant.plantId}
                onClick={() => onSelectPlant(plant.plantId)}
                className="group cursor-pointer flex items-center justify-between p-3.5 rounded-2xl bg-[#f8f9fd] hover:bg-white border border-slate-200/80 hover:border-sky-500 transition-all shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shadow-xs ${
                    rank === 0 ? 'bg-sky-400 text-slate-900' : rank === 1 ? 'bg-slate-300 text-slate-800' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {rank + 1}
                  </span>
                  <div>
                    <div className="text-sm font-bold text-slate-900 group-hover:text-sky-700 transition-colors flex items-center gap-2">
                      {plant.cleanName}
                      <span className="text-xs text-amber-700 font-mono font-bold">
                        (관찰자 학번: {plant.studentId})
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">
                      위치 {plant.location}구역 · 초기 {plant.initialLeafCount}장 → 현재 {plant.latestLeafCount}장
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-sky-700">+{plant.leafGrowth}장</span>
                  <span className="text-[11px] text-slate-400 block font-medium">
                    건강 {plant.latestHealthScore}점
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Photo Feed */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Camera className="w-5 h-5 text-emerald-600" />
              최근 업로드된 관찰 일지 & 사진 피드
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              학생들이 최근 기록한 측정 사진과 특이사항을 빠르게 확인합니다.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {recentRecords.map((rec) => {
            const thumbUrl = getDriveThumbnailSrc(rec.photoUrl, 350);

            return (
              <div
                key={rec.id}
                onClick={() => onOpenPhoto(rec)}
                className="group cursor-pointer bg-[#f8f9fd] hover:bg-white rounded-2xl border border-slate-200/80 hover:border-emerald-500 p-3 transition-all hover:-translate-y-1 hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-square w-full rounded-xl bg-slate-200 overflow-hidden mb-2.5 border border-slate-100">
                    <img
                      src={thumbUrl}
                      alt={rec.plantDisplayName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-black bg-slate-900/80 text-white">
                      {rec.date}
                    </span>
                    <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  <div className="text-xs font-bold text-slate-900 truncate">
                    {rec.plantDisplayName}
                  </div>
                  <div className="text-[11px] text-amber-700 font-mono font-bold mt-0.5">
                    관찰자 학번: {rec.studentId}
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                  <span className="text-emerald-700 font-bold">{rec.height}cm</span>
                  <span className="text-slate-600">{rec.leafCount}장</span>
                  <span className="text-violet-700 font-bold">{rec.healthScore}점</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
