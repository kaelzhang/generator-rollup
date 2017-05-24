const Generator = require('yeoman-generator')
const Scaffold = require('scaffold-generator')
const extend = require('deep-extend')
const mustache = require('mustache')
const npmName = require('npm-name')
const path = require('path')
const askName = require('inquirer-npm-name')
const fs = require('fs-extra')
const parseGit = require('git-url-parse')

const templateDir = path.join(__dirname, 'template')
const REGEX_VALID_NPM_NAME = /[a-z][.-a-z]*/
const REGEX_SPECIAL_VARIABLE = /[.-]/g

module.exports = class extends Generator {
  constructor (args, opts) {
    super(args, opts)

    this._cwd = process.cwd()

    this.option('git-url')
    this.option('override')
    this.option('email')
    console.log('options', this.options)
  }

  initializing () {
    this.props = {}
  }

  _resolve (...args) {
    return path.join(this._cwd, ...args)
  }

  _js_name (name) {
    return name.replace(REGEX_SPECIAL_VARIABLE, '_')
  }

  prompting () {
    return askName({
      name: 'name',
      message: 'name',
      default: () => path.basename(this._cwd),
      validate: v => REGEX_VALID_NPM_NAME.test(v)

    }, this)
    .then(({name}) => {
      this.props.name = name

      return this.prompt([{
        name: 'email',
        message: 'email',
        store: true,
        when: () => !this.options.email

      }, {
        type: 'confirm',
        name: '_merge_package',
        message: 'package.json exists, merge new fields?',
        default: true,
        when: () => fs.exists(this._resolve('package.json'))
      }])
      .then(answers => {
        Object.assign(this.props, answers)
      })
    })
  }

  writing () {
    return new Scaffold({
      data: {
        name: this.props.name,
        js_name: this._js_name(this.props.name),
        email: this.props.email || this.options.email,
        ignore_file: '.gitignore',
        npm_ignore_file: '.npmignore'
      }
    })
    .copy(templateDir, this._cwd)
    .then(() => {

    })

    // const pkg = this.fs.readJSON(this.destinationPath('package.json'), {})

    // extend(pkg, {
    //   dependencies:
    // })

    // this.fs.writeJSON(this.destinationPath('package.json'), pkg)
  }

  install () {
    this.installDependencies({
      bower: false
    })
  }
}
