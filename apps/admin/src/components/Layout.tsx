import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  AppBar,
  Avatar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import CategoryIcon from "@mui/icons-material/Category";
import RateReviewIcon from "@mui/icons-material/RateReview";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuthContext } from "../lib/contexts/AuthContext";

const DRAWER_WIDTH = 240;

const NAV_ITEMS = [
  { label: "Dashboard", path: "/", icon: <DashboardIcon /> },
  { label: "Review Queue", path: "/projects/review-queue", icon: <RateReviewIcon /> },
  { label: "Builders", path: "/builders", icon: <VerifiedUserIcon /> },
  { label: "Amenities", path: "/amenities", icon: <CategoryIcon /> },
];

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthContext();

  const drawerContent = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box sx={{ px: 2.5, py: 2.5 }}>
        <Box
          component="img"
          src="/logo-full.svg"
          alt="VerifiedProps"
          sx={{ height: 30, display: "block" }}
        />
        <Typography fontWeight={700} sx={{ color: "#1B2A4A", lineHeight: 1.2, mt: 1.5 }}>
          Admin Console
        </Typography>
        <Typography variant="caption" sx={{ color: "#9199A8" }}>
          VerifiedProps
        </Typography>
      </Box>

      <List sx={{ px: 1 }}>
        {NAV_ITEMS.map((item) => {
          const active =
            item.path === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.path);
          return (
            <ListItemButton
              key={item.path}
              component={Link}
              to={item.path}
              selected={active}
              onClick={() => setMobileOpen(false)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                ...(active
                  ? { backgroundColor: "rgba(27, 42, 74, 0.08)", "&:hover": { backgroundColor: "rgba(27, 42, 74, 0.08)" } }
                  : {}),
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: active ? "#1B2A4A" : "#5B6270" }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontSize: "0.9rem", fontWeight: active ? 600 : 500 }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          backgroundColor: "#FAF9F6",
          color: "#1F2430",
          boxShadow: "none",
          borderBottom: "1px solid #E2E5EA",
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            onClick={() => setMobileOpen((v) => !v)}
            sx={{ mr: 2, display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" fontWeight={700} sx={{ flexGrow: 1 }}>
            Admin Console
          </Typography>
          <Tooltip title="Account">
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <Avatar sx={{ width: 32, height: 32, fontSize: "0.9rem", bgcolor: "#1B2A4A" }}>
                {user?.email?.charAt(0)?.toUpperCase() ?? "A"}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant={isMobile ? "temporary" : "permanent"}
          open={isMobile ? mobileOpen : true}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH,
              boxSizing: "border-box",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          p: { xs: 2, md: 4 },
          mt: 8,
        }}
      >
        {children}
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem disabled sx={{ fontSize: "0.85rem" }}>
          {user?.email}
        </MenuItem>
        <MenuItem
          onClick={async () => {
            setAnchorEl(null);
            await logout();
            navigate("/login", { replace: true });
          }}
        >
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </Box>
  );
}
