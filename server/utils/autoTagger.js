// Rule-based auto-tagging engine for bookmarks
// Analyzes URL domain + title/description keywords to suggest tags

const DOMAIN_TAGS = {
  'github.com':          ['GitHub', 'Dev'],
  'gitlab.com':          ['GitLab', 'Dev'],
  'stackoverflow.com':   ['Dev', 'Q&A'],
  'stackexchange.com':   ['Q&A'],
  'medium.com':          ['Article'],
  'dev.to':              ['Dev', 'Article'],
  'youtube.com':         ['Video'],
  'youtu.be':            ['Video'],
  'bilibili.com':        ['Video'],
  'zhihu.com':           ['Q&A'],
  'juejin.cn':           ['Dev', 'Article'],
  'segmentfault.com':    ['Dev', 'Q&A'],
  'twitter.com':         ['Social'],
  'x.com':               ['Social'],
  'reddit.com':          ['Social', 'Forum'],
  'news.ycombinator.com':['Dev', 'News'],
  'figma.com':           ['Design'],
  'dribbble.com':        ['Design'],
  'behance.net':         ['Design'],
  'arxiv.org':           ['Paper', 'Research'],
  'scholar.google.com':  ['Paper', 'Research'],
  'npmjs.com':           ['Dev', 'npm'],
  'pypi.org':            ['Dev', 'Python'],
  'crates.io':           ['Dev', 'Rust'],
  'docs.google.com':     ['Docs'],
  'notion.so':           ['Docs', 'Notes'],
  'wikipedia.org':       ['Wiki', 'Reference'],
  'mdn.io':              ['Dev', 'Docs'],
  'developer.mozilla.org': ['Dev', 'Docs'],
  'w3schools.com':       ['Dev', 'Tutorial'],
  'leetcode.com':        ['Dev', 'Algorithm'],
  'codepen.io':          ['Dev', 'Frontend'],
  'codesandbox.io':      ['Dev', 'Frontend'],
  'vercel.com':          ['Dev', 'Deploy'],
  'netlify.com':         ['Dev', 'Deploy'],
  'aws.amazon.com':      ['Dev', 'Cloud'],
  'cloud.google.com':    ['Dev', 'Cloud'],
  'azure.microsoft.com': ['Dev', 'Cloud'],
  'producthunt.com':     ['Product', 'Startup'],
  'v2ex.com':            ['Dev', 'Forum'],
  'infoq.cn':            ['Dev', 'Article'],
  'smashingmagazine.com':['Dev', 'Frontend'],
  'css-tricks.com':      ['Dev', 'CSS'],
  'freecodecamp.org':    ['Dev', 'Tutorial'],
};

const KEYWORD_RULES = [
  { pattern: /\breact\b|next\.?js|remix/i,                    tags: ['React'] },
  { pattern: /\bvue\b|nuxt/i,                                 tags: ['Vue'] },
  { pattern: /\bangular\b/i,                                   tags: ['Angular'] },
  { pattern: /\bsvelte\b|sveltekit/i,                          tags: ['Svelte'] },
  { pattern: /\btypescript\b|\bts\b/i,                         tags: ['TypeScript'] },
  { pattern: /\bjavascript\b|\bjs\b|node\.?js|deno|bun\b/i,   tags: ['JavaScript'] },
  { pattern: /\bpython\b|django|flask|fastapi/i,               tags: ['Python'] },
  { pattern: /\bjava\b(?!script)|spring|maven|gradle/i,        tags: ['Java'] },
  { pattern: /\bgo\b(?:lang)?|gin\b|echo\b/i,                  tags: ['Go'] },
  { pattern: /\brust\b|cargo\b|tokio/i,                        tags: ['Rust'] },
  { pattern: /\bswift\b|swiftui|ios\b/i,                       tags: ['Swift', 'iOS'] },
  { pattern: /\bkotlin\b|android\b/i,                          tags: ['Android'] },
  { pattern: /\bcss\b|tailwind|sass|scss|styled/i,             tags: ['CSS'] },
  { pattern: /\bhtml\b|dom\b|web\s?component/i,                tags: ['HTML'] },
  { pattern: /docker|k8s|kubernetes|容器/i,                     tags: ['DevOps'] },
  { pattern: /ci[\s/]cd|github\s?actions|jenkins/i,            tags: ['DevOps'] },
  { pattern: /\bapi\b|rest\b|graphql|grpc/i,                   tags: ['API'] },
  { pattern: /数据库|database|\bsql\b|mongo|redis|postgres/i,   tags: ['Database'] },
  { pattern: /machine\s?learning|深度学习|\bai\b|gpt|llm|大模型/i, tags: ['AI/ML'] },
  { pattern: /tutorial|教程|入门|beginner|getting\s?started/i,  tags: ['Tutorial'] },
  { pattern: /cheat\s?sheet|速查|备忘/i,                        tags: ['Reference'] },
  { pattern: /开源|open\s?source|\bfoss\b/i,                   tags: ['OpenSource'] },
  { pattern: /安全|security|漏洞|vulnerability|\bcve\b/i,       tags: ['Security'] },
  { pattern: /测试|testing|jest|vitest|cypress/i,               tags: ['Testing'] },
  { pattern: /性能|performance|优化|benchmark/i,                tags: ['Performance'] },
  { pattern: /设计模式|design\s?pattern|架构|architecture/i,    tags: ['Architecture'] },
  { pattern: /ui\b|ux\b|用户体验|交互设计/i,                    tags: ['UI/UX'] },
];

const MAX_TAGS = 5;

function autoTag(url, title, description) {
  const tags = new Set();

  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '');

    // Domain matching (exact + suffix)
    for (const [domain, domainTags] of Object.entries(DOMAIN_TAGS)) {
      if (hostname === domain || hostname.endsWith('.' + domain)) {
        domainTags.forEach(t => tags.add(t));
      }
    }
  } catch {
    // invalid URL, skip domain matching
  }

  // Keyword matching against title + description
  const text = `${title || ''} ${description || ''}`;
  for (const rule of KEYWORD_RULES) {
    if (rule.pattern.test(text)) {
      rule.tags.forEach(t => tags.add(t));
    }
  }

  return [...tags].slice(0, MAX_TAGS);
}

module.exports = { autoTag };
