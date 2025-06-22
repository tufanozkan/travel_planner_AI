import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Popover,
  Box,
  TextField,
  Menu,
  MenuItem,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu"; // Menü İkonu

const Header = () => {
  const [loginAnchorEl, setLoginAnchorEl] = useState(null);
  const [signupAnchorEl, setSignupAnchorEl] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const isMobile = useMediaQuery("(max-width: 765px)");

  const handleLoginOpen = (event) => setLoginAnchorEl(event.currentTarget);
  const handleSignupOpen = (event) => setSignupAnchorEl(event.currentTarget);
  const handleClose = () => {
    setLoginAnchorEl(null);
    setSignupAnchorEl(null);
    setMenuAnchorEl(null);
  };

  const handleMenuOpen = (event) => setMenuAnchorEl(event.currentTarget);

  const isLoginOpen = Boolean(loginAnchorEl);
  const isSignupOpen = Boolean(signupAnchorEl);
  const isMenuOpen = Boolean(menuAnchorEl);

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: "#C6E7FF", // color1
        borderBottom: "2px solid #D4F6FF", // color2
      }}
    >
      <Toolbar
        sx={{
          justifyContent: isMobile ? "space-between" : "space-between",
          alignItems: "center",
        }}
      >
        {/* Login Butonu */}
        {!isMobile && (
          <Button
            onClick={handleLoginOpen}
            sx={{
              color: "#12293d", // koyu metin
              fontFamily: "Poppins, sans-serif",
              fontWeight: "600",
              textTransform: "uppercase",
              "&:hover": { backgroundColor: "#D4F6FF" }, // hover
            }}
          >
            Login
          </Button>
        )}

        {/* Başlık */}
        <Typography
          variant="h5"
          component="div"
          sx={{
            color: "#12293d", // koyu metin
            fontFamily: "Poppins, sans-serif",
            fontWeight: "700",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            textAlign: "center",
            flexGrow: 1,
          }}
        >
          Travel Planner AI
        </Typography>

        {/* Sign Up Butonu */}
        {!isMobile && (
          <Button
            onClick={handleSignupOpen}
            sx={{
              color: "#12293d", // koyu metin
              fontFamily: "Poppins, sans-serif",
              fontWeight: "600",
              textTransform: "uppercase",
              "&:hover": { backgroundColor: "#D4F6FF" },
            }}
          >
            Sign Up
          </Button>
        )}

        {/* Mobil Menü */}
        {isMobile && (
          <>
            <IconButton color="inherit" onClick={handleMenuOpen}>
              <MenuIcon sx={{ color: "#20dbd8" }} />
            </IconButton>
            <Menu
              anchorEl={menuAnchorEl}
              open={isMenuOpen}
              onClose={handleClose}
              PaperProps={{
                sx: {
                  backgroundColor: "#C6E7FF", // color1
                  color: "#12293d", // koyu metin
                  "& .MuiMenuItem-root": {
                    fontFamily: "Poppins, sans-serif",
                    "&:hover": { backgroundColor: "#D4F6FF" },
                  },
                },
              }}
            >
              <MenuItem onClick={handleLoginOpen}>Login</MenuItem>
              <MenuItem onClick={handleSignupOpen}>Sign Up</MenuItem>
            </Menu>
          </>
        )}
      </Toolbar>

      {/* Login Popover */}
      <Popover
        open={isLoginOpen}
        anchorEl={loginAnchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Box
          component="form"
          sx={{
            p: 2,
            width: "300px",
            backgroundColor: "#FBFBFB", // popover arka plan
            color: "#12293d", // metin
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, color: "#FFDDae" }}>
            Login
          </Typography>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            sx={{
              mb: 2,
              input: { color: "#12293d" },
              label: { color: "#12293d" },
            }}
          />
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            sx={{
              mb: 2,
              input: { color: "#12293d" },
              label: { color: "#12293d" },
            }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mb: 2, backgroundColor: "#FFDDae", color: "#12293d" }}
          >
            Login
          </Button>
          <Button
            fullWidth
            variant="outlined"
            sx={{ color: "#FFDDae", borderColor: "#FFDDae" }}
          >
            Google ile Giriş
          </Button>
        </Box>
      </Popover>

      {/* Signup Popover */}
      <Popover
        open={isSignupOpen}
        anchorEl={signupAnchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Box
          component="form"
          sx={{
            p: 2,
            width: "300px",
            backgroundColor: "#FBFBFB", // popover arka plan
            color: "#12293d", // metin
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, color: "#FFDDae" }}>
            Sign Up
          </Typography>
          <TextField
            fullWidth
            label="Name"
            name="name"
            sx={{
              mb: 2,
              input: { color: "#12293d" },
              label: { color: "#12293d" },
            }}
          />
          <TextField
            fullWidth
            label="Surname"
            name="surname"
            sx={{
              mb: 2,
              input: { color: "#12293d" },
              label: { color: "#12293d" },
            }}
          />
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            sx={{
              mb: 2,
              input: { color: "#12293d" },
              label: { color: "#12293d" },
            }}
          />
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            sx={{
              mb: 2,
              input: { color: "#12293d" },
              label: { color: "#12293d" },
            }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mb: 2, backgroundColor: "#FFDDae", color: "#12293d" }}
          >
            Sign Up
          </Button>
          <Button
            fullWidth
            variant="outlined"
            sx={{ color: "#FFDDae", borderColor: "#FFDDae" }}
          >
            Google ile Kayıt
          </Button>
        </Box>
      </Popover>
    </AppBar>
  );
};

export default Header;
