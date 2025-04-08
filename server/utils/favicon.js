/**
 * favicon.js - 网站图标获取工具
 * 
 * 这个工具用于从网站URL中提取favicon图标
 */

const axios = require('axios');
const cheerio = require('cheerio');

/**
 * 从网站获取favicon URL
 * @param {string} url - 网站URL
 * @returns {Promise<string|null>} - 返回favicon URL或null
 */
async function getFaviconUrl(url) {
  try {
    // 确保URL格式正确
    if (!url.startsWith('http')) {
      url = 'https://' + url;
    }
    
    // 尝试获取网页内容
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 5000 // 5秒超时
    });
    
    // 使用cheerio解析HTML
    const $ = cheerio.load(response.data);
    
    // 查找favicon的优先级顺序
    // 1. 查找apple-touch-icon
    let faviconUrl = $('link[rel="apple-touch-icon"]').attr('href');
    
    // 2. 查找标准favicon链接
    if (!faviconUrl) {
      faviconUrl = $('link[rel="icon"]').attr('href');
    }
    
    // 3. 查找shortcut icon
    if (!faviconUrl) {
      faviconUrl = $('link[rel="shortcut icon"]').attr('href');
    }
    
    // 4. 如果以上都没找到，使用默认的/favicon.ico路径
    if (!faviconUrl) {
      const urlObj = new URL(url);
      faviconUrl = `${urlObj.protocol}//${urlObj.hostname}/favicon.ico`;
    }
    
    console.info(`获取到的favicon URL: ${faviconUrl}`);

    // 处理相对URL
    if (faviconUrl && !faviconUrl.startsWith('http')) {
      const urlObj = new URL(url);
      if (faviconUrl.startsWith('//')) {
        faviconUrl = `https:${faviconUrl}`;
      } else if (faviconUrl.startsWith('/')) {
        faviconUrl = `${urlObj.protocol}//${urlObj.hostname}${faviconUrl}`;
      } else {
        faviconUrl = `${urlObj.protocol}//${urlObj.hostname}/${faviconUrl}`;
      }
    }

    console.info(`处理后的favicon URL: ${faviconUrl}`);
    
    return faviconUrl;
  } catch (error) {
    console.error('获取favicon失败:', error.message);
    
    // 如果出错，尝试返回默认的favicon.ico路径
    try {
      const urlObj = new URL(url);
      return `${urlObj.protocol}//${urlObj.hostname}/favicon.ico`;
    } catch (e) {
      return null;
    }
  }
}

module.exports = { getFaviconUrl };