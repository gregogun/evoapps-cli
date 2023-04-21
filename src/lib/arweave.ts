import Arweave from 'arweave'
import { Contract, WarpFactory, LoggerFactory } from 'warp-contracts'

export const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https',
})

export const warp = WarpFactory.forMainnet()
LoggerFactory.INST.logLevel('none')

export const getPrevBalances = async (contractId: string) => {
  const contract: Contract = warp.contract(contractId)

  const { cachedValue }: { cachedValue: any } = await contract.readState()
  return cachedValue.state.balances
}

module.exports = { arweave, getPrevBalances, warp }
