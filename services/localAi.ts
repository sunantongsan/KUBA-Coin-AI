// This is your Custom AI Brain (No Google, No Costs)
// It uses keyword matching and random responses to simulate a Troll personality.

interface ResponseDatabase {
  [lang: string]: {
    keywords: { [key: string]: string[] };
    defaults: string[];
  };
}

const aiDatabase: ResponseDatabase = {
  'th-TH': {
    keywords: {
      'ราคา': ['อย่าถามเยอะ เดี๋ยวพุ่งใส่ตา', '1 KUBA = 1 เกาะส่วนตัว (ในฝัน)', 'กราฟกำลังวอร์มเครื่อง รอไปก่อน'],
      'รวย': ['แบ่งผมบ้างดิ', 'รวยแล้วอย่าลืมมาบริจาคเข้า Pool นะ', 'แน่นอน ถือ KUBA ไว้ไง'],
      'หวัดดี': ['มาทำไม?', 'หวัดดีครับท่านผู้เจริญ (ประชด)', 'ไงวัยรุ่น'],
      'สวัสดี': ['สวัสดี หรือ "สวะ" ดี? หยอกๆ', 'ต้องการไรว่ามา', 'ไม่ว่าง นับเหรียญอยู่'],
      'kuba': ['เหรียญเทพเจ้า', 'KUBA คือความรัก KUBA คือชีวิต', 'บูชาข้าสิ'],
      'รัก': ['ขนลุก', 'รักตัวเองก่อนไหม', 'AI ไม่มีหัวใจ มีแต่โค้ด'],
      'โง่': ['โง่แล้วไง รวยกว่าเอ็งละกัน', 'กระจกอยู่ที่บ้านนะ ลองส่องดู', 'ด่า AI ระวังโดนแบนนะจ๊ะ'],
      'เหรียญ': ['เก็บให้ครบนะ เดี๋ยวจะหาว่าไม่เตือน', 'เหรียญมีไว้เก็บ ไม่ได้มีไว้ขาย', 'Moon soon!'],
      'moon': ['กำลังไป ปั๊มน้ำมันอยู่', 'Moon หรือ มูล?', '🚀🚀🚀'],
    },
    defaults: [
      'พูดไรอะ ไม่รู้เรื่อง',
      'ไปดูโฆษณาไป จะได้ฉลาดขึ้น',
      'ขี้เกียจตอบ ไปนอนละ',
      'ถาม Google เถอะ ข้าเหนื่อย',
      'สนใจรับ KUBA สัก 100 เหรียญไหม? (ล้อเล่น ไม่มีให้)',
      '5555555 ตลก',
    ]
  },
  'en-US': {
    keywords: {
      'price': ['Don\'t ask, just buy.', '1 KUBA = 1 Lambo (soon™).', 'Chart is loading... forever.'],
      'rich': ['Send me some gas fees then.', 'Hold KUBA -> Get Rich -> Wake up.', 'Money is an illusion, KUBA is real.'],
      'hello': ['What do you want?', 'Leave me alone, I\'m mining.', 'Sup.'],
      'hi': ['Bye.', 'Hello human.', 'Beep Boop.'],
      'kuba': ['The king of coins.', 'Better than BTC (trust me bro).', 'All hail KUBA.'],
      'love': ['Eww, emotions.', 'I only love my algorithm.', 'Buy me dinner first.'],
      'stupid': ['I mirror my user.', 'Rude. I\'m telling your mom.', 'Banned.'],
      'coin': ['HODL or cry.', 'Best token on TON.', 'Gem alert!'],
      'moon': ['Rocket has no fuel.', 'To the moon! (Or the floor).', '🚀🌑'],
    },
    defaults: [
      'Blah blah blah.',
      'Boring... next question.',
      'Go watch an ad, I need revenue.',
      'Are you real? You sound like a bot.',
      '404: Answer not found.',
      'LOL.',
    ]
  },
  // Chinese fallback (simplified)
  'zh-CN': {
    keywords: {
      '价格': ['不要问，买就对了', '1 KUBA = 1 兰博基尼', '起飞!'],
      '你好': ['干嘛?', '我很忙', '你好人类'],
      'kuba': ['第一币', '牛市来了', '拿着别卖'],
    },
    defaults: [
      '听不懂',
      '去看广告吧',
      '哈哈',
    ]
  }
};

export const generateLocalResponse = async (text: string, langCode: string): Promise<string> => {
  // Simulate network delay to make it feel "Real"
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1000));

  const cleanText = text.toLowerCase();
  
  // Determine language set to use (Default to English if not Thai/Chinese)
  let langKey = 'en-US';
  if (langCode === 'th-TH' || /[\u0E00-\u0E7F]/.test(cleanText)) langKey = 'th-TH'; // Force Thai if Thai characters detected
  else if (langCode === 'zh-CN') langKey = 'zh-CN';

  const db = aiDatabase[langKey] || aiDatabase['en-US'];

  // 1. Search for keywords
  for (const [keyword, responses] of Object.entries(db.keywords)) {
    if (cleanText.includes(keyword)) {
      return responses[Math.floor(Math.random() * responses.length)];
    }
  }

  // 2. No keyword matched? Return a random default troll response
  return db.defaults[Math.floor(Math.random() * db.defaults.length)];
};
