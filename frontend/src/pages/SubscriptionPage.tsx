import React, { useState, useEffect } from 'react';
import {
  Card,
  List,
  Tag,
  Button,
  Space,
  Switch,
  message,
  Popconfirm,
  Row,
  Col,
  Statistic,
  Empty,
  Alert,
  Tooltip,
} from 'antd';
import {
  BellOutlined,
  WarningOutlined,
  SafetyOutlined,
  EyeOutlined,
  StopOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import type { ProductSubscription } from '../types';
import {
  getSubscriptions,
  cancelSubscription,
  updateSubscription,
} from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useParent } from '../context/ParentContext';

const SubscriptionPage: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<ProductSubscription[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { refreshParent } = useParent();

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const res = await getSubscriptions();
      if (res.data.success) {
        setSubscriptions(res.data.data);
      }
    } catch (error) {
      message.error('加载订阅列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const handleCancel = async (id: number) => {
    try {
      await cancelSubscription(id);
      message.success('已取消订阅');
      loadSubscriptions();
      refreshParent();
    } catch (error) {
      message.error('取消订阅失败');
    }
  };

  const handleToggleNotify = async (
    id: number,
    field: 'notifyOnAdverseReaction' | 'notifyOnInspection',
    checked: boolean
  ) => {
    try {
      await updateSubscription(id, { [field]: checked });
      message.success('设置已更新');
      loadSubscriptions();
    } catch (error) {
      message.error('更新设置失败');
    }
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

  const hasAdverseReactionCount = subscriptions.filter(
    s => s.product?.adverseReactions && s.product.adverseReactions.length > 0
  ).length;

  const hasInspectionIssueCount = subscriptions.filter(
    s => s.product?.inspectionResults?.some((r: any) => r.result === '不合格')
  ).length;

  return (
    <div style={{ padding: 24 }}>
      <h1 className="page-title">
        <BellOutlined style={{ marginRight: 8 }} />
        我的订阅
      </h1>
      <p className="page-subtitle">
        订阅关注的产品，一旦有新的不良反应通报或抽检不合格，平台将立即推送提醒
      </p>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="订阅产品"
              value={subscriptions.length}
              prefix={<BellOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="有不良反应通报"
              value={hasAdverseReactionCount}
              prefix={<WarningOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="有抽检不合格"
              value={hasInspectionIssueCount}
              prefix={<StopOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      <Alert
        type="info"
        showIcon
        message="订阅说明"
        description={
          <div>
            <p>• 订阅后，当产品被新通报不良反应或抽检不合格时，您会收到推送提醒</p>
            <p>• 可以单独设置是否接收不良反应通报提醒和抽检不合格提醒</p>
            <p>• 点击产品卡片可查看产品详情</p>
          </div>
        }
        style={{ marginBottom: 24 }}
      />

      <Card
        title="订阅列表"
        loading={loading}
      >
        {subscriptions.length === 0 ? (
          <Empty
            description={
              <div>
                <p>暂无订阅的产品</p>
                <p style={{ fontSize: 12, color: '#8c8c8c' }}>
                  在产品详情页点击"订阅提醒"按钮即可订阅
                </p>
              </div>
            }
          />
        ) : (
          <List
            dataSource={subscriptions}
            renderItem={(item) => {
              const product = item.product;
              const hasAdverseReaction = product?.adverseReactions && product.adverseReactions.length > 0;
              const hasInspectionFailed = product?.inspectionResults?.some((r: any) => r.result === '不合格');
              
              return (
                <List.Item
                  actions={[
                    <Button
                      type="link"
                      icon={<EyeOutlined />}
                      onClick={() => navigate(`/product/${product.id}`)}
                    >
                      查看详情
                    </Button>,
                    <Popconfirm
                      title="确定取消订阅吗？"
                      onConfirm={() => handleCancel(item.id)}
                      okText="确定"
                      cancelText="取消"
                    >
                      <Button type="link" danger icon={<StopOutlined />}>
                        取消订阅
                      </Button>
                    </Popconfirm>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <span style={{ fontSize: 32 }}>
                        {getCategoryEmoji(product.category)}
                      </span>
                    }
                    title={
                      <Space>
                        <span style={{ fontWeight: 600 }}>{product.name}</span>
                        {hasAdverseReaction && (
                          <Tooltip title="该产品有不良反应通报">
                            <Tag color="orange" icon={<WarningOutlined />}>
                              有不良反应
                            </Tag>
                          </Tooltip>
                        )}
                        {hasInspectionFailed && (
                          <Tooltip title="该产品有抽检不合格记录">
                            <Tag color="red" icon={<StopOutlined />}>
                              抽检不合格
                            </Tag>
                          </Tooltip>
                        )}
                        {!hasAdverseReaction && !hasInspectionFailed && (
                          <Tag color="green" icon={<CheckCircleOutlined />}>
                            状态正常
                          </Tag>
                        )}
                      </Space>
                    }
                    description={
                      <div>
                        <div style={{ marginBottom: 8, color: '#8c8c8c' }}>
                          {product.brand.name} · {product.category} · 适用年龄 {product.minAge}-{product.maxAge}岁
                        </div>
                        <Space size="large">
                          <Space>
                            <span style={{ fontSize: 12 }}>不良反应提醒：</span>
                            <Switch
                              checked={item.notifyOnAdverseReaction}
                              onChange={(checked) =>
                                handleToggleNotify(item.id, 'notifyOnAdverseReaction', checked)
                              }
                            />
                          </Space>
                          <Space>
                            <span style={{ fontSize: 12 }}>抽检不合格提醒：</span>
                            <Switch
                              checked={item.notifyOnInspection}
                              onChange={(checked) =>
                                handleToggleNotify(item.id, 'notifyOnInspection', checked)
                              }
                            />
                          </Space>
                        </Space>
                        {product.highAllergenIngredients.length > 0 && (
                          <div style={{ marginTop: 8 }}>
                            <Tag color="orange" icon={<ExclamationCircleOutlined />}>
                              含{product.highAllergenIngredients.length}种高致敏成分
                            </Tag>
                          </div>
                        )}
                      </div>
                    }
                  />
                </List.Item>
              );
            }}
          />
        )}
      </Card>
    </div>
  );
};

export default SubscriptionPage;
