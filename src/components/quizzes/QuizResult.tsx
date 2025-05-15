import { Link } from 'react-router-dom';
import { TrophyOutlined, RedoOutlined, HomeOutlined } from '@ant-design/icons';

interface QuizResultProps {
  score: number;
  totalQuestions: number;
  prize: number;
  onRestart: () => void;
}

const QuizResult = ({ score, totalQuestions, prize, onRestart }: QuizResultProps) => {
  const percentage = Math.round((score / totalQuestions) * 100);

  const getMessage = () => {
    if (percentage >= 90) {
      return 'ბრწყინვალეა! თქვენ გაქვთ შანსი მოიგოთ პრიზი!';
    } else if (percentage >= 70) {
      return 'ძალიან კარგი! თქვენ კარგად იცით ეს თემა!';
    } else if (percentage >= 50) {
      return 'კარგია! შეგიძლიათ უკეთესად გააკეთოთ!';
    } else {
      return 'სცადეთ კიდევ ერთხელ! თქვენ შეგიძლიათ გაუმჯობესება!';
    }
  };

  return (
    <div className="quiz-card">
      <div className="quiz-result">
        <div className="mb-3 sm:mb-4">
          {percentage >= 70 ? (
            <TrophyOutlined className="text-5xl sm:text-6xl text-yellow-500" />
          ) : (
            <RedoOutlined className="text-5xl sm:text-6xl text-blue-500" />
          )}
        </div>
        <h2 className="quiz-score">
          {score} / {totalQuestions} ({percentage}%)
        </h2>
        <p className="quiz-message">{getMessage()}</p>

        {percentage >= 70 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 mx-auto max-w-xs sm:max-w-sm">
            <p className="text-green-800 font-medium flex items-center text-sm sm:text-base">
              <TrophyOutlined className="mr-2" />
              თქვენ გაქვთ შანსი მოიგოთ {prize} ₾!
            </p>
          </div>
        )}

        <div className="quiz-actions">
          <button onClick={onRestart} className="quiz-action-button quiz-primary-button">
            <RedoOutlined className="mr-2" />
            სცადეთ კიდევ ერთხელ
          </button>
          <Link to="/categories" className="quiz-action-button quiz-secondary-button mt-3 sm:mt-0">
            <HomeOutlined className="mr-2" />
            კატეგორიები
          </Link>
        </div>
      </div>
    </div>
  );
};

export default QuizResult;
