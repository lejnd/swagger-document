const fs = require('fs');
const path = require('path');
const util = require('util');

let wholeApiDoc;
let fileList;

const combineBase = (apiDocObject) => {
    if (apiDocObject.info != null) {
        wholeApiDoc.info = apiDocObject.info;
    }
    if (apiDocObject.host != null) {
        wholeApiDoc.host = apiDocObject.host;
    }
    if (apiDocObject.basePath != null) {
        wholeApiDoc.basePath = apiDocObject.basePath;
    }
};

const combinePath = (apiDocObject) => {
    if (apiDocObject.paths == null) {
        return;
    }
    Object.keys(apiDocObject.paths).forEach((path) => {
        if (Object.keys(wholeApiDoc.paths).indexOf(path) < 0) {
            wholeApiDoc.paths[path] = {};
        }
        Object.assign(wholeApiDoc.paths[path], apiDocObject.paths[path]);
    });
};

const combineTag = (apiDocObject) => {
    if (Array.isArray(apiDocObject.tags)) {
        apiDocObject.tags.forEach((tag) => {
            if (wholeApiDoc.tags.find(t => t.name === tag.name)) {
                return;
            } else if (tag.name.toLowerCase() === 'common') {
                wholeApiDoc.tags.unshift(tag);
            } else {
                wholeApiDoc.tags.push(tag);
            }
        });
    }
};

const combineDefinition = (apiDocObject) => {
    if (apiDocObject.definitions == null) {
        return;
    }
    Object.keys(apiDocObject.definitions).forEach((definition) => {
        if (wholeApiDoc.definitions.hasOwnProperty(definition)) {
            return;
        } else {
            wholeApiDoc.definitions[definition] = apiDocObject.definitions[definition];
        }
    });
};

const combineParameter = (apiDocObject) => {
    if (apiDocObject.parameters == null) {
        return;
    }
    Object.keys(apiDocObject.parameters).forEach((parameter) => {
        if (wholeApiDoc.parameters.hasOwnProperty(parameter)) {
            return;
        } else {
            wholeApiDoc.parameters[parameter] = apiDocObject.parameters[parameter];
        }
    });
};

const searchFile = (path) => {
    try {
        let dirList = fs.readdirSync(path);
        dirList.forEach(function(item) {
            if (fs.statSync(path + '/' + item).isDirectory()) {
                searchFile(path + '/' + item);
            } else {
                fileList.push(path + '/' + item);
            }
        });
    } catch (ex) {
        console.log(`${path} 不存在`);
    }
};

module.exports = (swaggerPath) => {
    wholeApiDoc = {
        swagger: '2.0',
        tags: [],
        paths: {},
        definitions: {},
        parameters: {}
    };

    fileList = [];

    searchFile(path.join(swaggerPath));

    fileList.forEach((f) => {
        if (path.extname(f) === '.json') {
            try {
                const content = fs.readFileSync(f, 'utf8');
                const apiDocObject = JSON.parse(content);
                combinePath(apiDocObject);
                combineTag(apiDocObject);
                combineDefinition(apiDocObject);
                combineParameter(apiDocObject);
                combineBase(apiDocObject);
            } catch (ex) {
                console.error(f, ex);
            }
        }
    });
    return wholeApiDoc;
}
