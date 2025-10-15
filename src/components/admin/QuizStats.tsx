import { useEffect, useMemo, useState } from 'react';
import { Table, Card, Segmented, Statistic, Row, Col, Empty, Progress } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import useDashboardStore from '../../store/dashboardStore';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from 'recharts';

interface RowType {
  key: number;
  quizId: number;
  quizName: string;
  totalGuestUsers: number;
  completedGuestUsers: number;
  totalRegisteredUsers: number;
  completedRegisteredUsers: number;
}

interface ChartDatum {
  name: string;
  guest: number;
  registered: number;
  guestTotal: number;
  regTotal: number;
  guestCompleted: number;
  regCompleted: number;
}

const QuizStats = () => {
  const { quizStats, quizStatsLoading, fetchQuizStats } = useDashboardStore();
  // Control pagination locally (one-based page index to match AntD and API)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [metric, setMetric] = useState<'completed' | 'total' | 'rate'>('completed');
  //

  useEffect(() => {
    // initial load uses page 1 (one-based)
    fetchQuizStats(1, pageSize);
  }, [fetchQuizStats, pageSize]);

  useEffect(() => {
    if (quizStats) {
      // Trust only total and server-provided pageSize; keep current page controlled
      setTotalElements(quizStats.totalElements ?? 0);
      if (quizStats.size && quizStats.size !== pageSize) {
        setPageSize(quizStats.size);
      }
    }
  }, [quizStats, pageSize]);

  const columns: ColumnsType<RowType> = [
    {
      title: 'ვიქტორინა',
      dataIndex: 'quizName',
      key: 'quizName',
    },
    {
      title: 'სტუმრები - სულ',
      dataIndex: 'totalGuestUsers',
      key: 'totalGuestUsers',
      width: 140,
    },
    {
      title: 'სტუმრები - დასრულებული',
      dataIndex: 'completedGuestUsers',
      key: 'completedGuestUsers',
      width: 160,
    },
    {
      title: 'რეგისტრირებული - სულ',
      dataIndex: 'totalRegisteredUsers',
      key: 'totalRegisteredUsers',
      width: 170,
    },
    {
      title: 'რეგისტრირებული - დასრულებული',
      dataIndex: 'completedRegisteredUsers',
      key: 'completedRegisteredUsers',
      width: 200,
    },
  ];

  const dataSource: RowType[] = (quizStats?.content || []).map((q) => ({
    key: q.quizId,
    quizId: q.quizId,
    quizName: q.quizName,
    totalGuestUsers: q.totalGuestUsers,
    completedGuestUsers: q.completedGuestUsers,
    totalRegisteredUsers: q.totalRegisteredUsers,
    completedRegisteredUsers: q.completedRegisteredUsers,
  }));

  const chartData = useMemo(
    () =>
      dataSource.map((d) => {
        const guestTotal = Math.max(d.totalGuestUsers, 0);
        const regTotal = Math.max(d.totalRegisteredUsers, 0);
        const guestCompleted = Math.max(d.completedGuestUsers, 0);
        const regCompleted = Math.max(d.completedRegisteredUsers, 0);

        const guestRate = guestTotal > 0 ? (guestCompleted / guestTotal) * 100 : 0;
        const regRate = regTotal > 0 ? (regCompleted / regTotal) * 100 : 0;

        return {
          name: d.quizName,
          guest: metric === 'completed' ? guestCompleted : metric === 'total' ? guestTotal : guestRate,
          registered: metric === 'completed' ? regCompleted : metric === 'total' ? regTotal : regRate,
          guestTotal,
          regTotal,
          guestCompleted,
          regCompleted,
        };
      }),
    [dataSource, metric],
  );

  const truncateLabel = (value: string) => {
    const max = 18;
    if (value.length <= max) return value;
    return value.slice(0, max - 1) + '…';
  };

  const formatBarValue = (v: number) => (metric === 'rate' ? `${v.toFixed(0)}%` : `${v}`);

  interface TooltipPayloadItem {
    payload?: ChartDatum;
  }
  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: TooltipPayloadItem[];
  }) => {
    if (!active || !payload || !payload.length) return null;
    const p0 = payload[0]?.payload as ChartDatum | undefined;
    if (!p0) return null;
    return (
      <div className="rounded-md border border-gray-200 bg-white p-3 shadow-md min-w-[220px]">
        <div className="font-medium mb-2">{p0.name}</div>
        {metric === 'rate' ? (
          <>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-block h-2 w-2 rounded-full" style={{ background: '#1677ff' }} />
              <span>სტუმრები: {p0.guest.toFixed(1)}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full" style={{ background: '#52c41a' }} />
              <span>რეგისტრირებული: {p0.registered.toFixed(1)}%</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ background: '#1677ff' }}
                />
                <span>სტუმრები</span>
              </div>
              <span>
                {p0.guestCompleted} / {p0.guestTotal}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ background: '#52c41a' }}
                />
                <span>რეგისტრირებული</span>
              </div>
              <span>
                {p0.regCompleted} / {p0.regTotal}
              </span>
            </div>
          </>
        )}
      </div>
    );
  };

  interface BarValueLabelProps {
    x: number;
    y: number;
    width: number;
    value: number;
  }
  const BarValueLabel = (props: BarValueLabelProps) => {
    const { x, y, width, value } = props;
    if (value == null) return null;
    const text = formatBarValue(Number(value));
    const cx = x + width / 2;
    const cy = (y as number) - 6;
    return (
      <text x={cx} y={cy} textAnchor="middle" fill="#595959" fontSize={12}>
        {text}
      </text>
    );
  };

  const totals = useMemo(() => {
    const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);
    const gTotal = sum(dataSource.map((d) => d.totalGuestUsers));
    const gCompleted = sum(dataSource.map((d) => d.completedGuestUsers));
    const rTotal = sum(dataSource.map((d) => d.totalRegisteredUsers));
    const rCompleted = sum(dataSource.map((d) => d.completedRegisteredUsers));
    return { gTotal, gCompleted, rTotal, rCompleted };
  }, [dataSource]);

  const handleTableChange = (p: TablePaginationConfig) => {
    const page = p.current || 1;
    const size = p.pageSize || pageSize;
    setCurrentPage(page);
    setPageSize(size);
    fetchQuizStats(page, size);
  };

  return (
    <Card title="ვიქტორინის სტატისტიკა">
      <div className="mb-4 flex items-center justify-between">
        <Segmented
          value={metric}
          onChange={(val) => setMetric(val as 'completed' | 'total' | 'rate')}
          options={[
            { label: 'დასრულებული', value: 'completed' },
            { label: 'სულ', value: 'total' },
            { label: 'დასრულების %', value: 'rate' },
          ]}
        />
      </div>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={12} md={6}>
          <Card size="small">
            <Statistic title="სტუმრები — დასრულებული" value={totals.gCompleted} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small">
            <Statistic title="სტუმრები — სულ" value={totals.gTotal} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small">
            <Statistic title="რეგისტრირებული — დასრულებული" value={totals.rCompleted} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small">
            <Statistic title="რეგისტრირებული — სულ" value={totals.rTotal} />
          </Card>
        </Col>
      </Row>

      <div className="w-full h-96 mb-6">
        {chartData.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 16, right: 24, left: 8, bottom: 32 }}
              barCategoryGap={18}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="name"
                interval={0}
                height={60}
                tick={{ fontSize: 12 }}
                tickFormatter={truncateLabel}
              />
              <YAxis
                allowDecimals={false}
                domain={metric === 'rate' ? [0, 100] : undefined}
                tickFormatter={(v) => (metric === 'rate' ? `${v}%` : `${v}`)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: 8 }} />
              <Bar
                dataKey="guest"
                name="სტუმრები"
                fill="#1677ff"
                radius={[6, 6, 0, 0]}
                maxBarSize={60}
              >
                <LabelList
                  dataKey="guest"
                  content={(props) => <BarValueLabel {...(props as unknown as BarValueLabelProps)} />}
                />
              </Bar>
              <Bar
                dataKey="registered"
                name="რეგისტრირებული"
                fill="#52c41a"
                radius={[6, 6, 0, 0]}
                maxBarSize={60}
              >
                <LabelList
                  dataKey="registered"
                  content={(props) => <BarValueLabel {...(props as unknown as BarValueLabelProps)} />}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <Empty description="მონაცემები არ არის" />
        )}
      </div>

      <Table<RowType>
        columns={[
          columns[0],
          columns[1],
          {
            ...columns[2],
            render: (value: number, record: RowType) => {
              const total = Math.max(record.totalGuestUsers, 0);
              const completed = Math.max(value || 0, 0);
              const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
              return (
                <div>
                  <div className="mb-1">
                    {completed} / {total}
                  </div>
                  <Progress percent={percent} size="small" status="active" />
                </div>
              );
            },
          },
          columns[3],
          {
            ...columns[4],
            render: (value: number, record: RowType) => {
              const total = Math.max(record.totalRegisteredUsers, 0);
              const completed = Math.max(value || 0, 0);
              const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
              return (
                <div>
                  <div className="mb-1">
                    {completed} / {total}
                  </div>
                  <Progress percent={percent} size="small" status="active" strokeColor="#52c41a" />
                </div>
              );
            },
          },
        ]}
        dataSource={dataSource}
        loading={quizStatsLoading}
        pagination={{
          current: currentPage,
          pageSize,
          total: totalElements,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100', '500'],
          showTotal: (total, range) => `${range[0]}-${range[1]} / სულ ${total}`,
        }}
        onChange={handleTableChange}
        scroll={{ x: 900 }}
        rowKey="key"
      />
    </Card>
  );
};

export default QuizStats;
