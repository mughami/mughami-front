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
} from '@ant-design/icons';
import { useQuizStore, cleanupBlobUrl } from '../../store/quizStore';
import Layout from '../../components/Layout';

const { Title, Text } = Typography;

const QuizPlayPage: React.FC = () => {
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
    fetchUserQuiz,
    fetchQuizQuestions,
    startQuiz,
    selectAnswer,
    nextQuestion,
    previousQuestion,
    completeQuiz,
    resetQuiz,
    getQuizPhoto,
    getQuestionPhoto,
  } = useQuizStore();

  const [quizPhotoUrl, setQuizPhotoUrl] = useState<string>('');
  const [questionPhotos, setQuestionPhotos] = useState<Record<number, string>>({});
  const blobUrlsRef = useRef<Set<string>>(new Set());
  const [showAnswer, setShowAnswer] = useState(false);
  const [answerAnimation, setAnswerAnimation] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);

  useEffect(() => {
    if (quizId) {
      const id = parseInt(quizId);
      fetchUserQuiz(id);
      fetchQuizQuestions(id, 0, 50);
    }
  }, [quizId, fetchUserQuiz, fetchQuizQuestions]);

  useEffect(() => {
    // Fetch quiz photo
    if (currentQuiz?.hasPhoto) {
      getQuizPhoto(currentQuiz.quizId).then((photoUrl) => {
        if (quizPhotoUrl) {
          cleanupBlobUrl(quizPhotoUrl);
          blobUrlsRef.current.delete(quizPhotoUrl);
        }
        setQuizPhotoUrl(photoUrl);
        blobUrlsRef.current.add(photoUrl);
      });
    }
  }, [currentQuiz, getQuizPhoto]);

  useEffect(() => {
    // Fetch question photos
    const fetchQuestionPhotos = async () => {
      Object.values(questionPhotos).forEach((url) => {
        cleanupBlobUrl(url);
        blobUrlsRef.current.delete(url);
      });

      const photos: Record<number, string> = {};
      for (const question of currentQuestions) {
        if (question.hasPhoto) {
          try {
            const photoUrl = await getQuestionPhoto(question.id);
            photos[question.id] = photoUrl;
            blobUrlsRef.current.add(photoUrl);
          } catch {
            console.error(`Failed to fetch photo for question ${question.id}`);
          }
        }
      }
      setQuestionPhotos(photos);
    };

    if (currentQuestions.length > 0) {
      fetchQuestionPhotos();
    }

    return () => {
      blobUrlsRef.current.forEach((url) => cleanupBlobUrl(url));
      blobUrlsRef.current.clear();
    };
  }, [currentQuestions, getQuestionPhoto]);

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
      try {
        const id = parseInt(quizId);
        await fetchUserQuiz(id);
        await fetchQuizQuestions(id, 0, 50);
        useQuizStore.setState({
          quizStarted: true,
          currentQuestionIndex: 0,
          selectedAnswers: {},
          loading: false,
        });
      } catch (error) {
        useQuizStore.setState({
          error: error instanceof Error ? error.message : 'Failed to start quiz',
          loading: false,
        });
      }
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (!quizStarted || quizCompleted) return;

    const currentQuestion = currentQuestions[currentQuestionIndex];
    selectAnswer(currentQuestion.id, answerIndex);
    setAnswerAnimation(true);

    // Show answer after a brief delay for animation
    setTimeout(() => {
      setShowAnswer(true);
      setAnswerAnimation(false);
    }, 300);
  };

  const handleNext = () => {
    if (currentQuestionIndex < currentQuestions.length - 1) {
      nextQuestion();
      setShowAnswer(false);
    } else {
      completeQuiz();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      previousQuestion();
      setShowAnswer(false);
    }
  };

  const handleRestart = () => {
    // Clear all quiz-related localStorage data
    localStorage.removeItem('quizResults');
    localStorage.removeItem('quizzes');

    resetQuiz();
    setShowAnswer(false);
    setTimeSpent(0);
    if (quizId) {
      startQuiz(parseInt(quizId));
    }
  };

  const handleGoHome = () => {
    // Clear all quiz-related localStorage data
    localStorage.removeItem('quizResults');
    localStorage.removeItem('quizzes');

    navigate('/');
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
            <div className="mt-4 text-gray-600">იტვირთება ვიქტორინა...</div>
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
              ვიქტორინა ვერ მოიძებნა
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
        <div className="max-w-4xl mx-auto py-8 px-4">
          <Card className="text-center shadow-lg border-0">
            <div className="mb-8">
              {currentQuiz.hasPhoto && quizPhotoUrl ? (
                <div className="relative mb-6">
                  <Image
                    src={quizPhotoUrl}
                    alt={currentQuiz.quizName}
                    className="w-full max-w-md mx-auto rounded-xl shadow-lg"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl" />
                </div>
              ) : (
                <div className="w-full max-w-md mx-auto h-64 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-xl mb-6 flex items-center justify-center shadow-lg">
                  <TrophyOutlined className="text-white text-6xl animate-pulse" />
                </div>
              )}

              <Title
                level={2}
                className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
              >
                {currentQuiz.quizName}
              </Title>

              <div className="flex items-center justify-center space-x-6 text-gray-600 mb-6">
                <div className="flex items-center">
                  <QuestionCircleOutlined className="mr-2" />
                  <span>{currentQuestions.length} კითხვა</span>
                </div>
                <div className="flex items-center">
                  <ClockCircleOutlined className="mr-2" />
                  <span>~{Math.ceil(currentQuestions.length * 2)} წუთი</span>
                </div>
                {/* <div className="flex items-center">
                  <StarOutlined className="mr-2 text-yellow-500" />
                  <span>4.8</span>
                </div> */}
              </div>
            </div>

            <Space direction="vertical" size="large" className="w-full">
              {/* <div className="text-left max-w-2xl mx-auto">
                <Title level={4} className="mb-4 flex items-center">
                  <BulbOutlined className="mr-2 text-yellow-500" />
                  ინსტრუქციები
                </Title>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                    <div className="flex items-center mb-2">
                      <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-2">
                        1
                      </div>
                      <Text strong>აირჩიეთ პასუხი</Text>
                    </div>
                    <Text className="text-gray-600">თითოეული კითხვისთვის აირჩიეთ ერთი პასუხი</Text>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                    <div className="flex items-center mb-2">
                      <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-2">
                        2
                      </div>
                      <Text strong>შეამოწმეთ შედეგი</Text>
                    </div>
                    <Text className="text-gray-600">დაუყოვნებლივ მიიღებთ უკუკავშირს</Text>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400">
                    <div className="flex items-center mb-2">
                      <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-2">
                        3
                      </div>
                      <Text strong>გადადით შემდეგზე</Text>
                    </div>
                    <Text className="text-gray-600">შეგიძლიათ გადახედოთ და შეცვალოთ პასუხები</Text>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-400">
                    <div className="flex items-center mb-2">
                      <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-2">
                        4
                      </div>
                      <Text strong>მიიღეთ შედეგი</Text>
                    </div>
                    <Text className="text-gray-600">შედეგები ინახება თქვენს ბრაუზერში</Text>
                  </div>
                </div>
              </div> */}

              <Button
                type="primary"
                size="large"
                onClick={handleStartQuiz}
                loading={loading}
                className="px-12 py-3 h-auto text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                icon={<PlayCircleOutlined />}
              >
                ვიქტორინის დაწყება
              </Button>
            </Space>
          </Card>
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
                  ვიქტორინა დასრულდა!
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
            extra={[
              <Button
                key="restart"
                type="primary"
                size="large"
                onClick={handleRestart}
                className="mr-4"
              >
                <TrophyOutlined className="mr-2" />
                ხელახლა დაწყება
              </Button>,
              // <Button
              //   key="results"
              //   size="large"
              //   onClick={() => navigate('/quiz/results')}
              //   className="mr-4"
              // >
              //   <HistoryOutlined className="mr-2" />
              //   ჩემი შედეგები
              // </Button>,
              <Button key="home" size="large" onClick={handleGoHome}>
                <HomeOutlined className="mr-2" />
                მთავარ გვერდზე
              </Button>,
            ]}
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
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header with Progress */}
        <Card className="mb-6 shadow-lg border-0">
          <div className="flex items-center justify-between mb-4">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/')}
              className="hover:scale-105 transition-transform"
            >
              დაბრუნება
            </Button>
            <div className="text-center">
              <Title level={3} className="mb-1">
                {currentQuiz.quizName}
              </Title>
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <QuestionCircleOutlined className="mr-1" />
                  <span>
                    კითხვა {currentQuestionIndex + 1} / {currentQuestions.length}
                  </span>
                </div>
                <div className="flex items-center">
                  <CheckCircleOutlined className="mr-1 text-green-500" />
                  <span>{getAnsweredCount()} პასუხი</span>
                </div>
                <div className="flex items-center">
                  <ClockCircleOutlined className="mr-1 text-blue-500" />
                  <span>{formatTime(timeSpent)}</span>
                </div>
              </div>
            </div>
            <div className="w-20"></div> {/* Spacer for centering */}
          </div>

          <Progress
            percent={getProgressPercentage()}
            showInfo={false}
            strokeColor={{
              '0%': '#108ee9',
              '100%': '#87d068',
            }}
            className="mb-2"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>დაწყება</span>
            <span>{Math.round(getProgressPercentage())}%</span>
            <span>დასრულება</span>
          </div>
        </Card>

        {/* Question */}
        <Card className="mb-6 shadow-lg border-0 hover:shadow-xl transition-shadow">
          <div className="mb-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold mr-3">
                {currentQuestionIndex + 1}
              </div>
              <Title level={4} className="mb-0">
                კითხვა
              </Title>
            </div>

            <Title level={3} className="mb-4 leading-relaxed">
              {currentQuestion.question}
            </Title>
          </div>

          {/* Answers */}
          <div className="space-y-3">
            {currentQuestion.answers.map((answer, index) => {
              const isSelected = getSelectedAnswer(currentQuestion.id) === index;
              const isCorrect = isAnswerCorrect(currentQuestion.id, index);
              const showCorrect = showAnswer && isCorrect;
              const showIncorrect = showAnswer && isSelected && !isCorrect;

              return (
                <Button
                  key={index}
                  type={isSelected ? 'primary' : 'default'}
                  size="large"
                  className={`w-full text-left h-auto py-4 px-6 transition-all duration-300 transform hover:scale-102 ${
                    showCorrect
                      ? 'bg-green-100 border-green-500 text-green-700 shadow-lg'
                      : showIncorrect
                      ? 'bg-red-100 border-red-500 text-red-700 shadow-lg'
                      : isSelected
                      ? 'bg-blue-100 border-blue-500 shadow-md'
                      : 'hover:bg-gray-50 hover:shadow-md'
                  } ${answerAnimation && isSelected ? 'animate-pulse' : ''}`}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showAnswer}
                  icon={
                    showCorrect ? (
                      <CheckCircleOutlined className="text-xl" />
                    ) : showIncorrect ? (
                      <CloseCircleOutlined className="text-xl" />
                    ) : isSelected ? (
                      <CheckCircleOutlined />
                    ) : null
                  }
                >
                  <div className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mr-3 ${
                        showCorrect
                          ? 'bg-green-500 text-white'
                          : showIncorrect
                          ? 'bg-red-500 text-white'
                          : isSelected
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="text-lg">{answer.answer}</span>
                  </div>
                </Button>
              );
            })}
          </div>
        </Card>

        {/* Answer Result Modal */}
        <Modal
          open={showAnswer}
          onCancel={() => setShowAnswer(false)}
          footer={null}
          width={800}
          centered
          className="answer-result-modal"
          maskStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
          bodyStyle={{ padding: 0, background: 'transparent' }}
        >
          <div className="relative">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-xl"></div>

            {/* Main content */}
            <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Header with animated background */}

              {/* Content area */}
              <div className="p-8">
                {/* Question image */}
                {currentQuestion.hasPhoto && questionPhotos[currentQuestion.id] && (
                  <div className="mb-6 text-center">
                    <div className="relative inline-block">
                      <Image
                        src={questionPhotos[currentQuestion.id]}
                        alt="Question"
                        className="max-w-full rounded-xl shadow-lg mx-auto"
                        style={{ maxHeight: '300px', objectFit: 'contain' }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-xl"></div>
                    </div>
                  </div>
                )}

                {/* Question text */}
                <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center mb-3">
                    <QuestionCircleOutlined className="text-blue-500 text-xl mr-2" />
                    <Text strong className="text-gray-700">
                      კითხვა:
                    </Text>
                  </div>
                  <Text className="text-lg text-gray-800 leading-relaxed">
                    {currentQuestion.question}
                  </Text>
                </div>

                {/* Answer analysis */}
                <div className="mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Your answer */}
                    <div
                      className={`p-4 rounded-xl border-2 answer-analysis-card ${
                        getSelectedAnswer(currentQuestion.id) !== undefined &&
                        isAnswerCorrect(currentQuestion.id, getSelectedAnswer(currentQuestion.id))
                          ? 'border-green-200 bg-green-50'
                          : 'border-red-200 bg-red-50'
                      }`}
                    >
                      <div className="flex items-center mb-2">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold mr-2 ${
                            getSelectedAnswer(currentQuestion.id) !== undefined &&
                            isAnswerCorrect(currentQuestion.id, getSelectedAnswer(currentQuestion.id))
                              ? 'bg-green-500'
                              : 'bg-red-500'
                          }`}
                        >
                          {getSelectedAnswer(currentQuestion.id) !== undefined &&
                          isAnswerCorrect(currentQuestion.id, getSelectedAnswer(currentQuestion.id))
                            ? '✓'
                            : '✗'}
                        </div>
                        <Text strong className="text-gray-700">
                          თქვენი პასუხი:
                        </Text>
                      </div>
                      <Text className="text-gray-800">
                        {getSelectedAnswer(currentQuestion.id) !== undefined
                          ? currentQuestion.answers[getSelectedAnswer(currentQuestion.id)]?.answer
                          : 'პასუხი არ იყო მოცემული'}
                      </Text>
                    </div>

                    {/* Correct answer */}
                    <div className="p-4 rounded-xl border-2 border-green-200 bg-green-50 answer-analysis-card">
                      <div className="flex items-center mb-2">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-2">
                          ✓
                        </div>
                        <Text strong className="text-gray-700">
                          სწორი პასუხი:
                        </Text>
                      </div>
                      <Text className="text-gray-800">
                        {
                          currentQuestion.answers.find((answer, index) =>
                            isAnswerCorrect(currentQuestion.id, index),
                          )?.answer
                        }
                      </Text>
                    </div>
                  </div>
                </div>

                {/* Progress indicator */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <Text className="text-gray-600">პროგრესი</Text>
                    <Text className="text-gray-600 font-semibold">
                      {currentQuestionIndex + 1} / {currentQuestions.length}
                    </Text>
                  </div>
                  <Progress
                    percent={getProgressPercentage()}
                    showInfo={false}
                    strokeColor={{
                      '0%': '#3b82f6',
                      '100%': '#10b981',
                    }}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>დაწყება</span>
                    <span>{Math.round(getProgressPercentage())}%</span>
                    <span>დასრულება</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex justify-center space-x-4">
                  <Button
                    size="large"
                    onClick={() => setShowAnswer(false)}
                    className="px-6 py-2 h-auto"
                  >
                    დახურვა
                  </Button>
                  <Button
                    type="primary"
                    size="large"
                    onClick={handleNext}
                    className="px-6 py-2 h-auto shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    icon={<ArrowRightOutlined />}
                  >
                    {currentQuestionIndex === currentQuestions.length - 1
                      ? 'დასრულება'
                      : 'შემდეგი კითხვა'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Modal>

        {/* Navigation */}
        <Card className="shadow-lg border-0">
          <div className="flex justify-between items-center">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              size="large"
              className="hover:scale-105 transition-transform"
            >
              წინა
            </Button>

            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">პროგრესი</div>
              <div className="text-lg font-bold text-blue-600">
                {currentQuestionIndex + 1} / {currentQuestions.length}
              </div>
            </div>

            <Button
              type="primary"
              icon={<ArrowRightOutlined />}
              onClick={handleNext}
              disabled={!showAnswer}
              size="large"
              className="hover:scale-105 transition-transform"
            >
              {currentQuestionIndex === currentQuestions.length - 1 ? 'დასრულება' : 'შემდეგი'}
            </Button>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default QuizPlayPage;
