import React from 'react';
import { LayoutDashboard, ShieldCheck, Users, BarChart3, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'audit', icon: ShieldCheck, label: 'Audit Engine' },
    { id: 'team', icon: Users, label: 'Team Mgmt' },
    { id: 'analytics', icon: BarChart3, label: 'History' },
  ];

  return (
    <aside className="w-[200px] h-full sidebar-gradient flex flex-col shrink-0 text-white shadow-2xl z-20 overflow-hidden">
      <div className="p-6 flex items-center gap-3 border-b border-blue-800/50">
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-ocp-blue rotate-45"></div>
        </div>
        <span className="font-bold text-sm tracking-tight">OCP DSI</span>
      </div>

      <nav className="flex-1 p-4 space-y-2 mt-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-left",
              activeTab === item.id 
                ? "bg-white/10 text-white font-semibold" 
                : "text-white/60 hover:text-white hover:bg-white/5 uppercase tracking-widest text-[10px]"
            )}
          >
            <item.icon className={cn("w-4 h-4", activeTab === item.id ? "text-white" : "text-white/40")} />
            <span className={cn(activeTab === item.id ? "text-xs" : "text-[10px]")}>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-blue-800/50">
        <div className="bg-ocp-dark-blue p-3 rounded-xl flex items-center justify-between border border-white/5">
          <div className="w-8 h-8 bg-blue-400 rounded-full border-2 border-white/20 flex items-center justify-center font-bold text-[10px]">
            SB
          </div>
          <div className="text-[10px] opacity-60 leading-tight text-right">
            S. Bennani<br/>Architect
          </div>
        </div>
      </div>
    </aside>
  );
}
