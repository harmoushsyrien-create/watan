import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/router";

import {
  Container,
  Box,
  Typography,
  CircularProgress,
  Button,
  Snackbar,
  IconButton,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import SectionHero from "@/components/layout/SectionHero";
import quizData from "@/pages/data.json";
import QuestionComponent from "@/components/ui/quizPage/Question";
import {
  loadTypeWrongAnswers,
  recordWrongAnswerTypeLevel,
  removeWrongAnswerTypeLevel,
} from "@/components/util/quizStorage";
import DeleteIcon from "@mui/icons-material/Delete";

const mapTypes = {
  private: "خصوصي",
  light: "شحن خفيف",
  heavy: "شحن ثقيل",
  taxi: "عمومي",
  motorcycle: "دراجة نارية",
  tractor: "تراكتور",
};

export default function WrongAnswersPage() {
  const router = useRouter();
  const { qType, type } = router.query;

  // All hooks declared unconditionally.
  const [loading, setLoading] = useState(true);
  const [flattenedWrongData, setFlattenedWrongData] = useState([]);
  const batchSize = 5;
  const [visibleCount, setVisibleCount] = useState(batchSize);
  const [showAnswersMap, setShowAnswersMap] = useState({});
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");

  // Load wrong answer counts from storage.
  useEffect(() => {
    if (!router.isReady || !qType || !type) return;
    async function fetchWrongAnswers() {
      try {
        const wrongObj = await loadTypeWrongAnswers(qType, type);
        const flattened = [];
        Object.entries(wrongObj).forEach(([quizNumber, qObj]) => {
          if (qObj && typeof qObj === "object") {
            Object.entries(qObj).forEach(([questionIndex, count]) => {
              const questionData =
                quizData[qType]?.[type]?.[quizNumber]?.[questionIndex];
              if (questionData) {
                flattened.push({
                  quizNumber,
                  questionIndex: parseInt(questionIndex, 10),
                  wrongCount: count,
                  questionData,
                });
              }
            });
          }
        });
        // Sort by quizNumber (numeric) then questionIndex.
        flattened.sort((a, b) => {
          const qA = parseInt(a.quizNumber, 10);
          const qB = parseInt(b.quizNumber, 10);
          if (qA !== qB) return qA - qB;
          return a.questionIndex - b.questionIndex;
        });
        setFlattenedWrongData(flattened);
      } catch (error) {
        console.error("Error loading wrong answers from storage:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchWrongAnswers();
  }, [router.isReady, qType, type]);

  // Window scroll listener to load more items when nearing the bottom.
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 10000 &&
        visibleCount < flattenedWrongData.length
      ) {
        setVisibleCount((prev) =>
          Math.min(prev + batchSize, flattenedWrongData.length)
        );
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [flattenedWrongData.length, visibleCount]);

  // Handlers:
  const handleShowAnswer = useCallback(
    async (itemKey, quizNumber, questionIndex) => {
      setShowAnswersMap((prev) => ({ ...prev, [itemKey]: true }));
      try {
        await recordWrongAnswerTypeLevel(
          qType,
          type,
          quizNumber,
          questionIndex
        );
        setFlattenedWrongData((prev) =>
          prev.map((item) =>
            item.quizNumber === quizNumber &&
            item.questionIndex === questionIndex
              ? { ...item, wrongCount: item.wrongCount + 1 }
              : item
          )
        );
      } catch (err) {
        console.error("Error recording wrong answer:", err);
      }
    },
    [qType, type]
  );

  const handleSelectOption = useCallback((key, option) => {
    setSelectedAnswers((prev) => ({ ...prev, [key]: option }));
  }, []);

  const handleDelete = useCallback(
    async (itemKey) => {
      const [quizNumber, questionIndexStr] = itemKey.split("-");
      const questionIndex = parseInt(questionIndexStr, 10);
      try {
        await removeWrongAnswerTypeLevel(
          qType,
          type,
          quizNumber,
          questionIndex
        );
        setFlattenedWrongData((prev) =>
          prev.filter(
            (item) => `${item.quizNumber}-${item.questionIndex}` !== itemKey
          )
        );
        setSnackMessage("تم حذف السؤال من قائمة الأخطاء");
        setSnackbarOpen(true);
      } catch (error) {
        console.error("Error deleting wrong answer from storage:", error);
      }
    },
    [qType, type]
  );

  const handleCloseSnackbar = useCallback(() => setSnackbarOpen(false), []);

  const visibleItems = useMemo(
    () => flattenedWrongData.slice(0, visibleCount),
    [flattenedWrongData, visibleCount]
  );

  if (!router.isReady || loading) {
    return (
      <>
        <SectionHero title="تحميل..." subTitle="" />
        <Container sx={{ py: "30px", overflow: "hidden" }}>
          <Box sx={{ textAlign: "center", mt: 4 }}>
            <CircularProgress />
          </Box>
        </Container>
      </>
    );
  }

  if (!quizData[qType]) {
    return (
      <Container sx={{ textAlign: "center", py: 4 }}>
        <Typography variant="h4">
          404 - لا يوجد قسم بهذا الاسم في البيانات
        </Typography>
        <Typography>
          qType: <strong>{qType}</strong> غير موجود.
        </Typography>
      </Container>
    );
  }

  if (!quizData[qType][type]) {
    return (
      <Container sx={{ textAlign: "center", py: 4 }}>
        <Typography variant="h4">404 - الصفحة غير موجودة</Typography>
        <Typography>
          type: <strong>{type}</strong> غير موجود.
        </Typography>
      </Container>
    );
  }

  return (
    <>
      <SectionHero title={`الأسئلة الخاطئة - ${mapTypes[type] || ""}`} />
      <Container sx={{ py: "30px" }} maxWidth="md">
        {flattenedWrongData.length === 0 ? (
          <Box sx={{ textAlign: "center", mt: 4 }}>
            <Typography variant="h6">لا توجد أسئلة خاطئة بعد.</Typography>
          </Box>
        ) : (
          <AnimatePresence mode="popLayout">
            {visibleItems.map(
              ({ quizNumber, questionIndex, wrongCount, questionData }) => {
                const itemKey = `${quizNumber}-${questionIndex}`;
                return (
                  <motion.div
                    key={itemKey}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20, scale: 0.8 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                  >
                    <Box sx={{ mb: 15, p: 1, borderBottom: "2px solid #ccc" }}>
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Typography
                          variant="subtitle1"
                          sx={{ mb: 1, fontSize: 17, fontWeight: 600 }}
                        >
                          عدد مرات الخطأ: {wrongCount}
                        </Typography>
                        <IconButton
                          aria-label="حذف السؤال"
                          color="error"
                          onClick={() => handleDelete(itemKey)}
                        >
                          <DeleteIcon fontSize="inherit" />
                        </IconButton>
                      </Box>
                      <QuestionComponent
                        question={questionData.question}
                        options={questionData}
                        correctAnswer={questionData.answer}
                        userAnswer={selectedAnswers[itemKey]}
                        showAnswer={!!showAnswersMap[itemKey]}
                        onSelect={(option) =>
                          handleSelectOption(itemKey, option)
                        }
                        questionNumber={questionIndex + 1}
                        qType={qType}
                        type={type}
                        quizNumber={quizNumber}
                        questionIndex={questionIndex}
                      />
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          mt: 2,
                        }}
                      >
                        <Button
                          variant="contained"
                          color="secondary"
                          sx={{
                            fontWeight: "700",
                            bgcolor: "#87CEEB",
                            color: "white",
                            "&:hover": { bgcolor: "#5ebbe0" },
                          }}
                          onClick={() =>
                            handleShowAnswer(itemKey, quizNumber, questionIndex)
                          }
                          disabled={!!showAnswersMap[itemKey]}
                        >
                          التحقق من الإجابة
                        </Button>
                      </Box>
                    </Box>
                  </motion.div>
                );
              }
            )}
          </AnimatePresence>
        )}
      </Container>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        message={snackMessage}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </>
  );
}

export async function getStaticPaths() {
  const qTypes = ["nTeoria", "cTeoria", "oral", "training"];
  const paths = [];
  qTypes.forEach((thisQType) => {
    const subTypes = Object.keys(quizData[thisQType] || {});
    subTypes.forEach((theType) => {
      paths.push({ params: { qType: thisQType, type: theType } });
    });
  });
  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps() {
  return { props: {} };
}
