import React from 'react';
import { SPECIES_INFO_MAP } from '../data/plantData';
import { Sun, Droplets, Thermometer, Wind, Sparkles, BookOpen, ShieldCheck, Heart } from 'lucide-react';

interface SpeciesInfoCardProps {
  speciesName: string;
}

export const SpeciesInfoCard: React.FC<SpeciesInfoCardProps> = ({ speciesName }) => {
  const info = SPECIES_INFO_MAP[speciesName] || {
    name: speciesName,
    scientificName: 'Botanical Plant',
    englishName: speciesName,
    family: '관엽식물',
    origin: '열대 및 아열대 지역',
    sunlight: '밝은 간접광 선호',
    watering: '겉흙이 마르면 충분히 관수',
    temperature: '18℃ ~ 25℃',
    humidity: '50% ~ 60%',
    characteristics: ['실내 환경에 적응력이 우수하며 공기정화 능력이 탁월합니다.'],
    careTips: ['과습에 유의하고 통풍이 잘되는 밝은 그늘에서 관리하세요.'],
    airPurification: '실내 미세먼지 및 유해물질 정화 효과 우수 ★★★★☆',
    imageEmoji: '🌱',
    colorTheme: 'emerald',
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#eaf8f2] border border-[#ceeedf] flex items-center justify-center text-3xl shadow-xs">
            {info.imageEmoji}
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">{info.name}</h3>
              <span className="text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-bold">
                {info.family}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-mono">
              <span className="italic font-semibold text-slate-700">{info.scientificName}</span> ({info.englishName})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold flex items-center gap-1.5">
            <BookOpen className="w-4 h-4" />
            원예 생육 도감 & 생태 특성
          </span>
        </div>
      </div>

      {/* 4 Essential Care Conditions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
        {/* Sunlight */}
        <div className="p-4 rounded-2xl bg-[#fffbeb] border border-[#fef3c7]">
          <div className="flex items-center gap-2 text-amber-800 text-xs font-bold mb-1.5">
            <Sun className="w-4 h-4 text-amber-600" />
            <span>권장 일조량 / 광도</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 leading-snug">{info.sunlight}</p>
        </div>

        {/* Watering */}
        <div className="p-4 rounded-2xl bg-[#eff6ff] border border-[#dbeafe]">
          <div className="flex items-center gap-2 text-blue-800 text-xs font-bold mb-1.5">
            <Droplets className="w-4 h-4 text-blue-600" />
            <span>물주기 (관수 요령)</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 leading-snug">{info.watering}</p>
        </div>

        {/* Temperature */}
        <div className="p-4 rounded-2xl bg-[#fdf2f8] border border-[#fce7f3]">
          <div className="flex items-center gap-2 text-pink-800 text-xs font-bold mb-1.5">
            <Thermometer className="w-4 h-4 text-pink-600" />
            <span>적정 생육 온도</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 leading-snug">{info.temperature}</p>
        </div>

        {/* Humidity & Ventilation */}
        <div className="p-4 rounded-2xl bg-[#ecfdf5] border border-[#d1fae5]">
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold mb-1.5">
            <Wind className="w-4 h-4 text-emerald-600" />
            <span>습도 & 통풍</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 leading-snug">{info.humidity}</p>
        </div>
      </div>

      {/* Main Characteristics & Care Tips Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        {/* Characteristics */}
        <div className="bg-[#f8f9fd] rounded-2xl p-5 border border-slate-100">
          <h4 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-3.5">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            주요 생태적 특징
          </h4>
          <ul className="space-y-2.5">
            {info.characteristics.map((c, i) => (
              <li key={i} className="text-xs sm:text-sm text-slate-700 flex items-start gap-2.5 leading-relaxed">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Care Tips */}
        <div className="bg-[#f8f9fd] rounded-2xl p-5 border border-slate-100">
          <h4 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-3.5">
            <Heart className="w-4 h-4 text-rose-500" />
            관찰 및 재배 핵심 실습 팁
          </h4>
          <ul className="space-y-2.5">
            {info.careTips.map((tip, i) => (
              <li key={i} className="text-xs sm:text-sm text-slate-700 flex items-start gap-2.5 leading-relaxed">
                <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom Air Purification Banner */}
      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-700 flex-shrink-0" />
          <div className="leading-snug">
            <span className="text-slate-600 font-medium">원산지: </span>
            <strong className="text-emerald-950">{info.origin}</strong>
            <span className="mx-2 text-slate-300">|</span>
            <span className="text-slate-600 font-medium">공기 정화 효능: </span>
            <strong className="text-emerald-950">{info.airPurification}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
