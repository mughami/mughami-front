// import apiClient from './client';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface Quiz {
  id: string;
  categoryId: string;
  questions: QuizQuestion[];
  timePerQuestion: number;
  prize: number;
}

export interface QuizResult {
  quizId: string;
  score: number;
  totalQuestions: number;
  isPrizeWon: boolean;
}

export interface QuizSubmission {
  quizId: string;
  answers: { questionId: string; selectedOption: number }[];
}

// Dummy quiz data by category
const dummyQuizzes: Record<string, Quiz> = {
  '1': {
    id: 'quiz-sport-1',
    categoryId: '1',
    timePerQuestion: 20,
    prize: 500,
    questions: [
      {
        id: '1',
        question: 'რომელი გუნდი გახდა 2022 წლის მსოფლიო ჩემპიონი ფეხბურთში?',
        options: ['საფრანგეთი', 'არგენტინა', 'ბრაზილია', 'გერმანია'],
        correctAnswer: 1,
      },
      {
        id: '2',
        question: 'რამდენი მოთამაშეა კალათბურთის გუნდში?',
        options: ['4', '5', '6', '7'],
        correctAnswer: 1,
      },
      {
        id: '3',
        question: 'რომელ ქვეყანაში ჩატარდა პირველი თანამედროვე ოლიმპიური თამაშები?',
        options: ['საბერძნეთი', 'საფრანგეთი', 'იტალია', 'აშშ'],
        correctAnswer: 0,
      },
      {
        id: '4',
        question: 'ვინ არის ყველა დროის საუკეთესო ფეხბურთელი გატანილი გოლების მიხედვით?',
        options: ['ლიონელ მესი', 'კრიშტიანუ რონალდუ', 'პელე', 'დიეგო მარადონა'],
        correctAnswer: 1,
      },
      {
        id: '5',
        question: 'რომელ სპორტს უწოდებენ "მეფეთა სპორტს"?',
        options: ['ფეხბურთი', 'ჩოგბურთი', 'კრიკეტი', 'პოლო'],
        correctAnswer: 3,
      },
    ],
  },
  '2': {
    id: 'quiz-history-1',
    categoryId: '2',
    timePerQuestion: 20,
    prize: 300,
    questions: [
      {
        id: '1',
        question: 'რომელ წელს აღმოაჩინა კოლუმბმა ამერიკა?',
        options: ['1492', '1498', '1500', '1510'],
        correctAnswer: 0,
      },
      {
        id: '2',
        question: 'ვინ იყო საქართველოს პირველი პრეზიდენტი?',
        options: [
          'ედუარდ შევარდნაძე',
          'მიხეილ სააკაშვილი',
          'ზვიად გამსახურდია',
          'გიორგი მარგველაშვილი',
        ],
        correctAnswer: 2,
      },
      {
        id: '3',
        question: 'რომელ საუკუნეში მოხდა საფრანგეთის რევოლუცია?',
        options: ['17-ე', '18-ე', '19-ე', '20-ე'],
        correctAnswer: 1,
      },
      {
        id: '4',
        question: 'ვინ იყო რომის პირველი იმპერატორი?',
        options: ['იულიუს კეისარი', 'ოქტავიანე ავგუსტუსი', 'ნერონი', 'კალიგულა'],
        correctAnswer: 1,
      },
      {
        id: '5',
        question: 'რომელ წელს დაიშალა საბჭოთა კავშირი?',
        options: ['1989', '1990', '1991', '1992'],
        correctAnswer: 2,
      },
    ],
  },
  '3': {
    id: 'quiz-geography-1',
    categoryId: '3',
    timePerQuestion: 20,
    prize: 200,
    questions: [
      {
        id: '1',
        question: 'რომელია მსოფლიოს უდიდესი ოკეანე?',
        options: ['ატლანტის ოკეანე', 'ინდოეთის ოკეანე', 'წყნარი ოკეანე', 'არქტიკის ოკეანე'],
        correctAnswer: 2,
      },
      {
        id: '2',
        question: 'რომელ კონტინენტზე მდებარეობს ეგვიპტე?',
        options: ['აფრიკა', 'აზია', 'ევროპა', 'სამხრეთ ამერიკა'],
        correctAnswer: 0,
      },
      {
        id: '3',
        question: 'რომელია მსოფლიოს უმაღლესი მწვერვალი?',
        options: ['მაკალუ', 'კანჩენჯუნგა', 'ევერესტი', 'K2'],
        correctAnswer: 2,
      },
      {
        id: '4',
        question: 'რომელი ქვეყნის დედაქალაქია კანბერა?',
        options: ['ახალი ზელანდია', 'ავსტრალია', 'კანადა', 'სამხრეთ აფრიკა'],
        correctAnswer: 1,
      },
      {
        id: '5',
        question: 'რომელი მდინარეა მსოფლიოში ყველაზე გრძელი?',
        options: ['ნილოსი', 'ამაზონი', 'იანძი', 'მისისიპი'],
        correctAnswer: 0,
      },
    ],
  },
  '4': {
    id: 'quiz-movies-1',
    categoryId: '4',
    timePerQuestion: 20,
    prize: 600,
    questions: [
      {
        id: '1',
        question: 'რომელი ფილმი გახდა ყველაზე შემოსავლიანი 2019 წელს?',
        options: ['შურისმაძიებლები: დასასრული', 'მეფე ლომი', 'ჯოკერი', 'გაყინული 2'],
        correctAnswer: 0,
      },
      {
        id: '2',
        question: 'ვინ ითამაშა ჯეიმს ბონდის როლი ფილმში "კაზინო როიალი" (2006)?',
        options: ['პირს ბროსნანი', 'შონ კონერი', 'დენიელ კრეიგი', 'როჯერ მური'],
        correctAnswer: 2,
      },
      {
        id: '3',
        question: 'რომელმა ფილმმა მიიღო საუკეთესო ფილმის ოსკარი 2020 წელს?',
        options: ['1917', 'ჯოკერი', 'პარაზიტი', 'ერთხელ ჰოლივუდში'],
        correctAnswer: 2,
      },
      {
        id: '4',
        question: 'რომელი სტუდია აწარმოებს "სათამაშო ამბავი" ფილმებს?',
        options: ['დრიმვორქსი', 'პიქსარი', 'დისნეი', 'ილუმინეიშენი'],
        correctAnswer: 1,
      },
      {
        id: '5',
        question: 'რამდენი ოსკარი აქვს მიღებული ლეონარდო დიკაპრიოს?',
        options: ['0', '1', '2', '3'],
        correctAnswer: 1,
      },
    ],
  },
};

// Dummy leaderboard data
const dummyLeaderboard = [
  { userId: 'user1', username: 'გიორგი', score: 450 },
  { userId: 'user2', username: 'მარიამი', score: 380 },
  { userId: 'user3', username: 'ლუკა', score: 320 },
  { userId: 'user4', username: 'ანა', score: 300 },
  { userId: 'user5', username: 'დავითი', score: 280 },
];

const quizService = {
  getQuizByCategoryId: async (categoryId: string): Promise<Quiz> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 700));

    const quiz = dummyQuizzes[categoryId];
    if (!quiz) {
      throw new Error('ვიქტორინა ვერ მოიძებნა');
    }
    return quiz;
  },

  startQuiz: async (categoryId: string): Promise<{ quizId: string }> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const quiz = dummyQuizzes[categoryId];
    if (!quiz) {
      throw new Error('ვიქტორინა ვერ მოიძებნა');
    }
    return { quizId: quiz.id };
  },

  submitQuiz: async (submission: QuizSubmission): Promise<QuizResult> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Find the quiz
    const quiz = Object.values(dummyQuizzes).find((q) => q.id === submission.quizId);
    if (!quiz) {
      throw new Error('ვიქტორინა ვერ მოიძებნა');
    }

    // Calculate score
    let score = 0;
    submission.answers.forEach((answer) => {
      const question = quiz.questions.find((q) => q.id === answer.questionId);
      if (question && question.correctAnswer === answer.selectedOption) {
        score++;
      }
    });

    // Determine if prize is won (70% or higher)
    const totalQuestions = quiz.questions.length;
    const percentage = (score / totalQuestions) * 100;
    const isPrizeWon = percentage >= 70;

    return {
      quizId: submission.quizId,
      score,
      totalQuestions,
      isPrizeWon,
    };
  },

  getLeaderboard: async (): Promise<{ userId: string; username: string; score: number }[]> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 600));
    return dummyLeaderboard;
  },
};

export default quizService;
