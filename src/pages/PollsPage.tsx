import { useState, useEffect } from 'react';
import { Typography, Card, Radio, Button, Progress, Spin, Result } from 'antd';
import {
  CheckCircleOutlined,
  TrophyOutlined,
  BarChartOutlined,
  FireOutlined,
  TeamOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { usePollStore } from '../store/pollStore';
import { useAuthStore } from '../store';

const { Title, Paragraph } = Typography;

const PollsPage = () => {
  const { polls, loading, fetchPolls, vote } = usePollStore();
  const { isAuthenticated } = useAuthStore();
  const [selectedPolls, setSelectedPolls] = useState<Record<number, number>>({});
  const [votedPolls, setVotedPolls] = useState<number[]>(() => {
    const savedVotes = localStorage.getItem('votedPolls');
    return savedVotes ? JSON.parse(savedVotes) : [];
  });
  const [showResults, setShowResults] = useState<Record<number, boolean>>(() => {
    const savedResults = localStorage.getItem('showResults');
    return savedResults ? JSON.parse(savedResults) : {};
  });

  useEffect(() => {
    fetchPolls(0, 20); // Fetch more polls for dedicated page
  }, [fetchPolls]);

  const handleVote = (pollId: number, optionId: number) => {
    if (!votedPolls.includes(pollId)) {
      setSelectedPolls((prev) => ({ ...prev, [pollId]: optionId }));
    }
  };

  const submitVote = async (pollId: number) => {
    if (selectedPolls[pollId] && !votedPolls.includes(pollId)) {
      try {
        await vote(pollId, selectedPolls[pollId]);
        const newVotedPolls = [...votedPolls, pollId];
        setVotedPolls(newVotedPolls);
        localStorage.setItem('votedPolls', JSON.stringify(newVotedPolls));

        const newShowResults = { ...showResults, [pollId]: true };
        setShowResults(newShowResults);
        localStorage.setItem('showResults', JSON.stringify(newShowResults));
      } catch (error) {
        console.error('Failed to vote:', error);
      }
    }
  };

  const toggleResults = (pollId: number) => {
    const newShowResults = { ...showResults, [pollId]: !showResults[pollId] };
    setShowResults(newShowResults);
    localStorage.setItem('showResults', JSON.stringify(newShowResults));
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 flex items-center justify-center">
          <Spin size="large" />
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Page Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl mb-8">
              <BarChartOutlined className="text-4xl text-blue-600" />
            </div>
            <Title
              level={1}
              className="mb-6 bg-gradient-to-r from-slate-700 via-blue-600 to-purple-600 bg-clip-text text-transparent"
            >
              კენჭისყრის ცენტრი
            </Title>
            <Paragraph className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              მონაწილეობა მიიღეთ ჩვენს ღია კენჭისყრებში და გაუზიარეთ თქვენი აზრი სხვადასხვა საკითხებზე.
              <span className="font-semibold text-blue-600"> თქვენი ხმა მნიშვნელოვანია! </span>
            </Paragraph>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-6 mt-8">
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <FireOutlined className="text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-800">{polls.length}</div>
                    <div className="text-sm text-slate-600">აქტიური კენჭისყრა</div>
                  </div>
                </div>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                    <TeamOutlined className="text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-800">1,250+</div>
                    <div className="text-sm text-slate-600">მონაწილე</div>
                  </div>
                </div>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                    <TrophyOutlined className="text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-800">{votedPolls.length}</div>
                    <div className="text-sm text-slate-600">თქვენი ხმები</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Polls Grid */}
          {polls.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {polls.map((poll) => {
                const totalVotes = poll.options.reduce((sum, option) => sum + option.voteCount, 0);
                const hasVoted = votedPolls.includes(poll.id);
                const selectedOption = selectedPolls[poll.id];
                const showResult = showResults[poll.id] || hasVoted;

                return (
                  <div key={poll.id} className="group relative">
                    {/* Background Glow */}
                    <div className="absolute -inset-4 bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-3xl blur-2xl opacity-60 group-hover:opacity-80 transition-all duration-700"></div>

                    {/* Poll Card */}
                    <Card className="relative bg-gradient-to-br from-white via-white/95 to-blue-50/30 backdrop-blur-xl rounded-3xl border-2 border-white/60 hover:border-blue-200/60 transition-all duration-500 group-hover:transform group-hover:scale-105 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.15)]">
                      {/* Poll Header */}
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex-1">
                          <Title level={3} className="text-slate-800 mb-2 pr-4">
                            {poll.title}
                          </Title>
                          <div className="flex items-center space-x-4 text-sm text-slate-500">
                            <span className="flex items-center">
                              <ClockCircleOutlined className="mr-1" />
                              {new Date(poll.createdAt).toLocaleDateString('ka-GE')}
                            </span>
                            <span className="flex items-center">
                              <TeamOutlined className="mr-1" />
                              {totalVotes} ხმა
                            </span>
                          </div>
                        </div>

                        {hasVoted && (
                          <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                            <CheckCircleOutlined className="text-green-600 text-xl" />
                          </div>
                        )}
                      </div>

                      {/* Poll Options */}
                      <div className="space-y-4 mb-6">
                        {showResult ? (
                          poll.options.map((option) => {
                            const percentage =
                              totalVotes > 0
                                ? ((option.voteCount / totalVotes) * 100).toFixed(1)
                                : '0';
                            const isSelected = selectedPolls[poll.id] === option.id;

                            return (
                              <div
                                key={option.id}
                                className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                                  isSelected
                                    ? 'border-blue-400 bg-blue-50/50'
                                    : 'border-gray-200 bg-gray-50/30'
                                }`}
                              >
                                <div className="flex justify-between items-center mb-2">
                                  <span className="font-medium text-slate-700">{option.text}</span>
                                  <span className="text-sm font-bold text-slate-600">
                                    {percentage}%
                                  </span>
                                </div>
                                <Progress
                                  percent={parseFloat(percentage)}
                                  showInfo={false}
                                  strokeColor={{
                                    '0%': '#3b82f6',
                                    '100%': '#8b5cf6',
                                  }}
                                  className="mb-1"
                                />
                                <div className="text-xs text-slate-500">{option.voteCount} ხმა</div>
                              </div>
                            );
                          })
                        ) : (
                          <Radio.Group
                            value={selectedOption}
                            onChange={(e) => handleVote(poll.id, e.target.value)}
                            className="w-full space-y-3"
                          >
                            {poll.options.map((option) => (
                              <div key={option.id} className="w-full">
                                <Radio
                                  value={option.id}
                                  className="w-full p-4 rounded-2xl border-2 border-gray-200 hover:border-blue-300 transition-colors duration-300"
                                >
                                  <span className="font-medium text-slate-700 ml-2">
                                    {option.text}
                                  </span>
                                </Radio>
                              </div>
                            ))}
                          </Radio.Group>
                        )}
                      </div>

                      {/* Poll Actions */}
                      <div className="flex flex-wrap gap-3">
                        {!hasVoted && (
                          <Button
                            type="primary"
                            size="large"
                            disabled={!selectedOption}
                            onClick={() => submitVote(poll.id)}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 border-0 rounded-xl hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                          >
                            ხმის მიცემა
                          </Button>
                        )}

                        {hasVoted && (
                          <Button
                            type="default"
                            size="large"
                            onClick={() => toggleResults(poll.id)}
                            className="rounded-xl border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50"
                            icon={<BarChartOutlined />}
                          >
                            {showResult ? 'ვარიანტების ჩვენება' : 'შედეგების ჩვენება'}
                          </Button>
                        )}
                      </div>
                    </Card>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <Result
                icon={<BarChartOutlined className="text-6xl text-blue-500" />}
                title="კენჭისყრები არ მოიძებნა"
                subTitle="ამჟამად აქტიური კენჭისყრები არ არის. მალე დაბრუნდით ახალი კენჭისყრებისთვის!"
                className="bg-white/60 backdrop-blur-sm rounded-3xl border border-white/50 max-w-md mx-auto"
              />
            </div>
          )}

          {/* Call to Action */}
          {!isAuthenticated && (
            <div className="text-center mt-16">
              <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-sm rounded-3xl p-8 max-w-2xl mx-auto border border-white/30">
                <div className="text-4xl mb-4">🎯</div>
                <Title level={3} className="mb-4 text-slate-700">
                  გაიარეთ რეგისტრაცია მეტი ფუნქციისთვის!
                </Title>
                <Paragraph className="text-slate-600 mb-6">
                  რეგისტრირებული მომხმარებლები მონაწილეობენ ქვიზებში, იღებენ პრიზებს და აღირიცხებათ
                  ხმები.
                </Paragraph>
                <Button
                  type="primary"
                  size="large"
                  href="/register"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 border-0 rounded-xl hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  რეგისტრაცია
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PollsPage;
