import { Card, SectionHeader, Badge, Button } from '../components'
import PageHeader from '../components/PageHeader'
import { useAuth } from '../contexts/AuthContext'
import s from './screens.module.css'

export default function Dashboard() {
  const { user } = useAuth()

  return (
    <div className={s.page}>
      <PageHeader
        title={`Welcome, ${user?.name || 'Patient'} 👋`}
        subtitle="Here's your health summary today"
      />

      <div className={s.content}>

        {/* RESUMO */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
            gap: 16
          }}
        >
          <Card>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16
              }}
            >
              <div
                style={{
                  position: 'relative',
                  width: 90,
                  height: 90
                }}
              >
                <svg width="90" height="90">
                  <circle
                    cx="45"
                    cy="45"
                    r="35"
                    fill="none"
                    stroke="var(--slate-200)"
                    strokeWidth="10"
                  />

                  <circle
                    cx="45"
                    cy="45"
                    r="35"
                    fill="none"
                    stroke="var(--green-500)"
                    strokeWidth="10"
                    strokeDasharray="220"
                    strokeDashoffset="18"
                    transform="rotate(-90 45 45)"
                    strokeLinecap="round"
                  />
                </svg>

                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: 18
                  }}
                >
                  92%
                </div>
              </div>

              <div>
                <p style={{ color: 'var(--slate-500)' }}>
                  Adherence Rate
                </p>

                <Badge variant="success">
                  Excellent
                </Badge>
              </div>
            </div>
          </Card>

          <Card>
            <p
              style={{
                color: 'var(--slate-500)',
                fontSize: 13
              }}
            >
              Inventory Alerts
            </p>

            <div
              style={{
                marginTop: 8,
                display: 'flex',
                flexDirection: 'column',
                gap: 4
              }}
            >
              <Badge variant="warning">
                Dipirona - 3 units
              </Badge>

              <Badge variant="warning">
                Amoxicillin - 2 units
              </Badge>
            </div>
          </Card>

          <Card>
            <SectionHeader title="Medication Timeline" />

            <div
              style={{
                padding: '30px 10px'
              }}
            >
              <div
                style={{
                  position: 'relative',
                  height: 80
                }}
              >
                {/* Linha principal */}
                <div
                  style={{
                    position: 'absolute',
                    top: 35,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: 'var(--slate-200)',
                    borderRadius: 999
                  }}
                />

                {[
                  {
                    name: 'Dipirona',
                    hour: 8
                  },
                  {
                    name: 'Amoxicillin',
                    hour: 13
                  },
                  {
                    name: 'Vitamin D',
                    hour: 20
                  }
                ].map((med) => (
                  <div
                    key={med.name}
                    style={{
                      position: 'absolute',
                      left: `${(med.hour / 23) * 100}%`,
                      top: 0,
                      transform: 'translateX(-50%)',
                      textAlign: 'center'
                    }}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        marginBottom: 6,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {med.name}
                    </div>

                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        background: 'var(--blue-500)',
                        margin: '0 auto'
                      }}
                    />

                    <div
                      style={{
                        marginTop: 8,
                        fontSize: 12,
                        fontWeight: 600
                      }}
                    >
                      {String(med.hour).padStart(2, '0')}:00
                    </div>
                  </div>
                ))}
              </div>

              {/* Escala de horas */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: 25,
                  fontSize: 11,
                  color: 'var(--slate-500)'
                }}
              >
                <span>00:00</span>
                <span>04:00</span>
                <span>08:00</span>
                <span>12:00</span>
                <span>16:00</span>
                <span>20:00</span>
                <span>23:00</span>
              </div>
            </div>
          </Card>
          </div>

          
        {/* MEDICAMENTOS */}
        <Card>
          <SectionHeader title="Today's Schedule" />

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12
            }}
          >
            <div className={s.toggleRow}>
              <span style={{ fontSize: 22 }}>💊</span>

              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700 }}>
                  Dipirona
                </p>

                <p
                  style={{
                    color: 'var(--slate-500)',
                    fontSize: 13
                  }}
                >
                  08:00 AM
                </p>
              </div>

              <Badge variant="success">
                Done
              </Badge>
            </div>

            <div className={s.toggleRow}>
              <span style={{ fontSize: 22 }}>💊</span>

              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700 }}>
                  Amoxicillin
                </p>

                <p
                  style={{
                    color: 'var(--slate-500)',
                    fontSize: 13
                  }}
                >
                  01:00 PM
                </p>
              </div>

              <Badge variant="warning">
                Pending
              </Badge>
            </div>

            <div className={s.toggleRow}>
              <span style={{ fontSize: 22 }}>💊</span>

              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700 }}>
                  Vitamin D
                </p>

                <p
                  style={{
                    color: 'var(--slate-500)',
                    fontSize: 13
                  }}
                >
                  08:00 PM
                </p>
              </div>

              <Badge variant="warning">
                Pending
              </Badge>
            </div>
          </div>
        </Card>

        {/* LEMBRETE */}
        <Card>
          <SectionHeader title="Upcoming Reminder" />

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <p
                style={{
                  fontWeight: 700
                }}
              >
                Dipirona
              </p>

              <p
                style={{
                  color: 'var(--slate-500)'
                }}
              >
                Next dose at 08:00 AM
              </p>
            </div>

            <Button size="sm">
              View
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}