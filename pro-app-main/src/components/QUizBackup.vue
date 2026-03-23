<!-- First Draft -->

<template>

<div class="buttons-row container py-4">
  <!-- Left-aligned buttons -->
  <div class="left-buttons">
    <button @click="goBack" class="btn btn-secondary btn-sm ">Back</button>
  </div>
</div>

<div class="quiz-content container py-4">
  <h1 class="text-center mb-4">Procedures Quiz</h1>
 
  <div v-if="loading">Loading quiz...</div>
  <div v-else>
    <div v-if="error">{{ error }}</div>
    <div v-else>
      <form v-if="score === null" @submit.prevent="submitQuiz">
        <div v-for="(question, index) in quizData" :key="index" class="quiz-question card mb-3">
          <div class="card-body">
            <h3 class="card-title">{{ question.attributes.question_text }}</h3>

            <!-- Multiple Choice Question -->
            <div v-if="question.attributes.question_type === 'multiple_choice'">
              <div v-for="(option, idx) in question.attributes.answer_options" :key="idx" class="form-check">
                <input 
                  class="form-check-input"
                  type="radio" 
                  :name="'question_' + question.id"
                  :value="option"
                  v-model="answers[question.id]" 
                  id="option_{{ question.id }}_{{ idx }}"
                />
                <label class="form-check-label" :for="'option_' + question.id + '_' + idx">
                  {{ option.optionText }}
                </label>
              </div>
            </div>

            <!-- True/False Question -->
            <div v-else-if="question.attributes.question_type === 'true_false'">
              <div class="form-check">
                <input 
                  class="form-check-input" 
                  type="radio" 
                  :name="'question_' + question.id" 
                  value="True"
                  v-model="answers[question.id]" 
                  id="true_{{ question.id }}"
                />
                <label class="form-check-label" :for="'true_' + question.id">
                  True
                </label>
              </div>
              <div class="form-check">
                <input 
                  class="form-check-input" 
                  type="radio" 
                  :name="'question_' + question.id" 
                  value="False"
                  v-model="answers[question.id]" 
                  id="false_{{ question.id }}"
                />
                <label class="form-check-label" :for="'false_' + question.id">
                  False
                </label>
              </div>
            </div>
          </div>
        </div>

        <button type="submit" class="btn btn-primary">Submit Answers</button>
      </form>

      <!-- Display results and score -->
      <div v-if="score !== null">
        <h2>Your Score: {{ score }}%</h2>
        <ul>
          <li v-for="(result, idx) in results" :key="idx">
            {{ result.question }} - <strong>{{ result.correct ? 'Correct' : 'Incorrect' }}</strong>
          </li>
        </ul>
      </div>
    </div>
  </div>

</div> <!-- .quiz-content --> 
</template>



<script>
import axios from 'axios';
import { authState } from '@/store/authState'; // Auth state management

export default {
  name: 'Quiz',
  data() {
    return {
      quizData: [],  // Contains the quiz data with questions and answers
      answers: {},   // To store the selected answers for each question
      score: null,   // Holds the user's score after the quiz
      results: [],   // Holds the result (correct/incorrect) for each question
      loading: true,
      error: null, // Add error property to display any error messages
    };
  },
  computed: {
    isLoggedIn() {
      return authState.isLoggedIn;
    }
  },
  async created() {
    const jwt = localStorage.getItem('jwt');

    // Check if JWT exists
    if (!jwt) {
      console.log('User is not logged in');
      this.$router.push('/login'); // Redirect to login or handle accordingly
      return;
    }

    try {
      const quizDataURL = `http://localhost:1337/api/questions?populate=answer_options`;

      // Fetch quiz data with Authorization header
      const quizResponse = await axios.get(quizDataURL, {
        headers: {
          'Authorization': `Bearer ${jwt}`
        }
      });

      if (!quizResponse.data) {
        throw new Error('No quiz data available');
      }
      //console.log('quizResponse.data:',quizResponse.data);

      // Parse and assign the quiz data
      this.quizData = quizResponse.data.data;
      console.log('quizData:', this.quizData);

      this.loading = false;

    } catch (error) {
      console.error('Error fetching quiz:', error);
      this.error = 'There was an error fetching the quiz. Please try again later.';
      this.loading = false;
    }
  },
    methods: {
    selectAnswer(questionId, selectedAnswer) {
      this.$set(this.answers, questionId, selectedAnswer);
    },

    // Submit the quiz, calculate the score, and save the results to the user profile
    async submitQuiz() {
      try {
        let correctAnswersCount = 0;
        this.results = [];

        // Loop through the quizData and compare user answers with correct answers
        this.quizData.forEach((question) => {
          const correctAnswer = question.attributes.correct_answer;  // Assume 'correct_answer' is stored in the question data
          const userAnswer = this.answers[question.id];

          if (userAnswer === correctAnswer) {
            correctAnswersCount++;
            this.results.push({ question: question.attributes.question_text, correct: true });
          } else {
            this.results.push({ question: question.attributes.question_text, correct: false });
          }
        });

        this.score = Math.round((correctAnswersCount / this.quizData.length) * 100); // Calculate percentage score
        console.log('User Score:', this.score);
        console.log('Results:', this.results);

        // Save the results to the user's profile in Strapi
        await this.saveResultsToProfile();

      } catch (error) {
        console.error('Error submitting quiz:', error);
      }
    },

    // Method to save the quiz results to the user profile in Strapi
    async saveResultsToProfile() {
      const jwt = localStorage.getItem('jwt');
      const userId = localStorage.getItem('userId'); // Assuming userId is stored in localStorage

      const resultData = {
        data: {
          user: userId,
          score: this.score,
          quiz_results: this.results,
        }
      };

      try {
        const saveResponse = await axios.post(`http://localhost:1337/api/quiz-results`, resultData, {
          headers: {
            'Authorization': `Bearer ${jwt}`
          }
        });

        console.log('Results saved to user profile:', saveResponse.data);
      } catch (error) {
        console.error('Error saving quiz results:', error);
      }
    }
  }
};
</script>


<style scoped>
.quiz-container {
  padding: 20px;
}
.question-block {
  margin-bottom: 20px;
}
</style>

<!-- 2nd Draft -->

<template>
  <div class="quiz-selection">
    <h2>Select a Procedure-related Quiz</h2>
    <div v-if="loading">Loading quizzes...</div>
    <div v-if="error">{{ error }}</div>

    <!-- Show available procedure-related quizzes -->
    <div class="row" v-if="filteredQuizzes.length">
      <div class="col-md-4 mb-4" v-for="quiz in filteredQuizzes" :key="quiz.id">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">{{ quiz.attributes.quiz_title }}</h5>
            <p class="card-text">Questions: {{ quiz.attributes.total_questions }}</p>
            <button class="btn btn-primary" @click="startQuiz(quiz.id)">Start Quiz</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Show quiz questions after selecting a quiz -->
    <div v-if="questions.length">
      <h3>{{ selectedQuizTitle }}</h3>
      <div v-for="(question, index) in questions" :key="question.id" class="card mb-3">
        <div class="card-body">
          <h5 class="card-title">Question {{ index + 1 }}</h5>
          <p class="card-text">{{ question.attributes.question_text }}</p>
          <div v-for="(option, i) in question.attributes.answer_options" :key="i">
            <input type="radio" :name="'question' + question.id" :value="option" v-model="userAnswers[question.id]"> {{ option }}
          </div>
        </div>
      </div>
      <button class="btn btn-success" @click="submitQuiz">Submit Quiz</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { authState } from '@/store/authState'; // Auth state management

export default {
  data() {
    return {
      quizzes: [],
      questions: [], // Will store questions after selecting a quiz
      selectedQuizTitle: '', // For displaying quiz title
      userAnswers: {}, // Stores user's answers for each question
      loading: true,
      error: null
    };
  },
  async created() {
    try {
      const jwt = localStorage.getItem('jwt');
      
      // Fetch procedure-related quizzes
      const quizResponse = await axios.get('http://localhost:1337/api/quizzes', {
        headers: {
          'Authorization': `Bearer ${jwt}`
        }
      });

      // Filter for procedure-related quizzes
      this.quizzes = quizResponse.data.data.filter(quiz => {
        return quiz.attributes.quiz_topic === 'procedure' && quiz.attributes.quiz_status === 'active';
      });
      
      console.log('quizzes:', this.quizzes);

      this.loading = false;
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      this.error = 'There was an error loading the quizzes.';
      this.loading = false;
    }
  },
  methods: {
    async startQuiz(quizId) {
      try {
        const jwt = localStorage.getItem('jwt');
        this.loading = true;

        // Fetch the selected quiz details to get related procedures
        const quizResponse = await axios.get(`http://localhost:1337/api/quizzes/${quizId}?populate=procedures`, {
          headers: {
            'Authorization': `Bearer ${jwt}`
          }
        });

        const quiz = quizResponse.data.data;
        this.selectedQuizTitle = quiz.attributes.quiz_title;

        // Fetch questions related to the quiz's procedures
        const procedureIds = quiz.attributes.procedures.map(proc => proc.id);
        const questionsResponse = await axios.get(`http://localhost:1337/api/questions`, {
          params: {
            'filters[procedure][id][$in]': procedureIds // Filter questions by related procedure IDs
          },
          headers: {
            'Authorization': `Bearer ${jwt}`
          }
        });

        this.questions = questionsResponse.data.data;
        this.loading = false;
      } catch (error) {
        console.error('Error fetching questions:', error);
        this.error = 'There was an error loading the quiz questions.';
        this.loading = false;
      }
    },
    submitQuiz() {
      // Handle the submission logic (e.g., calculating score, saving the result)
      console.log('User answers:', this.userAnswers);
    }
  },
  computed: {
    filteredQuizzes() {
      return this.quizzes.filter(quiz => quiz.attributes.quiz_status === 'active');
    }
  }
};
</script>
