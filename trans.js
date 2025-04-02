// trans.js
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

// 配置参数
const config = {
  excelColumns: [
    { header: 'ID', key: 'id' },
    { header: '名称', key: 'name' },
    { header: '类型', key: 'type' },
    { header: '详细地址', key: 'address' },
    { header: '经度', key: 'lng', style: { numFmt: '0.000000' } },
    { header: '纬度', key: 'lat', style: { numFmt: '0.000000' } },
    { header: '联系电话', key: 'tel' },
    { header: '评分', key: 'rating' },
    { header: '人均消费', key: 'price' }
  ]
};

// 主函数
async function convertJsonToExcel(jsonPath) {
  try {
    // 参数校验
    if (!jsonPath || !fs.existsSync(jsonPath)) {
      throw new Error('JSON文件路径无效或文件不存在');
    }

    // 读取JSON数据
    const rawData = fs.readFileSync(jsonPath, 'utf8');
    const jsonData = JSON.parse(rawData);
    console.log(`📁 成功读取 ${jsonData.length} 条数据`);

    // 创建Excel工作簿
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('民宿数据');
    worksheet.columns = config.excelColumns;

    // 数据转换处理
    const processedData = jsonData.map(item => {
      // 坐标校验与解析
      if (!item.location || typeof item.location !== 'string') {
        console.warn(`⚠️ 异常坐标数据: ID ${item.id}`);
        return null;
      }
      
      const [lng, lat] = item.location.split(',').map(Number);
      if (isNaN(lng) || isNaN(lat)) {
        console.warn(`⚠️ 坐标格式错误: ID ${item.id}`);
        return null;
      }

      // 数据标准化
      return {
        ...item,
        lng: lng.toFixed(6),
        lat: lat.toFixed(6),
        tel: item.tel || '无',
        rating: item.rating || '未评分',
        price: formatPrice(item.price)
      };
    }).filter(Boolean);

    // 写入Excel
    worksheet.addRows(processedData);
    
    // 设置列宽
    worksheet.columns.forEach(column => {
      column.width = column.header.length < 10 ? 15 : 25;
    });

    // 保存文件
    const outputPath = path.join(
      path.dirname(jsonPath),
      `${path.basename(jsonPath, '.json')}_converted.xlsx`
    );
    
    await workbook.xlsx.writeFile(outputPath);
    console.log(`✅ 转换完成，文件已保存至: ${outputPath}`);
    console.log(`📊 有效数据记录: ${processedData.length} 条`);

  } catch (error) {
    console.error('❌ 转换失败:', error.message);
    process.exit(1);
  }
}

// 价格格式化函数
function formatPrice(price) {
  if (!price) return '价格未知';
  if (/\d+-\d+/.test(price)) return `${price}元`;
  return `${parseInt(price)}元左右`;
}

// 执行转换
const jsonFilePath = process.argv[2];
if (!jsonFilePath) {
  console.log('使用方法: node trans.js <json文件路径>');
  process.exit(1);
}

convertJsonToExcel(jsonFilePath);