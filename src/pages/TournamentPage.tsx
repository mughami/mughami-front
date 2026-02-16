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
} from '@ant-design/icons';
import Layout from '../components/Layout';
import { useTournamentStore } from '../store/tournamentStore';
import { TournamentStatus } from '../types';
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

const CountdownDisplay: React.FC<{ targetDate: string }> = ({ targetDate }) => {
  const { days, hours, minutes, seconds, expired } = useCountdown(targetDate);

  if (expired) {
    return (
      <div className="flex items-center gap-2 text-green-600 font-semibold">
        <PlayCircleOutlined className="text-lg" />
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

  return (
    <div className="flex items-center gap-2">
      {units.map((unit, i) => (
        <React.Fragment key={unit.label}>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg sm:text-xl">
                {String(unit.value).padStart(2, '0')}
              </span>
            </div>
            <span className="text-[10px] sm:text-xs text-gray-500 mt-1 font-medium">{unit.label}</span>
          </div>
          {i < units.length - 1 && <span className="text-gray-400 font-bold text-lg mb-4">:</span>}
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
      badge: 'bg-blue-100 text-blue-700',
      badgeLabel: 'მალე დაიწყება',
      badgeIcon: <ClockCircleOutlined />,
    },
    [TournamentStatus.STARTED]: {
      gradient: 'from-emerald-500 to-teal-600',
      badge: 'bg-green-100 text-green-700',
      badgeLabel: 'მიმდინარე',
      badgeIcon: <PlayCircleOutlined />,
    },
    [TournamentStatus.FINISHED]: {
      gradient: 'from-gray-400 to-gray-500',
      badge: 'bg-gray-100 text-gray-600',
      badgeLabel: 'დასრულებული',
      badgeIcon: <CheckCircleOutlined />,
    },
  };
  const config = statusConfig[tournament.status];

  const handlePlay = () => {
    navigate(`/quiz/play/${tournament.quiz.quizId}`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group border border-gray-100">
      {/* Gradient Header */}
      <div className={`bg-gradient-to-r ${config.gradient} p-5 sm:p-6 relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-3">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
              <TrophyOutlined className="text-white text-2xl" />
            </div>
            <div
              className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${config.badge}`}
            >
              {config.badgeIcon}
              {config.badgeLabel}
            </div>
          </div>
          <h3 className="text-white font-bold text-lg sm:text-xl leading-tight line-clamp-2">
            {tournament.quiz.quizName}
          </h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 sm:p-6">
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{tournament.description}</p>

        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-5">
          {/* <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1.5 rounded-lg">
            <UserOutlined />
            <span>{tournament.authorUsername}</span>
          </div> */}
          <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1.5 rounded-lg">
            <CalendarOutlined />
            <span>{new Date(tournament.startDate).toLocaleDateString('ka-GE')}</span>
          </div>
        </div>

        {/* Countdown for upcoming tournaments */}
        {tournament.status === TournamentStatus.TO_START && (
          <div className="mb-5">
            <Text className="text-gray-500 text-xs font-medium block mb-2">დაწყებამდე დარჩა:</Text>
            <CountdownDisplay targetDate={tournament.startDate} />
          </div>
        )}

        {/* Play Button */}
        {tournament.status === TournamentStatus.STARTED && (
          <button
            onClick={handlePlay}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
          >
            <PlayCircleOutlined className="text-lg" />
            ტურნირის გავლა
            <ArrowRightOutlined className="text-sm" />
          </button>
        )}

        {tournament.status === TournamentStatus.TO_START && (
          <div className="w-full bg-blue-50 text-blue-600 font-medium py-3 px-6 rounded-xl flex items-center justify-center gap-2 border border-blue-200">
            <ClockCircleOutlined />
            დაელოდეთ დაწყებას
          </div>
        )}

        {tournament.status === TournamentStatus.FINISHED && (
          <div className="w-full bg-gray-50 text-gray-500 font-medium py-3 px-6 rounded-xl flex items-center justify-center gap-2 border border-gray-200">
            <CheckCircleOutlined />
            ტურნირი დასრულებულია
          </div>
        )}
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
      <div className="flex justify-center items-center py-20">
        <div className="text-center">
          <Spin size="large" />
          <div className="mt-4 text-gray-500 font-medium">ტურნირების ჩატვირთვა...</div>
        </div>
      </div>
    );
  }

  if (tournaments.length === 0) {
    return (
      <div className="py-16">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={<span className="text-gray-500">{emptyText}</span>}
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
  } = useTournamentStore();

  const [activeTab, setActiveTab] = useState('started');

  useEffect(() => {
    fetchStartedTournaments(0, 20);
    fetchUpcomingTournaments(0, 20);
    fetchFinishedTournaments(0, 20);
  }, [fetchStartedTournaments, fetchUpcomingTournaments, fetchFinishedTournaments]);

  const tabItems = [
    {
      key: 'started',
      label: (
        <span className="flex items-center gap-2">
          <PlayCircleOutlined />
          მიმდინარე
          {startedTournaments.length > 0 && (
            <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
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
        <span className="flex items-center gap-2">
          <ClockCircleOutlined />
          მომავალი
          {upcomingTournaments.length > 0 && (
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
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
        <span className="flex items-center gap-2">
          <CheckCircleOutlined />
          დასრულებული
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
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Hero Header */}
          <div className="text-center mb-10">
            {/* <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full mb-4">
              <TrophyOutlined className="text-yellow-600" />
              <span className="text-yellow-700 font-semibold text-sm">ტურნირები</span>
            </div> */}
            <Title
              level={1}
              className="!mb-3 text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent"
            >
              ტურნირები
            </Title>
            <Text className="text-gray-500 text-base sm:text-lg max-w-2xl mx-auto block">
              გაიმარჯვე ტურნირებში და მოიგე პრიზები!
            </Text>
          </div>

          {/* Tabs */}
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            size="large"
            className="tournament-tabs"
          />
        </div>
      </div>
    </Layout>
  );
};

export default TournamentPage;
