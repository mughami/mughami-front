import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Progress,
  Typography,
  Space,
  Row,
  Col,
  Image,
  Spin,
  Result,
  Statistic,
  Badge,
  Modal,
} from 'antd';
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  TrophyOutlined,
  QuestionCircleOutlined,
  ClockCircleOutlined,
  PlayCircleOutlined,
  HomeOutlined,
  UserAddOutlined,
  LoginOutlined,
  CrownOutlined,
  TeamOutlined,
  LineChartOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { usePublicQuizStore, cleanupBlobUrl } from '../../store/publicQuizStore';
import Layout from '../../components/Layout';
import { useAuthStore } from '../../store';

const { Title, Text } = Typography;

const PublicQuizPlayPage: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();

  const {
    currentQuiz,
    currentQuestions,
    currentQuestionIndex,
    selectedAnswers,
    quizStarted,
    quizCompleted,
    quizScore,
    loading,
    error,
    fetchPublicQuiz,
    fetchPublicQuizQuestions,
    startQuiz,
    selectAnswer,
    submitAnswer,
    nextQuestion,
    completeQuiz,
    resetQuiz,
    getQuizPhoto,
    getQuestionPhoto,
  } = usePublicQuizStore();

  const { isAuthenticated } = useAuthStore();

  const [quizPhotoUrl, setQuizPhotoUrl] = useState<string>('');
  const prevQuizPhotoUrlRef = useRef<string>('');
  const [questionPhotos, setQuestionPhotos] = useState<Record<number, string>>({});
  const blobUrlsRef = useRef<Set<string>>(new Set());
  const questionPhotoCacheRef = useRef<Record<number, string>>({});
  const inFlightRef = useRef<Set<number>>(new Set());
  // Removed popup; reveal inline instead
  const [answerAnimation, setAnswerAnimation] = useState(false);

  const [submittedQuestions, setSubmittedQuestions] = useState<Record<number, boolean>>({});
  const [timeSpent, setTimeSpent] = useState(0);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  useEffect(() => {
    if (quizCompleted && !isAuthenticated) {
      setShowRegistrationModal(true);
    }
  }, [quizCompleted, isAuthenticated]);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (quizId) {
      const id = parseInt(quizId);
      fetchPublicQuiz(id);
      fetchPublicQuizQuestions(id, 0, 50);
    }
  }, [quizId, fetchPublicQuiz, fetchPublicQuizQuestions]);

  // No persisted results (localStorage disabled)

  useEffect(() => {
    let cancelled = false;
    const prevUrl = prevQuizPhotoUrlRef.current;
    if (currentQuiz?.hasPhoto) {
      const id = currentQuiz.quizId;
      getQuizPhoto(id)
        .then((photoUrl) => {
          if (cancelled) {
            cleanupBlobUrl(photoUrl);
            return;
          }
          if (prevUrl) {
            cleanupBlobUrl(prevUrl);
            blobUrlsRef.current.delete(prevUrl);
          }
          setQuizPhotoUrl(photoUrl);
          blobUrlsRef.current.add(photoUrl);
          prevQuizPhotoUrlRef.current = photoUrl;
        })
        .catch(() => {
          if (prevUrl) {
            cleanupBlobUrl(prevUrl);
            blobUrlsRef.current.delete(prevUrl);
          }
          setQuizPhotoUrl('');
          prevQuizPhotoUrlRef.current = '';
        });
    } else {
      if (prevUrl) {
        cleanupBlobUrl(prevUrl);
        blobUrlsRef.current.delete(prevUrl);
        setQuizPhotoUrl('');
        prevQuizPhotoUrlRef.current = '';
      }
    }
    return () => {
      cancelled = true;
    };
  }, [currentQuiz?.quizId, currentQuiz?.hasPhoto, getQuizPhoto]);

  useEffect(() => {
    return () => {
      if (quizPhotoUrl) {
        cleanupBlobUrl(quizPhotoUrl);
        blobUrlsRef.current.delete(quizPhotoUrl);
      }
    };
  }, [quizPhotoUrl]);

  useEffect(() => {
    // Remove cache entries for questions no longer present
    Object.entries(questionPhotoCacheRef.current).forEach(([idStr, url]) => {
      const id = Number(idStr);
      if (!currentQuestions.find((q) => q.id === id)) {
        cleanupBlobUrl(url);
        blobUrlsRef.current.delete(url);
        delete questionPhotoCacheRef.current[id];
      }
    });

    if (currentQuestions.length === 0) {
      setQuestionPhotos({});
      return;
    }

    const indicesToPrefetch: number[] = [
      currentQuestionIndex,
      currentQuestionIndex + 1,
      currentQuestionIndex - 1,
    ].filter((i) => i >= 0 && i < currentQuestions.length);

    indicesToPrefetch.forEach(async (idx) => {
      const q = currentQuestions[idx];
      if (!q.hasPhoto) return;
      if (questionPhotoCacheRef.current[q.id]) return;
      if (inFlightRef.current.has(q.id)) return;
      inFlightRef.current.add(q.id);
      try {
        const url = await getQuestionPhoto(q.id);
        questionPhotoCacheRef.current[q.id] = url;
        blobUrlsRef.current.add(url);
        setQuestionPhotos((prev) => ({ ...prev, [q.id]: url }));
      } catch {
        // ignore fetch failure for now
      } finally {
        inFlightRef.current.delete(q.id);
      }
    });
  }, [currentQuestions, currentQuestionIndex, getQuestionPhoto]);

  // Cleanup all blob urls on unmount
  useEffect(() => {
    return () => {
      const urlsAtCleanup = blobUrlsRef.current;
      urlsAtCleanup.forEach((url) => cleanupBlobUrl(url));
      urlsAtCleanup.clear();
      questionPhotoCacheRef.current = {};
      inFlightRef.current.clear();
    };
  }, []);

  // Timer for tracking time spent
  useEffect(() => {
    if (quizStarted && !quizCompleted) {
      const timer = setInterval(() => {
        setTimeSpent((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [quizStarted, quizCompleted]);

  const handleStartQuiz = async () => {
    if (quizId) {
      startQuiz(parseInt(quizId));
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (!quizStarted || quizCompleted) return;

    const currentQuestion = currentQuestions[currentQuestionIndex];
    selectAnswer(currentQuestion.id, answerIndex);
    setAnswerAnimation(true);
    setTimeout(() => setAnswerAnimation(false), 200);
  };

  const handleSubmitAnswer = async () => {
    const currentQuestion = currentQuestions[currentQuestionIndex];
    try {
      await submitAnswer(currentQuestion.id);
      setAnswerAnimation(true);
      setTimeout(() => setAnswerAnimation(false), 200);
      setSubmittedQuestions((prev) => ({ ...prev, [currentQuestion.id]: true }));
    } catch (error) {
      console.error('Failed to submit answer:', error);
    }
  };

  const handleNext = () => {
    // Instant scroll to top before proceeding
    window.scrollTo(0, 0);

    if (currentQuestionIndex < currentQuestions.length - 1) {
      nextQuestion();
    } else {
      completeQuiz();
    }
  };

  // Previous disabled in this flow

  // const handleRestart = () => {
  //   // Clear all quiz-related localStorage data
  //   localStorage.removeItem('publicQuizResults');
  //   localStorage.removeItem('publicQuizzes');

  //   resetQuiz();
  //   setShowAnswer(false);
  //   setTimeSpent(0);
  //   if (quizId) {
  //     startQuiz(parseInt(quizId));
  //   }
  // };

  const handleGoHome = () => {
    // Do not persist partial results; just leave quiz
    resetQuiz();
    window.scrollTo(0, 0);
    navigate('/public-quizzes');
  };

  const getProgressPercentage = () => {
    return ((currentQuestionIndex + 1) / currentQuestions.length) * 100;
  };

  const getCurrentQuestion = () => {
    return currentQuestions[currentQuestionIndex];
  };

  const getSelectedAnswer = (questionId: number) => {
    return selectedAnswers[questionId];
  };

  const isAnswerCorrect = (questionId: number, answerIndex: number) => {
    const question = currentQuestions.find((q) => q.id === questionId);
    return question?.answers[answerIndex]?.isCorrect || false;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAnsweredCount = () => {
    return Object.keys(selectedAnswers).length;
  };

  if (loading && !quizStarted) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <Spin size="large" />
            <div className="mt-4 text-gray-600">იტვირთება...</div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center py-20">
          <div className="max-w-md mx-auto">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <Title level={3} className="text-red-600 mb-4">
              შეცდომა
            </Title>
            <Text type="danger" className="text-lg block mb-6">
              {error}
            </Text>
            <Button type="primary" size="large" onClick={() => navigate('/')}>
              დაბრუნება მთავარ გვერდზე
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!currentQuiz) {
    return (
      <Layout>
        <div className="text-center py-20">
          <div className="max-w-md mx-auto">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <Title level={3} className="text-gray-600 mb-4">
              კონტენტი ვერ მოიძებნა
            </Title>
            <Button type="primary" size="large" onClick={() => navigate('/')}>
              დაბრუნება მთავარ გვერდზე
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!quizStarted) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
          <div className="max-w-4xl mx-auto py-8 px-4">
            <Card
              className="text-center shadow-2xl border-0 bg-white/80 backdrop-blur-sm"
              style={{ borderRadius: '24px' }}
            >
              <div className="mb-8">
                {currentQuiz.hasPhoto && quizPhotoUrl ? (
                  <div className="relative mb-8">
                    <Image
                      src={quizPhotoUrl}
                      alt={currentQuiz.quizName}
                      className="w-full max-w-lg mx-auto rounded-2xl shadow-2xl"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-2xl" />
                  </div>
                ) : (
                  <div className="w-full max-w-lg mx-auto h-80 bg-gradient-to-br from-green-400 via-blue-500 to-purple-500 rounded-2xl mb-8 flex items-center justify-center shadow-2xl relative overflow-hidden">
                    <TrophyOutlined className="text-white text-8xl animate-pulse z-10" />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                  </div>
                )}

                <Title
                  level={1}
                  className="mb-6 text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent"
                >
                  {currentQuiz.quizName}
                </Title>

                <div className="flex flex-wrap justify-center gap-6 text-gray-600 mb-8">
                  <div className="flex items-center px-4 py-2 bg-blue-50 rounded-full shadow-sm">
                    <QuestionCircleOutlined className="mr-2 text-blue-500" />
                    <span className="font-medium">{currentQuestions.length} კითხვა</span>
                  </div>
                  <div className="flex items-center px-4 py-2 bg-purple-50 rounded-full shadow-sm">
                    <ClockCircleOutlined className="mr-2 text-purple-500" />
                    <span className="font-medium">
                      ~{Math.ceil(currentQuestions.length * 0.5)} წუთი
                    </span>
                  </div>
                </div>
              </div>

              <Space direction="vertical" size="large" className="w-full">
                <Button
                  type="primary"
                  size="large"
                  onClick={handleStartQuiz}
                  loading={loading}
                  className="px-16 py-4 h-auto text-xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 border-0"
                  icon={<PlayCircleOutlined />}
                  style={{ borderRadius: '16px' }}
                >
                  დაწყება
                </Button>
              </Space>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  if (quizCompleted) {
    const percentage = Math.round((quizScore / currentQuestions.length) * 100);
    const grade =
      percentage >= 90
        ? 'A'
        : percentage >= 80
        ? 'B'
        : percentage >= 70
        ? 'C'
        : percentage >= 60
        ? 'D'
        : 'F';
    const gradeColor =
      percentage >= 90
        ? 'green'
        : percentage >= 80
        ? 'blue'
        : percentage >= 70
        ? 'orange'
        : percentage >= 60
        ? 'yellow'
        : 'red';

    return (
      <Layout>
        <Modal
          open={showRegistrationModal}
          onCancel={() => setShowRegistrationModal(false)}
          footer={null}
          centered
        >
          <div className="text-center space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-100 to-pink-100 text-amber-700 text-xs font-semibold">
              <CrownOutlined /> შედეგები შენახულია, დროა შემდეგ ნაბიჯზე გადახვიდე
            </div>
            <div>
              <Title level={3} className="!mb-1">
                შენ წარმატებით გაიარე ვიქტორინა!
              </Title>
              <Text type="secondary">შექმენი ანგარიში და მიიღე სრული გამოცდილება</Text>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                <LineChartOutlined className="text-blue-500 text-lg" />
                <div>
                  <div className="font-medium">პროგრესის ისტორია</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                <TrophyOutlined className="text-amber-500 text-lg" />
                <div>
                  <div className="font-medium">პრიზები</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                <TeamOutlined className="text-purple-500 text-lg" />
                <div>
                  <div className="font-medium">ლიდერბორდები</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                <SafetyCertificateOutlined className="text-green-600 text-lg" />
                <div>
                  <div className="font-medium">დაცულობა</div>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3 justify-center mt-2">
              <Button
                type="primary"
                size="large"
                className="px-8 h-auto py-3 font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 border-0"
                icon={<UserAddOutlined />}
                onClick={() => navigate('/register')}
              >
                შექმენი ანგარიში
              </Button>
              <Button size="large" icon={<LoginOutlined />} onClick={() => navigate('/login')}>
                უკვე ხარ წევრი? შესვლა
              </Button>
            </div>
          </div>
        </Modal>
        <div className="max-w-4xl mx-auto py-8 px-4">
          <Result
            icon={
              percentage >= 80 ? (
                <div className="text-6xl animate-bounce">🏆</div>
              ) : percentage >= 60 ? (
                <div className="text-6xl animate-pulse">🎉</div>
              ) : (
                <div className="text-6xl">📚</div>
              )
            }
            title={
              <div className="text-center">
                <Title level={2} className="mb-2">
                  დასრულდა!
                </Title>
                <Badge count={grade} color={gradeColor} className="text-2xl font-bold" />
              </div>
            }
            subTitle={
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-gray-800">
                  {quizScore}/{currentQuestions.length} ({percentage}%)
                </div>
                <div className="text-gray-600">დრო: {formatTime(timeSpent)}</div>
              </div>
            }
            extra={
              <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 w-full">
                <Button
                  key="home"
                  size="large"
                  onClick={handleGoHome}
                  className="flex-1 sm:flex-none px-6 py-3 h-auto border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-800 font-medium shadow-md hover:shadow-lg transition-all duration-300"
                  icon={<HomeOutlined />}
                  style={{ borderRadius: '12px', minWidth: '160px' }}
                >
                  მთავარ გვერდზე
                </Button>
              </div>
            }
          >
            <Row gutter={[16, 16]} className="mt-8">
              <Col xs={24} sm={8}>
                <Card className="text-center hover:shadow-lg transition-shadow">
                  <Statistic
                    title="სწორი პასუხები"
                    value={quizScore}
                    suffix={`/${currentQuestions.length}`}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card className="text-center hover:shadow-lg transition-shadow">
                  <Statistic
                    title="პროცენტი"
                    value={percentage}
                    suffix="%"
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card className="text-center hover:shadow-lg transition-shadow">
                  <Statistic
                    title="დრო"
                    value={formatTime(timeSpent)}
                    valueStyle={{ color: '#722ed1' }}
                  />
                </Card>
              </Col>
            </Row>
          </Result>
        </div>
      </Layout>
    );
  }

  const currentQuestion = getCurrentQuestion();
  if (!currentQuestion) {
    return (
      <Layout>
        <div className="text-center py-20">
          <Spin size="large" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="max-w-4xl mx-auto py-4 sm:py-8 px-4">
          {/* Header with Progress */}
          <Card
            className="mb-6 shadow-xl border-0 bg-white/90 backdrop-blur-sm"
            style={{ borderRadius: '20px' }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => {
                  window.scrollTo(0, 0);
                  navigate(-1);
                }}
                className="hover:scale-105 transition-all duration-300 shadow-md border-0 bg-gray-100 hover:bg-gray-200"
                size="large"
                style={{ borderRadius: '12px' }}
              >
                <span className="hidden sm:inline">დაბრუნება</span>
                <span className="sm:hidden">უკან</span>
              </Button>
              <div className="text-center flex-1">
                <Title
                  level={3}
                  className="mb-2 text-lg sm:text-xl lg:text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                >
                  {currentQuiz.quizName}
                </Title>
                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                  <div className="flex items-center px-2 py-1 bg-blue-50 rounded-full">
                    <QuestionCircleOutlined className="mr-1 text-blue-500" />
                    <span className="font-medium">
                      {currentQuestionIndex + 1} / {currentQuestions.length}
                    </span>
                  </div>
                  <div className="flex items-center px-2 py-1 bg-green-50 rounded-full">
                    <CheckCircleOutlined className="mr-1 text-green-500" />
                    <span className="font-medium">{getAnsweredCount()} პასუხი</span>
                  </div>
                  <div className="flex items-center px-2 py-1 bg-purple-50 rounded-full">
                    <ClockCircleOutlined className="mr-1 text-purple-500" />
                    <span className="font-medium">{formatTime(timeSpent)}</span>
                  </div>
                </div>
              </div>
              <div className="w-0 sm:w-20"></div> {/* Spacer for centering on desktop */}
            </div>

            <div className="space-y-3">
              <Progress
                percent={getProgressPercentage()}
                showInfo={false}
                strokeColor={{
                  '0%': '#10b981',
                  '50%': '#3b82f6',
                  '100%': '#8b5cf6',
                }}
                className="mb-2"
                strokeWidth={8}
                style={{ borderRadius: '4px' }}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>დაწყება</span>
                <span className="font-bold text-blue-600">{Math.round(getProgressPercentage())}%</span>
                <span>დასრულება</span>
              </div>
            </div>
          </Card>

          {/* Question */}
          <Card
            className="mb-6 shadow-xl border-0 hover:shadow-2xl transition-all duration-500 bg-white/90 backdrop-blur-sm"
            style={{ borderRadius: '20px' }}
          >
            <div className="mb-6">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-full flex items-center justify-center font-bold mr-4 shadow-lg">
                  {currentQuestionIndex + 1}
                </div>
                <Title level={4} className="mb-0 text-gray-700">
                  კითხვა
                </Title>
              </div>

              <Title
                level={3}
                className="mb-6 leading-relaxed text-xl sm:text-2xl text-gray-800 font-semibold"
              >
                {currentQuestion.question}
              </Title>

              {/* Show question image during the question */}
              {currentQuestion.hasPhoto && questionPhotos[currentQuestion.id] && (
                <div className="mb-6 text-center">
                  <div className="relative inline-block">
                    <Image
                      src={questionPhotos[currentQuestion.id]}
                      alt="Question"
                      className="max-w-full rounded-xl shadow-lg mx-auto"
                      style={{ maxHeight: '300px', objectFit: 'contain' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent rounded-xl"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Answers */}
            <div className="space-y-4">
              {currentQuestion.answers.map((answer, index) => {
                const isSelected = getSelectedAnswer(currentQuestion.id) === index;
                const isCorrect = isAnswerCorrect(currentQuestion.id, index);
                const revealed = submittedQuestions[currentQuestion.id];
                const showCorrect = revealed && isCorrect;
                const showIncorrect = revealed && isSelected && !isCorrect;

                return (
                  <Button
                    key={index}
                    type={isSelected ? 'primary' : 'default'}
                    size="large"
                    className={`w-full text-left h-auto py-4 sm:py-6 px-4 sm:px-6 transition-all duration-500 transform hover:scale-[1.02] ${
                      showCorrect
                        ? 'bg-green-50 border-2 border-green-400 text-green-800 shadow-xl hover:shadow-2xl'
                        : showIncorrect
                        ? 'bg-red-50 border-2 border-red-400 text-red-800 shadow-xl hover:shadow-2xl'
                        : isSelected
                        ? 'bg-blue-50 border-2 border-blue-400 text-blue-800 shadow-lg hover:shadow-xl'
                        : 'hover:bg-gray-50 hover:shadow-lg border-2 border-gray-200 hover:border-gray-300'
                    } ${answerAnimation && isSelected ? 'animate-pulse' : ''}`}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={submittedQuestions[currentQuestion.id]}
                    icon={
                      showCorrect ? (
                        <CheckCircleOutlined className="text-xl text-green-500" />
                      ) : showIncorrect ? (
                        <CloseCircleOutlined className="text-xl text-red-500" />
                      ) : isSelected ? (
                        <CheckCircleOutlined className="text-xl text-blue-500" />
                      ) : null
                    }
                    style={{ borderRadius: '16px' }}
                  >
                    <div className="flex items-center w-full">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mr-4 shadow-md transition-all duration-300 ${
                          showCorrect
                            ? 'bg-green-500 text-white'
                            : showIncorrect
                            ? 'bg-red-500 text-white'
                            : isSelected
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-300 text-gray-700'
                        }`}
                      >
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className="text-base sm:text-lg font-medium flex-1 leading-relaxed break-words whitespace-normal">
                        {answer.answer}
                      </span>
                    </div>
                  </Button>
                );
              })}
            </div>

            {/* Submit and Next actions */}
            <div className="mt-4 flex justify-end gap-2">
              {!submittedQuestions[currentQuestion.id] && (
                <Button
                  type="primary"
                  size="large"
                  onClick={handleSubmitAnswer}
                  disabled={
                    submittedQuestions[currentQuestion.id] ||
                    selectedAnswers[currentQuestion.id] === undefined
                  }
                  className="px-6"
                >
                  პასუხის დადასტურება
                </Button>
              )}
              {submittedQuestions[currentQuestion.id] && (
                <Button
                  type="default"
                  size="large"
                  onClick={handleNext}
                  className="px-6"
                  icon={<ArrowRightOutlined />}
                >
                  {currentQuestionIndex === currentQuestions.length - 1
                    ? 'დასრულება'
                    : 'შემდეგი კითხვა'}
                </Button>
              )}
            </div>
          </Card>
          {/* Navigation */}
        </div>
      </div>
    </Layout>
  );
};

export default PublicQuizPlayPage;
