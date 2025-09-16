import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { useRouter } from "next/router";

import {
  Container,
  Grid,
  Box,
  Skeleton,
  CircularProgress,
  Typography,
  Button,
  Snackbar,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import SectionHero from "@/components/layout/SectionHero";
import quizData from "@/pages/data.json";
import QuestionComponent from "@/components/ui/quizPage/Question";
import { loadTypeBookmarks } from "@/components/util/quizStorage";

const mapTypes = {
  private: "خصوصي",
  light: "شحن خفيف",
  heavy: "شحن ثقيل",
  taxi: "عمومي",
  motorcycle: "دراجة نارية",
  tractor: "تراكتور",
};

export default function SavedQuestionsPage() {
  const router = useRouter();
  const { qType, type } = router.query;

  const [loading, setLoading] = useState(true);
  const [savedData, setSavedData] = useState({});
  const [flattenedBookmarks, setFlattenedBookmarks] = useState([]);
  const [visibleCount, setVisibleCount] = useState(3);
  const loaderRef = useRef(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [showAnswers, setShowAnswers] = useState({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");

  useEffect(() => {
    if (!router.isReady || !qType || !type) return;
    async function fetchBookmarks() {
      try {
        const bookmarksObj = await loadTypeBookmarks(qType, type);
        setSavedData(bookmarksObj);
      } catch (err) {
        console.error("Error loading bookmarks from storage:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchBookmarks();
  }, [router.isReady, qType, type]);

  useEffect(() => {
    const flattened = [];
    Object.entries(savedData).forEach(([quizNumber, indices]) => {
      if (Array.isArray(indices)) {
        indices.forEach((questionIndex) => {
          flattened.push({ quizNumber, questionIndex });
        });
      }
    });
    flattened.sort((a, b) => {
      const qA = parseInt(a.quizNumber, 10);
      const qB = parseInt(b.quizNumber, 10);
      if (qA !== qB) return qA - qB;
      return a.questionIndex - b.questionIndex;
    });
    setFlattenedBookmarks(flattened);
  }, [savedData]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          visibleCount < flattenedBookmarks.length
        ) {
          setVisibleCount((prev) =>
            Math.min(prev + 3, flattenedBookmarks.length)
          );
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [flattenedBookmarks, visibleCount]);

  const visibleBookmarks = useMemo(
    () => flattenedBookmarks.slice(0, visibleCount),
    [flattenedBookmarks, visibleCount]
  );

  const handleBookmarkToggle = useCallback(
    (quizNumber, questionIndex, nowBookmarked) => {
      if (!nowBookmarked) {
        setSavedData((prev) => {
          const newData = { ...prev };
          if (newData[quizNumber]) {
            newData[quizNumber] = newData[quizNumber].filter(
              (idx) => idx !== questionIndex
            );
            if (newData[quizNumber].length === 0) {
              delete newData[quizNumber];
            }
          }
          return newData;
        });
        setSnackbarOpen(true);
        setSnackMessage("تم إزالة السؤال من القائمة المحفوظة");
      }
    },
    []
  );

  const handleSelect = useCallback((itemKey, option) => {
    setUserAnswers((prev) => ({ ...prev, [itemKey]: option }));
  }, []);

  const handleShowAnswer = useCallback((itemKey) => {
    setShowAnswers((prev) => ({ ...prev, [itemKey]: true }));
  }, []);

  const handleCloseSnackbar = useCallback(() => setSnackbarOpen(false), []);

  if (!router.isReady || loading) {
    return (
      <>
        <SectionHero title="تحميل..." subTitle="" />
        <Container sx={{ py: 3 }} maxWidth="md">
          <Box display="flex" justifyContent="center" mb={4} gap={1.4}>
            {[1, 2].map((i) => (
              <Skeleton
                key={i}
                variant="rounded"
                width={200}
                height={120}
                sx={{ borderRadius: 2 }}
              />
            ))}
          </Box>
          <Grid container spacing={3} justifyContent="center">
            {[1, 2, 3, 4].map((i) => (
              <Grid item key={i} xs={12} sm={6} md={4} lg={3}>
                <Skeleton variant="rectangular" width="100%" height={150} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </>
    );
  }

  if (flattenedBookmarks.length === 0) {
    return (
        <Container sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="h6">لا توجد أسئلة محفوظة بعد.</Typography>
        </Container>
    );
  }

  return (
    <>
      <SectionHero
        title={`الأسئلة المحفوظة - ${mapTypes[type] || type}`}
        subTitle=""
      />
      <Container sx={{ py: 3 }}>
        <AnimatePresence mode="popLayout">
          {visibleBookmarks.map(({ quizNumber, questionIndex }) => {
            const itemKey = `${quizNumber}-${questionIndex}`;
            const questionData =
              quizData[qType]?.[type]?.[quizNumber]?.[questionIndex];
            if (!questionData) return null;
            return (
              <motion.div
                key={itemKey}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                layout
              >
                <Box sx={{ mb: 3, p: 1, borderBottom: "2px solid #ccc" }}>
                  <QuestionComponent
                    question={questionData.question}
                    options={questionData}
                    correctAnswer={questionData.answer}
                    userAnswer={userAnswers[itemKey] || null}
                    showAnswer={!!showAnswers[itemKey]}
                    onSelect={(option) => handleSelect(itemKey, option)}
                    onBookmarkToggle={handleBookmarkToggle}
                    questionNumber={questionIndex + 1}
                    qType={qType}
                    type={type}
                    quizNumber={quizNumber}
                    questionIndex={questionIndex}
                  />
                  <Box
                    sx={{ display: "flex", justifyContent: "center", mt: 2 }}
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
                      onClick={() => handleShowAnswer(itemKey)}
                      disabled={!!showAnswers[itemKey]}
                    >
                      التحقق من الإجابة
                    </Button>
                  </Box>
                </Box>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {visibleCount < flattenedBookmarks.length && (
          <Box
            ref={loaderRef}
            sx={{ display: "flex", justifyContent: "center", py: 2 }}
          >
            <CircularProgress size={24} thickness={4} />
          </Box>
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

// Static Generation for SavedQuestionsPage
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

export async function getStaticProps(context) {
  return { props: {} };
}
