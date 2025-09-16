// components/ui/quizPage/Question.jsx
import React, { useState, useEffect } from "react";
import { Box, Button, Typography, IconButton, Snackbar } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import parseText from "@/components/ui/quizPage/parseText";
import {
  loadQuizBookmarks,
  bookmarkQuestionTypeLevel,
  unbookmarkQuestionTypeLevel,
} from "@/components/util/quizStorage";

const QuestionComponent = ({
  question,
  options,
  correctAnswer,
  userAnswer,
  showAnswer,
  onSelect,
  onBookmarkToggle,
  questionNumber,
  qType,
  type,
  quizNumber,
  questionIndex,
}) => {
  const [bookmarked, setBookmarked] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // On mount, check if the question is bookmarked
  useEffect(() => {
    const checkBookmarked = async () => {
      try {
        const bookmarksArray = await loadQuizBookmarks(qType, type, quizNumber);
        if (bookmarksArray.includes(questionIndex)) {
          setBookmarked(true);
        }
      } catch (error) {
        console.error("Error loading bookmarks:", error);
      }
    };
    checkBookmarked();
  }, [qType, type, quizNumber, questionIndex]);

  // Toggle bookmark and notify parent
  const handleToggleBookmark = async () => {
    try {
      setOpenSnackbar(true);
      if (bookmarked) {
        await unbookmarkQuestionTypeLevel(
          qType,
          type,
          quizNumber,
          questionIndex
        );
        setBookmarked(false);
        if (onBookmarkToggle) {
          onBookmarkToggle(quizNumber, questionIndex, false);
        }
      } else {
        await bookmarkQuestionTypeLevel(qType, type, quizNumber, questionIndex);
        setBookmarked(true);
        if (onBookmarkToggle) {
          onBookmarkToggle(quizNumber, questionIndex, true);
        }
      }
    } catch (error) {
      console.error("Bookmark toggle error:", error);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setOpenSnackbar(false);
  };

  const getOptionKey = (num) => {
    switch (num) {
      case "1":
        return "a";
      case "2":
        return "b";
      case "3":
        return "c";
      case "4":
        return "d";
      default:
        return "";
    }
  };

  return (
    <Box
      key={questionNumber}
      sx={{
        position: "relative",
        border: "1px solid #ddd",
        borderRadius: 2,
        p: 2,
        mb: 1,
        bgcolor: "#fdfdfd",
        boxShadow: 1,
      }}
    >
      {/* Bookmark icon */}
      <IconButton
        onClick={handleToggleBookmark}
        sx={{ position: "absolute", top: 0, left: 0 }}
        aria-label="Bookmark this question"
      >
        {bookmarked ? <BookmarkIcon color="primary" /> : <BookmarkBorderIcon />}
      </IconButton>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        message={bookmarked ? "تم حفظ السؤال بنجاح" : "تم إلغاء حفظ السؤال"}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
      <Typography
        variant="h6"
        gutterBottom
        fontSize="16px"
        fontWeight={800}
        mb={4}
        pl="10px"
      >
        {questionNumber}- {parseText(question)}
      </Typography>
      <Box>
        {["1", "2", "3", "4"]
          .filter((num) => options[getOptionKey(num)] !== undefined)
          .map((num) => {
            const optionKey = getOptionKey(num);
            const optionText = options[optionKey] || "";
            let bgColor = "grey.100";
            let textColor = "text.primary";

            if (showAnswer) {
              if (num === correctAnswer) {
                bgColor = "#81c784";
                textColor = "#051406";
              } else if (num === userAnswer && num !== correctAnswer) {
                bgColor = "#e57373";
                textColor = "#2e0606";
              } else {
                textColor = "#757575";
              }
            } else if (num === userAnswer) {
              bgColor = "warning.light";
              textColor = "white";
            }
            const isSelected = userAnswer === num;
            const isCorrect = num === correctAnswer;
            const isIncorrect = isSelected && !isCorrect;
            return (
              <Button
                key={num}
                fullWidth
                onClick={() => onSelect && onSelect(num)}
                disabled={showAnswer}
                sx={{
                  mt: 1.1,
                  textAlign: "left",
                  bgcolor: bgColor,
                  color: textColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: 1.7,
                  borderRadius: 1,
                  boxShadow: isSelected ? 3 : 1,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    bgcolor: showAnswer
                      ? bgColor
                      : isSelected
                      ? "warning.main"
                      : "#e0e0e0",
                    color: isSelected
                      ? "white"
                      : showAnswer
                      ? textColor
                      : "text.primary",
                    boxShadow: showAnswer ? (isSelected ? 3 : 1) : 4,
                  },
                  "&:disabled": {
                    bgcolor: bgColor,
                    color: textColor,
                    boxShadow: "none",
                  },
                }}
                aria-label={
                  showAnswer
                    ? isCorrect
                      ? `الخيار ${num}: الإجابة الصحيحة`
                      : isIncorrect
                      ? `الخيار ${num}: إجابتك الخاطئة`
                      : `الخيار ${num}`
                    : `اختر الخيار ${num}: ${optionText}`
                }
              >
                <Typography
                  variant="body1"
                  fontWeight={600}
                  fontSize="15px"
                  textAlign="right"
                  sx={{ flexGrow: 1 }}
                >
                  {parseText(optionText)}
                </Typography>
                {showAnswer &&
                  (isCorrect ? (
                    <CheckCircleIcon color="success" />
                  ) : isIncorrect ? (
                    <CancelIcon />
                  ) : null)}
              </Button>
            );
          })}
      </Box>
    </Box>
  );
};

export default QuestionComponent;
