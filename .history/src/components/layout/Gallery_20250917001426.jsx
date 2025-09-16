import { Box, Grid, useMediaQuery, useTheme } from "@mui/material";
import Image from "next/image";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';

const GallerySection = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const images = [
    { id: 1, src: "/images/gallery/details.png", alt: "Details Image" }
  ];

  return (
    <Box
      data-aos="fade-in"
      data-aos-duration="600"
      sx={{
        width: "100%",
        overflow: "hidden",
        borderTop: "10px solid var(--primary1)",
        borderBottom: "10px solid var(--primary1)",
      }}
    >
      {isMobile ? (
        // Mobile - Single Image Display
        <Box sx={{ 
          height: "400px", 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center",
          px: 2
        }}>
          <Box sx={{ 
            position: "relative", 
            width: "100%", 
            maxWidth: "600px",
            height: "350px",
            borderRadius: 2,
            overflow: "hidden",
            boxShadow: 3
          }}>
            <Image
              src={images[0].src}
              alt={images[0].alt}
              fill
              style={{ objectFit: "contain" }}
              sizes="(max-width: 768px) 100vw, 600px"
              priority
            />
          </Box>
        </Box>
      ) : (
        // Desktop - Single Image Display
        <Box sx={{ 
          height: "500px", 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center",
          px: 4
        }}>
          <Box sx={{ 
            position: "relative", 
            width: "100%", 
            maxWidth: "800px",
            height: "450px",
            borderRadius: 2,
            overflow: "hidden",
            boxShadow: 4
          }}>
            <Image
              src={images[0].src}
              alt={images[0].alt}
              fill
              style={{ objectFit: "contain" }}
              sizes="(max-width: 1200px) 100vw, 800px"
            />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default GallerySection;