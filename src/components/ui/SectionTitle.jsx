import React from "react";
import { Box, Typography } from "@mui/material";
export default function SectionTitle({ title, subTitle }) {
  return (
    <Box
      sx={{
        textAlign: "center",
        mb: 4,
      }}
    >
      <Typography
        variant="h4"
        fontWeight={600}
        sx={{
          mb: 1,
        }}
        data-aos="fade-up"
      >
        {title}
      </Typography>
      <Typography variant="subtitle1" data-aos="fade-up" fontSize={18} fontWeight={600} sx={{ color: "text.secondary" }}>
        {subTitle}
      </Typography>
    </Box>
  );
}
