import prisma from './utils/prisma';

// 品牌数据
const brands = [
  {
    name: '童年色彩',
    company: '上海童年化妆品有限公司',
    creditCode: '91310000MA1K3ABC12',
    isWhitelist: true,
    description: '专注儿童彩妆10年，所有产品通过欧盟CE认证',
  },
  {
    name: '天使之梦',
    company: '广州天使梦化妆品有限公司',
    creditCode: '91440101MA59XYZ34',
    isWhitelist: true,
    description: '国内知名儿童彩妆品牌，以安全温和著称',
  },
  {
    name: '小画家',
    company: '深圳小画家日化有限公司',
    creditCode: '91440300MA5D789PQ',
    isWhitelist: true,
    description: '专注儿童舞台彩妆，配方极简',
  },
  {
    name: '彩虹公主',
    company: '义乌彩虹化妆品厂',
    creditCode: '91330782MA29X1Y2',
    isWhitelist: false,
    description: '平价儿童彩妆品牌',
  },
  {
    name: '梦幻星',
    company: '汕头梦幻星化妆品有限公司',
    creditCode: '91440500MA2LMN567',
    isWhitelist: false,
    description: '网红儿童彩妆品牌',
  },
  {
    name: '问题品牌',
    company: '某地区问题化妆品厂',
    creditCode: '91XXXXXXXXX123456',
    isWhitelist: false,
    description: '曾多次被抽检不合格',
  },
];

// 产品数据
const products = [
  // 童年色彩 - 白名单品牌产品
  {
    name: '童年色彩水润儿童口红-草莓红',
    recordNumber: '粤G妆网备字2024000001',
    category: '口红',
    minAge: 3,
    maxAge: 12,
    isRegistered: true,
    isMinimalFormula: true,
    ingredients: ['蓖麻油', '蜂蜡', '维生素E', '可可脂', '草莓提取物', '氧化铁红'],
    highAllergenIngredients: [],
    safetyScore: 95,
    trustIndex: 9.2,
    specification: '3g',
    shelfLife: '3年',
  },
  {
    name: '童年色彩儿童眼影盘-梦幻粉',
    recordNumber: '粤G妆网备字2024000002',
    category: '眼影',
    minAge: 5,
    maxAge: 14,
    isRegistered: true,
    isMinimalFormula: true,
    ingredients: ['滑石粉', '云母', '玉米淀粉', '维生素E', '洋甘菊提取物', '氧化铁'],
    highAllergenIngredients: [],
    safetyScore: 92,
    trustIndex: 9.0,
    specification: '6色x1g',
    shelfLife: '3年',
  },
  {
    name: '童年色彩儿童腮红-蜜桃粉',
    recordNumber: '粤G妆网备字2024000003',
    category: '腮红',
    minAge: 3,
    maxAge: 12,
    isRegistered: true,
    isMinimalFormula: true,
    ingredients: ['玉米淀粉', '云母', '硬脂酸镁', '维生素E', '金盏花提取物'],
    highAllergenIngredients: [],
    safetyScore: 93,
    trustIndex: 9.1,
    specification: '5g',
    shelfLife: '3年',
  },
  // 天使之梦 - 白名单品牌产品
  {
    name: '天使之梦儿童唇膏-公主粉',
    recordNumber: '粤G妆网备字2024000004',
    category: '口红',
    minAge: 3,
    maxAge: 15,
    isRegistered: true,
    isMinimalFormula: false,
    ingredients: ['橄榄油', '蜂蜡', '乳木果油', '维生素E', '芦荟提取物', '天然色素'],
    highAllergenIngredients: ['香料'],
    safetyScore: 88,
    trustIndex: 8.2,
    specification: '3.5g',
    shelfLife: '3年',
  },
  {
    name: '天使之梦儿童指甲油套装',
    recordNumber: '粤G妆网备字2024000005',
    category: '指甲油',
    minAge: 6,
    maxAge: 16,
    isRegistered: true,
    isMinimalFormula: false,
    ingredients: ['水性聚氨酯', '水性丙烯酸', '维生素E', '天然色素'],
    highAllergenIngredients: [],
    safetyScore: 90,
    trustIndex: 8.5,
    specification: '6色x5ml',
    shelfLife: '2年',
  },
  {
    name: '天使之梦儿童彩妆礼盒套装',
    recordNumber: '粤G妆网备字2024000006',
    category: '套装',
    minAge: 5,
    maxAge: 14,
    isRegistered: true,
    isMinimalFormula: false,
    ingredients: ['多种天然成分'],
    highAllergenIngredients: ['香精', '防腐剂'],
    safetyScore: 82,
    trustIndex: 7.6,
    specification: '12件套',
    shelfLife: '3年',
  },
  // 小画家 - 白名单品牌产品
  {
    name: '小画家儿童舞台粉底',
    recordNumber: '粤G妆网备字2024000007',
    category: '粉底',
    minAge: 6,
    maxAge: 16,
    isRegistered: true,
    isMinimalFormula: true,
    ingredients: ['玉米淀粉', '二氧化钛', '维生素E', '甘油'],
    highAllergenIngredients: [],
    safetyScore: 94,
    trustIndex: 9.3,
    specification: '15g',
    shelfLife: '3年',
  },
  {
    name: '小画家儿童眼线笔',
    recordNumber: '粤G妆网备字2024000008',
    category: '眼线',
    minAge: 8,
    maxAge: 16,
    isRegistered: true,
    isMinimalFormula: true,
    ingredients: ['蜂蜡', '甘油', '氧化铁黑', '维生素E'],
    highAllergenIngredients: [],
    safetyScore: 91,
    trustIndex: 8.9,
    specification: '0.5g',
    shelfLife: '3年',
  },
  // 彩虹公主 - 普通品牌
  {
    name: '彩虹公主儿童口红-西瓜红',
    recordNumber: '粤G妆网备字2024000009',
    category: '口红',
    minAge: 3,
    maxAge: 12,
    isRegistered: true,
    isMinimalFormula: false,
    ingredients: ['矿物油', '石蜡', '香精', '人工色素'],
    highAllergenIngredients: ['矿物油', '香精', '人工色素'],
    safetyScore: 65,
    trustIndex: 5.2,
    specification: '3g',
    shelfLife: '3年',
  },
  {
    name: '彩虹公主儿童眼影',
    recordNumber: '粤G妆网备字2024000010',
    category: '眼影',
    minAge: 5,
    maxAge: 12,
    isRegistered: true,
    isMinimalFormula: false,
    ingredients: ['滑石粉', '香精', '人工色素', '防腐剂'],
    highAllergenIngredients: ['香精', '人工色素', '防腐剂'],
    safetyScore: 58,
    trustIndex: 4.5,
    specification: '8色x1g',
    shelfLife: '3年',
  },
  // 梦幻星 - 普通品牌
  {
    name: '梦幻星儿童亮片眼影',
    recordNumber: '粤G妆网备字2024000011',
    category: '眼影',
    minAge: 6,
    maxAge: 14,
    isRegistered: true,
    isMinimalFormula: false,
    ingredients: ['PET亮片', '胶合剂', '香精', '防腐剂'],
    highAllergenIngredients: ['香精', '防腐剂'],
    safetyScore: 70,
    trustIndex: 5.8,
    specification: '6色x2g',
    shelfLife: '3年',
  },
  {
    name: '梦幻星儿童唇彩套装',
    recordNumber: '粤G妆网备字2024000012',
    category: '唇彩',
    minAge: 5,
    maxAge: 14,
    isRegistered: true,
    isMinimalFormula: false,
    ingredients: ['聚丁烯', '矿物油', '香精', '羊毛脂'],
    highAllergenIngredients: ['矿物油', '香精', '羊毛脂'],
    safetyScore: 62,
    trustIndex: 4.8,
    specification: '4色x3ml',
    shelfLife: '3年',
  },
  // 黑名单产品（未在册或问题产品）
  {
    name: '三无儿童口红套装',
    recordNumber: '无备案号',
    category: '套装',
    minAge: 3,
    maxAge: 12,
    isRegistered: false,
    isMinimalFormula: false,
    ingredients: ['未知成分'],
    highAllergenIngredients: ['香精', '防腐剂', '人工色素', '甲醛释放体'],
    safetyScore: 10,
    trustIndex: 0,
    specification: '8件套',
    shelfLife: '未知',
  },
  {
    name: '问题品牌儿童眼影',
    recordNumber: '粤G妆网备字2024000013',
    category: '眼影',
    minAge: 3,
    maxAge: 12,
    isRegistered: true,
    isMinimalFormula: false,
    ingredients: ['滑石粉', '香精', '人工色素', '对羟基苯甲酸酯'],
    highAllergenIngredients: ['香精', '人工色素', '对羟基苯甲酸酯'],
    safetyScore: 30,
    trustIndex: 0,
    specification: '12色x1g',
    shelfLife: '3年',
  },
  {
    name: '问题品牌儿童指甲油',
    recordNumber: '粤G妆网备字2024000014',
    category: '指甲油',
    minAge: 5,
    maxAge: 12,
    isRegistered: true,
    isMinimalFormula: false,
    ingredients: ['有机溶剂', '甲醛释放体', '人工色素'],
    highAllergenIngredients: ['甲醛释放体', '人工色素'],
    safetyScore: 25,
    trustIndex: 0,
    specification: '6色x5ml',
    shelfLife: '3年',
  },
];

// 示例评价数据
const reviews = [
  {
    productId: 1,
    childAge: 5,
    skinType: 'normal',
    rating: 5,
    content: '颜色很漂亮，孩子很喜欢，用了没有过敏，成分安全，推荐！',
    hasAllergy: false,
    allergySymptoms: null,
    usageDuration: '1个月',
  },
  {
    productId: 1,
    childAge: 4,
    skinType: 'sensitive',
    rating: 5,
    content: '敏感肌宝宝用了完全没问题，颜色自然，成分很安全。',
    hasAllergy: false,
    allergySymptoms: null,
    usageDuration: '2周',
  },
  {
    productId: 1,
    childAge: 6,
    skinType: 'normal',
    rating: 4,
    content: '颜色好看，但是持久度一般，不过安全最重要。',
    hasAllergy: false,
    allergySymptoms: null,
    usageDuration: '3周',
  },
  {
    productId: 2,
    childAge: 7,
    skinType: 'normal',
    rating: 5,
    content: '舞台表演用的，颜色很正，容易上色，卸妆也方便。',
    hasAllergy: false,
    allergySymptoms: null,
    usageDuration: '1个月',
  },
  {
    productId: 2,
    childAge: 8,
    skinType: 'sensitive',
    rating: 5,
    content: '敏感肌用着没问题，颜色很漂亮。',
    hasAllergy: false,
    allergySymptoms: null,
    usageDuration: '2个月',
  },
  {
    productId: 4,
    childAge: 6,
    skinType: 'dry',
    rating: 4,
    content: '挺滋润的，有一点点香味，孩子用了没问题。',
    hasAllergy: false,
    allergySymptoms: null,
    usageDuration: '1个月',
  },
  {
    productId: 4,
    childAge: 5,
    skinType: 'sensitive',
    rating: 3,
    content: '颜色好看，但是有香味，敏感肌有点担心，用了一次没过敏。',
    hasAllergy: false,
    allergySymptoms: null,
    usageDuration: '1周',
  },
  {
    productId: 5,
    childAge: 8,
    skinType: 'normal',
    rating: 5,
    content: '水性指甲油，没有气味，孩子很喜欢，容易撕掉不伤指甲。',
    hasAllergy: false,
    allergySymptoms: null,
    usageDuration: '2个月',
  },
  {
    productId: 7,
    childAge: 10,
    skinType: 'oily',
    rating: 5,
    content: '舞台表演专用，控油效果不错，卸妆也干净。',
    hasAllergy: false,
    allergySymptoms: null,
    usageDuration: '3个月',
  },
  {
    productId: 7,
    childAge: 12,
    skinType: 'normal',
    rating: 5,
    content: '粉质细腻，不容易脱妆，很好用。',
    hasAllergy: false,
    allergySymptoms: null,
    usageDuration: '1个月',
  },
  {
    productId: 9,
    childAge: 4,
    skinType: 'sensitive',
    rating: 2,
    content: '用了之后嘴唇周围发红，有点痒，停用后好了。',
    hasAllergy: true,
    allergySymptoms: ['发红', '瘙痒'],
    usageDuration: '1天',
  },
  {
    productId: 10,
    childAge: 6,
    skinType: 'normal',
    rating: 1,
    content: '孩子用了之后眼部周围红肿，还起了小疹子，非常不好！',
    hasAllergy: true,
    allergySymptoms: ['红肿', '皮疹', '瘙痒'],
    usageDuration: '1次',
  },
  {
    productId: 12,
    childAge: 5,
    skinType: 'normal',
    rating: 2,
    content: '香味太浓了，孩子用了说嘴唇有点痒，不敢再用了。',
    hasAllergy: true,
    allergySymptoms: ['瘙痒'],
    usageDuration: '2天',
  },
  {
    productId: 3,
    childAge: 5,
    skinType: 'normal',
    rating: 5,
    content: '颜色很自然，孩子表演用刚刚好，成分安全放心。',
    hasAllergy: false,
    allergySymptoms: null,
    usageDuration: '2周',
  },
  {
    productId: 8,
    childAge: 10,
    skinType: 'normal',
    rating: 4,
    content: '容易上色，也不晕染，挺好的。',
    hasAllergy: false,
    allergySymptoms: null,
    usageDuration: '1个月',
  },
  {
    productId: 1,
    childAge: 3,
    skinType: 'sensitive',
    rating: 5,
    content: '三岁宝宝用了没问题，成分很安全。',
    hasAllergy: false,
    allergySymptoms: null,
    usageDuration: '1个月',
  },
  {
    productId: 6,
    childAge: 7,
    skinType: 'normal',
    rating: 3,
    content: '套装东西很多，但是香味有点重，孩子用了一次没过敏。',
    hasAllergy: false,
    allergySymptoms: null,
    usageDuration: '1周',
  },
  {
    productId: 11,
    childAge: 9,
    skinType: 'sensitive',
    rating: 2,
    content: '亮片很漂亮，但是用了之后皮肤有点痒，不敢再用了。',
    hasAllergy: true,
    allergySymptoms: ['瘙痒', '轻微红肿'],
    usageDuration: '3天',
  },
  {
    productId: 2,
    childAge: 6,
    skinType: 'dry',
    rating: 4,
    content: '颜色好看，就是有点飞粉，不过成分还是安全的。',
    hasAllergy: false,
    allergySymptoms: null,
    usageDuration: '3周',
  },
  {
    productId: 5,
    childAge: 10,
    skinType: 'normal',
    rating: 5,
    content: '没有刺鼻气味，颜色好看，孩子很喜欢！',
    hasAllergy: false,
    allergySymptoms: null,
    usageDuration: '1个月',
  },
  {
    productId: 7,
    childAge: 11,
    skinType: 'sensitive',
    rating: 5,
    content: '敏感肌的孩子用着很好，没有任何不适。',
    hasAllergy: false,
    allergySymptoms: null,
    usageDuration: '2个月',
  },
  {
    productId: 9,
    childAge: 7,
    skinType: 'normal',
    rating: 1,
    content: '用了之后孩子嘴唇肿了，还很痒，去医院看了说是接触性皮炎！',
    hasAllergy: true,
    allergySymptoms: ['严重红肿', '瘙痒', '皮疹'],
    usageDuration: '1次',
  },
  {
    productId: 3,
    childAge: 4,
    skinType: 'dry',
    rating: 5,
    content: '颜色自然，成分安全，孩子用着很好。',
    hasAllergy: false,
    allergySymptoms: null,
    usageDuration: '1个月',
  },
  {
    productId: 4,
    childAge: 8,
    skinType: 'oily',
    rating: 4,
    content: '挺滋润的，颜色也好看。',
    hasAllergy: false,
    allergySymptoms: null,
    usageDuration: '3周',
  },
  {
    productId: 10,
    childAge: 5,
    skinType: 'sensitive',
    rating: 1,
    content: '用了之后孩子眼睛周围起了好多小疹子，还很痒，太可怕了！',
    hasAllergy: true,
    allergySymptoms: ['大面积皮疹', '严重红肿', '瘙痒'],
    usageDuration: '1次',
  },
];

// 不良反应通报
const adverseReactions = [
  {
    productId: 9,
    title: '关于某品牌儿童口红过敏反应通报',
    description: '多名消费者反映使用该产品后出现嘴唇红肿、瘙痒等过敏症状',
    reportDate: new Date('2024-03-15'),
    source: '国家药监局',
    severity: '严重',
  },
  {
    productId: 10,
    title: '某品牌儿童眼影抽检不合格',
    description: '检出禁用成分超标，可能导致皮肤过敏',
    reportDate: new Date('2024-02-20'),
    source: '广东省药监局',
    severity: '严重',
  },
  {
    productId: 12,
    title: '某品牌儿童唇彩过敏反应通报',
    description: '部分消费者反映使用后出现嘴唇不适',
    reportDate: new Date('2024-04-10'),
    source: '浙江省药监局',
    severity: '一般',
  },
];

// 抽检结果
const inspectionResults = [
  {
    productId: 9,
    inspectionOrg: '广东省药品检验所',
    inspectionDate: new Date('2024-02-01'),
    result: '不合格',
    unqualifiedItems: '检出禁用色素、防腐剂超标',
    source: '广东省药监局',
  },
  {
    productId: 10,
    inspectionOrg: '上海市药品检验所',
    inspectionDate: new Date('2024-01-15'),
    result: '不合格',
    unqualifiedItems: '重金属超标、禁用防腐剂',
    source: '上海市监局',
  },
  {
    productId: 13,
    inspectionOrg: '浙江省药品检验所',
    inspectionDate: new Date('2024-03-20'),
    result: '不合格',
    unqualifiedItems: '无备案、成分不明',
    source: '浙江省药监局',
  },
  {
    productId: 14,
    inspectionOrg: '北京市药品检验所',
    inspectionDate: new Date('2024-03-05'),
    result: '不合格',
    unqualifiedItems: '甲醛释放体超标',
    source: '北京市监局',
  },
  {
    productId: 15,
    inspectionOrg: '江苏省药品检验所',
    inspectionDate: new Date('2024-02-28'),
    result: '不合格',
    unqualifiedItems: '邻苯二甲酸酯超标',
    source: '江苏省药监局',
  },
  {
    productId: 1,
    inspectionOrg: '广东省药品检验所',
    inspectionDate: new Date('2024-04-01'),
    result: '合格',
    unqualifiedItems: null,
    source: '广东省药监局',
  },
  {
    productId: 2,
    inspectionOrg: '上海市药品检验所',
    inspectionDate: new Date('2024-04-02'),
    result: '合格',
    unqualifiedItems: null,
    source: '上海市监局',
  },
  {
    productId: 7,
    inspectionOrg: '浙江省药品检验所',
    inspectionDate: new Date('2024-04-03'),
    result: '合格',
    unqualifiedItems: null,
    source: '浙江省药监局',
  },
];

async function main() {
  console.log('🌱 开始播种数据...');

  // 清空现有数据（注意删除顺序，避免外键约束）
  await prisma.notification.deleteMany({});
  await prisma.productSubscription.deleteMany({});
  await prisma.allergenProfile.deleteMany({});
  await prisma.parent.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.adverseReaction.deleteMany({});
  await prisma.inspectionResult.deleteMany({});
  await prisma.blacklist.deleteMany({});
  await prisma.whitelist.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.brand.deleteMany({});

  console.log('🗑️  已清空现有数据');

  // 创建品牌
  const createdBrands = [];
  for (const brand of brands) {
    const b = await prisma.brand.create({ data: brand });
    createdBrands.push(b);
    console.log(`✅ 已创建品牌: ${b.name}`);
  }

  // 创建白名单
  const whitelistBrands = createdBrands.filter((b) => b.isWhitelist);
  for (const brand of whitelistBrands) {
    await prisma.whitelist.create({
      data: {
        brandId: brand.id,
        reason: `${brand.name}品牌产品配方安全可靠，连续3年无质量问题，抽检全部合格，获得家长一致好评。`,
      },
    });
    console.log(`⭐ 已添加白名单: ${brand.name}`);
  }

  // 创建产品
  const brandMap: Record<string, number> = {};
  createdBrands.forEach((b) => (brandMap[b.name] = b.id));

  const brandProductMap: Record<string, number> = {
    童年色彩: brandMap['童年色彩'],
    天使之梦: brandMap['天使之梦'],
    小画家: brandMap['小画家'],
    彩虹公主: brandMap['彩虹公主'],
    梦幻星: brandMap['梦幻星'],
    问题品牌: brandMap['问题品牌'],
  };

  const createdProducts = [];
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    let brandId: number;
    if (i < 3) brandId = brandProductMap['童年色彩'];
    else if (i < 6) brandId = brandProductMap['天使之梦'];
    else if (i < 8) brandId = brandProductMap['小画家'];
    else if (i < 10) brandId = brandProductMap['彩虹公主'];
    else if (i < 12) brandId = brandProductMap['梦幻星'];
    else if (i === 12) brandId = brandProductMap['问题品牌'];
    else brandId = brandProductMap['问题品牌'];

    const p = await prisma.product.create({
      data: {
        ...product,
        brandId,
        ingredients: JSON.stringify(product.ingredients),
        highAllergenIngredients: JSON.stringify(product.highAllergenIngredients),
      },
    });
    createdProducts.push(p);
    console.log(`💄 已创建产品: ${p.name}`);
  }

  // 创建黑名单
  await prisma.blacklist.create({
    data: {
      type: 'product',
      productId: createdProducts[12].id,
      reason: '该产品无正规备案，成分不明，存在严重安全隐患',
      penaltyDate: new Date('2024-03-20'),
      source: '国家药监局',
    },
  });
  console.log('🚫 已添加黑名单: 三无儿童口红套装');

  await prisma.blacklist.create({
    data: {
      type: 'product',
      productId: createdProducts[13].id,
      reason: '抽检不合格，检出禁用色素和防腐剂超标，已造成多起过敏投诉',
      penaltyDate: new Date('2024-02-25'),
      source: '广东省药监局',
    },
  });
  console.log('🚫 已添加黑名单: 问题品牌儿童眼影');

  await prisma.blacklist.create({
    data: {
      type: 'product',
      productId: createdProducts[14].id,
      reason: '甲醛释放体超标，存在严重安全风险',
      penaltyDate: new Date('2024-03-10'),
      source: '北京市监局',
    },
  });
  console.log('🚫 已添加黑名单: 问题品牌儿童指甲油');

  await prisma.blacklist.create({
    data: {
      type: 'brand',
      brandId: brandMap['问题品牌'],
      reason: '该品牌多款产品抽检不合格，存在严重质量问题',
      penaltyDate: new Date('2024-04-01'),
      source: '国家药监局',
    },
  });
  console.log('🚫 已添加黑名单品牌: 问题品牌');

  // 创建评价 - 使用实际创建的产品ID
  for (const review of reviews) {
    const productIndex = review.productId - 1; // 转换为数组索引
    if (productIndex >= 0 && productIndex < createdProducts.length) {
      await prisma.review.create({
        data: {
          ...review,
          productId: createdProducts[productIndex].id,
          allergySymptoms: review.allergySymptoms ? JSON.stringify(review.allergySymptoms) : null,
        },
      });
    }
  }
  console.log(`📝 已创建 ${reviews.length} 条评价`);

  // 创建不良反应通报 - 使用实际创建的产品ID
  for (const ar of adverseReactions) {
    const productIndex = ar.productId - 1;
    if (productIndex >= 0 && productIndex < createdProducts.length) {
      await prisma.adverseReaction.create({
        data: {
          ...ar,
          productId: createdProducts[productIndex].id,
        },
      });
    }
  }
  console.log(`⚠️  已创建 ${adverseReactions.length} 条不良反应通报`);

  // 创建抽检结果 - 使用实际创建的产品ID
  for (const ir of inspectionResults) {
    const productIndex = ir.productId - 1;
    if (productIndex >= 0 && productIndex < createdProducts.length) {
      await prisma.inspectionResult.create({
        data: {
          ...ir,
          productId: createdProducts[productIndex].id,
        },
      });
    }
  }
  console.log(`🔍 已创建 ${inspectionResults.length} 条抽检记录`);

  // 重新计算所有产品的放心指数
  console.log('🧮 重新计算产品放心指数...');
  for (const product of createdProducts) {
    const productWithRelations = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        brand: {
          include: {
            blacklist: true,
          },
        },
        reviews: true,
        adverseReactions: true,
        inspectionResults: true,
        blacklist: true,
      },
    });

    if (productWithRelations) {
      const { calculateTrustIndex } = await import('./utils/trustIndex');
      const newTrustIndex = calculateTrustIndex({
        product: productWithRelations as any,
      });
      await prisma.product.update({
        where: { id: product.id },
        data: { trustIndex: newTrustIndex },
      });
      console.log(`  ${product.name}: ${newTrustIndex.toFixed(1)}`);
    }
  }

  // 创建家长用户
  const parents = [
    {
      name: '王妈妈',
      phone: '13800000001',
      childName: '小宝',
      childAge: 5,
      skinType: 'sensitive',
    },
    {
      name: '李妈妈',
      phone: '13800000002',
      childName: '贝贝',
      childAge: 7,
      skinType: 'dry',
    },
    {
      name: '张妈妈',
      phone: '13800000003',
      childName: '朵朵',
      childAge: 6,
      skinType: 'oily',
    },
  ];

  const createdParents = [];
  for (const parent of parents) {
    const p = await prisma.parent.create({
      data: parent,
    });
    createdParents.push(p);
  }
  console.log(`👨‍👩‍👧 已创建 ${createdParents.length} 个家长用户`);

  // 创建过敏原档案 - 使用实际创建的家长ID
  const parentId1 = createdParents[0]?.id;
  const parentId2 = createdParents[1]?.id;
  const parentId3 = createdParents[2]?.id;
  const allergenProfiles = [
    {
      parentId: parentId1,
      allergenType: '香精',
      allergenName: '日用香精',
      severity: '严重',
      description: '接触后会出现皮肤红肿、瘙痒',
    },
    {
      parentId: parentId1,
      allergenType: '着色剂',
      allergenName: '胭脂红',
      severity: '中度',
      description: '使用后唇部会出现轻微刺痛',
    },
    {
      parentId: parentId1,
      allergenType: '防腐剂',
      allergenName: '尼泊金酯',
      severity: '轻微',
      description: '长期使用可能导致皮肤干燥',
    },
    {
      parentId: parentId2,
      allergenType: '香精',
      allergenName: '草莓香精',
      severity: '严重',
      description: '严重过敏反应，会出现呼吸困难',
    },
    {
      parentId: parentId2,
      allergenType: '着色剂',
      allergenName: '日落黄',
      severity: '中度',
      description: '使用后皮肤发红',
    },
    {
      parentId: parentId3,
      allergenType: '矿物油',
      allergenName: '液体石蜡',
      severity: '轻微',
      description: '容易导致毛孔堵塞',
    },
  ];

  for (const ap of allergenProfiles) {
    await prisma.allergenProfile.create({
      data: ap,
    });
  }
  console.log(`🌿 已创建 ${allergenProfiles.length} 条过敏原档案`);

  // 创建产品订阅 - 使用实际创建的家长ID和产品ID
  const subscriptions = [
    {
      parentId: parentId1,
      productIndex: 0,
      notifyOnAdverseReaction: true,
      notifyOnInspection: true,
    },
    {
      parentId: parentId1,
      productIndex: 2,
      notifyOnAdverseReaction: true,
      notifyOnInspection: true,
    },
    {
      parentId: parentId1,
      productIndex: 4,
      notifyOnAdverseReaction: true,
      notifyOnInspection: false,
    },
    {
      parentId: parentId2,
      productIndex: 1,
      notifyOnAdverseReaction: true,
      notifyOnInspection: true,
    },
    {
      parentId: parentId2,
      productIndex: 3,
      notifyOnAdverseReaction: true,
      notifyOnInspection: true,
    },
    {
      parentId: parentId3,
      productIndex: 0,
      notifyOnAdverseReaction: true,
      notifyOnInspection: true,
    },
  ];

  const createdSubscriptions: any[] = [];
  for (const sub of subscriptions) {
    if (sub.productIndex >= 0 && sub.productIndex < createdProducts.length && sub.parentId) {
      try {
        const s = await prisma.productSubscription.create({
          data: {
            parentId: sub.parentId,
            productId: createdProducts[sub.productIndex].id,
            notifyOnAdverseReaction: sub.notifyOnAdverseReaction,
            notifyOnInspection: sub.notifyOnInspection,
          },
        });
        createdSubscriptions.push(s);
      } catch (e) {
        // 忽略重复订阅
      }
    }
  }
  console.log(`📩 已创建 ${subscriptions.length} 条产品订阅`);

  // 创建通知 - 针对已有不良反应和抽检结果
  const notifications = [];

  // 为已有不良反应创建通知
  for (let i = 0; i < Math.min(2, adverseReactions.length); i++) {
    const ar = adverseReactions[i];
    const productIndex = ar.productId - 1;
    if (productIndex >= 0 && productIndex < createdProducts.length) {
      // 查找订阅了该产品的家长
      const subs = await prisma.productSubscription.findMany({
        where: {
          productId: createdProducts[productIndex].id,
          isActive: true,
          notifyOnAdverseReaction: true,
        },
      });

      for (const sub of subs) {
        notifications.push({
          parentId: sub.parentId,
          type: 'adverse_reaction',
          title: `⚠️ 订阅产品不良反应通报`,
          content: `您关注的「${createdProducts[productIndex].name}」被通报新的不良反应：${ar.description}`,
          productId: createdProducts[productIndex].id,
          relatedId: i + 1,
        });
      }
    }
  }

  // 为已有抽检不合格创建通知
  for (let i = 0; i < Math.min(2, inspectionResults.length); i++) {
    const ir = inspectionResults[i];
    if (ir.result === '不合格') {
      const productIndex = ir.productId - 1;
      if (productIndex >= 0 && productIndex < createdProducts.length) {
        const subs = await prisma.productSubscription.findMany({
          where: {
            productId: createdProducts[productIndex].id,
            isActive: true,
            notifyOnInspection: true,
          },
        });

        for (const sub of subs) {
          notifications.push({
            parentId: sub.parentId,
            type: 'inspection_failed',
            title: `🚨 订阅产品抽检不合格`,
            content: `您关注的「${createdProducts[productIndex].name}」抽检不合格，不合格项：${ir.unqualifiedItems}`,
            productId: createdProducts[productIndex].id,
            relatedId: i + 1,
          });
        }
      }
    }
  }

  for (const notif of notifications) {
    await prisma.notification.create({
      data: notif,
    });
  }
  console.log(`🔔 已创建 ${notifications.length} 条推送通知`);

  console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🎉 数据播种完成！                                    ║
║                                                          ║
║   📊 数据统计:                                        ║
║      品牌: ${createdBrands.length} 个                                         ║
║      产品: ${createdProducts.length} 个                                        ║
║      白名单品牌: ${whitelistBrands.length} 个                                 ║
║      黑名单: 4 条                                    ║
║      评价: ${reviews.length} 条                                        ║
║      不良反应通报: ${adverseReactions.length} 条                             ║
║      抽检记录: ${inspectionResults.length} 条                                ║
║      家长用户: ${createdParents.length} 个                                      ║
║      过敏原档案: ${allergenProfiles.length} 条                                   ║
║      产品订阅: ${subscriptions.length} 条                                     ║
║      推送通知: ${notifications.length} 条                                     ║
║                                                          ║
║   👤 测试家长账号 (x-parent-id):                         ║
║      1 - 王妈妈 (5岁敏感肌, 对香精/胭脂红过敏)          ║
║      2 - 李妈妈 (7岁干皮, 对草莓香精/日落黄过敏)         ║
║      3 - 张妈妈 (6岁油皮, 对液体石蜡过敏)               ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
  `);
}

main()
  .catch((e) => {
    console.error('❌ 数据播种失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
