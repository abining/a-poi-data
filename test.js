const fs = require('fs');
const { parse } = require('csv-parse/sync');
const axios = require('axios');
const { stringify } = require('csv-stringify/sync');

// 配置
const GAODE_KEY = '3db95b3793253fc493f34497b1960805';
const input = fs.readFileSync('input.csv', 'utf8');
const rows = parse(input, { columns: true, skip_empty_lines: true });

const a = {};

// 高德API请求函数 (保持不变)
async function processRow(row) {
  try {
    const resp = await axios.get('https://restapi.amap.com/v3/geocode/geo', {
      params: {
        key: GAODE_KEY,
        address: "" + row.city + row.district + row.name,
        // city: `${row.city}`
      }
    });
    console.log(JSON.stringify(resp.data), '----');
    const loc = resp.data?.geocodes?.[0]?.location;
    
    a[row.name] = { res: resp.data?.geocodes, sta: resp.status, input: "" + row.city + row.district + row.name };
    return loc ? 
      { ...row, lng: loc.split(',')[0], lat: loc.split(',')[1], error: '' } : 
      { ...row, lng: '', lat: '', error: '未找到结果' };
  } catch (error) {
    return { ...row, lng: '', lat: '', error: error.message };
  }
}

// 新版主流程：使用Promise链式调用
(async () => {
  // 创建初始Promise
  let chain = Promise.resolve([]);
  let processedCount = 0;
  let batchCount = 0; // 用于计数每批次处理的数量

  // 构建链式调用
  rows.slice(0, 201).forEach((row, index) => { // 测试前80条
    chain = chain.then(async (results) => {
      const result = await processRow(row);
      processedCount++;
      batchCount++;

      console.log(`进度: ${processedCount}/${rows.length}`);

      // 每处理3个请求后休眠1秒
      if (batchCount % 3 === 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('休眠1秒...');
      }

      return [...results, result];
    });
  });

  // 等待所有请求完成
  const results = await chain;

  // 生成CSV
  fs.writeFileSync('output.csv', stringify(results, {
    header: true,
    columns: [...Object.keys(rows[0]), 'lng', 'lat', 'error']
  }));

  console.log('处理完成！');
  console.log(a);
})();