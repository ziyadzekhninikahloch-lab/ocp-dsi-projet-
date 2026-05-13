import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Project, TeamMember, AuditHistory } from '@/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'motion/react';
import { TrendingUp, Users, Target, CheckCircle2 } from 'lucide-react';
import AuditScoreGauge from '@/components/AuditScoreGauge';
import { cn } from '@/lib/utils';

interface DashboardProps {
  stats: AuditHistory[];
  projects: Project[];
  team: TeamMember[];
}

export default function Dashboard({ stats, projects, team }: DashboardProps) {
  const averageScore = projects.length > 0 
    ? Math.round(projects.reduce((acc, p) => acc + p.audit_score, 0) / projects.length)
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-12 gap-6">
        {/* AUDIT SCORE GAUGE */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="col-span-12 lg:col-span-4 glass rounded-[24px] p-6 flex flex-col items-center justify-center min-h-[280px]"
        >
          <AuditScoreGauge score={averageScore} />
        </motion.div>

        {/* HISTORICAL TREND */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="col-span-12 lg:col-span-8 glass rounded-[24px] p-6 flex flex-col"
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Historical Audit Trends</h3>
            <span className="text-xs text-emerald-600 font-bold tracking-tight">+12% vs last month</span>
          </div>
          <div className="flex-1 min-h-[150px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis 
                  dataKey="created_at" 
                  tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 'bold' }} 
                  axisLine={false}
                  tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short' })}
                />
                <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: '11px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#004a99" 
                  strokeWidth={4} 
                  dot={{ r: 4, fill: '#004a99', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, fill: '#84cc16' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* ACTIVE RESOURCE DISTRIBUTION */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="col-span-12 glass rounded-[24px] p-6 shadow-sm"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Plan de Charge : Active Resource Distribution</h3>
            <div className="text-[10px] flex gap-4 font-bold text-slate-400">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Devs</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> Architects</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-sky-500"></div> Analysts</div>
            </div>
          </div>
          <div className="space-y-4">
            {projects.slice(0, 3).map((project, idx) => (
              <div key={idx} className="grid grid-cols-12 items-center text-[11px] font-bold">
                <span className="col-span-2 text-slate-500 truncate pr-4">{project.name}</span>
                <div className="col-span-10 flex h-4 bg-slate-100/50 rounded-full overflow-hidden">
                  <div className="bg-blue-500" style={{ width: `${Math.random() * 40 + 20}%` }}></div>
                  <div className="bg-indigo-500 ml-1" style={{ width: `${Math.random() * 20 + 10}%` }}></div>
                  <div className="bg-sky-500 ml-auto" style={{ width: `${Math.random() * 15 + 5}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* PROJECT LIST */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="col-span-12 glass rounded-[24px] p-6"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] text-slate-400 font-black uppercase border-b border-slate-100">
                  <th className="pb-3">Project Name</th>
                  <th className="pb-3">Tech Stack</th>
                  <th className="pb-3">Code Quality</th>
                  <th className="pb-3 text-right">Score</th>
                </tr>
              </thead>
              <tbody className="text-[11px]">
                {projects.map((project, i) => (
                  <tr key={i} className="border-b border-slate-50/50 hover:bg-white/30 transition-colors">
                    <td className="py-4 font-bold text-slate-700">{project.name}</td>
                    <td className="py-4 text-slate-400">Python / SQL / React</td>
                    <td className="py-4">
                      <span className={`flex items-center gap-1 font-bold ${project.status === 'Audited' ? 'text-ocp-lime' : 'text-blue-500'}`}>
                        <div className={cn("w-1.5 h-1.5 rounded-full", project.status === 'Audited' ? "bg-ocp-lime" : "bg-blue-500 animate-pulse")}></div>
                        {project.status === 'Audited' ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-4 font-black text-right text-slate-900 text-sm">
                      {project.audit_score}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
