import { useState, useEffect, useCallback } from 'react'
import { Card, SectionHeader, Badge, Button, Modal } from '../components'
import PageHeader from '../components/PageHeader'
import { useAuth } from '../contexts/AuthContext'
import {
  fetchMedicamentos,
  fetchTodayLogs,
  fetchAllLogs,
  logDose,
  decrementStock,
  toggleActiveMedicamento,
} from '../services/medicamentoService'
import s from './screens.module.css'

// ── Helpers de unidades ──────────────────────────────────────────────────────
// Para líquido: quant no banco = ml total. doseMl = ml por dose.
// Para cápsula: quant = comprimidos. doseCapsules = comprimidos por dose.

function getStockUnits(med) {
  // Retorna o estoque em unidades "brutas" do banco
  // Líquido: quantMl (ml real) ou reconstrói de quantity × containerMl
  if (med.doseType === 'liquid') {
    return med.quantMl ?? (parseFloat(med.quantity) * parseFloat(med.containerMl || 1))
  }
  return parseInt(med.quantity) || 0
}

function getUnitsPerDose(med) {
  if (med.doseType === 'liquid') return parseFloat(med.doseMl) || 0
  return parseInt(med.doseCapsules) || 1
}

function getDosesPerDay(med) {
  if (med.frequency === 'hourly') return Math.floor(24 / (parseInt(med.intervalHours) || 8))
  return med.scheduleTimes?.length || 1
}

// ── Dias restantes ────────────────────────────────────────────────────────────
function calcDaysLeft(med) {
  if (med.continuousUse) return null
  const stock    = getStockUnits(med)
  const perDose  = getUnitsPerDose(med)
  const perDay   = getDosesPerDay(med) * perDose
  if (!stock || !perDay) return null
  return Math.ceil(stock / perDay)
}

// ── % da barra: estoque consumido ÷ estoque original ─────────────────────────
function calcProgressPercent(med, quantConsumed) {
  if (med.continuousUse) return 0
  const consumed = quantConsumed ?? 0
  if (consumed <= 0) return 0
  const current  = getStockUnits(med)
  const original = current + consumed
  if (original <= 0) return 0
  return Math.min(100, Math.round((consumed / original) * 100))
}

function scheduleLabel(med) {
  if (med.frequency === 'hourly') return `A cada ${med.intervalHours}h`
  const times = med.scheduleTimes ?? []
  return times.length ? times.join(', ') : '—'
}

function doseLabel(med) {
  if (med.doseType === 'liquid') return `${med.doseMl || '?'}ml/dose`
  const n = parseInt(med.doseCapsules) || 1
  return `${n} ${n > 1 ? 'cápsulas' : 'cápsula'}/dose`
}

// ── Card individual ───────────────────────────────────────────────────────────
function MedCard({ med, takenToday, onClickTake, onClickPause, quantConsumed }) {
  const paused  = !med.active
  const daysLeft = calcDaysLeft(med)
  // Baixo estoque: líquido = < 2 doses restantes, cápsula = <= 5 unidades
  const stock    = getStockUnits(med)
  const perDose  = getUnitsPerDose(med)
  const lowStock = stock > 0 && perDose > 0 && (stock / perDose) <= (med.doseType === 'liquid' ? 2 : 5)

  return (
    <div
      onClick={() => !paused && !takenToday && onClickTake(med)}
      style={{
        background: 'var(--color-surface)',
        border: `1px solid ${lowStock ? 'var(--color-danger)' : 'var(--color-border)'}`,
        borderRadius: 14,
        padding: 18,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        opacity: paused ? 0.6 : 1,
        cursor: paused || takenToday ? 'default' : 'pointer',
        transition: 'box-shadow .2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      }}
      onMouseEnter={e => { if (!paused && !takenToday) e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)' }}
    >
      {/* Cabeçalho */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0, fontSize: 18,
          background: takenToday ? 'var(--green-100)' : 'var(--color-bg-subtle)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>💊</div>

        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 700, fontSize: 15 }}>{med.name}</p>
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
            {doseLabel(med)}
          </p>
        </div>

        <button
          onClick={e => { e.stopPropagation(); onClickPause(med) }}
          title={paused ? 'Retomar' : 'Pausar'}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 18, opacity: 0.7 }}
        >
          {paused ? '▶️' : '⏸️'}
        </button>

        {paused      && <Badge variant="default">Pausado</Badge>}
        {!paused && takenToday  && <Badge variant="success">✓ Tomado</Badge>}
        {!paused && !takenToday && <Badge variant="warning">⏳ Pendente</Badge>}
      </div>

      {/* Barra de progresso do tratamento */}
      {!med.continuousUse && daysLeft !== null && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Previsão de término</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: daysLeft <= 3 ? 'var(--color-danger)' : 'var(--color-text-muted)' }}>
              {daysLeft <= 0 ? 'Hoje' : `${daysLeft} dia${daysLeft > 1 ? 's' : ''}`}
            </span>
          </div>
          <div style={{ height: 5, background: 'var(--color-border)', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${calcProgressPercent(med, quantConsumed)}%`,
              background: daysLeft <= 3 ? 'var(--color-danger)' : 'var(--blue-500)',
              borderRadius: 999, transition: 'width .4s',
            }} />
          </div>
        </div>
      )}

      {/* Rodapé */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: lowStock ? 'var(--color-danger)' : 'var(--color-text-muted)' }}>
          {lowStock
            ? (() => {
                if (med.doseType === 'liquid' && med.containerMl) {
                  const frascos = (stock / parseFloat(med.containerMl)).toFixed(1).replace('.', ',')
                  return `⚠ ${frascos} frascos restantes`
                }
                return `⚠ ${med.quantity} unidades restantes`
              })()
            : med.continuousUse ? '♾️ Uso contínuo'
            : paused ? 'Tratamento pausado'
            : takenToday ? '✓ Tomado hoje!'
            : `📅 ${scheduleLabel(med)}`}
        </span>
        <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
          {med.doseType === 'liquid' && med.containerMl
            ? (() => {
                const frascos = stock / parseFloat(med.containerMl)
                const label = Number.isInteger(frascos)
                  ? frascos
                  : frascos.toFixed(1).replace('.', ',')
                return stock > 0 ? `${label} frasco${frascos !== 1 ? 's' : ''} restante${frascos !== 1 ? 's' : ''}` : 'Estoque esgotado'
              })()
            : (med.quantity ? `Estoque: ${med.quantity}` : '')}
        </span>
      </div>

      {med.instructions && (
        <p style={{ fontSize: 12, color: 'var(--color-text-muted)', fontStyle: 'italic',
          padding: '6px 10px', background: 'var(--color-bg-subtle)', borderRadius: 8,
          borderLeft: '2px solid var(--color-border)', lineHeight: 1.5 }}>
          ℹ️ {med.instructions}
        </p>
      )}

      {!paused && !takenToday && (
        <p style={{ fontSize: 11, color: 'var(--color-text-muted)', fontStyle: 'italic', textAlign: 'center' }}>
          Clique para marcar como tomado
        </p>
      )}
    </div>
  )
}

// ── Calcula unidades consumidas por med a partir dos logs ────────────────────
function calcQuantConsumed(med, allLogs) {
  const logs = allLogs.filter(l => Number(l.med_id) === Number(med.id) && l.was_taken)
  if (logs.length === 0) return 0
  return logs.length * getUnitsPerDose(med)
}

// ── Tela principal ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, profile } = useAuth()
  const profileId = profile?.id ?? user?.id

  const [medications, setMedications] = useState([])
  const [todayLogs,   setTodayLogs]   = useState([])
  const [allLogs,     setAllLogs]     = useState([])
  const [loading,     setLoading]     = useState(true)

  // modais
  const [confirmMed, setConfirmMed] = useState(null)
  const [pauseMed,   setPauseMed]   = useState(null)

  const loadData = useCallback(async () => {
    if (!profileId) return
    setLoading(true)
    try {
      const [meds, logs, all] = await Promise.all([
        fetchMedicamentos(profileId),
        fetchTodayLogs(profileId).catch(() => []),
        fetchAllLogs(profileId).catch(() => []),
      ])
      setMedications(meds)
      setTodayLogs(logs)
      setAllLogs(all)
    } catch (err) {
      console.error('Dashboard loadData:', err)
    } finally {
      setLoading(false)
    }
  }, [profileId])

  useEffect(() => { loadData() }, [loadData])

  function isTakenToday(med) {
    return todayLogs.some(log => log.med_id === med.id && log.was_taken)
  }

  // Confirmar dose
  async function handleConfirmTaken() {
    if (!confirmMed) return
    try {
      // Registra no log de doses
      await logDose(confirmMed.id, true)
      // Desconta do estoque com a lógica correta por tipo de dose
      if (confirmMed.quantity) {
        await decrementStock(confirmMed, profileId)
      }
      setConfirmMed(null)
      await loadData()
    } catch (err) {
      console.error('logDose error:', err)
      alert('Erro ao registrar dose: ' + err.message)
    }
  }

  // Pausar/retomar
  async function handleConfirmPause() {
    if (!pauseMed) return
    try {
      await toggleActiveMedicamento(pauseMed.id, !pauseMed.active, profileId)
      setPauseMed(null)
      await loadData()
    } catch (err) {
      console.error('toggleActive error:', err)
      alert('Erro: ' + err.message)
    }
  }

  const activeMeds   = medications.filter(m => m.active)
  const pausedCount  = medications.filter(m => !m.active).length
  const takenCount   = activeMeds.filter(m => isTakenToday(m)).length

  // Calcula sequência de dias consecutivos sem esquecer nenhum remédio
  function calcStreak() {
    if (allLogs.length === 0) return 0
    let streak = 0
    const today = new Date(); today.setHours(0,0,0,0)
    for (let d = 0; d < 365; d++) {
      const day = new Date(today)
      day.setDate(day.getDate() - d)
      const dayStr = day.toISOString().split('T')[0]
      const dayLogs = allLogs.filter(l => l.scheduled_for?.startsWith(dayStr))
      if (d === 0 && dayLogs.length === 0) continue // hoje ainda não tomou, não quebra
      if (dayLogs.length === 0 || dayLogs.some(l => !l.was_taken)) break
      streak++
    }
    return streak
  }
  const streak = calcStreak()

  if (loading) return (
    <div className={s.page}>
      <PageHeader title="Dashboard" subtitle="Carregando..." />
      <div className={s.content}>
        <Card>
          <p style={{ textAlign: 'center', padding: '32px 0', color: 'var(--color-text-muted)' }}>⏳ Carregando seus medicamentos...</p>
        </Card>
      </div>
    </div>
  )

  return (
    <div className={s.page}>
      <PageHeader
        title="Dashboard"
        subtitle={`Olá, ${profile?.full_name?.split(' ')[0] ?? 'usuário'}! Acompanhe seus medicamentos.`}
      />

      <div className={s.content}>

        {/* STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 16 }}>
          <Card>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Doses hoje</p>
            <p style={{ fontSize: 28, fontWeight: 800, color: 'var(--green-500)', lineHeight: 1 }}>{takenCount}/{activeMeds.length}</p>
            <p style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 6 }}>medicamentos tomados</p>
          </Card>

          <Card>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Cadastrados</p>
            <p style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-text)', lineHeight: 1 }}>{medications.length}</p>
          </Card>

          <Card>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Pausados</p>
            <p style={{ fontSize: 28, fontWeight: 800, color: 'var(--amber-400)', lineHeight: 1 }}>{pausedCount}</p>
          </Card>

          <Card>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Dias seguidos</p>
            <p style={{ fontSize: 28, fontWeight: 800, color: streak > 0 ? 'var(--green-500)' : 'var(--color-text)', lineHeight: 1 }}>
              {streak} 🔥
            </p>
            <p style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 6 }}>
              {streak === 0 ? 'Tome hoje para começar!' : streak === 1 ? 'dia consecutivo' : 'dias consecutivos'}
            </p>
          </Card>
        </div>

        {/* LISTA */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <SectionHeader title="Medicamentos em uso" />
            {takenCount === activeMeds.length && activeMeds.length > 0 && (
              <Badge variant="success">✓ Todos tomados hoje!</Badge>
            )}
          </div>

          {medications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--color-text-muted)' }}>
              <p style={{ fontSize: 32, marginBottom: 8 }}>💊</p>
              <p style={{ fontWeight: 600 }}>Nenhum medicamento cadastrado</p>
              <p style={{ fontSize: 13, marginTop: 4 }}>Adicione seus medicamentos no Inventário</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
              {medications.map(med => (
                <MedCard
                  key={med.id}
                  med={med}
                  takenToday={isTakenToday(med)}
                  onClickTake={m => setConfirmMed(m)}
                  onClickPause={m => setPauseMed(m)}
                  quantConsumed={calcQuantConsumed(med, allLogs)}
                />
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Modal: confirmar dose */}
      {confirmMed && (
        <Modal
          title="Confirmar medicamento"
          onClose={() => setConfirmMed(null)}
          footer={
            <div style={{ display: 'flex', gap: 8 }}>
              <Button onClick={handleConfirmTaken} style={{ flex: 1 }}>✓ Sim, tomei!</Button>
              <Button variant="outline" onClick={() => setConfirmMed(null)} style={{ flex: 1 }}>Cancelar</Button>
            </div>
          }
        >
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <p style={{ fontSize: 32, marginBottom: 8 }}>💊</p>
            <p style={{ fontSize: 16, fontWeight: 700 }}>{confirmMed.name}</p>
            <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginTop: 4 }}>{doseLabel(confirmMed)}</p>
            <p style={{ fontSize: 14, marginTop: 12 }}>Você realmente tomou este medicamento agora?</p>
            <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>Confirme apenas se tomou para evitar erros de uso.</p>
          </div>
        </Modal>
      )}

      {/* Modal: pausar/retomar */}
      {pauseMed && (
        <Modal
          title={pauseMed.active ? 'Pausar tratamento' : 'Retomar tratamento'}
          onClose={() => setPauseMed(null)}
          footer={
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant={pauseMed.active ? 'danger' : 'primary'} onClick={handleConfirmPause} style={{ flex: 1 }}>
                {pauseMed.active ? '⏸ Pausar' : '▶ Retomar'}
              </Button>
              <Button variant="outline" onClick={() => setPauseMed(null)} style={{ flex: 1 }}>Cancelar</Button>
            </div>
          }
        >
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <p style={{ fontSize: 32, marginBottom: 8 }}>{pauseMed.active ? '⏸️' : '▶️'}</p>
            <p style={{ fontSize: 16, fontWeight: 700 }}>{pauseMed.name}</p>
            <p style={{ fontSize: 14, color: 'var(--color-text)', marginTop: 12 }}>
              {pauseMed.active
                ? <>Tem certeza que deseja <strong>pausar</strong> este tratamento?</>
                : <>Deseja <strong>retomar</strong> o tratamento?</>}
            </p>
            {pauseMed.active && (
              <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 6 }}>Você poderá retomar quando quiser.</p>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}