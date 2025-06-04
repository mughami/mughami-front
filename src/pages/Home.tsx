import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Progress, Radio, Space, Typography, Carousel } from 'antd';
import {
  TrophyOutlined,
  QuestionCircleOutlined,
  TeamOutlined,
  RightOutlined,
  FireOutlined,
  UserOutlined,
  ClockCircleOutlined,
  ArrowRightOutlined,
  CrownOutlined,
  DownOutlined,
} from '@ant-design/icons';
import Footer from '../components/Footer';

const { Title, Paragraph } = Typography;

const Home = () => {
  const [selectedPolls, setSelectedPolls] = useState<Record<number, string>>({});
  const [votedPolls, setVotedPolls] = useState<number[]>([]);
  const [showResults, setShowResults] = useState<Record<number, boolean>>({});

  const scrollToPolls = () => {
    const pollsSection = document.getElementById('polls-section');
    if (pollsSection) {
      pollsSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

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

  // const stats = [
  //   { title: 'მონაწილე', value: '1,234', icon: <UserOutlined /> },
  //   { title: 'ქვიზი', value: '100+', icon: <QuestionCircleOutlined /> },
  //   { title: 'კონკურსი', value: '45', icon: <TrophyOutlined /> },
  //   { title: 'პრიზი', value: '₾50,000+', icon: <StarOutlined /> },
  // ];

  const testimonials = [
    {
      name: 'გიორგი გიორგაძე',
      role: 'ქვიზის გამარჯვებული',
      text: 'ამ პლატფორმის წყალობით შევძელი მონაწილეობა მიღება სხვადასხვა კონკურსებში და პრიზების მოგება.',
      avatar: '/avatars/user1.jpg',
    },
    {
      name: 'ნინო ნინიძე',
      role: 'ტოპ მონაწილე',
      text: 'ძალიან მიყვარს ამ პლატფორმაზე ქვიზების გავლა და სხვა მონაწილეებთან შეჯიბრება.',
      avatar: '/avatars/user2.jpg',
    },
  ];

  const latestContests = [
    {
      title: 'მუღამის ვიქტორინა 2024',
      date: '15 მაისი, 2024',
      prize: '₾10,000',
      image: '/contests/quiz.jpg',
    },
    {
      title: 'მუღამის ოლიმპიადა',
      date: '1 ივნისი, 2024',
      prize: '₾5,000',
      image: '/contests/olympiad.jpg',
    },
  ];

  const polls = [
    {
      id: 1,
      question: 'რომელი მუღამია თქვენი ფავორიტი?',
      options: [
        { id: 'a', text: 'შაჰნაზი', votes: 45, color: '#1890ff' },
        { id: 'b', text: 'მაჰური', votes: 30, color: '#52c41a' },
        { id: 'c', text: 'რასთი', votes: 25, color: '#722ed1' },
      ],
    },
    {
      id: 2,
      question: 'რომელი ინსტრუმენტი გირჩევნიათ?',
      options: [
        { id: 'a', text: 'ტარი', votes: 40, color: '#fa8c16' },
        { id: 'b', text: 'ქამანჩა', votes: 35, color: '#eb2f96' },
        { id: 'c', text: 'დოლი', votes: 25, color: '#13c2c2' },
      ],
    },
  ];

  const handleVote = (pollId: number, optionId: string) => {
    setSelectedPolls((prev) => ({ ...prev, [pollId]: optionId }));
  };

  const submitVote = (pollId: number) => {
    if (selectedPolls[pollId]) {
      setVotedPolls((prev) => [...prev, pollId]);
      setShowResults((prev) => ({ ...prev, [pollId]: true }));
    }
  };

  const getTotalVotes = (options: { votes: number }[]) => {
    return options.reduce((sum, option) => sum + option.votes, 0);
  };

  const calculatePercentage = (votes: number, total: number) => {
    return Math.round((votes / total) * 100);
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
                🎉 მზად ხართ დაიწყოთ თავგადასავალი?
              </Title>

              {/* Subtitle */}
              <Paragraph className="text-xl sm:text-2xl mb-8 max-w-3xl mx-auto text-white/95 leading-relaxed font-medium">
                შეუერთდით <span className="text-yellow-300 font-bold">ათასობით მონაწილეს</span> და
                დაიწყეთ
                <span className="text-green-300 font-bold"> ქვიზების გავლა</span> ახლავე! 🚀
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
                  <h3 className="text-lg font-bold mb-2">რეალური პრიზები</h3>
                  <p className="text-white/80">მოიგეთ ნამდვილი თანხა</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all duration-300">
                  <TeamOutlined className="text-3xl text-green-300 mb-3" />
                  <h3 className="text-lg font-bold mb-2">ექსკლუზივური</h3>
                  <p className="text-white/80">საზოგადოების წევრობა</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-6 items-center justify-center">
                <Link to="/register">
                  <Button
                    size="large"
                    className="bg-gradient-to-r from-white to-gray-100 text-primary hover:from-yellow-100 hover:to-white border-0 h-16 px-12 text-xl font-bold rounded-2xl shadow-2xl hover:shadow-yellow-300/30 transform hover:scale-105 transition-all duration-300"
                  >
                    🎯 დარეგისტრირდი ახლავე
                    <RightOutlined className="ml-2" />
                  </Button>
                </Link>
                <Link to="/categories">
                  <Button
                    size="large"
                    className="text-white bg-transparent border-2 border-white/50 hover:bg-white/10 hover:border-white h-16 px-12 text-xl font-bold rounded-2xl backdrop-blur-sm transform hover:scale-105 transition-all duration-300"
                  >
                    🚀 დაიწყე ქვიზი
                    <ArrowRightOutlined className="ml-2" />
                  </Button>
                </Link>
              </div>

              {/* Bottom Stats */}
              <div className="mt-16 pt-8 border-t border-white/20">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-300">1,234</div>
                    <div className="text-white/70">აქტიური მომხმარებელი</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-300">₾50,000+</div>
                    <div className="text-white/70">გაცემული პრიზები</div>
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
              <div className="mt-12 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 backdrop-blur-sm rounded-2xl p-6 max-w-2xl mx-auto border border-yellow-300/30">
                <p className="text-yellow-100 text-lg font-medium">
                  💫 <strong>ყოველდღე ახალი შანსი!</strong> რეგისტრაცია მხოლოდ 30 წამში
                </p>
              </div>
            </div>
          </div>

          {/* Scroll Down Button - Enhanced Visibility
          <div className="fixed bottom-8 right-8 z-10 hidden lg:block">
            <button
              onClick={scrollToPolls}
              className="group relative flex flex-col items-center justify-center p-5 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/60 hover:bg-white/30 hover:border-white shadow-2xl hover:shadow-white/30 transition-all duration-500 hover:scale-125 animate-bounce"
              style={{
                boxShadow: '0 0 30px rgba(255, 255, 255, 0.3), 0 0 60px rgba(255, 255, 255, 0.1)',
              }}
            >
              <span className="text-white text-sm font-bold mb-2 group-hover:text-yellow-200 transition-colors drop-shadow-lg">
                გამოკითხვები
              </span>
              <div className="flex flex-col items-center">
                <DownOutlined className="text-2xl text-white group-hover:text-yellow-200 transition-all duration-300 group-hover:transform group-hover:translate-y-2 drop-shadow-lg" />
                <div className="mt-2 w-1 h-8 bg-gradient-to-b from-white to-white/30 rounded-full group-hover:from-yellow-200 group-hover:to-yellow-400/50 transition-all duration-300 shadow-lg"></div>
              </div>

              <div className="absolute inset-0 rounded-full border-3 border-white/40 animate-ping"></div>
              <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-pulse delay-300"></div>
              <div className="absolute inset-0 rounded-full border border-yellow-300/30 animate-ping delay-700"></div>

              <div className="absolute inset-0 rounded-full bg-white/10 animate-pulse delay-1000"></div>
            </button>

            <div className="absolute -left-32 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className="bg-white/90 backdrop-blur-sm text-gray-800 text-sm font-medium px-3 py-2 rounded-lg shadow-lg">
                👇 გამოკითხვები
              </div>
              <div className="absolute right-0 top-1/2 transform translate-x-2 -translate-y-1/2 w-0 h-0 border-l-8 border-l-white/90 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
            </div>
          </div> */}
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

        {/* Polls Section - Prominent */}
        <section
          id="polls-section"
          className="py-24 bg-gradient-to-br from-primary/5 to-primary/10 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[url('/poll-pattern.png')] opacity-5" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-full mb-6">
                <FireOutlined className="text-3xl text-primary" />
              </div>
              <Title level={2} className="mb-4">
                🗳️ მონაწილეობა მიიღეთ გამოკითხვებში!
              </Title>
              <Paragraph className="text-xl text-gray-600 max-w-2xl mx-auto">
                გაიარეთ ჩვენი ინტერაქტიული გამოკითხვები და გაუზიარეთ თქვენი მოსაზრება საზოგადოებას
              </Paragraph>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {polls.map((poll) => {
                const totalVotes = getTotalVotes(poll.options);
                const hasVoted = votedPolls.includes(poll.id);
                const showPollResults = showResults[poll.id];

                return (
                  <Card
                    key={poll.id}
                    className="hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg bg-white/80 backdrop-blur-sm"
                    title={
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-r from-red-400 to-red-600 rounded-full flex items-center justify-center mr-3">
                            <FireOutlined className="text-white text-sm" />
                          </div>
                          <span className="text-lg font-bold text-gray-800">{poll.question}</span>
                        </div>
                        {hasVoted && (
                          <span className="text-sm text-white bg-green-500 px-3 py-1 rounded-full font-medium">
                            ✅ ხმა ჩაწერილია
                          </span>
                        )}
                      </div>
                    }
                  >
                    {!showPollResults ? (
                      <div className="space-y-4">
                        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg mb-6">
                          <p className="text-blue-800 font-medium">
                            👆 აირჩიეთ თქვენი ვარიანტი და მიიღეთ მონაწილეობა!
                          </p>
                        </div>
                        <Radio.Group
                          onChange={(e) => handleVote(poll.id, e.target.value)}
                          value={selectedPolls[poll.id]}
                          className="w-full"
                          disabled={hasVoted}
                        >
                          <Space direction="vertical" className="w-full">
                            {poll.options.map((option) => (
                              <div
                                key={option.id}
                                className={`w-full p-4 rounded-xl transition-all duration-300 cursor-pointer ${
                                  selectedPolls[poll.id] === option.id
                                    ? 'bg-primary/20 border-primary shadow-md transform scale-105'
                                    : 'hover:bg-gray-50 border-gray-200 hover:shadow-sm'
                                } border-2`}
                              >
                                <Radio value={option.id} className="w-full">
                                  <div className="flex justify-between items-center w-full">
                                    <span className="font-semibold text-gray-700">{option.text}</span>
                                    {selectedPolls[poll.id] === option.id && (
                                      <span className="text-primary">✨</span>
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
                          className="w-full mt-6 h-14 rounded-xl text-lg font-semibold bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary"
                          onClick={() => submitVote(poll.id)}
                          disabled={!selectedPolls[poll.id] || hasVoted}
                        >
                          {hasVoted ? '✅ ხმა ჩაწერილია' : '🗳️ ხმის მიცემა'}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg mb-6">
                          <p className="text-green-800 font-medium">
                            🎉 მადლობა მონაწილეობისთვის! ნახეთ შედეგები:
                          </p>
                        </div>
                        {poll.options.map((option) => {
                          const percentage = calculatePercentage(option.votes, totalVotes);
                          const isSelected = selectedPolls[poll.id] === option.id;

                          return (
                            <div
                              key={option.id}
                              className={`p-4 rounded-xl transition-all duration-300 ${
                                isSelected
                                  ? 'bg-primary/20 border-primary shadow-md'
                                  : 'bg-gray-50 border-gray-200'
                              } border-2`}
                            >
                              <div className="flex justify-between items-center mb-3">
                                <span className="font-semibold text-gray-700">{option.text}</span>
                                <span className="text-gray-600 font-bold">{percentage}%</span>
                              </div>
                              <Progress
                                percent={percentage}
                                showInfo={false}
                                strokeColor={option.color}
                                className="mb-2"
                                strokeWidth={10}
                              />
                              <div className="flex justify-between text-sm text-gray-500">
                                <span>📊 {option.votes} ხმა</span>
                                {isSelected && (
                                  <span className="text-primary font-bold">👤 თქვენი არჩევანი</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        <div className="text-center text-gray-600 mt-6 p-3 bg-gray-100 rounded-lg">
                          <strong>სულ ხმები: {totalVotes}</strong>
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
            <div className="text-center mt-12">
              <p className="text-gray-600 text-lg">
                💡 <strong>რჩევა:</strong> მონაწილეობა მიიღეთ ყველა გამოკითხვაში და გაიგეთ სხვების
                მოსაზრება!
              </p>
            </div>
          </div>
        </section>

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

        {/* Latest Contests Section - Enhanced */}
        <section className="py-24 bg-white relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="flex justify-between items-center mb-12">
              <div>
                <Title
                  level={2}
                  className="bg-gradient-to-r from-gray-900 via-primary to-purple-600 bg-clip-text text-transparent"
                >
                  მიმდინარე კონკურსები
                </Title>
                <div className="w-24 h-1 bg-gradient-to-r from-primary to-purple-500 rounded-full mt-2"></div>
              </div>
              <Link
                to="/contests"
                className="group flex items-center text-primary hover:text-primary-dark transition-colors duration-300"
              >
                <span className="font-semibold">ყველა კონკურსი</span>
                <ArrowRightOutlined className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {latestContests.map((contest, index) => (
                <Card
                  key={index}
                  hoverable
                  className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                  cover={
                    <div className="h-48 overflow-hidden relative">
                      <img
                        alt={contest.title}
                        src={contest.image}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent group-hover:from-black/30 transition-all duration-500"></div>
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-primary">
                        ახალი
                      </div>
                    </div>
                  }
                >
                  <div className="p-6">
                    <Title
                      level={4}
                      className="mb-4 group-hover:text-primary transition-colors duration-300"
                    >
                      {contest.title}
                    </Title>
                    <div className="space-y-3">
                      <div className="flex items-center text-gray-500 group-hover:text-gray-700 transition-colors">
                        <ClockCircleOutlined className="mr-2" />
                        {contest.date}
                      </div>
                      <div className="flex items-center text-primary font-semibold">
                        <TrophyOutlined className="mr-2" />
                        პრიზი: {contest.prize}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
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

        {/* Testimonials Section */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Title level={2} className="text-center mb-16">
              რას ამბობენ ჩვენი მონაწილეები
            </Title>
            <Carousel autoplay>
              {testimonials.map((testimonial, index) => (
                <div key={index} className="px-4">
                  <Card className="text-center max-w-2xl mx-auto">
                    <div className="mb-6">
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-20 h-20 rounded-full mx-auto mb-4"
                      />
                      <Paragraph className="text-lg italic mb-4">"{testimonial.text}"</Paragraph>
                      <Title level={4} className="mb-1">
                        {testimonial.name}
                      </Title>
                      <Paragraph className="text-gray-500">{testimonial.role}</Paragraph>
                    </div>
                  </Card>
                </div>
              ))}
            </Carousel>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default Home;
