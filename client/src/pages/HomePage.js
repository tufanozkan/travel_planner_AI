import React, { useState } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  Button,
  Box,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormGroup,
  Slider,
} from "@mui/material";
import { styled } from "@mui/system";

const GradientBackground = styled(Box)(({ theme }) => ({
  background: "linear-gradient(120deg, #C6E7FF 0%, #D4F6FF 100%)",
  minHeight: "100vh",
  width: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center",
  padding: theme.spacing(2),
  fontFamily: "Poppins, Inter, Roboto, sans-serif",
}));

const MinimalCard = styled(Box)(({ theme }) => ({
  width: "100%",
  maxWidth: 520,
  marginBottom: theme.spacing(2),
  background: "rgba(255,255,255,0.92)",
  borderRadius: 18,
  justifyContent: "center",
  alignItems: "center",
  padding: theme.spacing(3, 2),
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
  boxShadow: "none",
  border: "none",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2, 1),
    maxWidth: "95vw",
  },
}));

const SearchBar = styled(TextField)(({ theme }) => ({
  width: "100%",
  maxWidth: "520px",
  backgroundColor: "#F4FAFF",
  borderRadius: "12px",
  boxShadow: "none",
  border: "1.5px solid #D4F6FF",
  marginBottom: theme.spacing(2),
  [theme.breakpoints.down("sm")]: {
    maxWidth: "95vw",
  },
  // ...existing code...
}));

const SearchButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(4), // Alt boşluk ekle
  padding: theme.spacing(1, 4),
  backgroundColor: "#20dbd8",
  color: "#12293d",
  fontSize: "1.05rem",
  fontFamily: "Poppins, Inter, sans-serif",
  fontWeight: 600,
  borderRadius: "18px",
  textTransform: "none",
  boxShadow: "none",
  letterSpacing: "0.04em",
  border: "none",
  transition: "all 0.2s cubic-bezier(.4,0,.2,1)",
  "&:hover": {
    backgroundColor: "#146f87",
    color: "#fff",
    boxShadow: "0 2px 12px rgba(32,219,216,0.10)",
  },
  width: "100%",
  maxWidth: 520,
  [theme.breakpoints.down("sm")]: {
    maxWidth: "95vw",
  },
}));

const HomePage = () => {
  const [form, setForm] = useState({
    search: "",
    budget: "orta",
    personCount: "1",
    interests: [],
    holidayDays: 3,
  });

  // Checkbox değişimi
  const handleInterestChange = (e) => {
    const { name, checked } = e.target;
    const interest = name.replace("interest-", "");
    setForm((prev) => {
      if (checked) {
        return { ...prev, interests: [...prev.interests, interest] };
      } else {
        return {
          ...prev,
          interests: prev.interests.filter((i) => i !== interest),
        };
      }
    });
  };

  // Diğer inputlar için değişim
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  // Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = {
        location: form.search, // search field contains the location
        budget: form.budget,
        personCount: form.personCount,
        interests: form.interests,
        holidayDays: form.holidayDays,
      };

      console.log("Gönderilen veri:", formData);

      const response = await axios.post("/api/search", formData);
      console.log("Sunucu yanıtı:", response.data);

      // Başarılı gönderim sonrası yapılacaklar
      if (response.data.data && response.data.data.response) {
        alert("Seyahat önerileri başarıyla alındı! Konsolu kontrol edin.");
      }
    } catch (err) {
      // Hata yönetimi
      console.error("Hata:", err.response?.data || err.message);
      alert("Bir hata oluştu. Lütfen konsolu kontrol edin.");
    }
  };

  return (
    <GradientBackground>
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontFamily: "Poppins, Inter, sans-serif",
            fontWeight: 700,
            letterSpacing: "0.05em",
            marginBottom: 3,
            color: "#12293d",
            fontSize: { xs: "2rem", sm: "2.5rem", md: "2.8rem" },
          }}
        >
          Hayalindeki Rotayı Keşfetmeye Hazır mısın?{" "}
          <span style={{ color: "#20dbd8" }}>YOLA ÇIK!</span>
        </Typography>
        <SearchBar
          placeholder="Gitmek istediğiniz şehir veya ülkeyi giriniz"
          variant="outlined"
          name="search"
          value={form.search}
          onChange={handleChange}
          sx={{
            marginBottom: 2,
          }}
        />
        <MinimalCard>
          {/* Bütçe */}
          <FormControl
            component="fieldset"
            sx={{ width: "100%", alignItems: "center" }}
          >
            <FormLabel
              component="legend"
              sx={{
                fontFamily: "Poppins, sans-serif",
                color: "#146f87",
                fontWeight: 600,
                mb: 1,
                fontSize: 16,
                textAlign: "center",
                width: "100%",
              }}
            >
              Bütçe
            </FormLabel>
            <RadioGroup
              row
              name="budget"
              value={form.budget}
              onChange={handleChange}
              sx={{ gap: 2, justifyContent: "center" }}
            >
              <FormControlLabel
                value="düşük"
                control={
                  <Radio
                    sx={{
                      color: "#C6E7FF",
                      "&.Mui-checked": { color: "#146f87" },
                    }}
                  />
                }
                label="Düşük"
                sx={{ fontFamily: "Poppins, sans-serif", color: "#12293d" }}
              />
              <FormControlLabel
                value="orta"
                control={
                  <Radio
                    sx={{
                      color: "#C6E7FF",
                      "&.Mui-checked": { color: "#146f87" },
                    }}
                  />
                }
                label="Orta"
                sx={{ fontFamily: "Poppins, sans-serif", color: "#12293d" }}
              />
              <FormControlLabel
                value="yüksek"
                control={
                  <Radio
                    sx={{
                      color: "#C6E7FF",
                      "&.Mui-checked": { color: "#146f87" },
                    }}
                  />
                }
                label="Yüksek"
                sx={{ fontFamily: "Poppins, sans-serif", color: "#12293d" }}
              />
            </RadioGroup>
          </FormControl>
          {/* Kişi Sayısı */}
          <FormControl
            component="fieldset"
            sx={{ width: "100%", alignItems: "center" }}
          >
            <FormLabel
              component="legend"
              sx={{
                fontFamily: "Poppins, sans-serif",
                color: "#146f87",
                fontWeight: 600,
                mb: 1,
                fontSize: 16,
                textAlign: "center",
                width: "100%",
              }}
            >
              Kişi Sayısı
            </FormLabel>
            <RadioGroup
              row
              name="personCount"
              value={form.personCount}
              onChange={handleChange}
              sx={{ gap: 2, justifyContent: "center" }}
            >
              <FormControlLabel
                value="1"
                control={
                  <Radio
                    sx={{
                      color: "#C6E7FF",
                      "&.Mui-checked": { color: "#146f87" },
                    }}
                  />
                }
                label="1"
                sx={{ fontFamily: "Poppins, sans-serif", color: "#12293d" }}
              />
              <FormControlLabel
                value="2"
                control={
                  <Radio
                    sx={{
                      color: "#C6E7FF",
                      "&.Mui-checked": { color: "#146f87" },
                    }}
                  />
                }
                label="2"
                sx={{ fontFamily: "Poppins, sans-serif", color: "#12293d" }}
              />
              <FormControlLabel
                value="3plus"
                control={
                  <Radio
                    sx={{
                      color: "#C6E7FF",
                      "&.Mui-checked": { color: "#146f87" },
                    }}
                  />
                }
                label="3 ve Daha Fazla"
                sx={{ fontFamily: "Poppins, sans-serif", color: "#12293d" }}
              />
            </RadioGroup>
          </FormControl>
          {/* İlgi Alanları */}
          <FormControl
            component="fieldset"
            sx={{ width: "100%", alignItems: "center" }}
          >
            <FormLabel
              component="legend"
              sx={{
                fontFamily: "Poppins, sans-serif",
                color: "#146f87",
                fontWeight: 600,
                mb: 1,
                fontSize: 16,
                textAlign: "center",
                width: "100%",
              }}
            >
              İlgi Alanları
            </FormLabel>
            <FormGroup
              row
              sx={{ gap: 1, justifyContent: "center", flexWrap: "wrap" }}
            >
              {[
                { name: "historical", label: "Tarihi" },
                { name: "nature", label: "Doğa" },
                { name: "sports", label: "Spor" },
                { name: "music", label: "Müzik" },
                { name: "cook", label: "Mutfak" },
                { name: "pub", label: "Bar" },
                { name: "technology", label: "Teknoloji" },
                { name: "art", label: "Sanat" },
                { name: "adventure", label: "Macera" },
                { name: "beach", label: "Plaj" },
                { name: "shopping", label: "Alışveriş" },
                { name: "museums", label: "Müzeler" },
                { name: "architecture", label: "Mimari" },
                { name: "parks", label: "Parklar" },
                { name: "nightlife", label: "Gece Hayatı" },
                { name: "street_art", label: "Sokak Sanatı" },
                { name: "food", label: "Yemek" },
                { name: "religion", label: "Din" },
              ].map((item) => (
                <FormControlLabel
                  key={item.name}
                  control={
                    <Checkbox
                      sx={{
                        color: "#C6E7FF",
                        "&.Mui-checked": { color: "#20dbd8" },
                      }}
                      name={`interest-${item.name}`}
                      checked={form.interests.includes(item.name)}
                      onChange={handleInterestChange}
                    />
                  }
                  label={item.label}
                  sx={{
                    fontFamily: "Poppins, sans-serif",
                    color: "#12293d",
                    fontSize: 14,
                  }}
                />
              ))}
            </FormGroup>
          </FormControl>
          {/* Kaç Günlük Tatil */}
          <FormControl
            component="fieldset"
            sx={{ width: "100%", alignItems: "center" }}
          >
            <FormLabel
              component="legend"
              sx={{
                fontFamily: "Poppins, sans-serif",
                color: "#146f87",
                fontWeight: 600,
                mb: 1,
                fontSize: 16,
                textAlign: "center",
                width: "100%",
              }}
            >
              Kaç Günlük Tatil?
            </FormLabel>
            <TextField
              type="number"
              name="holidayDays"
              inputProps={{ min: 1, max: 30 }}
              value={form.holidayDays}
              onChange={handleChange}
              sx={{
                mt: 1,
                width: 120,
                background: "#F4FAFF",
                borderRadius: 1,
                border: "1px solid #D4F6FF",
                fontFamily: "Poppins, sans-serif",
                color: "#12293d",
              }}
            />
          </FormControl>
        </MinimalCard>
        <SearchButton type="submit">Arama Yap</SearchButton>
      </form>
    </GradientBackground>
  );
};

export default HomePage;
