import axios from 'axios';
import type {
  Product,
  ProductDetail,
  Review,
  WhitelistItem,
  Blacklist,
  RecommendParams,
  Category,
} from '../types';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// 产品相关接口
export const searchProducts = (keyword: string, category?: string) => {
  return api.get<{
    success: boolean;
    data: Product[];
    total: number;
  }>('/products/search', {
    params: { keyword, category },
  });
};

export const getProductDetail = (id: number) => {
  return api.get<{
    success: boolean;
    data: ProductDetail;
  }>(`/products/${id}`);
};

export const getCategories = () => {
  return api.get<{
    success: boolean;
    data: Category[];
  }>('/products/categories');
};

// 榜单相关接口
export const getWhitelist = () => {
  return api.get<{
    success: boolean;
    data: WhitelistItem[];
  }>('/lists/whitelist');
};

export const getBlacklist = () => {
  return api.get<{
    success: boolean;
    data: Blacklist[];
  }>('/lists/blacklist');
};

export const getTrustRank = (category?: string, limit?: number) => {
  return api.get<{
    success: boolean;
    data: Product[];
  }>('/lists/trust-rank', {
    params: { category, limit },
  });
};

// 推荐相关接口
export const getRecommendations = (params: RecommendParams) => {
  return api.get<{
    success: boolean;
    data: Product[];
    params: RecommendParams;
  }>('/products/recommend', { params });
};

// 评价相关接口
export const createReview = (data: {
  productId: number;
  childAge: number;
  skinType: string;
  rating: number;
  content: string;
  hasAllergy: boolean;
  allergySymptoms?: string[];
  usageDuration?: string;
}) => {
  return api.post<{
    success: boolean;
    data: Review;
  }>('/reviews', data);
};

export const getMyReviews = () => {
  return api.get<{
    success: boolean;
    data: Review[];
  }>('/reviews/my');
};

export const getProductReviews = (productId: number) => {
  return api.get<{
    success: boolean;
    data: Review[];
    stats: {
      totalReviews: number;
      avgRating: string;
      allergyCount: number;
      allergyRate: string;
    };
  }>(`/products/${productId}/reviews`);
};

export default api;
