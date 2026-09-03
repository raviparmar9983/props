import { useState, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  AppBar,
  Alert,
  Badge,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useMediaQuery,
  useTheme,
  Breadcrumbs,
  Tooltip,
} from "@mui/material";
import {
  MenuIcon,
  DashboardIcon,
  FolderIcon,
  SettingsIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  NotificationsIcon,
} from "./icons";
import { useAuthContext } from "../lib/contexts/AuthContext";
import { useNotifications, useProject } from "../lib/hooks";

const DRAWER_WIDTH = 260;
const COLLAPSED_WIDTH = 72;

const NAV_ITEMS = [
  { label: "Dashboard", path: "/", icon: <DashboardIcon /> },
  { label: "Projects", path: "/projects", icon: <FolderIcon /> },
  { label: "Settings", path: "/settings", icon: <SettingsIcon /> },
];

// A path segment that's an opaque id (uuid, cuid, ...) rather than a real
// route word — these never make a readable breadcrumb label on their own.
const ID_SEGMENT = /^[0-9a-f-]{8,}$/i;

interface Crumb {
  label: string;
  path: string;
  /** Raw path segment, set only when it's an opaque id needing a real-title lookup. */
  idValue: string | null;
}

function getBreadcrumbs(pathname: string): Crumb[] {
  const segments = pathname.split("/").filter(Boolean);
  const crumbs: Crumb[] = [];

  if (segments.length === 0) {
    crumbs.push({ label: "Dashboard", path: "/", idValue: null });
    return crumbs;
  }

  let currentPath = "";
  for (const seg of segments) {
    currentPath += `/${seg}`;
    if (ID_SEGMENT.test(seg)) {
      crumbs.push({ label: "", path: currentPath, idValue: seg });
    } else {
      const label = seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " ");
      crumbs.push({ label, path: currentPath, idValue: null });
    }
  }

  return crumbs;
}

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthContext();
  const { data: unreadRes } = useNotifications({ isRead: false, limit: 1 });
  const unreadCount = unreadRes?.meta.total ?? 0;

  const rawCrumbs = getBreadcrumbs(location.pathname);

  // The only route with an opaque id segment today is /projects/:id — look
  // up its title so the breadcrumb reads "Silver Enclave" instead of the
  // raw uuid. (Falls back to a generic label while the title is loading.)
  const idSegment = rawCrumbs.find((c) => c.idValue !== null)?.idValue ?? "";
  const { data: crumbProject } = useProject(idSegment);
  const crumbs = rawCrumbs.map((c) =>
    c.idValue !== null ? { ...c, label: crumbProject?.title ?? "Project" } : c,
  );
  const collapsed = !desktopOpen && !isMobile;

  const handleDesktopToggle = useCallback(() => {
    setDesktopOpen((prev) => !prev);
  }, []);

  const drawerContent = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: collapsed ? 1.5 : 2.5,
          py: 2.5,
          minHeight: 72,
        }}
      >
        {collapsed ? (
          <Box
            component="img"
            src="/icon-512.png"
            alt="VerifiedProps"
            sx={{ width: 36, height: 36, borderRadius: 1.5, flexShrink: 0 }}
          />
        ) : (
          <Box
            component="img"
            src="/logo-full.svg"
            alt="VerifiedProps"
            sx={{ height: 32, flexShrink: 0 }}
          />
        )}
        {isMobile && (
          <IconButton onClick={() => setMobileOpen(false)} sx={{ ml: "auto" }} size="small">
            <ChevronLeftIcon />
          </IconButton>
        )}
        {!isMobile && (
          <IconButton onClick={handleDesktopToggle} sx={{ ml: "auto" }} size="small">
            {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        )}
      </Box>
      <Divider sx={{ mx: 2 }} />
      <List sx={{ flex: 1, px: collapsed ? 1 : 1.5, py: 1 }}>
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.path === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.path);
          const button = (
            <ListItemButton
              key={item.path}
              component={Link}
              to={item.path}
              selected={isActive}
              onClick={() => isMobile && setMobileOpen(false)}
              sx={{
                borderRadius: 1.5,
                mb: 0.5,
                minHeight: 42,
                px: collapsed ? 1.5 : 1.5,
                justifyContent: collapsed ? "center" : "flex-start",
                "&.Mui-selected": {
                  backgroundColor: "#1B2A4A",
                  color: "white",
                  "& .MuiListItemIcon-root": { color: "white" },
                  "&:hover": { backgroundColor: "#253D63" },
                },
                "&:hover": {
                  backgroundColor: "#F0EDE8",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: collapsed ? 0 : 36,
                  color: isActive ? "inherit" : "#6B7280",
                  fontSize: "1.15rem",
                  justifyContent: "center",
                }}
              >
                {item.icon}
              </ListItemIcon>
              {!collapsed && (
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontWeight: isActive ? 600 : 450, fontSize: "0.875rem" }}
                />
              )}
            </ListItemButton>
          );
          return collapsed ? (
            <Tooltip key={item.path} title={item.label} placement="right" arrow>
              {button}
            </Tooltip>
          ) : (
            button
          );
        })}
      </List>
      <Divider sx={{ mx: 2 }} />
      <Box sx={{ p: 2, px: collapsed ? 1.5 : 2.5 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 1,
            justifyContent: collapsed ? "center" : "flex-start",
          }}
        >
          <Tooltip title={collapsed ? user?.email ?? "" : ""} placement="right" arrow>
            <Avatar sx={{ width: 32, height: 32, bgcolor: "#2F5D8A", fontSize: "0.75rem", fontWeight: 600, flexShrink: 0 }}>
              {user?.email?.charAt(0).toUpperCase() ?? "B"}
            </Avatar>
          </Tooltip>
          {!collapsed && (
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="caption" fontWeight={600} color="text.primary" display="block" noWrap sx={{ lineHeight: 1.3 }}>
                {user?.companyName ?? "Builder"}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" noWrap sx={{ fontSize: "0.65rem", lineHeight: 1.2 }}>
                {user?.email}
              </Typography>
            </Box>
          )}
        </Box>
        {!collapsed && (
          <Typography
            variant="caption"
            component="button"
            onClick={() => {
              logout().then(() => navigate("/login"));
            }}
            sx={{
              display: "block",
              color: "#6B7280",
              cursor: "pointer",
              border: "none",
              background: "none",
              p: 0,
              fontSize: "0.7rem",
              fontWeight: 500,
              mt: 0.5,
              textAlign: "left",
              "&:hover": { color: "#1B2A4A", textDecoration: "underline" },
            }}
          >
            Sign out
          </Typography>
        )}
        {collapsed && (
          <Tooltip title="Sign out" placement="right" arrow>
            <Typography
              variant="caption"
              component="button"
              onClick={() => {
                logout().then(() => navigate("/login"));
              }}
              sx={{
                display: "block",
                color: "#6B7280",
                cursor: "pointer",
                border: "none",
                background: "none",
                p: 0,
                mt: 0.5,
                textAlign: "center",
                "&:hover": { color: "#1B2A4A", textDecoration: "underline" },
              }}
            >
              Sign out
            </Typography>
          </Tooltip>
        )}
      </Box>
    </Box>
  );

  const currentWidth = collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <CssBaseline />
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: DRAWER_WIDTH },
        }}
      >
        {drawerContent}
      </Drawer>
      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          width: currentWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: currentWidth,
            borderRight: "1px solid",
            borderColor: "divider",
            transition: theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: "hidden",
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          transition: theme.transitions.create("margin", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            backgroundColor: "background.paper",
            color: "text.primary",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setMobileOpen(true)}
              sx={{ mr: 2, display: { md: "none" } }}
            >
              <MenuIcon />
            </IconButton>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDesktopToggle}
              sx={{ mr: 2, display: { xs: "none", md: "inline-flex" } }}
            >
              <MenuIcon />
            </IconButton>
            <Breadcrumbs
              separator={<ChevronRightIcon fontSize="small" />}
              sx={{
                flex: 1,
                minWidth: 0,
                overflow: "hidden",
                "& ol": { flexWrap: "nowrap", minWidth: 0 },
                "& li": { minWidth: 0, overflow: "hidden" },
                "& li:last-child": { minWidth: 0 },
              }}
            >
              {crumbs.map((c, i) => (
                <Typography
                  key={c.path}
                  variant="body2"
                  component={i < crumbs.length - 1 ? Link : "span"}
                  to={c.path}
                  noWrap
                  sx={{
                    display: "block",
                    minWidth: 0,
                    color: i < crumbs.length - 1 ? "text.secondary" : "text.primary",
                    textDecoration: "none",
                    fontWeight: i === crumbs.length - 1 ? 600 : 400,
                    flexShrink: i < crumbs.length - 1 ? 0 : 1,
                    "&:hover": i < crumbs.length - 1 ? { textDecoration: "underline" } : {},
                  }}
                >
                  {c.label}
                </Typography>
              ))}
            </Breadcrumbs>
            <Tooltip title={unreadCount > 0 ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}` : "Notifications"}>
              <IconButton
                component={Link}
                to="/"
                sx={{ color: "text.secondary" }}
                aria-label="Notifications"
              >
                <Badge
                  badgeContent={unreadCount}
                  max={9}
                  color="error"
                  sx={{ "& .MuiBadge-badge": { fontSize: "0.625rem", height: 16, minWidth: 16 } }}
                >
                  <NotificationsIcon fontSize="small" />
                </Badge>
              </IconButton>
            </Tooltip>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ ml: 1 }}>
              <Avatar sx={{ width: 36, height: 36, bgcolor: "primary.main", fontSize: "0.875rem" }}>
                {user?.email?.charAt(0).toUpperCase() ?? "B"}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
            >
              <MenuItem
                component={Link}
                to="/settings"
                onClick={() => setAnchorEl(null)}
              >
                Settings
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setAnchorEl(null);
                  logout().then(() => navigate("/login"));
                }}
              >
                Logout
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>
        <Box sx={{ flex: 1, minWidth: 0, p: { xs: 2, md: 3 }, backgroundColor: "background.default" }}>
          {user?.verificationStatus === "PENDING" && (
            <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
              Your profile is under review. Some features may be limited until you are verified.{" "}
              <Link to="/settings" style={{ fontWeight: 600, color: "inherit" }}>
                Upload documents
              </Link>{" "}
              to speed up the process.
            </Alert>
          )}
          {children}
        </Box>
      </Box>
    </Box>
  );
}
