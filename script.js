const axios = require('axios');
const fs = require('fs');
const path = require('path');

// 配置参数
const config = {
  apiKey: '3db95b3793253fc493f34497b1960805',
  adcode: '320000', // 舟山市行政编码
  keyword: '巷',
  outputFile: path.join(__dirname, 'zhoushan_homestays.json'),
  requestInterval: 500, // 请求间隔(毫秒)，避免触发频率限制
  pageSize: 25 // 每页条数(高德API最大值)
};

// 初始化数据存储
let allPOIs = [];
let currentPage = 1;
let totalCount = 0;

// 创建axios实例
const apiClient = axios.create({
  baseURL: 'https://restapi.amap.com/v3/place/text',
  timeout: 10000
});

// 主执行函数
async function main() {
  try {
    console.log('开始获取舟山市民宿数据...');
    
    do {
      const { count, pois } = await fetchPage(currentPage);
      
      if (currentPage === 1) {
        totalCount = count;
        console.log(`总计发现 ${totalCount} 条相关数据`);
      }

      allPOIs = allPOIs.concat(pois);
      console.log(`已获取第 ${currentPage} 页数据，累计 ${allPOIs.length} 条`);

      currentPage++;
      await delay(config.requestInterval);
    } while (shouldContinueFetching());

    saveToFile();
    console.log(`数据已保存至 ${config.outputFile}`);
  } catch (error) {
    console.error('程序执行出错:', error.message);
  }
}

// 分页获取数据
async function fetchPage(page) {
  try {
    const params = {
      key: config.apiKey,
      keywords: config.keyword,
      city: config.adcode,
      citylimit: true,
      offset: config.pageSize,
      page: page,
      extensions: 'all'
    };

    const response = await apiClient.get('', { params });
    
    if (response.data.status !== '1') {
      throw new Error(`API请求失败: ${response.data.info}`);
    }

    return {
      count: parseInt(response.data.count, 10),
      pois: response.data.pois || []
    };
  } catch (error) {
    throw new Error(`第 ${page} 页请求失败: ${error.message}`);
  }
}

// 判断是否继续抓取
function shouldContinueFetching() {
  return allPOIs.length < totalCount && currentPage <= Math.ceil(totalCount / config.pageSize);
}

// 保存数据到文件
function saveToFile() {
  const formattedData = allPOIs.map(poi => ({
    id: poi.id,
    name: poi.name,
    type: poi.type,
    address: poi.address,
    location: poi.location.split(',').map(Number),
    tel: poi.tel || '无',
    photos: poi.photos?.map(p => p.url) || [],
    rating: poi.biz_ext?.rating || '无',
    price: poi.biz_ext?.cost || '无'
  }));

  fs.writeFileSync(
    config.outputFile,
    JSON.stringify(formattedData, null, 2),
    'utf8'
  );
}

// 工具函数
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 执行程序
main();