// Quiz page JavaScript

let quizData = [];
let currentQuestionIndex = 0;
let score = 0;
let selectedAnswer = null;
let quizStarted = false;

// DOM elements
let quizStart;
let quizProgress;
let quizContainer;
let quizResults;
let quizLoading;
let progressFill;
let currentQuestionElement;
let totalQuestionsElement;
let questionChinese;
let questionPinyin;
let optionsContainer;
let finalScoreElement;
let scorePercentageElement;
let resultsIcon;
let resultsTitle;
let resultsMessage;

// Initialize quiz page
document.addEventListener("DOMContentLoaded", function () {
  initializeQuizPage();
});

function initializeQuizPage() {
  // Get DOM elements
  quizStart = document.getElementById("quizStart");
  quizProgress = document.getElementById("quizProgress");
  quizContainer = document.getElementById("quizContainer");
  quizResults = document.getElementById("quizResults");
  quizLoading = document.getElementById("quizLoading");
  progressFill = document.getElementById("progressFill");
  currentQuestionElement = document.getElementById("currentQuestion");
  totalQuestionsElement = document.getElementById("totalQuestions");
  questionChinese = document.getElementById("questionChinese");
  questionPinyin = document.getElementById("questionPinyin");
  optionsContainer = document.getElementById("optionsContainer");
  finalScoreElement = document.getElementById("finalScore");
  scorePercentageElement = document.getElementById("scorePercentage");
  resultsIcon = document.getElementById("resultsIcon");
  resultsTitle = document.getElementById("resultsTitle");
  resultsMessage = document.getElementById("resultsMessage");

  // Set up event listeners
  setupEventListeners();
}

function setupEventListeners() {
  // Start quiz button
  const startQuizBtn = document.getElementById("startQuizBtn");
  if (startQuizBtn) {
    startQuizBtn.addEventListener("click", startQuiz);
  }

  // Retake quiz button
  const retakeQuizBtn = document.getElementById("retakeQuizBtn");
  if (retakeQuizBtn) {
    retakeQuizBtn.addEventListener("click", resetQuiz);
  }

  // Pronounce question button
  const pronounceQuestionBtn = document.getElementById("pronounceQuestionBtn");
  if (pronounceQuestionBtn) {
    pronounceQuestionBtn.addEventListener("click", function () {
      if (quizData[currentQuestionIndex]) {
        ChineseLearningApp.speakChinese(quizData[currentQuestionIndex].chinese);
      }
    });
  }

  // Next question button in feedback modal
  const nextQuestionBtn = document.getElementById("nextQuestionBtn");
  if (nextQuestionBtn) {
    nextQuestionBtn.addEventListener("click", function () {
      ChineseLearningApp.closeModal("feedbackModal");
      nextQuestion();
    });
  }
}

async function startQuiz() {
  try {
    showLoading();

    // Reset quiz state
    currentQuestionIndex = 0;
    score = 0;
    selectedAnswer = null;
    quizStarted = true;

    // Load quiz data
    quizData = await ChineseLearningApp.fetchAPI("/api/quiz");

    if (quizData.length === 0) {
      throw new Error("No quiz questions available");
    }

    // Hide start screen and show quiz
    hideAllSections();
    quizProgress.style.display = "block";
    quizContainer.style.display = "block";

    // Update total questions
    if (totalQuestionsElement) {
      totalQuestionsElement.textContent = quizData.length;
    }

    // Show first question
    showQuestion();
  } catch (error) {
    console.error("Error starting quiz:", error);
    ChineseLearningApp.showError(
      "Failed to load quiz questions. Please try again.",
      quizStart
    );
  } finally {
    hideLoading();
  }
}

function showQuestion() {
  if (currentQuestionIndex >= quizData.length) {
    showResults();
    return;
  }

  const question = quizData[currentQuestionIndex];
  selectedAnswer = null;

  // Update progress
  updateProgress();

  // Update question display
  if (questionChinese) {
    questionChinese.textContent = question.chinese;
  }
  if (questionPinyin) {
    questionPinyin.textContent = question.pinyin;
  }

  // Create option buttons
  createOptionButtons(question.options, question.correct);
}

function createOptionButtons(options, correctAnswer) {
  if (!optionsContainer) return;

  optionsContainer.innerHTML = "";

  options.forEach((option, index) => {
    const button = document.createElement("button");
    button.className = "option-btn";
    button.textContent = option;
    button.dataset.answer = option;

    button.addEventListener("click", function () {
      selectAnswer(this, option, correctAnswer);
    });

    optionsContainer.appendChild(button);
  });
}

function selectAnswer(buttonElement, selectedOption, correctAnswer) {
  if (selectedAnswer !== null) return; // Already answered

  selectedAnswer = selectedOption;
  const isCorrect = selectedOption === correctAnswer;

  // Update button styles
  const allButtons = optionsContainer.querySelectorAll(".option-btn");
  allButtons.forEach((btn) => {
    btn.disabled = true;
    if (btn.dataset.answer === correctAnswer) {
      btn.classList.add("correct");
    } else if (btn === buttonElement && !isCorrect) {
      btn.classList.add("incorrect");
    }
  });

  // Update score
  if (isCorrect) {
    score++;
  }

  // Show feedback modal
  setTimeout(() => {
    showFeedback(isCorrect, correctAnswer);
  }, 1000);
}

function showFeedback(isCorrect, correctAnswer) {
  const question = quizData[currentQuestionIndex];

  // Update feedback modal content
  const feedbackIcon = document.getElementById("feedbackIcon");
  const feedbackTitle = document.getElementById("feedbackTitle");
  const feedbackChinese = document.getElementById("feedbackChinese");
  const feedbackPinyin = document.getElementById("feedbackPinyin");
  const feedbackIndonesian = document.getElementById("feedbackIndonesian");

  if (feedbackIcon) {
    feedbackIcon.textContent = isCorrect ? "🎉" : "😔";
  }

  if (feedbackTitle) {
    feedbackTitle.textContent = isCorrect ? "Benar!" : "Salah";
    feedbackTitle.style.color = isCorrect ? "#48bb78" : "#f56565";
  }

  if (feedbackChinese) {
    feedbackChinese.textContent = question.chinese;
  }

  if (feedbackPinyin) {
    feedbackPinyin.textContent = question.pinyin;
  }

  if (feedbackIndonesian) {
    feedbackIndonesian.textContent = correctAnswer;
  }

  // Update next button text
  const nextQuestionBtn = document.getElementById("nextQuestionBtn");
  if (nextQuestionBtn) {
    const isLastQuestion = currentQuestionIndex >= quizData.length - 1;
    nextQuestionBtn.textContent = isLastQuestion
      ? "Lihat Hasil"
      : "Pertanyaan Selanjutnya";
  }

  // Open feedback modal
  ChineseLearningApp.openModal("feedbackModal");
}

function nextQuestion() {
  currentQuestionIndex++;
  showQuestion();
}

function updateProgress() {
  const progress = ((currentQuestionIndex + 1) / quizData.length) * 100;

  if (progressFill) {
    progressFill.style.width = progress + "%";
  }

  if (currentQuestionElement) {
    currentQuestionElement.textContent = currentQuestionIndex + 1;
  }
}

function showResults() {
  hideAllSections();
  quizResults.style.display = "block";

  const percentage = Math.round((score / quizData.length) * 100);

  // Update score display
  if (finalScoreElement) {
    finalScoreElement.textContent = score;
  }

  if (scorePercentageElement) {
    scorePercentageElement.textContent = percentage + "%";
  }

  // Update results based on performance
  updateResultsDisplay(percentage);

  // Animate score
  animateScore();
}

function updateResultsDisplay(percentage) {
  let icon, title, message;

  if (percentage >= 80) {
    icon = "🎉";
    title = "Luar Biasa!";
    message =
      "Performa yang sangat baik! Anda memiliki pemahaman yang bagus tentang kosakata Bahasa Mandarin.";
  } else if (percentage >= 60) {
    icon = "👏";
    title = "Bagus!";
    message =
      "Kerja bagus! Terus berlatih untuk meningkatkan kemampuan kosakata Bahasa Mandarin Anda.";
  } else if (percentage >= 40) {
    icon = "📚";
    title = "Terus Belajar!";
    message =
      "Anda sudah membuat kemajuan! Tinjau kembali kosakata dan coba lagi.";
  } else {
    icon = "💪";
    title = "Terus Berusaha!";
    message =
      "Jangan menyerah! Latihan membuat sempurna. Tinjau kosakata dan ambil kuis lagi.";
  }

  if (resultsIcon) resultsIcon.textContent = icon;
  if (resultsTitle) resultsTitle.textContent = title;
  if (resultsMessage) resultsMessage.textContent = message;
}

function animateScore() {
  const scoreElement = document.querySelector(".score-number");
  if (!scoreElement) return;

  let currentScore = 0;
  const targetScore = score;
  const duration = 1500;
  const steps = 30;
  const increment = targetScore / steps;

  const timer = setInterval(() => {
    currentScore += increment;
    if (currentScore >= targetScore) {
      scoreElement.textContent = targetScore;
      clearInterval(timer);
    } else {
      scoreElement.textContent = Math.floor(currentScore);
    }
  }, duration / steps);
}

function resetQuiz() {
  // Reset all state
  currentQuestionIndex = 0;
  score = 0;
  selectedAnswer = null;
  quizStarted = false;
  quizData = [];

  // Show start screen
  hideAllSections();
  quizStart.style.display = "block";

  // Reset progress
  if (progressFill) {
    progressFill.style.width = "0%";
  }
}

function hideAllSections() {
  const sections = [
    quizStart,
    quizProgress,
    quizContainer,
    quizResults,
    quizLoading,
  ];
  sections.forEach((section) => {
    if (section) {
      section.style.display = "none";
    }
  });
}

function showLoading() {
  hideAllSections();
  if (quizLoading) {
    quizLoading.style.display = "block";
  }
}

function hideLoading() {
  if (quizLoading) {
    quizLoading.style.display = "none";
  }
}

// Keyboard shortcuts
document.addEventListener("keydown", function (e) {
  if (!quizStarted) return;

  // Number keys for selecting options
  if (e.key >= "1" && e.key <= "4") {
    const optionIndex = parseInt(e.key) - 1;
    const optionButtons = optionsContainer.querySelectorAll(".option-btn");
    if (optionButtons[optionIndex] && selectedAnswer === null) {
      optionButtons[optionIndex].click();
    }
  }

  // Space or Enter to pronounce
  if (e.key === " " || e.key === "Enter") {
    e.preventDefault();
    if (quizData[currentQuestionIndex]) {
      ChineseLearningApp.speakChinese(quizData[currentQuestionIndex].chinese);
    }
  }
});

// Export functions for external use
window.QuizPage = {
  startQuiz,
  resetQuiz,
  showQuestion,
  nextQuestion,
};
