import {
  AppBar,
  InputBase,
  styled,
  Toolbar,
  Typography,
  Box,
} from "@mui/material";
import React from "react";

const StyledToolbar = styled(Toolbar)({
  display: "flex",
  justifyContent: "space-between",
});

const Search = styled("div")(({ theme }) => ({
  backgroundColor: "white",
  padding: "0 10px",
  borderRadius: theme.shape.borderRadius,
  width: "40%",
}));
const Navbar = () => {
  return (
    <AppBar position="sticky">
      <StyledToolbar>
        <Typography variant="h6" sx={{ display: { xs: "none", sm: "block" } }}>
          sonar
        </Typography>
        <Search>
          <InputBase placeholder="search..." />
        </Search>
        <Box></Box>
      </StyledToolbar>
    </AppBar>
  );
};

export default Navbar;
