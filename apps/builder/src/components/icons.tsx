/**
 * Local, dependency-free icon set.
 *
 * The codebase previously imported icons from "@mui/icons-material/*", but
 * that package is not (and was not) listed as a dependency of this app — only
 * @mui/material is. That made every production build fail at bundle time
 * (Rollup could not resolve e.g. "@mui/icons-material/Error"), even though
 * `tsc` didn't catch it because of the ambient wildcard module declaration in
 * the now-removed mui-icons.d.ts.
 *
 * Rather than add @mui/icons-material as a new dependency (see the report for
 * why), this file provides a small hand-drawn, outline-style icon set built
 * on top of MUI's own SvgIcon (which ships with @mui/material). Every icon is
 * 24x24, stroke-based, and inherits color/size the same way MUI icons do, so
 * call sites work exactly like before (fontSize props, sx overrides, etc).
 */
import { SvgIcon, type SvgIconProps } from "@mui/material";
import type { ReactNode } from "react";

function makeIcon(children: ReactNode) {
  function Icon(props: SvgIconProps) {
    return (
      <SvgIcon {...props} viewBox="0 0 24 24">
        <g
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {children}
        </g>
      </SvgIcon>
    );
  }
  return Icon;
}

export const FolderIcon = makeIcon(
  <path d="M3 6.5A1.5 1.5 0 0 1 4.5 5h4l1.7 2H19.5A1.5 1.5 0 0 1 21 8.5v9A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5z" />,
);

export const FolderOffIcon = makeIcon(
  <>
    <path d="M3 6.5A1.5 1.5 0 0 1 4.5 5h4l1.7 2H19.5A1.5 1.5 0 0 1 21 8.5v9A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5z" />
    <line x1="4" y1="4" x2="20" y2="20" />
  </>,
);

export const CheckCircleIcon = makeIcon(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M8 12.3l2.6 2.6L16 9.3" />
  </>,
);

export const AddIcon = makeIcon(
  <>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </>,
);

export const MenuIcon = makeIcon(
  <>
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="18" x2="20" y2="18" />
  </>,
);

export const DashboardIcon = makeIcon(
  <>
    <rect x="4" y="4" width="7" height="7" rx="1.5" />
    <rect x="13" y="4" width="7" height="7" rx="1.5" />
    <rect x="4" y="13" width="7" height="7" rx="1.5" />
    <rect x="13" y="13" width="7" height="7" rx="1.5" />
  </>,
);

export const SettingsIcon = makeIcon(
  <>
    <line x1="6" y1="4" x2="6" y2="20" />
    <circle cx="6" cy="9" r="2" fill="#fff" />
    <line x1="12" y1="4" x2="12" y2="20" />
    <circle cx="12" cy="15" r="2" fill="#fff" />
    <line x1="18" y1="4" x2="18" y2="20" />
    <circle cx="18" cy="7" r="2" fill="#fff" />
  </>,
);

export const ChevronLeftIcon = makeIcon(<polyline points="15 6 9 12 15 18" />);
export const ChevronRightIcon = makeIcon(<polyline points="9 6 15 12 9 18" />);

export const ErrorIcon = makeIcon(
  <>
    <circle cx="12" cy="12" r="9" />
    <line x1="12" y1="7.5" x2="12" y2="13" />
    <circle cx="12" cy="16.5" r="0.9" fill="currentColor" stroke="none" />
  </>,
);

export const BuildCircleIcon = makeIcon(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8.2l2.6 6.2h-5.2z" />
    <line x1="9.6" y1="16.2" x2="14.4" y2="16.2" />
  </>,
);

export const EditIcon = makeIcon(
  <>
    <path d="M4.5 19.5l0.9-3.9 10.6-10.6a1.8 1.8 0 0 1 2.5 0l0.4 0.4a1.8 1.8 0 0 1 0 2.5L8.3 18.5z" />
    <line x1="14.5" y1="6.3" x2="17.7" y2="9.5" />
  </>,
);

export const PublicIcon = makeIcon(
  <>
    <circle cx="12" cy="12" r="9" />
    <ellipse cx="12" cy="12" rx="4" ry="9" />
    <line x1="3" y1="12" x2="21" y2="12" />
  </>,
);

export const AccessTimeIcon = makeIcon(
  <>
    <circle cx="12" cy="12" r="9" />
    <line x1="12" y1="12" x2="12" y2="7.2" />
    <line x1="12" y1="12" x2="15.5" y2="13.6" />
  </>,
);

export const InfoIcon = makeIcon(
  <>
    <circle cx="12" cy="12" r="9" />
    <line x1="12" y1="11" x2="12" y2="16.5" />
    <circle cx="12" cy="7.5" r="0.9" fill="currentColor" stroke="none" />
  </>,
);

export const FiberNewIcon = makeIcon(
  <path
    d="M12 4l1.5 5.5L19 11l-5.5 1.5L12 18l-1.5-5.5L5 11l5.5-1.5z"
    fill="currentColor"
    stroke="none"
  />,
);

export const TrendingUpIcon = makeIcon(
  <>
    <polyline points="4 16.5 9.5 11 13 14.5 20 7" />
    <polyline points="14.5 7 20 7 20 12.5" />
  </>,
);

export const CancelIcon = makeIcon(
  <>
    <circle cx="12" cy="12" r="9" />
    <line x1="9" y1="9" x2="15" y2="15" />
    <line x1="15" y1="9" x2="9" y2="15" />
  </>,
);

export const HomeWorkIcon = makeIcon(
  <>
    <path d="M4 11l8-6 8 6" />
    <path d="M6 10v9h12v-9" />
    <line x1="10" y1="19" x2="10" y2="14" />
    <line x1="14" y1="19" x2="14" y2="14" />
  </>,
);

export const UploadFileIcon = makeIcon(
  <>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <polyline points="14 3 14 8 19 8" />
    <line x1="12" y1="17" x2="12" y2="11" />
    <polyline points="9.2 13.8 12 11 14.8 13.8" />
  </>,
);

export const DeleteIcon = makeIcon(
  <>
    <line x1="4" y1="7" x2="20" y2="7" />
    <path d="M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
    <path d="M9 7V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V7" />
  </>,
);

const STAR_PATH =
  "M12 3.3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17.2l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z";

export const StarIcon = makeIcon(
  <path d={STAR_PATH} fill="currentColor" stroke="none" />,
);
export const StarBorderIcon = makeIcon(<path d={STAR_PATH} />);

export const ArrowUpwardIcon = makeIcon(
  <>
    <line x1="12" y1="19" x2="12" y2="5" />
    <polyline points="6.5 10.5 12 5 17.5 10.5" />
  </>,
);

export const ArrowDownwardIcon = makeIcon(
  <>
    <line x1="12" y1="5" x2="12" y2="19" />
    <polyline points="6.5 13.5 12 19 17.5 13.5" />
  </>,
);

export const PublishIcon = makeIcon(
  <>
    <line x1="12" y1="15" x2="12" y2="3.5" />
    <polyline points="7.5 8 12 3.5 16.5 8" />
    <path d="M5 15.5v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" />
  </>,
);

export const StopCircleIcon = makeIcon(
  <>
    <circle cx="12" cy="12" r="9" />
    <rect x="9" y="9" width="6" height="6" rx="1" />
  </>,
);

export const MoreVertIcon = makeIcon(
  <>
    <circle cx="12" cy="6" r="1.3" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" />
    <circle cx="12" cy="18" r="1.3" fill="currentColor" stroke="none" />
  </>,
);

export const VisibilityIcon = makeIcon(
  <>
    <path d="M2.5 12S6.5 5.5 12 5.5 21.5 12 21.5 12 17.5 18.5 12 18.5 2.5 12 2.5 12z" />
    <circle cx="12" cy="12" r="3" />
  </>,
);

export const VerifiedIcon = makeIcon(
  <>
    <path d="M12 3.2l6.5 2.7v5.6c0 4.4-2.8 7.7-6.5 8.8-3.7-1.1-6.5-4.4-6.5-8.8V5.9z" />
    <path d="M9 12.3l2 2 4-4.5" />
  </>,
);

export const PeopleIcon = makeIcon(
  <>
    <circle cx="9" cy="8" r="3" />
    <path d="M3.2 20a5.8 5.8 0 0 1 11.6 0" />
    <circle cx="17" cy="9.3" r="2.3" />
    <path d="M15.3 14.2a5 5 0 0 1 5.5 5" />
  </>,
);

export const NotificationsIcon = makeIcon(
  <>
    <path d="M6 16v-5a6 6 0 0 1 12 0v5l1.6 2.2H4.4z" />
    <path d="M10.2 20.5a2 2 0 0 0 3.6 0" />
  </>,
);
