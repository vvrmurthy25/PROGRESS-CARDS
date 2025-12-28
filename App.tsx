
import React, { useState, useEffect, useCallback } from 'react';
import { Student, AIAnalysis } from './types';
import { parseCSVData } from './utils';
import { SCHOOL_INFO, CONTACTS } from './constants';
import StudentSelector from './components/StudentSelector';
import ExamTable from './components/ExamTable';
import AttendanceTable from './components/AttendanceTable';
import ChatWidget from './ChatWidget';
import VoiceAssistant from './VoiceAssistant';
import { analyzePerformance } from './geminiService';
import { 
  Phone, 
  MapPin, 
  ClipboardCheck, 
  Target, 
  School,
  Sparkles,
  UserCircle,
  ArrowUpRight,
  AlertCircle,
  BookOpen,
  Printer,
  ShieldCheck,
  CalendarDays,
  // Fix: Added missing Loader2 import from lucide-react
  Loader2
} from 'lucide-react';

const App: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  useEffect(() => {
    const data = parseCSVData();
    setStudents(data);
    if (data.length > 0) setSelectedStudent(data[0]);
  }, []);

  const runAnalysis = useCallback(async (student: Student) => {
    setIsAnalyzing(true);
    setAnalysis(null);
    const result = await analyzePerformance(student);
    setAnalysis(result);
    setIsAnalyzing(false);
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      runAnalysis(selectedStudent);
    }
  }, [selectedStudent, runAnalysis]);

  if (!selectedStudent) return <div className="p-8 text-center font-bold">డేటాను లోడ్ చేస్తున్నాము...</div>;

  const currentTeacher = selectedStudent.section === 'A' ? CONTACTS.sectionA : CONTACTS.sectionB;
  const attendancePercentage = Math.round((parseFloat(selectedStudent.attendance.totalAttendedDaysUntilNov) / 120) * 100);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col relative overflow-x-hidden">
      <StudentSelector 
        students={students} 
        selectedStudent={selectedStudent} 
        onSelect={setSelectedStudent} 
      />

      <main className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 max-w-6xl mx-auto relative w-full pb-24">
        {/* Institutional Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b-4 border-slate-900 pb-10 mb-8 relative">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-2xl shrink-0">
              <School className="w-12 h-12" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-2">{SCHOOL_INFO.name}</h1>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-[0.3em] mb-4">{SCHOOL_INFO.location}</p>
              <div className="flex flex-wrap items-center gap-4 text-[0.65rem] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-4 py-2 rounded-xl w-fit border border-slate-200">
                <span className="flex items-center gap-1.5"><ClipboardCheck className="w-3 h-3" /> UDISE: {SCHOOL_INFO.udise}</span>
                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
                <span>SSC GRADE 10</span>
                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
                <span>AY: 2025-26</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end no-print">
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs transition-all shadow-xl active:scale-95 mb-4"
            >
              <Printer className="w-4 h-4" /> SAVE AS PDF
            </button>
            <div className="flex items-center gap-2 text-[0.6rem] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
              <ShieldCheck className="w-3.5 h-3.5" /> SECURE DIGITAL RECORD
            </div>
          </div>
        </div>

        {/* Student Mini Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 no-print">
          <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-xl flex items-center gap-4">
             <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-indigo-400"><Target className="w-5 h-5"/></div>
             <div>
                <p className="text-[0.6rem] font-bold opacity-50 uppercase tracking-widest">Aggregate</p>
                <p className="text-xl font-black">{selectedStudent.sa1.total} <span className="text-[0.6rem] opacity-30">/ 600</span></p>
             </div>
          </div>
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center gap-4">
             <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600"><ArrowUpRight className="w-5 h-5"/></div>
             <div>
                <p className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest">Class Rank</p>
                <p className="text-xl font-black text-slate-900">#{selectedStudent.sa1.rank}</p>
             </div>
          </div>
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center gap-4">
             <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600"><CalendarDays className="w-5 h-5"/></div>
             <div>
                <p className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest">Attendance</p>
                <p className="text-xl font-black text-slate-900">{attendancePercentage}%</p>
             </div>
          </div>
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center gap-4">
             <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600"><Sparkles className="w-5 h-5"/></div>
             <div>
                <p className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest">Status</p>
                <p className="text-xl font-black text-slate-900">{selectedStudent.sa1.result}</p>
             </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Profile Card */}
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-200 card-shadow flex flex-col md:flex-row gap-10 items-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 -mr-32 -mt-32 rounded-full blur-3xl pointer-events-none" />
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-4xl font-black text-indigo-600 border-4 border-white shadow-inner shrink-0 uppercase">
              {selectedStudent.name.charAt(0)}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-8 gap-x-12 flex-1">
              <div className="space-y-1.5">
                <p className="text-[0.6rem] font-black text-slate-400 uppercase tracking-[0.2em]">Student Name</p>
                <p className="text-2xl font-black text-slate-900 tracking-tight">{selectedStudent.name}</p>
              </div>
              <div className="space-y-1.5">
                <p className="text-[0.6rem] font-black text-slate-400 uppercase tracking-[0.2em]">Parental Information</p>
                <p className="text-sm font-bold text-slate-700">{selectedStudent.fatherName} & {selectedStudent.motherName}</p>
              </div>
              <div className="space-y-1.5">
                <p className="text-[0.6rem] font-black text-slate-400 uppercase tracking-[0.2em]">Academic Placement</p>
                <p className="text-sm font-bold text-slate-700">Class 10 • Section {selectedStudent.section} • {selectedStudent.gender}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-10">
              <ExamTable 
                title="Formative Assessments (F.A. Portfolio)" 
                exams={[
                  { label: 'FA-1', data: selectedStudent.fa1 },
                  { label: 'FA-2', data: selectedStudent.fa2 },
                  { label: 'FA-3', data: selectedStudent.fa3 }
                ]}
              />

              <ExamTable 
                title="Summative Evaluation (S.A. Mid-Year)" 
                isSA={true}
                exams={[
                  { label: 'SA-1', data: selectedStudent.sa1 }
                ]}
              />

              <AttendanceTable record={selectedStudent.attendance} />
            </div>

            <div className="space-y-10">
              <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden card-shadow sticky top-24">
                <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between">
                  <h3 className="font-black flex items-center gap-3 text-xs uppercase tracking-widest">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    AI Intelligence Report
                  </h3>
                  {isAnalyzing && <Loader2 className="w-4 h-4 text-white/50 animate-spin" />}
                </div>
                <div className="p-8 space-y-8">
                  {analysis ? (
                    <div className="font-telugu space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 text-emerald-600 font-black text-[0.6rem] uppercase tracking-widest">
                          <ArrowUpRight className="w-4 h-4" />
                          విజయాలు & బలాలు
                        </div>
                        <p className="text-[0.95rem] text-slate-700 leading-relaxed font-medium italic border-l-2 border-emerald-100 pl-4">{analysis.success}</p>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-3 text-amber-600 font-black text-[0.6rem] uppercase tracking-widest">
                          <AlertCircle className="w-4 h-4" />
                          మార్కుల ట్రెండ్ విశ్లేషణ
                        </div>
                        <p className="text-[0.95rem] text-slate-700 leading-relaxed font-medium italic border-l-2 border-amber-100 pl-4">{analysis.decline}</p>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-3 text-indigo-600 font-black text-[0.6rem] uppercase tracking-widest">
                          <BookOpen className="w-4 h-4" />
                          మెరుగుదల ప్రణాళిక
                        </div>
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-[0.9rem] text-slate-800 leading-relaxed font-medium whitespace-pre-line">
                          {analysis.weakSubjects}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-20 space-y-4">
                      <div className="w-12 h-12 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin mx-auto shadow-sm" />
                      <p className="text-slate-400 italic font-telugu text-sm tracking-wide">డేటాను విశ్లేషిస్తోంది...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Verification & Footers */}
          <div className="pt-20 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 flex-1">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100">
                  <UserCircle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest mb-1">Class Teacher Verification</p>
                  <p className="text-lg font-black text-slate-900">{currentTeacher.teacher}</p>
                  <p className="text-sm font-bold text-indigo-600">{currentTeacher.cell}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest mb-1">Headmaster Signature</p>
                  <p className="text-lg font-black text-slate-900">{CONTACTS.headmaster.name}</p>
                  <p className="text-xs font-medium text-slate-500">Verified Timestamp: {new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Authenticity Seal */}
            <div className="relative group cursor-help opacity-40 hover:opacity-100 transition-opacity">
              <svg width="100" height="100" viewBox="0 0 100 100">
                <path id="curve" d="M 20, 50 a 30,30 0 1,1 60,0 a 30,30 0 1,1 -60,0" fill="transparent" />
                <text className="text-[0.4rem] font-black fill-slate-900 uppercase tracking-widest">
                  <textPath xlinkHref="#curve">S.P.P.Z.P.P. HIGH SCHOOL • AUTHENTIC RECORD •</textPath>
                </text>
                <circle cx="50" cy="50" r="25" className="fill-slate-900" />
                <path d="M 42 50 L 48 56 L 58 44" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>
      </main>

      {/* Interactive AI Launchers */}
      <VoiceAssistant student={selectedStudent} />
      <ChatWidget student={selectedStudent} />
    </div>
  );
};

export default App;
