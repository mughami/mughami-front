import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Progress, Radio, Space, Typography, Spin } from 'antd';
import {
  TrophyOutlined,
  QuestionCircleOutlined,
  TeamOutlined,
  RightOutlined,
  FireOutlined,
  UserOutlined,
  ArrowRightOutlined,
  CrownOutlined,
  LeftOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import Footer from '../components/Footer';
import { usePollStore } from '../store/pollStore';
import { useAuthStore } from '../store';

const { Title, Paragraph } = Typography;

const Home = () => {
  const { polls, loading, fetchPolls, vote } = usePollStore();
  const { isAuthenticated, user } = useAuthStore();
  const [selectedPolls, setSelectedPolls] = useState<Record<number, number>>({});
  const [votedPolls, setVotedPolls] = useState<number[]>(() => {
    const savedVotes = localStorage.getItem('votedPolls');
    return savedVotes ? JSON.parse(savedVotes) : [];
  });
  const [showResults, setShowResults] = useState<Record<number, boolean>>(() => {
    const savedResults = localStorage.getItem('showResults');
    return savedResults ? JSON.parse(savedResults) : {};
  });
  const [currentSlide, setCurrentSlide] = useState(0);
  const videoIframeRefs = useRef<(HTMLIFrameElement | null)[]>([]);
  const pollsContainerRef = useRef<HTMLDivElement | null>(null);

  // Safety check to ensure currentSlide is always valid for 2 slides
  useEffect(() => {
    if (currentSlide > 1) {
      setCurrentSlide(0);
    }
  }, [currentSlide]);

  // Keyboard navigation for slider
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setCurrentSlide(currentSlide === 0 ? 1 : currentSlide - 1);
      } else if (e.key === 'ArrowRight') {
        setCurrentSlide(currentSlide === 1 ? 0 : currentSlide + 1);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSlide]);

  // Pause Facebook videos on non-active slides by resetting iframe src
  useEffect(() => {
    videoIframeRefs.current.forEach((iframe, idx) => {
      if (iframe && idx !== currentSlide) {
        const src = iframe.src;
        // Reset the src to stop playback
        iframe.src = src;
      }
    });
  }, [currentSlide]);

  useEffect(() => {
    fetchPolls(0, 10);
  }, [fetchPolls]);

  // Save voted polls to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('votedPolls', JSON.stringify(votedPolls));
    localStorage.setItem('showResults', JSON.stringify(showResults));
  }, [votedPolls, showResults]);

  const features = [
    {
      icon: <QuestionCircleOutlined className="text-4xl text-primary" />,
      title: 'ქვიზები',
      description: 'გაიარეთ სხვადასხვა კატეგორიის ქვიზები და შეამოწმეთ თქვენი ცოდნა',
    },
    {
      icon: <TrophyOutlined className="text-4xl text-primary" />,
      title: 'კონკურსები',
      description: 'მიიღეთ მონაწილეობა კონკურსებში და მოიგეთ თანხა',
    },
    {
      icon: <TeamOutlined className="text-4xl text-primary" />,
      title: 'რეიტინგი',
      description: 'შეეჯიბრეთ სხვა მონაწილეებს და გახდით საუკეთესო',
    },
  ];

  const testimonials = [
    {
      name: 'გიორგი გიორგაძე',
      role: 'ქვიზის გამარჯვებული',
      text: 'ამ პლატფორმის წყალობით შევძელი მონაწილეობის მიღება სხვადასხვა კონკურსებში და პრიზების მოგება.',
      avatar: '/avatars/user1.jpg',
    },
    {
      name: 'ნინო ნინიძე',
      role: 'ტოპ მონაწილე',
      text: 'ძალიან მიყვარს ამ პლატფორმაზე ქვიზების გავლა და სხვა მონაწილეებთან შეჯიბრება.',
      avatar: '/avatars/user2.jpg',
    },
  ];

  // const latestContests = [
  //   {
  //     title: 'მუღამის ვიქტორინა 2024',
  //     date: '15 მაისი, 2024',
  //     prize: '₾10,000',
  //     image: '/contests/quiz.jpg',
  //   },
  //   {
  //     title: 'მუღამის ოლიმპიადა',
  //     date: '1 ივნისი, 2024',
  //     prize: '₾5,000',
  //     image: '/contests/olympiad.jpg',
  //   },
  // ];

  const handleVote = (pollId: number, optionId: number) => {
    if (!votedPolls.includes(pollId)) {
      setSelectedPolls((prev) => ({ ...prev, [pollId]: optionId }));
    }
  };

  const submitVote = async (pollId: number) => {
    if (selectedPolls[pollId] && !votedPolls.includes(pollId)) {
      try {
        await vote(pollId, selectedPolls[pollId]);
        setVotedPolls((prev) => [...prev, pollId]);
        setShowResults((prev) => ({ ...prev, [pollId]: true }));
      } catch (error) {
        console.error('Error submitting vote:', error);
      }
    }
  };

  const getTotalVotes = (options: { result: number }[]) => {
    return options.reduce((sum, option) => sum + option.result, 0);
  };

  const calculatePercentage = (votes: number, total: number) => {
    return total === 0 ? 0 : Math.round((votes / total) * 100);
  };

  const scrollPolls = (direction: 'left' | 'right') => {
    const el = pollsContainerRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.85;
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary via-primary-dark to-purple-800 text-white py-32 relative overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0">
            <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
            <div className="absolute top-32 right-20 w-16 h-16 bg-yellow-300/20 rounded-full animate-bounce"></div>
            <div className="absolute bottom-20 left-32 w-12 h-12 bg-blue-300/20 rounded-full animate-pulse delay-300"></div>
            <div className="absolute bottom-40 right-10 w-24 h-24 bg-green-300/10 rounded-full animate-bounce delay-500"></div>
            <div className="absolute top-1/2 left-1/4 w-8 h-8 bg-red-300/20 rounded-full animate-ping"></div>
            <div className="absolute top-1/3 right-1/3 w-14 h-14 bg-pink-300/15 rounded-full animate-pulse delay-700"></div>
          </div>
          <div className="absolute inset-0 bg-[url('/hero-pattern.png')] opacity-10" />

          {/* Decorative Stars */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-1/4 text-yellow-300 opacity-70 animate-pulse">⭐</div>
            <div className="absolute top-40 right-1/4 text-yellow-300 opacity-60 animate-pulse delay-300">
              ✨
            </div>
            <div className="absolute bottom-32 left-1/3 text-yellow-300 opacity-80 animate-pulse delay-500">
              🌟
            </div>
            <div className="absolute bottom-20 right-1/5 text-yellow-300 opacity-50 animate-pulse delay-700">
              ⭐
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center">
              {/* Icon Circle */}
              <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full mb-8 animate-bounce">
                <TrophyOutlined className="text-4xl text-yellow-300" />
              </div>

              {/* Main Heading */}
              <Title
                level={1}
                className="!text-white mb-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold bg-clip-text bg-gradient-to-"
              >
                {isAuthenticated ? (
                  <>
                    მოგესალმებით, <span className="text-yellow-300">{user?.name}</span>! 🎉
                  </>
                ) : (
                  'მზად ხარ დაიწყო თავგადასავალი?'
                )}
              </Title>

              {/* Subtitle */}
              <Paragraph className="text-xl sm:text-2xl mb-8 max-w-3xl mx-auto text-white/95 leading-relaxed font-medium">
                ცეცხლი აინთო თამაში დაიწყო ,{' '}
                <span className="text-yellow-300 font-bold">პრიზების მოგების დროა!</span>
              </Paragraph>

              {/* Features List */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all duration-300">
                  <QuestionCircleOutlined className="text-3xl text-blue-300 mb-3" />
                  <h3 className="text-lg font-bold mb-2">100+ ქვიზი</h3>
                  <p className="text-white/80">სხვადასხვა კატეგორია</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all duration-300">
                  <TrophyOutlined className="text-3xl text-yellow-300 mb-3" />
                  <h3 className="text-lg font-bold mb-2">პრიზები</h3>
                  <p className="text-white/80">მოიგეთ პრიზები ყოველდღე</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all duration-300">
                  <TeamOutlined className="text-3xl text-green-300 mb-3" />
                  <h3 className="text-lg font-bold mb-2">პოლები</h3>
                  <p className="text-white/80">გააკეთე არჩევანი</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-6 items-center justify-center">
                {isAuthenticated ? (
                  <>
                    <Link to="/categories">
                      <Button
                        size="large"
                        className="bg-gradient-to-r from-white to-gray-100 text-primary hover:from-yellow-100 hover:to-white border-0 h-16 px-12 text-xl font-bold rounded-2xl shadow-2xl hover:shadow-yellow-300/30 transform hover:scale-105 transition-all duration-300"
                      >
                        🚀 დაიწყე ქვიზი
                        <RightOutlined className="ml-2" />
                      </Button>
                    </Link>
                    <Link to="/public-quizzes">
                      <Button
                        size="large"
                        className="text-white bg-gradient-to-r from-green-500 to-green-600 border-0 hover:from-green-600 hover:to-green-700 h-16 px-12 text-xl font-bold rounded-2xl shadow-2xl hover:shadow-green-300/30 transform hover:scale-105 transition-all duration-300"
                      >
                        🔓 ღია ვიქტორინები
                        <RightOutlined className="ml-2" />
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/public-quizzes">
                      <Button
                        size="large"
                        className="bg-gradient-to-r from-green-400 to-green-500 text-white hover:from-green-500 hover:to-green-600 border-0 h-16 px-12 text-xl font-bold rounded-2xl shadow-2xl hover:shadow-green-300/30 transform hover:scale-105 transition-all duration-300"
                      >
                        🔓 ღია ვიქტორინები
                        <RightOutlined className="ml-2" />
                      </Button>
                    </Link>
                    <Link to="/register">
                      <Button
                        size="large"
                        className="bg-gradient-to-r from-white to-gray-100 text-primary hover:from-yellow-100 hover:to-white border-0 h-16 px-12 text-xl font-bold rounded-2xl shadow-2xl hover:shadow-yellow-300/30 transform hover:scale-105 transition-all duration-300"
                      >
                        🎯 დარეგისტრირდი ახლავე
                        <RightOutlined className="ml-2" />
                      </Button>
                    </Link>
                    <Link to="/login">
                      <Button
                        size="large"
                        className="text-white bg-transparent border-2 border-white/50 hover:bg-white/10 hover:border-white h-16 px-12 text-xl font-bold rounded-2xl backdrop-blur-sm transform hover:scale-105 transition-all duration-300"
                      >
                        🔑 შესვლა
                        <ArrowRightOutlined className="ml-2" />
                      </Button>
                    </Link>
                  </>
                )}
              </div>

              {/* Bottom Stats */}
              <div className="mt-16 pt-8 border-t border-white/20">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-300">1,234</div>
                    <div className="text-white/70">აქტიური მომხმარებელი</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-300">10+</div>
                    <div className="text-white/70">გამარჯვებულები</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-300">100+</div>
                    <div className="text-white/70">ქვიზი</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-pink-300">45</div>
                    <div className="text-white/70">კონკურსი</div>
                  </div>
                </div>
              </div>

              {/* Final Encouragement */}
              {!isAuthenticated && (
                <div className="mt-12 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 backdrop-blur-sm rounded-2xl p-6 max-w-2xl mx-auto border border-yellow-300/30">
                  <p className="text-yellow-100 text-lg font-medium">
                    💫 <strong>ყოველდღე ახალი შანსი!</strong> რეგისტრაცია მხოლოდ 30 წამში
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Hero Section
        <section className="bg-auth-gradient text-white py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 bg-[url('/hero-pattern.png')] opacity-10" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center">
              <img
                src={logo}
                alt="მუღამის ლოგო"
                className="mx-auto mb-8 w-24 h-24 rounded-full shadow-lg object-cover border-4 border-white/80"
              />
              <h1 className="text-5xl sm:text-7xl font-bold mb-8 animate-fade-in leading-tight">
                მოგესალმებით მუღამის ქვიზების სამყაროში
              </h1>
              <p className="text-xl sm:text-2xl mb-12 max-w-3xl mx-auto text-white/90 leading-relaxed">
                შეამოწმეთ თქვენი ცოდნა, მიიღეთ მონაწილეობა კონკურსებში და მოიგეთ თანხა
              </p>
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                <Link to="/register">
                  <Button
                    type="primary"
                    size="large"
                    className="bg-white text-primary hover:bg-gray-100 h-14 px-10 text-lg rounded-full"
                  >
                    დარეგისტრირდი
                  </Button>
                </Link>
                <Link to="/categories">
                  <Button
                    size="large"
                    className="text-white bg-primary border-white hover:bg-white/10 h-14 px-10 text-lg rounded-full"
                  >
                    დაიწყე ქვიზი
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section> */}

        {/* Stats Section
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Row gutter={[32, 32]} justify="center">
              {stats.map((stat, index) => (
                <Col xs={24} sm={12} md={6} key={index}>
                  <Card className="text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <Statistic
                      title={stat.title}
                      value={stat.value}
                      prefix={stat.icon}
                      className="text-primary"
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </section> */}

        {/* Enhanced Polls Section */}
        <section
          id="polls-section"
          className="py-16 bg-gradient-to-br from-slate-50 via-blue-50/50 to-purple-100/30 relative overflow-hidden"
        >
          {/* Premium Background Effects */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-32 right-1/4 w-80 h-80 bg-gradient-to-br from-purple-400/10 to-pink-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
            <div className="absolute top-1/2 left-10 w-64 h-64 bg-gradient-to-br from-cyan-400/8 to-blue-500/8 rounded-full blur-2xl animate-pulse delay-1000"></div>
          </div>

          {/* Floating Poll Icons */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-16 right-20 text-4xl animate-bounce delay-300">📊</div>
            <div className="absolute top-40 left-16 text-3xl animate-pulse delay-500">🗳️</div>
            <div className="absolute bottom-20 right-16 text-4xl animate-bounce delay-700">📈</div>
            <div className="absolute bottom-40 left-20 text-3xl animate-pulse delay-1000">✨</div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Enhanced Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-2xl mb-6 group animate-pulse">
                <div className="text-3xl">🗳️</div>
              </div>

              <Title
                level={2}
                className="mb-4 text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-800 via-blue-600 to-purple-600 bg-clip-text text-transparent"
              >
                ✨ მონაწილეობა მიიღეთ გამოკითხვებში
              </Title>

              <Paragraph className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mb-6">
                გაიარეთ ჩვენი ინტერაქტიული გამოკითხვები და
                <span className="font-semibold text-blue-600"> გაუზიარეთ თქვენი მოსაზრება</span> ✨
                საზოგადოებას
              </Paragraph>

              {/* Decorative Line */}
              <div className="flex items-center justify-center gap-2">
                <div className="w-6 h-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"></div>
                <div className="w-12 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                <div className="w-6 h-1 bg-gradient-to-r from-pink-500 to-red-400 rounded-full"></div>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center min-h-[300px]">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-500/20 rounded-full blur-xl animate-pulse"></div>
                  <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl p-8 shadow-2xl">
                    <Spin size="large" />
                    <p className="mt-4 text-slate-600 font-medium">იტვირთება გამოკითხვები...</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative">
                {/* Premium Background Glow */}
                <div className="absolute -inset-8 bg-gradient-to-r from-blue-400/20 via-purple-500/20 to-pink-500/20 rounded-[3rem] blur-3xl opacity-60"></div>

                <div className="relative bg-gradient-to-br from-white/90 via-white/80 to-white/70 backdrop-blur-2xl rounded-[2rem] overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] border-2 border-white/70 ring-1 ring-white/50">
                  {/* Premium Navigation Arrows - Visible and positioned properly */}
                  <Button
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-white via-blue-50/80 to-white backdrop-blur-xl border-2 border-white/90 shadow-[0_15px_20px_-5px_rgba(0,0,0,0.15)] hover:shadow-[0_20px_40px_-12px_rgba(59,130,246,0.3)] flex items-center justify-center hover:scale-110 hover:rotate-3 transition-all duration-500 group ring-1 ring-blue-100/60"
                    onClick={() => scrollPolls('left')}
                    icon={
                      <LeftOutlined className="text-blue-600 text-lg group-hover:text-blue-700 group-hover:scale-110 transition-all duration-300" />
                    }
                  />

                  <Button
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-white via-purple-50/80 to-white backdrop-blur-xl border-2 border-white/90 shadow-[0_15px_20px_-5px_rgba(0,0,0,0.15)] hover:shadow-[0_20px_40px_-12px_rgba(147,51,234,0.3)] flex items-center justify-center hover:scale-110 hover:-rotate-3 transition-all duration-500 group ring-1 ring-purple-100/60"
                    onClick={() => scrollPolls('right')}
                    icon={
                      <RightOutlined className="text-purple-600 text-lg group-hover:text-purple-700 group-hover:scale-110 transition-all duration-300" />
                    }
                  />

                  {/* Enhanced Scroll Container */}
                  <div
                    ref={pollsContainerRef}
                    className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory px-20 py-6 sm:py-8"
                    style={{
                      scrollbarWidth: 'none',
                    }}
                  >
                    {polls.map((poll) => {
                      const totalVotes = getTotalVotes(poll.options);
                      const hasVoted = votedPolls.includes(poll.id);
                      const showPollResults = showResults[poll.id];

                      return (
                        <div
                          key={poll.id}
                          className="snap-start flex-shrink-0 min-w-[85vw] sm:min-w-[400px] max-w-[500px] group"
                        >
                          {/* Premium Poll Card with Glow Effect */}
                          <div className="relative h-full">
                            {/* Background Glow */}
                            <div className="absolute -inset-6 bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700"></div>

                            <Card
                              className="relative max-h-[600px] hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 shadow-xl bg-gradient-to-br from-white via-white/95 to-blue-50/30 backdrop-blur-xl ring-2 ring-white/50 hover:ring-blue-200/50 rounded-2xl overflow-hidden"
                              title={
                                <div className="flex flex-col w-full p-2">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-start min-w-0 flex-1 mr-2">
                                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-3 shadow-lg animate-pulse flex-shrink-0">
                                        <FireOutlined className="text-white text-base" />
                                      </div>
                                      <div className="flex items-center mt-1">
                                        <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-2 flex-shrink-0"></div>
                                        <span className="text-xs text-slate-500">
                                          აქტიური გამოკითხვა
                                        </span>
                                      </div>
                                    </div>
                                    {hasVoted && (
                                      <div className="flex items-center bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-full font-medium shadow-lg text-sm flex-shrink-0">
                                        <span className="text-base mr-1">✅</span>
                                        <span className="hidden sm:inline">ხმა ჩაწერილია</span>
                                        <span className="sm:hidden">ხმა</span>
                                      </div>
                                    )}
                                  </div>
                                  {/* Poll Title - Full Width */}
                                  <div className="w-full">
                                    <h3 className="text-lg sm:text-xl font-bold text-slate-800 bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent leading-relaxed break-words whitespace-normal overflow-wrap-break-word hyphens-auto w-full">
                                      {poll.title}
                                    </h3>
                                  </div>
                                </div>
                              }
                            >
                              {!showPollResults ? (
                                <div className="space-y-4 p-1 max-h-[400px] overflow-y-auto">
                                  <div className="bg-gradient-to-r from-blue-50 via-blue-50/70 to-purple-50/50 border-l-4 border-blue-400 p-4 rounded-xl mb-4 shadow-sm">
                                    <div className="flex items-center">
                                      <div className="text-xl mr-2">👆</div>
                                      <p className="text-blue-800 font-semibold text-base">
                                        აირჩიეთ თქვენი ვარიანტი და მიიღეთ მონაწილეობა!
                                      </p>
                                    </div>
                                  </div>
                                  <Radio.Group
                                    onChange={(e) => handleVote(poll.id, e.target.value as number)}
                                    value={selectedPolls[poll.id]}
                                    className="w-full"
                                    disabled={hasVoted}
                                  >
                                    <Space direction="vertical" className="w-full">
                                      {poll.options.map((option) => (
                                        <div
                                          key={option.id}
                                          className={`w-full p-3 rounded-xl transition-all duration-300 cursor-pointer group/option ${
                                            selectedPolls[poll.id] === option.id
                                              ? 'bg-gradient-to-r from-blue-50 via-purple-50/50 to-pink-50/30 border-blue-400 shadow-md transform scale-102 ring-1 ring-blue-200/50'
                                              : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/30 border-gray-300 hover:border-blue-300 hover:shadow-sm'
                                          } border-2`}
                                        >
                                          <Radio value={option.id} className="w-full">
                                            <div className="flex justify-between items-start w-full gap-3">
                                              <span className="font-semibold text-slate-700 flex-1 leading-relaxed break-words whitespace-normal text-base group-hover/option:text-slate-800">
                                                {option.name}
                                              </span>
                                              {selectedPolls[poll.id] === option.id && (
                                                <div className="flex items-center bg-gradient-to-r from-blue-500 to-purple-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-md">
                                                  <span className="mr-1">✨</span>
                                                  <span className="hidden sm:inline">არჩეული</span>
                                                </div>
                                              )}
                                            </div>
                                          </Radio>
                                        </div>
                                      ))}
                                    </Space>
                                  </Radio.Group>
                                  <Button
                                    type="primary"
                                    size="large"
                                    className="w-full mt-4 h-12 rounded-xl text-base font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 shadow-md hover:shadow-lg transform hover:scale-102 transition-all duration-300 border-0"
                                    onClick={() => submitVote(poll.id)}
                                    disabled={!selectedPolls[poll.id] || hasVoted}
                                  >
                                    <div className="flex items-center justify-center">
                                      <span className="text-lg mr-2">{hasVoted ? '✅' : '🗳️'}</span>
                                      <span>{hasVoted ? 'ხმა ჩაწერილია' : 'ხმის მიცემა'}</span>
                                    </div>
                                  </Button>
                                </div>
                              ) : (
                                <div className="space-y-4 p-1 max-h-[400px] overflow-y-auto">
                                  <div className="bg-gradient-to-r from-green-50 via-emerald-50/70 to-teal-50/50 border-l-4 border-green-400 p-4 rounded-xl mb-4 shadow-sm">
                                    <div className="flex items-center">
                                      <div className="text-xl mr-2">🎉</div>
                                      <div>
                                        <p className="text-green-800 font-bold text-base">
                                          მადლობა მონაწილეობისთვის!
                                        </p>
                                        <p className="text-green-700 text-xs mt-1">
                                          ნახეთ შედეგები და სხვების მოსაზრება
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                  {poll.options.map((option) => {
                                    const percentage = calculatePercentage(option.result, totalVotes);
                                    const isSelected = selectedPolls[poll.id] === option.id;

                                    return (
                                      <div
                                        key={option.id}
                                        className={`p-3 rounded-xl transition-all duration-300 ${
                                          isSelected
                                            ? 'bg-gradient-to-r from-blue-50 via-purple-50/50 to-pink-50/30 border-blue-400 shadow-md ring-1 ring-blue-200/50'
                                            : 'bg-gradient-to-r from-gray-50 to-slate-50/50 border-gray-300 hover:border-gray-400 hover:shadow-sm'
                                        } border-2`}
                                      >
                                        <div className="flex justify-between items-start mb-3 gap-3">
                                          <span className="font-semibold text-gray-700 flex-1 leading-relaxed break-words whitespace-normal">
                                            {option.name}
                                          </span>
                                          <span className="text-gray-600 font-bold flex-shrink-0">
                                            {percentage}%
                                          </span>
                                        </div>
                                        <Progress
                                          percent={percentage}
                                          showInfo={false}
                                          strokeColor={{
                                            '0%': '#3b82f6',
                                            '50%': '#8b5cf6',
                                            '100%': '#ec4899',
                                          }}
                                          className="mb-2"
                                          strokeWidth={8}
                                          style={{
                                            background:
                                              'linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 100%)',
                                          }}
                                        />
                                        <div className="flex justify-between text-sm text-gray-500">
                                          <span>📊 {option.result} ხმა</span>
                                          {isSelected && (
                                            <span className="text-primary font-bold">
                                              👤 თქვენი არჩევანი
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                  <div className="text-center mt-4 p-3 bg-gradient-to-r from-slate-100 via-blue-50/50 to-purple-50/30 rounded-xl border border-slate-200 shadow-sm">
                                    <div className="flex items-center justify-center">
                                      <span className="text-lg mr-2">📊</span>
                                      <div>
                                        <div className="text-slate-800 font-bold text-base">
                                          სულ ხმები: {totalVotes}
                                        </div>
                                        <div className="text-slate-500 text-xs">
                                          გამოკითხვაში მონაწილე
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Card>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Mobile Scroll Hint */}
                <div className="flex justify-center mt-4 sm:hidden">
                  <div className="flex items-center bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-md border border-gray-200">
                    <span className="text-xs text-gray-600 mr-2">გადაფურცavanje</span>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse delay-100"></div>
                      <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse delay-200"></div>
                    </div>
                    <span className="text-xs text-gray-600 ml-2">👈👉</span>
                  </div>
                </div>
              </div>
            )}
            {/* Premium Call to Action */}
            <div className="text-center mt-12">
              <div className="relative max-w-3xl mx-auto">
                <div className="absolute -inset-3 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-2xl blur-lg"></div>
                <div className="relative bg-gradient-to-r from-white via-blue-50/30 to-purple-50/20 backdrop-blur-xl rounded-2xl p-6 shadow-lg border-2 border-white/60">
                  <div className="flex items-center justify-center mb-4">
                    <div className="text-2xl mr-3">💡</div>
                    <div className="text-2xl">🗳️</div>
                    <div className="text-2xl ml-3">✨</div>
                  </div>
                  <Title
                    level={4}
                    className="mb-3 bg-gradient-to-r from-slate-700 to-blue-600 bg-clip-text text-transparent"
                  >
                    რჩევა ჩვენი გუნდისგან
                  </Title>
                  <Paragraph className="text-base text-slate-600 leading-relaxed">
                    მონაწილეობა მიიღეთ ყველა გამოკითხვაში და
                    <span className="font-bold text-blue-600"> გაიგეთ სხვების მოსაზრება</span>{' '}
                    საინტერესო თემებზე!
                  </Paragraph>
                  <div className="flex items-center justify-center mt-4">
                    <div className="flex -space-x-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full border-2 border-white"></div>
                      <div className="w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full border-2 border-white"></div>
                      <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-cyan-500 rounded-full border-2 border-white"></div>
                      <div className="w-6 h-6 bg-gradient-to-r from-red-400 to-orange-500 rounded-full border-2 border-white"></div>
                    </div>
                    <span className="ml-3 text-slate-500 font-medium text-sm">
                      +1000 მონაწილე ყოველდღე
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quiz Section */}
        {/* <QuizSection /> */}

        {/* Features Section - Enhanced */}
        <section className="py-24 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200/20 rounded-full blur-3xl animate-pulse delay-300"></div>
            <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-200/20 rounded-full blur-3xl animate-pulse delay-700"></div>
            <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-pink-200/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full mb-6 animate-bounce">
                <TrophyOutlined className="text-3xl text-primary" />
              </div>
              <Title
                level={2}
                className="mb-4 bg-gradient-to-r from-gray-900 via-primary to-purple-600 bg-clip-text text-transparent"
              >
                რატომ უნდა მიიღოთ მონაწილეობა?
              </Title>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="text-center hover:shadow-2xl transition-all duration-500 hover:-translate-y-4 border-0 bg-white/80 backdrop-blur-sm group relative overflow-hidden"
                  style={{
                    background:
                      'linear-gradient(145deg, rgba(255,255,255,0.9), rgba(249,250,251,0.8))',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  }}
                >
                  {/* Hover glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  <div className="relative p-8">
                    <div className="mb-6 p-6 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-full inline-block group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <Title
                      level={3}
                      className="mb-4 group-hover:text-primary transition-colors duration-300"
                    >
                      {feature.title}
                    </Title>
                    <Paragraph className="text-gray-600 text-lg leading-relaxed">
                      {feature.description}
                    </Paragraph>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
        {/* Facebook Videos Section - Enhanced */}
        <section className="py-24 bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-100/30 relative overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-1/4 w-72 h-72 bg-gradient-to-br from-blue-400/10 to-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-32 right-1/4 w-96 h-96 bg-gradient-to-br from-indigo-400/10 to-pink-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
            <div className="absolute top-1/2 left-10 w-48 h-48 bg-gradient-to-br from-cyan-400/8 to-blue-500/8 rounded-full blur-2xl animate-pulse delay-1000"></div>
          </div>

          {/* Floating icons */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-16 right-20 text-4xl animate-bounce delay-300">📱</div>
            <div className="absolute top-40 left-16 text-3xl animate-pulse delay-500">🎬</div>
            <div className="absolute bottom-20 right-16 text-4xl animate-bounce delay-700">📺</div>
            <div className="absolute bottom-40 left-20 text-3xl animate-pulse delay-1000">🎥</div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Enhanced Header */}
            <div className="text-center mb-20">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-2xl mb-8 group">
                <div className="text-4xl animate-pulse">🎬</div>
              </div>

              <Title
                level={2}
                className="mb-6 text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-800 via-blue-600 to-purple-600 bg-clip-text text-transparent"
              >
                ✨ ვიდეო კოლექცია
              </Title>

              {/* <Paragraph className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-8">
                ნახეთ ჩვენი საუკეთესო მომენტები, გამარჯვებულების ისტორიები და
                <span className="font-semibold text-blue-600"> შთამაგონებელი ვიდეოები</span>✨ ქვიზების
                სამყაროდან
              </Paragraph> */}

              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-8 h-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"></div>
                <div className="w-16 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                <div className="w-8 h-1 bg-gradient-to-r from-pink-500 to-red-400 rounded-full"></div>
              </div>
            </div>

            {/* Premium Video Slider */}
            <div className="relative">
              {/* Ambient Background Glow */}
              <div className="absolute -inset-8 bg-gradient-to-r from-blue-400/20 via-purple-500/20 to-pink-500/20 rounded-[3rem] blur-3xl opacity-60"></div>

              <div className="relative bg-gradient-to-br from-white/90 via-white/80 to-white/70 backdrop-blur-2xl rounded-[2rem] overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] border-2 border-white/70 ring-1 ring-white/50">
                {/* Luxury Navigation Arrows */}
                <Button
                  className="absolute left-8 top-1/2 transform -translate-y-1/2 z-40 w-20 h-20 rounded-full bg-gradient-to-br from-white via-blue-50/50 to-white backdrop-blur-xl border-3 border-white/90 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] hover:shadow-[0_25px_50px_-12px_rgba(59,130,246,0.25)] flex items-center justify-center hover:scale-110 hover:rotate-6 transition-all duration-500 group ring-2 ring-blue-100/50"
                  onClick={() => setCurrentSlide(currentSlide === 0 ? 1 : currentSlide - 1)}
                  icon={
                    <LeftOutlined className="text-blue-600 text-2xl group-hover:text-blue-700 group-hover:scale-110 transition-all duration-300" />
                  }
                />

                <Button
                  className="absolute right-8 top-1/2 transform -translate-y-1/2 z-40 w-20 h-20 rounded-full bg-gradient-to-br from-white via-purple-50/50 to-white backdrop-blur-xl border-3 border-white/90 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] hover:shadow-[0_25px_50px_-12px_rgba(147,51,234,0.25)] flex items-center justify-center hover:scale-110 hover:-rotate-6 transition-all duration-500 group ring-2 ring-purple-100/50"
                  onClick={() => setCurrentSlide(currentSlide === 1 ? 0 : currentSlide + 1)}
                  icon={
                    <RightOutlined className="text-purple-600 text-2xl group-hover:text-purple-700 group-hover:scale-110 transition-all duration-300" />
                  }
                />

                {/* Premium Slide Content */}
                <div className="relative overflow-hidden bg-gradient-to-br from-slate-50/30 to-white/50">
                  <div
                    className="flex transition-transform duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)] h-full"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                  >
                    {/* Slide 1 - Main Featured Video */}
                    <div className="w-full flex-shrink-0 h-full flex items-center">
                      <div className="p-6 md:p-8 w-full">
                        <div className="group relative max-w-5xl mx-auto">
                          <div className="absolute -inset-8 bg-gradient-to-r from-blue-500/25 via-purple-500/25 to-pink-500/25 rounded-[2.5rem] blur-3xl opacity-70 group-hover:opacity-90 transition-all duration-1000"></div>
                          <div className="relative bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 backdrop-blur-xl rounded-[2rem] overflow-hidden shadow-[0_35px_60px_-12px_rgba(0,0,0,0.3)] border-2 border-white/80 ring-1 ring-blue-100/50">
                            <div className="aspect-video relative bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 overflow-hidden">
                              {/* Decorative Elements */}
                              <div className="absolute top-4 left-4 w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-60"></div>
                              <div className="absolute top-4 left-10 w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-40"></div>
                              <div className="absolute top-6 left-6 w-1 h-1 bg-gradient-to-r from-pink-500 to-blue-500 rounded-full opacity-80"></div>
                              <iframe
                                src="https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2F61574052881576%2Fvideos%2F763783312907246%2F&show_text=false&width=560&t=0"
                                width="100%"
                                height="100%"
                                style={{ border: 'none', overflow: 'hidden' }}
                                scrolling="no"
                                frameBorder="0"
                                allowFullScreen={true}
                                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                                className="rounded-[1.5rem] relative z-10"
                                ref={(el) => {
                                  videoIframeRefs.current[0] = el;
                                }}
                              />
                              {/* Enhanced Overlay with Premium Animation */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 rounded-[1.5rem] pointer-events-none"></div>
                              <div className="absolute bottom-6 left-6 right-6 bg-gradient-to-r from-black/90 via-black/80 to-black/70 backdrop-blur-xl text-white px-8 py-5 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-700 transform translate-y-6 group-hover:translate-y-0 border border-white/20 shadow-2xl">
                                <div className="flex items-center gap-4">
                                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                                    <PlayCircleOutlined className="text-2xl text-white" />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-bold text-xl mb-1 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                                      🎥 მთავარი ვიდეო
                                    </h4>
                                    <p className="text-blue-200 text-sm leading-relaxed">
                                      ქვიზების სამყაროში განსაკუთრებული შესაძლებლობები და შთამაგონებელი
                                      მომენტები
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Slide 2 - Secondary Featured Video */}
                    <div className="w-full flex-shrink-0 h-full flex items-center">
                      <div className="p-6 md:p-8 w-full">
                        <div className="group relative max-w-5xl mx-auto">
                          <div className="absolute -inset-8 bg-gradient-to-r from-cyan-400/25 via-blue-500/25 to-indigo-600/25 rounded-[2.5rem] blur-3xl opacity-70 group-hover:opacity-90 transition-all duration-1000"></div>
                          <div className="relative bg-gradient-to-br from-white via-cyan-50/30 to-blue-50/30 backdrop-blur-xl rounded-[2rem] overflow-hidden shadow-[0_35px_60px_-12px_rgba(0,0,0,0.3)] border-2 border-white/80 ring-1 ring-cyan-100/50">
                            <div className="aspect-video relative bg-gradient-to-br from-cyan-50/50 via-blue-50/30 to-indigo-50/50 overflow-hidden">
                              {/* Decorative Elements */}
                              <div className="absolute top-4 right-4 w-3 h-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full opacity-60"></div>
                              <div className="absolute top-4 right-10 w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full opacity-40"></div>
                              <div className="absolute top-6 right-6 w-1 h-1 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full opacity-80"></div>
                              <iframe
                                src="https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2F61574052881576%2Fvideos%2F1186693859893979%2F&show_text=false&width=560&t=0"
                                width="100%"
                                height="100%"
                                style={{ border: 'none', overflow: 'hidden' }}
                                scrolling="no"
                                frameBorder="0"
                                allowFullScreen={true}
                                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                                className="rounded-[1.5rem] relative z-10"
                                ref={(el) => {
                                  videoIframeRefs.current[1] = el;
                                }}
                              />
                              {/* Enhanced Overlay with Premium Animation */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 rounded-[1.5rem] pointer-events-none"></div>
                              <div className="absolute bottom-6 left-6 right-6 bg-gradient-to-r from-black/90 via-black/80 to-black/70 backdrop-blur-xl text-white px-8 py-5 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-700 transform translate-y-6 group-hover:translate-y-0 border border-white/20 shadow-2xl">
                                <div className="flex items-center gap-4">
                                  <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                                    <TrophyOutlined className="text-2xl text-yellow-300" />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-bold text-xl mb-1 bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
                                      ⭐ შედეგები და გამარჯვებულები
                                    </h4>
                                    <p className="text-cyan-200 text-sm leading-relaxed">
                                      წარმატებული მონაწილეების ისტორიები და მიღწევები
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Luxury Navigation Dots */}
                <div className="flex justify-center items-center space-x-8 py-8">
                  {[0, 1].map((index) => (
                    <button
                      key={index}
                      className={`relative transition-all duration-700 group ${
                        currentSlide === index ? 'w-5 h-5' : 'w-3 h-3 hover:w-4 hover:h-4'
                      }`}
                      onClick={() => setCurrentSlide(index)}
                    >
                      {/* Main Dot */}
                      <div
                        className={`absolute inset-0 rounded-full transition-all duration-700 ${
                          currentSlide === index
                            ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-[0_8px_16px_rgba(147,51,234,0.4)] scale-100 ring-2 ring-white/50'
                            : 'bg-gradient-to-r from-gray-300 to-gray-400 hover:from-blue-300 hover:to-purple-400 hover:shadow-lg scale-90 group-hover:ring-1 group-hover:ring-white/30'
                        }`}
                      />

                      {/* Active Indicator with Pulse */}
                      {currentSlide === index && (
                        <>
                          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-ping opacity-40" />
                          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-pulse opacity-60" />
                        </>
                      )}

                      {/* Hover Glow Effect */}
                      <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-lg" />

                      {/* Index Number (Subtle) */}
                      <div
                        className={`absolute inset-0 flex items-center justify-center text-[10px] font-bold transition-opacity duration-500 ${
                          currentSlide === index
                            ? 'text-white opacity-90'
                            : 'text-gray-600 opacity-0 group-hover:opacity-70'
                        }`}
                      >
                        {index + 1}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Premium Social Media Section */}
                <div className="text-center mt-12">
                  <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-sm rounded-3xl p-8 max-w-4xl mx-auto border border-white/30">
                    <div className="text-4xl mb-6">🌟</div>
                    <Title
                      level={3}
                      className="mb-6 text-slate-700 bg-gradient-to-r from-slate-700 via-blue-600 to-purple-600 bg-clip-text text-transparent"
                    >
                      გამოგვყევით ჩვენს სოციალურ ქსელებში!
                    </Title>
                    <Paragraph className="text-slate-600 mb-8 text-lg max-w-2xl mx-auto">
                      ყოველდღიური განახლებები, ექსკლუზივური კონტენტი და
                      <span className="font-semibold text-blue-600"> ახალი ვიდეოები </span>✨
                    </Paragraph>

                    {/* Social Media Icons */}
                    <div className="flex flex-wrap justify-center items-center gap-6 mb-6">
                      {/* Facebook */}
                      <button
                        onClick={() =>
                          window.open(
                            'https://www.facebook.com/share/17A2ykRSKj/?mibextid=wwXIfr',
                            '_blank',
                          )
                        }
                        className="group relative w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-110 hover:-rotate-3 transition-all duration-300 flex items-center justify-center ring-2 ring-blue-100/50 hover:ring-blue-200"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <span className="relative text-white text-2xl font-bold z-10">f</span>
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap">
                          Facebook
                        </div>
                      </button>

                      {/* YouTube */}
                      {/* <button
                        onClick={() => window.open('https://www.youtube.com/@mughami', '_blank')}
                        className="group relative w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-110 hover:rotate-3 transition-all duration-300 flex items-center justify-center ring-2 ring-red-100/50 hover:ring-red-200"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-red-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <svg
                          className="relative w-8 h-8 text-white z-10"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                        </svg>
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-red-600 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap">
                          YouTube
                        </div>
                      </button> */}

                      {/* Instagram */}
                      {/* <button
                        onClick={() =>
                          window.open('https://www.instagram.com/mughami_official', '_blank')
                        }
                        className="group relative w-16 h-16 bg-gradient-to-br from-pink-500 via-purple-500 to-orange-500 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-110 hover:-rotate-3 transition-all duration-300 flex items-center justify-center ring-2 ring-pink-100/50 hover:ring-pink-200"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-pink-400 via-purple-500 to-orange-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <svg
                          className="relative w-8 h-8 text-white z-10"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-pink-600 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap">
                          Instagram
                        </div>
                      </button> */}

                      {/* TikTok */}
                      <button
                        onClick={() =>
                          window.open(
                            'https://www.tiktok.com/@mugami05?_t=ZS-8ytoTramOor&_r=1',
                            '_blank',
                          )
                        }
                        className="group relative w-16 h-16 bg-gradient-to-br from-gray-900 to-black rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-110 hover:rotate-3 transition-all duration-300 flex items-center justify-center ring-2 ring-gray-100/50 hover:ring-gray-300"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <svg
                          className="relative w-8 h-8 text-white z-10"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M19.321 5.562a5.124 5.124 0 0 1-.443-.258 6.228 6.228 0 0 1-1.137-.966c-.849-.99-1.17-2.107-1.195-3.338h3.775v16.78c0 2.302-1.866 4.22-4.168 4.22-2.302 0-4.168-1.918-4.168-4.22 0-2.302 1.866-4.168 4.168-4.168.459 0 .9.075 1.316.213V9.709a8.117 8.117 0 0 0-1.316-.108c-4.513 0-8.168 3.655-8.168 8.168 0 2.685 1.294 5.066 3.288 6.531.519.381 1.084.704 1.689.947a8.055 8.055 0 0 0 3.191.653c4.513 0 8.168-3.655 8.168-8.168V5.562z" />
                        </svg>
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap">
                          TikTok
                        </div>
                      </button>
                    </div>

                    {/* Follow Stats */}
                    <div className="flex items-center justify-center gap-4 text-slate-500">
                      <div className="flex -space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full border-2 border-white"></div>
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full border-2 border-white"></div>
                        <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-cyan-500 rounded-full border-2 border-white"></div>
                        <div className="w-8 h-8 bg-gradient-to-r from-red-400 to-orange-500 rounded-full border-2 border-white"></div>
                      </div>
                      <span className="text-sm font-medium">+10 000 გამომწერი ყველა პლატფორმაზე</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section - Enhanced */}
        <section className="py-24 bg-gradient-to-br from-gray-50 via-primary/5 to-purple-50/20 relative overflow-hidden">
          {/* Floating elements */}
          <div className="absolute inset-0">
            <div className="absolute top-10 right-20 text-6xl text-primary/10 animate-pulse delay-300">
              🎯
            </div>
            <div className="absolute bottom-20 left-20 text-4xl text-purple-500/10 animate-bounce delay-700">
              🚀
            </div>
            <div className="absolute top-1/2 right-1/4 text-5xl text-blue-500/10 animate-pulse delay-1000">
              ⭐
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center mb-16">
              <Title
                level={2}
                className="mb-4 bg-gradient-to-r from-gray-900 via-primary to-purple-600 bg-clip-text text-transparent"
              >
                როგორ მუშაობს?
              </Title>
              <div className="w-32 h-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500 rounded-full mx-auto"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="text-center group">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full blur-lg group-hover:blur-xl transition-all duration-300"></div>
                  <div className="relative w-20 h-20 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                    <UserOutlined className="text-4xl text-primary" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    1
                  </div>
                </div>
                <Title
                  level={3}
                  className="mb-4 group-hover:text-primary transition-colors duration-300"
                >
                  დარეგისტრირდი
                </Title>
                <Paragraph className="text-gray-600 leading-relaxed">
                  შექმენით ანგარიში და მიიღეთ მონაწილეობა ქვიზებში
                </Paragraph>
              </div>
              <div className="text-center group">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full blur-lg group-hover:blur-xl transition-all duration-300"></div>
                  <div className="relative w-20 h-20 bg-gradient-to-br from-blue-400/10 to-purple-500/10 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                    <QuestionCircleOutlined className="text-4xl text-blue-500" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    2
                  </div>
                </div>
                <Title
                  level={3}
                  className="mb-4 group-hover:text-blue-500 transition-colors duration-300"
                >
                  გაიარე ქვიზი
                </Title>
                <Paragraph className="text-gray-600 leading-relaxed">
                  აირჩიეთ კატეგორია და დაიწყეთ ქვიზის გავლა
                </Paragraph>
              </div>
              <div className="text-center group">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full blur-lg group-hover:blur-xl transition-all duration-300"></div>
                  <div className="relative w-20 h-20 bg-gradient-to-br from-purple-400/10 to-pink-500/10 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                    <CrownOutlined className="text-4xl text-purple-500" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    3
                  </div>
                </div>
                <Title
                  level={3}
                  className="mb-4 group-hover:text-purple-500 transition-colors duration-300"
                >
                  მოიგე პრიზი
                </Title>
                <Paragraph className="text-gray-600 leading-relaxed">
                  მიიღეთ მონაწილეობა კონკურსებში და მოიგეთ თანხა
                </Paragraph>
              </div>
            </div>
          </div>
        </section>

        {/* Premium Testimonials Section */}
        <section className="py-24 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 relative overflow-hidden">
          {/* Background Decorations */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-10 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl mb-6">
                <span className="text-3xl">💬</span>
              </div>
              <Title
                level={2}
                className="mb-4 bg-gradient-to-r from-slate-700 via-blue-600 to-purple-600 bg-clip-text text-transparent"
              >
                რას ამბობენ ჩვენი მონაწილეები
              </Title>
              <Paragraph className="text-xl text-slate-600 max-w-2xl mx-auto">
                ისაუბრე ჩვენი კმაყოფილი მონაწილეების გამოცდილებაზე და წარმატების ისტორიებზე
              </Paragraph>
            </div>

            {/* Testimonials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="group relative">
                  {/* Background Glow */}
                  <div className="absolute -inset-4 bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-3xl blur-2xl opacity-60 group-hover:opacity-80 transition-all duration-700"></div>

                  {/* Card */}
                  <div className="relative bg-gradient-to-br from-white via-white/95 to-blue-50/30 backdrop-blur-xl rounded-3xl p-8 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.15)] border-2 border-white/60 hover:border-blue-200/60 transition-all duration-500 group-hover:transform group-hover:scale-105">
                    {/* Quote Icon */}
                    <div className="absolute top-6 right-6 w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
                      <span className="text-2xl text-blue-600/70">"</span>
                    </div>

                    {/* Content */}
                    <div className="space-y-6">
                      {/* Quote Text */}
                      <div className="relative">
                        <Paragraph className="text-lg leading-relaxed text-slate-700 italic font-medium">
                          "{testimonial.text}"
                        </Paragraph>
                      </div>

                      {/* Author Info */}
                      <div className="flex items-center space-x-4">
                        {/* Avatar Placeholder with Initials */}
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-lg">
                            {testimonial.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </span>
                        </div>

                        {/* Name and Role */}
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-800 text-lg">{testimonial.name}</h4>
                          <p className="text-slate-500 text-sm flex items-center">
                            <span className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-2"></span>
                            {testimonial.role}
                          </p>
                        </div>

                        {/* Rating Stars */}
                        <div className="flex space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className="text-yellow-400 text-lg">
                              ⭐
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute bottom-4 left-4 w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-40"></div>
                    <div className="absolute bottom-6 left-6 w-1 h-1 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full opacity-60"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Call to Action */}
            <div className="text-center mt-16">
              <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl px-8 py-4 border border-blue-200/50">
                <span className="text-2xl">🎯</span>
                <span className="text-slate-600 font-medium">
                  შეუერთდი ჩვენს კმაყოფილ მონაწილეებს!
                </span>
                <span className="text-2xl">🎉</span>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default Home;
