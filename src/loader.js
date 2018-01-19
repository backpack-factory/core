const fs = require('fs')
const path = require('path')
const webpack = require('webpack')
const { mergeWith, isArray } = require('lodash')

const Loader = {}

const basePatternDir = path.join(process.env['APPDATA'], 'backpack-factory/patterns')
const configFileName = 'factory.config.js'
const defaultPattern = 'base-pattern'

function getPatternsList (config) {
  let list = config.patterns || []
  list = Array.isArray(list) ? list : [list]
  if (config.pattern) list.push(config.pattern)
  return list
}

function merge (...args) {
  return mergeWith(...args, (objValue, srcValue) => {
    if (isArray(objValue)) return objValue.concat(srcValue)
  })
}

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
  let pattern
  // Get the pattern config if it exists
  let patternPath = path.join(basePatternDir, patternName)
  if (!fs.existsSync(patternPath)) {
    console.warn('Unknown pattern:', patternName)
    pattern = { root: null }
  } else {
    pattern = Loader.getModule(path.join(patternPath, configFileName))
    pattern.root = patternPath
  }
  // Set name
  pattern.name = patternName
  // Set patterns
  pattern.patterns = getPatternsList(pattern)
  // Return the pattern
  return pattern
}

Loader.applyPattern = function (pattern, config = {}) {
  // Apply dependencies first
  config = Loader.applyPatterns(pattern.patterns, config)
  // Merge the config and the pattern
  config = merge({}, config, pattern)
  if (pattern.updateConfig) {
    config = pattern.updateConfig(config, webpack)
  }
  // Add the pattern's path to paths
  config.paths.patterns.unshift(pattern.root)
  // Return the config
  return config
}

Loader.applyPatterns = function (patterns, config = {}) {
  for (let patternName of patterns) {
    let pattern = Loader.getPattern(patternName)
    config = Loader.applyPattern(pattern, config)
  }
  return config
}

Loader.getConfig = function (options = {}) {
  // Initialize the path property in options
  options.paths = {
    root: path.resolve('.'),
    patterns: []
  }
  // Get the user config if it exists
  let userConfigPath = path.resolve(configFileName)
  let userConfig = Loader.getModule(userConfigPath)
  userConfig = merge({}, options, userConfig)
  // Set name & root
  userConfig.name = userConfig.name || 'user-config'
  userConfig.root = userConfig.root || path.resolve('.')
  // Get or set the patterns
  userConfig.patterns = getPatternsList(userConfig)
  if (userConfig.patterns.length === 0) userConfig.patterns.push(defaultPattern)
  // Apply the patterns
  return Loader.applyPattern(userConfig, userConfig)
}

module.exports = Loader
