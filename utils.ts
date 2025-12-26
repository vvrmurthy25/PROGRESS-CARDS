
import { Student, Grade, ExamResult, SubjectMarks } from './types';
import { CSV_DATA } from './constants';

const parseGrade = (grade: string): Grade => {
  const g = grade.trim().toUpperCase();
  if (['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'D1', 'D2', 'FAIL', 'PASS'].includes(g)) {
    return g as Grade;
  }
  return '';
};

const createSubjectMarks = (marks: string, grade: string): SubjectMarks => ({
  marks: marks.trim() || '',
  grade: parseGrade(grade)
});

export const parseCSVData = (): Student[] => {
  const lines = CSV_DATA.split('\n');
  return lines.filter(line => line.trim()).map((line, index) => {
    const cols = line.split(',');
    
    // Structure extraction logic
    const student: Student = {
      id: `std-${index}`,
      section: cols[0].trim() as 'A' | 'B',
      name: cols[1].trim(),
      gender: cols[2].trim(),
      fatherName: cols[3].trim(),
      motherName: cols[4].trim(),
      fa1: {
        telugu: createSubjectMarks(cols[5], cols[6]),
        hindi: createSubjectMarks(cols[7], cols[8]),
        english: createSubjectMarks(cols[9], cols[10]),
        maths: createSubjectMarks(cols[11], cols[12]),
        ps: createSubjectMarks(cols[13], cols[14]),
        bs: createSubjectMarks(cols[15], cols[16]),
        social: createSubjectMarks(cols[17], cols[18]),
        total: cols[19],
        grade: parseGrade(cols[20]),
        result: (cols[21].trim().toUpperCase() as 'PASS' | 'FAIL') || '',
        rank: cols[22]
      },
      fa2: {
        telugu: createSubjectMarks(cols[23], cols[24]),
        hindi: createSubjectMarks(cols[25], cols[26]),
        english: createSubjectMarks(cols[27], cols[28]),
        maths: createSubjectMarks(cols[29], cols[30]),
        ps: createSubjectMarks(cols[31], cols[32]),
        bs: createSubjectMarks(cols[33], cols[34]),
        social: createSubjectMarks(cols[35], cols[36]),
        total: cols[37],
        grade: parseGrade(cols[38]),
        result: (cols[39].trim().toUpperCase() as 'PASS' | 'FAIL') || '',
        rank: cols[40]
      },
      fa3: { // Empty in current CSV data but structure preserved
        telugu: createSubjectMarks('', ''),
        hindi: createSubjectMarks('', ''),
        english: createSubjectMarks('', ''),
        maths: createSubjectMarks('', ''),
        ps: createSubjectMarks('', ''),
        bs: createSubjectMarks('', ''),
        social: createSubjectMarks('', ''),
        total: '', grade: '', result: '', rank: ''
      },
      sa1: {
        telugu: createSubjectMarks(cols[41], cols[42]),
        hindi: createSubjectMarks(cols[43], cols[44]),
        english: createSubjectMarks(cols[45], cols[46]),
        maths: createSubjectMarks(cols[47], cols[48]),
        ps: createSubjectMarks(cols[49], cols[50]),
        bs: createSubjectMarks(cols[51], cols[52]),
        social: createSubjectMarks(cols[53], cols[54]),
        total: cols[55],
        grade: parseGrade(cols[56]),
        result: (cols[57].trim().toUpperCase() as 'PASS' | 'FAIL') || '',
        rank: cols[58]
      },
      sa2: { // Upcoming/Empty
        telugu: createSubjectMarks('', ''),
        hindi: createSubjectMarks('', ''),
        english: createSubjectMarks('', ''),
        maths: createSubjectMarks('', ''),
        ps: createSubjectMarks('', ''),
        bs: createSubjectMarks('', ''),
        social: createSubjectMarks('', ''),
        total: '', grade: '', result: '', rank: ''
      },
      attendance: {
        months: {
          june: cols[59],
          july: cols[60],
          august: cols[61],
          september: cols[62],
          october: cols[63],
          november: cols[64],
          december: '', january: '', february: '', march: '', april: ''
        },
        totalWorkingDaysUntilNov: 120,
        totalAttendedDaysUntilNov: cols[65]
      }
    };
    return student;
  });
};

export const getResultFromGrade = (grade: Grade): 'PASS' | 'FAIL' | '' => {
  if (!grade) return '';
  if (grade === 'D2') return 'FAIL';
  return 'PASS';
};

export const calculateAttendancePercentage = (attended: string, total: number): number => {
  const att = parseFloat(attended);
  if (isNaN(att)) return 0;
  return Math.round((att / total) * 100);
};
