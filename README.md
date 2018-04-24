# API文档维护项目

使用swagger语法，[帮助文档](http://swagger.io/specification/)，用json格式。

本地运行：
1. 安装依赖：npm install
2. 生成站点：npm run view

在线查看：
- http://10.66.30.40:3001/

+ 目录结构
    + build _生成站点相关代码_
    + dist _运行站点代码_
    + swagger _文档定义文件所存目录_
        + app _app定义文档_
            + common _通用数据模型_
        + backend _后台api定义文档_
            + common _通用数据模型_

每个人按照自己模块建立文档，npm run view后，会为每个系统统一的swagger文档。

[示例参考](http://editor.swagger.io/#/)

## 对文档编写的一些要求
1. 必须要有对接口的描述。
2. 变量名用camel命名。
3. Response按照以下格式：
```
{
    "msg": {
        "type": "string",
        "description": "成功信息"
    },
    "code": {
        "type": "string",
        "description": "成功编码 0",
        "required": true
    },
    "data": {
        "type": "object",
        "description": "返回数据"
    }
}
```