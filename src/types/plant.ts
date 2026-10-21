export interface ObservationRecord {
  id: string;
  timestamp: string;
  studentId: string; // 학번만 (e.g. "1118")
  plantId: string; // e.g. "A-01"
  plantDisplayName: string; // e.g. "A-01 아글라오네마(흰)"
  species: string; // e.g. "아글라오네마(흰)"
  location: 'A' | 'B' | 'C';
  date: string; // e.g. "2026. 9. 14"
  dateTimestamp: number; // for chronological sorting
  height: number; // 식물 키 (cm)
  leafCount: number; // 잎의 개수 (개)
  leafWidth: number; // 대표 잎의 폭 (cm)
  healthScore: number; // 1~5점
  healthText: string; // e.g. "5점 - 🌟 매우 양호..."
  notes: string; // 관찰 일지 & 특이사항
  photoUrl: string; // Google Drive url
  driveFileId: string | null;
}

export interface Plant {
  plantId: string; // e.g. "A-01"
  cleanName: string; // e.g. "A-01 아글라오네마(흰)"
  species: string; // e.g. "아글라오네마(흰)"
  location: 'A' | 'B' | 'C';
  studentId: string; // 학번
  records: ObservationRecord[];
  initialHeight: number;
  latestHeight: number;
  heightGrowth: number;
  initialLeafCount: number;
  latestLeafCount: number;
  leafGrowth: number;
  latestHealthScore: number;
  latestObservationDate: string;
}

export interface SpeciesInfo {
  name: string;
  scientificName: string;
  englishName: string;
  family: string;
  origin: string;
  sunlight: string;
  watering: string;
  temperature: string;
  humidity: string;
  characteristics: string[];
  careTips: string[];
  airPurification: string;
  imageEmoji: string;
  colorTheme: string;
}
