import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Space, Tag, Descriptions, List, Rate, Statistic, Row, Col, Card, Alert, Modal } from 'antd';
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  StarOutlined,
  SafetyOutlined,
  WarningOutlined,
  FormOutlined,
  InfoCircleOutlined,
  ClockCircleOutlined,
  FileSearchOutlined,
} from '@ant-design/icons';
import { getProductDetail } from '../services/api';
import type { ProductDetail, Review } from '../types';
import { SKIN_TYPE_OPTIONS } from '../types';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadProductDetail(parseInt(id));
    }
  }, [id]);

  const loadProductDetail = async (productId: number) => {
    setLoading(true);
    try {
      const res = await getProductDetail(productId);
      if (res.data.success) {
        setProduct(res.data.data);
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        Modal.error({
          title: '产品不存在',
          content: '您访问的产品可能已被删除或不存在。',
          onOk: () => navigate(-1),
        });
      }
      console.error('加载产品详情失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN');
  };

  const getCategoryEmoji = (category: string) => {
    const emojiMap: Record<string, string> = {
      '口红': '💄', '眼影': '👁️', '腮红': '🎀', '粉底': '✨',
      '眼线': '🖌️', '指甲油': '💅', '唇彩': '💋', '套装': '🎁',
    };
    return emojiMap[category] || '🎨';
  };

  if (!product && !loading) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <p>加载失败</p>
        <Button onClick={() => navigate(-1)}>返回</Button>
      </div>
    );
  }

  return (
    <div>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        style={{ marginBottom: 24 }}
      >
        返回
      </Button>

      {product && (
        <div>
          {/* 黑名单警示 */}
          {product.isBlacklisted && (
            <div className="warning-banner">
              <CloseCircleOutlined style={{ fontSize: 32 }} />
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
                  ⚠️ 危险警告
                </div>
                <div style={{ fontSize: 14, opacity: 0.95 }}>
                  {product.blacklist?.reason || '该产品存在严重安全隐患，已被监管部门列入黑名单，请勿购买使用！'}
                </div>
              </div>
            </div>
          )}

          {/* 未在册警示 */}
          {!product.isBlacklisted && !product.isRegistered && (
            <Alert
              type="warning"
              showIcon
              message="该产品未在监管部门备案"
              description="请谨慎购买，建议选择已备案的正规产品。"
              style={{ marginBottom: 24 }}
            />
          )}

          {/* 安全产品提示 */}
          {product.isRegistered && !product.isBlacklisted && product.brand.isWhitelist && (
            <div className="safe-banner">
              <SafetyOutlined style={{ fontSize: 32 }} />
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
                  ✅ 安全可靠
                </div>
                <div style={{ fontSize: 14, opacity: 0.95 }}>
                  该产品已备案在册，品牌为白名单信誉企业，可放心选购。
                </div>
              </div>
            </div>
          )}

          {/* 产品基本信息 */}
          <Card style={{ marginBottom: 24, borderRadius: 12 }} bodyStyle={{ padding: 32 }}>
            <div style={{ display: 'flex', gap: 32 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                  <span style={{ fontSize: 48 }}>{getCategoryEmoji(product.category)}</span>
                  <div>
                    <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>{product.name}</h1>
                    <Space size={[4, 8]} wrap style={{ marginTop: 8 }}>
                      {product.isRegistered ? (
                        <Tag color="green" icon={<CheckCircleOutlined />}>已备案在册</Tag>
                      ) : (
                        <Tag color="orange" icon={<ExclamationCircleOutlined />}>未在册</Tag>
                      )}
                      {product.brand.isWhitelist && (
                        <Tag color="gold" icon={<StarOutlined />}>白名单品牌</Tag>
                      )}
                      {product.isMinimalFormula && (
                        <Tag color="cyan" icon={<SafetyOutlined />}>极简配方</Tag>
                      )}
                      <Tag>{product.category}</Tag>
                    </Space>
                  </div>
                </div>

                <Descriptions column={2} size="small" style={{ marginTop: 24 }}>
                  <Descriptions.Item label="备案号">
                    <code style={{ background: '#f5f5f5', padding: '2px 8px', borderRadius: 4 }}>
                      {product.recordNumber}
                    </code>
                  </Descriptions.Item>
                  <Descriptions.Item label="品牌">{product.brand.name}</Descriptions.Item>
                  <Descriptions.Item label="备案企业">{product.brand.company}</Descriptions.Item>
                  <Descriptions.Item label="适用年龄">{product.minAge}-{product.maxAge}岁</Descriptions.Item>
                  <Descriptions.Item label="规格">{product.specification || '-'}</Descriptions.Item>
                  <Descriptions.Item label="保质期">{product.shelfLife || '-'}</Descriptions.Item>
                  <Descriptions.Item label="基础安全分">{product.safetyScore}分</Descriptions.Item>
                  <Descriptions.Item label="更新时间">{formatDate(product.updatedAt)}</Descriptions.Item>
                </Descriptions>
              </div>

              {/* 放心指数展示 */}
              <div style={{ textAlign: 'center', minWidth: 160 }}>
                <div
                  className="trust-index-circle"
                  style={{
                    background: `linear-gradient(135deg, ${product.trustLevel.color} 0%, ${product.trustLevel.color}dd 100%)`,
                    color: 'white',
                  }}
                >
                  <span className="trust-index-value">{product.trustIndex.toFixed(1)}</span>
                  <span className="trust-index-label">{product.trustLevel.level}</span>
                </div>
                <p style={{ marginTop: 16, color: '#8c8c8c', fontSize: 13, maxWidth: 180 }}>
                  {product.trustLevel.description}
                </p>
                <Button
                  type="primary"
                  icon={<FormOutlined />}
                  style={{ marginTop: 8, width: '100%' }}
                  onClick={() => navigate(`/reviews?tab=write&productId=${product.id}`)}
                >
                  写评价
                </Button>
              </div>
            </div>
          </Card>

          {/* 统计数据 */}
          {product.totalReviews > 0 && (
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="用户评价"
                    value={product.totalReviews}
                    prefix={<FormOutlined />}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="过敏反馈"
                    value={product.allergyReviews}
                    prefix={<WarningOutlined style={{ color: '#faad14' }} />}
                    valueStyle={{ color: '#faad14' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="过敏率"
                    value={product.allergyRate}
                    suffix="%"
                    prefix={<ExclamationCircleOutlined style={{ color: parseFloat(product.allergyRate) > 10 ? '#ff4d4f' : '#faad14' }} />}
                    valueStyle={{ color: parseFloat(product.allergyRate) > 10 ? '#ff4d4f' : '#faad14' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="不良反应通报"
                    value={product.adverseReactions.length}
                    prefix={<FileSearchOutlined style={{ color: '#ff4d4f' }} />}
                    valueStyle={{ color: product.adverseReactions.length > 0 ? '#ff4d4f' : '#52c41a' }}
                  />
                </Card>
              </Col>
            </Row>
          )}

          {/* 成分分析 */}
          <div className="detail-section">
            <h3 className="detail-section-title">
              <InfoCircleOutlined /> 成分分析
            </h3>

            <Row gutter={24}>
              <Col xs={24} md={12}>
                <h4 style={{ marginBottom: 12, color: '#595959' }}>全部成分 ({product.ingredients.length}种)</h4>
                <div>
                  {product.ingredients.map((ingredient, index) => (
                    <span key={index} className="ingredient-tag">{ingredient}</span>
                  ))}
                </div>
              </Col>
              <Col xs={24} md={12}>
                <h4 style={{ marginBottom: 12, color: '#595959' }}>
                  高致敏成分 ({product.highAllergenIngredients.length}种)
                </h4>
                {product.highAllergenIngredients.length > 0 ? (
                  <div>
                    <Alert
                      type="warning"
                      showIcon
                      message="该产品含有高致敏成分，敏感肌儿童请谨慎使用"
                      style={{ marginBottom: 12 }}
                    />
                    {product.highAllergenIngredients.map((ingredient, index) => (
                      <span key={index} className="ingredient-tag high-risk">{ingredient}</span>
                    ))}
                  </div>
                ) : (
                  <div>
                    <Alert
                      type="success"
                      showIcon
                      message="该产品不含高致敏成分，敏感肌儿童可放心使用"
                    />
                  </div>
                )}
              </Col>
            </Row>
          </div>

          {/* 抽检记录 */}
          {product.inspectionResults.length > 0 && (
            <div className="detail-section">
              <h3 className="detail-section-title">
                <FileSearchOutlined /> 抽检记录
              </h3>
              <List
                dataSource={product.inspectionResults}
                renderItem={(item) => (
                  <List.Item style={{ padding: '16px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <Space>
                          <Tag color={item.result === '合格' ? 'green' : 'red'} icon={item.result === '合格' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}>
                            {item.result}
                          </Tag>
                          <strong>{item.inspectionOrg}</strong>
                        </Space>
                        {item.unqualifiedItems && (
                          <p style={{ marginTop: 8, color: '#ff4d4f', marginBottom: 0 }}>
                            不合格项目：{item.unqualifiedItems}
                          </p>
                        )}
                      </div>
                      <div style={{ textAlign: 'right', color: '#8c8c8c', fontSize: 12 }}>
                        <ClockCircleOutlined style={{ marginRight: 4 }} />
                        {formatDate(item.inspectionDate)}
                        <div style={{ marginTop: 4 }}>来源：{item.source}</div>
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            </div>
          )}

          {/* 不良反应通报 */}
          {product.adverseReactions.length > 0 && (
            <div className="detail-section">
              <h3 className="detail-section-title">
                <WarningOutlined style={{ color: '#ff4d4f' }} /> 不良反应通报
              </h3>
              <List
                dataSource={product.adverseReactions}
                renderItem={(item) => (
                  <List.Item style={{ padding: '16px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <div style={{ width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Space>
                          <Tag color={item.severity === '严重' ? 'red' : 'orange'}>
                            {item.severity}
                          </Tag>
                          <strong>{item.title}</strong>
                        </Space>
                        <span style={{ color: '#8c8c8c', fontSize: 12 }}>
                          {formatDate(item.reportDate)} · {item.source}
                        </span>
                      </div>
                      <p style={{ color: '#595959', marginBottom: 0 }}>{item.description}</p>
                    </div>
                  </List.Item>
                )}
              />
            </div>
          )}

          {/* 用户评价 */}
          <div className="detail-section">
            <h3 className="detail-section-title">
              <FormOutlined /> 用户评价 ({product.reviews.length})
            </h3>
            {product.reviews.length > 0 ? (
              <List
                dataSource={product.reviews}
                renderItem={(review: Review) => (
                  <List.Item className="review-item">
                    <div style={{ width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Space wrap>
                          <Tag>
                            {SKIN_TYPE_OPTIONS.find(s => s.value === review.skinType)?.label}
                          </Tag>
                          <Tag>{review.childAge}岁</Tag>
                          {review.usageDuration && <Tag>使用{review.usageDuration}</Tag>}
                        </Space>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Rate disabled value={review.rating} style={{ fontSize: 12 }} />
                          <span style={{ color: '#8c8c8c', fontSize: 12 }}>
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                      </div>
                      <p style={{ marginBottom: 8, color: '#262626' }}>{review.content}</p>
                      {review.hasAllergy && (
                        <div className="allergy-alert">
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <WarningOutlined style={{ color: '#ff4d4f' }} />
                            <strong style={{ color: '#cf1322' }}>出现过敏反应</strong>
                          </div>
                          <div style={{ color: '#595959', fontSize: 13 }}>
                            症状：{review.allergySymptoms.join('、')}
                          </div>
                        </div>
                      )}
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: 40, color: '#8c8c8c' }}>
                暂无用户评价，快来分享您的使用体验吧
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
