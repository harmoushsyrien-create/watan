import * as React from "react";
import { Box, Container } from "@mui/material";
import ActionAreaCard from "../ui/Card";
import { typesData } from "../data/typesData";
export default function Types({ isNormal = true, title, description }) {
  return (
    <Container sx={{ px: { xs: 2.5, sm: 4, md: 6 } }} maxWidth="sm">
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 3,
          // responsive widths
          "& > div": {
            flex: "1 1 100%",
          },
          "@media (min-width: 600px)": {
            "& > div": {
              flex: "1 1 calc(50% - 24px)",
            },
          },
          "@media (min-width: 900px)": {
            "& > div": {
              flex: "1 1 calc(33.333% - 24px)",
            },
          },
        }}
      >
        {typesData.map((type, index) => (
          <Box
            key={index}
            sx={{}}
            data-aos="fade-up"
            data-aos-delay={index * 50} // optional delay for a stagger effect
          >
            <ActionAreaCard
              title={isNormal ? type.title : type.title + " استكمالي"}
              image={type.image}
              path={isNormal ? type.path("nTeoria") : type.path("cTeoria")}
            />
          </Box>
        ))}
      </Box>
    </Container>
  );
}
