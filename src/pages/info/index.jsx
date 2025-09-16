import React from "react";

import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  useTheme,
  styled,
  alpha,
  Box,
} from "@mui/material";
import {
  Receipt,
  Schedule,
  DirectionsCar,
} from "@mui/icons-material";
import Link from "next/link";

const ServiceCard = styled(Card)(({ theme }) => ({
  position: "relative",
  overflow: "visible",
  borderRadius: "10px",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  boxShadow: theme.shadows[2],
  minHeight: 300,
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: theme.shadows[8],
    "&:before": {
      transform: "scaleY(1)",
    },
  },
  "&:before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "4px",
    backgroundColor: theme.palette.primary.main,
    transform: "scaleY(0)",
    transition: "transform 0.3s ease",
  },
}));

const IconContainer = styled("div")(({ theme }) => ({
  width: 64,
  height: 64,
  borderRadius: "16px",
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto 24px",
  color: theme.palette.primary.main,
  position: "relative",
  "&:after": {
    content: '""',
    position: "absolute",
    width: "100%",
    height: "100%",
    border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
    borderRadius: "16px",
    transform: "rotate(45deg)",
  },
}));

const services = [
  {
    title: "مواعيد الإجراءات",
    icon: <Schedule sx={{ fontSize: 32 }} />,
    content:
      "معرفة موعد وكيفية الحصول على الخدمات الحكومية المتعلقة بالحصول على رخصة السياقة.",
    path: "/info/times",
  },
  {
    title: "الحصول على رخصة سياقة",
    icon: <DirectionsCar sx={{ fontSize: 32 }} />,
    content:
      "معرفة الإجراءات والخطوات التفصيلية للحصول على رخصة سياقة فلسطينية.",
    path: "/info/steps",
  },
  {
    title: "سعر الدروس والتستات",
    icon: <Receipt sx={{ fontSize: 32 }} />,
    content:
      "معرفة أسعار دروس السياقة وأسعار التسجيل حسب التسعيرة الرسمية لوزارة النقل والمواصلات الفلسطينية.",
    path: "/info/prices",
  },
];

export default function EnhancedServices() {
  const theme = useTheme();
  return (
    <>
      <Box
        sx={{
          py: 8,
          overflow: "hidden",
          background: `
            repeating-linear-gradient(45deg, 
              ${alpha(theme.palette.primary.light, 0.05)} 0px, 
              ${alpha(theme.palette.primary.light, 0.05)} 25px,
              transparent 25px,
              transparent 50px)
          `,
          position: "relative",
        }}
      >
        <Container maxWidth="lg" sx={{ minHeight: "100vh" }}>
          <Typography
            variant="h3"
            sx={{
              textAlign: "center",
              mb: 1,
              fontWeight: 800,
              color: theme.palette.text.primary,
              position: "relative",
              fontSize: "2rem",
              marginTop: "60px",
              "&:after": {
                content: '""',
                display: "block",
                width: 120,
                height: 4,
                background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                margin: "24px auto 0",
                borderRadius: 2,
              },
            }}
          >
            الخدمات لرخصة السياقة
          </Typography>

          <Grid container spacing={4}>
            {services.map((service, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <ServiceCard data-aos="fade-up" data-aos-delay={index * 100}>
                  <Link href={service.path} >
                    <CardContent sx={{ p: 3, height: "100%" }}>
                      <IconContainer>{service.icon}</IconContainer>
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 700,
                          mb: 2,
                          textAlign: "center",
                          color: theme.palette.text.primary,
                        }}
                      >
                        {service.title}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color: theme.palette.text.secondary,
                          lineHeight: 1.7,
                          textAlign: "center",
                          fontSize: "0.9rem",
                        }}
                      >
                        {service.content}
                      </Typography>
                    </CardContent>
                  </Link>
                </ServiceCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </>
  );
}
