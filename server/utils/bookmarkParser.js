/**
 * bookmarkParser.js - Chrome/Edge书签HTML解析工具
 * 
 * 这个工具用于解析从Chrome/Edge浏览器导出的书签HTML文件
 */

const cheerio = require('cheerio');

/**
 * 解析Chrome/Edge书签HTML文件
 * @param {string} htmlContent - 书签HTML文件内容
 * @returns {Object} - 返回解析后的书签和文件夹数据
 */
function parseBookmarksHtml(htmlContent) {
  try {
    const $ = cheerio.load(htmlContent);
    const collections = [];
    const bookmarks = [];
    
    // 默认收藏夹ID为1
    const defaultCollectionId = 1;
    
    // 收藏夹ID映射 (用于将HTML中的文件夹结构映射到数据库ID)
    const folderMap = new Map();
    
    // 处理书签文件夹
    $('DL > DT > H3').each((index, element) => {
      const folderName = $(element).text().trim();
      
      // 跳过特殊文件夹
      if (folderName === 'Bookmarks bar' || folderName === '书签栏' || 
          folderName === 'Other bookmarks' || folderName === '其他书签') {
        return;
      }
      
      // 创建新收藏夹
      const newCollection = {
        name: folderName,
        icon: '📁',
        color: getRandomColor(),
        // 这里只是临时ID，实际导入时会被替换
        tempId: `folder_${index}`
      };
      
      collections.push(newCollection);
      folderMap.set(newCollection.tempId, newCollection);
    });
    
    // 处理书签
    $('DL > DT > A').each((index, element) => {
      const url = $(element).attr('href');
      const title = $(element).text().trim() || url;
      const addDate = $(element).attr('add_date');
      const favicon = $(element).attr('icon') || null;
      
      // 创建新书签
      const newBookmark = {
        title: title,
        url: url,
        description: '',
        collection_id: defaultCollectionId, // 默认放入默认收藏夹
        favicon: favicon,
        tags: null,
        is_pinned: false
      };
      
      bookmarks.push(newBookmark);
    });
    
    // 处理文件夹内的书签
    $('DL > DT').each((folderIndex, folderElement) => {
      const folderTitle = $(folderElement).children('H3').first().text().trim();
      
      // 跳过特殊文件夹
      if (folderTitle === 'Bookmarks bar' || folderTitle === '书签栏' || 
          folderTitle === 'Other bookmarks' || folderTitle === '其他书签') {
        return;
      }
      
      const folderId = `folder_${folderIndex}`;
      const collection = collections.find(c => c.tempId === folderId);
      
      if (collection) {
        // 处理该文件夹下的书签
        $(folderElement).children('DL').children('DT').children('A').each((index, element) => {
          const url = $(element).attr('href');
          const title = $(element).text().trim() || url;
          const favicon = $(element).attr('icon') || null;
          
          // 创建新书签并关联到当前文件夹
          const newBookmark = {
            title: title,
            url: url,
            description: '',
            collection_id: folderId, // 临时ID，实际导入时会被替换
            favicon: favicon,
            tags: null,
            is_pinned: false
          };
          
          bookmarks.push(newBookmark);
        });
      }
    });
    
    return {
      collections,
      bookmarks,
      folderMap
    };
  } catch (error) {
    console.error('解析书签HTML失败:', error);
    throw new Error('书签HTML格式不正确');
  }
}

/**
 * 生成随机颜色
 * @returns {string} - 返回十六进制颜色代码
 */
function getRandomColor() {
  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
    '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6', 
    '#F97316', '#06B6D4'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

module.exports = {
  parseBookmarksHtml
};