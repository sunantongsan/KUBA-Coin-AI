
// This is your Custom AI Brain (Smart Hybrid Edition)
// 1. Troll Logic (Local DB)
// 2. Real Knowledge (Wikipedia API)
// 3. Real Market Data (Binance API)

interface ResponseDatabase {
  [lang: string]: {
    keywords: { [key: string]: string[] };
    defaults: string[];
    chaos: string[];
  };
}

const aiDatabase: ResponseDatabase = {
  'th-TH': {
    keywords: {
      'รวย': ['รวยแต่เขือ หรือเหลือแต่ตัว\nดูทรงแล้วมั่ว อย่ามัวฝันกลางวัน', 'อยากรวยให้ทำงาน\nอยากร้าวรานให้เทรดฟิวเจอร์'],
      'รัก': ['รักไม่ยุ่ง มุ่งแต่ดอย\nคอยจนเปื่อย เหนื่อยก็พัก\nรักตัวเองเถอะ ไอ้ทิด'],
      'kuba': ['KUBA คือความหวัง หรือพลังทำลายล้าง\nดูพอร์ตแล้วอ้างว้าง\nว่างเปล่าเหลือเกิน']
    },
    chaos: [
      'น้ำขึ้นให้รีบตัก น้ำหมักให้รีบกิน\nสมองพังภินท์ สิ้นคิดจริงๆ',
      'เดินสะดุดมด สลดใจหาย\nโง่จนควายอาย ตายดีกว่ามั้ง',
      'ฝนตกขี้หมูไหล คนจัญไรมาเจอกัน\nถามคำถามปัญญาอ่อน ทุกวี่ทุกวัน'
    ],
    defaults: [
      'พูดจาภาษาคน หรือบ่นภาษาควาย\nฟังแล้วตาลาย คล้ายจะเป็นลม',
      'พิมพ์อะไรมา อ่านแล้วปวดตับ\nกลับไปนอนหลับ ฝันเปียกดีกว่า',
      'ถามวัวตอบม้า ถามป้าตอบลุง\nก็กูไม่แคร์ จะทำไมอ้ะ?'
    ]
  },
  'en-US': {
    keywords: {
      'rich': ['Rich in dreams, poor in reality.\nYour wallet is a tragedy.', 'Lambo? No, you get a bicycle.\nKeep dreaming, icicle.'],
      'love': ['Love is blind, just like your trading strategy.\nA complete catastrophe.'],
      'kuba': ['KUBA to the moon? \nMaybe to the spoon.\nEmpty spoon, that is.']
    },
    chaos: [
      'Mary had a little lamb,\nIt got scammed on Instagram.',
      'Twinkle twinkle little star,\nI stole the tires off your car.',
      'Roses are red, violets are blue,\nGarbage smells better than you.'
    ],
    defaults: [
      'Blah blah blah, yak yak yak,\nYou are under a verbal attack.',
      'I am smart, you are dense.\nThis conversation makes no sense.',
      'Error 404: Brain not found.'
    ]
  },
  'zh-CN': {
    keywords: {
      '赚钱': ['想赚钱？别做梦\n你的脑子有漏洞', '天天想着一夜暴富\n最后只能去当当铺'],
      'kuba': ['Kuba币，空气币\n买了就是个弟弟']
    },
    chaos: [
      '床前明月光 韭菜心慌慌\n举头望大盘 低头吃便当',
      '春眠不觉晓 钱包变很少'
    ],
    defaults: [
      '这是什么鸟语 听得我好无语',
      '此人多半有病 而且病得不轻'
    ]
  }
};

const detectLanguage = (text: string, preferredLang: string): string => {
  if (/[\u0E00-\u0E7F]/.test(text)) return 'th-TH';
  if (/[\u4E00-\u9FFF]/.test(text)) return 'zh-CN';
  if (aiDatabase[preferredLang]) return preferredLang;
  return 'en-US';
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

export const generateLocalResponse = async (text: string, userPreferredLang: string): Promise<string> => {
  // Simulate Thinking
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

  const cleanText = text.toLowerCase().trim();
  const langKey = detectLanguage(text, userPreferredLang);
  const db = aiDatabase[langKey];

  // 1. Check for MATH (Simple calculation)
  // Regex to catch "10+10", "50*2", etc.
  if (/^[0-9\s\.\+\-\*\/]+$/.test(cleanText)) {
      try {
          // eslint-disable-next-line no-new-func
          const result = new Function('return ' + cleanText)();
          if (langKey === 'th-TH') return `คำตอบคือ ${result}\n(ง่ายขนาดนี้ยังต้องถาม?)`;
          return `The answer is ${result}.\n(Use a calculator next time, lazy human.)`;
      } catch (e) { /* ignore */ }
  }

  // 2. Check for CRYPTO PRICE (Binance)
  // Keywords: price, ราคา, btc, eth
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
  // Keywords: what is, who is, คืออะไร
  if (cleanText.length > 4 && (cleanText.includes('คือ') || cleanText.includes('what is') || cleanText.includes('who is'))) {
      const query = cleanText.replace(/what is|who is|คืออะไร|คือ/g, '').trim();
      const wiki = await fetchWikipediaSummary(query, langKey);
      if (wiki) {
          if (langKey === 'th-TH') return `ไปสืบมาให้ละ: "${wiki}"\n(จำใส่สมองอันน้อยนิดไว้นะ)`;
          return `According to my infinite wisdom: "${wiki}"\n(Try to remember it, human.)`;
      }
  }

  // 4. Default Troll Logic (Fallback)
  // CHAOS MODE: 30% chance to answer random nonsense
  if (Math.random() < 0.30) {
     return db.chaos[Math.floor(Math.random() * db.chaos.length)];
  }

  // Keyword Matching
  for (const [keyword, responses] of Object.entries(db.keywords)) {
    if (cleanText.includes(keyword)) {
      return responses[Math.floor(Math.random() * responses.length)];
    }
  }

  // Fallback
  return db.defaults[Math.floor(Math.random() * db.defaults.length)];
};
