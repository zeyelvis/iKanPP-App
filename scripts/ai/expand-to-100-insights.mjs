#!/usr/bin/env node

/**
 * iKanPP 全站 AI 深度资产扩容中枢 (100 Top-Tier AI Insights Generator)
 * 
 * 借助本地 codex-proxy (gpt-5.6-sol) 顶级算力，采用 3 并发流水线，
 * 为全站最高权重 100 部顶流影视（动漫神作、院线大片、热播剧集、王牌综艺）
 * 批量生成 7 大维度独家资产：
 * 1. 独家悬念金句 (hook)
 * 2. 300~400字独家深度剧情剖析 (uniqueSynopsis)
 * 3. 3大剧情高光核心看点 (highlights)
 * 4. 主演演技与角色博弈点评 (characterAnalysis)
 * 5. 适宜受众画像 (audienceFit)
 * 6. Google FAQPage 结构化问答胶囊 (faqs)
 * 7. 港台公映规范译名 (taiwanTitle / hongkongTitle)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

// 加载 .env.local
const envLocalPath = path.join(projectRoot, '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...vals] = trimmed.split('=');
    if (key && vals.length > 0 && !process.env[key.trim()]) {
      process.env[key.trim()] = vals.join('=').trim().replace(/^["']|["']$/g, '');
    }
  }
}

import { generateAiComprehensiveInsights } from '../../lib/services/ai-seo.js';
import { PREBAKED_AI_INSIGHTS } from '../../lib/data/prebaked-ai-insights.ts';

const AI_MODEL = process.env.AI_MODEL || 'gpt-5.6-sol';
const CONCURRENCY = 3;

// 精选补充的 64 部高权重顶流影视片单
const EXPANSION_TITLES = [
  // 经典动漫与硬核国漫 (15)
  { title: '海贼王', type: 'tv', year: '1999', genres: ['热血', '冒险', '动漫'], overview: '少年蒙奇·D·路飞为了成为海贼王，招募伙伴在大海中航行冒险，探寻传奇怪宝One Piece。' },
  { title: '名侦探柯南', type: 'tv', year: '1996', genres: ['推理', '悬疑', '动漫'], overview: '高中生侦探工藤新一身体变小化名柯南，寄宿在毛利兰家暗中侦破奇案追查黑衣组织。' },
  { title: '仙逆', type: 'tv', year: '2023', genres: ['玄幻', '修真', '国漫'], overview: '凡人少年王林因偶得天逆珠踏上修仙路，以坚毅心性逆境争渡，踏上一条杀伐果断的修魔修神之路。' },
  { title: '斗破苍穹年番', type: 'tv', year: '2022', genres: ['玄幻', '热血', '国漫'], overview: '天才少年萧炎沦为废柴后遭退婚，在药老指引下修炼焚诀吞噬异火，重回强者之巅。' },
  { title: '凡人修仙传', type: 'tv', year: '2020', genres: ['仙侠', '奇幻', '国漫'], overview: '山村穷小子韩立机缘巧合加入小门派，凭谨小慎微与神秘小绿瓶在残酷修仙界步步为营成仙。' },
  { title: '完美世界', type: 'tv', year: '2021', genres: ['玄幻', '动作', '国漫'], overview: '一粒尘可填海，一根草斩尽日月星辰，少年石昊在大荒中崛起，独断万古的无上史诗。' },
  { title: '吞噬星空', type: 'tv', year: '2020', genres: ['科幻', '机甲', '国漫'], overview: '地球遭遇大灾变，高中生罗峰克服重重艰难险阻成为武者，冲出地球踏入宇宙星空的宏大冒险。' },
  { title: '遮天', type: 'tv', year: '2023', genres: ['玄幻', '奇幻', '国漫'], overview: '冰冷枯寂的宇宙深处九龙拉棺降临泰山，叶凡等同学被带入浩瀚洪荒修仙大世，踏上登仙争帝路。' },
  { title: '斗罗大陆', type: 'tv', year: '2018', genres: ['玄幻', '冒险', '国漫'], overview: '唐门外门弟子唐三穿越斗罗大陆，觉醒双生武魂，带领史莱克七怪问鼎魂师巅峰并继承神位。' },
  { title: '鬼灭之刃', type: 'tv', year: '2019', genres: ['热血', '奇幻', '动漫'], overview: '少年炭治郎为了拯救变成鬼的妹妹祢豆子并为家人报仇，加入鬼杀队与恶鬼展开殊死搏杀。' },
  { title: '咒术回战', type: 'tv', year: '2020', genres: ['热血', '动作', '动漫'], overview: '虎杖悠仁吞下特级咒物两面宿傩的手指，踏入东京都立咒术高专，与伙伴们对抗诅咒保护人类。' },
  { title: '间谍过家家', type: 'tv', year: '2022', genres: ['喜剧', '日常', '动漫'], overview: '顶尖间谍黄昏为了任务组建临时家庭，妻子是职业杀手，女儿拥有读心术，展开温馨爆笑日常。' },
  { title: '火影忍者', type: 'tv', year: '2002', genres: ['热血', '励志', '动漫'], overview: '体内封印着九尾妖狐的孤儿漩涡鸣人，以成为火影为梦想，在忍者世界中用坚韧与友情感染众人。' },
  { title: '进击的巨人', type: 'tv', year: '2013', genres: ['热血', '悬疑', '动漫'], overview: '人类生活在三道巨墙之内，艾伦·耶格尔誓要驱逐所有巨人，却在墙外残酷真相中走向命运深渊。' },
  { title: '剑来', type: 'tv', year: '2024', genres: ['玄幻', '武侠', '国漫'], overview: '骊珠洞天草鞋少年陈平安，身负坚韧赤子之心，以微末凡躯手持长剑走出属于自己的浩然大道。' },

  // 现象级热播剧集 (20)
  { title: '长相思', type: 'tv', year: '2023', genres: ['古装', '神话', '爱情'], overview: '流落大荒的高辛王姬玖瑶化身玟小六，与玱玹、涂山璟、相柳等多方男主展开纠葛一生的虐恋传奇。' },
  { title: '苍兰诀', type: 'tv', year: '2022', genres: ['古装', '仙侠', '爱情'], overview: '息山神女小兰花无意间复活月尊东方青苍，因同心咒被迫绑在一起，在仙魔两界的宿命博弈中动了真情。' },
  { title: '与凤行', type: 'tv', year: '2024', genres: ['古装', '神话', '爱情'], overview: '灵界碧苍王沈璃逃婚坠落人间变回凤凰原型，与世间最后一位上古真神行止相知相恋，共担三界安危。' },
  { title: '墨雨云间', type: 'tv', year: '2024', genres: ['古装', '复仇', '爽剧'], overview: '县令之女薛芳菲遭夫家陷害活埋后幸存，顶替中书令之女姜梨身份重回京城，步步为营展开绝地复仇。' },
  { title: '庆余年', type: 'tv', year: '2019', genres: ['古装', '权谋', '穿越'], overview: '身世神秘的少年范闲自海边小城初入京都，历经家族、江湖与朝堂的多重考验，揭开惊天母辈秘密。' },
  { title: '一念关山', type: 'tv', year: '2023', genres: ['古装', '武侠', '公路'], overview: '安国朱衣卫前左使任如意与梧国六道堂堂主宁远舟狭路相逢，结成迎帝小队并肩作战，经历生死考验。' },
  { title: '周生如故', type: 'tv', year: '2021', genres: ['古装', '权谋', '虐恋'], overview: '战功赫赫的小南辰王周生辰与未来太子妃崔时宜发乎情止乎礼，在家族责任与家国大义中走向悲壮宿命。' },
  { title: '大奉打更人', type: 'tv', year: '2024', genres: ['古装', '探案', '奇幻'], overview: '现代警校生许七安穿越大奉王朝，运用现代刑侦与推理知识屡破奇案，成为威震天下的打更人传奇。' },
  { title: '雪中悍刀行', type: 'tv', year: '2021', genres: ['武侠', '玄幻', '古装'], overview: '北椋世子徐凤年历经江湖风霜磨砺，从纨绔子弟蜕变为肩负天下苍生重任的北椋王，执刀入江湖。' },
  { title: '琅琊榜', type: 'tv', year: '2015', genres: ['古装', '权谋', '复仇'], overview: '江左盟宗主梅长苏以病弱之躯重回金陵，在帝王心术与党争波谲中翻云覆雨，昭雪十二年前赤焰冤案。' },
  { title: '甄嬛传', type: 'tv', year: '2011', genres: ['古装', '宫斗', '清装'], overview: '少女甄嬛入宫历经恩宠与冷遇，在后宫残酷倾轧与权力阴谋中步步算计，最终成为一代钮祜禄氏皇太后。' },
  { title: '知否知否应是绿肥红瘦', type: 'tv', year: '2018', genres: ['古装', '家庭', '宅斗'], overview: '盛家庶女盛明兰自幼聪颖却藏巧守拙，在主母刁难与姐妹嫉妒中自立自强，与顾廷烨携手撑起家族荣耀。' },
  { title: '觉醒年代', type: 'tv', year: '2021', genres: ['历史', '剧情', '革命'], overview: '从新文化运动到中国共产党建立，李大钊、陈独秀、胡适等知识分子在救亡图存路上的理想与热血追寻。' },
  { title: '山海情', type: 'tv', year: '2021', genres: ['现实', '剧情', '扶贫'], overview: '宁夏西海固贫困群众在国家扶贫政策支持下，克服漫天风沙与艰苦环境移民吊庄，把干沙滩变成金沙滩。' },
  { title: '猎罪图鉴', type: 'tv', year: '2022', genres: ['悬疑', '刑侦', '艺术'], overview: '天才模拟画像师沈翊与刑警队长杜城因旧案结下心结，因缘巧合搭档用画笔屡破深渊命案。' },
  { title: '尘封十三载', type: 'tv', year: '2023', genres: ['悬疑', '刑侦', '犯罪'], overview: '跨越十三年的连环杀人案再次出现，老刑警卫峥嵘与新人陆行知师徒再度联手，追捕隐匿多年的恶魔凶手。' },
  { title: '警察荣誉', type: 'tv', year: '2022', genres: ['现实', '剧情', '警匪'], overview: '四个性格迥异的见习警员来到八里河派出所，在经验丰富的老警察带领下经历烟火市井的磨砺成长。' },
  { title: '少年歌行', type: 'tv', year: '2022', genres: ['古装', '武侠', '热血'], overview: '初入江湖的热血少年雷无桀前往雪月城，偶遇神秘雪落山庄老板萧瑟，一同踏入波澜壮阔的少年江湖。' },
  { title: '梦华录', type: 'tv', year: '2022', genres: ['古装', '爱情', '励志'], overview: '赵盼儿、孙三娘、宋引章三位女子历经感情背叛与风霜，在繁华汴京携手经营茶楼自立更生的励志故事。' },
  { title: '边水往事', type: 'tv', year: '2024', genres: ['犯罪', '悬疑', '冒险'], overview: '打工青年沈星意外流落充满边境犯罪与三边坡异域黑道的险恶地带，在猜叔庇护下艰难求生的惊险经历。' },

  // 爆款院线大片与影史神作 (18)
  { title: '哪吒之魔童降世', type: 'movie', year: '2019', genres: ['动画', '神话', '奇幻'], overview: '天地灵气孕育出一颗混元珠，哪吒阴差阳错成为魔丸转世，面对世俗成见喊出我命由我不由天的逆天宣言。' },
  { title: '第二十条', type: 'movie', year: '2024', genres: ['现实', '喜剧', '法治'], overview: '检察官韩明在挂职期间遭遇多起正当防卫与故意伤害界定难题，在法理与人情间坚持捍卫法律的良知底线。' },
  { title: '飞驰人生2', type: 'movie', year: '2024', genres: ['喜剧', '赛车', '励志'], overview: '落魄老车手张驰重组草台班子，克服身体伤痛与资金匮乏，带领年轻队员再度奔赴最后一届巴音布鲁克拉力赛。' },
  { title: '热辣滚烫', type: 'movie', year: '2024', genres: ['喜剧', '剧情', '励志'], overview: '脱离社会多年的宅女乐莹在经历接连背叛后结识拳击教练，下定决心通过刻苦训练走上拳击擂台战胜自我。' },
  { title: '封神第一部：朝歌风云', type: 'movie', year: '2023', genres: ['神话', '动作', '奇幻'], overview: '商王殷寿与狐妖妲己勾结残害忠良，西伯侯之子姬发从盲信殷寿到看清暴虐本相，觉醒反戈逃归西岐。' },
  { title: '孤注一掷', type: 'movie', year: '2023', genres: ['犯罪', '现实', '剧情'], overview: '程序员潘生与模特安娜被海外高薪诱骗落入境外诈骗工厂，以血淋淋的案例揭开网络赌博诈骗黑产内幕。' },
  { title: '消失的她', type: 'movie', year: '2023', genres: ['悬疑', '犯罪', '剧情'], overview: '何非的妻子在海外度假时离奇失踪，一位陌生女子假冒妻子现身，金牌女律师介入调查揭开惊天反转阴谋。' },
  { title: '满江红', type: 'movie', year: '2023', genres: ['悬疑', '历史', '喜剧'], overview: '南宋绍兴年间岳飞死后四年，秦桧率兵与金国会谈，金国使者被杀，小兵张大与亲军副统领孙均被卷入阴谋局中局。' },
  { title: '无名', type: 'movie', year: '2023', genres: ['谍战', '剧情', '悬疑'], overview: '全面抗战爆发后，中共地下特工何先生与叶先生潜伏在上海汪伪政权情报系统内部，在暗流涌动中舍生博弈。' },
  { title: '深海', type: 'movie', year: '2023', genres: ['动画', '奇幻', '治愈'], overview: '患有抑郁症的少女参宿意外坠海，进入瑰丽绚烂的深海大饭店，与船长南河展开一场探寻生命之光的心灵救赎。' },
  { title: '保你平安', type: 'movie', year: '2023', genres: ['喜剧', '现实', '剧情'], overview: '中年墓地销售魏平安为了洗清客户韩露的造谣污名，不惜千里奔波查清真相，用执着诠释人间自有真情在。' },
  { title: '三大队', type: 'movie', year: '2023', genres: ['犯罪', '悬疑', '刑侦'], overview: '奸杀大案嫌犯在审讯中意外死亡导致刑警三大队全员入狱，出狱后队长程兵历经十二年天涯追凶不改初心。' },
  { title: '让子弹飞', type: 'movie', year: '2010', genres: ['喜剧', '动作', '经典'], overview: '悍匪张麻子假冒马邦德上任鹅城县长，与盘踞鹅城的恶霸黄四郎斗智斗勇，上演一场惊心动魄的快意恩仇。' },
  { title: '肖申克的救赎', type: 'movie', year: '1994', genres: ['剧情', '经典', '励志'], overview: '年轻银行家安迪蒙冤入狱，在绝望残酷的肖申克监狱中暗中耗费十九年凿出隧道，成功越狱重获自由。' },
  { title: '星际穿越', type: 'movie', year: '2014', genres: ['科幻', '剧情', '冒险'], overview: '地球环境极度恶化，前宇航员库珀告别儿女穿过虫洞前往外太空寻找人类宜居新家园的硬科幻温情史诗。' },
  { title: '盗梦空间', type: 'movie', year: '2010', genres: ['科幻', '悬疑', '动作'], overview: '盗梦者柯布擅长潜入他人梦境窃取潜意识机密，为了回到孩子身边接下在目标潜意识中植入想法的危险任务。' },
  { title: '绿皮书', type: 'movie', year: '2018', genres: ['剧情', '喜剧', '传记'], overview: '白人保镖托尼受雇护送著名黑人钢琴家唐·雪利前往种族歧视严重的美国南方巡演，在旅途中建立深厚跨种族友谊。' },
  { title: '泰坦尼克号', type: 'movie', year: '1997', genres: ['爱情', '灾难', '经典'], overview: '穷画家杰克与贵族少女罗丝在豪华邮轮泰坦尼克号上相识相爱，在冰山撞击的浩劫面前见证至死不渝的绝美爱恋。' },

  // 王牌综艺与神级纪录片 (11)
  { title: '歌手2024', type: 'tv', year: '2024', genres: ['音乐', '真人秀', '综艺'], overview: '华语乐坛顶级唱将与欧美实力巨星同台不修音全程直播竞演，掀起全民音乐狂欢与破圈讨论。' },
  { title: '奔跑吧', type: 'tv', year: '2014', genres: ['游戏', '真人秀', '综艺'], overview: '跑男兄弟团与明星嘉宾在祖国大江南北开展趣味游戏挑战与经典撕名牌较量，传递快乐与正能量。' },
  { title: '极限挑战', type: 'tv', year: '2015', genres: ['真人秀', '游戏', '综艺'], overview: '极限男人帮在没有任何既定剧本的规则博弈中各展智谋，与市井百姓互动展开笑料频出的极限挑战。' },
  { title: '乘风破浪的姐姐', type: 'tv', year: '2020', genres: ['音乐', '真人秀', '综艺'], overview: '三十位三十岁以上的成熟女艺人同台竞技唱跳，打破年龄界限，勇敢追梦展现无畏女性力量。' },
  { title: '大侦探', type: 'tv', year: '2016', genres: ['悬疑', '推理', '综艺'], overview: '明星玩家化身嫌疑人与侦探，在沉浸式实景案发现场搜寻证据、严谨推理，揪出隐藏真凶的高能推理秀。' },
  { title: '中国新说唱', type: 'tv', year: '2018', genres: ['音乐', '选秀', '综艺'], overview: '聚集全华语地区最具实力的说唱音乐人，通过硬核对决展现中国青年潮流文化与说唱态度。' },
  { title: '种地吧', type: 'tv', year: '2023', genres: ['真人秀', '农耕', '励志'], overview: '十位年轻艺人组成后天十子，在一百四十二天里亲力亲为翻地、播种、收割，体会粮食来之不易的劳作之美。' },
  { title: '如果国宝会说话', type: 'tv', year: '2018', genres: ['纪录片', '历史', '文化'], overview: '每集五分钟以生动网感的短视频形态讲述一件顶级国家文物背后的沧桑身世与中华文明底蕴。' },
  { title: '航拍中国', type: 'tv', year: '2017', genres: ['纪录片', '自然', '地理'], overview: '全景俯瞰祖国三十四个省市自治区的壮美山河与人文奇迹，展现大美中国的绝美画卷。' },
  { title: '舌尖上的中国', type: 'tv', year: '2012', genres: ['纪录片', '美食', '人文'], overview: '跨越中国东西南北，记录普通人在平凡烟火中传承的美食滋味与对家乡风土的深厚眷恋。' },
  { title: '地球脉动', type: 'tv', year: '2006', genres: ['纪录片', '自然', 'BBC'], overview: 'BBC倾力打造的自然奇迹纪录片，展现地球各处极地、高山、平原与深海生灵震撼人心的生命壮歌。' },
];

async function runExpansion() {
  console.log('========================================================');
  console.log('🚀 iKanPP 100部顶流影视 AI 深度资产扩容中枢启动');
  console.log(`⏰ 时间: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`);
  console.log(`🧠 模型: ${AI_MODEL} | 🚀 并发度: ${CONCURRENCY}`);
  console.log(`📋 待扩容片单: ${EXPANSION_TITLES.length} 部经典顶流`);
  console.log('========================================================\n');

  const currentDataset = { ...PREBAKED_AI_INSIGHTS };
  const initialCount = Object.keys(currentDataset).length;
  console.log(`📦 当前已预置资产: ${initialCount} 部`);

  // 过滤出未生成的条目
  const pendingQueue = EXPANSION_TITLES.filter(item => {
    const existing = currentDataset[item.title];
    return !(existing && existing.hook && existing.uniqueSynopsis && existing.faqs?.length >= 3);
  });

  console.log(`⚡ 需要生成的条目: ${pendingQueue.length} 部\n`);

  if (pendingQueue.length === 0) {
    console.log('🎉 所有目标片单均已具备完整 AI 资产，无需重复生成！');
    return;
  }

  let completedCount = 0;
  const totalToGenerate = pendingQueue.length;

  // 按并发度分批执行
  for (let i = 0; i < pendingQueue.length; i += CONCURRENCY) {
    const batch = pendingQueue.slice(i, i + CONCURRENCY);
    const batchStart = Date.now();
    const batchTitles = batch.map(b => `《${b.title}》`).join('、');

    console.log(`\n⏳ [批次 ${Math.floor(i / CONCURRENCY) + 1}/${Math.ceil(pendingQueue.length / CONCURRENCY)}] 正在并发提炼: ${batchTitles}...`);

    const results = await Promise.allSettled(
      batch.map(async item => {
        const insight = await generateAiComprehensiveInsights({
          title: item.title,
          type: item.type,
          year: item.year,
          overview: item.overview,
          genres: item.genres,
          model: AI_MODEL,
        });

        const aiContent = {
          hook: insight.hook,
          uniqueSynopsis: insight.uniqueSynopsis,
          highlights: insight.highlights,
          characterAnalysis: insight.characterAnalysis,
          audienceFit: insight.audienceFit,
          faqs: insight.faqs,
          taiwanTitle: insight.taiwanTitle,
          hongkongTitle: insight.hongkongTitle,
          traditionalMetaDescription: `【4K線上看】《${item.title}》完整版高清免翻牆極速播放。iKanPP 全球 Anycast CDN 直連，零廣告零緩衝，即刻享受極致影音！`,
          traditionalKeywords: [item.title, `${item.title} 線上看`, `${item.title} 4K`],
          generatedAt: new Date().toISOString(),
        };

        return { title: item.title, aiContent };
      })
    );

    let batchSuccess = 0;
    for (let rIdx = 0; rIdx < results.length; rIdx++) {
      const res = results[rIdx];
      const item = batch[rIdx];
      if (res.status === 'fulfilled') {
        const { title, aiContent } = res.value;
        currentDataset[title] = aiContent;
        completedCount++;
        batchSuccess++;
        console.log(`   ✅ 《${title}》Hook: "${aiContent.hook}" (台: ${aiContent.taiwanTitle} | 港: ${aiContent.hongkongTitle})`);
      } else {
        console.error(`   ❌ 《${item.title}》失败:`, res.reason?.message || res.reason);
      }
    }

    const batchDuration = ((Date.now() - batchStart) / 1000).toFixed(1);
    console.log(`🏁 批次完成，耗时 ${batchDuration}s，累计成功: ${completedCount}/${totalToGenerate}`);

    // 每批次执行后安全持久化一次，确保零数据丢失
    saveDatasetToFile(currentDataset);
  }

  // 最终保存
  saveDatasetToFile(currentDataset);

  const finalCount = Object.keys(currentDataset).length;
  console.log('\n========================================================');
  console.log('🎉 100部顶流影视 AI 深度资产扩容圆满完成！');
  console.log(`📊 资产总规模: 从 ${initialCount} 部扩容至 ${finalCount} 部影视`);
  console.log(`📁 存储路径: lib/data/prebaked-ai-insights.ts`);
  console.log('========================================================');
}

function saveDatasetToFile(dataset) {
  const targetFile = path.join(projectRoot, 'lib/data/prebaked-ai-insights.ts');
  const fileHeader = `/**
 * 全站影视 AI 深度资产预烘焙数据集 (Prebaked AI Insights)
 * 自动生成于: ${new Date().toISOString()}
 * 
 * 0ms 纯内存直出，杜绝 SSR 网络卡顿，消灭 Thin Content，拉满 Google 搜索排名！
 */

import { TitleAiContent } from '@/lib/types/entity';

export const PREBAKED_AI_INSIGHTS: Record<string, TitleAiContent> = ${JSON.stringify(dataset, null, 2)};

/**
 * 0ms 纯内存提取指定影视的预烘焙 AI 资产
 */
export function getPrebakedAiInsight(key: {
  title?: string;
  entityId?: string;
  slug?: string;
}): TitleAiContent | null {
  if (!key) return null;
  if (key.title && PREBAKED_AI_INSIGHTS[key.title]) {
    return PREBAKED_AI_INSIGHTS[key.title];
  }
  if (key.entityId && PREBAKED_AI_INSIGHTS[key.entityId]) {
    return PREBAKED_AI_INSIGHTS[key.entityId];
  }
  if (key.slug && PREBAKED_AI_INSIGHTS[key.slug]) {
    return PREBAKED_AI_INSIGHTS[key.slug];
  }
  return null;
}
`;

  fs.writeFileSync(targetFile, fileHeader, 'utf8');
}

runExpansion().catch(err => {
  console.error('💥 扩容脚本异常中断:', err);
  process.exit(1);
});
