import {   Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Container, } from "@mui/material";
import BookIcon from "@mui/icons-material/Book";
import SignpostIcon from "@mui/icons-material/Signpost";
import SectionTitle from "@/components/ui/SectionTitle";
import Link from "next/link";
import Hero from "../components/layout/Hero";
import Types from "../components/layout/Types";
import Gallery from "@/components/layout/Gallery";
import ActionAreaCard from "@/components/ui/Card";
import Exam from "@/components/ui/Exam";
export default function Home() {
  return (
    <>
      <Hero />
      <Container sx={{ py: 8, overflowX: "hidden", px: { xs: 2, sm: 3, md: 4 } }} maxWidth="lg">
        <SectionTitle
          title="أسئلة التؤوريا"
          subTitle="اختر نوع الرخصة للدراسة الأسئلة الخاصة بها"
        />
        <Types />
        <Box sx={{ overflow: "hidden", mt: 10 }}></Box>
        <SectionTitle
          title="أسئلة الاستكمالي والتدريب"
          subTitle="اختر نوع الرخصة للدراسة الأسئلة الخاصة بها"
        />
        <Grid
          container
          spacing={4}
          sx={{ overflow: "hidden", paddingBottom: "50px" }}
        >
          <Grid item xs={12} sm={6}>
            <Box data-aos="fade-up">
              <ActionAreaCard
                title={"أسئلة تؤوريا استكمالي"}
                path={"/teoria/cTeoria"}
                image={"/images/c.png"}
                alt={`صورة استكمالي`}
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box data-aos="fade-up">
              <ActionAreaCard
                title={"أسئلة تدريب سياقة وإدارة مهنية"}
                path={"/teoria/training/quizes/"}
                image={"/images/training.png"}
                alt={`صورة تدريب`}
              />
            </Box>
          </Grid>
        </Grid>
      </Container>
      <Gallery />
      <Box sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        <Exam />
      </Box>
      <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, overflowX: "hidden" }}>
        <Container
          maxWidth="lg"
          className="section"
          disableGutters={false}
          sx={{ overflowX: "hidden" }}
        >
          <SectionTitle
            title="مادة التؤوريا "
            subTitle="اختر نوع المادة للدراسة منها"
          />

          <Grid container spacing={4} justifyContent="center" overflow={"hidden"}>
            <Grid item xs={11} md={6}>
              <Link href={"/st/book"}>
                <Card
                  sx={{
                    minHeight: 300,
                    transition: "all 0.3s ease-in-out",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: 8,
                    },
                    backgroundColor: (theme) => theme.palette.primary.light,
                  }}
                  data-aos="fade-up"
                >
                  <CardContent
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                      p: 4,
                    }}
                  >
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: "50%",
                        bgcolor: "primary.main",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 3,
                      }}
                    >
                      <BookIcon sx={{ fontSize: 40, color: "common.white" }} />
                    </Box>
                    <Typography
                      variant="h5"
                      component="h3"
                      gutterBottom
                      sx={{
                        fontWeight: 700,
                        color: "primary.dark",
                        textAlign: "center",
                      }}
                    >
                      دراسة مادة التؤوريا النظرية
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: "text.secondary",
                        textAlign: "center",
                        maxWidth: 400,
                      }}
                    >
                      تعلم قوانين القيادة والطرق وأجزاء ومكونات المركبة بالتفصيل
                      لتساعدك على اجتياز الاختبار بسهولة.
                    </Typography>
                  </CardContent>
                </Card>
              </Link>
            </Grid>
            <Grid item xs={11} md={6}>
              <Link href={"/st/signals"}>
                <Card
                  sx={{
                    minHeight: 300,
                    transition: "all 0.3s ease-in-out",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: 8,
                    },
                    backgroundColor: (theme) => theme.palette.primary.light,
                  }}
                  data-aos="fade-up"
                >
                  <CardContent
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                      p: 4,
                    }}
                  >
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: "50%",
                        bgcolor: "primary.main",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 3,
                      }}
                    >
                      <SignpostIcon
                        sx={{ fontSize: 40, color: "common.white" }}
                      />
                    </Box>
                    <Typography
                      variant="h5"
                      component="h3"
                      gutterBottom
                      sx={{
                        fontWeight: 700,
                        color: "primary.dark",
                        textAlign: "center",
                      }}
                    >
                      دراسة جميع أنواع الاشارات ومعانيها
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: "text.secondary",
                        textAlign: "center",
                        maxWidth: 400,
                      }}
                    >
                      تعرف على جميع أنواع إشارات المرور، معانيها، وكيفية
                      استخدامها .
                    </Typography>
                  </CardContent>
                </Card>
              </Link>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
}
