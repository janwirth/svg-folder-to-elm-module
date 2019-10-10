#!/usr/bin/env node

// config
const SET_DIRECTORY = 'boxicons'
targetModule = pascalize(SET_DIRECTORY)

const elmxParser = require('elmx');

const fs = require('fs');

function pascalize(text) {
    text = text.replace(/[-_\s.]+(.)?/g, (match, c) => c ? c.toUpperCase() : '');
    return text.substr(0, 1).toUpperCase() + text.substr(1);
}

async function run () {
    const body = convert().join('\n\n')
    log(body)
    const content = skeleton + body
    const target = `${targetModule}.elm`
    fs.writeFile(target, content, () => log(target, 'written'))
}


function log (a) {
    console.log(Array.from(arguments).join(' '))
    return a
}


const skeleton = `module ${targetModule} exposing (..)

{-| Generated with elm-svg-icons -}

import Svg
import Svg.Attributes
import Html.Attributes

`


const convert = () =>
    fs.readdirSync(SET_DIRECTORY)
   .map(file => {
        // read file as string and convert to elm
       const sourceFile = `${SET_DIRECTORY}/${file}`
       try {
           const source = (fs.readFileSync(sourceFile)).toString()
           const generated = elmxParser(source)
                .replace(/viewbox/g, 'viewBox')
                .replace(/Html/g, 'Svg')
                .replace(/Svg\.Attributes/g, 'Html.Attributes')
                .replace(/"svg" \[/g, '"svg" [Svg.Attributes.fill fill,')
           const targetName = pascalize(file.split('.')[0])
           const elmSource = `${targetName[0].toLowerCase() + targetName.slice(1)} fill = ${generated}`
           return elmSource
       } catch (e) {
           log(sourceFile, 'failed')
           console.error(e)
           return ''
       }
   })

run()
