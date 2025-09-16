import { useState, useEffect } from "react";
import Image from "next/image";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import { styled } from "@mui/material/styles";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import InfoIcon from "@mui/icons-material/Info";
import SearchIcon from "@mui/icons-material/Search";
import SchoolIcon from "@mui/icons-material/School";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import GradeIcon from "@mui/icons-material/Grade";
import QuizIcon from "@mui/icons-material/Quiz";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";

// Styled Components
const HeaderSection = styled(Box)(({ theme }) => ({
  textAlign: "center",
  padding: theme.spacing(4, 0),
  borderRadius: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[2],
  marginBottom: theme.spacing(4),
}));

const SearchSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[3],
  marginBottom: theme.spacing(3),
}));

const SuccessResultCard = styled(Card)(({ theme, success }) => ({
  borderRadius: theme.spacing(3),
  boxShadow: theme.shadows[4],
  border: success
    ? `3px solid ${theme.palette.success.main}`
    : `3px solid ${theme.palette.error.main}`,
  backgroundColor: success
    ? theme.palette.success.light
    : theme.palette.error.light,
  color: success
    ? theme.palette.success.contrastText
    : theme.palette.error.contrastText,
}));

const InfoCard = styled(Card)(({ theme }) => ({
  height: "100%",
  borderRadius: theme.spacing(2),
  transition: "all 0.2s ease",
  "&:hover": {
    boxShadow: theme.shadows[3],
  },
}));

const StyledChip = styled(Chip)(({ theme, success }) => ({
  fontSize: "1.1rem",
  fontWeight: 600,
  padding: theme.spacing(1, 2),
  backgroundColor: success
    ? theme.palette.success.main
    : theme.palette.error.main,
  color: success
    ? theme.palette.success.contrastText
    : theme.palette.error.contrastText,
}));

export default function TheoreticalExamPage() {
  const [id, setId] = useState("");
  const [examResult, setExamResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [animatedScore, setAnimatedScore] = useState(0);
  const [scoreBounced, setScoreBounced] = useState(false);

  const handleSearch = async () => {
    setError("");
    setExamResult(null);
    setLoading(true);

    try {
      const response = await fetch("/api/mot/theoretical", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "فشل في جلب النتائج");
      }

      if (!result.found) {
        setExamResult({});
      } else {
        setExamResult(result.data);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "حدث خطأ أثناء جلب نتيجة الامتحان.");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (
      examResult &&
      examResult.name &&
      !isNaN(Number(examResult.examResult))
    ) {
      const end = parseInt(examResult.examResult, 10) || 0;
      setAnimatedScore(0);
      setScoreBounced(false);
      if (end === 0) return;

      const duration = 1200;
      let startTime = null;

      const animateScore = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const currentScore = Math.floor(progress * end);

        setAnimatedScore(currentScore);

        if (progress < 1) {
          requestAnimationFrame(animateScore);
        } else {
          setAnimatedScore(end);
          setScoreBounced(true);
        }
      };

      requestAnimationFrame(animateScore);
    } else {
      setAnimatedScore(0);
      setScoreBounced(false);
    }
  }, [examResult]);

  const isSuccess = examResult && examResult.passed;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4, direction: "rtl" }}>
      {/* Header */}
      <HeaderSection>
        <Image
          src="/images/logo.png"
          alt="الشعار"
          width={120}
          height={120}
          priority
        />
        <Typography
          variant="h3"
          component="h1"
          sx={{ mt: 3, fontWeight: 700, color: "primary.main" }}
        >
          مدرسة الوطن
        </Typography>
        <Typography
          variant="h5"
          sx={{ mt: 1, color: "text.secondary", fontWeight: 500 }}
        >
          نتيجة الامتحان النظري (تؤوريا)
        </Typography>
      </HeaderSection>

      {/* Search */}
      <SearchSection elevation={3}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <SearchIcon sx={{ color: "primary.main", mr: 1 }} />
          <Typography variant="h6" color="primary.main" fontWeight={600}>
            البحث عن النتيجة
          </Typography>
        </Box>
        <TextField
          label="أدخل رقم الهوية"
          variant="outlined"
          fullWidth
          value={id}
          onChange={(e) => setId(e.target.value)}
          sx={{ mb: 3 }}
          placeholder="مثال: 123456789"
          InputProps={{
            sx: { borderRadius: 2 },
          }}
        />
        <Button
          variant="contained"
          fullWidth
          onClick={handleSearch}
          disabled={loading || !id.trim()}
          startIcon={loading ? null : <SchoolIcon />}
          sx={{ py: 1.5, fontSize: "1.1rem", fontWeight: 600, borderRadius: 2, gap: 1 }}
        >
          {loading ? "جارٍ البحث..." : "بحث عن النتيجة"}
        </Button>
      </SearchSection>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Results */}
      {examResult && examResult.name ? (
        <Box>
          <SuccessResultCard success={isSuccess} sx={{ mb: 3 }}>
            <CardContent sx={{ textAlign: "center", py: 4 }}>
              {isSuccess ? (
                <CheckCircleIcon
                  sx={{ fontSize: 60, mb: 2, color: "success.dark" }}
                />
              ) : (
                <CancelIcon sx={{ fontSize: 60, mb: 2, color: "error.dark" }} />
              )}
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                {isSuccess
                  ? "ممتاز! لقد نجحت في التؤوريا"
                  : "نتيجة الامتحان النظري"}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  mb: 1,
                }}
              >
                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: 900,
                    color: isSuccess ? "success.dark" : "error.dark",
                    lineHeight: 1,
                    transition:
                      "transform 0.3s cubic-bezier(.68,-0.55,.27,1.55), opacity 0.5s ease",
                    transform: scoreBounced ? "scale(1.2)" : "scale(1)",
                    opacity: scoreBounced ? 1 : 0.7,
                  }}
                >
                  {animatedScore}
                </Typography>
                <Box
                  sx={{
                    width: 48,
                    borderBottom: "3px solid",
                    borderColor: isSuccess ? "success.dark" : "error.dark",
                    my: 0.5,
                  }}
                />
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 900,
                    color: isSuccess ? "success.dark" : "error.dark",
                    lineHeight: 1,
                  }}
                >
                  {examResult.maxResult}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ mt: 1, fontWeight: 600, color: "text.secondary" }}
                >
                  الدرجة
                </Typography>
              </Box>
              <StyledChip
                success={isSuccess}
                label={examResult.finalResult}
                icon={isSuccess ? <CheckCircleIcon /> : <CancelIcon />}
              />
              <Typography variant="body1" sx={{ mt: 2, opacity: 0.8 }}>
                تاريخ الاستعلام: {new Date().toLocaleDateString("ar-EG")}
              </Typography>
            </CardContent>
          </SuccessResultCard>

          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
            <Typography
              variant="h6"
              sx={{ mb: 3, fontWeight: 600, color: "primary.main" }}
            >
              تفاصيل النتيجة
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <InfoCard>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <InfoIcon sx={{ color: "primary.main", mr: 1 }} />
                      <Typography
                        variant="subtitle1"
                        color="text.secondary"
                        fontWeight={600}
                      >
                        الاسم
                      </Typography>
                    </Box>
                    <Typography variant="h6" fontWeight={600}>
                      {examResult.name}
                    </Typography>
                  </CardContent>
                </InfoCard>
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoCard>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <CalendarTodayIcon
                        sx={{ color: "primary.main", mr: 1 }}
                      />
                      <Typography
                        variant="subtitle1"
                        color="text.secondary"
                        fontWeight={600}
                      >
                        تاريخ الامتحان
                      </Typography>
                    </Box>
                    <Typography variant="h6" fontWeight={600}>
                      {examResult.examDate}
                    </Typography>
                  </CardContent>
                </InfoCard>
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoCard>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <AssignmentTurnedInIcon
                        sx={{ color: "primary.main", mr: 1 }}
                      />
                      <Typography
                        variant="subtitle1"
                        color="text.secondary"
                        fontWeight={600}
                      >
                        درجة الرخصة
                      </Typography>
                    </Box>
                    <Typography variant="h6" fontWeight={600}>
                      {examResult.licenseDegree}
                    </Typography>
                  </CardContent>
                </InfoCard>
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoCard>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <QuizIcon sx={{ color: "primary.main", mr: 1 }} />
                      <Typography
                        variant="subtitle1"
                        color="text.secondary"
                        fontWeight={600}
                      >
                        عدد الأسئلة
                      </Typography>
                    </Box>
                    <Typography variant="h6" fontWeight={600}>
                      {examResult.questions}
                    </Typography>
                  </CardContent>
                </InfoCard>
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoCard>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <InfoIcon sx={{ color: "primary.main", mr: 1 }} />
                      <Typography
                        variant="subtitle1"
                        color="text.secondary"
                        fontWeight={600}
                      >
                        بحاجة إلى فاحص؟
                      </Typography>
                    </Box>
                    <Typography variant="h6" fontWeight={600}>
                      {examResult.needTester}
                    </Typography>
                  </CardContent>
                </InfoCard>
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoCard>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <GradeIcon sx={{ color: "primary.main", mr: 1 }} />
                      <Typography
                        variant="subtitle1"
                        color="text.secondary"
                        fontWeight={600}
                      >
                        النتيجة النهائية
                      </Typography>
                    </Box>
                    <Typography variant="h6" fontWeight={600}>
                      {examResult.finalResult}
                    </Typography>
                  </CardContent>
                </InfoCard>
              </Grid>
            </Grid>
            {isSuccess && (
              <Alert
                severity="success"
                sx={{ mt: 3, borderRadius: 2 }}
                icon={<CheckCircleIcon />}
              >
                <Typography fontWeight={600}>
                  تهانينا! لقد نجحت في الامتحان النظري. يمكنك الآن الاستعداد
                  للامتحان العملي.
                </Typography>
              </Alert>
            )}
          </Paper>
        </Box>
      ) : examResult && Object.keys(examResult).length === 0 ? (
        <Alert
          severity="warning"
          sx={{ borderRadius: 2, textAlign: "center", py: 3 }}
        >
          <Typography variant="h6" fontWeight={600}>
            لم يتم العثور على نتيجة للهوية المدخلة
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            يرجى التأكد من صحة رقم الهوية والمحاولة مرة أخرى
          </Typography>
        </Alert>
      ) : (
        <Paper
          sx={{
            p: 4,
            textAlign: "center",
            borderRadius: 2,
            bgcolor: "grey.50",
          }}
        >
          <SchoolIcon
            sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
          />
          <Typography variant="body1" color="text.secondary">
            أدخل رقم الهوية أعلاه واضغط "بحث" لعرض النتيجة
          </Typography>
        </Paper>
      )}
    </Container>
  );
}