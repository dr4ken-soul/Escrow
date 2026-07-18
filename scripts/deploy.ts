import 'dotenv/config'
import { createWalletClient, http, publicActions } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { monadTestnet } from 'viem/chains'
import fs from 'node:fs'
import path from 'node:path'

const key = process.env.DEPLOYER_PRIVATE_KEY as `0x${string}` | undefined
if (!key) throw new Error('Set DEPLOYER_PRIVATE_KEY in .env before deploying.')

const artifact = (name: string) => JSON.parse(fs.readFileSync(path.resolve(`artifacts/contracts/${name}.sol/${name}.json`), 'utf8'))
const account = privateKeyToAccount(key)
const client = createWalletClient({ account, chain: monadTestnet, transport: http(process.env.MONAD_RPC_URL || 'https://testnet-rpc.monad.xyz') }).extend(publicActions)

async function deploy(name: string) {
  const built = artifact(name)
  const gasPrice = await client.getGasPrice()
  const hash = await client.deployContract({ abi: built.abi, bytecode: built.bytecode, account, gasPrice })
  const receipt = await client.waitForTransactionReceipt({ hash })
  if (!receipt.contractAddress) throw new Error(`${name} deployment did not return an address.`)
  return receipt.contractAddress
}

const batchEscrow = await deploy('BatchEscrow')
console.log('USDC: use the existing Monad testnet USDC address from VITE_USDC_ADDRESS')
console.log(`BatchEscrow: ${batchEscrow}`)
console.log(`BatchEscrow explorer: https://testnet.monadexplorer.com/address/${batchEscrow}`)
