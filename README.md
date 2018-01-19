# BackpackFactory - Core

> Inspired by [backpack](https://github.com/jaredpalmer/backpack), made industrial.

The Backpack Factory is a building tool using using webpack. It is made to be very flexible and super light. The main goal is to have the factory installed globally with all the useful packages and configurations, and then using it in any project on your system.

### Table of Contents
- [How to use](How-to-use)
  - [Configuration files](Configuration-files)
  - [Patterns](Patterns)
- [CLI Commands](CLI-Commands)
- [FAQ](FAQ)
- [Todos](Todos)

## How to use
First you need to install the core of factory:
```
npm install -g backpack-factory
```

Then you need to set up some patterns in the `./patterns` directory. You will find many patterns in this [github](https://github.com/backpack-factory). For instance you can get [base pattern](https://github.com/backpack-factory/base-pattern).

Go to your local project and add some `scripts` to your `./package.json`:
```
"dev": "backpack-factory dev",
"build": "backpack-factory build",
```

Create a configuraton file named `./factory.config.js`, (note that if you are using the _base-pattern_, this file is optionnal).
```js
module.exports = {
  pattern: 'base-pattern'
}
```

Then you can create the entry file for your application, by default, it should be `./src/main.js`

Then run `npm run dev` and enjoy!

### Configuration files
You can create configuraton files in your local project or in patterns directories. They must be called `./factory.config.js`. There is no specific requirement for them but here are some default properties:
```js
module.exports = {
  pattern: String, // Name of the pattern your using
  patterns: [String], // You can also pass an array of patterns.

  webpack: { // The webpack config to be passed to webapck for building
    // ...
  },

  updateConfig: function (config, webpack) { // A function to update dynamically the configuration
    // ...
    return config // /!\ Important
  },

  scripts: { // scripts that can be run using backpack-factory run scriptName
    dev (config, webpack) {
      // ...
    },
    build (config, webpack) {
      // ...
    },
    custom (config, webpack) {
      // ...
    }
  }
}
```

The config object will be initialized as `{ env: 'development' }` (or `{ env: 'production' }`) and then will go through all patterns you requested and finally through the local configuration. Each time, it will be merge (recursively) and the function `updateConfig` will be call on it (if the function is defined).

At the end the scripts will be given the full config object, so they may use the webpack property to feed a webpack compiler.

### Patterns
A Pattern is a directory named after the pattern's name. It can contained pretty much anything, but mostly configuraton files `./factory.config.js` and a list of dependencies in a `./package.json` file. Note that modules installed in the patterns will be requirable in your local project.

Look for the basic patterns to have some examples.

## CLI Commands
#### backpack-facrory run [scriptName]
This command is the one launch scripts from your pattern. Just type `backpack-factory run scriptName` to call `scripts.scriptName`.

`backpack-factory build` and `backpack-factory dev` are shortcuts for `backpack-factory run build` and `backpack-factory run dev`.

#### backpack-facrory get [patternName]
This command allows you to add pattern to the factory to be used later. For instance type `backpack-facrory get base-pattern` to download and setup [base pattern](https://github.com/backpack-factory/base-pattern).

## FAQ
None yet

## Todos
- Make a CLI command to download patterns
- Add all paths to the config objects
