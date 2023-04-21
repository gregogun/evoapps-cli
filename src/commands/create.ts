import { GluegunCommand } from 'gluegun'
import { createAsset, getAsset } from '../lib/sdk'
import { Args, Asset, BundlrOptions } from '../types'
import { checkErrors } from '../utils/create/checkErrors'
import { getInteractiveArgs } from '../utils/create/getInteractiveArgs'
import { mapAlias } from '../utils/create/mapAlias'
import { createManifest } from '../lib/uploadManifest'
import { printData } from '../utils/create/printData'

const command: GluegunCommand = {
  name: 'create',
  description: 'Create or fork an app',
  run: async (toolbox) => {
    const { parameters, print, prompt } = toolbox
    const { options: args } = parameters

    const data: Args = {
      appId: '',
      title: '',
      description: '',
      topics: '',
      forks: '',
      balances: 0,
      notes: '',
      walletPath: '',
    }

    const aliases = {
      h: '',
      t: '',
      d: '',
      f: '',
      b: '',
      m: '',
      s: '',
      n: '',
      w: '',
      id: '',
    }

    // console.log(args)

    let isForked = false
    const excludedArgs: string[] = []
    const invalidArgs: string[] = []
    const bundlrOps: BundlrOptions = {
      directory: '',
      walletPath: '',
      host: '',
      indexFile: '',
      batchSize: undefined,
      keepDeleted: false,
      noConfirm: false,
    }

    if (parameters.first === 'fork') {
      isForked = true
    }

    if (parameters.first !== ('base' || 'fork') && !isForked) {
      await prompt
        .ask({
          name: 'versionType',
          message:
            'Please specify whether you are creating a base or forked application',
          choices: ['base', 'fork'],
          type: 'select',
          required: true,
        })
        .then((answer) => {
          if (answer.versionType === 'fork') {
            isForked = true
          }
        })
    }

    if (isForked) {
      excludedArgs.push('appId')
    } else {
      excludedArgs.push('forks')
    }

    const directory = parameters.second

    if (!directory) {
      print.error('Error: No directory specified.')
      process.exit(1)
    }

    // const host = args.host || args.h
    const indexFile = args.index
    // const batchSize = args.batchSize
    // const keepDeleted = args.keepDeleted
    // const noConfirm = args.noConfirm
    const walletPath = args.walletPath || args.wallet || args.w

    if (!args.walletPath && !args.wallet && !args.w) {
      await getInteractiveArgs('walletPath').then((result) => {
        if (result) {
          data['walletPath'] = result['walletPath']
        }
      })
    } else {
      data['walletPath'] = walletPath
    }

    const manifest = await createManifest(directory, walletPath, indexFile)

    async function interactiveArgs() {
      for (let key in data) {
        for (const field in args) {
          if (
            !Object.keys(data).includes(field) &&
            !Object.keys(aliases).includes(field) &&
            !Object.keys(bundlrOps).includes(field)
          ) {
            invalidArgs.push(field)
          }

          if (field === key) {
            data[key] = args[field]
          }
          for (const key in aliases) {
            if (field === key) {
              data[mapAlias(key) as string] = args[field]
            }
          }
        }

        const noKey =
          !data[key] ||
          data[key].length === 0 ||
          (Object.keys(data[key]).length === 0 &&
            data[key].constructor === Object)

        if (noKey) {
          checkErrors(args as Args)
          // checkInvalidArgs(invalidArgs)

          await getInteractiveArgs(key as keyof Args, excludedArgs).then(
            (result) => {
              if (result) {
                data[key] = result[key]
              }
            }
          )
        }
      }
    }

    const confirmation = async () => {
      checkErrors(data)

      if (isForked && data.forks) {
        await getAsset({
          id: data.forks,
          walletPath: data.walletPath,
        })
          .then((res: Asset) => {
            console.log(res)
            data['appId'] = res.groupId
          })
          .catch(() => {
            print.error(
              `Error: Unable to find the version you are forking from.`
            )
            process.exit(1)
          })
      }

      // print data object before confirmation
      printData(data)

      const confirmResult = await prompt.confirm(
        `Would you like to confirm your changes?`
      )

      if (confirmResult) {
        try {
          const res = await createAsset(data, manifest)
          print.success(
            `You've successfully deployed your app asset! App Asset ID: ${res.id}`
          )
        } catch (error) {
          print.error(error)
          process.exit(1)
        }
      } else {
        print.error('App creation cancelled')
        process.exit(1)
      }
    }

    await interactiveArgs()
    confirmation()
  },
}

module.exports = command
