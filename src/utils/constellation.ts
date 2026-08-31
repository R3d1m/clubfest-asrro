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
  deptName: string;
  deptAbbr: string;
  batchShort: string;
  constellationName: string;
  constellationSymbol: string;
  constellationMythBangla: string;
  constellationReason: string;
  archetypeTitle: string;
  rarityTier: 'LEGENDARY' | 'ELITE' | 'MASTER' | 'CHALLENGER';
  rarityLabel: string;
  rarityColor: string;
  nodes: ConstellationNode[];
  edges: ConstellationEdge[];
  tacticalQuote: string;
}

// Real Iconic Constellations logically mapped to Department Engineering Domains
export const REAL_CONSTELLATIONS: Record<DepartmentCode, {
  name: string;
  symbol: string;
  mythBangla: string;
  reasonBangla: string;
  starPositions: Array<{ x: number; y: number }>;
  edges: Array<[number, number]>;
}> = {
  '04': { // CSE: Draco
    name: 'DRACO (ড্রাকো নক্ষত্রমণ্ডল)',
    symbol: '🐉',
    mythBangla: 'সাইবার ড্রাগন • অ্যালগরিদমিক ইনফরমেশন পাথ',
    reasonBangla: 'ডিপার্টমেন্ট কোড [04] (CSE) এর অ্যালগরিদমিক ডেটা ফ্লো ও নেটওয়ার্ক নোড ড্রাকো ড্রাগনের সর্পিল ধারার সাথে সামঞ্জস্যপূর্ণ।',
    starPositions: [
      { x: 22, y: 75 }, { x: 35, y: 60 }, { x: 48, y: 65 },
      { x: 55, y: 45 }, { x: 70, y: 40 }, { x: 80, y: 25 }, { x: 65, y: 20 }
    ],
    edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 4]]
  },
  '02': { // EEE: Orion
    name: 'ORION (কালপুরুষ নক্ষত্রমণ্ডল)',
    symbol: '⚡',
    mythBangla: 'তড়িৎ যোদ্ধা • ভোল্টেজ সার্কিট ও ডায়নামো',
    reasonBangla: 'ডিপার্টমেন্ট কোড [02] (EEE) এর হাই-ভোল্টেজ ইলেকট্রিক গ্রিড ও সার্কিট কালপুরুষের ৩-স্টার বেল্টের সাথে মিলে যায়।',
    starPositions: [
      { x: 30, y: 25 }, { x: 70, y: 25 }, { x: 42, y: 50 },
      { x: 50, y: 50 }, { x: 58, y: 50 }, { x: 30, y: 75 }, { x: 70, y: 75 }
    ],
    edges: [[0, 2], [1, 4], [2, 3], [3, 4], [2, 5], [4, 6], [5, 6], [0, 1]]
  },
  '03': { // ME: Ursa Major
    name: 'URSA MAJOR (সপ্তর্ষিমণ্ডল)',
    symbol: '⚙️',
    mythBangla: 'লৌহ চালিকাশক্তি • মেকানিক্যাল ক্র্যাঙ্কশ্যাফট',
    reasonBangla: 'ডিপার্টমেন্ট কোড [03] (ME) এর মেকানিক্যাল ক্র্যাঙ্কশ্যাফট ও ড্রাইভ গিয়ার সপ্তর্ষিমণ্ডলের গতির প্রতিরূপ।',
    starPositions: [
      { x: 20, y: 35 }, { x: 32, y: 42 }, { x: 45, y: 48 },
      { x: 55, y: 58 }, { x: 75, y: 58 }, { x: 75, y: 75 }, { x: 55, y: 75 }
    ],
    edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 3]]
  },
  '01': { // CE: Pegasus
    name: 'PEGASUS (পেগাসাস স্কয়ার)',
    symbol: '🏛️',
    mythBangla: 'স্থপতি মিনার • কাঠামোগত ট্রাস ও কি-স্টোন',
    reasonBangla: 'ডিপার্টমেন্ট কোড [01] (CE) এর কাঠামোগত ট্রাস ও ভারবহনকারী ভিত্তিপ্রস্তর পেগাসাস স্কয়ারের অনুরূপ।',
    starPositions: [
      { x: 30, y: 30 }, { x: 70, y: 30 }, { x: 70, y: 65 },
      { x: 30, y: 65 }, { x: 50, y: 48 }, { x: 80, y: 80 }, { x: 50, y: 80 }
    ],
    edges: [[0, 1], [1, 2], [2, 3], [3, 0], [0, 4], [1, 4], [2, 4], [3, 4], [2, 5], [3, 6]]
  },
  '06': { // ARCH: Cassiopeia
    name: 'CASSIOPEIA (ক্যাসিওপিয়া)',
    symbol: '📐',
    mythBangla: 'স্বর্ণ অনুপাত • স্থাপত্য নকশা ও মুকুট',
    reasonBangla: 'ডিপার্টমেন্ট কোড [06] (ARCH) এর স্বর্ণ অনুপাত ও স্থাপত্য জ্যামিতি ক্যাসিওপিয়ার \'W\' মুকুটের প্রতীক।',
    starPositions: [
      { x: 20, y: 35 }, { x: 35, y: 65 }, { x: 50, y: 40 },
      { x: 65, y: 70 }, { x: 80, y: 35 }, { x: 50, y: 20 }, { x: 50, y: 78 }
    ],
    edges: [[0, 1], [1, 2], [2, 3], [3, 4], [2, 5], [1, 6], [3, 6]]
  },
  '09': { // BME: Phoenix
    name: 'PHOENIX (ফিনিক্স নক্ষত্রমণ্ডল)',
    symbol: '🧬',
    mythBangla: 'বায়ো-পালস • ডিএনএ হেলিক্স ও নবজীবন',
    reasonBangla: 'ডিপার্টমেন্ট কোড [09] (BME) এর বায়োমেডিকেল পালস ও ডিএনএ হেলিক্স ফিনিক্সের নবজীবন তরঙ্গের প্রতীক।',
    starPositions: [
      { x: 50, y: 20 }, { x: 35, y: 40 }, { x: 65, y: 40 },
      { x: 50, y: 50 }, { x: 30, y: 75 }, { x: 70, y: 75 }, { x: 50, y: 80 }
    ],
    edges: [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [3, 5], [3, 6], [4, 6], [5, 6]]
  },
  '10': { // WRE: Hydra
    name: 'HYDRA (জলরাশি লেভিয়াথান)',
    symbol: '🌊',
    mythBangla: 'ডেল্টা চ্যানেল • প্রবাহমান নদী ও স্রোতধারা',
    reasonBangla: 'ডিপার্টমেন্ট কোড [10] (WRE) এর হাইড্রোলিক ডেল্টা চ্যানেল ও জলপ্রবাহ হাইড্রা সর্পিল স্রোতের রূপ।',
    starPositions: [
      { x: 20, y: 75 }, { x: 32, y: 60 }, { x: 45, y: 65 },
      { x: 55, y: 45 }, { x: 68, y: 50 }, { x: 78, y: 30 }, { x: 82, y: 20 }
    ],
    edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6]]
  },
  '12': { // ECE: Lyra
    name: 'LYRA (বীণা ও রেডিও তরঙ্গাভ)',
    symbol: '📡',
    mythBangla: 'তরঙ্গ যোগাযোগ • ভেগা নক্ষত্র ও সিগন্যাল অ্যারে',
    reasonBangla: 'ডিপার্টমেন্ট কোড [12] (ECE) এর রেডিও তরঙ্গাভ ও ভেগা সিগন্যাল অ্যারে বীণা নক্ষত্রমণ্ডলের অনুরণন।',
    starPositions: [
      { x: 50, y: 20 }, { x: 40, y: 45 }, { x: 60, y: 45 },
      { x: 60, y: 75 }, { x: 40, y: 75 }, { x: 30, y: 60 }, { x: 70, y: 60 }
    ],
    edges: [[0, 1], [0, 2], [1, 2], [2, 3], [3, 4], [4, 1], [1, 5], [2, 6]]
  },
  '11': { // MTE: Cygnus
    name: 'CYGNUS (সাইবার ভ্যালকিরি)',
    symbol: '🦾',
    mythBangla: 'রোবোটিক জয়েন্ট • কাইনেমেটিক ভেক্টর ক্রুশ',
    reasonBangla: 'ডিপার্টমেন্ট কোড [11] (MTE) এর রোবোটিক জয়েন্ট ও কাইনেমেটিক ভেক্টর সাইগনাস ক্রুশের সাথে সংগতিপূর্ণ।',
    starPositions: [
      { x: 50, y: 20 }, { x: 50, y: 45 }, { x: 25, y: 45 },
      { x: 75, y: 45 }, { x: 50, y: 65 }, { x: 50, y: 80 }, { x: 35, y: 75 }
    ],
    edges: [[0, 1], [1, 2], [1, 3], [1, 4], [4, 5], [2, 6], [4, 6]]
  },
  '05': { // URP: Vela
    name: 'VELA (নগর দিগন্ত কম্পাস)',
    symbol: '🗺️',
    mythBangla: 'মাস্টারপ্ল্যান গ্রিড • শহর বিন্যাস ও রোডওয়ে',
    reasonBangla: 'ডিপার্টমেন্ট কোড [05] (URP) এর নগর মাস্টারপ্ল্যান ও রোডওয়ে গ্রিড ভেলা কম্পাসের দিকদর্শনের প্রতীক।',
    starPositions: [
      { x: 50, y: 50 }, { x: 28, y: 28 }, { x: 72, y: 28 },
      { x: 72, y: 72 }, { x: 28, y: 72 }, { x: 50, y: 20 }, { x: 50, y: 80 }
    ],
    edges: [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [1, 5], [2, 5], [3, 6], [4, 6]]
  },
  '07': { // PME: Scorpius
    name: 'SCORPIUS (ভূগর্ভ কোর ড্রিল)',
    symbol: '⛏️',
    mythBangla: 'খনিজ স্তরবিন্যাস • রত্নপাথর ও ভূগর্ভস্থ ড্রিল',
    reasonBangla: 'ডিপার্টমেন্ট কোড [07] (PME) এর ভূগর্ভস্থ খনিজ স্তরবিন্যাস ও কোর ড্রিল বৃশ্চিক নক্ষত্রের তীক্ষ্ণতার প্রতীক।',
    starPositions: [
      { x: 30, y: 25 }, { x: 42, y: 35 }, { x: 50, y: 48 },
      { x: 52, y: 62 }, { x: 62, y: 75 }, { x: 75, y: 70 }, { x: 70, y: 55 }
    ],
    edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6]]
  },
  '08': { // BECM: Crux
    name: 'CRUX (ভিত্তিপ্রস্তর ক্রুশ)',
    symbol: '🏗️',
    mythBangla: 'বিল্ডিং কনস্ট্রাকশন • কি-স্টোন ও লোড-বেয়ারিং',
    reasonBangla: 'ডিপার্টমেন্ট কোড [08] (BECM) এর বিল্ডিং কনস্ট্রাকশন ও লোড-বেয়ারিং কি-স্টোন ক্রাক্স ভিত্তিপ্রস্তরের প্রতীক।',
    starPositions: [
      { x: 50, y: 22 }, { x: 50, y: 78 }, { x: 28, y: 50 },
      { x: 72, y: 50 }, { x: 50, y: 50 }, { x: 62, y: 62 }, { x: 38, y: 62 }
    ],
    edges: [[0, 4], [4, 1], [2, 4], [4, 3], [0, 2], [0, 3], [1, 5], [1, 6]]
  }
};

export function generateHeroCardData(
  student: ParsedStudent,
  player: PlayerRecord
): GeneratedHeroCardData {
  const template = REAL_CONSTELLATIONS[student.deptCode] || REAL_CONSTELLATIONS['04'];

  // 7 Digits of Student ID (e.g. ['2', '2', '0', '4', '0', '5', '5'])
  const idDigits = student.studentId.replace(/\D/g, '').padEnd(7, '0').slice(0, 7).split('');
  const rollNum = parseInt(student.roll, 10) || 42;

  // Build the 7 Star Nodes matching the 7 Digits of the Student ID
  const nodes: ConstellationNode[] = template.starPositions.map((pos, idx) => {
    const digitChar = idDigits[idx] || '0';
    const digitVal = parseInt(digitChar, 10);

    // Subtle natural cosmic offset influenced by that specific digit
    const jitterX = ((digitVal - 4.5) / 10) * 8;
    const jitterY = ((((rollNum + idx * 7) % 10) - 4.5) / 10) * 6;

    // Digit magnitude: Roll-number digits glow brighter
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

  return {
    studentId: student.studentId,
    deptName: student.deptName,
    deptAbbr: student.deptAbbr,
    batchShort: student.batchShort,
    constellationName: template.name,
    constellationSymbol: template.symbol,
    constellationMythBangla: template.mythBangla,
    constellationReason: template.reasonBangla,
    archetypeTitle,
    rarityTier,
    rarityLabel,
    rarityColor,
    nodes,
    edges,
    tacticalQuote
  };
}
