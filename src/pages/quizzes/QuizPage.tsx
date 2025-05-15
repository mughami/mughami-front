import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import QuizQuestion from '../../components/quizzes/QuizQuestion';
import QuizResult from '../../components/quizzes/QuizResult';
import { ArrowLeftOutlined, ClockCircleOutlined, DollarOutlined } from '@ant-design/icons';
import { useCategoryStore, useQuizStore, usePaymentStore } from '../../store';

const QUESTION_TIME = 20; // seconds per question

const QuizPage = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();

  // Category store
  const { selectedCategory, fetchCategoryById } = useCategoryStore();

  // Quiz store
  const {
    quiz,
    currentQuestionIndex,
    selectedOptions,
    timeLeft,
    score,
    quizCompleted,
    paymentConfirmed,
    isLoading: quizLoading,
    error: quizError,
    fetchQuizByCategory,
    selectOption,
    nextQuestion,
    resetQuiz,
    setTimeLeft,
    confirmPayment,
  } = useQuizStore();

  // Payment store
  const {
    createPaymentIntent,
    confirmPayment: confirmPaymentIntent,
    isLoading: paymentLoading,
    // error: paymentError,
  } = usePaymentStore();

  const [showResult, setShowResult] = useState(false);
  const [timerActive, setTimerActive] = useState(true);

  // Fetch category and quiz data
  useEffect(() => {
    if (categoryId) {
      fetchCategoryById(categoryId);
      resetQuiz();
    } else {
      navigate('/categories');
    }
  }, [categoryId, fetchCategoryById, navigate, resetQuiz]);

  // Fetch quiz questions when category is loaded
  useEffect(() => {
    if (selectedCategory && categoryId && paymentConfirmed) {
      fetchQuizByCategory(categoryId);
    }
  }, [selectedCategory, categoryId, paymentConfirmed, fetchQuizByCategory]);

  const handleTimeout = useCallback(() => {
    setShowResult(true);
    setTimerActive(false);

    setTimeout(() => {
      if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
        nextQuestion();
        setShowResult(false);
        setTimerActive(true);
        setTimeLeft(QUESTION_TIME);
      } else {
        useQuizStore.setState({ quizCompleted: true });
      }
    }, 2000);
  }, [quiz, currentQuestionIndex, nextQuestion, setTimeLeft, setShowResult, setTimerActive]);

  // Timer effect
  useEffect(() => {
    if (!timerActive || !paymentConfirmed || !quiz || quizCompleted) return;

    const timer = setInterval(() => {
      if (timeLeft <= 1) {
        clearInterval(timer);
        handleTimeout();
        setTimeLeft(0);
      } else {
        setTimeLeft(timeLeft - 1);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [
    currentQuestionIndex,
    timerActive,
    paymentConfirmed,
    quiz,
    quizCompleted,
    timeLeft,
    handleTimeout,
  ]);

  const handleAnswer = useCallback(
    (optionIndex: number) => {
      if (!quiz) return;

      const currentQuestion = quiz.questions[currentQuestionIndex];
      selectOption(currentQuestion.id, optionIndex);
      setShowResult(true);
      setTimerActive(false);

      setTimeout(() => {
        if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
          nextQuestion();
          setShowResult(false);
          setTimerActive(true);
          setTimeLeft(QUESTION_TIME);
        } else {
          useQuizStore.setState({ quizCompleted: true });
        }
      }, 2000);
    },
    [
      quiz,
      currentQuestionIndex,
      selectOption,
      nextQuestion,
      setTimeLeft,
      setShowResult,
      setTimerActive,
    ],
  );

  const handleRestart = useCallback(() => {
    resetQuiz();
    setShowResult(false);
    setTimerActive(true);
    setTimeLeft(QUESTION_TIME);
  }, [resetQuiz, setShowResult, setTimerActive, setTimeLeft]);

  const handlePayment = useCallback(async () => {
    if (!selectedCategory) return;
    confirmPayment();
    try {
      // In a real app, this would be integrated with a payment gateway
      const paymentIntent = await createPaymentIntent(selectedCategory.id, 1);
      if (paymentIntent) {
        const success = await confirmPaymentIntent(paymentIntent.id);
        if (success) {
          confirmPayment();
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
    }
  }, [selectedCategory, createPaymentIntent, confirmPaymentIntent, confirmPayment]);

  if (!selectedCategory) {
    return (
      <Layout>
        <div className="text-center py-10">
          <p className="text-xl text-gray-600">კატეგორია ვერ მოიძებნა</p>
          <Link to="/categories" className="form-link mt-4 inline-block">
            დაბრუნება კატეგორიებზე
          </Link>
        </div>
      </Layout>
    );
  }

  const isLoading = quizLoading || paymentLoading;
  const error = quizError;

  if (isLoading) {
    return (
      <Layout>
        <div className="text-center py-10">
          <p className="text-xl text-gray-600">იტვირთება...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center py-10">
          <p className="text-xl text-red-600">{error}</p>
          <Link to="/categories" className="form-link mt-4 inline-block">
            დაბრუნება კატეგორიებზე
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-4 sm:mb-6">
        <Link
          to="/categories"
          className="inline-flex items-center text-secondary hover:text-secondary-dark"
        >
          <ArrowLeftOutlined className="mr-1" />
          უკან დაბრუნება
        </Link>
      </div>

      <div className="quiz-header">
        <div>
          <h1 className="quiz-title">{selectedCategory.title}</h1>
          <p className="quiz-info">{selectedCategory.description}</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-gray-600">
            <ClockCircleOutlined className="mr-1" />
            <span>{timeLeft} წამი</span>
          </div>
          <div className="flex items-center text-primary font-medium">
            <DollarOutlined className="mr-1" />
            <span>პრიზი: {selectedCategory.prize} ₾</span>
          </div>
        </div>
      </div>

      {!paymentConfirmed ? (
        <div className="quiz-card">
          <div className="text-center py-6 sm:py-8">
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">დაიწყეთ ვიქტორინა</h2>
            <p className="mb-4 sm:mb-6 text-sm sm:text-base">
              ვიქტორინაში მონაწილეობის საფასურია 1 ლარი. გადაიხადეთ და დაიწყეთ თამაში!
            </p>
            <p className="mb-4 sm:mb-6 text-primary font-medium text-sm sm:text-base">
              გამარჯვების შემთხვევაში, თქვენ შეგიძლიათ მოიგოთ {selectedCategory.prize} ლარი!
            </p>
            <button onClick={handlePayment} className="quiz-button">
              გადახდა და დაწყება
            </button>
          </div>
        </div>
      ) : quizCompleted ? (
        <QuizResult
          score={score}
          totalQuestions={quiz?.questions.length || 0}
          prize={selectedCategory.prize}
          onRestart={handleRestart}
        />
      ) : quiz ? (
        <>
          <div className="mb-2 sm:mb-4 text-xs sm:text-sm text-gray-600">
            კითხვა {currentQuestionIndex + 1} / {quiz.questions.length}
          </div>
          <QuizQuestion
            question={quiz.questions[currentQuestionIndex]}
            onAnswer={handleAnswer}
            showResult={showResult}
            selectedOption={selectedOptions[quiz.questions[currentQuestionIndex].id] ?? null}
            timeLeft={timeLeft}
            totalTime={QUESTION_TIME}
          />
        </>
      ) : null}
    </Layout>
  );
};

export default QuizPage;
