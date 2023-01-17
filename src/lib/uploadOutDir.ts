import Arweave from 'arweave'
import Bundlr from '@bundlr-network/client'
import fs from 'fs'
import { print, prompt } from 'gluegun'
import { BundlrOptions } from '../types'

export const uploadOutDir = async (options: BundlrOptions) => {
  const {
    directory,
    walletPath,
    indexFile,
    batchSize,
    keepDeleted,
    host = 'https://node1.bundlr.network',
  } = options

  const arweave = Arweave.init({
    host: 'arweave.net',
    port: 443,
    protocol: 'https',
  })

  const wallet = JSON.parse(fs.readFileSync(walletPath, 'utf-8'))

  const bundlr = new Bundlr(
    host ? host : 'https://node1.bundlr.network',
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
      `Upload price: ${
        uploadSize > 128000 ? arweave.ar.winstonToAr(uploadPrice.toString()) : 0
      } AR`
    )

    let res

    await prompt
      .confirm('Please confirm your deployment.')
      .then(async (confirm) => {
        if (confirm) {
          const uploadSpinner = print.spin('Uploading files...')
          const transaction = await upload(folderToUpload)
          uploadSpinner.succeed('Files successfully uploaded')
          res = transaction
        } else {
          throw new Error('Upload cancelled')
        }
      })

    return res
  } catch (error) {
    return error
  }

  async function upload(folder) {
    try {
      const res = await bundlr.uploadFolder(folder, {
        indexFile: indexFile && indexFile,
        batchSize: batchSize && batchSize,
        keepDeleted: keepDeleted && keepDeleted,
      })
      return res
    } catch (error) {
      throw error
    }
  }
}

module.exports = { uploadOutDir }
