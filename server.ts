import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database('ocp_audit.db');

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'Pending Audit',
    audit_score INTEGER DEFAULT 0,
    audit_report TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS team (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    workload INTEGER DEFAULT 0,
    assignments TEXT,
    avatar_url TEXT
  );

  CREATE TABLE IF NOT EXISTS audit_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER,
    score INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id)
  );
`);

// Seed some initial data if empty
const teamCount = db.prepare('SELECT count(*) as count FROM team').get() as { count: number };
if (teamCount.count === 0) {
  const insertTeam = db.prepare('INSERT INTO team (name, role, workload, assignments) VALUES (?, ?, ?, ?)');
  insertTeam.run('Ahmed Tazi', 'System Architect', 75, JSON.stringify(['ERP Integration']));
  insertTeam.run('Sara Mansouri', 'Developer', 45, JSON.stringify(['AI Dashboard UI']));
  insertTeam.run('Omar Khalil', 'Data Analyst', 90, JSON.stringify(['Sustainability Report', 'KPI Analysis']));
  insertTeam.run('Fatima Zahra', 'Project Manager', 60, JSON.stringify(['Process Optimization']));
}

const app = express();
app.use(express.json());

const PORT = 3000;

// API Routes
app.get('/api/projects', (req, res) => {
  const projects = db.prepare('SELECT * FROM projects ORDER BY created_at DESC').all();
  res.json(projects);
});

app.post('/api/projects', (req, res) => {
  const { name, description } = req.body;
  const result = db.prepare('INSERT INTO projects (name, description) VALUES (?, ?)').run(name, description);
  res.json({ id: result.lastInsertRowid, name, description, status: 'Pending Audit', audit_score: 0 });
});

app.get('/api/team', (req, res) => {
  const team = db.prepare('SELECT * FROM team').all();
  res.json(team);
});

app.post('/api/team', (req, res) => {
  const { name, role, workload, assignments } = req.body;
  const result = db.prepare('INSERT INTO team (name, role, workload, assignments) VALUES (?, ?, ?, ?)')
    .run(name, role, workload || 0, JSON.stringify(assignments || []));
  res.json({ id: result.lastInsertRowid, name, role, workload: workload || 0, assignments: JSON.stringify(assignments || []) });
});

app.put('/api/team/:id', (req, res) => {
  const { id } = req.params;
  const { name, role, workload, assignments } = req.body;
  db.prepare('UPDATE team SET name = ?, role = ?, workload = ?, assignments = ? WHERE id = ?')
    .run(name, role, workload || 0, JSON.stringify(assignments || []), id);
  res.json({ success: true });
});

app.post('/api/audit/update', (req, res) => {
  const { project_id, score, report } = req.body;
  db.prepare('UPDATE projects SET audit_score = ?, audit_report = ?, status = ? WHERE id = ?')
    .run(score, JSON.stringify(report), 'Audited', project_id);
  db.prepare('INSERT INTO audit_history (project_id, score) VALUES (?, ?)').run(project_id, score);
  res.json({ success: true });
});

app.get('/api/stats', (req, res) => {
  const history = db.prepare('SELECT score, created_at FROM audit_history ORDER BY created_at ASC LIMIT 20').all();
  res.json(history);
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
