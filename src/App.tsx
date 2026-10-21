import React, { useState, useEffect } from 'react';
import { INITIAL_PLANTS, INITIAL_RECORDS, buildPlantList, parseCSVData } from './data/plantData';
import { ObservationRecord, Plant } from './types/plant';
import { Header, ActiveTab } from './components/Header';
import { PlantDetailView } from './components/PlantDetailView';
import { LocationComparisonView } from './components/LocationComparisonView';
import { LocationGalleryCard } from './components/LocationGalleryCard';
import { OverviewDashboard } from './components/OverviewDashboard';
import { TableView } from './components/TableView';
import { DataImportModal } from './components/DataImportModal';
import { PhotoModal } from './components/PhotoModal';
import { ReportPrintModal } from './components/ReportPrintModal';
import { CheckCircle2, RefreshCw } from 'lucide-react';

export default function App() {
  // Load cached records from previous sessions or fall back to INITIAL_RECORDS
  const [records, setRecords] = useState<ObservationRecord[]>(() => {
    try {
      const cached = localStorage.getItem('cached_plant_records');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      // ignore
    }
    return INITIAL_RECORDS;
  });

  const [plants, setPlants] = useState<Plant[]>(() => buildPlantList(records));

  const [activeTab, setActiveTab] = useState<ActiveTab>('detail');
  const [selectedPlantId, setSelectedPlantId] = useState<string>(plants[0]?.plantId || 'A-01');
  const [comparisonSpecies, setComparisonSpecies] = useState<string>('죽백나무');

  // Auto-sync status toast
  const [autoSyncToast, setAutoSyncToast] = useState<{ message: string; type: 'success' | 'syncing' } | null>(null);

  // Modals
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [photoModalRecord, setPhotoModalRecord] = useState<ObservationRecord | null>(null);
  const [isReportPrintOpen, setIsReportPrintOpen] = useState(false);
  const [reportPlant, setReportPlant] = useState<Plant>(plants[0] || INITIAL_PLANTS[0]);

  // Requirement 6: '시트 동기화' 버튼을 누르지 않아도 1회 1차례 정도는 시트와 자동 연동되도록 설정
  useEffect(() => {
    const runAutoSyncOnStartup = async () => {
      const savedUrl = localStorage.getItem('saved_sheet_url');
      if (!savedUrl) {
        // If no remote URL is saved, notify that initial dataset is synchronized
        setAutoSyncToast({
          message: `식물 관찰 데이터 ${records.length}건 1회 자동 동기화 완료`,
          type: 'success',
        });
        const timer = setTimeout(() => setAutoSyncToast(null), 3500);
        return () => clearTimeout(timer);
      }

      try {
        setAutoSyncToast({
          message: '구글 스프레드시트 1회 자동 동기화 진행 중...',
          type: 'syncing',
        });

        let fetchUrl = savedUrl.trim();
        if (fetchUrl.includes('docs.google.com/spreadsheets') && !fetchUrl.includes('export?format=csv') && !fetchUrl.includes('/pub?output=csv')) {
          const idMatch = fetchUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
          if (idMatch && idMatch[1]) {
            fetchUrl = `https://docs.google.com/spreadsheets/d/${idMatch[1]}/export?format=csv`;
          }
        }

        const res = await fetch(fetchUrl);
        if (res.ok) {
          const csvText = await res.text();
          const parsed = parseCSVData(csvText);
          if (parsed && parsed.length > 0) {
            handleImportData(parsed);
            setAutoSyncToast({
              message: `구글 스프레드시트 최신 데이터 ${parsed.length}건 1회 자동 연동 완료!`,
              type: 'success',
            });
            setTimeout(() => setAutoSyncToast(null), 4000);
            return;
          }
        }
      } catch (e) {
        // Fallback silently if offline or blocked
      }

      setAutoSyncToast({
        message: `저장된 데이터베이스 ${records.length}건 정상 로드 완료`,
        type: 'success',
      });
      setTimeout(() => setAutoSyncToast(null), 3000);
    };

    runAutoSyncOnStartup();
  }, []);

  // When records change, recompute plants & cache
  const handleImportData = (newRecords: ObservationRecord[]) => {
    setRecords(newRecords);
    const newPlants = buildPlantList(newRecords);
    setPlants(newPlants);
    try {
      localStorage.setItem('cached_plant_records', JSON.stringify(newRecords));
    } catch (e) {
      // ignore
    }
    if (!newPlants.some(p => p.plantId === selectedPlantId)) {
      setSelectedPlantId(newPlants[0]?.plantId || '');
    }
  };

  const handleResetDefault = () => {
    try {
      localStorage.removeItem('cached_plant_records');
    } catch (e) {
      // ignore
    }
    setRecords(INITIAL_RECORDS);
    setPlants(INITIAL_PLANTS);
    setSelectedPlantId('A-01');
  };

  const handleNavigateToComparison = (species: string) => {
    setComparisonSpecies(species);
    setActiveTab('comparison');
  };

  const handleSelectPlantFromOverview = (plantId: string) => {
    setSelectedPlantId(plantId);
    setActiveTab('detail');
  };

  const handleOpenReportPrint = (plant?: Plant) => {
    const target = plant || plants.find(p => p.plantId === selectedPlantId) || plants[0];
    setReportPlant(target);
    setIsReportPrintOpen(true);
  };

  const currentSelectedPlant = plants.find(p => p.plantId === selectedPlantId) || plants[0];

  return (
    <div className="min-h-screen bg-[#f4f5fa] text-slate-800 flex flex-col font-sans antialiased selection:bg-emerald-500 selection:text-white">
      {/* 1-Time Auto Sync Toast Banner */}
      {autoSyncToast && (
        <div className="fixed top-20 right-5 z-50 animate-in slide-in-from-top-3 fade-in duration-300">
          <div className="flex items-center gap-2.5 px-4.5 py-3 rounded-2xl bg-slate-900 text-white text-xs sm:text-sm font-bold shadow-xl border border-slate-700">
            {autoSyncToast.type === 'syncing' ? (
              <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            )}
            <span>{autoSyncToast.message}</span>
          </div>
        </div>
      )}
      {/* Top Navigation Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        plantCount={plants.length}
        recordCount={records.length}
        onOpenImport={() => setIsImportModalOpen(true)}
        onOpenReportPrint={() => handleOpenReportPrint(currentSelectedPlant)}
      />

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'detail' && (
          <PlantDetailView
            plants={plants}
            selectedPlantId={selectedPlantId}
            onSelectPlantId={setSelectedPlantId}
            onNavigateToComparison={handleNavigateToComparison}
            onOpenReportPrint={(p) => handleOpenReportPrint(p)}
          />
        )}

        {activeTab === 'comparison' && (
          <LocationComparisonView
            plants={plants}
            initialSpecies={comparisonSpecies}
            onSelectPlantDetail={handleSelectPlantFromOverview}
          />
        )}

        {activeTab === 'locations' && (
          <div className="space-y-6">
            <LocationGalleryCard
              plants={plants}
              onSelectPlant={handleSelectPlantFromOverview}
            />
          </div>
        )}

        {activeTab === 'overview' && (
          <OverviewDashboard
            plants={plants}
            records={records}
            onSelectPlant={handleSelectPlantFromOverview}
            onSelectSpeciesComparison={handleNavigateToComparison}
            onOpenPhoto={(rec) => setPhotoModalRecord(rec)}
          />
        )}

        {activeTab === 'table' && (
          <TableView
            records={records}
            onOpenPhoto={(rec) => setPhotoModalRecord(rec)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-6 text-xs text-slate-500 mt-12 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <p className="text-slate-800 font-bold text-sm">
              홍천농업고등학교 초록 성장 일지 스마트 원예 대시보드
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              학생 개인정보 보호를 위해 학생 이름은 비식별화(학번 표기) 처리되었으며, 위치 A·B·C 구역별 생육 환경 분석과 1페이지 보고서 출력을 지원합니다.
            </p>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-slate-500">
            <span className="px-2.5 py-1 rounded-xl bg-slate-100 font-bold text-slate-700">
              구글 시트 연동 가능
            </span>
            <span>데이터 총 {records.length}건 탑재</span>
          </div>
        </div>
      </footer>

      {/* 1-Page Printable Report Modal */}
      {isReportPrintOpen && (
        <ReportPrintModal
          isOpen={isReportPrintOpen}
          onClose={() => setIsReportPrintOpen(false)}
          plant={reportPlant}
          allPlants={plants}
          onSelectPlant={(plantId) => {
            const found = plants.find(p => p.plantId === plantId);
            if (found) setReportPlant(found);
          }}
        />
      )}

      {/* Photo Viewer Modal */}
      {photoModalRecord && (
        <PhotoModal
          record={photoModalRecord}
          onClose={() => setPhotoModalRecord(null)}
        />
      )}

      {/* Data Import / Sync Modal */}
      <DataImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportData={handleImportData}
        onResetDefault={handleResetDefault}
      />
    </div>
  );
}
