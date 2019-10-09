#!/usr/bin/env node

// config
const SET_DIRECTORY = 'octicons'
targetDir = `${SET_DIRECTORY}/svg/`
targetModule = camelize(SET_DIRECTORY)

const elmxParser = require('elmx');

const fs = require('fs');
const afs = fs.promises;

function camelize(text) {
    text = text.replace(/[-_\s.]+(.)?/g, (match, c) => c ? c.toUpperCase() : '');
    return text.substr(0, 1).toUpperCase() + text.substr(1);
}

const deleteFolderRecursive = async path =>  {
    if (fs.existsSync(path)) {
        for (let entry of await afs.readdir(path)) {
            const curPath = path + "/" + entry;
            if ((await afs.lstat(curPath)).isDirectory())
                await deleteFolderRecursive(curPath);
            else await afs.unlink(curPath);
        }
        await afs.rmdir(path);
    }
};

async function run () {
    await deleteFolderRecursive(targetDir)
    fs.mkdirSync(targetDir)
    console.log(convert())
}


function log (a) {
    console.log(Array.from(arguments).join(' '))
    return a
}

const dir = fs.readdirSync(`${SET_DIRECTORY}`)

const convert = () =>
    dir
   .map(async file => {
        // read file as string and convert to elm
       log(`${SET_DIRECTORY}/${file}`)
       const source = (await afs.readFile(`${SET_DIRECTORY}/${file}`)).toString()
       const generated = elmxParser(source)
       const targetName = camelize(file.split('.')[0])
       const elmSource = `module ${targetModule}.${targetName} exposing (view)

{-| Generated with elm-svg-icons -}

view = ${generated}`
       const target = `${targetDir}${targetName}.elm`
       fs.writeFile(target, elmSource, () => log(target, 'written'))
       return
   })[0]

run()
