# npi-regular

regular `npi` stream to init a node package.

## Install

you should add it to `npi`,

    npi --add @maboiteaspam/npi-regular
    npi --default @maboiteaspam/npi-regular
    npm i @maboiteaspam/npi-regular --save-dev

## Usage with npi

    npi

     Init a node project.

     Usage
       npi [module1 module2]
       npi [opts] -- [module1 module2]

     Options
       -b             add bin.js

     Examples
       npi debug minimist multiline
       npi -b -- debug minimist multiline
       npi -b -w @maboiteaspam/npi-regular -- debug minimist multiline

       npi -h

## Expected result

A minimal bunch of files to get on work, cooked just for you.

```
 - node_modules/
 - .gitignore
 - index.js
 - playground.js
 - package.json
 - README.md
```

Following `package.json` fields are updated with your input,

- description
- licence
- keyword

The resulting `package.json` provide a set of script,

#### npm run patch

To increase __patch__ number of your package revision.

#### npm run minor

To increase __minor__ number of your package revision.

#### npm run major

To increase __major__ number of your package revision.

#### npm run dcheck

Check your dependencies status,
upgrade them if they are outdated.
under the hood it is using `npm outdated --depth=0`.

#### npm run public

Publish your script on npm,
under the hood it is using `npm publish --access=public`

__________

The reason of this workflow is to enforce a better usage of `semver`.

Please check more about it at https://github.com/rvagg/npm-explicit-deps

Read also about `npm version` https://docs.npmjs.com/cli/version

Finally, you can take advantage of `preversion` and `version` npm scripts to
invoke build and test frameworks.

### Complete your workflow

To go further you can check about those repo

- https://github.com/commitizen/cz-cli
- https://github.com/bahmutov/npm-module-checklist

There s also plenty of grunt, gulp and other modules if you like.

### Scoped package

`npi` make use of scoped package.

Following my personal disappointment about `show-help` package,
`npi` will use scoped package strategy by default.

It s a better to way to share the same resource all together.

- https://docs.npmjs.com/getting-started/scoped-packages
- http://blog.npmjs.org/post/116936804365/solving-npms-hard-problem-naming-packages

## Api

```js
var stream = require('npi-regular');

stream.write({
  message : 'npi',
  body    : argv
});

```


## Read more

- https://github.com/maboiteaspam/npi
- https://github.com/maboiteaspam/npi-utils
- https://github.com/maboiteaspam/stream-messenger
- https://github.com/maboiteaspam/stream-message-router
- https://github.com/maboiteaspam/flower
- https://github.com/maboiteaspam/bubbler
- https://github.com/maboiteaspam/bubbled
- https://github.com/maboiteaspam/event-stream-writer
