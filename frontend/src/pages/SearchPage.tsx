import React, { useState } from 'react';
import { Input, Select, Spin, Empty, Card, Tag, Alert, Space } from 'antd';
import {
  SearchOutlined,
  SafetyOutlined,
  WarningOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import ProductCard from '../components/ProductCard';
import { searchProducts, getCategories } from '../services/api';
import type { Product, Category } from '../types';
import { CATEGORY_OPTIONS } from '../types';

const { Search } = Input;
const { Option } = Select;

const SearchPage: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    getCategories().then((res) => {
      if (res.data.success) {
        setCategories(res.data.data);
      }
    }).catch(() => {});
  }, []);

  const handleSearch = async (value: string) => {
    if (!value.trim()) {
      return;
    }

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const res = await searchProducts(value.trim(), selectedCategory);
      if (res.data.success) {
        setProducts(res.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || '搜索失败，请稍后重试');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(keyword);
    }
  };

  const quickSearches = [
    { label: '口红', value: '口红' },
    { label: '眼影', value: '眼影' },
    { label: '腮红', value: '腮红' },
    { label: '指甲油', value: '指甲油' },
    { label: '童年色彩', value: '童年色彩' },
    { label: '天使之梦', value: '天使之梦' },
  ];

  const blacklistedCount = products.filter(p => p.isBlacklisted).length;
  const unregisteredCount = products.filter(p => !p.isRegistered && !p.isBlacklisted).length;

  return (
    <div>
      <h1 className="page-title">🔍 产品查询</h1>
      <p className="page-subtitle">
        输入产品名称或备案号，快速查询产品备案信息、安全指数和用户评价
      </p>

      <Card
        style={{
          marginBottom: 24,
          borderRadius: 16,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
        bodyStyle={{ padding: 32 }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <Select
              placeholder="选择品类"
              style={{ width: 160 }}
              allowClear
              value={selectedCategory}
              onChange={setSelectedCategory}
              size="large"
            >
              {CATEGORY_OPTIONS.map(opt => (
                <Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Option>
              ))}
            </Select>
            <Search
              placeholder="输入产品名称、品牌或备案号..."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onSearch={handleSearch}
              onKeyPress={handleKeyPress}
              style={{ flex: 1 }}
            />
          </div>

          <div>
            <span style={{ color: 'rgba(255,255,255,0.8)', marginRight: 12, fontSize: 13 }}>
              快捷搜索：
            </span>
            {quickSearches.map(item => (
              <Tag
                key={item.value}
                onClick={() => {
                  setKeyword(item.value);
                  handleSearch(item.value);
                }}
                style={{
                  cursor: 'pointer',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: 12,
                }}
              >
                {item.label}
              </Tag>
            ))}
          </div>
        </Space>
      </Card>

      {error && (
        <Alert
          type="error"
          message={error}
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      {searched && products.length > 0 && (
        <Alert
          type={blacklistedCount > 0 ? 'warning' : 'success'}
          message={
            <Space>
              <span>找到 <strong>{products.length}</strong> 个相关产品</span>
              {blacklistedCount > 0 && (
                <Tag color="red" icon={<WarningOutlined />}>
                  {blacklistedCount} 个黑名单产品
                </Tag>
              )}
              {unregisteredCount > 0 && (
                <Tag color="orange" icon={<InfoCircleOutlined />}>
                  {unregisteredCount} 个未在册产品
                </Tag>
              )}
            </Space>
          }
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      <Spin spinning={loading} tip="正在搜索...">
        {!searched ? (
          <div className="search-result-empty">
            <SafetyOutlined style={{ fontSize: 64, color: '#52c41a', marginBottom: 16 }} />
            <h3 style={{ marginBottom: 8 }}>帮家长擦亮眼睛</h3>
            <p>
              输入产品名称、品牌或备案号开始查询<br />
              支持扫备案号查询，快速识别三无产品和问题产品
            </p>
          </div>
        ) : products.length > 0 ? (
          <div>
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="search-result-empty">
            <Empty
              description={
                <span>
                  未找到相关产品<br />
                  <span style={{ color: '#8c8c8c', fontSize: 13 }}>
                    可能未在监管部门备案，请谨慎购买
                  </span>
                </span>
              }
            />
          </div>
        )}
      </Spin>
    </div>
  );
};

export default SearchPage;
