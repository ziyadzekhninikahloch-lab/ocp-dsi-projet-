import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GoogleGenAI } from "@google/genai";
import AuditScoreGauge from '../components/AuditScoreGauge';
import { motion } from 'motion/react';
import { ShieldCheck, Upload, AlertCircle, FileCode, CheckCircle2, ChevronRight } from 'lucide-react';
import { Project, AuditResult } from '@/types';
import { toast } from 'sonner';

interface AuditViewProps {
  onAuditComplete: (result: AuditResult, projectId: number) => void;
  projects: Project[];
}

export default function AuditView({ onAuditComplete, projects }: AuditViewProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [description, setDescription] = useState('');
  const [isAuditing, setIsAuditing] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);

  const startAudit = async () => {
    if (!selectedProjectId && !description) {
      toast.error("Veuillez sélectionner un projet ou fournir une description.");
      return;
    }

    setIsAuditing(true);
    setResult(null);

    try {
      const ai = new GoogleGenAI({ apiKey: (process.env as any).GEMINI_API_KEY });
      const prompt = `Tu es un expert en audit de projets IT pour OCP DSI. 
      Evalue le projet suivant selon ces critères: 
      1. Faisabilité Technique (0-100)
      2. Qualité du Code/Architecture (0-100)
      3. Complétude de la Documentation (0-100)
      4. Conformité aux Standards OCP (0-100)
      
      Nom/Description: ${description || projects.find(p => p.id === selectedProjectId)?.name}
      
      Retourne un JSON avec:
      {
        "score": (moyenne globale),
        "technicalFeasibility": "analyse concise",
        "codeQuality": "analyse concise",
        "documentation": "analyse concise",
        "ocpCompliance": "analyse concise",
        "findings": ["point 1", "point 2", ...]
      }`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: { responseMimeType: "application/json" }
      });

      const auditData: AuditResult = JSON.parse(response.text || '{}');
      setResult(auditData);

      // Save to DB
      if (selectedProjectId) {
        await fetch('/api/audit/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            project_id: selectedProjectId,
            score: auditData.score,
            report: auditData
          })
        });
      }

      onAuditComplete(auditData, selectedProjectId || 0);
      toast.success("Audit terminé avec succès!");
    } catch (error) {
      console.error(error);
      toast.error("L'audit a échoué. Veuillez réessayer.");
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <Card className="glass border-none rounded-[24px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-ocp-blue" />
              Soumettre un Projet
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">Sélectionner un Projet Existant</label>
              <select 
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-ocp-blue/20"
                onChange={(e) => setSelectedProjectId(Number(e.target.value))}
              >
                <option value="">Nouveau Projet (Entrez la description ci-dessous)</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">Description / Code / Stack Tech</label>
              <textarea 
                className="w-full h-40 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-ocp-blue/20"
                placeholder="Décrivez les objectifs, la stack technique (Python, SQL, React) et l'architecture du projet..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <Button 
              className="w-full bg-ocp-blue hover:bg-ocp-blue/90 h-12 rounded-xl font-bold flex gap-2"
              disabled={isAuditing}
              onClick={startAudit}
            >
              {isAuditing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Audit en cours...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  Lancer l'Audit AI
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <Card className="glass border-none rounded-[24px] h-full">
          {result ? (
            <CardContent className="pt-6 space-y-8">
              <div className="flex flex-col items-center">
                <AuditScoreGauge score={result.score} />
                <div className="mt-4 flex gap-4">
                  <div className="px-4 py-2 bg-ocp-lime/10 rounded-xl flex items-center gap-2 border border-ocp-lime/20">
                    <CheckCircle2 className="w-4 h-4 text-ocp-lime" />
                    <span className="text-xs font-bold text-ocp-lime">Standard Approved</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-slate-800">
                {[
                  { label: 'Faisabilité', val: result.technicalFeasibility },
                  { label: 'Code Quality', val: result.codeQuality },
                  { label: 'Documentation', val: result.documentation },
                  { label: 'Conformité OCP', val: result.ocpCompliance },
                ].map((item, i) => (
                  <div key={i} className="glass-dark p-3 rounded-2xl border border-white/40">
                    <p className="text-[10px] font-bold text-ocp-blue uppercase mb-1 tracking-wider">{item.label}</p>
                    <p className="text-[11px] text-slate-600 line-clamp-3 leading-relaxed font-medium">{item.val}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  Observations Clés
                </h4>
                <div className="space-y-2">
                  {result.findings.map((f, i) => (
                    <div key={i} className="flex gap-2 items-start p-3 bg-white/50 rounded-xl border border-slate-100 italic">
                      <ChevronRight className="w-3 h-3 mt-1 text-ocp-blue shrink-0" />
                      <p className="text-xs text-slate-600">{f}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center text-slate-300">
              <FileCode className="w-20 h-20 mb-4 opacity-10" />
              <h3 className="text-xl font-bold text-slate-400">Prêt pour l'Audit</h3>
              <p className="text-sm">Remplissez les détails du projet pour voir le score de qualité OCP DSI.</p>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
