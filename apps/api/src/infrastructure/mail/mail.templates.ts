// VerifiedProps Email Templates
// Table-based, inline-only styles, compatible with Gmail, Outlook, Apple Mail, Yahoo

const BRAND = {
  accent: "#E85D2C",
  accentDark: "#C94A1F",
  accentSoft: "#FDEBE3",
  dark: "#1B2A4A",
  body: "#1F2430",
  secondary: "#5B6270",
  muted: "#9199A8",
  border: "#E7E9ED",
  lightBg: "#F1F2F5",
  surface: "#FFFFFF",
  success: "#1DA55E",
  successSoft: "#E3F7EC",
  danger: "#E23744",
  dangerSoft: "#FCE8EA",
  gold: "#E8A845",
};

// ---------------------------------------------------------------------------
// Base wrapper — outer shell, header, footer
// ---------------------------------------------------------------------------
function baseLayout(title: string, contentHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>${esc(title)}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:AllowPNG/>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    /* Reset */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; height: 100% !important; }
    /* iOS blue links */
    a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important; }
    /* Gmail blue links */
    u + #body a { color: inherit; text-decoration: none; font-size: inherit; font-family: inherit; font-weight: inherit; line-height: inherit; }
    /* Responsive */
    @media only screen and (max-width: 620px) {
      .vp-container { width: 100% !important; padding: 0 16px !important; }
      .vp-card { border-radius: 12px !important; }
      .vp-otp-box { padding: 20px 16px !important; }
      .vp-otp-code { font-size: 32px !important; letter-spacing: 6px !important; }
      .vp-btn { width: 100% !important; }
    }
  </style>
</head>
<body id="body" style="margin:0;padding:0;background-color:#F1F2F5;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <!-- Preheader (hidden preview text) -->
  <div style="display:none;font-size:1px;color:#F1F2F5;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${esc(title)}
  </div>

  <!-- Outer wrapper -->
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#F1F2F5;">
    <tr>
      <td align="center" style="padding:32px 0 40px;">
        <!--[if mso]>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" align="center"><tr><td>
        <![endif]-->

        <table role="presentation" class="vp-container" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;margin:0 auto;">

          <!-- ===== HEADER ===== -->
          <tr>
            <td style="padding:0;">
              <!-- Brand band -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${BRAND.dark};border-radius:20px 20px 0 0;">
                <tr>
                  <td align="center" style="padding:30px 32px 6px;font-family:Poppins,'Inter',Arial,sans-serif;font-size:24px;font-weight:700;letter-spacing:-0.5px;color:${BRAND.surface};">
                    Verified<span style="color:${BRAND.gold};">Props</span>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:0 32px 22px;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:11px;font-weight:600;color:#B8BEC8;letter-spacing:1.5px;text-transform:uppercase;">
                    Verified builders &middot; Real listings
                  </td>
                </tr>
                <tr>
                  <td style="height:3px;line-height:3px;font-size:0;background-color:${BRAND.gold};">&nbsp;</td>
                </tr>
              </table>

              <!-- Body card (attached to header) -->
              <table role="presentation" class="vp-card" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${BRAND.surface};border-radius:0 0 20px 20px;">
                <tr>
                  <td style="padding:32px;">
                    ${contentHtml}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ===== FOOTER ===== -->
          <tr>
            <td style="padding:24px 16px 0;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding:0 0 12px;">
                    <span style="font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;color:${BRAND.muted};line-height:18px;">
                      VerifiedProps &mdash; Verified builders, real listings
                    </span>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:0 0 8px;">
                    <a href="https://verifiedprops.com" style="font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;color:${BRAND.accent};text-decoration:none;">verifiedprops.com</a>
                    &nbsp;&nbsp;&middot;&nbsp;&nbsp;
                    <a href="mailto:parmmarravi1162@gmail.com" style="font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;color:${BRAND.accent};text-decoration:none;">Support: parmmarravi1162@gmail.com</a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:0;">
                    <span style="font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:11px;color:${BRAND.muted};line-height:16px;">
                      If you didn&rsquo;t request this email, you can safely ignore it.
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>

        <!--[if mso]>
        </td></tr></table>
        <![endif]-->
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Helper: escape HTML entities
// ---------------------------------------------------------------------------
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ---------------------------------------------------------------------------
// Helper: pill badge
// ---------------------------------------------------------------------------
function badge(label: string, bg: string, fg: string): string {
  return `<span style="display:inline-block;background-color:${bg};color:${fg};font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;font-weight:600;padding:4px 14px;border-radius:999px;">${esc(label)}</span>`;
}

// ---------------------------------------------------------------------------
// Helper: bulletproof button (VML for Outlook)
// ---------------------------------------------------------------------------
function button(href: string, label: string, bg: string, fg: string = "#FFFFFF"): string {
  const radius = "10px";
  return `<!--[if mso]>
<v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${esc(href)}" style="height:48px;v-text-anchor:middle;width:260px;" arcsize="21%" strokecolor="${bg}" fillcolor="${bg}">
<w:anchorlock/>
<center style="color:${fg};font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;font-weight:700;">${esc(label)}</center>
</v:roundrect>
<![endif]-->
<!--[if !mso]><!-->
<a href="${esc(href)}" target="_blank" style="display:inline-block;background-color:${bg};color:${fg};font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;font-weight:700;text-decoration:none;text-align:center;padding:14px 40px;border-radius:${radius};mso-padding-alt:0;box-shadow:0 4px 14px ${bg}33;">${esc(label)}</a>
<!--<![endif]-->`;
}

// ---------------------------------------------------------------------------
// Helper: section divider line
// ---------------------------------------------------------------------------
function divider(): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:20px 0;">
  <tr><td style="border-top:1px solid ${BRAND.border};font-size:0;line-height:0;">&nbsp;</td></tr>
</table>`;
}

// ---------------------------------------------------------------------------
// Helper: info row (label + value)
// ---------------------------------------------------------------------------
function infoRow(label: string, value: string): string {
  return `<tr>
  <td style="padding:6px 0;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:13px;color:${BRAND.muted};width:140px;vertical-align:top;">${esc(label)}</td>
  <td style="padding:6px 0;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;color:${BRAND.body};font-weight:500;">${esc(value)}</td>
</tr>`;
}

// ===========================================================================
// 1. OTP LOGIN CODE
// ===========================================================================
export function otpLoginEmail(otp: string, expiryMinutes: number): { subject: string; html: string } {
  return {
    subject: "Your VerifiedProps login code",
    html: baseLayout(
      "Your login code",
      `
      <p style="margin:0 0 4px;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;color:${BRAND.secondary};">
        Hello,
      </p>
      <p style="margin:0 0 24px;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;color:${BRAND.body};line-height:24px;">
        Here&rsquo;s your one-time login code for <strong>VerifiedProps</strong>:
      </p>

      <!-- OTP BOX -->
      <table role="presentation" class="vp-otp-box" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${BRAND.accentSoft};border-radius:16px;border:1px solid ${BRAND.accent}22;margin:0 0 24px;">
        <tr>
          <td align="center" style="padding:28px 20px;">
            <span style="font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:11px;font-weight:600;color:${BRAND.accent};text-transform:uppercase;letter-spacing:1.5px;">
              Your code
            </span><br/>
            <span class="vp-otp-code" style="display:inline-block;font-family:'Courier New',Courier,monospace;font-size:42px;font-weight:700;color:${BRAND.dark};letter-spacing:10px;padding:12px 0;">
              ${esc(otp)}
            </span><br/>
            <span style="font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;color:${BRAND.muted};">
              Expires in ${expiryMinutes} minute${expiryMinutes !== 1 ? "s" : ""}
            </span>
          </td>
        </tr>
      </table>

      <p style="margin:0;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:13px;color:${BRAND.muted};line-height:20px;">
        If you didn&rsquo;t request this code, someone may have entered your email by mistake. You can safely ignore this message &mdash; no action will be taken on your account.
      </p>
      `,
    ),
  };
}

// ===========================================================================
// 2. PASSWORD RESET CODE
// ===========================================================================
export function passwordResetEmail(otp: string, expiryMinutes: number): { subject: string; html: string } {
  return {
    subject: "Your VerifiedProps password reset code",
    html: baseLayout(
      "Password reset code",
      `
      <p style="margin:0 0 4px;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;color:${BRAND.secondary};">
        Hello,
      </p>
      <p style="margin:0 0 24px;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;color:${BRAND.body};line-height:24px;">
        We received a request to reset your password on <strong>VerifiedProps</strong>. Use the code below:
      </p>

      <!-- OTP BOX -->
      <table role="presentation" class="vp-otp-box" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${BRAND.accentSoft};border-radius:16px;border:1px solid ${BRAND.accent}22;margin:0 0 24px;">
        <tr>
          <td align="center" style="padding:28px 20px;">
            <span style="font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:11px;font-weight:600;color:${BRAND.accent};text-transform:uppercase;letter-spacing:1.5px;">
              Reset code
            </span><br/>
            <span class="vp-otp-code" style="display:inline-block;font-family:'Courier New',Courier,monospace;font-size:42px;font-weight:700;color:${BRAND.dark};letter-spacing:10px;padding:12px 0;">
              ${esc(otp)}
            </span><br/>
            <span style="font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;color:${BRAND.muted};">
              Expires in ${expiryMinutes} minute${expiryMinutes !== 1 ? "s" : ""}
            </span>
          </td>
        </tr>
      </table>

      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${BRAND.dangerSoft};border-radius:12px;border:1px solid ${BRAND.danger}22;margin:0 0 20px;">
        <tr>
          <td style="padding:14px 16px;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:13px;color:${BRAND.danger};line-height:20px;">
            <strong>Didn&rsquo;t request this?</strong> Your account is safe. If you did not ask for a password reset, please ignore this email &mdash; your password will not be changed.
          </td>
        </tr>
      </table>
      `,
    ),
  };
}

// ===========================================================================
// 3. BUILDER VERIFIED
// ===========================================================================
export function builderVerifiedEmail(companyName: string): { subject: string; html: string } {
  return {
    subject: "Your Builder Account Has Been Verified",
    html: baseLayout(
      "Builder account verified",
      `
      <!-- Success icon -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 20px;">
        <tr>
          <td align="center" style="background-color:${BRAND.successSoft};border-radius:50%;width:56px;height:56px;">
            <span style="font-size:28px;line-height:56px;">&#10003;</span>
          </td>
        </tr>
      </table>

      <p style="margin:0 0 4px;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;color:${BRAND.secondary};text-align:center;">
        Congratulations!
      </p>
      <p style="margin:0 0 8px;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:18px;font-weight:700;color:${BRAND.dark};text-align:center;line-height:26px;">
        Your builder account has been verified
      </p>
      <p style="margin:0 0 24px;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;color:${BRAND.body};text-align:center;line-height:24px;">
        Your account <strong>${esc(companyName)}</strong> is now a <strong>Verified Builder</strong> on VerifiedProps.
      </p>

      ${divider()}

      <!-- What this means -->
      <p style="margin:0 0 12px;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:13px;font-weight:600;color:${BRAND.dark};text-transform:uppercase;letter-spacing:0.5px;">
        What this means
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td style="padding:6px 0;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;color:${BRAND.body};line-height:22px;">
            ${badge("Verified Builder", BRAND.successSoft, BRAND.success)}
            &nbsp; badge on all your listings
          </td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;color:${BRAND.body};line-height:22px;">
            Your projects appear higher in search results
          </td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;color:${BRAND.body};line-height:22px;">
            Customers can see your verified badge on your profile page
          </td>
        </tr>
      </table>

      ${divider()}

      <div style="text-align:center;margin:4px 0 0;">
        ${button("https://verifiedprops.com/builder/dashboard", "Go to Dashboard", BRAND.accent)}
      </div>
      `,
    ),
  };
}

// ===========================================================================
// 4. BUILDER REJECTED
// ===========================================================================
export function builderRejectedEmail(companyName: string, reason: string): { subject: string; html: string } {
  return {
    subject: "Builder Account Rejection",
    html: baseLayout(
      "Builder account update",
      `
      <!-- Warning icon -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 20px;">
        <tr>
          <td align="center" style="background-color:${BRAND.dangerSoft};border-radius:50%;width:56px;height:56px;">
            <span style="font-size:28px;line-height:56px;color:${BRAND.danger};">&#10007;</span>
          </td>
        </tr>
      </table>

      <p style="margin:0 0 4px;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;color:${BRAND.secondary};text-align:center;">
        Account update
      </p>
      <p style="margin:0 0 8px;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:18px;font-weight:700;color:${BRAND.dark};text-align:center;line-height:26px;">
        Builder account not approved
      </p>
      <p style="margin:0 0 24px;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;color:${BRAND.body};text-align:center;line-height:24px;">
        Your account <strong>${esc(companyName)}</strong> was not approved on VerifiedProps at this time.
      </p>

      ${divider()}

      <!-- Reason box -->
      <p style="margin:0 0 8px;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:13px;font-weight:600;color:${BRAND.dark};text-transform:uppercase;letter-spacing:0.5px;">
        Reason
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${BRAND.lightBg};border-radius:12px;margin:0 0 20px;">
        <tr>
          <td style="padding:14px 16px;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;color:${BRAND.body};line-height:22px;">
            ${esc(reason)}
          </td>
        </tr>
      </table>

      <p style="margin:0 0 24px;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;color:${BRAND.secondary};line-height:22px;">
        You can update your documents and reapply for verification at any time from your dashboard.
      </p>

      <div style="text-align:center;margin:4px 0 0;">
        ${button("https://verifiedprops.com/builder/settings", "Update & Reapply", BRAND.accent)}
      </div>
      `,
    ),
  };
}

// ===========================================================================
// 5. PROJECT APPROVED
// ===========================================================================
export function projectApprovedEmail(projectTitle: string, city: string, locality: string): { subject: string; html: string } {
  return {
    subject: "Your Property Has Been Approved",
    html: baseLayout(
      "Project approved",
      `
      <!-- Success icon -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 20px;">
        <tr>
          <td align="center" style="background-color:${BRAND.successSoft};border-radius:50%;width:56px;height:56px;">
            <span style="font-size:28px;line-height:56px;">&#10003;</span>
          </td>
        </tr>
      </table>

      <p style="margin:0 0 4px;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;color:${BRAND.secondary};text-align:center;">
        Great news!
      </p>
      <p style="margin:0 0 8px;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:18px;font-weight:700;color:${BRAND.dark};text-align:center;line-height:26px;">
        Your project is now live
      </p>
      <p style="margin:0 0 24px;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;color:${BRAND.body};text-align:center;line-height:24px;">
        Your project <strong>${esc(projectTitle)}</strong> has been approved and is now visible to buyers on VerifiedProps.
      </p>

      <!-- Project details card -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${BRAND.lightBg};border-radius:12px;margin:0 0 24px;">
        <tr>
          <td style="padding:18px 20px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              ${infoRow("Project", projectTitle)}
              ${infoRow("Location", `${locality}, ${city}`)}
              ${infoRow("Status", "Approved & Live")}
            </table>
          </td>
        </tr>
      </table>

      <div style="text-align:center;margin:4px 0 0;">
        ${button("https://verifiedprops.com/builder/projects", "View Your Projects", BRAND.accent)}
      </div>
      `,
    ),
  };
}

// ===========================================================================
// 6. PROJECT REJECTED
// ===========================================================================
export function projectRejectedEmail(projectTitle: string, reason: string): { subject: string; html: string } {
  return {
    subject: "Your Property Was Not Approved",
    html: baseLayout(
      "Project not approved",
      `
      <!-- Warning icon -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 20px;">
        <tr>
          <td align="center" style="background-color:${BRAND.dangerSoft};border-radius:50%;width:56px;height:56px;">
            <span style="font-size:28px;line-height:56px;color:${BRAND.danger};">&#10007;</span>
          </td>
        </tr>
      </table>

      <p style="margin:0 0 4px;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;color:${BRAND.secondary};text-align:center;">
        Project review
      </p>
      <p style="margin:0 0 8px;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:18px;font-weight:700;color:${BRAND.dark};text-align:center;line-height:26px;">
        Your project was not approved
      </p>
      <p style="margin:0 0 24px;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;color:${BRAND.body};text-align:center;line-height:24px;">
        Your project <strong>${esc(projectTitle)}</strong> did not meet our review criteria at this time.
      </p>

      ${divider()}

      <!-- Reason box -->
      <p style="margin:0 0 8px;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:13px;font-weight:600;color:${BRAND.dark};text-transform:uppercase;letter-spacing:0.5px;">
        Reason
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${BRAND.lightBg};border-radius:12px;margin:0 0 20px;">
        <tr>
          <td style="padding:14px 16px;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;color:${BRAND.body};line-height:22px;">
            ${esc(reason)}
          </td>
        </tr>
      </table>

      <p style="margin:0 0 24px;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;color:${BRAND.secondary};line-height:22px;">
        Please review the feedback, update your project details, and resubmit for review. If you have questions, contact our support team.
      </p>

      <div style="text-align:center;margin:4px 0 0;">
        ${button("https://verifiedprops.com/builder/projects", "Edit Project", BRAND.accent)}
      </div>
      `,
    ),
  };
}

// ===========================================================================
// 7. EMAIL VERIFICATION CODE (builder)
// ===========================================================================
export function emailVerificationEmail(otp: string, expiryMinutes: number): { subject: string; html: string } {
  return {
    subject: "Verify Your Email Address — VerifiedProps",
    html: baseLayout(
      "Verify your email",
      `
      <p style="margin:0 0 4px;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;color:${BRAND.secondary};">
        Hello,
      </p>
      <p style="margin:0 0 24px;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;color:${BRAND.body};line-height:24px;">
        Welcome to <strong>VerifiedProps</strong>! Please verify your email address using the code below:
      </p>

      <!-- OTP BOX -->
      <table role="presentation" class="vp-otp-box" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${BRAND.accentSoft};border-radius:16px;border:1px solid ${BRAND.accent}22;margin:0 0 24px;">
        <tr>
          <td align="center" style="padding:28px 20px;">
            <span style="font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:11px;font-weight:600;color:${BRAND.accent};text-transform:uppercase;letter-spacing:1.5px;">
              Verification code
            </span><br/>
            <span class="vp-otp-code" style="display:inline-block;font-family:'Courier New',Courier,monospace;font-size:42px;font-weight:700;color:${BRAND.dark};letter-spacing:10px;padding:12px 0;">
              ${esc(otp)}
            </span><br/>
            <span style="font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;color:${BRAND.muted};">
              Expires in ${expiryMinutes} minute${expiryMinutes !== 1 ? "s" : ""}
            </span>
          </td>
        </tr>
      </table>

      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${BRAND.successSoft};border-radius:12px;border:1px solid ${BRAND.success}22;margin:0 0 20px;">
        <tr>
          <td style="padding:14px 16px;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:13px;color:${BRAND.success};line-height:20px;">
            <strong>Once verified</strong>, your builder account will be activated and you can start listing your projects.
          </td>
        </tr>
      </table>

      <p style="margin:0;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:13px;color:${BRAND.muted};line-height:20px;">
        If you didn&rsquo;t create an account on VerifiedProps, you can safely ignore this email.
      </p>
      `,
    ),
  };
}

// ===========================================================================
// 8. NEW LEAD ALERT (for builder)
// ===========================================================================
export function newLeadEmail(
  projectTitle: string,
  customerName: string,
  customerEmail: string,
  interest: string,
  leadId?: string,
  timestamp?: string,
): { subject: string; html: string } {
  const dashboardUrl = leadId
    ? `https://verifiedprops.com/builder/leads`
    : "https://verifiedprops.com/builder/leads";
  const formattedTime = timestamp
    ? new Date(timestamp).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
    : "";
  return {
    subject: `New enquiry for ${projectTitle}`,
    html: baseLayout(
      "New lead alert",
      `
      <!-- Bell icon -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 20px;">
        <tr>
          <td align="center" style="background-color:${BRAND.accentSoft};border-radius:50%;width:56px;height:56px;">
            <span style="font-size:28px;line-height:56px;">&#128276;</span>
          </td>
        </tr>
      </table>

      <p style="margin:0 0 4px;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;color:${BRAND.secondary};text-align:center;">
        New enquiry
      </p>
      <p style="margin:0 0 8px;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:18px;font-weight:700;color:${BRAND.dark};text-align:center;line-height:26px;">
        Someone is interested in your project
      </p>
      <p style="margin:0 0 24px;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;color:${BRAND.body};text-align:center;line-height:24px;">
        A buyer has expressed interest in <strong>${esc(projectTitle)}</strong> on VerifiedProps.
      </p>

      <!-- Lead details card -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${BRAND.accentSoft};border-radius:12px;border:1px solid ${BRAND.accent}22;margin:0 0 24px;">
        <tr>
          <td style="padding:18px 20px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              ${infoRow("Project", projectTitle)}
              ${infoRow("Name", customerName)}
              ${infoRow("Email", customerEmail)}
              ${infoRow("Interest", interest)}
              ${formattedTime ? infoRow("Submitted", formattedTime) : ""}
            </table>
          </td>
        </tr>
      </table>
    <!-- 
      <div style="text-align:center;margin:4px 0 0;">
        ${button(dashboardUrl, "View Lead in Dashboard", BRAND.accent)}
      </div>-->
      `,
    ),
  };
}
