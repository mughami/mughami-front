import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Spin } from 'antd';
import {
  LeftOutlined,
  RightOutlined,
  CheckCircleFilled,
  PlayCircleOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { usePollStore } from '../store/pollStore';
import { useAuthStore } from '../store';

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
  const pollsContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Google tag (gtag.js)
    const GA_ID = 'G-9GNLNM4FDH';
    if (document.getElementById('ga-gtag')) return;

    const script = document.createElement('script');
    script.id = 'ga-gtag';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag(...args: unknown[]) {
      window.dataLayer.push(args);
    }
    gtag('js', new Date());
    gtag('config', GA_ID);
  }, []);

  useEffect(() => {
    fetchPolls(0, 10);
  }, [fetchPolls]);

  useEffect(() => {
    localStorage.setItem('votedPolls', JSON.stringify(votedPolls));
    localStorage.setItem('showResults', JSON.stringify(showResults));
  }, [votedPolls, showResults]);

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

  const stats = [
    { value: '1,234', label: 'აქტიური მომხმარებელი' },
    { value: '100+', label: 'ქვიზი' },
    { value: '45', label: 'კონკურსი' },
    { value: '10+', label: 'გამარჯვებული', money: true },
  ];

  const steps = [
    {
      title: '1 · დარეგისტრირდი',
      description: 'შექმენი ანგარიში 30 წამში და მიიღე წვდომა ყველა ქვიზზე.',
    },
    {
      title: '2 · გაიარე ქვიზი',
      description: 'აირჩიე კატეგორია და შეამოწმე შენი ცოდნა სხვადასხვა თემაზე.',
    },
    {
      title: '3 · მოიგე პრიზი',
      description: 'მიიღე მონაწილეობა კონკურსებში და მოიგე რეალური თანხა.',
      green: true,
    },
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-white text-brand-ink">
        {/* Hero */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="flex items-center gap-12 xl:gap-20">
            <div className="max-w-3xl flex-1">
              <span className="inline-flex items-center gap-2 text-xs text-brand-ink-2 border border-slate-200 rounded-full px-3 py-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-green ring-4 ring-brand-green-soft" />
                ქართული ქვიზების პლატფორმა
              </span>
              <h1 className="mt-6 text-4xl sm:text-5xl lg:text-[52px] font-semibold leading-[1.1] tracking-tight">
                {isAuthenticated ? (
                  <>
                    მოგესალმებით, {user?.name}.
                    <br />
                    <span className="text-brand-green-deep">დროა ითამაშო.</span>
                  </>
                ) : (
                  <>
                    შეამოწმე შენი ცოდნა.
                    <br />
                    <span className="text-brand-green-deep">მოიგე რეალური პრიზები.</span>
                  </>
                )}
              </h1>
              <p className="mt-5 text-base sm:text-lg text-brand-ink-2 max-w-xl leading-relaxed">
                გაიარე სხვადასხვა კატეგორიის ქვიზები, მიიღე მონაწილეობა კონკურსებში და შეეჯიბრე სხვა
                მოთამაშეებს.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/categories"
                      className="inline-flex items-center gap-2 rounded-xl bg-brand-blue px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-blue-deep hover:text-white"
                    >
                      <PlayCircleOutlined /> დაიწყე ქვიზი
                    </Link>
                    <Link
                      to="/public-quizzes"
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-brand-ink transition-colors hover:border-brand-blue hover:text-brand-blue"
                    >
                      ღია ქვიზები
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="inline-flex items-center gap-2 rounded-xl bg-brand-blue px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-blue-deep hover:text-white"
                    >
                      დარეგისტრირდი <RightOutlined className="text-xs" />
                    </Link>
                    <Link
                      to="/public-quizzes"
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-brand-ink transition-colors hover:border-brand-blue hover:text-brand-blue"
                    >
                      <PlayCircleOutlined /> ღია ქვიზები
                    </Link>
                    <Link
                      to="/login"
                      className="px-4 py-3 text-sm font-medium text-brand-blue transition-colors hover:text-brand-blue-deep"
                    >
                      შესვლა
                    </Link>
                  </>
                )}
              </div>
              <div className="mt-14 flex flex-wrap items-center gap-x-8 gap-y-6 sm:gap-x-10">
                {stats.map((stat, index) => (
                  <div key={stat.label} className="flex items-center gap-8 sm:gap-10">
                    {index > 0 && <span className="hidden h-10 w-px bg-slate-200 sm:block" />}
                    <div>
                      <div
                        className={`text-2xl font-semibold ${
                          stat.money ? 'text-brand-green-deep' : 'text-brand-ink'
                        }`}
                      >
                        {stat.value}
                      </div>
                      <div className="text-xs text-brand-ink-3">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Animated quiz card */}
            <div className="relative hidden w-[400px] flex-shrink-0 lg:block" aria-hidden="true">
              <div className="absolute inset-0 translate-x-6 translate-y-6 rounded-2xl bg-brand-blue-soft" />
              <div className="animate-float relative rounded-2xl border border-t-2 border-slate-200 border-t-brand-blue bg-white p-6 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="mr-auto text-sm font-semibold">ზოგადი ცოდნა</div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-brand-ink-2">
                    7 / 12
                  </span>
                  <span className="rounded-full border border-slate-200 px-2.5 py-0.5 text-xs text-brand-ink-2">
                    0:42
                  </span>
                </div>
                <div className="mt-4 h-1 rounded-full bg-slate-100">
                  <div className="hero-anim-progress h-full rounded-full bg-brand-blue" />
                </div>
                <div className="mt-5 text-[15px] font-medium leading-snug">
                  რომელი მდინარე ჩამოდის თბილისში?
                </div>
                <div className="mt-4 flex flex-col gap-2">
                  <div className="hero-anim-option flex items-center justify-between rounded-xl border border-slate-200 px-4 py-2.5 text-sm">
                    მტკვარი
                    <CheckCircleFilled className="hero-anim-check text-brand-green" />
                  </div>
                  <div className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-brand-ink-2">
                    რიონი
                  </div>
                  <div className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-brand-ink-2">
                    ალაზანი
                  </div>
                  <div className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-brand-ink-2">
                    ენგური
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-xs text-brand-ink-3">სერია: 4 სწორი ზედიზედ</span>
                  <span className="hero-anim-xp rounded-full bg-brand-green-soft px-2.5 py-0.5 text-xs font-semibold text-brand-green-deep">
                    +120 XP
                  </span>
                </div>
              </div>
              <div className="animate-float absolute -left-7 -top-7 z-10 grid h-14 w-14 place-items-center rounded-[50%_50%_50%_12px] border-[3px] border-brand-blue-deep bg-brand-blue text-xl font-bold text-brand-cream shadow-md">
                ?
              </div>
              <div
                className="animate-float absolute -bottom-6 -right-5 z-10 grid h-12 w-12 place-items-center rounded-[50%_50%_12px_50%] bg-brand-green text-lg font-bold text-brand-cream shadow-md"
                style={{ animationDelay: '1.6s' }}
              >
                ₾
              </div>
            </div>
          </div>
        </section>

        {/* Polls */}
        <section id="polls-section" className="border-y border-slate-200 bg-slate-50 py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="text-xs font-medium uppercase tracking-[0.12em] text-brand-blue">
                  გამოკითხვები
                </div>
                <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">გააკეთე შენი არჩევანი</h2>
                <p className="mt-2 max-w-xl text-sm text-brand-ink-2">
                  მიიღე მონაწილეობა გამოკითხვებში და ნახე, რას ფიქრობენ სხვები.
                </p>
              </div>
              <div className="hidden gap-2 sm:flex">
                <button
                  type="button"
                  aria-label="წინა გამოკითხვები"
                  onClick={() => scrollPolls('left')}
                  className="grid h-10 w-10 place-items-center rounded-full border border-slate-300 bg-white text-brand-ink-2 transition-colors hover:border-brand-blue hover:text-brand-blue"
                >
                  <LeftOutlined />
                </button>
                <button
                  type="button"
                  aria-label="შემდეგი გამოკითხვები"
                  onClick={() => scrollPolls('right')}
                  className="grid h-10 w-10 place-items-center rounded-full border border-slate-300 bg-white text-brand-ink-2 transition-colors hover:border-brand-blue hover:text-brand-blue"
                >
                  <RightOutlined />
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex min-h-[240px] items-center justify-center">
                <Spin size="large" />
              </div>
            ) : (
              <>
                <div
                  ref={pollsContainerRef}
                  className="mt-8 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2"
                  style={{ scrollbarWidth: 'none' }}
                >
                  {polls.map((poll) => {
                    const totalVotes = getTotalVotes(poll.options);
                    const hasVoted = votedPolls.includes(poll.id);
                    const showPollResults = showResults[poll.id];

                    return (
                      <div
                        key={poll.id}
                        className="flex w-[85vw] max-w-[460px] flex-shrink-0 snap-start flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:w-[400px]"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-base font-semibold leading-snug">{poll.title}</h3>
                          {hasVoted && (
                            <span className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-full border border-brand-green-soft bg-brand-green-soft px-3 py-1 text-xs font-medium text-brand-green-deep">
                              <CheckCircleFilled /> ხმა ჩაწერილია
                            </span>
                          )}
                        </div>

                        {!showPollResults ? (
                          <div className="mt-5 flex flex-1 flex-col">
                            <div className="flex max-h-[300px] flex-col gap-2 overflow-y-auto">
                              {poll.options.map((option) => {
                                const isSelected = selectedPolls[poll.id] === option.id;
                                return (
                                  <button
                                    key={option.id}
                                    type="button"
                                    disabled={hasVoted}
                                    onClick={() => handleVote(poll.id, option.id)}
                                    className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                                      isSelected
                                        ? 'border-brand-blue bg-brand-blue-soft text-brand-ink'
                                        : 'border-slate-200 bg-white text-brand-ink-2 hover:border-brand-blue'
                                    }`}
                                  >
                                    {option.name}
                                  </button>
                                );
                              })}
                            </div>
                            <button
                              type="button"
                              onClick={() => submitVote(poll.id)}
                              disabled={!selectedPolls[poll.id] || hasVoted}
                              className="mt-4 w-full rounded-xl bg-brand-blue px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-blue-deep disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                            >
                              ხმის მიცემა
                            </button>
                          </div>
                        ) : (
                          <div className="mt-5 flex flex-1 flex-col">
                            <div className="flex max-h-[300px] flex-col gap-4 overflow-y-auto">
                              {poll.options.map((option) => {
                                const percentage = calculatePercentage(option.result, totalVotes);
                                const isSelected = selectedPolls[poll.id] === option.id;

                                return (
                                  <div key={option.id}>
                                    <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
                                      <span className="text-brand-ink">{option.name}</span>
                                      <span className="font-semibold text-brand-ink-2">
                                        {percentage}%
                                      </span>
                                    </div>
                                    <div className="h-1 rounded-full bg-slate-100">
                                      <div
                                        className={`h-full rounded-full ${
                                          isSelected ? 'bg-brand-green' : 'bg-brand-blue'
                                        }`}
                                        style={{ width: `${percentage}%` }}
                                      />
                                    </div>
                                    <div className="mt-1 flex justify-between text-xs text-brand-ink-3">
                                      <span>{option.result} ხმა</span>
                                      {isSelected && (
                                        <span className="font-medium text-brand-green-deep">
                                          შენი არჩევანი
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            <div className="mt-4 border-t border-slate-100 pt-3 text-xs text-brand-ink-3">
                              სულ {totalVotes} ხმა
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-brand-ink-3 sm:hidden">
                  <LeftOutlined /> გადაფურცლე <RightOutlined />
                </div>
              </>
            )}
          </div>
        </section>

        {/* Videos */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-xs font-medium uppercase tracking-[0.12em] text-brand-blue">
            ვიდეოები
          </div>
          <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">ნახე ჩვენი ვიდეოები</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="aspect-video bg-slate-100">
                <iframe
                  title="მთავარი ვიდეო"
                  src="https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2F61574052881576%2Fvideos%2F763783312907246%2F&show_text=false&width=560&t=0"
                  width="100%"
                  height="100%"
                  style={{ border: 'none', overflow: 'hidden' }}
                  scrolling="no"
                  frameBorder="0"
                  allowFullScreen={true}
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                />
              </div>
              <div className="border-t border-slate-200 p-4">
                <div className="text-sm font-medium">მთავარი ვიდეო</div>
                <div className="mt-0.5 text-xs text-brand-ink-3">გაიცანი მუღამის პლატფორმა</div>
              </div>
            </div>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="aspect-video bg-slate-100">
                <iframe
                  title="შედეგები და გამარჯვებულები"
                  src="https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2F61574052881576%2Fvideos%2F1186693859893979%2F&show_text=false&width=560&t=0"
                  width="100%"
                  height="100%"
                  style={{ border: 'none', overflow: 'hidden' }}
                  scrolling="no"
                  frameBorder="0"
                  allowFullScreen={true}
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                />
              </div>
              <div className="border-t border-slate-200 p-4">
                <div className="text-sm font-medium">შედეგები და გამარჯვებულები</div>
                <div className="mt-0.5 text-xs text-brand-ink-3">
                  წარმატებული მონაწილეების ისტორიები
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <span className="text-sm text-brand-ink-2">გამოგვყევი სოციალურ ქსელებში:</span>
            <a
              href="https://www.facebook.com/share/17A2ykRSKj/?mibextid=wwXIfr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-brand-ink transition-colors hover:border-brand-blue hover:text-brand-blue"
            >
              Facebook
            </a>
            <a
              href="https://www.tiktok.com/@mugami05?_t=ZS-8ytoTramOor&_r=1"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-brand-ink transition-colors hover:border-brand-blue hover:text-brand-blue"
            >
              TikTok
            </a>
          </div>
        </section>

        {/* How it works */}
        <section className="border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            <div className="text-xs font-medium uppercase tracking-[0.12em] text-brand-blue">
              როგორ მუშაობს
            </div>
            <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">სამი მარტივი ნაბიჯი</h2>
            <div className="mt-10 grid gap-10 md:grid-cols-3">
              {steps.map((step) => (
                <div key={step.title}>
                  <div
                    className={`mb-4 h-0.5 w-8 rounded-full ${
                      step.green ? 'bg-brand-green' : 'bg-brand-blue'
                    }`}
                  />
                  <div className="text-lg font-semibold">{step.title}</div>
                  <p className="mt-2 text-sm leading-relaxed text-brand-ink-2">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA band */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20">
          <div className="flex flex-col gap-8 rounded-2xl bg-gradient-to-br from-brand-blue-deep to-brand-blue px-8 py-10 sm:flex-row sm:items-center sm:px-12">
            <div className="flex-1">
              <div className="text-xs font-medium uppercase tracking-[0.12em] text-[#A9C9E8]">
                ყოველდღე ახალი შანსი
              </div>
              <div className="mt-2 text-2xl font-semibold text-white">დაიწყე თამაში დღესვე</div>
              <p className="mt-2 text-sm text-[#D6E5F3]">
                {isAuthenticated
                  ? 'ახალი ქვიზები და კონკურსები ყოველ კვირას.'
                  : 'რეგისტრაცია მხოლოდ 30 წამში — ყველა ქვიზი ერთ სივრცეში.'}
              </p>
            </div>
            <Link
              to={isAuthenticated ? '/categories' : '/register'}
              className="inline-flex items-center gap-2 self-start rounded-xl bg-brand-green px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-green-deep hover:text-white sm:self-auto"
            >
              <TrophyOutlined />
              {isAuthenticated ? 'დაიწყე ქვიზი' : 'დარეგისტრირდი ახლავე'}
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default Home;
