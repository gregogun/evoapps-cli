import { GluegunCommand } from 'gluegun'
import { getAssetGroup } from '../lib/sdk'
// import { Data } from '../types'
// import { getInteractiveArgs } from '../utils/create/getInteractiveArgs'

const command: GluegunCommand = {
  name: 'list',
  description: 'Get asset group by identifier',
  run: async (toolbox) => {
    const { 
      // parameters,
       print } 
       = toolbox
    // const { options: args } = parameters

    // let data: Pick<Data, 'id' | 'walletPath'> = {
    //   id: '',
    //   walletPath: '',
    // }

    // for (const key in data) {
    //   for (const field in args) {
    //     if (field === key) {
    //       data[key] = args[field]
    //     }
    //   }

    //   const noKey =
    //     !data[key] ||
    //     data[key].length === 0 ||
    //     (Object.keys(data[key]).length === 0 &&
    //       data[key].constructor === Object)

    //   if (noKey) {
    //     await getInteractiveArgs(key as keyof Data).then((result) => {
    //       data[key] = result[key]
    //     })
    //   }
    // }

    // // error checks
    // if (!data.walletPath || typeof data.walletPath !== 'string') {
    //   print.error('You must specify a valid wallet path')
    //   process.exit(1)
    // }

    try {
      const res = await getAssetGroup(
        'A35w9qHv2gIr9ktRRaewhock9_1RxuvI-HHnMRp0UyE'
      )
      print.success(JSON.stringify(res, null, 2))
    } catch (error) {
      print.error(error)
      process.exit(1)
    }
  },
}

module.exports = command
