import { createPublicClient, createWalletClient, custom, http, type Address } from 'viem'
import { monadTestnet } from 'viem/chains'

export const RPC_URL = import.meta.env.VITE_MONAD_RPC_URL || 'https://testnet-rpc.monad.xyz'
export const ESCROW_ADDRESS = (import.meta.env.VITE_BATCH_ESCROW_ADDRESS || '') as Address
export const USDC_ADDRESS = (import.meta.env.VITE_USDC_ADDRESS || '') as Address
export const MOCK_USDC_ADDRESS = USDC_ADDRESS
export const isConfigured = Boolean(ESCROW_ADDRESS && USDC_ADDRESS)

export const publicClient = createPublicClient({ chain: monadTestnet, transport: http(RPC_URL) })

export const escrowAbi = [
  { type: 'function', name: 'campaignCount', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'getCampaign', stateMutability: 'view', inputs: [{ name: 'campaignId', type: 'uint256' }], outputs: [{ type: 'tuple', components: [{ name: 'agency', type: 'address' }, { name: 'token', type: 'address' }, { name: 'title', type: 'string' }, { name: 'brief', type: 'string' }, { name: 'payout', type: 'uint256' }, { name: 'maxSlots', type: 'uint256' }, { name: 'deadline', type: 'uint256' }, { name: 'reviewTimeout', type: 'uint256' }, { name: 'funded', type: 'uint256' }, { name: 'paid', type: 'uint256' }, { name: 'withdrawn', type: 'uint256' }, { name: 'joined', type: 'uint256' }, { name: 'createdAt', type: 'uint256' }, { name: 'inviteOnly', type: 'bool' }, { name: 'inviteCodeHash', type: 'bytes32' }] }] },
  { type: 'function', name: 'getSlotCount', stateMutability: 'view', inputs: [{ name: 'campaignId', type: 'uint256' }], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'getSlot', stateMutability: 'view', inputs: [{ name: 'campaignId', type: 'uint256' }, { name: 'slotId', type: 'uint256' }], outputs: [{ type: 'tuple', components: [{ name: 'kol', type: 'address' }, { name: 'proofUrl', type: 'string' }, { name: 'note', type: 'string' }, { name: 'rejectionReason', type: 'string' }, { name: 'payout', type: 'uint256' }, { name: 'submittedAt', type: 'uint256' }, { name: 'status', type: 'uint8' }, { name: 'paid', type: 'bool' }] }] },
  { type: 'function', name: 'getSlotFor', stateMutability: 'view', inputs: [{ name: 'campaignId', type: 'uint256' }, { name: 'kol', type: 'address' }], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'createCampaign', stateMutability: 'nonpayable', inputs: [{ name: 'token', type: 'address' }, { name: 'title', type: 'string' }, { name: 'brief', type: 'string' }, { name: 'payout', type: 'uint256' }, { name: 'maxSlots', type: 'uint256' }, { name: 'deadline', type: 'uint256' }, { name: 'reviewTimeout', type: 'uint256' }, { name: 'inviteOnly', type: 'bool' }, { name: 'inviteCodeHash', type: 'bytes32' }], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'fundCampaign', stateMutability: 'nonpayable', inputs: [{ name: 'campaignId', type: 'uint256' }], outputs: [] },
  { type: 'function', name: 'fundAdditional', stateMutability: 'nonpayable', inputs: [{ name: 'campaignId', type: 'uint256' }, { name: 'amount', type: 'uint256' }], outputs: [] },
  { type: 'function', name: 'acceptSlot', stateMutability: 'nonpayable', inputs: [{ name: 'campaignId', type: 'uint256' }], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'acceptSlotWithCode', stateMutability: 'nonpayable', inputs: [{ name: 'campaignId', type: 'uint256' }, { name: 'inviteCode', type: 'string' }], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'setSlotPayout', stateMutability: 'nonpayable', inputs: [{ name: 'campaignId', type: 'uint256' }, { name: 'slotId', type: 'uint256' }, { name: 'payout', type: 'uint256' }], outputs: [] },
  { type: 'function', name: 'removeKol', stateMutability: 'nonpayable', inputs: [{ name: 'campaignId', type: 'uint256' }, { name: 'slotId', type: 'uint256' }], outputs: [] },
  { type: 'function', name: 'submitProof', stateMutability: 'nonpayable', inputs: [{ name: 'campaignId', type: 'uint256' }, { name: 'proofUrl', type: 'string' }, { name: 'note', type: 'string' }], outputs: [] },
  { type: 'function', name: 'approveProof', stateMutability: 'nonpayable', inputs: [{ name: 'campaignId', type: 'uint256' }, { name: 'slotId', type: 'uint256' }], outputs: [] },
  { type: 'function', name: 'rejectProof', stateMutability: 'nonpayable', inputs: [{ name: 'campaignId', type: 'uint256' }, { name: 'slotId', type: 'uint256' }, { name: 'reason', type: 'string' }], outputs: [] },
  { type: 'function', name: 'claimAfterTimeout', stateMutability: 'nonpayable', inputs: [{ name: 'campaignId', type: 'uint256' }], outputs: [] },
  { type: 'function', name: 'withdrawUnused', stateMutability: 'nonpayable', inputs: [{ name: 'campaignId', type: 'uint256' }], outputs: [] },
] as const

export const tokenAbi = [
  { type: 'function', name: 'mint', stateMutability: 'nonpayable', inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [] },
  { type: 'function', name: 'approve', stateMutability: 'nonpayable', inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ type: 'bool' }] },
  { type: 'function', name: 'balanceOf', stateMutability: 'view', inputs: [{ name: 'owner', type: 'address' }], outputs: [{ type: 'uint256' }] },
] as const

export type TxName = 'createCampaign' | 'fundCampaign' | 'fundAdditional' | 'acceptSlot' | 'acceptSlotWithCode' | 'setSlotPayout' | 'removeKol' | 'submitProof' | 'approveProof' | 'rejectProof' | 'claimAfterTimeout' | 'withdrawUnused' | 'approve'

export async function sendTransaction(account: Address, functionName: TxName, args: readonly unknown[] = [], token = false) {
  if (!window.ethereum) throw new Error('No injected wallet found. Install MetaMask or another EVM wallet.')
  if (!isConfigured) throw new Error('Contracts are not configured yet. Add the BatchEscrow and Monad testnet USDC addresses to .env.')
  const wallet = createWalletClient({ account, chain: monadTestnet, transport: custom(window.ethereum) })
  const hash = await wallet.writeContract({ address: token ? USDC_ADDRESS : ESCROW_ADDRESS, abi: token ? tokenAbi : escrowAbi, functionName: functionName as never, args: args as never, account })
  await publicClient.waitForTransactionReceipt({ hash })
  return hash
}

export function formatUnits(value: bigint | number | string, decimals = 6) {
  const raw = BigInt(value)
  const whole = raw / 10n ** BigInt(decimals)
  const fraction = (raw % 10n ** BigInt(decimals)).toString().padStart(decimals, '0').slice(0, 2)
  return `${whole.toString()}.${fraction}`
}

export function toUnits(value: string, decimals = 6) {
  const [whole, fraction = ''] = value.trim().split('.')
  return BigInt(whole || '0') * 10n ** BigInt(decimals) + BigInt((fraction + '0'.repeat(decimals)).slice(0, decimals) || '0')
}

export function shortenAddress(address?: string) { return address ? `${address.slice(0, 6)}…${address.slice(-4)}` : 'Not connected' }
export function txUrl(hash: string) { return `https://testnet.monadexplorer.com/tx/${hash}` }

declare global {
  interface Window { ethereum?: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown>; on?: (event: string, handler: (...args: unknown[]) => void) => void; removeListener?: (event: string, handler: (...args: unknown[]) => void) => void } }
}
