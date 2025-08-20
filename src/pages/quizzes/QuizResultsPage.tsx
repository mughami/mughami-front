import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Typography, Row, Col, Statistic, List, Tag, Empty, Progress } from 'antd';
import {
  TrophyOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  HistoryOutlined,
  StarOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import Layout from '../../components/Layout';

const { Title, Text } = Typography;

interface QuizResult {
  quizId: number;
  score: number;
  totalQuestions: number;
  completedAt: string;
}

interface Quiz {
  quizId: number;
  quizName: string;
}

const QuizResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const [quizResults, setQuizResults] = useState<Record<number, QuizResult>>({});
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  useEffect(() => {
    // No localStorage usage as per requirement; keep empty state
    setQuizResults({});
    setQuizzes([]);
  }, []);

  const getPercentage = (score: number, total: number) => {
    if (!total || total <= 0) return 0;
    return Math.round((score / total) * 100);
  };

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return { grade: 'A', color: 'green', text: 'შესანიშნავი' };
    if (percentage >= 80) return { grade: 'B', color: 'blue', text: 'კარგი' };
    if (percentage >= 70) return { grade: 'C', color: 'orange', text: 'საშუალო' };
    if (percentage >= 60) return { grade: 'D', color: 'yellow', text: 'დამაკმაყოფილებელი' };
    return { grade: 'F', color: 'red', text: 'უკმარისი' };
  };

  const getQuizName = (quizId: number) => {
    const quiz = quizzes.find((q) => q.quizId === quizId);
    return quiz ? quiz.quizName : `ვიქტორინა ${quizId}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ka-GE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTotalStats = () => {
    const results = Object.values(quizResults);
    if (results.length === 0) return null;

    const totalQuizzes = results.length;
    const totalQuestions = results.reduce((sum, result) => sum + (result.totalQuestions || 0), 0);
    const totalCorrect = results.reduce((sum, result) => sum + result.score, 0);
    const averagePercentage =
      totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

    return {
      totalQuizzes,
      totalQuestions,
      totalCorrect,
      averagePercentage,
    };
  };

  const stats = getTotalStats();

  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')} className="mr-4">
              დაბრუნება
            </Button>
            <div>
              <Title level={2} className="mb-2">
                <HistoryOutlined className="mr-2" />
                ვიქტორინების ისტორია
              </Title>
              <Text className="text-gray-600">თქვენი ყველა ვიქტორინის შედეგი</Text>
            </div>
          </div>
        </div>

        {/* Statistics */}
        {stats && (
          <Row gutter={16} className="mb-8">
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="სულ ვიქტორინები"
                  value={stats.totalQuizzes}
                  prefix={<TrophyOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="სულ კითხვები"
                  value={stats.totalQuestions}
                  prefix={<QuestionCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="სწორი პასუხები"
                  value={stats.totalCorrect}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="საშუალო შედეგი"
                  value={stats.averagePercentage}
                  suffix="%"
                  prefix={<StarOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
          </Row>
        )}

        {/* Quiz Results List */}
        <Card>
          <Title level={3} className="mb-6">
            ვიქტორინების სია
          </Title>

          {Object.keys(quizResults).length === 0 ? (
            <Empty description="თქვენ ჯერ არ გაქვთ ვიქტორინების ისტორია" className="py-12">
              <Button type="primary" onClick={() => navigate('/')}>
                დაწყება ვიქტორინების
              </Button>
            </Empty>
          ) : (
            <List
              dataSource={Object.entries(quizResults)}
              renderItem={([quizId, result]) => {
                const percentage = getPercentage(result.score, result.totalQuestions || 0);
                const grade = getGrade(percentage);

                return (
                  <List.Item className="border rounded-lg p-4 mb-4 hover:shadow-md transition-shadow">
                    <div className="w-full">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <Title level={4} className="mb-1">
                            {getQuizName(parseInt(quizId))}
                          </Title>
                          <Text type="secondary">{formatDate(result.completedAt)}</Text>
                        </div>
                        <div className="text-right">
                          <Tag color={grade.color} className="text-lg font-bold">
                            {grade.grade} - {grade.text}
                          </Tag>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex-1 mr-4">
                          <Progress
                            percent={percentage}
                            strokeColor={grade.color}
                            showInfo={false}
                            size="small"
                          />
                        </div>
                        <div className="text-right">
                          <Text strong className="text-lg">
                            {result.score}/{result.totalQuestions}
                          </Text>
                          <br />
                          <Text type="secondary">{percentage}%</Text>
                        </div>
                      </div>
                    </div>
                  </List.Item>
                );
              }}
            />
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default QuizResultsPage;
