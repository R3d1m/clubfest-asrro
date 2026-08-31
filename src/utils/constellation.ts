import { DepartmentCode, ParsedStudent, PlayerRecord } from '../types';

export interface ConstellationNode {
  x: number;
  y: number;
  size: number;
  brightness: number;
  digitLabel?: string;
  isApex?: boolean;
}

export interface ConstellationEdge {
  from: number;
  to: number;
  dashed?: boolean;
}

export interface GeneratedHeroCardData {
  studentId: string;
  batchTitle: string;
  batchRoleBangla: string;
  constellationName: string;
  constellationSymbol: string;
  constellationMythBangla: string;
  archetypeTitle: string;
  rarityTier: 'LEGENDARY' | 'ELITE' | 'MASTER' | 'CHALLENGER';
  rarityLabel: string;
  rarityColor: string;
  nodes: ConstellationNode[];
  edges: ConstellationEdge[];
  tacticalQuote: string;
  idPatternSummary: string;
}

// 1. Real Iconic Constellation Templates mapped logically to Department Domains
export const REAL_CONSTELLATIONS: Record<DepartmentCode, {
  name: string;
  symbol: string;
  mythBangla: string;
  // Standard 7-star template corresponding to the 7 digits of the student's ID
  starPositions: Array<{ x: number; y: number }>;
  edges: Array<[number, number]>;
}> = {
  '04': { // CSE: Draco (The Cyber Dragon) - Serpentine winding data path
    name: 'DRACO (ড্রাকো নক্ষত্রমণ্ডল)',
    symbol: '🐉',
    mythBangla: 'সাইবার ড্রাগন • অ্যালগরিদমিক ইনফরমেশন পাথ',
    starPositions: [
      { x: 22, y: 75 }, // Digit 1 (Batch 2)
      { x: 35, y: 60 }, // Digit 2 (Batch 2)
      { x: 48, y: 65 }, // Digit 3 (Dept 0)
      { x: 55, y: 45 }, // Digit 4 (Dept 4)
      { x: 70, y: 40 }, // Digit 5 (Roll 0)
      { x: 80, y: 25 }, // Digit 6 (Roll 5)
      { x: 65, y: 20 }  // Digit 7 (Roll 5 - Dragon Head Apex)
    ],
    edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 4]]
  },
  '02': { // EEE: Orion (The Electric Hunter) - Hourglass & Belt
    name: 'ORION (কালপুরুষ নক্ষত্রমণ্ডল)',
    symbol: '⚡',
    mythBangla: 'তড়িৎ যোদ্ধা • ভোল্টেজ সার্কিট ও ডায়নামো',
    starPositions: [
      { x: 30, y: 25 }, // Betelgeuse (Digit 1)
      { x: 70, y: 25 }, // Bellatrix (Digit 2)
      { x: 42, y: 50 }, // Belt Star 1 (Digit 3)
      { x: 50, y: 50 }, // Belt Star 2 (Digit 4)
      { x: 58, y: 50 }, // Belt Star 3 (Digit 5)
      { x: 30, y: 75 }, // Saiph (Digit 6)
      { x: 70, y: 75 }  // Rigel (Digit 7)
    ],
    edges: [[0, 2], [1, 4], [2, 3], [3, 4], [2, 5], [4, 6], [5, 6], [0, 1]]
  },
  '03': { // ME: Ursa Major (The Big Dipper / Kinetic Engine)
    name: 'URSA MAJOR (সপ্তর্ষিমণ্ডল)',
    symbol: '⚙️',
    mythBangla: 'লৌহ চালিকাশক্তি • মেকানিক্যাল ক্র্যাঙ্কশ্যাফট',
    starPositions: [
      { x: 20, y: 35 }, // Alkaid (Digit 1)
      { x: 32, y: 42 }, // Mizar (Digit 2)
      { x: 45, y: 48 }, // Alioth (Digit 3)
      { x: 55, y: 58 }, // Megrez (Digit 4)
      { x: 75, y: 58 }, // Dubhe (Digit 5)
      { x: 75, y: 75 }, // Merak (Digit 6)
      { x: 55, y: 75 }  // Phecda (Digit 7)
    ],
    edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 3]]
  },
  '01': { // CE: Pegasus (The Structural Keystone / Great Square)
    name: 'PEGASUS (পেগাসাস স্কয়ার)',
    symbol: '🏛️',
    mythBangla: 'স্থপতি মিনার • কাঠামোগত ট্রাস ও কি-স্টোন',
    starPositions: [
      { x: 30, y: 30 }, // Alpheratz (Digit 1)
      { x: 70, y: 30 }, // Scheat (Digit 2)
      { x: 70, y: 65 }, // Markab (Digit 3)
      { x: 30, y: 65 }, // Algenib (Digit 4)
      { x: 50, y: 48 }, // Keystone Center (Digit 5)
      { x: 80, y: 80 }, // Enif (Digit 6)
      { x: 50, y: 80 }  // Base Pier (Digit 7)
    ],
    edges: [[0, 1], [1, 2], [2, 3], [3, 0], [0, 4], [1, 4], [2, 4], [3, 4], [2, 5], [3, 6]]
  },
  '06': { // ARCH: Cassiopeia (The Golden 'W' / Architecture Crown)
    name: 'CASSIOPEIA (ক্যাসিওপিয়া)',
    symbol: '📐',
    mythBangla: 'স্বর্ণ অনুপাত • স্থাপত্য নকশা ও মুকুট',
    starPositions: [
      { x: 20, y: 35 }, // Segin (Digit 1)
      { x: 35, y: 65 }, // Ruchbah (Digit 2)
      { x: 50, y: 40 }, // Gamma Cas (Digit 3 - Apex)
      { x: 65, y: 70 }, // Schedar (Digit 4)
      { x: 80, y: 35 }, // Caph (Digit 5)
      { x: 50, y: 20 }, // Zenith Crown (Digit 6)
      { x: 50, y: 78 }  // Foundation Pillar (Digit 7)
    ],
    edges: [[0, 1], [1, 2], [2, 3], [3, 4], [2, 5], [1, 6], [3, 6]]
  },
  '09': { // BME: Phoenix (The Bio-Resonant Bird / Helix)
    name: 'PHOENIX (ফিনিক্স নক্ষত্রমণ্ডল)',
    symbol: '🧬',
    mythBangla: 'বায়ো-পালস • ডিএনএ হেলিক্স ও নবজীবন',
    starPositions: [
      { x: 50, y: 20 }, // Ankaa (Digit 1)
      { x: 35, y: 40 }, // Wing L (Digit 2)
      { x: 65, y: 40 }, // Wing R (Digit 3)
      { x: 50, y: 50 }, // Heart (Digit 4)
      { x: 30, y: 75 }, // Tail L (Digit 5)
      { x: 70, y: 75 }, // Tail R (Digit 6)
      { x: 50, y: 80 }  // Life Helix Apex (Digit 7)
    ],
    edges: [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [3, 5], [3, 6], [4, 6], [5, 6]]
  },
  '10': { // WRE: Hydra (The Sea Serpent / Meandering River)
    name: 'HYDRA (জলরাশি লেভিয়াথান)',
    symbol: '🌊',
    mythBangla: 'ডেল্টা চ্যানেল • প্রবাহমান নদী ও স্রোতধারা',
    starPositions: [
      { x: 20, y: 75 }, // River Source (Digit 1)
      { x: 32, y: 60 }, // Bend 1 (Digit 2)
      { x: 45, y: 65 }, // Bend 2 (Digit 3)
      { x: 55, y: 45 }, // Rapids (Digit 4)
      { x: 68, y: 50 }, // Estuary (Digit 5)
      { x: 78, y: 30 }, // Delta Mouth (Digit 6)
      { x: 82, y: 20 }  // Ocean Surge (Digit 7)
    ],
    edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6]]
  },
  '12': { // ECE: Lyra & Vega (The Parabolic Wave / Radio Harp)
    name: 'LYRA (বীণা ও রেডিও তরঙ্গাভ)',
    symbol: '📡',
    mythBangla: 'তরঙ্গ যোগাযোগ • ভেগা নক্ষত্র ও সিগন্যাল অ্যারে',
    starPositions: [
      { x: 50, y: 20 }, // Vega (Digit 1 - Brightest)
      { x: 40, y: 45 }, // Sheliak (Digit 2)
      { x: 60, y: 45 }, // Sulafat (Digit 3)
      { x: 60, y: 75 }, // Delta Lyrae (Digit 4)
      { x: 40, y: 75 }, // Zeta Lyrae (Digit 5)
      { x: 30, y: 60 }, // Wave Node L (Digit 6)
      { x: 70, y: 60 }  // Wave Node R (Digit 7)
    ],
    edges: [[0, 1], [0, 2], [1, 2], [2, 3], [3, 4], [4, 1], [1, 5], [2, 6]]
  },
  '11': { // MTE: Cygnus (The Mecha Valkyrie / Cross Vector)
    name: 'CYGNUS (সাইবার ভ্যালকিরি)',
    symbol: '🦾',
    mythBangla: 'রোবোটিক জয়েন্ট • কাইনেমেটিক ভেক্টর ক্রুশ',
    starPositions: [
      { x: 50, y: 20 }, // Deneb (Digit 1)
      { x: 50, y: 45 }, // Sadr (Digit 2 - Axis)
      { x: 25, y: 45 }, // Gienah (Digit 3 - Arm L)
      { x: 75, y: 45 }, // Delta Cyg (Digit 4 - Arm R)
      { x: 50, y: 65 }, // Albireo Link (Digit 5)
      { x: 50, y: 80 }, // Albireo (Digit 6)
      { x: 35, y: 75 }  // Sensor Actuator (Digit 7)
    ],
    edges: [[0, 1], [1, 2], [1, 3], [1, 4], [4, 5], [2, 6], [4, 6]]
  },
  '05': { // URP: Vela (The Radial Highway & Urban Matrix)
    name: 'VELA (নগর দিগন্ত কম্পাস)',
    symbol: '🗺️',
    mythBangla: 'মাস্টারপ্ল্যান গ্রিড • শহর বিন্যাস ও রোডওয়ে',
    starPositions: [
      { x: 50, y: 50 }, // Central Plaza (Digit 1)
      { x: 28, y: 28 }, // Sector 1 (Digit 2)
      { x: 72, y: 28 }, // Sector 2 (Digit 3)
      { x: 72, y: 72 }, // Sector 3 (Digit 4)
      { x: 28, y: 72 }, // Sector 4 (Digit 5)
      { x: 50, y: 20 }, // North Radial (Digit 6)
      { x: 50, y: 80 }  // South Radial (Digit 7)
    ],
    edges: [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [1, 5], [2, 5], [3, 6], [4, 6]]
  },
  '07': { // PME: Scorpius (The Subsurface Core Drill / Stinger)
    name: 'SCORPIUS (ভূগর্ভ কোর ড্রিল)',
    symbol: '⛏️',
    mythBangla: 'খনিজ স্তরবিন্যাস • রত্নপাথর ও ভূগর্ভস্থ ড্রিল',
    starPositions: [
      { x: 30, y: 25 }, // Graffias (Digit 1)
      { x: 42, y: 35 }, // Dschubba (Digit 2)
      { x: 50, y: 48 }, // Antares (Digit 3 - Core Ruby)
      { x: 52, y: 62 }, // Wei (Digit 4)
      { x: 62, y: 75 }, // Sargas (Digit 5)
      { x: 75, y: 70 }, // Shaula (Digit 6)
      { x: 70, y: 55 }  // Lesath (Digit 7)
    ],
    edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6]]
  },
  '08': { // BECM: Crux (The Foundation Anchor & Keystone Cross)
    name: 'CRUX (ভিত্তিপ্রস্তর ক্রুশ)',
    symbol: '🏗️',
    mythBangla: 'বিল্ডিং কনস্ট্রাকশন • কি-স্টোন ও লোড-বেয়ারিং',
    starPositions: [
      { x: 50, y: 22 }, // Gacrux (Digit 1)
      { x: 50, y: 78 }, // Acrux (Digit 2)
      { x: 28, y: 50 }, // Mimosa (Digit 3)
      { x: 72, y: 50 }, // Imai (Digit 4)
      { x: 50, y: 50 }, // Keystone Intersection (Digit 5)
      { x: 62, y: 62 }, // Ginan (Digit 6)
      { x: 38, y: 62 }  // Support Strut (Digit 7)
    ],
    edges: [[0, 4], [4, 1], [2, 4], [4, 3], [0, 2], [0, 3], [1, 5], [1, 6]]
  }
};

// Batch Classifications
export const getBatchData = (batch: string) => {
  const num = parseInt(batch, 10);
  if (num >= 23) {
    return {
      title: "1st Year • The Vanguard",
      roleBangla: "নবীন অগ্রদূত ব্যাটালিয়ন",
      icon: "🧭"
    };
  } else if (num === 22) {
    return {
      title: "2nd Year • The Crucible",
      roleBangla: "কোর স্ট্রাইকার ব্যাটালিয়ন",
      icon: "🛡️"
    };
  } else if (num === 21) {
    return {
      title: "3rd Year • The Strategist",
      roleBangla: "রণকৌশলী মূল স্তম্ভ",
      icon: "⚔️"
    };
  } else {
    return {
      title: "4th Year • The Zenith",
      roleBangla: "প্রবীণ সেনাপতি ব্রিগেড",
      icon: "👑"
    };
  }
};

export function generateHeroCardData(
  student: ParsedStudent,
  player: PlayerRecord
): GeneratedHeroCardData {
  const batchData = getBatchData(student.batch);
  const template = REAL_CONSTELLATIONS[student.deptCode] || REAL_CONSTELLATIONS['04'];

  // 7 Digits of Student ID (e.g. ['2', '2', '0', '4', '0', '5', '5'])
  const idDigits = student.studentId.replace(/\D/g, '').padEnd(7, '0').slice(0, 7).split('');
  const rollNum = parseInt(student.roll, 10) || 42;

  // Build the 7 Star Nodes matching the 7 Digits of the Student ID!
  const nodes: ConstellationNode[] = template.starPositions.map((pos, idx) => {
    const digitChar = idDigits[idx] || '0';
    const digitVal = parseInt(digitChar, 10);

    // Subtle natural cosmic offset influenced by that specific digit
    const jitterX = ((digitVal - 4.5) / 10) * 8; // -3.6% to +3.6%
    const jitterY = ((((rollNum + idx * 7) % 10) - 4.5) / 10) * 6;

    // Digit magnitude: Roll-number digits glow brighter!
    const isRollDigit = idx >= 4;
    const isApex = idx === 6 || (idx === 0 && player.stackFloors >= 15);
    const size = isApex ? 6.5 : isRollDigit ? 4.8 : 3.8;
    const brightness = isApex ? 1.0 : isRollDigit ? 0.9 : 0.75;

    return {
      x: Math.max(15, Math.min(85, pos.x + jitterX)),
      y: Math.max(15, Math.min(85, pos.y + jitterY)),
      size,
      brightness,
      digitLabel: digitChar,
      isApex
    };
  });

  const edges: ConstellationEdge[] = template.edges.map(([from, to]) => ({ from, to }));

  // Logical Persona Archetype based on real gameplay records
  let archetypeTitle = `${student.deptAbbr} স্পেশালিস্ট`;
  if (player.stackFloors >= 15) {
    archetypeTitle = `🏗️ স্কাই টাইটান (${player.stackFloors} তলা)`;
  } else if (player.battleshipMoves && player.battleshipMoves.some(m => m.result === 'HIT')) {
    archetypeTitle = `🎯 ব্যাটেলশিপ স্নাইপার (হিট মাস্টার)`;
  } else if (player.connect4Col !== null) {
    archetypeTitle = `🤝 কানেক্ট-৪ ডিফেন্ডার`;
  }

  // Rarity Determination based on earned points
  const pts = player.totalPointsEarned;
  let rarityTier: GeneratedHeroCardData['rarityTier'] = 'CHALLENGER';
  let rarityLabel = 'CHALLENGER CADET';
  let rarityColor = '#4ECDC4';

  if (pts >= 180) {
    rarityTier = 'LEGENDARY';
    rarityLabel = '👑 LEGENDARY GUARDIAN';
    rarityColor = '#FFE66D';
  } else if (pts >= 100) {
    rarityTier = 'ELITE';
    rarityLabel = '⭐ ELITE TACTICIAN';
    rarityColor = '#FFA931';
  } else if (pts >= 40) {
    rarityTier = 'MASTER';
    rarityLabel = '🔷 COMBAT MASTER';
    rarityColor = '#3585DA';
  }

  const tacticalQuote = `নক্ষত্রমণ্ডল ${template.name}-এ তোমার আইডির ৭টি অঙ্ক [${idDigits.join('-')}] চিরন্তন নক্ষত্র স্থানাঙ্ক হিসেবে খোদাই রইল!`;
  const idPatternSummary = `ব্যাচ '${student.batchShort} • ${student.deptAbbr} • রোল #${student.roll}`;

  return {
    studentId: student.studentId,
    batchTitle: batchData.title,
    batchRoleBangla: batchData.roleBangla,
    constellationName: template.name,
    constellationSymbol: template.symbol,
    constellationMythBangla: template.mythBangla,
    archetypeTitle,
    rarityTier,
    rarityLabel,
    rarityColor,
    nodes,
    edges,
    tacticalQuote,
    idPatternSummary
  };
}
