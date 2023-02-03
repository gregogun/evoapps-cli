import { system, filesystem } from 'gluegun'

const src = filesystem.path(__dirname, '..')
const pkg = JSON.parse(filesystem.read('package.json') as string)
const pkgVersion = pkg.version

const cli = async (cmd) =>
  system.run('node ' + filesystem.path(src, 'bin', 'evoapps-cli') + ` ${cmd}`)

test('outputs correct version', async () => {
  const output = await cli('--version')
  expect(output).toContain(pkgVersion)
})

// test('outputs help', async () => {
//   const output = await cli('x--help')
//   expect(output).toContain('0.0.1')
// })

// test('generates file', async () => {
//   const output = await cli('generate foo')

//   expect(output).toContain('Generated file at models/foo-model.ts')
//   const foomodel = filesystem.read('models/foo-model.ts')

//   expect(foomodel).toContain(`module.exports = {`)
//   expect(foomodel).toContain(`name: 'foo'`)

//   // cleanup artifact
//   filesystem.remove('models')
// })
