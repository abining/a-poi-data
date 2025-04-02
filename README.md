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
