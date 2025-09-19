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
    selectAnswer,
    submitAnswer,
    nextQuestion,

    completeQuiz,
    resetQuiz,
    clearCurrentQuiz,
    clearCurrentQuestions,
    getQuizPhoto,
    getQuestionPhoto,
  } = useQuizStore();

  const [quizPhotoUrl, setQuizPhotoUrl] = useState<string>('');
  const prevQuizPhotoUrlRef = useRef<string>('');
  const [questionPhotos, setQuestionPhotos] = useState<Record<number, string>>({});
  const blobUrlsRef = useRef<Set<string>>(new Set());
  const questionPhotoCacheRef = useRef<Record<number, string>>({});
  const inFlightRef = useRef<Set<number>>(new Set());
  // Removed popup; we now reveal inline after submit
  const [answerAnimation, setAnswerAnimation] = useState(false);

  const [submittedQuestions, setSubmittedQuestions] = useState<Record<number, boolean>>({});
  const [timeSpent, setTimeSpent] = useState(0);

  useEffect(() => {
    // Reset any previous quiz play state when switching quizzes
    resetQuiz();
    clearCurrentQuiz();
    clearCurrentQuestions();

    if (quizId) {
      const id = parseInt(quizId);
      fetchUserQuiz(id);
      fetchQuizQuestions(id, 0, 50);
    }

    return () => {
      // Clean up when leaving the page
      resetQuiz();
      clearCurrentQuiz();
      clearCurrentQuestions();
    };
  }, [quizId, fetchUserQuiz, fetchQuizQuestions, resetQuiz, clearCurrentQuiz, clearCurrentQuestions]);

  // No persisted results (localStorage disabled)

  useEffect(() => {
    let cancelled = false;
    const prevUrl = prevQuizPhotoUrlRef.current;
    if (currentQuiz?.hasPhoto) {
      const id = currentQuiz.quizId;
      getQuizPhoto(id)
        .then((photoUrl) => {
          if (cancelled) {
            // If effect cleaned up, revoke fetched URL immediately
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

  // Cleanup quiz photo URL on unmount
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

  const handleAnswerSelect = async (answerIndex: number) => {
    if (!quizStarted || quizCompleted) return;
    const currentQuestion = currentQuestions[currentQuestionIndex];
    try {
      await selectAnswer(currentQuestion.id, answerIndex);
      setAnswerAnimation(true);
      setTimeout(() => setAnswerAnimation(false), 200);
    } catch (error) {
      console.error('Failed to select answer:', error);
    }
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
    if (currentQuestionIndex < currentQuestions.length - 1) {
      nextQuestion();
    } else {
      completeQuiz();
    }
  };

  const handleGoHome = () => {
    // Do not persist partial results; simply navigate away
    resetQuiz();
    clearCurrentQuiz();
    clearCurrentQuestions();
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
                  <span>~{Math.ceil(currentQuestions.length * 0.5)} წუთი</span>
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
                className="px-12 w-full max-w-[300px] py-3 h-auto text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
              className="hover:scale-105 transition-transform"
            >
              დაბრუნება
            </Button>
            <div className="text-center">
              <Title level={3} className="mb-1 break-words">
                {currentQuiz.quizName}
              </Title>
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-sm text-gray-600">
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
            <div className="hidden sm:block w-20"></div> {/* Spacer for centering */}
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
          <div className="space-y-3">
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
                  disabled={submittedQuestions[currentQuestion.id]}
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
                  <div className="flex items-center w-full">
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
                    <span className="text-lg flex-1 leading-relaxed break-words whitespace-normal">
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
                {currentQuestionIndex === currentQuestions.length - 1 ? 'დასრულება' : 'შემდეგი კითხვა'}
              </Button>
            )}
          </div>
        </Card>
        {/* Navigation */}
      </div>
    </Layout>
  );
};

export default QuizPlayPage;
