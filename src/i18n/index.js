import { computed } from 'vue'
import { useLocaleStore } from '../stores/locale'

const messages = {
  zh: {
    // Nav & Layout
    'nav.home': '首页',
    'nav.collections': '收藏夹',
    'nav.settings': '设置',
    'nav.categories': '分类',
    'nav.logout': '退出登录',

    // Home
    'home.title': '我的书签',
    'home.subtitle': '浏览您精心整理的书签收藏。在这里搜索、组织和管理所有书签。',
    'home.addBookmark': '添加书签',
    'home.browseAll': '查看全部',
    'home.bookmarks': '书签',
    'home.collections': '收藏夹',
    'home.viewAll': '查看全部',
    'home.recent': '最近添加',
    'home.noBookmarks': '还没有书签',
    'home.noBookmarksDesc': '从添加第一个书签开始',
    'home.uncategorized': '未分类',

    // Collections
    'col.addBookmark': '添加书签',
    'col.bookmarkCount': '{n} 个书签',
    'col.searchPlaceholder': '搜索书签...',
    'col.tags': '标签',
    'col.clear': '清除',
    'col.noBookmarks': '暂无书签',
    'col.noBookmarksDesc': '为该收藏夹添加第一个书签',
    'col.noCollections': '暂无收藏夹',
    'col.createCollection': '创建收藏夹',
    'col.of': '共',
    'col.perPage': '/页',

    // Sort
    'sort.newest': '最新添加',
    'sort.oldest': '最早添加',
    'sort.titleAZ': '标题 A-Z',
    'sort.titleZA': '标题 Z-A',
    'sort.urlAZ': '网址 A-Z',
    'sort.urlZA': '网址 Z-A',

    // Bookmark Form
    'bf.newBookmark': '新建书签',
    'bf.editBookmark': '编辑书签',
    'bf.url': '网址',
    'bf.title': '标题',
    'bf.description': '描述',
    'bf.optional': '可选',
    'bf.favicon': '图标',
    'bf.collection': '收藏夹',
    'bf.tags': '标签',
    'bf.tagsHint': '逗号分隔',
    'bf.cancel': '取消',
    'bf.saving': '保存中...',
    'bf.update': '更新',
    'bf.add': '添加',
    'bf.titlePlaceholder': '网站标题',
    'bf.descPlaceholder': '简短描述...',
    'bf.tagsPlaceholder': '工作, 学习, 设计...',
    'bf.loadMore': '加载更多',
    'bf.fetching': '正在获取...',

    // Search
    'search.placeholder': '搜索书签...',
    'search.noResults': '没有找到匹配的书签',
    'search.hint': '输入关键词搜索标题、网址或描述',

    // Duplicate & Share
    'bf.duplicateWarning': '该网址已存在于书签中',
    'bf.duplicateIn': '所在收藏夹：{name}',
    'toast.linkCopied': '书签已复制到剪贴板',
    'toast.copyFailed': '复制失败',

    // Collection Form
    'cf.newCollection': '新建收藏夹',
    'cf.editCollection': '编辑收藏夹',
    'cf.name': '名称',
    'cf.parent': '父收藏夹',
    'cf.parentNone': '无（根级）',
    'cf.icon': '图标',
    'cf.color': '颜色',
    'cf.preview': '预览',
    'cf.previewName': '收藏夹名称',
    'cf.links': '个书签',
    'cf.cancel': '取消',
    'cf.saving': '保存中...',
    'cf.update': '更新',
    'cf.create': '创建',

    // Modals
    'modal.confirmDelete': '确认删除',
    'modal.deleteBookmark': '确定要删除「{name}」吗？此操作无法撤销。',
    'modal.deleteCollection': '确定要删除收藏夹「{name}」吗？',
    'modal.deleteCollectionHint': '该收藏夹中的书签将被移动到其他位置。',
    'modal.cancel': '取消',
    'modal.delete': '删除',
    'modal.deleting': '删除中...',

    // Toast
    'toast.bookmarkAdded': '书签已添加',
    'toast.bookmarkUpdated': '书签已更新',
    'toast.bookmarkDeleted': '书签已删除',
    'toast.collectionCreated': '收藏夹已创建',
    'toast.collectionUpdated': '收藏夹已更新',
    'toast.collectionDeleted': '收藏夹已删除',
    'toast.addFailed': '添加失败',
    'toast.updateFailed': '更新失败',
    'toast.deleteFailed': '删除失败',
    'toast.createFailed': '创建失败',

    // Settings
    'settings.title': '设置',
    'settings.account': '账户',
    'settings.name': '昵称',
    'settings.email': '邮箱',
    'settings.data': '数据',
    'settings.about': '关于',
    'settings.aboutDesc': '一个简洁的书签管理工具，帮助您整理和管理网络书签。',

    // Import/Export
    'ie.export': '导出',
    'ie.exportDesc': '将所有书签和收藏夹导出为 JSON 文件。',
    'ie.exportJSON': '导出 JSON',
    'ie.import': '导入',
    'ie.chooseJSON': '选择 JSON 文件',
    'ie.chooseHTML': '选择 HTML 文件',
    'ie.selected': '已选择',
    'ie.importing': '导入中...',
    'ie.importBtn': '导入',
    'ie.browserGuide': '如何从浏览器导出书签：',
    'ie.exportSuccess': '导出成功！',
    'ie.importSuccess': '导入成功！',

    // Login
    'login.signIn': '登录',
    'login.signUp': '注册',
    'login.email': '邮箱',
    'login.password': '密码',
    'login.name': '昵称',
    'login.forgotPassword': '忘记密码？',
    'login.signingIn': '登录中...',
    'login.creatingAccount': '注册中...',
    'login.minChars': '至少 6 位',
    'login.subtitle': '您的书签管理工具',
    'login.resend': '重新发送',

    // All Bookmarks
    'all.title': '全部书签',
    'all.subtitle': '浏览所有收藏夹中的书签',

    // Collections Management
    'col.manageTitle': '收藏夹管理',
    'col.manageSubtitle': '管理您的收藏夹，点击进入查看详情',
    'col.editCollection': '编辑',
    'col.deleteCollection': '删除',

    // Pinned
    'pinned': '已置顶',
    'home.pinned': '置顶书签',
    'home.pinnedDesc': '快速访问您置顶的重要书签',
  },
  en: {
    'nav.home': 'Home',
    'nav.collections': 'Collections',
    'nav.settings': 'Settings',
    'nav.categories': 'Categories',
    'nav.logout': 'Sign out',

    'home.title': 'My Bookmarks',
    'home.subtitle': 'Explore your curated bookmarks. Organize, search, and manage all your bookmarks in one place.',
    'home.addBookmark': 'Add Bookmark',
    'home.browseAll': 'Browse All',
    'home.bookmarks': 'Bookmarks',
    'home.collections': 'Collections',
    'home.viewAll': 'View all',
    'home.recent': 'Recent',
    'home.noBookmarks': 'No bookmarks yet',
    'home.noBookmarksDesc': 'Start by adding your first bookmark',
    'home.uncategorized': 'Uncategorized',

    'col.addBookmark': 'Add Bookmark',
    'col.bookmarkCount': '{n} bookmarks',
    'col.searchPlaceholder': 'Search bookmarks...',
    'col.tags': 'Tags',
    'col.clear': 'Clear',
    'col.noBookmarks': 'No bookmarks here',
    'col.noBookmarksDesc': 'Add your first bookmark to this collection',
    'col.noCollections': 'No collections yet',
    'col.createCollection': 'Create Collection',
    'col.of': 'of',
    'col.perPage': '/page',

    'sort.newest': 'Newest',
    'sort.oldest': 'Oldest',
    'sort.titleAZ': 'Title A-Z',
    'sort.titleZA': 'Title Z-A',
    'sort.urlAZ': 'URL A-Z',
    'sort.urlZA': 'URL Z-A',

    'bf.newBookmark': 'New Bookmark',
    'bf.editBookmark': 'Edit Bookmark',
    'bf.url': 'URL',
    'bf.title': 'Title',
    'bf.description': 'Description',
    'bf.optional': 'optional',
    'bf.favicon': 'Favicon',
    'bf.collection': 'Collection',
    'bf.tags': 'Tags',
    'bf.tagsHint': 'comma separated',
    'bf.cancel': 'Cancel',
    'bf.saving': 'Saving...',
    'bf.update': 'Update',
    'bf.add': 'Add',
    'bf.titlePlaceholder': 'Website title',
    'bf.descPlaceholder': 'Brief description...',
    'bf.tagsPlaceholder': 'work, study, design...',
    'bf.loadMore': 'Load more',
    'bf.fetching': 'Fetching...',

    'search.placeholder': 'Search bookmarks...',
    'search.noResults': 'No matching bookmarks found',
    'search.hint': 'Search by title, URL, or description',

    'bf.duplicateWarning': 'This URL already exists in your bookmarks',
    'bf.duplicateIn': 'Collection: {name}',
    'toast.linkCopied': 'Link copied to clipboard',
    'toast.copyFailed': 'Copy failed',

    'cf.newCollection': 'New Collection',
    'cf.editCollection': 'Edit Collection',
    'cf.name': 'Name',
    'cf.parent': 'Parent',
    'cf.parentNone': 'None (root)',
    'cf.icon': 'Icon',
    'cf.color': 'Color',
    'cf.preview': 'Preview',
    'cf.previewName': 'Collection name',
    'cf.links': 'bookmarks',
    'cf.cancel': 'Cancel',
    'cf.saving': 'Saving...',
    'cf.update': 'Update',
    'cf.create': 'Create',

    'modal.confirmDelete': 'Confirm Delete',
    'modal.deleteBookmark': 'Delete "{name}"? This cannot be undone.',
    'modal.deleteCollection': 'Delete collection "{name}"?',
    'modal.deleteCollectionHint': 'Bookmarks will be moved elsewhere.',
    'modal.cancel': 'Cancel',
    'modal.delete': 'Delete',
    'modal.deleting': 'Deleting...',

    'toast.bookmarkAdded': 'Bookmark added',
    'toast.bookmarkUpdated': 'Bookmark updated',
    'toast.bookmarkDeleted': 'Bookmark deleted',
    'toast.collectionCreated': 'Collection created',
    'toast.collectionUpdated': 'Collection updated',
    'toast.collectionDeleted': 'Collection deleted',
    'toast.addFailed': 'Failed to add',
    'toast.updateFailed': 'Failed to update',
    'toast.deleteFailed': 'Failed to delete',
    'toast.createFailed': 'Failed to create',

    'settings.title': 'Settings',
    'settings.account': 'Account',
    'settings.name': 'Name',
    'settings.email': 'Email',
    'settings.data': 'Data',
    'settings.about': 'About',
    'settings.aboutDesc': 'A clean and simple bookmark manager to organize and manage your bookmarks.',

    'ie.export': 'Export',
    'ie.exportDesc': 'Download all bookmarks and collections as JSON.',
    'ie.exportJSON': 'Export JSON',
    'ie.import': 'Import',
    'ie.chooseJSON': 'Choose JSON File',
    'ie.chooseHTML': 'Choose HTML File',
    'ie.selected': 'Selected',
    'ie.importing': 'Importing...',
    'ie.importBtn': 'Import',
    'ie.browserGuide': 'How to export from your browser:',
    'ie.exportSuccess': 'Export successful!',
    'ie.importSuccess': 'Import successful!',

    'login.signIn': 'Sign In',
    'login.signUp': 'Sign Up',
    'login.email': 'Email',
    'login.password': 'Password',
    'login.name': 'Name',
    'login.forgotPassword': 'Forgot password?',
    'login.signingIn': 'Signing in...',
    'login.creatingAccount': 'Creating account...',
    'login.minChars': 'Min 6 characters',
    'login.subtitle': 'Your bookmark manager',
    'login.resend': 'Resend',

    'all.title': 'All Bookmarks',
    'all.subtitle': 'Browse bookmarks across all collections',

    'col.manageTitle': 'Collections',
    'col.manageSubtitle': 'Manage your collections, click to view details',
    'col.editCollection': 'Edit',
    'col.deleteCollection': 'Delete',

    'pinned': 'Pinned',
    'home.pinned': 'Pinned',
    'home.pinnedDesc': 'Quick access to your pinned bookmarks',
  }
}

export function useI18n() {
  const localeStore = useLocaleStore()

  const t = computed(() => {
    const lang = localeStore.locale
    const dict = messages[lang] || messages.zh
    return (key, params) => {
      let str = dict[key] || key
      if (params) {
        Object.keys(params).forEach(k => {
          str = str.replace(`{${k}}`, params[k])
        })
      }
      return str
    }
  })

  return { t }
}
