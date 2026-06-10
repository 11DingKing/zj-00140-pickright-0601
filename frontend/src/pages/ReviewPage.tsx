import React, { useState, useEffect } from 'react';
import {
  Tabs,
  List,
  Rate,
  Tag,
  Spin,
  Empty,
  Button,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Checkbox,
  Space,
  Alert,
  Card,
  Statistic,
  Row,
  Col,
  Descriptions,
} from 'antd';
import {
  FormOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SafetyOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { getMyReviews, createReview, searchProducts } from '../services/api';
import type { Review, Product } from '../types';
import { SKIN_TYPE_OPTIONS, ALLERGY_SYMPTOMS, USAGE_DURATION_OPTIONS } from '../types';

const { TextArea } = Input;
const { Option } = Select;

const ReviewPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('my-reviews');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productSearchResults, setProductSearchResults] = useState<Product[]>([]);
  const [searchingProducts, setSearchingProducts] = useState(false);
  const [form] = Form.useForm();
  const [submitLoading, setSubmitLoading] = useState(false);
  const [needReport, setNeedReport] = useState(false);
  const [reportTip, setReportTip] = useState<string | null>(null);

  useEffect(() => {
    loadMyReviews();
  }, []);

  const loadMyReviews = async () => {
    setLoading(true);
    try {
      const res = await getMyReviews();
      if (res.data.success) {
        setReviews(res.data.data);
      }
    } catch (error) {
      console.error('加载评价失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductSearch = async (keyword: string) => {
    if (!keyword.trim()) {
      setProductSearchResults([]);
      return;
    }

    setSearchingProducts(true);
    try {
      const res = await searchProducts(keyword);
      if (res.data.success) {
        setProductSearchResults(res.data.data.filter((p) => p.isRegistered && !p.isBlacklisted));
      }
    } catch (error) {
      console.error('搜索产品失败:', error);
    } finally {
      setSearchingProducts(false);
    }
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setProductSearchResults([]);
    form.setFieldsValue({ productId: product.id });
  };

  const handleSubmit = async (values: any) => {
    if (!selectedProduct) {
      return;
    }

    setSubmitLoading(true);
    try {
      const res = await createReview({
        ...values,
        productId: selectedProduct.id,
        allergySymptoms: values.hasAllergy ? values.allergySymptoms : [],
      });

      if (res.data.success) {
        const data = res.data.data;
        setNeedReport(data.needReport || false);
        setReportTip(data.reportTip || null);

        if (data.needReport) {
          Modal.warning({
            title: '⚠️ 重要提示',
            content: (
              <div>
                <p>{data.reportTip}</p>
                <p style={{ marginTop: 12 }}>全国化妆品不良反应监测联系电话：12315</p>
              </div>
            ),
            okText: '我知道了',
          });
        } else {
          Modal.success({
            title: '评价提交成功',
            content: '感谢您的反馈，您的评价将帮助更多家长做出明智的选择。',
          });
        }

        setModalVisible(false);
        form.resetFields();
        setSelectedProduct(null);
        loadMyReviews();
      }
    } catch (error: any) {
      Modal.error({
        title: '提交失败',
        content: error.response?.data?.error || '请稍后重试',
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN');
  };

  const allergyReviewCount = reviews.filter((r) => r.hasAllergy).length;

  const tabItems = [
    {
      key: 'my-reviews',
      label: (
        <span>
          <FormOutlined />
          我的评价
        </span>
      ),
    },
    {
      key: 'write-review',
      label: (
        <span>
          <PlusOutlined />
          写评价
        </span>
      ),
    },
  ];

  return (
    <div>
      <h1 className="page-title">📝 我的评价反馈</h1>
      <p className="page-subtitle">分享您的使用体验和过敏反应，帮助更多家长做出明智的选择</p>

      {needReport && reportTip && (
        <Alert
          type="warning"
          showIcon
          message="过敏反馈提示"
          description={
            <div>
              <p>{reportTip}</p>
              <p style={{ marginTop: 8 }}>
                <strong>全国化妆品不良反应监测电话：12315</strong>
              </p>
            </div>
          }
          style={{ marginBottom: 24 }}
          closable
          onClose={() => setNeedReport(false)}
        />
      )}

      <Alert
        type="info"
        showIcon
        message="温馨提示"
        description="您的真实反馈非常重要。如果孩子使用产品后出现过敏症状，请详细描述，这将帮助其他家长避开风险。严重过敏请及时就医并向监管部门上报。"
        style={{ marginBottom: 24 }}
      />

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="我的评价"
              value={reviews.length}
              prefix={<FormOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="过敏反馈"
              value={allergyReviewCount}
              prefix={<WarningOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="平均评分"
              value={
                reviews.length > 0
                  ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                  : '0.0'
              }
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
              suffix="/ 5"
            />
          </Card>
        </Col>
      </Row>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        size="large"
        style={{ marginBottom: 24 }}
      />

      {activeTab === 'my-reviews' && (
        <Spin spinning={loading}>
          {reviews.length > 0 ? (
            <List
              dataSource={reviews}
              renderItem={(review) => (
                <List.Item
                  style={{
                    padding: 20,
                    marginBottom: 16,
                    background: 'white',
                    borderRadius: 12,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                  }}
                >
                  <div style={{ width: '100%' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: 12,
                      }}
                    >
                      <div>
                        <h4 style={{ margin: '0 0 8px 0', fontSize: 16 }}>
                          {review.product?.name}
                        </h4>
                        <Space size={[4, 8]} wrap>
                          <Tag>
                            {SKIN_TYPE_OPTIONS.find((s) => s.value === review.skinType)?.label}
                          </Tag>
                          <Tag>{review.childAge}岁</Tag>
                          {review.usageDuration && <Tag>使用{review.usageDuration}</Tag>}
                        </Space>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <Rate disabled value={review.rating} style={{ fontSize: 14 }} />
                        <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
                          {formatDate(review.createdAt)}
                        </div>
                      </div>
                    </div>

                    <p style={{ marginBottom: 12, color: '#595959' }}>{review.content}</p>

                    {review.hasAllergy && (
                      <div className="allergy-alert">
                        <div
                          style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}
                        >
                          <WarningOutlined style={{ color: '#ff4d4f' }} />
                          <strong style={{ color: '#cf1322' }}>出现过敏反应</strong>
                        </div>
                        <div style={{ color: '#595959', fontSize: 13 }}>
                          过敏症状：{review.allergySymptoms.join('、')}
                        </div>
                      </div>
                    )}

                    {review.product && (
                      <Descriptions
                        column={3}
                        size="small"
                        style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}
                      >
                        <Descriptions.Item label="品牌">
                          {review.product.brand.name}
                        </Descriptions.Item>
                        <Descriptions.Item label="备案号">
                          {review.product.recordNumber}
                        </Descriptions.Item>
                        <Descriptions.Item label="放心指数">
                          <span style={{ color: review.product.trustLevel?.color || '#1890ff', fontWeight: 600 }}>
                            {typeof review.product.trustIndex === 'number' ? review.product.trustIndex.toFixed(1) : review.product.trustIndex || '-'}
                          </span>
                        </Descriptions.Item>
                      </Descriptions>
                    )}
                  </div>
                </List.Item>
              )}
            />
          ) : (
            <Empty description="暂无评价，快去分享您的使用体验吧" />
          )}
        </Spin>
      )}

      {activeTab === 'write-review' && (
        <Card style={{ borderRadius: 12 }} bodyStyle={{ padding: 32 }}>
          <h3 style={{ marginBottom: 24 }}>选择要评价的产品</h3>

          <Input.Search
            placeholder="输入产品名称或备案号搜索..."
            allowClear
            enterButton="搜索"
            size="large"
            onSearch={handleProductSearch}
            loading={searchingProducts}
            style={{ marginBottom: 16 }}
          />

          {productSearchResults.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 13, color: '#8c8c8c', marginBottom: 12 }}>
                找到 {productSearchResults.length} 个产品，请选择：
              </p>
              {productSearchResults.map((product) => (
                <Card
                  key={product.id}
                  hoverable
                  onClick={() => handleSelectProduct(product)}
                  style={{
                    marginBottom: 8,
                    borderRadius: 8,
                    border:
                      selectedProduct?.id === product.id
                        ? '2px solid #1890ff'
                        : '1px solid #f0f0f0',
                  }}
                  bodyStyle={{ padding: 16 }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <strong>{product.name}</strong>
                      <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
                        {product.brand.name} · {product.recordNumber}
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: product.trustLevel.color, fontWeight: 600 }}>
                        {product.trustIndex.toFixed(1)}
                      </div>
                      <div style={{ fontSize: 11, color: product.trustLevel.color }}>放心指数</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {selectedProduct && (
            <div>
              <Alert
                type="success"
                showIcon
                message={
                  <Space>
                    <span>
                      已选择：<strong>{selectedProduct.name}</strong>
                    </span>
                    <Button size="small" type="link" onClick={() => setSelectedProduct(null)}>
                      重新选择
                    </Button>
                  </Space>
                }
                style={{ marginBottom: 24 }}
              />

              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{ rating: 5 }}
              >
                <Form.Item name="productId" hidden>
                  <Input />
                </Form.Item>

                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="childAge"
                      label="孩子年龄"
                      rules={[{ required: true, message: '请输入孩子年龄' }]}
                    >
                      <InputNumber
                        min={1}
                        max={18}
                        style={{ width: '100%' }}
                        placeholder="请输入年龄（1-18岁）"
                        suffix="岁"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="skinType"
                      label="孩子肤质"
                      rules={[{ required: true, message: '请选择肤质' }]}
                    >
                      <Select placeholder="请选择肤质">
                        {SKIN_TYPE_OPTIONS.map((opt) => (
                          <Option key={opt.value} value={opt.value}>
                            {opt.label}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="rating"
                      label="综合评分"
                      rules={[{ required: true, message: '请选择评分' }]}
                    >
                      <Rate />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="usageDuration" label="使用时长">
                      <Select placeholder="请选择使用时长" allowClear>
                        {USAGE_DURATION_OPTIONS.map((opt) => (
                          <Option key={opt.value} value={opt.value}>
                            {opt.label}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="content"
                  label="使用评价"
                  rules={[
                    { required: true, message: '请填写使用评价' },
                    { min: 10, message: '评价至少10个字' },
                  ]}
                >
                  <TextArea
                    rows={4}
                    placeholder="请分享您的使用体验，包括产品的优点、缺点等..."
                    showCount
                    maxLength={500}
                  />
                </Form.Item>

                <Form.Item name="hasAllergy" valuePropName="checked" style={{ marginBottom: 8 }}>
                  <Checkbox>
                    <span style={{ color: '#cf1322' }}>
                      <WarningOutlined /> 使用后出现过敏反应
                    </span>
                  </Checkbox>
                </Form.Item>

                <Form.Item
                  noStyle
                  shouldUpdate={(prevValues, currentValues) =>
                    prevValues.hasAllergy !== currentValues.hasAllergy
                  }
                >
                  {({ getFieldValue }) =>
                    getFieldValue('hasAllergy') ? (
                      <Form.Item
                        name="allergySymptoms"
                        label="过敏症状"
                        rules={[{ required: true, message: '请选择过敏症状' }]}
                        extra="如果有其他症状，请在评价中详细描述。严重过敏请及时就医！"
                      >
                        <Checkbox.Group>
                          <Space wrap>
                            {ALLERGY_SYMPTOMS.map((symptom) => (
                              <Checkbox
                                key={symptom}
                                value={symptom}
                                style={
                                  ['呼吸困难', '严重红肿', '大面积皮疹', '水疱'].includes(symptom)
                                    ? { color: '#cf1322' }
                                    : {}
                                }
                              >
                                {symptom}
                              </Checkbox>
                            ))}
                          </Space>
                        </Checkbox.Group>
                      </Form.Item>
                    ) : null
                  }
                </Form.Item>

                <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    block
                    icon={<FormOutlined />}
                    loading={submitLoading}
                  >
                    提交评价
                  </Button>
                </Form.Item>
              </Form>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default ReviewPage;
