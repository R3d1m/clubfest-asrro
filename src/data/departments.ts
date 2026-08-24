import { DepartmentCode, DepartmentConfig, ParsedStudent } from '../types';

export const DEPARTMENTS: Record<DepartmentCode, DepartmentConfig> = {
  '01': {
    code: '01',
    name: 'Civil Engineering',
    abbr: 'CE',
    studentCount: 130,
    multiplier: 0.769,
    themeColor: '#FFA931',
    lightColor: '#FFF2DC',
    textColor: '#1E232A',
    baseCount: 13
  },
  '02': {
    code: '02',
    name: 'Electrical & Electronic Engineering',
    abbr: 'EEE',
    studentCount: 180,
    multiplier: 0.556,
    themeColor: '#FF5964',
    lightColor: '#FFE0E2',
    textColor: '#FFFFFF',
    baseCount: 18
  },
  '03': {
    code: '03',
    name: 'Mechanical Engineering',
    abbr: 'ME',
    studentCount: 180,
    multiplier: 0.556,
    themeColor: '#3585DA',
    lightColor: '#E1F0FF',
    textColor: '#FFFFFF',
    baseCount: 18
  },
  '04': {
    code: '04',
    name: 'Computer Science & Engineering',
    abbr: 'CSE',
    studentCount: 130,
    multiplier: 0.769,
    themeColor: '#00C9A7',
    lightColor: '#D4F8F0',
    textColor: '#1E232A',
    baseCount: 13
  },
  '05': {
    code: '05',
    name: 'Urban & Regional Planning',
    abbr: 'URP',
    studentCount: 60,
    multiplier: 1.667,
    themeColor: '#8AC926',
    lightColor: '#EDF7D9',
    textColor: '#1E232A',
    baseCount: 6
  },
  '06': {
    code: '06',
    name: 'Architecture',
    abbr: 'ARCH',
    studentCount: 30,
    multiplier: 3.333,
    themeColor: '#845EC2',
    lightColor: '#EFE6FD',
    textColor: '#FFFFFF',
    baseCount: 3
  },
  '07': {
    code: '07',
    name: 'Petroleum & Mining Engineering',
    abbr: 'PME',
    studentCount: 30,
    multiplier: 3.333,
    themeColor: '#D67229',
    lightColor: '#FCECDD',
    textColor: '#FFFFFF',
    baseCount: 3
  },
  '08': {
    code: '08',
    name: 'Electronics & Telecommunication Engg.',
    abbr: 'ETE',
    studentCount: 60,
    multiplier: 1.667,
    themeColor: '#FF6F91',
    lightColor: '#FFE5EC',
    textColor: '#1E232A',
    baseCount: 6
  },
  '09': {
    code: '09',
    name: 'Mechatronics & Industrial Engineering',
    abbr: 'MIE',
    studentCount: 30,
    multiplier: 3.333,
    themeColor: '#2C786C',
    lightColor: '#D6EBE7',
    textColor: '#FFFFFF',
    baseCount: 3
  },
  '10': {
    code: '10',
    name: 'Water Resources Engineering',
    abbr: 'WRE',
    studentCount: 30,
    multiplier: 3.333,
    themeColor: '#00AFB9',
    lightColor: '#D9F6F8',
    textColor: '#1E232A',
    baseCount: 3
  },
  '11': {
    code: '11',
    name: 'Biomedical Engineering',
    abbr: 'BME',
    studentCount: 30,
    multiplier: 3.333,
    themeColor: '#E63946',
    lightColor: '#FCDADE',
    textColor: '#FFFFFF',
    baseCount: 3
  },
  '12': {
    code: '12',
    name: 'Materials & Metallurgical Engineering',
    abbr: 'MME',
    studentCount: 30,
    multiplier: 3.333,
    themeColor: '#6C5CE7',
    lightColor: '#E8E5FC',
    textColor: '#FFFFFF',
    baseCount: 3
  }
};

export const DEPARTMENT_LIST = Object.values(DEPARTMENTS);

export function parseStudentID(rawId: string): ParsedStudent {
  const clean = rawId.trim();
  if (clean.length < 6) {
    throw new Error('আইডি ন্যূনতম ৬ বা ৭ সংখ্যার হতে হবে (যেমন: 2204055)');
  }
  const batch = clean.substring(0, 2);
  const deptCode = clean.substring(2, 4) as DepartmentCode;
  const roll = clean.substring(4);
  const dept = DEPARTMENTS[deptCode];

  if (!dept) {
    throw new Error(`অপরিচিত ডিপার্টমেন্ট কোড: ${deptCode}। সঠিক আইডি প্রবেশ করান।`);
  }

  return {
    studentId: clean,
    batch: `20${batch}`,
    batchShort: `'${batch}`,
    deptCode,
    deptName: dept.name,
    deptAbbr: dept.abbr,
    roll,
    themeColor: dept.themeColor,
    lightColor: dept.lightColor,
    multiplier: dept.multiplier
  };
}
