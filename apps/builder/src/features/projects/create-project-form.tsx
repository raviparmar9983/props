import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  TextField,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
} from "@mui/material";
import { useCreateProject } from "../../lib/hooks";
import apiClient from "../../lib/api/client";

interface City {
  id: string;
  name: string;
  stateName: string;
}

interface Locality {
  id: string;
  name: string;
}

export function CreateProjectForm() {
  const navigate = useNavigate();
  const createProject = useCreateProject();

  const [title, setTitle] = useState("");
  const [cityId, setCityId] = useState("");
  const [localityId, setLocalityId] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const [cities, setCities] = useState<City[]>([]);
  const [localities, setLocalities] = useState<Locality[]>([]);

  useEffect(() => {
    apiClient
      .get<City[]>("/cities")
      .then((r) => setCities(r.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!cityId) {
      setLocalities([]);
      setLocalityId("");
      return;
    }
    setLocalityId("");
    apiClient
      .get<Locality[]>("/localities", { params: { cityId } })
      .then((r) => setLocalities(r.data))
      .catch(() => setLocalities([]));
  }, [cityId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    createProject.mutate(
      { title, cityId, localityId, description },
      {
        onSuccess: (project) => {
          navigate(`/projects/${project.id}`);
        },
        onError: (err: unknown) => {
          const apiErr = err as { message?: string };
          setError(apiErr?.message ?? "Failed to create project. Please try again.");
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={2}>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          required
          label="Project Name"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          size="small"
        />
        <FormControl fullWidth size="small" required>
          <InputLabel>City</InputLabel>
          <Select
            label="City"
            value={cityId}
            onChange={(e) => setCityId(e.target.value)}
          >
            {cities.map((city) => (
              <MenuItem key={city.id} value={city.id}>
                {city.name}, {city.stateName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth size="small" required disabled={!cityId}>
          <InputLabel>Locality</InputLabel>
          <Select
            label="Locality"
            value={localityId}
            onChange={(e) => setLocalityId(e.target.value)}
          >
            {localities.map((loc) => (
              <MenuItem key={loc.id} value={loc.id}>
                {loc.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          multiline
          minRows={3}
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          size="small"
        />
        <Button
          type="submit"
          variant="contained"
          disabled={createProject.isPending}
          sx={{ alignSelf: "flex-start", textTransform: "none", fontWeight: 600 }}
        >
          {createProject.isPending ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            "Create Project"
          )}
        </Button>
      </Stack>
    </form>
  );
}
