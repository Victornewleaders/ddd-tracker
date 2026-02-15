-- ══════════════════════════════════════════════════════════════════════════
-- DDD INTERVENTION TRACKER — Supabase Migration
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ══════════════════════════════════════════════════════════════════════════

-- 1. INTERVENTIONS TABLE
CREATE TABLE IF NOT EXISTS interventions (
  id TEXT PRIMARY KEY,
  province TEXT NOT NULL,
  district TEXT NOT NULL DEFAULT '',
  pm TEXT DEFAULT '',
  owner_title TEXT DEFAULT '',
  owner_name TEXT DEFAULT '',
  team TEXT DEFAULT '',
  type TEXT NOT NULL,
  grade TEXT DEFAULT '',
  subject TEXT DEFAULT 'All',
  focus TEXT DEFAULT '',
  level TEXT DEFAULT 'District',
  entity_name TEXT NOT NULL,
  stage TEXT NOT NULL DEFAULT 'Planning',
  phase TEXT DEFAULT '',
  description TEXT DEFAULT '',
  start_date DATE,
  end_date DATE,
  schools INTEGER DEFAULT 0,
  learners INTEGER DEFAULT 0,
  confidence TEXT DEFAULT 'Medium',
  risks TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. DECISIONS TABLE
CREATE TABLE IF NOT EXISTS decisions (
  id TEXT PRIMARY KEY,
  intervention_id TEXT NOT NULL REFERENCES interventions(id) ON DELETE CASCADE,
  ddd_tool TEXT DEFAULT '',
  data_viewed TEXT DEFAULT '',
  insight TEXT DEFAULT '',
  decision_made TEXT NOT NULL,
  made_by TEXT DEFAULT '',
  date DATE DEFAULT CURRENT_DATE,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. ACTIONS TABLE
CREATE TABLE IF NOT EXISTS actions (
  id TEXT PRIMARY KEY,
  decision_id TEXT NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
  intervention_id TEXT NOT NULL REFERENCES interventions(id) ON DELETE CASCADE,
  action_taken TEXT NOT NULL,
  responsible TEXT DEFAULT '',
  target_date DATE,
  completed_date DATE,
  status TEXT DEFAULT 'Planned',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. OUTCOMES TABLE
CREATE TABLE IF NOT EXISTS outcomes (
  id TEXT PRIMARY KEY,
  action_id TEXT NOT NULL REFERENCES actions(id) ON DELETE CASCADE,
  intervention_id TEXT NOT NULL REFERENCES interventions(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  evidence TEXT DEFAULT '',
  metric TEXT DEFAULT '',
  value TEXT DEFAULT '',
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. ENABLE REALTIME
ALTER PUBLICATION supabase_realtime ADD TABLE interventions;
ALTER PUBLICATION supabase_realtime ADD TABLE decisions;
ALTER PUBLICATION supabase_realtime ADD TABLE actions;
ALTER PUBLICATION supabase_realtime ADD TABLE outcomes;

-- 6. ROW LEVEL SECURITY — open access (no auth required)
-- This allows anyone with the URL to read and write.
-- For production, you'd add authentication and restrict writes.
ALTER TABLE interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE outcomes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to interventions" ON interventions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to decisions" ON decisions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to actions" ON actions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to outcomes" ON outcomes FOR ALL USING (true) WITH CHECK (true);

-- 7. SEED DATA — Existing 2025 Interventions
INSERT INTO interventions (id, province, district, pm, owner_title, owner_name, team, type, grade, subject, focus, level, entity_name, stage, phase, description, start_date, end_date, schools, learners, confidence, risks) VALUES
('DDD_2025_001','Northern Cape','John Taolo Gaetsewe','Jantjie Lethea','District Director','Mr V Teise; Mr Jonas','Jantjie, Ik & EMIS','District Support','Grade 7-9','All','District Support; Senior Phase','District','JTG District Support Intervention','Active','Senior & FET','Performance improvement through data leadership capacitation and coaching','2025-02-01','2025-12-01',143,7000,'High','Conflicting PED priorities'),
('DDD_2025_002','Northern Cape','Frances Baard','Jantjie Lethea','CES','Dr Thulo, Mr Motsoari','Jantjie & Monki','Underperforming School','Grade 12','All','District Support Interventions','District','Frances Baard FET Intervention','Active','FET','Performance improvement targeting underperforming FET schools','2025-04-01','2025-12-01',26,4000,'High','Conflicting PED priorities; Not all schools invited'),
('DDD_2025_003','Northern Cape','Pixley Ka Seme','Jantjie Lethea','District Director','Mr F Silengile','Jantjie & Monki','DBE Mentorship','Grade 12','All','District Mentorship Intervention','District','PKS District Interventions & Support','Active','FET','Performance improvement through mentorship support','2025-03-25','2025-12-25',25,1000,'High','Conflicting PED priorities. Budget approval delays.'),
('DDD_2025_004','Limpopo','Mopani East','Rinae Sikhwari','District Director, CES','Mam M Machumele; Mr S Hlungwane','Rinae & Lesego','District Support','All Grades','All','District Support Intervention','District','Mopani East District Support','Active','All','Performance improvement through holistic district support','2024-02-01','2025-12-01',375,214000,'High','Conflicting PED priorities'),
('DDD_2025_005','Limpopo','Mopani West','Rinae Sikhwari','District Director','Mam P Modika','Rinae & Lesego','GET Phase','Grade 7-9','All','Senior Phase Research (UL Partnership)','District','Mopani West Senior Phase Research','Active','Senior','Senior phase research intervention in partnership with University of Limpopo','2025-01-01','2025-12-01',330,45000,'High','Conflicting PED priorities'),
('DDD_2025_006','North West','All 4 Districts','Felicity Moshoeshoe','Director: Institutional Governance','Dr C Mojafi','Felicity & Naledi','Underperforming School','Grade 10-12','Languages & Mathematics','Underperforming schools (Secondary & Primary)','District','NW Provincial Underperforming Schools','Planning','FET','Performance improvement for underperforming schools across all NW districts','2025-03-01','2025-12-01',235,1000,'High','Conflicting PED priorities. Budget approval delays.'),
('DDD_2025_007','Free State','Lejweleputswa','Felicity Moshoeshoe','District Director','Mam Zonke','Felicity, Jantjie & Mongale','Underperforming School','Grade 4-7','All','District Support: GET & FET','District','Lejweleputswa District Intervention','Active','GET & FET','Performance improvement for underperforming schools in Lejweleputswa','2025-05-20','2025-12-01',71,1000,'High','Intervention Owner curated own agenda. Dates moved due to unconfirmed budget.'),
('DDD_2025_008','KwaZulu-Natal','Uthukela','Bongekile Hlela; Mondli Mnguni','District Director','Mam ME Mokoena','Mondli and EMIS team','Underperforming School','Grade 12','All','Underperforming schools','District','Uthukela District Intervention','Active','FET','Targeting underperforming schools in Uthukela','2025-03-01','2025-12-25',39,0,'High','Conflicting KZN PED/District priorities. Labour Actions.'),
('DDD_2025_009','Eastern Cape','Sarah Baartman','Phindiwe Mtyobo','District Director','Mr De Bruyn','DDD EC Team & EMIS Team','Reading Literacy','Grade 4-7','Languages & Mathematics','GET: Reading and literacy improvement','School','SB GET Intervention','Active','Intermediary','Reading and literacy improvement in GET phase','2025-03-01','2025-12-01',158,7905,'Medium','Conflicting PED priorities; mentor contracts not renewed'),
('DDD_2025_010','Eastern Cape','Sarah Baartman','Phindiwe Mtyobo','District Director','Mr De Bruyn','DDD EC Team & EMIS Team','DBE Mentorship','Grade 12','All FET subjects','FET: Grade 12 improvement','Circuit','SB FET / NSC Intervention','Active','FET','Grade 12 improvement through mentorship and data-driven support (district at 78.6%)','2025-03-01','2025-12-01',55,4216,'High','Conflicting PED priorities; mentor contracts not renewed')
ON CONFLICT (id) DO NOTHING;

-- Seed Decisions
INSERT INTO decisions (id, intervention_id, ddd_tool, data_viewed, insight, decision_made, made_by, date, notes) VALUES
('DEC_001','DDD_2025_001','FET Profiling Tool','Subject pass rates by school in JTG Senior Phase','12 schools below 40% in Mathematics, concentrated in 3 circuits','Target intensive maths support to bottom 12 schools first rather than district-wide','Mr V Teise','2025-03-15','Decision taken during quarterly DDD check-in'),
('DEC_002','DDD_2025_009','Learner Charts','Reading assessment scores for Grade 4-6 in Sarah Baartman','LOLT scores declining in rural schools but stable in town schools','Redirect mentor visits to prioritise 23 rural schools with steepest LOLT decline','Mr De Bruyn','2025-04-10','Informed by Term 1 assessment data on Learner Charts'),
('DEC_003','DDD_2025_002','School Dashboard','NSC results comparison 2023 vs 2024 for Frances Baard schools','8 schools improved by 10%+ but 5 schools declined despite support','Conduct root cause analysis on 5 declining schools; reallocate support resources','Dr Thulo','2025-05-20','')
ON CONFLICT (id) DO NOTHING;

-- Seed Actions
INSERT INTO actions (id, decision_id, intervention_id, action_taken, responsible, target_date, completed_date, status, notes) VALUES
('ACT_001','DEC_001','DDD_2025_001','Organised 2-day intensive maths workshop for HODs of 12 targeted schools','Jantjie Lethea','2025-04-15','2025-04-18','Completed','All 12 schools sent representatives. Workshop focused on using DDD data to identify learner gaps.'),
('ACT_002','DEC_001','DDD_2025_001','Set up monthly DDD data review sessions with circuit managers for 3 targeted circuits','Mr Jonas','2025-05-01',NULL,'In Progress','First session held May. Second scheduled for June.'),
('ACT_003','DEC_002','DDD_2025_009','Redeployed 3 mentors from town schools to prioritise 23 rural schools','Phindiwe Mtyobo','2025-05-01','2025-04-28','Completed','Mentor redeployment completed. Each rural school now gets fortnightly visits.'),
('ACT_004','DEC_003','DDD_2025_002','Conducted school-level diagnostic visits to 5 declining schools','Monki','2025-06-15',NULL,'Planned','Visits planned for mid-June. Will use DDD diagnostic framework.')
ON CONFLICT (id) DO NOTHING;

-- Seed Outcomes
INSERT INTO outcomes (id, action_id, intervention_id, description, evidence, metric, value, date) VALUES
('OUT_001','ACT_001','DDD_2025_001','Term 2 maths results showed 8 of 12 targeted schools improved by 5%+ compared to Term 1','DDD School Dashboard comparison — Term 1 vs Term 2 2025','Maths pass rate improvement','8 of 12 schools improved (67%)','2025-07-20'),
('OUT_002','ACT_003','DDD_2025_009','Reading assessment scores in 23 rural schools stabilised after mentor redeployment — decline halted','Learner Charts Term 2 assessment data','LOLT score trend','Decline halted; 15 of 23 schools showed marginal improvement','2025-08-10')
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════════
-- DONE! Your database is ready.
-- ══════════════════════════════════════════════════════════════════════════
