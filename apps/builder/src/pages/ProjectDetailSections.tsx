import { useState } from "react";
import {
  Box,
  Typography,
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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  CircularProgress,
  Alert,
  Chip,
  Stack,
} from "@mui/material";
import { DeleteIcon, EditIcon, AddIcon } from "../components/icons";
import {
  useProject,
  useUpdateProject,
  useLandmarks,
  useCreateLandmark,
  useUpdateLandmark,
  useDeleteLandmark,
  usePriceComponents,
  useCreatePriceComponent,
  useUpdatePriceComponent,
  useDeletePriceComponent,
  usePaymentPlans,
  useCreatePaymentPlan,
  useUpdatePaymentPlan,
  useDeletePaymentPlan,
  useBankPartners,
  useCreateBankPartner,
  useUpdateBankPartner,
  useDeleteBankPartner,
  useConstructionUpdates,
  useCreateConstructionUpdate,
  useUpdateConstructionUpdate,
  useDeleteConstructionUpdate,
  useSpecifications,
  useCreateSpecification,
  useUpdateSpecification,
  useDeleteSpecification,
  useFaqs,
  useCreateFaq,
  useUpdateFaq,
  useDeleteFaq,
} from "../lib/hooks";
import type { ProjectDetail } from "../lib/api/schemas";
import type {
  LandmarkPayload,
  PriceComponentPayload,
  PaymentPlanPayload,
  BankPartnerPayload,
  ConstructionUpdatePayload,
  SpecificationPayload,
  FaqPayload,
  UpdateLandmarkPayload,
  UpdatePriceComponentPayload,
  UpdatePaymentPlanPayload,
  UpdateBankPartnerPayload,
  UpdateConstructionUpdatePayload,
  UpdateSpecificationPayload,
  UpdateFaqPayload,
} from "../lib/hooks";
import { formatPrice } from "../utils/format";

/* ─── Shared field rendering ─────────────────────────── */

export interface FieldDef {
  name: string;
  label: string;
  type?: "text" | "number" | "select" | "switch" | "multiline" | "date";
  options?: { value: string; label: string }[];
  required?: boolean;
  helperText?: string;
  fullRow?: boolean;
  placeholder?: string;
}

export interface CrudRow {
  id: string;
  [key: string]: unknown;
}

interface CrudRepeaterProps<T extends CrudRow> {
  title: string;
  items: T[];
  loading?: boolean;
  fields: FieldDef[];
  onSave: (values: Record<string, unknown>, id?: string) => void;
  onDelete: (id: string) => void;
  saving?: boolean;
  rowTitle: (item: T) => string;
  rowSubtitle?: (item: T) => string;
  rowBadge?: (item: T) => string;
  rowImage?: (item: T) => string | null;
  emptyText?: string;
}

export function CrudRepeater<T extends CrudRow>({
  title,
  items,
  loading,
  fields,
  onSave,
  onDelete,
  saving,
  rowTitle,
  rowSubtitle,
  rowBadge,
  rowImage,
  emptyText = "Nothing added yet.",
}: CrudRepeaterProps<T>) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [error, setError] = useState("");

  const handleOpen = (item?: T) => {
    setError("");
    if (item) {
      setEditId(item.id);
      const init: Record<string, unknown> = {};
      for (const f of fields) {
        const v = item[f.name];
        if (v === null || v === undefined) {
          init[f.name] = f.type === "switch" ? false : "";
        } else if (Array.isArray(v) || typeof v === "object") {
          init[f.name] = JSON.stringify(v);
        } else {
          init[f.name] = String(v);
        }
      }
      setForm(init);
    } else {
      setEditId(null);
      const init: Record<string, unknown> = {};
      for (const f of fields) {
        init[f.name] = f.type === "switch" ? false : "";
      }
      setForm(init);
    }
    setDialogOpen(true);
  };

  const handleSave = () => {
    setError("");
    for (const f of fields) {
      if (f.required) {
        const v = form[f.name];
        if (v === "" || v === undefined || v === null) {
          setError(`${f.label} is required.`);
          return;
        }
      }
    }
    onSave(form, editId ?? undefined);
  };

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
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
          <Typography variant="h6">{title}</Typography>
          <Button
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
            variant="contained"
            size="small"
            sx={{ textTransform: "none" }}
          >
            Add
          </Button>
        </Box>
        {items.length === 0 ? (
          <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
            {emptyText}
          </Typography>
        ) : (
          <Box sx={{ overflowX: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  {rowSubtitle ? <TableCell>Details</TableCell> : null}
                  {rowBadge ? <TableCell>Status</TableCell> : null}
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        {rowImage && rowImage(item) ? (
                          <Box
                            component="img"
                            src={rowImage(item) ?? ""}
                            alt=""
                            sx={{
                              width: 44,
                              height: 32,
                              objectFit: "cover",
                              borderRadius: 1,
                              bgcolor: "#EBF0F7",
                            }}
                          />
                        ) : null}
                        <Typography variant="body2">{rowTitle(item)}</Typography>
                      </Box>
                    </TableCell>
                    {rowSubtitle ? (
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {rowSubtitle(item)}
                        </Typography>
                      </TableCell>
                    ) : null}
                    {rowBadge ? (
                      <TableCell>
                        <Chip label={rowBadge(item)} size="small" variant="outlined" />
                      </TableCell>
                    ) : null}
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleOpen(item)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => {
                          if (confirm("Delete this item?")) onDelete(item.id);
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </CardContent>
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { mx: { xs: 1, sm: 3 } } }}
      >
        <DialogTitle>{editId ? `Edit ${title}` : `Add ${title}`}</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "16px !important" }}
        >
          {error && <Alert severity="error">{error}</Alert>}
          {fields.map((f) =>
            f.type === "switch" ? (
              <FormControlLabel
                key={f.name}
                control={
                  <Switch
                    checked={Boolean(form[f.name])}
                    onChange={(e) =>
                      setForm({ ...form, [f.name]: e.target.checked })
                    }
                    size="small"
                  />
                }
                label={f.label}
              />
            ) : f.type === "select" ? (
              <FormControl key={f.name} fullWidth size="small">
                <InputLabel>{f.label}</InputLabel>
                <Select
                  value={(form[f.name] as string) ?? ""}
                  label={f.label}
                  onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {(f.options ?? []).map((o) => (
                    <MenuItem key={o.value} value={o.value}>
                      {o.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <TextField
                key={f.name}
                label={f.label}
                type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
                value={(form[f.name] as string) ?? ""}
                onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                multiline={f.type === "multiline"}
                {...(f.type === "multiline" ? { minRows: 3 } : {})}
                fullWidth
                size="small"
                required={f.required ?? false}
                {...(f.helperText ? { helperText: f.helperText } : {})}
                {...(f.placeholder ? { placeholder: f.placeholder } : {})}
                {...(f.type === "date" ? { InputLabelProps: { shrink: true } } : {})}
              />
            ),
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={Boolean(saving)}
            sx={{ textTransform: "none" }}
          >
            {saving ? <CircularProgress size={20} /> : editId ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}

/* ─── Project scalar fields card ─────────────────────── */

interface ProjectFieldsCardProps {
  title: string;
  fields: FieldDef[];
  initial: Record<string, unknown>;
  onSave: (payload: Record<string, unknown>) => void;
  saving?: boolean;
  helperText?: string;
}

export function ProjectFieldsCard({
  title,
  fields,
  initial,
  onSave,
  saving,
  helperText,
}: ProjectFieldsCardProps) {
  const [form, setForm] = useState<Record<string, unknown>>(() => {
    const init: Record<string, unknown> = {};
    for (const f of fields) {
      const v = initial[f.name];
      if (v === null || v === undefined) {
        init[f.name] = f.type === "switch" ? false : "";
      } else {
        init[f.name] = v;
      }
    }
    return init;
  });
  const [dirty, setDirty] = useState(false);

  const setValue = (name: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setDirty(true);
  };

  const handleSave = () => {
    const payload: Record<string, unknown> = {};
    for (const f of fields) {
      const v = form[f.name];
      if (f.type === "switch") {
        payload[f.name] = Boolean(v);
      } else if (f.type === "number") {
        if (v !== "" && v !== null && v !== undefined) payload[f.name] = Number(v);
      } else {
        if (v !== "" && v !== null && v !== undefined) payload[f.name] = v;
      }
    }
    onSave(payload);
    setDirty(false);
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        {helperText && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {helperText}
          </Typography>
        )}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {fields.map((f) =>
            f.type === "switch" ? (
              <FormControlLabel
                key={f.name}
                control={
                  <Switch
                    checked={Boolean(form[f.name])}
                    onChange={(e) => setValue(f.name, e.target.checked)}
                    size="small"
                  />
                }
                label={f.label}
              />
            ) : f.type === "select" ? (
              <FormControl key={f.name} fullWidth size="small">
                <InputLabel>{f.label}</InputLabel>
                <Select
                  value={(form[f.name] as string) ?? ""}
                  label={f.label}
                  onChange={(e) => setValue(f.name, e.target.value)}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {(f.options ?? []).map((o) => (
                    <MenuItem key={o.value} value={o.value}>
                      {o.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <TextField
                key={f.name}
                label={f.label}
                type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
                value={(form[f.name] as string) ?? ""}
                onChange={(e) => setValue(f.name, e.target.value)}
                multiline={f.type === "multiline"}
                {...(f.type === "multiline" ? { minRows: 3 } : {})}
                fullWidth
                size="small"
                {...(f.helperText ? { helperText: f.helperText } : {})}
                {...(f.type === "date" ? { InputLabelProps: { shrink: true } } : {})}
              />
            ),
          )}
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={saving || !dirty}
              size="small"
              sx={{ textTransform: "none" }}
            >
              {saving ? <CircularProgress size={20} /> : "Save"}
            </Button>
            {dirty && (
              <Button
                variant="outlined"
                onClick={() => {
                  const init: Record<string, unknown> = {};
                  for (const f of fields) {
                    const v = initial[f.name];
                    init[f.name] =
                      v === null || v === undefined
                        ? f.type === "switch"
                          ? false
                          : ""
                        : v;
                  }
                  setForm(init);
                  setDirty(false);
                }}
                size="small"
                sx={{ textTransform: "none" }}
              >
                Cancel
              </Button>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

/* ─── Option lists ───────────────────────────────────── */

const RERA_STATUS_OPTIONS = [
  { value: "REGISTERED", label: "Registered" },
  { value: "PENDING", label: "Pending" },
  { value: "NOT_APPLICABLE", label: "Not applicable" },
];

const CERT_STATUS_OPTIONS = [
  { value: "OBTAINED", label: "Obtained" },
  { value: "APPLIED", label: "Applied" },
  { value: "PENDING", label: "Pending" },
  { value: "NOT_APPLICABLE", label: "Not applicable" },
];

const LAND_TITLE_OPTIONS = [
  { value: "CLEAR_FREEHOLD", label: "Clear freehold" },
  { value: "LEASEHOLD", label: "Leasehold" },
  { value: "CO_OPERATIVE", label: "Co-operative" },
  { value: "UNAVAILABLE", label: "Unavailable" },
];

const LITIGATION_OPTIONS = [
  { value: "NONE", label: "No litigation" },
  { value: "ONGOING", label: "Ongoing" },
  { value: "PENDING", label: "Pending" },
];

const LANDMARK_CATEGORY_OPTIONS = [
  { value: "SCHOOL", label: "School" },
  { value: "HOSPITAL", label: "Hospital" },
  { value: "TRANSIT", label: "Transit" },
  { value: "MALL", label: "Mall" },
  { value: "PARK", label: "Park" },
  { value: "BANK", label: "Bank" },
  { value: "MARKET", label: "Market" },
  { value: "OTHER", label: "Other" },
];

const SPEC_CATEGORY_OPTIONS = [
  { value: "STRUCTURE", label: "Structure" },
  { value: "FLOORING", label: "Flooring" },
  { value: "KITCHEN", label: "Kitchen" },
  { value: "BATHROOM", label: "Bathroom" },
  { value: "DOORS_WINDOWS", label: "Doors & windows" },
  { value: "ELECTRICAL", label: "Electrical" },
  { value: "PLUMBING", label: "Plumbing" },
  { value: "SECURITY", label: "Security" },
  { value: "OTHER", label: "Other" },
];

const PAYMENT_PLAN_TYPE_OPTIONS = [
  { value: "CONSTRUCTION_LINKED", label: "Construction linked" },
  { value: "FIXED_TIME", label: "Fixed time" },
  { value: "SUBVENTION", label: "Subvention" },
  { value: "PROGRESS", label: "Progress" },
];

/* ─── Legal & Compliance ─────────────────────────────── */

export function LegalComplianceTab({ project }: { project: ProjectDetail }) {
  const updateProject = useUpdateProject();

  const fields: FieldDef[] = [
    {
      name: "reraStatus",
      label: "RERA Status",
      type: "select",
      options: RERA_STATUS_OPTIONS,
    },
    {
      name: "reraPortalUrl",
      label: "RERA Portal URL",
      type: "text",
      placeholder: "https://...",
    },
    {
      name: "occupancyCertStatus",
      label: "Occupancy Certificate",
      type: "select",
      options: CERT_STATUS_OPTIONS,
    },
    {
      name: "commencementCertStatus",
      label: "Commencement Certificate",
      type: "select",
      options: CERT_STATUS_OPTIONS,
    },
    {
      name: "landTitleType",
      label: "Land Title",
      type: "select",
      options: LAND_TITLE_OPTIONS,
    },
    {
      name: "litigationStatus",
      label: "Litigation Status",
      type: "select",
      options: LITIGATION_OPTIONS,
    },
    {
      name: "litigationDetails",
      label: "Litigation Details",
      type: "multiline",
      fullRow: true,
      helperText:
        "Required when litigation is ongoing or pending. Shown to builders only, not on the public site.",
    },
  ];

  const initial: Record<string, unknown> = {
    reraStatus: project.reraStatus ?? "",
    reraPortalUrl: project.reraPortalUrl ?? "",
    occupancyCertStatus: project.occupancyCertStatus ?? "",
    commencementCertStatus: project.commencementCertStatus ?? "",
    landTitleType: project.landTitleType ?? "",
    litigationStatus: project.litigationStatus ?? "",
    litigationDetails: project.litigationDetails ?? "",
  };

  return (
    <ProjectFieldsCard
      title="Legal & Compliance"
      helperText="Regulatory and title information shown on the public detail page."
      fields={fields}
      initial={initial}
      saving={updateProject.isPending}
      onSave={(payload) =>
        updateProject.mutate({ id: project.id, data: payload })
      }
    />
  );
}

/* ─── Construction & Specs ───────────────────────────── */

export function ConstructionSpecsTab({ projectId }: { projectId: string }) {
  const updateProject = useUpdateProject();
  const { data: project } = useProject(projectId);
  const construction = useConstructionUpdates(projectId);
  const createUpdate = useCreateConstructionUpdate();
  const updateUpdate = useUpdateConstructionUpdate();
  const deleteUpdate = useDeleteConstructionUpdate();
  const specs = useSpecifications(projectId);
  const createSpec = useCreateSpecification();
  const updateSpec = useUpdateSpecification();
  const deleteSpec = useDeleteSpecification();

  const specSaving = createSpec.isPending || updateSpec.isPending;

  const updateFields: FieldDef[] = [
    { name: "title", label: "Title", required: true },
    { name: "description", label: "Description", type: "multiline" },
    { name: "updateDate", label: "Update Date", type: "date", required: true },
    {
      name: "progressPercent",
      label: "Progress (%)",
      type: "number",
      helperText: "0 to 100",
    },
  ];

  const specFields: FieldDef[] = [
    {
      name: "category",
      label: "Category",
      type: "select",
      options: SPEC_CATEGORY_OPTIONS,
      required: true,
    },
    { name: "label", label: "Label", required: true, placeholder: "e.g. Flooring" },
    { name: "value", label: "Value", required: true, placeholder: "e.g. Vitrified tiles" },
  ];

  const constructionFields: FieldDef[] = [
    {
      name: "structureType",
      label: "Structure Type",
      placeholder: "e.g. RCC framed",
    },
    { name: "powerBackupCapacity", label: "Power Backup", placeholder: "e.g. 100% backup" },
    { name: "waterSource", label: "Water Source", placeholder: "e.g. Borewell + municipal" },
    { name: "liftBrand", label: "Lift Brand", placeholder: "e.g. OTIS" },
    { name: "liftCount", label: "Lift Count", type: "number" },
    { name: "fireSafetyCompliant", label: "Fire Safety Compliant", type: "switch" },
    { name: "openSpacePercent", label: "Open Space (%)", type: "number" },
    { name: "greenAreaPercent", label: "Green Area (%)", type: "number" },
    { name: "hasCctv", label: "CCTV Coverage", type: "switch" },
    { name: "hasGatedEntry", label: "Gated Entry", type: "switch" },
    { name: "securityGuardCount", label: "Security Guards", type: "number" },
    { name: "petPolicy", label: "Pet Policy", type: "multiline", fullRow: true },
    { name: "videoWalkthroughUrl", label: "Video Walkthrough URL", type: "text" },
    { name: "virtualTour3dUrl", label: "3D Virtual Tour URL", type: "text" },
  ];

  const initial: Record<string, unknown> = {
    structureType: project?.structureType ?? "",
    powerBackupCapacity: project?.powerBackupCapacity ?? "",
    waterSource: project?.waterSource ?? "",
    liftBrand: project?.liftBrand ?? "",
    liftCount: project?.liftCount ?? "",
    fireSafetyCompliant: project?.fireSafetyCompliant ?? false,
    openSpacePercent: project?.openSpacePercent ?? "",
    greenAreaPercent: project?.greenAreaPercent ?? "",
    hasCctv: project?.hasCctv ?? false,
    hasGatedEntry: project?.hasGatedEntry ?? false,
    securityGuardCount: project?.securityGuardCount ?? "",
    petPolicy: project?.petPolicy ?? "",
    videoWalkthroughUrl: project?.videoWalkthroughUrl ?? "",
    virtualTour3dUrl: project?.virtualTour3dUrl ?? "",
  };

  return (
    <Stack spacing={3}>
      <ProjectFieldsCard
        title="Construction Details"
        fields={constructionFields}
        initial={initial}
        saving={updateProject.isPending}
        onSave={(payload) => updateProject.mutate({ id: projectId, data: payload })}
      />
      <CrudRepeater<CrudRow>
        title="Construction Updates"
        items={(construction.data ?? []) as unknown as CrudRow[]}
        loading={construction.isLoading}
        fields={updateFields}
        saving={createUpdate.isPending || updateUpdate.isPending}
        emptyText="No construction updates yet. Keep buyers informed with photos and progress."
        rowTitle={(item) => String(item.title ?? "")}
        rowSubtitle={(item) =>
          [item.description, item.updateDate].filter(Boolean).join(" — ")
        }
        rowBadge={(item) =>
          item.progressPercent != null ? `${item.progressPercent}%` : "—"
        }
        rowImage={(item) => (item.photoUrl ? String(item.photoUrl) : null)}
        onSave={(values, id) => {
          if (id) {
            updateUpdate.mutate({
              id,
              data: values as unknown as UpdateConstructionUpdatePayload,
            });
          } else {
            createUpdate.mutate({
              projectId,
              data: values as unknown as ConstructionUpdatePayload,
            });
          }
        }}
        onDelete={(id) => deleteUpdate.mutate(id)}
      />
      <CrudRepeater<CrudRow>
        title="Specifications"
        items={(specs.data ?? []) as unknown as CrudRow[]}
        loading={specs.isLoading}
        fields={specFields}
        saving={specSaving}
        emptyText="No specifications added yet. Describe flooring, fixtures and finishes."
        rowTitle={(item) => String(item.label ?? "")}
        rowSubtitle={(item) => String(item.value ?? "")}
        rowBadge={(item) => String(item.category ?? "")}
        onSave={(values, id) => {
          if (id) {
            updateSpec.mutate({
              id,
              data: values as unknown as UpdateSpecificationPayload,
            });
          } else {
            createSpec.mutate({
              projectId,
              data: values as unknown as SpecificationPayload,
            });
          }
        }}
        onDelete={(id) => deleteSpec.mutate(id)}
      />
    </Stack>
  );
}

/* ─── Pricing & Payment ──────────────────────────────── */

export function PricingPaymentTab({ projectId }: { projectId: string }) {
  const components = usePriceComponents(projectId);
  const createComponent = useCreatePriceComponent();
  const updateComponent = useUpdatePriceComponent();
  const deleteComponent = useDeletePriceComponent();
  const plans = usePaymentPlans(projectId);
  const createPlan = useCreatePaymentPlan();
  const updatePlan = useUpdatePaymentPlan();
  const deletePlan = useDeletePaymentPlan();
  const partners = useBankPartners(projectId);
  const createPartner = useCreateBankPartner();
  const updatePartner = useUpdateBankPartner();
  const deletePartner = useDeleteBankPartner();

  const componentFields: FieldDef[] = [
    {
      name: "label",
      label: "Label",
      required: true,
      placeholder: "e.g. Car parking",
    },
    { name: "amount", label: "Amount (₹)", type: "number", required: true },
    { name: "isIncludedInBasePrice", label: "Included in base price", type: "switch" },
    { name: "displayOrder", label: "Display Order", type: "number" },
  ];

  const planFields: FieldDef[] = [
    { name: "name", label: "Plan Name", required: true, placeholder: "e.g. Construction linked" },
    {
      name: "type",
      label: "Plan Type",
      type: "select",
      options: PAYMENT_PLAN_TYPE_OPTIONS,
      required: true,
    },
    { name: "bookingAmount", label: "Booking Amount (₹)", type: "number", required: true },
    {
      name: "milestones",
      label: "Milestones",
      type: "multiline",
      required: true,
      fullRow: true,
      helperText:
        'JSON array, e.g. [{"stage":"Booking","amountPercent":10},{"stage":"On possession","amountPercent":90}]',
      placeholder: '[{"stage":"Booking","amountPercent":10}]',
    },
  ];

  const partnerFields: FieldDef[] = [
    { name: "bankName", label: "Bank Name", required: true, placeholder: "e.g. HDFC Bank" },
    { name: "logoUrl", label: "Logo URL", placeholder: "https://..." },
  ];

  return (
    <Stack spacing={3}>
      <CrudRepeater<CrudRow>
        title="Price Components"
        items={(components.data ?? []) as unknown as CrudRow[]}
        loading={components.isLoading}
        fields={componentFields}
        saving={createComponent.isPending || updateComponent.isPending}
        emptyText="No price components. Add items like parking or club house to show the full price breakdown."
        rowTitle={(item) => String(item.label ?? "")}
        rowSubtitle={(item) =>
          `${formatPrice(Number(item.amount ?? 0))}${
            item.isIncludedInBasePrice ? " · included in base price" : ""
          }`
        }
        onSave={(values, id) => {
          if (id) {
            updateComponent.mutate({
              id,
              data: values as unknown as UpdatePriceComponentPayload,
            });
          } else {
            createComponent.mutate({
              projectId,
              data: values as unknown as PriceComponentPayload,
            });
          }
        }}
        onDelete={(id) => deleteComponent.mutate(id)}
      />
      <CrudRepeater<CrudRow>
        title="Payment Plans"
        items={(plans.data ?? []) as unknown as CrudRow[]}
        loading={plans.isLoading}
        fields={planFields}
        saving={createPlan.isPending || updatePlan.isPending}
        emptyText="No payment plans yet. Add construction-linked or subvention plans."
        rowTitle={(item) => String(item.name ?? "")}
        rowSubtitle={(item) => {
          const milestones = item.milestones;
          const count = Array.isArray(milestones) ? milestones.length : 0;
          return `${String(item.type ?? "").replace(/_/g, " ")} · ${count} milestones`;
        }}
        rowBadge={(item) => formatPrice(Number(item.bookingAmount ?? 0))}
        onSave={(values, id) => {
          let milestones: Record<string, unknown>[] = [];
          try {
            const parsed = JSON.parse(String(values.milestones ?? "[]"));
            if (Array.isArray(parsed)) milestones = parsed;
          } catch {
            return;
          }
          const payload = {
            ...values,
            milestones,
          };
          if (id) {
            updatePlan.mutate({
              id,
              data: payload as unknown as UpdatePaymentPlanPayload,
            });
          } else {
            createPlan.mutate({
              projectId,
              data: payload as unknown as PaymentPlanPayload,
            });
          }
        }}
        onDelete={(id) => deletePlan.mutate(id)}
      />
      <CrudRepeater<CrudRow>
        title="Bank Partners"
        items={(partners.data ?? []) as unknown as CrudRow[]}
        loading={partners.isLoading}
        fields={partnerFields}
        saving={createPartner.isPending || updatePartner.isPending}
        emptyText="No bank partners. Add banks offering home loans for this project."
        rowTitle={(item) => String(item.bankName ?? "")}
        onSave={(values, id) => {
          if (id) {
            updatePartner.mutate({
              id,
              data: values as unknown as UpdateBankPartnerPayload,
            });
          } else {
            createPartner.mutate({
              projectId,
              data: values as unknown as BankPartnerPayload,
            });
          }
        }}
        onDelete={(id) => deletePartner.mutate(id)}
      />
    </Stack>
  );
}

/* ─── FAQs ───────────────────────────────────────────── */

export function FaqsTab({ projectId }: { projectId: string }) {
  const faqs = useFaqs(projectId);
  const createFaq = useCreateFaq();
  const updateFaq = useUpdateFaq();
  const deleteFaq = useDeleteFaq();

  const fields: FieldDef[] = [
    { name: "question", label: "Question", required: true, fullRow: true },
    { name: "answer", label: "Answer", type: "multiline", required: true, fullRow: true },
    { name: "displayOrder", label: "Display Order", type: "number" },
  ];

  return (
    <CrudRepeater<CrudRow>
      title="FAQs"
      items={(faqs.data ?? []) as unknown as CrudRow[]}
      loading={faqs.isLoading}
      fields={fields}
      saving={createFaq.isPending || updateFaq.isPending}
      emptyText="No FAQs yet. Answer common buyer questions to build trust."
      rowTitle={(item) => String(item.question ?? "")}
      rowSubtitle={(item) => String(item.answer ?? "")}
      onSave={(values, id) => {
        if (id) {
          updateFaq.mutate({ id, data: values as unknown as UpdateFaqPayload });
        } else {
          createFaq.mutate({ projectId, data: values as unknown as FaqPayload });
        }
      }}
      onDelete={(id) => deleteFaq.mutate(id)}
    />
  );
}

/* ─── Nearby (neighbourhood + landmarks) ─────────────── */

export function NearbyTab({ project }: { project: ProjectDetail }) {
  const updateProject = useUpdateProject();
  const landmarks = useLandmarks(project.id);
  const createLandmark = useCreateLandmark();
  const updateLandmark = useUpdateLandmark();
  const deleteLandmark = useDeleteLandmark();

  const landmarkFields: FieldDef[] = [
    {
      name: "category",
      label: "Category",
      type: "select",
      options: LANDMARK_CATEGORY_OPTIONS,
      required: true,
    },
    { name: "name", label: "Name", required: true, placeholder: "e.g. City Mall" },
    { name: "distanceKm", label: "Distance (km)", type: "number", required: true },
    { name: "travelTimeMinutes", label: "Travel Time (min)", type: "number" },
  ];

  return (
    <Stack spacing={3}>
      <ProjectFieldsCard
        title="Neighbourhood Overview"
        fields={[
          {
            name: "neighborhoodOverview",
            label: "Neighbourhood Overview",
            type: "multiline",
            fullRow: true,
            helperText: "Short description of the area shown under the location section.",
          },
        ]}
        initial={{ neighborhoodOverview: project.neighborhoodOverview ?? "" }}
        saving={updateProject.isPending}
        onSave={(payload) =>
          updateProject.mutate({ id: project.id, data: payload })
        }
      />
      <CrudRepeater<CrudRow>
        title="Nearby Landmarks"
        items={(landmarks.data ?? []) as unknown as CrudRow[]}
        loading={landmarks.isLoading}
        fields={landmarkFields}
        saving={createLandmark.isPending || updateLandmark.isPending}
        emptyText="No landmarks yet. Add schools, hospitals, transit and malls near the project."
        rowTitle={(item) => String(item.name ?? "")}
        rowSubtitle={(item) => {
          const dist = Number(item.distanceKm ?? 0);
          const time = item.travelTimeMinutes
            ? ` · ${item.travelTimeMinutes} min`
            : "";
          return `${dist.toFixed(1)} km${time}`;
        }}
        rowBadge={(item) => String(item.category ?? "")}
        onSave={(values, id) => {
          if (id) {
            updateLandmark.mutate({
              id,
              data: values as unknown as UpdateLandmarkPayload,
            });
          } else {
            createLandmark.mutate({
              projectId: project.id,
              data: values as unknown as LandmarkPayload,
            });
          }
        }}
        onDelete={(id) => deleteLandmark.mutate(id)}
      />
    </Stack>
  );
}
