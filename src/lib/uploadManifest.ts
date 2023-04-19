import fs, { readFileSync, readdirSync } from 'fs'
import path from 'path'
import Bundlr from '@bundlr-network/client'
import mime from 'mime-types'
// import { handleError } from '../utils/handleError'
import { prompt } from 'gluegun'
import { formatBytes } from './formatBytes'

interface Manifest {
  manifest: string
  version: string
  index?: {
    path: string
  }
  paths: {
    [key: string]: {
      id: string
    }
  }
}

export async function createManifest(dir: string, walletPath: string) {
  let wallet = ''

  try {
    wallet = JSON.parse(fs.readFileSync(walletPath, 'utf-8'))
  } catch (error) {
    // handleError('Invalid path to wallet address')
    throw new Error('Invalid path to wallet address')
  }

  // init bundlr
  const bundlr = new Bundlr('https://node2.bundlr.network', 'arweave', wallet)

  // create mutable manifest obj
  let manifest: Manifest = {
    manifest: 'arweave/paths',
    version: '0.1.0',
    paths: {},
  }
  try {
    const files = await recursiveReadDir(dir)
    await calculateAndConfirm(files.sizes, bundlr).then(async (confirm) => {
      if (confirm) {
        await recursiveUploadFiles(dir, manifest.paths, bundlr).then(() => {
          const dirNameLength = dir.length + 1 // +1 to include trailing slash
          for (const key in manifest.paths) {
            const removedDirName = key.substring(dirNameLength)
            manifest.paths[removedDirName] = manifest.paths[key]
            delete manifest.paths[key]
          }
        })
      } else {
        throw new Error('Upload cancelled')
      }
    })
  } catch (error) {
    // handleError(
    //   'An error occured whilst reading and uploading your files - ',
    //   error
    // )
    throw error
  }

  return manifest
}

interface FileObject {
  names: string[]
  sizes: number[]
}

async function recursiveReadDir(dir: string): Promise<FileObject> {
  const files = await fs.promises.readdir(dir)
  // process each file/directory in parallel
  const fileObjects = await Promise.all(
    files.map(async (file) => {
      const filepath = path.join(dir, file)
      const stats = await fs.promises.stat(filepath)
      // if item is a directory, call function recursively and return result; otherwise, return the file path name and size
      if (stats.isDirectory()) {
        return recursiveReadDir(filepath)
      } else {
        return {
          names: [file],
          sizes: [stats.size],
        }
      }
    })
  )
  const { names, sizes } = fileObjects.reduce<FileObject>(
    (accumulator, fileObject) => {
      // concatenate the 'names' array of each file object to the accumulator's 'names' array
      accumulator.names.push(...fileObject.names)
      // concatenate the 'sizes' array of each file object to the accumulator's 'sizes' array
      accumulator.sizes.push(...fileObject.sizes)
      // return the updated accumulator
      return accumulator
      // start with an empty 'names' array and an empty 'sizes' array
    },
    { names: [], sizes: [] }
  )
  return { names, sizes }
}

async function recursiveUploadFiles(dir: string, paths: {}, bundlr: Bundlr) {
  const files = readdirSync(dir)

  // loop through files and upload
  for (const file of files) {
    const filepath = path.join(dir, file)

    if (fs.statSync(filepath).isDirectory()) {
      await recursiveUploadFiles(filepath, paths, bundlr)
    } else {
      const contentType = mime.lookup(file) || 'text/plain'
      try {
        const data = readFileSync(filepath, 'utf-8')
        const tx = await bundlr.createTransaction(data, {
          tags: [{ name: 'Content-Type', value: contentType }],
        })
        await tx.sign()
        await tx.upload()
        paths[filepath] = { id: tx.id }
      } catch (error) {
        throw error
      }
    }
  }
}

async function calculateAndConfirm(sizes: number[], bundlr: Bundlr) {
  let combinedSize = sizes.reduce((a, b) => a + b, 0)
  const priceWinston = await bundlr.getPrice(combinedSize)

  const priceAr = bundlr.utils.unitConverter(priceWinston)

  return await prompt.confirm(
    `Authorize file upload?\n Total amount of data: ${combinedSize} bytes (${formatBytes(
      combinedSize
    )}) over ${
      sizes.length
    } files - cost ${priceWinston} winston ${priceAr.toFixed()} AR`
  )
}

module.exports = { createManifest }
