/**
 * Google Drive image URL helper
 */
export function extractDriveFileId(url: string): string | null {
  if (!url) return null;
  
  // Pattern 1: id=XXXX
  const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch && idMatch[1]) return idMatch[1];
  
  // Pattern 2: /d/XXXX/
  const dMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (dMatch && dMatch[1]) return dMatch[1];
  
  return null;
}

export function getDriveImageSrc(urlOrId: string, size: number = 800): string {
  if (!urlOrId) return '';
  const fileId = urlOrId.includes('/') ? extractDriveFileId(urlOrId) : urlOrId;
  if (!fileId) return urlOrId;
  
  // lh3.googleusercontent.com is Google's CDN for shared drive files
  return `https://lh3.googleusercontent.com/d/${fileId}`;
}

export function getDriveThumbnailSrc(urlOrId: string, size: number = 600): string {
  if (!urlOrId) return '';
  const fileId = urlOrId.includes('/') ? extractDriveFileId(urlOrId) : urlOrId;
  if (!fileId) return urlOrId;
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`;
}

export function getDriveViewerLink(urlOrId: string): string {
  if (!urlOrId) return '#';
  const fileId = urlOrId.includes('/') ? extractDriveFileId(urlOrId) : urlOrId;
  if (!fileId) return urlOrId;
  return `https://drive.google.com/file/d/${fileId}/view`;
}

/**
 * Clean student ID and strip student name
 * e.g., "1118 최인찬" -> "1118"
 */
export function cleanStudentId(raw: string): string {
  if (!raw) return '';
  const trimmed = raw.trim();
  const match = trimmed.match(/^(\d+)/);
  return match ? match[1] : trimmed.split(/\s+/)[0];
}

/**
 * Clean plant name and strip student name inside parentheses
 * e.g., "A-01 아글라오네마(흰)(인찬)" -> "A-01 아글라오네마(흰)"
 * e.g., "A-02 죽백나무(승민)" -> "A-02 죽백나무"
 */
export function cleanPlantName(raw: string): {
  plantId: string;
  cleanName: string;
  species: string;
  location: 'A' | 'B' | 'C';
} {
  const trimmed = (raw || '').trim();
  // Strip trailing student name in parentheses, like (인찬), (승민), (호연), (준혁), (성민), (수민), (승현), (동윤)
  // But be careful not to strip (흰) or (붉) in "아글라오네마(흰)"
  // The pattern in raw is: LocationCode-Number PlantName[(Color)][(StudentName)]
  // e.g. "A-01 아글라오네마(흰)(인찬)" -> cleanName is "A-01 아글라오네마(흰)"
  // e.g. "A-02 죽백나무(승민)" -> cleanName is "A-02 죽백나무"
  
  // Extract location
  const locMatch = trimmed.match(/^([ABC])/i);
  const location = (locMatch ? locMatch[1].toUpperCase() : 'A') as 'A' | 'B' | 'C';

  // Extract ID (e.g. A-01, B-02, C-01)
  const idMatch = trimmed.match(/^([A-Z]-\d+)/i);
  const plantId = idMatch ? idMatch[1].toUpperCase() : trimmed.split(/\s+/)[0];

  // Remove the plantId prefix
  let remaining = trimmed.replace(/^[A-Z]-\d+\s*/i, '').trim();

  // If there are multiple parentheses at the end or one parenthesis,
  // check if the last parenthesis is a student name (Korean name usually 2-3 characters)
  // or specifically one of the known student names or anything that is not (흰) or (붉)
  remaining = remaining.replace(/\(([^)]+)\)$/, (fullMatch, inside) => {
    if (inside === '흰' || inside === '붉') {
      return fullMatch; // keep color
    }
    return ''; // remove student name
  }).trim();

  // If there were two parentheses like (흰)(인찬), the regex above removes (인찬) leaving (흰).
  const cleanName = `${plantId} ${remaining}`.trim();

  return {
    plantId,
    cleanName,
    species: remaining,
    location,
  };
}

/**
 * Parse health score from string
 * e.g. "5점 - 🌟 매우 양호 (새순이 돋거나 잎이 매우 싱싱함)" -> 5
 */
export function parseHealthScore(text: string): number {
  if (!text) return 4;
  const match = text.match(/(\d+)점/);
  if (match) return parseInt(match[1], 10);
  if (text.includes('매우 양호')) return 5;
  if (text.includes('양호')) return 4;
  if (text.includes('보통')) return 3;
  if (text.includes('불량')) return 2;
  if (text.includes('위험')) return 1;
  return 4;
}

/**
 * Format date string to standard timestamp
 * e.g. "2026. 9. 14" -> Date timestamp
 */
export function parseDateToTimestamp(dateStr: string): number {
  if (!dateStr) return 0;
  const parts = dateStr.replace(/\./g, ' ').trim().split(/\s+/).map(Number);
  if (parts.length >= 3) {
    const [year, month, day] = parts;
    return new Date(year, month - 1, day).getTime();
  }
  return new Date(dateStr).getTime() || 0;
}
