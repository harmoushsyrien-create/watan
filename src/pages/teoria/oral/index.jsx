import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  useTheme,
  alpha,
} from "@mui/material";
import { ArrowBack, VolumeUp, VolumeOff } from "@mui/icons-material";
import { useRouter } from "next/router";
import SectionTitle from "@/components/ui/SectionTitle";

export default function OralQuestionsPage() {
  const theme = useTheme();
  const router = useRouter();
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Placeholder for oral questions - you can add your questions here later
  useEffect(() => {
    // TODO: Load oral questions from your data source
    setQuestions([
      {
        id: 1,
        question: "ما هي السرعة القصوى المسموحة في المناطق السكنية؟",
        answer: "50 كم/ساعة",
        audioUrl: null, // Add audio URL when available
      },
      {
        id: 2,
        question: "متى يجب استخدام إشارات الانعطاف؟",
        answer: "قبل 30 متر من الانعطاف",
        audioUrl: null, // Add audio URL when available
      },
      // Add more questions here
    ]);
  }, []);

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const toggleAudio = () => {
    setIsPlaying(!isPlaying);
    // TODO: Implement audio playback
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <Container maxWidth="lg" sx={{ py: 4, direction: "rtl" }}>
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.back()}
          sx={{
            mb: 3,
            color: theme.palette.primary.main,
            "&:hover": {
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
            },
          }}
        >
          العودة
        </Button>
        
        <SectionTitle
          title="أسئلة التؤوريا الشفوية"
          subTitle="تدرب على الأسئلة الشفوية لاختبار الرخصة"
        />
      </Box>

      {questions.length > 0 ? (
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.1)}`,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: theme.palette.primary.main,
                      fontWeight: 600,
                      mb: 1,
                    }}
                  >
                    السؤال {currentQuestionIndex + 1} من {questions.length}
                  </Typography>
                  
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      lineHeight: 1.6,
                      mb: 3,
                      color: theme.palette.text.primary,
                    }}
                  >
                    {currentQuestion?.question}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    p: 3,
                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: theme.palette.primary.dark,
                      mb: 2,
                    }}
                  >
                    الإجابة:
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: "1.1rem",
                      lineHeight: 1.6,
                      color: theme.palette.text.primary,
                    }}
                  >
                    {currentQuestion?.answer}
                  </Typography>
                </Box>

                {currentQuestion?.audioUrl && (
                  <Box sx={{ mt: 3, textAlign: "center" }}>
                    <Button
                      variant="outlined"
                      startIcon={isPlaying ? <VolumeOff /> : <VolumeUp />}
                      onClick={toggleAudio}
                      sx={{
                        borderColor: theme.palette.primary.main,
                        color: theme.palette.primary.main,
                        "&:hover": {
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        },
                      }}
                    >
                      {isPlaying ? "إيقاف الصوت" : "تشغيل الصوت"}
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.1)}`,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                height: "fit-content",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    mb: 3,
                    color: theme.palette.primary.main,
                  }}
                >
                  التنقل
                </Typography>

                <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                  <Button
                    variant="outlined"
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    sx={{
                      flex: 1,
                      borderColor: theme.palette.primary.main,
                      color: theme.palette.primary.main,
                      "&:hover": {
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      },
                    }}
                  >
                    السابق
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleNextQuestion}
                    disabled={currentQuestionIndex === questions.length - 1}
                    sx={{
                      flex: 1,
                      backgroundColor: theme.palette.primary.main,
                      "&:hover": {
                        backgroundColor: theme.palette.primary.dark,
                      },
                    }}
                  >
                    التالي
                  </Button>
                </Box>

                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.text.secondary,
                    textAlign: "center",
                    fontStyle: "italic",
                  }}
                >
                  يمكنك إضافة المزيد من الأسئلة لاحقاً
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : (
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.1)}`,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            textAlign: "center",
            p: 6,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              color: theme.palette.text.secondary,
              mb: 2,
            }}
          >
            لا توجد أسئلة متاحة حالياً
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: theme.palette.text.secondary,
            }}
          >
            سيتم إضافة الأسئلة الشفوية قريباً
          </Typography>
        </Card>
      )}
    </Container>
  );
}
