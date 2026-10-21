import React from 'react';
import { X, Sparkles, CheckCircle2, AlertTriangle, AlertCircle, HelpCircle, Info } from 'lucide-react';

interface HealthScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HEALTH_SCORE_RUBRIC = [
  {
    score: 5,
    title: '5점 - 🌟 매우 양호',
    badge: '매우 양호',
    badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    dotClass: 'bg-emerald-500',
    definition: '새순이 돋거나 잎이 매우 싱싱함',
    details: [
      '줄기 끝이나 마디에서 선명한 연둣빛 새 잎 또는 새순이 활발히 돋아남',
      '잎 표면에 자연스러운 윤기와 광택이 흐르고 잎맥이 뚜렷함',
      '잎이 처지지 않고 하늘을 향해 탄력 있게 곧게 서 있음',
      '병해충, 반점, 잎 끝 갈변, 찢어짐 등 손상이 일절 없음',
    ],
  },
  {
    score: 4,
    title: '4점 - 🙂 양호',
    badge: '양호',
    badgeClass: 'bg-sky-100 text-sky-900 border-sky-300',
    dotClass: 'bg-sky-500',
    definition: '특별한 이상 없이 잘 자라고 있음',
    details: [
      '새순의 발생은 다소 느릴 수 있으나 전반적인 식물 수형이 안정적임',
      '잎의 색상이 선명한 녹색을 유지하며 생기를 유지함',
      '하단부 오래된 잎 1~2장의 자연스러운 노화 외에 전체적인 이상 없음',
      '수분 흡수 및 증산 작용이 원활하게 유지되고 있음',
    ],
  },
  {
    score: 3,
    title: '3점 - 😐 보통',
    badge: '보통',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
    dotClass: 'bg-amber-500',
    definition: '잎 끝이 살짝 말라 있거나 성장의 변화가 적음',
    details: [
      '성장 속도가 눈에 띄게 정체되거나 키/잎 수의 변화가 거의 없음',
      '공기 건조 또는 환기 부족으로 잎 끝부분이 갈색으로 살짝 마름(팁번)',
      '잎에 미세한 검은 점이나 연한 탈색 반점이 관찰되어 주의 필요',
      '물주기 주기나 통풍 환경의 점검이 요구되는 상태',
    ],
  },
  {
    score: 2,
    title: '2점 - 😟 미흡 (주의)',
    badge: '미흡/주의',
    badgeClass: 'bg-orange-100 text-orange-900 border-orange-300',
    dotClass: 'bg-orange-500',
    definition: '잎이 시들거나 노랗게 변색되고 활력이 떨어짐',
    details: [
      '잎 여러 장이 누렇게 변색(황화 현상)되거나 아래로 힘없이 처짐',
      '과습으로 인한 뿌리 호흡 장애 또는 심한 건조 증상이 나타남',
      '통풍 불량으로 잎 표면에 곰팡이성 반점이나 썩음 징후 발생',
      '즉시 통풍이 잘되는 곳으로 위치를 조정하거나 관수량을 조절해야 함',
    ],
  },
  {
    score: 1,
    title: '1점 - 🥀 불량 (위험)',
    badge: '불량/위험',
    badgeClass: 'bg-rose-100 text-rose-900 border-rose-300',
    dotClass: 'bg-rose-500',
    definition: '잎이 대량 낙엽되거나 줄기가 물러 긴급 조치 필요',
    details: [
      '전체 잎의 30% 이상이 갈색으로 마르거나 낙엽되어 떨어짐',
      '줄기 밑동이 검게 무르거나 심각한 병충해 피해가 발생함',
      '일반적인 물주기만으로는 회복이 어려워 분갈이나 긴급 방제 필요',
    ],
  },
];

export const HealthScoreModal: React.FC<HealthScoreModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-[#f8f9fd]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center shadow-xs">
              <Sparkles className="w-6 h-6 text-sky-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-slate-900">
                  생육 건강 상태 점수 기준표 (1점 ~ 5점)
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">
                  측정 기준 가이드
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-0.5">
                홍천농업고등학교 스마트 원예 관찰 일지에서 사용하는 표준 건강 평가 척도입니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-2xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            title="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {/* Top Notice Box */}
          <div className="p-4 rounded-2xl bg-[#eaf4fe] border border-[#cde4fb] text-slate-700 text-sm flex items-start gap-3">
            <Info className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="text-sky-950 font-black block mb-0.5">
                💡 생육 건강 점수는 어떻게 매겨지나요?
              </strong>
              학생들이 주간 측정 시 식물의 <strong>새순 발생 여부</strong>, <strong>잎의 윤기 및 탄력</strong>, <strong>잎 끝 마름(팁번)</strong>, <strong>검은 반점 또는 과습 징후</strong>를 육안 관찰하여 5단계(1~5점)로 기록한 지표입니다.
            </div>
          </div>

          {/* 5-Level Rubric Cards */}
          <div className="space-y-3 pt-1">
            {HEALTH_SCORE_RUBRIC.map((item) => (
              <div
                key={item.score}
                className="p-4 rounded-2xl border border-slate-200/90 hover:border-slate-300 bg-white transition-all shadow-xs"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-3 h-3 rounded-full ${item.dotClass}`} />
                    <span className="text-base font-black text-slate-900">
                      {item.title}
                    </span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-black border ${item.badgeClass}`}>
                    {item.badge}
                  </span>
                </div>

                <p className="text-sm font-bold text-slate-700 mb-2 pl-5.5">
                  핵심 정의: "{item.definition}"
                </p>

                <ul className="text-xs text-slate-600 space-y-1 pl-5.5 list-disc list-outside ml-3">
                  {item.details.map((detail, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Environmental Correlation Notice */}
          <div className="p-4 rounded-2xl bg-[#f0fdf4] border border-[#dcfce7] text-xs text-emerald-900 leading-relaxed">
            <strong className="font-black block text-sm mb-1 text-emerald-950">
              🌱 위치별(A/B/C) 건강 점수 분석 팁:
            </strong>
            B와 C 구역(창가 및 개방 공간)은 환기가 매우 우수하여 잎의 검은 반점이나 과습 발생률이 낮고 5점(매우 양호) 비율이 높게 유지됩니다. 반면 A 구역(통행로 실내 간접광)은 학생 통행과 환기 조건에 따라 물주기 관리에 따라 3점(보통) 또는 잎 끝 마름이 관찰될 수 있습니다.
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-[#f8f9fd] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-black rounded-2xl bg-slate-900 hover:bg-slate-800 text-white transition-all cursor-pointer shadow-sm"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
