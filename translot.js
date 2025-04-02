const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

// 配置参数
const config = {
  excelColumns: [
    { header: 'ID', key: 'id', width: 20 },
    { header: '名称', key: 'name', width: 30 },
    { header: '类型', key: 'type', width: 25 },
    { header: '地址', key: 'address', width: 40 },
    { header: '经度', key: 'lng', style: { numFmt: '0.000000' } },
    { header: '纬度', key: 'lat', style: { numFmt: '0.000000' } },
    { header: '电话', key: 'tel', width: 15 },
    { header: '评分', key: 'rating' },
    { header: '人均消费', key: 'price' }
  ],
  outputFile: 'combined_data.xlsx' // 固定输出文件名
};

// 主处理函数
async function processFiles(filePaths) {
  // 合并所有数据
  const allData = await loadAndMergeData(filePaths);
  
  // 数据转换
  const processedData = transformData(allData);
  
  // 生成Excel
  await generateExcel(processedData);
  console.log(`🎉 成功合并 ${filePaths.length} 个文件，共 ${processedData.length} 条数据`);
}

// 加载并合并JSON数据
async function loadAndMergeData(filePaths) {
  let mergedData = [];
  
  for (const filePath of filePaths) {
    try {
      const rawContent = fs.readFileSync(filePath, 'utf8');
      const jsonData = JSON.parse(rawContent);
      console.log(`📂 已加载 ${jsonData.length} 条数据：${path.basename(filePath)}`);
      mergedData = mergedData.concat(jsonData);
    } catch (error) {
      console.warn(`⚠️ 跳过无效文件 ${path.basename(filePath)}: ${error.message}`);
    }
  }
  
  return mergedData;
}

// 数据转换处理
function transformData(rawData) {
  return rawData.map(item => {
    // 坐标校验
    if (!validateCoordinates(item.location)) {
      console.warn(`🚫 无效坐标：${item.id}`);
      return null;
    }

    // 数据处理
    return {
      ...item,
      lng: parseFloat(item.location[0].toFixed(6)),
      lat: parseFloat(item.location[1].toFixed(6)),
      price: formatPrice(item.price)
    };
  }).filter(Boolean); // 过滤无效数据
}

// 坐标验证函数
function validateCoordinates(location) {
  return Array.isArray(location) && 
         location.length === 2 &&
         !isNaN(location[0]) && 
         !isNaN(location[1]);
}

// 价格格式化函数
function formatPrice(priceArray) {
  if (!Array.isArray(priceArray) || priceArray.length === 0) return '暂无报价';
  return priceArray.map(Number).filter(n => !isNaN(n)).join('-') + '元';
}

// 生成Excel文件
async function generateExcel(data) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('合并数据');

  // 设置列头
  worksheet.columns = config.excelColumns;

  // 添加数据
  worksheet.addRows(data);

  // 自适应列宽
  worksheet.columns.forEach(column => {
    const headerLength = column.header.length;
    column.width = headerLength < 10 ? 15 : Math.min(headerLength * 2, 40);
  });

  // 保存文件
  await workbook.xlsx.writeFile(config.outputFile);
}

// 执行入口
(() => {
  const filePaths = process.argv.slice(2);
  
  if (filePaths.length === 0) {
    console.log('使用方法: node trans.js file1.json file2.json ...');
    process.exit(1);
  }

  processFiles(filePaths).catch(error => {
    console.error('🔥 发生致命错误:', error.message);
    process.exit(1);
  });
})();