const path = require('path');
const fs = require('fs');
const express = require('express');
const opn = require('opn');
const systems = require('./config').systems;
const siteInfo = require('./config').site;
const combine = require('./combine');
const jsdom = require("jsdom");
const net = require('net');
const shell = require('shelljs');
const app = express();

let checkPort = (port) => {
    let server = net.createServer().listen(port);
    let promise = new Promise((resolve, reject) => {
        server.on('listening', () => {
            console.log('端口可用');
            server.close();
        });
        server.on('error', (error) => {
            errorMessage = error.code;
            switch (error.code) {
                case 'EADDRINUSE':
                    errorMessage = `端口 ${port} 被占用`;
                    break;
                case 'EACCES':
                    errorMessage = `没有权限监听 ${port} 端口`;
                    break;
            }
            reject(errorMessage);
        });
        server.on('close', () => {
            resolve();
        });
    });

    return promise;
}

let killPort = (port) => {
    let promise = new Promise((resolve, reject) => {
        try {
            let processId = Number(shell.exec(`lsof -t -s TCP:LISTEN -i:${port}`));
            if (processId) {
                console.log(`正在干死进程 ${processId}`);
                shell.exec(`kill ${processId}`, () => {
                    console.log(`成功干死进程 ${processId}`);
                    setTimeout(() => {
                        resolve();
                    }, 1000);
                });
            } else {
                reject('没找到进程，如果是以root权限运行的，需手动杀死进程');
            }
        } catch (e) {
            reject(e);
        }
    })
    return promise;
}

const build = () => {
    const startTime = new Date();
    shell.rm('-rf', 'dist');
    systems.forEach((sys) => {
        const sysFolder = path.join('swagger', sys.folder);
        const defFolders = fs.readdirSync(sysFolder).filter(file => fs.statSync(path.join(sysFolder, file)).isDirectory());
        const apiDoc = combine(sysFolder);
        if (apiDoc) {
            shell.mkdir('-p', `dist/${sys.folder}`);
            fs.writeFileSync(`dist/${sys.folder}/index.json`, JSON.stringify(apiDoc, null, 4));
            defFolders.forEach((def) => {
                shell.cp('-r', path.join(sysFolder, def), `dist/${sys.folder}`);
            });
        }
    });

    shell.mkdir('-p', 'dist/swagger-ui');
    shell.cp('-rf', 'node_modules/swagger-ui/dist/*', 'dist/swagger-ui');
    try {
        jsdom.env(fs.readFileSync('dist/swagger-ui/index.html', 'utf8'), ['lang/translator.js', 'lang/zh-cn.js'], function(errors, window) {
            fs.writeFileSync('dist/swagger-ui/index.html', window.document.documentElement.outerHTML);
        });
    } catch (ex) {
        console.log(ex);
    }

    shell.cp('-f', 'build/index.html', 'dist');

    let indexJsContent = fs.readFileSync('build/index.js', 'utf8');
    fs.writeFileSync('dist/index.js', indexJsContent.replace('{0}', JSON.stringify(systems, null, 4)));
    const endTime = new Date();
    const usingTime = endTime - startTime;
    console.log(`${endTime.toLocaleString()}: build success! using ${usingTime}ms`);
};

build();

app.use(express.static('dist'));

const port = siteInfo.port;
checkPort(port).then(() => {
    app.listen(port);
    console.log(`服务已启动，端口号为:${port}`);
}).catch((errorMessage) => {
    console.error(errorMessage);
    killPort(port).then(() => {
        app.listen(port);
        console.log(`服务已启动，端口号为:${port}`);
    }).catch((error) => {
        console.error('没干死该进程', error);
    });
});
