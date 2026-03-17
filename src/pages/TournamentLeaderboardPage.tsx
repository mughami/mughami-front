import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Spin, Card, Button, Pagination, Empty } from 'antd';
import {
  // TrophyOutlined,
  ArrowLeftOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CrownOutlined,
} from '@ant-design/icons';
import Layout from '../components/Layout';
import { useTournamentStore } from '../store/tournamentStore';
import { useAuthStore } from '../store/authStore';
import { UserRole } from '../types';
import type { LeaderboardEntry } from '../types';

const { Title, Text } = Typography;

const TournamentLeaderboardPage: React.FC = () => {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isAdmin = user?.userRole === UserRole.ADMIN;
  const {
    leaderboard,
    leaderboardTotal,
    myLeaderboardEntry,
    leaderboardLoading,
    fetchLeaderboard,
    fetchMyLeaderboardEntry,
    clearLeaderboard,
  } = useTournamentStore();

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    if (tournamentId) {
      const id = parseInt(tournamentId);
      fetchLeaderboard(id, 0, pageSize, isAdmin);
      fetchMyLeaderboardEntry(id);
    }
    return () => clearLeaderboard();
  }, [tournamentId, isAdmin, fetchLeaderboard, fetchMyLeaderboardEntry, clearLeaderboard]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (tournamentId) {
      fetchLeaderboard(parseInt(tournamentId), page - 1, pageSize, isAdmin);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getRankDisplay = (rank: number) => {
    if (rank === 1)
      return (
        <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-2xl">🥇</span>
        </div>
      );
    if (rank === 2)
      return (
        <div className="w-12 h-12 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-2xl">🥈</span>
        </div>
      );
    if (rank === 3)
      return (
        <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-orange-700 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-2xl">🥉</span>
        </div>
      );
    return (
      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
        <span className="text-lg font-bold text-gray-500">#{rank}</span>
      </div>
    );
  };

  const getRowStyle = (rank: number, isMe: boolean) => {
    if (isMe) return 'bg-blue-50 border-l-4 border-blue-500';
    if (rank === 1) return 'bg-yellow-50/50';
    if (rank === 2) return 'bg-gray-50/50';
    if (rank === 3) return 'bg-orange-50/30';
    return 'hover:bg-gray-50';
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50">
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10 max-w-4xl mx-auto py-8 sm:py-12 px-4 sm:px-6">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/tournaments')}
              className="mb-4 !bg-white/20 !border-white/30 !text-white hover:!bg-white/30"
            >
              ტურნირებზე დაბრუნება
            </Button>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-sm rounded-2xl mb-4 shadow-xl">
                <CrownOutlined className="text-white text-3xl sm:text-4xl" />
              </div>
              <Title level={2} className="!text-white !mb-2 text-xl sm:text-3xl">
                ტურნირის ლიდერბორდი
              </Title>
              <Text className="text-white/80 text-sm sm:text-base">{leaderboardTotal} მოთამაშე</Text>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto py-6 sm:py-8 px-3 sm:px-6">
          {/* My Position Card */}
          {myLeaderboardEntry && (
            <Card className="mb-6 border-2 border-blue-400 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-xl">#{myLeaderboardEntry.rank}</span>
                  </div>
                  <div>
                    <Text strong className="text-lg block text-blue-800">
                      შენი პოზიცია
                    </Text>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <CheckCircleOutlined className="text-green-500" />
                        {myLeaderboardEntry.correctAnswers}/{myLeaderboardEntry.totalQuestions}
                      </span>
                      <span className="flex items-center gap-1">
                        <ClockCircleOutlined className="text-blue-500" />
                        {formatTime(myLeaderboardEntry.timeTakenSeconds)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Text className="text-3xl font-bold text-blue-600">
                    {myLeaderboardEntry.scorePercentage}%
                  </Text>
                </div>
              </div>
            </Card>
          )}

          {/* Leaderboard Table */}
          {leaderboardLoading ? (
            <div className="text-center py-16">
              <Spin size="large" />
              <div className="mt-4 text-gray-500 font-medium">ლიდერბორდი იტვირთება...</div>
            </div>
          ) : leaderboard.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={<span className="text-gray-500">ლიდერბორდი ჯერ ცარიელია</span>}
            />
          ) : (
            <>
              {/* Table Header */}
              <div className="hidden sm:flex items-center px-6 py-3 bg-gray-100 rounded-t-xl text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <div className="w-16">ადგილი</div>
                <div className="flex-1">მოთამაშე</div>
                <div className="w-24 text-center">სწორი</div>
                <div className="w-24 text-center">დრო</div>
                <div className="w-20 text-right">ქულა</div>
              </div>

              <Card className="shadow-lg border-0 !rounded-t-none sm:!rounded-t-none overflow-hidden">
                <div className="divide-y divide-gray-100 -mx-6 -my-6">
                  {leaderboard.map((entry: LeaderboardEntry) => {
                    const isMe = myLeaderboardEntry?.userId === entry.userId;
                    return (
                      <div
                        key={entry.userId}
                        className={`flex items-center py-4 px-4 sm:px-6 transition-colors ${getRowStyle(entry.rank, isMe)}`}
                      >
                        <div className="w-14 flex-shrink-0">{getRankDisplay(entry.rank)}</div>
                        <div className="flex-1 min-w-0 ml-3">
                          <Text
                            strong
                            className={`block truncate text-sm sm:text-base ${isMe ? 'text-blue-600' : ''}`}
                          >
                            {entry.firstName} {entry.lastName}
                            {isMe && <span className="text-blue-400 text-xs ml-1.5">(შენ)</span>}
                          </Text>
                          <Text className="text-gray-400 text-xs block truncate">
                            @{entry.username}
                          </Text>
                          {/* Mobile-only stats */}
                          <div className="flex items-center gap-3 mt-1 sm:hidden text-xs text-gray-500">
                            <span>
                              {entry.correctAnswers}/{entry.totalQuestions} სწორი
                            </span>
                            <span>{formatTime(entry.timeTakenSeconds)}</span>
                          </div>
                        </div>
                        <div className="w-24 text-center hidden sm:block">
                          <Text className="text-sm">
                            {entry.correctAnswers}/{entry.totalQuestions}
                          </Text>
                        </div>
                        <div className="w-24 text-center hidden sm:block">
                          <Text className="text-sm text-gray-600">
                            {formatTime(entry.timeTakenSeconds)}
                          </Text>
                        </div>
                        <div className="w-20 text-right flex-shrink-0">
                          <Text
                            strong
                            className={`text-lg ${
                              entry.rank === 1
                                ? 'text-yellow-600'
                                : entry.rank <= 3
                                  ? 'text-amber-600'
                                  : 'text-gray-700'
                            }`}
                          >
                            {entry.scorePercentage}%
                          </Text>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Pagination */}
              {leaderboardTotal > pageSize && (
                <div className="flex justify-center mt-6">
                  <Pagination
                    current={currentPage}
                    total={leaderboardTotal}
                    pageSize={pageSize}
                    onChange={handlePageChange}
                    showSizeChanger={false}
                    showTotal={(total) => `სულ ${total} მოთამაშე`}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TournamentLeaderboardPage;
