import React, { useState, useEffect } from 'react';
import { Plus, Edit, Eye, Trash2, X, CheckCircle } from 'lucide-react';
import { Button } from '../shared/Button';
import { Input } from '../shared/Input';
import { FormField } from '../shared/FormField';
import { supabase } from '../../lib/supabase';

interface Quiz {
  id: string;
  title: string;
  description: string;
  reward: number;
  unlock_day: number;
  is_active: boolean;
  created_at: string;
}

interface Question {
  id: string;
  quiz_id: string;
  question: string;
  options: string[];
  correct_answer: number;
  order_index: number;
}

export const QuizManagement: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .order('unlock_day');

      if (error) throw error;
      setQuizzes(data || []);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async (quizId: string) => {
    try {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', quizId)
        .order('order_index');

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const deleteQuiz = async (quizId: string) => {
    if (!confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', quizId);

      if (error) throw error;

      await fetchQuizzes();
      alert('Quiz deleted successfully!');
    } catch (error) {
      console.error('Error deleting quiz:', error);
      alert('Failed to delete quiz');
    }
  };

  const toggleQuizStatus = async (quizId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('quizzes')
        .update({ is_active: !currentStatus })
        .eq('id', quizId);

      if (error) throw error;

      await fetchQuizzes();
      alert(`Quiz ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
    } catch (error) {
      console.error('Error updating quiz status:', error);
      alert('Failed to update quiz status');
    }
  };

  const handleViewQuiz = async (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    await fetchQuestions(quiz.id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Quiz Management</h2>
        <div className="flex gap-2">
          <Button onClick={() => setShowQuizForm(true)} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Quiz
          </Button>
          <Button onClick={fetchQuizzes} variant="secondary" size="sm">
            Refresh
          </Button>
        </div>
      </div>

      {/* Quizzes Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <div key={quiz.id} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">{quiz.title}</h3>
                <p className="text-sm text-gray-400 mb-3 line-clamp-2">{quiz.description}</p>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-300"><strong>Day:</strong> {quiz.unlock_day}</p>
                  <p className="text-gray-300"><strong>Reward:</strong> €{quiz.reward.toFixed(2)}</p>
                  <p className="text-gray-300">
                    <strong>Status:</strong> 
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      quiz.is_active ? 'bg-green-600/20 text-green-300' : 'bg-red-600/20 text-red-300'
                    }`}>
                      {quiz.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => handleViewQuiz(quiz)}
                variant="ghost"
                size="sm"
                className="text-blue-400 hover:text-blue-300"
              >
                <Eye className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => {
                  setSelectedQuiz(quiz);
                  setShowQuizForm(true);
                }}
                variant="ghost"
                size="sm"
                className="text-yellow-400 hover:text-yellow-300"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => toggleQuizStatus(quiz.id, quiz.is_active)}
                variant="ghost"
                size="sm"
                className={quiz.is_active ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'}
              >
                {quiz.is_active ? 'Deactivate' : 'Activate'}
              </Button>
              <Button
                onClick={() => deleteQuiz(quiz.id)}
                variant="ghost"
                size="sm"
                className="text-red-400 hover:text-red-300"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Quiz Form Modal */}
      {showQuizForm && (
        <QuizFormModal
          quiz={selectedQuiz}
          onClose={() => {
            setShowQuizForm(false);
            setSelectedQuiz(null);
          }}
          onSave={() => {
            fetchQuizzes();
            setShowQuizForm(false);
            setSelectedQuiz(null);
          }}
        />
      )}

      {/* Quiz Detail Modal */}
      {selectedQuiz && !showQuizForm && (
        <QuizDetailModal
          quiz={selectedQuiz}
          questions={questions}
          onClose={() => {
            setSelectedQuiz(null);
            setQuestions([]);
          }}
          onEdit={() => setShowQuizForm(true)}
          onAddQuestion={() => setShowQuestionForm(true)}
          onRefreshQuestions={() => fetchQuestions(selectedQuiz.id)}
        />
      )}

      {/* Question Form Modal */}
      {showQuestionForm && selectedQuiz && (
        <QuestionFormModal
          quiz={selectedQuiz}
          onClose={() => setShowQuestionForm(false)}
          onSave={() => {
            fetchQuestions(selectedQuiz.id);
            setShowQuestionForm(false);
          }}
        />
      )}
    </div>
  );
};

// Quiz Form Modal Component
const QuizFormModal: React.FC<{
  quiz: Quiz | null;
  onClose: () => void;
  onSave: () => void;
}> = ({ quiz, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: quiz?.title || '',
    description: quiz?.description || '',
    reward: quiz?.reward || 7.15,
    unlock_day: quiz?.unlock_day || 1,
    is_active: quiz?.is_active ?? true
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      if (quiz) {
        // Update existing quiz
        const { error } = await supabase
          .from('quizzes')
          .update(formData)
          .eq('id', quiz.id);
        
        if (error) throw error;
      } else {
        // Create new quiz
        const { error } = await supabase
          .from('quizzes')
          .insert(formData);
        
        if (error) throw error;
      }
      
      onSave();
      alert(quiz ? 'Quiz updated successfully!' : 'Quiz created successfully!');
    } catch (error) {
      console.error('Error saving quiz:', error);
      alert('Failed to save quiz');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : 
               type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-2xl border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">
            {quiz ? 'Edit Quiz' : 'Create New Quiz'}
          </h3>
          <Button onClick={onClose} variant="ghost" size="sm" className="text-gray-400">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Title" required>
            <Input
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Quiz title"
              className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 rounded-xl"
              required
            />
          </FormField>

          <FormField label="Description" required>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Quiz description"
              rows={3}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Reward (€)" required>
              <Input
                type="number"
                name="reward"
                value={formData.reward}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 rounded-xl"
                required
              />
            </FormField>

            <FormField label="Unlock Day" required>
              <Input
                type="number"
                name="unlock_day"
                value={formData.unlock_day}
                onChange={handleInputChange}
                min="1"
                max="30"
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 rounded-xl"
                required
              />
            </FormField>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleInputChange}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-600 rounded bg-gray-800"
            />
            <label className="ml-2 text-sm text-gray-300">Active</label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button onClick={onClose} variant="secondary" disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" className="bg-purple-600 hover:bg-purple-700" loading={saving}>
              {quiz ? 'Update Quiz' : 'Create Quiz'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Quiz Detail Modal Component
const QuizDetailModal: React.FC<{
  quiz: Quiz;
  questions: Question[];
  onClose: () => void;
  onEdit: () => void;
  onAddQuestion: () => void;
  onRefreshQuestions: () => void;
}> = ({ quiz, questions, onClose, onEdit, onAddQuestion, onRefreshQuestions }) => {
  const deleteQuestion = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('quiz_questions')
        .delete()
        .eq('id', questionId);

      if (error) throw error;

      onRefreshQuestions();
      alert('Question deleted successfully!');
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('Failed to delete question');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Quiz Details</h3>
          <Button onClick={onClose} variant="ghost" size="sm" className="text-gray-400">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="space-y-6">
          {/* Quiz Info */}
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <h4 className="font-medium text-white mb-2">Quiz Information</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Title:</p>
                <p className="text-white">{quiz.title}</p>
              </div>
              <div>
                <p className="text-gray-400">Unlock Day:</p>
                <p className="text-white">Day {quiz.unlock_day}</p>
              </div>
              <div>
                <p className="text-gray-400">Reward:</p>
                <p className="text-white">€{quiz.reward.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-400">Status:</p>
                <span className={`px-2 py-1 rounded text-xs ${
                  quiz.is_active ? 'bg-green-600/20 text-green-300' : 'bg-red-600/20 text-red-300'
                }`}>
                  {quiz.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-gray-400">Description:</p>
              <p className="text-white">{quiz.description}</p>
            </div>
          </div>

          {/* Questions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-white">Questions ({questions.length})</h4>
              <Button onClick={onAddQuestion} size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Button>
            </div>

            {questions.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No questions added yet. Click "Add Question" to get started.
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <div key={question.id} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                    <div className="flex items-start justify-between mb-3">
                      <h5 className="font-medium text-white">Question {index + 1}</h5>
                      <Button
                        onClick={() => deleteQuestion(question.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-gray-300 mb-3">{question.question}</p>
                    <div className="space-y-2">
                      {question.options.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className={`p-2 rounded text-sm ${
                            optionIndex === question.correct_answer
                              ? 'bg-green-600/20 text-green-300 border border-green-500/30'
                              : 'bg-gray-700/50 text-gray-300'
                          }`}
                        >
                          <span className="font-medium mr-2">
                            {String.fromCharCode(65 + optionIndex)}.
                          </span>
                          {option}
                          {optionIndex === question.correct_answer && (
                            <span className="ml-2 text-green-400">✓ Correct</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-700 mt-6">
          <Button onClick={onClose} variant="secondary">
            Close
          </Button>
          <Button onClick={onEdit} className="bg-purple-600 hover:bg-purple-700">
            <Edit className="w-4 h-4 mr-2" />
            Edit Quiz
          </Button>
        </div>
      </div>
    </div>
  );
};

// Question Form Modal Component
const QuestionFormModal: React.FC<{
  quiz: Quiz;
  onClose: () => void;
  onSave: () => void;
}> = ({ quiz, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    question: '',
    options: ['', '', '', ''],
    correct_answer: 0
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.question.trim()) {
      alert('Please enter a question');
      return;
    }
    
    if (formData.options.some(option => !option.trim())) {
      alert('Please fill in all answer options');
      return;
    }

    setSaving(true);
    
    try {
      // Get the next order index
      const { data: existingQuestions } = await supabase
        .from('quiz_questions')
        .select('order_index')
        .eq('quiz_id', quiz.id)
        .order('order_index', { ascending: false })
        .limit(1);

      const nextOrderIndex = existingQuestions && existingQuestions.length > 0 
        ? existingQuestions[0].order_index + 1 
        : 1;

      const { error } = await supabase
        .from('quiz_questions')
        .insert({
          quiz_id: quiz.id,
          question: formData.question,
          options: formData.options,
          correct_answer: formData.correct_answer,
          order_index: nextOrderIndex
        });
      
      if (error) throw error;
      
      onSave();
      alert('Question added successfully!');
    } catch (error) {
      console.error('Error saving question:', error);
      alert('Failed to save question');
    } finally {
      setSaving(false);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-2xl border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Add Question to "{quiz.title}"</h3>
          <Button onClick={onClose} variant="ghost" size="sm" className="text-gray-400">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Question" required>
            <textarea
              value={formData.question}
              onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
              placeholder="Enter your question"
              rows={3}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </FormField>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Answer Options</label>
            <div className="space-y-3">
              {formData.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="correct_answer"
                      checked={formData.correct_answer === index}
                      onChange={() => setFormData(prev => ({ ...prev, correct_answer: index }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 bg-gray-800"
                    />
                    <span className="ml-2 text-sm text-gray-300 font-medium">
                      {String.fromCharCode(65 + index)}.
                    </span>
                  </div>
                  <Input
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                    className="flex-1 bg-gray-800 border-gray-700 text-white placeholder-gray-400 rounded-xl"
                    required
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Select the radio button next to the correct answer
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button onClick={onClose} variant="secondary" disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" loading={saving}>
              Add Question
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};