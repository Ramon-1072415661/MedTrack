import { useState, useEffect, useCallback } from 'react'
import { Card, SectionHeader, Button, Badge, Modal } from '../components'
import PageHeader from '../components/PageHeader'
import { useAuth } from '../contexts/AuthContext'
import {
  fetchMedicamentos,
  createMedicamento,
  updateMedicamento,
  deleteMedicamento,
} from '../services/medicamentoService'
import s from './screens.module.css'

// ── Estilos reutilizáveis ─────────────────────────────────────────────────────
const iStyle = {
  width: '100%',
  padding: '9px 12px',
  border: '1px solid var(--color-border)',
  borderRadius: 8,
  fontSize: 14,
  boxSizing: 'border-box',
  background: 'var(--color-surface)',
  color: 'var(--color-text)',
}
const lStyle = {
  display: 'block',
  marginBottom: 5,
  fontWeight: 600,
  fontSize: 13,
  color: 'var(--color-text)',
}

// ── Calcula previsão de término ───────────────────────────────────────────────
function calcForecastDate(med) {
  if (med.continuousUse || !med.quantity || !med.startDate) return null

  const dosesPerDay = med.frequency === 'hourly'
    ? Math.floor(24 / (parseInt(med.intervalHours) || 8))
    : (med.scheduleTimes?.length || 1)

  // Quantas unidades (cápsulas ou ml) são consumidas por dia
  const unitsPerDose = med.doseType === 'liquid'
    ? parseFloat(med.doseMl) || 1
    : parseInt(med.doseCapsules) || 1

  const unitsPerDay = dosesPerDay * unitsPerDose

  // Para líquido: estoque em unidades de recipiente, mas consumo em ml
  // ex: 10 frascos de 500ml, 250ml/dose → totalMl = 5000ml, 250ml/dia → 20 dias
  const totalUnits = med.doseType === 'liquid'
    ? parseInt(med.quantity) * (parseFloat(med.containerMl) || 1)
    : parseInt(med.quantity)

  const daysTotal = Math.ceil(totalUnits / Math.max(unitsPerDay, 1))
  const end = new Date(med.startDate)
  end.setDate(end.getDate() + daysTotal)
  return end.toISOString().split('T')[0]
}

function calcForecast(med) {
  // Usa endDate manual se o usuário editou, senão calcula automático
  const dateStr = med.endDate || calcForecastDate(med)
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString('pt-BR')
}

// ── Formulário ────────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  name: '',
  quantity: '',
  startDate: '',
  endDate: '',
  continuousUse: false,
  doseType: 'capsule',
  doseCapsules: '1',
  doseMl: '',
  containerMl: '',
  frequency: 'daily',
  scheduleTimes: ['08:00'],
  intervalHours: '8',
  instructions: '',
}

function MedForm({ initial, onSave, onCancel, saving }) {
  const [form, setForm] = useState(initial)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  function handleHourChange(idx, hour) {
    const times = [...form.scheduleTimes]
    const min = times[idx]?.split(':')[1] ?? '00'
    times[idx] = `${hour}:${min}`
    set('scheduleTimes', times)
  }

  function handleMinuteChange(idx, min) {
    const times = [...form.scheduleTimes]
    const hour = times[idx]?.split(':')[0] ?? '08'
    times[idx] = `${hour}:${min}`
    set('scheduleTimes', times)
  }

  function handleSubmit() {
    if (!form.name.trim()) { alert('Informe o nome do medicamento.'); return }
    if (!form.quantity) { alert('Informe a quantidade em estoque.'); return }
    onSave(form)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Nome */}
      <div>
        <label style={lStyle}>Nome do medicamento *</label>
        <input
          style={iStyle}
          value={form.name}
          onChange={e => set('name', e.target.value)}
          placeholder="Ex: Losartana"
        />
      </div>

      {/* Tipo de dose */}
      <div>
        <label style={lStyle}>Tipo de dose</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { value: 'capsule', label: '💊 Cápsula / Comprimido' },
            { value: 'liquid',  label: '🧪 Dose líquida (ml)' },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => set('doseType', opt.value)}
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: 8,
                border: '2px solid',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: form.doseType === opt.value ? 700 : 400,
                borderColor: form.doseType === opt.value ? 'var(--color-primary)' : 'var(--color-border)',
                background: form.doseType === opt.value ? 'var(--blue-50, #eff6ff)' : 'var(--color-surface)',
                color: form.doseType === opt.value ? 'var(--color-primary)' : 'var(--color-text)',
                transition: 'all .15s',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quantidade por dose */}
      {form.doseType === 'capsule' && (
        <div>
          <label style={lStyle}>Cápsulas / comprimidos por dose</label>
          <input
            type="number"
            min="1"
            style={iStyle}
            value={form.doseCapsules}
            onChange={e => set('doseCapsules', e.target.value)}
          />
        </div>
      )}
      {form.doseType === 'liquid' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={lStyle}>Quantidade por dose (ml)</label>
            <input
              type="number"
              min="1"
              step="1"
              style={iStyle}
              value={form.doseMl}
              onChange={e => set('doseMl', e.target.value)}
              placeholder="Ex: 5"
            />
          </div>
          <div>
            <label style={lStyle}>Volume do recipiente (ml)</label>
            <input
              type="number"
              min="1"
              step="1"
              style={iStyle}
              value={form.containerMl}
              onChange={e => set('containerMl', e.target.value)}
              placeholder="Ex: 500"
            />
            <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 3 }}>
              Capacidade total de cada frasco/embalagem
            </p>
          </div>
        </div>
      )}

      {/* Frequência */}
      <div>
        <label style={lStyle}>Frequência</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { value: 'daily',  label: '📅 Diário' },
            { value: 'hourly', label: '⏱ Por intervalo de horas' },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => set('frequency', opt.value)}
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: 8,
                border: '2px solid',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: form.frequency === opt.value ? 700 : 400,
                borderColor: form.frequency === opt.value ? 'var(--color-primary)' : 'var(--color-border)',
                background: form.frequency === opt.value ? 'var(--blue-50, #eff6ff)' : 'var(--color-surface)',
                color: form.frequency === opt.value ? 'var(--color-primary)' : 'var(--color-text)',
                transition: 'all .15s',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {form.frequency === 'daily' && (
        <div>
          <label style={lStyle}>Horários de tomada</label>
          {form.scheduleTimes.map((t, i) => {
            const [hh, mm] = (t || '08:00').split(':')
            return (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center' }}>
                <select
                  style={{ ...iStyle, flex: 1 }}
                  value={hh}
                  onChange={e => handleHourChange(i, e.target.value)}
                >
                  {Array.from({ length: 24 }, (_, h) => String(h).padStart(2, '0')).map(h => (
                    <option key={h} value={h}>{h}h</option>
                  ))}
                </select>
                <span style={{ color: 'var(--color-text-muted)', fontWeight: 700, fontSize: 18 }}>:</span>
                <select
                  style={{ ...iStyle, flex: 1 }}
                  value={mm}
                  onChange={e => handleMinuteChange(i, e.target.value)}
                >
                  {['00', '15', '30', '45'].map(m => (
                    <option key={m} value={m}>{m}min</option>
                  ))}
                </select>
                {form.scheduleTimes.length > 1 && (
                  <button
                    onClick={() => set('scheduleTimes', form.scheduleTimes.filter((_, j) => j !== i))}
                    style={{ padding: '4px 10px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'transparent', cursor: 'pointer', color: 'var(--color-danger)', fontSize: 16, flexShrink: 0 }}
                  >
                    ✕
                  </button>
                )}
              </div>
            )
          })}
          <button
            onClick={() => set('scheduleTimes', [...form.scheduleTimes, '08:00'])}
            style={{ fontSize: 13, color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: 2 }}
          >
            + Adicionar horário
          </button>
        </div>
      )}

      {form.frequency === 'hourly' && (
        <div>
          <label style={lStyle}>Intervalo entre doses (horas)</label>
          <input
            type="number"
            min="1"
            max="24"
            style={iStyle}
            value={form.intervalHours}
            onChange={e => set('intervalHours', e.target.value)}
          />
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
            Ex: 8 = tomar a cada 8 horas
          </p>
        </div>
      )}

      {/* Uso contínuo */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '12px 14px',
          background: 'var(--color-bg-subtle)',
          borderRadius: 10,
        }}
      >
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 600, fontSize: 14 }}>Uso contínuo</p>
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
            Para medicamentos permanentes (ex: Losartana, anticoncepcional, insulina)
          </p>
        </div>
        <div
          onClick={() => set('continuousUse', !form.continuousUse)}
          style={{
            width: 44,
            height: 24,
            borderRadius: 999,
            background: form.continuousUse ? 'var(--color-primary)' : 'var(--color-border)',
            position: 'relative',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'background .2s',
          }}
        >
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: '#fff',
              position: 'absolute',
              top: 2,
              left: form.continuousUse ? 22 : 2,
              transition: 'left .2s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }}
          />
        </div>
      </div>

      {/* Quantidade + datas */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={lStyle}>Quantidade em estoque (unidades) *</label>
          <input
            type="number"
            min="1"
            style={iStyle}
            value={form.quantity}
            onChange={e => { set('quantity', e.target.value); set('endDate', '') }}
            placeholder="Ex: 30"
          />
        </div>
        {!form.continuousUse && (
          <div>
            <label style={lStyle}>Data de início</label>
            <input
              type="date"
              style={iStyle}
              value={form.startDate}
              onChange={e => { set('startDate', e.target.value); set('endDate', '') }}
            />
          </div>
        )}
      </div>

      {/* Previsão de término calculada + campo editável */}
      {!form.continuousUse && form.quantity && form.startDate && (() => {
        const auto = calcForecastDate({ ...form })
        return (
          <div style={{ padding: '12px 14px', background: 'var(--color-bg-subtle)', borderRadius: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <p style={{ fontWeight: 600, fontSize: 13 }}>📅 Previsão de término</p>
              {!form.endDate && auto && (
                <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                  calculado: {new Date(auto).toLocaleDateString('pt-BR')}
                </span>
              )}
            </div>
            <input
              type="date"
              style={iStyle}
              value={form.endDate || auto || ''}
              onChange={e => set('endDate', e.target.value)}
            />
            <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>
              Altere se for comprar mais remédio e o tratamento for mais longo
            </p>
            {form.endDate && form.endDate !== auto && (
              <button
                onClick={() => set('endDate', '')}
                style={{ fontSize: 12, color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', marginTop: 2 }}
              >
                ↺ Restaurar data calculada
              </button>
            )}
          </div>
        )
      })()}

      {/* Instruções */}
      <div>
        <label style={lStyle}>Instruções / observações</label>
        <textarea
          style={{ ...iStyle, resize: 'vertical', minHeight: 64, fontFamily: 'inherit' }}
          value={form.instructions}
          onChange={e => set('instructions', e.target.value)}
          placeholder="Ex: Tomar em jejum 30min antes do café"
        />
      </div>

      {/* Botões */}
      <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
        <Button onClick={handleSubmit} style={{ flex: 1 }} disabled={saving}>
          {saving ? 'Salvando…' : 'Salvar'}
        </Button>
        <Button variant="outline" onClick={onCancel} style={{ flex: 1 }} disabled={saving}>
          Cancelar
        </Button>
      </div>
    </div>
  )
}

// ── Tela principal ────────────────────────────────────────────────────────────
export default function Inventory() {
  const { user, profile } = useAuth()

  const [medications, setMedications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  const [showForm, setShowForm] = useState(false)
  const [editingMed, setEditingMed] = useState(null)
  const [deletingMed, setDeletingMed] = useState(null)
  const [addStockMed, setAddStockMed] = useState(null)   // modal de adicionar estoque
  const [addQty, setAddQty] = useState('')

  // profileId: usa profile.id (uuid) se disponível, senão user.id
  const profileId = profile?.id ?? user?.id

  // ── Carrega medicamentos do banco ──────────────────────────────────────────
  const loadMedications = useCallback(async () => {
    if (!profileId) return
    setLoading(true)
    setError(null)
    try {
      const data = await fetchMedicamentos(profileId)
      setMedications(data)
    } catch (err) {
      console.error('Erro ao carregar medicamentos:', err)
      setError('Não foi possível carregar seus medicamentos. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }, [profileId])

  useEffect(() => {
    loadMedications()
  }, [loadMedications])

  // ── Salvar (criar ou editar) ───────────────────────────────────────────────
  async function handleSave(formData) {
    if (!profileId) return
    setSaving(true)
    try {
      if (editingMed) {
        const updated = await updateMedicamento(editingMed.id, formData, profileId)
        setMedications(prev => prev.map(m => m.id === editingMed.id ? updated : m))
      } else {
        const created = await createMedicamento(formData, profileId)
        setMedications(prev => [...prev, created])
      }
      setShowForm(false)
      setEditingMed(null)
    } catch (err) {
      console.error('Erro ao salvar medicamento:', err)
      alert('Erro ao salvar medicamento: ' + (err.message ?? 'Tente novamente.'))
    } finally {
      setSaving(false)
    }
  }

  // ── Remover ────────────────────────────────────────────────────────────────
  async function confirmRemove() {
    if (!profileId || !deletingMed) return
    setSaving(true)
    try {
      await deleteMedicamento(deletingMed.id, profileId)
      setMedications(prev => prev.filter(m => m.id !== deletingMed.id))
      setDeletingMed(null)
    } catch (err) {
      console.error('Erro ao remover medicamento:', err)
      alert('Erro ao remover: ' + (err.message ?? 'Tente novamente.'))
    } finally {
      setSaving(false)
    }
  }

  function openEdit(med) {
    setEditingMed(med)
    setShowForm(true)
  }

  function openAdd() {
    setEditingMed(null)
    setShowForm(true)
  }

  async function handleAddStock() {
    if (!addQty || parseInt(addQty) <= 0) { alert('Informe uma quantidade válida.'); return }
    const med = addStockMed
    const newQty = parseInt(med.quantity || 0) + parseInt(addQty)
    setSaving(true)
    try {
      await updateMedicamento(med.id, { ...med, quantity: String(newQty) }, profileId)
      setMedications(prev => prev.map(m => m.id === med.id ? { ...m, quantity: String(newQty) } : m))
      setAddStockMed(null)
      setAddQty('')
    } catch (err) {
      alert('Erro ao adicionar estoque: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  // ── Rótulos de exibição ────────────────────────────────────────────────────
  function scheduleLabel(med) {
    if (med.frequency === 'daily') return `Diário · ${med.scheduleTimes.join(', ')}`
    return `A cada ${med.intervalHours}h`
  }

  function doseLabel(med) {
    if (med.doseType === 'liquid') {
      const dose = med.doseMl ? `${med.doseMl}ml/dose` : ''
      const container = med.containerMl ? ` · frasco ${med.containerMl}ml` : ''
      return dose + container
    }
    return `${med.doseCapsules} ${parseInt(med.doseCapsules) > 1 ? 'cápsulas' : 'cápsula'} por dose`
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className={s.page}>
      <PageHeader title="Inventário" subtitle="Gerencie seus medicamentos" />

      <div className={s.content}>

        {/* Botão adicionar */}
        <Card>
          <Button onClick={openAdd} style={{ width: '100%', justifyContent: 'center' }}>
            + Adicionar medicamento
          </Button>
        </Card>

        {/* Estado de carregamento */}
        {loading && (
          <Card>
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--color-text-muted)' }}>
              <p style={{ fontSize: 24, marginBottom: 8 }}>⏳</p>
              <p style={{ fontWeight: 600 }}>Carregando medicamentos…</p>
            </div>
          </Card>
        )}

        {/* Erro */}
        {!loading && error && (
          <Card>
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--color-danger)' }}>
              <p style={{ fontSize: 24, marginBottom: 8 }}>⚠️</p>
              <p style={{ fontWeight: 600 }}>{error}</p>
              <Button onClick={loadMedications} style={{ marginTop: 12 }}>
                Tentar novamente
              </Button>
            </div>
          </Card>
        )}

        {/* Lista vazia */}
        {!loading && !error && medications.length === 0 && (
          <Card>
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--color-text-muted)' }}>
              <p style={{ fontSize: 32, marginBottom: 8 }}>💊</p>
              <p style={{ fontWeight: 600 }}>Nenhum medicamento cadastrado</p>
              <p style={{ fontSize: 13, marginTop: 4 }}>
                Clique em &quot;Adicionar medicamento&quot; para começar
              </p>
            </div>
          </Card>
        )}

        {/* Lista de medicamentos */}
        {!loading && !error && medications.length > 0 && (
          <Card>
            <SectionHeader title="Lista de medicamentos" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {medications.map(med => {
                const forecast = calcForecast(med)
                const lowStock = med.quantity && parseInt(med.quantity) <= 5

                return (
                  <div
                    key={med.id}
                    style={{
                      padding: 16,
                      border: `1px solid ${lowStock ? 'var(--color-danger)' : 'var(--color-border)'}`,
                      borderRadius: 12,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: 12,
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      {/* Nome + badges */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                        <p style={{ fontWeight: 700, fontSize: 16 }}>💊 {med.name}</p>
                        {med.continuousUse && <Badge variant="info">♾️ Uso contínuo</Badge>}
                        {lowStock && <Badge variant="danger">⚠ Estoque baixo</Badge>}
                      </div>

                      {/* Detalhes */}
                      <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                        {doseLabel(med)} · {scheduleLabel(med)}
                      </p>
                      <p style={{ fontSize: 13, marginTop: 2 }}>
                        Estoque: <strong>{med.quantity}</strong> unidades
                      </p>
                      {forecast && (
                        <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
                          📅 Previsão de término: <strong>{forecast}</strong>
                        </p>
                      )}
                      {med.instructions && (
                        <p style={{ fontSize: 12, color: 'var(--color-text-muted)', fontStyle: 'italic', marginTop: 4 }}>
                          ℹ️ {med.instructions}
                        </p>
                      )}
                    </div>

                    {/* Ações */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0, alignItems: 'flex-end' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Button size="sm" variant="outline" onClick={() => openEdit(med)}>
                          Editar
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => setDeletingMed(med)}>
                          Remover
                        </Button>
                      </div>
                      <button
                        onClick={() => { setAddStockMed(med); setAddQty('') }}
                        style={{
                          fontSize: 12, fontWeight: 600,
                          color: 'var(--color-primary)',
                          background: 'var(--blue-50, rgba(59,130,246,0.08))',
                          border: '1px solid var(--color-primary)',
                          borderRadius: 8, padding: '4px 10px',
                          cursor: 'pointer', whiteSpace: 'nowrap',
                        }}
                      >
                        + Adicionar estoque
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        )}
      </div>

      {/* Modal: formulário */}
      {showForm && (
        <Modal
          title={editingMed ? 'Editar medicamento' : 'Novo medicamento'}
          onClose={() => { if (!saving) { setShowForm(false); setEditingMed(null) } }}
        >
          <MedForm
            key={editingMed?.id ?? 'new'}
            initial={editingMed ?? EMPTY_FORM}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditingMed(null) }}
            saving={saving}
          />
        </Modal>
      )}

      {/* Modal: adicionar estoque */}
      {addStockMed && (
        <Modal
          title={`Adicionar estoque — ${addStockMed.name}`}
          onClose={() => { if (!saving) { setAddStockMed(null); setAddQty('') } }}
          footer={
            <div style={{ display: 'flex', gap: 8 }}>
              <Button onClick={handleAddStock} style={{ flex: 1 }} disabled={saving}>
                {saving ? 'Salvando…' : '+ Adicionar'}
              </Button>
              <Button variant="outline" onClick={() => { setAddStockMed(null); setAddQty('') }} style={{ flex: 1 }} disabled={saving}>
                Cancelar
              </Button>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <p style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>
              Estoque atual: <strong>{addStockMed.quantity} unidades</strong>
            </p>
            <div>
              <label style={lStyle}>Quantidade a adicionar</label>
              <input
                type="number"
                min="1"
                autoFocus
                style={iStyle}
                value={addQty}
                onChange={e => setAddQty(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddStock()}
                placeholder="Ex: 30"
              />
            </div>
            {addQty && parseInt(addQty) > 0 && (
              <p style={{ fontSize: 13, color: 'var(--green-600, #16a34a)', fontWeight: 600 }}>
                Novo total: {parseInt(addStockMed.quantity || 0) + parseInt(addQty)} unidades
              </p>
            )}
          </div>
        </Modal>
      )}

      {/* Modal: confirmar remoção */}
      {deletingMed && (
        <Modal
          title="Remover medicamento"
          onClose={() => { if (!saving) setDeletingMed(null) }}
          footer={
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="danger" onClick={confirmRemove} style={{ flex: 1 }} disabled={saving}>
                {saving ? 'Removendo…' : 'Sim, remover'}
              </Button>
              <Button variant="outline" onClick={() => setDeletingMed(null)} style={{ flex: 1 }} disabled={saving}>
                Cancelar
              </Button>
            </div>
          }
        >
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <p style={{ fontSize: 32, marginBottom: 8 }}>⚠️</p>
            <p style={{ fontSize: 15 }}>
              Deseja remover <strong>{deletingMed.name}</strong>?
            </p>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 6 }}>
              Esta ação não pode ser desfeita.
            </p>
          </div>
        </Modal>
      )}
    </div>
  )
}