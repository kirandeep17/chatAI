# group: How would you test...
? How would you test a search box (e.g. on an e-commerce site)? | E
Functional: exact, partial and case-insensitive matches, typos and suggestions, special characters, empty search, very long query, filters and sorting with results, pagination, no-results page. Non-functional: response time with large catalogue, results relevance, XSS/SQL injection in the query, accessibility (label, keyboard, announcements), analytics events, mobile layout.

? How would you test a shopping cart? | E
Add/remove/update quantities, max quantity and stock limits, price and tax calculations, coupons (valid, expired, stacking rules), cart persistence across sessions and devices, guest vs logged-in merge, price changes after adding, out-of-stock while in cart, concurrency (two tabs), and performance with many items.

? How would you test a payment gateway integration? | M
Success, failure, cancellation and timeout for each method (card, UPI, net banking, wallets); 3-D Secure/OTP flows; duplicate submission and idempotency; callback/webhook handling and reconciliation; refunds (full, partial); currency and rounding; amount limits; PCI compliance (no card data stored or logged); and the gateway sandbox with test cards.

? How would you test an ATM? | E
Card insertion (valid, expired, blocked, wrong orientation), PIN (correct, wrong, three attempts → card retained), withdrawal (multiples of denominations, insufficient balance, daily limit, ATM out of cash), receipt, balance enquiry, timeouts, power failure mid-transaction (no debit without dispensing), accessibility (audio jack, braille), language selection.

? How would you test a file upload feature? | E
Allowed and disallowed types, size limits (0 bytes, at limit, above), multiple files, drag and drop, long and Unicode file names, duplicate names, slow network and cancel, virus files, preview, storage and download of the same file, permissions on uploaded files, and accessibility of the upload control.

? How would you test a "forgot password" flow? | M
Valid and unknown email (same message for both to prevent enumeration), link expiry and single-use, token tampering, password policy on reset, old password invalid after reset, all sessions logged out, rate limiting of reset requests, email content and links, and the flow on mobile.

? How would you test a registration form? | E
Required fields, formats (email, phone with country code, PIN code), boundary lengths, duplicate email/phone, password rules and confirmation match, terms checkbox, error messages next to fields, OTP verification, autofill, double submit, accessibility, and data stored correctly (and password hashed).

? How would you test a date picker? | E
Valid and invalid dates (31 Feb), min/max limits, past/future restrictions, leap years, month and year navigation, typing vs picking, different locales and formats (DD/MM/YYYY in India), time zones, keyboard and screen reader use, and mobile behaviour.

? How would you test a notification system (email/SMS/push)? | M
Trigger conditions, content and personalisation, links, unsubscribe and preferences, delivery to multiple devices, timing and time zones, retries on failure, duplicate prevention, rate limits, localisation, and behaviour when the user has no email or phone on file.

? How would you test a food delivery app's order flow? | M
Restaurant availability and timings, menu customisation, cart rules, address and serviceability, delivery fee and surge pricing, coupons, payment, order states (placed → accepted → preparing → picked → delivered), live tracking, cancellation and refunds at each state, ratings, notifications, poor network, and peak-hour load.

? How would you test a ride-booking app? | M
Location permissions and accuracy, pickup/drop selection, fare estimate vs final fare, driver matching and cancellations by either side, surge pricing, live tracking, OTP to start ride, payment methods, SOS feature, trip history and invoices, background/foreground behaviour, and battery/network conditions.

? How would you test a video streaming feature? | M
Playback start time, adaptive bitrate on changing network, seek, pause/resume, subtitles and audio tracks, full screen and orientation, DRM, resume from last position across devices, offline download, concurrent stream limits, ads, accessibility, and CDN failures.

? How would you test a chat/messaging application? | M
Send/receive text, emojis, media; delivery and read receipts; offline queueing and sync; message ordering; group chats and admin actions; notifications; very long messages; blocking/reporting; end-to-end encryption claims; multi-device sync; and performance with large histories.

? How would you test an email client's "send" feature? | E
Recipients (to, cc, bcc, invalid addresses, many recipients), subject and body formatting, attachments (size, types), drafts autosave, send later, undo send, offline send queue, sent folder, signatures, spam/security checks and accessibility.

? How would you test a Google Maps-like navigation feature? | H
Route correctness for known start/end pairs, alternative routes, rerouting when the user deviates, live traffic updates, ETA accuracy, voice guidance timing, GPS loss in tunnels, offline maps, different transport modes, battery usage, and accessibility of directions.

? How would you test a "remember me" checkbox? | E
Session persists after browser restart when checked and not when unchecked; persistent token is secure (HttpOnly, Secure, expiry); logout clears it; password change invalidates it; works per device; and behaviour in private browsing.

? How would you test pagination on a listing page? | E
First/last/next/previous, direct page numbers, page size options, total count, deep linking via URL, sorting and filters preserved across pages, empty last page, data changing between page loads, and performance of later pages.

? How would you test a coupon/discount engine? | M
Valid, expired, future, already-used and invalid codes; minimum order value; maximum discount caps; category or user restrictions; first-order-only rules; stacking rules; rounding; coupons after cart changes; concurrency (same single-use code in two tabs); and admin configuration errors.

? How would you test an OTP login? | E
Correct, wrong and expired OTP; resend limits and cool-down; OTP length; auto-read on Android; multiple OTPs (only latest valid); rate limiting and lockout; delivery delays; changing the phone number mid-flow; and security of OTP in logs and APIs.

? How would you test a bank funds transfer? | H
Beneficiary add and cooling period, limits (per transaction, daily), insufficient balance, IFSC validation, NEFT/RTGS/IMPS timings and rules, idempotency on retry, two-factor confirmation, debit/credit consistency if the receiving bank fails, reversal, statements and notifications, audit trail, and concurrent transfers.

? How would you test a Excel/CSV export feature? | E
Column headers and order, data matches the screen filters, special characters and Unicode (₹, Hindi text), large exports and timeouts, number and date formats, empty export, file name, permissions (only authorised data), and opening in Excel without formula injection (`=cmd...` cells).

? How would you test a microwave oven? | E
Functional (timer, power levels, presets, start/stop/pause, door open stops heating), safety (doesn't run with door open, child lock, overheating cut-off), usability (display readability, button feedback), non-functional (power consumption, noise), negative (pressing start with zero time, very long durations).

? How would you test a vending machine? | E
Product selection, payment (coins, notes, UPI), exact and change-required amounts, insufficient money, sold-out items, refund on cancel, product stuck, power failure mid-transaction, and stock and cash reporting.

? How would you test a traffic signal system? | M
Timing sequences, pedestrian button, sensor-based adaptive timing, synchronisation between junctions, emergency vehicle override, power failure fallback (blinking amber), fault reporting, and weather/visibility conditions.

? How would you test a web page's responsiveness? | E
Breakpoints for mobile, tablet and desktop; orientation changes; images scale; no horizontal scroll; touch targets size; navigation collapses correctly; fonts readable; tested on real devices and emulators across browsers.

? How would you test an admin role-based access system? | M
Matrix of roles × permissions: each role sees and can do only what it should in UI and API; role changes take effect immediately; removing a user revokes access; privilege escalation attempts fail; audit logs record admin actions.

? How would you test an API rate limit as a scenario question? | M
Send requests at, just below and above the limit within the window, verify 429 and `Retry-After`, check limits per user/key/IP, window reset, behaviour across multiple servers, and that legitimate users aren't affected by one abuser.

? How would you test a feature with no documentation and a deadline tomorrow? | M
Talk to the developer and PO for 15 minutes to understand intent and risks, explore the feature with charters focusing on the main flow and money/data risks, test integration points, write down assumptions, and report clearly what was tested, what wasn't and open questions.

? How would you test a legacy system nobody understands? | H
Characterisation testing: record current behaviour for representative inputs (golden master) before changes, use production logs to find real usage, interview long-time users, add tests around areas being modified, and compare outputs before and after changes.

? How would you test a data migration? | H
Row counts per table, checksums or sampled record comparisons, field transformations, referential integrity, handling of nulls and special characters, performance of the migration window, rollback plan, and application smoke tests on migrated data.

# group: Behavioural
? Tell me about yourself (for a QA role) | E
Two minutes: current role and domain, the testing you own (manual, automation, API, performance), tools and languages, one or two measurable achievements ("cut regression from 3 days to 4 hours", "found a payment double-charge bug before release"), and why this role is the logical next step.

? Describe the most challenging bug you found | M
Use STAR: the situation (feature, environment), the task (why it mattered), the actions (how you investigated: logs, isolating variables, reproducing an intermittent race condition), and the result (impact prevented, fix, test added). Interviewers look for curiosity, method and persistence.

? Tell me about a time you disagreed with a developer | E
Describe a real case, show you focused on evidence and user impact, involved the PO when it was a requirement question, and kept the relationship good. End with what you learned (e.g. agreeing acceptance criteria earlier).

? How do you handle tight deadlines? | E
Prioritise by risk, communicate early, automate what repeats, parallelise with developers testing at the API level, de-scope low-risk areas transparently, and give the business a clear quality status so they can decide.

? Tell me about a time you improved a process | M
Example: introduced API tests in PR pipelines, reducing escaped defects; or added three amigos sessions, reducing requirement bugs. Quantify the before and after.

? Describe a time you made a mistake | M
Pick a real but recoverable mistake (missed a regression area, wrong environment), how you owned it quickly, fixed the impact and changed your process (checklist, automated check). Shows accountability and learning.

? How do you keep your skills up to date? | E
Courses and docs (Playwright, Rest Assured, Karate releases), community (Ministry of Testing, meetups, conferences), side projects on GitHub, reading engineering blogs, and experimenting with AI tools for testing. Mention something you learned recently and applied.

? How do you prioritise when everything is urgent? | E
Clarify business impact with the stakeholder, rank by risk and dependencies, make trade-offs visible, and agree on what is done first. Avoid silently working overtime on everything.

? How do you ensure quality when developers outnumber testers 8:1? | M | recent
Make quality a team responsibility: developers write unit and API tests, QA coaches and builds the framework, defines test strategy and acceptance criteria, pairs on risky stories, focuses on exploratory testing and automation of critical paths, and uses CI quality gates.

? Tell me about a time you had to learn a new tool quickly | E
Show a structured approach: official docs and examples, small proof of concept on your product, asking experts, then applying it to a real task and sharing what you learned with the team.

? What would you do in your first 30-60-90 days as a QA lead? | H | recent
30: learn the product, people, pipeline, defect history and pain points. 60: propose a test strategy, fix the biggest pain (flaky suite, missing API tests), set quality metrics. 90: deliver measurable improvement, mentor the team, align with engineering leadership on the roadmap.

? How do you mentor junior testers? | M
Pair testing, code reviews with explanations, small ownership areas, learning plans, encouraging questions, and giving feedback on bug reports and test design. Measure growth by their independence.

? A stakeholder wants 100% automation. How do you respond? | M
Explain that the goal is fast, reliable feedback on risk, not a percentage. Some testing (exploratory, usability, new features) is better manual, and some tests cost more to automate than they save. Propose targets based on critical flows and regression coverage with ROI.

? How do you report quality status to management? | E
Short, risk-focused updates: what's done, open critical/high defects, risks and their impact, test coverage of key features, trend of escaped defects, and a clear recommendation. Use dashboards for details.

? Tell me about a time you worked with a distributed team | E
Mention time zones, async communication (clear tickets, recorded demos), overlapping hours for handovers, shared dashboards, and how you avoided blocking each other.

? Describe a time you pushed back on a release | H
A situation where a critical risk was found late: you presented evidence (repro, impact, users affected), proposed options (fix, feature flag off, partial release), and let the business decide with full information. Show professionalism even if the release went ahead.

? What does quality mean to you? | E
Software that meets real user needs reliably, safely and pleasantly, delivered predictably. Quality is built by the whole team through practices, not inspected in at the end.

? Why are you leaving your current job (or why were you laid off)? | E | recent
Be brief, honest and forward-looking: "My role was part of a company-wide restructuring that affected X% of staff. I'm proud of what I delivered (example) and I'm looking for a team where I can grow in Y." Never criticise the old employer.

? How do you explain a career gap after a layoff? | E | recent
State it plainly and show how you used the time: upskilling (Playwright, API automation, AI testing), certifications, open-source or portfolio projects, freelancing, or family responsibilities. Interviewers in 2025–26 see many layoff-related gaps; confidence and current skills matter more than the gap.

? Why do you want to join our company? | E
Connect specific facts about the company (product, users, engineering blog, tech stack, growth) to your skills and goals. Generic praise is weak; a specific reason is strong.

? Where do you see yourself in five years? | E
A realistic growth path: senior SDET, QA lead, quality architect, or specialisation (performance, security, AI evaluation). Tie it to the company's needs.

? What are your strengths and weaknesses? | E
Strength with an example ("I'm good at finding root causes; for instance..."). Weakness that's real but being addressed ("I used to over-document test cases; now I use lightweight checklists and focus detail where risk is high").

? Salary expectation question: how do you answer? | M | recent
Research market ranges (levels, Glassdoor, AmbitionBox, peers), give a range based on role scope rather than your old salary, and say you're flexible depending on the total package. For laid-off candidates, don't discount yourself just because you need the job; anchor on market value.

? Do you have any questions for us? | E
Always ask: how is quality owned in the team, what does the test pipeline look like, what are the biggest quality challenges now, how is success measured in this role in six months, and how do testers and developers collaborate.

? How would you handle a team member who doesn't follow test standards? | M
Talk privately, understand why (unclear standard, time pressure, disagreement), explain the impact with examples, offer help, and if needed agree on changes to the standard. Escalate only if it continues and affects delivery.

? Tell me about a production incident you were involved in | M
Describe your role during the incident (reproducing, verifying fix, communication), the root cause, and the follow-up actions (new tests, monitoring, process changes). Blameless language matters.

# group: Layoffs and career
? What should a tester do in the first week after a layoff? | E | recent
Get documents in order (relieving letter, payslips, Form 16, PF transfer, experience letter), understand severance and notice pay, update LinkedIn (Open to Work) and resume, list target companies, ask former colleagues for referrals and recommendations, and set a daily routine of practice and applications.

? How do you make your resume stand out as an SDET? | E | recent
One or two pages, a summary aligned to the role, skills grouped (languages, UI, API, CI, cloud), achievements with numbers (suites built, time saved, defects caught), GitHub link to a sample framework, and keywords from the job description (Playwright, Rest Assured, Karate, Jenkins, Docker) so ATS filters find you.

? What portfolio project should a tester build? | M | recent
A public GitHub repo with a small but complete framework: UI tests (Playwright or Selenium + POM), API tests (Rest Assured or Karate) against a public demo API, CI with GitHub Actions, reports (Allure) published as artifacts, Docker support, and a clear README. It proves skills faster than a certificate.

? Manual tester to automation: a 90-day plan | M | recent
Weeks 1–4: core Java or Python, Git, basics of OOP and collections. Weeks 5–8: Selenium or Playwright with POM, TestNG/pytest, one small project. Weeks 9–10: API testing with Postman then Rest Assured or Karate. Weeks 11–12: CI with GitHub Actions, reporting, Docker basics, interview practice. Build in public on GitHub throughout.

? Which certifications help a tester? | E | recent
ISTQB Foundation (common requirement in service companies), ISTQB Advanced Test Automation Engineer, cloud fundamentals (AWS/Azure), and vendor courses. Certifications help with screening; projects and interview performance get offers.

? How do you use LinkedIn effectively during a job search? | E | recent
Clear headline ("SDET | Playwright, Rest Assured, Karate | API & CI/CD"), Open to Work for recruiters, regular posts about what you're learning or building, engaging with QA community posts, and direct messages to hiring managers with a short note and your GitHub link.

? How do you prepare for a live coding round as an SDET? | E | recent
Practise the string/array/collection problems in this guide in Java (or your language) without an IDE, explain your approach before coding, handle edge cases, state complexity, write a quick test, and practise a small automation exercise (login test, API test) under time pressure.

? How do you negotiate an offer after a layoff? | M | recent
Get the offer in writing, understand the full package (fixed, variable, joining bonus, ESOPs, insurance, leave), use competing offers or market data respectfully, ask for a joining bonus to compensate for lost benefits, and confirm notice-period expectations (you may be able to join immediately, which is an advantage).

? Product company vs service company interviews | E | recent
Service companies focus on fundamentals, tools and project explanation. Product companies expect stronger coding (data structures), framework design, API and CI depth, debugging stories and system thinking. Prepare accordingly.

? How do you explain your project in an interview? | E
Domain and users, architecture at a high level, your team and role, what you tested and how (types, tools, framework), challenges and how you solved them, and measurable outcomes. Prepare a framework diagram you can draw.

# group: Recent interview topics
? How would you test a GenAI chatbot on a banking website? | H | recent
Correctness against policy documents (rates, fees), refusal of unsupported advice, no hallucinated numbers, escalation to a human, authentication before account data, no data leakage across customers, prompt injection resistance, multilingual support (English, Hindi), audit logging, latency, and compliance with RBI guidelines on customer communication.

? How would you test a UPI AutoPay mandate feature? | H | recent
Mandate creation and approval in the UPI app, amount and frequency limits, pre-debit notifications (24 hours before), execution on schedule, failure and retry, pause/revoke by the customer, mandate modification, expiry, and reconciliation with the merchant.

? How would you test a feature behind a feature flag rollout? | M | recent
Test with the flag on and off, at percentage rollouts, for targeted segments, flag removal later, interactions with other flags, default behaviour if the flag service is down, and monitoring metrics per variant.

? How would you test a microservice that calls three others? | M | recent
Unit and component tests with dependencies mocked, contract tests for each dependency, failure-path tests (timeouts, 5xx, slow responses) with WireMock or Toxiproxy, a few integration tests in a shared environment, and observability checks (traces, logs, metrics).

? How would you test a mobile app's offline mode? | M | recent
Actions while offline are queued and synced later, conflict resolution when data changed on the server, clear offline indicators, cached data freshness, behaviour on flaky networks (switching Wi-Fi/mobile data), and no data loss on app kill.

# group: Hard concepts
? The STAR method done well | M | concept
**Situation**: one or two sentences of context. **Task**: your responsibility. **Action**: most of the answer, with specific steps *you* took (not "we"). **Result**: measurable outcome and what you learned. Prepare 6–8 stories covering a hard bug, conflict, failure, leadership, process improvement and tight deadline; most behavioural questions map to one of them.

? How to structure any "how would you test X" answer | M | concept
1. Clarify: users, platform, requirements, constraints.
2. Identify risks: what would hurt users or the business most.
3. Cover categories: functional (positive, negative, boundary), integration, UI/UX, performance, security, accessibility, compatibility, localisation, recovery.
4. Prioritise: what you'd test first and what you'd automate.
5. Mention test data, environments and how you'd know you're done.

Interviewers grade structure and risk thinking more than the number of cases.

? Risk-based prioritisation as a matrix | H | concept
Score each feature or area on likelihood of failure (complexity, change size, defect history, new technology) and impact (money, data, legal, number of users, reputation) from 1–5. Multiply to get a risk score, then test high-risk areas first and deepest, automate their regression, and accept lighter coverage for low-risk ones. Share the matrix with stakeholders so the trade-offs are agreed, not hidden.

? Exploratory testing done professionally | H | concept
Use session-based test management: a charter (mission and scope), a time box (60–90 minutes), notes of what was tested, bugs, questions and coverage, and a short debrief. Apply heuristics like SFDIPOT (Structure, Function, Data, Interfaces, Platform, Operations, Time) and tours (money tour, back-alley tour). It turns "random clicking" into a repeatable, reportable activity.

? Communicating quality risk to non-technical stakeholders | H | concept
Translate test results into business impact: "If we release today, about 2% of UPI payments may fail on Android 11, which is roughly 4,000 orders a day; a fix takes one day." Offer options with trade-offs, recommend one, and document the decision. Avoid jargon and raw defect counts.

# group: How would you test...
? How would you test a login page with SSO (Google/Microsoft)? | M | recent
Redirect to the identity provider and back, first-time account creation vs linking to an existing account, denied consent, expired IdP session, account disabled in the IdP, multiple tenants, logout (local vs single logout), token expiry and refresh, and behaviour when the IdP is down.

? How would you test an e-commerce product listing page? | E
Product cards (image, name, price, rating), filters and sort, pagination or infinite scroll, out-of-stock badges, price formatting (₹ and lakh/crore grouping), image lazy loading, empty category, SEO metadata, accessibility and performance on mobile.

? How would you test a calculator app? | E
Basic operations, order of precedence, decimals and rounding, division by zero, very large and very small numbers, negative numbers, repeated operations, clear vs clear-entry, keyboard input, memory functions, and display overflow.

? How would you test a lift with a weight limit sensor? | E
Below, at and above the limit (alarm and doors stay open), sensor calibration, behaviour when weight is removed, interaction with emergency stop and door sensors, and false alarms.

? How would you test a parking lot management system? | M
Entry/exit gates, ticket or FASTag/ANPR recognition, slot availability count, fee calculation for durations across midnight and days, lost ticket, payment methods, reserved slots, power failure, and reports.

? How would you test an online exam system? | H
Login and identity checks, timer accuracy and auto-submit, autosave on network loss, question randomisation, navigation and review, browser lockdown/proctoring, concurrency at exam start (thousands at once), result calculation, and accessibility accommodations (extra time).

? How would you test a hotel booking system? | M
Search by dates and guests, availability across overlapping bookings, double booking under concurrency, pricing (weekend rates, taxes, discounts), cancellation policies and refunds, check-in/out times, time zones, payment holds, and confirmation emails.

? How would you test a social media "like" button? | E
Like/unlike toggling, count updates, double-tap and rapid clicks (no double count), offline like syncing, notifications to the author, privacy (who can see likes), and performance on viral posts with huge counts.

? How would you test a cookie consent banner? | M | recent
Banner appears on first visit, choices persist, rejecting really blocks non-essential cookies and trackers (verify in devtools/network), changing preferences later, regional rules (GDPR vs others), keyboard and screen reader access, and no layout covering content on mobile.

? How would you test an invoice PDF generation feature? | M
Correct data and totals, tax breakdown (GST: CGST/SGST/IGST by state), number and date formats, multi-page invoices, long item names, logos and fonts, Unicode text, file name, download and email delivery, and regeneration consistency.

? How would you test a password strength meter? | E
Each rule individually, boundary lengths, common passwords flagged as weak, Unicode and spaces, real-time updates as you type, paste, accessibility of the strength announcement, and consistency with server-side validation.

? How would you test a "dark mode" toggle? | E
All screens and components switch correctly, contrast meets WCAG in both themes, images and icons remain visible, preference persists, follows system setting by default, no flash of the wrong theme on load, and embedded content (charts, maps) adapts.

? How would you test an inventory sync between a website and a warehouse system? | H
Stock updates propagate within the expected time, concurrent orders on the last unit, partial failures and retries, duplicate events, reconciliation reports, manual adjustments, and behaviour when the warehouse system is down (orders queued or blocked).

# group: Behavioural
? Describe a time you automated something that wasn't a test | M
Examples: a script to generate test data, a tool to compare environment configs, a Slack bot for test results, or log parsing to spot errors after deploys. Shows initiative and engineering mindset.

? How do you deal with a flaky test that blocks everyone? | M
Quarantine it immediately with a ticket and owner so the pipeline is trusted again, investigate with traces and logs, fix the root cause, and return it to the main suite. Communicate in the team channel so nobody wastes time re-running.

? How do you handle a requirement that changes mid-sprint? | E
Assess impact on tests and timelines quickly, update acceptance criteria with the PO, re-prioritise test work, and flag risk if the sprint goal is threatened. Agile expects change; transparency is what matters.

? What is the best feedback you've received and how did you act on it? | E
Share specific feedback (e.g. "your bug reports need clearer impact"), what you changed, and the result. Shows coachability.
