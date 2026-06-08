import type { Product, AllergenProfile } from '@prisma/client';

export interface AllergenMatchResult {
  hasAllergen: boolean;
  matchedAllergens: Array<{
    allergenName: string;
    allergenType: string;
    severity: string;
    foundIn: string[];
  }>;
}

const ALLERGEN_TYPE_KEYWORDS: Record<string, string[]> = {
  '香精': ['香精', '香料', '香水', '香精香料', '天然香精', '人工香精', '食用香精'],
  '着色剂': ['色素', '着色剂', '染料', '色淀', '氧化铁', '人工色素', '天然色素', '炭黑', '二氧化钛'],
  '防腐剂': ['防腐剂', '对羟基苯甲酸酯', '甲醛释放体', '异噻唑啉酮', '苯氧乙醇', '苯甲酸', '山梨酸', '丙酸钠'],
  '酒精': ['酒精', '乙醇', '异丙醇'],
  '矿物油': ['矿物油', '石蜡', '凡士林', '液体石蜡'],
  '羊毛脂': ['羊毛脂', '羊毛脂醇', '乙酰化羊毛脂'],
  '棕榈酸': ['棕榈酸', '棕榈酸酯', '棕榈酸异丙酯'],
  '硬脂酸': ['硬脂酸', '硬脂酸酯', '硬脂酸甘油酯'],
  '其他': [],
};

export function checkProductAllergens(
  product: Product,
  allergenProfiles: AllergenProfile[]
): AllergenMatchResult {
  const result: AllergenMatchResult = {
    hasAllergen: false,
    matchedAllergens: [],
  };

  if (allergenProfiles.length === 0) {
    return result;
  }

  const productIngredients = JSON.parse(product.ingredients || '[]') as string[];
  const productHighAllergens = JSON.parse(product.highAllergenIngredients || '[]') as string[];
  const allProductIngredients = [...productIngredients, ...productHighAllergens];

  for (const profile of allergenProfiles) {
    const keywords = getAllergenKeywords(profile.allergenType, profile.allergenName);
    const foundIn: string[] = [];

    for (const ingredient of allProductIngredients) {
      for (const keyword of keywords) {
        if (ingredient.includes(keyword) || keyword.includes(ingredient)) {
          if (!foundIn.includes(ingredient)) {
            foundIn.push(ingredient);
          }
        }
      }
    }

    if (foundIn.length > 0) {
      result.hasAllergen = true;
      result.matchedAllergens.push({
        allergenName: profile.allergenName,
        allergenType: profile.allergenType,
        severity: profile.severity,
        foundIn,
      });
    }
  }

  return result;
}

function getAllergenKeywords(allergenType: string, allergenName: string): string[] {
  const typeKeywords = ALLERGEN_TYPE_KEYWORDS[allergenType] || [];
  const nameKeywords = [allergenName];
  
  if (allergenName.length <= 2) {
    nameKeywords.push(allergenName);
  } else {
    for (let i = 0; i < allergenName.length - 1; i++) {
      nameKeywords.push(allergenName.substring(i, i + 2));
    }
  }
  
  return [...typeKeywords, ...nameKeywords];
}

export function filterProductsByAllergens<T extends Product>(
  products: T[],
  allergenProfiles: AllergenProfile[],
  excludeMode: boolean = true
): Array<{ product: T; allergenInfo: AllergenMatchResult }> {
  return products
    .map(product => ({
      product,
      allergenInfo: checkProductAllergens(product, allergenProfiles),
    }))
    .filter(item => !excludeMode || !item.allergenInfo.hasAllergen);
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case '严重':
      return '#ff4d4f';
    case '中度':
      return '#fa8c16';
    case '轻微':
      return '#faad14';
    default:
      return '#8c8c8c';
  }
}

export const ALLERGEN_TYPE_OPTIONS = [
  { value: '香精', label: '香精类' },
  { value: '着色剂', label: '着色剂/色素' },
  { value: '防腐剂', label: '防腐剂' },
  { value: '酒精', label: '酒精类' },
  { value: '矿物油', label: '矿物油类' },
  { value: '羊毛脂', label: '羊毛脂类' },
  { value: '棕榈酸', label: '棕榈酸类' },
  { value: '硬脂酸', label: '硬脂酸类' },
  { value: '其他', label: '其他' },
];

export const SEVERITY_OPTIONS = [
  { value: '轻微', label: '轻微' },
  { value: '中度', label: '中度' },
  { value: '严重', label: '严重' },
];
