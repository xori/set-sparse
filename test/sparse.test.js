const t = require('tap')
const path = require('path')
const os = require('os')
const fs = require('fs')
const { open } = require('fs/promises')
const fswin = require('fswin')
const setSparse = require('..').setSparse

const A_ONE = Buffer.from([1])
let i = 0

t.autoend(true)

if(process.platform === 'win32') {

  t.test('basic functionality', async t => {
    let fd; // file descriptor
    const _path = t.testdir({})

    const regularFile = path.join(_path, String('regular-file'))
    const sparseFile = path.join(_path, String('sparse-file'))
    fd = await open(regularFile, 'w+')
    await fd.write(A_ONE, 0, 1, 0)
    await fd.write(A_ONE, 0, 1, 10000000)
    fd.close()

    setSparse(sparseFile, true)
    fd = await open(sparseFile, 'r+')
    await fd.write(A_ONE, 0, 1, 0)
    await fd.write(A_ONE, 0, 1, 10000000)
    fd.close()

    const sparseSize = fswin.ntfs.getCompressedSizeSync(sparseFile)
    const regularSize = fswin.ntfs.getCompressedSizeSync(regularFile)
    t.ok(
      sparseSize < regularSize / 2,
      'sparse file should use far less blocks\n'+
      `(sparse size: ${sparseSize} regular size: ${regularSize})`
    )
  })

  t.test('creation flag', t => {
    const _path = t.testdir({})

    t.test('when true', async t => {
      const file = path.join(_path, String('when-true'))
      setSparse(file, true)
      t.ok(fs.accessSync(file) === undefined, 'ensure file is created')
      t.end()
    })
    t.test('when false', async t => {
      const file = path.join(_path, String('when-false'))
      setSparse(file, false)
      try {
        fs.accessSync(file)
        t.fail('file shouln\'t be created.')
      } catch (err) {
        t.pass('ensure file is not created')
      }
      t.end()
    })
    t.test('when undefined', async t => {
      const file = path.join(_path, String('when-undefined'))
      setSparse(file)
      try {
        fs.accessSync(file)
        t.fail('file shouln\'t be created.')
      } catch (err) {
        t.pass('ensure file is not created')
      }
      t.end()
    })
    t.end()
  })

} else {

  t.notOk(setSparse('./wont-be-created', true), 'On non-windows ensure no-op works')

}
