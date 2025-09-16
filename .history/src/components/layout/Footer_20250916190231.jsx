import React from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Card,
  CardContent,
  alpha,
} from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import LocalPhoneIcon from "@mui/icons-material/LocalPhone";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { navigationData } from "../data/navigationData";
import Image from "next/image";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        width: "100%",
        backgroundColor: "black",
        color: "white",
        py: 4,
        overflowX: "hidden",
      }}
      data-aos="fade-in"
      data-aos-easing="ease-in-back"
      data-aos-offset="-600"
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 6 } }}>
        <Grid container spacing={3} justifyContent="space-between">
          <Grid item xs={12} md={3}>
             <Card
               sx={{
                 background: `linear-gradient(135deg, ${alpha("#36a336", 0.1)} 0%, ${alpha("#36a336", 0.05)} 100%)`,
                 border: `1px solid ${alpha("#36a336", 0.2)}`,
                 borderRadius: 3,
                 mb: 3,
                 transition: "all 0.3s ease",
                 "&:hover": {
                   transform: "translateY(-2px)",
                   boxShadow: `0 8px 25px ${alpha("#36a336", 0.15)}`,
                   border: `1px solid ${alpha("#36a336", 0.3)}`,
                 },
               }}
             >
               <CardContent sx={{ p: 3, textAlign: "center" }}>
                 <Link
                   href="/"
                   style={{
                     textDecoration: "none",
                     color: "inherit",
                   }}
                 >
                   <Typography
                     variant="h5"
                     component="h2"
                     fontWeight={800}
                     sx={{
                       background: "linear-gradient(45deg, #36a336 30%, #4db84d 90%)",
                       backgroundClip: "text",
                       WebkitBackgroundClip: "text",
                       WebkitTextFillColor: "transparent",
                       mb: 1,
                     }}
                   >
                     مدرسة الوطن
                   </Typography>
                   <Typography
                     variant="body2"
                     sx={{
                       color: alpha("#36a336", 0.8),
                       fontWeight: 500,
                     }}
                   >
                     للسياقة والتعليم
                   </Typography>
                 </Link>
               </CardContent>
             </Card>
            <Typography variant="body1" sx={{ opacity: 0.8 }}>
              أفضل مكان للتحضير لامتحان التؤوريا والحصول على رخصة السياقة
            </Typography>
            <Box mt={2}>
              <IconButton
                aria-label="Facebook"
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ color: "white" }}
              >
                <FacebookIcon />
              </IconButton>
              <IconButton
                aria-label="WhatsApp"
                href="https://wa.me/+972568688633"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ color: "white" }}
              >
                <WhatsAppIcon />
              </IconButton>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography
              variant="h6"
              gutterBottom
              color="var(--primary1)"
              fontWeight={700}
            >
              معلومات الاتصال
            </Typography>
            <Typography variant="body1">
              بيت لحم، شارع واد معالي - عمارة رقم 114
            </Typography>
            <Typography variant="body1" mt={2}>
              أبو ثائر:
            </Typography>
            <Typography variant="body1">
              <PhoneAndroidIcon /> 0599-314190
            </Typography>
            <Typography variant="body1">
              <PhoneAndroidIcon />
              0569-314190
            </Typography>
            <Typography variant="body1" mt={2}>
              رائد:
            </Typography>
            <Typography variant="body1">
              <PhoneAndroidIcon />
              0592-748433
            </Typography>
            <Typography variant="body1">
              <PhoneAndroidIcon />
              0568-688633
            </Typography>
            <Typography variant="body1">
              صاحب المدرسة ومديرها: محمود مناصرة
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Grid container spacing={2}>
              {navigationData
                .filter((e) => e.subMenu.length > 0)
                .map((navItem, idx) => (
                  <Grid item xs={6} sm={4} md={6} key={idx}>
                    <Typography
                      variant="subtitle1"
                      gutterBottom
                      fontWeight={700}
                      color="var(--primary1)"
                    >
                      {navItem.title}
                    </Typography>
                    {navItem.subMenu && navItem.subMenu.length > 0 ? (
                      navItem.subMenu.map((subItem, subIdx) => (
                        <Box key={subIdx} mb={1}>
                          <Link
                            href={subItem.path}
                            underline="hover"
                            color="inherit"
                            sx={{ fontSize: "0.9rem", opacity: 0.8 }}
                          >
                            {subItem.title}
                          </Link>
                        </Box>
                      ))
                    ) : (
                      <></>
                    )}
                  </Grid>
                ))}
            </Grid>
          </Grid>
        </Grid>

        <Box mt={4} textAlign="center">
          <Typography variant="body1" color="white">
            {`© ${new Date().getFullYear()} | مدرسة الوطن | جميع الحقوق محفوظة.`}
          </Typography>
          <Typography variant="body1" color="white">
            Made by
            <Link
              href="https://wa.me/+972594262092"
              color="#36a336"
              target="_blank"
              fontSize={20}
              fontWeight={800}
              sx={{ textDecoration: "none" }}
              p={1}
            >
              Ahmad Alarjah
            </Link>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
