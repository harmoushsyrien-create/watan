import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";

import { Container, Typography, CircularProgress } from "@mui/material";
import Quiz from "@/components/ui/quizPage/Quiz"; // Reusing the extracted component
import quizData from "@/pages/data.json";

const RandomQuizPage = () => {
  const router = useRouter();
  const { qType, type } = router.query;
  const [randomQuiz, setRandomQuiz] = useState(null);
  useEffect(() => {
    if (!router.isReady || !qType || !type) return;

    if (!quizData[qType] || !quizData[qType][type]) {
      return;
    }

    const quizzesByNumber = quizData[qType][type];
    let allQuestions = [];
    // Attach original quiz number and question index to each question
    Object.entries(quizzesByNumber).forEach(([quizNumber, quizArray]) => {
      quizArray.forEach((question, index) => {
        allQuestions.push({
          ...question,
          _originalQuizNumber: quizNumber,
          _originalQuestionIndex: index,
        });
      });
    });
    // Shuffle using Fisher-Yates shuffle
    for (let i = allQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]];
    }
    // Select the first 30 questions (or all if there are less than 30)
    const selectedQuestions = allQuestions.slice(0, 30);
    setRandomQuiz(selectedQuestions);
  }, [router.isReady, qType, type]);

  if (!router.isReady || !randomQuiz) {
    return (
        <Container sx={{ textAlign: "center", py: 4 }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>
            جاري إنشاء الامتحان ...
          </Typography>
        </Container>
    );
  }

  return (
      <Quiz qType={qType} type={type} quizNumber="random" quiz={randomQuiz} />
  );
};

export default RandomQuizPage;
