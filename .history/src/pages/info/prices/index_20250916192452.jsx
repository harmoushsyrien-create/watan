import React from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  useTheme,
  Avatar,
  alpha,
  Chip,
} from "@mui/material";
import { keyframes } from "@emotion/react";
import SectionTitle from "@/components/ui/SectionTitle";

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const plans = [
  {
    title: "خصوصي",
    icon: "/images/private.png",
    price: "₪ 90",
    tests: ["₪ 290 التست الأول", "₪ 370 التست الثاني وما فوق"],
    age: "17 سنة",
    color: "linear-gradient(135deg, #2d7a2d 0%, #4db84d 100%)",
  },
  {
    title: "شحن خفيف",
    icon: "/images/light.png",
    price: "₪ 110",
    tests: ["₪ 350 التست الأول", "₪ 430 التست الثاني وما فوق"],
    age: "17.5 سنة",
    color: "linear-gradient(135deg, #2d7a2d 0%, #4db84d 100%)",
  },
  {
    title: "شحن ثقيل",
    icon: "/images/heavy.png",
    price: "₪ 160",
    tests: ["₪ 500 التست الأول", "₪ 580 التست الثاني وما فوق"],
    age: "19 سنة",
    color: "linear-gradient(135deg, #2d7a2d 0%, #4db84d 100%)",
  },
  {
    title: "تريلا",
    icon: "/images/trailer.png",
    price: "₪ 160",
    tests: ["₪ 500 التست الأول", "₪ 580 التست الثاني وما فوق"],
    age: "20 سنة",
    color: "linear-gradient(135deg, #2d7a2d 0%, #4db84d 100%)",
  },
  {
    title: "تكسي عمومي",
    icon: "/images/taxi.png",
    price: "₪ 90",
    tests: ["₪ 290 التست الأول", "₪ 370 التست الثاني وما فوق"],
    age: "21 سنة",
    color: "linear-gradient(135deg, #2d7a2d 0%, #4db84d 100%)",
    link: "/taxi",
  },
  {
    title: "باص عمومي",
    icon: "/images/bus.png",
    price: "₪ 160",
    tests: ["₪ 500 التست الأول", "₪ 580 التست الثاني وما فوق"],
    age: "21 سنة",
    color: "linear-gradient(135deg, #2d7a2d 0%, #4db84d 100%)",
    link: "/bus",
  },
];

const PricingCard = ({ plan }) => {
  const theme = useTheme();

  return (
    <Grid item xs={12} sm={6} md={4} lg={4}>
      <Card
        sx={{
          position: "relative",
          background: `linear-gradient(145deg, ${alpha("#ffffff", 0.9)} 0%, ${alpha("#f8fafc", 0.8)} 100%)`,
          border: `1px solid ${alpha("#36a336", 0.1)}`,
          borderRadius: 6,
          overflow: "hidden",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: `0 4px 20px ${alpha("#36a336", 0.08)}`,
          "&:hover": {
            transform: "translateY(-12px) scale(1.02)",
            boxShadow: `0 20px 40px ${alpha("#36a336", 0.15)}`,
            border: `1px solid ${alpha("#36a336", 0.2)}`,
            "& .card-icon": {
              transform: "scale(1.1) rotate(5deg)",
            },
            "& .price-text": {
              color: "#36a336",
            },
          },
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: plan.color,
            zIndex: 1,
          },
        }}
      >
        <CardContent sx={{ textAlign: "center", pt: 6, pb: 4, px: 3 }}>
          {/* Icon with enhanced styling */}
          <Box
            className="card-icon"
            sx={{
              position: "relative",
              display: "inline-block",
              transition: "all 0.3s ease",
              mb: 3,
            }}
          >
            <Avatar
              src={plan.icon}
              sx={{
                width: 100,
                height: 100,
                background: plan.color,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                boxShadow: `0 8px 25px ${alpha("#36a336", 0.3)}`,
                p: 2,
                border: `4px solid ${alpha("#ffffff", 0.9)}`,
                "&::after": {
                  content: '""',
                  position: "absolute",
                  top: -4,
                  left: -4,
                  right: -4,
                  bottom: -4,
                  borderRadius: "50%",
                  background: `linear-gradient(45deg, ${alpha("#36a336", 0.1)}, ${alpha("#4db84d", 0.1)})`,
                  zIndex: -1,
                },
              }}
            />
          </Box>

          {/* Title with enhanced styling */}
          <Typography 
            variant="h5" 
            fontWeight={700} 
            sx={{ 
              mb: 2,
              color: "#1a202c",
              fontSize: "1.5rem",
            }}
          >
            {plan.title}
          </Typography>

          {/* Age chip */}
          <Chip
            label={`العمر الأدنى: ${plan.age}`}
            sx={{
              mb: 3,
              background: alpha("#36a336", 0.1),
              color: "#36a336",
              fontWeight: 600,
              border: `1px solid ${alpha("#36a336", 0.2)}`,
            }}
          />

          {/* Price with enhanced styling */}
          <Box sx={{ my: 3 }}>
            <Typography
              className="price-text"
              variant="h3"
              fontWeight={800}
              sx={{ 
                color: "#2d7a2d",
                fontSize: "2.5rem",
                mb: 1,
                transition: "color 0.3s ease",
              }}
            >
              {plan.price}
            </Typography>
            <Typography 
              component="span" 
              variant="body1" 
              sx={{ 
                color: alpha("#36a336", 0.7),
                fontWeight: 500,
                fontSize: "1rem",
              }}
            >
              / الدرس الواحد
            </Typography>
          </Box>

          {/* Tests with enhanced styling */}
          <Box sx={{ my: 3 }}>
            {plan.tests.map((test, idx) => (
              <Box
                key={idx}
                sx={{
                  background: alpha("#36a336", 0.05),
                  borderRadius: 2,
                  p: 2,
                  mb: 1.5,
                  border: `1px solid ${alpha("#36a336", 0.1)}`,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background: alpha("#36a336", 0.08),
                    transform: "translateX(-4px)",
                  },
                }}
              >
                <Typography
                  variant="body1"
                  sx={{ 
                    color: "#2d7a2d",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                  }}
                >
                  {test}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Decorative element */}
          <Box
            sx={{
              width: "60px",
              height: "4px",
              background: plan.color,
              borderRadius: 2,
              mx: "auto",
              mt: 3,
            }}
          />
        </CardContent>
      </Card>
    </Grid>
  );
};

const PricingSection = () => {
  return (
    <>
      <Box
        sx={{
          py: 8,
          px: { xs: 2, md: 6 },
          background: "linear-gradient(45deg, #f8fafc 0%, #f1f5f9 100%)",
          overflow: "hidden"
        }}
      >
        <SectionTitle
          title="الأسعار"
          subTitle={"أسعار الدروس والتسات  وفقاً لوزارة النقل ومواصلات"}
        />

        <Grid container spacing={4} justifyContent="center">
          {plans.map((plan, index) => (
            <PricingCard key={index} plan={plan} />
          ))}
        </Grid>
      </Box>
    </>
  );
};

export default PricingSection;
