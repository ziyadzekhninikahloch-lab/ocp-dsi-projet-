import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './views/Dashboard';
import AuditView from './views/AuditView';
import TeamView from './views/TeamView';
import AIFixHelper from './components/AIFixHelper';
import { Project, TeamMember, AuditHistory, AuditResult } from './types';
import { Toaster } from 'sonner';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [projects, setProjects] = useState<Project[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [stats, setStats] = useState<AuditHistory[]>([]);
  const [lastAuditResult, setLastAuditResult] = useState<AuditResult | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pRes, tRes, sRes] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/team'),
        fetch('/api/stats')
      ]);
      const [pData, tData, sData] = await Promise.all([
        pRes.json(),
        tRes.json(),
        sRes.json()
      ]);
      setProjects(pData);
      setTeam(tData);
      setStats(sData);
    } catch (err) {
      console.error("Failed to fetch data", err);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard stats={stats} projects={projects} team={team} />;
      case 'audit':
        return (
          <AuditView 
            onAuditComplete={(res, projId) => {
              setLastAuditResult(res);
              fetchData();
            }} 
            projects={projects}
          />
        );
      case 'team':
        return <TeamView team={team} onTeamUpdate={fetchData} />;
      default:
        return <Dashboard stats={stats} projects={projects} team={team} />;
    }
  };

  return (
    <div className="flex w-full h-screen overflow-hidden text-slate-800">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 flex flex-col h-full main-gradient overflow-hidden">
        <header className="h-[70px] px-8 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-tight">OCP AI Project Auditor</h1>
            <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">Operational Performance & Strategy</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/60 px-3 py-1.5 rounded-full border border-white/40 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-xs font-medium text-slate-600">Model: Fast-Balanced 4.0</span>
            </div>
            <div className="w-[32px] h-[32px] rounded-lg bg-ocp-blue text-white flex items-center justify-center font-bold text-sm shadow-lg">
              OC
            </div>
          </div>
        </header>

        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          {renderContent()}
        </div>
      </main>

      <AIFixHelper auditResult={lastAuditResult} />
      <Toaster position="top-right" />
    </div>
  );
}
