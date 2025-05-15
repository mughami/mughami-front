import { Link } from 'react-router-dom';
import { TrophyOutlined, TeamOutlined, QuestionCircleOutlined } from '@ant-design/icons';

interface CategoryCardProps {
  id: string;
  title: string;
  description: string;
  image: string;
  quizCount: number;
  playerCount: number;
  prize: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

const CategoryCard = ({
  id,
  title,
  description,
  image,
  quizCount,
  playerCount,
  prize,
  difficulty,
}: CategoryCardProps) => {
  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return <span className="category-badge badge-green">მარტივი</span>;
      case 'medium':
        return <span className="category-badge badge-yellow">საშუალო</span>;
      case 'hard':
        return <span className="category-badge badge-red">რთული</span>;
      default:
        return <span className="category-badge badge-blue">საშუალო</span>;
    }
  };

  return (
    <Link to={`/quizzes/${id}`} className="block h-full">
      <div className="category-card h-full flex flex-col">
        <div className="relative">
          <img src={image} alt={title} className="category-image" />
          <div className="absolute top-2 right-2">{getDifficultyBadge(difficulty)}</div>
        </div>
        <div className="category-content flex-grow flex flex-col">
          <h3 className="category-title">{title}</h3>
          <p className="category-description flex-grow">{description}</p>
          <div className="category-stats mt-auto">
            <div className="flex items-center">
              <QuestionCircleOutlined className="mr-1" />
              <span className="text-[0.7rem]">{quizCount} კითხვა</span>
            </div>
            <div className="flex items-center">
              <TeamOutlined className="mr-1" />
              <span className="text-[0.7rem]">{playerCount} მოთამაშე</span>
            </div>
            <div className="flex items-center font-medium text-primary">
              <TrophyOutlined className="mr-1" />
              <span className="text-[0.7rem]">{prize} ₾</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;
