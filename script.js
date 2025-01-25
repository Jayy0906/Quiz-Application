document.addEventListener("DOMContentLoaded", () => {
  const categorySelect = document.getElementById("category-select");
  const difficultySelect = document.getElementById("difficulty-select");
  const startQuizBtn = document.getElementById("start-quiz-btn");
  const configSection = document.getElementById("config-section");
  const quizSection = document.getElementById("quiz-section");
  const questionContainer = document.getElementById("question-container");
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");
  const submitBtn = document.getElementById("submit-btn");
  const resultContainer = document.getElementById("result-container");
  const progressBar = document.getElementById("progress-bar");
  const timer = document.getElementById("timer");

  let questions = [];
  let currentQuestionIndex = 0;
  let score = 0;
  let timerInterval;
  const totalQuizTime = 600; // 10 minutes in seconds

  async function fetchQuestions(category, difficulty) {
    const apiUrl = `https://opentdb.com/api.php?amount=10&category=${category}&difficulty=${difficulty}&type=multiple`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    return data.results.map((item) => {
      return {
        question: item.question,
        options: [...item.incorrect_answers, item.correct_answer].sort(
          () => Math.random() - 0.5
        ),
        correctAnswer: item.correct_answer,
      };
    });
  }

  function startTimer(duration) {
    let timeLeft = duration;
    timer.textContent = formatTime(timeLeft);

    timerInterval = setInterval(() => {
      timeLeft--;
      timer.textContent = formatTime(timeLeft);

      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        submitQuiz();
      }
    }, 1000);
  }

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }

  function displayQuestion(index) {
    const questionData = questions[index];
    questionContainer.innerHTML = `
        <h4>${index + 1}. ${questionData.question}</h4>
        <div class="options">
          ${questionData.options
            .map(
              (option, i) => `
                <button class="option-btn" data-index="${i}">
                  ${option}
                </button>
              `
            )
            .join("")}
        </div>
      `;

    const optionButtons = questionContainer.querySelectorAll(".option-btn");
    optionButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        optionButtons.forEach((btn) => btn.classList.remove("selected"));
        button.classList.add("selected");
      });
    });

    progressBar.style.width = `${((index + 1) / questions.length) * 100}%`;
  }

  function handleNavigation(step) {
    if (step === -1 && currentQuestionIndex > 0) {
      currentQuestionIndex--;
    } else if (step === 1 && currentQuestionIndex < questions.length - 1) {
      currentQuestionIndex++;
    }
    displayQuestion(currentQuestionIndex);
  }

  function calculateScore() {
    questions.forEach((question, index) => {
      const selectedOption = questionContainer.querySelector(
        `.options button.selected`
      );
      if (
        selectedOption &&
        selectedOption.textContent === question.correctAnswer
      ) {
        score++;
      }
    });
  }

  function submitQuiz() {
    clearInterval(timerInterval);
    calculateScore();
    quizSection.classList.add("d-none");
    resultContainer.classList.remove("d-none");
    resultContainer.innerHTML = `
        <h2>Your Score: ${score}/${questions.length}</h2>
        <p>Well done! Refresh the page to try again.</p>
      `;
  }

  startQuizBtn.addEventListener("click", async () => {
    const category = categorySelect.value;
    const difficulty = difficultySelect.value;

    questions = await fetchQuestions(category, difficulty);
    configSection.classList.add("d-none");
    quizSection.classList.remove("d-none");
    startTimer(totalQuizTime);
    displayQuestion(currentQuestionIndex);
  });

  prevBtn.addEventListener("click", () => handleNavigation(-1));
  nextBtn.addEventListener("click", () => handleNavigation(1));
  submitBtn.addEventListener("click", submitQuiz);
});
