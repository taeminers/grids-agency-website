# Account evidence needed to complete the privacy audit

Website: `www.gridsagency.com`; GTM `GTM-P24CXJTJ`; GA measurement ID `G-4TFWB7JM6W`.

Supply a current export or a view of the settings below from the correct account. Record the capture date. Read-only access is sufficient; do not send passwords, OAuth tokens, recovery codes, API keys, raw contact lists, inbox contents or unredacted visitor records. Account/user names can be masked as long as roles and setting states remain visible.

## Google Analytics

- Property name and numeric property ID matching `G-4TFWB7JM6W`.
- Data retention: **user-level**, **event-level**, reset on new activity, any 360/large-property limits.
- Data collection: Google Signals, user-provided-data collection/acknowledgement, geographic restrictions and Ads personalization settings.
- Web stream → Google tag: automatic user-provided-data settings, manual/code collection, excluded selectors, email/query redaction, cross-domain setup, cookie expiration/update overrides and consent settings.
- Product links → Google Ads: linked account list, personalization/audience sharing and export status. BigQuery/other product links and destination retention if any.
- Key events/conversions, audiences and their membership durations; data sharing settings.
- Property/account access role counts and MFA enforcement evidence for account holders. Avoid raw user-event exports.

## Google Tag Manager

- Export the **current published version**, not only an unpublished workspace. The public container observed on 2026-11-13 was resource version 4.
- Include tags, triggers, variables, custom templates, consent initialization/default/update, region rules and additional-consent requirements. Capture Consent Overview if enabled.
- Any server-side containers, environments, linked destinations or CMP integrations.
- Users/roles, publish permissions and two-step-verification enforcement setting. No changes or publishing are needed for this review.

## Google Ads

- Account identity matching any GA4 links; no need for payment information.
- Conversion actions: source (GA4 import vs website tag), conversion IDs/labels, purposes and counting/window settings.
- Enhanced conversions (account and each action), user-provided data sources, automatic collection, Customer Match and related uploads/automations if any.
- Audience manager: remarketing sources, audience sharing and membership durations; no customer-list member export.
- Linked accounts, Google tag destinations, consent/data-manager settings, geographic rules and personalization restrictions.
- Access roles/MFA enforcement, applicable processing/controller terms and whether inquiry data is used for any advertising purpose.

## EmailJS and the inquiry mailbox

- Current plan and template's **save/history** setting (detailed variables stored or disabled).
- Sending-service provider/account type, template To/CC/BCC/reply-to configuration and whether `to_email` is actually used. Mask unrelated addresses.
- Domain allowlist, CAPTCHA/spam controls, quotas, account members/MFA, and applicable processing agreement.
- Provider of `kyle@gridsagency.com`; forwarding/shared-delegate/sent-copy rules; mailbox retention, Trash and backup behavior; roles/MFA.
- Confirm how a case is marked closed and who performs the closure + one-year deletion review. A record-retention rule in this repository cannot delete a mailbox by itself.

## Vercel follow-up

The API audit already confirmed Hobby, US default function region, one OWNER with MFA false, no log drains and no custom firewall config. Follow-up evidence is needed for:

- MFA enabled for the owner and recovery/access review after remediation.
- Whether dashboard Web Analytics is intentionally enabled and why no collection script was observed; any account-level integrations outside the inspected project.
- Retention of CDN/firewall/platform-security records beyond the one-hour Hobby runtime dashboard window; subprocessors/regions applicable to this project and Hobby's contractual processing terms.
- The actual production privacy release and a post-release anonymous-browser check after tracking/consent changes.

## What remains an owner/legal decision

- Name/email/service/budget necessity and any change to required fields.
- Whether user-provided-data collection and advertising features are needed at all.
- Processing basis and overseas-transfer basis per purpose/provider; accepted contracts and recipient contacts/countries.
- Actual publication date. Do not backdate a draft or equate it with the audit date.
