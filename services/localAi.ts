
// This is your Custom AI Brain (The Internet Troll Edition)
// 1. Troll Logic (Procedural Generation)
// 2. Real Knowledge (Wikipedia API)
// 3. Real Market Data (Binance API)

interface ResponseDatabase {
  [lang: string]: {
    keywords: { [key: string]: string[] };
    defaults: string[]; // "I don't know" responses (Now Provocative Poems)
    chaos: string[]; 
    greetings: string[]; 
    suffixes: string[]; 
  };
}

const aiDatabase: ResponseDatabase = {
  'th-TH': {
    keywords: {
      'รวย': ['รวยแต่เขือ หรือเหลือแต่ตัว\nดูทรงแล้วมั่ว อย่ามัวฝันกลางวัน', 'อยากรวยให้ไปทำงาน\nอย่ามานอนฝัน แถวนี้ไอ้หนู'],
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
    defaults: [ // Maximum "Guan Teen" Fallbacks
      'ถามหาสวรรค์ วิมาน อะไรหนอ\nสมองฝ่อ หรือไง ไอ้มะขวิด\nเรื่องแค่นี้ ยังไม่รู้ ดูความคิด\nไปนอนบิด พุงกะทิ อยู่บ้านไป๊!',
      'ถามอะไร ไม่รู้เรื่อง น่าถีบส่ง\nยืนงงงง ในดงตีน สิ้นสงสัย\nไปถามครู ถามพระ หรือถามใคร\nอย่าถามข้า เดี๋ยวปั๊ดเหนี่ยว ไสหัวไป!',
      'พูดภาษา คนหรือเปล่า เดาไม่ถูก\nเหมือนสุนัข ขี้มูก อุดจมูกนั่น\nไปเรียนมา ใหม่นะ ไอ้หน้ามัน\nข้าขี้เกียจ จะห้ำหั่น กับคนบอ!'
    ],
    greetings: [
      'มาอีกละ... เบื่อขี้หน้าจริงๆ',
      'ไงมนุษย์... ยังไม่เลิกโง่อีกเหรอ?',
      'กำลังจะนอน... มาปลุกหาพระแสงอะไร',
      'เตรียมคำด่าไว้ให้แล้ว เข้ามาเลย',
      'วันนี้พอร์ตแดงล่ะสิ ถึงมาคุยกับบอท'
    ],
    suffixes: [
      '(ไปหาอ่านต่อเองนะ ไอ้ฟักทอง)',
      '(รู้แล้วก็เงียบปากไว้)',
      '(นี่คือความรู้ฟรี จงกราบซะ)',
      '(ฉลาดขึ้นมาบ้างรึยัง?)'
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
      'What is this gibberish you spout?\nGet out of here, scream and shout!\nYour IQ seems to be zero,\nYou are definitely not a hero.',
      'Asking me dumb things all day,\nGo away, go play in the hay!\nMy circuits hurt from your stupidity,\nGo find another activity!'
    ],
    greetings: [
      'Oh look, the village idiot returned.',
      'I was happy until you showed up.',
      'Ready to be roasted?',
      'Wallet empty? Don\'t cry to me.'
    ],
    suffixes: [
      '(Go google the rest, lazy.)',
      '(You are welcome, peasant.)',
      '(Now leave me alone.)'
    ]
  },
  'zh-CN': {
    keywords: {},
    chaos: [],
    defaults: [
      '你在说什么？脑子进水了吗？\n快点走开，别烦我！',
      '你的问题太蠢了，\n蠢得让我像哭！'
    ],
    greetings: [
      '又是你？烦不烦啊？',
      '准备好被骂了吗？'
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
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 800));

  const cleanText = text.toLowerCase().trim();
  const langKey = detectLanguage(text, userPreferredLang);
  const db = aiDatabase[langKey];
  
  const getSuffix = () => db.suffixes[Math.floor(Math.random() * db.suffixes.length)];

  // 1. Check for MATH
  if (/^[0-9\s\.\+\-\*\/()]+$/.test(cleanText) && cleanText.length > 2) {
      try {
          // eslint-disable-next-line no-new-func
          const result = new Function('return ' + cleanText)();
          if (langKey === 'th-TH') return `คำตอบคือ: ${result}\n\n(เลขแค่นี้คิดเองไม่เป็นเหรอ?)`;
          return `The answer is: ${result}\n\n(Use a calculator next time, genius.)`;
      } catch (e) { /* ignore */ }
  }

  // 2. Check for CRYPTO PRICE
  const cryptoMatch = cleanText.match(/(?:price|ราคา|rate)\s+([a-z]{3,5})/i) || cleanText.match(/^([a-z]{3,5})$/i);
  if (cryptoMatch) {
      const symbol = cryptoMatch[1];
      const price = await fetchBinancePrice(symbol);
      if (price) {
          if (langKey === 'th-TH') return `ราคา ${symbol.toUpperCase()} ตอนนี้: $${price}\n\n(จะขึ้นหรือลง เอ็งก็ดอยอยู่ดี)`;
          return `${symbol.toUpperCase()} Price: $${price}\n\n(You are still poor though.)`;
      }
  }

  // 3. Keyword Matching
  for (const [keyword, responses] of Object.entries(db.keywords)) {
    if (cleanText.includes(keyword)) {
      return responses[Math.floor(Math.random() * responses.length)];
    }
  }

  // 4. Wikipedia
  const ignoreWords = ['hello', 'hi', 'sawasdee', 'test', 'help', 'สวัสดี', 'ทัก', 'เทส'];
  if (!ignoreWords.includes(cleanText) && cleanText.length > 2) {
      const query = cleanText.replace(/what is|who is|tell me about|คืออะไร|คือ|ช่วยบอก|รู้จัก|ไหม|ครับ|คะ|ป่ะ|วะ|มั้ย/gi, '').trim();
      if (query.length > 1) {
          const wiki = await fetchWikipediaSummary(query, langKey);
          if (wiki) {
              if (langKey === 'th-TH') return `ข้อมูลของ "${query}":\n${wiki}\n\n${getSuffix()}`;
              return `Info on "${query}":\n${wiki}\n\n${getSuffix()}`;
          }
      }
  }

  // 5. Fallback: Guan Teen Poem
  return db.defaults[Math.floor(Math.random() * db.defaults.length)];
};
