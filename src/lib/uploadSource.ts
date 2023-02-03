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

export const uploadSource = async (options: BundlrOptions) => {
  const { walletPath, host } = options

  const wallet = JSON.parse(fs.readFileSync(walletPath, 'utf-8'))

  const bundlr = new Bundlr(
    host ? host : 'https://node2.bundlr.network',
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
    print.error(err)
    process.exit(1)
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
    `Upload price: ${bundlr.utils.unitConverter(uploadPrice)} AR`
  )

  let res

  try {
    await prompt
      .confirm('Please check and confirm your upload.')
      .then(async (confirm) => {
        const uploadSpinner = print.spin('Uploading source code to Arweave...')
        if (confirm) {
          const transaction = await uploadToArweave(uploadSpinner)
          uploadSpinner.succeed(`${projectZip} successfully uploaded`)
          await askCleanup()
          res = transaction
        } else {
          uploadSpinner.fail('Upload cancelled')
          process.exit(1)
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

  async function uploadToArweave(spinner) {
    try {
      const response = await bundlr.uploadFile('./' + projectZip)
      return response
    } catch (err) {
      spinner.fail(`${err}`)
      await askCleanup()
      process.exit(1)
    }
  }

  async function askCleanup() {
    await prompt
      .confirm(
        'Would you like to run cleanup on the files generated for deployment?'
      )
      .then((confirm) => {
        if (confirm) {
          removeDir(tempDir)
          removeDir(projectZip)
        } else {
          return
        }
      })
  }

  async function createZipArchive(tempDir) {
    try {
      const zip = new AdmZip()
      zip.addLocalFolder(tempDir)
      zip.writeZip(`${tempDir}.zip`)
    } catch (error) {
      print.error(`Zip Archive couldn't be created: ${error}`)
      process.exit(1)
    }
  }

  function removeDir(dir) {
    try {
      execSync(`rm -rf ${dir}`)
    } catch (error) {
      print.error(error)
      process.exit(1)
    }
  }
}

module.exports = { uploadSource }
