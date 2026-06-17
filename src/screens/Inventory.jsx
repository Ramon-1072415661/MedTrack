import { useState } from 'react'
import { Card, SectionHeader, Button, Badge } from '../components'
import PageHeader from '../components/PageHeader'
import s from './screens.module.css'

export default function Inventory() {
  const [medications, setMedications] = useState([
    {
      id: 1,
      name: 'Dipirona',
      quantity: 15,
      expiration: '12/2026'
    },
    {
      id: 2,
      name: 'Amoxicilina',
      quantity: 8,
      expiration: '08/2026'
    }
  ])

  const [editingId, setEditingId] = useState(null)
  const [isAdding, setIsAdding] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    expiration: ''
  })

  function handleAdd() {
    setIsAdding(true)
    setFormData({ name: '', quantity: '', expiration: '' })
  }

  function handleEdit(id) {
    const med = medications.find(m => m.id === id)
    if (med) {
      setEditingId(id)
      setIsAdding(false)
      setFormData({
        name: med.name,
        quantity: med.quantity,
        expiration: med.expiration
      })
    }
  }

  function handleSaveEdit() {
    if (!formData.name || !formData.quantity || !formData.expiration) {
      alert('Please fill in all fields')
      return
    }

    if (isAdding) {
      // Add new medication
      const newId = Math.max(...medications.map(m => m.id), 0) + 1
      setMedications(prev => [
        ...prev,
        {
          id: newId,
          name: formData.name,
          quantity: parseInt(formData.quantity),
          expiration: formData.expiration
        }
      ])
      setIsAdding(false)
    } else {
      // Edit existing medication
      setMedications(prev =>
        prev.map(med =>
          med.id === editingId
            ? { ...med, ...formData, quantity: parseInt(formData.quantity) }
            : med
        )
      )
      setEditingId(null)
    }
    setFormData({ name: '', quantity: '', expiration: '' })
  }

  function handleCancelEdit() {
    setEditingId(null)
    setIsAdding(false)
    setFormData({ name: '', quantity: '', expiration: '' })
  }

  function handleRemove(id) {
    if (window.confirm('Remove this medication?')) {
      setMedications(prev =>
        prev.filter(med => med.id !== id)
      )
    }
  }

  return (
    <div className={s.page}>
      <PageHeader
        title="Inventory"
        subtitle="Manage your medications"
      />

      <div className={s.content}>
        <Card>
          <Button
            onClick={handleAdd}
            style={{
              width: '100%',
              justifyContent: 'center'
            }}
          >
            + Add Medication
          </Button>
        </Card>

        {(editingId || isAdding) && (
          <Card>
            <SectionHeader title={isAdding ? "Add New Medication" : "Edit Medication"} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>
                  Medication Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid var(--slate-200)',
                    borderRadius: 8,
                    fontSize: 14,
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>
                  Quantity
                </label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid var(--slate-200)',
                    borderRadius: 8,
                    fontSize: 14,
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>
                  Expiration Date (MM/YYYY)
                </label>
                <input
                  type="text"
                  placeholder="MM/YYYY"
                  value={formData.expiration}
                  onChange={(e) => setFormData({ ...formData, expiration: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid var(--slate-200)',
                    borderRadius: 8,
                    fontSize: 14,
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <Button
                  onClick={handleSaveEdit}
                  style={{ flex: 1 }}
                >
                  Save
                </Button>
                <Button
                  onClick={handleCancelEdit}
                  variant="outline"
                  style={{ flex: 1 }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        <Card>
          <SectionHeader title="Medication List" />

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 16
            }}
          >
            {medications.map(med => (
              <div
                key={med.id}
                style={{
                  padding: 16,
                  border: '1px solid var(--slate-200)',
                  borderRadius: 12,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <p
                    style={{
                      fontWeight: 700,
                      fontSize: 16
                    }}
                  >
                    💊 {med.name}
                  </p>

                  <p>
                    Stock: {med.quantity} units
                  </p>

                  <p>
                    Exp: {med.expiration}
                  </p>

                  {med.quantity <= 5 && (
                    <Badge variant="warning">
                      Low Stock
                    </Badge>
                  )}
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: 8
                  }}
                >
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(med.id)}
                  >
                    Edit
                  </Button>

                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleRemove(med.id)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}