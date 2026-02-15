import { supabase } from './supabase'

// ── Interventions ────────────────────────────────────────────────────────────
export async function fetchInterventions() {
  const { data, error } = await supabase
    .from('interventions')
    .select('*')
    .order('province', { ascending: true })
  if (error) throw error
  return data || []
}

export async function upsertIntervention(item) {
  const { data, error } = await supabase
    .from('interventions')
    .upsert(item, { onConflict: 'id' })
    .select()
  if (error) throw error
  return data?.[0]
}

export async function deleteIntervention(id) {
  const { error } = await supabase.from('interventions').delete().eq('id', id)
  if (error) throw error
}

// ── Decisions ────────────────────────────────────────────────────────────────
export async function fetchDecisions() {
  const { data, error } = await supabase
    .from('decisions')
    .select('*')
    .order('date', { ascending: false })
  if (error) throw error
  return data || []
}

export async function insertDecision(item) {
  const { data, error } = await supabase
    .from('decisions')
    .insert(item)
    .select()
  if (error) throw error
  return data?.[0]
}

// ── Actions ──────────────────────────────────────────────────────────────────
export async function fetchActions() {
  const { data, error } = await supabase
    .from('actions')
    .select('*')
    .order('target_date', { ascending: false })
  if (error) throw error
  return data || []
}

export async function insertAction(item) {
  const { data, error } = await supabase
    .from('actions')
    .insert(item)
    .select()
  if (error) throw error
  return data?.[0]
}

export async function updateActionStatus(id, status, completedDate) {
  const { data, error } = await supabase
    .from('actions')
    .update({ status, completed_date: completedDate || null })
    .eq('id', id)
    .select()
  if (error) throw error
  return data?.[0]
}

// ── Outcomes ─────────────────────────────────────────────────────────────────
export async function fetchOutcomes() {
  const { data, error } = await supabase
    .from('outcomes')
    .select('*')
    .order('date', { ascending: false })
  if (error) throw error
  return data || []
}

export async function insertOutcome(item) {
  const { data, error } = await supabase
    .from('outcomes')
    .insert(item)
    .select()
  if (error) throw error
  return data?.[0]
}

// ── Real-time subscriptions ──────────────────────────────────────────────────
export function subscribeToChanges(table, callback) {
  const channel = supabase
    .channel(`${table}-changes`)
    .on('postgres_changes', { event: '*', schema: 'public', table }, callback)
    .subscribe()
  return () => supabase.removeChannel(channel)
}

// ── Fetch all data at once ───────────────────────────────────────────────────
export async function fetchAllData() {
  const [interventions, decisions, actions, outcomes] = await Promise.all([
    fetchInterventions(),
    fetchDecisions(),
    fetchActions(),
    fetchOutcomes(),
  ])
  return { interventions, decisions, actions, outcomes }
}
