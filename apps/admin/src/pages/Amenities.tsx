import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
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
import DeleteIcon from "@mui/icons-material/Delete";
import { adminApi } from "../lib/api";
import { toast } from "../lib/toast";

export default function Amenities() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "amenities"],
    queryFn: adminApi.listAmenities,
  });

  const createMutation = useMutation({
    mutationFn: (body: { name: string; icon?: string }) => adminApi.createAmenity(body),
    onSuccess: () => {
      toast.success("Amenity created");
      setName("");
      setIcon("");
      queryClient.invalidateQueries({ queryKey: ["admin", "amenities"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteAmenity(id),
    onSuccess: () => {
      toast.success("Amenity deleted");
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ["admin", "amenities"] });
    },
  });

  const amenities = data ?? [];

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
        Amenities
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manage the amenity tags builders can add to projects
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            createMutation.mutate({
              name: name.trim(),
              ...(icon.trim() ? { icon: icon.trim() } : {}),
            });
          }}
        >
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <TextField
              label="Name"
              required
              size="small"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Swimming pool"
              sx={{ flexGrow: 1, minWidth: 200 }}
            />
            <TextField
              label="Icon (emoji)"
              size="small"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="e.g. 🏊"
              sx={{ width: 140 }}
            />
            <Button type="submit" variant="contained" disabled={createMutation.isPending || !name.trim()}>
              Add amenity
            </Button>
          </Box>
        </form>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Icon</TableCell>
              <TableCell>Name</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={3}>
                  <Typography color="text.secondary" sx={{ py: 3, textAlign: "center" }}>
                    Loading amenities…
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {!isLoading && amenities.length === 0 && (
              <TableRow>
                <TableCell colSpan={3}>
                  <Typography color="text.secondary" sx={{ py: 3, textAlign: "center" }}>
                    No amenities yet
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {amenities.map((a) => (
              <TableRow key={a.id} hover>
                <TableCell>{a.icon ?? "—"}</TableCell>
                <TableCell>{a.name}</TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => setDeleteTarget(a.id)}
                    aria-label={`Delete ${a.name}`}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete amenity?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This cannot be undone. Amenities already assigned to projects cannot
            be deleted.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => deleteTarget !== null && deleteMutation.mutate(deleteTarget)}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
