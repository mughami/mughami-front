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

// Mobile Tournament Card Component
const TournamentMobileCard: React.FC<{
  tournament: Tournament;
  onEdit: (tournament: Tournament) => void;
  onDelete: (id: number) => void;
  getStatusTag: (status: TournamentStatus) => React.ReactNode;
}> = ({ tournament, onEdit, onDelete, getStatusTag }) => {
  return (
    <Card className="mb-3 shadow-sm" size="small">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <Text strong className="block text-sm line-clamp-2 mb-1">
              {tournament.description}
            </Text>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <TrophyOutlined className="text-yellow-500" />
              <span className="truncate">{tournament.quiz.quizName}</span>
            </div>
          </div>
          {getStatusTag(tournament.status)}
        </div>

        {/* Info Row */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <Tag className="text-xs">{tournament.authorUsername}</Tag>
          <span className="flex items-center gap-1">
            <ClockCircleOutlined />
            {dayjs(tournament.startDate).format('DD/MM/YY HH:mm')}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => onEdit(tournament)}
            size="small"
            className="!px-0"
          >
            რედაქტირება
          </Button>
          <Popconfirm
            title="დარწმუნებული ხართ?"
            description="გსურთ ამ ტურნირის წაშლა?"
            onConfirm={() => onDelete(tournament.id)}
            okText="დიახ"
            cancelText="არა"
          >
            <Button type="link" danger icon={<DeleteOutlined />} size="small" className="!px-0">
              წაშლა
            </Button>
          </Popconfirm>
        </div>
      </div>
    </Card>
  );
};

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
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
        labelShort: 'მალე',
        icon: <ClockCircleOutlined />,
      },
      [TournamentStatus.STARTED]: {
        color: 'green',
        label: 'მიმდინარე',
        labelShort: 'LIVE',
        icon: <PlayCircleOutlined />,
      },
      [TournamentStatus.FINISHED]: {
        color: 'default',
        label: 'დასრულებული',
        labelShort: 'დასრულდა',
        icon: <CheckCircleOutlined />,
      },
    };
    const c = config[status];
    return (
      <Tag color={c?.color} icon={c?.icon} className="!m-0">
        <span className="hidden sm:inline">{c?.label}</span>
        <span className="sm:hidden">{c?.labelShort}</span>
      </Tag>
    );
  };

  const columns = [
    {
      title: 'აღწერა',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text: string) => (
        <Text strong className="line-clamp-2 text-xs sm:text-sm">
          {text}
        </Text>
      ),
    },
    {
      title: 'ვიქტორინა',
      key: 'quiz',
      ellipsis: true,
      responsive: ['md'] as ('md' | 'sm' | 'lg' | 'xl' | 'xxl' | 'xs')[],
      render: (record: Tournament) => (
        <div className="flex items-center gap-2">
          <TrophyOutlined className="text-yellow-500 flex-shrink-0" />
          <Text className="truncate text-xs sm:text-sm">{record.quiz.quizName}</Text>
        </div>
      ),
    },
    {
      title: 'ავტორი',
      dataIndex: 'authorUsername',
      key: 'authorUsername',
      responsive: ['lg'] as ('md' | 'sm' | 'lg' | 'xl' | 'xxl' | 'xs')[],
      render: (text: string) => <Tag className="text-xs">{text}</Tag>,
    },
    {
      title: 'დაწყება',
      dataIndex: 'startDate',
      key: 'startDate',
      responsive: ['sm'] as ('md' | 'sm' | 'lg' | 'xl' | 'xxl' | 'xs')[],
      render: (date: string) => (
        <Text className="text-xs sm:text-sm whitespace-nowrap">
          {dayjs(date).format('DD/MM/YY HH:mm')}
        </Text>
      ),
    },
    {
      title: 'სტატუსი',
      dataIndex: 'status',
      key: 'status',
      render: (status: TournamentStatus) => getStatusTag(status),
    },
    {
      title: '',
      key: 'actions',
      width: isMobile ? 80 : 200,
      render: (record: Tournament) => (
        <Space size="small" className="flex-wrap">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
            className="!px-1"
          >
            <span className="hidden lg:inline">რედაქტირება</span>
          </Button>
          <Popconfirm
            title="დარწმუნებული ხართ?"
            description="გსურთ ამ ტურნირის წაშლა?"
            onConfirm={() => handleDelete(record.id)}
            okText="დიახ"
            cancelText="არა"
          >
            <Button type="link" danger icon={<DeleteOutlined />} size="small" className="!px-1">
              <span className="hidden lg:inline">წაშლა</span>
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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <Title level={2} className="!mb-0 !text-xl sm:!text-2xl">
          ტურნირების მართვა
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingTournament(null);
            form.resetFields();
            setIsModalVisible(true);
          }}
          size={isMobile ? 'middle' : 'large'}
          className="w-full sm:w-auto"
        >
          ახალი ტურნირი
        </Button>
      </div>

      {/* Statistics */}
      <Row gutter={[8, 8]} className="sm:gutter-16">
        <Col xs={12} sm={12} md={6}>
          <Card size="small" className="h-full">
            <Statistic
              title={<span className="text-xs sm:text-sm">სულ</span>}
              value={totalTournaments}
              prefix={<TrophyOutlined className="text-sm sm:text-base" />}
              valueStyle={{ color: '#1890ff', fontSize: isMobile ? '18px' : '24px' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card size="small" className="h-full">
            <Statistic
              title={<span className="text-xs sm:text-sm">დასაწყები</span>}
              value={toStartCount}
              prefix={<ClockCircleOutlined className="text-sm sm:text-base" />}
              valueStyle={{ color: '#1890ff', fontSize: isMobile ? '18px' : '24px' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card size="small" className="h-full">
            <Statistic
              title={<span className="text-xs sm:text-sm">მიმდინარე</span>}
              value={startedCount}
              prefix={<PlayCircleOutlined className="text-sm sm:text-base" />}
              valueStyle={{ color: '#52c41a', fontSize: isMobile ? '18px' : '24px' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card size="small" className="h-full">
            <Statistic
              title={<span className="text-xs sm:text-sm">დასრულებული</span>}
              value={finishedCount}
              prefix={<CheckCircleOutlined className="text-sm sm:text-base" />}
              valueStyle={{ color: '#999', fontSize: isMobile ? '18px' : '24px' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filter and Content */}
      <Card size={isMobile ? 'small' : 'default'}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
          <Text strong className="text-sm">
            ფილტრი:
          </Text>
          <Select
            placeholder="სტატუსი"
            allowClear
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(val);
              setCurrentPage(1);
            }}
            className="w-full sm:w-48"
            size={isMobile ? 'middle' : 'large'}
          >
            <Option value={TournamentStatus.TO_START}>დასაწყები</Option>
            <Option value={TournamentStatus.STARTED}>მიმდინარე</Option>
            <Option value={TournamentStatus.FINISHED}>დასრულებული</Option>
          </Select>
        </div>

        {/* Mobile Card View */}
        {isMobile ? (
          <div>
            {loading ? (
              <div className="text-center py-8 text-gray-500">იტვირთება...</div>
            ) : tournaments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">ტურნირები არ მოიძებნა</div>
            ) : (
              <>
                {tournaments.map((tournament) => (
                  <TournamentMobileCard
                    key={tournament.id}
                    tournament={tournament}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    getStatusTag={getStatusTag}
                  />
                ))}
                {/* Simple Pagination for Mobile */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <Button
                    size="small"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    წინა
                  </Button>
                  <span className="text-xs text-gray-500">
                    გვერდი {currentPage} / {Math.ceil(totalTournaments / pageSize) || 1}
                  </span>
                  <Button
                    size="small"
                    disabled={currentPage >= Math.ceil(totalTournaments / pageSize)}
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    შემდეგი
                  </Button>
                </div>
              </>
            )}
          </div>
        ) : (
          /* Desktop Table View */
          <Table
            columns={columns}
            dataSource={tournaments}
            rowKey="id"
            loading={loading}
            size="middle"
            scroll={{ x: 600 }}
            pagination={{
              current: currentPage,
              pageSize,
              total: totalTournaments,
              showSizeChanger: true,
              showQuickJumper: !isMobile,
              showTotal: (total, range) => `${range[0]}-${range[1]} ${total} ტურნირიდან`,
              size: 'default',
            }}
            onChange={(pagination) => {
              setCurrentPage(pagination.current || 1);
              setPageSize(pagination.pageSize || pageSize);
            }}
          />
        )}
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
        width={isMobile ? '100%' : 600}
        style={isMobile ? { top: 20, maxWidth: 'calc(100% - 32px)', margin: '0 auto' } : undefined}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            status: TournamentStatus.TO_START,
          }}
          size={isMobile ? 'middle' : 'large'}
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
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
              <Button
                onClick={() => {
                  setIsModalVisible(false);
                  setEditingTournament(null);
                }}
                className="w-full sm:w-auto"
              >
                გაუქმება
              </Button>
              <Button type="primary" htmlType="submit" loading={loading} className="w-full sm:w-auto">
                {editingTournament ? 'განახლება' : 'შექმნა'}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
