import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  CircularProgress,
  Chip,
  LinearProgress,
  Alert,
  Stack,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import PublishIcon from "@mui/icons-material/Publish";
import StopCircleIcon from "@mui/icons-material/StopCircle";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import {
  useProject,
  useUpdateProject,
  usePublishProject,
  useUnpublishProject,
  useTowers,
  useCreateTower,
  useUpdateTower,
  useDeleteTower,
  useUnitTypes,
  useCreateUnitType,
  useUpdateUnitType,
  useDeleteUnitType,
  useProjectMedia,
  useUploadMedia,
  useDeleteMedia,
  useReorderMedia,
  useSetPrimaryMedia,
  useContacts,
  useCreateContact,
  useUpdateContact,
  useDeleteContact,
  useAmenities,
  useUpdateProjectAmenities,
} from "../lib/hooks";
import { StatusBadge } from "../components/StatusBadge";
import { formatPrice, formatArea } from "../utils/format";
import {
  LegalComplianceTab,
  ConstructionSpecsTab,
  PricingPaymentTab,
  FaqsTab,
  NearbyTab,
} from "./ProjectDetailSections";
import type {
  PropertyType,
  AreaUnit,
  MediaType,
  Facing,
} from "../lib/api/schemas";

/* ─── Overview ────────────────────────────────────────── */

function OverviewTab({ projectId }: { projectId: string }) {
  const { data: project, isLoading } = useProject(projectId);
  const updateProject = useUpdateProject();
  const [form, setForm] = useState<{
    title: string;
    description: string;
    address: string;
    reraProjectNumber: string;
  } | null>(null);

  if (isLoading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  if (!project) return <Typography>Project not found</Typography>;

  const active = form ?? {
    title: project.title,
    description: project.description ?? "",
    address: project.address ?? "",
    reraProjectNumber: project.reraProjectNumber ?? "",
  };

  const handleSave = () => {
    updateProject.mutate(
      { id: projectId, data: active },
      {
        onError: () => setForm(null),
      },
    );
    setForm(null);
  };

  return (
    <Stack spacing={2} sx={{ maxWidth: 600 }}>
      <TextField
        label="Title"
        value={active.title}
        onChange={(e) => setForm({ ...active, title: e.target.value })}
        fullWidth
        size="small"
      />
      <TextField
        label="Description"
        value={active.description}
        onChange={(e) => setForm({ ...active, description: e.target.value })}
        multiline
        minRows={3}
        fullWidth
        size="small"
      />
      <TextField
        label="Address"
        value={active.address}
        onChange={(e) => setForm({ ...active, address: e.target.value })}
        fullWidth
        size="small"
      />
      <TextField
        label="RERA Project Number"
        value={active.reraProjectNumber}
        onChange={(e) =>
          setForm({ ...active, reraProjectNumber: e.target.value })
        }
        fullWidth
        size="small"
      />
      {form && (
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={updateProject.isPending}
            size="small"
            sx={{ textTransform: "none" }}
          >
            {updateProject.isPending ? <CircularProgress size={20} /> : "Save"}
          </Button>
          <Button
            variant="outlined"
            onClick={() => setForm(null)}
            size="small"
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
        </Box>
      )}
    </Stack>
  );
}

/* ─── Towers ──────────────────────────────────────────── */

function TowersTab({ projectId }: { projectId: string }) {
  const { data: towers = [], isLoading } = useTowers(projectId);
  const createTower = useCreateTower();
  const updateTower = useUpdateTower();
  const deleteTower = useDeleteTower();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [floors, setFloors] = useState("");
  const [error, setError] = useState("");

  const handleOpen = (tower?: {
    id: string;
    name: string;
    totalFloors?: number | null | undefined;
  }) => {
    setError("");
    if (tower) {
      setEditId(tower.id);
      setName(tower.name);
      setFloors(tower.totalFloors != null ? String(tower.totalFloors) : "");
    } else {
      setEditId(null);
      setName("");
      setFloors("");
    }
    setDialogOpen(true);
  };

  const handleSave = () => {
    setError("");
    const data: { name: string; totalFloors?: number } = { name };
    if (floors) data.totalFloors = parseInt(floors);
    const opts = {
      onSuccess: () => setDialogOpen(false),
      onError: (err: unknown) => {
        const apiErr = err as { message?: string };
        setError(apiErr?.message ?? "Failed to save tower.");
      },
    };
    if (editId) {
      updateTower.mutate({ id: editId, data }, opts);
    } else {
      createTower.mutate({ projectId, data }, opts);
    }
  };

  if (isLoading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Typography variant="h6">Towers</Typography>
        <Button
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
          variant="contained"
          size="small"
          sx={{ textTransform: "none" }}
        >
          Add Tower
        </Button>
      </Box>
      <Box sx={{ overflowX: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Total Floors</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {towers.map((tower) => (
              <TableRow key={tower.id}>
                <TableCell>{tower.name}</TableCell>
                <TableCell>{tower.totalFloors ?? "\u2014"}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => handleOpen(tower)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => {
                      if (confirm("Delete this tower?"))
                        deleteTower.mutate(tower.id);
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {towers.length === 0 && (
              <TableRow>
                <TableCell colSpan={3}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    align="center"
                  >
                    No towers added yet.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { mx: { xs: 1, sm: 3 } } }}
      >
        <DialogTitle>{editId ? "Edit Tower" : "Add Tower"}</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "16px !important" }}
        >
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Tower Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            size="small"
          />
          <TextField
            label="Total Floors"
            type="number"
            value={floors}
            onChange={(e) => setFloors(e.target.value)}
            fullWidth
            size="small"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={!name || createTower.isPending || updateTower.isPending}
            sx={{ textTransform: "none" }}
          >
            {createTower.isPending || updateTower.isPending ? (
              <CircularProgress size={20} />
            ) : editId ? (
              "Update"
            ) : (
              "Add"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

/* ─── Unit Types ──────────────────────────────────────── */

const FACING_OPTIONS: { value: Facing; label: string }[] = [
  { value: "NORTH", label: "North" },
  { value: "SOUTH", label: "South" },
  { value: "EAST", label: "East" },
  { value: "WEST", label: "West" },
  { value: "NORTH_EAST", label: "North-East" },
  { value: "NORTH_WEST", label: "North-West" },
  { value: "SOUTH_EAST", label: "South-East" },
  { value: "SOUTH_WEST", label: "South-West" },
];

function UnitTypesTab({ projectId }: { projectId: string }) {
  const { data: unitTypes = [], isLoading } = useUnitTypes(projectId);
  const { data: towers = [] } = useTowers(projectId);
  const createUnitType = useCreateUnitType();
  const updateUnitType = useUpdateUnitType();
  const deleteUnitType = useDeleteUnitType();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    propertyType: "FLAT" as PropertyType,
    label: "",
    towerId: "",
    carpetArea: "",
    builtUpArea: "",
    areaUnit: "SQFT" as AreaUnit,
    price: "",
    totalCount: "",
    availableCount: "",
    floorNumber: "",
    facing: "" as Facing | "",
    viewType: "",
    bookingAmount: "",
    bedrooms: "",
    bathrooms: "",
    furnishing: "",
    frontageWidthFt: "",
    footfallEstimate: "",
    shutterType: "",
    floorPlateSqft: "",
    powerLoadKw: "",
    seatingCapacity: "",
    loadingDockAccess: "",
    parkingRatio: "",
  });

  const towerMap = Object.fromEntries(towers.map((t) => [t.id, t.name]));

  const handleOpen = (ut?: {
    id: string;
    propertyType: PropertyType;
    label: string;
    towerId?: string | null | undefined;
    carpetArea?: number | null | undefined;
    builtUpArea?: number | null | undefined;
    areaUnit: AreaUnit;
    price: number;
    totalCount: number;
    availableCount: number;
    floorNumber?: number | null | undefined;
    facing?: Facing | null | undefined;
    viewType?: string | null | undefined;
    bookingAmount?: number | null | undefined;
    attributes?: Record<string, unknown> | null | undefined;
  }) => {
    setError("");
    if (ut) {
      const attrs = (ut.attributes ?? {}) as Record<string, unknown>;
      setEditId(ut.id);
      setForm({
        propertyType: ut.propertyType,
        label: ut.label,
        towerId: ut.towerId ?? "",
        carpetArea: ut.carpetArea != null ? String(ut.carpetArea) : "",
        builtUpArea: ut.builtUpArea != null ? String(ut.builtUpArea) : "",
        areaUnit: ut.areaUnit,
        price: String(ut.price),
        totalCount: String(ut.totalCount),
        availableCount: String(ut.availableCount),
        floorNumber: ut.floorNumber != null ? String(ut.floorNumber) : "",
        facing: ut.facing ?? "",
        viewType: ut.viewType ?? "",
        bookingAmount: ut.bookingAmount != null ? String(ut.bookingAmount) : "",
        bedrooms: attrs.bedrooms != null ? String(attrs.bedrooms) : "",
        bathrooms: attrs.bathrooms != null ? String(attrs.bathrooms) : "",
        furnishing: attrs.furnishing != null ? String(attrs.furnishing) : "",
        frontageWidthFt: attrs.frontageWidthFt != null ? String(attrs.frontageWidthFt) : "",
        footfallEstimate: attrs.footfallEstimate != null ? String(attrs.footfallEstimate) : "",
        shutterType: attrs.shutterType != null ? String(attrs.shutterType) : "",
        floorPlateSqft: attrs.floorPlateSqft != null ? String(attrs.floorPlateSqft) : "",
        powerLoadKw: attrs.powerLoadKw != null ? String(attrs.powerLoadKw) : "",
        seatingCapacity: attrs.seatingCapacity != null ? String(attrs.seatingCapacity) : "",
        loadingDockAccess: attrs.loadingDockAccess != null ? String(attrs.loadingDockAccess) : "",
        parkingRatio: attrs.parkingRatio != null ? String(attrs.parkingRatio) : "",
      });
    } else {
      setEditId(null);
      setForm({
        propertyType: "FLAT",
        label: "",
        towerId: "",
        carpetArea: "",
        builtUpArea: "",
        areaUnit: "SQFT",
        price: "",
        totalCount: "1",
        availableCount: "1",
        floorNumber: "",
        facing: "",
        viewType: "",
        bookingAmount: "",
        bedrooms: "",
        bathrooms: "",
        furnishing: "",
        frontageWidthFt: "",
        footfallEstimate: "",
        shutterType: "",
        floorPlateSqft: "",
        powerLoadKw: "",
        seatingCapacity: "",
        loadingDockAccess: "",
        parkingRatio: "",
      });
    }
    setDialogOpen(true);
  };

  const handleSave = () => {
    setError("");
    const payload: Record<string, unknown> = {
      propertyType: form.propertyType,
      label: form.label,
      areaUnit: form.areaUnit,
      price: Number(form.price),
      priceUnit: "TOTAL",
      totalCount: Number(form.totalCount),
      availableCount: Number(form.availableCount),
    };
    if (form.towerId) payload.towerId = form.towerId;
    if (form.carpetArea) payload.carpetArea = Number(form.carpetArea);
    if (form.builtUpArea) payload.builtUpArea = Number(form.builtUpArea);
    if (form.floorNumber) payload.floorNumber = Number(form.floorNumber);
    if (form.facing) payload.facing = form.facing;
    if (form.viewType) payload.viewType = form.viewType;
    if (form.bookingAmount) payload.bookingAmount = Number(form.bookingAmount);

    const attrs: Record<string, unknown> = {};
    if (form.propertyType === "FLAT" || form.propertyType === "TENEMENT") {
      if (form.bedrooms) attrs.bedrooms = Number(form.bedrooms);
      if (form.bathrooms) attrs.bathrooms = Number(form.bathrooms);
      if (form.furnishing) attrs.furnishing = form.furnishing;
    }
    if (form.propertyType === "SHOP") {
      if (form.frontageWidthFt) attrs.frontageWidthFt = Number(form.frontageWidthFt);
      if (form.footfallEstimate) attrs.footfallEstimate = form.footfallEstimate;
      if (form.shutterType) attrs.shutterType = form.shutterType;
    }
    if (form.propertyType === "CORPORATE") {
      if (form.floorPlateSqft) attrs.floorPlateSqft = Number(form.floorPlateSqft);
      if (form.powerLoadKw) attrs.powerLoadKw = Number(form.powerLoadKw);
      if (form.seatingCapacity) attrs.seatingCapacity = Number(form.seatingCapacity);
      if (form.loadingDockAccess) attrs.loadingDockAccess = form.loadingDockAccess;
      if (form.parkingRatio) attrs.parkingRatio = form.parkingRatio;
    }
    if (Object.keys(attrs).length > 0) payload.attributes = attrs;

    const opts = {
      onSuccess: () => setDialogOpen(false),
      onError: (err: unknown) => {
        const apiErr = err as { message?: string };
        setError(apiErr?.message ?? "Failed to save unit type.");
      },
    };

    if (editId) {
      updateUnitType.mutate(
        {
          id: editId,
          data: payload as unknown as Parameters<
            typeof updateUnitType.mutate
          >[0]["data"],
        },
        opts,
      );
    } else {
      createUnitType.mutate(
        {
          projectId,
          data: payload as unknown as Parameters<
            typeof createUnitType.mutate
          >[0]["data"],
        },
        opts,
      );
    }
  };

  if (isLoading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Typography variant="h6">Unit Types</Typography>
        <Button
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
          variant="contained"
          size="small"
          sx={{ textTransform: "none" }}
        >
          Add Unit Type
        </Button>
      </Box>
      <Box sx={{ overflowX: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Label</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Area</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Tower</TableCell>
              <TableCell>Avail.</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {unitTypes.map((ut) => (
              <TableRow key={ut.id}>
                <TableCell>{ut.label}</TableCell>
                <TableCell>
                  <Chip label={ut.propertyType} size="small" variant="outlined" />
                </TableCell>
                <TableCell>
                  {ut.carpetArea ? formatArea(ut.carpetArea, ut.areaUnit) : "\u2014"}
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{ fontFamily: "'SF Mono', 'Fira Code', monospace" }}
                  >
                    {formatPrice(ut.price, ut.priceUnit)}
                  </Typography>
                </TableCell>
                <TableCell>
                  {ut.towerId ? towerMap[ut.towerId] ?? "\u2014" : "\u2014"}
                </TableCell>
                <TableCell>
                  {ut.availableCount} / {ut.totalCount}
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => handleOpen(ut)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => {
                      if (confirm("Delete this unit type?"))
                        deleteUnitType.mutate(ut.id);
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {unitTypes.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    align="center"
                  >
                    No unit types defined yet.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        fullScreen={false}
        PaperProps={{ sx: { mx: { xs: 1, sm: 3 } } }}
      >
        <DialogTitle>
          {editId ? "Edit Unit Type" : "Add Unit Type"}
        </DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "16px !important" }}
        >
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Label"
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            fullWidth
            size="small"
          />
          <FormControl fullWidth size="small">
            <InputLabel>Property Type</InputLabel>
            <Select
              value={form.propertyType}
              label="Property Type"
              onChange={(e) =>
                setForm({ ...form, propertyType: e.target.value as PropertyType })
              }
            >
              <MenuItem value="FLAT">Flat</MenuItem>
              <MenuItem value="HOUSE">House</MenuItem>
              <MenuItem value="PLOT">Plot</MenuItem>
              <MenuItem value="TENEMENT">Tenement</MenuItem>
              <MenuItem value="SHOP">Shop</MenuItem>
              <MenuItem value="CORPORATE">Corporate</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel>Tower</InputLabel>
            <Select
              value={form.towerId}
              label="Tower"
              onChange={(e) =>
                setForm({ ...form, towerId: e.target.value })
              }
            >
              <MenuItem value="">None</MenuItem>
              {towers.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
            <TextField
              label="Carpet Area"
              type="number"
              value={form.carpetArea}
              onChange={(e) =>
                setForm({ ...form, carpetArea: e.target.value })
              }
              fullWidth
              size="small"
            />
            <TextField
              label="Built-up Area"
              type="number"
              value={form.builtUpArea}
              onChange={(e) =>
                setForm({ ...form, builtUpArea: e.target.value })
              }
              fullWidth
              size="small"
            />
          </Box>
          <FormControl fullWidth size="small">
            <InputLabel>Area Unit</InputLabel>
            <Select
              value={form.areaUnit}
              label="Area Unit"
              onChange={(e) =>
                setForm({ ...form, areaUnit: e.target.value as AreaUnit })
              }
            >
              <MenuItem value="SQFT">sq.ft</MenuItem>
              <MenuItem value="SQM">sq.m</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
            <TextField
              label="Floor Number"
              type="number"
              value={form.floorNumber}
              onChange={(e) => setForm({ ...form, floorNumber: e.target.value })}
              fullWidth
              size="small"
            />
            <FormControl fullWidth size="small">
              <InputLabel>Facing</InputLabel>
              <Select
                value={form.facing}
                label="Facing"
                onChange={(e) =>
                  setForm({ ...form, facing: e.target.value as Facing | "" })
                }
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {FACING_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
            <TextField
              label="View Type"
              value={form.viewType}
              onChange={(e) => setForm({ ...form, viewType: e.target.value })}
              fullWidth
              size="small"
              placeholder="e.g. Garden view"
            />
            <TextField
              label="Booking Amount (₹)"
              type="number"
              value={form.bookingAmount}
              onChange={(e) => setForm({ ...form, bookingAmount: e.target.value })}
              fullWidth
              size="small"
            />
          </Box>
          {(form.propertyType === "FLAT" || form.propertyType === "TENEMENT") && (
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
              <TextField
                label="Bedrooms"
                type="number"
                value={form.bedrooms}
                onChange={(e) => setForm({ ...form, bedrooms: e.target.value })}
                fullWidth
                size="small"
              />
              <TextField
                label="Bathrooms"
                type="number"
                value={form.bathrooms}
                onChange={(e) => setForm({ ...form, bathrooms: e.target.value })}
                fullWidth
                size="small"
              />
              <TextField
                label="Furnishing"
                value={form.furnishing}
                onChange={(e) => setForm({ ...form, furnishing: e.target.value })}
                fullWidth
                size="small"
                placeholder="e.g. Semi-furnished"
              />
            </Box>
          )}
          {form.propertyType === "SHOP" && (
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
              <TextField
                label="Frontage Width (ft)"
                type="number"
                value={form.frontageWidthFt}
                onChange={(e) => setForm({ ...form, frontageWidthFt: e.target.value })}
                fullWidth
                size="small"
              />
              <TextField
                label="Footfall Estimate"
                value={form.footfallEstimate}
                onChange={(e) => setForm({ ...form, footfallEstimate: e.target.value })}
                fullWidth
                size="small"
                placeholder="e.g. 1000/day"
              />
              <TextField
                label="Shutter Type"
                value={form.shutterType}
                onChange={(e) => setForm({ ...form, shutterType: e.target.value })}
                fullWidth
                size="small"
                placeholder="e.g. Roller shutter"
              />
            </Box>
          )}
          {form.propertyType === "CORPORATE" && (
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
              <TextField
                label="Floor Plate (sq.ft)"
                type="number"
                value={form.floorPlateSqft}
                onChange={(e) => setForm({ ...form, floorPlateSqft: e.target.value })}
                fullWidth
                size="small"
              />
              <TextField
                label="Power Load (kW)"
                type="number"
                value={form.powerLoadKw}
                onChange={(e) => setForm({ ...form, powerLoadKw: e.target.value })}
                fullWidth
                size="small"
              />
              <TextField
                label="Seating Capacity"
                type="number"
                value={form.seatingCapacity}
                onChange={(e) => setForm({ ...form, seatingCapacity: e.target.value })}
                fullWidth
                size="small"
              />
              <TextField
                label="Loading Dock Access"
                value={form.loadingDockAccess}
                onChange={(e) => setForm({ ...form, loadingDockAccess: e.target.value })}
                fullWidth
                size="small"
                placeholder="e.g. Yes"
              />
              <TextField
                label="Parking Ratio"
                value={form.parkingRatio}
                onChange={(e) => setForm({ ...form, parkingRatio: e.target.value })}
                fullWidth
                size="small"
                placeholder="e.g. 1:2000 sq.ft"
              />
            </Box>
          )}
          <TextField
            label="Price (Total ₹)"
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            fullWidth
            size="small"
            required
            helperText="Enter the full price in rupees, e.g. 7500000 for ₹75 Lakh"
          />
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
            <TextField
              label="Total Units"
              type="number"
              value={form.totalCount}
              onChange={(e) =>
                setForm({ ...form, totalCount: e.target.value })
              }
              fullWidth
              size="small"
              required
            />
            <TextField
              label="Available Units"
              type="number"
              value={form.availableCount}
              onChange={(e) =>
                setForm({ ...form, availableCount: e.target.value })
              }
              fullWidth
              size="small"
              required
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={
              !form.label ||
              !form.price ||
              createUnitType.isPending ||
              updateUnitType.isPending
            }
            sx={{ textTransform: "none" }}
          >
            {createUnitType.isPending || updateUnitType.isPending ? (
              <CircularProgress size={20} />
            ) : editId ? (
              "Update"
            ) : (
              "Add"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

/* ─── Media ───────────────────────────────────────────── */

function MediaTab({ projectId }: { projectId: string }) {
  const { data: media = [], isLoading } = useProjectMedia(projectId);
  const uploadMedia = useUploadMedia();
  const deleteMedia = useDeleteMedia();
  const reorderMedia = useReorderMedia();
  const setPrimaryMedia = useSetPrimaryMedia();
  const { data: unitTypes = [] } = useUnitTypes(projectId);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [mediaType, setMediaType] = useState<MediaType>("IMAGE");
  const [unitTypeId, setUnitTypeId] = useState<string>("");

  const unitTypeMap = Object.fromEntries(unitTypes.map((ut) => [ut.id, ut.label]));

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadMedia.mutate(
      {
        projectId,
        file,
        type: mediaType,
        ...(unitTypeId ? { unitTypeId } : {}),
        onUploadProgress: setUploadProgress,
      },
      {
        onSuccess: () => setUploadProgress(null),
        onError: () => setUploadProgress(null),
      },
    );
    e.target.value = "";
  };

  const handleMove = (index: number, direction: -1 | 1) => {
    const sorted = [...media].sort((a, b) => a.displayOrder - b.displayOrder);
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= sorted.length) return;
    const targetItem = sorted[targetIdx];
    const currentItem = sorted[index];
    if (!targetItem || !currentItem) return;
    const newOrder = sorted.map((m, i) => {
      if (i === index)
        return { id: currentItem.id, displayOrder: targetItem.displayOrder };
      if (i === targetIdx)
        return { id: targetItem.id, displayOrder: currentItem.displayOrder };
      return { id: m.id, displayOrder: m.displayOrder };
    });
    reorderMedia.mutate({ projectId, order: newOrder });
  };

  const sorted = [...media].sort((a, b) => a.displayOrder - b.displayOrder);

  if (isLoading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Typography variant="h6">Media</Typography>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={mediaType}
              onChange={(e) => setMediaType(e.target.value as MediaType)}
              displayEmpty
            >
              <MenuItem value="IMAGE">Image</MenuItem>
              <MenuItem value="VIDEO">Video</MenuItem>
              <MenuItem value="FLOOR_PLAN">Floor Plan</MenuItem>
              <MenuItem value="BROCHURE">Brochure</MenuItem>
              <MenuItem value="MASTER_PLAN">Master Plan</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <Select
              value={unitTypeId}
              onChange={(e) => setUnitTypeId(e.target.value)}
              displayEmpty
            >
              <MenuItem value="">
                <em>Project (no unit)</em>
              </MenuItem>
              {unitTypes.map((ut) => (
                <MenuItem key={ut.id} value={ut.id}>
                  {ut.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            component="label"
            variant="contained"
            size="small"
            startIcon={<UploadFileIcon />}
            disabled={uploadMedia.isPending}
            sx={{ textTransform: "none" }}
          >
            Upload
            <input type="file" hidden onChange={handleUpload} accept="image/*,video/*,.pdf" />
          </Button>
        </Box>
      </Box>
      {uploadProgress !== null && (
        <Box sx={{ mb: 2 }}>
          <LinearProgress variant="determinate" value={uploadProgress} />
          <Typography variant="caption" color="text.secondary">
            Uploading... {uploadProgress}%
          </Typography>
        </Box>
      )}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(auto-fill, minmax(140px, 1fr))",
            sm: "repeat(auto-fill, minmax(180px, 1fr))",
          },
          gap: 2,
        }}
      >
        {sorted.map((item, idx) => (
          <Card key={item.id} sx={{ position: "relative" }}>
            {item.type === "IMAGE" ||
            item.type === "FLOOR_PLAN" ||
            item.type === "MASTER_PLAN" ? (
              <Box
                component="img"
                src={item.url}
                alt={item.type}
                sx={{ width: "100%", height: 140, objectFit: "cover" }}
              />
            ) : (
              <Box
                sx={{
                  height: 140,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "grey.100",
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  {item.type}
                </Typography>
              </Box>
            )}
            <Box
              sx={{
                position: "absolute",
                top: 4,
                right: 4,
                display: "flex",
                gap: 0.5,
              }}
            >
              <IconButton
                size="small"
                sx={{ bgcolor: "rgba(255,255,255,0.9)" }}
                onClick={() =>
                  setPrimaryMedia.mutate({ projectId, mediaId: item.id })
                }
              >
                {item.isPrimary ? (
                  <StarIcon sx={{ fontSize: 16, color: "warning.main" }} />
                ) : (
                  <StarBorderIcon sx={{ fontSize: 16 }} />
                )}
              </IconButton>
            </Box>
            <Box
              sx={{
                position: "absolute",
                top: 4,
                left: 4,
                display: "flex",
                gap: 0.5,
              }}
            >
              <IconButton
                size="small"
                sx={{ bgcolor: "rgba(255,255,255,0.9)" }}
                onClick={() => handleMove(idx, -1)}
                disabled={idx === 0}
              >
                <ArrowUpwardIcon sx={{ fontSize: 14 }} />
              </IconButton>
              <IconButton
                size="small"
                sx={{ bgcolor: "rgba(255,255,255,0.9)" }}
                onClick={() => handleMove(idx, 1)}
                disabled={idx === sorted.length - 1}
              >
                <ArrowDownwardIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Box>
            <CardContent sx={{ p: 1, "&:last-child": { pb: 1 } }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Chip label={item.type} size="small" variant="outlined" />
                {item.unitTypeId && (
                  <Chip
                    label={unitTypeMap[item.unitTypeId] ?? "Unit"}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                )}
                <IconButton
                  size="small"
                  onClick={() => {
                    if (confirm("Delete this media?"))
                      deleteMedia.mutate(item.id);
                  }}
                >
                  <DeleteIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
      {sorted.length === 0 && (
        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ py: 4 }}
        >
          No media uploaded yet. Click Upload to add images, floor plans, or
          brochures.
        </Typography>
      )}
    </Box>
  );
}

/* ─── Contacts ────────────────────────────────────────── */

function ContactsTab({ projectId }: { projectId: string }) {
  const { data: contacts = [], isLoading } = useContacts(projectId);
  const createContact = useCreateContact();
  const updateContact = useUpdateContact();
  const deleteContact = useDeleteContact();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    designation: "",
    isPrimary: false,
  });

  const handleOpen = (contact?: {
    id: string;
    name: string;
    phone: string;
    email?: string | null | undefined;
    designation?: string | null | undefined;
    isPrimary: boolean;
  }) => {
    setError("");
    if (contact) {
      setEditId(contact.id);
      setForm({
        name: contact.name,
        phone: contact.phone,
        email: contact.email ?? "",
        designation: contact.designation ?? "",
        isPrimary: contact.isPrimary,
      });
    } else {
      setEditId(null);
      setForm({ name: "", phone: "", email: "", designation: "", isPrimary: false });
    }
    setDialogOpen(true);
  };

  const handleSave = () => {
    setError("");
    const payload: Record<string, unknown> = {
      name: form.name,
      phone: form.phone,
      isPrimary: form.isPrimary,
    };
    if (form.email) payload.email = form.email;
    if (form.designation) payload.designation = form.designation;
    const opts = {
      onSuccess: () => setDialogOpen(false),
      onError: (err: unknown) => {
        const apiErr = err as { message?: string };
        setError(apiErr?.message ?? "Failed to save contact.");
      },
    };
    if (editId) {
      updateContact.mutate(
        {
          id: editId,
          data: payload as unknown as Parameters<
            typeof updateContact.mutate
          >[0]["data"],
        },
        opts,
      );
    } else {
      createContact.mutate(
        {
          projectId,
          data: payload as unknown as Parameters<
            typeof createContact.mutate
          >[0]["data"],
        },
        opts,
      );
    }
  };

  if (isLoading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Typography variant="h6">Contacts</Typography>
        <Button
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
          variant="contained"
          size="small"
          sx={{ textTransform: "none" }}
        >
          Add Contact
        </Button>
      </Box>
      <Box sx={{ overflowX: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                Email
              </TableCell>
              <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                Designation
              </TableCell>
              <TableCell>Primary</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {contacts.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{c.name}</TableCell>
                <TableCell>{c.phone}</TableCell>
                <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                  {c.email ?? "\u2014"}
                </TableCell>
                <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                  {c.designation ?? "\u2014"}
                </TableCell>
                <TableCell>
                  {c.isPrimary && (
                    <Chip label="Primary" size="small" color="primary" />
                  )}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => handleOpen(c)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => {
                      if (confirm("Delete this contact?"))
                        deleteContact.mutate(c.id);
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {contacts.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    align="center"
                  >
                    No contacts added yet.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { mx: { xs: 1, sm: 3 } } }}
      >
        <DialogTitle>{editId ? "Edit Contact" : "Add Contact"}</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "16px !important" }}
        >
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            fullWidth
            size="small"
            required
          />
          <TextField
            label="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            fullWidth
            size="small"
            required
          />
          <TextField
            label="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            fullWidth
            size="small"
          />
          <TextField
            label="Designation"
            value={form.designation}
            onChange={(e) =>
              setForm({ ...form, designation: e.target.value })
            }
            fullWidth
            size="small"
          />
          <FormControlLabel
            control={
              <Switch
                checked={form.isPrimary}
                onChange={(e) =>
                  setForm({ ...form, isPrimary: e.target.checked })
                }
                size="small"
              />
            }
            label="Primary Contact"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={
              !form.name ||
              !form.phone ||
              createContact.isPending ||
              updateContact.isPending
            }
            sx={{ textTransform: "none" }}
          >
            {createContact.isPending || updateContact.isPending ? (
              <CircularProgress size={20} />
            ) : editId ? (
              "Update"
            ) : (
              "Add"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

/* ─── Amenities ───────────────────────────────────────── */

function AmenitiesTab({ projectId }: { projectId: string }) {
  const { data: project, isLoading } = useProject(projectId);
  const { data: allAmenities = [], isLoading: amenitiesLoading } =
    useAmenities();
  const updateAmenities = useUpdateProjectAmenities();

  const current = project?.amenities ?? [];
  const currentIds = current.map((a) => a.amenity.id);

  if (isLoading || amenitiesLoading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Select the amenities available in this project. Your selection shows up
        on the public listing.
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        {allAmenities.map((a) => {
          const active = currentIds.includes(a.id);
          return (
            <Chip
              key={a.id}
              label={a.name}
              onClick={() => {
                const next = active
                  ? currentIds.filter((id) => id !== a.id)
                  : [...currentIds, a.id];
                updateAmenities.mutate({ id: projectId, data: { amenityIds: next } });
              }}
              {...(active
                ? {
                    onDelete: () => {
                      const next = currentIds.filter((id) => id !== a.id);
                      updateAmenities.mutate({
                        id: projectId,
                        data: { amenityIds: next },
                      });
                    },
                  }
                : {})}
              color={active ? "primary" : "default"}
              variant={active ? "filled" : "outlined"}
              sx={{ fontSize: "0.8125rem", py: 0.75, cursor: "pointer" }}
            />
          );
        })}
        {allAmenities.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            No amenities available.
          </Typography>
        )}
      </Box>
      <Box sx={{ mt: 3, display: "flex", alignItems: "center", gap: 1 }}>
        {updateAmenities.isPending && <CircularProgress size={16} />}
        <Typography variant="caption" color="text.secondary">
          {updateAmenities.isPending
            ? "Saving…"
            : `${currentIds.length} amenity${currentIds.length !== 1 ? "ies" : ""} selected`}
        </Typography>
      </Box>
    </Box>
  );
}

/* ─── Main ────────────────────────────────────────────── */

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const projectId = id ?? "";
  const { data: project, isLoading } = useProject(projectId);
  const publishProject = usePublishProject();
  const unpublishProject = useUnpublishProject();
  const [tab, setTab] = useState(0);

  const isPublished = (status?: string) =>
    status
      ? ["UPCOMING", "UNDER_CONSTRUCTION", "READY"].includes(status)
      : false;

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!project) {
    return <Typography>Project not found.</Typography>;
  }

  return (
    <Box>
      {/* Header */}
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
        <Box sx={{ minWidth: 0 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              mb: 0.5,
              flexWrap: "wrap",
            }}
          >
            <Typography variant="h5" fontWeight={700} sx={{ wordBreak: "break-word" }}>
              {project.title}
            </Typography>
            <StatusBadge status={project.status} />
          </Box>
          <Typography variant="body2" color="text.secondary">
            {project.city?.name ?? ""}
            {project.locality?.name ? `, ${project.locality.name}` : ""}
          </Typography>
        </Box>
        <Box sx={{ flexShrink: 0 }}>
          {isPublished(project.status) ? (
            <Button
              variant="outlined"
              startIcon={<StopCircleIcon />}
              onClick={() => unpublishProject.mutate(projectId)}
              disabled={unpublishProject.isPending}
              size="small"
              sx={{ textTransform: "none" }}
            >
              Unpublish
            </Button>
          ) : (
            <Button
              variant="contained"
              startIcon={<PublishIcon />}
              onClick={() => publishProject.mutate(projectId)}
              disabled={publishProject.isPending}
              size="small"
              sx={{ textTransform: "none" }}
            >
              Publish
            </Button>
          )}
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          TabIndicatorProps={{ sx: { minWidth: 40 } }}
        >
          <Tab label="Overview" />
          <Tab label="Towers" />
          <Tab label="Unit Types" />
          <Tab label="Amenities" />
          <Tab label="Nearby" />
          <Tab label="Legal & Compliance" />
          <Tab label="Construction & Specs" />
          <Tab label="Pricing & Payment" />
          <Tab label="FAQs" />
          <Tab label="Media" />
          <Tab label="Contacts" />
        </Tabs>
      </Box>

      {tab === 0 && <OverviewTab projectId={projectId} />}
      {tab === 1 && <TowersTab projectId={projectId} />}
      {tab === 2 && <UnitTypesTab projectId={projectId} />}
      {tab === 3 && <AmenitiesTab projectId={projectId} />}
      {tab === 4 && <NearbyTab project={project} />}
      {tab === 5 && <LegalComplianceTab project={project} />}
      {tab === 6 && <ConstructionSpecsTab projectId={projectId} />}
      {tab === 7 && <PricingPaymentTab projectId={projectId} />}
      {tab === 8 && <FaqsTab projectId={projectId} />}
      {tab === 9 && <MediaTab projectId={projectId} />}
      {tab === 10 && <ContactsTab projectId={projectId} />}
    </Box>
  );
}
