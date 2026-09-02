import { Chip, type ChipProps } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import InfoIcon from "@mui/icons-material/Info";
import FiberNewIcon from "@mui/icons-material/FiberNew";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CancelIcon from "@mui/icons-material/Cancel";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import BuildCircleIcon from "@mui/icons-material/BuildCircle";
import EditIcon from "@mui/icons-material/Edit";
import PublicIcon from "@mui/icons-material/Public";
import type {
  BuilderVerificationStatus,
  ProjectStatus,
  LeadStatus,
} from "../lib/api/schemas";

type StatusType =
  | BuilderVerificationStatus
  | ProjectStatus
  | LeadStatus
  | "PUBLISHED";

interface StatusStyle {
  backgroundColor: string;
  color: string;
  icon?: React.ReactElement;
  label: string;
}

const STATUS_CONFIG: Record<string, StatusStyle> = {
  PENDING: {
    backgroundColor: "#FBF0DC",
    color: "#B5750B",
    icon: <AccessTimeIcon sx={{ fontSize: 14 }} />,
    label: "Pending",
  },
  VERIFIED: {
    backgroundColor: "#E1F3EA",
    color: "#1F8A5F",
    icon: <CheckCircleIcon sx={{ fontSize: 14 }} />,
    label: "Verified",
  },
  REJECTED: {
    backgroundColor: "#FBE7DD",
    color: "#C2410C",
    icon: <ErrorIcon sx={{ fontSize: 14 }} />,
    label: "Rejected",
  },
  DRAFT: {
    backgroundColor: "#F1F2F5",
    color: "#5B6270",
    icon: <EditIcon sx={{ fontSize: 14 }} />,
    label: "Draft",
  },
  UPCOMING: {
    backgroundColor: "#E1F3EA",
    color: "#1F8A5F",
    icon: <AccessTimeIcon sx={{ fontSize: 14 }} />,
    label: "Upcoming",
  },
  UNDER_CONSTRUCTION: {
    backgroundColor: "#E1F3EA",
    color: "#1F8A5F",
    icon: <BuildCircleIcon sx={{ fontSize: 14 }} />,
    label: "Under Construction",
  },
  READY: {
    backgroundColor: "#E1F3EA",
    color: "#1F8A5F",
    icon: <HomeWorkIcon sx={{ fontSize: 14 }} />,
    label: "Ready",
  },
  ARCHIVED: {
    backgroundColor: "#F1F2F5",
    color: "#5B6270",
    icon: <CancelIcon sx={{ fontSize: 14 }} />,
    label: "Archived",
  },
  PUBLISHED: {
    backgroundColor: "#E1F3EA",
    color: "#1F8A5F",
    icon: <PublicIcon sx={{ fontSize: 14 }} />,
    label: "Published",
  },
  NEW: {
    backgroundColor: "#E4EDF5",
    color: "#2F5D8A",
    icon: <FiberNewIcon sx={{ fontSize: 14 }} />,
    label: "New",
  },
  CONTACTED: {
    backgroundColor: "#FBF0DC",
    color: "#B5750B",
    icon: <InfoIcon sx={{ fontSize: 14 }} />,
    label: "Contacted",
  },
  IN_PROGRESS: {
    backgroundColor: "#E4EDF5",
    color: "#2F5D8A",
    icon: <TrendingUpIcon sx={{ fontSize: 14 }} />,
    label: "In Progress",
  },
  CONVERTED: {
    backgroundColor: "#E1F3EA",
    color: "#1F8A5F",
    icon: <CheckCircleIcon sx={{ fontSize: 14 }} />,
    label: "Converted",
  },
  CLOSED: {
    backgroundColor: "#F1F2F5",
    color: "#5B6270",
    icon: <CancelIcon sx={{ fontSize: 14 }} />,
    label: "Closed",
  },
  ACTIVE: {
    backgroundColor: "#E1F3EA",
    color: "#1F8A5F",
    icon: <CheckCircleIcon sx={{ fontSize: 14 }} />,
    label: "Active",
  },
  PENDING_REVIEW: {
    backgroundColor: "#FBF0DC",
    color: "#B5750B",
    icon: <AccessTimeIcon sx={{ fontSize: 14 }} />,
    label: "Under Review",
  },
  SUSPENDED: {
    backgroundColor: "#FBE7DD",
    color: "#C2410C",
    icon: <CancelIcon sx={{ fontSize: 14 }} />,
    label: "Suspended",
  },
};

interface StatusBadgeProps {
  status: string;
  size?: "small" | "medium";
}

export function StatusBadge({ status, size = "small" }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? {
    backgroundColor: "#F1F2F5",
    color: "#5B6270",
    label: status,
  };

  const chipProps: ChipProps = {
    label: config.label,
    size,
    sx: {
      backgroundColor: config.backgroundColor,
      color: config.color,
      fontWeight: 500,
      border: "none",
      "& .MuiChip-icon": {
        color: "inherit",
      },
    },
  };

  if (config.icon) {
    chipProps.icon = config.icon;
  }

  return <Chip {...chipProps} />;
}
