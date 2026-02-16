import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Space,
  Card,
  Typography,
  Popconfirm,
  Tag,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useTournamentStore } from '../../store/tournamentStore';
import { useQuizStore } from '../../store/quizStore';
import { TournamentStatus } from '../../types';
import type { Tournament, CreateTournamentRequest } from '../../types';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface FormValues {
  description: string;
  quizId: number;
  startDate: dayjs.Dayjs;
  status: TournamentStatus;
}

export const Tournaments: React.FC = () => {
  const {
    tournaments,
    loading,
    totalTournaments,
    fetchAdminTournaments,
    createTournament,
    updateTournament,
    deleteTournament,
  } = useTournamentStore();

  const { quizzes, fetchAdminQuizzes } = useQuizStore();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
  const [form] = Form.useForm<FormValues>();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [statusFilter, setStatusFilter] = useState<TournamentStatus | undefined>(undefined);

  useEffect(() => {
    fetchAdminTournaments(currentPage - 1, pageSize, statusFilter);
  }, [fetchAdminTournaments, currentPage, pageSize, statusFilter]);

  useEffect(() => {
    fetchAdminQuizzes(0, 100);
  }, [fetchAdminQuizzes]);

  const handleCreate = async (values: FormValues) => {
    try {
      const data: CreateTournamentRequest = {
        description: values.description,
        quizId: values.quizId,
        startDate: values.startDate.toISOString(),
        status: values.status,
      };
      await createTournament(data);
      message.success('ტურნირი წარმატებით შეიქმნა!');
      setIsModalVisible(false);
      form.resetFields();
      fetchAdminTournaments(currentPage - 1, pageSize, statusFilter);
    } catch {
      message.error('ტურნირის შექმნისას მოხდა შეცდომა');
    }
  };

  const handleUpdate = async (values: FormValues) => {
    if (!editingTournament) return;
    try {
      await updateTournament(editingTournament.id, {
        description: values.description,
        quizId: values.quizId,
        startDate: values.startDate.toISOString(),
        status: values.status,
      });
      message.success('ტურნირი წარმატებით განახლდა!');
      setIsModalVisible(false);
      setEditingTournament(null);
      form.resetFields();
      fetchAdminTournaments(currentPage - 1, pageSize, statusFilter);
    } catch {
      message.error('ტურნირის განახლებისას მოხდა შეცდომა');
    }
  };

  const handleSubmit = async (values: FormValues) => {
    if (editingTournament) {
      return handleUpdate(values);
    }
    return handleCreate(values);
  };

  const handleEdit = (tournament: Tournament) => {
    setEditingTournament(tournament);
    form.setFieldsValue({
      description: tournament.description,
      quizId: tournament.quiz.quizId,
      startDate: dayjs(tournament.startDate),
      status: tournament.status,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (tournamentId: number) => {
    try {
      await deleteTournament(tournamentId);
      message.success('ტურნირი წარმატებით წაიშალა!');
      fetchAdminTournaments(currentPage - 1, pageSize, statusFilter);
    } catch {
      message.error('ტურნირის წაშლისას მოხდა შეცდომა');
    }
  };

  const getStatusTag = (status: TournamentStatus) => {
    const config = {
      [TournamentStatus.TO_START]: {
        color: 'blue',
        label: 'დასაწყები',
        icon: <ClockCircleOutlined />,
      },
      [TournamentStatus.STARTED]: { color: 'green', label: 'მიმდინარე', icon: <PlayCircleOutlined /> },
      [TournamentStatus.FINISHED]: {
        color: 'default',
        label: 'დასრულებული',
        icon: <CheckCircleOutlined />,
      },
    };
    const c = config[status];
    return (
      <Tag color={c?.color} icon={c?.icon}>
        {c?.label}
      </Tag>
    );
  };

  const columns = [
    {
      title: 'აღწერა',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => (
        <Text strong className="line-clamp-2">
          {text}
        </Text>
      ),
    },
    {
      title: 'ვიქტორინა',
      key: 'quiz',
      render: (record: Tournament) => (
        <div className="flex items-center gap-2">
          <TrophyOutlined className="text-yellow-500" />
          <Text>{record.quiz.quizName}</Text>
        </div>
      ),
    },
    {
      title: 'ავტორი',
      dataIndex: 'authorUsername',
      key: 'authorUsername',
      render: (text: string) => <Tag>{text}</Tag>,
    },
    {
      title: 'დაწყების დრო',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date: string) => <Text>{dayjs(date).format('DD/MM/YYYY HH:mm')}</Text>,
    },
    {
      title: 'სტატუსი',
      dataIndex: 'status',
      key: 'status',
      render: (status: TournamentStatus) => getStatusTag(status),
    },
    {
      title: 'ქმედებები',
      key: 'actions',
      render: (record: Tournament) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)} size="small">
            რედაქტირება
          </Button>
          <Popconfirm
            title="დარწმუნებული ხართ?"
            description="გსურთ ამ ტურნირის წაშლა?"
            onConfirm={() => handleDelete(record.id)}
            okText="დიახ"
            cancelText="არა"
          >
            <Button type="link" danger icon={<DeleteOutlined />} size="small">
              წაშლა
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const toStartCount = tournaments.filter((t) => t.status === TournamentStatus.TO_START).length;
  const startedCount = tournaments.filter((t) => t.status === TournamentStatus.STARTED).length;
  const finishedCount = tournaments.filter((t) => t.status === TournamentStatus.FINISHED).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <Title level={2}>ტურნირების მართვა</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingTournament(null);
            form.resetFields();
            setIsModalVisible(true);
          }}
          size="large"
        >
          ახალი ტურნირი
        </Button>
      </div>

      {/* Statistics */}
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="სულ ტურნირი"
              value={totalTournaments}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="დასაწყები"
              value={toStartCount}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="მიმდინარე"
              value={startedCount}
              prefix={<PlayCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="დასრულებული"
              value={finishedCount}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#999' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filter */}
      <Card>
        <div className="flex items-center gap-4 mb-4">
          <Text strong>ფილტრი:</Text>
          <Select
            placeholder="სტატუსი"
            allowClear
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(val);
              setCurrentPage(1);
            }}
            style={{ width: 200 }}
          >
            <Option value={TournamentStatus.TO_START}>დასაწყები</Option>
            <Option value={TournamentStatus.STARTED}>მიმდინარე</Option>
            <Option value={TournamentStatus.FINISHED}>დასრულებული</Option>
          </Select>
        </div>

        <Table
          columns={columns}
          dataSource={tournaments}
          rowKey="id"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize,
            total: totalTournaments,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} ${total} ტურნირიდან`,
          }}
          onChange={(pagination) => {
            setCurrentPage(pagination.current || 1);
            setPageSize(pagination.pageSize || pageSize);
          }}
        />
      </Card>

      {/* Create / Edit Modal */}
      <Modal
        title={editingTournament ? 'ტურნირის რედაქტირება' : 'ახალი ტურნირი'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingTournament(null);
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            status: TournamentStatus.TO_START,
          }}
        >
          <Form.Item
            name="description"
            label="აღწერა"
            rules={[{ required: true, message: 'გთხოვთ შეიყვანოთ აღწერა' }]}
          >
            <TextArea rows={3} placeholder="ტურნირის აღწერა..." />
          </Form.Item>

          <Form.Item
            name="quizId"
            label="ვიქტორინა"
            rules={[{ required: true, message: 'გთხოვთ აირჩიოთ ვიქტორინა' }]}
          >
            <Select
              placeholder="აირჩიეთ ვიქტორინა"
              showSearch
              filterOption={(input, option) =>
                (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase()) ??
                false
              }
            >
              {quizzes
                .filter((q) => q.quizStatus === 'VERIFIED')
                .map((quiz) => (
                  <Option key={quiz.quizId} value={quiz.quizId}>
                    {quiz.quizName}
                  </Option>
                ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="startDate"
            label="დაწყების დრო"
            rules={[{ required: true, message: 'გთხოვთ აირჩიოთ დაწყების დრო' }]}
          >
            <DatePicker
              showTime
              format="DD/MM/YYYY HH:mm"
              className="w-full"
              placeholder="აირჩიეთ თარიღი და დრო"
            />
          </Form.Item>

          <Form.Item
            name="status"
            label="სტატუსი"
            rules={[{ required: true, message: 'გთხოვთ აირჩიოთ სტატუსი' }]}
          >
            <Select>
              <Option value={TournamentStatus.TO_START}>დასაწყები</Option>
              <Option value={TournamentStatus.STARTED}>მიმდინარე</Option>
              <Option value={TournamentStatus.FINISHED}>დასრულებული</Option>
            </Select>
          </Form.Item>

          <Form.Item className="mb-0">
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingTournament ? 'განახლება' : 'შექმნა'}
              </Button>
              <Button
                onClick={() => {
                  setIsModalVisible(false);
                  setEditingTournament(null);
                }}
              >
                გაუქმება
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
