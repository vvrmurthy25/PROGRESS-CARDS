
import React from 'react';
import { AttendanceRecord } from '../types';
import { WORKING_DAYS } from '../constants';
import { calculateAttendancePercentage } from '../utils';

interface Props { record: AttendanceRecord; }

const AttendanceTable: React.FC<Props> = ({ record }) => {
  const months = [
    'june', 'july', 'august', 'september', 'october', 'november',
    'december', 'january', 'february', 'march', 'april'
  ];

  const percentage = calculateAttendancePercentage(
    record.totalAttendedDaysUntilNov,
    record.totalWorkingDaysUntilNov
  );

  return (
    <div className="space-y-4 print-break-inside-avoid">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800">Attendance Details</h3>
          <div className="flex gap-4">
             <div className="text-sm text-slate-500 font-medium">Working Days: <span className="font-bold text-slate-800">120</span></div>
             <div className="text-sm text-slate-500 font-medium">Attended: <span className="font-bold text-slate-800">{record.totalAttendedDaysUntilNov}</span></div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-center border-collapse">
            <thead>
              <tr className="bg-slate-100">
                <th className="px-3 py-3 border-b border-slate-200 font-bold text-slate-700 text-left">Month</th>
                {months.map(m => (
                  <th key={m} className="px-2 py-3 border-b border-slate-200 capitalize font-bold text-slate-700 border-l">{m.slice(0, 3)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white">
                <td className="px-3 py-3 border-b border-slate-200 font-bold text-slate-900 text-left uppercase tracking-tight">Working Days</td>
                {months.map(m => (
                  <td key={m} className="px-2 py-3 border-b border-slate-200 border-l text-slate-900 font-bold">{(WORKING_DAYS as any)[m] || ''}</td>
                ))}
              </tr>
              <tr className="bg-white">
                <td className="px-3 py-3 font-bold text-slate-900 text-left uppercase tracking-tight">Attended Days</td>
                {months.map(m => (
                  <td key={m} className="px-2 py-3 border-l border-slate-200 text-slate-900 font-black">{(record.months as any)[m] || ''}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div className={`p-4 rounded-xl border-l-4 font-telugu ${
        percentage >= 75 ? 'bg-green-50 border-green-500 text-green-800' : 'bg-amber-50 border-amber-500 text-amber-800'
      }`}>
        <p className="font-medium text-sm leading-relaxed">
          {percentage >= 75 
            ? `అద్భుతమైన హాజరు (${percentage}%)! పాఠశాలకు క్రమం తప్పకుండా రావడం మీ భవిష్యత్తు పట్ల మీకున్న నిబద్ధతను తెలియజేస్తుంది. ఇలాగే కొనసాగించండి!`
            : `తక్కువ హాజరు శాతం (${percentage}%). తరగతులకు హాజరు కాకపోవడం వల్ల పాఠ్యాంశాలను అర్థం చేసుకోవడం కష్టమవుతుంది. క్రమం తప్పకుండా పాఠశాలకు రావాలని మేము గట్టిగా సూచిస్తున్నాము.`}
        </p>
      </div>
    </div>
  );
};

export default AttendanceTable;
