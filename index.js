
var path          = require('path')
var streamMsger   = require('@maboiteaspam/stream-messenger')
var eventStream   = require('@maboiteaspam/event-stream-writer')
var messageRouter = require('@maboiteaspam/stream-message-router')
var trimT         = require('@maboiteaspam/npi-utils/trim.js')
var spawn         = require('@maboiteaspam/npi-utils/spawn')
var spawnCopy     = require('@maboiteaspam/npi-utils/spawn-copy')
var choose        = require('@maboiteaspam/npi-utils/inquire-license')
var input         = require('@maboiteaspam/npi-utils/inquire-input')
var bubble        = require('@maboiteaspam/npi-utils/bubble')
var push          = require('@maboiteaspam/npi-utils/push')
var genTemplate   = require('@maboiteaspam/npi-utils/generatetemplate')
var updatePkg     = require('@maboiteaspam/npi-utils/updatepackage')


var regularNpi = function (pkg, argv) {

  var npi = messageRouter('npi');

  var tplPath = path.join(__dirname, 'template');
  var name    = path.basename(process.cwd());

  var files   = [];
  var ignored = [
    'node_modules/',
    'npm-debug.log'
  ];

  var templateVars  = {
    name            : name,
    description     : "Description of the module.",
    author          : '',
    license         : 'WTF',
    keywords        : '',
    ignored         : ignored,
    bin             : {},
    dependencies    : argv['_'].join(' ') + ' ',
    devDependencies : ''
  };

  if (argv.b) templateVars.bin[name] = './bin.js'

  npi
    // get author and license from npm config
    .pipe(spawnCopy.stdout('npm', ['config', 'get', 'init.author.name'], templateVars, 'author'))
    .pipe(spawnCopy.stdout('npm', ['config', 'get', 'init.license'], templateVars, 'license'))
    .pipe(trimT(templateVars, ['author', 'license']))
    .pipe(input.ifFalsy('Input your username :', templateVars, 'author'))

    // npm init
    .pipe(spawn('npm', function (){
      return ['init', '--scope='+templateVars.author, '--yes']
    }))
    .pipe(bubble('message', {message: 'file', 'body':'package.json'}))

    // gather user input
    .pipe(input('Input the module\'s description :' , templateVars, 'description'))
    .pipe(input('Input the module\'s keywords :'    , templateVars, 'keywords'))
    .pipe(choose.ifFalsy('Please choose a license :', templateVars, 'license'))
    .pipe(trimT(templateVars, ['description','keywords','license']))

    .pipe( !argv['_'].length ? spawn('star', [], {silent: true}) : streamMsger('skip'))
    .pipe(input.ifFalsy('Input the module\'s dependencies :', templateVars, 'dependencies'))

    .pipe(spawn('star', ['--dev'], {silent: true}))
    .pipe(input('Input the module\'s devDep\'s :', templateVars, 'devDependencies'))
    .pipe(trimT(templateVars, ['dependencies', 'devDependencies']))

    //generate templates
    .pipe(genTemplate(tplPath, 'README.md'    , templateVars))
    .pipe(genTemplate(tplPath, 'playground.js', templateVars))
    .pipe(genTemplate(tplPath, 'index.js'     , templateVars))
    .pipe(genTemplate(tplPath, '.gitignore'   , templateVars))
    .pipe( argv.b
      ? genTemplate(tplPath,  'bin.js'        , templateVars)
      : streamMsger('skip') )

    // npm module install
    .pipe(spawn('npm', function (){
      var modules = templateVars.dependencies.split(/\s/);
      if (!modules.length || !modules[0].length) return false;
      return ['i'].concat(modules).concat('--save');
    }))
    .pipe(spawn('npm', function (){
      var modules = templateVars.devDependencies.split(/\s/);
      if (!modules.length || !modules[0].length) return false;
      return ['i'].concat(modules).concat('--save-dev');
    }))

    // fix package.json file
    .pipe(updatePkg('package.json', function () {

      return {
        scripts : {
          "dcheck"      : "npm outdated --depth=0",
          "crack"       : "crack -p tests/",
          "patch"       : "echo \"npm run crack\" && npm version patch -m \"patch %s\"",
          "minor"       : "echo \"npm run crack\" && npm version minor -m \"minor %s\"",
          "major"       : "npm version major -m \"major %s\"",
          "preversion"  : "echo \"npm test: not defined\" && npi --changelog && npi --explicit",
          "version"     : "echo \"npm run build: not defined\"",
          "postversion" : "git push && git push --tags && echo \"npm run public\"",
          "public"      : "npm publish --access=public"
        },
        bin             : templateVars.bin,
        license         : templateVars.license,
        description     : templateVars.description,
        keywords        : templateVars.keywords.split(/\s/)
      };
    }))

    // git init, add, commit
    .pipe(spawn('git', ['init']))
    .pipe(spawn('git', function (){
      return ['add'].concat(files)
    }))
    .pipe(spawn('git', ['commit', '-m', 'npi:'+pkg.version]))
  ;



  var msgListener = eventStream('message', npi);
  msgListener
    .pipe(messageRouter('file'))
    .pipe(push('body', files));

  return npi
}

module.exports = regularNpi;
