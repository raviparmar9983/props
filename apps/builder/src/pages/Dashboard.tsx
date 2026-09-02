import { useNavigate } from "react-router-dom";
import { Box, Card, CardContent, Typography, Button } from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AddIcon from "@mui/icons-material/Add";
import { useProjects } from "../lib/hooks";
import { SkeletonStatCards } from "../components/Skeletons";

const statCards = [
  { label: "Total Projects", key: "total" as const, icon: <FolderIcon />, color: "#1B2A4A", bg: "#EBF0F7" },
  { label: "Published", key: "published" as const, icon: <CheckCircleIcon />, color: "#1F8A5F", bg: "#E6F4ED" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: projectsRes, isLoading: loadingProjects } = useProjects({ limit: 100 });

  const projects = projectsRes?.data ?? [];

  const stats = {
    total: projects.length,
    published: projects.filter((p) => p.status === "UPCOMING" || p.status === "UNDER_CONSTRUCTION" || p.status === "READY").length,
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700} sx={{ color: "#1F2430" }}>
            Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            Overview of your projects
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/projects/new")}
          sx={{ borderRadius: 1.5, textTransform: "none", fontWeight: 600 }}
        >
          New Project
        </Button>
      </Box>

      {loadingProjects ? (
        <SkeletonStatCards />
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(2, 1fr)" },
            gap: 2,
            mb: 4,
          }}
        >
          {statCards.map((card) => (
            <Card
              key={card.key}
              elevation={0}
              sx={{
                border: "1px solid #E2E5EA",
                borderRadius: 2,
                transition: "box-shadow 0.15s",
                "&:hover": { boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
              }}
            >
              <CardContent sx={{ py: 2.5, px: 2.5, "&:last-child": { pb: 2.5 } }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 1.5,
                      backgroundColor: card.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: card.color,
                    }}
                  >
                    {card.icon}
                  </Box>
                  <Box>
                    <Typography variant="h5" fontWeight={700} sx={{ lineHeight: 1.2, color: "#1F2430" }}>
                      {stats[card.key]}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                      {card.label}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}
