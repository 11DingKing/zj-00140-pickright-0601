import React, { useState, useEffect } from 'react';
import { Card, List, Tag, Button, Space, message, Empty, Tabs, Badge, Divider } from 'antd';
import {
  BellOutlined,
  WarningOutlined,
  StopOutlined,
  AlertOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  ClearOutlined,
} from '@ant-design/icons';
import type { Notification } from '../types';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useParent } from '../context/ParentContext';

const NotificationPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();
  const { refreshParent, refreshUnreadCount } = useParent();

  const loadNotifications = async (unreadOnly = false) => {
    try {
      setLoading(true);
      const res = await getNotifications(unreadOnly);
      if (res.data.success) {
        setNotifications(res.data.data);
      }
    } catch (error) {
      message.error('加载通知列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications(activeTab === 'unread');
  }, [activeTab]);

  const handleMarkRead = async (id: number) => {
    try {
      await markNotificationRead(id);
      loadNotifications(activeTab === 'unread');
      refreshUnreadCount();
      refreshParent();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      message.success('已全部标记为已读');
      loadNotifications(false);
      setActiveTab('all');
      refreshUnreadCount();
      refreshParent();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'allergen_warning':
        return <AlertOutlined style={{ color: '#ff4d4f', fontSize: 20 }} />;
      case 'adverse_reaction':
        return <WarningOutlined style={{ color: '#fa8c16', fontSize: 20 }} />;
      case 'inspection_failed':
        return <StopOutlined style={{ color: '#ff4d4f', fontSize: 20 }} />;
      default:
        return <BellOutlined style={{ color: '#1890ff', fontSize: 20 }} />;
    }
  };

  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case 'allergen_warning':
        return { label: '过敏原警告', color: 'red' };
      case 'adverse_reaction':
        return { label: '不良反应通报', color: 'orange' };
      case 'inspection_failed':
        return { label: '抽检不合格', color: 'red' };
      default:
        return { label: '系统通知', color: 'blue' };
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const allergenWarningCount = notifications.filter((n) => n.type === 'allergen_warning').length;
  const adverseReactionCount = notifications.filter((n) => n.type === 'adverse_reaction').length;
  const inspectionFailedCount = notifications.filter((n) => n.type === 'inspection_failed').length;

  const tabItems = [
    {
      key: 'all',
      label: (
        <span>
          全部
          {notifications.length > 0 && (
            <Badge count={notifications.length} size="small" style={{ marginLeft: 8 }} />
          )}
        </span>
      ),
    },
    {
      key: 'unread',
      label: (
        <span>
          未读
          {unreadCount > 0 && <Badge count={unreadCount} size="small" style={{ marginLeft: 8 }} />}
        </span>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>
            <BellOutlined style={{ marginRight: 8 }} />
            消息通知
          </h1>
          <p className="page-subtitle" style={{ margin: '4px 0 0 0' }}>
            查看产品不良反应通报、抽检不合格提醒和过敏原警告
          </p>
        </div>
        <Space>
          <Button icon={<ClearOutlined />} onClick={handleMarkAllRead} disabled={unreadCount === 0}>
            全部标记已读
          </Button>
        </Space>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <Badge count={allergenWarningCount} size="small">
          <Tag color="red" icon={<AlertOutlined />}>
            过敏原警告
          </Tag>
        </Badge>
        <Badge count={adverseReactionCount} size="small">
          <Tag color="orange" icon={<WarningOutlined />}>
            不良反应通报
          </Tag>
        </Badge>
        <Badge count={inspectionFailedCount} size="small">
          <Tag color="red" icon={<StopOutlined />}>
            抽检不合格
          </Tag>
        </Badge>
      </div>

      <Card bodyStyle={{ padding: 0 }} loading={loading}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          style={{ padding: '0 24px' }}
        />

        <Divider style={{ margin: 0 }} />

        {notifications.length === 0 ? (
          <div style={{ padding: '60px 0' }}>
            <Empty
              description={
                <div>
                  <p>暂无{activeTab === 'unread' ? '未读' : ''}通知</p>
                  <p style={{ fontSize: 12, color: '#8c8c8c' }}>
                    当您订阅的产品有新的不良反应通报或抽检不合格时，会在这里显示
                  </p>
                </div>
              }
            />
          </div>
        ) : (
          <List
            dataSource={notifications}
            renderItem={(item) => {
              const typeInfo = getNotificationTypeLabel(item.type);
              return (
                <List.Item
                  style={{
                    padding: '16px 24px',
                    backgroundColor: item.isRead ? 'transparent' : '#f0f5ff',
                    borderBottom: '1px solid #f0f0f0',
                  }}
                  actions={[
                    item.product && (
                      <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => navigate(`/product/${item.productId}`)}
                      >
                        查看产品
                      </Button>
                    ),
                    !item.isRead && (
                      <Button
                        type="link"
                        icon={<CheckCircleOutlined />}
                        onClick={() => handleMarkRead(item.id)}
                      >
                        标记已读
                      </Button>
                    ),
                  ].filter(Boolean)}
                >
                  <List.Item.Meta
                    avatar={
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          backgroundColor: typeInfo.color + '15',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {getNotificationIcon(item.type)}
                      </div>
                    }
                    title={
                      <Space>
                        <span style={{ fontWeight: item.isRead ? 400 : 600 }}>{item.title}</span>
                        {!item.isRead && <Badge dot color="red" />}
                        <Tag color={typeInfo.color as any}>{typeInfo.label}</Tag>
                      </Space>
                    }
                    description={
                      <div>
                        <div style={{ color: '#595959', marginBottom: 4 }}>{item.content}</div>
                        {item.product && (
                          <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                            相关产品：{item.product.name}
                          </div>
                        )}
                        <div
                          style={{
                            fontSize: 12,
                            color: '#bfbfbf',
                            marginTop: 4,
                          }}
                        >
                          {new Date(item.createdAt).toLocaleString('zh-CN')}
                        </div>
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

export default NotificationPage;
