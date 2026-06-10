import React from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { Layout, Menu, Badge, Dropdown, Space, Avatar } from "antd";
import {
  SearchOutlined,
  TrophyOutlined,
  ThunderboltOutlined,
  StarOutlined,
  FormOutlined,
  ShoppingOutlined,
  BellOutlined,
  AlertOutlined,
  BellFilled,
  UserOutlined,
} from "@ant-design/icons";
import SearchPage from "./pages/SearchPage";
import RankPage from "./pages/RankPage";
import RecommendPage from "./pages/RecommendPage";
import ReviewPage from "./pages/ReviewPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import AllergenProfilePage from "./pages/AllergenProfilePage";
import SubscriptionPage from "./pages/SubscriptionPage";
import NotificationPage from "./pages/NotificationPage";
import { useParent } from "./context/ParentContext";

const { Header, Content } = Layout;

const App: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { unreadCount, parent } = useParent();

  const getSelectedKey = () => {
    if (location.pathname.startsWith("/search")) return "search";
    if (location.pathname.startsWith("/rank")) return "rank";
    if (location.pathname.startsWith("/recommend")) return "recommend";
    if (location.pathname.startsWith("/reviews")) return "reviews";
    if (location.pathname.startsWith("/allergen")) return "allergen";
    if (location.pathname.startsWith("/subscriptions")) return "subscriptions";
    return "search";
  };

  const menuItems = [
    {
      key: "search",
      icon: <SearchOutlined />,
      label: "产品查询",
      onClick: () => navigate("/search"),
    },
    {
      key: "rank",
      icon: <TrophyOutlined />,
      label: "放心榜与黑榜",
      onClick: () => navigate("/rank"),
    },
    {
      key: "recommend",
      icon: <ThunderboltOutlined />,
      label: "按需推荐",
      onClick: () => navigate("/recommend"),
    },
    {
      key: "reviews",
      icon: <FormOutlined />,
      label: "我的评价反馈",
      onClick: () => navigate("/reviews"),
    },
    {
      key: "allergen",
      icon: <AlertOutlined />,
      label: "过敏原设置",
      onClick: () => navigate("/allergen"),
    },
    {
      key: "subscriptions",
      icon: <BellOutlined />,
      label: "我的订阅",
      onClick: () => navigate("/subscriptions"),
    },
  ];

  const userMenuItems = [
    {
      key: "notifications",
      icon: <BellOutlined />,
      label: (
        <span>
          消息中心
          {unreadCount > 0 && (
            <Badge count={unreadCount} size="small" style={{ marginLeft: 8 }} />
          )}
        </span>
      ),
      onClick: () => navigate("/notifications"),
    },
    {
      key: "allergen",
      icon: <AlertOutlined />,
      label: "过敏原设置",
      onClick: () => navigate("/allergen"),
    },
    {
      key: "subscriptions",
      icon: <BellOutlined />,
      label: "我的订阅",
      onClick: () => navigate("/subscriptions"),
    },
  ];

  return (
    <Layout>
      <Header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              color: "white",
              cursor: "pointer",
            }}
            onClick={() => navigate("/")}
          >
            <ShoppingOutlined style={{ fontSize: 28 }} />
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.2 }}>
                PickRight
              </div>
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
              minWidth: 600,
              marginLeft: 24,
              background: "transparent",
              borderBottom: "none",
            }}
            theme="dark"
          />
        </div>

        <Space size={16}>
          <Badge count={unreadCount} size="small" offset={[-2, 2]}>
            <BellFilled
              style={{ fontSize: 20, color: "white", cursor: "pointer" }}
              onClick={() => navigate("/notifications")}
            />
          </Badge>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space style={{ cursor: "pointer", color: "white" }}>
              <Avatar size="small" icon={<UserOutlined />} />
              <span>{parent?.childName || "用户"}</span>
            </Space>
          </Dropdown>
        </Space>
      </Header>

      <Content style={{ marginTop: 0 }}>
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/rank" element={<RankPage />} />
          <Route path="/recommend" element={<RecommendPage />} />
          <Route path="/reviews" element={<ReviewPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/allergen" element={<AllergenProfilePage />} />
          <Route path="/subscriptions" element={<SubscriptionPage />} />
          <Route path="/notifications" element={<NotificationPage />} />
        </Routes>
      </Content>
    </Layout>
  );
};

export default App;
