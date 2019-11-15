#!/usr/bin/env node

const path = require('path')
const fs = require('fs')
const program = require('commander')
const glob = require('glob')
const inquirer = require('inquirer') // 命令行交互
const chalk = require('chalk') // 颜色终端
const logSymbols = require('log-symbols') // 图标
const download = require('../lib/download') // 下载模板
const generator = require('../lib/generator')
const latestVersion = require('latest-version')

program.usage('<project-name>').parse(process.argv)

// 根据输入，获取项目名称
let projectName = program.args[0]

if (!projectName) {  // 项目名称必填
  program.help()
  return
}

const list = glob.sync('*')  // 当前目录
let rootName = path.basename(process.cwd()) // 根目录

let next = undefined
if (list.length) {  // 如果当前目录不为空
  if (list.filter(name => {
    const fileName = path.resolve(process.cwd(), path.join('.', name))
    const isDir = fs.statSync(fileName).isDirectory()
    return name.indexOf(projectName) !== -1 && isDir
  }).length !== 0) {
    console.log(`项目${projectName}已经存在`)
    return
  }
  next = Promise.resolve(projectName)
} else if (rootName === projectName) {
  next = inquirer.prompt([
    {
      name: 'buildInCurrent',
      message: '当前目录为空，且目录名称和项目名称相同，是否直接在当前目录下创建新项目？',
      type: 'confirm',
      default: true
    }
  ]).then(answer => {
    return Promise.resolve(answer.buildInCurrent ? '.' : projectName)
  })
} else {
  next = Promise.resolve(projectName)
}

next.then(projectRoot => {
  if (projectRoot !== '.') {
    fs.mkdirSync(projectRoot)
  }
  return download(projectRoot).then(target => {
    return {
      name: projectName,
      root: projectName,
      downloadTemp: target
    }
  })
}).then(context => {
  return inquirer.prompt([
    {
      name: 'projectName',
      message: '项目的名称',
      default: context.name
    }, {
      name: 'projectVersion',
      message: '项目的版本号',
      default: '1.0.0'
    }, {
      name: 'projectDescription',
      message: '项目的简介',
      default: `A project named ${context.name}`
    }
  ]).then(answers => {
    // return latestVersion('mika-ui').then(version => {
    // answers.supportUiVersion = version
    return {
      ...context,
      metadata: {
        ...answers
      }
    }
    // }).catch(err => {
    // return Promise.reject(err)
    // })
  })
}).then(context => {
  return generator(context, context.downloadTemp, path.parse(context.downloadTemp).dir)
}).then(res => {
  console.log(logSymbols.success, chalk.green('项目创建成功 :)'))
  console.log()
  console.log(chalk.gray('您可执行下面命令来运行项目'))
  console.log(chalk.cyan('cd ' + res.root + '\nnpm install\nnpm run dev'))
}).catch(err => {
  console.error(logSymbols.error, chalk.red(`创建失败：${err.message}`))
})
