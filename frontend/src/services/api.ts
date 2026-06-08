import axios from "axios";
import type {
  Product,
  ProductDetail,
  Review,
  WhitelistItem,
  Blacklist,
  RecommendParams,
  Category,
  Parent,
  AllergenProfile,
  ProductSubscription,
  Notification,
} from "../types";

const api = axios.create({
  baseURL: "/api",
  timeout: 10000,
});

// 产品相关接口
export const searchProducts = (keyword: string, category?: string) => {
  return api.get<{
    success: boolean;
    data: Product[];
    total: number;
  }>("/products/search", {
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
  }>("/products/categories");
};

// 榜单相关接口
export const getWhitelist = () => {
  return api.get<{
    success: boolean;
    data: WhitelistItem[];
  }>("/lists/whitelist");
};

export const getBlacklist = () => {
  return api.get<{
    success: boolean;
    data: Blacklist[];
  }>("/lists/blacklist");
};

export const getTrustRank = (category?: string, limit?: number) => {
  return api.get<{
    success: boolean;
    data: Product[];
  }>("/lists/trust-rank", {
    params: { category, limit },
  });
};

// 推荐相关接口
export const getRecommendations = (params: RecommendParams) => {
  return api.get<{
    success: boolean;
    data: Product[];
    params: RecommendParams;
  }>("/products/recommend", { params });
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
  }>("/reviews", data);
};

export const getMyReviews = () => {
  return api.get<{
    success: boolean;
    data: Review[];
  }>("/reviews/my");
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

export const getCurrentParent = () => {
  return api.get<{
    success: boolean;
    data: Parent;
  }>("/parent/me");
};

export const updateParent = (data: {
  name?: string;
  childName?: string;
  childAge?: number;
  skinType?: string;
}) => {
  return api.put<{
    success: boolean;
    data: Parent;
  }>("/parent/me", data);
};

export const getAllergenProfiles = () => {
  return api.get<{
    success: boolean;
    data: AllergenProfile[];
  }>("/parent/allergen-profiles");
};

export const addAllergenProfile = (data: {
  allergenType: string;
  allergenName: string;
  severity: string;
  description?: string;
}) => {
  return api.post<{
    success: boolean;
    data: AllergenProfile;
  }>("/parent/allergen-profiles", data);
};

export const updateAllergenProfile = (
  id: number,
  data: {
    allergenType?: string;
    allergenName?: string;
    severity?: string;
    description?: string;
  },
) => {
  return api.put<{
    success: boolean;
    data: AllergenProfile;
  }>(`/parent/allergen-profiles/${id}`, data);
};

export const deleteAllergenProfile = (id: number) => {
  return api.delete<{
    success: boolean;
    message: string;
  }>(`/parent/allergen-profiles/${id}`);
};

export const getSubscriptions = () => {
  return api.get<{
    success: boolean;
    data: ProductSubscription[];
  }>("/parent/subscriptions");
};

export const addSubscription = (data: {
  productId: number;
  notifyOnAdverseReaction?: boolean;
  notifyOnInspection?: boolean;
}) => {
  return api.post<{
    success: boolean;
    data: ProductSubscription;
    message: string;
  }>("/parent/subscriptions", data);
};

export const updateSubscription = (
  id: number,
  data: {
    notifyOnAdverseReaction?: boolean;
    notifyOnInspection?: boolean;
  },
) => {
  return api.put<{
    success: boolean;
    data: ProductSubscription;
  }>(`/parent/subscriptions/${id}`, data);
};

export const cancelSubscription = (id: number) => {
  return api.delete<{
    success: boolean;
    message: string;
  }>(`/parent/subscriptions/${id}`);
};

export const checkSubscription = (productId: number) => {
  return api.get<{
    success: boolean;
    data: {
      isSubscribed: boolean;
      subscription: ProductSubscription | null;
    };
  }>(`/parent/subscriptions/check/${productId}`);
};

export const getNotifications = (unreadOnly?: boolean) => {
  return api.get<{
    success: boolean;
    data: Notification[];
    unreadCount: number;
  }>("/parent/notifications", {
    params: unreadOnly ? { unreadOnly: "true" } : {},
  });
};

export const markNotificationRead = (id: number) => {
  return api.put<{
    success: boolean;
    message: string;
  }>(`/parent/notifications/${id}/read`);
};

export const markAllNotificationsRead = () => {
  return api.put<{
    success: boolean;
    message: string;
  }>("/parent/notifications/read-all");
};

export const getUnreadCount = () => {
  return api.get<{
    success: boolean;
    data: { count: number };
  }>("/parent/notifications/unread-count");
};

export default api;
