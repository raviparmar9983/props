import { useNavigate } from "react-router-dom";
import { Box, Card, CardContent, Typography } from "@mui/material";
import { CreateProjectForm } from "../features/projects/create-project-form";

export default function CreateProject() {
  const navigate = useNavigate();

  return (
    <Box sx={{ maxWidth: 600, mx: "auto" }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Create Project
      </Typography>
      <Card>
        <CardContent>
          <CreateProjectForm />
        </CardContent>
      </Card>
    </Box>
  );
}
