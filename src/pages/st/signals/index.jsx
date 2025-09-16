import React from "react";

import SignalCard from "@/components/ui/SignalCard";
import {
  Container,
  Grid,
  Box,
  Button,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import signalsData from "@/pages/signals.json";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
export default function SignalsPage() {

  // Define type names for each signal type
  const typeNames = [
    " أ- اشارات التحذير ",
    "ب- اشارات الإرشاد",
    "ج- اشارات الاستعلامات",
    "د- اشارات سطح الطريق",
    "هـ- الآلات الضوئية",
    "و- الاشارات المساعدة",
  ];

  // Helper function to scroll smoothly to section
  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      // Adjust scroll offset to account for a sticky navigation (e.g., 160px)
      window.scrollTo({ top: section.offsetTop - 160, behavior: "smooth" });
    }
  };

  // Responsive check using theme
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

  return (
    <>
      {/* Navigation Container */}
      <Box
        sx={{
          position: "sticky",
          top: 88,
          zIndex: 1000,
          backgroundColor: "background.paper",
          py: 1,
          mb: 4,
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {isMdUp ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              flexWrap: "nowrap",
              gap: 1,
            }}
          >
            {signalsData.map((_, index) => (
              <Button
                key={index}
                variant="contained"
                sx={{
                  minWidth: 150,
                  color: "white",
                  backgroundColor: "primary.main",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                }}
                onClick={() => scrollToSection(`type-${index}`)}
              >
                <Box
                  component="img"
                  src={`/images/signals/icons/${index + 1}.png`}
                  alt={`Icon for ${typeNames[index] || `نوع ${index + 1}`}`}
                  sx={{ width: 35, height: 35 }}
                />
                {typeNames[index] || `نوع ${index + 1}`}
              </Button>
            ))}
          </Box>
        ) : (
          <Swiper
            slidesPerView="auto"
            spaceBetween={16}
            freeMode={true}
            style={{
              paddingLeft: "calc(50vw - 200px)",
              paddingRight: "calc(50vw - 180px)",
            }}
          >
            {signalsData.map((_, index) => (
              <SwiperSlide key={index} style={{ width: "auto" }}>
                <Button
                  variant="contained"
                  sx={{
                    minWidth: 150,
                    color: "white",
                    backgroundColor: "primary.main",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                  }}
                  onClick={() => scrollToSection(`type-${index}`)}
                >
                  <Box
                    component={"img"}
                    src={`/images/signals/icons/${index + 1}.png`}
                    alt={`Icon for ${typeNames[index] || `نوع ${index + 1}`}`}
                    width={35}
                    height={35}
                    style={{ objectFit: "contain" }} // Optional for better scaling
                  />
                  {typeNames[index] || `نوع ${index + 1}`}
                </Button>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </Box>

      {/* Content Container */}
      <Container sx={{ py: 4 }}>
        {signalsData.map((typeSignals, index) => (
          <Box id={`type-${index}`} sx={{ mb: 8 }} key={index}>
            <Typography
              variant="h4"
              component="h2"
              gutterBottom
              fontWeight={700}
              textAlign="center"
              mb={0}
              sx={{ bgcolor: "white" }}
              p={2}
              borderRadius={3}
            >
              {typeNames[index] || `نوع ${index + 1}`}
            </Typography>
            <Grid container spacing={2}>
              {typeSignals.map((signal, i) => (
                <Grid item xs={12} sm={6} lg={4} key={i}>
                  <SignalCard
                    title={signal.title}
                    imageUrl={signal.image}
                    content={signal.content}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        ))}
      </Container>
    </>
  );
}
