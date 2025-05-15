import { useState } from 'react';
import { type QuizQuestion as QuizQuestionType } from '../../services';

interface QuizQuestionProps {
  question: QuizQuestionType;
  onAnswer: (selectedOption: number) => void;
  showResult: boolean;
  selectedOption: number | null;
  timeLeft: number;
  totalTime: number;
}

const QuizQuestion = ({
  question,
  onAnswer,
  showResult,
  selectedOption,
  timeLeft,
  totalTime,
}: QuizQuestionProps) => {
  const [hovered, setHovered] = useState<number | null>(null);

  const getOptionClass = (index: number) => {
    if (!showResult) {
      if (selectedOption === index) {
        return 'quiz-option quiz-option-selected';
      }
      return hovered === index ? 'quiz-option bg-gray-50' : 'quiz-option';
    } else {
      if (index === question.correctAnswer) {
        return 'quiz-option quiz-option-correct';
      } else if (selectedOption === index) {
        return 'quiz-option quiz-option-incorrect';
      }
      return 'quiz-option opacity-50';
    }
  };

  const progressPercentage = (timeLeft / totalTime) * 100;

  return (
    <div className="quiz-card">
      <div className="quiz-progress">
        <div className="quiz-progress-bar" style={{ width: `${progressPercentage}%` }}></div>
      </div>
      <h2 className="quiz-question">{question.question}</h2>
      <div className="quiz-options">
        {question.options.map((option, index) => (
          <button
            key={index}
            className={getOptionClass(index)}
            onClick={() => !showResult && onAnswer(index)}
            onMouseEnter={() => setHovered(index)}
            onMouseLeave={() => setHovered(null)}
            disabled={showResult || selectedOption !== null}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuizQuestion;
