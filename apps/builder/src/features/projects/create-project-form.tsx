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
  Autocomplete,
  createFilterOptions,
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

// Autocomplete's options are either an existing locality, or a synthetic
// "add new" entry created from free-typed text (isNew=true, id="").
type LocalityOption = Locality & { isNew?: boolean };

export function CreateProjectForm() {
  const navigate = useNavigate();
  const createProject = useCreateProject();

  const [title, setTitle] = useState("");
  const [cityId, setCityId] = useState("");
  const [locality, setLocality] = useState<LocalityOption | null>(null);
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [creatingLocality, setCreatingLocality] = useState(false);

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
      setLocality(null);
      return;
    }
    setLocality(null);
    apiClient
      .get<Locality[]>("/localities", { params: { cityId } })
      .then((r) => setLocalities(r.data))
      .catch(() => setLocalities([]));
  }, [cityId]);

  const localityFilter = createFilterOptions<LocalityOption>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!locality) {
      setError("Please select or add a locality.");
      return;
    }

    let localityId = locality.id;
    if (locality.isNew) {
      setCreatingLocality(true);
      try {
        const { data: created } = await apiClient.post<Locality>("/localities", {
          cityId,
          name: locality.name,
        });
        localityId = created.id;
      } catch {
        setCreatingLocality(false);
        setError("Failed to add the new locality. Please try again.");
        return;
      }
      setCreatingLocality(false);
    }

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
        <Autocomplete
          freeSolo
          disabled={!cityId}
          options={localities as LocalityOption[]}
          value={locality}
          onChange={(_e, value) => {
            if (!value) {
              setLocality(null);
            } else if (typeof value === "string") {
              setLocality({ id: "", name: value, isNew: true });
            } else {
              setLocality(value);
            }
          }}
          getOptionLabel={(option) =>
            typeof option === "string" ? option : option.name
          }
          isOptionEqualToValue={(option, val) => option.id === val.id}
          filterOptions={(options, params) => {
            const filtered = localityFilter(options, params);
            const query = params.inputValue.trim();
            const exists = options.some(
              (o) => o.name.toLowerCase() === query.toLowerCase(),
            );
            if (query !== "" && !exists) {
              filtered.push({ id: "", name: query, isNew: true });
            }
            return filtered;
          }}
          renderOption={(props, option) => (
            <li {...props} key={option.id || option.name}>
              {option.isNew ? `+ Add "${option.name}"` : option.name}
            </li>
          )}
          renderInput={(params) => (
            // MUI's Autocomplete `renderInput` params aren't fully clean under this
            // project's `exactOptionalPropertyTypes: true`; the runtime shape is correct.
            <TextField
              {...(params as React.ComponentProps<typeof TextField>)}
              required
              label="Locality"
              size="small"
              helperText={
                cityId
                  ? "Not listed? Type it and pick “Add…” to create it."
                  : "Pick a city first"
              }
            />
          )}
        />
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
          disabled={createProject.isPending || creatingLocality}
          sx={{ alignSelf: "flex-start", textTransform: "none", fontWeight: 600 }}
        >
          {createProject.isPending || creatingLocality ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            "Create Project"
          )}
        </Button>
      </Stack>
    </form>
  );
}
