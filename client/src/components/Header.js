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
        backgroundColor: "#12293d", // color1
        borderBottom: "2px solid #12465f", // color2
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
              color: "#20dbd8", // color5
              fontFamily: "Poppins, sans-serif",
              fontWeight: "600",
              textTransform: "uppercase",
              "&:hover": { backgroundColor: "#12465f" }, // color2
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
            color: "#20dbd8", // color5
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
              color: "#20dbd8", // color5
              fontFamily: "Poppins, sans-serif",
              fontWeight: "600",
              textTransform: "uppercase",
              "&:hover": { backgroundColor: "#12465f" }, // color2
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
                  backgroundColor: "#12293d", // color1
                  color: "#20dbd8", // color5
                  "& .MuiMenuItem-root": {
                    fontFamily: "Poppins, sans-serif",
                    "&:hover": { backgroundColor: "#12465f" },
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
            backgroundColor: "#12293d", // color1
            color: "#20dbd8", // color5
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, color: "#1aa3b5" }}>
            Login
          </Typography>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            sx={{
              mb: 2,
              input: { color: "#146f87" },
              label: { color: "#146f87" },
            }}
          />
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            sx={{
              mb: 2,
              input: { color: "#146f87" },
              label: { color: "#146f87" },
            }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mb: 2, backgroundColor: "#12465f" }}
          >
            Login
          </Button>
          <Button
            fullWidth
            variant="outlined"
            sx={{ color: "#1aa3b5", borderColor: "#1aa3b5" }}
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
            backgroundColor: "#12293d", // color1
            color: "#20dbd8", // color5
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, color: "#1aa3b5" }}>
            Sign Up
          </Typography>
          <TextField
            fullWidth
            label="Name"
            name="name"
            sx={{
              mb: 2,
              input: { color: "#146f87" },
              label: { color: "#146f87" },
            }}
          />
          <TextField
            fullWidth
            label="Surname"
            name="surname"
            sx={{
              mb: 2,
              input: { color: "#146f87" },
              label: { color: "#146f87" },
            }}
          />
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            sx={{
              mb: 2,
              input: { color: "#146f87" },
              label: { color: "#146f87" },
            }}
          />
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            sx={{
              mb: 2,
              input: { color: "#146f87" },
              label: { color: "#146f87" },
            }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mb: 2, backgroundColor: "#12465f" }}
          >
            Sign Up
          </Button>
          <Button
            fullWidth
            variant="outlined"
            sx={{ color: "#1aa3b5", borderColor: "#1aa3b5" }}
          >
            Google ile Kayıt
          </Button>
        </Box>
      </Popover>
    </AppBar>
  );
};

export default Header;
