const t = require('tap')
const path = require('path')
const os = require('os')
const fs = require('fs')
const { open, stat } = require('fs/promises')
const fswin = require('fswin')
const sparse = require('..')
const assert = require('assert');

const A_ONE = Buffer.from([1])
const TEN_MB = Buffer.alloc(100000000, 'helloworld')
let i = 0

t.autoend(true)

if(process.platform === 'win32') {

  t.test('basic functionality', async t => {
    let fd; // file descriptor

    const _path = t.testdir({})
    const sparseFile = path.join(_path, 'sparse-file')

    sparse.setSparse(sparseFile, true)
    fd = await open(sparseFile, 'r+')
    await fd.write(TEN_MB, 0, TEN_MB.length, 0)
    fd.close()

    let fullsize = fswin.ntfs.getCompressedSizeSync(sparseFile)

    // will leave a file with a non-zero byte at either end.
    sparse.holePunch(sparseFile, 1, TEN_MB.length)

    let sparseSize = fswin.ntfs.getCompressedSizeSync(sparseFile)
    t.ok(
      sparseSize <= fullsize / 2,
      'filesize should be significantly smaller\n' +
      `(sparse size: ${sparseSize} regular size: ${fullsize})`
    )
    t.end()
  })

  t.test('holepunch a basic file.', async t => {
    const _path=t.testdir({})
    const basicFile = path.join(_path, 'basic-file')

    const fd = await open(basicFile, 'w+')
    await fd.write(TEN_MB, 0, TEN_MB.length, 0)
    fd.close()

    sparse.setSparse(basicFile)
    sparse.holePunch(basicFile, 1, TEN_MB.length)

    let stats = fswin.ntfs.getCompressedSizeSync(basicFile)
    t.ok(stats < TEN_MB.length, `file should be much smaller than 10mb (${stats})`)
  })

  t.test('holepunch non-existant file.', async t => {
    const _path=t.testdir({})
    const basicFile = path.join(_path, 'basic-file')

    t.notOk(sparse.holePunch(basicFile, 1, TEN_MB.length))
  })

  t.test('handle invalid cases like', async t => {
    const _path = t.testdir({
      basic: 'helloworld'
    })
    const file = path.join(_path, 'basic')

    t.test('wrong number of arguments', async t => {
      try {
        sparse.holePunch(file)
        t.fail('holePunch should throw with invalid parameters')
      } catch (err) {
        t.pass('ensure fails 1 arg')
      }
      try {
        sparse.holePunch(file, 0)
        t.fail('holePunch should throw with invalid parameters')
      } catch (err) {
        t.pass('ensure fails with 2 args')
      }
    })
    t.test('negative numbers', async t => {
      try {
        sparse.holePunch(file, -10, 1000)
        t.fail('holePunch should throw with invalid parameters')
      } catch (err) {
        t.pass('ensure fails with negative numbers')
      }
    })
    t.test('ranges outside of filesize', async t => {
      let stats = await stat(file)
      const size_before = stats.size
      assert(size_before < 999)
      sparse.holePunch(file, 0, 1000)
      stats = await stat(file)
      t.ok(stats.size === size_before, 'file should not get larger')
    })
  })

} else {

  t.notOk(sparse.holePunch('./wont-be-created', 0, 1), 'On non-windows ensure no-op works')

}
