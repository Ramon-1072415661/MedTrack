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

  function handleAdd() {
    console.log('Adicionar medicamento')
  }

  function handleEdit(id) {
    console.log('Editar medicamento', id)
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