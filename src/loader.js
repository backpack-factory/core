const fs = require('fs')
const path = require('path')
const { mergeDeep } = require('./utils')

const Loader = {}

const basePatternDir = path.join(process.env['APPDATA'], 'backpack-factory/patterns')
const configFileName = 'factory.config.js'
const defaultPattern = 'base-pattern'

Loader.getModule = function (path, defaultValue = {}) {
  if (fs.existsSync(path)) {
    let module = require(path)
    return module.default || module
  } else {
    return defaultValue
  }
}

Loader.getPattern = function (patternName) {
  // console.log('> Loading', patternName)
  let patternPath = path.join(basePatternDir, patternName)
  if (!fs.existsSync(patternPath)) {
    console.warn('Unknown pattern:', patternName)
    return {}
  }
  let pattern = Loader.getModule(path.join(patternPath, configFileName))
  // Set name & root
  pattern.name = patternName
  pattern.root = patternPath
  // Get patterns
  pattern.patterns = pattern.patterns || []
  pattern.patterns = Array.isArray(pattern.patterns) ? pattern.patterns : [pattern.patterns]
  if (pattern.pattern) pattern.patterns.push(pattern.pattern)
  return pattern
}

Loader.applyPattern = function (pattern, config = {}) {
  config = Loader.applyPatterns(pattern.patterns, config)
  config = mergeDeep({}, config, pattern)
  if (pattern.updateConfig) {
    config = pattern.updateConfig(config)
  }
  let modulePath = path.join(pattern.root, 'node_modules')
  config.webpack.resolveLoader.modules.unshift(modulePath)
  config.webpack.resolve.modules.unshift(modulePath)
  config.webpack.target = pattern.target || config.webpack.target
  return config
}

Loader.applyPatterns = function (patterns, config = {}) {
  while (patterns.length > 0) {
    let pattern = Loader.getPattern(patterns.pop())
    config = Loader.applyPattern(pattern, config)
  }
  return config
}

Loader.getConfig = function (options = {}) {
  let userConfigPath = path.resolve(configFileName)
  let userConfig = Loader.getModule(userConfigPath, {
    pattern: defaultPattern
  })
  userConfig = mergeDeep({}, options, userConfig)
  userConfig.patterns = userConfig.patterns || []
  userConfig.patterns = Array.isArray(userConfig.patterns) ? userConfig.patterns : [userConfig.patterns]
  if (userConfig.pattern) userConfig.patterns.push(userConfig.pattern)
  if (userConfig.patterns.length === 0) userConfig.patterns.push(defaultPattern)
  userConfig.root = userConfig.root || path.resolve('.')
  return Loader.applyPattern(userConfig, userConfig)
}

module.exports = Loader
