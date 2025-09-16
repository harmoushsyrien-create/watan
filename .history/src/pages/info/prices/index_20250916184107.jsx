import React from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  useTheme,
  Avatar,
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
          border: `2px solid ${theme.palette.divider}`,
          borderRadius: 4,
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "translateY(-8px)",
            boxShadow: theme.shadows[8],
            borderColor: plan.featured
              ? theme.palette.primary.main
              : theme.palette.divider,
          },
          ...(plan.featured && {
            border: "2px solid transparent",
            backgroundImage:
              "linear-gradient(white, white), linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
            backgroundOrigin: "border-box",
            backgroundClip: "padding-box, border-box",
            animation: `${float} 4s ease-in-out infinite`,
          }),
        }}
      >
        <CardContent sx={{ textAlign: "center", pt: 4 }}>
          <Avatar
            src={plan.icon}
            sx={{
              width: 80,
              height: 80,
              margin: "-50px auto 20px",
              background: plan.color,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              boxShadow: theme.shadows[4],
              p: "10px",
              pt: "15px",
            }}
          >
            {plan.icon}
          </Avatar>

          <Typography variant="h5" fontWeight={600} gutterBottom>
            {plan.title}
          </Typography>

          <Typography
            variant="h4"
            fontWeight={800}
            sx={{ my: 2, color: theme.palette.primary.main }}
          >
            {plan.price}
            <Typography component="span" variant="body2" color="text.secondary">
              / الدرس
            </Typography>
          </Typography>

          <Box sx={{ my: 3 }}>
            {plan.tests.map((test, idx) => (
              <Typography
                key={idx}
                variant="body2"
                color="text.secondary"
                fontWeight={600}
                sx={{ py: 1 }}
              >
                {test}
              </Typography>
            ))}
          </Box>

          <Typography variant="body1" color="text.secondary" fontWeight={600}>
            العمر الأدنى {plan.age}
          </Typography>
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
