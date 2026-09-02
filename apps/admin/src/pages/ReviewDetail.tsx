import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { adminApi } from "../lib/api";
import { toast } from "../lib/toast";
import type { AdminProjectSummary, ProjectReviewLog } from "../lib/api/schemas";

function formatPrice(price: number | null) {
  if (!price) return "—";
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)}Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(1)}L`;
  return `₹${price.toLocaleString("en-IN")}`;
}

export default function ReviewDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [notesValue, setNotesValue] = useState("");
  const [approveNotes, setApproveNotes] = useState("");

  const { data: project, isLoading } = useQuery({
    queryKey: ["admin", "project-review", id],
    queryFn: () => adminApi.getProjectForReview(id!),
    enabled: Boolean(id),
  });

  const { data: history } = useQuery({
    queryKey: ["admin", "review-history", id],
    queryFn: () => adminApi.getReviewHistory(id!),
    enabled: Boolean(id),
  });

  const approveMutation = useMutation({
    mutationFn: () => adminApi.approveProjectReview(id!, approveNotes || undefined),
    onSuccess: () => {
      toast.success("Project approved and now visible to customers");
      queryClient.invalidateQueries({ queryKey: ["admin", "review-queue"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "project-review", id] });
      queryClient.invalidateQueries({ queryKey: ["admin", "review-history", id] });
      setApproveNotes("");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to approve project");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () => adminApi.rejectProjectReview(id!, rejectReason),
    onSuccess: () => {
      toast.success("Project rejected — builder will be notified");
      queryClient.invalidateQueries({ queryKey: ["admin", "review-queue"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "project-review", id] });
      queryClient.invalidateQueries({ queryKey: ["admin", "review-history", id] });
      setRejectOpen(false);
      setRejectReason("");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to reject project");
    },
  });

  const noteMutation = useMutation({
    mutationFn: () => adminApi.addReviewNote(id!, notesValue),
    onSuccess: () => {
      toast.success("Note saved");
      queryClient.invalidateQueries({ queryKey: ["admin", "review-history", id] });
      setNotesValue("");
    },
  });

  if (isLoading) {
    return (
      <Box>
        <LinearProgress />
        <Typography color="text.secondary" sx={{ mt: 2 }}>Loading project details...</Typography>
      </Box>
    );
  }

  if (!project) {
    return (
      <Box>
        <Alert severity="error">Project not found.</Alert>
        <Button startIcon={<ArrowBackIcon />} sx={{ mt: 2 }} onClick={() => navigate("/projects/review-queue")}>
          Back to Queue
        </Button>
      </Box>
    );
  }

  const isPending = project.reviewStatus === "PENDING_REVIEW";

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <Button startIcon={<ArrowBackIcon />} size="small" onClick={() => navigate("/projects/review-queue")}>
          Back to Queue
        </Button>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
        <Typography variant="h4" fontWeight={700} sx={{ flexGrow: 1 }}>
          {project.title}
        </Typography>
        <Chip
          label={project.reviewStatus.replace("_", " ")}
          color={project.reviewStatus === "PENDING_REVIEW" ? "warning" : project.reviewStatus === "APPROVED" ? "success" : "error"}
        />
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {project.builder.companyName} &middot; {project.city.name}, {project.locality.name}
        {project.publishedAt && ` \u00b7 Published ${new Date(project.publishedAt).toLocaleDateString("en-IN")}`}
      </Typography>

      {/* Action buttons for pending projects */}
      {isPending && (
        <Paper sx={{ p: 2, mb: 3, display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
          <TextField
            size="small"
            placeholder="Optional approval notes..."
            value={approveNotes}
            onChange={(e) => setApproveNotes(e.target.value)}
            sx={{ flexGrow: 1, minWidth: 200 }}
          />
          <Button
            variant="contained"
            color="success"
            startIcon={<CheckCircleIcon />}
            disabled={approveMutation.isPending}
            onClick={() => approveMutation.mutate()}
          >
            Approve & Publish
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<CancelIcon />}
            disabled={rejectMutation.isPending}
            onClick={() => setRejectOpen(true)}
          >
            Reject
          </Button>
        </Paper>
      )}

      {project.rejectionReason && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Rejection reason: {project.rejectionReason}
        </Alert>
      )}

      {project.reviewNotes && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Review notes: {project.reviewNotes}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Project Details */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Project Details</Typography>
              <Divider sx={{ mb: 2 }} />

              {project.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {project.description}
                </Typography>
              )}

              <Grid container spacing={2}>
                <Grid item xs={6} sm={4}>
                  <Typography variant="caption" color="text.secondary">Status</Typography>
                  <Typography variant="body2" fontWeight={500}>{project.status}</Typography>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Typography variant="caption" color="text.secondary">Starting Price</Typography>
                  <Typography variant="body2" fontWeight={500}>{formatPrice(project.priceStartingFrom)}</Typography>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Typography variant="caption" color="text.secondary">Unit Types</Typography>
                  <Typography variant="body2" fontWeight={500}>{project._count.unitTypes}</Typography>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Typography variant="caption" color="text.secondary">Media Files</Typography>
                  <Typography variant="body2" fontWeight={500}>{project._count.media ?? project.media.length}</Typography>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Typography variant="caption" color="text.secondary">Leads Generated</Typography>
                  <Typography variant="body2" fontWeight={500}>{project._count.leads}</Typography>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Typography variant="caption" color="text.secondary">Builder Verification</Typography>
                  <Typography variant="body2" fontWeight={500}>{project.verificationStatus}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Images */}
          {project.media.length > 0 && (
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Media ({project.media.length})</Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {project.media.map((url: string, i: number) => (
                    <Box
                      key={i}
                      component="img"
                      src={url}
                      alt={`Media ${i + 1}`}
                      sx={{
                        width: 120,
                        height: 90,
                        objectFit: "cover",
                        borderRadius: 1,
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Builder Info */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Builder</Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2" fontWeight={600}>{project.builder.companyName}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Verification: {project.builder.verificationStatus}
              </Typography>
              {project.builder.reraNumber && (
                <Typography variant="body2" color="text.secondary">
                  RERA: {project.builder.reraNumber}
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Add Note */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Internal Notes</Typography>
              <Divider sx={{ mb: 2 }} />
              <TextField
                fullWidth
                multiline
                rows={3}
                size="small"
                placeholder="Add a note for other reviewers..."
                value={notesValue}
                onChange={(e) => setNotesValue(e.target.value)}
                sx={{ mb: 1 }}
              />
              <Button
                size="small"
                variant="outlined"
                disabled={!notesValue.trim() || noteMutation.isPending}
                onClick={() => noteMutation.mutate()}
              >
                Save Note
              </Button>
            </CardContent>
          </Card>

          {/* Review History */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Review History</Typography>
              <Divider sx={{ mb: 2 }} />
              {(!history || history.length === 0) && (
                <Typography variant="body2" color="text.secondary">No review history yet.</Typography>
              )}
              {history && history.length > 0 && (
                <List dense disablePadding>
                  {history.map((log: ProjectReviewLog) => (
                    <ListItem key={log.id} sx={{ px: 0 }}>
                      <ListItemText
                        primary={
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Chip
                              size="small"
                              label={log.action.replace("_", " ")}
                              color={
                                log.action === "APPROVED" ? "success" :
                                log.action === "REJECTED" ? "error" : "default"
                              }
                            />
                            <Typography variant="caption" color="text.secondary">
                              {new Date(log.createdAt).toLocaleString("en-IN")}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <>
                            {log.reason && <Typography variant="body2" color="error">Reason: {log.reason}</Typography>}
                            {log.notes && <Typography variant="body2" color="text.secondary">Note: {log.notes}</Typography>}
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Reject Dialog */}
      <Dialog open={rejectOpen} onClose={() => setRejectOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Project</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Please provide a reason for rejecting this listing. The builder will be notified.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Reason for rejection (required)"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectOpen(false)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            disabled={!rejectReason.trim() || rejectMutation.isPending}
            onClick={() => rejectMutation.mutate()}
          >
            Reject Project
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
