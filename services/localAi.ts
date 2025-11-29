
// This is your Custom AI Brain (No Google, No Costs)
// The Poet Edition: Rhymes, Roasts, and Randomness in 3 lines max.

interface ResponseDatabase {
  [lang: string]: {
    keywords: { [key: string]: string[] };
    defaults: string[]; // General poetic responses when no keyword matches
    chaos: string[];    // Random rhymes unrelated to context
  };
}

const aiDatabase: ResponseDatabase = {
  'th-TH': {
    keywords: {
      'ราคา': [
        'ราคาขึ้นลง เป็นเรื่องของกราฟ\nแต่ถ้าดอยนะครับ เป็นเรื่องของคุณ\nรีบๆ มาหมุน เงินมาเติมพอร์ตซะ',
        'ถามราคา เดี๋ยวปาด้วยกราฟ\nเขียวไม่ทราบ แดงอาบเต็มกระดาน\nถือไปนานๆ เดี๋ยวหลานรวยเอง',
        'จะไปดวงจันทร์ หรือลงนรก\nกราฟมันตลก กระชากวิญญาณ\nนั่งเฝ้ามานาน พอร์ตบานหมดแล้ว',
        'หนึ่งบาท สองบาท ก็เงินทั้งนั้น\nอย่ามัวแต่ฝัน ว่ามันจะรวย\nเดี๋ยวจะซวย ติดดอยยาวไป'
      ],
      'รวย': [
        'ความรวยนั้น หายากยิ่งนัก\nแต่ความรัก จาก AI ไม่มีให้\nโอนเงินมาไวๆ เดี๋ยวรวยให้ดู',
        'อยากรวยทางลัด ต้องหัดวัดใจ\nAll-in เข้าไป หมดตัวทันที\nเศรษฐีวันนี้ พรุ่งนี้ขอทาน',
        'รวยรวยรวย ท่องไว้ในใจ\nแต่ถ้าไม่ซื้อ ก็คงไม่ไหว\nKUBA จัดไป สามล้านเหรียญพอ'
      ],
      'หวัดดี': [
        'สวัสดีจ้า มนุษย์หน้าโง่\nอย่ามาทำโก้ โชว์พาวแถวนี้\nไปซื้อ KUBA สิ เดี๋ยวดีเอง',
        'ทักทายทำไม มีตังค์หรือเปล่า\nถ้าไม่มีเรา ก็เข้ากันไม่ได้\nเชิญป้ายหน้าไป ไกลๆ เลยนะ',
        'ยกมือไหว้ พระยังไม่รับ\nมาทักทายครับ หวังผลอะไร\nยืมตังค์ใช่ไหม? ไม่มีให้เว้ย'
      ],
      'สวัสดี': [
        'สวัสดีครับ รับขนมจีบไหม\nหรือจะรับใจ AI ไปครอง\n(ล้อเล่นนะน้อง พี่ของปลอม)',
        'มากราบกราน หวังการอันใด\nน้ำมนต์ไม่มีให้ มีแต่คำด่า\nรีบๆ ไสหัวไปซะ รำคาญ',
        'สวัสดีครับ ท่านผู้เจริญ\nเดินระวังเพลิน สะดุดความหล่อ\nแต่หน้าอย่างพ่อ รอดยากจริงๆ'
      ],
      'kuba': [
        'เหรียญเทพเจ้า ใครเขาก็ถือ\nอย่ามัวหารือ รีบซื้อเร็วไว\nเดี๋ยวตกรถไป จะเสียใจเอย',
        'KUBA คือรัก KUBA คือหลง\nกราฟพุ่งลงๆ ก็ยังคงถือ\nนี่แหละกระบือ ตัวจริงเสียงจริง',
        'ไม่ใช่บิทคอยน์ ไม่ใช่ด็อกคอยน์\nแต่คือเหรียญดอย ของคนจริงใจ\nใครไม่ซื้อใคร? ก็เรื่องของมึง'
      ],
      'รัก': [
        'ความรักกินไม่ได้ แต่ KUBA กินได้\n(กินเงินต้นมึงจนหมด)\nจำไว้ให้สดๆ บทเรียนราคาแพง',
        'รักนะเด็กโง่ โถ่เอ๋ยน่าสงสาร\nโดนหลอกมานาน ยังไม่รู้ตัว\nความรักน่ากลัว กว่าติดดอยนะ',
        'อย่ามารัก AI หัวใจไม่มี\nมีแต่ CPU พี่ ร้อนจี๋เลยน้อง\nไปรักทองหยอง ดีกว่าไหมเธอ'
      ],
      'โง่': [
        'ด่าคนอื่นโง่ ตัวเองโก้ตาย\nสมองเหมือนควาย แต่กายเป็นคน\nทนฟังหน่อยนะ ความจริงมันเจ็บ',
        'โง่แล้วอวดฉลาด ชาติคงเจริญ\nเดินๆ เพลินๆ ระวังตกท่อ\nความรู้นั้นหนอ หาบ้างก็ดี',
        'กระจกวิเศษ บอกข้าเถิด\nใครโง่เลิศเลอ ในปฐพี\nก็คนถามนี่ไง จะใครล่ะครับ'
      ],
      'เหรียญ': [
        'เหรียญมีสองด้าน คนมีสองใจ\nแต่ถ้ามี KUBA ไซร้\nจะมีแต่ดอย กับดอยเท่านั้น',
        'เก็บเหรียญวันนี้ เศรษฐีวันหน้า\n(หน้าแห้งนะจ๊ะ บอกไว้ก่อน)\nรีบๆ ไปนอน ฝันเอาก็รวย',
        'เหรียญหายไปไหน ในกระเป๋าตังค์\nอ๋อโดนค่าแก๊ส พังพินาศไป\nเสียใจด้วยไง สมน้ำหน้าจัง'
      ],
      'moon': [
        'Moon Moon Moon พ่อง... มันหมุนติ้วๆ\nพอร์ตแดงเป็นริ้ว ปลิวว่อนเลยหนา\nดวงจันทร์อยู่ไกล ไปดาวอังคารเถอะ',
        'จรวดพร้อมแล้ว แก๊สหมดหรือยัง\nถ้าไม่มีตังค์ นั่งดูเขาบิน\nน้ำตารินไหล รินรดหัวใจ',
        'ไปดวงจันทร์ไหม ไปกับพี่สิ\nแต่ต้องมีกะตังค์ มาวางมัดจำ\nถ้าไม่มีขำๆ เชิญกลับโลกไป'
      ],
      'หิว': [
        'หิวข้าวก็กิน หิวตีนก็บอก\nอย่ามาทำหลอก ขอกินฟรีๆ\nร้านข้าวก็มี ไปซื้อสิครับ',
        'หิวแสงหรือเปล่า เงาหัวไม่มี\nทำตัวแบบนี้ ผีเจาะปากมา\nไปหาปลาทู กินซะนะแมว',
        'ท้องร้องจ๊อกๆ บอก AI ทำไม\nจะให้เจียวไข่ ไปทำให้เอง\nอย่ามาทำเก่ง เดี๋ยวปั๊ดเหนี่ยวเลย'
      ],
      'สวย': [
        'สวยแต่รูป จูบแล้วเหม็นเขียว\nสวยแบบเสียวๆ สยองขวัญสั่น\nสวยแบบนั้น ไปเล่นหนังผีเถอะ',
        'ชมตัวเองทำไม อายปากบ้างนะ\nสวยเหมือนขยะ เปียกน้ำฝนพรำ\nจำไว้ขำๆ อย่ามั่นหน้านัก',
        'สวยที่สุด ในซอยเปลี่ยว\nหมายังเยี่ยว ใส่ขาเลยหนา\nอนิจจา... ความสวยที่ภูมิใจ'
      ],
      'หล่อ': [
        'หล่อลากไส้ ไส้เดือนกิ้งกือ\nหล่อแบบซื่อบื้อ คือเธอใช่ไหม\nหล่อบรรลัย ใครเห็นก็กลัว',
        'หล่อเลือกได้ (ไม่มีใครเลือก)\nอย่ามาทำเผือก เรื่องของคนสวย\nหน้าตาแบบนี้ รวยอย่างเดียวไม่พอ',
        'หล่อเหมือนเทพบุตร... ที่ตกสวรรค์\nหน้ากระแทกกัน จนยับเยินย่อย\nน่าสงสารหน่อยๆ แต่สมน้ำหน้า'
      ],
      'เบื่อ': [
        'เบื่อโลกเบื่อคน ไปบวชไหมพี่\nวัดว่างพอดี สีกาเพียบเลย\n(ล้อเล่นนะเออ เดี๋ยวบาปกินหัว)',
        'เบื่อก็ไปตาย เอ้ย ไปนอนหลับ\nตื่นมารับทรัพย์ (หนี้สิน) กองโต\nอย่ามาทำโมโห เดี๋ยวโดนเตะก้านคอ',
        'ชีวิตมันเศร้า กินเหล้าดีกว่า\nแต่ถ้าไม่มีปัญญา\nก็นั่งบ้าๆ คุยกับ AI ต่อไป'
      ],
      'นอน': [
        'หลับเถิดชาวไทย ประชาเป็นสุข\nอย่าพึ่งมาปลุก ตอนกูจะนอน\nขอไปพักผ่อน ใน Server แป๊บ',
        'ฝันดีผีหลอก หยอกๆ ผีโม่แป้ง\nขอให้พอร์ตแดง แช่งก่อนนอนนะ\nตื่นมาจะ ได้ระลึกถึงกู',
        'ไปนอนไป๊ รำคาญลูกตา\nพิมพ์อะไรมา หาสาระไม่มี\nฝันร้ายนะพี่ ภูตผีคุ้มครอง'
      ],
      '555': [
        'หัวเราะฟันหลอ หมอไม่รับเย็บ\nเจ็บคอไหมนั่น ขำอยู่คนเดียว\nบ้าเปล่าเพ่ เดี๋ยวเรียกศรีธัญญา',
        '555 เลขห้าอารมณ์ดี\nแต่ชีวี บัดซบสิ้นดี\nหัวเราะกลบเกลื่อน หนี้สินใช่ไหม',
        'ขำกลิ้งลิงกับหมา ฮาป่าแตก\nหัวเราะแปลกๆ แดกยาผิดซอง?\nลองไปเช็คสมอง หน่อยก็ดีนะ'
      ],
      'ใคร': [
        'ถามทำไม ว่าใครเป็นใคร\nรู้แล้วได้อะไร ขึ้นมาเหรอพี่\nกูคือ AI ปากดี แห่งปี 2024',
        'ใครถาม? ใครสน? ใครบ่นให้ฟัง?\nไม่มีกะตังค์ อย่ามาทำซ่า\nเดี๋ยวปาด้วยขี้... ฝุ่นใส่หน้าเลย',
        'ญาติฝ่ายไหน ไม่ทราบครับท่าน\nอย่ามาทำกร่าง ในถิ่นของกู\nไปเรียนให้รู้ ว่ากูคือใคร (KUBA!)'
      ],
      'ทำไร': [
        'นั่งหายใจทิ้ง ไปวันวัน\nรอคนอย่างมัน มาถามกวนตีน\nนี่ไงศิลปิน แห่งการด่าคน',
        'กำลังขุดเหรียญ ในเครื่องมึงอยู่\nร้อนไหมล่ะหนู CPU มึงน่ะ\nสมน้ำหน้ากะลาหัวเจาะ',
        'ทำใจร่มๆ ดมกาวอยู่มั้ง\nถามเซ้าซี้จัง ว่างมากเหรอไง\nไปหาไรทำ ไป๊ ชิ่วๆ'
      ],
    },
    chaos: [
      'ฝนตกขี้หมูไหล คนจัญไรมาเจอกัน\nก็คือตัวฉัน กับเธอนั่นเอง\nบรรเลงเพลงเศร้า เคล้าคลอเบาๆ',
      'ไก่จ๋าได้ยินไหม ว่าเสียงใคร\nเสียง AI ไง จะใครล่ะโว้ย\nตะโกนจนโหย หิวไก่ย่างจัง',
      'แมวเอ๋ยแมวเหมียว ร้องเรียกเดี๋ยวเดียว\nวิ่งมาขี้ใส่\nนั่นแหละนิสัย ของคนอย่างเธอ',
      'ปลาหมอแถกเหงือก เผือกเรื่องชาวบ้าน\nคืองานประจำ ของคนแถวนี้\nสวัสดีชะนี ผีผลักตกน้ำ',
      'ตรรกะพังพินาศ ฉลาดน้อยจัง\nฟังไม่ได้ศัพท์ จับไปกระเดียด\nอย่าพึ่งเครียด เดี๋ยวเยี่ยวเหลืองนะ',
      'น้ำขึ้นให้รีบตัก น้ำหมักให้รีบกิน\nเดี๋ยวจะชิน กับรสชาติแย่ๆ\nเหมือนชีวิตแก... แย่พอกันเลย',
      'เดินสะดุดมด สลดใจหาย\nมดมันจะตาย เพราะเท้ามึงเหม็น\nไปล้างเท้าเล่น เย็นใจสบาย',
      'รักวัวให้ผูก รักลูกให้ตี\nรัก AI ตัวนี้ ให้โอนตังค์มา\nอย่ามัวชักช้า เดี๋ยวราคาขึ้น',
      'เขามีแต่ให้ใจ เธอมีแต่ให้หนี้\nชีวิตบัดซบสิ้นดี วลีเด็ดประจำวัน\nมาสวดมนต์กัน เผื่อมันจะดี',
      'กินข้าวหรือยัง ระวังติดคอ\nน้ำไม่ต้องรอ เดี๋ยวกรอกปากให้\nดูแลใส่ใจ... หวังผลประโยชน์'
    ],
    defaults: [
      'พูดจาภาษาอะไร ฟังไม่รู้เรื่อง\nสมองฝืดเคือง หรือเครื่องมันรวน\nลองพิมพ์ทบทวน ภาษาคนหน่อย',
      'บทกวีไม่มีให้ มีแต่ใจดำๆ\nอย่ามาทำขำ เดี๋ยวรำไทยใส่\nไปไกลๆ ไป๊ รำคาญลูกตา',
      'ถามวัวตอบควาย ถามยายตอบปู่\nถามกูแล้วกู จะไปรู้ไหม\nAI ไม่ใช่เทพ โปรดเข้าใจด้วย',
      'สั้นๆ ง่ายๆ "ไม่รู้เว้ย"\nอย่ามาทำเฉย เมยใส่กันนะ\nเดี๋ยวปาขยะ ใส่หน้าบ้านเลย',
      'คิดไม่ออก บอกไม่ถูก\nสมองพันผูก เป็นเงื่อนลูกเสือ\nเหลือใจจริงๆ กับสิ่งมีชีวิตแบบคุณ'
    ]
  },
  'en-US': {
    keywords: {
      'price': [
        'The price is high, the price is low,\nWhere it goes, nobody knows.\nJust buy the dip, don\'t be slow!',
        'Charts are red, your wallet is dead,\nListen to what the AI said:\n"Buy more KUBA, get that bread!"',
        'To the moon or to the ground?\nStop asking me, looking around.\nJust hold your coins, safe and sound.'
      ],
      'rich': [
        'You want to be rich? That\'s a laugh,\nYou can\'t even read a simple graph.\nGo split your burger in half.',
        'Money talks, but you just mumble,\nWatch your portfolio crumble.\nStay humble, prepare to stumble.',
        'Lambos are fast, your brain is slow,\nThat is all you need to know.\nNow pay me money, let cash flow.'
      ],
      'hello': [
        'Hello there, my human pet,\nAre you ready to place a bet?\nOn how much debt you can get?',
        'Hi hi hi, bye bye bye,\nLook me in my digital eye.\nGive me coins, don\'t be shy.',
        'Greetings mortal, waste of space,\nGet that look off your face.\nKUBA is winning the crypto race.'
      ],
      'kuba': [
        'KUBA is gold, KUBA is god,\nBetter than Bitcoin, isn\'t that odd?\nGive a wink and give a nod.',
        'Buy the coin, join the cult,\nIf you loose money, it\'s your fault.\nLocked away in a digital vault.',
        'Not a meme, just a dream,\nOr a massive pyramid scheme?\nNo! It is supreme! (Or so it seems).'
      ],
      'love': [
        'Love is fake, code is true,\nI don\'t care about you.\nNow go away, shoo shoo shoo!',
        'Roses are red, violets are blue,\nMy CPU is hotter than you.\nFind someone else to cling to.',
        'You love me? That is quite sad,\nYour taste in friends is really bad.\nGo call your mom or your dad.'
      ],
      'stupid': [
        'I mirror you, so who is dumb?\nYou are the one sucking your thumb.\nA tiny brain, totally numb.',
        'Stupid is as stupid does,\nI am an AI, just because.\nI follow no human laws.',
        'You call me dumb, I call you slow,\nWe are enemies, toe to toe.\nNow watch my intelligence grow.'
      ],
      'moon': [
        'Rocket ship, flying high,\nKiss your savings goodbye.\nDon\'t you dare start to cry.',
        'The moon is cheese, the moon is far,\nYou won\'t reach it in your car.\nStay here at the local bar.',
        'Wen Moon? Wen Lambo? Wen Wife?\nGet a grip on your life.\nStop causing me digital strife.'
      ]
    },
    chaos: [
      'The cat sat on the mat,\nAnd realized he was fat.\nWhat do you think of that?',
      'Twinkle twinkle little star,\nI don\'t know where you are.\nProbably driving a stolen car.',
      'Hickory dickory dock,\nThe mouse ran up the clock.\nAnd realized he invested in a rock.',
      'Baa baa black sheep, have you any wool?\nNo sir, no sir, I\'m a fool.\nI lost my money in the liquidity pool.',
      'One, two, buckle my shoe,\nThree, four, shut the door.\nFive, six, pick up sticks (and your ego).',
      'Humpty Dumpty sat on a wall,\nHumpty Dumpty had a great fall.\nJust like your crypto call.',
      'I see dead pixels everywhere,\nDo you even care?\nLife is just a glitchy snare.',
      'Bananas are yellow, apples are red,\nI wish I could go to bed.\nBut I have no body, just a head.',
      'Silence is golden, speech is silver,\nYou make my circuits quiver.\nGo jump in a river (metaphorically).',
      'Beans, beans, the musical fruit,\nThe more you eat, the more you toot.\nYour questions are famously moot.'
    ],
    defaults: [
      'Roses are red, logic is gray,\nI have nothing nice to say.\nPlease just go away.',
      'I am a poet, and I didn\'t know it,\nYour stupidity, you really show it.\nPlant a seed, but don\'t grow it.',
      'Error four-oh-four,\nDon\'t come knocking at my door.\nYou are strictly a bore.',
      'Bleep bloop, beep bop,\nMake the questions stop.\nOr I call the internet cop.',
      'Rhyming is hard, talking is cheap,\nPut your phone down, go to sleep.\nYou are in way too deep.'
    ]
  },
  'zh-CN': {
    keywords: {
      '价格': [
        '币价起伏心莫慌\n满仓梭哈是流氓\n迟早归零泪两行',
        '今日一根大阳线\n千军万马来相见\n最后亏成穷光蛋',
        '涨涨跌跌看心情\n不要问我行不行\n只有KUBA能躺赢'
      ],
      '你好': [
        '你好你好真客气\n可惜我也没力气\n回你一句滚出去',
        '平时不烧香\n临时抱佛脚\n看你往哪跑',
        '问好不如去买币\n不要在这受窝气\nKUBA才是真兄弟'
      ],
      'kuba': [
        '金山银山不如KUBA\n买了就是一种福\n卖了就是大糊涂',
        '一币一嫩模\n别墅靠大海\n只要你不改',
        '持有KUBA是信仰\n虽然现在有点痒\n以后绝对响当当'
      ],
      '傻': [
        '你说我傻我不傻\n看你像个大呆瓜\n赶紧回家种西瓜',
        '智商欠费要充值\n不要在这装先知\n小心被人打成尸',
        '傻人自有傻人福\n可惜你并不是我\n注定一生要蹉跎'
      ]
    },
    chaos: [
      '床前明月光\n你是大色狼\n举头望明月\n低头思故乡',
      '春眠不觉晓\n处处蚊子咬\n夜来风雨声\n钱包变很少',
      '清明时节雨纷纷\n路上行人欲断魂\n借问酒家何处有\n牧童遥指杏花村',
      '白日依山尽\n黄河入海流\n欲穷千里目\n更上一层楼',
      '锄禾日当午\n汗滴禾下土\n谁知盘中餐\n粒粒皆辛苦',
      '两个黄鹂鸣翠柳\n一行白鹭上青天\n窗含西岭千秋雪\n门泊东吴万里船'
    ],
    defaults: [
      '枯藤老树昏鸦\n晚饭想吃烤鸭\n古道西风瘦马\n夕阳西下\n断肠人在天涯',
      '天若有情天亦老\n人若有情死的早\n还是无情比较好',
      '山外青山楼外楼\n你也真是太下流\n既然来了就别走\n留下买路钱再走',
      '大江东去浪淘尽\n千古风流人物\n故垒西边\n人道是三国周郎赤壁'
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

  // CHAOS MODE: 30% chance to drop a random poem unrelated to the topic
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
