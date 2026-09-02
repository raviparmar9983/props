import { Box, Skeleton, Card, CardContent } from "@mui/material";

export function SkeletonTable({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <Card>
      <CardContent sx={{ p: 0 }}>
        <Box sx={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {Array.from({ length: columns }).map((_, i) => (
                  <th
                    key={i}
                    style={{
                      textAlign: "left",
                      padding: "10px 16px",
                      borderBottom: "1px solid #E2E5EA",
                    }}
                  >
                    <Skeleton variant="text" width="80%" height={20} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: rows }).map((_, rowIdx) => (
                <tr key={rowIdx}>
                  {Array.from({ length: columns }).map((_, colIdx) => (
                    <td
                      key={colIdx}
                      style={{
                        padding: "12px 16px",
                        borderBottom: "1px solid #E2E5EA",
                      }}
                    >
                      <Skeleton
                        variant="text"
                        width={colIdx === 0 ? "60%" : "40%"}
                        height={20}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      </CardContent>
    </Card>
  );
}

export function SkeletonStatCards() {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
        gap: 2,
        mb: 4,
      }}
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Skeleton variant="rounded" width={48} height={48} sx={{ borderRadius: 2 }} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="30%" height={32} />
              <Skeleton variant="text" width="60%" height={20} />
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}

export function SkeletonCardGrid({ count = 6 }: { count?: number }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr" },
        gap: 3,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <Skeleton variant="rounded" height={180} sx={{ borderRadius: "10px 10px 0 0" }} />
          <CardContent>
            <Skeleton variant="text" width="70%" height={24} />
            <Skeleton variant="text" width="40%" height={16} sx={{ mt: 0.5 }} />
            <Skeleton variant="text" width="30%" height={20} sx={{ mt: 1 }} />
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}

export function SkeletonList({ rows = 5 }: { rows?: number }) {
  return (
    <Card>
      <CardContent sx={{ p: 0 }}>
        {Array.from({ length: rows }).map((_, i) => (
          <Box
            key={i}
            sx={{
              px: 3,
              py: 2,
              borderBottom: i < rows - 1 ? "1px solid #E2E5EA" : "none",
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Skeleton variant="circular" width={40} height={40} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="50%" height={20} />
              <Skeleton variant="text" width="80%" height={16} sx={{ mt: 0.5 }} />
            </Box>
            <Skeleton variant="text" width="20%" height={16} />
          </Box>
        ))}
      </CardContent>
    </Card>
  );
}
