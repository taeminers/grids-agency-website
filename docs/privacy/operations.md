# Privacy operations and publication

Owner-approved identity: **그리즈 (GRIDS AGENCY)**. Rights contact: **kyle@gridsagency.com**.

This document establishes the intended operating process. Creating it does not turn on MFA, change provider settings, process historic requests or automatically delete any email. The responsible person must adopt and perform the steps and record evidence before the corresponding public claims are approved.

## Inquiry retention: one year after closure

1. Handle incoming inquiries in the confirmed inquiry mailbox. Limit mailbox/delegate access to people who handle inquiries; verify MFA and recovery methods.
2. Mark a case closed when the requested inquiry/quote discussion is completed or explicitly ended. Record a closure date, a case reference and a deletion due date **one calendar year later**. Do not copy full messages into the retention register.
3. Review open cases periodically rather than keeping them open indefinitely. Define the inactivity closure rule with the business owner; no arbitrary inactivity period is assumed here.
4. At least monthly, check due cases. Delete the inquiry email/thread, downloaded copies and any dedicated exports; remove forwarding/shared copies under GRIDS control. Apply the mailbox provider's permanent-delete/Trash process. Verify the actual Trash/backup behavior before describing immediate permanent erasure.
5. Check EmailJS history/contact storage for the same case where still retained, including failed submissions. Provider history may expire sooner (Free 7 days / paid 30 days) and can be disabled; it is not a one-year mailbox archive.
6. If a case becomes a contract, separate records needed for the contract/accounting/legal obligations from the general inquiry. Record the specific record class, basis, permitted period and restricted access. Do not blanket-retain all inquiries because some clients sign contracts.
7. If a lawful hold applies, record its basis/scope and release condition. Otherwise honor justified deletion requests earlier where applicable.
8. Record completion with case reference, due/deleted dates, actor and outcome. Record exceptions without retaining message bodies. Set a separately justified retention rule for this minimal operations log; one has not yet been approved.

Suggested private register columns (not a public route or a new website database):

`case_reference | closure_date | deletion_due | reviewed_on | deleted_on | handler | provider_copies_checked | exception_basis | exception_review_due`

## Access, correction, deletion and restriction requests

1. Receive at `kyle@gridsagency.com`; label and acknowledge the request. Identify the request type and the minimum records necessary to locate it.
2. Verify proportionately, preferably by replying to the email associated with the inquiry. Do not request government identity documents by default. If an agent acts for someone else, verify authority proportionately.
3. Locate records in the mailbox, EmailJS where applicable and any controlled copies. For analytics requests, determine whether a browser/client identifier can actually locate the record; do not falsely promise email-to-GA matching when it does not exist.
4. Assess applicable statutory deadlines, legal exceptions and any extension/notification requirements for the particular request. Do not promise a generic deadline in the policy without checking the applicable request type.
5. Export/correct/delete/restrict the relevant records, contact processors where needed, and verify results. Scope to the requester and protect others' data.
6. Notify the requester of the result, any lawful limitation and available remedy. Record minimal request metadata and the outcome. Define a justified retention period for request logs before creating an indefinite archive.

## Security and access reviews

- Remediate the confirmed Vercel owner MFA gap. Verify actual MFA for Google, EmailJS, mailbox and GitHub accounts; do not substitute provider-wide security documentation for account evidence.
- Review roles, mailbox delegates, forwarding, tokens and access when people join/leave and during scheduled reviews. Restrict privileges to the task. Record completed reviews rather than claiming an unperformed cadence.
- Keep HTTPS verified after releases. Review CSP/referrer/content-type policies without breaking shaders, demos or required provider connections.
- Keep secrets outside client bundles and reports. EmailJS public identifiers are browser configuration; administrative tokens/passwords are not.
- Define an incident contact, escalation, evidence-preservation and applicable notification process before making incident-response claims. Do not put incident logs or personal data into public documentation.

## Tracking remediation and testing

Before publishing claims about optional analytics/advertising consent:

1. Decide each purpose and the appropriate legal/transfer basis; decide whether auto user-provided collection should be disabled.
2. Change only the approved accounts/settings. Export and retain the dated before/after tag configurations and publish-version references without raw visitor data.
3. Implement and test default/reject/allow/withdraw behavior. Controls must be keyboard/touch accessible, reversible, and no harder to reject than allow. A consent string or link to Google settings alone is not a functional site control.
4. Verify no optional requests before choice/after rejection if that is the promised behavior, including the GTM no-JavaScript fallback, SPA navigation, existing cookies, cross-subdomain demo frames and failures to read local storage.
5. Check cookies **and network requests**, including DoubleClick and `ga-audiences`. Cookie deletion alone does not establish that collection stopped.
6. Re-check form interactions with synthetic input and intercepted/stubbed delivery; never send real inquiry data to test enhanced collection. Confirm raw inquiry text/email is not added to analytics URLs/parameters.

## Privacy publication and version updates

- The draft is reviewable locally at `/ko/privacy` and `/en/privacy`. Production publication stays disabled until account evidence and copy are complete. The plain `/privacy` URL follows the site's existing locale routing.
- Source of truth: `src/content/privacy-policy.ts` and `src/lib/privacy-publication.ts`. Draft/public status and effective date are explicit, not calculated from today's date at runtime.
- Before setting status to published: resolve all items in the audit and account-evidence request; confirm controller/contact, field necessity, legal/transfer bases, exact provider retention, recipient contacts/countries, real consent controls, security claims and one-year deletion operation.
- Remove draft markers and account-setting placeholders. Set the effective date to the **actual publication date**; log the policy version and summary of changes here. Deploy only the reviewed version, then verify the live policy, footer/form links, notices, both locales, mobile layout and actual tracking behavior.
- For future changes, retain the prior published content with its date/version, maintain a public change history as appropriate, update notices before materially new processing, and obtain fresh permission where the change requires it. Do not silently overwrite the only record of a prior policy.
- Re-audit after GTM/GA/Ads configuration changes, adding services/forms/iframes, changing providers/countries, changing retention or introducing real AI integrations. Reconcile policy text to implemented behavior each time.

| Version | State | Effective date | Change |
| --- | --- | --- | --- |
| 1.0 | Draft | Pending actual publication | Initial policy prepared from the 2026-11-13 audit; Google/EmailJS/mailbox account evidence still outstanding. |

## Owner-supplied replacement copy — 2026-11-13

The owner supplied an 11-article Korean policy and an explicit effective date of
2026-11-13. It replaces the audit-based draft in `src/content/privacy-policy.ts`;
the earlier draft is preserved at `drafts/2026-11-13-audit-based-policy.ts.txt`.
The English route carries a corresponding translation. The malformed website
URL was corrected without changing the substantive Korean wording.

This is copy adoption, not new evidence of provider configuration or completed
security work. Production publication remains disabled. Before release:

- Verify an operational, closure-date-based automated mailbox deletion job.
  The earlier audit established an intended manual process, not automation.
- Resolve the observed Vercel owner MFA-disabled setting and verify the other
  key accounts before publishing the MFA claim.
- Verify EmailJS history at 7 days and GA event/user retention at 2/14 months
  against actual account settings, including retention resets.
- Complete the Google recipient legal entities, contacts, countries and
  applicable retention; resolve transfer grounds and refusal/effect details
  for every relevant service. Generic provider/country wording is not new
  verification of the Article 28-8 disclosure requirements.
- Reconcile any Google independent-controller use with the third-party
  disclosure article using the actual contracts and settings.
- If publication occurs after 2026-11-13, reconcile the effective date with the
  owner before release. No deployment or provider-setting change was made.
