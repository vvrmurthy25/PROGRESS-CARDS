
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
  BookOpen
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
  const now = new Date();
  const actionPlanDate = `ఈ నెల 6వ తేదీ (${now.toLocaleString('te-IN', { month: 'long' })})`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col relative overflow-x-hidden">
      <StudentSelector 
        students={students} 
        selectedStudent={selectedStudent} 
        onSelect={setSelectedStudent} 
      />

      <main className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 max-w-5xl mx-auto relative w-full pb-24">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 no-print">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-2xl text-white">
              <School className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">{SCHOOL_INFO.name}</h1>
              <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {SCHOOL_INFO.location}</span>
                <span className="flex items-center gap-1"><ClipboardCheck className="w-3 h-3" /> UDISE: {SCHOOL_INFO.udise}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8 print:space-y-6">
          {/* Profile Card */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 card-shadow flex flex-col md:flex-row gap-8 items-start relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 -mr-12 -mt-12 rounded-full opacity-50" />
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl flex items-center justify-center border-2 border-blue-200 text-blue-600 shrink-0">
              <UserCircle className="w-10 h-10" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-12 flex-1">
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">విద్యార్థి పేరు</p>
                <p className="text-lg font-black text-slate-900">{selectedStudent.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">తల్లిదండ్రులు</p>
                <p className="text-sm font-semibold text-slate-800">{selectedStudent.fatherName} & {selectedStudent.motherName}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">తరగతి వివరాలు</p>
                <p className="text-sm font-semibold text-slate-800">10వ తరగతి - సెక్షన్ {selectedStudent.section}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <ExamTable 
                title="నైపుణ్య పరీక్షలు (FA1, FA2, FA3)" 
                exams={[
                  { label: 'FA-1', data: selectedStudent.fa1 },
                  { label: 'FA-2', data: selectedStudent.fa2 },
                  { label: 'FA-3', data: selectedStudent.fa3 }
                ]}
              />

              <ExamTable 
                title="సామర్థ్య పరీక్షలు (SA1, SA2)" 
                isSA={true}
                exams={[
                  { label: 'SA-1', data: selectedStudent.sa1 },
                  { label: 'SA-2', data: selectedStudent.sa2 }
                ]}
              />

              <AttendanceTable record={selectedStudent.attendance} />
            </div>

            <div className="space-y-8">
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden card-shadow">
                <div className="bg-blue-600 px-6 py-4 text-white flex items-center justify-between">
                  <h3 className="font-bold flex items-center gap-2 text-sm">
                    <Sparkles className="w-4 h-4" />
                    AI లోతైన విశ్లేషణ (SCC Analysis)
                  </h3>
                  {isAnalyzing && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                </div>
                <div className="p-6 space-y-6">
                  {analysis ? (
                    <div className="font-telugu space-y-6">
                      <div className="bg-green-50/50 p-5 rounded-2xl border border-green-100">
                        <div className="flex items-center gap-2 mb-3 text-green-700 font-black text-xs uppercase tracking-widest">
                          <ArrowUpRight className="w-4 h-4" />
                          విజయాలు & బలాలు
                        </div>
                        <p className="text-sm text-slate-800 leading-relaxed font-medium whitespace-pre-line">{analysis.success}</p>
                      </div>

                      <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-100">
                        <div className="flex items-center gap-2 mb-3 text-amber-700 font-black text-xs uppercase tracking-widest">
                          <AlertCircle className="w-4 h-4" />
                          మార్కుల ట్రెండ్ విశ్లేషణ
                        </div>
                        <p className="text-sm text-slate-800 leading-relaxed font-medium whitespace-pre-line">{analysis.decline}</p>
                      </div>

                      <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
                        <div className="flex items-center gap-2 mb-3 text-blue-700 font-black text-xs uppercase tracking-widest">
                          <BookOpen className="w-4 h-4" />
                          మెరుగుదల ప్రణాళిక
                        </div>
                        <p className="text-sm text-slate-800 leading-relaxed font-medium whitespace-pre-line">{analysis.weakSubjects}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 space-y-4">
                      <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto" />
                      <p className="text-slate-400 italic font-telugu text-sm">గెమిని AI విశ్లేషిస్తోంది...</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 text-slate-900 space-y-4 shadow-sm border border-slate-200 card-shadow">
                <div className="flex items-center gap-2 text-blue-600 uppercase tracking-widest text-[10px] font-black bg-blue-50 px-3 py-1 rounded-full w-fit">
                  <Target className="w-4 h-4" />
                  ముఖ్యమైన సమాచారం
                </div>
                <h4 className="text-xl font-black font-telugu text-slate-900 tracking-tight">100 రోజుల ప్రణాళిక</h4>
                <p className="text-sm text-slate-500 leading-relaxed font-telugu">
                  రాష్ట్ర విద్యాశాఖ {actionPlanDate} నుండి "100 రోజుల ప్రణాళిక"ను అమలు చేస్తోంది.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 card-shadow">
            <h4 className="text-sm font-bold text-slate-800 mb-6 uppercase tracking-wider">సంప్రదింపు వివరాలు</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">తరగతి ఉపాధ్యాయులు ({selectedStudent.section})</p>
                  <p className="text-lg font-black text-slate-900">{currentTeacher.teacher}</p>
                  <p className="text-sm font-bold text-blue-600">{currentTeacher.cell}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-600 group-hover:bg-slate-800 group-hover:text-white transition-all">
                  <UserCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">ప్రధానోపాధ్యాయులు</p>
                  <p className="text-lg font-black text-slate-900">{CONTACTS.headmaster.name}</p>
                  <p className="text-sm font-bold text-slate-600">{CONTACTS.headmaster.cell}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Interactive AI Launchers */}
      <VoiceAssistant student={selectedStudent} />
      <ChatWidget student={selectedStudent} />

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default App;
