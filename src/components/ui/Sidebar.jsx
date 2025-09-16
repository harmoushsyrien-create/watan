import * as React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import BookIcon from "@mui/icons-material/Book"; // Glossary icon for open
import CloseIcon from "@mui/icons-material/Close"; // Close icon
import MenuIcon from "@mui/icons-material/Menu"; // Menu icon for opening
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"; // Expand arrow
import ExpandLessIcon from "@mui/icons-material/ExpandLess"; // Collapse arrow
import { ThemeProvider, createTheme, Collapse } from "@mui/material";
import bookData from "@/pages/book.json"; // Importing JSON file directly
import MenuBookIcon from "@mui/icons-material/MenuBook";
export default function Sidebar() {
  const [open, setOpen] = React.useState(false);
  const [openSections, setOpenSections] = React.useState(null); // Track the open section
  const customTheme = createTheme({
    direction: "ltr",
    typography: {
      fontFamily: "var(--font-cairo)", // Use CSS variable for Cairo
    },
  });

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const handleToggleSection = (sectionId) => {
    setOpenSections((prev) => (prev === sectionId ? null : sectionId)); // Toggle section visibility
  };

  const handleArrowClick = (event, sectionId) => {
    event.stopPropagation(); // Prevent drawer from closing when clicking the arrow
    handleToggleSection(sectionId); // Toggle sublist visibility
  };

  const handleTitleClick = (sectionId) => {
    setOpen(false); // Close the drawer when title is clicked
    setOpenSections((prev) => (prev === sectionId ? null : prev)); // Do not toggle sublist, just close the drawer
  };

  const renderItems = (items) => {
    return items.map((item) => (
      <ListItem key={item.id} disablePadding>
        <ListItemButton>
          <ListItemText
            primary={item.name}
            sx={{
              textAlign: "right",
              direction: "rtl",
              fontFamily: "cairo",
              opacity: "0.8",
              paddingRight: "10px",
            }}
            primaryTypographyProps={{ fontWeight: "600", fontSize: "14px" }}
          />
        </ListItemButton>
      </ListItem>
    ));
  };

  const DrawerList = (
    <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)}>
      <List>
        {bookData.map((section) => (
          <div key={section.id}>
            {/* Title click handler */}
            <ListItem button onClick={() => handleTitleClick(section.id)}>
              <ListItemText
                primary={section.title}
                sx={{
                  textAlign: "right",
                  direction: "rtl",
                  fontFamily: "cairo",
                }}
                primaryTypographyProps={{ fontWeight: "700", fontSize: "16px" }}
              />
              {/* Expand/collapse button */}
              {section.items?           <IconButton
                onClick={(event) => handleArrowClick(event, section.id)}
              >
                {openSections === section.id ? (
                  <ExpandLessIcon /> // Show collapse arrow when section is open
                ) : (
                  <ExpandMoreIcon /> // Show expand arrow when section is closed
                )}
              </IconButton>:<></>}

            </ListItem>
            {/* Collapse sublist */}
            <Collapse
              in={openSections === section.id}
              timeout="auto"
              unmountOnExit
            >
              <List
                component="div"
                disablePadding
                sx={{ textAlign: "right", direction: "rtl" }}
              >
                {section.items && renderItems(section.items)}
              </List>
            </Collapse>
          </div>
        ))}
      </List>
      <Divider />
    </Box>
  );

  return (
    <div>
      {/* IconButton to open/close the drawer */}
      <IconButton
        onClick={toggleDrawer(!open)}
        sx={{
          position: "fixed",
          bottom: 20,
          right: 20,
          zIndex: 1300, // Set the button's z-index higher than the drawer
          backgroundColor: open ? "#f44336" : "#d8a336", // Change color based on state
          color: "white",
          borderRadius: "50%",
          width: 60,
          height: 60,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          boxShadow: 3,
          "&:hover": {
            backgroundColor: open ? "#e53935" : "var(--primary2)", // Hover effect
          },
        }}
      >
        {open ? <CloseIcon /> : <MenuBookIcon />} {/* Open/Close icons */}
      </IconButton>

      <ThemeProvider theme={customTheme}>
        <Drawer
          open={open}
          onClose={toggleDrawer(false)}
          anchor="right"
          sx={{
            zIndex: 1200, // Ensure it's above other elements
          }}
          PaperProps={{
            sx: {
              top: "90px", // Move it down 100px
              height: "calc(100% - 90px)", // Adjust height to fit within remaining space
              paddingBottom: "100px",
            },
          }}
        >
          {DrawerList}
        </Drawer>
      </ThemeProvider>
    </div>
  );
}
