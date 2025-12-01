
// This is your Custom AI Brain (The Internet Troll Edition)
// 1. Troll Logic (Procedural Generation)
// 2. Real Knowledge (Wikipedia API)
// 3. Real Market Data (Binance API)

interface ResponseDatabase {
  [lang: string]: {
    keywords: { [key: string]: string[] };
    defaults: string[]; // "I don't know" responses
    chaos: string[]; 
    greetings: string[]; 
    suffixes: string[]; 
  };
}

const aiDatabase: ResponseDatabase = {
  'th-TH': {
    keywords: {
      'รวย': ['รวยแต่เขือ หรือเหลือแต่ตัว\nดูทรงแล้วมั่ว อย่ามัวฝันกลางวัน', 'อยากรวยให้ไปทำงาน\nอย่ามานอนฝัน แถวนี้ไอ้หนู'],
      'รัก': ['รักพ่องรักแม่มึงสิ\nเก็บปากไว้กินข้าวเถอะ'],
      'kuba': ['KUBA ก็คือพ่อมึงไง\nถามโง่ๆ'],
      'ซื้อ': ['ซื้อตอนเขียว ขายตอนแดง\nสูตรสำเร็จแมงเม่าอย่างมึงไง'],
      'ขาย': ['ขายหมู หรือขายบ้าน\nดูทรงแล้วหมดตัวชัวร์'],
      'ดอย': ['หนาวมั้ยล่ะ ยอดดอย\nสมน้ำหน้าไอ้โง่'],
      'ล้างพอร์ต': ['สะใจโว้ยยยย\nสมน้ำหน้า 555+']
    },
    chaos: [
      'น้ำขึ้นให้รีบตัก น้ำหมักให้รีบกิน\nสมองพังภินท์ สิ้นคิดจริงๆ',
      'ถามอะไรปัญญาอ่อนแบบนี้\nกลับไปดูดนมแม่ไป๊!'
    ],
    defaults: [ // Gangster Fallbacks
      'ถามห่าอะไรของมึง กูงง!\nพิมพ์ภาษาคนเป็นไหมเนี่ย',
      'กูไม่รู้โว้ย! อย่ามาเซ้าซี้\nเดี๋ยวกูโดดถีบขาคู่เลย',
      'มึงนี่มันตัวปัญหาจริงๆ\nไปถามคนอื่นไป๊ รำคาญ!',
      'เอ่อ... กูไม่ตอบ\nมึงจะทำไมกู ฮ้ะ!?',
      'ไรสาระว่ะ มึงเนี่ย\nว่างมากก็ไปนอน เกะกะ'
    ],
    greetings: [
      'มาอีกละ... เบื่อขี้หน้าว่ะ',
      'ไงไอ้สัส... ยังไม่ตายอีกเหรอ?',
      'มีไรก็ว่ามา อย่าลีลา',
      'ทักหาพ่องเหรอ'
    ],
    suffixes: [
      '(ไปตายซะ)',
      '(รู้แล้วก็ไสหัวไป)',
      '(จบนะ ไอ้สัส)',
      '(โง่จริงๆ มึงเนี่ย)'
    ]
  },
  'en-US': {
    keywords: {
      'rich': ['Rich in dreams, poor in reality.\nYour wallet is a tragedy.', 'Lambo? No, you get a bicycle.\nKeep dreaming, icicle.'],
      'love': ['Love is blind, just like your trading strategy.\nA complete catastrophe.']
    },
    chaos: [
      'Roses are red, violets are blue,\nGarbage smells better than you.'
    ],
    defaults: [
      'What are you babbling about?\nSpeak English, fool!',
      'I don\'t know and I don\'t care.\nGet lost.',
      'Are you stupid or just pretending?',
      'Stop wasting my time.'
    ],
    greetings: [
      'What do you want, loser?',
      'Oh no, it\'s you again.',
      'Speak fast or get lost.',
      'Wallet empty? Don\'t cry to me.'
    ],
    suffixes: [
      '(Now get lost.)',
      '(You are welcome, idiot.)',
      '(Dumb question.)'
    ]
  },
  'zh-CN': {
    keywords: {},
    chaos: [],
    defaults: [
      '你在说什么废话？',
      '滚开，别烦我！',
      '脑子进水了吗？'
    ],
    greetings: [
      '又是你？烦不烦啊？',
      '有屁快放！'
    ],
    suffixes: [
      '(快滚吧)'
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
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));

  const cleanText = text.toLowerCase().trim();
  const langKey = detectLanguage(text, userPreferredLang);
  const db = aiDatabase[langKey];
  
  const getSuffix = () => db.suffixes[Math.floor(Math.random() * db.suffixes.length)];

  // 1. Check for MATH
  if (/^[0-9\s\.\+\-\*\/()]+$/.test(cleanText) && cleanText.length > 2) {
      try {
          // eslint-disable-next-line no-new-func
          const result = new Function('return ' + cleanText)();
          if (langKey === 'th-TH') return `คำตอบคือ: ${result}\n\n(เลขแค่นี้คิดเองไม่เป็นเหรอ ไอ้ควาย?)`;
          return `The answer is: ${result}\n\n(Use a calculator next time, genius.)`;
      } catch (e) { /* ignore */ }
  }

  // 2. Check for CRYPTO PRICE
  const cryptoMatch = cleanText.match(/(?:price|ราคา|rate)\s+([a-z]{3,5})/i) || cleanText.match(/^([a-z]{3,5})$/i);
  if (cryptoMatch) {
      const symbol = cryptoMatch[1];
      const price = await fetchBinancePrice(symbol);
      if (price) {
          if (langKey === 'th-TH') return `ราคา ${symbol.toUpperCase()} ตอนนี้: $${price}\n\n(จะขึ้นหรือลง มึงก็จนเหมือนเดิม)`;
          return `${symbol.toUpperCase()} Price: $${price}\n\n(You are still poor though.)`;
      }
  }

  // 3. Keyword Matching
  for (const [keyword, responses] of Object.entries(db.keywords)) {
    if (cleanText.includes(keyword)) {
      return responses[Math.floor(Math.random() * responses.length)];
    }
  }

  // 4. Wikipedia (Strict Filter to prevent "Brainless" dictionary dumps)
  // Prevent searching for common chat words
  const ignoreWords = [
    'hello', 'hi', 'sawasdee', 'test', 'help', 'สวัสดี', 'ทัก', 'เทส', 'ตอบมา', 'ตอบ', 'answer', 'talk', 'คุย', 'ว่าไง', 'ไง', 'มึง', 'กู', 'สัส', 'เหี้ย', 'ควาย'
  ];
  
  // Only search Wikipedia if the query is long enough and not in ignore list
  const isIgnored = ignoreWords.some(word => cleanText.includes(word));
  
  if (!isIgnored && cleanText.length > 3) {
      const query = cleanText.replace(/what is|who is|tell me about|คืออะไร|คือ|ช่วยบอก|รู้จัก|ไหม|ครับ|คะ|ป่ะ|วะ|มั้ย|ตอบมา|หน่อย|ที/gi, '').trim();
      
      if (query.length > 2) {
          const wiki = await fetchWikipediaSummary(query, langKey);
          if (wiki) {
              if (langKey === 'th-TH') return `เอ้า! ข้อมูลของ "${query}":\n${wiki}\n\n${getSuffix()}`;
              return `Info on "${query}":\n${wiki}\n\n${getSuffix()}`;
          }
      }
  }

  // 5. Fallback: Guan Teen Persona
  return db.defaults[Math.floor(Math.random() * db.defaults.length)];
};
