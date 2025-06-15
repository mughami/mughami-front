import { useState } from 'react';
import { Button, Table, Card, Modal, Form, Input, message, Progress, Popconfirm } from 'antd';
import { PlusOutlined, EyeOutlined, DeleteOutlined, FormOutlined } from '@ant-design/icons';
import { usePollStore } from '../../store/pollStore';
import type { Poll, PollOption } from '../../services/api/pollService';
import type { ColumnType } from 'rc-table/lib/interface';
import type { AlignType } from 'rc-table/lib/interface';

export const Polls = () => {
  const { polls, loading, fetchPolls, createPoll, deletePoll } = usePollStore();
  const [isPollModalVisible, setIsPollModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [viewingPoll, setViewingPoll] = useState<Poll | null>(null);
  const [pollForm] = Form.useForm();

  const showPollModal = () => {
    setIsPollModalVisible(true);
  };

  const handlePollCancel = () => {
    setIsPollModalVisible(false);
    pollForm.resetFields();
  };

  const handlePollSubmit = async () => {
    try {
      const values = await pollForm.validateFields();
      await createPoll({
        name: values.title,
        options: values.options.map((option: string) => ({ name: option })),
      });

      message.success('გამოკითხვა წარმატებით დაემატა');
      setIsPollModalVisible(false);
      pollForm.resetFields();
      fetchPolls(0, 10);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleDeletePoll = async (id: number) => {
    try {
      await deletePoll(id);
      message.success('გამოკითხვა წარმატებით წაიშალა');
      fetchPolls(0, 10);
    } catch {
      message.error('შეცდომა გამოკითხვის წაშლისას');
    }
  };

  const handleViewPoll = (poll: Poll) => {
    setViewingPoll(poll);
    setIsViewModalVisible(true);
  };

  const handleViewCancel = () => {
    setIsViewModalVisible(false);
    setViewingPoll(null);
  };

  const getTotalVotes = (options: PollOption[]) => {
    return options.reduce((sum, option) => sum + option.result, 0);
  };

  const calculatePercentage = (votes: number, total: number) => {
    return total === 0 ? 0 : Math.round((votes / total) * 100);
  };

  const columns: ColumnType<Poll>[] = [
    {
      title: 'დასახელება',
      dataIndex: 'title',
      key: 'title',
      render: (title: string) => (
        <div className="flex items-center">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
            <FormOutlined className="text-primary" />
          </div>
          <span className="font-medium text-gray-800 break-words">{title}</span>
        </div>
      ),
    },
    {
      title: 'ვარიანტები',
      dataIndex: 'options',
      key: 'options',
      render: (options: PollOption[]) => (
        <div className="space-y-2">
          {options.map((option) => (
            <div
              key={option.id}
              className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg"
            >
              <span className="text-gray-700 break-words mr-2">{option.name}</span>
              <div className="flex items-center flex-shrink-0">
                <span className="text-sm text-gray-500 mr-2 hidden sm:inline">
                  {option.result} ხმა
                </span>
                <div className="w-16">
                  <Progress
                    percent={calculatePercentage(option.result, getTotalVotes(options))}
                    showInfo={false}
                    strokeColor="#1890ff"
                    size="small"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: 'მოქმედებები',
      key: 'actions',
      align: 'right' as AlignType,
      render: (_: unknown, record: Poll) => (
        <div className="flex justify-end gap-2">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewPoll(record)}
            className="hover:text-primary"
          >
            <span className="hidden sm:inline">ნახვა</span>
          </Button>
          <Popconfirm
            title="გამოკითხვის წაშლა"
            description="დარწმუნებული ხართ რომ გსურთ ამ გამოკითხვის წაშლა?"
            onConfirm={() => handleDeletePoll(record.id)}
            okText="დიახ"
            cancelText="არა"
          >
            <Button type="text" danger icon={<DeleteOutlined />} className="hover:text-red-500">
              <span className="hidden sm:inline">წაშლა</span>
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">გამოკითხვები</h2>
          <p className="text-gray-500 mt-1">მართეთ საიტზე არსებული გამოკითხვები</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={showPollModal}
          size="large"
          className="bg-primary hover:bg-primary-dark w-full sm:w-auto"
        >
          <span className="hidden sm:inline">ახალი გამოკითხვა</span>
          <span className="sm:hidden">დამატება</span>
        </Button>
      </div>
      <Card className="shadow-sm overflow-x-auto">
        <Table
          columns={columns}
          dataSource={polls}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `სულ ${total} გამოკითხვა`,
            responsive: true,
            className: 'polls-pagination',
          }}
          className="admin-table"
          scroll={{ x: 'max-content' }}
          loading={loading}
        />
      </Card>

      <Modal
        title="ახალი გამოკითხვა"
        open={isPollModalVisible}
        onOk={handlePollSubmit}
        onCancel={handlePollCancel}
        okText="დამატება"
        cancelText="გაუქმება"
      >
        <Form form={pollForm} layout="vertical">
          <Form.Item
            name="title"
            label="დასახელება"
            rules={[{ required: true, message: 'გთხოვთ შეიყვანოთ დასახელება' }]}
          >
            <Input />
          </Form.Item>
          <Form.List
            name="options"
            rules={[
              {
                validator: async (_, options) => {
                  if (!options || options.length < 2) {
                    return Promise.reject(new Error('მინიმუმ 2 ვარიანტი უნდა იყოს'));
                  }
                },
              },
            ]}
          >
            {(fields, { add, remove }) => (
              <>
                {fields.map((field, index) => (
                  <Form.Item required={false} key={field.key} label={index === 0 ? 'ვარიანტები' : ''}>
                    <Form.Item
                      {...field}
                      validateTrigger={['onChange', 'onBlur']}
                      rules={[
                        {
                          required: true,
                          whitespace: true,
                          message: 'გთხოვთ შეიყვანოთ ვარიანტი',
                        },
                      ]}
                      noStyle
                    >
                      <Input placeholder="ვარიანტი" style={{ width: '90%' }} />
                    </Form.Item>
                    {fields.length > 2 && (
                      <Button type="link" onClick={() => remove(field.name)} style={{ width: '10%' }}>
                        წაშლა
                      </Button>
                    )}
                  </Form.Item>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block>
                    ვარიანტის დამატება
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>

      <Modal
        title="გამოკითხვის დეტალები"
        open={isViewModalVisible}
        onCancel={handleViewCancel}
        footer={null}
        width={600}
      >
        {viewingPoll && (
          <div className="space-y-6">
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
              <h3 className="text-lg font-semibold text-gray-800">{viewingPoll.title}</h3>
            </div>

            <div className="space-y-4">
              {viewingPoll.options.map((option) => {
                const totalVotes = getTotalVotes(viewingPoll.options);
                const percentage = calculatePercentage(option.result, totalVotes);

                return (
                  <div key={option.id} className="p-4 rounded-xl bg-gray-50 border-2 border-gray-200">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-semibold text-gray-700">{option.name}</span>
                      <span className="text-gray-600 font-bold">
                        {option.result} ხმა ({percentage}%)
                      </span>
                    </div>
                    <Progress
                      percent={percentage}
                      showInfo={false}
                      strokeColor="#1890ff"
                      className="mb-2"
                      strokeWidth={10}
                    />
                  </div>
                );
              })}
            </div>

            <div className="text-right text-gray-500">
              სულ ხმა: {getTotalVotes(viewingPoll.options)}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
