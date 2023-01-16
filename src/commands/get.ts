import { GluegunCommand } from 'gluegun'
import { getAsset } from '../lib/sdk'
import { Args } from '../types'
import { getInteractiveArgs } from '../utils/create/getInteractiveArgs'

const command: GluegunCommand = {
  name: 'get',
  description: 'Get info about an atomic asset',
  run: async (toolbox) => {
    const { parameters, print } = toolbox
    const { options: args } = parameters

    let data: Pick<Args, 'id' | 'walletPath'> = {
      id: '',
      walletPath: '',
    }

    for (const key in data) {
      for (const field in args) {
        if (field === key) {
          data[key] = args[field]
        }
      }

      const noKey =
        !data[key] ||
        data[key].length === 0 ||
        (Object.keys(data[key]).length === 0 &&
          data[key].constructor === Object)

      if (noKey) {
        await getInteractiveArgs(key as keyof Args).then((result) => {
          if (result) {
            data[key] = result[key]
          }
        })
      }
    }

    // error checks
    if (!data.walletPath || typeof data.walletPath !== 'string') {
      print.error('You must specify a valid wallet path')
      process.exit(1)
    }

    const loadingSpinner = print.spin('Fetching asset data...')
    try {
      const res = await getAsset(data)
      loadingSpinner.succeed('Asset data found!')
      print.success(res)
    } catch (error) {
      loadingSpinner.fail('An error occured.')
      print.error(error)
      process.exit(1)
    }
  },
}

module.exports = command
