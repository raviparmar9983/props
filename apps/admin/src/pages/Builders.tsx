import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { adminApi } from "../lib/api";
import { toast } from "../lib/toast";
import type { AdminBuilder, BuilderVerificationStatus } from "../lib/api";

const STATUS_FILTERS: Array<{ label: string; value: BuilderVerificationStatus | "" }> = [
  { label: "All", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Verified", value: "VERIFIED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Suspended", value: "SUSPENDED" },
];

const STATUS_COLORS: Record<BuilderVerificationStatus, "warning" | "success" | "error" | "default"> = {
  PENDING: "warning",
  VERIFIED: "success",
  REJECTED: "error",
  SUSPENDED: "default",
};

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function Builders() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<BuilderVerificationStatus | "">("");
  const [rejectTarget, setRejectTarget] = useState<AdminBuilder | null>(null);
  const [approveTarget, setApproveTarget] = useState<AdminBuilder | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "builders", statusFilter],
    queryFn: () =>
      adminApi.listBuilders({
        limit: 50,
        ...(statusFilter ? { status: statusFilter } : {}),
      }),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => adminApi.approveBuilder(id),
    onSuccess: () => {
      toast.success("Builder approved");
      setApproveTarget(null);
      queryClient.invalidateQueries({ queryKey: ["admin", "builders"] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminApi.rejectBuilder(id, reason),
    onSuccess: () => {
      toast.success("Builder rejected");
      setRejectTarget(null);
      setRejectReason("");
      queryClient.invalidateQueries({ queryKey: ["admin", "builders"] });
    },
  });

  const builders = data?.data ?? [];
  const total = data?.meta?.total ?? 0;

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
        Builders
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {total} builder profile{total !== 1 ? "s" : ""}
      </Typography>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
        {STATUS_FILTERS.map((f) => (
          <Chip
            key={f.label}
            label={f.label}
            onClick={() => setStatusFilter(f.value)}
            color={statusFilter === f.value ? "primary" : "default"}
            variant={statusFilter === f.value ? "filled" : "outlined"}
            sx={{ cursor: "pointer" }}
          />
        ))}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Company</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>City</TableCell>
              <TableCell>RERA</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Verified</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={7}>
                  <Typography color="text.secondary" sx={{ py: 3, textAlign: "center" }}>
                    Loading builders…
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {!isLoading && builders.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>
                  <Typography color="text.secondary" sx={{ py: 3, textAlign: "center" }}>
                    No builders found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {builders.map((b) => (
              <TableRow key={b.id} hover>
                <TableCell>
                  <Typography fontWeight={600}>{b.companyName}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    @{b.slug}
                  </Typography>
                </TableCell>
                <TableCell>
                  {b.user.email}
                  {b.phone && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      {b.phone}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>{b.city.name}</TableCell>
                <TableCell>{b.reraNumber ?? "—"}</TableCell>
                <TableCell>
                  <Chip
                    label={b.verificationStatus}
                    size="small"
                    color={STATUS_COLORS[b.verificationStatus]}
                  />
                  {b.rejectionReason && (
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5, maxWidth: 220 }}>
                      {b.rejectionReason}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>{formatDate(b.verifiedAt)}</TableCell>
                <TableCell align="right">
                  {b.verificationStatus === "PENDING" && (
                    <Box sx={{ display: "inline-flex", gap: 1 }}>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => setApproveTarget(b)}
                        disabled={approveMutation.isPending}
                      >
                        Approve
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => setRejectTarget(b)}
                        disabled={rejectMutation.isPending}
                      >
                        Reject
                      </Button>
                    </Box>
                  )}
                  {b.verificationStatus !== "PENDING" && (
                    <Typography variant="caption" color="text.secondary">
                      Reviewed
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={Boolean(approveTarget)} onClose={() => setApproveTarget(null)}>
        <DialogTitle>Approve builder</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Approve <strong>{approveTarget?.companyName}</strong>? They will be
            able to publish projects publicly.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveTarget(null)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => approveTarget && approveMutation.mutate(approveTarget.id)}
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(rejectTarget)} onClose={() => setRejectTarget(null)}>
        <DialogTitle>Reject builder</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Reject <strong>{rejectTarget?.companyName}</strong>? All of their
            projects will be archived. Provide a reason they will see by email.
          </DialogContentText>
          <TextField
            label="Reason"
            required
            multiline
            minRows={3}
            fullWidth
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="e.g. RERA number could not be verified"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectTarget(null)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            disabled={rejectReason.trim().length === 0 || rejectMutation.isPending}
            onClick={() =>
              rejectTarget &&
              rejectMutation.mutate({ id: rejectTarget.id, reason: rejectReason.trim() })
            }
          >
            Reject builder
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
