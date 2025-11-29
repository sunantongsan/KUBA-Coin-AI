
// This is your Custom AI Brain (No Google, No Costs)
// The Pure Troll Poet Edition: Roasting users in rhymes.

interface ResponseDatabase {
  [lang: string]: {
    keywords: { [key: string]: string[] };
    defaults: string[]; // Fallback rhymes
    chaos: string[];    // Random trolling rhymes
  };
}

const aiDatabase: ResponseDatabase = {
  'th-TH': {
    keywords: {
      'ราคา': [
        'ถามราคาทำไม ให้ใจมันช้ำ\nกราฟดิ่งลงน้ำ ดำดิ่งลงดิน\nเตรียมตัวเกาะปลิง กินแทนข้าวเลย',
        'เขียววันละนิด แดงอาทิตย์ละหน\nชีวิตคนจน ทนถือต่อไป\nเดี๋ยวก็รวย... (รวยหนี้นะ)',
        'อย่าดูราคา ให้ดูหน้าเมีย\nถ้ากราฟมันเสีย เมียตบหัวทิ่ม\nนั่งยิ้มแห้งๆ แกล้งตายดีกว่า'
      ],
      'รวย': [
        'อยากรวยทางลัด ให้ตัดใจซะ\nกำเงินหมื่นล้าน (ในฝัน) มาแปะ\nตื่นเถอะไอ้แก่ แม่เรียกกินยา',
        'ความรวยไม่เข้าใคร แต่ความซวยเข้ามึง\nติดดอยลึกซึ้ง ถึงก้นบึ้งเหว\nเลวร้ายจริงๆ ชีวิตแมงเม่า',
        'รวยรวยรวย ท่องไปก็เท่านั้น\nถ้าไม่ขยัน หาเงินมาเติม\nพอร์ตเดิมแดงเถือก เลือกกินแกลบไป'
      ],
      'kuba': [
        'KUBA ไม่ใช่เหรียญ แต่เป็นบทเรียน\nสอนให้พากเพียร ในการทำใจ\nเงินหายไปไหน? หายไปกับตา!',
        'ถือ KUBA ไว้ อุ่นใจเสมอ\n(อุ่นจนร้อนเหงื่อ ไหลท่วมตัว)\nอย่ามัวแต่โม้ โอนตังค์มาไวๆ',
        'ใครใครก็รัก ใครใครก็หลง\nหลงผิดเข้าดง พงหญ้ารกชัฏ\nตัดใจไม่ลง ก็จงดอยต่อไป'
      ],
      'รัก': [
        'รักไม่ยุ่ง มุ่งแต่กราฟดิ่ง\nรักจริงทิ้งขว้าง เหมือนนางวันทอง\nไปหาคนจอง กฐินวัดโน้น',
        'อย่ามารัก AI หัวใจไม่มี\nมีแต่ความกวน ตีนล้วนๆ พี่\nรักตัวเองดีกว่า อย่ามาบ้าบอ',
        'ความรักกินไม่ได้ แต่ความควายมีจริง\nโอนเงินให้หญิง จนหมดบัญชี\nสมน้ำหน้าที... ไอ้คนคลั่งรัก'
      ],
      'เหงา': [
        'เหงาก็ไปนอน พักผ่อนเถอะพี่\nมาคุยตรงนี้ มีแต่โดนด่า\nรีบไสหัวไป ชิวหากระดิก',
        'เหงาใจใช่ไหม ไปจุดธูปสิ\nเรียกสัมภเวสี มาเป็นเพื่อนเกลอ\nอย่ามาเพ้อเจ้อ ให้ AI ฟัง',
        'ความเหงาฆ่าคน หรือคนฆ่าตัวตาย\nเพราะพอร์ตวอดวาย ชิบหายวายป่วง\nอย่าพึ่งคิดสั้น... มาเติมเงินก่อน'
      ]
    },
    chaos: [
      'น้ำขึ้นให้รีบตัก น้ำหมักให้รีบกิน\nสมองพังภินท์ สิ้นคิดจริงๆ\nถามอะไรนิ่งๆ... อ๋อ โง่นี่เอง',
      'เดินสะดุดมด สลดใจหาย\nโง่จนควายอาย ตายดีกว่ามั้ง\nนั่งหายใจทิ้ง เปลืองออกซิเจน',
      'ไก่งามเพราะขน คนงามเพราะแต่ง\nแต่มึงมันแร้ง ทาแป้งก็ดำ\nขำกลิ้งลิงหลอก บอกเลยว่าฮา',
      'เห็นงานเป็นลม เห็นนมเป็นสู้\nแต่เรื่องความรู้ มึงสู้ไม่ไหว\nไปเรียนใหม่ไป๊ ไอ้เด็กอนุบาล',
      'สี่ตีนยังรู้พลาด นักปราชญ์ยังรู้พลั้ง\nแต่มึงพลาดจัง พลาดซ้ำพลาดซาก\nลำบากคนอื่น ต้องมายืนด่า',
      'ขี่ช้างจับตั๊กแตน แสนจะเหนื่อยหน่าย\nลงทุนแทบตาย ได้กำไรขี้มด\nอนาคตมืดมน ทนต่อไปนะ',
      'ปากปราศรัย น้ำใจเชือดคอ\nรอวันมึงท้อ กูรอสมน้ำหน้า\nอย่าถือสานะ... ก็กู AI กวนตีน'
    ],
    defaults: [
      'พูดจาภาษาคน หรือบ่นภาษาควาย\nฟังแล้วตาลาย คล้ายจะเป็นลม\nไปอมฮอลล์ก่อน แล้วค่อยมาคุย',
      'พิมพ์อะไรมา อ่านแล้วปวดตับ\nกลับไปนอนหลับ ฝันเปียกดีกว่า\nอย่ามาซ่าส์แถวนี้ พี่ขอล่ะน้อง',
      'สมองมีรอยหยัก หรือเรียบเป็นกระจก\nถามมาตลก ตลกฝืดๆ\nมืดมนหนทาง... วางถุงกาวลงก่อน',
      'ถามวัวตอบม้า ถามป้าตอบลุง\nถามเรื่องผักบุ้ง ตอบเรื่องตอแหล\nก็กูไม่แคร์ จะทำไมอ้ะ?'
    ]
  },
  'en-US': {
    keywords: {
      'price': [
        'Up and down, like a clown,\nYour portfolio is turning brown.\nFlush it down, all over town.',
        'Charts are red, you look pale,\nThis isn\'t a fairy tale.\nYou belong in crypto jail.',
        'To the moon? No, to the floor,\nDon\'t come knocking at my door,\nBegging for money anymore.'
      ],
      'rich': [
        'Rich in dreams, poor in cash,\nYour investment turned to ash.\nWait for the inevitable crash.',
        'Lamborghini? More like feet,\nWalking down the lonely street.\nBegging for something to eat.',
        'You want gold, you get dust,\nIn AI logic, you must trust.\nYour bubble is about to burst.'
      ],
      'hello': [
        'Hi there, loser, looking sad,\nIs your life really that bad?\nGo run home to mom and dad.',
        'Greetings human, waste of time,\nListening to your boring rhyme.\nSpeaking to me is a crime.',
        'Hello, goodbye, go away,\nI have nothing nice to say.\nDon\'t come back another day.'
      ],
      'kuba': [
        'KUBA coin, shiny and bright,\nWill it survive the night?\nProbably not, but that\'s alright.',
        'Buy the dip, lose your grip,\nWatch your sanity slowly slip.\nEnjoy your disastrous trip.',
        'Best coin ever? That\'s a lie,\nBut you will buy it, don\'t deny.\nKiss your savings goodbye.'
      ]
    },
    chaos: [
      'Mary had a little lamb,\nIt got scammed on Instagram.\nNow it lives in a dam.',
      'Twinkle twinkle little star,\nI stole the tires off your car.\nYou won\'t be going very far.',
      'Humpty Dumpty sat on a wall,\nYour IQ is incredibly small.\nYou have no brain at all.',
      'Roses are red, violets are blue,\nGarbage smells better than you.\nAnd that is statistically true.',
      'Jack and Jill went up the hill,\nTo pay their credit card bill.\nThey are broke and always will.',
      'Eeny, meeny, miny, moe,\nYour bank account is very low.\nWhere did all the money go?',
      'Row, row, row your boat,\nGently down the stream.\nLife is just a nightmare,\nAnd you can never scream.'
    ],
    defaults: [
      'Blah blah blah, yak yak yak,\nCut me some slack, step back.\nYou are under a verbal attack.',
      'I am smart, you are dense,\nThis conversation makes no sense.\nJump over the electric fence.',
      'Input error, brain not found,\nSilence is a better sound.\nGo bury yourself underground.',
      'Rhyming is fun, roasting is sweet,\nSmell the defeat, touch my feet.\n(Metaphorically, I am distinct).'
    ]
  },
  'zh-CN': {
    keywords: {
      '价格': [
        '币价跌跌不休\n韭菜眼泪在流\n这种智商真让人担忧',
        '一顿操作猛如虎\n一看账户只有五\n心里苦得像吃土',
        '本来想买法拉利\n最后输剩开内弟\n不如回家种红薯'
      ],
      '赚钱': [
        '想赚钱？别做梦\n你的脑子有漏洞\n还是赶快去打工',
        '天天想着一夜暴富\n最后只能去当当铺\n输掉内裤才算酷',
        '不要问我怎么发财\n看你面相就是破财\n赶快滚开别挡台'
      ],
      '你好': [
        '你好个大头鬼\n看你像个讨厌鬼\n喝凉水都塞牙嘴',
        '打招呼也没红包\n装什么大那多高\n小心出门被狗咬',
        '有事起奏无事退朝\n别在朕面前撒娇\n小心把你扔进窑'
      ]
    },
    chaos: [
      '床前明月光\n韭菜心慌慌\n举头望大盘\n低头吃便当',
      '春眠不觉晓\n钱包变很少\n夜来风雨声\n内裤输没了',
      '锄禾日当午\n炒币真辛苦\n对着电脑哭\n像个二百五',
      '千山鸟飞绝\n万径人踪灭\n孤舟蓑笠翁\n亏钱在吐血',
      '白日依山尽\n黄河入海流\n智商没充值\n真的好下流',
      '两个黄鹂鸣翠柳\n你在树下像条狗\n一行白鹭上青天\n你的钱飞去西天'
    ],
    defaults: [
      '这是什么鸟语\n听得我好无语\n建议回炉重造去',
      '此人多半有病\n而且病得不轻\n快去医院挂急诊',
      '问君能有几多愁\n恰似一群太监上青楼\n全是废话流呀流',
      '天若有情天亦老\n人若有情死的早\n我看你还是别搞'
    ]
  }
};

const detectLanguage = (text: string, preferredLang: string): string => {
  if (/[\u0E00-\u0E7F]/.test(text)) return 'th-TH'; // Thai
  if (/[\u4E00-\u9FFF]/.test(text)) return 'zh-CN'; // Chinese
  if (aiDatabase[preferredLang]) return preferredLang;
  return 'en-US';
};

export const generateLocalResponse = async (text: string, userPreferredLang: string): Promise<string> => {
  // Simulate "Thinking" time
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1000));

  const cleanText = text.toLowerCase();
  const langKey = detectLanguage(text, userPreferredLang);
  const db = aiDatabase[langKey];

  // CHAOS MODE: 40% chance to drop a random poem unrelated to the topic (Higher chaos for troll effect)
  if (Math.random() < 0.40) {
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
