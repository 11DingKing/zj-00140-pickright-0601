import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Select,
  Input,
  Button,
  Space,
  Tag,
  Modal,
  message,
  Popconfirm,
  Row,
  Col,
  Statistic,
  Divider,
  List,
  Alert,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  WarningOutlined,
  SafetyOutlined,
  AlertOutlined,
} from '@ant-design/icons';
import type { AllergenProfile } from '../types';
import { ALLERGEN_TYPE_OPTIONS, SEVERITY_OPTIONS } from '../types';
import {
  getAllergenProfiles,
  addAllergenProfile,
  updateAllergenProfile,
  deleteAllergenProfile,
} from '../services/api';
import { useParent } from '../context/ParentContext';

const { Option } = Select;
const { TextArea } = Input;

const AllergenProfilePage: React.FC = () => {
  const [form] = Form.useForm();
  const [profiles, setProfiles] = useState<AllergenProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProfile, setEditingProfile] = useState<AllergenProfile | null>(null);
  const { parent, refreshParent } = useParent();

  const loadProfiles = async () => {
    try {
      setLoading(true);
      const res = await getAllergenProfiles();
      if (res.data.success) {
        setProfiles(res.data.data);
      }
    } catch (error) {
      message.error('加载过敏原档案失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);

      if (editingProfile) {
        await updateAllergenProfile(editingProfile.id, values);
        message.success('更新成功');
      } else {
        await addAllergenProfile(values);
        message.success('添加成功');
      }

      setModalVisible(false);
      form.resetFields();
      setEditingProfile(null);
      loadProfiles();
      refreshParent();
    } catch (error: any) {
      message.error(error.response?.data?.error || '操作失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteAllergenProfile(id);
      message.success('删除成功');
      loadProfiles();
      refreshParent();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleEdit = (profile: AllergenProfile) => {
    setEditingProfile(profile);
    form.setFieldsValue(profile);
    setModalVisible(true);
  };

  const handleAdd = () => {
    setEditingProfile(null);
    form.resetFields();
    setModalVisible(true);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case '严重':
        return 'red';
      case '中度':
        return 'orange';
      case '轻微':
        return 'gold';
      default:
        return 'default';
    }
  };

  const severeCount = profiles.filter((p) => p.severity === '严重').length;
  const moderateCount = profiles.filter((p) => p.severity === '中度').length;
  const mildCount = profiles.filter((p) => p.severity === '轻微').length;

  return (
    <div style={{ padding: 24 }}>
      <h1 className="page-title">
        <AlertOutlined style={{ marginRight: 8 }} />
        过敏原档案管理
      </h1>
      <p className="page-subtitle">
        记录孩子的过敏原信息，平台将自动避开含有这些成分的产品，并在搜索和推荐中给出醒目提醒
      </p>

      {parent && (
        <Alert
          type="info"
          showIcon
          message={`当前档案：${parent.childName}（${parent.childAge}岁）`}
          style={{ marginBottom: 24 }}
        />
      )}

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="严重过敏"
              value={severeCount}
              prefix={<WarningOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="中度过敏"
              value={moderateCount}
              prefix={<WarningOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="轻微过敏"
              value={mildCount}
              prefix={<SafetyOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="过敏原列表"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加过敏原
          </Button>
        }
      >
        {profiles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#8c8c8c' }}>
            <AlertOutlined style={{ fontSize: 48, marginBottom: 16 }} />
            <p>暂无过敏原档案</p>
            <p style={{ fontSize: 12 }}>点击上方按钮添加孩子的过敏原信息</p>
          </div>
        ) : (
          <List
            dataSource={profiles}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(item)}>
                    编辑
                  </Button>,
                  <Popconfirm
                    title="确定删除这条过敏原记录吗？"
                    onConfirm={() => handleDelete(item.id)}
                    okText="确定"
                    cancelText="取消"
                  >
                    <Button type="link" danger icon={<DeleteOutlined />}>
                      删除
                    </Button>
                  </Popconfirm>,
                ]}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      <span>{item.allergenName}</span>
                      <Tag color="blue">{item.allergenType}</Tag>
                      <Tag color={getSeverityColor(item.severity)}>{item.severity}</Tag>
                    </Space>
                  }
                  description={item.description || '暂无描述'}
                />
              </List.Item>
            )}
          />
        )}
      </Card>

      <Divider />

      <Alert
        type="warning"
        showIcon
        message="温馨提示"
        description={
          <div>
            <p>• 添加过敏原后，平台会在产品搜索、推荐、详情页面自动检测并给出醒目提醒</p>
            <p>• 严重过敏的成分会直接从推荐结果中排除</p>
            <p>• 请务必准确填写过敏原信息，以确保孩子的安全</p>
          </div>
        }
      />

      <Modal
        title={editingProfile ? '编辑过敏原' : '添加过敏原'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingProfile(null);
          form.resetFields();
        }}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ severity: '轻微' }}
        >
          <Form.Item
            name="allergenType"
            label="过敏原类型"
            rules={[{ required: true, message: '请选择过敏原类型' }]}
          >
            <Select placeholder="请选择过敏原类型">
              {ALLERGEN_TYPE_OPTIONS.map((opt) => (
                <Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="allergenName"
            label="过敏原名称"
            rules={[{ required: true, message: '请输入过敏原名称' }]}
          >
            <Input placeholder="例如：香精、人工色素、对羟基苯甲酸酯等" />
          </Form.Item>

          <Form.Item
            name="severity"
            label="严重程度"
            rules={[{ required: true, message: '请选择严重程度' }]}
          >
            <Select placeholder="请选择严重程度">
              {SEVERITY_OPTIONS.map((opt) => (
                <Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="description" label="过敏反应描述（可选）">
            <TextArea rows={3} placeholder="描述过敏症状，如：皮肤发红、瘙痒、皮疹等" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button
                onClick={() => {
                  setModalVisible(false);
                  setEditingProfile(null);
                  form.resetFields();
                }}
              >
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingProfile ? '更新' : '添加'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AllergenProfilePage;
