# `set-sparse`

A simple function that sets the `FSCTL_SET_SPARSE` or `FSCTL_SET_ZERO_DATA` windows flag via `DeviceIoControl`.

## Why

If you're creating large files with large sections filled with zeros (like in torrents, or hypercores) sometimes you don't want to take up the full size of the file even though you've only written 100kb. This sets the flag in Windows to "compress" the zeros. Mac and Linux do this _by default_.

<center>
<img src="https://user-images.githubusercontent.com/1091220/100968985-5c50bf80-3500-11eb-8477-92bb22fc42d6.png" />

_this is a file with a lot of zeros, notice the Size vs Size on disk_
</center>

## Usage

```js
const sparse = require('set-sparse')
const create_if_nonexistant = true

const success = sparse.setSparse('./file-to-set', create_if_nonexistant)
// you can now write to sections of your file
const { open } = require('fs/promises')
const fd = await open('./file-to-set', 'r+')
await fd.write(Buffer.from([1]), 0, 1, 10000000) // 10mb file
fd.close() // file is *still small!*

// And if we start with a dense file
const { open, stat } = require('fs/promises')
const fd = await open('./other-file', 'w+')
const TEN_MB = Buffer.alloc(10000000, 'repeating-bytes')
await fd.write(TEN_MB, 0, TEN_MB.length, 0) // 10mb file
fd.close() // file is TEN_MB even set as sparse
sparse.setSparse('./other-file') // still 10mb
// punch a hole leaving 1 non-zero byte on either side
sparse.holePunch('./other-file', 1, TEN_MB.length)
await stat('./other-file') // reclaim all those zeros, saving space!
```

On Mac and Linux this library is a no-op and will always return `false`.

## Caveats

* There is no Windows API to turn off sparse mode.
* Setting the sparse flag does not tell Windows to go clear up space. You should set the flag before writing data to the file.
* Do not open the file in node with `await open(file, 'w+')` this will disable sparse mode. Use `a+` or `r+`.

## API

### `setSparse(filepath[, create_if_nonexistant])`

* `filepath String`: a relative or absolute path.
* `create_if_nonexistant Boolean = false`: if `setSparse` should create the file if it doesn't exist

This function is synchronous but not dependent on the file's existing size and is
generally very fast.

Returns `true` if operation succeeded.

### `holePunch(filepath, start_byte, beyond_final_zero)`

* `filepath String`: a relative or absolute path.
* `start_byte Number`: the starting (inclusive) byte to set to zero
* `beyond_final_zero Number`: the ending (exclusive) byte to set to zero

This function is synchronous and runtime (whilst good) is dependent on the size
of the new hole.

Returns `true` if operation succeeded.

## Development

```bash
npm install --global windows-build-tools
npm install
# hack...
npm run build
npm run prepack
npm run test
```

## License

MIT
