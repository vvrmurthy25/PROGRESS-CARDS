
import React, { useState, useRef, useEffect } from 'react';
import { Student } from '../types';
import { Search, UserCircle, ChevronDown, Check, Users, Printer } from 'lucide-react';

interface Props {
  students: Student[];
  onSelect: (student: Student) => void;
  selectedStudent: Student | null;
}

const StudentSelector: React.FC<Props> = ({ students, onSelect, selectedStudent }) => {
  const [isSectionOpen, setIsSectionOpen] = useState(false);
  const [isStudentOpen, setIsStudentOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSection, setActiveSection] = useState<'A' | 'B'>('A');
  
  const sectionDropdownRef = useRef<HTMLDivElement>(null);
  const studentDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedStudent) {
      setActiveSection(selectedStudent.section);
    }
  }, [selectedStudent]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sectionDropdownRef.current && !sectionDropdownRef.current.contains(event.target as Node)) {
        setIsSectionOpen(false);
      }
      if (studentDropdownRef.current && !studentDropdownRef.current.contains(event.target as Node)) {
        setIsStudentOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSection = s.section === activeSection;
    return matchesSearch && matchesSection;
  });

  return (
    <div className="w-full bg-white border-b border-slate-200 sticky top-0 z-40 no-print shadow-sm">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        
        {/* Left Corner: Section Selection */}
        <div className="relative w-40 sm:w-48" ref={sectionDropdownRef}>
          <button
            onClick={() => setIsSectionOpen(!isSectionOpen)}
            className="w-full flex items-center justify-between gap-2 px-3 py-2.5 bg-white border border-slate-300 rounded-xl hover:border-blue-500 transition-all text-left group shadow-sm"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <Users className="w-4 h-4 text-blue-600 shrink-0" />
              <div className="overflow-hidden">
                <p className="text-[9px] uppercase font-black text-slate-400 leading-none mb-0.5">Section</p>
                <p className="text-sm font-bold text-slate-900">Section {activeSection}</p>
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isSectionOpen ? 'rotate-180' : ''}`} />
          </button>

          {isSectionOpen && (
            <div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              {(['A', 'B'] as const).map(sec => (
                <button
                  key={sec}
                  onClick={() => {
                    setActiveSection(sec);
                    setIsSectionOpen(false);
                    setSearchTerm('');
                    // Deselect student if switching section to avoid confusion
                    if (selectedStudent?.section !== sec) {
                      const firstInSec = students.find(s => s.section === sec);
                      if (firstInSec) onSelect(firstInSec);
                    }
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm font-bold transition-colors ${
                    activeSection === sec ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Section {sec}
                  {activeSection === sec && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Corner: Student Selection & Print */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative w-48 sm:w-64" ref={studentDropdownRef}>
            <button
              onClick={() => setIsStudentOpen(!isStudentOpen)}
              className="w-full flex items-center justify-between gap-2 px-3 py-2.5 bg-white border border-slate-300 rounded-xl hover:border-blue-500 transition-all text-left shadow-sm"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <UserCircle className="w-5 h-5 text-blue-600 shrink-0" />
                <div className="overflow-hidden">
                  <p className="text-[9px] uppercase font-black text-slate-400 leading-none mb-0.5">Student</p>
                  <p className="text-sm font-black text-slate-900 truncate">
                    {selectedStudent ? selectedStudent.name : 'Select Student'}
                  </p>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isStudentOpen ? 'rotate-180' : ''}`} />
            </button>

            {isStudentOpen && (
              <div className="absolute top-full right-0 w-full sm:w-72 mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="p-2 border-b border-slate-100 bg-slate-50">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="text"
                      autoFocus
                      placeholder="Search name..."
                      className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto p-1.5 space-y-0.5">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map(student => (
                      <button
                        key={student.id}
                        onClick={() => {
                          onSelect(student);
                          setIsStudentOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-all ${
                          selectedStudent?.id === student.id
                            ? 'bg-blue-600 text-white'
                            : 'hover:bg-slate-100 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="font-bold text-sm leading-tight">{student.name}</div>
                            <div className={`text-[10px] uppercase font-black tracking-widest opacity-60 ${
                              selectedStudent?.id === student.id ? 'text-white' : 'text-slate-500'
                            }`}>
                              {student.gender}
                            </div>
                          </div>
                        </div>
                        {selectedStudent?.id === student.id && <Check className="w-4 h-4" />}
                      </button>
                    ))
                  ) : (
                    <div className="py-10 text-center text-slate-400 text-sm italic font-medium">
                      No results in Section {activeSection}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={() => window.print()}
            className="flex items-center justify-center p-2.5 sm:px-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-md active:scale-95 text-sm"
            title="Print Card"
          >
            <Printer className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Print</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentSelector;
