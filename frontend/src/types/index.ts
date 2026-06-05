export interface TrustLevel {
  level: string;
  color: string;
  description: string;
}

export interface Brand {
  id: number;
  name: string;
  company: string;
  creditCode: string | null;
  isWhitelist: boolean;
  description: string | null;
  createdAt: string;
}

export interface Product {
  id: number;
  name: string;
  recordNumber: string;
  brandId: number;
  brand: Brand;
  category: string;
  minAge: number;
  maxAge: number;
  isRegistered: boolean;
  isMinimalFormula: boolean;
  ingredients: string[];
  highAllergenIngredients: string[];
  safetyScore: number;
  trustIndex: number;
  specification: string | null;
  shelfLife: string | null;
  createdAt: string;
  updatedAt: string;
  trustLevel: TrustLevel;
  isBlacklisted: boolean;
  reviewCount?: number;
  matchScore?: number;
  rank?: number;
}

export interface ProductDetail extends Product {
  reviews: Review[];
  adverseReactions: AdverseReaction[];
  inspectionResults: InspectionResult[];
  allergyRate: string;
  totalReviews: number;
  allergyReviews: number;
  blacklist: Blacklist | null;
}

export interface Review {
  id: number;
  productId: number;
  product?: Product;
  childAge: number;
  skinType: string;
  rating: number;
  content: string;
  hasAllergy: boolean;
  allergySymptoms: string[];
  usageDuration: string | null;
  createdAt: string;
  needReport?: boolean;
  reportTip?: string;
}

export interface AdverseReaction {
  id: number;
  productId: number;
  title: string;
  description: string;
  reportDate: string;
  source: string;
  severity: string;
  createdAt: string;
}

export interface InspectionResult {
  id: number;
  productId: number;
  inspectionOrg: string;
  inspectionDate: string;
  result: string;
  unqualifiedItems: string | null;
  source: string;
  createdAt: string;
}

export interface WhitelistItem {
  id: number;
  brandId: number;
  brand: Brand & {
    products: Product[];
  };
  reason: string;
  addedAt: string;
  expireAt: string | null;
}

export interface Blacklist {
  id: number;
  type: string;
  brandId: number | null;
  productId: number | null;
  brand: Brand | null;
  product: Product | null;
  reason: string;
  penaltyDate: string;
  source: string;
  isActive: boolean;
  createdAt: string;
}

export interface RecommendParams {
  childAge: number;
  skinType: string;
  category?: string;
  excludeHighAllergen?: boolean;
}

export interface Category {
  name: string;
  count: number;
}

export const SKIN_TYPE_OPTIONS = [
  { value: 'normal', label: '普通肤质' },
  { value: 'dry', label: '干性肤质' },
  { value: 'oily', label: '油性肤质' },
  { value: 'sensitive', label: '敏感肤质' },
];

export const CATEGORY_OPTIONS = [
  { value: '口红', label: '口红/唇膏' },
  { value: '眼影', label: '眼影' },
  { value: '腮红', label: '腮红' },
  { value: '粉底', label: '粉底' },
  { value: '眼线', label: '眼线' },
  { value: '指甲油', label: '指甲油' },
  { value: '唇彩', label: '唇彩' },
  { value: '套装', label: '彩妆套装' },
];

export const ALLERGY_SYMPTOMS = [
  '发红', '瘙痒', '红肿', '皮疹', '水疱', '脱屑',
  '刺痛', '灼热感', '肿胀', '呼吸困难'
];

export const USAGE_DURATION_OPTIONS = [
  { value: '1天', label: '1天以内' },
  { value: '1周', label: '1周以内' },
  { value: '2周', label: '2周以内' },
  { value: '1个月', label: '1个月以内' },
  { value: '3个月', label: '3个月以上' },
];
