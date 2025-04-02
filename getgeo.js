const fs = require('fs');
const { parse } = require('csv-parse/sync'); // 同步解析CSV
const axios = require('axios');
const { stringify } = require('csv-stringify/sync');

// 配置
const GAODE_KEY = '3db95b3793253fc493f34497b1960805';
const input = fs.readFileSync('input.csv', 'utf8'); // 同步读取整个文件

// 解析CSV
const rows = parse(input, {
  columns: true,
  skip_empty_lines: true
});

const a = {}

// 高德API请求
async function processRow(row) {
  try {
    const resp = await axios.get('https://restapi.amap.com/v3/geocode/geo', {
      params: {
        key: GAODE_KEY,
        address:"" + row.city+row.district+row.name,
        city: `${row.city}`
      }
    });
    
    const loc = resp.data?.geocodes?.[0]?.location;
    // a.assign(row.name, resp);
    a[row.name] =  resp.data?.geocodes?.[0]
    return loc ? 
      { ...row, lng: loc.split(',')[0], lat: loc.split(',')[1], error: '' } : 
      { ...row, lng: '', lat: '', error: '未找到结果' };
  } catch (error) {
    return { ...row, lng: '', lat: '', error: error.message };
  }
}

// 主流程
(async () => {
  const results = [];
  let i = 0;
  for (const row of rows) {
    i++
    if(i>15 ) break; // 测试只处理前5行
    results.push(await processRow(row));
    console.log(`进度: ${results.length}/${rows.length}`);
  }
  
  // 生成CSV
  fs.writeFileSync('output.csv', stringify(results, {
    header: true,
    columns: [...Object.keys(rows[0]), 'lng', 'lat', 'error']
  }));
  
  console.log('处理完成！');
  console.log(a);
})();