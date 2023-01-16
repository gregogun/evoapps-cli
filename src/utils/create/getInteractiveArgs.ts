import { prompt } from 'gluegun'
import { Args } from '../../types'
import {
  askAppId,
  askBalances,
  askDescription,
  askForks,
  askTopics,
  askWalletPath,
  askNotes,
  askManifest,
  askSourceCode,
  askTitle,
} from './questions'

export async function getInteractiveArgs(key: keyof Args, excluded?: string[]) {
  if (excluded && excluded.length > 0) {
    if (excluded.includes(key)) {
      return
    }
  }

  return await prompt.ask<Args>([
    {
      ...askAppId,
      skip: key !== 'appId',
      required: key !== 'appId' ? false : true,
    },
    {
      ...askTitle,
      skip: key !== 'title',
      required: key !== 'title' ? false : true,
    },
    {
      ...askDescription,
      skip: key !== 'description',
      required: key !== 'description' ? false : true,
    },
    {
      ...askTopics,
      skip: key !== 'topics',
      required: key !== 'topics' ? false : true,
    },
    {
      ...askNotes,
      skip: key !== 'notes',
    },
    {
      ...askManifest,
      skip: key !== 'manifest',
      required: key !== 'manifest' ? false : true,
    },
    {
      ...askSourceCode,
      skip: key !== 'sourceCode',
      required: key !== 'sourceCode' ? false : true,
    },
    {
      ...askForks,
      skip: key !== 'forks',
      required: key !== 'forks' ? false : true,
    },
    {
      ...askWalletPath,
      skip: key !== 'walletPath',
      initial: './wallet.json',
    },
    {
      ...askBalances,
      skip: key !== 'balances',
      required: key !== 'balances' ? false : true,
    },
  ])
}

module.exports = { getInteractiveArgs }
