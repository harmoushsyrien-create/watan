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
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import SchoolIcon from "@mui/icons-material/School";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

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

export default function PracticalExamPage() {
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
      const apiUrl = "https://mot-palestine-api.onrender.com/api/mot/practical";
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ searchId: id }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status !== "success") {
        throw new Error(result.message || "فشل في جلب النتائج");
      }

      if (!result.found || !result.data) {
        setExamResult({});
      } else {
        setExamResult({
          name: result.data.name || "",
          examDate: result.data.examDate || "",
          licenseDegree: result.data.licensedegree || "",
          examResult: result.data.result || "",
          schoolName: result.data.schoolName || "",
          passed: result.data.passed || false,
        });
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "حدث خطأ أثناء جلب نتيجة الامتحان.");
    }
    setLoading(false);
  };

  const isSuccess = examResult && examResult.passed;

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

      const linear = (t) => t;

      const animateScore = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const linearProgress = linear(progress);
        const currentScore = Math.floor(linearProgress * end);

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
          نتيجة الامتحان العملي (التست)
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
          startIcon={loading ? null : <DirectionsCarIcon />}
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
                {isSuccess ? "مبروك! لقد نجحت" : "نتيجة الامتحان"}
              </Typography>

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
                      <DirectionsCarIcon
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
                      <SchoolIcon sx={{ color: "primary.main", mr: 1 }} />
                      <Typography
                        variant="subtitle1"
                        color="text.secondary"
                        fontWeight={600}
                      >
                        اسم المدرسة
                      </Typography>
                    </Box>
                    <Typography variant="h6" fontWeight={600}>
                      {examResult.schoolName}
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
                  تهانينا! أنت الآن مؤهل للحصول على رخصة القيادة
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
          <DirectionsCarIcon
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