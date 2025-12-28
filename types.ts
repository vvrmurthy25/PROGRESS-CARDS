
export type Grade = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'D1' | 'D2' | '' | 'FAIL' | 'PASS';

export interface SubjectMarks {
  marks: string;
  grade: Grade;
}

export interface ExamResult {
  telugu: SubjectMarks;
  hindi: SubjectMarks;
  english: SubjectMarks;
  maths: SubjectMarks;
  ps: SubjectMarks;
  bs: SubjectMarks;
  social: SubjectMarks;
  total: string;
  grade: Grade;
  result: 'PASS' | 'FAIL' | '';
  rank: string;
}

export interface AttendanceRecord {
  months: {
    june: string;
    july: string;
    august: string;
    september: string;
    october: string;
    november: string;
    december: string;
    january: string;
    february: string;
    march: string;
    april: string;
  };
  totalWorkingDaysUntilNov: number;
  totalAttendedDaysUntilNov: string;
}

export interface Student {
  id: string;
  section: 'A' | 'B';
  name: string;
  gender: string;
  fatherName: string;
  motherName: string;
  fa1: ExamResult;
  fa2: ExamResult;
  fa3: ExamResult;
  sa1: ExamResult;
  sa2: ExamResult;
  attendance: AttendanceRecord;
}

export interface AIAnalysis {
  success: string;
  decline: string;
  weakSubjects: string;
}
