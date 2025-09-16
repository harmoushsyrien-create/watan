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
  Avatar,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

const StyledCard = styled(Card)(({ theme }) => ({
  transition: "transform 0.3s, box-shadow 0.3s",
  "&:hover": {
    transform: "translateY(-5px)",
  },
  background: "linear-gradient(145deg, #ffffff, #f8f9fa)",
  borderRadius: "15px",
  overflow: "visible",
}));

const LicenseSection = () => {
  // SEO meta variables
  const pageTitle =
    " مدرسة الوطن | الحصول على الرخصة  ";
  const pageDescription =
    "تعرف على الوثائق المطلوبة، العمر الأدنى، والشروط اللازمة للحصول على رخصة سياقة في فلسطين وفقاً للمعايير الرسمية لوزارة النقل والمواصلات.";
  const pageKeywords =
    "رخصة سياقة, وثائق, متطلبات, شروط, الحصول على الرخصة, فلسطين, دليل سياقة";
  const canonicalUrl = "https://alqudss.com/license-requirements";

  const licenses = [
    {
      img: "/images/private.png",
      title: "خصوصي",
      requirements: ["– 2 صور شخصية", "– صورة عن الهوية"],
      ages: ["يبدأ بالفحوصات 17 سنة", "يحصل على الرخصة 17.5 سنة"],
    },
    {
      img: "/images/motocycle.png",
      title: "دراجة نارية",
      requirements: ["– 2 صور شخصية", "– صورة عن الهوية"],
      ages: ["يبدأ بالفحوصات 17 سنة", "يحصل على الرخصة 17 سنة"],
      note:
        "ملاحظة: في حال كان المتقدم حاصل على رخصة سابقة، يُعفى من دراسة التؤوريا ويمكنه التقديم مباشرة للامتحان العملي (التست).",
    },
    {
      img: "/images/light.png",
      title: "شحن خفيف",
      requirements: ["– 4 صور شخصية", "– صورة عن الهوية"],
      ages: ["يبدأ بالفحوصات 17.5 سنة", "يحصل على الرخصة 18 سنة"],
    },
    {
      img: "/images/heavy.png",
      title: "شحن ثقيل",
      requirements: [
        "– 4 صور شخصية",
        "– صورة عن الهوية",
        "– صورة عن الرخصة",
        "– شهادة مدرسية مصدقة",
      ],
      ages: ["19 سنة"],
      conditions: [
        "– أن يكون حاصل على رخصة شحن مضى عليها سنة.",
        "– الحصول على شهادة دورة شحن ثقيل من كلية مرخصة.",
        "– أن يكون قد اجتاز الصف الخامس في التعليم المدرسي.",
      ],
    },
    {
      img: "/images/trailer.png",
      title: "تريلا",
      requirements: [
        "– 4 صور شخصية",
        "– صورة عن الهوية",
        "– صورة عن الرخصة",
        "– شهادة مدرسية مصدقة",
        "– شهادة دورة شحن ثقيل",
      ],
      ages: ["20 سنة"],
      conditions: [
        "– أن يكون حاصل على رخصة شحن ثقيل مضى عليها سنة.",
        "– أن يكون قد اجتاز الصف الخامس في التعليم المدرسي.",
      ],
    },
    {
      img: "/images/taxi.png",
      title: "تاكسي عمومي",
      requirements: [
        "– 4 صور شخصية",
        "– صورة عن الهوية",
        "– صورة عن الرخصة",
        "– شهادة مدرسية مصدقة",
        "– شهادة حسن سير وسلوك",
      ],
      ages: ["21 سنة"],
      conditions: [
        "– أن يكون حاصل على رخصة خصوصي مضى عليها سنتين.",
        "– الحصول على شهادة دورة عمومي من كلية مرخصة من وزارة النقل والمواصلات قبل الامتحان النظري (التؤوريا).",
        "– أن يكون قد اجتاز الصف الثاني إعدادي.",
      ],
    },
    {
      img: "/images/bus.png",
      title: "باص عمومي",
      requirements: [
        "– 4 صور شخصية",
        "– صورة عن الهوية",
        "– صورة عن الرخصة",
        "– شهادة مدرسية مصدقة",
        "– شهادة حسن سير وسلوك",
      ],
      ages: ["21 سنة"],
      conditions: [
        "– أن يكون حاصل على رخصة شحن مضى عليها سنتين.",
        "– الحصول على شهادة دورة عمومي من كلية مرخصة من وزارة النقل والمواصلات قبل الامتحان النظري (التؤوريا).",
        "– أن يكون قد اجتاز الصف الثاني إعدادي.",
      ],
    },
  ];

  const theme = useTheme();

  return (
      <Box
        sx={{
          background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
          py: 8,
          direction: "rtl",
            overflow: "hidden"
        }}
      >
        <Container maxWidth="sm">
          <Grid container spacing={10}>
            {licenses.map((license, index) => (
              <Grid item xs={12} key={index}>
                <StyledCard>
                  <Box sx={{ display: "flex", justifyContent: "center", mt: -1 }}>
                    <Avatar
                      src={license.img}
                      sx={{
                        width: 100,
                        height: 100,
                        border: "3px solid white",
                        borderRadius: 5,
                      }}
                    />
                  </Box>
                  <CardContent>
                    <Typography
                      variant="h5"
                      gutterBottom
                      sx={{
                        fontWeight: "bold",
                        color: theme.palette.primary.main,
                        textAlign: "center",
                        mb: 1,
                      }}
                    >
                      {license.title}
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Typography sx={{ mb: 1, color: "black", opacity: 0.6 }}>
                      <strong>الوثائق المطلوبة:</strong>
                    </Typography>
                    <List dense>
                      {license.requirements.map((item, i) => (
                        <ListItem key={i}>
                          <ListItemText
                            primary={item}
                            sx={{ direction: "rtl", textAlign: "right" }}
                          />
                        </ListItem>
                      ))}
                    </List>
                    <Divider sx={{ my: 1 }} />
                    <Typography sx={{ color: "black", opacity: 0.6, mb: 1 }}>
                      <strong>العمر الأدنى:</strong>
                    </Typography>
                    <List dense>
                      {license.ages.map((age, i) => (
                        <ListItem key={i}>
                          <ListItemText
                            primary={age}
                            sx={{ direction: "rtl", textAlign: "right" }}
                          />
                        </ListItem>
                      ))}
                    </List>
                    {license.conditions && (
                      <>
                        <Divider sx={{ my: 1 }} />
                        <Typography sx={{ color: "black", mb: 1, opacity: 0.6 }}>
                          <strong>الشروط:</strong>
                        </Typography>
                        <List dense>
                          {license.conditions.map((condition, i) => (
                            <ListItem key={i}>
                              <ListItemText
                                primary={condition}
                                sx={{ direction: "rtl", textAlign: "right" }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </>
                    )}
                    {license.note && (
                      <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
                        <Typography variant="body2">{license.note}</Typography>
                      </Alert>
                    )}
                  </CardContent>
                </StyledCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
  );
};

export default LicenseSection;
