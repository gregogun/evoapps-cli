import { print } from 'gluegun'
import { Args } from '../../types'

export const checkErrors = (args: Args) => {
  if (args.id && typeof args.id !== 'string') {
    print.error('Error: Asset ID must be a string value')
    process.exit(1)
  }

  if (args.appId && typeof args.appId !== 'string') {
    print.error('Error: Asset ID must be a string value')
    process.exit(1)
  }

  if (args.title && typeof args.title !== 'string') {
    print.error('Error: Description must be a string value')
    process.exit(1)
  }

  if (args.description && typeof args.description !== 'string') {
    print.error('Error: Description must be a string value')
    process.exit(1)
  }

  if (args.topics && typeof args.topics !== 'string') {
    print.error('Error: You must add at least one topic')
    process.exit(1)
  }

  if (args.manifest && typeof args.manifest !== 'string') {
    print.error('Error: Manifest Transaction ID must be an string')
    process.exit(1)
  }

  if (args.notes && typeof args.notes !== 'string') {
    print.error('Error: Inline/Path to Release Notes must be a string value')
    process.exit(1)
  }

  if (args.sourceCode && typeof args.sourceCode !== 'string') {
    print.error('Error: Source Code Transaction ID must be a string value')
    process.exit(1)
  }

  if (args.forks && typeof args.forks !== 'string') {
    print.error('Error: Forked Asset ID must be a string value')
    process.exit(1)
  }

  if (args.walletPath && typeof args.walletPath !== 'string') {
    print.error('Error: You must specify a valid wallet path')
    process.exit(1)
  }

  if (args.balances && typeof args.balances !== 'number') {
    print.error('Error: Balance amount must be a number')
    process.exit(1)
  }

  return
}

module.exports = { checkErrors }
