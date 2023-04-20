type Balances = {
  [key: string]: number
}

export interface Args {
  id?: string
  title: string
  description: string
  appId?: string
  topics: string
  balances: number
  forks?: string
  notes?: string
  walletPath: string
  directory?: string
  debug?: boolean
}

export interface Asset {
  id?: string
  title: string
  description: string
  type?: string
  groupId?: string
  topics: string[]
  balances: Balances
  contentType?: string
  forks?: string
  data: string
  meta?: string
}

export interface Option {
  name: string
  value: string | [] | {}
  description: string
  aliases: []
}

export interface BundlrOptions {
  directory: string | undefined
  walletPath: string
  indexFile?: string
  batchSize?: number
  keepDeleted?: boolean
  host?: string
  noConfirm?: boolean
}

export interface Manifest {
  manifest: string
  version: string
  index?: {
    path: string
  }
  paths: {
    [key: string]: {
      id: string
    }
  }
}
