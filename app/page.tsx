"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Users, Activity } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Lead } from "@/lib/types"

type DashboardStats = {
  aliveAiTotal: number
  aliveAiMonthly: number
  zellgoTotal: number
  zellgoMonthly: number
  totalLeads: number
  recentLeads: Lead[]
}

export default function Home() {
  const [stats, setStats] = useState<DashboardStats>({
    aliveAiTotal: 0,
    aliveAiMonthly: 0,
    zellgoTotal: 0,
    zellgoMonthly: 0,
    totalLeads: 0,
    recentLeads: []
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

          const aliveAiTotal = aliveAiLeads.reduce((sum, l) => sum + (l.ticket_total_rs || 0), 0)
          const aliveAiMonthly = aliveAiLeads.reduce((sum, l) => sum + (l.ticket_mensal_rs || 0), 0)

          const zellgoTotal = zellgoLeads.reduce((sum, l) => sum + (l.ticket_total_rs || 0), 0)
          const zellgoMonthly = zellgoLeads.reduce((sum, l) => sum + (l.ticket_mensal_rs || 0), 0)

          setStats({
            aliveAiTotal,
            aliveAiMonthly,
            zellgoTotal,
            zellgoMonthly,
            totalLeads: leads.length,
            recentLeads: leads.slice(0, 5)
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

        {/* Conversion Stats (Partial) */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Conversão</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Dados insuficientes</p>
          </CardContent>
        </Card>
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
