
import React from 'react';
import { ExamResult } from '../types';
import { SUBJECTS } from '../constants';

interface Props {
  title: string;
  exams: { label: string, data: ExamResult }[];
  isSA?: boolean;
}

const ExamTable: React.FC<Props> = ({ title, exams, isSA = false }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden print-break-inside-avoid">
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
        <h3 className="text-lg font-bold text-slate-800">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-4 py-3 border-b border-slate-200 font-bold text-slate-700 w-32">Subject</th>
              {exams.map((exam, i) => (
                <React.Fragment key={i}>
                  <th className="px-4 py-3 border-b border-slate-200 font-bold text-slate-700 text-center border-l" colSpan={3}>
                    {exam.label}
                  </th>
                </React.Fragment>
              ))}
            </tr>
            <tr className="bg-slate-50/50 text-[10px] uppercase tracking-wider text-slate-500">
              <th className="px-4 py-2 border-b border-slate-200"></th>
              {exams.map((_, i) => (
                <React.Fragment key={i}>
                  <th className="px-2 py-2 border-b border-slate-200 text-center border-l">Marks</th>
                  <th className="px-2 py-2 border-b border-slate-200 text-center">Grade</th>
                  <th className="px-2 py-2 border-b border-slate-200 text-center">Result</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {SUBJECTS.map((subj) => (
              <tr key={subj.id} className="hover:bg-slate-50/50">
                <td className="px-4 py-2.5 border-b border-slate-200 font-medium text-slate-800">{subj.label}</td>
                {exams.map((exam, i) => {
                  const subjectData = (exam.data as any)[subj.id];
                  const marks = subjectData?.marks || '';
                  const grade = subjectData?.grade || '';
                  const maxVal = isSA ? subj.maxSA : subj.maxFA;
                  const result = grade ? (grade === 'D2' ? 'FAIL' : 'PASS') : '';

                  return (
                    <React.Fragment key={i}>
                      <td className="px-2 py-2.5 border-b border-slate-200 text-center border-l font-mono text-slate-600">
                        {marks ? `${marks}/${maxVal}` : ''}
                      </td>
                      <td className={`px-2 py-2.5 border-b border-slate-200 text-center font-bold ${
                        grade === 'A1' ? 'text-green-600' : 
                        grade === 'D2' ? 'text-red-600' : 'text-slate-700'
                      }`}>
                        {grade}
                      </td>
                      <td className="px-2 py-2.5 border-b border-slate-200 text-center">
                        {result && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            result === 'PASS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {result}
                          </span>
                        )}
                      </td>
                    </React.Fragment>
                  );
                })}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-blue-50 font-bold">
              <td className="px-4 py-3 border-t border-slate-200 text-blue-800">TOTAL / RANK</td>
              {exams.map((exam, i) => (
                <React.Fragment key={i}>
                  <td className="px-2 py-3 border-t border-slate-200 text-center border-l text-blue-800 font-mono" colSpan={2}>
                    {exam.data.total ? `Total: ${exam.data.total}` : ''}
                  </td>
                  <td className="px-2 py-3 border-t border-slate-200 text-center text-blue-900 font-bold">
                    {exam.data.rank ? `Rank: ${exam.data.rank}` : ''}
                  </td>
                </React.Fragment>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default ExamTable;
