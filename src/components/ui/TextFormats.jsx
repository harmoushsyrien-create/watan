import React from "react";
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  Box,
  Paper,
  Divider,
} from "@mui/material";

// Section Title Component
const SectionTitle = ({ title }) => (
  <>
    <Typography
      variant="h4"
      component="h3"
      gutterBottom
      sx={{
        textAlign: "center",
        color: "var(--primary1)",
        marginBottom: "40px",
      }}
      fontWeight={700}
      color=""
    >
      {title}
      <Divider sx={{ marginTop: -0.6 }} />
    </Typography>
  </>
);

// Subsection Title Component
const SubsectionTitle = ({ subtitle }) => (
  <>
    <Typography
      variant="h5"
      component="h2"
      gutterBottom
      sx={{ color: "black", textAlign: "right", fontWeight: "700" }}
      fontSize={20}
    >
      {subtitle}
    </Typography>
  </>
);

// Ordered List Component with Custom Number Styling
const OrderedList = ({title,description, items }) => (
  <Box sx={{ marginBottom: 2, textAlign: "right", direction: "rtl" }}>
    <Typography
      variant="h6"
      component="h3"
      sx={{
        fontWeight: "bold",
        marginBottom: 1,
        color: "#3f51b5",
      }}
    >
      {title}
    </Typography>
    <List component="ol" sx={{ counterReset: "list" }}>
      {items.map((item, index) => (
        <ListItem
          key={index}
          sx={{
            display: "flex",
            alignItems: "flex-start",
            paddingLeft: "0",
            gap: "5px",
            "&:hover": {
              backgroundColor: "rgba(216, 163, 54,0.1)",
              cursor: "pointer",
            },
          }}
        >
          <Box
            sx={{
              minWidth: "20px",
              minHeight: "20px",
              display: "flex",
              justifyContent: "center",
              borderRadius: "4px",
              backgroundColor: "var(--primary1)",
              color: "white",
              fontWeight: "500",
              fontSize: "1rem",
              marginTop: "8px",
            }}
          >
            {index + 1} {/* Custom number */}
          </Box>
          <ListItemText
            primary={item}
            sx={{ textAlign: "right", direction: "rtl", fontSize: "1rem" }}
          />
        </ListItem>
      ))}
    </List>
  </Box>
);

// Unordered List Component with Custom Styles
const UnorderedList = ({ title, description, items }) => (
  <Box sx={{ marginBottom: 2, textAlign: "right", direction: "rtl" }}>
    <Typography
      variant="h6"
      component="h3"
      sx={{
        fontWeight: "bold",
        marginBottom: 1,
        color: "#3f51b5",
      }}
    >
      {title}
    </Typography>
    <List component="ul">
      {items.map((item, index) => (
        <ListItem
          key={index}
          sx={{
            "&::before": {
              content: '"•"', // Custom bullet symbol
              color: "var(--primary1)",
              fontSize: "1.5rem",
              marginRight: "10px",
            },
            "&:hover": {
              backgroundColor: "rgba(216, 163, 54,0.1)", // Hover effect
              cursor: "pointer",
            },
          }}
        >
          <ListItemText
            primary={item}
            sx={{
              textAlign: "right",
              direction: "rtl",
              fontSize: "1rem",
              fontWeight: 500,
            }}
          />
        </ListItem>
      ))}
    </List>
  </Box>
);

// Word Definition Component
const WordDefinition = ({ word, definition }) => (
  <Box sx={{ marginBottom: 2, textAlign: "right", direction: "rtl" }}>
    <Typography
      variant="h6"
      component="h3"
      sx={{ fontWeight: "bold", marginBottom: 1 }}
    >
      Word Definition:
    </Typography>
    <Paper sx={{ padding: 2, backgroundColor: "#f7f7f7" }}>
      <Typography variant="body1" sx={{ fontStyle: "italic" }}>
        Word: <strong>{word}</strong>
      </Typography>
      <Typography variant="body1">Definition: {definition}</Typography>
    </Paper>
  </Box>
);

// Note Component
const Note = ({ noteText }) => (
  <Box
    sx={{
      padding: 2,
      backgroundColor: "#ffeb3b",
      borderRadius: 1,
      textAlign: "right",
      direction: "rtl",
    }}
  >
    <Typography variant="h6" component="h3" sx={{ fontWeight: "bold" }}>
      Note:
    </Typography>
    <Typography variant="body1" component="div">
      {noteText}
    </Typography>
  </Box>
);

export {
  SectionTitle,
  SubsectionTitle,
  OrderedList,
  UnorderedList,
  WordDefinition,
  Note,
};
