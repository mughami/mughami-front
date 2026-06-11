import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spin, Input, Select, Pagination } from 'antd';
import { StarFilled } from '@ant-design/icons';
import Layout from '../../components/Layout';
import { useAuthStore, useBracketStore } from '../../store';
import categoryService from '../../services/api/categoryService';
import type { CategoryResponse } from '../../types';

const PAGE_SIZE = 12;

const BracketsListPage = () => {
  const navigate = useNavigate();
  const { brackets, bracketsTotal, loading, error, fetchBrackets } = useBracketStore();
  const { isAuthenticated } = useAuthStore();

  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [subcategoryId, setSubcategoryId] = useState<number | undefined>();
  const [categories, setCategories] = useState<CategoryResponse[]>([]);

  useEffect(() => {
    categoryService
      .getPublicCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    fetchBrackets({
      page,
      size: PAGE_SIZE,
      search: search || undefined,
      categoryId,
      subcategoryId,
    });
  }, [fetchBrackets, page, search, categoryId, subcategoryId]);

  const subcategoryOptions =
    categories
      .find((c) => c.categoryId === categoryId)
      ?.subCategoryResponseList.map((s) => ({
        value: s.subCategoryId,
        label: s.subCategoryName,
      })) ?? [];

  const handleStart = (id: number) => {
    navigate(`/brackets/play/${id}`);
  };

  return (
    <Layout>
      <div className="min-h-[80vh] overflow-hidden rounded-2xl bg-white">
        {/* Hero strip — brand auth-gradient */}
        <div className="relative overflow-hidden bg-auth-gradient">
          {/* Diagonal stripes */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                'repeating-linear-gradient(135deg, transparent 0 14px, rgba(255,255,255,0.5) 14px 16px)',
            }}
          />
          <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-8 sm:py-20">
            <div className="flex items-center gap-3">
              <span className="h-1.5 w-12 rounded-full bg-white/70" />
              <span className="text-[11px] font-bold uppercase tracking-[0.35em] text-white/90">
                ახალი თამაში
              </span>
            </div>
            <h1 className="mt-4 text-5xl font-extrabold leading-[0.95] tracking-tight text-white sm:text-7xl">
              ეს თუ ის
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/90 sm:text-lg">
              ორი ვარიანტი — ერთი არჩევანი. გადაწყვიტე ვინ უფრო კარგია და გაიგე ვინ გახდება საუკეთესო.
            </p>
            <div className="mt-8 inline-flex items-center gap-3 rounded-full bg-white/15 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm ring-1 ring-white/30">
              <span className="flex h-2 w-2 animate-pulse rounded-full bg-white" />
              რეგისტრაცია არ არის საჭირო
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-16">
          {/* Filters */}
          <div className="mb-10 flex flex-wrap items-center gap-3">
            <Input.Search
              allowClear
              size="large"
              placeholder="ძებნა"
              className="!w-full sm:!w-72"
              onSearch={(value) => {
                setSearch(value.trim());
                setPage(0);
              }}
            />
            <Select
              allowClear
              size="large"
              placeholder="კატეგორია"
              className="!w-full sm:!w-52"
              value={categoryId}
              onChange={(value) => {
                setCategoryId(value);
                setSubcategoryId(undefined);
                setPage(0);
              }}
              options={categories.map((c) => ({
                value: c.categoryId,
                label: c.categoryName,
              }))}
            />
            <Select
              allowClear
              size="large"
              placeholder="ქვეკატეგორია"
              className="!w-full sm:!w-52"
              disabled={!categoryId}
              value={subcategoryId}
              onChange={(value) => {
                setSubcategoryId(value);
                setPage(0);
              }}
              options={subcategoryOptions}
            />
          </div>

          {loading && (
            <div className="flex justify-center py-20">
              <Spin size="large" />
            </div>
          )}

          {!loading && error && (
            <div className="mx-auto max-w-md rounded-2xl border border-red-100 bg-red-50/50 px-6 py-12 text-center">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-red-500">შეცდომა</p>
              <p className="mb-6 text-base text-gray-700">{error}</p>
              <button
                type="button"
                onClick={() => fetchBrackets()}
                className="rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-button transition-transform hover:scale-105"
              >
                ხელახლა ცდა
              </button>
            </div>
          )}

          {!loading && !error && brackets.length === 0 && (
            <div className="mx-auto max-w-md rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/40 px-6 py-20 text-center">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-gray-400">
                ცარიელია
              </p>
              <p className="text-base text-gray-500">თამაში ჯერ არ დაემატება</p>
            </div>
          )}

          {!loading && !error && brackets.length > 0 && (
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {brackets.map((bracket, idx) => (
                <li key={bracket.id}>
                  <button
                    type="button"
                    onClick={() => handleStart(bracket.id)}
                    className="group relative block w-full overflow-hidden rounded-2xl bg-white text-left shadow-card ring-1 ring-gray-200/70 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:ring-primary/40"
                  >
                    {/* Top: VS preview block */}
                    <div className="relative h-44 overflow-hidden bg-auth-gradient">
                      {/* Split diagonal accent */}
                      <div className="absolute inset-0 grid grid-cols-2">
                        <div className="bg-gradient-to-br from-secondary to-secondary-dark" />
                        <div className="bg-gradient-to-br from-primary to-primary-dark" />
                      </div>
                      {/* Diagonal slash */}
                      <div
                        className="absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2 bg-white/50"
                        style={{ transform: 'translateX(-50%) skewX(-12deg)' }}
                      />
                      {/* Big VS */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-black italic text-white text-[4rem] leading-none tracking-tighter drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-transform duration-500 group-hover:scale-110">
                          VS
                        </span>
                      </div>
                      {/* Number badge */}
                      <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 font-mono text-xs font-bold text-gray-900 shadow-md">
                        {String(page * PAGE_SIZE + idx + 1).padStart(2, '0')}
                      </span>
                      {/* Favorite badge */}
                      {bracket.type === 'FAVORITE' && (
                        <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-white shadow-md">
                          <StarFilled />
                          ფავორიტი
                        </span>
                      )}
                    </div>

                    {/* Bottom: name + CTA */}
                    <div className="p-5">
                      <h2 className="text-xl font-bold leading-tight tracking-tight text-gray-900 transition-colors group-hover:text-primary">
                        {bracket.name}
                      </h2>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400 transition-colors group-hover:text-primary">
                          დაიწყე თამაში
                        </span>
                        <span
                          aria-hidden
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-all duration-300 group-hover:bg-primary group-hover:text-white group-hover:translate-x-1"
                        >
                          ⟶
                        </span>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {!loading && !error && bracketsTotal > PAGE_SIZE && (
            <div className="mt-12 flex justify-center">
              <Pagination
                current={page + 1}
                pageSize={PAGE_SIZE}
                total={bracketsTotal}
                showSizeChanger={false}
                onChange={(nextPage) => setPage(nextPage - 1)}
              />
            </div>
          )}

          {/* Registration / Login CTA — only for unauthenticated visitors */}
          {!isAuthenticated && !loading && !error && (
            <div className="relative mt-16 overflow-hidden rounded-2xl bg-auth-gradient p-8 text-center text-white shadow-2xl sm:mt-20 sm:p-12">
              {/* Decorative diagonal stripes */}
              <div
                className="pointer-events-none absolute inset-0 opacity-10"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(135deg, transparent 0 16px, rgba(255,255,255,0.5) 16px 18px)',
                }}
              />
              {/* Confetti dots */}
              <div className="pointer-events-none absolute inset-0">
                <span className="absolute left-[8%] top-[25%] h-1.5 w-1.5 animate-ping rounded-full bg-yellow-300" />
                <span className="absolute right-[12%] top-[30%] h-2 w-2 animate-ping rounded-full bg-white/70 [animation-delay:400ms]" />
                <span className="absolute left-[18%] bottom-[20%] h-1.5 w-1.5 animate-ping rounded-full bg-pink-300 [animation-delay:700ms]" />
                <span className="absolute right-[20%] bottom-[25%] h-2 w-2 animate-ping rounded-full bg-yellow-300 [animation-delay:1000ms]" />
              </div>

              <div className="relative">
                <div className="mb-3 inline-flex items-center gap-2">
                  <span className="h-px w-8 bg-white/70" />
                  <span className="text-[11px] font-bold uppercase tracking-[0.35em] text-white/90">
                    შემოგვიერთდი
                  </span>
                  <span className="h-px w-8 bg-white/70" />
                </div>
                <h2 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
                  გახდი მუღამიის ნაწილი
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/90 sm:text-base">
                  გაიარე რეგისტრაცია უფასოდ, შეეჯიბრე სხვებს და მოიგე პრიზები.
                </p>

                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => navigate('/register')}
                    className="w-full rounded-full bg-white px-8 py-3 text-sm font-bold text-primary shadow-lg transition-transform hover:scale-105 hover:bg-yellow-50 sm:w-auto"
                  >
                    რეგისტრაცია
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="w-full rounded-full border-2 border-white/70 bg-transparent px-8 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10 sm:w-auto"
                  >
                    შესვლა
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default BracketsListPage;
