import Bundlr from '@bundlr-network/client'
import fs from 'fs'
import { print, prompt } from 'gluegun'
import { BundlrOptions } from '../types'

export const uploadOutDir = async (options: BundlrOptions) => {
  if (!options.directory) {
    print.error('No directory specified')
    process.exit(1)
  }

  const {
    directory,
    walletPath,
    indexFile,
    batchSize,
    keepDeleted,
    host,
  } = options

  const wallet = JSON.parse(fs.readFileSync(walletPath, 'utf-8'))

  const bundlr = new Bundlr(
    host ? host : 'https://node2.bundlr.network',
    'arweave',
    wallet
  )

  try {
    const folderToUpload = directory.includes('./')
      ? directory
      : './' + directory

    const loadingSpinner = print.spin('Getting upload price...')
    const uploadSize = fs.statSync(folderToUpload).size
    loadingSpinner.info('File Size: ' + uploadSize + ' B')

    const uploadPrice = await bundlr.getPrice(uploadSize)

    if (!uploadPrice) {
      loadingSpinner.fail(
        'Something went wrong trying to calculate the price of your upload.'
      )
      process.exit(1)
    }

    loadingSpinner.succeed(
      `Upload price: ${bundlr.utils.unitConverter(uploadPrice)} AR`
    )

    let res

    await prompt
      .confirm('Please check and confirm your deployment.')
      .then(async (confirm) => {
        const uploadSpinner = print.spin('Uploading files...')
        if (confirm) {
          const transaction = await upload(folderToUpload, uploadSpinner)
          uploadSpinner.succeed('Files successfully uploaded')
          res = transaction
        } else {
          uploadSpinner.fail('Upload cancelled')
          process.exit(1)
        }
      })

    return res
  } catch (error) {
    throw error
  }

  async function upload(folder, spinner) {
    try {
      const res = await bundlr.uploadFolder(folder, {
        indexFile: indexFile && indexFile,
        batchSize: batchSize && batchSize,
        keepDeleted: keepDeleted && keepDeleted,
      })
      return res
    } catch (error) {
      spinner.fail(`${error}`)
      process.exit(1)
    }
  }
}

module.exports = { uploadOutDir }
