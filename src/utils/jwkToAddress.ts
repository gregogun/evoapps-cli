import fs from 'fs'
import { arweave } from '../lib/arweave'

export const jwkToAddress = async (walletPath: string): Promise<string> => {
  const jwk = JSON.parse(
    fs.readFileSync(`${process.cwd()}/${walletPath.replace('./', '')}`, 'utf8')
  )

  const address = await arweave.wallets.jwkToAddress(jwk)

  return address
}

module.exports = { jwkToAddress }
