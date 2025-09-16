import React from "react";

import Quiz from "@/components/ui/quizPage/Quiz";
import quizData from "@/pages/data.json";

const QuizPage = ({ qType, type, quizNumber, quiz }) => {
  return (
      <Quiz qType={qType} type={type} quizNumber={quizNumber} quiz={quiz} />
  );
};

export default QuizPage;

export async function getStaticPaths() {
  const qTypes = ["nTeoria", "cTeoria", "oral", "training"];
  const paths = [];

  qTypes.forEach((qType) => {
    const types = Object.keys(quizData[qType] || {});
    types.forEach((type) => {
      const quizNumbers = Object.keys(quizData[qType][type] || {});
      quizNumbers.forEach((quizNumber) => {
        paths.push({
          params: { qType, type, quizNumber },
        });
      });
    });
  });

  return {
    paths,
    fallback: false, // All paths are generated at build time.
  };
}

export async function getStaticProps({ params }) {
  const { qType, type, quizNumber } = params;
  const quizDataByQType = quizData[qType];
  if (!quizDataByQType) {
    return { notFound: true };
  }
  const quizDataByType = quizDataByQType[type];
  if (!quizDataByType) {
    return { notFound: true };
  }
  const quiz = quizDataByType[quizNumber];
  if (!quiz || quiz.length === 0) {
    return { notFound: true };
  }

  return {
    props: {
      qType,
      type,
      quizNumber,
      quiz,
    },
  };
}
