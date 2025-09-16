import React from "react";


import { keyframes } from "@mui/system";
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  List,
  ListItem,
  ListItemIcon,
  Divider,
  IconButton,
  useTheme,
  styled,
  alpha,
} from "@mui/material";
import {
  LocationOn,
  Phone,
  Code,
  Business,
  Email,
  Facebook,

  Person,
} from "@mui/icons-material";
import WhatsApp from "@mui/icons-material/WhatsApp";
import GitHub from "@mui/icons-material/GitHub";
import SectionTitle from "@/components/ui/SectionTitle";
import Image from "next/image";

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-12px); }
  100% { transform: translateY(0px); }
`;

const GradientCard = styled(Card)(({ theme }) => ({
  background: theme.palette.background.paper,
  borderRadius: "24px",
  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.1)}`,
  position: "relative",
  overflow: "hidden",
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.2)}`,
  },
  "&:before": {
    content: '""',
    position: "absolute",
    inset: 0,
    background: `linear-gradient(120deg, ${alpha(
      theme.palette.primary.main,
      0.05
    )} 30%, ${alpha(theme.palette.primary.main, 0.2)} 80%)`,
  },
}));

const ContactIconButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor: theme.palette.primary.main,
    "& svg": {
      color: theme.palette.background.paper,
    },
  },
}));

const FloatingLogo = styled("div")({
  animation: `${float} 4s ease-in-out infinite`,
});

const GradientText = styled(Typography)(({ theme }) => ({
  background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  fontWeight: 800,
  letterSpacing: "-0.5px",
}));

export default function ContactPageAr() {
  const theme = useTheme();
  return (
    <Container
      maxWidth="md"
      sx={{
        py: 8,
        direction: "rtl",
        overflowX: "hidden",
      }}
    >
      <FloatingLogo sx={{ mb: 8, textAlign: "center" }}>
        <Image
          src="/images/logo.png"
          alt="Logo"
          width={160}
          height={160}
          priority
          style={{
            filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.1))",
            borderRadius: "24px",
          }}
        />
        <GradientText
          variant="h2"
          component="h2"
          sx={{
            mt: 3,
            fontSize: "2.5rem",
            lineHeight: 1.2,
          }}
        >
          {"مدرسة الوطن"}
        </GradientText>
      </FloatingLogo>

      <SectionTitle
        title="تواصل معنا"
        sx={{ mb: 8 }}
        titleProps={{
          sx: {
            "&:after": {
              background: `linear-gradient(90deg, ${
                theme.palette.primary.main
              }, ${alpha(theme.palette.primary.main, 0.5)})`,
            },
          },
        }}
      />

      <Grid container spacing={4} sx={{ mb: 10 }}>
        {contactSections.map((section, index) => (
          <Grid item xs={12} md={6} key={index}>
            <GradientCard
              sx={{
                p: 4,
                height: "100%",
                background: section.background,
              }}
            >
              <Box
                sx={{
                  textAlign: "center",
                  mb: 4,
                  "& svg": {
                    fontSize: 56,
                    color: theme.palette.primary.main,
                    filter: `drop-shadow(0 4px 8px ${alpha(
                      theme.palette.primary.main,
                      0.2
                    )})`,
                  },
                }}
              >
                {React.cloneElement(section.icon, {
                  sx: {
                    animation: `${float} 3s ease-in-out infinite`,
                  },
                })}
              </Box>

              <Typography
                variant="h5"
                fontWeight={800}
                gutterBottom
                sx={{
                  color: theme.palette.text.primary,
                  mb: 3,
                  fontSize: "1.5rem",
                  lineHeight: 1.3,
                }}
              >
                {section.title}
              </Typography>

              <List sx={{ py: 1 }}>
                {section.items.map((item, i) => (
                  <React.Fragment key={i}>
                    <ContactListItem
                      icon={item.icon}
                      text={item.text}
                      sx={{
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateX(8px)",
                          "& .MuiListItemIcon-root": {
                            color: theme.palette.primary.main,
                          },
                        },
                      }}
                    />
                    {i < section.items.length - 1 && (
                      <Divider
                        sx={{
                          my: 2,
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          height: "1px",
                        }}
                      />
                    )}
                  </React.Fragment>
                ))}
              </List>

              {section.social && section.socialLinks && (
                <Box sx={{ mt: 6, textAlign: "center" }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                      mb: 4,
                      color: theme.palette.text.primary,
                      fontWeight: 600,
                    }}
                  >
                    تابعنا على
                  </Typography>
                  <Box
                    sx={{ display: "flex", justifyContent: "center", gap: 2 }}
                  >
                    {section.socialLinks.map((social, index) => (
                      <ContactIconButton key={index} href={social.href} target="_blank">
                        {React.cloneElement(social.icon, { fontSize: "large" })}
                      </ContactIconButton>
                    ))}
                  </Box>
                </Box>
              )}
            </GradientCard>
          </Grid>
        ))}
      </Grid>

      <Box
        sx={{
          borderRadius: 4,
          overflow: "hidden",
          boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.1)}`,
          position: "relative",
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        }}
      >
        <iframe
          title="موقع المدرسة"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d201.92542268115596!2d35.20020331908318!3d31.7067162778226!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1502d8641489837d%3A0x96c757f30b7ea4b9!2z2LTYp9ix2Lkg2YXZiNin2K8g2YXYudin2YTZig!5e1!3m2!1sar!2s!4v1739304474062!5m2!1sar!2s"
          width="100%"
          height="480"
          loading="lazy"
          style={{ border: 0 }}
          referrerPolicy="no-referrer-when-downgrade"
        />
      </Box>
    </Container>
  );
}

const ContactListItem = ({ icon, text, sx }) => {
  const theme = useTheme();
  return (
    <ListItem sx={{ px: 0, py: 1.5, ...sx }}>
      <ListItemIcon
        sx={{
          minWidth: 48,
          color: alpha(theme.palette.primary.main, 0.8),
          transition: "all 0.3s ease",
        }}
      >
        {React.cloneElement(icon, { fontSize: "medium" })}
      </ListItemIcon>
      <Typography
        variant="body1"
        sx={{
          fontWeight: 500,
          color: theme.palette.text.primary,
          fontSize: "1.1rem",
          lineHeight: 1.4,
        }}
      >
        {text}
      </Typography>
    </ListItem>
  );
};

const contactSections = [
  {
    icon: <Business />,
    title: "معلومات المدرسة",
    background: `linear-gradient(145deg, ${alpha("#d8a336", 0.05)} 0%, ${alpha(
      "#d8a336",
      0
    )} 100%)`,
    items: [
      { icon: <Person fontSize="small"/>, text: "إدارة: محمود مناصرة (أبو ثائر) " },
      { icon: <Phone fontSize="small"/>, text: "0599-314190 | 0569-314190" },
      { icon: <LocationOn />, text: "شارع واد معالي - عمارة رقم 114" },
    ],
    social: true,
    socialLinks: [
      { icon: <WhatsApp />, href: "https://wa.me/+972568688633" },
      {
        icon: <Facebook />,
        href: "https://www.facebook.com/profile.php?id=100010197635749",
      },
    ],
  },
  {
    icon: <Code />,
    title: "   معلومات المطور ",
    background: `linear-gradient(145deg, ${alpha("#d8a336", 0.05)} 0%, ${alpha(
      "#d8a336",
      0
    )} 100%)`,
    items: [
      { icon: <Person />, text: "عمرو محمد بريجية" },
      { icon: <Email />, text: "amrbreijieh@gmail.com" },
      { icon: <Code />, text: "مطور تطبيقات لجميع المنصات" },
    ],
    social: true,
    socialLinks: [
      { icon: <WhatsApp />, href: "https://wa.me/+972595313953" },
      { icon: <GitHub />, href: "https://github.com/AmrBreijieh" },
    ],
  },
];
