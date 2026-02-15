import React from 'react'
import { C, STAGE_C, TYPE_C } from './constants'

export const fmtDate = d => d ? new Date(d).toLocaleDateString("en-ZA",{day:"numeric",month:"short",year:"numeric"}) : "—"
export const fmtNum = n => (!n || n===0) ? "—" : Number(n).toLocaleString("en-ZA")

export function Badge({text,bg,fg}) {
  return <span style={{background:bg,color:fg,padding:"3px 10px",borderRadius:4,fontSize:11,fontWeight:600,border:`1px solid ${fg}22`,whiteSpace:"nowrap"}}>{text}</span>
}

export function StageBadge({s}) {
  const c = STAGE_C[s] || STAGE_C.Planning
  return <Badge text={s} bg={c.bg} fg={c.fg}/>
}

export function TypeDot({t}) {
  const c = TYPE_C[t] || {fg:C.grey}
  return <span style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:12,color:c.fg}}><span style={{width:8,height:8,borderRadius:"50%",background:c.fg,flexShrink:0}}/>{t}</span>
}

export function ConfBadge({l}) {
  const m={High:{bg:C.greenLt,fg:C.greenDk},Medium:{bg:C.orangeLt,fg:C.orange},Low:{bg:C.redLt,fg:C.red}}
  const s=m[l]||m.Medium
  return <Badge text={l} bg={s.bg} fg={s.fg}/>
}

export function StatusDot({s}) {
  const m={Completed:C.green,"In Progress":C.orange,Planned:C.blue,Blocked:C.red}
  return <span style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:12}}><span style={{width:7,height:7,borderRadius:"50%",background:m[s]||C.grey}}/>{s}</span>
}

export function StatCard({label,value,color,sub}) {
  return (
    <div style={{background:C.white,borderRadius:8,padding:"14px 18px",borderLeft:`4px solid ${color}`,boxShadow:"0 1px 3px rgba(0,0,0,0.06)"}}>
      <div style={{fontSize:26,fontWeight:700,color}}>{value}</div>
      <div style={{fontSize:12,color:C.grey,marginTop:2}}>{label}</div>
      {sub && <div style={{fontSize:11,color:C.grey,opacity:0.7,marginTop:2}}>{sub}</div>}
    </div>
  )
}

export function Btn({children,onClick,primary,small,disabled,style:sx}) {
  return <button disabled={disabled} onClick={onClick} style={{padding:small?"5px 12px":"9px 18px",background:primary?C.teal:C.white,color:primary?C.white:C.greyDk,border:primary?"none":`1px solid ${C.greyLt}`,borderRadius:6,fontWeight:600,cursor:disabled?"not-allowed":"pointer",fontSize:small?11:13,opacity:disabled?0.5:1,...sx}}>{children}</button>
}

export function Field({label,children,req}) {
  return (
    <div style={{marginBottom:12}}>
      <label style={{display:"block",fontSize:11,color:C.grey,textTransform:"uppercase",letterSpacing:0.8,marginBottom:3,fontWeight:600}}>{label}{req && <span style={{color:C.red}}> *</span>}</label>
      {children}
    </div>
  )
}

export const inputSx = {width:"100%",padding:"8px 10px",border:`1px solid ${C.greyLt}`,borderRadius:5,fontSize:13,fontFamily:"inherit",boxSizing:"border-box",background:C.white}

export function Modal({title,onClose,children,wide}) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:1100,display:"flex",justifyContent:"center",alignItems:"flex-start",padding:"30px 16px",overflow:"auto"}}>
      <div style={{background:C.white,borderRadius:10,width:wide?"min(720px,100%)":"min(560px,100%)",maxHeight:"calc(100vh - 60px)",overflow:"auto",display:"flex",flexDirection:"column"}}>
        <div style={{padding:"16px 24px",background:C.tealDk,color:C.white,borderRadius:"10px 10px 0 0",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <span style={{fontSize:15,fontWeight:700}}>{title}</span>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.15)",border:"none",color:C.white,borderRadius:4,width:30,height:30,cursor:"pointer",fontSize:16}}>✕</button>
        </div>
        <div style={{padding:24,overflow:"auto",flex:1}}>{children}</div>
      </div>
    </div>
  )
}

export function ChainView({intervention, decisions, actions, outcomes}) {
  const iDecs = decisions.filter(d => d.intervention_id === intervention.id)
  if (iDecs.length === 0) return <div style={{padding:24,textAlign:"center",color:C.grey,fontSize:13}}>No execution data logged yet for this intervention.</div>

  return (
    <div style={{padding:16}}>
      {iDecs.map(dec => {
        const dActs = actions.filter(a => a.decision_id === dec.id)
        const dOuts = outcomes.filter(o => dActs.some(a => a.id === o.action_id))
        return (
          <div key={dec.id} style={{marginBottom:24}}>
            <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
              <div style={{width:36,height:36,borderRadius:"50%",background:C.blue,color:C.white,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:14,flexShrink:0}}>D</div>
              <div style={{flex:1,background:C.blueLt,borderRadius:8,padding:14,border:`1px solid ${C.blue}20`}}>
                <div style={{fontSize:11,color:C.blue,fontWeight:600,marginBottom:4}}>DECISION — {fmtDate(dec.date)}</div>
                <div style={{fontSize:13,color:C.navy,fontWeight:600,marginBottom:6}}>{dec.decision_made}</div>
                <div style={{fontSize:12,color:C.greyDk,marginBottom:4}}>
                  <strong>DDD Tool:</strong> {dec.ddd_tool} &nbsp;|&nbsp; <strong>Data Viewed:</strong> {dec.data_viewed}
                </div>
                <div style={{fontSize:12,color:C.greyDk}}><strong>Key Insight:</strong> {dec.insight}</div>
                <div style={{fontSize:11,color:C.grey,marginTop:4}}>Decision by: {dec.made_by}</div>
              </div>
            </div>

            {dActs.map(act => (
              <div key={act.id} style={{display:"flex",gap:12,alignItems:"flex-start",marginTop:8,marginLeft:18}}>
                <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
                  <div style={{width:2,height:12,background:C.greyLt}}/>
                  <div style={{width:28,height:28,borderRadius:"50%",background:C.orange,color:C.white,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:12,flexShrink:0}}>A</div>
                </div>
                <div style={{flex:1,background:C.orangeLt,borderRadius:8,padding:12,border:`1px solid ${C.orange}20`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                    <span style={{fontSize:11,color:C.orange,fontWeight:600}}>ACTION</span>
                    <StatusDot s={act.status}/>
                  </div>
                  <div style={{fontSize:13,color:C.navy,marginBottom:4}}>{act.action_taken}</div>
                  <div style={{fontSize:11,color:C.grey}}>Responsible: {act.responsible} | Target: {fmtDate(act.target_date)}{act.completed_date ? ` | Completed: ${fmtDate(act.completed_date)}` : ""}</div>
                  {act.notes && <div style={{fontSize:11,color:C.greyDk,marginTop:4,fontStyle:"italic"}}>{act.notes}</div>}
                </div>
              </div>
            ))}

            {dOuts.map(out => (
              <div key={out.id} style={{display:"flex",gap:12,alignItems:"flex-start",marginTop:8,marginLeft:36}}>
                <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
                  <div style={{width:2,height:12,background:C.greyLt}}/>
                  <div style={{width:28,height:28,borderRadius:"50%",background:C.green,color:C.white,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:12,flexShrink:0}}>O</div>
                </div>
                <div style={{flex:1,background:C.greenLt,borderRadius:8,padding:12,border:`1px solid ${C.green}20`}}>
                  <div style={{fontSize:11,color:C.greenDk,fontWeight:600,marginBottom:4}}>OUTCOME — {fmtDate(out.date)}</div>
                  <div style={{fontSize:13,color:C.navy,marginBottom:4}}>{out.description}</div>
                  <div style={{fontSize:12,color:C.greyDk}}><strong>Metric:</strong> {out.metric} — <strong>{out.value}</strong></div>
                  <div style={{fontSize:11,color:C.grey,marginTop:4}}>Evidence: {out.evidence}</div>
                </div>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}
