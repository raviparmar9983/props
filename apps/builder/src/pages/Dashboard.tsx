import { useNavigate, Link } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  FolderIcon,
  CheckCircleIcon,
  AddIcon,
  AccessTimeIcon,
  PeopleIcon,
  NotificationsIcon,
  ChevronRightIcon,
  SettingsIcon,
} from "../components/icons";
import {
  useProjects,
  useLeads,
  useNotifications,
  useProfile,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useUpdateLeadStatus,
} from "../lib/hooks";
import { StatusBadge } from "../components/StatusBadge";
import { EmptyState } from "../components/EmptyState";
import { SkeletonStatCards, SkeletonList } from "../components/Skeletons";
import { relativeTime } from "../utils/format";
import type { ProjectSummary } from "../lib/api/schemas";

const PUBLISHED_STATUSES = ["UPCOMING", "UNDER_CONSTRUCTION", "READY"];

function isPublished(status: string) {
  return PUBLISHED_STATUSES.includes(status);
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: projectsRes, isLoading: loadingProjects } = useProjects({ limit: 100 });
  const { data: profile } = useProfile();
  const { data: newLeadsRes } = useLeads({ status: "NEW", limit: 1 });
  const { data: recentLeadsRes, isLoading: loadingLeads } = useLeads({ limit: 5 });
  const { data: unreadRes } = useNotifications({ isRead: false, limit: 1 });
  const { data: recentNotifRes, isLoading: loadingNotifs } = useNotifications({ limit: 5 });
  const markAllRead = useMarkAllNotificationsRead();
  const markRead = useMarkNotificationRead();
  const updateLeadStatus = useUpdateLeadStatus();

  const projects = projectsRes?.data ?? [];
  const publishedCount = projects.filter((p) => isPublished(p.status)).length;
  const pendingReviewCount = projects.filter((p) => p.reviewStatus === "PENDING_REVIEW").length;
  const newLeadsCount = newLeadsRes?.meta.total ?? 0;
  const unreadCount = unreadRes?.meta.total ?? 0;

  const recentProjects: ProjectSummary[] = [...projects]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);
  const recentLeads = recentLeadsRes?.data ?? [];
  const recentNotifs = recentNotifRes?.data ?? [];

  const profileGaps = profile
    ? [
        !profile.reraNumber && "RERA number",
        !profile.yearsInBusiness && "years in business",
        !profile.totalProjectsCompleted && "completed project count",
        !profile.logo && "company logo",
      ].filter(Boolean)
    : [];

  const stats = [
    {
      label: "Total Projects",
      value: projects.length,
      icon: <FolderIcon />,
      color: "#1B2A4A",
      bg: "#EBF0F7",
    },
    {
      label: "Published",
      value: publishedCount,
      icon: <CheckCircleIcon />,
      color: "#1F8A5F",
      bg: "#E6F4ED",
    },
    {
      label: "Pending Review",
      value: pendingReviewCount,
      icon: <AccessTimeIcon />,
      color: "#B5750B",
      bg: "#FBF0DC",
    },
    {
      label: "New Leads",
      value: newLeadsCount,
      icon: <PeopleIcon />,
      color: "#2F5D8A",
      bg: "#E4EDF5",
    },
  ];

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
          gap: 1.5,
          mb: 3,
        }}
      >
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
            <Typography variant="h5" fontWeight={700} sx={{ color: "#1F2430" }}>
              {profile?.companyName ? `Welcome back, ${profile.companyName}` : "Dashboard"}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            Here's what's happening across your projects
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/projects/new")}
        >
          New Project
        </Button>
      </Box>

      {loadingProjects ? (
        <SkeletonStatCards />
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
            gap: 2,
            mb: 3,
          }}
        >
          {stats.map((card) => (
            <Card
              key={card.label}
              elevation={0}
              sx={{
                border: "1px solid #E2E5EA",
                borderRadius: 2,
                transition: "box-shadow 0.15s",
                "&:hover": { boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
              }}
            >
              <CardContent sx={{ py: 2.5, px: 2.5, "&:last-child": { pb: 2.5 } }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 1.5,
                      backgroundColor: card.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: card.color,
                      flexShrink: 0,
                    }}
                  >
                    {card.icon}
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="h5" fontWeight={700} sx={{ lineHeight: 1.2, color: "#1F2430" }}>
                      {card.value}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }} noWrap>
                      {card.label}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {profile && profileGaps.length > 0 && (
        <Card sx={{ mb: 3, border: "1px solid #E2E5EA" }} elevation={0}>
          <CardContent sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
            <Box>
              <Typography variant="subtitle2" fontWeight={600}>
                Complete your builder profile
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                Adding your {profileGaps.join(", ")} helps buyers trust your listings.
              </Typography>
            </Box>
            <Button
              component={Link}
              to="/settings"
              variant="outlined"
              size="small"
              endIcon={<ChevronRightIcon fontSize="small" />}
              sx={{ flexShrink: 0 }}
            >
              Go to Settings
            </Button>
          </CardContent>
        </Card>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" },
          gap: 3,
          alignItems: "start",
        }}
      >
        {/* Left column */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
          <Card sx={{ border: "1px solid #E2E5EA" }} elevation={0}>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <Typography variant="h6">Recent Projects</Typography>
                <Button
                  component={Link}
                  to="/projects"
                  size="small"
                  endIcon={<ChevronRightIcon fontSize="small" />}
                  sx={{ textTransform: "none" }}
                >
                  View all
                </Button>
              </Box>
              {loadingProjects ? (
                <SkeletonList rows={3} />
              ) : recentProjects.length === 0 ? (
                <EmptyState
                  icon={<FolderIcon sx={{ fontSize: 48 }} />}
                  title="No projects yet"
                  description="Create your first project to start showcasing it to buyers."
                  actionLabel="Create Project"
                  onAction={() => navigate("/projects/new")}
                />
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  {recentProjects.map((project, i) => {
                    const thumb = project.media?.find((m) => m.isPrimary) ?? project.media?.[0];
                    return (
                      <Box
                        key={project.id}
                        onClick={() => navigate(`/projects/${project.id}`)}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          py: 1.5,
                          borderTop: i === 0 ? "none" : "1px solid #F1F2F5",
                          cursor: "pointer",
                          "&:hover": { backgroundColor: "#FAF9F6" },
                        }}
                      >
                        {thumb ? (
                          <Box
                            component="img"
                            src={thumb.url}
                            alt=""
                            sx={{ width: 48, height: 40, objectFit: "cover", borderRadius: 1, flexShrink: 0, bgcolor: "#EBF0F7" }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: 48,
                              height: 40,
                              borderRadius: 1,
                              flexShrink: 0,
                              bgcolor: "#EBF0F7",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#1B2A4A",
                            }}
                          >
                            <FolderIcon sx={{ fontSize: 18 }} />
                          </Box>
                        )}
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography variant="body2" fontWeight={500} noWrap>
                            {project.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {project.city?.name ?? "—"} · updated {relativeTime(project.updatedAt)}
                          </Typography>
                        </Box>
                        <StatusBadge status={project.status} />
                      </Box>
                    );
                  })}
                </Box>
              )}
            </CardContent>
          </Card>

          <Card sx={{ border: "1px solid #E2E5EA" }} elevation={0}>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <Typography variant="h6">Recent Leads</Typography>
                {newLeadsCount > 0 && (
                  <Typography variant="caption" sx={{ color: "#2F5D8A", fontWeight: 600 }}>
                    {newLeadsCount} new
                  </Typography>
                )}
              </Box>
              {loadingLeads ? (
                <SkeletonList rows={3} />
              ) : recentLeads.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: "center" }}>
                  No leads yet. Buyer enquiries on your published projects will show up here.
                </Typography>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  {recentLeads.map((lead, i) => (
                    <Box
                      key={lead.id}
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 1.5,
                        py: 1.5,
                        borderTop: i === 0 ? "none" : "1px solid #F1F2F5",
                        flexWrap: "wrap",
                      }}
                    >
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography variant="body2" fontWeight={500} noWrap>
                          {lead.project?.title ?? "Project"}
                          {lead.unitType?.label ? ` · ${lead.unitType.label}` : ""}
                        </Typography>
                        {lead.message && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              display: "-webkit-box",
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {lead.message}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                          {relativeTime(lead.createdAt)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
                        <StatusBadge status={lead.status} />
                        {lead.status === "NEW" && (
                          <Button
                            size="small"
                            variant="outlined"
                            disabled={updateLeadStatus.isPending}
                            onClick={() =>
                              updateLeadStatus.mutate({ id: lead.id, data: { status: "CONTACTED" } })
                            }
                            sx={{ textTransform: "none", fontSize: "0.7rem", py: 0.25 }}
                          >
                            Mark contacted
                          </Button>
                        )}
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Right column */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
          <Card sx={{ border: "1px solid #E2E5EA" }} elevation={0}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => navigate("/projects/new")}
                  sx={{ justifyContent: "flex-start", textTransform: "none" }}
                >
                  Create a new project
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<FolderIcon />}
                  onClick={() => navigate("/projects")}
                  sx={{ justifyContent: "flex-start", textTransform: "none" }}
                >
                  Manage projects
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<SettingsIcon />}
                  onClick={() => navigate("/settings")}
                  sx={{ justifyContent: "flex-start", textTransform: "none" }}
                >
                  Company & verification settings
                </Button>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ border: "1px solid #E2E5EA" }} elevation={0}>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <NotificationsIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                  <Typography variant="h6">Notifications</Typography>
                </Box>
                {unreadCount > 0 && (
                  <Tooltip title="Mark all as read">
                    <IconButton
                      size="small"
                      onClick={() => markAllRead.mutate()}
                      disabled={markAllRead.isPending}
                    >
                      <CheckCircleIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
              {loadingNotifs ? (
                <SkeletonList rows={3} />
              ) : recentNotifs.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: "center" }}>
                  You're all caught up.
                </Typography>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  {recentNotifs.map((n, i) => (
                    <Box
                      key={n.id}
                      onClick={() => !n.isRead && markRead.mutate(n.id)}
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 1,
                        py: 1.25,
                        borderTop: i === 0 ? "none" : "1px solid #F1F2F5",
                        cursor: n.isRead ? "default" : "pointer",
                      }}
                    >
                      <Box
                        sx={{
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          bgcolor: n.isRead ? "transparent" : "#2F5D8A",
                          mt: 0.7,
                          flexShrink: 0,
                        }}
                      />
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography variant="body2" fontWeight={n.isRead ? 400 : 600} noWrap>
                          {n.title}
                        </Typography>
                        {n.body && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {n.body}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                          {relativeTime(n.createdAt)}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
