export type Lead = {
    id: string
    created_at: string
    contato_principal?: string
    empresa: string
    status: "New" | "Contacted" | "Qualified" | "Proposal" | "Won" | "Lost"
    ticket_total_rs?: number
    ticket_mensal_rs?: number
    origem?: "AliveAI" | "Zellgo"
    avatar_url?: string
    produto_oferta?: string
    mes_competencia?: string // Date string
    obs?: string
}
