import React, { useState, useMemo } from 'react';
import { ObservationRecord } from '../types/plant';
import { getDriveThumbnailSrc } from '../utils/imageHelper';
import {
  Search,
  Download,
  Camera,
  ArrowUpDown,
  Filter,
} from 'lucide-react';

interface TableViewProps {
  records: ObservationRecord[];
  onOpenPhoto: (record: ObservationRecord) => void;
}

type SortField = 'date' | 'plantId' | 'studentId' | 'height' | 'leafCount' | 'leafWidth' | 'healthScore';

export const TableView: React.FC<TableViewProps> = ({ records, onOpenPhoto }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState<'ALL' | 'A' | 'B' | 'C'>('ALL');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortAsc, setSortAsc] = useState(false);

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (locationFilter !== 'ALL' && r.location !== locationFilter) return false;
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        r.studentId.toLowerCase().includes(term) ||
        r.plantDisplayName.toLowerCase().includes(term) ||
        r.species.toLowerCase().includes(term) ||
        r.notes.toLowerCase().includes(term) ||
        r.date.toLowerCase().includes(term)
      );
    });
  }, [records, searchTerm, locationFilter]);

  const sortedRecords = useMemo(() => {
    return [...filteredRecords].sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'date':
          cmp = a.dateTimestamp - b.dateTimestamp;
          break;
        case 'plantId':
          cmp = a.plantId.localeCompare(b.plantId, undefined, { numeric: true });
          break;
        case 'studentId':
          cmp = a.studentId.localeCompare(b.studentId, undefined, { numeric: true });
          break;
        case 'height':
          cmp = a.height - b.height;
          break;
        case 'leafCount':
          cmp = a.leafCount - b.leafCount;
          break;
        case 'leafWidth':
          cmp = a.leafWidth - b.leafWidth;
          break;
        case 'healthScore':
          cmp = a.healthScore - b.healthScore;
          break;
      }
      return sortAsc ? cmp : -cmp;
    });
  }, [filteredRecords, sortField, sortAsc]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleExportCSV = () => {
    const headers = ['측정일자', '학번', '식물ID/명칭', '위치', '식물종', '키(cm)', '잎개수', '잎폭(cm)', '건강점수', '관찰일지', '사진URL'];
    const rows = sortedRecords.map(r => [
      `"${r.date}"`,
      `"${r.studentId}"`,
      `"${r.plantDisplayName}"`,
      `"${r.location}"`,
      `"${r.species}"`,
      r.height,
      r.leafCount,
      r.leafWidth,
      r.healthScore,
      `"${(r.notes || '').replace(/"/g, '""')}"`,
      `"${r.photoUrl}"`,
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `초록성장일지_정제데이터_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
      {/* Table Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            초록 성장 일지 데이터 목록 ({filteredRecords.length}건)
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            개인정보 보호를 위해 학생 이름이 비식별화(학번 표기) 처리된 정제 데이터 목록입니다.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-2xl bg-slate-900 hover:bg-emerald-600 text-white shadow-sm transition-all cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>정제 CSV 다운로드</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="학번(1118, 1213...), 식물명(아글라오네마, 죽백나무...), 관찰 일지 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#f8f9fd] border border-slate-200 rounded-2xl pl-11 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Location Filter */}
        <div className="flex items-center gap-1 bg-[#f4f5fa] p-1.5 rounded-2xl border border-slate-200/60 text-xs">
          {(['ALL', 'A', 'B', 'C'] as const).map(loc => (
            <button
              key={loc}
              onClick={() => setLocationFilter(loc)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                locationFilter === loc
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              {loc === 'ALL' ? '전체 위치' : `위치 ${loc}`}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="bg-[#f8f9fd] text-slate-500 border-b border-slate-200 font-bold select-none">
              <th className="py-3.5 px-4 cursor-pointer hover:text-slate-900" onClick={() => handleSort('date')}>
                <div className="flex items-center gap-1">
                  측정 일자 <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </th>
              <th className="py-3.5 px-4 cursor-pointer hover:text-slate-900" onClick={() => handleSort('studentId')}>
                <div className="flex items-center gap-1">
                  학번 <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </th>
              <th className="py-3.5 px-4 cursor-pointer hover:text-slate-900" onClick={() => handleSort('plantId')}>
                <div className="flex items-center gap-1">
                  식물 ID / 명칭 <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </th>
              <th className="py-3.5 px-4 cursor-pointer hover:text-slate-900" onClick={() => handleSort('height')}>
                <div className="flex items-center gap-1">
                  키 (cm) <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </th>
              <th className="py-3.5 px-4 cursor-pointer hover:text-slate-900" onClick={() => handleSort('leafCount')}>
                <div className="flex items-center gap-1">
                  잎 수 <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </th>
              <th className="py-3.5 px-4 cursor-pointer hover:text-slate-900" onClick={() => handleSort('leafWidth')}>
                <div className="flex items-center gap-1">
                  잎 폭 (cm) <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </th>
              <th className="py-3.5 px-4 cursor-pointer hover:text-slate-900" onClick={() => handleSort('healthScore')}>
                <div className="flex items-center gap-1">
                  건강도 <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </th>
              <th className="py-3.5 px-4">관찰 일지 & 특이사항</th>
              <th className="py-3.5 px-4 text-center">사진</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedRecords.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400">
                  조건에 일치하는 기록이 없습니다.
                </td>
              </tr>
            ) : (
              sortedRecords.map((r) => {
                const thumbUrl = getDriveThumbnailSrc(r.photoUrl, 100);

                return (
                  <tr
                    key={r.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-bold text-slate-800 whitespace-nowrap">
                      {r.date}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-amber-700 font-bold whitespace-nowrap">
                      {r.studentId}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-2 font-bold text-slate-900">
                        <span className="w-5 h-5 rounded-md bg-emerald-50 text-[10px] font-black text-emerald-700 border border-emerald-200 flex items-center justify-center">
                          {r.location}
                        </span>
                        {r.plantDisplayName}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-emerald-700 font-black">
                      {r.height}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-sky-700 font-black">
                      {r.leafCount}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-amber-700 font-bold">
                      {r.leafWidth}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 font-bold text-xs">
                        {r.healthScore}점
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate" title={r.notes}>
                      {r.notes || '없음'}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <button
                        onClick={() => onOpenPhoto(r)}
                        className="group relative inline-flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-900 border border-slate-200 overflow-hidden transition-all shadow-xs cursor-pointer"
                        title="사진 보기"
                      >
                        {r.photoUrl ? (
                          <img
                            src={thumbUrl}
                            alt="thumb"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                            referrerPolicy="no-referrer"
                          />
                        ) : null}
                        <Camera className="w-4 h-4 text-slate-500 group-hover:text-white absolute" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
