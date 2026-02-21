"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Users, Activity } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Lead } from "@/lib/types"

/* Helper to get next 3 months */
function getNextThreeMonths() {
  const months = []
  const today = new Date()

  for (let i = 0; i < 3; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() + i, 1)
    const label = d.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })
    // Key format: YYYY-MM-DD (we only care about YYYY-MM match)
    // Actually, mes_competencia is likely YYYY-MM-DD. 
    // We'll match based on substring(0, 7) assuming ISO string or similar 
    // However, typical input type='date' values are YYYY-MM-DD.
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const key = `${year}-${month}`

    months.push({ label, key, year, month })
  }
  return months
}

type MonthlyProjection = {
  label: string
  key: string
  totalOneTime: number
  totalRecurring: number
}

type DashboardStats = {
  aliveAiTotal: number
  aliveAiMonthly: number
  zellgoTotal: number
  zellgoMonthly: number
  totalLeads: number
  recentLeads: Lead[]
  projectionsAliveAi: MonthlyProjection[]
  projectionsZellgo: MonthlyProjection[]
  conversionRate: number
}

export default function Home() {
  const [stats, setStats] = useState<DashboardStats>({
    aliveAiTotal: 0,
    aliveAiMonthly: 0,
    zellgoTotal: 0,
    zellgoMonthly: 0,
    totalLeads: 0,
    recentLeads: [],
    projectionsAliveAi: [],
    projectionsZellgo: [],
    conversionRate: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const { data: leads, error } = await supabase
          .from('leads')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error

        if (leads) {
          const aliveAiLeads = leads.filter(l => l.origem === 'AliveAI')
          const zellgoLeads = leads.filter(l => l.origem === 'Zellgo')

          // --- Projection Logic ---
          const next3Months = getNextThreeMonths()

          const calculateProjections = (sourceLeads: Lead[]) => {
            // Exclude "Lost" leads from projections
            const activeLeads = sourceLeads.filter(l => l.status !== 'Lost')

            return next3Months.map(m => {
              const monthLeads = activeLeads.filter(l => {
                if (!l.mes_competencia) return false
                return l.mes_competencia.startsWith(m.key)
              })

              const totalOneTime = monthLeads.reduce((sum, l) => sum + (l.ticket_total_rs || 0), 0)
              const totalRecurring = monthLeads.reduce((sum, l) => sum + (l.ticket_mensal_rs || 0), 0)

              return {
                label: m.label,
                key: m.key,
                totalOneTime,
                totalRecurring
              }
            })
          }

          const projectionsAliveAi = calculateProjections(aliveAiLeads)
          const projectionsZellgo = calculateProjections(zellgoLeads)

          // Revenue metrics only for "Won" leads
          const wonLeads = leads.filter(l => l.status === 'Won')
          const wonAliveAi = wonLeads.filter(l => l.origem === 'AliveAI')
          const wonZellgo = wonLeads.filter(l => l.origem === 'Zellgo')

          const aliveAiTotal = wonAliveAi.reduce((sum, l) => sum + (l.ticket_total_rs || 0), 0)
          const aliveAiMonthly = wonAliveAi.reduce((sum, l) => sum + (l.ticket_mensal_rs || 0), 0)

          const zellgoTotal = wonZellgo.reduce((sum, l) => sum + (l.ticket_total_rs || 0), 0)
          const zellgoMonthly = wonZellgo.reduce((sum, l) => sum + (l.ticket_mensal_rs || 0), 0)

          // Conversion Rate: (Won Leads / Total Leads excluding Lost?) 
          // Let's use Won / Total as a simple metric, or Won / (Total - New if they are just incoming)
          // Simple: Won / Total
          const conversionRate = leads.length > 0 ? (wonLeads.length / leads.length) * 100 : 0

          setStats({
            aliveAiTotal,
            aliveAiMonthly,
            zellgoTotal,
            zellgoMonthly,
            totalLeads: leads.length,
            recentLeads: leads.slice(0, 5),
            projectionsAliveAi,
            projectionsZellgo,
            conversionRate
          })
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* AliveAI - Faturamento Total */}
        <Card className="border-t-4 border-t-blue-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Faturamento Total AliveAI</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {loading ? "..." : formatCurrency(stats.aliveAiTotal)}
            </div>
            <p className="text-xs text-muted-foreground">Soma de todos os contratos</p>
          </CardContent>
        </Card>

        {/* AliveAI - Mensal */}
        <Card className="border-t-4 border-t-blue-400 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Receita Mensal AliveAI</CardTitle>
            <Activity className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {loading ? "..." : formatCurrency(stats.aliveAiMonthly)}
            </div>
            <p className="text-xs text-muted-foreground">Valor recorrente mensal</p>
          </CardContent>
        </Card>

        {/* General Stats - Leads */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.totalLeads}</div>
            <p className="text-xs text-muted-foreground">Leads cadastrados</p>
          </CardContent>
        </Card>

        {/* Zellgo - Faturamento Total */}
        <Card className="border-t-4 border-t-green-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Faturamento Total Zellgo</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {loading ? "..." : formatCurrency(stats.zellgoTotal)}
            </div>
            <p className="text-xs text-muted-foreground">Soma de todos os contratos</p>
          </CardContent>
        </Card>

        {/* Zellgo - Mensal */}
        <Card className="border-t-4 border-t-green-400 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Receita Mensal Zellgo</CardTitle>
            <Activity className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {loading ? "..." : formatCurrency(stats.zellgoMonthly)}
            </div>
            <p className="text-xs text-muted-foreground">Valor recorrente mensal</p>
          </CardContent>
        </Card>

        {/* Conversion Stats */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Conversão</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : `${stats.conversionRate.toFixed(1)}%`}
            </div>
            <p className="text-xs text-muted-foreground">Percentual de leads convertidos (WON)</p>
          </CardContent>
        </Card>
      </div>

      {/* Provisão de Receita AliveAI */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <span className="w-2 h-6 bg-blue-500 rounded-full inline-block"></span>
          Provisão de Receita AliveAI
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {stats.projectionsAliveAi.map((proj, idx) => (
            <Card key={idx} className="border-t-4 border-t-blue-500 shadow-sm bg-slate-50/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground capitalize">
                  {proj.label}
                </CardTitle>
                <DollarSign className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="flex justify-between items-end">
                    <span className="text-xs text-muted-foreground">Pontual</span>
                    <span className="text-lg font-bold text-blue-700">
                      {loading ? "..." : formatCurrency(proj.totalOneTime)}
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-xs text-muted-foreground">Recorrente (Novo)</span>
                    <span className="text-lg font-bold text-blue-600">
                      {loading ? "..." : formatCurrency(proj.totalRecurring)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Provisão de Receita Zellgo */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <span className="w-2 h-6 bg-green-500 rounded-full inline-block"></span>
          Provisão de Receita Zellgo
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {stats.projectionsZellgo.map((proj, idx) => (
            <Card key={idx} className="border-t-4 border-t-green-500 shadow-sm bg-slate-50/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground capitalize">
                  {proj.label}
                </CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="flex justify-between items-end">
                    <span className="text-xs text-muted-foreground">Pontual</span>
                    <span className="text-lg font-bold text-green-700">
                      {loading ? "..." : formatCurrency(proj.totalOneTime)}
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-xs text-muted-foreground">Recorrente (Novo)</span>
                    <span className="text-lg font-bold text-green-600">
                      {loading ? "..." : formatCurrency(proj.totalRecurring)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>


      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Visão Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center text-muted-foreground bg-slate-50 rounded-md border border-dashed">
              Gráfico de Desempenho (Em breve)
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <p>Carregando...</p>
              ) : stats.recentLeads.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma atividade recente.</p>
              ) : (
                stats.recentLeads.map((lead) => (
                  <div key={lead.id} className="flex items-center">
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        Novo lead {lead.origem}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {lead.empresa} - {lead.contato_principal}
                      </p>
                    </div>
                    <div className={`ml-auto font-medium ${lead.origem === 'AliveAI' ? 'text-blue-600' : 'text-green-600'}`}>
                      +{formatCurrency(lead.ticket_total_rs || 0)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

