import { Router } from 'express';
import { searchProducts, getProductDetail, getCategories } from '../controllers/productController';
import { getWhitelist, getBlacklist, getTrustRank } from '../controllers/listController';
import { getRecommendedProducts } from '../controllers/recommendController';
import { createReview, getMyReviews, getProductReviews } from '../controllers/reviewController';

const router = Router();

// 产品相关接口
router.get('/products/search', searchProducts);
router.get('/products/categories', getCategories);
router.get('/products/recommend', getRecommendedProducts);
router.get('/products/:id', getProductDetail);
router.get('/products/:productId/reviews', getProductReviews);

// 榜单相关接口
router.get('/lists/whitelist', getWhitelist);
router.get('/lists/blacklist', getBlacklist);
router.get('/lists/trust-rank', getTrustRank);



// 评价相关接口
router.post('/reviews', createReview);
router.get('/reviews/my', getMyReviews);

export default router;
