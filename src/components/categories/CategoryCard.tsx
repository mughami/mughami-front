import { Link } from 'react-router-dom';
import { LockOutlined } from '@ant-design/icons';

interface CategoryCardProps {
  id: string;
  title: string;
  description: string;
  image: string;
  quizCount: number;
  questionCount: number;
  prize: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

const CategoryCard = ({ id, title, image }: CategoryCardProps) => {
  return (
    <div className="category-card h-full flex flex-col">
      <div className="relative">
        <img src={image} alt={title} className="category-image" />
      </div>
      <div className="category-content flex-grow flex flex-col">
        <h3 className="category-title">{title}</h3>
        {/* <p className="category-description flex-grow">{description}</p> */}

        {/* Quiz access button */}
        <div className="mt-4">
          <Link to={`/quizzes/${id}`} className="block">
            <div className="w-full bg-blue-500 hover:bg-blue-600 text-white text-center py-2 px-3 rounded-lg transition-colors text-sm flex items-center justify-center">
              <LockOutlined className="mr-1 text-xs" />
              ვიქტორინები
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CategoryCard;
