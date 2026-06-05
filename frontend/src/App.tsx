import React from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import {
  SearchOutlined,
  TrophyOutlined,
  ThunderboltOutlined,
  StarOutlined,
  FormOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import SearchPage from './pages/SearchPage';
import RankPage from './pages/RankPage';
import RecommendPage from './pages/RecommendPage';
import ReviewPage from './pages/ReviewPage';
import ProductDetailPage from './pages/ProductDetailPage';

const { Header, Content } = Layout;

const App: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getSelectedKey = () => {
    if (location.pathname.startsWith('/search')) return 'search';
    if (location.pathname.startsWith('/rank')) return 'rank';
    if (location.pathname.startsWith('/recommend')) return 'recommend';
    if (location.pathname.startsWith('/reviews')) return 'reviews';
    return 'search';
  };

  const menuItems = [
    {
      key: 'search',
      icon: <SearchOutlined />,
      label: '产品查询',
      onClick: () => navigate('/search'),
    },
    {
      key: 'rank',
      icon: <TrophyOutlined />,
      label: '放心榜与黑榜',
      onClick: () => navigate('/rank'),
    },
    {
      key: 'recommend',
      icon: <ThunderboltOutlined />,
      label: '按需推荐',
      onClick: () => navigate('/recommend'),
    },
    {
      key: 'reviews',
      icon: <FormOutlined />,
      label: '我的评价反馈',
      onClick: () => navigate('/reviews'),
    },
  ];

  return (
    <Layout>
      <Header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            color: 'white',
            cursor: 'pointer',
          }}
          onClick={() => navigate('/')}
        >
          <ShoppingOutlined style={{ fontSize: 28 }} />
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.2 }}>PickRight</div>
            <div style={{ fontSize: 11, opacity: 0.9, lineHeight: 1.2 }}>
              儿童彩妆选购助手
            </div>
          </div>
        </div>

        <Menu
          mode="horizontal"
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
          style={{
            minWidth: 500,
            justifyContent: 'flex-end',
          }}
        />
      </Header>

      <Content style={{ marginTop: 0 }}>
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/rank" element={<RankPage />} />
          <Route path="/recommend" element={<RecommendPage />} />
          <Route path="/reviews" element={<ReviewPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
        </Routes>
      </Content>
    </Layout>
  );
};

export default App;
