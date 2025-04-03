舟山数据下载，参考文档：

高德api文档：[https://lbs.amap.com/api/webservice/guide/api-advanced/search#t5](https://lbs.amap.com/api/webservice/guide/api-advanced/search#t5)

1. 爬取数据，在js脚本里面配置关键字。（可能需要坐标系的配置）
2. ```
   node ./script.js
   ```
3. 爬取数据后，得到json，运行函数2，转换json得到excel数据。

运行如下脚本：

```
node trans.js ./zhoushan_homestays.json
```

参数介绍：第一个是脚本的路径；第二个是脚本的输入数据，这里选择舟山的民宿的json数据。

多个数据合成脚本：

```
node .\translot.js '.\zhoushan_homestays copy 2.json' '.\zhoushan_homestays copy 3.json' '.\zhoushan_homestays copy 4.json' '.\zhoushan_homestays copy 5.json' '.\zhoushan_homestays copy 6.json' '.\zhoushan_homestays copy.json'
```

爬取古建筑的脚本。

1。 将您的文本数据转换为结构化CSV输入文件（例如：`input.csv`）:

2 。 **输出文件** ：生成 `output.csv`包含经纬度

安装依赖

```
npm install csv-parser axios csv-stringify p-limit

```

批量获取，根据地区转换成经纬度。

```
node test.js
```

这行命令式对input.csv里面的数据进行读取，使用经纬度搜索（高德的），输出有经纬度信息的csv文件。
