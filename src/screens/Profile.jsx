import { useState, useEffect } from 'react'
import { Card, SectionHeader, Toggle, Button, Input, Badge } from '../components/index.jsx'
import PageHeader from '../components/PageHeader.jsx'
import { Snackbar } from '../components/Snackbar.jsx'
import { useSnackbar } from '../hooks/useSnackbar.js'
import { useForm } from '../hooks/useForm.js'
import { useTheme } from '../hooks/useTheme.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { updateProfile } from '../services/profileService'
import s from './screens.module.css'

export default function Profile() {
  const { user, profile, signOut, deleteAccount, setProfile } = useAuth()
  const { dark: darkMode, toggleTheme: toggleDark } = useTheme()
  const { snackbar, show } = useSnackbar()

  function showSnackbar(message, type = 'success') {
    setSnackbar({ message, type })
    setTimeout(() => setSnackbar({ message: '', type: 'success' }), 3000)
  }

  const { bind, values, setValues } = useForm({
    name: '',
    dob: '',
    email: '',
    phone: '',
    bloodType: '',
    allergies: '',
  })

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
  }, [profile])

  async function handleSave() {
    const payload = {
      ...(values.name && { full_name: values.name }),
      ...(values.dob && { date_of_birth: values.dob }),
      ...(values.phone && { phone: values.phone }),
      ...(values.bloodType && { blood_type: values.bloodType }),
      ...(values.allergies && { allergies: values.allergies }),
    }

    if (Object.keys(payload).length === 0) {
      show('No changes to save.')
      return
    }

    try {
      const updated = await updateProfile(user.id, payload)
      setProfile(updated)
      show('Profile saved successfully.')
    } catch (err) {
      show('Failed to save profile.', 'error')
    }
  }

  async function handleDeleteAccount() {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    )
    if (!confirmed) return

    try {
      await deleteAccount()
    } catch (err) {
      show('Failed to delete account.', 'error')
    }
  }

  return (
    <div className={s.page}>
      <PageHeader title="Profile & Settings" subtitle="Manage your details and preferences" />
      <div className={s.content}>

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--blue-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 22, fontWeight: 800, flexShrink: 0 }}>
              {user.initials || 'MT'}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 18, fontWeight: 800, color: 'var(--slate-900)' }}>{user.name}</p>
              <p style={{ fontSize: 12, color: 'var(--slate-400)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>Patient {user.patientId}</p>
            </div>
            <Badge variant="success">✓ Verified</Badge>
          </div>
        </Card>

        <div className={s.profileGrid}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Card>
              <SectionHeader title="Personal Information" />
              <div className={s.formStack}>
                <div className={s.formRow}>
                  <Input label="First name" {...bind('name')} />
                  <Input label="Date of birth" type="date" {...bind('dob')} />
                </div>
                <Input label="Email" type="email" {...bind('email')} />
                <Input label="Phone" type="tel" {...bind('phone')} />
                <div className={s.formRow}>
                  <Input label="Blood type" {...bind('bloodType')} />
                  <Input label="Allergies" {...bind('allergies')} />
                </div>
                <Button onClick={handleSave}>Save changes</Button>
              </div>
            </Card>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Card>
              <SectionHeader title="App Settings" />
              {[
                { icon: '🌙', label: 'Dark Mode', desc: 'Toggle dark theme', val: darkMode, toggle: toggleDark },
              ].map(row => (
                <div key={row.label} className={s.toggleRow}>
                  <span className={s.toggleRowIcon}>{row.icon}</span>
                  <div className={s.toggleRowText}>
                    <p className={s.toggleRowLabel}>{row.label}</p>
                    <p className={s.toggleRowDesc}>{row.desc}</p>
                  </div>
                  <Toggle checked={row.val} onChange={row.toggle} />
                </div>
              ))}
            </Card>

            <Card>
              <SectionHeader title="Emergency Contact" />
              {user?.emergencyContact && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0' }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--blue-100)', color: 'var(--blue-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12 }}>JD</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 600 }}>{user.emergencyContact?.name}</p>
                    <p style={{ fontSize: 12, color: 'var(--slate-400)' }}>Spouse · +1 (555) 987-6543</p>
                  </div>
                  <Button size="sm" variant="ghost">Edit</Button>
                </div>
              )}
              <Button size="sm" variant="outline" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>+ Add contact</Button>
            </Card>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Button variant="outline" onClick={signOut} style={{ justifyContent: 'center' }}>Sign out</Button>
              <Button variant="danger" onClick={handleDeleteAccount} style={{ justifyContent: 'center' }}>Delete account</Button>
            </div>
          </div>
        </div>
      </div>

      <Snackbar message={snackbar.message} type={snackbar.type} />
    </div>
  )
}