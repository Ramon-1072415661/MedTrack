// src/services/medicamentoService.js
import { supabase } from '../lib/supabaseClient'

// ── front → banco ─────────────────────────────────────────────────────────────
function formToDb(form, profileId) {
  return {
    name:            form.name,
    quant:           form.quantity ? parseInt(form.quantity) : null,
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
  return {
    id:            row.id_med,
    name:          row.name          ?? '',
    quantity:      String(row.quant  ?? ''),
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

// ── Desconta estoque com lógica correta por tipo de dose ─────────────────────
//
// CÁPSULA: desconta `doseCapsules` unidades por dose
//   ex: estoque=20, doseCapsules=10 → após 1 dose: estoque=10
//
// LÍQUIDO: acumula ml consumido e só desconta 1 unidade quando
//          o total consumido >= containerMl (volume do recipiente)
//   ex: estoque=10 frascos de 500ml, dose=250ml
//       após dose 1: acumulado=250ml  → estoque=10 (não descontou)
//       após dose 2: acumulado=500ml  → estoque=9  (consumiu 1 frasco)
//
export async function decrementStock(med, profileId) {
  const qty = parseInt(med.quantity)
  if (!qty || qty <= 0) return

  if (med.doseType === 'capsule') {
    // ── Cápsula/comprimido ──────────────────────────────────────────────────
    const perDose = parseInt(med.doseCapsules) || 1
    const newQty = Math.max(0, qty - perDose)
    const { error } = await supabase
      .from('medication')
      .update({ quant: newQty })
      .eq('id_med', med.id)
      .eq('profile_id', profileId)
    if (error) throw error
    return newQty

  } else {
    // ── Dose líquida ────────────────────────────────────────────────────────
    const doseMl      = parseFloat(med.doseMl)      || 0
    const containerMl = parseFloat(med.containerMl) || 0
    if (!doseMl || !containerMl) return

    // Busca total de ml já consumido do recipiente atual (via notes nos logs)
    const { data: logs } = await supabase
      .from('dose_log')
      .select('notes')
      .eq('med_id', med.id)
      .eq('was_taken', true)
      .order('taken_at', { ascending: false })

    // Acumula ml das doses anteriores até encontrar uma que zerou (novo frasco)
    let mlAccumulated = 0
    for (const log of (logs ?? [])) {
      if (!log.notes) continue
      try {
        const meta = JSON.parse(log.notes)
        if (meta.newContainer) break   // início de um novo frasco, para aqui
        mlAccumulated += meta.mlThisDose ?? 0
      } catch { /* ignora */ }
    }

    const mlAfterThisDose = mlAccumulated + doseMl
    const containersConsumed = Math.floor(mlAfterThisDose / containerMl)
    const newQty = Math.max(0, qty - containersConsumed)
    const isNewContainer = mlAfterThisDose >= containerMl

    // Salva metadado desta dose no notes do log mais recente
    await supabase
      .from('dose_log')
      .update({ notes: JSON.stringify({ mlThisDose: doseMl, newContainer: isNewContainer }) })
      .eq('med_id', med.id)
      .eq('was_taken', true)
      .order('taken_at', { ascending: false })
      .limit(1)

    if (containersConsumed > 0) {
      const { error } = await supabase
        .from('medication')
        .update({ quant: newQty })
        .eq('id_med', med.id)
        .eq('profile_id', profileId)
      if (error) throw error
    }

    return newQty
  }
}