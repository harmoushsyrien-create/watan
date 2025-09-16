import React from "react";

import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  createTheme,
  ThemeProvider,
  CssBaseline,
  Container,
  styled,
  Box,
  alpha,
} from "@mui/material";
import {
  ExpandMore,
  MedicalInformation,
  DriveEta,
  Description,
  AssignmentInd,
} from "@mui/icons-material";

const theme = createTheme({
  direction: "rtl",
  typography: {
    fontFamily: "cairo",
    h4: {
      fontWeight: 700,
      color: "#241a00",
    },
    h6: {
      fontWeight: 600,
      color: "#241a00",
    },
  },
  palette: {
    primary: {
      main: "#36a336",
    },
    secondary: {
      main: "#27ae60",
    },
  },
});

const StyledAccordion = styled(Accordion)(({ theme }) => ({
  margin: "16px 0",
  borderRadius: "8px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  "&:before": {
    display: "none",
  },
  "&.Mui-expanded": {
    margin: "16px 0",
  },
}));

const ProcessStep = ({ title, icon, children }) => (
  <StyledAccordion>
    <AccordionSummary
      expandIcon={<ExpandMore sx={{ color: "primary.main" }} />}
      sx={{
        backgroundColor: "#f8f9fa",
        borderRadius: "8px",
        "&:hover": {
          backgroundColor: "#f1f2f6",
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        {icon}
        <Typography variant="h6">{title}</Typography>
      </Box>
    </AccordionSummary>
    <AccordionDetails
      sx={{ backgroundColor: "#fff", borderRadius: "0 0 8px 8px" }}
    >
      {children}
    </AccordionDetails>
  </StyledAccordion>
);

const LicenseProcess = () => {

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="sm" sx={{ padding: 6 }}>
        <Box textAlign="center" mb={6}>
          <Typography variant="h4" gutterBottom sx={{ position: "relative" }}>
            <Box
              component="span"
              sx={{
                position: "absolute",
                bottom: -8,
                left: "50%",
                transform: "translateX(-50%)",
                width: 200,
                height: 4,
                backgroundColor: "primary.main",
                borderRadius: 2,
              }}
            />
            إجراءات الحصول على رخصة القيادة
          </Typography>
        </Box>

        <ProcessStep
          title="1) الفحص الطبي"
          icon={<MedicalInformation color="primary" sx={{ fontSize: 28 }} />}
        >
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            دائرة الصحة
          </Typography>
          <List dense sx={{ py: 0 }}>
            {[
              "الخطوة الأولى بعد عمل المعاملة في مديرية السياقة",
              "مواعيد الفحص: الأحد، الثلاثاء والأربعاء",
              "من الساعة 08:00 صباحاً إلى 10:30 صباحاً",
              "يُمنع تناول الطعام قبل الفحص ",
            ].map((text, index) => (
              <ListItem key={index} sx={{ py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      backgroundColor: "primary.main",
                      borderRadius: "50%",
                    }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={text}
                  primaryTypographyProps={{
                    variant: "body1",
                    textAlign: "right",
                  }}
                />
              </ListItem>
            ))}
          </List>
        </ProcessStep>

        <ProcessStep
          title="2) الفحص النظري (التؤوريا)"
          icon={<Description color="primary" sx={{ fontSize: 28 }} />}
        >
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            دائرة السير
          </Typography>
          <List dense sx={{ py: 0 }}>
            {[
              "الدراسة الجيدة للنظرية والتدرب على الامتحانات التدريبية",
              "التقديم أيام الأحد إلى الرابع",
              "الحضور الساعة 08:00 صباحاً والانتظار حسب الدور",
              "الامتحان متاح على الموقع الإلكتروني للمدرسة",
            ].map((text, index) => (
              <ListItem key={index} sx={{ py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      backgroundColor: "primary.main",
                      borderRadius: "50%",
                    }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={text}
                  primaryTypographyProps={{
                    variant: "body1",
                    textAlign: "right",
                  }}
                />
              </ListItem>
            ))}
          </List>
        </ProcessStep>

        <ProcessStep
          title="3) الفحص العملي (التست)"
          icon={<DriveEta color="primary" sx={{ fontSize: 28 }} />}
        >
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            دائرة السير
          </Typography>
          <List dense sx={{ py: 0 }}>
            {[
              "الخطوة الأخيرة بعد إتقان مهارات القيادة",
              "التقديم أيام الأحد إلى الخميس",
              "يتم تحديد الموعد بدقة مسبقاً",
              "يتم التنسيق من خلال مدرسة السياقة وتحديد الموعد",
              "الاختبار يشمل المهارات الأساسية في القيادة",
            ].map((text, index) => (
              <ListItem key={index} sx={{ py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      backgroundColor: "primary.main",
                      borderRadius: "50%",
                    }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={text}
                  primaryTypographyProps={{
                    variant: "body1",
                    textAlign: "right",
                  }}
                />
              </ListItem>
            ))}
          </List>
        </ProcessStep>

        <ProcessStep
          title="4) استلام الرخصة"
          icon={<AssignmentInd color="primary" sx={{ fontSize: 28 }} />}
        >
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            دائرة السير
          </Typography>
          <Box sx={{ bgcolor: "#f8f9fa", p: 3, borderRadius: 2 }}>
            <Typography variant="body1" paragraph>
              بعد النجاح في الامتحان العملي، يمكنك استلام الرخصة من دائرة السير
              خلال أوقات الدوام الرسمي:
            </Typography>
            <Box sx={{ display: "flex", gap: 4, mt: 2 }}>
              <Box>
                <Typography variant="body1" fontWeight={500}>
                  الأيام المتاحة:
                </Typography>
                <Typography variant="body1">الأحد إلى الخميس</Typography>
              </Box>
              <Box>
                <Typography variant="body1" fontWeight={500}>
                  أوقات الاستلام:
                </Typography>
                <Typography variant="body1">08:00 ص - 01:00 م</Typography>
              </Box>
            </Box>
            <Typography
              variant="body1"
              sx={{ mt: 2, color: "#e74c3c" }}
              fontWeight={500}
            >
              ملاحظة: يجب إحضار الهوية الشخصية والحضور شخصياً
            </Typography>
          </Box>
        </ProcessStep>
      </Container>
    </ThemeProvider>
  );
};

export default LicenseProcess;
