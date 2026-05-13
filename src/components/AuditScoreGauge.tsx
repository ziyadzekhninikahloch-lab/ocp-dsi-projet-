import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'motion/react';

interface AuditScoreGaugeProps {
  score: number;
}

export default function AuditScoreGauge({ score }: AuditScoreGaugeProps) {
  const data = [
    { name: 'Score', value: score },
    { name: 'Remaining', value: 100 - score },
  ];

  const getColor = (val: number) => {
    if (val >= 80) return '#a2d240'; // OCP Green
    if (val >= 50) return '#ffcc00'; // Amber
    return '#ff4444'; // Red
  };

  const COLORS = [getColor(score), 'rgba(0,0,0,0.05)'];

  return (
    <div className="relative w-full h-[200px] flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="100%"
            startAngle={180}
            endAngle={0}
            innerRadius={60}
            outerRadius={80}
            paddingAngle={0}
            dataKey="value"
            animationDuration={1500}
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <span className="text-4xl font-bold text-slate-800">{score}%</span>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Audit Score</p>
        </motion.div>
      </div>
    </div>
  );
}
