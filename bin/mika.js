#!/usr/bin/env node
const program = require('commander')

program.version('1.0.0')
	.usage('<mika> [项目名称]')
	.command('init', 'init project')
	.parse(process.argv)
