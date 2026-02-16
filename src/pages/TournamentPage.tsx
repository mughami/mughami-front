import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spin, Empty, Typography, Tabs } from 'antd';
import {
  ClockCircleOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  TrophyOutlined,
  ArrowRightOutlined,
  CalendarOutlined,
  FireOutlined,
} from '@ant-design/icons';
import Layout from '../components/Layout';
import { useTournamentStore } from '../store/tournamentStore';
import { useAuthStore } from '../store/authStore';
import { TournamentStatus, UserRole } from '../types';
import type { Tournament } from '../types';

const { Title, Text } = Typography;

// ─── Countdown Hook ──────────────────────────────────────────────────

function useCountdown(targetDate: string) {
  const calcTimeLeft = useCallback(() => {
    const diff = new Date(targetDate).getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
      expired: false,
    };
  }, [targetDate]);

  const [timeLeft, setTimeLeft] = useState(calcTimeLeft);

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(calcTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, [calcTimeLeft]);

  return timeLeft;
}

// ─── Countdown Display Component ─────────────────────────────────────

const CountdownDisplay: React.FC<{ targetDate: string; compact?: boolean }> = ({
  targetDate,
  compact = false,
}) => {
  const { days, hours, minutes, seconds, expired } = useCountdown(targetDate);

  if (expired) {
    return (
      <div className="flex items-center gap-2 text-green-600 font-semibold text-sm">
        <PlayCircleOutlined className="text-base" />
        <span>ტურნირი დაწყებულია!</span>
      </div>
    );
  }

  const units = [
    { value: days, label: 'დღე' },
    { value: hours, label: 'სთ' },
    { value: minutes, label: 'წთ' },
    { value: seconds, label: 'წმ' },
  ];

  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        {units.map((unit, i) => (
          <React.Fragment key={unit.label}>
            <div className="flex items-center gap-0.5">
              <span className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-xs px-1.5 py-0.5 rounded min-w-[24px] text-center">
                {String(unit.value).padStart(2, '0')}
              </span>
              <span className="text-[9px] text-gray-500 font-medium">{unit.label}</span>
            </div>
            {i < units.length - 1 && <span className="text-gray-300 text-xs">:</span>}
          </React.Fragment>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-1 xs:gap-2 sm:gap-3">
      {units.map((unit, i) => (
        <React.Fragment key={unit.label}>
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 xs:w-11 xs:h-11 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm xs:text-base sm:text-xl">
                {String(unit.value).padStart(2, '0')}
              </span>
            </div>
            <span className="text-[9px] xs:text-[10px] sm:text-xs text-gray-500 mt-1 font-medium">
              {unit.label}
            </span>
          </div>
          {i < units.length - 1 && (
            <span className="text-gray-400 font-bold text-sm sm:text-lg mb-4 hidden xs:inline">:</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// ─── Tournament Card Component ───────────────────────────────────────

const TournamentCard: React.FC<{ tournament: Tournament }> = ({ tournament }) => {
  const navigate = useNavigate();

  const statusConfig = {
    [TournamentStatus.TO_START]: {
      gradient: 'from-blue-500 to-indigo-600',
      badge: 'bg-blue-100 text-blue-700 border-blue-200',
      badgeLabel: 'მალე',
      badgeLabelFull: 'მალე დაიწყება',
      badgeIcon: <ClockCircleOutlined />,
    },
    [TournamentStatus.STARTED]: {
      gradient: 'from-emerald-500 to-teal-600',
      badge: 'bg-green-100 text-green-700 border-green-200',
      badgeLabel: 'LIVE',
      badgeLabelFull: 'მიმდინარე',
      badgeIcon: <FireOutlined />,
    },
    [TournamentStatus.FINISHED]: {
      gradient: 'from-gray-400 to-gray-500',
      badge: 'bg-gray-100 text-gray-600 border-gray-200',
      badgeLabel: 'დასრულდა',
      badgeLabelFull: 'დასრულებული',
      badgeIcon: <CheckCircleOutlined />,
    },
  };
  const config = statusConfig[tournament.status];

  const handlePlay = () => {
    navigate(`/quiz/play/${tournament.quiz.quizId}`);
  };

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100 flex flex-col h-full">
      {/* Gradient Header */}
      <div
        className={`bg-gradient-to-r ${config.gradient} p-4 sm:p-5 lg:p-6 relative overflow-hidden flex-shrink-0`}
      >
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-24 sm:w-32 lg:w-40 h-24 sm:h-32 lg:h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-16 sm:w-20 lg:w-24 h-16 sm:h-20 lg:h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
              <TrophyOutlined className="text-white text-lg sm:text-xl lg:text-2xl" />
            </div>
            <div
              className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold flex items-center gap-1 sm:gap-1.5 border ${config.badge} flex-shrink-0`}
            >
              {config.badgeIcon}
              <span className="hidden sm:inline">{config.badgeLabelFull}</span>
              <span className="sm:hidden">{config.badgeLabel}</span>
            </div>
          </div>
          <h3 className="text-white font-bold text-base sm:text-lg lg:text-xl leading-tight line-clamp-2">
            {tournament.quiz.quizName}
          </h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 lg:p-6 flex flex-col flex-grow">
        <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 flex-grow">
          {tournament.description}
        </p>

        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-xs text-gray-500 mb-3 sm:mb-4">
          <div className="flex items-center gap-1 sm:gap-1.5 bg-gray-50 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-md sm:rounded-lg">
            <CalendarOutlined className="text-gray-400" />
            <span>დაწყება: {new Date(tournament.startDate).toLocaleDateString('ka-GE')}</span>
          </div>
          {tournament.endDate && (
            <div className="flex items-center gap-1 sm:gap-1.5 bg-gray-50 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-md sm:rounded-lg">
              <ClockCircleOutlined className="text-gray-400" />
              <span>დასრულება: {new Date(tournament.endDate).toLocaleDateString('ka-GE')}</span>
            </div>
          )}
        </div>

        {/* Countdown for upcoming tournaments */}
        {tournament.status === TournamentStatus.TO_START && (
          <div className="mb-3 sm:mb-4">
            <Text className="text-gray-500 text-[10px] sm:text-xs font-medium block mb-2">
              დაწყებამდე დარჩა:
            </Text>
            <CountdownDisplay targetDate={tournament.startDate} />
          </div>
        )}

        {/* Countdown until end for started tournaments */}
        {tournament.status === TournamentStatus.STARTED && tournament.endDate && (
          <div className="mb-3 sm:mb-4">
            <Text className="text-gray-500 text-[10px] sm:text-xs font-medium block mb-2">
              დასრულებამდე დარჩა:
            </Text>
            <CountdownDisplay targetDate={tournament.endDate} />
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-auto">
          {tournament.status === TournamentStatus.STARTED && (
            <button
              onClick={handlePlay}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-[1.02] text-sm sm:text-base"
            >
              <PlayCircleOutlined className="text-base sm:text-lg" />
              <span>თამაში</span>
              <ArrowRightOutlined className="text-xs sm:text-sm" />
            </button>
          )}

          {tournament.status === TournamentStatus.TO_START && (
            <div className="w-full bg-blue-50 text-blue-600 font-medium py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl flex items-center justify-center gap-2 border border-blue-200 text-xs sm:text-sm">
              <ClockCircleOutlined />
              <span>დაელოდეთ დაწყებას</span>
            </div>
          )}

          {tournament.status === TournamentStatus.FINISHED && (
            <div className="w-full bg-gray-50 text-gray-500 font-medium py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl flex items-center justify-center gap-2 border border-gray-200 text-xs sm:text-sm">
              <CheckCircleOutlined />
              <span>დასრულებულია</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Tournament List Component ───────────────────────────────────────

const TournamentList: React.FC<{
  tournaments: Tournament[];
  loading: boolean;
  emptyText: string;
}> = ({ tournaments, loading, emptyText }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12 sm:py-16 lg:py-20">
        <div className="text-center">
          <Spin size="large" />
          <div className="mt-3 sm:mt-4 text-gray-500 font-medium text-sm sm:text-base">
            ტურნირების ჩატვირთვა...
          </div>
        </div>
      </div>
    );
  }

  if (tournaments.length === 0) {
    return (
      <div className="py-10 sm:py-12 lg:py-16">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={<span className="text-gray-500 text-sm sm:text-base">{emptyText}</span>}
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
      {tournaments.map((tournament) => (
        <TournamentCard key={tournament.id} tournament={tournament} />
      ))}
    </div>
  );
};

// ─── Main Page Component ─────────────────────────────────────────────

const TournamentPage: React.FC = () => {
  const {
    upcomingTournaments,
    startedTournaments,
    finishedTournaments,
    loading,
    fetchUpcomingTournaments,
    fetchStartedTournaments,
    fetchFinishedTournaments,
    fetchAdminUpcomingTournaments,
    fetchAdminStartedTournaments,
    fetchAdminFinishedTournaments,
  } = useTournamentStore();

  const { user } = useAuthStore();
  const isAdmin = user?.userRole === UserRole.ADMIN;

  const [activeTab, setActiveTab] = useState('started');

  useEffect(() => {
    if (isAdmin) {
      // Admin uses /admin/tournament endpoint with status filter
      fetchAdminStartedTournaments(0, 20);
      fetchAdminUpcomingTournaments(0, 20);
      fetchAdminFinishedTournaments(0, 20);
    } else {
      // Regular users use /app/tournament/* endpoints
      fetchStartedTournaments(0, 20);
      fetchUpcomingTournaments(0, 20);
      fetchFinishedTournaments(0, 20);
    }
  }, [
    isAdmin,
    fetchStartedTournaments,
    fetchUpcomingTournaments,
    fetchFinishedTournaments,
    fetchAdminStartedTournaments,
    fetchAdminUpcomingTournaments,
    fetchAdminFinishedTournaments,
  ]);

  const tabItems = [
    {
      key: 'started',
      label: (
        <span className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
          <PlayCircleOutlined />
          <span className="hidden xs:inline">მიმდინარე</span>
          <span className="xs:hidden">LIVE</span>
          {startedTournaments.length > 0 && (
            <span className="bg-green-100 text-green-700 text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-full">
              {startedTournaments.length}
            </span>
          )}
        </span>
      ),
      children: (
        <TournamentList
          tournaments={startedTournaments}
          loading={loading && activeTab === 'started'}
          emptyText="ამჟამად მიმდინარე ტურნირი არ არის"
        />
      ),
    },
    {
      key: 'upcoming',
      label: (
        <span className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
          <ClockCircleOutlined />
          <span className="hidden xs:inline">მომავალი</span>
          <span className="xs:hidden">მალე</span>
          {upcomingTournaments.length > 0 && (
            <span className="bg-blue-100 text-blue-700 text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-full">
              {upcomingTournaments.length}
            </span>
          )}
        </span>
      ),
      children: (
        <TournamentList
          tournaments={upcomingTournaments}
          loading={loading && activeTab === 'upcoming'}
          emptyText="მომავალი ტურნირი ჯერ არ არის დაგეგმილი"
        />
      ),
    },
    {
      key: 'finished',
      label: (
        <span className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
          <CheckCircleOutlined />
          <span className="hidden xs:inline">დასრულებული</span>
          <span className="xs:hidden">არქივი</span>
        </span>
      ),
      children: (
        <TournamentList
          tournaments={finishedTournaments}
          loading={loading && activeTab === 'finished'}
          emptyText="დასრულებული ტურნირი ჯერ არ არის"
        />
      ),
    },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute top-0 left-0 w-64 sm:w-96 h-64 sm:h-96 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-48 sm:w-72 h-48 sm:h-72 bg-white/10 rounded-full translate-x-1/4 translate-y-1/4" />
          <div className="absolute top-1/2 left-1/2 w-32 sm:w-48 h-32 sm:h-48 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />

          <div className="relative z-10 max-w-7xl mx-auto py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              {/* Trophy Icon */}
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-white/20 backdrop-blur-sm rounded-2xl sm:rounded-3xl mb-4 sm:mb-6 shadow-xl">
                <TrophyOutlined className="text-white text-3xl sm:text-4xl lg:text-5xl" />
              </div>

              <Title
                level={1}
                className="!mb-2 sm:!mb-3 !text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold"
              >
                ვიქტორინის ტურნირები
              </Title>

              <Text className="text-white/80 text-sm sm:text-base lg:text-lg max-w-xl sm:max-w-2xl mx-auto block px-4">
                გაიმარჯვე ტურნირებში და მოიგე საუკეთესო პრიზები!
              </Text>

              {/* Quick Stats */}
              <div className="flex items-center justify-center gap-4 sm:gap-6 lg:gap-8 mt-6 sm:mt-8">
                <div className="text-center">
                  <div className="text-white font-bold text-xl sm:text-2xl lg:text-3xl">
                    {startedTournaments.length}
                  </div>
                  <div className="text-white/70 text-xs sm:text-sm">მიმდინარე</div>
                </div>
                <div className="w-px h-8 sm:h-10 bg-white/30" />
                <div className="text-center">
                  <div className="text-white font-bold text-xl sm:text-2xl lg:text-3xl">
                    {upcomingTournaments.length}
                  </div>
                  <div className="text-white/70 text-xs sm:text-sm">მომავალი</div>
                </div>
                <div className="w-px h-8 sm:h-10 bg-white/30" />
                <div className="text-center">
                  <div className="text-white font-bold text-xl sm:text-2xl lg:text-3xl">
                    {finishedTournaments.length}
                  </div>
                  <div className="text-white/70 text-xs sm:text-sm">დასრულებული</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="max-w-7xl mx-auto py-6 sm:py-8 lg:py-10 px-3 sm:px-6 lg:px-8">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            size="large"
            className="tournament-tabs"
            tabBarStyle={{
              marginBottom: '1.5rem',
            }}
          />
        </div>
      </div>

      {/* Custom styles for tabs */}
      <style>{`
        .tournament-tabs .ant-tabs-nav {
          margin-bottom: 0;
        }
        
        .tournament-tabs .ant-tabs-tab {
          padding: 8px 12px !important;
        }
        
        @media (min-width: 640px) {
          .tournament-tabs .ant-tabs-tab {
            padding: 12px 20px !important;
          }
        }
        
        .tournament-tabs .ant-tabs-tab-active {
          font-weight: 600;
        }
        
        .tournament-tabs .ant-tabs-ink-bar {
          height: 3px;
          border-radius: 2px;
        }
        
        /* Custom xs breakpoint for very small screens */
        @media (min-width: 400px) {
          .xs\\:inline {
            display: inline !important;
          }
          .xs\\:hidden {
            display: none !important;
          }
          .xs\\:gap-2 {
            gap: 0.5rem !important;
          }
          .xs\\:w-11 {
            width: 2.75rem !important;
          }
          .xs\\:h-11 {
            height: 2.75rem !important;
          }
          .xs\\:text-base {
            font-size: 1rem !important;
            line-height: 1.5rem !important;
          }
          .xs\\:text-\\[10px\\] {
            font-size: 10px !important;
          }
        }
      `}</style>
    </Layout>
  );
};

export default TournamentPage;
