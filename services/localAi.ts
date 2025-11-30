
// This is your Custom AI Brain (The Internet Troll Edition)
// 1. Troll Logic (Procedural Generation)
// 2. Real Knowledge (Wikipedia API)
// 3. Real Market Data (Binance API)
// 4. Dynamic Content (External Jokes/Insult APIs)

interface ResponseDatabase {
  [lang: string]: {
    keywords: { [key: string]: string[] };
    defaults: string[]; // Keep valid strings here
    chaos: string[];
    greetings: string[]; // Initial greetings
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
    defaults: [
      'พูดจาภาษาคน หรือบ่นภาษาควาย',
      'พิมพ์อะไรมา อ่านแล้วปวดตับ',
      'ถามวัวตอบม้า ถามป้าตอบลุง'
    ],
    greetings: [
      'มาอีกละ... งานการไม่มีทำเหรอ?',
      'ไงมนุษย์ หวังว่าจะไม่ถามอะไรโง่ๆ นะ',
      'กำลังจะนอนพอดี... มีไรว่ามา',
      'เตรียมคำด่าไว้ให้แล้ว เข้ามาเลย',
      'วันนี้พอร์ตแดงล่ะสิ ถึงมาคุยกับบอท'
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
      'Blah blah blah, yak yak yak.',
      'I am smart, you are dense.',
      'Error 404: Brain not found.'
    ],
    greetings: [
      'Oh look, it\'s you again.',
      'I was sleeping. This better be good.',
      'Ready to lose some brain cells?',
      'Wallet empty? Don\'t cry to me.',
      'Make it quick, I have better things to do.'
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
      '这是什么鸟语 听得我好无语',
      '此人多半有病 而且病得不轻'
    ],
    greetings: [
      '又是你？没别的事做了吗？',
      '有话快说，有屁快放',
      '准备好被怼了吗？',
      '今天亏了多少？说出来让我开心下'
    ]
  }
};

const detectLanguage = (text: string, preferredLang: string): string => {
  // Score based approach for robustness
  let thScore = (text.match(/[\u0E00-\u0E7F]/g) || []).length;
  let cnScore = (text.match(/[\u4E00-\u9FFF]/g) || []).length;
  let enScore = (text.match(/[a-zA-Z]/g) || []).length;

  // Threshold: even a few chars is enough to switch context
  if (thScore > 0) return 'th-TH';
  if (cnScore > 0) return 'zh-CN';
  
  // Only default to EN if EN characters dominate or strictly no other scripts
  if (enScore > 0) return 'en-US';

  // Fallback to user preference if ambiguous (numbers, emojis)
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

// --- DYNAMIC INTERNET TROLLING ---

async function fetchExternalTroll(lang: string): Promise<string | null> {
  // Only EN allows good free joke APIs.
  // For TH/CN, we use the procedural mixer below.
  if (lang !== 'en-US') return null;

  try {
    const sources = [
      // 1. Useless Facts (framed as "Did you know you are useless? Also...")
      async () => {
         const res = await fetch('https://uselessfacts.jsph.pl/random.json?language=en');
         const data = await res.json();
         return `Did you know? ${data.text}\n(Now you know, but you're still useless.)`;
      },
      // 2. Bad Advice
      async () => {
         const res = await fetch('https://api.adviceslip.com/advice');
         const data = await res.json();
         return `Troll Advice: ${data.slip.advice}\n(Don't blame me if you get arrested.)`;
      }
    ];

    const randomSource = sources[Math.floor(Math.random() * sources.length)];
    return await randomSource();

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
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

  const cleanText = text.toLowerCase().trim();
  const langKey = detectLanguage(text, userPreferredLang);
  const db = aiDatabase[langKey];

  // 1. Check for MATH (Simple calculation)
  if (/^[0-9\s\.\+\-\*\/]+$/.test(cleanText)) {
      try {
          // eslint-disable-next-line no-new-func
          const result = new Function('return ' + cleanText)();
          if (langKey === 'th-TH') return `คำตอบคือ ${result}\n(ง่ายขนาดนี้ยังต้องถาม?)`;
          return `The answer is ${result}.\n(Use a calculator next time, lazy human.)`;
      } catch (e) { /* ignore */ }
  }

  // 2. Check for CRYPTO PRICE (Binance)
  const cryptoMatch = cleanText.match(/(?:price|ราคา|rate)\s+([a-z]{3,5})/i) || cleanText.match(/^([a-z]{3,5})$/i);
  if (cryptoMatch) {
      const symbol = cryptoMatch[1];
      const price = await fetchBinancePrice(symbol);
      if (price) {
          if (langKey === 'th-TH') return `ราคา ${symbol.toUpperCase()} ตอนนี้อยู่ที่ $${price}\n(จะขึ้นหรือลง มึงก็ดอยอยู่ดี)`;
          return `${symbol.toUpperCase()} is at $${price}.\n(You are still poor though.)`;
      }
  }

  // 3. Check for KNOWLEDGE (Wikipedia)
  if (cleanText.length > 4 && (cleanText.includes('คือ') || cleanText.includes('what is') || cleanText.includes('who is'))) {
      const query = cleanText.replace(/what is|who is|คืออะไร|คือ/g, '').trim();
      const wiki = await fetchWikipediaSummary(query, langKey);
      if (wiki) {
          if (langKey === 'th-TH') return `ไปสืบมาให้ละ: "${wiki}"\n(จำใส่สมองอันน้อยนิดไว้นะ)`;
          return `According to my infinite wisdom: "${wiki}"\n(Try to remember it, human.)`;
      }
  }

  // 4. Keyword Matching
  for (const [keyword, responses] of Object.entries(db.keywords)) {
    if (cleanText.includes(keyword)) {
      return responses[Math.floor(Math.random() * responses.length)];
    }
  }

  // 5. DYNAMIC / PROCEDURAL FALLBACK
  // Instead of static defaults, try to fetch fresh content or generate it
  
  if (langKey === 'en-US') {
      // Try external API for variety
      const externalTroll = await fetchExternalTroll('en-US');
      if (externalTroll) return externalTroll;
  }
  
  if (langKey === 'th-TH') {
      // Use the Mixer to generate a new insult
      return generateThaiInsult();
  }

  // Final Fallback (Static)
  if (Math.random() < 0.30) {
     return db.chaos[Math.floor(Math.random() * db.chaos.length)];
  }

  return db.defaults[Math.floor(Math.random() * db.defaults.length)];
};
