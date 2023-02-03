import { GluegunCommand } from 'gluegun'
import { uploadOutDir } from '../lib/uploadOutDir'
import { createAsset, getAsset } from '../lib/sdk'
import { Args, Asset, BundlrOptions } from '../types'
import { checkInvalidArgs } from '../utils/checkInvalidArgs'
import { checkErrors } from '../utils/create/checkErrors'
import { getInteractiveArgs } from '../utils/create/getInteractiveArgs'
import { uploadSource } from '../lib/uploadSource'
import { mapAlias } from '../utils/create/mapAlias'

const command: GluegunCommand = {
  name: 'create',
  description: 'Create or fork an atomic asset',
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
      manifest: '',
      sourceCode: '',
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

    console.log(args)

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
            'Please specify whether you are creating a base or forked version',
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
    const host = args.host || args.h
    const indexFile = args.indexFile
    const batchSize = args.batchSize
    const keepDeleted = args.keepDeleted
    const noConfirm = args.noConfirm
    const walletPath = args.walletPath || args.w

    if (directory && !args.manifest && !args.m && !args.sourceCode && !args.s) {
      if (!args.walletPath && !args.w) {
        await getInteractiveArgs('walletPath').then((result) => {
          if (result) {
            data['walletPath'] = result['walletPath']
          }
        })
      }

      await uploadOutDir({
        directory,
        walletPath,
        host,
        indexFile,
        batchSize,
        keepDeleted,
        noConfirm,
      })
        .then((manifest) => {
          print.success('Manifest ID: ' + manifest.id)

          data['manifest'] = manifest.id
        })
        .catch((err) => {
          print.error('Error deploying app: ' + err)
          process.exit(1)
        })
        .then(async () => {
          if (args.sourceCode || args.s) {
            await interactiveArgs()
          } else {
            await uploadSource({
              directory,
              walletPath,
              noConfirm,
            })
              .then((source) => {
                if (!source) {
                  throw new Error(
                    'There was an issue getting the source code transaction data.'
                  )
                }

                print.success('Source Code ID: ' + source.id)

                data['sourceCode'] = source.id
              })
              .catch((err) => {
                print.error('Error uploading source: ' + err)
                process.exit(1)
              })
              .then(async () => {
                await interactiveArgs()
              })
              .catch((err) => {
                print.error('Upload cancelled' + err)
                process.exit(1)
              })
          }
        })
    } else if (!args.sourceCode && !args.s && (args.manifest || args.m)) {
      await uploadOutDir({
        directory,
        walletPath,
        host,
        indexFile,
        batchSize,
        keepDeleted,
        noConfirm,
      })
        .then((manifest) => {
          print.success('Manifest ID: ' + manifest.id)

          data['manifest'] = manifest.id
        })
        .catch((err) => {
          print.error('Error deploying app: ' + err)
          process.exit(1)
        })
    } else if (!args.manifest && !args.m && (args.sourceCode || args.s)) {
      await uploadSource({
        directory,
        walletPath,
        noConfirm,
      })
        .then((source) => {
          if (!source) {
            throw new Error(
              'There was an issue getting the source code transaction data.'
            )
          }

          print.success('Source Code ID: ' + source.id)

          data['sourceCode'] = source.id
        })
        .catch((err) => {
          print.error('Error uploading source: ' + err)
          process.exit(1)
        })
    } else {
      await interactiveArgs()
    }

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
          checkInvalidArgs(invalidArgs)

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
      print.highlight(data)

      const confirmResult = await prompt.confirm(
        `Would you like to confirm your changes?`
      )

      if (confirmResult) {
        try {
          const res = await createAsset(data)
          print.success(
            `You've successfully deployed your app asset! App Asset ID: ${res.id}`
          )
        } catch (error) {
          print.error(error)
          process.exit(1)
        }
      } else {
        await prompt
          .ask({
            name: 'update',
            message: 'Please select the fields you would like to update',
            type: 'multiselect',
            choices: Object.keys(data),
            required: true,
            hint: 'Press space key to select a field, and enter key to submit',
          })
          .then(async (answer) => {
            const choices = answer.update

            for (const choice of choices) {
              await getInteractiveArgs(choice as keyof Args)
                .then((result) => {
                  if (result) {
                    data[choice] = result[choice]
                  }
                })
                .then(async () => {
                  confirmation()
                })
            }
          })
      }
    }

    confirmation()
  },
}

module.exports = command
