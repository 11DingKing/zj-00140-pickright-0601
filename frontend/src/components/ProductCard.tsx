import React from 'react';
import { Card, Tag, Rate, Space, Tooltip } from 'antd';
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  StarOutlined,
  SafetyOutlined,
} from '@ant-design/icons';
import type { Product } from '../types';
import { useNavigate } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
  showRank?: boolean;
  showMatchScore?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, showRank, showMatchScore }) => {
  const navigate = useNavigate();

  const getStatusTag = () => {
    if (product.isBlacklisted) {
      return (
        <Tag color="red" icon={<CloseCircleOutlined />}>
          黑名单产品
        </Tag>
      );
    }
    if (!product.isRegistered) {
      return (
        <Tag color="orange" icon={<ExclamationCircleOutlined />}>
          未在册
        </Tag>
      );
    }
    return (
      <Tag color="green" icon={<CheckCircleOutlined />}>
        已备案在册
      </Tag>
    );
  };

  const getCategoryEmoji = (category: string) => {
    const emojiMap: Record<string, string> = {
      '口红': '💄',
      '眼影': '👁️',
      '腮红': '🎀',
      '粉底': '✨',
      '眼线': '🖌️',
      '指甲油': '💅',
      '唇彩': '💋',
      '套装': '🎁',
    };
    return emojiMap[category] || '🎨';
  };

  return (
    <Card
      hoverable
      style={{
        marginBottom: 16,
        border: product.isBlacklisted ? '2px solid #ff4d4f' : '1px solid #f0f0f0',
        borderRadius: 12,
        backgroundColor: product.isBlacklisted ? '#fff1f0' : '#fff',
      }}
      onClick={() => navigate(`/product/${product.id}`)}
      bodyStyle={{ padding: 20 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            {showRank && product.rank && (
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  backgroundColor: product.rank <= 3 ? '#faad14' : '#1890ff',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: 16,
                }}
              >
                {product.rank}
              </div>
            )}
            <span style={{ fontSize: 24 }}>{getCategoryEmoji(product.category)}</span>
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: 16,
                  fontWeight: 600,
                  color: product.isBlacklisted ? '#ff4d4f' : '#262626',
                }}
              >
                {product.name}
              </h3>
              <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
                {product.brand.name} · {product.category}
              </div>
            </div>
          </div>

          <Space size={[4, 8]} wrap style={{ marginBottom: 12 }}>
            {getStatusTag()}
            {product.isMinimalFormula && (
              <Tag color="cyan" icon={<SafetyOutlined />}>
                极简配方
              </Tag>
            )}
            {product.brand.isWhitelist && (
              <Tag color="gold" icon={<StarOutlined />}>
                白名单品牌
              </Tag>
            )}
            {showMatchScore && product.matchScore && (
              <Tag color="purple">
                匹配度 {product.matchScore}%
              </Tag>
            )}
          </Space>

          <div style={{ marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: '#8c8c8c' }}>
              适用年龄：{product.minAge}-{product.maxAge}岁
            </span>
          </div>

          {product.highAllergenIngredients.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <Tooltip title={product.highAllergenIngredients.join('、')}>
                <Tag color="orange" icon={<ExclamationCircleOutlined />}>
                  含{product.highAllergenIngredients.length}种高致敏成分
                </Tag>
              </Tooltip>
            </div>
          )}

          {product.reviewCount !== undefined && product.reviewCount > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Rate disabled value={4} allowHalf style={{ fontSize: 12 }} />
              <span style={{ fontSize: 12, color: '#8c8c8c' }}>
                {product.reviewCount} 条评价
              </span>
            </div>
          )}
        </div>

        <div
          style={{
            textAlign: 'center',
            marginLeft: 16,
            padding: 12,
            backgroundColor: product.trustLevel.color + '15',
            borderRadius: 12,
            minWidth: 80,
          }}
        >
          <div
            style={{
              fontSize: 28,
              fontWeight: 'bold',
              color: product.trustLevel.color,
              lineHeight: 1,
            }}
          >
            {product.trustIndex.toFixed(1)}
          </div>
          <div style={{ fontSize: 11, color: product.trustLevel.color, marginTop: 4, fontWeight: 500 }}>
            {product.trustLevel.level}
          </div>
          <div style={{ fontSize: 10, color: '#8c8c8c', marginTop: 2 }}>
            放心指数
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;
