import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Spin } from 'antd';
import { StarFilled } from '@ant-design/icons';
import Layout from '../../components/Layout';
import MatchupCard from '../../components/brackets/MatchupCard';
import { useBracketStore, useAuthStore } from '../../store';
import bracketService from '../../services/api/bracketService';

const BracketPlayPage = () => {
  const { bracketId } = useParams<{ bracketId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const {
    matchup,
    winner,
    sessionId,
    activeBracketId,
    activeBracketName,
    playerSuggestions,
    loading,
    voting,
    error,
    startSession,
    submitVote,
    resetSession,
    fetchPlayerSuggestions,
  } = useBracketStore();

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [bracketName, setBracketName] = useState<string>('');
  const [initialRemaining, setInitialRemaining] = useState<number | null>(null);
  const initOnce = useRef(false);

  const [holderPhoto, setHolderPhoto] = useState<string | null>(null);
  const [challengerPhoto, setChallengerPhoto] = useState<string | null>(null);
  const [winnerPhoto, setWinnerPhoto] = useState<string | null>(null);
  const photoCacheRef = useRef<Map<number, string>>(new Map());

  const resolvePhoto = async (optionId: number | null | undefined): Promise<string | null> => {
    if (optionId == null) return null;
    const cached = photoCacheRef.current.get(optionId);
    if (cached) return cached;
    try {
      const blob = await bracketService.getOptionPhoto(optionId);
      photoCacheRef.current.set(optionId, blob);
      return blob;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const cache = photoCacheRef.current;
    return () => {
      cache.forEach((url) => URL.revokeObjectURL(url));
      cache.clear();
    };
  }, []);

  useEffect(() => {
    if (!matchup) {
      setHolderPhoto(null);
      setChallengerPhoto(null);
      return;
    }
    let cancelled = false;
    (async () => {
      const [h, c] = await Promise.all([
        resolvePhoto(matchup.holderId),
        resolvePhoto(matchup.challengerId),
      ]);
      if (cancelled) return;
      setHolderPhoto(h);
      setChallengerPhoto(c);
    })();
    return () => {
      cancelled = true;
    };
  }, [matchup]);

  useEffect(() => {
    if (!winner) {
      setWinnerPhoto(null);
      return;
    }
    let cancelled = false;
    (async () => {
      const photo = await resolvePhoto(winner.id);
      if (!cancelled) setWinnerPhoto(photo);
    })();
    return () => {
      cancelled = true;
    };
  }, [winner]);

  useEffect(() => {
    if (initOnce.current) return;
    initOnce.current = true;

    const id = Number(bracketId);
    if (!Number.isFinite(id)) {
      navigate('/brackets');
      return;
    }

    const init = async () => {
      try {
        const response = await bracketService.getBrackets({ page: 0, size: 100 });
        const found = response.content.find((b) => b.id === id);
        const name = found?.name ?? 'თამაში';
        setBracketName(name);

        const sameSession = sessionId && activeBracketId === id && matchup;
        if (!sameSession) {
          resetSession();
          await startSession(id, name);
        }
      } catch {
        // Surfaced via store.error
      }
    };

    init();
  }, [bracketId, navigate, sessionId, activeBracketId, matchup, startSession, resetSession]);

  useEffect(() => {
    if (matchup && initialRemaining === null) {
      setInitialRemaining(matchup.remaining);
    }
  }, [matchup, initialRemaining]);

  useEffect(() => {
    setSelectedId(null);
  }, [matchup?.holderId, matchup?.challengerId]);

  const handleSelect = (id: number) => {
    if (voting) return;
    setSelectedId(id);
    setTimeout(() => {
      submitVote(id);
    }, 400);
  };

  // Once a winner is crowned, offer related brackets (if the backend has any).
  useEffect(() => {
    if (!winner) return;
    const id = activeBracketId ?? Number(bracketId);
    if (Number.isFinite(id)) {
      fetchPlayerSuggestions(id);
    }
  }, [winner, activeBracketId, bracketId, fetchPlayerSuggestions]);

  const handlePlayAgain = async () => {
    setInitialRemaining(null);
    resetSession();
    const id = Number(bracketId);
    if (Number.isFinite(id)) {
      await startSession(id, bracketName);
    }
  };

  const handleStartSuggestion = async (id: number, name: string) => {
    setInitialRemaining(null);
    setSelectedId(null);
    resetSession();
    setBracketName(name);
    navigate(`/brackets/play/${id}`);
    await startSession(id, name);
  };

  const handleBackToList = () => {
    resetSession();
    navigate('/brackets');
  };

  const displayName = activeBracketName || bracketName;
  const remaining = matchup?.remaining ?? 0;
  const totalSteps = initialRemaining ?? remaining;
  const completed = Math.max(0, totalSteps - remaining);
  const percent = totalSteps > 0 ? Math.round((completed / totalSteps) * 100) : 0;

  return (
    <Layout>
      <div className="min-h-[80vh] overflow-hidden rounded-2xl bg-white">
        {/* Top progress bar (gradient) */}
        <div className="h-1.5 w-full bg-gray-100">
          <div
            className="h-full bg-auth-gradient transition-all duration-700 ease-out"
            style={{ width: `${winner ? 100 : percent}%` }}
          />
        </div>

        {/* Top nav */}
        <div className="border-b border-gray-100 bg-white/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-8">
            <button
              type="button"
              onClick={handleBackToList}
              className="group inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition-colors hover:text-primary"
            >
              <span aria-hidden className="transition-transform group-hover:-translate-x-1">
                ⟵
              </span>
              <span className="hidden sm:inline">უკან დაბრუნება</span>
              <span className="sm:hidden">უკან</span>
            </button>
            {!winner && matchup && (
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400 hidden sm:inline">
                  რაუნდი
                </span>
                <div className="rounded-full bg-gradient-to-r from-secondary/10 to-primary/10 px-4 py-1.5 font-mono text-sm font-bold text-gray-800 ring-1 ring-gray-200">
                  {String(completed).padStart(2, '0')}
                  <span className="mx-1 text-gray-400">/</span>
                  {String(totalSteps).padStart(2, '0')}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8 sm:py-14">
          {/* Pre-game title */}
          {!winner && (
            <div className="mb-10 text-center sm:mb-14">
              <div className="mb-3 inline-flex items-center gap-2">
                <span className="h-px w-8 bg-primary" />
                <span className="text-[11px] font-bold uppercase tracking-[0.35em] text-primary">
                  ეს თუ ის
                </span>
                <span className="h-px w-8 bg-primary" />
              </div>
              <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-5xl">
                {displayName}
              </h1>
              <p className="mt-3 text-sm font-medium text-gray-500 sm:text-base">აირჩიე საუკეთესო</p>
            </div>
          )}

          {/* Loading initial */}
          {loading && !matchup && !winner && (
            <div className="flex justify-center py-20">
              <Spin size="large" />
            </div>
          )}

          {/* Error initial */}
          {error && !matchup && !winner && (
            <div className="mx-auto max-w-md rounded-2xl border border-red-100 bg-red-50/50 px-6 py-12 text-center">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-red-500">შეცდომა</p>
              <p className="mb-6 text-base text-gray-700">{error}</p>
              <div className="flex justify-center gap-3">
                <button
                  type="button"
                  onClick={handleBackToList}
                  className="rounded-full px-5 py-2 text-sm font-bold text-gray-600 hover:text-gray-900"
                >
                  დაბრუნება
                </button>
                <button
                  type="button"
                  onClick={handlePlayAgain}
                  className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-white shadow-button transition-transform hover:scale-105"
                >
                  ხელახლა ცდა
                </button>
              </div>
            </div>
          )}

          {/* Matchup */}
          {matchup && !winner && (
            <div className="mx-auto max-w-5xl">
              <div className="relative">
                <div className="grid grid-cols-2 gap-3 sm:gap-10 lg:gap-14">
                  <MatchupCard
                    id={matchup.holderId}
                    photoUrl={holderPhoto ?? ''}
                    side="left"
                    disabled={voting || !holderPhoto}
                    isSelected={selectedId === matchup.holderId}
                    isDimmed={selectedId != null && selectedId !== matchup.holderId}
                    onSelect={handleSelect}
                  />
                  <MatchupCard
                    id={matchup.challengerId}
                    photoUrl={challengerPhoto ?? ''}
                    side="right"
                    disabled={voting || !challengerPhoto}
                    isSelected={selectedId === matchup.challengerId}
                    isDimmed={selectedId != null && selectedId !== matchup.challengerId}
                    onSelect={handleSelect}
                  />
                </div>

                {/* Centered VS badge */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 animate-pulse rounded-full bg-white blur-xl" />
                    <div className="relative flex h-16 w-16 -rotate-6 items-center justify-center rounded-full bg-auth-gradient text-white shadow-2xl ring-4 ring-white sm:h-20 sm:w-20">
                      <span className="font-black italic tracking-tighter text-2xl sm:text-3xl drop-shadow-md">
                        VS
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {voting && (
                <div className="mt-10 flex items-center justify-center gap-3">
                  <Spin size="small" />
                  <span className="text-xs font-bold uppercase tracking-[0.3em] text-gray-500">
                    შემდეგი წყვილი იტვირთება
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Winner */}
          {winner && (
            <div className="mx-auto max-w-3xl">
              {/* Celebration banner */}
              <div className="relative mb-10 overflow-hidden rounded-2xl bg-auth-gradient p-8 text-center text-white shadow-2xl sm:p-10">
                {/* Confetti dots */}
                <div className="pointer-events-none absolute inset-0">
                  <span className="absolute left-[10%] top-[20%] h-2 w-2 animate-ping rounded-full bg-yellow-300" />
                  <span className="absolute right-[15%] top-[35%] h-2 w-2 animate-ping rounded-full bg-white/70 [animation-delay:300ms]" />
                  <span className="absolute left-[20%] bottom-[25%] h-1.5 w-1.5 animate-ping rounded-full bg-pink-300 [animation-delay:600ms]" />
                  <span className="absolute right-[25%] bottom-[20%] h-2 w-2 animate-ping rounded-full bg-yellow-300 [animation-delay:900ms]" />
                  <span className="absolute right-[10%] top-[60%] h-1.5 w-1.5 animate-ping rounded-full bg-white/70 [animation-delay:450ms]" />
                </div>
                {/* Stripes */}
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(45deg, transparent 0 16px, rgba(255,255,255,0.6) 16px 18px)',
                  }}
                />
                <div className="relative">
                  <div className="mb-2 inline-flex items-center gap-2">
                    <span className="h-px w-8 bg-white/70" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.35em] text-white/90">
                      გამარჯვებული
                    </span>
                    <span className="h-px w-8 bg-white/70" />
                  </div>
                  <h2 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
                    {displayName}
                  </h2>
                  <p className="mt-3 text-sm font-medium text-white/90 sm:text-base">შენი ფავორიტი</p>
                </div>
              </div>

              {/* Winner photo */}
              <div className="relative mx-auto max-w-sm">
                <div className="absolute -inset-4 rounded-3xl bg-auth-gradient opacity-30 blur-2xl" />
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-gray-100 ring-4 ring-white shadow-2xl">
                  {winnerPhoto ? (
                    <img src={winnerPhoto} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Spin />
                    </div>
                  )}
                  {/* Winner ribbon */}
                  <div className="absolute left-0 right-0 top-0 flex justify-center">
                    <div className="rounded-b-xl bg-auth-gradient px-6 py-2 text-xs font-bold uppercase tracking-[0.3em] text-white shadow-lg">
                      WINNER
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handlePlayAgain}
                  className="w-full rounded-full bg-primary px-8 py-3 text-sm font-bold text-white shadow-button transition-transform hover:scale-105 sm:w-auto"
                >
                  კიდევ ერთხელ
                </button>
                <button
                  type="button"
                  onClick={handleBackToList}
                  className="w-full rounded-full border-2 border-gray-200 bg-white px-8 py-3 text-sm font-bold text-gray-700 transition-colors hover:border-primary hover:text-primary sm:w-auto"
                >
                  სხვა თამაში
                </button>
              </div>

              {/* Suggested brackets */}
              {playerSuggestions.length > 0 && (
                <div className="mt-14">
                  <div className="mb-6 text-center">
                    <div className="mb-2 inline-flex items-center gap-2">
                      <span className="h-px w-6 bg-primary" />
                      <span className="text-[11px] font-bold uppercase tracking-[0.35em] text-primary">
                        შესაძლოა მოგეწონოს
                      </span>
                      <span className="h-px w-6 bg-primary" />
                    </div>
                    <h3 className="text-xl font-extrabold tracking-tight text-gray-900 sm:text-2xl">
                      სხვა თამაშები შენთვის
                    </h3>
                  </div>
                  <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {playerSuggestions.map((suggestion) => (
                      <li key={suggestion.id}>
                        <button
                          type="button"
                          onClick={() => handleStartSuggestion(suggestion.id, suggestion.name)}
                          className="group relative block w-full overflow-hidden rounded-2xl bg-white text-left shadow-card ring-1 ring-gray-200/70 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:ring-primary/40"
                        >
                          <div className="relative h-32 overflow-hidden bg-auth-gradient">
                            <div className="absolute inset-0 grid grid-cols-2">
                              <div className="bg-gradient-to-br from-secondary to-secondary-dark" />
                              <div className="bg-gradient-to-br from-primary to-primary-dark" />
                            </div>
                            <div
                              className="absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2 bg-white/50"
                              style={{ transform: 'translateX(-50%) skewX(-12deg)' }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="font-black italic text-white text-[2.5rem] leading-none tracking-tighter drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-transform duration-500 group-hover:scale-110">
                                VS
                              </span>
                            </div>
                            {suggestion.type === 'FAVORITE' && (
                              <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-md">
                                <StarFilled />
                                ფავორიტი
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between gap-2 p-4">
                            <h4 className="truncate text-base font-bold tracking-tight text-gray-900 transition-colors group-hover:text-primary">
                              {suggestion.name}
                            </h4>
                            <span
                              aria-hidden
                              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-all duration-300 group-hover:bg-primary group-hover:text-white group-hover:translate-x-0.5"
                            >
                              ⟶
                            </span>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {!isAuthenticated && (
                <div className="mt-14 overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-br from-white via-gray-50 to-white p-8 text-center shadow-card sm:p-10">
                  <div className="mb-2 inline-flex items-center gap-2">
                    <span className="h-px w-6 bg-secondary" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.35em] text-secondary">
                      გააგრძელე
                    </span>
                    <span className="h-px w-6 bg-secondary" />
                  </div>
                  <h3 className="mb-3 text-2xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-3xl">
                    შეინახე შენი შედეგები
                  </h3>
                  <p className="mx-auto mb-8 max-w-md text-sm leading-relaxed text-gray-600">
                    გაიარე რეგისტრაცია, რომ შეეჯიბრო სხვებს და მოიგო პრიზები.
                  </p>
                  <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => navigate('/register')}
                      className="w-full rounded-full bg-auth-gradient px-8 py-3 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105 sm:w-auto"
                    >
                      რეგისტრაცია
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/login')}
                      className="w-full rounded-full px-8 py-3 text-sm font-bold text-gray-600 transition-colors hover:text-gray-900 sm:w-auto"
                    >
                      შესვლა
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default BracketPlayPage;
