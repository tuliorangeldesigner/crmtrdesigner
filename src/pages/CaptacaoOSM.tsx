import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { Search, MapPinned, Building2, Globe, Instagram, MessageCircle, Save, Send, Filter } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { LeadStatusPipeline } from '@/types'

type CaptacaoNicho = 'restaurante' | 'clinica' | 'salao' | 'academia' | 'autoescola' | 'petshop'

type OSMLead = {
    id: string
    nome: string
    nicho: string
    cidade: string
    endereco: string
    website: string
    instagram: string
    whatsapp: string
    contatoPrincipal: string
    mensagem: string
    observacoes: string
}

type DuplicateState = 'checking' | 'duplicate' | 'new'

const NICHO_QUERY: Record<CaptacaoNicho, string[]> = {
    restaurante: ['amenity=restaurant', 'amenity=fast_food', 'shop=bakery'],
    clinica: ['amenity=clinic', 'amenity=doctors', 'healthcare=clinic'],
    salao: ['shop=hairdresser', 'shop=beauty'],
    academia: ['leisure=fitness_centre', 'sport=fitness'],
    autoescola: ['amenity=driving_school'],
    petshop: ['shop=pet', 'amenity=veterinary'],
}

const MENSAGENS_NICHO: Record<CaptacaoNicho, string> = {
    restaurante: 'Oi! Vi o perfil da empresa e notei potencial para aumentar reservas e pedidos com uma identidade visual mais forte e campanhas locais. Posso te mostrar um plano simples para transformar isso em movimento real ainda este mes.',
    clinica: 'Oi! Analisei sua presenca digital e percebi pontos para gerar mais confianca e autoridade no atendimento. Tenho uma proposta objetiva para melhorar identidade visual e converter mais agendamentos com previsibilidade.',
    salao: 'Oi! Encontrei seu negocio e vi uma oportunidade clara de valorizar a marca para atrair clientes premium. Posso te enviar uma ideia rapida de como melhorar identidade visual e conteudo para lotar agenda.',
    academia: 'Oi! Vi sua academia e existe uma chance grande de captar mais alunos com posicionamento visual e comunicacao orientada a resultado. Tenho uma sugestao pratica para fortalecer marca e acelerar matriculas.',
    autoescola: 'Oi! Vi sua autoescola e percebi espaco para comunicar mais seguranca e confianca, o que impacta diretamente em novas matriculas. Posso te apresentar uma proposta curta para melhorar identidade visual e conversao.',
    petshop: 'Oi! Vi seu negocio e acredito que uma marca mais clara e emocional pode aumentar recompra e atrair novos tutores. Tenho uma solucao direta para melhorar identidade visual e gerar mais pedidos recorrentes.',
}

const PIPELINE_OPTIONS: LeadStatusPipeline[] = [
    'Contatado',
    'Respondeu',
    'Interessado',
    'Em negociação',
    'Fechado',
    'Perdido',
]

function normalizeInstagram(raw: string | null | undefined) {
    if (!raw) return ''
    if (raw.includes('instagram.com')) return raw
    return `https://instagram.com/${raw.replace('@', '').trim()}`
}

function normalizeWebsite(raw: string | null | undefined) {
    if (!raw) return ''
    if (raw.startsWith('http://') || raw.startsWith('https://')) return raw
    return `https://${raw}`
}

function normalizeWhatsApp(raw: string | null | undefined) {
    if (!raw) return ''
    const cleaned = raw.replace(/[^\d]/g, '')
    if (!cleaned) return ''
    return `https://wa.me/${cleaned}`
}

export default function CaptacaoOSM() {
    const { user } = useAuth()
    const navigate = useNavigate()

    const [cidade, setCidade] = useState('Sao Paulo')
    const [nicho, setNicho] = useState<CaptacaoNicho>('restaurante')
    const [raioKm, setRaioKm] = useState('6')
    const [maxResultados, setMaxResultados] = useState('40')
    const [loadingBusca, setLoadingBusca] = useState(false)
    const [loadingSalvar, setLoadingSalvar] = useState<string | null>(null)
    const [leads, setLeads] = useState<OSMLead[]>([])
    const [savedIds, setSavedIds] = useState<Record<string, boolean>>({})
    const [statusEntrada, setStatusEntrada] = useState<LeadStatusPipeline>('Contatado')
    const [duplicateMap, setDuplicateMap] = useState<Record<string, DuplicateState>>({})

    const filtrosAtivos = useMemo(() => [
        'Somente leads com site',
        'Somente leads com instagram',
        'Somente leads com WhatsApp',
        'Sem contato vazio',
    ], [])

    const buscarLeads = async () => {
        if (!cidade.trim()) {
            toast.error('Informe uma cidade para iniciar a captacao.')
            return
        }

        setLoadingBusca(true)
        setLeads([])
        setDuplicateMap({})

        try {
            const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cidade + ', Brasil')}&limit=1`
            const geoRes = await fetch(geoUrl)
            const geoData = await geoRes.json()

            if (!Array.isArray(geoData) || geoData.length === 0) {
                toast.error('Cidade nao encontrada no OpenStreetMap.')
                return
            }

            const lat = Number(geoData[0].lat)
            const lon = Number(geoData[0].lon)
            const radiusMeters = Math.max(1000, Number(raioKm || '6') * 1000)
            const limit = Math.min(100, Math.max(10, Number(maxResultados || '40')))
            const tags = NICHO_QUERY[nicho]

            const overpassParts = tags.map((tag) => {
                const [k, v] = tag.split('=')
                return `node["${k}"="${v}"](around:${radiusMeters},${lat},${lon});way["${k}"="${v}"](around:${radiusMeters},${lat},${lon});relation["${k}"="${v}"](around:${radiusMeters},${lat},${lon});`
            }).join('\n')

            const query = `[out:json][timeout:40];(\n${overpassParts}\n);out tags center ${limit};`

            const overpassRes = await fetch('https://overpass-api.de/api/interpreter', {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
                body: query,
            })

            const overpassData = await overpassRes.json()
            const elements = Array.isArray(overpassData?.elements) ? overpassData.elements : []

            const parsed: OSMLead[] = elements.map((el: any) => {
                const tags = el.tags || {}
                const nome = String(tags.name || '').trim()
                const website = normalizeWebsite(tags.website || tags['contact:website'])
                const instagram = normalizeInstagram(tags['contact:instagram'] || tags.instagram)
                const whatsapp = normalizeWhatsApp(tags['contact:whatsapp'] || tags.whatsapp || tags.phone || tags['contact:phone'])
                const contatoPrincipal = whatsapp || instagram || website
                const endereco = [tags['addr:street'], tags['addr:housenumber'], tags['addr:suburb']].filter(Boolean).join(', ') || cidade

                return {
                    id: `${el.type}-${el.id}`,
                    nome,
                    nicho,
                    cidade,
                    endereco,
                    website,
                    instagram,
                    whatsapp,
                    contatoPrincipal,
                    mensagem: MENSAGENS_NICHO[nicho],
                    observacoes: `Lead captado automaticamente via OpenStreetMap. Endereco: ${endereco}. Site: ${website}. Instagram: ${instagram}. WhatsApp: ${whatsapp}.`,
                }
            })
                .filter((item: OSMLead) => item.nome)
                .filter((item: OSMLead) => !!item.website && !!item.instagram && !!item.whatsapp && !!item.contatoPrincipal)
                .slice(0, limit)

            setLeads(parsed)
            setDuplicateMap(Object.fromEntries(parsed.map((lead) => [lead.id, 'checking' as DuplicateState])))
            await verificarDuplicados(parsed)
            toast.success(`${parsed.length} leads qualificados encontrados.`)
        } catch (error) {
            console.error(error)
            toast.error('Falha ao consultar OpenStreetMap/Overpass.')
        } finally {
            setLoadingBusca(false)
        }
    }

    const verificarDuplicados = async (captados: OSMLead[]) => {
        if (captados.length === 0) return

        try {
            const contatos = Array.from(new Set(captados.map((l) => l.contatoPrincipal.trim()).filter(Boolean)))
            const empresas = Array.from(new Set(captados.map((l) => l.nome.trim()).filter(Boolean)))

            const [contactResp, companyResp] = await Promise.all([
                contatos.length > 0
                    ? supabase.from('leads').select('contato').in('contato', contatos)
                    : Promise.resolve({ data: [], error: null } as any),
                empresas.length > 0
                    ? supabase.from('leads').select('nome_empresa')
                    : Promise.resolve({ data: [], error: null } as any),
            ])

            if (contactResp.error) throw contactResp.error
            if (companyResp.error) throw companyResp.error

            const contatosExistentes = new Set((contactResp.data || []).map((item: any) => String(item.contato || '').trim()).filter(Boolean))
            const empresasExistentes = new Set((companyResp.data || []).map((item: any) => String(item.nome_empresa || '').trim().toLowerCase()).filter(Boolean))

            const nextMap: Record<string, DuplicateState> = {}
            captados.forEach((lead) => {
                const dupByContato = contatosExistentes.has(lead.contatoPrincipal.trim())
                const dupByEmpresa = empresasExistentes.has(lead.nome.trim().toLowerCase())
                nextMap[lead.id] = dupByContato || dupByEmpresa ? 'duplicate' : 'new'
            })

            setDuplicateMap(nextMap)
        } catch (error) {
            console.error(error)
            const fallback: Record<string, DuplicateState> = {}
            captados.forEach((lead) => { fallback[lead.id] = 'new' })
            setDuplicateMap(fallback)
            toast.error('Nao foi possivel validar duplicados previamente.')
        }
    }

    const leadDuplicado = async (lead: OSMLead) => {
        const contato = lead.contatoPrincipal.trim()
        const empresa = lead.nome.trim()

        if (contato) {
            const { data: sameContact, error: contactError } = await supabase
                .from('leads')
                .select('id')
                .eq('contato', contato)
                .limit(1)

            if (contactError) throw contactError
            if (sameContact && sameContact.length > 0) return true
        }

        if (empresa) {
            const { data: sameCompany, error: companyError } = await supabase
                .from('leads')
                .select('id')
                .ilike('nome_empresa', empresa)
                .limit(1)

            if (companyError) throw companyError
            if (sameCompany && sameCompany.length > 0) return true
        }

        return false
    }

    const salvarLead = async (lead: OSMLead, irKanban = false) => {
        if (!user) return false

        setLoadingSalvar(lead.id)
        try {
            const duplicado = await leadDuplicado(lead)
            if (duplicado) {
                toast.error(`Lead ${lead.nome} ja existe no CRM (contato ou empresa).`)
                setSavedIds((prev) => ({ ...prev, [lead.id]: true }))
                return false
            }

            const { error } = await supabase.from('leads').insert({
                nome_cliente: lead.nome,
                nome_empresa: lead.nome,
                nicho: lead.nicho,
                contato: lead.contatoPrincipal,
                origem: 'OpenStreetMap',
                observacoes: `${lead.observacoes}\n\nMensagem sugerida:\n${lead.mensagem}`,
                valor_servico: 0,
                tipo_servico: 'Identidade Visual',
                status_pipeline: statusEntrada,
                status_pagamento: 'Pendente',
                prioridade: 'Alta',
                owner_id: user.id,
            })

            if (error) throw error

            setSavedIds((prev) => ({ ...prev, [lead.id]: true }))
            toast.success(`Lead ${lead.nome} salvo com sucesso.`)

            if (irKanban) {
                navigate('/kanban')
            }
            return true
        } catch (error: any) {
            if (error?.code === '23505') {
                toast.error('Esse lead ja existe no CRM.')
            } else {
                toast.error('Nao foi possivel salvar este lead.')
            }
            return false
        } finally {
            setLoadingSalvar(null)
        }
    }

    const salvarTodos = async () => {
        const pendentes = leads.filter((lead) => !savedIds[lead.id])
        if (pendentes.length === 0) {
            toast.message('Nao ha novos leads para salvar.')
            return
        }

        let salvos = 0
        for (const lead of pendentes) {
            // eslint-disable-next-line no-await-in-loop
            const created = await salvarLead(lead, false)
            if (created) salvos += 1
        }

        toast.success(`Processo concluido. ${salvos} leads processados para entrada em "${statusEntrada}".`)
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Captacao Automatica de Leads (OpenStreetMap)</h1>
                    <p className="text-muted-foreground text-sm mt-1">Pagina exclusiva do administrador para captar, qualificar e enviar leads para o funil.</p>
                </div>
                <div className="flex gap-2">
                    <div className="w-[220px]">
                        <Select value={statusEntrada} onValueChange={(v) => setStatusEntrada(v as LeadStatusPipeline)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Etapa de entrada" />
                            </SelectTrigger>
                            <SelectContent>
                                {PIPELINE_OPTIONS.map((status) => (
                                    <SelectItem key={status} value={status}>{status}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button variant="outline" onClick={() => navigate('/kanban')}>
                        <Send className="w-4 h-4" />
                        Ir para Kanban
                    </Button>
                    <Button onClick={salvarTodos} disabled={leads.length === 0}>
                        <Save className="w-4 h-4" />
                        Salvar todos
                    </Button>
                </div>
            </div>

            <Card className="border-border">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg"><Filter className="w-4 h-4" /> Parametros de Captacao</CardTitle>
                    <CardDescription>Use nicho + cidade para buscar estabelecimentos com contato valido e alta chance de conversao.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                    <div className="space-y-2">
                        <Label>Cidade</Label>
                        <Input value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Ex: Sao Paulo" />
                    </div>
                    <div className="space-y-2">
                        <Label>Nicho</Label>
                        <Select value={nicho} onValueChange={(v) => setNicho(v as CaptacaoNicho)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="restaurante">Restaurante</SelectItem>
                                <SelectItem value="clinica">Clinica</SelectItem>
                                <SelectItem value="salao">Salao</SelectItem>
                                <SelectItem value="academia">Academia</SelectItem>
                                <SelectItem value="autoescola">Autoescola</SelectItem>
                                <SelectItem value="petshop">Pet Shop</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Raio (km)</Label>
                        <Input type="number" min="1" max="40" value={raioKm} onChange={(e) => setRaioKm(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Maximo de leads</Label>
                        <Input type="number" min="10" max="100" value={maxResultados} onChange={(e) => setMaxResultados(e.target.value)} />
                    </div>
                    <div className="flex items-end">
                        <Button onClick={buscarLeads} disabled={loadingBusca} className="w-full">
                            <Search className="w-4 h-4" />
                            {loadingBusca ? 'Buscando...' : 'Buscar leads'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Qualificacao obrigatoria</CardTitle>
                    <CardDescription>Somente leads com todos os canais essenciais entram no resultado.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                    {filtrosAtivos.map((f) => (
                        <Badge key={f} variant="outline" className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400">{f}</Badge>
                    ))}
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {leads.map((lead) => {
                    const isSaved = !!savedIds[lead.id]
                    const duplicateState = duplicateMap[lead.id] || 'checking'
                    const isDuplicate = duplicateState === 'duplicate'
                    return (
                        <Card key={lead.id} className="border-border/50">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-primary" />
                                    {lead.nome}
                                </CardTitle>
                                <CardDescription className="flex items-center gap-2"><MapPinned className="w-3.5 h-3.5" /> {lead.endereco}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Badge
                                        variant="outline"
                                        className={
                                            duplicateState === 'checking'
                                                ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                                                : isDuplicate
                                                    ? 'border-red-500/30 bg-red-500/10 text-red-400'
                                                    : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                                        }
                                    >
                                        {duplicateState === 'checking' ? 'Verificando duplicidade' : isDuplicate ? 'Duplicado detectado' : 'Lead novo'}
                                    </Badge>
                                </div>

                                <div className="text-xs grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    <a href={lead.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-400 hover:text-blue-300"><Globe className="w-3.5 h-3.5" /> Site</a>
                                    <a href={lead.instagram} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-pink-400 hover:text-pink-300"><Instagram className="w-3.5 h-3.5" /> Instagram</a>
                                    <a href={lead.whatsapp} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300"><MessageCircle className="w-3.5 h-3.5" /> WhatsApp</a>
                                </div>

                                <div className="rounded-lg border border-border/50 p-3 bg-background/70">
                                    <p className="text-xs font-semibold mb-1">Mensagem automatica sugerida</p>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{lead.mensagem}</p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <Button size="sm" onClick={() => salvarLead(lead, false)} disabled={isSaved || loadingSalvar === lead.id || isDuplicate}>
                                        <Save className="w-3.5 h-3.5" />
                                        {isDuplicate ? 'Duplicado' : isSaved ? 'Salvo' : 'Salvar lead'}
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => salvarLead(lead, true)} disabled={isSaved || loadingSalvar === lead.id || isDuplicate}>
                                        <Send className="w-3.5 h-3.5" />
                                        Salvar e levar ao Kanban
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {!loadingBusca && leads.length === 0 && (
                <Card className="border-dashed">
                    <CardContent className="py-10 text-center text-muted-foreground text-sm">
                        Nenhum lead qualificado carregado ainda. Defina os parametros e clique em "Buscar leads".
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

