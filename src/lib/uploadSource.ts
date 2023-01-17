import Arweave from 'arweave'
import Bundlr from '@bundlr-network/client'
import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import AdmZip from 'adm-zip'
import { BundlrOptions } from '../types'
import { print, prompt } from 'gluegun'
import { promisify } from 'util'

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'))
const pkgName = pkg.name
const pkgVersion = pkg.version

const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https',
})

export const uploadSource = async (options: BundlrOptions) => {
  const { walletPath, host } = options

  const wallet = JSON.parse(fs.readFileSync(walletPath, 'utf-8'))

  const bundlr = new Bundlr(
    host ? host : 'https://node1.bundlr.network',
    'arweave',
    wallet
  )

  const projectZip = `${pkgName}-${pkgVersion}.zip`

  const readFile = promisify(fs.readFile)

  let ignoreList
  try {
    ignoreList = await readFile('.gitignore', 'utf8')
    ignoreList = ignoreList
      .split('\n')
      .filter((line) => line.length > 0 && !line.startsWith('#'))
  } catch (err) {
    console.log(err)
    throw err
  }

  const tempDir = `${pkgName}-${pkgVersion}`
  ignoreList.push(tempDir, '.git')

  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir)
  }
  copyItems('./', tempDir, ignoreList)
  await createZipArchive(tempDir)

  const loadingSpinner = print.spin('Getting upload price...')
  const uploadSize = fs.statSync(projectZip).size
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

  try {
    await prompt
      .confirm('Please confirm your upload.')
      .then(async (confirm) => {
        console.log(confirm)

        if (confirm) {
          const loader = print.spin('Uploading to Arweave...')
          const transaction = await uploadToArweave(tempDir)
          loader.succeed(`${projectZip} successfully uploaded`)
          res = transaction
        } else {
          throw new Error('Upload cancelled')
        }
      })
    return res
  } catch (err) {
    throw err
  }

  function copyItems(src, dest, ignoreList) {
    let items = fs.readdirSync(src, { withFileTypes: true })
    items.forEach((item) => {
      if (!ignoreList.includes(item.name)) {
        const sourcePath = path.join(src, item.name)
        const destinationPath = path.join(dest, item.name)
        if (item.isDirectory()) {
          fs.mkdirSync(destinationPath)
          copyItems(sourcePath, destinationPath, ignoreList)
        } else {
          fs.copyFileSync(sourcePath, destinationPath)
        }
      }
    })
  }

  async function uploadToArweave(tempDir) {
    try {
      const response = await bundlr.uploadFile('./' + projectZip)

      removeDir(tempDir)
      removeDir(projectZip)
      return response
    } catch (err) {
      console.error(`Error uploading ${projectZip}: ${err}`)
      throw err
    }
  }

  async function createZipArchive(tempDir) {
    try {
      const zip = new AdmZip()
      zip.addLocalFolder(tempDir)
      zip.writeZip(`${tempDir}.zip`)
    } catch (error) {
      console.log(`Zip Archive couldn't be created: ${error}`)
      throw error
    }
  }

  function removeDir(dir) {
    execSync(`rm -rf ${dir}`)
  }
}

module.exports = { uploadSource }
