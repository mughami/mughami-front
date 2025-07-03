import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Typography, Space, Row, Col, Spin, Empty, Image, Badge, Statistic } from 'antd';
import {
  ArrowLeftOutlined,
  PlayCircleOutlined,
  QuestionCircleOutlined,
  TrophyOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useQuizStore } from '../../store/quizStore';
import { useCategoryStore } from '../../store/categoryStore';
import { type Category } from '../../services';
import Layout from '../../components/Layout';

const { Title, Text } = Typography;

const QuizPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();

  const { quizzes, loading, fetchQuizzesByCategory, getQuizPhoto } = useQuizStore();

  const { categories } = useCategoryStore();

  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [quizPhotos, setQuizPhotos] = useState<Record<number, string>>({});

  useEffect(() => {
    if (categoryId) {
      const id = parseInt(categoryId);

      // Find the current category first
      const category = categories.find((cat) => cat.id === categoryId);
      setCurrentCategory(category || null);

      // Then fetch quizzes for this category
      fetchQuizzesByCategory(id, 0, 50).catch(() => {
        // Silently handle 404 or other errors - we'll show empty state instead
      });
    }
  }, [categoryId, fetchQuizzesByCategory, categories]);

  // Fetch photos for quizzes that have photos
  useEffect(() => {
    const fetchPhotos = async () => {
      const photos: Record<number, string> = {};
      for (const quiz of quizzes) {
        if (quiz.hasPhoto) {
          try {
            const photoUrl = await getQuizPhoto(quiz.quizId);
            photos[quiz.quizId] = photoUrl;
          } catch (error) {
            console.error(`Failed to fetch photo for quiz ${quiz.quizId}:`, error);
          }
        }
      }
      setQuizPhotos(photos);
    };

    if (quizzes.length > 0) {
      fetchPhotos();
    }
  }, [quizzes, getQuizPhoto]);

  const handlePlayQuiz = (quizId: number) => {
    navigate(`/quiz/play/${quizId}`);
  };

  const handleBackToCategories = () => {
    navigate('/categories');
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return <Badge color="green" text="მარტივი" />;
      case 'medium':
        return <Badge color="orange" text="საშუალო" />;
      case 'hard':
        return <Badge color="red" text="რთული" />;
      default:
        return <Badge color="blue" text="საშუალო" />;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-20">
          <Spin size="large" />
          <p className="mt-4 text-gray-600">იტვირთება...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page-content">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button icon={<ArrowLeftOutlined />} onClick={handleBackToCategories}>
              უკან
            </Button>
            <div>
              <Title level={2} className="mb-0">
                {currentCategory?.title || 'კატეგორია'}
              </Title>
              <Text type="secondary">{currentCategory?.description}</Text>
            </div>
          </div>
          {currentCategory && (
            <div className="flex items-center space-x-4">
              <Statistic
                title="კითხვების რაოდენობა"
                value={currentCategory.quizCount}
                prefix={<QuestionCircleOutlined />}
              />
              <Statistic
                title="მოთამაშეები"
                value={currentCategory.playerCount}
                prefix={<TeamOutlined />}
              />
              <Statistic
                title="საპრიზო თანხა"
                value={currentCategory.prize}
                prefix={<TrophyOutlined />}
                suffix="₾"
              />
            </div>
          )}
        </div>

        {/* Quiz List */}
        {quizzes.length === 0 ? (
          <Card className="text-center py-20">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div>
                  <Title level={4} className="mb-2">
                    ვიქტორინები ჯერ არ არის დამატებული
                  </Title>
                  <Text type="secondary">
                    ამ კატეგორიის ვიქტორინები ჯერ არ არის შექმნილი. გთხოვთ, სცადოთ მოგვიანებით.
                  </Text>
                </div>
              }
            >
              <Space>
                <Button type="primary" onClick={handleBackToCategories}>
                  კატეგორიებზე დაბრუნება
                </Button>
                <Button onClick={() => window.location.reload()}>განახლება</Button>
              </Space>
            </Empty>
          </Card>
        ) : (
          <Row gutter={[16, 16]}>
            {quizzes.map((quiz) => (
              <Col xs={24} sm={12} md={8} lg={6} key={quiz.quizId}>
                <Card
                  hoverable
                  className="h-full"
                  cover={
                    quiz.hasPhoto && quizPhotos[quiz.quizId] ? (
                      <div className="h-48 bg-gray-100 flex items-center justify-center">
                        <Image
                          src={quizPhotos[quiz.quizId]}
                          alt={quiz.quizName}
                          className="h-full w-full object-cover"
                          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                        />
                      </div>
                    ) : (
                      <div className="h-48 bg-gray-100 flex items-center justify-center">
                        <QuestionCircleOutlined className="text-4xl text-gray-400" />
                      </div>
                    )
                  }
                  actions={[
                    <Button
                      type="primary"
                      icon={<PlayCircleOutlined />}
                      onClick={() => handlePlayQuiz(quiz.quizId)}
                      block
                    >
                      თამაში
                    </Button>,
                  ]}
                >
                  <Card.Meta
                    title={
                      <div className="flex items-center justify-between">
                        <span className="truncate">{quiz.quizName}</span>
                        {getDifficultyBadge(currentCategory?.difficulty || 'medium')}
                      </div>
                    }
                    description={
                      <div className="mt-2">
                        <Text type="secondary">
                          კითხვების რაოდენობა: {quiz.hasPhoto ? 'ფოტოებით' : 'ტექსტით'}
                        </Text>
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </Layout>
  );
};

export default QuizPage;
