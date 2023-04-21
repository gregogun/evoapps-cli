import { GluegunCommand } from 'gluegun'
// import { createManifest } from '../lib/uploadManifest'
const command: GluegunCommand = {
  name: 'list',
  description: 'Get asset group by identifier',
  run: async (toolbox) => {
    // const { print, parameters } = toolbox
    // const { options } = parameters

    // let dir = options.dir
    // let wallet = options.wallet
    // const loadingSpinner = print.spin('Creating manifest...')

    try {
      // const manifest = await createManifest(dir, wallet)
      // print.success(manifest)
    } catch (error) {
      // print.error(error)
      // loadingSpinner.fail(`${error}`)
      // print.error(error)
      process.exit(1)
    }
  },
}

module.exports = command
