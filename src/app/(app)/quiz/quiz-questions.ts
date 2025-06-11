// src/app/(app)/quiz/quiz-questions.ts
export interface QuizQuestionOption {
  value: string;
  label: string;
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: QuizQuestionOption[];
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    text: 'When working on a project, you prefer to:',
    options: [
      { value: 'A', label: 'Work independently and focus deeply.' },
      { value: 'B', label: 'Collaborate closely with a team.' },
      { value: 'C', label: 'Lead the project and delegate tasks.' },
      { value: 'D', label: 'Provide support and expertise as needed.' },
    ],
  },
  {
    id: 'q2',
    text: 'Which environment makes you feel most energized?',
    options: [
      { value: 'A', label: 'A quiet space where you can concentrate.' },
      { value: 'B', label: 'A bustling environment with lots of interaction.' },
      { value: 'C', label: 'A structured setting with clear goals.' },
      { value: 'D', label: 'A flexible environment where you can adapt.' },
    ],
  },
  {
    id: 'q3',
    text: 'When faced with a complex problem, your first instinct is to:',
    options: [
      { value: 'A', label: 'Break it down and analyze each part logically.' },
      { value: 'B', label: 'Brainstorm creative solutions with others.' },
      { value: 'C', label: 'Develop a strategic plan to tackle it.' },
      { value: 'D', label: 'Experiment and try different approaches.' },
    ],
  },
  {
    id: 'q4',
    text: 'You are most motivated by:',
    options: [
      { value: 'A', label: 'Achieving mastery and expertise in a specific area.' },
      { value: 'B', label: 'Making a positive impact on people or society.' },
      { value: 'C', label: 'Attaining ambitious goals and recognition.' },
      { value: 'D', label: 'Learning new things and exploring diverse fields.' },
    ],
  },
  {
    id: 'q5',
    text: 'Your ideal work task involves:',
    options: [
      { value: 'A', label: 'Detailed research and data analysis.' },
      { value: 'B', label: 'Communicating and presenting ideas.' },
      { value: 'C', label: 'Organizing and managing resources or people.' },
      { value: 'D', label: 'Creating something new or innovative.' },
    ],
  },
];
