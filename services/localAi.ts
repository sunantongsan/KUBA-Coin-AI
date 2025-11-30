
// This is your Custom AI Brain (The Internet Troll Edition)
// 1. Troll Logic (Procedural Generation)
// 2. Real Knowledge (Wikipedia API)
// 3. Real Market Data (Binance API)
// 4. Dynamic Content (External Jokes/Insult APIs)

interface ResponseDatabase {
  [lang: string]: {
    keywords: { [key: string]: string[] };
    defaults: string[]; // "I don't know" responses (Now Poems)
    chaos: string[]; // For very rare random outbursts
    greetings: string[]; // Initial greetings
    suffixes: string[]; // To append to real answers
  };
}

// --- THAI PROCEDURAL GENERATOR (THE MIXER) ---
// Combine parts to create millions of unique insults
const thParts = {
  starts: [
    "บอกตรงๆ นะ", "จะว่าไปแล้ว", "ดูจากทรงแล้ว", "ได้ข่าวว่า", "เห็นหน้าแล้วนึกถึง", 
    "โถๆๆ พ่อคุณ", "อุ๊ต๊ะ!", "ถามจริงๆ เถอะ", "อย่าหาว่าสอนเลยนะ", "สภาพพพ!"
  ],
  middles: [
    "สมองระดับนี้", "พอร์ตแดงๆ แบบนี้", "หน้าตาแบบเอ็ง", "ความมั่นหน้าขนาดนี้", 
    "ฝีมือการเทรดแบบนี้", "คนอย่างเอ็งเนี่ย", "ตรรกะพังๆ แบบนี้", "ดวงซวยๆ แบบนี้"
  ],
  ends: [
    "ไม่น่ารอดถึงพรุ่งนี้", "ไปขายเต้าฮวยเถอะ", "กลับดาวโลกไปซะ", "น่าจะหนักเกินเยียวยา",
    "ระวังดอยถล่มทับนะ", "เอาเวลาไปนอนดีกว่า", "ไปเช็คสมองบ้างนะ", "หมดอนาคตแน่นอน",
    "ควายยังส่ายหน้า", "พับจอแล้วไปบวชซะ"
  ]
};

const generateThaiInsult = (): string => {
  const s = thParts.starts[Math.floor(Math.random() * thParts.starts.length)];
  const m = thParts.middles[Math.floor(Math.random() * thParts.middles.length)];
  const e = thParts.ends[Math.floor(Math.random() * thParts.ends.length)];
  return `${s} ${m} ${e}`;
};

const aiDatabase: ResponseDatabase = {
  'th-TH': {
    keywords: {
      'รวย': ['รวยแต่เขือ หรือเหลือแต่ตัว\nดูทรงแล้วมั่ว อย่ามัวฝันกลางวัน', 'อยากรวยให้ทำงาน\nอยากร้าวรานให้เทรดฟิวเจอร์'],
      'รัก': ['รักไม่ยุ่ง มุ่งแต่ดอย\nคอยจนเปื่อย เหนื่อยก็พัก\nรักตัวเองเถอะ ไอ้ทิด'],
      'kuba': ['KUBA คือความหวัง หรือพลังทำลายล้าง\nดูพอร์ตแล้วอ้างว้าง\nว่างเปล่าเหลือเกิน'],
      'ซื้อ': ['ซื้อตอนเขียว ขายตอนแดง\nสูตรสำเร็จแมงเม่า\nเข้าปุ๊บดอยปั๊บ'],
      'ขาย': ['ขายหมู หรือขายบ้าน\nดูอาการแล้วน่าจะหมดตัว'],
      'ดอย': ['หนาวมั้ยล่ะ ยอดดอย\nคอยไปเถอะ อีกร้อยปี'],
      'ล้างพอร์ต': ['สะอาดเอี่ยมอ่อง สมองโล่ง\nเงินก็โล่งตาม']
    },
    chaos: [
      'น้ำขึ้นให้รีบตัก น้ำหมักให้รีบกิน\nสมองพังภินท์ สิ้นคิดจริงๆ',
      'เดินสะดุดมด สลดใจหาย\nโง่จนควายอาย ตายดีกว่ามั้ง',
      'ฝนตกขี้หมูไหล คนจัญไรมาเจอกัน\nถามคำถามปัญญาอ่อน ทุกวี่ทุกวัน'
    ],
    defaults: [ // Fallback Poems when no logic matches
      'ถามอะไร ไม่รู้เรื่อง เปลืองสมอง\nมายืนมอง จ้องหน้า ทำตาใส\nข้าเป็นบอท ไม่ใช่เทพ เสกอะไร\nกลับบ้านไป นอนเกาพุง ยุงกัดเอย',
      'ถามอะไร ไม่รู้เรื่อง น่าปวดหัว\nอย่ามั่วนิ่ม ยิ้มแห้ง แกล้งสงสัย\nไปถามครู ถามพระ หรือถามใคร\nอย่าถามข้า ข้าไม่รู้ กูจะนอน!',
      'ถามอะไร ไม่รู้เรื่อง เครื่องจะน็อค\nอยากจะบอก ว่างง หลงทิศไหล\nถามภาษา คนหรือเปล่า เดาไม่ไว\nไปไกลไกล รำคาญจัง นั่งงงเลย'
    ],
    greetings: [
      'มาอีกละ... งานการไม่มีทำเหรอ?',
      'ไงมนุษย์ หวังว่าจะไม่ถามอะไรโง่ๆ นะ',
      'กำลังจะนอนพอดี... มีไรว่ามา',
      'เตรียมคำด่าไว้ให้แล้ว เข้ามาเลย',
      'วันนี้พอร์ตแดงล่ะสิ ถึงมาคุยกับบอท'
    ],
    suffixes: [
      '(ไปหาอ่านต่อเองนะ ขี้เกียจเล่า)',
      '(รู้แล้วก็เหยียบไว้นะ)',
      '(นี่คือความรู้ฟรี จงสำนึกบุญคุณซะ)',
      '(ฉลาดขึ้นมานิดนึงรึยัง?)'
    ]
  },
  'en-US': {
    keywords: {
      'rich': ['Rich in dreams, poor in reality.\nYour wallet is a tragedy.', 'Lambo? No, you get a bicycle.\nKeep dreaming, icicle.'],
      'love': ['Love is blind, just like your trading strategy.\nA complete catastrophe.'],
      'kuba': ['KUBA to the moon? \nMaybe to the spoon.\nEmpty spoon, that is.'],
      'buy': ['Buy high, sell low.\nThis is the way of the bro.'],
      'sell': ['Paper hands detected.\nRespect rejected.'],
      'moon': ['The only moon you will see\nis the one in your fantasy.']
    },
    chaos: [
      'Mary had a little lamb,\nIt got scammed on Instagram.',
      'Twinkle twinkle little star,\nI stole the tires off your car.',
      'Roses are red, violets are blue,\nGarbage smells better than you.'
    ],
    defaults: [
      'I don\'t know what you are saying!\nMy circuits are decaying.\nYour question makes no sense,\nIt makes me very tense.',
      'I don\'t know what you are saying!\nStop playing, stop praying.\nI am not a genie in a lamp,\nYou sound like a confused tramp.',
      'I don\'t know what you are saying!\nIs this a game you are playing?\nGo ask Google, go away,\nI have nothing else to say.'
    ],
    greetings: [
      'Oh look, it\'s you again.',
      'I was sleeping. This better be good.',
      'Ready to lose some brain cells?',
      'Wallet empty? Don\'t cry to me.',
      'Make it quick, I have better things to do.'
    ],
    suffixes: [
      '(Go google the rest, I am tired.)',
      '(You are welcome, peasant.)',
      '(Now leave me alone.)',
      '(Try to remember this, if you have a brain.)'
    ]
  },
  'zh-CN': {
    keywords: {
      '赚钱': ['想赚钱？别做梦\n你的脑子有漏洞', '天天想着一夜暴富\n最后只能去当当铺'],
      'kuba': ['Kuba币，空气币\n买了就是个弟弟'],
      '买': ['高位接盘侠\n全家笑哈哈'],
      '卖': ['割肉离场\n回家种粮'],
      '月球': ['梦里什么都有\n醒来一无所有']
    },
    chaos: [
      '床前明月光 韭菜心慌慌\n举头望大盘 低头吃便当',
      '春眠不觉晓 钱包变很少'
    ],
    defaults: [
      '你在说什么？听不懂！\n你的问题像发疯\n快去百度查一查\n别在这里装大葱',
      '你在说什么？听不懂！\n脑袋空空像个桶\n不要问我为什么\n因为我也很头痛'
    ],
    greetings: [
      '又是你？没别的事做了吗？',
      '有话快说，有屁快放',
      '准备好被怼了吗？',
      '今天亏了多少？说出来让我开心下'
    ],
    suffixes: [
      '(剩下的自己去百度吧)',
      '(跪下谢恩吧)',
      '(记住了吗？凡人)'
    ]
  }
};

const detectLanguage = (text: string, preferredLang: string): string => {
  let thScore = (text.match(/[\u0E00-\u0E7F]/g) || []).length;
  let cnScore = (text.match(/[\u4E00-\u9FFF]/g) || []).length;
  let enScore = (text.match(/[a-zA-Z]/g) || []).length;

  if (thScore > 0) return 'th-TH';
  if (cnScore > 0) return 'zh-CN';
  if (enScore > 0) return 'en-US';
  return preferredLang;
};

// --- REAL-TIME CAPABILITIES ---

async function fetchBinancePrice(symbol: string): Promise<string | null> {
  try {
    const pair = symbol.toUpperCase() + "USDT";
    const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${pair}`);
    if (!res.ok) return null;
    const data = await res.json();
    const price = parseFloat(data.price).toLocaleString();
    return price;
  } catch (e) {
    return null;
  }
}

async function fetchWikipediaSummary(query: string, lang: string): Promise<string | null> {
  try {
    const wikiLang = lang.split('-')[0]; // th, en, zh
    const url = `https://api.wikimedia.org/core/v1/wikipedia/${wikiLang}/search/page?q=${encodeURIComponent(query)}&limit=1`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.pages && data.pages.length > 0) {
      return data.pages[0].description || data.pages[0].excerpt || null;
    }
    return null;
  } catch (e) {
    return null;
  }
}

// --- MAIN AI ENGINE ---

export const getGreeting = (lang: string): string => {
  const db = aiDatabase[lang] || aiDatabase['en-US'];
  const greetings = db.greetings || db.defaults;
  return greetings[Math.floor(Math.random() * greetings.length)];
};

export const generateLocalResponse = async (text: string, userPreferredLang: string): Promise<string> => {
  // Simulate Thinking
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 800));

  const cleanText = text.toLowerCase().trim();
  const langKey = detectLanguage(text, userPreferredLang);
  const db = aiDatabase[langKey];
  
  // Helper to get random suffix
  const getSuffix = () => db.suffixes[Math.floor(Math.random() * db.suffixes.length)];

  // 1. Check for MATH (Simple calculation)
  // Strict regex to avoid matching random numbers
  if (/^[0-9\s\.\+\-\*\/()]+$/.test(cleanText) && cleanText.length > 2) {
      try {
          // eslint-disable-next-line no-new-func
          const result = new Function('return ' + cleanText)();
          if (langKey === 'th-TH') return `คำตอบคือ: ${result}\n\n(เลขแค่นี้คิดเองไม่เป็นเหรอ?)`;
          return `The answer is: ${result}\n\n(Use a calculator next time, genius.)`;
      } catch (e) { /* ignore */ }
  }

  // 2. Check for CRYPTO PRICE (Binance)
  const cryptoMatch = cleanText.match(/(?:price|ราคา|rate)\s+([a-z]{3,5})/i) || cleanText.match(/^([a-z]{3,5})$/i);
  if (cryptoMatch) {
      const symbol = cryptoMatch[1];
      const price = await fetchBinancePrice(symbol);
      if (price) {
          if (langKey === 'th-TH') return `ราคา ${symbol.toUpperCase()} ตอนนี้: $${price}\n\n(จะขึ้นหรือลง เอ็งก็ดอยอยู่ดี)`;
          return `${symbol.toUpperCase()} Price: $${price}\n\n(You are still poor though.)`;
      }
  }

  // 3. Keyword Matching (Prioritize hardcoded jokes)
  for (const [keyword, responses] of Object.entries(db.keywords)) {
    if (cleanText.includes(keyword)) {
      return responses[Math.floor(Math.random() * responses.length)];
    }
  }

  // 4. Check for KNOWLEDGE (Wikipedia) - Enhanced
  // Try to search if the text looks like a question or a noun phrase (len > 2)
  // Exclude common chat words to avoid searching "hello"
  const ignoreWords = ['hello', 'hi', 'sawasdee', 'test', 'help', 'สวัสดี', 'ทัก', 'เทส'];
  if (!ignoreWords.includes(cleanText) && cleanText.length > 2) {
      // Remove question words to get the subject
      const query = cleanText.replace(/what is|who is|tell me about|คืออะไร|คือ|ช่วยบอก|รู้จัก|ไหม|ครับ|คะ|ป่ะ|วะ|มั้ย/gi, '').trim();
      
      if (query.length > 1) {
          const wiki = await fetchWikipediaSummary(query, langKey);
          if (wiki) {
              if (langKey === 'th-TH') return `ข้อมูลของ "${query}":\n${wiki}\n\n${getSuffix()}`;
              return `Info on "${query}":\n${wiki}\n\n${getSuffix()}`;
          }
      }
  }

  // 5. Fallback: "I don't know" -> COMPLAINT POEM
  // Return a specific ranting poem from defaults
  return db.defaults[Math.floor(Math.random() * db.defaults.length)];
};