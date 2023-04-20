import AssetSDK from '@permaweb/asset-sdk'
import Bundlr from '@bundlr-network/client'
import { WarpFactory } from 'warp-contracts'
import fs from 'fs'
import { Args, Manifest } from '../types'
import { arweave } from './arweave'
import graph from '@permaweb/asset-graph'
import { jwkToAddress } from '../utils/jwkToAddress'

export const getAsset = async ({
  id,
  walletPath,
}: Pick<Args, 'id' | 'walletPath'>) => {
  const jwk = JSON.parse(fs.readFileSync(walletPath, 'utf-8'))
  const bundlr = new Bundlr('https://node2.bundlr.network', 'arweave', jwk)
  const warp = WarpFactory.forMainnet()

  const SDK = AssetSDK.init({ arweave, bundlr, warp, wallet: jwk })

  const result = await SDK.get(id, 'app')

  return result
}

export const getAssetGroup = async (id: string) => {
  const res = await graph(id)

  return res
}

export const createAsset = async (
  {
    appId,
    title,
    description,
    topics,
    forks,
    walletPath,
    balances,
    notes,
  }: Args,
  manifest: Manifest
) => {
  const jwk = JSON.parse(fs.readFileSync(walletPath, 'utf-8'))
  const bundlr = new Bundlr('https://node2.bundlr.network', 'arweave', jwk)
  const warp = WarpFactory.forMainnet()

  const SDK = AssetSDK.init({ arweave, bundlr, warp, wallet: jwk })

  const formattedBalances = await jwkToAddress(walletPath).then((address) => {
    return {
      [address]: Number(balances),
    }
  })

  const formattedTopics = topics
    .split(/[ ,]+/)
    .filter((element) => element !== '')

  const result = await SDK.create({
    groupId: appId,
    type: 'app',
    title,
    description,
    topics: formattedTopics,
    balances: formattedBalances,
    forks,
    data: JSON.stringify(manifest),
    meta: notes,
    contentType: 'application/x.arweave-manifest+json',
  })

  return result
}

module.exports = { createAsset, getAsset, getAssetGroup }
