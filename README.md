china-area.js
=============

中国省、市、区下拉列表框三级联动 javascript 库。

数据来源
----------
[国家统计局发布数据](http://www.stats.gov.cn/tjsj/tjbz/xzqhdm/)

参考
----------
[省市区三级联动js代码实例](http://www.bkjia.com/jingyan/509522.html)

由于该代码的数据有问题才动了开发 china-area.js 库的念头，如：
* “市、县级市”中有重复的数据，如（o城关镇）
* 缺少数据，如（甘肃省，金昌市）

下载 china-area.js
------------------

    git clone https://github.com/tangxinfa/china-area.js.git

安装 china-area.js 依赖
-----------------------

    npm install

要求预先安装 node.js 4.x

生成 china-area.js
------------------

    npm build

使用最新发布的行政区划代码数据生成 china-area.js，当前最新为 2015 年 9 月 30 日数据。

[使用示例](./demo.html)
-----------------------
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>china-area.js 使用示例</title>
      </head>
      <body>
        <select id="province">
        </select>
        <select id="city">
        </select>
        <select id="county">
        </select>
        <script src="./china-area.js" type="text/javascript"></script>
        <script type="text/javascript">
          chinaAreaInit(["province", "city", "county"], ["省份","地级市","市、县级市"]);
        </script>
      </body>
    </html>

[在线演示](https://blog.kankanan.com/static/china-area.js/demo.html)
------------------------------------------------------------

![china-area.js screenshot](https://blog.kankanan.com/static/china-area.js/demo.png)
