export const CODE_THEMES = {
  monokai:   { name: 'Monokai',         bg: '#272822', chrome: '#1e1f1c', text: '#f8f8f2', keyword: '#f92672', string: '#e6db74', comment: '#75715e', number: '#ae81ff', func: '#a6e22e', operator: '#f92672', type: '#66d9ef', tag: '#f92672', attr: '#a6e22e' },
  dracula:   { name: 'Dracula',          bg: '#282a36', chrome: '#21222c', text: '#f8f8f2', keyword: '#ff79c6', string: '#f1fa8c', comment: '#6272a4', number: '#bd93f9', func: '#50fa7b', operator: '#ff79c6', type: '#8be9fd', tag: '#ff79c6', attr: '#50fa7b' },
  onedark:   { name: 'One Dark',         bg: '#282c34', chrome: '#21252b', text: '#abb2bf', keyword: '#c678dd', string: '#98c379', comment: '#5c6370', number: '#d19a66', func: '#61afef', operator: '#56b6c2', type: '#e5c07b', tag: '#e06c75', attr: '#d19a66' },
  github:    { name: 'GitHub Light',     bg: '#ffffff', chrome: '#f6f8fa', text: '#24292e', keyword: '#d73a49', string: '#032f62', comment: '#6a737d', number: '#005cc5', func: '#6f42c1', operator: '#d73a49', type: '#005cc5', tag: '#22863a', attr: '#6f42c1' },
  solarized: { name: 'Solarized Light',  bg: '#fdf6e3', chrome: '#eee8d5', text: '#657b83', keyword: '#859900', string: '#2aa198', comment: '#93a1a1', number: '#d33682', func: '#268bd2', operator: '#859900', type: '#b58900', tag: '#268bd2', attr: '#b58900' },
  nord:      { name: 'Nord',             bg: '#2e3440', chrome: '#272c36', text: '#d8dee9', keyword: '#81a1c1', string: '#a3be8c', comment: '#616e88', number: '#b48ead', func: '#88c0d0', operator: '#81a1c1', type: '#8fbcbb', tag: '#81a1c1', attr: '#8fbcbb' },
  vitesse:   { name: 'Vitesse Dark',     bg: '#121212', chrome: '#0a0a0a', text: '#dbd7ca', keyword: '#4d9375', string: '#c98a7d', comment: '#758575', number: '#4c9a91', func: '#80a665', operator: '#cb7676', type: '#5da5e1', tag: '#4d9375', attr: '#b8a965' },
}

export const LANG_KEYWORDS = {
  javascript: /\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|this|class|extends|import|export|default|from|async|await|try|catch|finally|throw|typeof|instanceof|in|of|null|undefined|true|false|yield|delete|void)\b/g,
  typescript: /\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|this|class|extends|import|export|default|from|async|await|try|catch|finally|throw|typeof|instanceof|in|of|null|undefined|true|false|yield|delete|void|interface|type|enum|implements|abstract|private|protected|public|static|readonly|as|is|keyof|infer|never|unknown|any)\b/g,
  python: /\b(def|class|return|if|elif|else|for|while|break|continue|import|from|as|try|except|finally|raise|with|yield|lambda|pass|and|or|not|in|is|None|True|False|self|async|await|global|nonlocal|del|assert)\b/g,
  java: /\b(public|private|protected|static|final|abstract|class|interface|extends|implements|return|if|else|for|while|do|switch|case|break|continue|new|this|super|try|catch|finally|throw|throws|import|package|void|int|long|double|float|boolean|char|byte|short|String|null|true|false|instanceof|synchronized|volatile|transient)\b/g,
  go: /\b(func|return|if|else|for|range|switch|case|break|continue|go|defer|select|chan|map|struct|interface|type|package|import|var|const|nil|true|false|make|append|len|cap|new|delete|panic|recover)\b/g,
  rust: /\b(fn|let|mut|return|if|else|for|while|loop|match|break|continue|struct|enum|impl|trait|use|mod|pub|self|super|crate|as|in|ref|move|async|await|unsafe|where|type|const|static|true|false|None|Some|Ok|Err|Box|Vec|String|Option|Result)\b/g,
  sql: /\b(SELECT|FROM|WHERE|AND|OR|JOIN|LEFT|RIGHT|INNER|OUTER|ON|AS|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|ALTER|DROP|GROUP|BY|ORDER|HAVING|LIMIT|UNION|DISTINCT|EXISTS|BETWEEN|LIKE|IN|IS|NULL|NOT|CASE|WHEN|THEN|ELSE|END|COUNT|SUM|AVG|MIN|MAX|WITH|ASC|DESC)\b/gi,
  html: /\b(html|head|body|div|span|class|id|style|src|href|alt|title|type|name|value|placeholder|action|method)\b/g,
  css: /\b(display|position|width|height|margin|padding|border|color|background|font|text|flex|grid|align|justify|overflow|opacity|transition|transform|animation|z-index|none|auto|inherit|initial|important)\b/g,
  json: /("(?:[^"\\]|\\.)*")\s*:/g,
  shell: /\b(if|then|else|elif|fi|for|do|done|while|until|case|esac|function|return|exit|echo|export|source|alias|cd|ls|grep|awk|sed|cat|chmod|chown|mkdir|rm|cp|mv|sudo|apt|yum|brew|npm|pip|git)\b/g,
  csharp: /\b(using|namespace|class|public|private|protected|static|void|int|string|bool|var|new|return|if|else|for|foreach|while|switch|case|break|try|catch|finally|throw|async|await|null|true|false|this|base|override|virtual|abstract|interface|enum|struct|readonly|const|delegate|event|get|set|value|yield)\b/g,
  cpp: /\b(include|define|int|void|char|float|double|bool|long|short|unsigned|signed|const|static|class|struct|enum|union|public|private|protected|virtual|override|return|if|else|for|while|do|switch|case|break|continue|new|delete|this|nullptr|true|false|template|typename|namespace|using|auto|sizeof|typedef|inline|extern|throw|try|catch)\b/g,
  php: /\b(function|class|public|private|protected|static|return|if|else|elseif|for|foreach|while|switch|case|break|continue|new|this|echo|print|require|include|use|namespace|try|catch|finally|throw|null|true|false|array|string|int|float|bool|void|self|parent|extends|implements|abstract|interface|trait|const|var|isset|unset|empty)\b/g,
  ruby: /\b(def|class|module|return|if|elsif|else|unless|for|while|until|do|end|begin|rescue|ensure|raise|yield|block_given|require|include|extend|attr_accessor|attr_reader|attr_writer|self|super|nil|true|false|and|or|not|in|puts|print|lambda|proc)\b/g,
  swift: /\b(func|class|struct|enum|protocol|extension|return|if|else|guard|for|while|repeat|switch|case|break|continue|let|var|import|self|super|nil|true|false|try|catch|throw|throws|async|await|public|private|internal|fileprivate|open|static|override|init|deinit|subscript|typealias|associatedtype|where|in|is|as|Any|Self|some)\b/g,
  kotlin: /\b(fun|class|object|interface|return|if|else|when|for|while|do|break|continue|val|var|import|package|this|super|null|true|false|try|catch|finally|throw|is|as|in|by|constructor|init|companion|data|sealed|enum|abstract|open|override|private|protected|public|internal|suspend|inline|crossinline|noinline|reified|typealias|lateinit|lazy)\b/g,
}

export const CODE_LANGS = [
  { id: 'javascript', name: 'JavaScript' },
  { id: 'typescript', name: 'TypeScript' },
  { id: 'python', name: 'Python' },
  { id: 'java', name: 'Java' },
  { id: 'go', name: 'Go' },
  { id: 'rust', name: 'Rust' },
  { id: 'sql', name: 'SQL' },
  { id: 'html', name: 'HTML' },
  { id: 'css', name: 'CSS' },
  { id: 'json', name: 'JSON' },
  { id: 'shell', name: 'Shell' },
  { id: 'csharp', name: 'C#' },
  { id: 'cpp', name: 'C/C++' },
  { id: 'php', name: 'PHP' },
  { id: 'ruby', name: 'Ruby' },
  { id: 'swift', name: 'Swift' },
  { id: 'kotlin', name: 'Kotlin' },
]

export function tokenizeLine(line, lang, theme) {
  const tokens = []

  if (!line) { tokens.push({ text: ' ', color: theme.text }); return tokens }

  const patterns = []

  // Comments
  if (['javascript','typescript','java','go','rust','css','csharp','cpp','php','swift','kotlin'].includes(lang)) {
    patterns.push({ re: /\/\/.*$/g, color: theme.comment })
    patterns.push({ re: /\/\*[\s\S]*?\*\//g, color: theme.comment })
  }
  if (['python','ruby','shell'].includes(lang)) patterns.push({ re: /#.*$/g, color: theme.comment })
  if (lang === 'html') patterns.push({ re: /<!--[\s\S]*?-->/g, color: theme.comment })
  if (lang === 'sql') patterns.push({ re: /--.*$/g, color: theme.comment })

  // Strings
  patterns.push({ re: /"(?:[^"\\]|\\.)*"/g, color: theme.string })
  patterns.push({ re: /'(?:[^'\\]|\\.)*'/g, color: theme.string })
  if (['javascript','typescript','python','ruby','shell','kotlin'].includes(lang)) {
    patterns.push({ re: /`(?:[^`\\]|\\.)*`/g, color: theme.string })
  }

  // Numbers
  patterns.push({ re: /\b\d+\.?\d*(?:e[+-]?\d+)?\b/gi, color: theme.number })

  // HTML tags
  if (lang === 'html') {
    patterns.push({ re: /<\/?[a-zA-Z][a-zA-Z0-9]*\b/g, color: theme.tag })
    patterns.push({ re: /\/?>/g, color: theme.tag })
  }

  // Keywords
  const kwPattern = LANG_KEYWORDS[lang]
  if (kwPattern) patterns.push({ re: new RegExp(kwPattern.source, kwPattern.flags), color: theme.keyword })

  // Function calls
  patterns.push({ re: /\b[a-zA-Z_]\w*(?=\s*\()/g, color: theme.func })

  // Find all matches, sort by position
  const allMatches = []
  for (const p of patterns) {
    const re = new RegExp(p.re.source, p.re.flags)
    let m
    while ((m = re.exec(line)) !== null) {
      allMatches.push({ start: m.index, end: m.index + m[0].length, text: m[0], color: p.color })
      if (!m[0]) break
    }
  }
  allMatches.sort((a, b) => a.start - b.start || b.end - a.end)

  // Remove overlapping matches (earlier/longer wins)
  const filtered = []
  let lastEnd = 0
  for (const m of allMatches) {
    if (m.start >= lastEnd) {
      filtered.push(m)
      lastEnd = m.end
    }
  }

  // Build token list with plain text gaps
  let pos = 0
  for (const m of filtered) {
    if (m.start > pos) tokens.push({ text: line.slice(pos, m.start), color: theme.text })
    tokens.push({ text: m.text, color: m.color })
    pos = m.end
  }
  if (pos < line.length) tokens.push({ text: line.slice(pos), color: theme.text })
  if (tokens.length === 0) tokens.push({ text: ' ', color: theme.text })

  return tokens
}
