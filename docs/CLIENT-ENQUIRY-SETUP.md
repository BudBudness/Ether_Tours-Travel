# Ether Tours & Travel — Client Enquiry Setup

Please complete the questions below so the website can accept trip enquiries safely. The website currently does **not** submit or store enquiries. Do not send passwords, API secrets, or payment details in this form.

## 1. Business identity
- Official business name as it should appear on the website:
- Registered country / registration details to publish (if applicable):
- Public office address or service area:
- Official business email:
- Main phone number, including country code:
- WhatsApp number, including country code:
- Business hours and time zone:
- Preferred customer-facing language(s):

## 2. Who receives enquiries?
- Primary recipient email for new enquiries:
- Backup recipient email:
- Staff member/role responsible for responding:
- Expected response time (e.g. within one business day):
- Should an acknowledgement email be sent to the traveller? Yes / No
- Approved wording for the acknowledgement, if any:

## 3. What should the form ask?
Confirm each field as Required or Optional:
- Full name:
- Email:
- Phone / WhatsApp:
- Country of residence:
- Destination(s):
- Preferred travel start and end dates:
- Are dates flexible?:
- Number of adults:
- Number of children and ages (if relevant):
- Tour interests (wildlife, gorillas/primates, culture, adventure, beach, other):
- Accommodation preference / budget range:
- Estimated budget and currency:
- Accessibility, dietary, or other arrangements the traveller chooses to share:
- Additional trip notes:
- Preferred contact method:
- Anything else the operator needs:

Do not ask for passport numbers, payment-card details, or other sensitive information in the initial enquiry form.

## 4. Catalogue and booking boundaries
- Destinations currently served:
- Tours/packages approved for publication:
- Confirmed inclusions and exclusions:
- Permit / park-fee wording that must be shown:
- Cancellation/refund policy URL or approved text:
- Is this an enquiry only, with no online booking/payment? Yes / No
- Exact disclaimer to show before submission:
- Who confirms final price, availability, permits and itinerary?

## 5. Privacy and data handling
- Name of the legal entity responsible for customer data:
- Privacy contact email:
- Countries/regions the business serves:
- How long should unanswered enquiries be retained?:
- How long should converted/cancelled enquiries be retained?:
- Who is authorised to view enquiries?:
- Should enquiries be deleted on request, and who handles those requests?:
- Approved privacy-policy text or legal adviser contact:
- Consent checkbox wording approved by the business:

## 6. Storage and notification setup
Preferred approach (recommendation: Supabase database with server-side validation and Row Level Security, plus email notification):
- Existing Supabase project for this website? Yes / No
- If yes, project URL (not a password or service-role key):
- Who can grant project access securely?
- Preferred email provider for notifications (if already used):
- Notification sender address/domain, if configured:
- Is there an existing CRM or enquiry inbox to integrate?:
- Staff who need a private enquiry dashboard:

Never paste Supabase service-role keys, SMTP passwords, email API keys, or other secrets into this document or a chat. Configure secrets directly in the authorised provider dashboard / Vercel environment settings.

## 7. Anti-spam and launch approval
- Is CAPTCHA/Turnstile acceptable? Yes / No
- Is email verification required before an enquiry is accepted? Yes / No
- Any expected high-volume campaign or traffic source?:
- Person authorised to approve the live form:
- Person authorised to approve the privacy and terms pages:
- Final approval date:

## 8. Final content approval
- Confirm public email and phone/WhatsApp are correct: Yes / No
- Confirm destinations and tour descriptions are accurate: Yes / No
- Confirm prices/availability are not advertised unless verified: Yes / No
- Confirm enquiry is not a booking confirmation: Yes / No
- Confirm privacy and terms have been reviewed: Yes / No

Once this information is returned, the enquiry flow can be implemented with server-side validation, spam controls, secure database writes, notification delivery, and tests. The live form should remain closed until those checks pass.
