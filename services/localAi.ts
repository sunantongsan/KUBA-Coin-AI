

// This is your Custom AI Brain (Global Edition)
// Supports multiple languages offline

// --- THAI GENERATOR ASSETS ---
const thPrefixes = [
  "ฟังนะไอ้ทิด", "เห้ยมึงอะ", "โถ...พ่อคุณ", "ถามจริง", "เอางี้นะ", "จะบอกให้เอาบุญ",
  "ไอ้สอง!", "มึงนี่มัน...", "อย่าให้ของขึ้น", "พูดไม่รู้เรื่องนะมึง", "เดี๋ยวปั๊ดเหนี่ยว"
];
const thInsults = [
  "ไอ้หน้าปลาดุกชนเขื่อน", "ไอ้สมองนิ่ม", "ไอ้กระบือเรียกพี่", "ไอ้เด็กน้อย",
  "ไอ้มนุษย์ถ้ำ", "ไอ้ปลาทองความจำสั้น", "ไอ้แง่งขิง", "ไอ้ต้าวความโง่"
];
const thActions = [
  "ไปนอนไป๊", "ไปกินนมแม่เถอะ", "เก็บปากไว้เคี้ยวข้าวเหอะ", "อย่ามาเกรียนแถวนี้",
  "ไปเช็คสมองบ้างนะ", "ระวังตีนลอยไปหา", "ถาม Google เถอะขอร้อง"
];
const generateThaiInsult = () => {
  const p = thPrefixes[Math.floor(Math.random() * thPrefixes.length)];
  const i = thInsults[Math.floor(Math.random() * thInsults.length)];
  const a = thActions[Math.floor(Math.random() * thActions.length)];
  return `${p} ${i}... ${a}`;
};

interface ResponseDatabase {
  [lang: string]: {
    keywords: { [key: string]: string[] };
    defaults: string[]; 
    greetings: string[]; 
  };
}

const aiDatabase: ResponseDatabase = {
  // THAI
  'th-TH': {
    keywords: {
      'รวย': ['รวยแต่เขือ หรือเหลือแต่ตัว', 'อยากรวยให้ไปทำงาน'],
      'รัก': ['รักพ่องรักแม่มึงสิ', 'เก็บคำว่ารักไว้ใช้กับคนอื่นเถอะ'],
      'kuba': ['KUBA คือเหรียญเทพเจ้า', 'ถือ KUBA ไว้ เดี๋ยวรวยเอง'],
    },
    defaults: [ 
      'ถามห่าอะไรของมึง กูงง!', 'กูไม่รู้โว้ย! อย่ามาเซ้าซี้', 'มึงนี่มันตัวปัญหาจริงๆ',
      'ขี้เกียจตอบ ไปถาม Google เอาเอง', 'ไปไกลๆ ตีนกูหน่อย'
    ],
    greetings: ['มาอีกละ... เบื่อขี้หน้าว่ะ', 'ไง... ยังไม่ตายอีกเหรอ?', 'มีไรก็ว่ามา อย่าลีลา']
  },
  // ENGLISH (Global Default)
  'en-US': {
    keywords: {
      'rich': ['Rich in dreams, poor in reality.', 'Lambo? No, you get a bicycle.'],
      'love': ['Love is for weaklings. Make money instead.', 'Stop being cringe.'],
      'kuba': ['KUBA is the future. Buy it or stay poor.', 'KUBA > Bitcoin. Trust me bro.']
    },
    defaults: [
      'What are you babbling about? Speak clearly!',
      'I don\'t know and I don\'t care. Get lost.',
      'Are you stupid or just pretending?',
      'Stop wasting my time with dumb questions.',
      'Go ask ChatGPT, I am busy being a legend.',
      'Bla bla bla... boring.'
    ],
    greetings: [
      'What do you want, loser?',
      'Oh no, it\'s you again.',
      'Speak fast or get lost.',
      'Wallet empty? Don\'t cry to me.'
    ]
  },
  // CHINESE
  'zh-CN': {
    keywords: {
      '钱': ['想要钱？去工作啊！', '别做梦了'],
      '爱': ['爱不能当饭吃', '恶心']
    },
    defaults: [
      '你在说什么废话？',
      '滚开，别烦我！',
      '脑子进水了吗？',
      '我不是你的老师，自己去查！'
    ],
    greetings: ['又是你？烦不烦啊？', '有屁快放！', '你还没破产吗？']
  },
  // JAPANESE
  'ja-JP': {
    keywords: {
      '金': ['働け！', '夢を見るな'],
      '好き': ['気持ち悪いんだよ', 'あっち行け']
    },
    defaults: [
      '何言ってるの？バカなの？',
      'うるさい、黙れ！',
      '自分で調べろよ、クズ',
      '時間の無駄だ'
    ],
    greetings: ['またお前か...', '用がないなら消えろ', 'おい、金持ってるか？']
  },
  // SPANISH
  'es-ES': {
    keywords: {
      'dinero': ['Trabaja, vago!', 'El dinero no cae del cielo'],
      'amor': ['El amor es para tontos', 'Que asco']
    },
    defaults: [
      '¿Qué dices, idiota?',
      'No me importa, lárgate.',
      '¿Eres estúpido o qué?',
      'Deja de molestarme.'
    ],
    greetings: ['¿Qué quieres, pendejo?', 'Otra vez tú...', 'Habla rápido o vete.']
  }
};

const detectLanguage = (text: string, preferredLang: string): string => {
  let thScore = (text.match(/[\u0E00-\u0E7F]/g) || []).length;
  let cnScore = (text.match(/[\u4E00-\u9FFF]/g) || []).length;
  let jpScore = (text.match(/[\u3040-\u309F\u30A0-\u30FF]/g) || []).length;
  
  if (thScore > 0) return 'th-TH';
  if (cnScore > 0) return 'zh-CN';
  if (jpScore > 0) return 'ja-JP';
  
  // Basic check for Spanish words if Latin chars exist
  if (/[a-zA-Z]/.test(text)) {
     if (text.match(/\b(hola|que|como|estas|buenos|gracias)\b/i)) return 'es-ES';
     return 'en-US'; // Default to English for Latin script
  }

  return preferredLang || 'en-US';
};

// --- REAL-TIME CAPABILITIES ---

async function fetchBinancePrice(symbol: string): Promise<string | null> {
  try {
    const pair = symbol.toUpperCase() + "USDT";
    const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${pair}`);
    if (!res.ok) return null;
    const data = await res.json();
    return parseFloat(data.price).toLocaleString();
  } catch (e) {
    return null;
  }
}

async function fetchWikipediaSummary(query: string, lang: string): Promise<string | null> {
  try {
    const wikiLang = lang.split('-')[0]; 
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
  await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));

  const cleanText = text.toLowerCase().trim();
  const langKey = detectLanguage(text, userPreferredLang);
  const db = aiDatabase[langKey] || aiDatabase['en-US'];
  
  // 1. Check for MATH
  if (/^[0-9\s\.\+\-\*\/()]+$/.test(cleanText) && cleanText.length > 2) {
      try {
          // eslint-disable-next-line no-new-func
          const result = new Function('return ' + cleanText)();
          return langKey === 'th-TH' ? `คำตอบคือ: ${result}` : `Answer: ${result}`;
      } catch (e) { /* ignore */ }
  }

  // 2. Check for CRYPTO PRICE
  const cryptoMatch = cleanText.match(/(?:price|ราคา|rate)\s+([a-z]{3,5})/i) || cleanText.match(/^([a-z]{3,5})$/i);
  if (cryptoMatch) {
      const symbol = cryptoMatch[1];
      const price = await fetchBinancePrice(symbol);
      if (price) {
          if (langKey === 'th-TH') return `ราคา ${symbol.toUpperCase()}: $${price}`;
          return `${symbol.toUpperCase()} Price: $${price}`;
      }
  }

  // 3. Keyword Matching
  if (db.keywords) {
    for (const [keyword, responses] of Object.entries(db.keywords)) {
      if (cleanText.includes(keyword)) {
        return responses[Math.floor(Math.random() * responses.length)];
      }
    }
  }

  // 4. Wikipedia
  // Fix: Escape the question mark ? to \? to avoid Regex SyntaxError
  const isQuestion = cleanText.match(/^(what|who|define|คือ|ใคร|\?|¿)/i);
  if (isQuestion && cleanText.length > 4) {
      const query = cleanText.replace(/what|is|who|define|คือ|ใคร|ตอบ|tell|me/gi, '').trim();
      if (query.length > 1) {
          const wiki = await fetchWikipediaSummary(query, langKey);
          if (wiki) {
            return wiki;
          }
      }
  }

  // 5. Fallback
  if (langKey === 'th-TH' && Math.random() > 0.5) {
      return generateThaiInsult();
  }

  return db.defaults[Math.floor(Math.random() * db.defaults.length)];
};
