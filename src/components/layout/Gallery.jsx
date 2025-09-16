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
    { id: 2, src: "/images/gallery/2.jpg", alt: "Image 2" },
    { id: 1, src: "/images/gallery/1.jpg", alt: "Image 1" }, 
    { id: 3, src: "/images/gallery/3.jpg", alt: "New Image" },
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
        // Mobile Swiper
        <Box sx={{ height: "calc(100vh - 120px)" }}>
          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={0}
            slidesPerView={1}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            loop={true}
            style={{ height: "100%" }}
          >
            {images.map((img) => (
              <SwiperSlide key={img.id}>
                <Box sx={{ position: "relative", height: "100%" }}>
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    style={{ objectFit: "cover" }}
                    sizes="100vw"
                    priority
                  />
                </Box>
              </SwiperSlide>
            ))}
          </Swiper>
        </Box>
      ) : (
        // Desktop Grid Layout
        <Grid
          container
          wrap="nowrap"
          sx={{
            height: "500px",
            justifyContent: "space-between",
          }}
        >
          {images.map((img) => (
            <Grid
              item
              key={img.id}
              sx={{
                flex: "1 0 auto",
                position: "relative",
              }}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                style={{ objectFit: "cover" }}
                sizes="100vw"
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default GallerySection;