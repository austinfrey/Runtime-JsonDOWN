# Runtime-JsonDOWN
This is a drop-in replacement for [LevelDOWN][] that writes to
a JSON file on disk, while operating on the [RuntimeJS][] Unikernel.

It also retains the contents of the entire JSON file in memory, so
it's only really useful for debugging purposes and/or very small
data stores that need just a pinch of persistence.

The only differences between [JsonDOWN][] and Runtime-JsonDOWN is the
substitution of the NodeJS `fs` module in favor of [fatfs][], and it
must be run on the RuntimeJS runtime.

## Example

see `./examples/index.js`

## Initial Setup

#### Install `runtime-cli`

```
$ npm install -g runtime-cli
```

#### Make a disk image

The following will create a new 33M disk image, name `disk.img` in the
present working directory.
```
$ runtime mkimg --size 33792K
```

#### Run Level on RuntimeJS

Ensure all additional dependencies are installed. Using the example, `./examples/index.js`,
additional dependencies would include `levelup`
```
$ npm install --save levelup
```

Then run RuntimeJS using `runtime-cli`.
```
$ runtime start --drive disk.img --nographic
```


[LevelDOWN]: https://github.com/rvagg/node-leveldown
[RuntimeJS]: https://github.com/runtimejs/runtime
[JsonDOWN]: https://github.com/toolness/jsondown
[fatfs]: https://github.com/natevw/fatfs/issues

