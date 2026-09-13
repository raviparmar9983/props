// PropertiesWale Email Templates
// Table-based, inline-only styles, compatible with Gmail, Outlook, Apple Mail, Yahoo
// Design system aligned with apps/web tailwind.config.ts + globals.css

const BRAND = {
  accent: "#B8894F",
  accentDark: "#8A6031",
  accentSoft: "#E8D9C3",
  dark: "#1B2A4A",
  blueprint: "#2F5D8A",
  body: "#1F2430",
  secondary: "#5B6270",
  muted: "#9199A8",
  border: "#E7E9ED",
  lightBg: "#FAF9F6",
  surface: "#FFFFFF",
  success: "#1F8A5F",
  successSoft: "#E1F3EA",
  danger: "#C2410C",
  dangerSoft: "#FBE7DD",
  gold: "#E8A845",
};

const FONT_BODY = "Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const FONT_DISPLAY = "Fraunces,Georgia,'Times New Roman',serif";
const FONT_MONO = "'IBM Plex Mono','Courier New',Courier,monospace";

const HAIRLINE = `linear-gradient(90deg, ${BRAND.blueprint} 0%, ${BRAND.accent} 45%, ${BRAND.gold} 100%)`;

const PLATFORM = {
  name: "PropertiesWale",
  tagline: "Verified Homes. Better Decisions.",
  webUrl: normalizeUrl(firstEnv("PUBLIC_WEB_URL", "CORS_ORIGIN_PUBLIC"), "https://propertieswale.com"),
  builderUrl: normalizeUrl(firstEnv("BUILDER_APP_URL", "CORS_ORIGIN_BUILDER"), "https://builder.propertieswale.com"),
  supportEmail: firstEnv("SUPPORT_EMAIL") || "support@propertieswale.com",
};

function firstEnv(...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = process.env[key];
    if (value && value.trim()) return value.trim();
  }
  return undefined;
}

function normalizeUrl(value: string | undefined, fallback: string): string {
  const candidate = value?.trim() || fallback;
  try {
    return new URL(candidate).origin;
  } catch {
    return fallback;
  }
}

function builderLink(path: string): string {
  return `${PLATFORM.builderUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

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
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
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
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; height: 100% !important; }
    a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important; }
    u + #body a { color: inherit; text-decoration: none; font-size: inherit; font-family: inherit; font-weight: inherit; line-height: inherit; }
    @media only screen and (max-width: 620px) {
      .pw-container { width: 100% !important; }
      .pw-card { border-radius: 14px !important; }
      .pw-otp-code { font-size: 30px !important; letter-spacing: 5px !important; }
      .pw-btn { width: 100% !important; display: block !important; text-align: center !important; }
    }
  </style>
</head>
<body id="body" style="margin:0;padding:0;background-color:${BRAND.lightBg};font-family:${FONT_BODY};">
  <!-- Preheader (hidden preview text) -->
  <div style="display:none;font-size:1px;color:${BRAND.lightBg};line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${esc(title)} &middot; ${esc(PLATFORM.tagline)}
  </div>

  <!-- Outer wrapper -->
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${BRAND.lightBg};">
    <tr>
      <td align="center" style="padding:32px 16px 40px;">
        <!--[if mso]>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" align="center"><tr><td>
        <![endif]-->

        <table role="presentation" class="pw-container" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;margin:0 auto;">

          ${brandHeader()}

          <!-- Body card (attached to header) -->
          <table role="presentation" class="pw-card" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${BRAND.surface};border-radius:0 0 16px 16px;">
            <tr>
              <td style="padding:32px 32px 36px;">
                ${contentHtml}
              </td>
            </tr>
          </table>

          <!-- ===== FOOTER ===== -->
          <tr>
            <td style="padding:28px 16px 0;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="height:1px;font-size:0;line-height:0;border-top:1px solid ${BRAND.border};">&nbsp;</td>
                </tr>
                <tr>
                  <td align="center" style="padding:18px 0 12px;">
                    <span style="font-family:${FONT_DISPLAY};font-size:15px;font-weight:700;color:${BRAND.body};">Properties<span style="color:${BRAND.accent};">Wale</span></span>
                    <span style="font-family:${FONT_BODY};font-size:12px;color:${BRAND.muted};"> &mdash; ${esc(PLATFORM.tagline)}</span>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:0 0 14px;">
                    <a href="${esc(PLATFORM.webUrl)}" style="font-family:${FONT_BODY};font-size:12px;color:${BRAND.accentDark};text-decoration:none;">${esc(PLATFORM.webUrl.replace(/^https?:\/\//, ""))}</a>
                    &nbsp;&nbsp;&middot;&nbsp;&nbsp;
                    <a href="mailto:${esc(PLATFORM.supportEmail)}" style="font-family:${FONT_BODY};font-size:12px;color:${BRAND.accentDark};text-decoration:none;">Support: ${esc(PLATFORM.supportEmail)}</a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:0 0 6px;">
                    <span style="font-family:${FONT_BODY};font-size:11px;color:${BRAND.muted};line-height:16px;">
                      You received this email because you have an account or requested a transaction on ${esc(PLATFORM.name)}.
                    </span>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <span style="font-family:${FONT_BODY};font-size:11px;color:${BRAND.muted};line-height:16px;">
                      &copy; ${new Date().getFullYear()} ${esc(PLATFORM.name)}. All rights reserved.
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
// Brand header — monogram lockup + tagline + gradient hairlines
// ---------------------------------------------------------------------------
function brandHeader(): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${BRAND.dark};border-radius:16px 16px 0 0;">
    <tr>
      <td style="height:4px;line-height:4px;font-size:0;background-color:${BRAND.accent};background-image:${HAIRLINE};">&nbsp;</td>
    </tr>
    <tr>
      <td align="center" style="padding:28px 24px 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
          <tr>
            <td valign="middle" style="vertical-align:middle;">
              <!--[if mso]>
              <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" style="height:42px;width:42px;v-text-anchor:middle;" arcsize="35%" stroked="f" fillcolor="${BRAND.accentSoft}">
                <w:anchorlock/>
                <center style="color:${BRAND.accentDark};font-family:Georgia,serif;font-size:22px;font-weight:700;">P</center>
              </v:roundrect>
              <![endif]-->
              <!--[if !mso]><!-->
              <span style="display:block;width:42px;height:42px;line-height:42px;background-color:${BRAND.accentSoft};border-radius:12px;font-family:${FONT_DISPLAY};font-size:22px;font-weight:700;color:${BRAND.accentDark};text-align:center;">P</span>
              <!--<![endif]-->
            </td>
            <td valign="middle" style="vertical-align:middle;padding-left:12px;">
              <span style="font-family:${FONT_DISPLAY};font-size:26px;font-weight:700;letter-spacing:-0.8px;color:${BRAND.surface};white-space:nowrap;">Properties<span style="color:${BRAND.accent};">Wale</span></span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding:10px 24px 26px;">
        <span style="font-family:${FONT_BODY};font-size:11px;font-weight:600;color:#B8BEC8;letter-spacing:1.5px;text-transform:uppercase;">${esc(PLATFORM.tagline)}</span>
      </td>
    </tr>
    <tr>
      <td style="height:3px;line-height:3px;font-size:0;background-color:${BRAND.accent};background-image:${HAIRLINE};">&nbsp;</td>
    </tr>
  </table>`;
}

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function badge(label: string, bg: string, fg: string): string {
  return `<span style="display:inline-block;background-color:${bg};color:${fg};font-family:${FONT_BODY};font-size:11px;font-weight:700;padding:4px 12px;border-radius:999px;">${esc(label)}</span>`;
}

function button(href: string, label: string, bg: string = BRAND.accent, fg: string = "#FFFFFF"): string {
  return `<!--[if mso]>
<v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${esc(href)}" style="height:46px;v-text-anchor:middle;width:260px;" arcsize="22%" strokecolor="${bg}" fillcolor="${bg}">
<w:anchorlock/>
<center style="color:${fg};font-family:Inter,sans-serif;font-size:15px;font-weight:700;">${esc(label)}</center>
</v:roundrect>
<![endif]-->
<!--[if !mso]><!-->
<a href="${esc(href)}" target="_blank" style="display:inline-block;background-color:${bg};color:${fg};font-family:${FONT_BODY};font-size:15px;font-weight:700;text-decoration:none;text-align:center;padding:13px 40px;border-radius:10px;box-shadow:0 4px 14px ${bg}33;">${esc(label)}</a>
<!--<![endif]-->`;
}

function divider(): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:22px 0;">
  <tr><td style="border-top:1px solid ${BRAND.border};font-size:0;line-height:0;">&nbsp;</td></tr>
</table>`;
}

function eyebrow(text: string): string {
  return `<p style="margin:0 0 10px;font-family:${FONT_BODY};font-size:11px;font-weight:700;color:${BRAND.muted};text-transform:uppercase;letter-spacing:1.2px;">${esc(text)}</p>`;
}

function iconBubble(glyph: string, bg: string, fg: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 18px;">
    <tr>
      <td align="center" style="background-color:${bg};border-radius:50%;width:56px;height:56px;text-align:center;vertical-align:middle;">
        <span role="img" aria-label="${esc(label)}" style="display:block;width:56px;height:56px;line-height:56px;font-family:${FONT_BODY};font-size:24px;font-weight:700;color:${fg};">${glyph}</span>
      </td>
    </tr>
  </table>`;
}

function otpCard(kicker: string, otp: string, expiryMinutes: number): string {
  return `<table role="presentation" class="pw-otp-card" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${BRAND.lightBg};border:1px solid ${BRAND.border};border-top:3px solid ${BRAND.accent};border-radius:14px;margin:0 0 22px;">
    <tr>
      <td align="center" style="padding:26px 20px 22px;">
        <span style="font-family:${FONT_BODY};font-size:11px;font-weight:700;color:${BRAND.accentDark};text-transform:uppercase;letter-spacing:1.5px;">${esc(kicker)}</span><br/>
        <span class="pw-otp-code" style="display:inline-block;font-family:${FONT_MONO};font-size:36px;font-weight:700;color:${BRAND.dark};letter-spacing:9px;padding:16px 0 10px;">${esc(otp)}</span><br/>
        <span style="font-family:${FONT_BODY};font-size:12px;color:${BRAND.muted};">Expires in ${expiryMinutes} minute${expiryMinutes !== 1 ? "s" : ""}</span>
      </td>
    </tr>
  </table>`;
}

function detailsCard(rows: string, label?: string, opts: { accentBorder?: boolean } = {}): string {
  const borderLeft = opts.accentBorder ? `border-left:4px solid ${BRAND.accent};` : "";
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${BRAND.surface};border:1px solid ${BRAND.border};${borderLeft}border-radius:14px;box-shadow:0 2px 12px rgba(27,42,74,0.06);margin:0 0 22px;">
    <tr>
      <td style="padding:16px 20px;">
        ${label ? `<p style="margin:0 0 6px;font-family:${FONT_BODY};font-size:11px;font-weight:700;color:${BRAND.muted};text-transform:uppercase;letter-spacing:1.2px;">${esc(label)}</p>` : ""}
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          ${rows}
        </table>
      </td>
    </tr>
  </table>`;
}

function infoRow(label: string, value: string, last = false): string {
  const border = last ? "" : `border-bottom:1px solid ${BRAND.border};`;
  return `<tr>
    <td style="padding:10px 12px 10px 0;width:118px;vertical-align:top;font-family:${FONT_BODY};font-size:11px;font-weight:600;letter-spacing:0.6px;text-transform:uppercase;color:${BRAND.muted};${border}">${esc(label)}</td>
    <td style="padding:10px 0;vertical-align:top;font-family:${FONT_BODY};font-size:14px;font-weight:600;color:${BRAND.body};word-break:break-word;${border}">${esc(value)}</td>
  </tr>`;
}

function checkRow(textHtml: string): string {
  return `<tr>
    <td style="padding:8px 0;font-family:${FONT_BODY};font-size:14px;color:${BRAND.body};line-height:22px;vertical-align:middle;">
      <span style="display:inline-block;width:20px;height:20px;line-height:20px;border-radius:50%;background-color:${BRAND.successSoft};color:${BRAND.success};font-family:${FONT_BODY};font-size:11px;font-weight:700;text-align:center;margin-right:10px;vertical-align:middle;">&#10003;</span>
      <span style="vertical-align:middle;">${textHtml}</span>
    </td>
  </tr>`;
}

function noteBox(textHtml: string, tone: "danger" | "success"): string {
  const bg = tone === "danger" ? BRAND.dangerSoft : BRAND.successSoft;
  const fg = tone === "danger" ? BRAND.danger : BRAND.success;
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${bg};border:1px solid ${fg}22;border-left:3px solid ${fg};border-radius:12px;margin:0 0 20px;">
    <tr>
      <td style="padding:14px 16px;font-family:${FONT_BODY};font-size:13px;color:${fg};line-height:20px;">${textHtml}</td>
    </tr>
  </table>`;
}

// ===========================================================================
// 1. OTP LOGIN CODE
// ===========================================================================
export function otpLoginEmail(otp: string, expiryMinutes: number): { subject: string; html: string } {
  return {
    subject: "Your PropertiesWale login code",
    html: baseLayout(
      "Your login code",
      `
      <p style="margin:0 0 6px;font-family:${FONT_BODY};font-size:15px;color:${BRAND.secondary};">
        Hello,
      </p>
      <p style="margin:0 0 22px;font-family:${FONT_BODY};font-size:15px;color:${BRAND.body};line-height:24px;">
        Here&rsquo;s your one-time login code for <strong>${esc(PLATFORM.name)}</strong>. Enter it on the login screen to continue.
      </p>

      ${otpCard("Your login code", otp, expiryMinutes)}

      <p style="margin:0;font-family:${FONT_BODY};font-size:13px;color:${BRAND.muted};line-height:20px;">
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
    subject: "Reset your PropertiesWale password",
    html: baseLayout(
      "Password reset code",
      `
      <p style="margin:0 0 6px;font-family:${FONT_BODY};font-size:15px;color:${BRAND.secondary};">
        Hello,
      </p>
      <p style="margin:0 0 22px;font-family:${FONT_BODY};font-size:15px;color:${BRAND.body};line-height:24px;">
        We received a request to reset the password for your <strong>${esc(PLATFORM.name)}</strong> account. Use the code below to continue:
      </p>

      ${otpCard("Reset code", otp, expiryMinutes)}

      ${noteBox(
        `<strong>Didn&rsquo;t request this?</strong> Your account is safe. If you did not ask for a password reset, please ignore this email &mdash; your password will not be changed.`,
        "danger",
      )}

      <p style="margin:0 0 4px;font-family:${FONT_BODY};font-size:13px;color:${BRAND.muted};line-height:20px;">
        The code above is valid for a single use and expires in ${expiryMinutes} minute${expiryMinutes !== 1 ? "s" : ""}. If it expires, simply request a new one.
      </p>
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
      ${iconBubble("&#10003;", BRAND.successSoft, BRAND.success, "Success")}

      <p style="margin:0 0 4px;font-family:${FONT_BODY};font-size:15px;color:${BRAND.secondary};text-align:center;">
        Congratulations!
      </p>
      <p style="margin:0 0 8px;font-family:${FONT_DISPLAY};font-size:20px;font-weight:700;color:${BRAND.dark};text-align:center;line-height:28px;">
        Your builder account has been verified
      </p>
      <p style="margin:0 0 4px;font-family:${FONT_BODY};font-size:15px;color:${BRAND.body};text-align:center;line-height:24px;">
        <strong>${esc(companyName)}</strong> is now a <strong>Verified Builder</strong> on ${esc(PLATFORM.name)}.
      </p>
      <p style="margin:0 0 22px;font-family:${FONT_BODY};font-size:13px;color:${BRAND.muted};text-align:center;line-height:20px;">
        Buyers will trust your projects. Here&rsquo;s what changes now:
      </p>

      ${divider()}

      ${eyebrow("What this means")}
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 8px;">
        ${checkRow(`${badge("Verified Builder", BRAND.successSoft, BRAND.success)} &nbsp;badge on all your listings`)}
        ${checkRow(`Your projects rank higher in search results for buyers`)}
        ${checkRow(`Customers can see your verified badge on your public profile`)}
      </table>

      ${divider()}

      <div style="text-align:center;margin:6px 0 0;">
        ${button(builderLink("/"), "Go to Dashboard", BRAND.accent)}
        <p style="margin:10px 0 0;font-family:${FONT_BODY};font-size:13px;color:${BRAND.muted};">
          Or <a href="${esc(builderLink("/projects"))}" style="color:${BRAND.accentDark};text-decoration:underline;">manage your projects</a>.
        </p>
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
    subject: "Builder Account Not Approved",
    html: baseLayout(
      "Builder account update",
      `
      ${iconBubble("&#10007;", BRAND.dangerSoft, BRAND.danger, "Not approved")}

      <p style="margin:0 0 4px;font-family:${FONT_BODY};font-size:15px;color:${BRAND.secondary};text-align:center;">
        Account update
      </p>
      <p style="margin:0 0 8px;font-family:${FONT_DISPLAY};font-size:20px;font-weight:700;color:${BRAND.dark};text-align:center;line-height:28px;">
        Builder account not approved
      </p>
      <p style="margin:0 0 22px;font-family:${FONT_BODY};font-size:15px;color:${BRAND.body};text-align:center;line-height:24px;">
        Your account <strong>${esc(companyName)}</strong> hasn&rsquo;t been approved on ${esc(PLATFORM.name)} at this time.
      </p>

      ${divider()}

      ${eyebrow("Reason")}
      ${detailsCard(`<tr><td style="padding:0;font-family:${FONT_BODY};font-size:14px;color:${BRAND.body};line-height:22px;">${esc(reason)}</td></tr>`)}

      <p style="margin:0 0 22px;font-family:${FONT_BODY};font-size:14px;color:${BRAND.secondary};line-height:22px;">
        If the issue is with the details or documents you provided, you can update them and reapply for verification at any time from your settings.
      </p>

      <div style="text-align:center;margin:6px 0 0;">
        ${button(builderLink("/settings"), "Update Profile & Reapply", BRAND.accent)}
        <p style="margin:10px 0 0;font-family:${FONT_BODY};font-size:13px;color:${BRAND.muted};">
          Questions? Write to us at <a href="mailto:${esc(PLATFORM.supportEmail)}" style="color:${BRAND.accentDark};text-decoration:underline;">${esc(PLATFORM.supportEmail)}</a>.
        </p>
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
      ${iconBubble("&#10003;", BRAND.successSoft, BRAND.success, "Success")}

      <p style="margin:0 0 4px;font-family:${FONT_BODY};font-size:15px;color:${BRAND.secondary};text-align:center;">
        Great news!
      </p>
      <p style="margin:0 0 8px;font-family:${FONT_DISPLAY};font-size:20px;font-weight:700;color:${BRAND.dark};text-align:center;line-height:28px;">
        Your project is now live
      </p>
      <p style="margin:0 0 22px;font-family:${FONT_BODY};font-size:15px;color:${BRAND.body};text-align:center;line-height:24px;">
        Your project <strong>${esc(projectTitle)}</strong> has been approved and is now visible to buyers on ${esc(PLATFORM.name)}.
      </p>

      ${detailsCard(
        `${infoRow("Project", projectTitle)}
         ${infoRow("Location", `${locality}, ${city}`)}
         ${infoRow("Status", "Approved & Live", true)}`,
        "Project summary",
      )}

      <div style="text-align:center;margin:6px 0 0;">
        ${button(builderLink("/projects"), "View Your Projects", BRAND.accent)}
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
      ${iconBubble("&#10007;", BRAND.dangerSoft, BRAND.danger, "Not approved")}

      <p style="margin:0 0 4px;font-family:${FONT_BODY};font-size:15px;color:${BRAND.secondary};text-align:center;">
        Project review
      </p>
      <p style="margin:0 0 8px;font-family:${FONT_DISPLAY};font-size:20px;font-weight:700;color:${BRAND.dark};text-align:center;line-height:28px;">
        Your project was not approved
      </p>
      <p style="margin:0 0 22px;font-family:${FONT_BODY};font-size:15px;color:${BRAND.body};text-align:center;line-height:24px;">
        Your project <strong>${esc(projectTitle)}</strong> didn&rsquo;t meet our review criteria at this time.
      </p>

      ${divider()}

      ${eyebrow("Reason")}
      ${detailsCard(`<tr><td style="padding:0;font-family:${FONT_BODY};font-size:14px;color:${BRAND.body};line-height:22px;">${esc(reason)}</td></tr>`)}

      <p style="margin:0 0 22px;font-family:${FONT_BODY};font-size:14px;color:${BRAND.secondary};line-height:22px;">
        Please review the feedback, update your project details, and resubmit for review. If you have questions, our support team is happy to help.
      </p>

      <div style="text-align:center;margin:6px 0 0;">
        ${button(builderLink("/projects"), "Edit Project", BRAND.accent)}
        <p style="margin:10px 0 0;font-family:${FONT_BODY};font-size:13px;color:${BRAND.muted};">
          Questions? Write to us at <a href="mailto:${esc(PLATFORM.supportEmail)}" style="color:${BRAND.accentDark};text-decoration:underline;">${esc(PLATFORM.supportEmail)}</a>.
        </p>
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
    subject: "Verify your email — PropertiesWale",
    html: baseLayout(
      "Verify your email",
      `
      <p style="margin:0 0 6px;font-family:${FONT_BODY};font-size:15px;color:${BRAND.secondary};">
        Hello,
      </p>
      <p style="margin:0 0 22px;font-family:${FONT_BODY};font-size:15px;color:${BRAND.body};line-height:24px;">
        Welcome to <strong>${esc(PLATFORM.name)}</strong>! Please confirm your email address to activate your builder account. Enter the code below:
      </p>

      ${otpCard("Verification code", otp, expiryMinutes)}

      ${noteBox(
        `<strong>Once verified</strong>, your builder account will be activated and you can start listing your projects.`,
        "success",
      )}

      <p style="margin:0;font-family:${FONT_BODY};font-size:13px;color:${BRAND.muted};line-height:20px;">
        If you didn&rsquo;t create an account on ${esc(PLATFORM.name)}, you can safely ignore this email.
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
  customerPhone: string | undefined,
  interest: string,
  leadId?: string,
  timestamp?: string,
): { subject: string; html: string } {
  const formattedTime = timestamp
    ? new Date(timestamp).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
    : "";
  return {
    subject: `New enquiry for ${projectTitle}`,
    html: baseLayout(
      "New lead alert",
      `
      ${iconBubble("&#128276;", BRAND.accentSoft, BRAND.accentDark, "New lead")}

      <p style="margin:0 0 4px;font-family:${FONT_BODY};font-size:15px;color:${BRAND.secondary};text-align:center;">
        New enquiry
      </p>
      <p style="margin:0 0 8px;font-family:${FONT_DISPLAY};font-size:20px;font-weight:700;color:${BRAND.dark};text-align:center;line-height:28px;">
        Someone is interested in your project
      </p>
      <p style="margin:0 0 22px;font-family:${FONT_BODY};font-size:15px;color:${BRAND.body};text-align:center;line-height:24px;">
        A buyer has expressed interest in <strong>${esc(projectTitle)}</strong> on ${esc(PLATFORM.name)}. Reach out while the lead is fresh.
      </p>

      ${detailsCard(
        `${infoRow("Project", projectTitle)}
         ${infoRow("Name", customerName)}
         ${infoRow("Email", customerEmail)}
         ${customerPhone ? infoRow("Phone", customerPhone) : ""}
         ${infoRow("Interest", interest, !formattedTime)}
         ${formattedTime ? infoRow("Submitted", formattedTime, true) : ""}`,
        "Lead details",
        { accentBorder: true },
      )}

      <div style="text-align:center;margin:6px 0 0;">
        ${button(builderLink("/"), "View Lead in Dashboard", BRAND.accent)}
        <p style="margin:10px 0 0;font-family:${FONT_BODY};font-size:13px;color:${BRAND.muted};">
          Fast responses convert more enquiries into site visits.
        </p>
      </div>
      `,
    ),
  };
}