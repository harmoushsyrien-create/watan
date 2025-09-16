import { Box, Container } from "@mui/material";
import ActionAreaCard from "@/components/ui/Card";
import SectionTitle from "@/components/ui/SectionTitle";
export default function Exam(){

    return (
      <Container maxWidth="sm">
        <SectionTitle
          title="فحص نتائج الامتحانات "
          subTitle="اختر نوع الامتحان لفحص النتيجة"
        />
        <Box
          data-aos="fade-up"
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 3,
            justifyContent: "center",
            "& > div": {
              flex: "1 1 100%",
              minWidth: { xs: "90%", sm: "300px" },
              maxWidth: { xs: "100%", sm: "350px" },
              mx: "auto"
            },
            "@media (min-width: 700px)": {
              "& > div": {
                flex: "1 1 100%",
              },
            },
            "@media (min-width: 900px)": {
              "& > div": {
                flex: "1 1 calc(30% - 24px)",
              },
            },
          }}
        >
          <ActionAreaCard
            title={"نتيجة الامتحان النظري (تؤوريا)"}
            image={"/images/exam.png"}
            path={"/exam/theoretical"}
            alt={`صورة نظري`}
          />
          <ActionAreaCard
            title={"نتيجة الامتحان العملي (التست)"}
            image={"/images/test.png"}
            path={"/exam/practical"}
            alt={`صورة عملي`}
          />
        </Box>
      </Container>
    );
}