import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TeamMember } from '@/types';
import { motion } from 'motion/react';
import { Edit2, Users, UserPlus, Search, Filter, Briefcase } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from 'sonner';

interface TeamViewProps {
  team: TeamMember[];
  onTeamUpdate: () => void;
}

export default function TeamView({ team, onTeamUpdate }: TeamViewProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    role: 'Developer' as TeamMember['role'],
    workload: 0,
    assignments: ''
  });

  const openAddDialog = () => {
    setEditingMember(null);
    setFormData({ name: '', role: 'Developer', workload: 0, assignments: '' });
    setIsDialogOpen(true);
  };

  const openEditDialog = (member: TeamMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      role: member.role,
      workload: member.workload,
      assignments: JSON.parse(member.assignments).join(', ')
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingMember ? `/api/team/${editingMember.id}` : '/api/team';
      const method = editingMember ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          assignments: formData.assignments.split(',').map(a => a.trim()).filter(a => a)
        })
      });

      if (response.ok) {
        toast.success(editingMember ? "Ressource mise à jour !" : "Membre de l'équipe ajouté !");
        setIsDialogOpen(false);
        onTeamUpdate();
      }
    } catch (err) {
      toast.error("Erreur lors de l'opération");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white/50 p-4 rounded-[20px] border border-white/50">
        <div className="flex gap-4 items-center flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              placeholder="Rechercher une ressource..." 
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-ocp-blue/20"
            />
          </div>
          <button className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50">
            <Filter className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <button 
          onClick={openAddDialog}
          className="flex items-center gap-2 bg-ocp-blue text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-ocp-blue/20"
        >
          <UserPlus className="w-4 h-4" />
          Ajouter Ressource
        </button>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px] rounded-[24px]">
            <DialogHeader>
              <DialogTitle>{editingMember ? 'Modifier la ressource' : 'Ajouter une ressource'}</DialogTitle>
              <DialogDescription>
                {editingMember 
                  ? `Mettez à jour les informations de ${editingMember.name}.` 
                  : "Créez un nouveau membre pour l'équipe DSI OCP."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="name" className="text-right text-sm font-medium">Nom</label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="col-span-3 rounded-xl"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="role" className="text-right text-sm font-medium">Rôle</label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="col-span-3 bg-white border border-slate-200 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-ocp-blue/20"
                >
                  <option value="Developer">Developer</option>
                  <option value="Data Analyst">Data Analyst</option>
                  <option value="Project Manager">Project Manager</option>
                  <option value="System Architect">System Architect</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="workload" className="text-right text-sm font-medium">Charge (%)</label>
                <Input
                  id="workload"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.workload}
                  onChange={(e) => setFormData({ ...formData, workload: parseInt(e.target.value) || 0 })}
                  className="col-span-3 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="assignments" className="text-right text-sm font-medium">Tâches</label>
                <Input
                  id="assignments"
                  placeholder="Task 1, Task 2..."
                  value={formData.assignments}
                  onChange={(e) => setFormData({ ...formData, assignments: e.target.value })}
                  className="col-span-3 rounded-xl"
                />
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-ocp-blue text-white rounded-xl w-full h-11 font-bold">
                  {editingMember ? 'Mettre à jour' : 'Enregistrer'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {team.map((member, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="glass border-none rounded-[24px] overflow-hidden group hover:shadow-xl transition-all relative">
              <button 
                onClick={() => openEditDialog(member)}
                className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur rounded-xl text-slate-400 hover:text-ocp-blue hover:bg-white shadow-sm transition-all z-10"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <div className="h-24 bg-ocp-blue/10 relative">
                <div className="absolute -bottom-6 left-6">
                  <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center font-bold text-xl text-ocp-blue shadow-lg border-2 border-white">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                </div>
              </div>
              <CardContent className="pt-8 pb-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg leading-tight">{member.name}</h3>
                    <Badge variant="outline" className="mt-1 bg-ocp-blue/5 border-ocp-blue/10 text-ocp-blue px-2 py-0 text-[9px] uppercase tracking-wider">
                      {member.role}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Workload</p>
                    <p className={`text-lg font-black ${member.workload > 85 ? 'text-red-500' : 'text-ocp-lime'}`}>
                      {member.workload}%
                    </p>
                  </div>
                </div>

                <div className="w-full h-2 bg-slate-100 rounded-full mb-6 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${member.workload}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className={`h-full ${member.workload > 85 ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-ocp-lime shadow-[0_0_8px_rgba(132,204,22,0.3)]'}`}
                  />
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                    <Briefcase className="w-3 h-3" /> Assignments
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {JSON.parse(member.assignments).map((task: string, j: number) => (
                      <span key={j} className="text-[11px] px-2 py-1 bg-slate-100/80 text-slate-600 rounded-lg whitespace-nowrap">
                        {task}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
