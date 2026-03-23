<template>
  <div>
    <div class="quiz-options">
      <button @click="showQuizOptions = !showQuizOptions">Start a Quiz</button>
      <button @click="showFlashcards = !showFlashcards">Flashcards</button>
    </div>

    <!-- Quiz Options Popup -->
    <div v-if="showQuizOptions" class="modal-overlay">
      <div class="modal">
        <h2>Quiz Options</h2>
        <form @submit.prevent="startQuiz">
          <div class="form-group">
            <label for="category">Category:</label>
            <select v-model="quizParams.category" class="form-control">
              <option value="definitions">Definitions</option>
              <option value="procedures">Procedures</option>
              <option value="both">Both</option>
            </select>
          </div>

          <div v-if="quizParams.category !== 'definitions'">
            <label>Chapters (Optional):</label>
            <multiselect v-model="quizParams.chapters" :options="chapters" :multiple="true" track-by="id" label="title" placeholder="Select chapters" class="form-control" />
          </div>

          <div v-if="quizParams.category !== 'procedures'">
            <label>Procedures (Optional):</label>
            <multiselect v-model="quizParams.procedures" :options="procedures" :multiple="true"  track-by="id" label="name" placeholder="Select procedures" class="form-control" />
          </div>

          <div class="form-group">
            <label for="timer">Timer:</label>
            <select v-model="quizParams.timer" class="form-control">
              <option value="0">No Timer</option>
              <option value="60">1 Minute Per Question (Easy)</option>
              <option value="30">30 Seconds Per Question (Hard)</option>
            </select>
          </div>

          <div class="form-group">
            <label for="difficulty">Difficulty:</label>
            <select v-model="quizParams.difficulty" class="form-control">
              <option value="easy">Easy</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <button type="submit" class="btn btn-primary">Start Quiz</button>
          <button type="button" @click="showQuizOptions = false" class="btn btn-secondary">Cancel</button>
        </form>
      </div>
    </div>

    <!-- Flashcards Popup -->
    <div v-if="showFlashcards" class="modal-overlay">
      <div class="modal">
        <h2>Flashcards Options</h2>
        <form @submit.prevent="startFlashcards">
          <div class="form-group">
            <label>Definitions by Chapter or Procedure:</label>
            <multiselect v-model="flashcardParams" :options="definitions.data.data" :multiple="true" track-by="id" label="term" placeholder="Select definitions" class="form-control" />
          </div>

          <button type="submit" class="btn btn-primary">Start Flashcards</button>
          <button type="button" @click="showFlashcards = false" class="btn btn-secondary">Cancel</button>
        </form>
      </div>
    </div>

    <!-- Quiz Display -->
    <div v-if="currentQuiz">
      <h2>{{ currentQuiz.title }}</h2>
      <div v-if="!quizCompleted">
        <div v-for="(question, index) in currentQuiz.questions" :key="index">
          <div v-if="index === currentQuestionIndex">
            <h3>{{ question.question_text }}</h3>
            <div v-for="(option, idx) in question.answer_options" :key="idx">
              <input 
                type="radio" 
                :name="question.id" 
                :value="option" 
                v-model="selectedAnswers[question.id]" 
              />
              <label>{{ option }}</label>
            </div>
            <button @click="previousQuestion">Back</button>
            <button @click="nextQuestion">Next</button>
          </div>
        </div>
      </div>
      <div v-else>
        <h2>Your Score: {{ score }}%</h2>
        <!-- Display results -->
      </div>
    </div>

    <!-- Flashcards Display -->
    <div v-if="currentFlashcards">
      <div v-for="(card, index) in currentFlashcards" :key="index">
        <div v-if="!cardFlipped[index]">
          <p>{{ card.term }}</p>
          <button @click="flipCard(index)">Show Definition</button>
        </div>
        <div v-else>
          <p>{{ card.definition }}</p>
          <button @click="flipCard(index)">Show Term</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import Multiselect from 'vue-multiselect';

export default {
  components: {
    Multiselect
  },
  data() {
    return {
      showQuizOptions: false,
      showFlashcards: false,
      quizParams: {
        category: 'both',
        chapters: [],
        procedures: [],
        timer: 0,
        difficulty: 'easy'
      },
      flashcardParams: [],
      chapters: [], // to be fetched
      procedures: [], // to be fetched
      definitions: [], // to be fetched
      currentQuiz: null,
      currentFlashcards: null,
      currentQuestionIndex: 0,
      selectedAnswers: {},
      score: null,
      quizCompleted: false,
      cardFlipped: []
    };
  },
  methods: {
    async fetchQuestions() {
      // Fetch chapters from API
      const response = await axios.get('http://localhost:1337/api/questions');
      this.questions = response.data;
      console.log('Questions', this.questions)
    },

    async fetchDefinitions() {
      // Fetch definitions from API
      const response = await axios.get('http://localhost:1337/api/definitions');
      this.definitions = response.data;
      console.log('Definitions', this.definitions)
    },
    async startQuiz() {
      // Fetch quiz questions based on parameters
      const response = await axios.get('http://localhost:1337/api/quizzes', {
        params: this.quizParams
      });
      this.currentQuiz = response.data;
      console.log('currentQuiz', this.currentQuiz)
      this.currentQuestionIndex = 0;
      this.selectedAnswers = {};
      this.quizCompleted = false;
      this.score = null;
      this.showQuizOptions = false;
    },
    async startFlashcards() {
      // Fetch flashcards based on parameters
      const response = await axios.get('http://localhost:1337/api/flashcards', {
        params: this.flashcardParams
      });
      this.currentFlashcards = response.data;
      this.cardFlipped = Array(this.currentFlashcards.length).fill(false);
      this.showFlashcards = false;
    },
    nextQuestion() {
      if (this.currentQuestionIndex < this.currentQuiz.questions.length - 1) {
        this.currentQuestionIndex++;
      } else {
        this.submitQuiz();
      }
    },
    previousQuestion() {
      if (this.currentQuestionIndex > 0) {
        this.currentQuestionIndex--;
      }
    },
    submitQuiz() {
      // Logic to calculate and display score
      // For simplicity, just setting score here
      this.score = Math.floor(Math.random() * 100); // Replace with actual scoring logic
      this.quizCompleted = true;
    },
    flipCard(index) {
      this.cardFlipped[index] = !this.cardFlipped[index];
    }
  },
  async created() {
    await this.fetchQuestions();
    //await this.fetchProcedures();
    await this.fetchDefinitions();
  }
};
</script>

<style scoped>
/* Add any specific styles here */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  width: 80%;
  max-width: 600px;
}

.form-group {
  margin-bottom: 15px;
}

.form-control {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.btn-primary {
  background: #007bff;
  color: #fff;
}

.btn-secondary {
  background: #6c757d;
  color: #fff;
}

.quiz-options {
  margin-bottom: 20px;
}
</style>
