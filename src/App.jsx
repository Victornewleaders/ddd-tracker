import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { C, PROVINCES, DISTRICTS, INT_TYPES, STAGES, GRADES, SUBJECTS, PHASES_LIST, LEVELS, CONFIDENCE, ACTION_STATUS, DDD_TOOLS, STAGE_C, TYPE_C } from './constants'
import { StageBadge, TypeDot, ConfBadge, StatusDot, StatCard, Btn, Field, Modal, ChainView, Badge, fmtDate, fmtNum, inputSx } from './components'
import { fetchAllData, upsertIntervention, insertDecision, insertAction, insertOutcome, subscribeToChanges } from './data'

const genId = prefix => {
  const yr = new Date().getFullYear()
  const num = String(Math.floor(Math.random() * 900) + 100)
  return `${prefix}_${yr}_${num}`
}

function exportCsv(data) {
  const h = ["ID","Province","District","PM","Type","Entity Name","Stage","Schools","Learners","Start","End","Confidence"]
  const rows = data.interventions.map(d => [d.id,d.province,d.district,d.pm,d.type,d.entity_name,d.stage,d.schools,d.learners,d.start_date,d.end_date,d.confidence])
  const csv = [h.join(","), ...rows.map(r => r.map(c => `"${String(c||"").replace(/"/g,'""')}"`).join(","))].join("\n")
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv],{type:"text/csv"}))
  a.download = `DDD_Tracker_Export_${new Date().toISOString().split("T")[0]}.csv`; a.click()
}

// ── FORMS ────────────────────────────────────────────────────────────────────

function IntForm({item, onSave, onCancel}) {
  const [f, setF] = useState(item || {
    id: genId("DDD"), province:"", district:"", pm:"", owner_title:"", owner_name:"",
    team:"", type:"", grade:"", subject:"All", focus:"", level:"District",
    entity_name:"", stage:"Planning", phase:"", description:"", start_date:"",
    end_date:"", schools:0, learners:0, confidence:"Medium", risks:""
  })
  const [saving, setSaving] = useState(false)
  const set = (k,v) => setF(p => ({...p, [k]: v}))
  const dists = f.province ? DISTRICTS[f.province] || [] : []

  const save = async () => {
    if (!f.province || !f.type || !f.entity_name) { alert("Province, Type, and Entity Name are required."); return }
    setSaving(true)
    try {
      await onSave({...f, schools: Number(f.schools)||0, learners: Number(f.learners)||0, updated_at: new Date().toISOString()})
    } catch(e) { alert("Error saving: " + e.message) }
    setSaving(false)
  }

  return (
    <Modal title={item?.id ? "Edit Intervention" : "Register New Intervention"} onClose={onCancel}>
      <div style={{padding:"8px 12px",background:C.tealLt,borderRadius:6,fontSize:12,color:C.tealDk,marginBottom:16}}><strong>Code:</strong> {f.id}</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Field label="Province" req><select value={f.province} onChange={e=>{set("province",e.target.value);set("district","");}} style={inputSx}><option value="">Select...</option>{PROVINCES.map(p=><option key={p}>{p}</option>)}</select></Field>
        <Field label="District" req><select value={f.district} onChange={e=>set("district",e.target.value)} style={inputSx} disabled={!f.province}><option value="">Select...</option>{dists.map(d=><option key={d}>{d}</option>)}</select></Field>
        <Field label="Intervention Type" req><select value={f.type} onChange={e=>set("type",e.target.value)} style={inputSx}><option value="">Select...</option>{INT_TYPES.map(t=><option key={t}>{t}</option>)}</select></Field>
        <Field label="Entity Name" req><input value={f.entity_name} onChange={e=>set("entity_name",e.target.value)} style={inputSx} placeholder="e.g. Frances Baard FET Intervention"/></Field>
        <Field label="Programme Manager"><input value={f.pm} onChange={e=>set("pm",e.target.value)} style={inputSx}/></Field>
        <Field label="Implementation Team"><input value={f.team} onChange={e=>set("team",e.target.value)} style={inputSx}/></Field>
        <Field label="Owner Title"><input value={f.owner_title} onChange={e=>set("owner_title",e.target.value)} style={inputSx}/></Field>
        <Field label="Owner Name"><input value={f.owner_name} onChange={e=>set("owner_name",e.target.value)} style={inputSx}/></Field>
        <Field label="Grade"><select value={f.grade} onChange={e=>set("grade",e.target.value)} style={inputSx}><option value="">Select...</option>{GRADES.map(g=><option key={g}>{g}</option>)}</select></Field>
        <Field label="Subject"><select value={f.subject} onChange={e=>set("subject",e.target.value)} style={inputSx}>{SUBJECTS.map(s=><option key={s}>{s}</option>)}</select></Field>
        <Field label="Phase"><select value={f.phase} onChange={e=>set("phase",e.target.value)} style={inputSx}><option value="">Select...</option>{PHASES_LIST.map(p=><option key={p}>{p}</option>)}</select></Field>
        <Field label="Level"><select value={f.level} onChange={e=>set("level",e.target.value)} style={inputSx}>{LEVELS.map(l=><option key={l}>{l}</option>)}</select></Field>
        <Field label="Start Date"><input type="date" value={f.start_date} onChange={e=>set("start_date",e.target.value)} style={inputSx}/></Field>
        <Field label="End Date"><input type="date" value={f.end_date} onChange={e=>set("end_date",e.target.value)} style={inputSx}/></Field>
        <Field label="Schools"><input type="number" value={f.schools} onChange={e=>set("schools",e.target.value)} style={inputSx}/></Field>
        <Field label="Learners"><input type="number" value={f.learners} onChange={e=>set("learners",e.target.value)} style={inputSx}/></Field>
        <Field label="Stage"><select value={f.stage} onChange={e=>set("stage",e.target.value)} style={inputSx}>{STAGES.map(s=><option key={s}>{s}</option>)}</select></Field>
        <Field label="Confidence"><select value={f.confidence} onChange={e=>set("confidence",e.target.value)} style={inputSx}>{CONFIDENCE.map(c=><option key={c}>{c}</option>)}</select></Field>
      </div>
      <Field label="Description"><textarea value={f.description} onChange={e=>set("description",e.target.value)} rows={2} style={{...inputSx,resize:"vertical"}}/></Field>
      <Field label="Risks & Challenges"><textarea value={f.risks} onChange={e=>set("risks",e.target.value)} rows={2} style={{...inputSx,resize:"vertical"}}/></Field>
      <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:8}}>
        <Btn onClick={onCancel}>Cancel</Btn>
        <Btn primary onClick={save} disabled={saving}>{saving ? "Saving..." : (item?.id ? "Save Changes" : "Register Intervention")}</Btn>
      </div>
    </Modal>
  )
}

function DecForm({interventions, onSave, onCancel, prefillIntId}) {
  const [f, setF] = useState({id:genId("DEC"),intervention_id:prefillIntId||"",ddd_tool:"",data_viewed:"",insight:"",decision_made:"",made_by:"",date:new Date().toISOString().split("T")[0],notes:""})
  const [saving, setSaving] = useState(false)
  const set = (k,v) => setF(p => ({...p,[k]:v}))
  const save = async () => {
    if(!f.intervention_id||!f.decision_made){alert("Select an intervention and describe the decision.");return}
    setSaving(true)
    try { await onSave(f) } catch(e) { alert("Error: "+e.message) }
    setSaving(false)
  }
  return (
    <Modal title="Log a Decision" onClose={onCancel}>
      <div style={{padding:"10px 14px",background:C.blueLt,borderRadius:6,fontSize:12,color:C.blue,marginBottom:16}}>
        <strong>What DDD data was viewed, what insight emerged, and what decision was made?</strong>
      </div>
      <Field label="Linked Intervention" req><select value={f.intervention_id} onChange={e=>set("intervention_id",e.target.value)} style={inputSx}><option value="">Select...</option>{interventions.map(i=><option key={i.id} value={i.id}>{i.entity_name} ({i.province})</option>)}</select></Field>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Field label="DDD Tool Used"><select value={f.ddd_tool} onChange={e=>set("ddd_tool",e.target.value)} style={inputSx}><option value="">Select...</option>{DDD_TOOLS.map(t=><option key={t}>{t}</option>)}</select></Field>
        <Field label="Date"><input type="date" value={f.date} onChange={e=>set("date",e.target.value)} style={inputSx}/></Field>
      </div>
      <Field label="Data Viewed"><input value={f.data_viewed} onChange={e=>set("data_viewed",e.target.value)} style={inputSx} placeholder="What specific data was looked at?"/></Field>
      <Field label="Key Insight"><textarea value={f.insight} onChange={e=>set("insight",e.target.value)} rows={2} style={{...inputSx,resize:"vertical"}} placeholder="What did the data reveal?"/></Field>
      <Field label="Decision Made" req><textarea value={f.decision_made} onChange={e=>set("decision_made",e.target.value)} rows={2} style={{...inputSx,resize:"vertical"}} placeholder="What was decided based on this insight?"/></Field>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Field label="Decision Made By"><input value={f.made_by} onChange={e=>set("made_by",e.target.value)} style={inputSx}/></Field>
        <Field label="Notes"><input value={f.notes} onChange={e=>set("notes",e.target.value)} style={inputSx}/></Field>
      </div>
      <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:12}}>
        <Btn onClick={onCancel}>Cancel</Btn>
        <Btn primary onClick={save} disabled={saving}>{saving?"Saving...":"Log Decision"}</Btn>
      </div>
    </Modal>
  )
}

function ActForm({decisions, interventions, onSave, onCancel}) {
  const [f, setF] = useState({id:genId("ACT"),decision_id:"",intervention_id:"",action_taken:"",responsible:"",target_date:"",completed_date:"",status:"Planned",notes:""})
  const [saving, setSaving] = useState(false)
  const set = (k,v) => setF(p => ({...p,[k]:v}))
  const save = async () => {
    const d = decisions.find(x=>x.id===f.decision_id)
    if(!f.decision_id||!f.action_taken){alert("Select a decision and describe the action.");return}
    setSaving(true)
    try { await onSave({...f, intervention_id: d?.intervention_id||""}) } catch(e) { alert("Error: "+e.message) }
    setSaving(false)
  }
  return (
    <Modal title="Log an Action" onClose={onCancel}>
      <div style={{padding:"10px 14px",background:C.orangeLt,borderRadius:6,fontSize:12,color:C.orange,marginBottom:16}}>
        <strong>What action was taken as a result of a decision?</strong>
      </div>
      <Field label="Linked Decision" req><select value={f.decision_id} onChange={e=>set("decision_id",e.target.value)} style={inputSx}><option value="">Select...</option>{decisions.map(d=>{const i=interventions.find(x=>x.id===d.intervention_id); return <option key={d.id} value={d.id}>{(d.decision_made||"").slice(0,60)}... ({i?.entity_name})</option>})}</select></Field>
      <Field label="Action Taken" req><textarea value={f.action_taken} onChange={e=>set("action_taken",e.target.value)} rows={2} style={{...inputSx,resize:"vertical"}} placeholder="Describe what was actually done..."/></Field>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Field label="Responsible"><input value={f.responsible} onChange={e=>set("responsible",e.target.value)} style={inputSx}/></Field>
        <Field label="Status"><select value={f.status} onChange={e=>set("status",e.target.value)} style={inputSx}>{ACTION_STATUS.map(s=><option key={s}>{s}</option>)}</select></Field>
        <Field label="Target Date"><input type="date" value={f.target_date} onChange={e=>set("target_date",e.target.value)} style={inputSx}/></Field>
        <Field label="Completed Date"><input type="date" value={f.completed_date} onChange={e=>set("completed_date",e.target.value)} style={inputSx}/></Field>
      </div>
      <Field label="Notes"><textarea value={f.notes} onChange={e=>set("notes",e.target.value)} rows={2} style={{...inputSx,resize:"vertical"}}/></Field>
      <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:12}}>
        <Btn onClick={onCancel}>Cancel</Btn>
        <Btn primary onClick={save} disabled={saving}>{saving?"Saving...":"Log Action"}</Btn>
      </div>
    </Modal>
  )
}

function OutForm({actions, interventions, onSave, onCancel}) {
  const [f, setF] = useState({id:genId("OUT"),action_id:"",intervention_id:"",description:"",evidence:"",metric:"",value:"",date:new Date().toISOString().split("T")[0]})
  const [saving, setSaving] = useState(false)
  const set = (k,v) => setF(p => ({...p,[k]:v}))
  const save = async () => {
    const a = actions.find(x=>x.id===f.action_id)
    if(!f.action_id||!f.description){alert("Select an action and describe the outcome.");return}
    setSaving(true)
    try { await onSave({...f, intervention_id: a?.intervention_id||""}) } catch(e) { alert("Error: "+e.message) }
    setSaving(false)
  }
  return (
    <Modal title="Record an Outcome" onClose={onCancel}>
      <div style={{padding:"10px 14px",background:C.greenLt,borderRadius:6,fontSize:12,color:C.greenDk,marginBottom:16}}>
        <strong>What measurable change resulted from an action?</strong>
      </div>
      <Field label="Linked Action" req><select value={f.action_id} onChange={e=>set("action_id",e.target.value)} style={inputSx}><option value="">Select...</option>{actions.map(a=>{const i=interventions.find(x=>x.id===a.intervention_id); return <option key={a.id} value={a.id}>{(a.action_taken||"").slice(0,60)}... ({i?.entity_name})</option>})}</select></Field>
      <Field label="Outcome Description" req><textarea value={f.description} onChange={e=>set("description",e.target.value)} rows={2} style={{...inputSx,resize:"vertical"}} placeholder="What measurable change was observed?"/></Field>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Field label="Metric"><input value={f.metric} onChange={e=>set("metric",e.target.value)} style={inputSx} placeholder="e.g. Maths pass rate"/></Field>
        <Field label="Value"><input value={f.value} onChange={e=>set("value",e.target.value)} style={inputSx} placeholder="e.g. 8 of 12 schools improved"/></Field>
      </div>
      <Field label="Evidence Source"><input value={f.evidence} onChange={e=>set("evidence",e.target.value)} style={inputSx} placeholder="e.g. DDD School Dashboard — Term 1 vs Term 2"/></Field>
      <Field label="Date Observed"><input type="date" value={f.date} onChange={e=>set("date",e.target.value)} style={inputSx}/></Field>
      <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:12}}>
        <Btn onClick={onCancel}>Cancel</Btn>
        <Btn primary onClick={save} disabled={saving}>{saving?"Saving...":"Record Outcome"}</Btn>
      </div>
    </Modal>
  )
}

// ── MAIN APP ─────────────────────────────────────────────────────────────────

export default function App() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [mode, setMode] = useState("internal")
  const [tab, setTab] = useState("dashboard")
  const [search, setSearch] = useState("")
  const [fProv, setFProv] = useState("")
  const [fType, setFType] = useState("")
  const [fStage, setFStage] = useState("")
  const [selectedInt, setSelectedInt] = useState(null)
  const [modal, setModal] = useState(null)

  // ── Load data from Supabase ──────────────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      const d = await fetchAllData()
      setData(d)
      setError(null)
    } catch (e) {
      console.error("Failed to load data:", e)
      setError(e.message)
    }
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  // ── Real-time subscriptions ──────────────────────────────────────────────
  useEffect(() => {
    const unsubs = ['interventions','decisions','actions','outcomes'].map(table =>
      subscribeToChanges(table, () => loadData())
    )
    return () => unsubs.forEach(fn => fn())
  }, [loadData])

  // ── CRUD handlers ────────────────────────────────────────────────────────
  const handleSaveInt = async (item) => {
    await upsertIntervention(item)
    await loadData()
    setModal(null)
    setSelectedInt(null)
  }

  const handleSaveDec = async (item) => {
    await insertDecision(item)
    await loadData()
    setModal(null)
  }

  const handleSaveAct = async (item) => {
    await insertAction(item)
    await loadData()
    setModal(null)
  }

  const handleSaveOut = async (item) => {
    await insertOutcome(item)
    await loadData()
    setModal(null)
  }

  // ── Computed ─────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!data) return []
    return data.interventions.filter(d => {
      if (fProv && d.province !== fProv) return false
      if (fType && d.type !== fType) return false
      if (fStage && d.stage !== fStage) return false
      if (search) { const q=search.toLowerCase(); return [d.id,d.province,d.district,d.pm,d.type,d.entity_name,d.owner_name,d.description].some(f=>(f||"").toLowerCase().includes(q)) }
      return true
    })
  }, [data, fProv, fType, fStage, search])

  const stats = useMemo(() => {
    if (!data) return {}
    const i = data.interventions
    return {
      total:i.length, active:i.filter(x=>x.stage==="Active").length, planning:i.filter(x=>x.stage==="Planning").length,
      schools:i.reduce((s,x)=>s+(x.schools||0),0), learners:i.reduce((s,x)=>s+(x.learners||0),0),
      provinces:[...new Set(i.map(x=>x.province))].length,
      decisions:data.decisions.length, actions:data.actions.length, outcomes:data.outcomes.length,
      actionsCompleted:data.actions.filter(a=>a.status==="Completed").length,
    }
  }, [data])

  // ── Loading / Error states ───────────────────────────────────────────────
  if (loading) return (
    <div style={{display:"flex",justifyContent:"center",alignItems:"center",height:"100vh",flexDirection:"column",gap:12}}>
      <div style={{width:40,height:40,border:`4px solid ${C.greyLt}`,borderTop:`4px solid ${C.teal}`,borderRadius:"50%",animation:"spin 1s linear infinite"}}/>
      <div style={{color:C.teal,fontSize:14,fontWeight:600}}>Loading DDD Tracker...</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  if (error) return (
    <div style={{display:"flex",justifyContent:"center",alignItems:"center",height:"100vh",flexDirection:"column",gap:12,padding:20}}>
      <div style={{fontSize:48}}>⚠️</div>
      <div style={{fontSize:16,fontWeight:700,color:C.red}}>Connection Error</div>
      <div style={{fontSize:13,color:C.greyDk,textAlign:"center",maxWidth:400}}>{error}</div>
      <div style={{fontSize:12,color:C.grey,textAlign:"center",maxWidth:400}}>Check that your Supabase URL and anon key are correctly configured in the environment variables.</div>
      <Btn primary onClick={()=>{setLoading(true);setError(null);loadData();}}>Retry Connection</Btn>
    </div>
  )

  if (!data) return null

  const isInternal = mode === "internal"
  const TABS = isInternal
    ? [{id:"dashboard",label:"Dashboard"},{id:"interventions",label:"Interventions"},{id:"execution",label:"Execution Log"},{id:"chain",label:"Contribution Chain"}]
    : [{id:"dashboard",label:"Dashboard"},{id:"interventions",label:"Interventions"},{id:"chain",label:"Contribution Evidence"}]

  return (
    <div style={{background:C.off,minHeight:"100vh"}}>
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header style={{background:C.navy}}>
        <div style={{height:4,background:`linear-gradient(90deg,${C.teal} 0%,${C.green} 50%,${C.orange} 100%)`}}/>
        <div style={{padding:"12px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
          <div>
            <div style={{fontSize:17,fontWeight:700,color:C.white}}>DDD Intervention & Execution Tracker</div>
            <div style={{fontSize:11,color:C.grey}}>Data Driven Districts — Interventions & MERL</div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
            <div style={{display:"flex",borderRadius:6,overflow:"hidden",border:`1px solid rgba(255,255,255,0.2)`}}>
              {[{id:"internal",label:"Internal"},{id:"stakeholder",label:"Stakeholder View"}].map(m => (
                <button key={m.id} onClick={()=>{setMode(m.id);setTab("dashboard");}} style={{padding:"6px 14px",background:mode===m.id?C.teal:"transparent",color:C.white,border:"none",cursor:"pointer",fontSize:11,fontWeight:mode===m.id?700:400}}>{m.label}</button>
              ))}
            </div>
            {isInternal && <Btn small onClick={()=>exportCsv(data)} style={{background:"rgba(255,255,255,0.1)",color:C.white,border:"1px solid rgba(255,255,255,0.2)"}}>Export CSV</Btn>}
            <div style={{width:8,height:8,borderRadius:"50%",background:C.green,marginLeft:4}} title="Connected to database"/>
          </div>
        </div>
        <div style={{display:"flex",gap:0,padding:"0 20px",borderTop:`1px solid rgba(255,255,255,0.08)`}}>
          {TABS.map(t => (
            <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"10px 18px",background:"none",border:"none",borderBottom:tab===t.id?`3px solid ${C.teal}`:"3px solid transparent",color:tab===t.id?C.white:"rgba(255,255,255,0.5)",fontSize:13,fontWeight:tab===t.id?700:400,cursor:"pointer"}}>{t.label}</button>
          ))}
        </div>
      </header>

      <main style={{padding:"20px 20px",maxWidth:1280,margin:"0 auto"}}>

        {/* ═══ DASHBOARD ═══ */}
        {tab === "dashboard" && (
          <div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(155px,1fr))",gap:12,marginBottom:20}}>
              <StatCard label="Interventions" value={stats.total} color={C.tealDk}/>
              <StatCard label="Active" value={stats.active} color={C.green}/>
              <StatCard label="Planning" value={stats.planning} color={C.blue}/>
              <StatCard label="Provinces" value={stats.provinces} color={C.orange}/>
              <StatCard label="Schools" value={fmtNum(stats.schools)} color={C.tealDk}/>
              <StatCard label="Learners" value={fmtNum(stats.learners)} color={C.greenDk}/>
            </div>

            {/* Execution Chain Visual */}
            <div style={{marginBottom:20,padding:16,background:C.white,borderRadius:8,boxShadow:"0 1px 3px rgba(0,0,0,0.06)"}}>
              <div style={{fontSize:14,fontWeight:700,color:C.navy,marginBottom:14}}>Execution Tracking — The Contribution Chain</div>
              <div style={{display:"flex",gap:0,alignItems:"center",justifyContent:"center",flexWrap:"wrap"}}>
                {[
                  {label:"DDD Data Insight",sub:"Dashboard views",icon:"📊",color:C.teal,count:null},
                  null,
                  {label:"Decisions Logged",sub:"Based on data",icon:"D",color:C.blue,count:stats.decisions},
                  null,
                  {label:"Actions Taken",sub:`${stats.actionsCompleted} completed`,icon:"A",color:C.orange,count:stats.actions},
                  null,
                  {label:"Outcomes Linked",sub:"Measurable change",icon:"O",color:C.green,count:stats.outcomes},
                ].map((item,idx) => {
                  if (!item) return <div key={idx} style={{fontSize:20,color:C.greyLt,margin:"0 8px"}}>→</div>
                  return (
                    <div key={idx} style={{textAlign:"center",flex:"0 0 auto",minWidth:120}}>
                      <div style={{width:44,height:44,borderRadius:"50%",background:item.color,color:C.white,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:item.icon.length>1?14:18,margin:"0 auto 6px"}}>{item.icon}</div>
                      <div style={{fontSize:12,fontWeight:700,color:C.navy}}>{item.label}</div>
                      {item.count !== null && <div style={{fontSize:22,fontWeight:700,color:item.color}}>{item.count}</div>}
                      <div style={{fontSize:10,color:C.grey}}>{item.sub}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Breakdowns */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <div style={{background:C.white,borderRadius:8,padding:16,boxShadow:"0 1px 3px rgba(0,0,0,0.06)"}}>
                <div style={{fontSize:13,fontWeight:700,color:C.navy,marginBottom:12}}>By Province</div>
                {PROVINCES.map(p=>{const cnt=data.interventions.filter(i=>i.province===p).length; if(!cnt) return null; const sch=data.interventions.filter(i=>i.province===p).reduce((s,i)=>s+(i.schools||0),0); return(
                  <div key={p} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${C.greyLt}`}}>
                    <span style={{fontSize:12,color:C.greyDk}}>{p}</span>
                    <div style={{display:"flex",gap:10,alignItems:"center"}}>
                      <span style={{fontSize:10,color:C.grey}}>{fmtNum(sch)} schools</span>
                      <span style={{background:C.tealLt,color:C.tealDk,padding:"1px 8px",borderRadius:10,fontSize:11,fontWeight:700}}>{cnt}</span>
                    </div>
                  </div>
                )})}
              </div>
              <div style={{background:C.white,borderRadius:8,padding:16,boxShadow:"0 1px 3px rgba(0,0,0,0.06)"}}>
                <div style={{fontSize:13,fontWeight:700,color:C.navy,marginBottom:12}}>By Type</div>
                {INT_TYPES.map(t=>{const cnt=data.interventions.filter(i=>i.type===t).length; if(!cnt) return null; const tc=TYPE_C[t]; return(
                  <div key={t} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${C.greyLt}`}}>
                    <TypeDot t={t}/><span style={{background:tc.bg,color:tc.fg,padding:"1px 8px",borderRadius:10,fontSize:11,fontWeight:700}}>{cnt}</span>
                  </div>
                )})}
                <div style={{marginTop:14,fontSize:13,fontWeight:700,color:C.navy,marginBottom:10}}>By Stage</div>
                {STAGES.map(s=>{const cnt=data.interventions.filter(i=>i.stage===s).length; if(!cnt) return null; return(
                  <div key={s} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${C.greyLt}`}}>
                    <StageBadge s={s}/><span style={{fontSize:12,fontWeight:700,color:C.navy}}>{cnt}</span>
                  </div>
                )})}
              </div>
            </div>
          </div>
        )}

        {/* ═══ INTERVENTIONS ═══ */}
        {tab === "interventions" && (
          <div>
            <div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
              <div style={{flex:"1 1 220px",position:"relative"}}>
                <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:C.grey}}>⌕</span>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search interventions..." style={{...inputSx,paddingLeft:30}}/>
              </div>
              {[{v:fProv,s:setFProv,o:PROVINCES,l:"All Provinces"},{v:fType,s:setFType,o:INT_TYPES,l:"All Types"},{v:fStage,s:setFStage,o:STAGES,l:"All Stages"}].map((f,i)=>
                <select key={i} value={f.v} onChange={e=>f.s(e.target.value)} style={{padding:"8px 10px",border:`1px solid ${C.greyLt}`,borderRadius:6,fontSize:12,background:f.v?C.tealLt:C.white,cursor:"pointer",fontFamily:"inherit"}}>
                  <option value="">{f.l}</option>{f.o.map(o=><option key={o}>{o}</option>)}
                </select>
              )}
              {(fProv||fType||fStage||search) && <Btn small onClick={()=>{setSearch("");setFProv("");setFType("");setFStage("");}}>Clear</Btn>}
              {isInternal && <Btn primary small onClick={()=>setModal({type:"int"})}>+ New Intervention</Btn>}
            </div>

            <div style={{fontSize:12,color:C.grey,marginBottom:10}}>Showing <strong style={{color:C.navy}}>{filtered.length}</strong> of {data.interventions.length}</div>

            <div style={{background:C.white,borderRadius:8,border:`1px solid ${C.greyLt}`,overflow:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,minWidth:850}}>
                <thead>
                  <tr style={{borderBottom:`2px solid ${C.greyLt}`}}>
                    {["Province","District","Type","Entity Name","Grade","Stage","Schools","Learners"].map(h=>
                      <th key={h} style={{padding:"10px 12px",textAlign:"left",fontSize:10,textTransform:"uppercase",letterSpacing:1,color:C.grey,fontWeight:700,background:C.off,whiteSpace:"nowrap"}}>{h}</th>
                    )}
                    {isInternal && <th style={{padding:"10px 12px",textAlign:"left",fontSize:10,textTransform:"uppercase",letterSpacing:1,color:C.grey,fontWeight:700,background:C.off}}></th>}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(el => (
                    <tr key={el.id} style={{borderBottom:`1px solid ${C.off}`,cursor:"pointer"}}
                      onClick={()=>setSelectedInt(selectedInt?.id===el.id?null:el)}
                      onMouseEnter={e=>e.currentTarget.style.background=C.off} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <td style={{padding:"9px 12px",color:C.navy,fontWeight:500,whiteSpace:"nowrap"}}>{el.province}</td>
                      <td style={{padding:"9px 12px",color:C.greyDk,fontSize:11}}>{el.district}</td>
                      <td style={{padding:"9px 12px"}}><TypeDot t={el.type}/></td>
                      <td style={{padding:"9px 12px",color:C.navy,fontWeight:600,maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{el.entity_name}</td>
                      <td style={{padding:"9px 12px",color:C.greyDk,fontSize:11}}>{el.grade}</td>
                      <td style={{padding:"9px 12px"}}><StageBadge s={el.stage}/></td>
                      <td style={{padding:"9px 12px",textAlign:"right"}}>{fmtNum(el.schools)}</td>
                      <td style={{padding:"9px 12px",textAlign:"right"}}>{fmtNum(el.learners)}</td>
                      {isInternal && <td style={{padding:"9px 12px"}}>
                        <span style={{fontSize:10,color:C.teal,cursor:"pointer",fontWeight:600}} onClick={e=>{e.stopPropagation();setModal({type:"dec",prefillIntId:el.id});}}>+ Log Decision</span>
                      </td>}
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length===0 && <div style={{padding:40,textAlign:"center",color:C.grey}}>No interventions found</div>}
            </div>

            {/* Detail Expand */}
            {selectedInt && (
              <div style={{marginTop:14,background:C.white,borderRadius:8,border:`1px solid ${C.greyLt}`,overflow:"hidden"}}>
                <div style={{padding:"14px 18px",background:C.tealDk,color:C.white,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div><div style={{fontSize:11,opacity:0.7}}>{selectedInt.id}</div><div style={{fontSize:15,fontWeight:700}}>{selectedInt.entity_name}</div></div>
                  <div style={{display:"flex",gap:6}}>
                    {isInternal && <Btn small onClick={()=>setModal({type:"int",item:selectedInt})} style={{background:"rgba(255,255,255,0.15)",color:C.white,border:"none"}}>Edit</Btn>}
                    <button onClick={()=>setSelectedInt(null)} style={{background:"rgba(255,255,255,0.15)",border:"none",color:C.white,borderRadius:4,padding:"4px 10px",cursor:"pointer"}}>✕</button>
                  </div>
                </div>
                <div style={{padding:18,display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,fontSize:13}}>
                  {[["Province",selectedInt.province],["District",selectedInt.district],["PM",selectedInt.pm],["Owner",`${selectedInt.owner_title||""} — ${selectedInt.owner_name||""}`],["Team",selectedInt.team],["Grade/Subject",`${selectedInt.grade||""} | ${selectedInt.subject||""}`],["Phase",selectedInt.phase],["Level",selectedInt.level],["Start",fmtDate(selectedInt.start_date)],["End",fmtDate(selectedInt.end_date)],["Schools",fmtNum(selectedInt.schools)],["Learners",fmtNum(selectedInt.learners)]].map(([l,v])=>
                    <div key={l}><div style={{fontSize:10,color:C.grey,textTransform:"uppercase",letterSpacing:0.8}}>{l}</div><div style={{color:C.navy,fontWeight:500}}>{v||"—"}</div></div>
                  )}
                </div>
                {selectedInt.description && <div style={{padding:"0 18px 12px",fontSize:13,color:C.greyDk}}><strong>Description:</strong> {selectedInt.description}</div>}
                {selectedInt.risks && <div style={{padding:"0 18px 16px",fontSize:12,color:C.orange}}><strong>Risks:</strong> {selectedInt.risks}</div>}
                <div style={{borderTop:`1px solid ${C.greyLt}`,padding:"12px 18px 4px"}}>
                  <div style={{fontSize:13,fontWeight:700,color:C.navy,marginBottom:8}}>Contribution Chain</div>
                  <ChainView intervention={selectedInt} decisions={data.decisions} actions={data.actions} outcomes={data.outcomes}/>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ EXECUTION LOG ═══ */}
        {tab === "execution" && isInternal && (
          <div>
            <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"}}>
              <Btn primary onClick={()=>setModal({type:"dec"})}>+ Log Decision</Btn>
              <Btn primary onClick={()=>setModal({type:"act"})} style={{background:C.orange}}>+ Log Action</Btn>
              <Btn primary onClick={()=>setModal({type:"out"})} style={{background:C.green}}>+ Record Outcome</Btn>
            </div>

            <div style={{background:C.white,borderRadius:8,padding:18,boxShadow:"0 1px 3px rgba(0,0,0,0.06)"}}>
              <div style={{fontSize:14,fontWeight:700,color:C.navy,marginBottom:14}}>Execution Activity Log</div>

              <div style={{fontSize:12,fontWeight:700,color:C.blue,marginBottom:8,textTransform:"uppercase",letterSpacing:1}}>Decisions ({data.decisions.length})</div>
              {data.decisions.length===0 && <div style={{padding:16,color:C.grey,fontSize:12,textAlign:"center"}}>No decisions logged yet. Click "+ Log Decision" to start.</div>}
              {data.decisions.map(dec => {
                const int = data.interventions.find(i=>i.id===dec.intervention_id)
                return (
                  <div key={dec.id} style={{padding:12,marginBottom:8,background:C.blueLt,borderRadius:6}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.blue,marginBottom:4}}>
                      <span style={{fontWeight:600}}>{int?.entity_name} ({int?.province})</span>
                      <span>{fmtDate(dec.date)}</span>
                    </div>
                    <div style={{fontSize:13,color:C.navy,fontWeight:500,marginBottom:4}}>{dec.decision_made}</div>
                    <div style={{fontSize:11,color:C.greyDk}}>Tool: {dec.ddd_tool} | By: {dec.made_by}</div>
                  </div>
                )
              })}

              <div style={{fontSize:12,fontWeight:700,color:C.orange,marginBottom:8,marginTop:16,textTransform:"uppercase",letterSpacing:1}}>Actions ({data.actions.length})</div>
              {data.actions.length===0 && <div style={{padding:16,color:C.grey,fontSize:12,textAlign:"center"}}>No actions logged yet.</div>}
              {data.actions.map(act => {
                const int = data.interventions.find(i=>i.id===act.intervention_id)
                return (
                  <div key={act.id} style={{padding:12,marginBottom:8,background:C.orangeLt,borderRadius:6}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:4}}>
                      <span style={{fontWeight:600,color:C.orange}}>{int?.entity_name}</span>
                      <StatusDot s={act.status}/>
                    </div>
                    <div style={{fontSize:13,color:C.navy,marginBottom:4}}>{act.action_taken}</div>
                    <div style={{fontSize:11,color:C.greyDk}}>Responsible: {act.responsible} | Target: {fmtDate(act.target_date)}</div>
                  </div>
                )
              })}

              <div style={{fontSize:12,fontWeight:700,color:C.greenDk,marginBottom:8,marginTop:16,textTransform:"uppercase",letterSpacing:1}}>Outcomes ({data.outcomes.length})</div>
              {data.outcomes.length===0 && <div style={{padding:16,color:C.grey,fontSize:12,textAlign:"center"}}>No outcomes recorded yet.</div>}
              {data.outcomes.map(out => {
                const int = data.interventions.find(i=>i.id===out.intervention_id)
                return (
                  <div key={out.id} style={{padding:12,marginBottom:8,background:C.greenLt,borderRadius:6}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:4}}>
                      <span style={{fontWeight:600,color:C.greenDk}}>{int?.entity_name}</span>
                      <span style={{color:C.grey}}>{fmtDate(out.date)}</span>
                    </div>
                    <div style={{fontSize:13,color:C.navy,marginBottom:4}}>{out.description}</div>
                    <div style={{fontSize:11,color:C.greyDk}}><strong>{out.metric}:</strong> {out.value}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ═══ CONTRIBUTION CHAIN ═══ */}
        {tab === "chain" && (
          <div>
            <div style={{background:C.white,borderRadius:8,padding:18,marginBottom:16,boxShadow:"0 1px 3px rgba(0,0,0,0.06)"}}>
              <div style={{fontSize:14,fontWeight:700,color:C.navy,marginBottom:6}}>DDD Contribution Evidence</div>
              <div style={{fontSize:13,color:C.greyDk,lineHeight:1.5}}>
                Each chain below shows how DDD data insights led to specific decisions, which triggered actions, producing measurable outcomes.
              </div>
            </div>
            {data.interventions.filter(i=>data.decisions.some(d=>d.intervention_id===i.id)).map(int => (
              <div key={int.id} style={{background:C.white,borderRadius:8,marginBottom:14,overflow:"hidden",boxShadow:"0 1px 3px rgba(0,0,0,0.06)"}}>
                <div style={{padding:"12px 18px",background:C.off,borderBottom:`1px solid ${C.greyLt}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <span style={{fontSize:14,fontWeight:700,color:C.navy}}>{int.entity_name}</span>
                    <span style={{fontSize:12,color:C.grey,marginLeft:10}}>{int.province} — {int.district}</span>
                  </div>
                  <div style={{display:"flex",gap:6}}><StageBadge s={int.stage}/><TypeDot t={int.type}/></div>
                </div>
                <ChainView intervention={int} decisions={data.decisions} actions={data.actions} outcomes={data.outcomes}/>
              </div>
            ))}
            {!data.interventions.some(i=>data.decisions.some(d=>d.intervention_id===i.id)) && (
              <div style={{background:C.white,borderRadius:8,padding:48,textAlign:"center",color:C.grey,fontSize:13}}>
                No contribution chains recorded yet.{isInternal && " Go to Execution Log to start logging decisions."}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{marginTop:32,padding:"14px 20px",background:C.navy,borderTop:`3px solid ${C.teal}`}}>
        <div style={{maxWidth:1280,margin:"0 auto",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
          <div style={{fontSize:11,color:C.grey}}>Data Driven Districts — Department of Basic Education | Interventions & MERL</div>
          <div style={{fontSize:11,color:C.grey,opacity:0.6}}>{isInternal?"Internal Mode":"Stakeholder View"} | Live shared database</div>
        </div>
      </footer>

      {/* Modals */}
      {modal?.type==="int" && <IntForm item={modal.item} onSave={handleSaveInt} onCancel={()=>setModal(null)}/>}
      {modal?.type==="dec" && <DecForm interventions={data.interventions} onSave={handleSaveDec} onCancel={()=>setModal(null)} prefillIntId={modal.prefillIntId}/>}
      {modal?.type==="act" && <ActForm decisions={data.decisions} interventions={data.interventions} onSave={handleSaveAct} onCancel={()=>setModal(null)}/>}
      {modal?.type==="out" && <OutForm actions={data.actions} interventions={data.interventions} decisions={data.decisions} onSave={handleSaveOut} onCancel={()=>setModal(null)}/>}
    </div>
  )
}
