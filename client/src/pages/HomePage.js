import React from "react";
import { Container, Typography, Button, Box, TextField } from "@mui/material";
import { styled } from "@mui/system";

const GradientBackground = styled(Box)(({ theme }) => ({
  background: "linear-gradient(120deg, #12293d 0%, #12465f 100%)", // color1 ve color2
  height: "86vh",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center",
  padding: theme.spacing(4),
}));

const SearchBar = styled(TextField)(({ theme }) => ({
  width: "100%",
  maxWidth: "600px",
  backgroundColor: "#ffffff", // Beyaz arka plan
  borderRadius: "8px",
  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
  "& .MuiOutlinedInput-root": {
    borderRadius: "8px",
    "& fieldset": {
      borderColor: "#146f87", // color3
    },
    "&:hover fieldset": {
      borderColor: "#1aa3b5", // color4
    },
    "&.Mui-focused fieldset": {
      borderColor: "#20dbd8", // color5
    },
  },
  "& input": {
    fontSize: "1rem",
    fontFamily: "Poppins, sans-serif",
    color: "#12465f", // color2
  },
}));

const SearchButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: theme.spacing(1, 4),
  backgroundColor: "#1aa3b5", // color4
  color: "#ffffff", // Beyaz metin
  fontSize: "1rem",
  fontFamily: "Poppins, sans-serif",
  fontWeight: "bold",
  borderRadius: "24px",
  textTransform: "uppercase",
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    backgroundColor: "#20dbd8", // color5
    boxShadow: "0 4px 15px rgba(32, 219, 216, 0.3)", // color5'in şeffaf versiyonu
  },
}));

const HomePage = () => {
  return (
    <GradientBackground>
      <Typography
        variant="h3"
        component="h1"
        sx={{
          fontFamily: "Poppins, sans-serif",
          fontWeight: "700",
          letterSpacing: "0.05em",
          marginBottom: 3,
          color: "#ffffff", // Beyaz metin
        }}
      >
        Hayalindeki Rotayı Keşfetmeye Hazır mısın!?
      </Typography>
      <SearchBar
        placeholder="Nereye gitmek istersiniz?"
        variant="outlined"
        sx={{
          marginBottom: 2,
        }}
      />
      <SearchButton>Arama Yap</SearchButton>
    </GradientBackground>
  );
};

export default HomePage;
