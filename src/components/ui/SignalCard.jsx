import React from "react";
import Image from "next/image";
const SignalCard = ({ title, imageUrl, content}) => {
  const styles = {
    card: {
      backgroundColor: "#f8f9fa",
      borderRadius: "10px",
      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
      transition: "all 0.3s ease",
      //   maxWidth: "400px",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column", // Ensure vertical stacking
      justifyContent: "space-between", // Center content
      height: "100%", // Allow card to grow with content
      ":hover": {
        transform: "translateY(-5px)",
        boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
      },
    },
    title: {
      padding: "5px",
      margin: 0,
      fontSize: "1rem",
      fontWeight: "700",
      color: "#2d3436",
      textAlign: "center",
    },
    imageContainer: {
      backgroundColor: "#ffffff",
      padding: "16px",
      position: "relative",
      "&:before": {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "16px",
        background: "linear-gradient(to bottom, rgba(0,0,0,0.04), transparent)",
      },
    },
    image: {
      width: "100%",
      height: "180px",
      objectFit: "contain",
      display: "block",
      margin: "0 auto",
    },
    content: {
      padding: "10px",
      fontSize: "0.8rem",
      lineHeight: "1.6",
      color: "#636e72",
      textAlign: "center",
      flex: 1, // Allow content to take up available space and center it
      display: "flex",
      alignItems: "center",
      justifyContent: "center", // Vertically center the content
      fontWeight: "700",
    },
  };

  return (
    <div style={styles.card} data-aos={"fade-in"} data-aos-delay={100} data-aos-duration={1000}>
      <h2 style={styles.title}>{title}</h2>
      <div style={styles.imageContainer}>
        <Image
          src={imageUrl}
          alt={title}
          style={styles.image}
          width={100}
          height={100}
          loading="lazy"
        />
      </div>
      <div style={styles.content}>{content}</div>
    </div>
  );
};

export default SignalCard;
