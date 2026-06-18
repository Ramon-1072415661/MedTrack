import { useState, useEffect } from 'react'
import { Card, SectionHeader, Toggle, Button, Input, Badge, Modal } from '../components/index.jsx'
import PageHeader from '../components/PageHeader.jsx'
import { Snackbar } from '../components/Snackbar.jsx'
import { useSnackbar } from '../hooks/useSnackbar.js'
import { useForm } from '../hooks/useForm.js'
import { useTheme } from '../hooks/useTheme.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { updateProfile } from '../services/profileService'
import s from './screens.module.css'

const RELATIONSHIP_OPTIONS = [
  'Cônjuge', 'Pai', 'Mãe', 'Filho(a)', 'Irmão/Irmã',
  'Avô/Avó', 'Amigo(a)', 'Outro',
]

export default function Profile() {
  const { user, profile, signOut, deleteAccount, setProfile } = useAuth()
  const { dark: darkMode, toggleTheme: toggleDark } = useTheme()
  const { snackbar, show } = useSnackbar()

  const { bind, values, setValues } = useForm({
    name: '',
    dob: '',
    email: '',
    phone: '',
    bloodType: '',
    allergies: '',
  })

  // ── Contato de emergência ─────────────────────────────────────────────────
  const [emergencyContact, setEmergencyContact] = useState(null)
  const [showEcModal, setShowEcModal] = useState(false)
  const [ecForm, setEcForm] = useState({ name: '', phone: '', relationship: '' })
  const [ecSaving, setEcSaving] = useState(false)

  // Popula o form quando o profile carregar
  useEffect(() => {
    if (!profile) return
    setValues({
      name: profile.full_name ?? '',
      dob: profile.date_of_birth ?? '',
      email: user?.email ?? '',
      phone: profile.phone ?? '',
      bloodType: profile.blood_type ?? '',
      allergies: profile.allergies ?? '',
    })
    // Carrega contato de emergência
    try {
      const ec = profile.emergency_contact
        ? JSON.parse(profile.emergency_contact)
        : null
      setEmergencyContact(ec)
    } catch {
      setEmergencyContact(null)
    }
  }, [profile])

  function openEcModal() {
    setEcForm(emergencyContact ?? { name: '', phone: '', relationship: '' })
    setShowEcModal(true)
  }

  async function handleSaveEc() {
    if (!ecForm.name.trim()) { alert('Informe o nome do contato.'); return }
    if (!ecForm.phone.trim()) { alert('Informe o telefone do contato.'); return }
    setEcSaving(true)
    try {
      const ecJson = JSON.stringify({
        name: ecForm.name.trim(),
        phone: ecForm.phone.trim(),
        relationship: ecForm.relationship.trim(),
      })
      const updated = await updateProfile(user.id, {
        full_name: values.name,
        date_of_birth: values.dob,
        phone: values.phone,
        blood_type: values.bloodType,
        allergies: values.allergies,
        emergency_contact: ecJson,
      })
      setProfile(updated)
      setEmergencyContact(JSON.parse(ecJson))
      setShowEcModal(false)
      show('Contato de emergência salvo!')
    } catch {
      show('Erro ao salvar contato.', 'error')
    } finally {
      setEcSaving(false)
    }
  }

  async function handleRemoveEc() {
    if (!window.confirm('Remover contato de emergência?')) return
    try {
      const updated = await updateProfile(user.id, {
        full_name: values.name,
        date_of_birth: values.dob,
        phone: values.phone,
        blood_type: values.bloodType,
        allergies: values.allergies,
        emergency_contact: null,
      })
      setProfile(updated)
      setEmergencyContact(null)
      show('Contato removido.')
    } catch {
      show('Erro ao remover contato.', 'error')
    }
  }

  async function handleSave() {
    const payload = {
      ...(values.name && { full_name: values.name }),
      ...(values.dob && { date_of_birth: values.dob }),
      ...(values.phone && { phone: values.phone }),
      ...(values.bloodType && { blood_type: values.bloodType }),
      ...(values.allergies && { allergies: values.allergies }),
      emergency_contact: emergencyContact ? JSON.stringify(emergencyContact) : null,
    }

    try {
      const updated = await updateProfile(user.id, payload)
      setProfile(updated)
      show('Perfil salvo com sucesso.')
    } catch {
      show('Erro ao salvar perfil.', 'error')
    }
  }

  async function handleDeleteAccount() {
    const confirmed = window.confirm(
      'Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.'
    )
    if (!confirmed) return
    try {
      await deleteAccount()
    } catch {
      show('Erro ao excluir conta.', 'error')
    }
  }

  // Iniciais do avatar
  const initials = (profile?.full_name ?? user?.email ?? 'MT')
    .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  const iStyle = {
    width: '100%', padding: '9px 12px',
    border: '1px solid var(--color-border)',
    borderRadius: 8, fontSize: 14, boxSizing: 'border-box',
    background: 'var(--color-surface)', color: 'var(--color-text)',
  }
  const lStyle = { display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 13 }

  return (
    <div className={s.page}>
      <PageHeader title="Perfil & Configurações" subtitle="Gerencie seus dados e preferências" />
      <div className={s.content}>

        {/* Avatar */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--blue-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 22, fontWeight: 800, flexShrink: 0 }}>
              {initials}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 18, fontWeight: 800 }}>{profile?.full_name || user?.email}</p>
              <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>{user?.email}</p>
            </div>
            <Badge variant="success">✓ Verificado</Badge>
          </div>
        </Card>

        <div className={s.profileGrid}>
          {/* Coluna esquerda */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Card>
              <SectionHeader title="Informações pessoais" />
              <div className={s.formStack}>
                <div className={s.formRow}>
                  <Input label="Nome completo" {...bind('name')} />
                  <Input label="Data de nascimento" type="date" {...bind('dob')} />
                </div>
                <Input label="E-mail" type="email" {...bind('email')} disabled />
                <Input label="Telefone" type="tel" {...bind('phone')} />
                <div className={s.formRow}>
                  <Input label="Tipo sanguíneo" {...bind('bloodType')} />
                  <Input label="Alergias" {...bind('allergies')} />
                </div>
                <Button onClick={handleSave}>Salvar alterações</Button>
              </div>
            </Card>
          </div>

          {/* Coluna direita */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Card>
              <SectionHeader title="Configurações do app" />
              <div className={s.toggleRow}>
                <span className={s.toggleRowIcon}>🌙</span>
                <div className={s.toggleRowText}>
                  <p className={s.toggleRowLabel}>Modo escuro</p>
                  <p className={s.toggleRowDesc}>Alternar tema escuro</p>
                </div>
                <Toggle checked={darkMode} onChange={toggleDark} />
              </div>
            </Card>

            {/* Contato de emergência */}
            <Card>
              <SectionHeader title="Contato de emergência" />

              {emergencyContact ? (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--color-bg-subtle)', borderRadius: 10 }}>
                    <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--blue-100)', color: 'var(--blue-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
                      {emergencyContact.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 700, fontSize: 14 }}>{emergencyContact.name}</p>
                      <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
                        {emergencyContact.relationship && `${emergencyContact.relationship} · `}{emergencyContact.phone}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <Button size="sm" variant="outline" onClick={openEcModal} style={{ flex: 1 }}>
                      ✏️ Editar
                    </Button>
                    <Button size="sm" variant="danger" onClick={handleRemoveEc} style={{ flex: 1 }}>
                      Remover
                    </Button>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 12 }}>
                    Nenhum contato cadastrado
                  </p>
                  <Button variant="outline" onClick={openEcModal} style={{ width: '100%', justifyContent: 'center' }}>
                    + Adicionar contato
                  </Button>
                </div>
              )}
            </Card>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Button variant="outline" onClick={signOut} style={{ justifyContent: 'center' }}>Sair da conta</Button>
              <Button variant="danger" onClick={handleDeleteAccount} style={{ justifyContent: 'center' }}>Excluir conta</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: contato de emergência */}
      {showEcModal && (
        <Modal
          title={emergencyContact ? 'Editar contato de emergência' : 'Adicionar contato de emergência'}
          onClose={() => !ecSaving && setShowEcModal(false)}
          footer={
            <div style={{ display: 'flex', gap: 8 }}>
              <Button onClick={handleSaveEc} style={{ flex: 1 }} disabled={ecSaving}>
                {ecSaving ? 'Salvando…' : 'Salvar'}
              </Button>
              <Button variant="outline" onClick={() => setShowEcModal(false)} style={{ flex: 1 }} disabled={ecSaving}>
                Cancelar
              </Button>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={lStyle}>Nome completo *</label>
              <input
                style={iStyle}
                value={ecForm.name}
                onChange={e => setEcForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Ex: Maria Silva"
              />
            </div>
            <div>
              <label style={lStyle}>Telefone *</label>
              <input
                style={iStyle}
                type="tel"
                value={ecForm.phone}
                onChange={e => setEcForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="Ex: (48) 99999-9999"
              />
            </div>
            <div>
              <label style={lStyle}>Parentesco / Relação</label>
              <select
                style={{ ...iStyle, cursor: 'pointer' }}
                value={ecForm.relationship}
                onChange={e => setEcForm(f => ({ ...f, relationship: e.target.value }))}
              >
                <option value="">Selecione...</option>
                {RELATIONSHIP_OPTIONS.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>
        </Modal>
      )}

      <Snackbar message={snackbar.message} type={snackbar.type} />
    </div>
  )
}