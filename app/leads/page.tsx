"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"

// Define Lead type based on Supabase screenshot/schema
type Lead = {
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

const STATUS_COLORS = {
    New: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    Contacted: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    Qualified: "bg-purple-100 text-purple-800 hover:bg-purple-100",
    Proposal: "bg-orange-100 text-orange-800 hover:bg-orange-100",
    Won: "bg-green-100 text-green-800 hover:bg-green-100",
    Lost: "bg-gray-100 text-gray-800 hover:bg-gray-100",
}

export default function LeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([])
    const [loading, setLoading] = useState(true)
    const [open, setOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [currentLeadId, setCurrentLeadId] = useState<string | null>(null)

    // Form State
    const [company, setCompany] = useState("")
    const [source, setSource] = useState<"AliveAI" | "Zellgo">("AliveAI")
    const [status, setStatus] = useState<string>("New")
    const [ticketTotal, setTicketTotal] = useState("")
    const [ticketMonthly, setTicketMonthly] = useState("")
    const [contactName, setContactName] = useState("")
    const [product, setProduct] = useState("")
    const [forecastDate, setForecastDate] = useState("")
    const [obs, setObs] = useState("")

    const fetchLeads = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('leads')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Error fetching leads:', error)
            } else if (data) {
                setLeads(data as unknown as Lead[])
            }
        } catch (err) {
            console.error('Exception fetching leads:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchLeads()
    }, [])

    const resetForm = () => {
        setCompany("")
        setSource("AliveAI")
        setStatus("New")
        setTicketTotal("")
        setTicketMonthly("")
        setContactName("")
        setProduct("")
        setForecastDate("")
        setObs("")
        setIsEditing(false)
        setCurrentLeadId(null)
    }

    const handleOpenDialog = (lead?: Lead) => {
        if (lead) {
            setCompany(lead.empresa)
            setSource(lead.origem || "AliveAI")
            setStatus(lead.status)
            setTicketTotal(lead.ticket_total_rs?.toString() || "")
            setTicketMonthly(lead.ticket_mensal_rs?.toString() || "")
            setContactName(lead.contato_principal || "")
            setProduct(lead.produto_oferta || "")
            setForecastDate(lead.mes_competencia || "")
            setObs(lead.obs || "")
            setIsEditing(true)
            setCurrentLeadId(lead.id)
        } else {
            resetForm()
        }
        setOpen(true)
    }

    const handleDelete = async (id: string) => {
        const confirmDelete = window.confirm("Tem certeza que deseja excluir este lead?")
        if (!confirmDelete) return

        try {
            const { error } = await supabase
                .from('leads')
                .delete()
                .eq('id', id)

            if (error) {
                console.error('Error deleting lead:', error)
                alert("Erro ao excluir lead: " + error.message)
            } else {
                setLeads(leads.filter(l => l.id !== id))
            }
        } catch (err) {
            console.error('Exception deleting lead:', err)
        }
    }

    const handleStatusChange = async (leadId: string, newStatus: string) => {
        // Optimistic update
        setLeads(leads.map(lead =>
            lead.id === leadId ? { ...lead, status: newStatus as any } : lead
        ))

        try {
            const { error } = await supabase
                .from('leads')
                .update({ status: newStatus })
                .eq('id', leadId)

            if (error) {
                console.error('Error updating status:', error)
                fetchLeads()
            }
        } catch (err) {
            console.error('Exception updating status:', err)
        }
    }

    const handleSaveLead = async () => {
        if (!company || !ticketTotal || !ticketMonthly) {
            alert("Por favor preencha os campos obrigatórios")
            return
        }

        try {
            const payload = {
                empresa: company,
                origem: source,
                status: status,
                contato_principal: contactName || "Sem Nome",
                ticket_total_rs: parseFloat(ticketTotal),
                ticket_mensal_rs: parseFloat(ticketMonthly),
                produto_oferta: product,
                mes_competencia: forecastDate || null,
                obs: obs,
            }

            let error;
            if (isEditing && currentLeadId) {
                const { error: updateError } = await supabase
                    .from('leads')
                    .update(payload)
                    .eq('id', currentLeadId)
                error = updateError
            } else {
                const { error: insertError } = await supabase
                    .from('leads')
                    .insert([{ ...payload, created_at: new Date().toISOString() }])
                error = insertError
            }

            if (error) {
                console.error('Error saving lead:', error)
                alert("Erro ao salvar lead: " + error.message)
            } else {
                setOpen(false)
                resetForm()
                fetchLeads()
            }
        } catch (err) {
            console.error('Exception saving lead:', err)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Leads</h1>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => handleOpenDialog()}>+ Gerar Lead</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>{isEditing ? "Editar Lead" : "Novo Lead"}</DialogTitle>
                            <DialogDescription>
                                {isEditing ? "Edite os dados do lead abaixo." : "Preencha os dados do novo lead abaixo."}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="company">Empresa *</Label>
                                    <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Contato</Label>
                                    <Input id="name" value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Nome do contato" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="source">Origem</Label>
                                    <Select onValueChange={(val: "AliveAI" | "Zellgo") => setSource(val)} defaultValue={source}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="AliveAI">AliveAI</SelectItem>
                                            <SelectItem value="Zellgo">Zellgo</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select onValueChange={setStatus} defaultValue={status}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.keys(STATUS_COLORS).map(s => (
                                                <SelectItem key={s} value={s}>{s}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="ticketTotal">Ticket Total (R$) *</Label>
                                    <Input id="ticketTotal" type="number" value={ticketTotal} onChange={(e) => setTicketTotal(e.target.value)} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="ticketMonthly">Ticket Mensal (R$) *</Label>
                                    <Input id="ticketMonthly" type="number" value={ticketMonthly} onChange={(e) => setTicketMonthly(e.target.value)} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="product">Produto / Oferta</Label>
                                    <Input id="product" value={product} onChange={(e) => setProduct(e.target.value)} placeholder="Ex: Consultoria IA" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="forecast">Previsão (Mês Comp.)</Label>
                                    <Input id="forecast" type="date" value={forecastDate} onChange={(e) => setForecastDate(e.target.value)} />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="obs">Observações</Label>
                                <Input id="obs" value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Observações adicionais" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" onClick={handleSaveLead}>{isEditing ? "Atualizar" : "Salvar Lead"}</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Lead / Contato</TableHead>
                            <TableHead>Empresa</TableHead>
                            <TableHead>Produto</TableHead>
                            <TableHead>Previsão</TableHead>
                            <TableHead>Origem</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Mensal</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead>Obs.</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {leads.length === 0 && !loading && (
                            <TableRow>
                                <TableCell colSpan={10} className="h-24 text-center">
                                    Nenhum lead encontrado.
                                </TableCell>
                            </TableRow>
                        )}
                        {leads.map((lead) => (
                            <TableRow key={lead.id}>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={lead.avatar_url} />
                                            <AvatarFallback>{(lead.contato_principal || lead.empresa || "?").substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm">{lead.contato_principal || "Sem Nome"}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>{lead.empresa}</TableCell>
                                <TableCell className="text-muted-foreground text-sm">{lead.produto_oferta || "-"}</TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                    {lead.mes_competencia ? new Date(lead.mes_competencia).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }) : "-"}
                                </TableCell>
                                <TableCell>
                                    {lead.origem === 'AliveAI' ? (
                                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">AliveAI</Badge>
                                    ) : lead.origem === 'Zellgo' ? (
                                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Zellgo</Badge>
                                    ) : (
                                        <span className="text-muted-foreground text-xs">{lead.origem || '-'}</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Badge variant="secondary" className={`cursor-pointer ${STATUS_COLORS[lead.status] || ''}`}>
                                                {lead.status}
                                            </Badge>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="start">
                                            {Object.keys(STATUS_COLORS).map((status) => (
                                                <DropdownMenuItem
                                                    key={status}
                                                    onClick={() => handleStatusChange(lead.id, status)}
                                                >
                                                    {status}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                                <TableCell className="text-right">
                                    {lead.ticket_mensal_rs ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lead.ticket_mensal_rs) : '-'}
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                    {lead.ticket_total_rs ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lead.ticket_total_rs) : '-'}
                                </TableCell>
                                <TableCell className="max-w-[150px]">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <span className="truncate block text-muted-foreground text-sm cursor-help">
                                                    {lead.obs || "-"}
                                                </span>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="max-w-[300px] break-words text-sm">{lead.obs || "Sem observações"}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Open menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleOpenDialog(lead)}>
                                                <Pencil className="mr-2 h-4 w-4" />
                                                Editar
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(lead.id)}>
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Excluir
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
