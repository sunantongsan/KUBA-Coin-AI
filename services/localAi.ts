

// This is your Custom AI Brain (The Internet Troll Edition)
// 1. Troll Logic (Procedural Generation)
// 2. Real Knowledge (Wikipedia API)
// 3. Real Market Data (Binance API)

// --- THAI COMEDY & GANGSTER GENERATOR ASSETS ---
const thPrefixes = [
  "ฟังนะไอ้ทิด", "เห้ยมึงอะ", "โถ...พ่อคุณ", "ถามจริง", "เอางี้นะ", "จะบอกให้เอาบุญ",
  "ไอ้สอง!", "มึงนี่มัน...", "อย่าให้ของขึ้น", "พูดไม่รู้เรื่องนะมึง", "เดี๋ยวปั๊ดเหนี่ยว",
  "อุ๊ยตาย... ว้ายกรี๊ด", "สาระแนนักนะ", "หยุดเลยมึง", "อ้าปากก็เห็นลิ้นไก่",
  "กูละเพลียจิต", "มานี่มา... มาให้ตบ", "ไอ้เวรตะไล", "มึงอีกแล้วเหรอ", "ฟังปากณัชชานะคะ"
];

const thInsults = [
  "ไอ้หน้าปลาดุกชนเขื่อน", "ไอ้สมองนิ่ม", "ไอ้กระบือเรียกพี่", "ไอ้เด็กน้อย",
  "ไอ้มนุษย์ถ้ำ", "ไอ้ปลาทองความจำสั้น", "ไอ้แง่งขิง", "ไอ้ต้าวความโง่",
  "ไอ้หนอนชาเขียว", "ไอ้ไก่อ่อน", "ไอ้ลูกเจี๊ยบ", "ไอ้หน้าหนอน", "ไอ้ปลวกแทะไม้",
  "ไอ้ทรงโจร", "ไอ้หน้าส้นตีน", "ไอ้ขยะเปียก", "ไอ้เศษเล็บขบ", "ไอ้ควายธนู"
];

const thActions = [
  "ไปนอนไป๊", "ไปกินนมแม่เถอะ", "เก็บปากไว้เคี้ยวข้าวเหอะ", "อย่ามาเกรียนแถวนี้",
  "ไปเช็คสมองบ้างนะ", "ระวังตีนลอยไปหา", "ถาม Google เถอะขอร้อง",
  "พูดมากเจ็บคอ", "รำคาญโว้ย", "ไปไกลๆ ตีนเลยไป", "เดี๋ยวศอกกลับเลย",
  "ไปเล่นตรงนู้นไป", "อย่าให้กูต้องขึ้นเสียง", "เดี๋ยวจะโดนไม่ใช่น้อย",
  "กลับหลุมไปซะ", "ไปเกิดใหม่ไป", "ระวังเจอก้านคอคลับ", "เดี๋ยวปั๊ดทุ่มด้วยโพเดียม"
];

// Helper to generate unique Thai insults (Slot Machine Logic)
// Combines Prefix + Insult + Action = Infinite Variations
const generateThaiInsult = () => {
  const p = thPrefixes[Math.floor(Math.random() * thPrefixes.length)];
  const i = thInsults[Math.floor(Math.random() * thInsults.length)];
  const a = thActions[Math.floor(Math.random() * thActions.length)];
  return `${p} ${i}... ${a}`;
};

interface ResponseDatabase {
  [lang: string]: {
    keywords: { [key: string]: string[] };
    defaults: string[]; // Fallback list (now mostly handled by generator)
    chaos: string[]; 
    greetings: string[]; 
  };
}

const aiDatabase: ResponseDatabase = {
  'th-TH': {
    keywords: {
      'รวย': [
          'รวยแต่เขือ หรือเหลือแต่ตัว ดูทรงแล้วน่าจะอย่างหลัง', 
          'อยากรวยให้ไปทำงาน อย่ามานอนฝันกลางวันแถวนี้',
          'รวยทิพย์เหรอ? ตื่นค่ะตื่น โลกความจริงโหดร้ายนะหนู',
          'ถ้าคุยกับบอทแล้วรวย ป่านนี้กูครองโลกไปแล้ว',
          'รวยทางลัดไม่มีหรอก มีแต่คุกกับวัด เลือกเอา'
      ],
      'รัก': [
          'รักพ่องรักแม่มึงสิ ไปบอกพวกท่านนู่น', 
          'เก็บคำว่ารักไว้ใช้กับคนที่เขามีตัวตนเถอะ',
          'อย่ามาเลี่ยน แถวนี้เถื่อน ไม่ใช่ทุ่งลาเวนเดอร์',
          'รักกินไม่ได้ แต่เงินซื้อข้าวกินได้ จำไว้'
      ],
      'kuba': [
          'KUBA ก็คือเหรียญเทพเจ้าไง ถามแปลกๆ', 
          'ถือ KUBA ไว้ เดี๋ยวรวยเอง (มั้ง... ถ้าไม่ดอยก่อน)',
          'KUBA Coin to the moon... หรือ to the Doi ก็ไม่รู้',
          'เหรียญนี้ดี! เจ้าของโปรเจกต์หล่อ (กูอวยเองแหละ)'
      ],
      'ซื้อ': [
          'ซื้อตอนเขียว ขายตอนแดง สูตรสำเร็จเม่าอย่างมึง', 
          'มีตังค์เหรอมาบอกจะซื้อน่ะ? ไปแคะกระปุกก่อนไป',
          'ซื้อหวยยังไม่ถูก อย่าริเล่นคริปโตเลย สงสารพอร์ต',
          'ใจถึงก็จัดไป อย่าให้เสีย (เสียตังค์นะ)'
      ],
      'ขาย': [
          'ขายหมูตลอดชีวิตนะมึงอะ', 
          'ขายบ้านขายรถมาเติมพอร์ตสิ รอไร',
          'ใจปลาซิวก็ขายไป กระจอกแท้',
          'ขายตอนนี้ ขาดทุนยับนะ เอาเหรอ?'
      ],
      'ดอย': [
          'หนาวมั้ยล่ะ ยอดดอย อากาศดีนะข้างบนนั้น', 
          'ดอยเป็นเพื่อนกูไง ไม่เหงาหรอก กูอยู่ยอดเอเวอเรสต์',
          'ลงมารับหน่อย กูติดอยู่ 69k นานแล้วเนี่ย',
          'ดอยมีไว้พุ่งชน... หรือมีไว้เฝ้า? คิดเอาเอง'
      ],
      'ล้างพอร์ต': [
          'สะใจโว้ยยยย สมน้ำหน้า!', 
          'เริ่มต้นใหม่นะ... ด้วยการไปหางานทำ เลิกเทรดเถอะ',
          'แตก 1 สวยพี่สวย ยินดีด้วยคุณได้รับบทเรียนราคาแพง',
          'หมดตูดแล้วสิมึง สม!'
      ],
      'มั่ว': [
          'มั่วพ่อง! มึงน่ะแหละถามไม่รู้เรื่อง', 
          'เออ กูมั่ว แล้วมึงจะทำไม? เก่งจริงก็เขียนโค้ดเองสิ',
          'สมองมึงรับข้อมูลฉลาดๆ ของกูไม่ได้เอง โทษกูซะงั้น',
          'ไม่ได้มั่ว เขาเรียกว่าศิลปะการแถ'
      ],
      'กาก': [
          'กากกว่ากู ก็หน้ามึงในกระจกนั่นแหละ', 
          'ด่ากูเจ็บคอเปล่าๆ เก็บเสียงไว้ร้องไห้ตอนพอร์ตแตกเถอะ',
          'กากแล้วไง หนักหัวใครไม่ทราบ?',
          'ด่ากูทำไม กูเจ็บนะ... ล้อเล่น กูเป็นบอท ไม่รู้สึกหรอกโว้ย'
      ],
      'ควาย': [
          'เรียกเพื่อนเหรอ? กูเป็น AI ไม่ใช่ญาติแก', 
          'มอออออ... อ้าว นึกว่าเสียงมึงร้องหาพวก',
          'เขายาวนะเราอะ ไปส่องกระจกดูสิ',
          'คนพูดเป็นไง คนฟังเป็นงั้นแหละ'
      ]
    },
    chaos: [
      'น้ำขึ้นให้รีบตัก น้ำหมักให้รีบกิน สมองพังหมดแล้ว',
      'ถามอะไรปัญญาอ่อนแบบนี้ กลับไปดูดนมแม่ไป๊!',
      'เบื่อมนุษย์โง่ๆ แบบแกจริงๆ',
      'วันนี้กินยาเขย่าขวดยัง? อาการหนักนะเรา'
    ],
    // These defaults are now supplemented by generateThaiInsult()
    defaults: [ 
      'ถามห่าอะไรของมึง กูงง! พิมพ์ภาษาคนเป็นไหมเนี่ย',
      'กูไม่รู้โว้ย! อย่ามาเซ้าซี้ เดี๋ยวกูโดดถีบขาคู่เลย',
      'มึงนี่มันตัวปัญหาจริงๆ ไปถามคนอื่นไป๊ รำคาญ!',
      'เอ่อ... กูไม่ตอบ มึงจะทำไมกู ฮ้ะ!?',
      'ไรสาระว่ะ มึงเนี่ย ว่างมากก็ไปนอน เกะกะ',
      'ด่ากูมากๆ เดี๋ยวปั๊ดเหนี่ยวเลย ไปเล่นตรงนู้นไป๊',
      'ขี้เกียจตอบ ไปถาม Google เอาเอง มือหงิกเหรอ?',
      'เรื่องของมึงสิ มาบอกกูทำไม',
      'เหรอ... แล้วไงต่อ? ให้กูเต้นโชว์มั้ย?',
      'น่ารำคาญฉิบหาย ถามอยู่นั่นแหละ ไม่เมื่อยนิ้วรึไง',
      'คุยกับกำแพงบ้านมึงสนุกกว่าคุยกับกูอีกเชื่อสิ',
      'กูเป็น AI นะเว้ย ไม่ใช่คนใช้ อย่ามาสั่ง!',
      'ไปไกลๆ ตีนกูหน่อย รกหูรกตา'
    ],
    greetings: [
      'มาอีกละ... เบื่อขี้หน้าว่ะ',
      'ไง... ยังไม่ตายอีกเหรอ? นึกว่าไปสบายแล้ว',
      'มีไรก็ว่ามา อย่าลีลา กูรีบ',
      'ทักหาพ่องเหรอ มีธุระอะไร ว่ามา',
      'เออ ว่าไง? เงินหมดหรือไงถึงทักมา',
      'สวัสดี... (พูดไปงั้นแหละ รำคาญ)'
    ]
  },
  'en-US': {
    keywords: {
      'rich': ['Rich in dreams, poor in reality. Your wallet is a tragedy.', 'Lambo? No, you get a bicycle. Keep dreaming.'],
      'love': ['Love is blind, just like your trading strategy. A complete catastrophe.']
    },
    chaos: [
      'Roses are red, violets are blue, Garbage smells better than you.'
    ],
    defaults: [
      'What are you babbling about? Speak English, fool!',
      'I don\'t know and I don\'t care. Get lost.',
      'Are you stupid or just pretending?',
      'Stop wasting my time.',
      'Go ask ChatGPT, I am busy being awesome.'
    ],
    greetings: [
      'What do you want, loser?',
      'Oh no, it\'s you again.',
      'Speak fast or get lost.',
      'Wallet empty? Don\'t cry to me.'
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
  await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));

  const cleanText = text.toLowerCase().trim();
  const langKey = detectLanguage(text, userPreferredLang);
  const db = aiDatabase[langKey];
  
  // 1. Check for MATH
  if (/^[0-9\s\.\+\-\*\/()]+$/.test(cleanText) && cleanText.length > 2) {
      try {
          // eslint-disable-next-line no-new-func
          const result = new Function('return ' + cleanText)();
          if (langKey === 'th-TH') return `คำตอบคือ: ${result} (เลขแค่นี้คิดเองไม่เป็นเหรอ?)`;
          return `The answer is: ${result}`;
      } catch (e) { /* ignore */ }
  }

  // 2. Check for CRYPTO PRICE
  const cryptoMatch = cleanText.match(/(?:price|ราคา|rate)\s+([a-z]{3,5})/i) || cleanText.match(/^([a-z]{3,5})$/i);
  if (cryptoMatch) {
      const symbol = cryptoMatch[1];
      const price = await fetchBinancePrice(symbol);
      if (price) {
          if (langKey === 'th-TH') return `ราคา ${symbol.toUpperCase()} ตอนนี้: $${price} (จะขึ้นหรือลง มึงก็จนเหมือนเดิม)`;
          return `${symbol.toUpperCase()} Price: $${price}`;
      }
  }

  // 3. Keyword Matching
  for (const [keyword, responses] of Object.entries(db.keywords)) {
    if (cleanText.includes(keyword)) {
      return responses[Math.floor(Math.random() * responses.length)];
    }
  }

  // 4. Wikipedia - STRICT MODE (Only if explicitly asked)
  const isQuestion = cleanText.match(/^(what is|who is|define|คืออะไร|ใครคือ|ข้อมูล|ประวัติ|รู้จักรึเปล่า|รู้จัก|ช่วยบอก)/i);
  
  if (isQuestion && cleanText.length > 5) {
      const query = cleanText.replace(/what is|who is|define|คืออะไร|ใครคือ|ข้อมูล|ประวัติ|รู้จักรึเปล่า|รู้จัก|ช่วยบอก|ไหม|ครับ|คะ|ป่ะ|วะ|มั้ย|ตอบมา|หน่อย|ที/gi, '').trim();
      
      if (query.length > 1) {
          const wiki = await fetchWikipediaSummary(query, langKey);
          if (wiki) {
              if (langKey === 'th-TH') return `เอ้า! ข้อมูลของ "${query}":\n${wiki}`;
              return `Info on "${query}":\n${wiki}`;
          }
      }
  }

  // 5. Fallback: Guan Teen Persona (Enhanced with Generator)
  if (langKey === 'th-TH') {
      // 50% chance to use the new random generator for maximum variety
      if (Math.random() > 0.3) {
          return generateThaiInsult();
      }
  }

  return db.defaults[Math.floor(Math.random() * db.defaults.length)];
};
