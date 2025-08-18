import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import CategoryCard from '../../components/categories/CategoryCard';
import { SearchOutlined } from '@ant-design/icons';
import { useCategoryStore } from '../../store';
import { type Category } from '../../services';

const CategoriesPage = () => {
  const { categories, isLoading, error, fetchCategories } = useCategoryStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    setFilteredCategories(categories);
  }, [categories]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term.trim() === '') {
      setFilteredCategories(categories);
    } else {
      const filtered = categories.filter(
        (category) =>
          category.title.toLowerCase().includes(term.toLowerCase()) ||
          category.description.toLowerCase().includes(term.toLowerCase()),
      );
      setFilteredCategories(filtered);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4 sm:gap-0">
        <div>
          <h1 className="page-title">კატეგორიები</h1>
          <p className="page-subtitle">აირჩიეთ კატეგორია და დაიწყეთ თამაში</p>
        </div>
        <div className="relative w-full sm:w-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchOutlined className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="მოძებნეთ კატეგორია..."
            className="form-input pl-10 w-full sm:w-64"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-10">
          <p className="text-xl text-gray-600">იტვირთება...</p>
        </div>
      ) : error ? (
        <div className="text-center py-10">
          <p className="text-xl text-red-600">{error}</p>
          <button
            onClick={() => fetchCategories()}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            სცადეთ თავიდან
          </button>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-xl text-gray-600">კატეგორიები ვერ მოიძებნა</p>
        </div>
      ) : (
        <div className="categories-grid">
          {filteredCategories.map((category) => (
            <CategoryCard
              key={category.id}
              id={category.id}
              title={category.title}
              description={category.description}
              image={category.image}
              quizCount={category.quizCount}
              questionCount={category.questionCount}
              prize={category.prize}
              difficulty={category.difficulty}
            />
          ))}
        </div>
      )}
    </Layout>
  );
};

export default CategoriesPage;
