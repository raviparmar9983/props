import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Divider,
  LinearProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Switch,
  FormControlLabel,
  Rating,
} from "@mui/material";
import {
  UploadFileIcon,
  DeleteIcon,
  EditIcon,
  AddIcon,
} from "../components/icons";
import {
  useProfile,
  useUpdateProfile,
  useUploadLogo,
  usePortfolio,
  useCreatePortfolio,
  useUpdatePortfolio,
  useDeletePortfolio,
  useReviews,
} from "../lib/hooks";
import { formatDate } from "../utils/format";

interface PortfolioForm {
  id: string | null;
  title: string;
  city: string;
  completionYear: string;
  unitsCount: string;
  deliveredOnTime: boolean;
  coverImageUrl: string;
  description: string;
}

export default function Settings() {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const uploadLogo = useUploadLogo();
  const { data: portfolio = [], isLoading: portfolioLoading } = usePortfolio();
  const createPortfolio = useCreatePortfolio();
  const updatePortfolio = useUpdatePortfolio();
  const deletePortfolio = useDeletePortfolio();
  const { data: reviews = [], isLoading: reviewsLoading } = useReviews();

  const [form, setForm] = useState({
    companyName: "",
    reraNumber: "",
    gstNumber: "",
    logo: "",
    yearsInBusiness: "",
    totalProjectsCompleted: "",
    onTimeDeliveryRate: "",
  });
  const [success, setSuccess] = useState(false);
  const [logoProgress, setLogoProgress] = useState<number | null>(null);
  const [portfolioDialog, setPortfolioDialog] = useState(false);
  const [portfolioForm, setPortfolioForm] = useState<PortfolioForm>({
    id: null,
    title: "",
    city: "",
    completionYear: "",
    unitsCount: "",
    deliveredOnTime: true,
    coverImageUrl: "",
    description: "",
  });

  useEffect(() => {
    if (profile) {
      setForm({
        companyName: profile.companyName,
        reraNumber: profile.reraNumber ?? "",
        gstNumber: profile.gstNumber ?? "",
        logo: profile.logo ?? "",
        yearsInBusiness:
          profile.yearsInBusiness != null ? String(profile.yearsInBusiness) : "",
        totalProjectsCompleted:
          profile.totalProjectsCompleted != null
            ? String(profile.totalProjectsCompleted)
            : "",
        onTimeDeliveryRate:
          profile.onTimeDeliveryRate != null
            ? String(profile.onTimeDeliveryRate)
            : "",
      });
    }
  }, [profile]);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!profile) {
    return <Typography>Profile not found.</Typography>;
  }

  const handleSave = () => {
    setSuccess(false);
    const payload: Record<string, unknown> = {
      companyName: form.companyName,
      reraNumber: form.reraNumber,
      gstNumber: form.gstNumber,
      logo: form.logo,
    };
    if (form.yearsInBusiness) payload.yearsInBusiness = Number(form.yearsInBusiness);
    if (form.totalProjectsCompleted)
      payload.totalProjectsCompleted = Number(form.totalProjectsCompleted);
    if (form.onTimeDeliveryRate)
      payload.onTimeDeliveryRate = Number(form.onTimeDeliveryRate);
    updateProfile.mutate(payload, {
      onSuccess: () => {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      },
    });
  };

  const openPortfolio = (item?: {
    id: string;
    title: string;
    city: string;
    completionYear?: number | null;
    unitsCount?: number | null;
    deliveredOnTime: boolean;
    coverImageUrl?: string | null;
    description?: string | null;
  }) => {
    if (item) {
      setPortfolioForm({
        id: item.id,
        title: item.title,
        city: item.city,
        completionYear:
          item.completionYear != null ? String(item.completionYear) : "",
        unitsCount: item.unitsCount != null ? String(item.unitsCount) : "",
        deliveredOnTime: item.deliveredOnTime,
        coverImageUrl: item.coverImageUrl ?? "",
        description: item.description ?? "",
      });
    } else {
      setPortfolioForm({
        id: null,
        title: "",
        city: "",
        completionYear: "",
        unitsCount: "",
        deliveredOnTime: true,
        coverImageUrl: "",
        description: "",
      });
    }
    setPortfolioDialog(true);
  };

  const savePortfolio = () => {
    if (!portfolioForm.title || !portfolioForm.city) return;
    const payload: Record<string, unknown> = {
      title: portfolioForm.title,
      city: portfolioForm.city,
      deliveredOnTime: portfolioForm.deliveredOnTime,
    };
    if (portfolioForm.completionYear)
      payload.completionYear = Number(portfolioForm.completionYear);
    if (portfolioForm.unitsCount)
      payload.unitsCount = Number(portfolioForm.unitsCount);
    if (portfolioForm.coverImageUrl) payload.coverImageUrl = portfolioForm.coverImageUrl;
    if (portfolioForm.description) payload.description = portfolioForm.description;
    if (portfolioForm.id) {
      updatePortfolio.mutate(
        { id: portfolioForm.id, data: payload },
        { onSuccess: () => setPortfolioDialog(false) },
      );
    } else {
      createPortfolio.mutate(
        payload as unknown as Parameters<typeof createPortfolio.mutate>[0],
        { onSuccess: () => setPortfolioDialog(false) },
      );
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadLogo.mutate(
      { file, onUploadProgress: setLogoProgress },
      {
        onSuccess: (updated) => {
          setLogoProgress(null);
          setForm((f) => ({ ...f, logo: updated.logo ?? "" }));
          setSuccess(true);
          setTimeout(() => setSuccess(false), 3000);
        },
        onError: () => setLogoProgress(null),
      }
    );
  };

  return (
    <Box sx={{ maxWidth: 720 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manage your company profile and public track record.
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Company Profile
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Company Name"
              value={form.companyName}
              onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              fullWidth
            />
            <TextField
              label="RERA Number"
              value={form.reraNumber}
              onChange={(e) => setForm({ ...form, reraNumber: e.target.value })}
              fullWidth
            />
            <TextField
              label="GST Number"
              value={form.gstNumber}
              onChange={(e) => setForm({ ...form, gstNumber: e.target.value })}
              fullWidth
            />
            <Divider sx={{ my: 0.5 }} />
            <Typography variant="subtitle2" color="text.secondary">
              Track Record
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 2,
              }}
            >
              <TextField
                label="Years in Business"
                type="number"
                value={form.yearsInBusiness}
                onChange={(e) =>
                  setForm({ ...form, yearsInBusiness: e.target.value })
                }
                fullWidth
              />
              <TextField
                label="Total Projects Completed"
                type="number"
                value={form.totalProjectsCompleted}
                onChange={(e) =>
                  setForm({ ...form, totalProjectsCompleted: e.target.value })
                }
                fullWidth
              />
              <TextField
                label="On-Time Delivery Rate (%)"
                type="number"
                inputProps={{ min: 0, max: 100 }}
                value={form.onTimeDeliveryRate}
                onChange={(e) =>
                  setForm({ ...form, onTimeDeliveryRate: e.target.value })
                }
                fullWidth
              />
            </Box>

            {success && <Alert severity="success">Profile saved successfully.</Alert>}

            <Box>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={updateProfile.isPending}
              >
                {updateProfile.isPending ? <CircularProgress size={20} /> : "Save Profile"}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Company Logo
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Your logo is shown next to your projects on the customer site.
            Add it by URL or upload an image.
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            {form.logo ? (
              <Box
                component="img"
                src={form.logo}
                alt="Company logo"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
                sx={{
                  width: 64,
                  height: 64,
                  objectFit: "contain",
                  borderRadius: 2,
                  border: "1px solid #E2E5EA",
                  bgcolor: "#fff",
                  p: 0.5,
                }}
              />
            ) : (
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: 2,
                  border: "1px solid #E2E5EA",
                  bgcolor: "#EBF0F7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#1B2A4A",
                  fontSize: "1.5rem",
                  fontWeight: 700,
                }}
              >
                {form.companyName.charAt(0) || "B"}
              </Box>
            )}
            {!form.logo && (
              <Typography variant="caption" color="text.secondary">
                No logo set yet.
              </Typography>
            )}
          </Box>

          {logoProgress !== null && (
            <Box sx={{ mb: 2 }}>
              <LinearProgress variant="determinate" value={logoProgress} />
              <Typography variant="caption" color="text.secondary">
                Uploading... {logoProgress}%
              </Typography>
            </Box>
          )}

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Logo URL"
              placeholder="https://example.com/logo.png"
              value={form.logo}
              onChange={(e) => setForm({ ...form, logo: e.target.value })}
              fullWidth
            />
            <Box>
              <Button
                component="label"
                variant="outlined"
                startIcon={<UploadFileIcon />}
                disabled={uploadLogo.isPending}
              >
                Upload Logo
                <input
                  type="file"
                  hidden
                  accept=".png,.jpg,.jpeg,.svg,.webp"
                  onChange={handleLogoUpload}
                />
              </Button>
            </Box>
          </Box>

          {uploadLogo.isError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              Failed to upload logo. Please try again.
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            <Typography variant="h6">Portfolio Projects</Typography>
            <Button
              startIcon={<AddIcon />}
              variant="contained"
              size="small"
              onClick={() => openPortfolio()}
              sx={{ textTransform: "none" }}
            >
              Add Project
            </Button>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Showcase delivered projects. This is displayed on your public
            builder page.
          </Typography>
          {portfolioLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
              <CircularProgress size={24} />
            </Box>
          ) : portfolio.length === 0 ? (
            <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
              No portfolio projects yet.
            </Typography>
          ) : (
            <Box sx={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: 8 }}>Title</th>
                    <th style={{ textAlign: "left", padding: 8 }}>City</th>
                    <th style={{ textAlign: "left", padding: 8 }}>Year</th>
                    <th style={{ textAlign: "left", padding: 8 }}>Units</th>
                    <th style={{ textAlign: "left", padding: 8 }}>On Time</th>
                    <th style={{ textAlign: "right", padding: 8 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolio.map((p) => (
                    <tr key={p.id}>
                      <td style={{ padding: 8 }}>{p.title}</td>
                      <td style={{ padding: 8 }}>{p.city}</td>
                      <td style={{ padding: 8 }}>{p.completionYear ?? "\u2014"}</td>
                      <td style={{ padding: 8 }}>{p.unitsCount ?? "\u2014"}</td>
                      <td style={{ padding: 8 }}>
                        {p.deliveredOnTime ? (
                          <Chip label="Yes" size="small" color="success" variant="outlined" />
                        ) : (
                          <Chip label="No" size="small" variant="outlined" />
                        )}
                      </td>
                      <td style={{ padding: 8, textAlign: "right" }}>
                        <IconButton size="small" onClick={() => openPortfolio(p)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => {
                            if (confirm("Delete this portfolio project?"))
                              deletePortfolio.mutate(p.id);
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Customer Reviews
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Reviews left by customers who purchased your projects. You cannot
            reply or remove these.
          </Typography>
          {reviewsLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
              <CircularProgress size={24} />
            </Box>
          ) : reviews.length === 0 ? (
            <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
              No reviews yet.
            </Typography>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {reviews.map((r) => (
                <Box
                  key={r.id}
                  sx={{
                    border: "1px solid #E2E5EA",
                    borderRadius: 2,
                    p: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 0.5,
                    }}
                  >
                    <Typography variant="subtitle2">{r.reviewerName}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(r.createdAt)}
                    </Typography>
                  </Box>
                  <Rating value={r.rating} readOnly size="small" />
                  {r.comment && (
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {r.comment}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={portfolioDialog}
        onClose={() => setPortfolioDialog(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { mx: { xs: 1, sm: 3 } } }}
      >
        <DialogTitle>
          {portfolioForm.id ? "Edit Portfolio Project" : "Add Portfolio Project"}
        </DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "16px !important" }}
        >
          <TextField
            label="Title"
            value={portfolioForm.title}
            onChange={(e) =>
              setPortfolioForm({ ...portfolioForm, title: e.target.value })
            }
            fullWidth
            size="small"
            required
          />
          <TextField
            label="City"
            value={portfolioForm.city}
            onChange={(e) =>
              setPortfolioForm({ ...portfolioForm, city: e.target.value })
            }
            fullWidth
            size="small"
            required
          />
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 2,
            }}
          >
            <TextField
              label="Completion Year"
              type="number"
              value={portfolioForm.completionYear}
              onChange={(e) =>
                setPortfolioForm({ ...portfolioForm, completionYear: e.target.value })
              }
              fullWidth
              size="small"
            />
            <TextField
              label="Units Count"
              type="number"
              value={portfolioForm.unitsCount}
              onChange={(e) =>
                setPortfolioForm({ ...portfolioForm, unitsCount: e.target.value })
              }
              fullWidth
              size="small"
            />
          </Box>
          <TextField
            label="Cover Image URL"
            value={portfolioForm.coverImageUrl}
            onChange={(e) =>
              setPortfolioForm({ ...portfolioForm, coverImageUrl: e.target.value })
            }
            fullWidth
            size="small"
            placeholder="https://..."
          />
          <TextField
            label="Description"
            value={portfolioForm.description}
            onChange={(e) =>
              setPortfolioForm({ ...portfolioForm, description: e.target.value })
            }
            multiline
            minRows={3}
            fullWidth
            size="small"
          />
          <FormControlLabel
            control={
              <Switch
                checked={portfolioForm.deliveredOnTime}
                onChange={(e) =>
                  setPortfolioForm({
                    ...portfolioForm,
                    deliveredOnTime: e.target.checked,
                  })
                }
                size="small"
              />
            }
            label="Delivered on time"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setPortfolioDialog(false)} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            onClick={savePortfolio}
            variant="contained"
            disabled={
              !portfolioForm.title ||
              !portfolioForm.city ||
              createPortfolio.isPending ||
              updatePortfolio.isPending
            }
            sx={{ textTransform: "none" }}
          >
            {createPortfolio.isPending || updatePortfolio.isPending ? (
              <CircularProgress size={20} />
            ) : portfolioForm.id ? (
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
