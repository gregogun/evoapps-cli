import ArLocal from 'arlocal'
import Arweave from 'arweave'
;(async () => {
  const arLocal = new ArLocal()

  // create local testing environment
  await arLocal.start()

  // your tests here

  // create local Arweave gateway
  const arweave = Arweave.init({
    host: 'localhost',
    port: 1984,
    protocol: 'http',
  })
  // generate wallet
  const wallet = await arweave.wallets.generate()
  // convert wallet jwk interface to address
  const addr = arweave.wallets.jwkToAddress(wallet)
  // airdrop amount of tokens (in winston) to wallet
  await arweave.api.get(`mint/${addr}/${1e12}`)
  // create mine function
  // const mine = () => arweave.api.get('mine')

  // create asset

  // get asset

  // shut down testing environment
  await arLocal.stop()
})()
