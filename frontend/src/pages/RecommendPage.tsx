import React, { useState } from 'react';
import {
  Form,
  InputNumber,
  Select,
  Button,
  Card,
  Spin,
  Empty,
  Tag,
  Alert,
  Space,
  Checkbox,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  ThunderboltOutlined,
  SafetyOutlined,
  FilterOutlined,
  HeartOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import ProductCard from '../components/ProductCard';
import { getRecommendations } from '../services/api';
import type { Product, RecommendParams } from '../types';
import { SKIN_TYPE_OPTIONS, CATEGORY_OPTIONS } from '../types';

const { Option } = Select;

const RecommendPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [params, setParams] = useState<RecommendParams | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    setSubmitted(true);

    try {
      const requestParams: RecommendParams = {
        childAge: values.childAge,
        skinType: values.skinType,
        category: values.category,
        excludeHighAllergen: values.excludeHighAllergen || false,
      };

      const res = await getRecommendations(requestParams);
      if (res.data.success) {
        setProducts(res.data.data);
        setParams(res.data.params);
      }
    } catch (error: any) {
      console.error('获取推荐失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const highMatchCount = products.filter(p => (p.matchScore || 0) >= 80).length;
  const lowRiskCount = products.filter(p => p.highAllergenIngredients.length === 0).length;

  return (
    <div>
      <h1 className="page-title">⚡ 按需推荐</h1>
      <p className="page-subtitle">
        根据孩子的年龄和肤质，为您智能匹配最合适的儿童彩妆产品，避开高致敏成分
      </p>

      <Row gutter={24}>
        <Col xs={24} md={8}>
          <Card
            style={{
              borderRadius: 16,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              position: 'sticky',
              top: 88,
            }}
            bodyStyle={{ padding: 24 }}
          >
            <h3 style={{ color: 'white', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FilterOutlined /> 填写需求
            </h3>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{
                childAge: 5,
                skinType: 'normal',
                excludeHighAllergen: true,
              }}
            >
              <Form.Item
                name="childAge"
                label={<span style={{ color: 'white' }}>孩子年龄</span>}
                rules={[{ required: true, message: '请输入孩子年龄' }]}
              >
                <InputNumber
                  min={1}
                  max={18}
                  style={{ width: '100%' }}
                  size="large"
                  placeholder="请输入年龄（1-18岁）"
                  suffix="岁"
                />
              </Form.Item>

              <Form.Item
                name="skinType"
                label={<span style={{ color: 'white' }}>孩子肤质</span>}
                rules={[{ required: true, message: '请选择肤质' }]}
              >
                <Select size="large" placeholder="请选择肤质">
                  {SKIN_TYPE_OPTIONS.map(opt => (
                    <Option key={opt.value} value={opt.value}>
                      {opt.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="category"
                label={<span style={{ color: 'white' }}>产品品类（可选）</span>}
              >
                <Select size="large" placeholder="全部品类" allowClear>
                  {CATEGORY_OPTIONS.map(opt => (
                    <Option key={opt.value} value={opt.value}>
                      {opt.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name="excludeHighAllergen" valuePropName="checked">
                <Checkbox>
                  <span style={{ color: 'white' }}>排除含高致敏成分的产品</span>
                </Checkbox>
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  icon={<ThunderboltOutlined />}
                  style={{
                    background: 'white',
                    color: '#667eea',
                    border: 'none',
                    fontWeight: 600,
                    height: 48,
                  }}
                  loading={loading}
                >
                  为我推荐
                </Button>
              </Form.Item>
            </Form>

            <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, marginBottom: 8 }}>
                <SafetyOutlined style={{ marginRight: 4 }} />
                推荐算法说明
              </div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, lineHeight: 1.8 }}>
                综合考虑年龄匹配度、肤质适应性、成分安全性、品牌信誉度、用户评价等多维度数据，为您推荐最适合的产品。
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={16}>
          <Spin spinning={loading} tip="正在为您匹配最佳产品...">
            {!submitted ? (
              <div className="search-result-empty">
                <HeartOutlined style={{ fontSize: 64, color: '#1890ff', marginBottom: 16 }} />
                <h3 style={{ marginBottom: 8 }}>定制您的专属推荐</h3>
                <p>
                  填写左侧表单，告诉我们孩子的年龄和肤质<br />
                  我们将为您智能匹配最合适的儿童彩妆产品
                </p>
              </div>
            ) : products.length > 0 ? (
              <div>
                <Alert
                  type="success"
                  showIcon
                  message={
                    <Space>
                      <span>
                        为您找到 <strong>{products.length}</strong> 个匹配产品
                      </span>
                      {params && (
                        <Tag color="blue">
                          {params.childAge}岁 · {SKIN_TYPE_OPTIONS.find(s => s.value === params.skinType)?.label}
                        </Tag>
                      )}
                    </Space>
                  }
                  style={{ marginBottom: 24 }}
                />

                <Row gutter={16} style={{ marginBottom: 24 }}>
                  <Col span={8}>
                    <Card>
                      <Statistic
                        title="高匹配度"
                        value={highMatchCount}
                        prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                        suffix="个"
                        valueStyle={{ color: '#52c41a' }}
                      />
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card>
                      <Statistic
                        title="无高致敏成分"
                        value={lowRiskCount}
                        prefix={<SafetyOutlined style={{ color: '#1890ff' }} />}
                        suffix="个"
                        valueStyle={{ color: '#1890ff' }}
                      />
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card>
                      <Statistic
                        title="平均匹配度"
                        value={products.length > 0 ? Math.round(products.reduce((sum, p) => sum + (p.matchScore || 0), 0) / products.length) : 0}
                        prefix={<ThunderboltOutlined style={{ color: '#722ed1' }} />}
                        suffix="%"
                        valueStyle={{ color: '#722ed1' }}
                      />
                    </Card>
                  </Col>
                </Row>

                <div>
                  {products.map((product, index) => (
                    <div key={product.id} style={{ position: 'relative' }}>
                      {product.matchScore !== undefined && (
                        <div style={{ marginBottom: 8 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                            <span style={{ fontSize: 12, color: '#8c8c8c' }}>
                              匹配度 {product.matchScore}%
                            </span>
                            <Tag
                              color={
                                product.matchScore >= 80 ? 'green' :
                                product.matchScore >= 60 ? 'blue' : 'orange'
                              }
                              icon={product.matchScore >= 80 ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
                            >
                              {product.matchScore >= 80 ? '非常匹配' :
                               product.matchScore >= 60 ? '比较匹配' : '一般匹配'}
                            </Tag>
                          </div>
                          <div className="match-score-bar">
                            <div
                              className="match-score-fill"
                              style={{ width: `${product.matchScore}%` }}
                            />
                          </div>
                        </div>
                      )}
                      <ProductCard key={product.id} product={product} showMatchScore={false} />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="search-result-empty">
                <Empty
                  description={
                    <span>
                      暂无匹配的产品<br />
                      <span style={{ color: '#8c8c8c', fontSize: 13 }}>
                        建议调整筛选条件后重试
                      </span>
                    </span>
                  }
                />
              </div>
            )}
          </Spin>
        </Col>
      </Row>
    </div>
  );
};

export default RecommendPage;
