import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Typography, Skeleton, Input, Select, Row, Col, Pagination } from 'antd';
import {
  PlayCircleOutlined,
  FireOutlined,
  StarOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
  FilterOutlined,
  CloseCircleOutlined,
  SortAscendingOutlined,
} from '@ant-design/icons';
import { usePublicQuizStore, cleanupBlobUrl } from '../../store/publicQuizStore';
import categoryService from '../../services/api/categoryService';
import type { PublicQuizFilters } from '../../services/api/publicQuizService';
import type { CategoryResponse } from '../../types';
import Layout from '../../components/Layout';

const { Title, Text } = Typography;

const PublicQuizzesPage: React.FC = () => {
  const { quizzes, loading, error, totalQuizzes, fetchPublicQuizzes, getQuizPhoto } =
    usePublicQuizStore();
  const navigate = useNavigate();
  const [quizPhotos, setQuizPhotos] = useState<Record<number, string>>({});
  const blobUrlsRef = useRef<Set<string>>(new Set());

  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [nameInput, setNameInput] = useState('');
  const [filters, setFilters] = useState<PublicQuizFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const subcategoryOptions = useMemo(() => {
    if (filters.categoryId == null) return [];
    const cat = categories.find((c) => c.categoryId === filters.categoryId);
    return (cat?.subCategoryResponseList || []).map((s) => ({
      label: s.subCategoryName,
      value: s.subCategoryId,
    }));
  }, [filters.categoryId, categories]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.quizName) count++;
    if (filters.categoryId != null) count++;
    if (filters.subCategoryId != null) count++;
    if (filters.sortBy) count++;
    return count;
  }, [filters]);

  const updateFilter = (partial: Partial<PublicQuizFilters>) => {
    setCurrentPage(1);
    setFilters((f) => ({ ...f, ...partial }));
  };

  const clearFilters = () => {
    setCurrentPage(1);
    setFilters({});
    setNameInput('');
  };

  // Category list powers the category/subcategory selects. Not available to
  // signed-out guests, so failures degrade to name search + sort only.
  useEffect(() => {
    categoryService
      .getPublicCategories()
      .then((cats) => setCategories(cats || []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    fetchPublicQuizzes(currentPage - 1, pageSize, filters);
  }, [fetchPublicQuizzes, filters, currentPage, pageSize]);

  useEffect(() => {
    // Fetch photos for quizzes that have photos
    const fetchPhotos = async () => {
      // Clean up previous blob URLs
      blobUrlsRef.current.forEach((url) => cleanupBlobUrl(url));
      blobUrlsRef.current.clear();

      const photos: Record<number, string> = {};
      for (const quiz of quizzes) {
        if (quiz.hasPhoto) {
          try {
            const photoUrl = await getQuizPhoto(quiz.quizId);
            photos[quiz.quizId] = photoUrl;
            blobUrlsRef.current.add(photoUrl);
          } catch (error) {
            console.error(`Failed to fetch photo for quiz ${quiz.quizId}:`, error);
          }
        }
      }
      setQuizPhotos(photos);
    };

    if (quizzes.length > 0) {
      fetchPhotos();
    }

    // Cleanup function to revoke blob URLs when component unmounts
    const urlsAtCleanup = blobUrlsRef.current;
    return () => {
      urlsAtCleanup.forEach((url) => cleanupBlobUrl(url));
      urlsAtCleanup.clear();
    };
  }, [quizzes, getQuizPhoto]);

  const handleQuizClick = (quizId: number) => {
    // Instant scroll to top before navigation
    window.scrollTo(0, 0);
    navigate(`/public-quiz/play/${quizId}`);
  };

  if (error) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <Title level={3} className="text-red-600 mb-4">
              შეცდომა
            </Title>
            <Text type="danger" className="text-lg block mb-6">
              {error}
            </Text>
            <Button
              type="primary"
              size="large"
              onClick={() => fetchPublicQuizzes(currentPage - 1, pageSize, filters)}
            >
              კვლავ სცადეთ
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Fancy Header */}
        <div className="relative bg-white overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-green-50"></div>
          <div className="absolute inset-0 opacity-40">
            <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
            <div className="absolute top-0 right-1/4 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
            <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
          </div>

          {/* Content */}
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <div className="text-center">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-lg mb-4">
                  <QuestionCircleOutlined className="text-2xl text-white" />
                </div>
              </div>

              <Title
                level={1}
                className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent mb-4"
              >
                ღია ქვიზები
              </Title>

              <Text className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
                აღმოაჩინე საინტერესო კითხვები და გადაამოწმე შენი ცოდნა
              </Text>

              {/* Feature Tags */}
              <div className="flex flex-wrap justify-center gap-3 my-4">
                <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-green-100">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-sm font-medium text-green-700">უფასო</span>
                </div>
                <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-blue-100">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-sm font-medium text-blue-700">სწრაფი</span>
                </div>
                <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-purple-100">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-sm font-medium text-purple-700">საინტერესო</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Wave */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
              className="relative block w-full h-6 fill-gray-50"
            >
              <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
            </svg>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Filters */}
          <Card
            className="mb-8 border-0 shadow-md"
            style={{ borderRadius: '16px' }}
            styles={{ body: { padding: '16px 20px' } }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-gray-700">
                <FilterOutlined className="text-blue-500" />
                <span className="font-semibold">ფილტრები</span>
                {activeFilterCount > 0 && (
                  <span className="ml-1 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              {activeFilterCount > 0 && (
                <Button size="small" type="text" danger icon={<CloseCircleOutlined />} onClick={clearFilters}>
                  გასუფთავება
                </Button>
              )}
            </div>

            <Row gutter={[12, 12]}>
              <Col xs={24} md={8}>
                <Input.Search
                  allowClear
                  size="large"
                  placeholder="ქვიზის ძებნა..."
                  prefix={<SearchOutlined className="text-gray-400" />}
                  value={nameInput}
                  onChange={(e) => {
                    setNameInput(e.target.value);
                    if (!e.target.value) updateFilter({ quizName: undefined });
                  }}
                  onSearch={(v) => updateFilter({ quizName: v || undefined })}
                />
              </Col>

              {categories.length > 0 && (
                <>
                  <Col xs={12} md={5}>
                    <Select
                      size="large"
                      placeholder="კატეგორია"
                      allowClear
                      showSearch
                      optionFilterProp="label"
                      style={{ width: '100%' }}
                      value={filters.categoryId}
                      onChange={(v: number | undefined) =>
                        updateFilter({ categoryId: v, subCategoryId: undefined })
                      }
                      options={categories.map((c) => ({ label: c.categoryName, value: c.categoryId }))}
                    />
                  </Col>
                  <Col xs={12} md={5}>
                    <Select
                      size="large"
                      placeholder="ქვეკატეგორია"
                      allowClear
                      style={{ width: '100%' }}
                      disabled={filters.categoryId == null}
                      value={filters.subCategoryId}
                      onChange={(v) => updateFilter({ subCategoryId: v })}
                      options={subcategoryOptions}
                    />
                  </Col>
                </>
              )}

              <Col xs={24} md={6}>
                <Select
                  size="large"
                  placeholder="სორტირება"
                  allowClear
                  suffixIcon={<SortAscendingOutlined />}
                  style={{ width: '100%' }}
                  value={filters.sortBy ? `${filters.sortBy}:${filters.sortDirection || 'DESC'}` : undefined}
                  onChange={(v?: string) => {
                    if (!v) {
                      updateFilter({ sortBy: undefined, sortDirection: undefined });
                      return;
                    }
                    const [sortBy, sortDirection] = v.split(':') as [
                      PublicQuizFilters['sortBy'],
                      PublicQuizFilters['sortDirection'],
                    ];
                    updateFilter({ sortBy, sortDirection });
                  }}
                  options={[
                    { label: 'ახალი ჯერ', value: 'CREATED_AT:DESC' },
                    { label: 'ძველი ჯერ', value: 'CREATED_AT:ASC' },
                    { label: 'სახელი (ა-ჰ)', value: 'NAME:ASC' },
                    { label: 'სახელი (ჰ-ა)', value: 'NAME:DESC' },
                  ]}
                />
              </Col>
            </Row>
          </Card>

          {/* Quiz Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <Card key={index} className="h-full">
                  <Skeleton.Image className="w-full h-48" />
                  <div className="p-4">
                    <Skeleton active paragraph={{ rows: 2 }} />
                  </div>
                </Card>
              ))}
            </div>
          ) : quizzes.length === 0 ? (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto">
                <div className="text-6xl mb-6">🎯</div>
                <Title level={3} className="text-gray-600 mb-4">
                  კონტენტი ჯერ არ არის დამატებული
                </Title>
                <Text type="secondary" className="text-lg block mb-8">
                  მომენტალურად კონტენტი არ არის ხელმისაწვდომი. გთხოვთ, სცადოთ მოგვიანებით.
                </Text>
                <Button
                  type="primary"
                  size="large"
                  onClick={() => {
                    window.scrollTo(0, 0);
                    navigate('/');
                  }}
                  className="px-8 py-3 h-auto"
                >
                  მთავარ გვერდზე დაბრუნება
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3  gap-6 pb-16">
              {quizzes.map((quiz, index) => (
                <div
                  key={quiz.quizId}
                  className="group cursor-pointer"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => handleQuizClick(quiz.quizId)}
                >
                  <Card
                    hoverable
                    className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden bg-white/80 backdrop-blur-sm"
                    style={{ borderRadius: '20px' }}
                    cover={
                      <div className="relative overflow-hidden h-56 bg-gradient-to-br from-blue-400 via-purple-500 to-green-400">
                        {quiz.hasPhoto && quizPhotos[quiz.quizId] ? (
                          <img
                            src={quizPhotos[quiz.quizId]}
                            alt={quiz.quizName}
                            className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                            loading="lazy"
                            onError={(e) => {
                              const t = e.currentTarget as HTMLImageElement;
                              t.onerror = null;
                              t.src =
                                'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center relative">
                            <QuestionCircleOutlined className="text-6xl text-white opacity-90 transform transition-transform duration-500 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/80 via-purple-500/80 to-green-400/80"></div>
                          </div>
                        )}

                        {/* Floating Action Button */}
                        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                          <div className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center">
                            <PlayCircleOutlined className="text-xl text-green-500" />
                          </div>
                        </div>

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                      </div>
                    }
                  >
                    <div className="p-6">
                      <Title
                        level={4}
                        className="mb-4 text-gray-800 leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors duration-300"
                        style={{ fontSize: '18px', minHeight: '48px' }}
                      >
                        {quiz.quizName}
                      </Title>

                      <div className="flex items-center justify-between text-sm mb-4">
                        <div className="flex items-center px-3 py-1 bg-orange-50 rounded-full">
                          <FireOutlined className="mr-1 text-orange-500" />
                          <span className="text-orange-700 font-medium">პოპულარული</span>
                        </div>
                        <div className="flex items-center px-3 py-1 bg-green-50 rounded-full">
                          <StarOutlined className="mr-1 text-green-500" />
                          <span className="text-green-700 font-medium">უფასო</span>
                        </div>
                      </div>

                      <Button
                        type="primary"
                        icon={<PlayCircleOutlined />}
                        block
                        size="large"
                        className="h-12 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300 text-white font-semibold rounded-xl"
                      >
                        დაწყება
                      </Button>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          )}

          {!loading && quizzes.length > 0 && totalQuizzes > 10 && (
            <div className="flex justify-center mt-10">
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={totalQuizzes}
                showSizeChanger
                pageSizeOptions={['10', '20', '50']}
                onChange={(page, size) => {
                  setCurrentPage(page);
                  setPageSize(size);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PublicQuizzesPage;
