'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, type License } from '@/lib/supabase'
import {
  Zap, Key, Users, CheckCircle, XCircle, RefreshCw,
  Plus, Search, LogOut, Copy, Trash2, RotateCcw, Shield
} from 'lucide-react'

function generateKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const seg = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `FLASH-${seg()}-${seg()}-${seg()}`
}

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { color: string; label: string }> = {
    active: { color: 'bg-green-500/15 text-green-400 border-green-500/30', label: 'Ativa' },
    revoked: { color: 'bg-red-500/15 text-red-400 border-red-500/30', label: 'Revogada' },
    inactive: { color: 'bg-slate-500/15 text-slate-400 border-slate-500/30', label: 'Inativa' },
  }
  const c = cfg[status] ?? cfg.inactive
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${c.color}`}>{c.label}</span>
  )
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  return (
    <div className="bg-[#1a1a2e] border border-white/10 rounded-xl p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-slate-400 text-xs font-medium">{label}</p>
        <p className="text-white text-2xl font-bold">{value}</p>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const [licenses, setLicenses] = useState<License[]>([])
  const [filtered, setFiltered] = useState<License[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'all' | 'active' | 'revoked'>('all')
  const [generating, setGenerating] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [showGenModal, setShowGenModal] = useState(false)
  const [toast, setToast] = useState('')

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const loadLicenses = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('licenses').select('*').order('created_at', { ascending: false })
    if (data) { setLicenses(data); setFiltered(data) }
    setLoading(false)
  }, [])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/')
      else loadLicenses()
    })
  }, [router, loadLicenses])

  useEffect(() => {
    let list = licenses
    if (tab !== 'all') list = list.filter(l => l.status === tab)
    if (search) list = list.filter(l =>
      l.license_key.toLowerCase().includes(search.toLowerCase()) ||
      (l.email ?? '').toLowerCase().includes(search.toLowerCase())
    )
    setFiltered(list)
  }, [search, tab, licenses])

  async function handleRevoke(id: string) {
    await supabase.from('licenses').update({ status: 'revoked' }).eq('id', id)
    showToast('Licença revogada.')
    loadLicenses()
  }

  async function handleActivate(id: string) {
    await supabase.from('licenses').update({ status: 'active' }).eq('id', id)
    showToast('Licença reativada.')
    loadLicenses()
  }

  async function handleReset(id: string) {
    await supabase.from('licenses').update({ hardware_id: null, activated_at: null }).eq('id', id)
    showToast('Hardware ID resetado — chave pronta para reativar.')
    loadLicenses()
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir esta licença permanentemente?')) return
    await supabase.from('licenses').delete().eq('id', id)
    showToast('Licença excluída.')
    loadLicenses()
  }

  async function handleGenerate() {
    if (!newEmail.trim()) return
    setGenerating(true)
    const key = generateKey()
    const emailToUse = newEmail.trim()
    const { error } = await supabase.from('licenses').insert({ license_key: key, email: emailToUse, status: 'active' })
    if (error) { 
      showToast('Erro ao gerar licença: ' + error.message) 
    } else {
      // Enviar E-mail
      showToast(`Licença gerada. Enviando e-mail...`)
      try {
        const res = await fetch('/api/send-license', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: emailToUse, licenseKey: key }),
        });
        const json = await res.json();
        
        if (!res.ok) throw new Error(json.error || 'Erro ao enviar e-mail');
        showToast(`Licença enviada para ${emailToUse}`);
      } catch (err: any) {
        console.error(err);
        showToast(`Licença salva, mas falhou ao enviar e-mail: ${err.message}`);
      }

      setShowGenModal(false)
      setNewEmail('')
      loadLicenses()
    }
    setGenerating(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  function copyKey(key: string) {
    navigator.clipboard.writeText(key)
    showToast('Chave copiada!')
  }

  const stats = {
    total: licenses.length,
    active: licenses.filter(l => l.status === 'active').length,
    activated: licenses.filter(l => l.hardware_id).length,
    revoked: licenses.filter(l => l.status === 'revoked').length,
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a] flex flex-col">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-purple-600 text-white text-sm px-4 py-2 rounded-lg shadow-xl animate-fade-in">
          {toast}
        </div>
      )}

      {/* Generate Modal */}
      {showGenModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <Plus size={18} className="text-purple-400" /> Gerar Nova Licença
            </h3>
            <div className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="email@cliente.com"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                className="bg-[#0f0f1a] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-purple-500 transition-colors"
              />
              <div className="flex gap-2">
                <button onClick={() => setShowGenModal(false)} className="flex-1 py-2.5 text-sm rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 transition-colors">
                  Cancelar
                </button>
                <button onClick={handleGenerate} disabled={generating || !newEmail.trim()} className="flex-1 py-2.5 text-sm rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold transition-colors">
                  {generating ? 'Gerando...' : 'Gerar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-white/10 bg-[#1a1a2e]/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-purple-600/20 rounded-xl flex items-center justify-center border border-purple-500/30">
              <Zap className="text-purple-400" size={18} />
            </div>
            <div>
              <h1 className="text-white font-bold text-base leading-none">FlashFill Admin</h1>
              <p className="text-slate-500 text-xs mt-0.5">Gerenciamento de Licenças</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-green-400 text-xs font-medium">Online</span>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm">
              <LogOut size={15} /> Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 flex-1 w-full">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Key} label="Total" value={stats.total} color="bg-purple-500/20 text-purple-400" />
          <StatCard icon={CheckCircle} label="Ativas" value={stats.active} color="bg-green-500/20 text-green-400" />
          <StatCard icon={Shield} label="Ativadas" value={stats.activated} color="bg-blue-500/20 text-blue-400" />
          <StatCard icon={XCircle} label="Revogadas" value={stats.revoked} color="bg-red-500/20 text-red-400" />
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
            <input
              type="text"
              placeholder="Buscar por chave ou email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-purple-500 transition-colors"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'active', 'revoked'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-3 py-2 text-xs rounded-lg font-medium transition-colors border ${tab === t ? 'bg-purple-600 border-purple-500 text-white' : 'border-white/10 text-slate-400 hover:text-white'}`}>
                {t === 'all' ? 'Todas' : t === 'active' ? 'Ativas' : 'Revogadas'}
              </button>
            ))}
          </div>
          <button onClick={() => loadLicenses()} className="p-2.5 border border-white/10 rounded-xl text-slate-400 hover:text-white transition-colors">
            <RefreshCw size={15} />
          </button>
          <button onClick={() => setShowGenModal(true)}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
            <Plus size={15} /> Nova Licença
          </button>
        </div>

        {/* Table */}
        <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs text-slate-400 uppercase tracking-wide">
                  <th className="text-left px-5 py-3.5 font-medium">Chave</th>
                  <th className="text-left px-5 py-3.5 font-medium">Email</th>
                  <th className="text-left px-5 py-3.5 font-medium">Status</th>
                  <th className="text-left px-5 py-3.5 font-medium">Hardware ID</th>
                  <th className="text-left px-5 py-3.5 font-medium">Ativado em</th>
                  <th className="text-left px-5 py-3.5 font-medium">Criado em</th>
                  <th className="text-right px-5 py-3.5 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={7} className="text-center py-12 text-slate-500">Carregando...</td></tr>
                )}
                {!loading && filtered.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-12 text-slate-500">Nenhuma licença encontrada.</td></tr>
                )}
                {filtered.map((lic, i) => (
                  <tr key={lic.id} className={`border-b border-white/5 hover:bg-white/[0.02] transition-colors ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-purple-300">{lic.license_key}</span>
                        <button onClick={() => copyKey(lic.license_key)} className="text-slate-500 hover:text-slate-300 transition-colors">
                          <Copy size={12} />
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-300 text-xs">{lic.email ?? '—'}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={lic.status} /></td>
                    <td className="px-5 py-3.5 text-slate-400 text-xs font-mono">
                      {lic.hardware_id ? lic.hardware_id.substring(0, 17) : <span className="text-slate-600">—</span>}
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 text-xs">
                      {lic.activated_at ? new Date(lic.activated_at).toLocaleDateString('pt-BR') : <span className="text-slate-600">—</span>}
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 text-xs">
                      {new Date(lic.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        {lic.hardware_id && (
                          <button onClick={() => handleReset(lic.id)} title="Resetar Hardware ID"
                            className="p-1.5 text-slate-500 hover:text-yellow-400 transition-colors rounded-lg hover:bg-yellow-400/10">
                            <RotateCcw size={13} />
                          </button>
                        )}
                        {lic.status === 'active' ? (
                          <button onClick={() => handleRevoke(lic.id)} title="Revogar"
                            className="p-1.5 text-slate-500 hover:text-red-400 transition-colors rounded-lg hover:bg-red-400/10">
                            <XCircle size={13} />
                          </button>
                        ) : (
                          <button onClick={() => handleActivate(lic.id)} title="Reativar"
                            className="p-1.5 text-slate-500 hover:text-green-400 transition-colors rounded-lg hover:bg-green-400/10">
                            <CheckCircle size={13} />
                          </button>
                        )}
                        <button onClick={() => handleDelete(lic.id)} title="Excluir"
                          className="p-1.5 text-slate-500 hover:text-red-500 transition-colors rounded-lg hover:bg-red-500/10">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!loading && (
            <div className="px-5 py-3 border-t border-white/5 text-xs text-slate-500">
              {filtered.length} licença{filtered.length !== 1 ? 's' : ''} exibida{filtered.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
