import * as React from "react";

import { Box, Container } from "@mui/material";
import ActionAreaCard from "@/components/ui/Card";
import { qTypesData } from "@/components/data/qTypesData";
import SectionTitle from "@/components/ui/SectionTitle";

export default function QTypesPage() {
  return (
      <Container className="section" >
        <SectionTitle
          title="أنواع الأسئلة"
          subTitle="اختر نوع الأسئلة التؤوريا التي ترغب في دراستها"
        />
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 3,
            padding: "0 20px",
            "& > div": {
              flex: "1 1 100%",
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
          {qTypesData.map((type, index) => (
            <Box key={index} data-aos="fade-up" data-aos-delay={index * 50}>
              <ActionAreaCard
                title={type.title}
                image={type.image}
                path={type.path}
                alt={`صورة ${type.title}`}
              />
            </Box>
          ))}
        </Box>
      </Container>
  );
}
