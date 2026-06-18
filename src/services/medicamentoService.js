// src/services/medicamentoService.js
import { supabase } from '../lib/supabaseClient'

// ── front → banco ─────────────────────────────────────────────────────────────
function formToDb(form, profileId) {
  // Para líquido: quant armazena ml TOTAL (recipientes × volume/recipiente)
  // Ex: 10 frascos × 500ml = 5000ml guardado em quant
  // Isso permite subtrair dose_ml diretamente a cada tomada.
  let quant = form.quantity ? parseInt(form.quantity) : null
  if (form.doseType === 'liquid' && quant && form.containerMl) {
    quant = quant * parseFloat(form.containerMl)
  }

  return {
    name:            form.name,
    quant:           quant,
    active:          true,
    profile_id:      profileId,
    // dose
    dose_type:       form.doseType,
    dose_capsules:   form.doseType === 'capsule' ? parseInt(form.doseCapsules) || 1 : null,
    dose_ml:         form.doseType === 'liquid'  ? parseFloat(form.doseMl) || null : null,
    container_ml:    form.doseType === 'liquid'  ? parseFloat(form.containerMl) || null : null,
    // frequência
    frequency:       form.frequency,
    schedule_times:  form.frequency === 'daily'  ? (form.scheduleTimes ?? ['08:00']) : null,
    interval_hours:  form.frequency === 'hourly' ? parseInt(form.intervalHours) || 8 : null,
    // tratamento
    continuous_use:  form.continuousUse,
    start_date:      !form.continuousUse && form.startDate ? form.startDate : null,
    end_date:        !form.continuousUse && form.endDate ? form.endDate : null,
    instructions:    form.instructions || null,
  }
}

// ── banco → front ─────────────────────────────────────────────────────────────
function dbToForm(row) {
  // Para líquido: reconverte ml total → nº de recipientes para exibir no form
  // Se container_ml=500 e quant=5000, mostra "10 frascos"
  let quantity = String(row.quant ?? '')
  if (row.dose_type === 'liquid' && row.container_ml && row.quant) {
    quantity = String(Math.round(row.quant / row.container_ml))
  }

  return {
    id:            row.id_med,
    name:          row.name          ?? '',
    quantity,
    quantMl:       row.dose_type === 'liquid' ? row.quant : null, // ml total real
    startDate:     row.start_date    ?? '',
    continuousUse: row.continuous_use ?? false,
    doseType:      row.dose_type     ?? 'capsule',
    doseCapsules:  String(row.dose_capsules ?? '1'),
    doseMl:        String(row.dose_ml       ?? ''),
    containerMl:   String(row.container_ml  ?? ''),
    frequency:     row.frequency     ?? 'daily',
    scheduleTimes: row.schedule_times ?? ['08:00'],
    intervalHours: String(row.interval_hours ?? '8'),
    instructions:  row.instructions  ?? '',
    endDate:       row.end_date       ?? '',
    active:        row.active        ?? true,
  }
}

// ── CRUD ──────────────────────────────────────────────────────────────────────
export async function fetchMedicamentos(profileId) {
  const { data, error } = await supabase
    .from('medication')
    .select('*')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data ?? []).map(dbToForm)
}

export async function createMedicamento(form, profileId) {
  const { data, error } = await supabase
    .from('medication')
    .insert(formToDb(form, profileId))
    .select()
    .single()

  if (error) throw error
  return dbToForm(data)
}

export async function updateMedicamento(id, form, profileId) {
  const { data, error } = await supabase
    .from('medication')
    .update(formToDb(form, profileId))
    .eq('id_med', id)
    .eq('profile_id', profileId)
    .select()
    .single()

  if (error) throw error
  return dbToForm(data)
}

export async function deleteMedicamento(id, profileId) {
  const { error } = await supabase
    .from('medication')
    .delete()
    .eq('id_med', id)
    .eq('profile_id', profileId)

  if (error) throw error
}

// ── Registrar dose tomada (dose_log) ──────────────────────────────────────────
export async function logDose(medId, wasTaken) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { data, error } = await supabase
    .from('dose_log')
    .insert({
      med_id:        medId,
      scheduled_for: today.toISOString(),
      taken_at:      wasTaken ? new Date().toISOString() : null,
      was_taken:     wasTaken,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// ── Buscar logs de hoje ───────────────────────────────────────────────────────
export async function fetchTodayLogs(profileId) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const { data, error } = await supabase
    .from('dose_log')
    .select('*, medication!inner(profile_id)')
    .eq('medication.profile_id', profileId)
    .gte('scheduled_for', today.toISOString())
    .lt('scheduled_for', tomorrow.toISOString())

  if (error) throw error
  return data ?? []
}

// ── Pausar/retomar medicamento ────────────────────────────────────────────────
export async function toggleActiveMedicamento(id, active, profileId) {
  const { data, error } = await supabase
    .from('medication')
    .update({ active })
    .eq('id_med', id)
    .eq('profile_id', profileId)
    .select()
    .single()

  if (error) throw error
  return dbToForm(data)
}

// ── Busca todos os logs (para calcular sequência de dias) ─────────────────────
export async function fetchAllLogs(profileId) {
  // Busca ids dos meds do usuário primeiro (evita bug do filtro via join)
  const { data: meds, error: medsError } = await supabase
    .from('medication')
    .select('id_med')
    .eq('profile_id', profileId)

  if (medsError) throw medsError
  if (!meds || meds.length === 0) return []

  const medIds = meds.map(m => m.id_med)

  const { data, error } = await supabase
    .from('dose_log')
    .select('*')
    .in('med_id', medIds)
    .order('scheduled_for', { ascending: false })
    .limit(365)

  if (error) throw error
  return data ?? []
}

// ── Desconta estoque por dose ────────────────────────────────────────────────
//
// CÁPSULA: quant = nº de comprimidos. Subtrai dose_capsules por tomada.
//   ex: quant=30, dose=1 → após tomar: quant=29
//
// LÍQUIDO: quant = ml TOTAL (recipientes × volume/recipiente).
//   Subtrai dose_ml diretamente a cada tomada.
//   ex: quant=5000ml, dose=250ml → após tomar: quant=4750ml
//
export async function decrementStock(med, profileId) {
  // Para líquido, usa quantMl (ml real no banco), não quantity (nº de frascos)
  const currentQuant = med.doseType === 'liquid'
    ? (med.quantMl ?? parseFloat(med.quantity) * parseFloat(med.containerMl || 1))
    : parseInt(med.quantity)

  if (!currentQuant || currentQuant <= 0) return

  const perDose = med.doseType === 'liquid'
    ? parseFloat(med.doseMl) || 0
    : parseInt(med.doseCapsules) || 1

  if (!perDose) return

  const newQuant = Math.max(0, currentQuant - perDose)

  const { error } = await supabase
    .from('medication')
    .update({ quant: newQuant })
    .eq('id_med', med.id)
    .eq('profile_id', profileId)

  if (error) throw error
  return newQuant
}