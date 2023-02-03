import { print } from 'gluegun'

export const mapAlias = (key: string) => {
  switch (key) {
    case 'w':
      return 'walletPath'
    case 'id':
      return 'appId'
    case 't':
      return 'title'
    case 'd':
      return 'description'
    case 'f':
      return 'forks'
    case 'b':
      return 'balances'
    case 'm':
      return 'manifest'
    case 's':
      return 'sourceCode'
    case 'n':
      return 'notes'
    default:
      print.error('Invalid flag passed')
      return
  }
}

module.exports = { mapAlias }
