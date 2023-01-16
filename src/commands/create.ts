import { GluegunCommand } from 'gluegun'
import { createAsset, getAsset } from '../lib/sdk'
import { Args, Asset } from '../types'
import { checkInvalidArgs } from '../utils/checkInvalidArgs'
import { checkErrors } from '../utils/create/checkErrors'
import { getInteractiveArgs } from '../utils/create/getInteractiveArgs'

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

    let isForked = false
    const excludedArgs: string[] = []
    const invalidArgs: string[] = []

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

    for (let key in data) {
      for (const field in args) {
        if (!Object.keys(data).includes(field)) {
          invalidArgs.push(field)
        }

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
