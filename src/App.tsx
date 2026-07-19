import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useScroll, useTransform } from 'motion/react'
import { Link, Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import { ArrowRight, Check, ChevronDown, CircleHelp, Clipboard, Clock3, Copy, ExternalLink, FileCheck2, LayoutDashboard, Link2, LogOut, Menu, Moon, Plus, RefreshCw, ShieldCheck, Sparkles, Sun, WalletCards, X, Zap } from 'lucide-react'
import { formatUnits, isConfigured, USDC_ADDRESS, MOCK_USDC_ADDRESS, publicClient, ESCROW_ADDRESS, RPC_URL, sendTransaction, shortenAddress, toUnits, txUrl, addressUrl, escrowAbi, tokenAbi } from './lib/contract'
import { keccak256, toBytes } from 'viem'
import type { Address } from 'viem'

type Slot = { kol: string; proofUrl: string; note: string; rejectionReason: string; payout: bigint; submittedAt: bigint; status: number; paid: boolean; slotId: number }
type Campaign = { id: number; agency: string; token: string; title: string; brief: string; payout: bigint; maxSlots: bigint; deadline: bigint; reviewTimeout: bigint; funded: bigint; paid: bigint; withdrawn: bigint; joined: bigint; createdAt: bigint; inviteOnly: boolean; inviteCodeHash: string; slots: Slot[] }

const statusNames = ['Open', 'Pending review', 'Approved', 'Rejected', 'Timeout claimed', 'Removed']
const statusClass = ['open', 'pending', 'approved', 'rejected', 'claimed', 'removed']
const fmtDate = (value: bigint) => new Date(Number(value) * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
const isPast = (value: bigint) => Number(value) * 1000 < Date.now()
const genInviteCode = () => { const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; const bytes = crypto.getRandomValues(new Uint8Array(8)); return Array.from(bytes, b => alphabet[b % alphabet.length]).join('') }
type Theme = 'dark' | 'light'
const DISCONNECTED_KEY = 'escrow:wallet-disconnected'

function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => window.localStorage.getItem('escrow-theme') === 'light' ? 'light' : 'dark')
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem('escrow-theme', theme)
  }, [theme])
  const toggleTheme = useCallback(() => setTheme(value => value === 'dark' ? 'light' : 'dark'), [])
  return { theme, toggleTheme }
}

function ThemeToggle({ theme, onToggle }: { theme: Theme; onToggle: () => void }) {
  const isLight = theme === 'light'
  return <button className="theme-toggle" type="button" aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'} aria-pressed={isLight} title={isLight ? 'Switch to dark mode' : 'Switch to light mode'} onClick={onToggle}><span className="theme-toggle-track"><span className="theme-toggle-thumb">{isLight ? <Sun size={13} /> : <Moon size={13} />}</span></span><span className="theme-toggle-label">{isLight ? 'Light' : 'Dark'}</span></button>
}

function useWallet() {
  const [account, setAccount] = useState<Address>()
  const [chainId, setChainId] = useState<number>()
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)
  const [switching, setSwitching] = useState(false)
  const accountRef = useRef<Address | undefined>(undefined)
  const sessionLockRef = useRef(false)
  const navigate = useNavigate()
  const connect = useCallback(async () => {
    try {
      if (!window.ethereum) throw new Error('Install MetaMask or another EVM wallet to connect.')
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) as string[]
      const chain = await window.ethereum.request({ method: 'eth_chainId' }) as string
      if (!accounts[0]) throw new Error('No wallet account was selected.')
      const connectedAccount = accounts[0] as Address
      window.localStorage.removeItem(DISCONNECTED_KEY)
      sessionLockRef.current = false
      accountRef.current = connectedAccount
      setAccount(connectedAccount)
      setChainId(Number.parseInt(chain, 16))
      setError('')
      return connectedAccount
    } catch (err) { setError(err instanceof Error ? err.message : 'Wallet connection failed.'); return undefined }
  }, [])
  const switchNetwork = useCallback(async () => {
    try {
      if (!window.ethereum) throw new Error('Install MetaMask or another EVM wallet to switch networks.')
      setSwitching(true)
      try {
        await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0x279f' }] })
      } catch (err) {
        if ((err as { code?: number }).code !== 4902) throw err
        await window.ethereum.request({ method: 'wallet_addEthereumChain', params: [{ chainId: '0x279f', chainName: 'Monad Testnet', nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 }, rpcUrls: [RPC_URL], blockExplorerUrls: ['https://testnet.monadexplorer.com'] }] })
      }
      setChainId(10143)
      setError('')
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network switch failed.')
      return false
    } finally { setSwitching(false) }
  }, [])
  const disconnect = useCallback(() => {
    window.localStorage.setItem(DISCONNECTED_KEY, '1')
    sessionLockRef.current = true
    accountRef.current = undefined
    setAccount(undefined)
    setError('')
    navigate('/', { replace: true, state: { disconnected: true } })
    void window.ethereum?.request({ method: 'wallet_revokePermissions', params: [{ eth_accounts: {} }] }).catch(() => undefined)
  }, [navigate])
  useEffect(() => {
    if (!window.ethereum) { setReady(true); return }
    const hydrate = async () => {
      try {
        const [accounts, chain] = await Promise.all([window.ethereum!.request({ method: 'eth_accounts' }), window.ethereum!.request({ method: 'eth_chainId' })])
        const nextAccount = Array.isArray(accounts) && accounts[0] ? accounts[0] as Address : undefined
        const manuallyDisconnected = window.localStorage.getItem(DISCONNECTED_KEY) === '1'
        if (sessionLockRef.current) return
        accountRef.current = manuallyDisconnected ? undefined : nextAccount
        setAccount(manuallyDisconnected ? undefined : nextAccount)
        setChainId(Number.parseInt(chain as string, 16))
      } catch { /* Wallet providers can reject hydration while they are starting. */ } finally { setReady(true) }
    }
    void hydrate()
    const handleAccountsChanged = (accounts: unknown) => {
      const nextAccount = Array.isArray(accounts) && accounts[0] ? accounts[0] as Address : undefined
      if (sessionLockRef.current) { setAccount(undefined); return }
      if (window.localStorage.getItem(DISCONNECTED_KEY) === '1') { accountRef.current = undefined; setAccount(undefined); return }
      const previousAccount = accountRef.current
      accountRef.current = nextAccount
      setAccount(nextAccount)
      if (previousAccount && (!nextAccount || nextAccount.toLowerCase() !== previousAccount.toLowerCase())) navigate('/', { replace: true, state: { disconnected: true } })
    }
    const handleChainChanged = (chain: unknown) => setChainId(Number.parseInt(chain as string, 16))
    window.ethereum.on?.('accountsChanged', handleAccountsChanged)
    window.ethereum.on?.('chainChanged', handleChainChanged)
    return () => {
      window.ethereum?.removeListener?.('accountsChanged', handleAccountsChanged)
      window.ethereum?.removeListener?.('chainChanged', handleChainChanged)
    }
  }, [navigate])
  return { account, chainId, connect, disconnect, error, setError, ready, switchNetwork, switching }
}

function useCampaigns(refreshKey: number) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(false)
  const load = useCallback(async () => {
    if (!isConfigured) { setCampaigns([]); return }
    setLoading(true)
    try {
      const count = await publicClient.readContract({ address: ESCROW_ADDRESS, abi: escrowAbi, functionName: 'campaignCount' }) as bigint
      console.log('Fetching campaigns count:', count)
      const next: Campaign[] = []
      for (let id = 0; id < Number(count); id += 1) {
        try {
          const raw = await publicClient.readContract({ address: ESCROW_ADDRESS, abi: escrowAbi, functionName: 'getCampaign', args: [BigInt(id)] }) as { agency: Address; token: Address; title: string; brief: string; payout: bigint; maxSlots: bigint; deadline: bigint; reviewTimeout: bigint; funded: bigint; paid: bigint; withdrawn: bigint; joined: bigint; createdAt: bigint; inviteOnly: boolean; inviteCodeHash: string }
          const slotCount = await publicClient.readContract({ address: ESCROW_ADDRESS, abi: escrowAbi, functionName: 'getSlotCount', args: [BigInt(id)] }) as bigint
          const slots: Slot[] = []
          for (let slotId = 0; slotId < Number(slotCount); slotId += 1) {
            try {
              const slot = await publicClient.readContract({ address: ESCROW_ADDRESS, abi: escrowAbi, functionName: 'getSlot', args: [BigInt(id), BigInt(slotId)] }) as { kol: Address; proofUrl: string; note: string; rejectionReason: string; payout: bigint; submittedAt: bigint; status: number; paid: boolean }
              slots.push({ kol: slot.kol, proofUrl: slot.proofUrl, note: slot.note, rejectionReason: slot.rejectionReason, payout: slot.payout, submittedAt: slot.submittedAt, status: Number(slot.status), paid: slot.paid, slotId })
            } catch (slotErr) {
              console.error(`Error loading slot ${slotId} for campaign ${id}:`, slotErr)
            }
          }
          next.push({ id, agency: raw.agency, token: raw.token, title: raw.title, brief: raw.brief, payout: raw.payout, maxSlots: raw.maxSlots, deadline: raw.deadline, reviewTimeout: raw.reviewTimeout, funded: raw.funded, paid: raw.paid, withdrawn: raw.withdrawn, joined: raw.joined, createdAt: raw.createdAt, inviteOnly: raw.inviteOnly, inviteCodeHash: raw.inviteCodeHash, slots })
        } catch (campErr) {
          console.error(`Error loading campaign ${id}:`, campErr)
        }
      }
      console.log('Loaded campaigns successfully:', next)
      setCampaigns(next.reverse())
    } catch (err) {
      console.error('Failed to load campaigns:', err)
      setCampaigns([])
    } finally {
      setLoading(false)
    }
  }, [refreshKey])
  useEffect(() => {
    void load()
    const interval = setInterval(() => {
      void load()
    }, 12000)
    return () => clearInterval(interval)
  }, [load])
  return { campaigns, loading, reload: load }
}

function Button({ children, variant = 'primary', onClick, to, disabled = false, type = 'button', icon }: { children: React.ReactNode; variant?: 'primary' | 'outline' | 'quiet' | 'danger'; onClick?: () => void; to?: string; disabled?: boolean; type?: 'button' | 'submit'; icon?: React.ReactNode }) {
  const className = `button button-${variant}`
  if (to) return <Link className={className} to={to}>{children}{icon || <ArrowRight size={16} />}</Link>
  return <button className={className} onClick={onClick} disabled={disabled} type={type}>{children}{icon}</button>
}

function WalletConnectModal({ isOpen, onClose, wallet, onSuccess }: { isOpen: boolean; onClose: () => void; wallet: ReturnType<typeof useWallet>; onSuccess: () => void }) {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'success' | 'error'>('idle')
  const connecting = status === 'connecting'
  useEffect(() => { if (isOpen) { setStatus('idle'); wallet.setError('') } }, [isOpen, wallet.setError])
  if (!isOpen) return null
  const handleConnect = async () => {
    setStatus('connecting')
    const account = await wallet.connect()
    if (!account) { setStatus('error'); return }
    setStatus('success')
    window.setTimeout(onSuccess, 550)
  }
  return <div className="wallet-modal-root" role="presentation" onMouseDown={() => { if (!connecting) onClose() }}><motion.div className="wallet-modal" role="dialog" aria-modal="true" aria-labelledby="wallet-modal-title" initial={{ opacity: 0, y: 16, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: .97 }} transition={{ duration: .2, ease: [0.22, 1, 0.36, 1] }} onMouseDown={event => event.stopPropagation()}>
    {!connecting && <button className="modal-close" aria-label="Close wallet connection dialog" onClick={onClose}><X size={18} /></button>}
    <span className="eyebrow">Wallet access</span>
    {status === 'success' ? <><div className="modal-status-icon success"><Check size={22} /></div><h2 id="wallet-modal-title">Wallet connected</h2><p>Opening your settlement workspace.</p></> : <><div className="modal-status-icon"><WalletCards size={22} /></div><h2 id="wallet-modal-title">Connect to Escrow</h2><p>Your wallet is your identity. Connect to create a campaign, claim a KOL slot, or review proof.</p>{status === 'error' && <div className="modal-error"><CircleHelp size={15} />{wallet.error || 'Connection was not completed. Try again.'}</div>}<Button onClick={() => void handleConnect()} disabled={connecting}>{status === 'error' ? 'Try again' : 'Connect wallet'}{status === 'error' ? <RefreshCw size={16} /> : <ArrowRight size={16} />}</Button><span className="modal-note">Monad testnet · no password required</span></>}
    {connecting && <div className="modal-connecting"><RefreshCw size={15} />Waiting for wallet approval</div>}
  </motion.div></div>
}

function WalletDropdown({ account, chainId, switching, onSwitchNetwork, onDisconnect }: { account?: Address; chainId?: number; switching: boolean; onSwitchNetwork: () => Promise<boolean>; onDisconnect: () => void }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const onMonad = chainId === 10143
  useEffect(() => {
    if (!open) return
    const handlePointer = (event: MouseEvent) => { if (!rootRef.current?.contains(event.target as Node)) setOpen(false) }
    const handleKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', handlePointer)
    window.addEventListener('keydown', handleKey)
    return () => { document.removeEventListener('mousedown', handlePointer); window.removeEventListener('keydown', handleKey) }
  }, [open])
  const copyAddress = async () => {
    if (!account) return
    await navigator.clipboard.writeText(account)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }
  if (!account) return null
  return <div className="wallet-menu" ref={rootRef}><button className="wallet-chip" aria-expanded={open} aria-haspopup="true" onClick={() => setOpen(value => !value)}><span className="status-dot" />{shortenAddress(account)}<ChevronDown size={15} className={open ? 'wallet-chevron is-open' : 'wallet-chevron'} /></button><AnimatePresence>{open && <motion.div className="wallet-dropdown" initial={{ opacity: 0, scale: .95, y: -6 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: .95, y: -6 }} transition={{ duration: .18, ease: [0.22, 1, 0.36, 1] }} style={{ transformOrigin: 'top right' }}>
    <div className="wallet-status-head"><span className="status-dot" /><div><strong>Settlement desk active</strong><small>Wallet session</small></div></div>
    <div className="wallet-address-row"><code title={account}>{shortenAddress(account)}</code><button aria-label="Copy wallet address" onClick={() => void copyAddress()}>{copied ? <Check size={15} /> : <Copy size={15} />}</button></div>
    <div className="wallet-network-row"><span>Network</span><strong className={onMonad ? 'green-text' : 'warning-text'}>{onMonad ? 'Monad testnet' : `Chain ${chainId || 'unknown'}`}</strong><span>Status</span><strong className={onMonad ? 'green-text' : 'warning-text'}>{onMonad ? 'Active' : 'Switch required'}</strong></div>
    {!onMonad && <button className="wallet-switch" onClick={() => void onSwitchNetwork()} disabled={switching}>{switching ? 'Switching network…' : 'Switch to Monad testnet'}<ArrowRight size={15} /></button>}
    <button className="wallet-disconnect" onClick={onDisconnect}><LogOut size={15} />Disconnect wallet</button>
  </motion.div>}</AnimatePresence></div>
}

function WalletButton({ account, onConnect }: { account?: Address; onConnect: () => void }) {
  return account ? <span className="wallet-chip"><span className="status-dot" />{shortenAddress(account)}</span> : <Button variant="outline" onClick={onConnect} icon={<WalletCards size={16} />}>Connect wallet</Button>
}

function Landing({ wallet, theme, onToggleTheme }: { wallet: ReturnType<typeof useWallet>; theme: Theme; onToggleTheme: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [connectOpen, setConnectOpen] = useState(false)
  const [pendingPath, setPendingPath] = useState<string>()
  const [disconnectToast, setDisconnectToast] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 800], [0, 48])
  const heroScale = useTransform(scrollY, [0, 800], [1, 1.025])
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  const go = (path: string) => {
    if (wallet.account) { navigate(path); return }
    setPendingPath(path)
    setConnectOpen(true)
  }
  useEffect(() => {
    if (!location.state?.disconnected) return
    setDisconnectToast(true)
    window.history.replaceState({}, document.title, window.location.href)
    const timer = window.setTimeout(() => setDisconnectToast(false), 4000)
    return () => window.clearTimeout(timer)
  }, [location.state])
  return <div className="landing-page">
    <a className="skip-link" href="#main">Skip to content</a>
    <motion.header className={scrolled ? 'landing-nav is-scrolled' : 'landing-nav'}>
      <Link to="/" className="wordmark">Escrow</Link>
      <nav className={menuOpen ? 'landing-links is-open' : 'landing-links'}>
        <a href="#flow">How it works</a><a href="#proof">Proof</a><a href="#network">Monad</a>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        <Button variant="primary" onClick={() => go('/app')}>Open app</Button>
      </nav>
      <button className="mobile-menu" aria-label="Open navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
    </motion.header>
    <main id="main">
      <section className="hero-section">
        <motion.div className="hero-image" style={{ y: heroY, scale: heroScale }} />
        <div className="hero-wash" />
        <div className="hero-content">
          <div className="eyebrow"><span className="signal" /> Onchain campaign settlement</div>
          <h1>Campaign money<br /><em>held fairly</em></h1>
          <p className="hero-copy">Escrow locks the budget before a KOL posts, then releases each fixed payout when proof is approved. No chasing. No trust gap.</p>
          <div className="hero-actions"><Button onClick={() => go('/app/campaigns/new')}>Create campaign</Button><Button variant="outline" onClick={() => go('/app/campaigns')}>Find campaigns</Button></div>
          <div className="hero-note"><ShieldCheck size={16} /> Monad testnet · USDC settlement</div>
        </div>
        <div className="hero-metric"><span>01</span><p>Funds are visible<br />before work begins.</p></div>
      </section>
      <motion.section className="problem-section" id="problem" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.1 }} transition={{ duration: .7, ease: [0.16, 1, 0.3, 1] }}><div className="section-grid"><div className="section-heading"><span className="eyebrow">The problem</span><h2>Trust is a<br /><em>bad workflow</em></h2></div><div className="compare-grid"><div><span className="compare-label">AGENCY PAYS FIRST</span><p>Budget leaves the wallet before the post exists. A missed deliverable becomes a manual recovery job.</p><span className="compare-mark bad">− exposed budget</span></div><div><span className="compare-label">KOL POSTS FIRST</span><p>Work goes live before payment is certain. Invoices, follow-ups, and “checking with finance” begin.</p><span className="compare-mark bad">− uncertain payout</span></div></div></div></motion.section>
      <section className="flow-section" id="flow"><div className="narrow-heading"><span className="eyebrow">The operating layer</span><h2>One campaign<br /><em>Four clear states</em></h2><p>The contract holds the shared truth. The agency reviews the work. The KOL never has to wonder whether the money is there.</p></div><div className="flow-list">{[['01','Fund','Agency deposits the full fixed-payout budget into escrow.'],['02','Join','A wallet claims one open slot. The campaign creator is blocked from joining its own campaign.'],['03','Prove','The KOL submits a public proof URL and optional note.'],['04','Settle','Approval pays instantly. Silence past the review timeout lets the KOL claim.']].map(([n,t,d], i) => <motion.div className="flow-row" key={n} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.1 }} transition={{ duration: .6, delay: i * .08 }}><span>{n}</span><strong>{t}</strong><p>{d}</p><ArrowRight size={16} /></motion.div>)}</div></section>
      <motion.section className="modes-section" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.1 }} transition={{ duration: .7, ease: [0.16, 1, 0.3, 1] }}><div className="section-top"><div><span className="eyebrow">Payout logic</span><h2>Simple enough<br /><em>to trust</em></h2></div><p>V1 is fixed payout up to a campaign maximum. Agencies can lower individual slot payouts before proof is submitted.</p></div><div className="mode-grid"><div className="mode-card featured"><div className="mode-icon"><Check size={18} /></div><span className="compare-label">V1 · LIVE</span><h3>Fixed payout</h3><div className="mode-value">100 <small>USDC max / KOL</small></div><div className="mode-rows"><div><span>Budget</span><b>10 × 100</b></div><div><span>Release</span><b>After approval</b></div><div><span>Protection</span><b>Timeout claim</b></div></div></div><div className="mode-card muted"><div className="mode-icon"><Clock3 size={18} /></div><span className="compare-label">NEXT · PLANNED</span><h3>Milestones</h3><div className="mode-value">40 · 40 · 20<small>% across proof states</small></div><div className="mode-rows"><div><span>Post submitted</span><b>40%</b></div><div><span>Live after 24h</span><b>40%</b></div><div><span>Analytics proof</span><b>20%</b></div></div></div></div></motion.section>
      <motion.section className="proof-section" id="proof" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.1 }} transition={{ duration: .7, ease: [0.16, 1, 0.3, 1] }}><div className="proof-copy"><span className="eyebrow">Public proof</span><h2>Every payout<br /><em>leaves a trail</em></h2><p>Anyone can inspect the campaign state: how much is locked, who has delivered, and which transaction released the money.</p><Button variant="outline" onClick={() => go('/app/campaigns')}>Browse campaigns</Button></div><div className="proof-mock"><div className="mock-top"><span className="mock-label">CAMPAIGN / 0042</span><span className="pill green"><span className="status-dot" /> funded</span></div><h3>Launch week / creators</h3><p className="mock-sub">Public campaign proof</p><div className="mock-stats"><div><b>1,000</b><span>USDC locked</span></div><div><b>07 / 10</b><span>slots active</span></div><div><b>03</b><span>paid</span></div></div><div className="timeline"><div><i /><div><b>Proof approved</b><span>Slot 03 · 100 USDC released</span></div><time>2m</time></div><div><i /><div><b>Proof submitted</b><span>Slot 07 · public link attached</span></div><time>18m</time></div><div><i className="hollow" /><div><b>Campaign funded</b><span>10 slots reserved by agency</span></div><time>1d</time></div></div></div></motion.section>
      <motion.section className="network-section" id="network" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.1 }} transition={{ duration: .7, ease: [0.16, 1, 0.3, 0.3] }}><span className="eyebrow">Built for Spark</span><div className="network-grid"><h2>Fast settlement<br /><em>visible by default</em></h2><div className="network-copy"><p>Escrow is not a dashboard sitting beside the chain. The campaign budget, slot ownership, proof state, review timeout, and payout all live in BatchEscrow on Monad.</p><div className="network-metrics"><div><b>ERC-20</b><span>token agnostic</span></div><div><b>MON</b><span>gas on testnet</span></div><div><b>0 backend</b><span>wallet identity</span></div></div></div></div></motion.section>
      <motion.section className="final-section" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.1 }} transition={{ duration: .7, ease: [0.16, 1, 0.3, 1] }}><div className="final-grid"><div><span className="eyebrow">Make the promise visible</span><h2>Put the money<br /><em>where the work is</em></h2><div className="hero-actions"><Button onClick={() => go('/app/campaigns/new')}>Create campaign</Button><Button variant="outline" onClick={() => go('/app/campaigns')}>Find campaigns</Button></div></div><div className="final-checks">{['Budget locked before work', 'Public proof URL per slot', 'Fair timeout for silence', 'Unused funds return after deadline'].map(x => <div key={x}><Check size={16} />{x}</div>)}</div></div></motion.section>
    </main>
    <footer><span className="wordmark">Escrow</span><span>Monad testnet · Spark hackathon</span><span className="mono">BATCH ESCROW / V1</span></footer>
    <AnimatePresence>{disconnectToast && <motion.div className="disconnect-toast" role="status" initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: .2 }}><CircleHelp size={16} /><span>Your wallet was disconnected. Reconnect to continue.</span><button aria-label="Dismiss notification" onClick={() => setDisconnectToast(false)}><X size={15} /></button></motion.div>}</AnimatePresence>
    <WalletConnectModal isOpen={connectOpen} onClose={() => { setConnectOpen(false); setPendingPath(undefined) }} wallet={wallet} onSuccess={() => { setConnectOpen(false); navigate(pendingPath || '/app'); setPendingPath(undefined) }} />
  </div>
}

function AppShell({ wallet, theme, onToggleTheme, children, refreshKey }: { wallet: ReturnType<typeof useWallet>; theme: Theme; onToggleTheme: () => void; children: React.ReactNode; refreshKey?: number }) {
  const location = useLocation(); const navigate = useNavigate(); const [menuOpen, setMenuOpen] = useState(false)
  const links = [{ to: '/app', label: 'Overview', icon: LayoutDashboard }, { to: '/app/campaigns', label: 'Campaigns', icon: Clipboard }, { to: '/app/submissions', label: 'Review queue', icon: FileCheck2 }, { to: '/app/wallet', label: 'Wallet', icon: WalletCards }]
  const [monBalance, setMonBalance] = useState<string>('—')
  const [usdcBalance, setUsdcBalance] = useState<string>('—')

  useEffect(() => {
    if (!wallet.account) {
      setMonBalance('—')
      setUsdcBalance('—')
      return
    }
    const fetchBalances = () => {
      publicClient.getBalance({ address: wallet.account! })
        .then(balance => setMonBalance(formatUnits(balance, 18)))
        .catch(() => setMonBalance('—'))

      if (USDC_ADDRESS) {
        publicClient.readContract({
          address: USDC_ADDRESS,
          abi: tokenAbi,
          functionName: 'balanceOf',
          args: [wallet.account!]
        })
          .then(balance => setUsdcBalance(formatUnits(balance as bigint, 6)))
          .catch(() => setUsdcBalance('—'))
      }
    }
    fetchBalances()
    const delayTimer = window.setTimeout(fetchBalances, 1500)
    const interval = window.setInterval(fetchBalances, 8000)
    return () => {
      window.clearTimeout(delayTimer)
      window.clearInterval(interval)
    }
  }, [wallet.account, refreshKey])

  return <div className="app-shell"><aside className="sidebar"><Link to="/" className="wordmark">Escrow</Link><div className="side-kicker">OPERATIONS / V1</div><nav>{links.map(({ to, label, icon: Icon }) => <Link className={location.pathname === to ? 'side-link active' : 'side-link'} to={to} key={to}><Icon size={19} />{label}</Link>)}</nav><div className="side-bottom">{wallet.account ? <div className="sidebar-wallet-card"><div className="card-header"><div className="wallet-icon-bg"><WalletCards size={18} /></div><div className="wallet-info"><span className="wallet-label">Connected wallet</span><code className="wallet-addr" title={wallet.account}>{shortenAddress(wallet.account)}</code></div></div><div className="wallet-balances"><div className="balance-item"><span className="balance-label">MON Balance</span><span className="balance-value" title={`${monBalance} MON`}>{monBalance} MON</span></div><div className="balance-item"><span className="balance-label">USDC Balance</span><span className="balance-value" title={`${usdcBalance} USDC`}>{usdcBalance} USDC</span></div></div><div className="card-footer"><span className="status-badge-inline"><span className="status-dot" /> Monad testnet</span><button className="disconnect-btn" onClick={wallet.disconnect} title="Disconnect wallet"><LogOut size={14} /></button></div></div> : <div className="sidebar-wallet-card disconnected"><p>Connect your wallet to manage and join campaigns.</p><button className="connect-btn-sidebar" onClick={wallet.connect}><WalletCards size={14} /> Connect wallet</button></div>}<button className="side-link exit-link" onClick={() => navigate('/')}><LogOut size={19} />Exit app</button></div></aside><div className="mobile-app-head"><Link to="/" className="wordmark">Escrow</Link><button aria-label="Open app navigation" onClick={() => setMenuOpen(!menuOpen)}><Menu size={19} /></button></div>{menuOpen && <div className="mobile-nav">{links.map(({ to, label }) => <Link key={to} to={to} onClick={() => setMenuOpen(false)}>{label}</Link>)}</div>}<main className="app-main"><div className="app-topbar"><div><div className="side-kicker">WORKSPACE / {location.pathname.split('/')[2]?.toUpperCase() || 'OVERVIEW'}</div><p className="topline">Campaign settlement, without the follow-up.</p></div><div className="app-top-actions"><ThemeToggle theme={theme} onToggle={onToggleTheme} /><WalletDropdown account={wallet.account} chainId={wallet.chainId} switching={wallet.switching} onSwitchNetwork={wallet.switchNetwork} onDisconnect={wallet.disconnect} /></div></div>{wallet.chainId && wallet.chainId !== 10143 && <div className="warning-banner"><div className="warning-copy"><CircleHelp size={16} /><span>Wrong network. Switch your wallet to Monad Testnet (chain 10143).</span></div><button className="network-switch" onClick={() => void wallet.switchNetwork()} disabled={wallet.switching}>{wallet.switching ? 'Switching…' : 'Switch network'}<ArrowRight size={14} /></button></div>}{!isConfigured && <div className="config-banner"><Zap size={16} /><span>Contract addresses are not configured yet. Add <code>VITE_BATCH_ESCROW_ADDRESS</code> and <code>VITE_USDC_ADDRESS</code> to connect live state.</span></div>}{wallet.error && <div className="error-banner"><X size={16} />{wallet.error}</div>}{children}</main></div>
}

function Overview({ campaigns, wallet, onRefresh }: { campaigns: Campaign[]; wallet: ReturnType<typeof useWallet>; onRefresh: () => void }) {
  const acc = wallet.account?.toLowerCase()
  const mine = campaigns.filter(c => c.agency.toLowerCase() === acc)
  const joined = campaigns.filter(c => c.slots.some(s => s.kol.toLowerCase() === acc && s.status !== 5))

  // Agency metrics
  const pendingAgency = mine.flatMap(c => c.slots.filter(s => s.status === 1)).length
  const lockedAgency = mine.reduce((sum, c) => sum + c.funded - c.paid - c.withdrawn, 0n)

  // KOL metrics
  const kolSlots = joined.map(c => c.slots.find(s => s.kol.toLowerCase() === acc && s.status !== 5)!)
  const earnedKOL = kolSlots.filter(s => s.status === 4).reduce((sum, s) => sum + s.payout, 0n)
  const pendingKOL = kolSlots.filter(s => s.status !== 4 && s.status !== 5).reduce((sum, s) => sum + s.payout, 0n)

  const hasAgency = mine.length > 0
  const hasKOL = joined.length > 0

  return (
    <>
      <PageHeading 
        eyebrow="Workspace overview" 
        title={hasAgency && !hasKOL ? "Agency dashboard." : !hasAgency && hasKOL ? "KOL dashboard." : "Your workspace."} 
        action={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button to="/app/campaigns/new" icon={<Plus size={16} />}>New campaign</Button>
            <Button to="/app/campaigns" icon={<Clipboard size={16} />} variant="outline">Browse campaigns</Button>
          </div>
        } 
      />

      {/* KPIs Grid */}
      <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: `repeat(${hasAgency && hasKOL ? 4 : 3}, 1fr)`, marginBottom: '2rem' }}>
        {hasAgency && (
          <>
            <div>
              <span>CAMPAIGNS OWNED</span>
              <b>{mine.length.toString().padStart(2, '0')}</b>
              <small>as campaign creator</small>
            </div>
            <div>
              <span>FUNDS IN ESCROW</span>
              <b>{formatUnits(lockedAgency)} <i>USDC</i></b>
              <small>across owned campaigns</small>
            </div>
          </>
        )}
        {hasKOL && (
          <>
            <div>
              <span>CAMPAIGNS JOINED</span>
              <b>{joined.length.toString().padStart(2, '0')}</b>
              <small>active KOL participation</small>
            </div>
            <div>
              <span>PENDING PAYOUT</span>
              <b>{formatUnits(pendingKOL)} <i>USDC</i></b>
              <small>USDC locked in active slots</small>
            </div>
            <div>
              <span>TOTAL EARNED</span>
              <b>{formatUnits(earnedKOL)} <i>USDC</i></b>
              <small>settled payouts received</small>
            </div>
          </>
        )}
        {!hasAgency && !hasKOL && (
          <>
            <div>
              <span>CAMPAIGNS</span>
              <b>00</b>
              <small>no active campaigns</small>
            </div>
            <div>
              <span>TOTAL ESCROW</span>
              <b>0.00 <i>USDC</i></b>
              <small>0.00 USDC</small>
            </div>
            <div>
              <span>NETWORK</span>
              <b>MONAD</b>
              <small>testnet · 10143</small>
            </div>
          </>
        )}
      </div>

      <div className="dashboard-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Agency campaigns section */}
          {hasAgency && (
            <section className="panel">
              <div className="panel-heading">
                <div>
                  <span className="eyebrow">Agency desk</span>
                  <h2>Your active campaigns</h2>
                </div>
                <Button variant="quiet" to="/app/campaigns" icon={<ArrowRight size={15} />}>View all</Button>
              </div>
              <CampaignRows campaigns={mine} />
            </section>
          )}

          {/* KOL campaigns section */}
          {hasKOL && (
            <section className="panel">
              <div className="panel-heading">
                <div>
                  <span className="eyebrow">KOL desk</span>
                  <h2>Joined campaigns</h2>
                </div>
                <Button variant="quiet" to="/app/campaigns" icon={<ArrowRight size={15} />}>Directory</Button>
              </div>
              <div className="campaign-rows">
                {joined.map(c => {
                  const s = c.slots.find(item => item.kol.toLowerCase() === acc && item.status !== 5)!
                  return (
                    <Link to={`/app/campaigns/${c.id}`} className="campaign-row" key={c.id}>
                      <div className="campaign-index">/{String(c.id).padStart(2, '0')}</div>
                      <div>
                        <b>{c.title}</b>
                        <span>Payout: {formatUnits(s.payout)} USDC · Status: {statusNames[s.status]}</span>
                      </div>
                      <div className="row-right">
                        <span className={`pill ${statusClass[s.status] || 'open'}`}>
                          {statusNames[s.status]}
                        </span>
                        <ArrowRight size={15} />
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>
          )}

          {!hasAgency && !hasKOL && (
            <EmptyState 
              title="Your workspace is empty" 
              body="Create a campaign to lock budget and invite creators, or enter an invite code to join a campaign as a KOL." 
              action={
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                  <Button to="/app/campaigns/new">Create campaign</Button>
                  <Button to="/app/campaigns" variant="outline">Join campaign</Button>
                </div>
              } 
            />
          )}
        </div>

        <aside className="action-panel">
          <span className="eyebrow">Quick start</span>
          <h3>What needs doing?</h3>
          <div className="quick-actions">
            <Link to="/app/campaigns/new">
              <Plus size={17} />
              <span><b>Create a campaign</b><small>Lock a fixed budget</small></span>
              <ArrowRight size={15} />
            </Link>
            <Link to="/app/campaigns">
              <Clipboard size={17} />
              <span><b>Find open work</b><small>Claim a KOL slot</small></span>
              <ArrowRight size={15} />
            </Link>
            <button onClick={onRefresh}>
              <RefreshCw size={17} />
              <span><b>Refresh chain state</b><small>Read current events</small></span>
              <ArrowRight size={15} />
            </button>
          </div>
        </aside>
      </div>
    </>
  )
}

function CampaignRows({ campaigns }: { campaigns: Campaign[] }) { return <div className="campaign-rows">{campaigns.map(c => <Link to={`/app/campaigns/${c.id}`} className="campaign-row" key={c.id}><div className="campaign-index">/{String(c.id).padStart(2, '0')}</div><div><b>{c.title}</b><span>{Number(c.joined)} / {Number(c.maxSlots)} slots · {formatUnits(c.paid)} paid</span></div><div className="row-right"><span className={`pill ${isPast(c.deadline) ? 'closed' : 'green'}`}>{isPast(c.deadline) ? 'closed' : 'live'}</span><ArrowRight size={15} /></div></Link>)}</div> }
function PageHeading({ eyebrow, title, action }: { eyebrow: string; title: string; action?: React.ReactNode }) { return <div className="page-heading"><div><span className="eyebrow">{eyebrow}</span><h1>{title.replace(/[.!?,]+$/, '')}</h1></div>{action}</div> }
function EmptyState({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) { return <div className="empty-state"><div className="empty-icon"><ShieldCheck size={19} /></div><h3>{title}</h3><p>{body}</p>{action}</div> }

function CampaignList({ campaigns, account, loading }: { campaigns: Campaign[]; account?: string; loading?: boolean }) {
  const acc = account?.toLowerCase();
  const navigate = useNavigate();
  const [inputCode, setInputCode] = useState('');
  const [joinError, setJoinError] = useState('');

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError('');
    const trimVal = inputCode.trim();
    if (!trimVal) return;

    // 1. Try parsing as a URL
    try {
      if (trimVal.startsWith('http://') || trimVal.startsWith('https://') || trimVal.includes('/app/campaigns/')) {
        const parts = trimVal.split('?');
        const urlPath = parts[0];
        const search = parts[1] || '';
        const pathParts = urlPath.split('/');
        const idStr = pathParts[pathParts.length - 1];
        const campaignId = Number(idStr);
        if (isNaN(campaignId)) {
          setJoinError('Invalid campaign ID in the link.');
          return;
        }
        const params = new URLSearchParams(search);
        const code = params.get('code') || '';
        navigate(`/app/campaigns/${campaignId}?code=${code}`);
        return;
      }
    } catch {
      // Ignore URL parsing errors, proceed to code lookup
    }

    // 2. Try parsing as a raw code (hash lookup)
    try {
      const codeHash = keccak256(toBytes(trimVal));
      console.log('Searching code:', trimVal, 'hash:', codeHash);
      console.log('Available campaigns hashes:', campaigns.map(c => ({ id: c.id, hash: c.inviteCodeHash, inviteOnly: c.inviteOnly })));
      const found = campaigns.find(c => c.inviteCodeHash === codeHash);
      if (found) {
        navigate(`/app/campaigns/${found.id}?code=${trimVal}`);
      } else {
        setJoinError('Campaign not found with this code. Check the code or paste the full share link.');
      }
    } catch (err) {
      setJoinError('Error processing code. Please enter a valid code or full link.');
    }
  };

  const visible = campaigns.filter(c => c.agency.toLowerCase() === acc || c.slots.some(s => s.kol.toLowerCase() === acc));

  return (
    <>
      <PageHeading eyebrow="Campaign directory" title="Your campaigns." action={<Button to="/app/campaigns/new" icon={<Plus size={16} />}>New campaign</Button>} />
      <div className="list-intro">
        <span><span className="status-dot" /> {visible.filter(c => !isPast(c.deadline)).length} private campaigns you can access</span>
        <span className="mono">FIXED PAYOUT / INVITE ONLY</span>
      </div>
      <div className="workspace-grid">
        <div className="workspace-primary">
          {visible.length ? (
            <div className="directory-list">
              {visible.map(c => (
                <Link to={`/app/campaigns/${c.id}`} className="directory-row" key={c.id}>
                  <div className="directory-number">{String(c.id + 1).padStart(2, '0')}</div>
                  <div className="directory-main">
                    <div>
                      <h3>{c.title}</h3>
                      <p>{c.brief || 'Fixed-payout creator campaign on Monad testnet.'}</p>
                    </div>
                    <div className="directory-meta">
                      <span><b>{formatUnits(c.payout)}</b> USDC max / KOL</span>
                      <span><b>{Number(c.joined)} / {Number(c.maxSlots)}</b> slots</span>
                      <span className={isPast(c.deadline) ? 'muted-text' : 'green-text'}>
                        {isPast(c.deadline) ? 'closed' : `ends ${fmtDate(c.deadline)}`}
                      </span>
                    </div>
                  </div>
                  <ArrowRight size={17} />
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No live campaigns"
              body={isConfigured ? 'Create a campaign or enter an invite code to access and claim a slot.' : 'Once the contract addresses are configured, funded campaigns will appear here.'}
              action={<Button to="/app/campaigns/new">Create campaign</Button>}
            />
          )}
        </div>
        <aside className="workspace-side">
          <section className="action-panel">
            <span className="eyebrow">Join campaign</span>
            <h3>Enter invite link or code</h3>
            <p>Paste the invite code or the full share link shared by the agency to access the private campaign and claim your slot.</p>
            <form onSubmit={handleJoinSubmit} style={{ marginTop: '1.25rem' }}>
              <label>
                Invite Link / Code
                <input
                  required
                  value={inputCode}
                  onChange={e => setInputCode(e.target.value)}
                  placeholder="Paste invite link or code"
                />
              </label>
              {joinError && <div className="form-message error">{joinError}</div>}
              <Button type="submit" disabled={loading}>{loading ? 'Syncing blockchain...' : 'Access campaign'}</Button>
            </form>
          </section>
        </aside>
      </div>
    </>
  );
}

function CreateCampaign({ wallet, onRefresh }: { wallet: ReturnType<typeof useWallet>; onRefresh: () => void }) {
  const navigate = useNavigate(); const [title, setTitle] = useState(''); const [brief, setBrief] = useState(''); const [payout, setPayout] = useState('100'); const [slots, setSlots] = useState('10'); const [days, setDays] = useState('14'); const [timeout, setTimeoutValue] = useState('48'); const [busy, setBusy] = useState(''); const [createdId, setCreatedId] = useState<number>(); const [createdCode, setCreatedCode] = useState(''); const [copied, setCopied] = useState(''); const [message, setMessage] = useState(''); const [txHash, setTxHash] = useState('')
  const total = (Number(payout || 0) * Number(slots || 0)).toLocaleString()
  const totalUnits = toUnits(payout || '0') * BigInt(slots || '0')
  const create = async (event: React.FormEvent) => { event.preventDefault(); if (!wallet.account) return wallet.connect(); if (!USDC_ADDRESS) return setMessage('Add the Monad testnet USDC address to .env first.'); setBusy('Creating campaign'); setMessage(''); setTxHash(''); try { const deadline = BigInt(Math.floor(Date.now() / 1000) + Number(days) * 86400); const code = genInviteCode(); const codeHash = keccak256(toBytes(code)); const hash = await sendTransaction(wallet.account, 'createCampaign', [USDC_ADDRESS, title, brief, toUnits(payout), BigInt(slots), deadline, BigInt(Number(timeout) * 3600), true, codeHash]); const count = await publicClient.readContract({ address: ESCROW_ADDRESS, abi: escrowAbi, functionName: 'campaignCount' }) as bigint; const id = Number(count - 1n); window.localStorage.setItem(`escrow:invite:${id}`, code); setCreatedCode(code); setTxHash(hash); setMessage(`Campaign created. Transaction ${shortenAddress(hash)}`); setBusy(''); onRefresh(); setCreatedId(id); } catch (err) { setMessage(err instanceof Error ? err.message : 'Campaign creation failed.'); setBusy('') } }
  const fund = async () => { if (!wallet.account || createdId === undefined) return; setBusy('Approving USDC'); setTxHash(''); try { await sendTransaction(wallet.account, 'approve', [ESCROW_ADDRESS, totalUnits], true); setBusy('Locking USDC'); const hash = await sendTransaction(wallet.account, 'fundCampaign', [BigInt(createdId)]); setTxHash(hash); setMessage('USDC approved and locked in escrow.'); setBusy(''); onRefresh(); navigate(`/app/campaigns/${createdId}`) } catch (err) { setMessage(err instanceof Error ? err.message : 'Funding failed.'); setBusy('') } }
  const copy = async (text: string, key: string) => { if (!text) return; await navigator.clipboard.writeText(text); setCopied(key); window.setTimeout(() => setCopied(''), 1800) }
  const shareLink = createdId !== undefined ? `${window.location.origin}/app/campaigns/${createdId}?code=${createdCode}` : ''
  return <><PageHeading eyebrow="Agency / new campaign" title="Lock the budget first." action={<Button variant="quiet" to="/app/campaigns" icon={<X size={15} />} >Cancel</Button>} /><div className="form-layout"><form className="panel campaign-form" onSubmit={create}><div className="form-section"><span className="eyebrow">01 / Campaign brief</span><label>Campaign name<input required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Launch week / creators" /></label><label>What should the KOL deliver?<textarea value={brief} onChange={e => setBrief(e.target.value)} placeholder="One public post on X with the campaign link and a clear mention." /></label></div><div className="form-section"><span className="eyebrow">02 / Fixed payout</span><div className="form-grid"><label>Starting payment per KOL<div className="input-unit"><input required type="number" min="1" value={payout} onChange={e => setPayout(e.target.value)} /><span>USDC</span></div></label><label>Slots<input required type="number" min="1" value={slots} onChange={e => setSlots(e.target.value)} /></label></div><div className="budget-readout"><span>Starting budget locked</span><b>{total} <small>USDC</small></b></div><p className="form-help">After a KOL joins, the agency can lower or raise that slot's payout before proof is submitted. Raising a payout may require extra escrow.</p></div><div className="form-section"><span className="eyebrow">03 / Access</span><p className="form-help"><ShieldCheck size={14} /> Every campaign is private. When you create it the app generates a one-time invite code — only KOLs you send the code or share link to can find and join. The campaign is not listed publicly in the app.</p>{createdId !== undefined && <div className="campaign-code-card"><div><span className="eyebrow">Invite code · share privately</span><code>{createdCode}</code></div><button type="button" aria-label="Copy invite code" onClick={() => void copy(createdCode, 'code')}>{copied === 'code' ? <Check size={16} /> : <Copy size={16} />}</button></div>}{createdId !== undefined && <div className="campaign-code-card"><div><span className="eyebrow">Share link · code included</span><code>{shareLink}</code></div><button type="button" aria-label="Copy share link" onClick={() => void copy(shareLink, 'link')}>{copied === 'link' ? <Check size={16} /> : <Copy size={16} />}</button></div>}</div><div className="form-section"><span className="eyebrow">04 / Timing</span><div className="form-grid"><label>Campaign duration<select value={days} onChange={e => setDays(e.target.value)}><option value="7">7 days</option><option value="14">14 days</option><option value="30">30 days</option></select></label><label>Review timeout<select value={timeout} onChange={e => setTimeoutValue(e.target.value)}><option value="24">24 hours</option><option value="48">48 hours</option><option value="72">72 hours</option></select></label></div><p className="form-help"><Clock3 size={14} /> If an agency does not review a submitted proof within this window, the KOL can claim the slot payout.</p></div>{message && (
    <div className={message.includes('failed') || message.includes('Add') ? 'form-message error' : 'form-message'}>
      <div>{message}</div>
      {txHash && (
        <a href={txUrl(txHash)} target="_blank" rel="noreferrer" className="msg-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.4rem', textDecoration: 'underline', color: 'inherit' }}>
          View transaction <ExternalLink size={12} />
        </a>
      )}
    </div>
  )}<Button type="submit" disabled={Boolean(busy)}>{busy || 'Create campaign'}<ArrowRight size={16} /></Button></form><aside className="preview-panel"><span className="eyebrow">Read before signing</span><h3>Fixed payout / private access</h3><p>Only wallets that have the invite code can find and claim a slot. The agency wallet is automatically blocked from becoming a KOL in its own campaign.</p><div className="preview-lines"><div><span>Network</span><b>Monad testnet</b></div><div><span>Settlement</span><b>USDC</b></div>{createdId !== undefined && <div><span>Required escrow</span><b>{total} USDC</b></div>}<div><span>Role model</span><b>Wallet / campaign</b></div></div>{createdId !== undefined && <Button onClick={fund} disabled={Boolean(busy)}>{busy || `Fund this campaign (${total} USDC)`}<Zap size={15} /></Button>}<div className="preview-note"><ShieldCheck size={15} /> Two signatures complete the setup: create, then fund.</div></aside></div></>
}

function CampaignDetail({ campaigns, wallet, onRefresh }: { campaigns: Campaign[]; wallet: ReturnType<typeof useWallet>; onRefresh: () => void }) {
  return <CampaignDetailV3 campaigns={campaigns} wallet={wallet} onRefresh={onRefresh} />
  const { id } = useParams(); const navigate = useNavigate(); const campaign = campaigns.find(c => c.id === Number(id)) as Campaign; const [busy, setBusy] = useState(''); const [proof, setProof] = useState(''); const [note, setNote] = useState(''); const [rejectReason, setRejectReason] = useState(''); const [message, setMessage] = useState('')
  if (!campaign) return <EmptyState title="Campaign not found" body="This campaign is not indexed yet or the address is incorrect." action={<Button to="/app/campaigns">Back to campaigns</Button>} />
  const isAgency = wallet.account?.toLowerCase() === campaign.agency.toLowerCase(); const mySlot = campaign.slots.find(s => s.kol.toLowerCase() === wallet.account?.toLowerCase()) as Slot; const canJoin = !isAgency && !mySlot && !isPast(campaign.deadline) && campaign.joined < campaign.maxSlots && Boolean(wallet.account)
  const act = async (name: Parameters<typeof sendTransaction>[1], args: readonly unknown[] = [], token = false) => { if (!wallet.account) return wallet.connect(); setBusy(name); setMessage(''); try { const hash = await sendTransaction(wallet.account, name, args, token); setMessage(`Confirmed onchain · ${shortenAddress(hash)}`); setBusy(''); onRefresh() } catch (err) { setMessage(err instanceof Error ? err.message : 'Transaction failed.'); setBusy('') } }
  return <><PageHeading eyebrow={`Campaign / ${String(campaign.id).padStart(2, '0')}`} title={campaign.title} action={<Button variant="quiet" to={`/app/campaigns/${campaign.id}/proof`} icon={<ExternalLink size={15} />}>Public proof</Button>} /><div className="workspace-grid"><div className="workspace-primary"><section className="campaign-hero panel"><div className="campaign-hero-top"><div><span className="pill green"><span className="status-dot" /> {isPast(campaign.deadline) ? 'closed' : 'accepting slots'}</span><p className="mono address-line">AGENCY {shortenAddress(campaign.agency)}</p></div><div className="hero-budget"><span>LOCKED BUDGET</span><b>{formatUnits(campaign.funded)} <small>mUSDC</small></b></div></div><p className="campaign-brief">{campaign.brief || 'Fixed payout campaign. Submit one public proof URL after the work is live.'}</p><div className="campaign-facts"><div><span>PAYOUT / KOL</span><b>{formatUnits(campaign.payout)} mUSDC</b></div><div><span>SLOTS</span><b>{Number(campaign.joined)} / {Number(campaign.maxSlots)} filled</b></div><div><span>DEADLINE</span><b>{fmtDate(campaign.deadline)}</b></div><div><span>REVIEW WINDOW</span><b>{Number(campaign.reviewTimeout) / 3600} hours</b></div></div></section><section className="panel"><div className="panel-heading"><div><span className="eyebrow">Slot ledger</span><h2>Proof status</h2></div><span className="mono">{campaign.slots.length} participant records</span></div>{campaign.slots.length ? <div className="slot-list">{campaign.slots.map(slot => <SlotRow key={slot.slotId} slot={slot} isAgency={Boolean(isAgency)} busy={busy} onApprove={() => act('approveProof', [BigInt(campaign.id), BigInt(slot.slotId)])} onReject={() => act('rejectProof', [BigInt(campaign.id), BigInt(slot.slotId), rejectReason || 'Please revise the proof and resubmit.'])} rejectReason={rejectReason} setRejectReason={setRejectReason} />)}</div> : <EmptyState title="No KOLs yet" body="Once a wallet accepts a slot, its proof state will appear here." />}</section></div><aside className="workspace-side"><section className="action-panel"><span className="eyebrow">Your role</span><h3>{isAgency ? 'Agency review desk' : mySlot ? 'KOL delivery slot' : 'Open campaign'}</h3>{isAgency ? <><p>You created this campaign. Review each submitted proof, release approved payouts, or reject with a reason.</p>{isPast(campaign.deadline) && <Button onClick={() => act('withdrawUnused', [BigInt(campaign.id)])} disabled={Boolean(busy)}>{busy || 'Withdraw unused budget'}<ArrowRight size={15} /></Button>}</> : mySlot ? <><StatusBadge status={mySlot.status} /><p>{mySlot.status === 1 ? 'The agency has the proof. The timeout clock is running.' : mySlot.status === 3 ? `Rejected: ${mySlot.rejectionReason}` : mySlot.status === 0 ? 'Your slot is reserved. Submit the public link when the work is live.' : 'This slot has been settled.'}</p>{mySlot.status === 1 && Number(mySlot.submittedAt) * 1000 + Number(campaign.reviewTimeout) * 1000 < Date.now() && <Button onClick={() => act('claimAfterTimeout', [BigInt(campaign.id)])} disabled={Boolean(busy)}>{busy || 'Claim after timeout'}<Clock3 size={15} /></Button>}{(mySlot.status === 0 || mySlot.status === 3) && <form onSubmit={e => { e.preventDefault(); void act('submitProof', [BigInt(campaign.id), proof, note]) }}><label>Proof URL<input required type="url" value={proof} onChange={e => setProof(e.target.value)} placeholder="https://x.com/..." /></label><label>Note <span className="optional">optional</span><textarea value={note} onChange={e => setNote(e.target.value)} placeholder="What should the agency verify?" /></label><Button type="submit" disabled={Boolean(busy)}>{busy || (mySlot.status === 3 ? 'Resubmit proof' : 'Submit proof')}<ArrowRight size={15} /></Button></form>}</> : <><p>Connect a wallet, claim one available slot, and submit a public link when the work is complete.</p><Button onClick={() => act('acceptSlot', [BigInt(campaign.id)])} disabled={!canJoin || Boolean(busy)}>{busy || (wallet.account ? 'Claim open slot' : 'Connect wallet')}<ArrowRight size={15} /></Button></>}</section><section className="panel side-details"><span className="eyebrow">Settlement notes</span><div><Check size={15} /> Full budget funded before joining</div><div><Check size={15} /> Fixed payout per approved slot</div><div><Check size={15} /> Unused funds return after deadline</div><a href={txUrl('')} target="_blank" rel="noreferrer" className="disabled-link">View contract on explorer <ExternalLink size={13} /></a></section>{message && <div className={message.includes('failed') ? 'form-message error' : 'form-message'}>{message}</div>}</aside></div></>
}

function CampaignDetailV2({ campaigns, wallet, onRefresh }: { campaigns: Campaign[]; wallet: ReturnType<typeof useWallet>; onRefresh: () => void }) {
  const { id } = useParams(); const campaign = campaigns.find(c => c.id === Number(id)); const [busy, setBusy] = useState(''); const [proof, setProof] = useState(''); const [note, setNote] = useState(''); const [inviteCode, setInviteCode] = useState(''); const [rejectReason, setRejectReason] = useState(''); const [message, setMessage] = useState('')
  if (!campaign) return <EmptyState title="Campaign not found" body="This campaign is not indexed yet or the address is incorrect." action={<Button to="/app/campaigns">Back to campaigns</Button>} />
  const isAgency = wallet.account?.toLowerCase() === campaign.agency.toLowerCase(); const mySlot = campaign.slots.find(s => s.kol.toLowerCase() === wallet.account?.toLowerCase() && s.status !== 5); const canJoin = !isAgency && !mySlot && !isPast(campaign.deadline) && campaign.joined < campaign.maxSlots && Boolean(wallet.account)
  const agencyInviteCode = isAgency && campaign.inviteOnly ? window.localStorage.getItem(`escrow:invite:${campaign.id}`) || '' : ''
  const act = async (name: Parameters<typeof sendTransaction>[1], args: readonly unknown[] = [], token = false) => { if (!wallet.account) return wallet.connect(); setBusy(name); setMessage(''); try { const hash = await sendTransaction(wallet.account, name, args, token); setMessage(`Confirmed onchain · ${shortenAddress(hash)}`); setBusy(''); onRefresh() } catch (err) { setMessage(err instanceof Error ? err.message : 'Transaction failed.'); setBusy('') } }
  return <><PageHeading eyebrow={`Campaign / ${String(campaign.id).padStart(2, '0')}`} title={campaign.title} action={<Button variant="quiet" to={`/app/campaigns/${campaign.id}/proof`} icon={<ExternalLink size={15} />}>Public proof</Button>} /><div className="workspace-grid"><div className="workspace-primary"><section className="campaign-hero panel"><div className="campaign-hero-top"><div><span className="pill green"><span className="status-dot" /> {isPast(campaign.deadline) ? 'closed' : 'accepting slots'}</span><p className="mono address-line">AGENCY {shortenAddress(campaign.agency)}</p></div><div className="hero-budget"><span>LOCKED BUDGET</span><b>{formatUnits(campaign.funded)} <small>USDC</small></b></div></div><p className="campaign-brief">{campaign.brief || 'Fixed payout campaign. Submit one public proof URL after the work is live.'}</p><div className="campaign-facts"><div><span>{isAgency ? 'MAX / SLOT' : 'YOUR SLOT'}</span><b>{isAgency ? `${formatUnits(campaign.payout)} USDC` : mySlot ? `${formatUnits(mySlot.payout)} USDC` : 'Set on join'}</b></div><div><span>SLOTS</span><b>{Number(campaign.joined)} / {Number(campaign.maxSlots)} filled</b></div><div><span>DEADLINE</span><b>{fmtDate(campaign.deadline)}</b></div><div><span>REVIEW WINDOW</span><b>{Number(campaign.reviewTimeout) / 3600} hours</b></div></div></section><section className="panel"><div className="panel-heading"><div><span className="eyebrow">Slot ledger</span><h2>Proof status</h2></div><span className="mono">{campaign.slots.length} participant records</span></div>{campaign.slots.length ? <div className="slot-list">{campaign.slots.map(slot => <SlotRowV2 key={slot.slotId} slot={slot} isAgency={Boolean(isAgency)} isOwn={slot.kol.toLowerCase() === wallet.account?.toLowerCase()} busy={busy} onApprove={() => act('approveProof', [BigInt(campaign.id), BigInt(slot.slotId)])} onReject={() => act('rejectProof', [BigInt(campaign.id), BigInt(slot.slotId), rejectReason || 'Please revise the proof and resubmit.'])} onRemove={() => act('removeKol', [BigInt(campaign.id), BigInt(slot.slotId)])} onSetPayout={(value) => act('setSlotPayout', [BigInt(campaign.id), BigInt(slot.slotId), toUnits(value)])} rejectReason={rejectReason} setRejectReason={setRejectReason} />)}</div> : <EmptyState title="No KOLs yet" body="Once a wallet accepts a slot, its proof state will appear here." />}</section></div><aside className="workspace-side"><section className="action-panel"><span className="eyebrow">Your role</span><h3>{isAgency ? 'Agency review desk' : mySlot ? 'KOL delivery slot' : 'Open campaign'}</h3>{isAgency ? <><p>You created this campaign. Review each submitted proof, adjust unsubmitted slot payouts, or remove a KOL before proof is submitted.</p>{isPast(campaign.deadline) && <Button onClick={() => act('withdrawUnused', [BigInt(campaign.id)])} disabled={Boolean(busy)}>{busy || 'Withdraw unused budget'}<ArrowRight size={15} /></Button>}</> : mySlot ? <><StatusBadge status={mySlot.status} /><p>{mySlot.status === 1 ? 'The agency has the proof. The timeout clock is running.' : mySlot.status === 3 ? `Rejected: ${mySlot.rejectionReason}` : mySlot.status === 0 ? `Your slot is reserved at ${formatUnits(mySlot.payout)} USDC. Submit the public link when the work is live.` : 'This slot has been settled.'}</p>{mySlot.status === 1 && Number(mySlot.submittedAt) * 1000 + Number(campaign.reviewTimeout) * 1000 < Date.now() && <Button onClick={() => act('claimAfterTimeout', [BigInt(campaign.id)])} disabled={Boolean(busy)}>{busy || 'Claim after timeout'}<Clock3 size={15} /></Button>}{(mySlot.status === 0 || mySlot.status === 3) && <form onSubmit={e => { e.preventDefault(); void act('submitProof', [BigInt(campaign.id), proof, note]) }}><label>Proof URL<input required type="url" value={proof} onChange={e => setProof(e.target.value)} placeholder="https://x.com/..." /></label><label>Note <span className="optional">optional</span><textarea value={note} onChange={e => setNote(e.target.value)} placeholder="What should the agency verify?" /></label><Button type="submit" disabled={Boolean(busy)}>{busy || (mySlot.status === 3 ? 'Resubmit proof' : 'Submit proof')}<ArrowRight size={15} /></Button></form>}</> : <><p>{campaign.inviteOnly ? 'This campaign is invite-only. Enter the code shared by the agency to claim an available slot.' : 'Claim one available slot and submit a public link when the work is complete.'}</p>{campaign.inviteOnly && <label>Campaign code<input value={inviteCode} onChange={e => setInviteCode(e.target.value)} placeholder="Enter invite code" /></label>}<Button onClick={() => act(campaign.inviteOnly ? 'acceptSlotWithCode' : 'acceptSlot', campaign.inviteOnly ? [BigInt(campaign.id), inviteCode.trim()] : [BigInt(campaign.id)])} disabled={!canJoin || Boolean(busy) || (campaign.inviteOnly && !inviteCode.trim())}>{busy || (wallet.account ? 'Claim slot' : 'Connect wallet')}<ArrowRight size={15} /></Button></>}</section><section className="panel side-details"><span className="eyebrow">Settlement notes</span><div><Check size={15} /> Full budget funded before joining</div><div><Check size={15} /> Slot payout is visible to its assigned KOL</div><div><Check size={15} /> Unused funds return after deadline</div><a href={txUrl('')} target="_blank" rel="noreferrer" className="disabled-link">View contract on explorer <ExternalLink size={13} /></a></section>{message && <div className={message.includes('failed') ? 'form-message error' : 'form-message'}>{message}</div>}</aside></div></>
}

function SlotRowV2({ slot, isAgency, isOwn, busy, onApprove, onReject, onRemove, onSetPayout, rejectReason, setRejectReason }: { slot: Slot; isAgency: boolean; isOwn: boolean; busy: string; onApprove: () => void; onReject: () => void; onRemove: () => void; onSetPayout: (value: string) => void; rejectReason: string; setRejectReason: (x: string) => void }) {
  const [payout, setPayout] = useState(formatUnits(slot.payout));
  const editable = isAgency && (slot.status === 0 || slot.status === 3);
  const visiblePayout = isAgency || isOwn ? `${formatUnits(slot.payout)} USDC` : 'Payout hidden';
  return <div className="slot-row"><div className="slot-person"><div className="slot-avatar">{slot.slotId + 1}</div><div><b>{shortenAddress(slot.kol)}</b><span>Slot {String(slot.slotId + 1).padStart(2, '0')} · {visiblePayout}</span></div></div><div className="slot-proof">{slot.proofUrl ? <a href={slot.proofUrl} target="_blank" rel="noreferrer"><Link2 size={14} />{slot.proofUrl.replace(/^https?:\/\//, '').slice(0, 34)} <ExternalLink size={12} /></a> : <span className="muted-text">Awaiting proof</span>}{slot.note && <p>{slot.note}</p>}{slot.rejectionReason && <p className="rejection-copy">{slot.rejectionReason}</p>}</div><div className="slot-action"><StatusBadge status={slot.status} />{editable && <div className="review-actions"><input type="number" min="0.01" max={formatUnits(slot.payout)} step="0.01" value={payout} onChange={e => setPayout(e.target.value)} aria-label="Slot payout in USDC" /><Button onClick={() => onSetPayout(payout)} disabled={Boolean(busy)}>Set payout</Button><Button variant="danger" onClick={onRemove} disabled={Boolean(busy)} icon={<X size={14} />}>Remove</Button></div>}{isAgency && slot.status === 1 && <div className="review-actions"><Button onClick={onApprove} disabled={Boolean(busy)} icon={<Check size={14} />}>Approve</Button><input value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Reason to reject" aria-label="Rejection reason" /><Button variant="danger" onClick={onReject} disabled={Boolean(busy)} icon={<X size={14} />}>Reject</Button></div>}</div></div>
}

function SlotRow({ slot, isAgency, busy, onApprove, onReject, rejectReason, setRejectReason }: { slot: Slot; isAgency: boolean; busy: string; onApprove: () => void; onReject: () => void; rejectReason: string; setRejectReason: (x: string) => void }) { return <div className="slot-row"><div className="slot-person"><div className="slot-avatar">{slot.slotId + 1}</div><div><b>{shortenAddress(slot.kol)}</b><span>Slot {String(slot.slotId + 1).padStart(2, '0')}</span></div></div><div className="slot-proof">{slot.proofUrl ? <a href={slot.proofUrl} target="_blank" rel="noreferrer"><Link2 size={14} />{slot.proofUrl.replace(/^https?:\/\//, '').slice(0, 34)} <ExternalLink size={12} /></a> : <span className="muted-text">Awaiting proof</span>}{slot.note && <p>{slot.note}</p>}{slot.rejectionReason && <p className="rejection-copy">{slot.rejectionReason}</p>}</div><div className="slot-action"><StatusBadge status={slot.status} />{isAgency && slot.status === 1 && <div className="review-actions"><Button onClick={onApprove} disabled={Boolean(busy)} icon={<Check size={14} />}>Approve</Button><input value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Reason to reject" aria-label="Rejection reason" /><Button variant="danger" onClick={onReject} disabled={Boolean(busy)} icon={<X size={14} />}>Reject</Button></div>}</div></div> }
function StatusBadge({ status }: { status: number }) { return <span className={`pill ${statusClass[status] || 'open'}`}>{statusNames[status] || 'Open'}</span> }

function ReviewQueue({ campaigns, account }: { campaigns: Campaign[]; account?: string }) { const pending = campaigns.filter(c => c.agency.toLowerCase() === account?.toLowerCase()).flatMap(c => c.slots.filter(s => s.status === 1).map(s => ({ c, s }))); return <><PageHeading eyebrow="Agency / review queue" title="Proofs waiting on you." action={<Button variant="quiet" onClick={() => window.location.reload()} icon={<RefreshCw size={15} />}>Refresh</Button>} />{pending.length ? <div className="queue-list">{pending.map(({ c, s }) => <Link to={`/app/campaigns/${c.id}`} className="queue-row" key={`${c.id}-${s.slotId}`}><div className="queue-icon"><FileCheck2 size={18} /></div><div><b>{c.title}</b><span>{shortenAddress(s.kol)} · proof submitted</span></div><div><strong>{formatUnits(s.payout)} USDC</strong><span>ready to release</span></div><ArrowRight size={16} /></Link>)}</div> : <EmptyState title="Queue is clear" body="Submitted proofs will appear here as KOLs deliver work." action={<Button to="/app/campaigns">View campaigns</Button>} />}</> }

function WalletPage({ wallet }: { wallet: ReturnType<typeof useWallet> }) {
  const [balance, setBalance] = useState('—');
  useEffect(() => {
    if (!wallet.account || !USDC_ADDRESS) return;
    const fetchBalance = () => {
      publicClient.readContract({ address: USDC_ADDRESS, abi: tokenAbi, functionName: 'balanceOf', args: [wallet.account!] })
        .then(v => setBalance(formatUnits(v as bigint)))
        .catch(() => setBalance('—'))
    }
    fetchBalance();
    const delayTimer = window.setTimeout(fetchBalance, 1500);
    const interval = window.setInterval(fetchBalance, 8000);
    return () => {
      window.clearTimeout(delayTimer);
      window.clearInterval(interval);
    }
  }, [wallet.account]);
  return <><PageHeading eyebrow="Wallet / settlement" title="Your signing desk." action={<WalletButton account={wallet.account} onConnect={wallet.connect} />} /><div className="wallet-grid"><section className="wallet-card panel"><span className="eyebrow">Connected account</span><div className="big-address">{wallet.account ? shortenAddress(wallet.account) : 'Not connected'}</div><p>{wallet.account || 'Connect an EVM wallet to create, join, and settle campaigns.'}</p><div className="wallet-line"><span>Network</span><b>{wallet.chainId === 10143 ? 'Monad testnet' : wallet.chainId ? `Chain ${wallet.chainId}` : 'Not detected'}</b></div><div className="wallet-line"><span>USDC balance</span><b>{balance} USDC</b></div></section><section className="panel"><span className="eyebrow">Contracts</span><div className="contract-line"><span>BatchEscrow</span><code>{ESCROW_ADDRESS ? shortenAddress(ESCROW_ADDRESS) : 'Not configured'}</code></div><div className="contract-line"><span>Monad testnet USDC</span><code>{USDC_ADDRESS ? shortenAddress(USDC_ADDRESS) : 'Not configured'}</code></div><p className="form-help"><ShieldCheck size={14} /> All payout state is read from the deployed contracts. There is no app account database.</p></section></div></>
}

function PublicProof({ campaigns }: { campaigns: Campaign[] }) { const { id } = useParams(); const campaign = campaigns.find(c => c.id === Number(id)); if (!campaign) return <div className="public-page"><Link to="/" className="wordmark">Escrow</Link><EmptyState title="Proof not found" body="This campaign is not indexed yet." /></div>; return <div className="public-page"><header className="public-head"><Link to="/" className="wordmark">Escrow</Link><span className="pill green"><span className="status-dot" /> Public proof</span></header><main className="public-main"><span className="eyebrow">Campaign / {String(campaign.id).padStart(2, '0')}</span><h1>{campaign.title}</h1><p>{campaign.brief}</p><div className="public-stats"><div><b>{formatUnits(campaign.funded)}</b><span>USDC locked</span></div><div><b>{Number(campaign.joined)} / {Number(campaign.maxSlots)}</b><span>slots filled</span></div><div><b>{formatUnits(campaign.paid)}</b><span>USDC paid out</span></div></div><div className="public-ledger"><div className="panel-heading"><div><span className="eyebrow">Onchain slot ledger</span><h2>Proof timeline</h2></div><code>{shortenAddress(ESCROW_ADDRESS)}</code></div>{campaign.slots.map(s => <div className="public-row" key={s.slotId}><div className="slot-avatar">{s.slotId + 1}</div><div><b>{shortenAddress(s.kol)}</b><span>{s.proofUrl || 'No proof submitted yet'}</span></div><StatusBadge status={s.status} /></div>)}</div><div className="public-footer"><span>Deadline {fmtDate(campaign.deadline)}</span><span>Review timeout {Number(campaign.reviewTimeout) / 3600}h</span><span>Maximum payout {formatUnits(campaign.payout)} USDC</span></div></main></div> }

function RouteLoading() { return <div className="route-loading"><div className="loading-bar" /><span className="eyebrow">Checking wallet session</span></div> }

function CampaignDetailV3({ campaigns, wallet, onRefresh }: { campaigns: Campaign[]; wallet: ReturnType<typeof useWallet>; onRefresh: () => void }) {
  const { id } = useParams(); const campaign = campaigns.find(c => c.id === Number(id)); const [busy, setBusy] = useState(''); const [proof, setProof] = useState(''); const [note, setNote] = useState(''); const [inviteCode, setInviteCode] = useState(() => new URLSearchParams(window.location.search).get('code') || ''); const [rejectReason, setRejectReason] = useState(''); const [message, setMessage] = useState(''); const [txHash, setTxHash] = useState('')
  if (!campaign) return <EmptyState title="Campaign not found" body="This campaign is not indexed yet or the address is incorrect." action={<Button to="/app/campaigns">Back to campaigns</Button>} />
  const isAgency = wallet.account?.toLowerCase() === campaign.agency.toLowerCase(); const mySlot = campaign.slots.find(s => s.kol.toLowerCase() === wallet.account?.toLowerCase() && s.status !== 5); const canJoin = !isAgency && !mySlot && !isPast(campaign.deadline) && campaign.joined < campaign.maxSlots && Boolean(wallet.account); const agencyInviteCode = isAgency && campaign.inviteOnly ? window.localStorage.getItem(`escrow:invite:${campaign.id}`) || '' : ''; const locked = campaign.funded >= campaign.paid + campaign.withdrawn ? campaign.funded - campaign.paid - campaign.withdrawn : 0n
  const act = async (name: Parameters<typeof sendTransaction>[1], args: readonly unknown[] = [], token = false) => { if (!wallet.account) { void wallet.connect(); return } setBusy(name); setMessage(''); setTxHash(''); try { const hash = await sendTransaction(wallet.account, name, args, token); setTxHash(hash); setMessage(`Confirmed onchain: ${shortenAddress(hash)}`); setBusy(''); onRefresh() } catch (err) { setMessage(err instanceof Error ? err.message : 'Transaction failed.'); setBusy('') } }
  const updateSlotPayout = async (slotId: number, value: string) => { if (!wallet.account) { void wallet.connect(); return } const nextPayout = toUnits(value); if (nextPayout <= 0n) { setMessage('Enter a payout greater than zero.'); return } const reservedByOtherSlots = campaign.slots.filter(item => item.slotId !== slotId && !item.paid && item.status !== 5).reduce((sum, item) => sum + item.payout, 0n); const available = campaign.funded - campaign.paid - campaign.withdrawn - reservedByOtherSlots; setBusy('Checking payout'); setMessage(''); setTxHash(''); try { if (nextPayout > available) { const additional = nextPayout - available; setBusy('Approving extra USDC'); await sendTransaction(wallet.account, 'approve', [ESCROW_ADDRESS, additional], true); setBusy('Adding escrow'); await sendTransaction(wallet.account, 'fundAdditional', [BigInt(campaign.id), additional]); } setBusy('Saving payout'); const hash = await sendTransaction(wallet.account, 'setSlotPayout', [BigInt(campaign.id), BigInt(slotId), nextPayout]); setTxHash(hash); setMessage(`Payout updated onchain: ${shortenAddress(hash)}`); setBusy(''); onRefresh() } catch (err) { setMessage(err instanceof Error ? err.message : 'Payout update failed.'); setBusy('') } }
  // fundCampaign: routes to correct contract function based on current funded state
  // - funded == 0 → use fundCampaign() (no args, contract computes payout*maxSlots)
  // - funded > 0  → use fundAdditional(campaignId, amount) for top-up
  const fundCampaign = async () => {
    if (!wallet.account) { void wallet.connect(); return }
    setBusy('Approving USDC'); setMessage(''); setTxHash('');
    try {
      if (campaign.funded === 0n) {
        // First-time fund: contract calculates exact amount (payout * maxSlots)
        const totalNeeded = campaign.payout * campaign.maxSlots
        await sendTransaction(wallet.account, 'approve', [ESCROW_ADDRESS, totalNeeded], true)
        setBusy('Funding campaign')
        const hash = await sendTransaction(wallet.account, 'fundCampaign', [BigInt(campaign.id)])
        setTxHash(hash); setMessage(`Campaign funded: ${shortenAddress(hash)}`); setBusy(''); onRefresh()
      } else {
        // Top-up: fund only the remaining shortfall
        const shortfall = requiredBudget - locked
        await sendTransaction(wallet.account, 'approve', [ESCROW_ADDRESS, shortfall], true)
        setBusy('Funding campaign')
        const hash = await sendTransaction(wallet.account, 'fundAdditional', [BigInt(campaign.id), shortfall])
        setTxHash(hash); setMessage(`Campaign topped up: ${shortenAddress(hash)}`); setBusy(''); onRefresh()
      }
    } catch (err) { setMessage(err instanceof Error ? err.message : 'Fund failed.'); setBusy('') }
  }
  const requiredBudget = campaign.payout * campaign.maxSlots
  const needsFunding = isAgency && locked < requiredBudget && campaign.maxSlots > campaign.joined
  // Campaign has been "closed" by Release unfilled budget: maxSlots was set = joined, no new slots possible
  const isReleasedClosed = isAgency && campaign.funded > 0n && locked === 0n && campaign.maxSlots === campaign.joined && campaign.joined < BigInt(campaign.slots.filter(s => s.status !== 5).length + 1)
  const activeSlots = campaign.slots.filter(slot => slot.status !== 5)
  return (
    <>
      <PageHeading
        eyebrow={`Campaign / ${String(campaign.id).padStart(2, '0')}`}
        title={campaign.title}
        action={<Button variant="quiet" to={`/app/campaigns/${campaign.id}/proof`} icon={<ExternalLink size={15} />}>Public proof</Button>}
      />
      <div className="workspace-grid">
        <div className="workspace-primary">
          <section className="campaign-hero panel">
            <div className="campaign-hero-top">
              <div>
                <span className="pill green">
                  <span className="status-dot" /> {isPast(campaign.deadline) ? 'closed' : campaign.inviteOnly ? 'private campaign' : 'public campaign'}
                </span>
                <p className="mono address-line">AGENCY {shortenAddress(campaign.agency)}</p>
              </div>
              <div className="hero-budget">
                <span>LOCKED BUDGET</span>
                <b>{formatUnits(locked)} <small>USDC</small></b>
              </div>
            </div>
            <p className="campaign-brief">{campaign.brief || 'Fixed payout campaign. Submit one public proof URL after the work is live.'}</p>
            <div className="campaign-facts">
              <div>
                <span>{isAgency ? 'STARTING / SLOT' : 'YOUR SLOT'}</span>
                <b>{isAgency ? `${formatUnits(campaign.payout)} USDC` : mySlot ? `${formatUnits(mySlot.payout)} USDC` : 'Set on join'}</b>
              </div>
              <div>
                <span>SLOTS</span>
                <b>{Number(campaign.joined)} / {Number(campaign.maxSlots)} filled</b>
              </div>
              <div>
                <span>DEADLINE</span>
                <b>{fmtDate(campaign.deadline)}</b>
              </div>
              <div>
                <span>REVIEW WINDOW</span>
                <b>{Number(campaign.reviewTimeout) / 3600} hours</b>
              </div>
            </div>
          </section>
          <section className="panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">Slot ledger</span>
                <h2>Proof status</h2>
              </div>
              <span className="mono">{activeSlots.length} participant records</span>
            </div>
            {activeSlots.length ? (
              <div className="slot-list">
                {activeSlots.map(slot => (
                  <SlotRowV3
                    key={slot.slotId}
                    slot={slot}
                    isAgency={Boolean(isAgency)}
                    isOwn={slot.kol.toLowerCase() === wallet.account?.toLowerCase()}
                    busy={busy}
                    onApprove={() => void act('approveProof', [BigInt(campaign.id), BigInt(slot.slotId)])}
                    onReject={() => void act('rejectProof', [BigInt(campaign.id), BigInt(slot.slotId), rejectReason || 'Please revise the proof and resubmit.'])}
                    onRemove={() => void act('removeKol', [BigInt(campaign.id), BigInt(slot.slotId)])}
                    onSetPayout={value => void updateSlotPayout(slot.slotId, value)}
                    rejectReason={rejectReason}
                    setRejectReason={setRejectReason}
                  />
                ))}
              </div>
            ) : (
              <EmptyState title="No KOLs yet" body="Once a wallet accepts a slot, its proof state will appear here." />
            )}
          </section>
        </div>
        <aside className="workspace-side">
          <section className="action-panel">
            <span className="eyebrow">Your role</span>
            <h3>{isAgency ? 'Agency review desk' : mySlot ? 'KOL delivery slot' : 'Open campaign'}</h3>
            {isAgency ? (
              <>
                <p>You created this campaign. Review each submitted proof, adjust unsubmitted slot payouts, or remove a KOL before proof is submitted.</p>
                {campaign.inviteOnly && (
                  <div className="campaign-code-card">
                    <div>
                      <span className="eyebrow">Agency invite code</span>
                      <code>{agencyInviteCode || 'Only available on the creation device'}</code>
                    </div>
                    {agencyInviteCode && (
                      <button type="button" aria-label="Copy agency invite code" onClick={() => { void navigator.clipboard.writeText(agencyInviteCode); setMessage('Invite code copied.') }}>
                        <Copy size={16} />
                      </button>
                    )}
                  </div>
                )}
                {needsFunding && (
                  <div className="fund-campaign-card" style={{ background: 'var(--surface-2, rgba(255,200,50,0.08))', border: '1px solid var(--warning-border, rgba(255,200,50,0.25))', borderRadius: '0.75rem', padding: '1rem', marginBottom: '1rem' }}>
                    <span className="eyebrow" style={{ color: 'var(--warning-text, #f5c542)' }}>⚠ Campaign needs funding</span>
                    <p style={{ fontSize: '0.85rem', opacity: 0.8, margin: '0.35rem 0 0.75rem' }}>This campaign requires <b>{formatUnits(requiredBudget - locked)} USDC</b> to cover {Number(campaign.maxSlots - campaign.joined)} unfilled slot{Number(campaign.maxSlots - campaign.joined) > 1 ? 's' : ''}. KOLs cannot join until the budget is funded.</p>
                    <Button onClick={() => void fundCampaign()} disabled={Boolean(busy)} icon={<Zap size={15} />}>
                      {busy || `Fund ${formatUnits(requiredBudget - locked)} USDC`}
                    </Button>
                  </div>
                )}
                {isReleasedClosed && (
                  <div style={{ background: 'rgba(100,100,100,0.12)', border: '1px solid rgba(150,150,150,0.2)', borderRadius: '0.75rem', padding: '1rem', marginBottom: '1rem' }}>
                    <span className="eyebrow" style={{ opacity: 0.7 }}>ℹ Budget released</span>
                    <p style={{ fontSize: '0.85rem', opacity: 0.7, margin: '0.35rem 0 0.75rem' }}>You released the unfilled budget. The remaining slots are permanently closed — no new KOLs can join. Existing KOL slots are still covered.</p>
                    <Button to="/app/campaigns/new" icon={<Plus size={15} />}>Create new campaign</Button>
                  </div>
                )}
                {Number(campaign.joined) < Number(campaign.maxSlots) && locked > 0n && (
                  <Button onClick={() => void act('releaseUnfilled', [BigInt(campaign.id)])} disabled={Boolean(busy)}>
                    {busy || 'Release unfilled budget'}<ArrowRight size={15} />
                  </Button>
                )}
                {isPast(campaign.deadline) && (
                  <Button onClick={() => void act('withdrawUnused', [BigInt(campaign.id)])} disabled={Boolean(busy)}>
                    {busy || 'Withdraw unused budget'}<ArrowRight size={15} />
                  </Button>
                )}
              </>
            ) : mySlot ? (
              <>
                <StatusBadge status={mySlot.status} />
                <p>{mySlot.status === 1 ? 'The agency has the proof. The timeout clock is running.' : mySlot.status === 3 ? `Rejected: ${mySlot.rejectionReason}` : mySlot.status === 0 ? `Your slot is reserved at ${formatUnits(mySlot.payout)} USDC. Submit the public link when the work is live.` : 'This slot has been settled.'}</p>
                {mySlot.status === 1 && Number(mySlot.submittedAt) * 1000 + Number(campaign.reviewTimeout) * 1000 < Date.now() && (
                  <Button onClick={() => void act('claimAfterTimeout', [BigInt(campaign.id)])} disabled={Boolean(busy)}>
                    {busy || 'Claim after timeout'}<Clock3 size={15} />
                  </Button>
                )}
                {(mySlot.status === 0 || mySlot.status === 3) && (
                  <form onSubmit={e => { e.preventDefault(); void act('submitProof', [BigInt(campaign.id), proof, note]) }}>
                    <label>Proof URL<input required type="url" value={proof} onChange={e => setProof(e.target.value)} placeholder="https://x.com/..." /></label>
                    <label>Note <span className="optional">optional</span><textarea value={note} onChange={e => setNote(e.target.value)} placeholder="What should the agency verify?" /></label>
                    <Button type="submit" disabled={Boolean(busy)}>{busy || (mySlot.status === 3 ? 'Resubmit proof' : 'Submit proof')}<ArrowRight size={15} /></Button>
                  </form>
                )}
              </>
            ) : (
              <>
                <p>{campaign.inviteOnly ? 'This campaign is invite-only. Enter the code shared by the agency to claim an available slot.' : 'Claim one available slot and submit a public link when the work is complete.'}</p>
                {campaign.inviteOnly && (
                  <label>Campaign code<input value={inviteCode} onChange={e => setInviteCode(e.target.value)} placeholder="Enter invite code" /></label>
                )}
                <Button onClick={() => void act(campaign.inviteOnly ? 'acceptSlotWithCode' : 'acceptSlot', campaign.inviteOnly ? [BigInt(campaign.id), inviteCode.trim()] : [BigInt(campaign.id)])} disabled={!canJoin || Boolean(busy) || (campaign.inviteOnly && !inviteCode.trim())}>
                  {busy || 'Claim slot'}<ArrowRight size={15} />
                </Button>
              </>
            )}
          </section>
          <section className="panel side-details">
            <span className="eyebrow">Settlement notes</span>
            <div><Check size={15} /> Full budget funded before joining</div>
            <div><Check size={15} /> Slot payout is visible to its assigned KOL</div>
            <div><Check size={15} /> Unused funds return after deadline</div>
            <a href={addressUrl(ESCROW_ADDRESS)} target="_blank" rel="noreferrer" className="explorer-link">
              View contract on explorer <ExternalLink size={13} />
            </a>
          </section>
          {message && (
            <div className={message.includes('failed') || message.includes('Enter') ? 'form-message error' : 'form-message'}>
              <div>{message}</div>
              {txHash && (
                <a href={txUrl(txHash)} target="_blank" rel="noreferrer" className="msg-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.4rem', textDecoration: 'underline', color: 'inherit' }}>
                  View transaction <ExternalLink size={12} />
                </a>
              )}
            </div>
          )}
        </aside>
      </div>
    </>
  )
}

function SlotRowV3({ slot, isAgency, isOwn, busy, onApprove, onReject, onRemove, onSetPayout, rejectReason, setRejectReason }: { slot: Slot; isAgency: boolean; isOwn: boolean; busy: string; onApprove: () => void; onReject: () => void; onRemove: () => void; onSetPayout: (value: string) => void; rejectReason: string; setRejectReason: (x: string) => void }) {
  const [payout, setPayout] = useState(formatUnits(slot.payout)); const editable = isAgency && (slot.status === 0 || slot.status === 3); const visiblePayout = isAgency || isOwn ? `${formatUnits(slot.payout)} USDC` : 'Payout hidden'
  useEffect(() => setPayout(formatUnits(slot.payout)), [slot.payout])
  return <div className="slot-row"><div className="slot-person"><div className="slot-avatar">{slot.slotId + 1}</div><div><b>{shortenAddress(slot.kol)}</b><span>Slot {String(slot.slotId + 1).padStart(2, '0')} · {visiblePayout}</span></div></div><div className="slot-proof">{slot.proofUrl ? <a href={slot.proofUrl} target="_blank" rel="noreferrer"><Link2 size={14} />{slot.proofUrl.replace(/^https?:\/\//, '').slice(0, 34)} <ExternalLink size={12} /></a> : <span className="muted-text">Awaiting proof</span>}{slot.note && <p>{slot.note}</p>}{slot.rejectionReason && <p className="rejection-copy">{slot.rejectionReason}</p>}</div><div className="slot-action"><StatusBadge status={slot.status} />{editable && <div className="review-actions"><input type="number" min="0.01" step="0.01" value={payout} onChange={e => setPayout(e.target.value)} aria-label="Slot payout in USDC" /><Button onClick={() => onSetPayout(payout)} disabled={Boolean(busy)}>Save payout</Button><Button variant="danger" onClick={onRemove} disabled={Boolean(busy)} icon={<X size={14} />}>Remove</Button></div>}{isAgency && slot.status === 1 && <div className="review-actions"><Button onClick={onApprove} disabled={Boolean(busy)} icon={<Check size={14} />}>Approve</Button><input value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Reason to reject" aria-label="Rejection reason" /><Button variant="danger" onClick={onReject} disabled={Boolean(busy)} icon={<X size={14} />}>Reject</Button></div>}</div></div>
}

function App() { const wallet = useWallet(); const { theme, toggleTheme } = useTheme(); const [refreshKey, setRefreshKey] = useState(0); const { campaigns, loading, reload } = useCampaigns(refreshKey); const refresh = () => { setRefreshKey(x => x + 1); void reload(); setTimeout(() => { void reload() }, 1500) }; const appRoute = !wallet.ready ? <RouteLoading /> : wallet.account ? <AppShell wallet={wallet} theme={theme} onToggleTheme={toggleTheme} refreshKey={refreshKey}><Routes><Route index element={<Overview campaigns={campaigns} wallet={wallet} onRefresh={refresh} />} /><Route path="campaigns" element={<CampaignList campaigns={campaigns} account={wallet.account} loading={loading} />} /><Route path="campaigns/new" element={<CreateCampaign wallet={wallet} onRefresh={refresh} />} /><Route path="campaigns/:id" element={<CampaignDetail campaigns={campaigns} wallet={wallet} onRefresh={refresh} />} /><Route path="campaigns/:id/proof" element={<PublicProof campaigns={campaigns} />} /><Route path="submissions" element={<ReviewQueue campaigns={campaigns} account={wallet.account} />} /><Route path="wallet" element={<WalletPage wallet={wallet} />} /></Routes></AppShell> : <Navigate to="/" replace />; return <Routes><Route path="/" element={<Landing wallet={wallet} theme={theme} onToggleTheme={toggleTheme} />} /><Route path="/campaigns/:id/proof" element={<PublicProof campaigns={campaigns} />} /><Route path="/app/*" element={appRoute} /></Routes> }

export default App
