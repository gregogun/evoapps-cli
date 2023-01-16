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
  manifest: string
  sourceCode
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
