import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Typography,
  Space,
  Row,
  Col,
  Spin,
  Empty,
  Image,
  Input,
  Select,
  Tag,
  Modal,
} from 'antd';
import {
  ArrowLeftOutlined,
  PlayCircleOutlined,
  QuestionCircleOutlined,
  LoginOutlined,
  UserAddOutlined,
  ArrowRightOutlined,
  TrophyOutlined,
  LineChartOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { useQuizStore } from '../../store/quizStore';
import { useCategoryStore } from '../../store/categoryStore';
import { useAuthStore } from '../../store/authStore';
import { type Category, quizService } from '../../services';
import { guestQuizService } from '../../services/api/publicQuizService';
import Layout from '../../components/Layout';

const { Title, Text } = Typography;
const { Search } = Input;

const QuizPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();

  const { quizzes, loading, fetchQuizzesByCategory, getQuizPhoto } = useQuizStore();

  const { categories, fetchCategories, isLoading } = useCategoryStore();
  const { isAuthenticated } = useAuthStore();

  // Quiz the guest tried to play; drives the login/guest prompt modal.
  const [pendingQuizId, setPendingQuizId] = useState<number | null>(null);

  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [quizPhotos, setQuizPhotos] = useState<Record<number, string>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name-asc' | 'name-desc'>('name-asc');
  const [questionCounts, setQuestionCounts] = useState<Record<number, number>>({});

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
    fetchCategories();
  }, [fetchCategories]);

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
    if (isAuthenticated) {
      // Logged-in users play the full authorized flow.
      navigate(`/quiz/play/${quizId}`);
    } else {
      // Guests are offered authorization before playing.
      setPendingQuizId(quizId);
    }
  };

  // Where to send the user back to after they authorize.
  const authReturnPath = pendingQuizId !== null ? `/quiz/play/${pendingQuizId}` : undefined;

  const handleContinueAsGuest = () => {
    if (pendingQuizId !== null) {
      navigate(`/public-quiz/play/${pendingQuizId}`);
    }
    setPendingQuizId(null);
  };

  const handleGoToLogin = () => {
    navigate('/login', { state: { from: authReturnPath } });
    setPendingQuizId(null);
  };

  const handleGoToRegister = () => {
    navigate('/register', { state: { from: authReturnPath } });
    setPendingQuizId(null);
  };

  const handleBackToCategories = () => {
    navigate('/categories');
  };

  // Difficulty removed from UI

  const displayedQuizzes = React.useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    let list = quizzes;
    if (term) {
      list = list.filter((q) => q.quizName.toLowerCase().includes(term));
    }
    if (sortBy === 'name-asc') {
      list = [...list].sort((a, b) => a.quizName.localeCompare(b.quizName));
    } else {
      list = [...list].sort((a, b) => b.quizName.localeCompare(a.quizName));
    }
    return list;
  }, [quizzes, searchTerm, sortBy]);

  // Fetch question counts per quiz lazily using totalElements (size=1)
  useEffect(() => {
    let cancelled = false;
    const missing = displayedQuizzes.filter((q) => questionCounts[q.quizId] === undefined);
    if (missing.length === 0) return;
    const run = async () => {
      const results = await Promise.all(
        missing.map(async (q) => {
          try {
            // Guests can't call /app/quiz/* (401); use the guest endpoint.
            if (!isAuthenticated) {
              const res = await guestQuizService.getGuestQuizQuestions(q.quizId, 0, 1);
              return [q.quizId, res.totalElements] as const;
            }
            const res = await quizService.getUserQuizQuestions(q.quizId, 0, 1);
            return [q.quizId, res.totalQuestions] as const;
          } catch {
            return [q.quizId, 0] as const;
          }
        }),
      );
      if (cancelled) return;
      setQuestionCounts((prev) => {
        const next = { ...prev };
        results.forEach(([id, count]) => {
          next[id] = count;
        });
        return next;
      });
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [displayedQuizzes, questionCounts, isAuthenticated]);

  if (loading || isLoading) {
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
      <Modal
        open={pendingQuizId !== null}
        onCancel={() => setPendingQuizId(null)}
        footer={null}
        centered
        width={500}
        styles={{ body: { padding: '32px 28px 28px' } }}
      >
        <div className="text-center">
          {/* Icon badge */}
          <div className="mx-auto mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-indigo-200">
            <TrophyOutlined className="text-white text-3xl" />
          </div>

          <Title level={4} className="!mb-2">
            გაიარე ავტორიზაცია
          </Title>
          <Text type="secondary" className="block px-2">
            შეინახე შედეგები და მიიღო სრული გამოცდილება
          </Text>

          {/* Benefits */}
          <div className="my-6 space-y-3 text-left">
            {[
              {
                icon: <LineChartOutlined />,
                color: 'bg-blue-50 text-blue-500',
                label: 'პროგრესის ისტორია',
              },
              {
                icon: <TrophyOutlined />,
                color: 'bg-amber-50 text-amber-500',
                label: 'პრიზები და ჯილდოები',
              },
              { icon: <TeamOutlined />, color: 'bg-purple-50 text-purple-500', label: 'ლიდერბორდები' },
              {
                icon: <SafetyCertificateOutlined />,
                color: 'bg-green-50 text-green-600',
                label: 'დაცული შედეგები',
              },
            ].map((b) => (
              <div key={b.label} className="flex items-center gap-3">
                <span
                  className={`inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${b.color}`}
                >
                  {b.icon}
                </span>
                <span className="text-sm font-medium text-gray-700">{b.label}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="space-y-2.5">
            <Button
              type="primary"
              size="large"
              block
              icon={<LoginOutlined />}
              className="h-11 font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 border-0 shadow-md hover:shadow-lg"
              onClick={handleGoToLogin}
            >
              შესვლა
            </Button>
            <Button
              size="large"
              block
              icon={<UserAddOutlined />}
              className="h-11 font-semibold"
              onClick={handleGoToRegister}
            >
              ანგარიშის შექმნა
            </Button>
          </div>

          <button
            type="button"
            onClick={handleContinueAsGuest}
            className="group mt-4 inline-flex items-center justify-center gap-1 text-sm text-gray-400 transition-colors hover:text-gray-600"
          >
            გაგრძელება სტუმრის სახით
            <ArrowRightOutlined className="text-xs transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </Modal>
      <div className="page-content">
        {/* Hero Header */}
        <div className="relative mb-6 overflow-hidden rounded-xl">
          <div
            className="absolute inset-0 bg-center bg-cover"
            style={{
              backgroundImage: currentCategory?.image ? `url(${currentCategory.image})` : undefined,
            }}
          />
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative p-5 md:p-7">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
              <div className="flex items-start gap-4">
                <Button ghost icon={<ArrowLeftOutlined />} onClick={handleBackToCategories}>
                  უკან
                </Button>
                <div>
                  <Title level={2} className="!mb-1 !text-white">
                    {currentCategory?.title || 'კატეგორია'}
                  </Title>
                  {currentCategory?.description && (
                    <Text className="!text-white/85">{currentCategory.description}</Text>
                  )}
                </div>
              </div>
              {currentCategory && (
                <div className="grid grid-cols-1  gap-3 w-full md:w-auto">
                  <div className="rounded-lg bg-white/10 px-4 py-3 text-white">
                    <div className="flex items-center gap-2 text-sm opacity-80">
                      <QuestionCircleOutlined />
                      <span>ქვიზები</span>
                    </div>
                    <div className="text-2xl font-semibold leading-tight">
                      {displayedQuizzes.length}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <Text type="secondary">ქვიზების რაოდენობა: {displayedQuizzes.length}</Text>
          <Space size={12} wrap>
            <Search
              placeholder="მოძებნე ქვიზი სახელით"
              allowClear
              onSearch={(v) => setSearchTerm(v)}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ maxWidth: 320 }}
            />
            <Select
              value={sortBy}
              onChange={setSortBy}
              options={[
                { label: 'ანბანი A→Z', value: 'name-asc' },
                { label: 'ანბანი Z→A', value: 'name-desc' },
              ]}
              style={{ width: 160 }}
            />
          </Space>
        </div>

        {/* Quiz List */}
        {displayedQuizzes.length === 0 ? (
          <Card className="text-center py-20">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div>
                  <Title level={4} className="mb-2">
                    ქვიზები ჯერ არ არის დამატებული
                  </Title>
                  <Text type="secondary">
                    ამ კატეგორიის ქვიზები ჯერ არ არის შექმნილი. გთხოვთ, სცადოთ მოგვიანებით.
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
            {displayedQuizzes.map((quiz) => (
              <Col xs={24} sm={12} md={8} lg={6} key={quiz.quizId}>
                <Card
                  hoverable
                  className="h-full shadow-sm hover:shadow-md transition"
                  cover={
                    quiz.hasPhoto && quizPhotos[quiz.quizId] ? (
                      <div className="relative h-56 bg-gray-100 rounded-lg overflow-hidden">
                        <Image
                          src={quizPhotos[quiz.quizId]}
                          alt={quiz.quizName}
                          className="h-full w-full object-cover"
                          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent" />
                        {quiz.quizStatus === 'VERIFIED' && (
                          <div className="absolute top-2 right-2">
                            <Tag color="green">ვერიფიცირებული</Tag>
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <div className="text-white font-medium truncate">{quiz.quizName}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="relative h-56 bg-gray-100 flex items-center justify-center rounded-lg overflow-hidden">
                        <QuestionCircleOutlined className="text-4xl text-gray-400" />
                        {quiz.quizStatus === 'VERIFIED' && (
                          <div className="absolute top-2 right-2">
                            <Tag color="green">ვერიფიცირებული</Tag>
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <div className="text-gray-800 font-medium truncate">{quiz.quizName}</div>
                        </div>
                      </div>
                    )
                  }
                  actions={[
                    <Button
                      type="primary"
                      icon={<PlayCircleOutlined />}
                      onClick={() => handlePlayQuiz(quiz.quizId)}
                      block
                      className="rounded-lg !w-[90%]"
                    >
                      თამაში
                    </Button>,
                  ]}
                >
                  <Card.Meta
                    title={null}
                    description={
                      <div className="mt-2">
                        <div className="flex items-center justify-between">
                          <Tag color="geekblue" bordered={false}>
                            კითხვები: {questionCounts[quiz.quizId] ?? '...'}
                          </Tag>
                        </div>
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
