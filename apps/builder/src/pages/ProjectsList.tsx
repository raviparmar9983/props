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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import PublishIcon from "@mui/icons-material/Publish";
import UnpublishedIcon from "@mui/icons-material/StopCircle";
import FolderOffIcon from "@mui/icons-material/FolderOff";
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

  const projects = data?.data ?? [];

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>, id: string) => {
    setMenuAnchor(e.currentTarget);
    setMenuProjectId(id);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuProjectId(null);
  };

  const isPublished = (status: string) =>
    ["UPCOMING", "UNDER_CONSTRUCTION", "READY"].includes(status);

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          Projects
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/projects/new")}
        >
          Create Project
        </Button>
      </Box>

      {isLoading ? (
        <SkeletonTable rows={5} columns={7} />
      ) : projects.length === 0 ? (
        <Card>
          <EmptyState
            icon={<FolderOffIcon sx={{ fontSize: 64 }} />}
            title="No projects yet"
            description="You haven't listed a property yet. Add your first project to start showcasing it to buyers."
            actionLabel="Create Project"
            onAction={() => navigate("/projects/new")}
          />
        </Card>
      ) : (
        <Card>
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
                {projects.map((project) => (
                  <TableRow
                    key={project.id}
                    hover
                    sx={{ cursor: "pointer" }}
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {project.title}
                      </Typography>
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
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
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
