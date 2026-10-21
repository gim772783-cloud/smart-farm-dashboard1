import React, { useState } from 'react';
import { LOCATION_DETAILS } from '../data/plantData';
import { Plant } from '../types/plant';
import { MapPin, Sun, Wind, X } from 'lucide-react';

interface LocationGalleryCardProps {
  plants: Plant[];
  onSelectPlant?: (plantId: string) => void;
  selectedLocation?: 'A' | 'B' | 'C' | null;
  onFilterLocation?: (loc: 'A' | 'B' | 'C') => void;
}

export const LocationGalleryCard: React.FC<LocationGalleryCardProps> = ({
  plants,
  onSelectPlant,
  selectedLocation,
}) => {
  const [activeZoomPhoto, setActiveZoomPhoto] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Title & Introduction */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <MapPin className="w-7 h-7 text-emerald-600" />
            재배 구역별 (A · B · C) 현장 사진 및 환경 분석
          </h3>
          <p className="text-sm sm:text-base text-slate-600 mt-1">
            홍천농업고등학교 교내 실제 재배 공간의 조명, 일조량, 환기 조건을 비교 분석합니다.
          </p>
        </div>
      </div>

      {/* 채광 & 환기 조건 한눈에 비교하기 매트릭스 카드 (설명 유지) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Sun className="w-5 h-5 text-amber-500" />
          <h4 className="text-base sm:text-lg font-black text-slate-900">
            ☀️ A · B · C 구역 채광 & 환기 조건 한눈에 비교하기
          </h4>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mb-4">
          세 구역의 채광 광원(전용 조명, 형광등, 자연 채광) 유입 여부와 환기 수준을 직접 비교할 수 있습니다.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-[#f8f9fd] text-slate-700">
                <th className="py-3 px-4 font-black">구분 / 환경 요소</th>
                <th className="py-3 px-4 font-black text-emerald-800">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    위치 A 구역 (통행로)
                  </div>
                </th>
                <th className="py-3 px-4 font-black text-blue-800">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    위치 B 구역 (창문 인접)
                  </div>
                </th>
                <th className="py-3 px-4 font-black text-purple-800">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                    위치 C 구역 (천창 직하)
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {/* Row 1: 채광/조명 구성 */}
              <tr className="hover:bg-slate-50/60">
                <td className="py-3.5 px-4 font-bold text-slate-600 bg-slate-50/50">
                  채광/조명 구성
                </td>
                <td className="py-3.5 px-4 font-bold text-emerald-900">
                  플랜트월 전용 조명 + 교내 형광등
                </td>
                <td className="py-3.5 px-4 font-bold text-blue-900">
                  플랜트월 전용 조명 + 교내 형광등 + 자연 채광 약하게 들어옴
                </td>
                <td className="py-3.5 px-4 font-bold text-purple-900">
                  교내 형광등 + 천창의 유리창을 통한 자연 채광
                </td>
              </tr>
              {/* Row 2: 전용 조명 */}
              <tr className="hover:bg-slate-50/60">
                <td className="py-3 px-4 font-bold text-slate-600 bg-slate-50/50">
                  플랜트월 전용 조명
                </td>
                <td className="py-3 px-4 text-emerald-700 font-bold">
                  ⭕ 가동 (인공광 집중)
                </td>
                <td className="py-3 px-4 text-blue-700 font-bold">
                  ⭕ 가동 (인공광 집중)
                </td>
                <td className="py-3 px-4 text-slate-400">
                  ❌ 없음 (자연광 대체)
                </td>
              </tr>
              {/* Row 3: 자연 채광 */}
              <tr className="hover:bg-slate-50/60">
                <td className="py-3 px-4 font-bold text-slate-600 bg-slate-50/50">
                  자연 채광 (햇빛)
                </td>
                <td className="py-3 px-4 text-slate-500">
                  ❌ 없음 (실내 간접광)
                </td>
                <td className="py-3 px-4 text-blue-700 font-bold">
                  ⛅ 약하게 들어옴 (측면 창문)
                </td>
                <td className="py-3 px-4 text-purple-700 font-black">
                  ☀️ 풍부함 (천창 스카이라이트 직하)
                </td>
              </tr>
              {/* Row 4: 환기 조건 */}
              <tr className="hover:bg-slate-50/60">
                <td className="py-3 px-4 font-bold text-slate-600 bg-slate-50/50">
                  환기 조건 (통풍)
                </td>
                <td className="py-3 px-4 text-slate-700 font-medium">
                  보통 정도 (교내 통행로 공기 순환)
                </td>
                <td className="py-3 px-4 text-blue-700 font-bold">
                  🌬️ 매우 우수 (창문 인접 · C와 동일)
                </td>
                <td className="py-3 px-4 text-purple-700 font-bold">
                  🌬️ 매우 우수 (B 바로 옆 · 환기 동일)
                </td>
              </tr>
              {/* Row 5: 공간 특성 */}
              <tr className="hover:bg-slate-50/60">
                <td className="py-3 px-4 font-bold text-slate-600 bg-slate-50/50">
                  공간 특성
                </td>
                <td className="py-3 px-4 text-slate-700">
                  학생 이동 많은 통행로 (실내 온도 일정)
                </td>
                <td className="py-3 px-4 text-slate-700">
                  탁 트인 개방 공간 (자습/휴게)
                </td>
                <td className="py-3 px-4 text-slate-700">
                  천창 하부 2층 플랜터 화단 (낮 시간 온난)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 3 Location Photo Cards with User's Fixed Photos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(['A', 'B', 'C'] as const).map((code) => {
          const loc = LOCATION_DETAILS[code];
          const locPlants = plants.filter(p => p.location === code);
          const isSelected = selectedLocation === code;

          return (
            <div
              key={code}
              className={`bg-white rounded-3xl border overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                isSelected
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                  : 'border-slate-200/90 hover:border-slate-300'
              }`}
            >
              <div>
                {/* Fixed Real Location Photo Container */}
                <div
                  className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden cursor-pointer group"
                  onClick={() => setActiveZoomPhoto(loc.photo)}
                >
                  <img
                    src={loc.photo}
                    alt={loc.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-90" />
                  
                  {/* Left Badge: Location Name and Plant Count */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs sm:text-sm font-black bg-white/95 text-slate-900 shadow-md backdrop-blur-md">
                      {loc.name}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-sm">
                      식물 {locPlants.length}개체
                    </span>
                  </div>

                  {/* Note: '기본 예시 사진' badge has been removed as requested */}

                  {/* Bottom title and '크게 보기' button */}
                  <div className="absolute bottom-3 left-3 right-3 text-white flex items-end justify-between gap-2">
                    <h4 className="text-sm sm:text-base font-bold leading-snug drop-shadow-md flex-1">
                      {loc.subTitle}
                    </h4>
                    <span className="text-xs text-emerald-300 font-bold underline shrink-0 hover:text-emerald-200 transition-colors">
                      크게 보기 🔍
                    </span>
                  </div>
                </div>

                {/* Body Details (All explanatory texts maintained exactly as is) */}
                <div className="p-5 sm:p-6 space-y-4">
                  {/* Core description */}
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-[#f8f9fd] p-3.5 rounded-2xl border border-slate-100 font-medium">
                    {loc.description}
                  </p>

                  {/* Environmental Metrics List */}
                  <div className="space-y-2.5 text-xs sm:text-sm">
                    <div className="flex items-start gap-2.5 text-slate-700">
                      <Sun className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-slate-500 font-medium">채광/조명: </span>
                        <strong className="text-slate-900 font-bold">{loc.sunlightLevel}</strong>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 text-slate-700">
                      <Wind className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-slate-500 font-medium">환기 조건: </span>
                        <span className="text-slate-800 font-medium">{loc.ventilation}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer with Plant Chips */}
              <div className="p-5 sm:p-6 pt-0">
                <div className="pt-3.5 border-t border-slate-100">
                  <div className="text-xs font-bold text-slate-500 mb-2">
                    배치 식물 ({locPlants.length}개체):
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {locPlants.map(p => (
                      <button
                        key={p.plantId}
                        onClick={() => onSelectPlant && onSelectPlant(p.plantId)}
                        className="px-2.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-800 transition-all cursor-pointer"
                      >
                        {p.cleanName}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Photo Zoom Modal (크게 보기 유지) */}
      {activeZoomPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
          onClick={() => setActiveZoomPhoto(null)}
        >
          <div 
            className="relative max-w-5xl max-h-[92vh] bg-white rounded-3xl p-3 overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={activeZoomPhoto}
              alt="위치 현장 사진"
              className="w-full h-auto max-h-[82vh] object-contain rounded-2xl"
              referrerPolicy="no-referrer"
            />
            <button
              onClick={() => setActiveZoomPhoto(null)}
              className="absolute top-5 right-5 px-4 py-2 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white text-xs sm:text-sm font-bold shadow-lg cursor-pointer flex items-center gap-1.5"
            >
              <X className="w-4 h-4" />
              <span>닫기</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
