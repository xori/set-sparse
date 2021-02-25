# `set-sparse`

A simple function that sets the `FSCTL_SET_SPARSE` windows flag via `DeviceIoControl`.

## Why

If you're creating large files with large sections filled with zeros (like in torrents, or hypercores) sometimes you don't want to take up the full size of the file even though you've only written 100kb. This sets the flag in Windows to "compress" the zeros. Mac and Linux do this _by default_.

<center>
<img src="https://user-images.githubusercontent.com/1091220/100968985-5c50bf80-3500-11eb-8477-92bb22fc42d6.png" />

_this is a file with a lot of zeros, notice the Size vs Size on disk_
</center>

## Usage

```js
const setSparse = require('set-sparse')
const create_if_nonexistant = true

const success = setSparse('./file-to-set', create_if_nonexistant)
```

On Mac and Linux this library is a no-op and will always return `false`.

## Caveats

* There is no Windows API to turn off sparse mode.
* Setting the sparse flag does not tell Windows to go clear up space. You should set the flag before writing data to the file.
* Do not open the file in node with `await open(file, 'w+')` this will disable sparse mode. Use `a+` or `r+`.

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
