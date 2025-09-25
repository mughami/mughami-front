import { useState, useEffect } from 'react';
import { Typography, Card, Radio, Button, Progress, Spin, Result } from 'antd';
import {
  CheckCircleOutlined,
  TrophyOutlined,
  BarChartOutlined,
  FireOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import Layout from '../components/Layout';
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

        // Results will be shown automatically after voting
      } catch (error) {
        console.error('Failed to vote:', error);
      }
    }
  };

  const getTotalVotes = (options: { result: number }[]) => {
    return options.reduce((sum, option) => sum + option.result, 0);
  };

  const calculatePercentage = (votes: number, total: number) => {
    return total === 0 ? 0 : Math.round((votes / total) * 100);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 flex items-center justify-center rounded-2xl">
          <Spin size="large" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-[80vh] bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 relative overflow-hidden rounded-2xl">
        {/* Background Decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          {/* Page Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl mb-8">
              <BarChartOutlined className="text-4xl text-blue-600" />
            </div>
            <Title
              level={1}
              className="mb-6 bg-gradient-to-r from-slate-700 via-blue-600 to-purple-600 bg-clip-text text-transparent"
            >
              პოლები
            </Title>
            <Paragraph className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              მონაწილეობა მიიღეთ ჩვენს ღია პოლებში და გააზიარეთ თქვენი აზრი სხვადასხვა საკითხებზე.
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
                    <div className="text-sm text-slate-600">აქტიური პოლი</div>
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
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                {polls.map((poll) => {
                  const totalVotes = getTotalVotes(poll.options);
                  const hasVoted = votedPolls.includes(poll.id);
                  const selectedOption = selectedPolls[poll.id];
                  const showResult = hasVoted;

                  return (
                    <div key={poll.id} className="group relative h-full">
                      {/* Background Glow */}
                      <div className="absolute -inset-4 bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-3xl blur-2xl opacity-60 group-hover:opacity-80 transition-all duration-700"></div>

                      {/* Poll Card */}
                      <Card className="relative h-full min-h-[420px] flex flex-col bg-gradient-to-br from-white via-white/95 to-blue-50/30 backdrop-blur-xl rounded-3xl border-2 border-white/60 hover:border-blue-200/60 transition-all duration-500 group-hover:transform group-hover:scale-105 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.15)]">
                        {/* Poll Header */}
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex-1">
                            <Title level={3} className="text-slate-800 mb-2 pr-4">
                              {poll.title}
                            </Title>
                            <div className="flex items-center space-x-4 text-sm text-slate-500">
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
                        <div className="space-y-4 mb-6 flex-1 overflow-y-auto pr-2 max-h-72 sm:max-h-80">
                          {!showResult ? (
                            <>
                              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-400 p-4 rounded-r-2xl mb-6">
                                <p className="text-blue-800 font-medium flex items-center">
                                  <span className="text-xl mr-2">👆</span>
                                  აირჩიეთ თქვენი ვარიანტი და მიიღეთ მონაწილეობა!
                                </p>
                              </div>
                              <Radio.Group
                                value={selectedOption}
                                onChange={(e) => handleVote(poll.id, e.target.value)}
                                className="w-full space-y-3"
                                disabled={hasVoted}
                              >
                                {poll.options.map((option) => (
                                  <div
                                    key={option.id}
                                    className={`w-full p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                                      selectedPolls[poll.id] === option.id
                                        ? 'border-blue-400 bg-gradient-to-r from-blue-50 to-purple-50 shadow-md transform scale-[1.02]'
                                        : 'border-gray-200 bg-gray-50/30 hover:border-blue-300 hover:bg-blue-50/30'
                                    }`}
                                  >
                                    <Radio value={option.id} className="w-full">
                                      <div className="flex justify-between items-start w-full gap-3">
                                        <span className="font-medium text-slate-700 ml-2 flex-1 leading-relaxed break-words whitespace-normal">
                                          {option.name}
                                        </span>
                                        {selectedPolls[poll.id] === option.id && (
                                          <span className="text-blue-600 text-lg flex-shrink-0">
                                            ✨
                                          </span>
                                        )}
                                      </div>
                                    </Radio>
                                  </div>
                                ))}
                              </Radio.Group>
                            </>
                          ) : (
                            <>
                              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-400 p-4 rounded-r-2xl mb-6">
                                <p className="text-green-800 font-medium flex items-center">
                                  <span className="text-xl mr-2">🎉</span>
                                  მადლობა მონაწილეობისთვის! ნახეთ შედეგები:
                                </p>
                              </div>
                              {poll.options.map((option) => {
                                const percentage = calculatePercentage(option.result, totalVotes);
                                const isSelected = selectedPolls[poll.id] === option.id;

                                return (
                                  <div
                                    key={option.id}
                                    className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                                      isSelected
                                        ? 'border-blue-400 bg-gradient-to-r from-blue-50 to-purple-50 shadow-md'
                                        : 'border-gray-200 bg-gray-50/30'
                                    }`}
                                  >
                                    <div className="flex justify-between items-start mb-3 gap-3">
                                      <span className="font-medium text-slate-700 flex-1 leading-relaxed break-words whitespace-normal">
                                        {option.name}
                                      </span>
                                      <span className="text-sm font-bold text-slate-600 flex-shrink-0">
                                        {percentage}%
                                      </span>
                                    </div>
                                    <Progress
                                      percent={percentage}
                                      showInfo={false}
                                      strokeColor={{
                                        '0%': '#3b82f6',
                                        '100%': '#8b5cf6',
                                      }}
                                      className="mb-2"
                                      strokeWidth={8}
                                    />
                                    <div className="flex justify-between text-sm text-slate-500">
                                      <span className="flex items-center">
                                        <span className="mr-1">📊</span>
                                        {option.result} ხმა
                                      </span>
                                      {isSelected && (
                                        <span className="text-blue-600 font-bold flex items-center">
                                          <span className="mr-1">👤</span>
                                          თქვენი არჩევანი
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                              <div className="text-center text-slate-600 mt-6 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl border border-gray-200">
                                <strong className="text-lg">სულ ხმები: {totalVotes}</strong>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Poll Actions */}
                        <div className="mt-auto flex flex-wrap gap-3">
                          {!hasVoted && (
                            <Button
                              type="primary"
                              size="large"
                              disabled={!selectedOption}
                              onClick={() => submitVote(poll.id)}
                              className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 border-0 rounded-xl hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold text-base"
                            >
                              {hasVoted ? '✅ ხმა ჩაწერილია' : '🗳️ ხმის მიცემა'}
                            </Button>
                          )}

                          {/* Results shown automatically after voting; no toggle button */}
                        </div>
                      </Card>
                    </div>
                  );
                })}

                {/* Tips Section */}
              </div>
            </>
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
    </Layout>
  );
};

export default PollsPage;
