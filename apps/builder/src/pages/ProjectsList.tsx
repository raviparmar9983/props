import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Card,
  Chip,
} from "@mui/material";
import {
  AddIcon,
  MoreVertIcon,
  EditIcon,
  VisibilityIcon,
  DeleteIcon,
  PublishIcon,
  StopCircleIcon as UnpublishedIcon,
  FolderOffIcon,
} from "../components/icons";
import {
  useProjects,
  useDeleteProject,
  usePublishProject,
  useUnpublishProject,
} from "../lib/hooks";
import { StatusBadge } from "../components/StatusBadge";
import { EmptyState } from "../components/EmptyState";
import { SkeletonTable } from "../components/Skeletons";
import { relativeTime } from "../utils/format";

export default function ProjectsList() {
  const navigate = useNavigate();
  const { data, isLoading } = useProjects({ limit: 100 });
  const deleteProject = useDeleteProject();
  const publishProject = usePublishProject();
  const unpublishProject = useUnpublishProject();

  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuProjectId, setMenuProjectId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"ALL" | "DRAFT" | "PUBLISHED" | "ARCHIVED">("ALL");

  const allProjects = data?.data ?? [];

  const isPublished = (status: string) =>
    ["UPCOMING", "UNDER_CONSTRUCTION", "READY"].includes(status);

  const projects = allProjects.filter((p) => {
    if (filter === "ALL") return true;
    if (filter === "PUBLISHED") return isPublished(p.status);
    if (filter === "DRAFT") return p.status === "DRAFT";
    return p.status === "ARCHIVED";
  });

  const counts = {
    ALL: allProjects.length,
    DRAFT: allProjects.filter((p) => p.status === "DRAFT").length,
    PUBLISHED: allProjects.filter((p) => isPublished(p.status)).length,
    ARCHIVED: allProjects.filter((p) => p.status === "ARCHIVED").length,
  };

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>, id: string) => {
    setMenuAnchor(e.currentTarget);
    setMenuProjectId(id);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuProjectId(null);
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
          gap: 1.5,
          mb: 1,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Projects
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            {allProjects.length} project{allProjects.length === 1 ? "" : "s"} in your portfolio
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/projects/new")}
          sx={{ flexShrink: 0 }}
        >
          Create Project
        </Button>
      </Box>

      {!isLoading && allProjects.length > 0 && (
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 3, mt: 2 }}>
          {(["ALL", "PUBLISHED", "DRAFT", "ARCHIVED"] as const).map((key) => (
            <Chip
              key={key}
              label={`${key === "ALL" ? "All" : key.charAt(0) + key.slice(1).toLowerCase()} (${counts[key]})`}
              onClick={() => setFilter(key)}
              color={filter === key ? "primary" : "default"}
              variant={filter === key ? "filled" : "outlined"}
              size="small"
            />
          ))}
        </Box>
      )}

      {isLoading ? (
        <SkeletonTable rows={5} columns={7} />
      ) : allProjects.length === 0 ? (
        <Card>
          <EmptyState
            icon={<FolderOffIcon sx={{ fontSize: 64 }} />}
            title="No projects yet"
            description="You haven't listed a property yet. Add your first project to start showcasing it to buyers."
            actionLabel="Create Project"
            onAction={() => navigate("/projects/new")}
          />
        </Card>
      ) : projects.length === 0 ? (
        <Card>
          <EmptyState
            icon={<FolderOffIcon sx={{ fontSize: 64 }} />}
            title="No projects match this filter"
            description="Try a different filter to see more of your projects."
          />
        </Card>
      ) : (
        <>
        {/* Mobile: card list (a 7-column table has no comfortable phone width) */}
        <Box sx={{ display: { xs: "flex", md: "none" }, flexDirection: "column", gap: 1.5 }}>
          {projects.map((project) => {
            const thumb = project.media?.find((m) => m.isPrimary) ?? project.media?.[0];
            return (
              <Card
                key={project.id}
                sx={{ p: 2, cursor: "pointer" }}
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
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
                      <FolderOffIcon sx={{ fontSize: 18 }} />
                    </Box>
                  )}
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="body2" fontWeight={600} noWrap>
                      {project.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {project.city?.name ?? "—"} &middot; {relativeTime(project.updatedAt)}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMenuOpen(e, project.id);
                    }}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mt: 1.5 }}>
                  <StatusBadge status={project.status} />
                  <StatusBadge status={project.reviewStatus ?? "DRAFT"} />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ alignSelf: "center", ml: 0.5 }}
                  >
                    {project._count?.unitTypes ?? 0} unit type
                    {project._count?.unitTypes === 1 ? "" : "s"}
                  </Typography>
                </Box>
              </Card>
            );
          })}
        </Box>

        {/* Desktop: full table */}
        <Card sx={{ display: { xs: "none", md: "block" } }}>
          <TableContainer sx={{ overflowX: "auto" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Review</TableCell>
                  <TableCell>City</TableCell>
                  <TableCell>Unit Types</TableCell>
                  <TableCell>Last Updated</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {projects.map((project) => {
                  const thumb = project.media?.find((m) => m.isPrimary) ?? project.media?.[0];
                  return (
                  <TableRow
                    key={project.id}
                    hover
                    sx={{ cursor: "pointer" }}
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
                        {thumb ? (
                          <Box
                            component="img"
                            src={thumb.url}
                            alt=""
                            sx={{ width: 40, height: 32, objectFit: "cover", borderRadius: 1, flexShrink: 0, bgcolor: "#EBF0F7" }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: 40,
                              height: 32,
                              borderRadius: 1,
                              flexShrink: 0,
                              bgcolor: "#EBF0F7",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#1B2A4A",
                            }}
                          >
                            <FolderOffIcon sx={{ fontSize: 16 }} />
                          </Box>
                        )}
                        <Typography variant="body2" fontWeight={500} noWrap sx={{ maxWidth: 240 }}>
                          {project.title}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={project.status} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={project.reviewStatus ?? "DRAFT"} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {project.city?.name ?? "—"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {project._count?.unitTypes ?? 0}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {relativeTime(project.updatedAt)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      <IconButton size="small" onClick={(e) => handleMenuOpen(e, project.id)}>
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
        </>
      )}

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
        <MenuItem
          onClick={() => {
            if (menuProjectId) navigate(`/projects/${menuProjectId}`);
            handleMenuClose();
          }}
        >
          <EditIcon sx={{ mr: 1, fontSize: 18 }} /> Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuProjectId) navigate(`/projects/${menuProjectId}`);
            handleMenuClose();
          }}
        >
          <VisibilityIcon sx={{ mr: 1, fontSize: 18 }} /> View
        </MenuItem>
        {menuProjectId && (() => {
          const proj = projects.find((p) => p.id === menuProjectId);
          if (!proj) return null;
          return isPublished(proj.status) ? (
            <MenuItem
              onClick={() => {
                unpublishProject.mutate(menuProjectId!);
                handleMenuClose();
              }}
            >
              <UnpublishedIcon sx={{ mr: 1, fontSize: 18 }} /> Unpublish
            </MenuItem>
          ) : (
            <MenuItem
              onClick={() => {
                publishProject.mutate(menuProjectId!);
                handleMenuClose();
              }}
            >
              <PublishIcon sx={{ mr: 1, fontSize: 18 }} /> Submit for Review
            </MenuItem>
          );
        })()}
        <MenuItem
          onClick={() => {
            if (menuProjectId && confirm("Delete this project? This cannot be undone.")) {
              deleteProject.mutate(menuProjectId);
            }
            handleMenuClose();
          }}
          sx={{ color: "error.main" }}
        >
          <DeleteIcon sx={{ mr: 1, fontSize: 18 }} /> Delete
        </MenuItem>
      </Menu>
    </Box>
  );
}
