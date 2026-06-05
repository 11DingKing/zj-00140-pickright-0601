import React, { useState, useEffect } from 'react';
import { Tabs, Spin, Empty, Card, Tag, Space, Button, Alert, List, Descriptions } from 'antd';
import {
  TrophyOutlined,
  ThunderboltOutlined,
  StarOutlined,
  WarningOutlined,
  SafetyOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import ProductCard from '../components/ProductCard';
import { getWhitelist, getBlacklist, getTrustRank } from '../services/api';
import type { WhitelistItem, Blacklist, Product } from '../types';

const RankPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('whitelist');
  const [whitelist, setWhitelist] = useState<WhitelistItem[]>([]);
  const [blacklist, setBlacklist] = useState<Blacklist[]>([]);
  const [trustRank, setTrustRank] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [whitelistRes, blacklistRes, trustRankRes] = await Promise.all([
        getWhitelist(),
        getBlacklist(),
        getTrustRank(undefined, 10),
      ]);

      if (whitelistRes.data.success) {
        setWhitelist(whitelistRes.data.data);
      }
      if (blacklistRes.data.success) {
        setBlacklist(blacklistRes.data.data);
      }
      if (trustRankRes.data.success) {
        setTrustRank(trustRankRes.data.data);
      }
    } catch (error) {
      console.error('加载榜单数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN');
  };

  const tabItems = [
    {
      key: 'whitelist',
      label: (
        <span>
          <StarOutlined style={{ color: '#faad14' }} />
          白名单品牌
        </span>
      ),
    },
    {
      key: 'trust-rank',
      label: (
        <span>
          <TrophyOutlined style={{ color: '#52c41a' }} />
          放心榜
        </span>
      ),
    },
    {
      key: 'blacklist',
      label: (
        <span>
          <ThunderboltOutlined style={{ color: '#ff4d4f' }} />
          黑名单
        </span>
      ),
    },
  ];

  return (
    <div>
      <h1 className="page-title">🏆 放心榜与黑榜</h1>
      <p className="page-subtitle">
        平台维护的信誉良好品牌白名单和被处罚下架产品黑名单，帮您快速识别安全产品
      </p>

      <Alert
        type="info"
        showIcon
        message="数据说明"
        description="白名单品牌为平台综合评估的信誉良好企业，黑名单为监管部门通报的不合格产品或品牌。数据定期更新，仅供参考，请以官方公布为准。"
        style={{ marginBottom: 24 }}
      />

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        size="large"
        style={{ marginBottom: 24 }}
      />

      <Spin spinning={loading}>
        {activeTab === 'whitelist' && (
          <div>
            <div className="safe-banner">
              <SafetyOutlined style={{ fontSize: 24 }} />
              <div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>
                  白名单品牌：{whitelist.length} 个
                </div>
                <div style={{ fontSize: 13, opacity: 0.9 }}>
                  这些品牌产品配方安全可靠，连续多年无质量问题，抽检全部合格
                </div>
              </div>
            </div>

            {whitelist.length > 0 ? (
              <div>
                {whitelist.map((item) => (
                  <Card
                    key={item.id}
                    style={{ marginBottom: 16, borderRadius: 12 }}
                    bodyStyle={{ padding: 24 }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                          <div
                            style={{
                              width: 48,
                              height: 48,
                              borderRadius: 12,
                              background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontSize: 24,
                            }}
                          >
                            <SafetyOutlined />
                          </div>
                          <div>
                            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
                              {item.brand.name}
                              <Tag color="gold" icon={<StarOutlined />} style={{ marginLeft: 8 }}>
                                白名单品牌
                              </Tag>
                            </h3>
                            <div style={{ fontSize: 13, color: '#8c8c8c', marginTop: 4 }}>
                              {item.brand.company}
                            </div>
                          </div>
                        </div>

                        <Descriptions column={2} size="small" style={{ marginBottom: 16 }}>
                          <Descriptions.Item label="入选时间">
                            {formatDate(item.addedAt)}
                          </Descriptions.Item>
                          <Descriptions.Item label="信用代码">
                            {item.brand.creditCode || '-'}
                          </Descriptions.Item>
                        </Descriptions>

                        <div style={{ marginBottom: 12 }}>
                          <div style={{ fontSize: 13, color: '#8c8c8c', marginBottom: 8 }}>
                            入选理由：
                          </div>
                          <div style={{ fontSize: 14, color: '#262626' }}>
                            {item.reason}
                          </div>
                        </div>

                        <div style={{ fontSize: 13, color: '#8c8c8c', marginBottom: 8 }}>
                          旗下安全产品（{item.brand.products.length}个）：
                        </div>
                        <Space wrap>
                          {item.brand.products.slice(0, 5).map(p => (
                            <Button
                              key={p.id}
                              type="primary"
                              ghost
                              size="small"
                              icon={<CheckCircleOutlined />}
                            >
                              {p.name}
                            </Button>
                          ))}
                        </Space>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Empty description="暂无白名单品牌" />
            )}
          </div>
        )}

        {activeTab === 'trust-rank' && (
          <div>
            <Alert
              type="success"
              showIcon
              message={`放心榜 TOP ${trustRank.length}`}
              description="根据综合放心指数排序，为您推荐最安全的儿童彩妆产品"
              style={{ marginBottom: 24 }}
            />

            {trustRank.length > 0 ? (
              <div>
                {trustRank.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    showRank={true}
                  />
                ))}
              </div>
            ) : (
              <Empty description="暂无放心榜数据" />
            )}
          </div>
        )}

        {activeTab === 'blacklist' && (
          <div>
            <div className="warning-banner">
              <ThunderboltOutlined style={{ fontSize: 24 }} />
              <div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>
                  黑名单记录：{blacklist.length} 条
                </div>
                <div style={{ fontSize: 13, opacity: 0.9 }}>
                  这些产品或品牌存在严重质量问题，请勿购买使用！
                </div>
              </div>
            </div>

            {blacklist.length > 0 ? (
              <List
                dataSource={blacklist}
                renderItem={(item) => (
                  <List.Item
                    style={{
                      padding: 20,
                      marginBottom: 16,
                      background: '#fff1f0',
                      border: '1px solid #ffccc7',
                      borderRadius: 12,
                    }}
                  >
                    <div style={{ width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: 12,
                            background: 'linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: 24,
                            flexShrink: 0,
                          }}
                        >
                          <CloseCircleOutlined />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <Tag color="red" icon={<WarningOutlined />}>
                              {item.type === 'brand' ? '问题品牌' : '问题产品'}
                            </Tag>
                            <Tag color="red">
                              {item.source}
                            </Tag>
                          </div>

                          <h3 style={{ margin: '0 0 8px 0', color: '#cf1322', fontSize: 16 }}>
                            {item.type === 'brand' ? item.brand?.name : item.product?.name}
                          </h3>

                          <div style={{ marginBottom: 12 }}>
                            <div style={{ fontSize: 13, color: '#8c8c8c', marginBottom: 4 }}>
                              处罚原因：
                            </div>
                            <div style={{ fontSize: 14, color: '#262626' }}>
                              {item.reason}
                            </div>
                          </div>

                          <Space wrap size={[0, 8]}>
                            <div style={{ width: '100%' }}>
                              <span style={{ fontSize: 12, color: '#8c8c8c' }}>
                                处罚日期：{formatDate(item.penaltyDate)}
                              </span>
                            </div>
                            {item.type === 'product' && item.product && (
                              <div style={{ width: '100%' }}>
                                <span style={{ fontSize: 12, color: '#8c8c8c' }}>
                                  备案号：{item.product.recordNumber}
                                </span>
                              </div>
                            )}
                          </Space>
                        </div>
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="暂无黑名单记录" />
            )}
          </div>
        )}
      </Spin>
    </div>
  );
};

export default RankPage;
