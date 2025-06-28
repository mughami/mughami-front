import React, { useEffect, useState, useRef } from 'react';
import { Card, Button, Spin, Typography, Row, Col, Tag, Empty } from 'antd';
import {
  TrophyOutlined,
  PlayCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  FireOutlined,
  StarOutlined,
} from '@ant-design/icons';
import { useQuizStore, cleanupBlobUrl } from '../store/quizStore';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const QuizSection: React.FC = () => {
  const { quizzes, loading, error, fetchUserQuizzes, getQuizPhoto } = useQuizStore();
  const navigate = useNavigate();
  const [quizPhotos, setQuizPhotos] = useState<Record<number, string>>({});
  const blobUrlsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    fetchUserQuizzes(0, 6); // Fetch first 6 quizzes
  }, [fetchUserQuizzes]);

  useEffect(() => {
    // Fetch photos for quizzes that have photos
    const fetchPhotos = async () => {
      // Clean up previous blob URLs
      blobUrlsRef.current.forEach((url) => cleanupBlobUrl(url));
      blobUrlsRef.current.clear();

      const photos: Record<number, string> = {};
      for (const quiz of quizzes) {
        if (quiz.hasPhoto) {
          try {
            const photoUrl = await getQuizPhoto(quiz.quizId);
            photos[quiz.quizId] = photoUrl;
            blobUrlsRef.current.add(photoUrl);
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

    // Cleanup function to revoke blob URLs when component unmounts
    return () => {
      blobUrlsRef.current.forEach((url) => cleanupBlobUrl(url));
      blobUrlsRef.current.clear();
    };
  }, [quizzes, getQuizPhoto]);

  const handleQuizClick = (quizId: number) => {
    navigate(`/quiz/play/${quizId}`);
  };

  const getRandomDifficulty = () => {
    const difficulties = ['მარტივი', 'საშუალო', 'რთული'];
    return difficulties[Math.floor(Math.random() * difficulties.length)];
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'მარტივი':
        return 'green';
      case 'საშუალო':
        return 'orange';
      case 'რთული':
        return 'red';
      default:
        return 'blue';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <Text type="danger">{error}</Text>
      </div>
    );
  }

  return (
    <section className="py-12 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <TrophyOutlined className="text-4xl text-yellow-500 mr-3" />
            <Title level={2} className="mb-0">
              ვიქტორინები
            </Title>
          </div>
          <Text className="text-lg text-gray-600 max-w-2xl mx-auto">
            შეამოწმეთ თქვენი ცოდნა სხვადასხვა კატეგორიებში და მოიგეთ ჯილდოები
          </Text>
        </div>

        {/* Quizzes Grid */}
        {quizzes.length > 0 ? (
          <Row gutter={[24, 24]}>
            {quizzes.map((quiz) => {
              const difficulty = getRandomDifficulty();
              const photoUrl = quizPhotos[quiz.quizId];

              return (
                <Col xs={24} sm={12} lg={8} key={quiz.quizId}>
                  <Card
                    hoverable
                    className="quiz-card h-full transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl"
                    cover={
                      quiz.hasPhoto && photoUrl ? (
                        <div className="relative h-48 overflow-hidden">
                          <img
                            alt={quiz.quizName}
                            src={photoUrl}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                          {/* <div className="absolute bottom-4 left-4 right-4">
                            <Tag color={getDifficultyColor(difficulty)} className="mb-2">
                              {difficulty}
                            </Tag>
                          </div> */}
                        </div>
                      ) : (
                        <div className="relative h-48 bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
                          <div className="text-white text-center">
                            <TrophyOutlined className="text-4xl mb-2" />
                            <div className="text-lg font-semibold">{quiz.quizName}</div>
                          </div>
                          {/* <div className="absolute bottom-4 left-4">
                            <Tag color={getDifficultyColor(difficulty)}>{difficulty}</Tag>
                          </div> */}
                        </div>
                      )
                    }
                    actions={[
                      <Button
                        type="primary"
                        icon={<PlayCircleOutlined />}
                        onClick={() => handleQuizClick(quiz.quizId)}
                        className="w-full"
                      >
                        დაწყება
                      </Button>,
                    ]}
                  >
                    <div className="space-y-3">
                      <Title level={4} className="mb-2 line-clamp-2">
                        {quiz.quizName}
                      </Title>

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center">
                          <ClockCircleOutlined className="mr-1" />
                          <span>~10 წთ</span>
                        </div>
                        <div className="flex items-center">
                          <StarOutlined className="mr-1 text-yellow-500" />
                          <span>4.8</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-600">
                          <UserOutlined className="mr-1" />
                          <span>1.2k მონაწილე</span>
                        </div>
                        <div className="flex items-center text-sm text-orange-500">
                          <FireOutlined className="mr-1" />
                          <span>პოპულარული</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>
        ) : (
          <Empty description="ვიქტორინები ვერ მოიძებნა" className="py-12" />
        )}

        {/* View All Button */}
        {/* {quizzes.length > 0 && (
          <div className="text-center mt-12">
            <Button
              type="default"
              size="large"
              onClick={() => navigate('/categories')}
              className="px-8 py-2 h-auto"
            >
              ყველა ვიქტორინის ნახვა
            </Button>
          </div>
        )} */}
      </div>
    </section>
  );
};

export default QuizSection;
