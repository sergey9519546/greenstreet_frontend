# DSCR LENDER 90-DAY LAUNCH PLAN
## From Zero to Pipeline: The Exact Execution Playbook

**Date:** March 2026  
**Classification:** OPERATIONAL — Day-by-Day Execution Plan  
**Objective:** Go from zero borrowers, zero brokers, zero brand → a pipeline of 300 DSCR loan applications and 8–12 closed loans in 90 days  
**Approach:** No theory. No strategy fluff. Specific actions, specific numbers, specific targets — every single day.

---

## PRE-LAUNCH (Days -30 to 0): "Build the Cockpit"

You cannot launch a lending company on Day 1 without infrastructure. Borrowers who hit a broken website, a missing rate sheet, or an application that doesn't work will never come back. The 30 days before launch are about building the minimum viable machine — everything required to take a borrower from first contact to funded loan, and nothing more.

### Website: Required Pages

Your website is not a marketing site — it's a conversion machine. Every page exists to move a visitor toward one of two actions: **Apply Now** or **Submit a Deal** (for brokers). Nothing else matters at launch.

| Page | Purpose | Must Include | Deadline |
|------|---------|-------------|----------|
| **Homepage** | 5-second pitch + CTA | DSCR value prop ("Your rental qualifies itself"), rate teaser, Apply Now button above fold, broker portal link | Day -28 |
| **DSCR Loan Program** | Product detail | Rate ranges by LTV/DSCR tier, min FICO, max LTV, property types, prepay options, closing timeline, document checklist | Day -28 |
| **DSCR Calculator** | Lead capture tool | Rent input → DSCR ratio output → estimated rate range → "Get My Exact Rate" CTA (captures email/phone) | Day -25 |
| **Apply Now** | Borrower application | 3-step form: Property info → Loan request → Contact info. Soft pull only. Save-and-resume enabled. | Day -25 |
| **Broker Portal** | Broker submissions | Registration (NMLS # required), scenario submission form, rate sheet download, commission structure, document upload | Day -25 |
| **About / Trust** | Credibility | NMLS number, state licenses, team bios (even if 2 people), lending partner/capital source (if disclosable), SOC 2 or security statement | Day -22 |
| **Rates** | Pricing transparency | Interactive rate table (LTV × DSCR × FICO), origination fee disclosure, prepay penalty options, no hidden costs | Day -22 |
| **FAQ** | Objection removal | 15–20 DSCR questions with structured answers, targets featured snippets | Day -20 |
| **Contact** | Response channel | Phone, email, chat widget (even if you forward to your cell), office address | Day -20 |
| **Privacy / Terms** | Legal requirement | GLBA privacy notice, terms of use, licensing disclosures, equal housing lender logo | Day -18 |

**The DSCR Calculator is your #1 acquisition asset.** Build it to be the best in market: input rent, taxes, insurance, HOA → output DSCR ratio, tier classification, estimated rate range, monthly cash flow, and LTV cap. Every calculation should end with a "Get My Exact Rate" capture form. Model it after DSCR Authority's tool but add what they lack: multi-property portfolio view, sensitivity analysis (rent ±10%), and STR income toggle. This single page should generate 30–50% of your inbound leads by Month 3.

### Loan Application Portal (Minimum Viable)

Do NOT overbuild. Your application portal needs exactly this:

- **Borrower path:** Property address → estimated rent (auto-pull from RentCast API or manual entry) → loan amount → property type → entity info → personal guarantor info → document upload → soft credit pull consent → submission
- **Broker path:** Broker registration (NMLS #, company, email) → scenario form (property, rent, loan request, borrower FICO) → same document flow
- **Status tracking:** Simple pipeline view — Submitted → In Review → Conditionally Approved → Conditions Due → Clear to Close → Closing → Funded
- **Notifications:** Email at every status change. This is non-negotiable — silence kills trust.
- **Tech stack:** Use an existing LOS (Encompass, LendingPad, or Byte Pro) rather than building custom. LendingPad is cheapest for startups at ~$500–$1,500/month. Integrate with your website via API or iframe.
- **Deadline:** Functional by Day -14, tested by Day -7

### Broker Submission Portal (Minimum Viable)

- Registration form: NMLS #, company name, phone, email, state(s) licensed
- Scenario submission: property address, purchase price or current value, estimated rent, requested loan amount, FICO, property type, loan purpose (purchase/refi/cash-out)
- Rate sheet auto-response: upon registration, broker gets an email with current rate sheet + commission structure + AE contact info
- Document upload: same as borrower portal
- **Deadline:** Day -14

### Email System Setup

- **Platform:** HubSpot (free tier to start, $45/month for automation) or ActiveCampaign ($49/month). Do NOT use Gmail for business.
- **Domain authentication:** Set up SPF, DKIM, and DMARC records on your domain. Without these, 40%+ of your emails land in spam.
- **Email sequences to build before launch:**
  1. **Welcome — Borrower** (5 emails over 14 days): Application received → Here's what happens next → Documents needed → DSCR calculator link → FAQ
  2. **Welcome — Broker** (4 emails over 10 days): Registration confirmed → Rate sheet + commission → How to submit a scenario → First-deal bonus offer
  3. **Application Abandoned** (3 emails over 7 days): Come back → We saved your progress → Here's a rate quote
  4. **Post-Close** (5 emails over 60 days): Thank you → Referral ask → Google review request → Next deal pre-approval → Portfolio analysis offer
- **Signature:** Name, title, NMLS #, phone, cell, company NMLS #, equal housing logo
- **Deadline:** Day -14

### CRM Setup

- **Platform:** HubSpot CRM (free) or Pipedrive ($14/user/month). HubSpot is better for marketing automation; Pipedrive is better for pipeline management. Either works at launch.
- **Pipeline stages:** New Lead → Application Started → Application Submitted → In Underwriting → Conditionally Approved → Conditions Submitted → Clear to Close → In Closing → Funded → Post-Close
- **Custom fields:** Source channel, broker name (if applicable), property address, property type, estimated rent, DSCR ratio, loan amount, rate, LTV, FICO, closing date
- **Automations:** New lead → assign to loan officer → send welcome email → create follow-up task (24 hours). Status change → send borrower notification email → update pipeline.
- **Deadline:** Day -14

### Social Media Profiles

| Platform | Handle Strategy | Profile Setup | First Content | Purpose |
|----------|----------------|---------------|---------------|---------|
| **LinkedIn** | Company page + personal profiles for founders | Company description, logo, NMLS #, link to website | "We're live — DSCR lending done right" post | Broker recruitment, credibility |
| **Facebook** | Company page + join 10+ non-QM/investor groups | Cover photo with value prop, link to calculator | Rate sheet post, calculator link | Borrower leads, broker networking |
| **Instagram** | Company account | Professional logo, link in bio to calculator | DSCR tip carousel, rate update graphic | Brand awareness, younger investors |
| **YouTube** | Company channel | Channel art, "DSCR Loan Explained in 5 Minutes" as first video | 1 educational video/week | SEO, trust building |
| **X (Twitter)** | Company + founder accounts | Bio with NMLS, link to website | Rate updates, market commentary | Industry presence, SEO |

**Group memberships to join on Day -7 (Facebook):**
- Non-QM Wholesale Lending (3,000+ members)
- DSCR Lenders & Brokers (1,500+ members)
- Mortgage Broker Community (5,000+ members)
- Real Estate Investors Nationwide (10,000+ members)
- BiggerPockets Community (15,000+ members)
- Hard Money & Private Lending (4,000+ members)
- Rental Property Investors (8,000+ members)

**Deadline:** Day -7

### Licensing Confirmation

- Verify NMLS registration is active for company and all MLOs
- Confirm state licenses in your target launch states (minimum: TX, FL, GA, AZ, NC, TN, OH — these represent ~50% of DSCR volume)
- Post licensing table on website with NMLS Consumer Access links
- Ensure surety bond and net worth requirements are met in each state
- **Deadline:** Day -21 (this blocks everything if not done)

### Rate Sheet Finalized

Your rate sheet is your #1 sales document. It must be:

- **One page, front and back** maximum
- **Transparent:** Show rate, origination, prepay options for every LTV/DSCR/FICO tier
- **Competitive:** Price at or slightly below Kiavi/Visio/Lima One on at least one tier (lose money on the first deals if necessary — you're buying testimonials and pipeline)
- **Format:** PDF + Excel + web interactive version
- **Commission section:** 100 bps lender-paid wholesale (market standard). Do NOT go below 100 bps — brokers won't take you seriously.
- **Special launch offer:** "First deal bonus" — 25 bps pricing improvement on first submission, or $500 broker bonus on first closed loan
- **Deadline:** Day -14

### Marketing Materials

| Item | Specs | Quantity | Cost | Deadline |
|------|-------|----------|------|----------|
| **Business cards** | Standard 3.5×2, both sides — front: name/title/phone/email/NMLS; back: "Your rental qualifies itself" + QR to calculator | 1,000 | $50–$100 | Day -10 |
| **One-pager (borrower)** | DSCR loan overview: what it is, who qualifies, rate range, 5-step process, apply QR code | 500 printed + PDF | $100–$200 | Day -10 |
| **One-pager (broker)** | Commission structure, rate sheet summary, submission process, AE contact, first-deal bonus | 500 printed + PDF | $100–$200 | Day -10 |
| **Rate sheet** | As described above | PDF + printed | $50–$100 | Day -10 |
| **Pull-up banner** | For REIA meetings and events: company name, value prop, QR code | 1 | $100–$200 | Day -7 |
| **Branded polo shirts** | For in-person events | 3–5 | $75–$150 | Day -7 |

### Pre-Launch Checklist: EVERYTHING That Must Be Ready Before Day 1

```
□ Website live and tested on mobile + desktop
□ DSCR calculator functional with lead capture
□ Application portal accepting submissions (test with 3 dummy applications)
□ Broker portal accepting registrations (test with 2 dummy brokers)
□ Email sequences loaded and tested
□ CRM configured with pipeline stages and automations
□ Phone system operational (ring to cell if no office)
□ All social media profiles live with first content posted
□ NMLS and state licenses confirmed active
□ Rate sheet finalized and approved (legal/compliance sign-off)
□ Rate sheet PDF, Excel, and web version all match
□ Business cards ordered and received
□ One-pagers printed (borrower + broker versions)
□ Pull-up banner received
□ Los/underwriting system operational
□ Capital/warehouse line confirmed (you CAN fund loans)
□ Appraisal management company selected
□ Title company partners identified in target states
□ Insurance requirements documented
□ Closing attorney/notary contacts in target states
□ First 50 broker targets identified (name, company, phone, email, NMLS)
□ First 20 personal contacts identified (anyone you know who owns rental property)
□ First 5 REIA meetings scheduled for Week 1
□ Google Ads campaign built (paused, ready to activate)
□ Facebook Ads campaign built (paused, ready to activate)
□ Soft credit pull vendor integrated (no hard pulls until borrower is committed)
□ Document checklist published on website
□ Compliance review of all marketing materials complete
□ "First deal bonus" offer approved and documented
□ Daily task tracker created (spreadsheet or Notion)
□ Metric tracking dashboard built (see Section 10)
```

**Total pre-launch technology cost:** $1,500–$4,000 (depending on LOS choice and CRM tier)  
**Total pre-launch marketing materials cost:** $500–$1,000  
**Total pre-launch time investment:** 200–300 hours over 30 days (founder + 1 hire or contractor)

---

## WEEK 1 (Days 1–7): "Get the First 5 Applications"

**Target:** 5 loan applications by end of Day 7  
**Strategy:** Activate every personal and professional contact. This is NOT about marketing — it's about picking the lowest-hanging fruit. You need applications, not impressions.

### Day 1: "Tell Everyone You Exist"

**Morning (8 AM – 12 PM):**
- Post launch announcement on LinkedIn (personal + company page): "After [X months] of building, we're live. [Company Name] is now funding DSCR investment property loans in [states]. Competitive rates, fast closings, and your rental income does the qualifying. Check out our calculator at [URL]."
- Send personal text messages to 20 people you know who own rental property or work in real estate: "Hey — just launched my DSCR lending company. If you or anyone you know finances investment properties, I'd love to help. Here's our calculator: [link]"
- Email 50 personal/professional contacts with a brief "we're live" message + link to calculator + one-pager PDF attached
- Post in 3 Facebook non-QM/investor groups: "New DSCR lender launching today. 100 bps wholesale, same-day scenario pricing. DM me for rate sheet." (Check group rules first — some prohibit self-promotion on first post)

**Afternoon (1 PM – 5 PM):**
- Cold-call 15 mortgage brokers from your target list of 50. Script: "Hey [Name], I'm [Your Name] with [Company]. We just launched our DSCR wholesale program — 100 bps lender-paid, same-day scenario pricing, and I'm offering a first-deal bonus of $500 for new broker partners. Can I email you our rate sheet?" **Goal: 3–5 brokers agree to receive rate sheet.**
- Email rate sheet + broker one-pager to every broker who said yes, within 30 minutes of the call.
- Set up Google Ads campaign: Launch with $100/day budget. Campaign structure: 2 ad groups — "DSCR loan" head terms (40% budget) and long-tail high-intent terms like "DSCR loan for LLC," "no doc investment property loan" (60% budget). Landing page: DSCR calculator. **Do NOT send traffic to homepage.**
- Set up Facebook Ads campaign: Launch with $50/day. Single ad set targeting real estate investing interest + homeowners + age 28–65. Creative: calculator screenshot with "What's your DSCR? Find out in 30 seconds." **Landing page: calculator.**

**Evening (6 PM – 9 PM):**
- Attend local REIA meeting. Bring 50 business cards, 25 one-pagers, pull-up banner if space allows. **Goal: have 10 conversations, collect 5 business cards, mention DSCR to every person you meet.**
- Post REIA photo on LinkedIn + Instagram: "Great turnout at [REIA name] tonight. If you're an investor looking for DSCR financing, let's talk."

**Day 1 Targets:** 3 warm-lead applications from personal network, 1 from ads, 1 from REIA = 5 by end of week if momentum holds.

### Day 2: "Broker Blitz"

**Morning:**
- Cold-call 20 more mortgage brokers. Same script. **Goal: 4–6 brokers agree to receive rate sheet.**
- Follow up with yesterday's brokers who received the rate sheet — ask if they have any scenarios to run. **Offer same-day pricing on any scenario.**
- Check Google/Facebook ad performance. Kill any ad with CTR below 0.5%. Double budget on any ad with CTR above 1.5%.
- Post in BiggerPockets forums: Answer 3 existing DSCR-related questions with helpful, detailed answers. Include your company in your forum signature only — do NOT self-promote in the post body.

**Afternoon:**
- LinkedIn outreach: Send 25 connection requests to mortgage brokers + loan officers in target states (use Sales Navigator if available, otherwise manual search). Personalized note: "Hi [Name] — I run DSCR wholesale lending at [Company]. Would love to connect and share our rate sheet."
- Email follow-up sequence to yesterday's personal contacts who haven't responded: "Just following up — our DSCR calculator is getting great feedback. If you know any investors looking for financing, I'd appreciate the intro: [link]"
- Call every warm referral from yesterday's REIA meeting. "Great meeting you last night — let me run a quick scenario on that property you mentioned."

**Evening:**
- Create and post first Instagram carousel: "5 Things Most Investors Don't Know About DSCR Loans" — 6 slides, each with one fact.
- Record first YouTube short (60 seconds): "What is a DSCR loan? Your rental property qualifies itself for financing — no W-2 needed."

### Day 3: "Calculator Push"

**Morning:**
- Post the DSCR calculator in every Facebook group you've joined: "Free DSCR calculator — enter your rent, taxes, and insurance to see your DSCR ratio and estimated rate in 30 seconds: [link]"
- Run a $20 boosted Facebook post of the calculator to real estate investing audience
- Cold-call 15 more brokers. By now you should have 8–12 who've received your rate sheet. **Call the 8–12 and ask for a scenario. Offer to price it while they wait.**
- Check ad performance. By Day 3 you should have: Google Ads = 10–30 clicks, 1–3 calculator submissions. Facebook = 15–40 clicks, 2–5 calculator submissions.

**Afternoon:**
- Reddit: Answer 5 DSCR/REI financing questions in r/realestateinvesting and r/Realestatefinance. Be genuinely helpful. Mention your calculator only if someone asks for a tool recommendation.
- Call every calculator submission from Days 1–2 that hasn't converted to a full application. Script: "Hi [Name], I saw you used our DSCR calculator — looks like your property could qualify for [rate range]. Want me to run an official scenario for you? Takes 5 minutes."
- Email all broker contacts with a "DSCR Market Rate Update" — current rates + a scenario they can price today.

**Evening:**
- Attend a second REIA or real estate meetup (different group than Day 1). Same playbook: conversations, business cards, one-pagers.
- Post a "Day 3 Update" on LinkedIn: "3 days live and we've already received [X] applications. The DSCR market is hungry for better service."

### Day 4: "The Follow-Up Day"

**Morning:**
- Call every person who started but didn't finish an application. There will be more of these than completed ones. Common objection: "I need to gather documents." Response: "No problem — let's just get the property info in now and we'll collect documents later. I can give you conditional pricing today."
- Call every broker who has your rate sheet but hasn't submitted. Ask: "Do you have any investor clients who've been turned down by conventional lenders? That's our sweet spot."
- Send personalized LinkedIn messages to 25 more brokers.

**Afternoon:**
- Review all active applications. Are any missing information? Call the borrower directly. Speed kills — the faster you move, the more likely the deal closes.
- If you have a scenario from a broker, **price it within 2 hours.** This is your #1 differentiator. Most DSCR lenders take 24–48 hours. Same-day pricing wins broker loyalty.
- Post in BiggerPockets: Answer 3 more questions. Start a thread: "What's your biggest frustration with DSCR lenders?" — this is market research AND lead generation.

**Evening:**
- Email your personal network again: "Quick update — we've had [X] applications this week. If you're sitting on the fence, our launch pricing is good through [date]. Here's the calculator: [link]"
- Create second Instagram carousel: "DSCR vs. Conventional Loan — Which Wins for Investors?"

### Day 5: "Close the Week Strong"

**Morning:**
- Call every lead in your CRM who hasn't applied. Give them a reason to apply NOW: "Our underwriter is reviewing files this afternoon — if you apply by 2 PM, I can get you an answer by Monday."
- Call every broker and ask for one more scenario. "I need one more file to hit my weekly target — bring me your toughest DSCR deal and I'll price it same-day."
- Check weekly ad spend: you should have spent ~$750 (5 days × $150/day). You should have 10–20 calculator submissions and 2–5 applications from ads.

**Afternoon:**
- Post in Facebook groups: "Weekly DSCR rate update — rates moved [up/down] [X] bps this week. Check your deal: [calculator link]"
- Review all broker conversations from the week. Who was most interested? Call them first thing Monday.
- Send a "Week 1 Summary" email to all brokers on your list: "Here's what we closed / priced / funded this week. Send me your next scenario."

**Evening:**
- If you're at 4 applications, make 10 more calls to warm contacts. You WILL hit 5.
- Post on LinkedIn: "Week 1 done. [X] applications, [Y] brokers registered, [Z] scenarios priced. The DSCR market is ready for a better lender."

### Days 6–7: "Weekend Blitz + Reset"

**Saturday:**
- Attend a Saturday REIA or real estate networking event. Saturdays are prime for investor meetups.
- Call any warm leads who prefer weekend conversations.
- Post a weekend calculator test on Facebook/Instagram: "Saturday deal analysis — what does a $250K rental in Dallas look like on a DSCR loan? I ran the numbers: [screenshot of calculator output]. Run your deal: [link]"

**Sunday:**
- Build Week 2 plan. Review what worked and what didn't.
- Prepare Monday's broker outreach list — 25 new brokers to call.
- Write one blog post: "What Is a DSCR Loan? The Complete Guide for Real Estate Investors" — 2,000+ words targeting the "what is a DSCR loan" keyword (5,400–8,200 monthly searches). Publish Monday morning.
- Rest. You'll need it.

### Week 1 Scorecard

| Metric | Target | How You'll Get It |
|--------|--------|-------------------|
| Applications | 5 | Personal network (2–3), ads (1–2), REIA (1) |
| Calculator submissions | 15–25 | Ads (10–15), social posts (5–10) |
| Brokers registered | 10–15 | Cold calls (5–8), LinkedIn (3–5), Facebook groups (2–3) |
| Scenarios priced | 8–12 | Brokers calling with deals |
| Ad spend | $750–$900 | Google ($500), Facebook ($250–$400) |
| Phone calls made | 100+ | 50 broker calls, 30 follow-ups, 20 warm contacts |
| REIA meetings attended | 2–3 | In-person, bring materials |
| Social media posts | 10–15 | Across all platforms |

---

## WEEK 2 (Days 8–14): "Scale to 15 Applications"

**Cumulative Target:** 15 applications (10 net new)  
**Strategy:** Double down on what's working. Add broker outbound at scale. Launch first content pieces. Start building the flywheel.

### What to Continue from Week 1

- **Daily broker cold calls:** Increase from 15–20/day to 25–30/day
- **Google Ads:** Increase daily budget to $150/day if Week 1 CPA is under $300/app
- **Facebook Ads:** Increase to $75/day if generating leads
- **REIA attendance:** 2 events this week (different groups)
- **BiggerPockets forum activity:** Answer 3 questions/day
- **Same-day scenario pricing:** This is your kill shot — never let it slip

### What to Add in Week 2

- **Broker outreach at scale:** Use LinkedIn Sales Navigator to build a list of 200 DSCR-active brokers. Message 25/day with a personalized note.
- **Email nurture campaigns:** Launch the automated sequences you built in pre-launch.
- **Blog content:** Publish 2 blog posts this week targeting high-volume keywords:
  - "DSCR Loan Requirements 2026" (2,400–3,600 monthly searches)
  - "DSCR vs Conventional Loan for Investment Property" (1,600–2,600 monthly searches)
- **Direct mail:** Send 500 postcards to absentee property owners in your top market. Cost: ~$500. Offer: "Your rental property could qualify for a DSCR loan — no personal income needed. Scan QR to check your rate."
- **YouTube video:** Publish "DSCR Loan Explained in 5 Minutes" — your first owned video content.

### Broker Outreach Cadence

| Day | New Broker Calls | LinkedIn Messages | Email Follow-Ups | Scenario Requests |
|-----|-----------------|-------------------|------------------|-------------------|
| Day 8 | 25 | 25 | 10 (from Week 1) | 5 |
| Day 9 | 25 | 25 | 10 | 5 |
| Day 10 | 25 | 25 | 10 | 5 |
| Day 11 | 25 | 25 | 10 | 5 |
| Day 12 | 25 | 25 | 10 | 5 |
| Day 13 | 15 (Saturday) | 0 | 5 | 3 |
| Day 14 | Reset day | 0 | 10 | 5 |

**Broker call script refinement:** After 100+ calls, you know the objections. Adjust your script:
- "I don't need another lender" → "I understand — but I'd love to earn the next deal your current lender can't do. What's the toughest scenario you've had declined recently?"
- "I've never heard of you" → "That's fair — we just launched. Which is exactly why I'm offering same-day pricing and a $500 first-deal bonus. Let me prove myself on one file."
- "Send me your rate sheet and I'll keep it on file" → "Absolutely — but rate sheets go in folders. Can I price a live scenario for you right now while you're on the phone? Even if you don't submit, you'll know what's possible."

### Online Community Posting Schedule

| Day | Platform | Action | Content |
|-----|----------|--------|---------|
| Day 8 | BiggerPockets | Answer 3 questions | DSCR qualification, rental income, no-doc loans |
| Day 8 | Reddit | Answer 2 questions in r/realestateinvesting | Helpful, no self-promotion |
| Day 9 | Facebook groups | Post rate update | "DSCR rates this week: [range]. Run your deal: [link]" |
| Day 9 | BiggerPockets | Answer 3 questions | Focus on financing section |
| Day 10 | LinkedIn | Post article/commentary | "Why DSCR lenders are losing broker trust — and how we're fixing it" |
| Day 10 | Reddit | Answer 2 questions | r/Realestatefinance, r/landlord |
| Day 11 | BiggerPockets | Answer 3 questions | |
| Day 11 | Facebook groups | Share calculator with context | "I built this DSCR calculator — try it and tell me what you think: [link]" |
| Day 12 | LinkedIn | Share blog post | "DSCR Loan Requirements 2026" |
| Day 12 | BiggerPockets | Start discussion | "What's your biggest frustration with DSCR lenders?" |
| Day 13 | All platforms | Weekend recap post | "Week 2 update: [X] applications, [Y] brokers, [Z] priced" |

### First Google/Facebook Ad Optimization

**Google Ads (Budget: $150/day = $1,050/week):**

By Day 10, you have enough data to optimize:

- **Kill keywords** with >100 clicks and <1% conversion rate (calculator submission)
- **Double spend** on keywords converting above 3%
- **Add negative keywords:** "free," "grants," "FHA," "VA," "first time home buyer" — these drain budget with zero intent
- **Test 2 new ad copies:** Lead with rate transparency ("See DSCR rates by LTV, DSCR, and FICO — no surprises") and speed ("Same-day DSCR pricing — get your answer before your current lender returns your call")
- **Add landing page variants:** Test calculator page vs. "Apply Now" page vs. rate table page

**Facebook Ads (Budget: $75/day = $525/week):**

- **Kill any ad** with cost per lead >$50
- **Test 3 creative formats:** calculator screenshot, testimonial-style quote, carousel of DSCR benefits
- **Add retargeting:** Create a retargeting audience of website visitors who didn't apply. Show them a "Still thinking about DSCR? Here's a rate quote" ad with a direct link to the calculator.
- **Lookalike audience:** If you have 25+ calculator submissions, create a 1% lookalike audience

### Week 2 Scorecard

| Metric | Target | Cumulative |
|--------|--------|------------|
| Applications | 10 net new | 15 cumulative |
| Calculator submissions | 20–30 net new | 35–55 cumulative |
| Brokers registered | 10–15 net new | 20–30 cumulative |
| Scenarios priced | 15–20 | 23–32 cumulative |
| Blog posts published | 2 | 2 |
| YouTube videos | 1 | 1 |
| Ad spend | $1,575 | $2,325 cumulative |
| Direct mail spend | $500 | $500 cumulative |

---

## WEEK 3 (Days 15–21): "Build the Pipeline"

**Cumulative Target:** 30 applications (15 net new)  
**Strategy:** Identify your top 3 channels. First broker-submitted deal. Content engine starts producing.

### What's Working — Double Down

By Day 15, review your data:

| Channel | Applications | Cost per App | Conversion Rate | Verdict |
|---------|-------------|-------------|-----------------|---------|
| Personal network | [X] | $0 | 15–25% | MAXIMIZE — call every contact again |
| Google Ads | [X] | $150–$400 | 2–5% | SCALE if CPA <$300 |
| Facebook Ads | [X] | $200–$500 | 1–3% | OPTIMIZE or CUT |
| Broker cold calls | [X] | $50–$100 | 5–15% | SCALE — this is your best channel |
| REIA meetings | [X] | $100–$300 | 10–20% | SCALE — attend 3 this week |
| BiggerPockets | [X] | $0 (time) | 3–8% | CONTINUE — compounding returns |
| Direct mail | [X] | $200–$600 | 1–2% | WAIT — give it 2 more weeks |

**Rule of thumb:** If a channel produced applications at <$300/app, double spend/effort. If >$500/app, cut or pause.

### What's Not Working — Stop or Fix

- **Facebook Ads not converting?** Switch from lead-gen ads to calculator-traffic ads. Lead-gen forms on Facebook attract low-quality leads; calculator users are higher intent.
- **Broker calls not converting?** You may be calling the wrong brokers. Target brokers who specifically list "non-QM" or "DSCR" in their NMLS profile or LinkedIn.
- **No applications from BiggerPockets?** You're probably self-promoting too much. Answer 10 questions for every 1 time you mention your company. Build reputation first.

### Adding Channels

**Title company outreach (Days 15–17):**
- Call 15 title companies in your top 3 markets. Ask for the commercial/investment division. Script: "I'm a DSCR lender — we fund investment property loans based on rental income. I'd love to be a resource for your investor clients who need financing. Can I send you our one-pager?"
- **Goal:** 3–5 title company relationships. Each can refer 2–5 deals/month.

**Hard money lender partnerships (Days 18–19):**
- Find 10 local hard money lenders. They fund fix-and-flip loans. When their borrowers finish rehabbing and need to refinance into long-term debt — that's a DSCR loan.
- Script: "Your borrowers are finishing rehabs and need takeout financing. We fund DSCR refis at [rate range], and we close in [timeline]. Send us your refi pipeline — we'll pay you a referral fee on every closed loan."
- **Goal:** 2–3 hard money referral partnerships.

**Property management company outreach (Days 20–21):**
- Property managers know EVERY investor with a rental. They collect the rent. They know the cash flow.
- Call 20 property management companies. Offer to be their "preferred DSCR lender" — co-branded materials, exclusive pricing for their clients.
- **Goal:** 3–5 PM company relationships.

### First Broker Deal

By Week 3, at least one broker should have submitted a scenario. Treat this deal like it's worth $1 million — because the relationship is.

- **Price the scenario within 2 hours** of receipt. Call the broker to discuss. "I priced your scenario — here's what I can do. Let me explain the DSCR calculation on this one..."
- **Issue conditional approval within 48 hours** of complete submission.
- **Call the broker every 2 days** with a status update, even if there's no change. "Just wanted you to know your file is moving — we're waiting on the appraisal, ordered yesterday, expect it back by [date]."
- **Ask the broker:** "How's our process compared to other DSCR lenders you work with?" Document the feedback.

### Content Publishing Schedule

| Day | Content | Platform | Keyword Target |
|-----|---------|----------|---------------|
| Day 15 | Blog: "DSCR Loan Calculator: How to Know If Your Rental Qualifies" | Website | "DSCR loan calculator" (2,800–4,400/mo) |
| Day 15 | YouTube: "DSCR Loan Step-by-Step Walkthrough" | YouTube | "how to qualify for DSCR loan" |
| Day 16 | Instagram carousel: "DSCR Loan Process Timeline" | Instagram | — |
| Day 17 | Blog: "Best DSCR Lenders 2026: What to Compare" | Website | "best DSCR lenders" (2,200–3,800/mo) |
| Day 18 | LinkedIn article: "Why I Launched a DSCR Lending Company" | LinkedIn | — |
| Day 19 | YouTube short: "DSCR vs Hard Money — When Each Wins" | YouTube | — |
| Day 20 | Blog: "DSCR Loan for LLC: Everything You Need to Know" | Website | "DSCR loan for LLC" (1,400–2,400/mo) |
| Day 21 | Email newsletter: "Week 3 Rate Update + Market Insights" | Email list | — |

### Week 3 Scorecard

| Metric | Target | Cumulative |
|--------|--------|------------|
| Applications | 15 net new | 30 cumulative |
| Calculator submissions | 30–40 net new | 65–95 cumulative |
| Brokers registered | 10 net new | 30–40 cumulative |
| Scenarios priced | 20–25 | 43–57 cumulative |
| Broker-submitted deals | 2–3 | First broker pipeline active |
| Title company relationships | 3–5 | New channel opening |
| Hard money referrals | 2–3 | New channel opening |
| Blog posts published | 3 | 5 cumulative |
| Ad spend | $1,800–$2,100 | $4,125–$4,425 cumulative |

---

## WEEK 4 (Days 22–28): "First Close"

**Cumulative Target:** 50 applications (20 net new), first loan closed  
**Strategy:** Push your earliest applications through to closing. The first close is everything — proof of concept, testimonial, referral source, team confidence.

### Pushing Applications to Closing

By Day 22, your earliest applications (from Days 1–5) should be in underwriting or nearing conditional approval. This is where most DSCR lenders lose deals — in the "underwriting black hole" where borrowers hear nothing for weeks.

**The "No-Surprise" Close Protocol:**
1. **Day 1 after application:** Call borrower. "Here's exactly what happens next, and here's the timeline." Send written confirmation.
2. **Day 2–3:** Collect all conditions. Provide a checklist with specific document names (not "income documentation" — say "Schedule E from 2023 tax return, page 2").
3. **Day 3–5:** Order appraisal and title immediately. Do NOT wait for full condition clearance.
4. **Day 5–7:** Conditional approval issued. Call borrower AND broker (if applicable) to walk through conditions.
5. **Day 7–14:** Clear conditions. Push for 24–48 hour turnaround on condition review (industry average is 5–7 days — beat it and you win).
6. **Day 14–18:** Clear to close. Coordinate closing with title company.
7. **Day 18–21:** Fund. First close achieved.

**For the first deal specifically:**
- Hand-carry the file. Review every document yourself. Double-check the DSCR calculation. Verify the appraisal came in at value. Anticipate every condition before the underwriter asks for it.
- Over-communicate with the borrower. Call every other day. "Just checking in — your file is on track for closing on [date]."
- If anything goes sideways, call the borrower immediately. Bad news delivered fast is always better than bad news delivered late.

### Capturing the First Testimonial

The first close is your most valuable marketing asset. Milk it:

**At closing:**
- Ask the borrower: "How was your experience? Would you be willing to share a quick testimonial?" Get a YES before they leave the closing table.
- Take a photo with the borrower at closing (if they're comfortable). Use for social media.

**Within 24 hours of funding:**
- Send a personalized thank-you email with a Google Review link. Script: "It was great working with you on your DSCR loan at [address]. If you have 2 minutes, a Google review would mean the world to our new company: [link]"
- Send a LinkedIn connection request to the borrower. Ask them to endorse you.
- Ask for referrals: "Who else in your investor network is looking for financing? I'll treat them the same way I treated you."

**Within 1 week:**
- Create a case study: "[First Name] [Last Initial], [City] [State] — [Property type], $[Loan amount] DSCR loan, closed in [X] days at [rate] with [points] points. 'Quote from borrower.'"
- Post the case study on LinkedIn, Facebook, Instagram, and your website.
- Email the case study to all brokers: "Our first deal closed — here's how it went. Submit your next scenario."

### Ensuring the First Close Happens

If no deals are closing by Day 25, take emergency action:
- Call every borrower in your pipeline. Ask what's holding them up. Remove every obstacle.
- If a deal is stuck in underwriting, escalate internally. The first close is worth losing money on.
- Offer to cover the appraisal fee on the first deal if the borrower is hesitating.
- Offer a rate lock at no cost if rates are volatile.

### Week 4 Scorecard

| Metric | Target | Cumulative |
|--------|--------|------------|
| Applications | 20 net new | 50 cumulative |
| Loans closed | 1 | 1 cumulative |
| Testimonials captured | 1 | 1 |
| Google Reviews | 1 | 1 |
| Case studies published | 1 | 1 |
| Brokers registered | 10 net new | 40–50 cumulative |
| Active broker relationships (submitted ≥1 deal) | 5–8 | — |
| Ad spend | $2,000–$2,500 | $6,125–$6,925 cumulative |
| Blog posts | 3 | 8 cumulative |

---

## MONTH 2 (Days 29–60): "Scale What Works"

**Targets:** 3–5 loans closed, 150 cumulative applications (100 net new over 30 days)  
**Strategy:** Data-driven scaling. Cut losers, fund winners. Systematize.

### Analyze Week 1–4 Data: Which Channels Produced the Best Leads?

Build a channel attribution report:

| Channel | Apps Received | Apps Funded | Conversion Rate | Cost per App | Cost per Funded Loan | ROI |
|---------|--------------|-------------|-----------------|-------------|---------------------|-----|
| Personal network | | | | | | |
| Google Ads | | | | | | |
| Facebook Ads | | | | | | | |
| Broker cold calls | | | | | | | |
| LinkedIn outreach | | | | | | | |
| REIA meetings | | | | | | | |
| BiggerPockets | | | | | | | |
| Reddit | | | | | | | |
| Title companies | | | | | | | |
| Hard money referrals | | | | | | | |
| Property managers | | | | | | | |
| Direct mail | | | | | | | |
| Organic search | | | | | | | |

### Double Down on Top 3 Channels

Based on typical DSCR startup data, the top 3 channels will likely be:

1. **Broker channel** (40–50% of applications, lowest CPA, highest volume potential)
2. **Google Ads** (20–30% of applications, medium CPA, scalable)
3. **REIA/in-person** (10–15% of applications, low CPA, limited scale)

**If your top 3 are different, adjust accordingly. The data decides.**

### Cut Channels with Low ROI

- Any channel with cost per funded loan >$3,000: PAUSE
- Any channel that produced zero applications in 4 weeks: CUT
- Any channel with <2% conversion from lead to application: needs fundamental rework, not more budget

### Scale Google/Facebook Ads Based on Week 1–4 Data

**Google Ads scaling plan:**

| Metric | Week 1–4 Average | Month 2 Target | Action |
|--------|-----------------|----------------|--------|
| Daily budget | $100–$150 | $250–$400 | Scale if CPA <$300 |
| Conversion rate | 2–4% | 3–5% | Optimize landing pages |
| Cost per application | $200–$400 | $150–$300 | Improve targeting + copy |
| Applications/week | 2–4 | 5–8 | Result of above |

**Add these Google Ads strategies in Month 2:**
- Geographic targeting: If 60%+ of your apps come from 3 states, create dedicated campaigns for those states with location-specific ad copy ("DSCR loans for Texas investment properties — same-day pricing")
- Competitor conquesting: Bid on competitor brand terms ("Kiavi alternative," "Visio Lending rates," "Lima One review")
- Retargeting: Show ads to website visitors who didn't apply. Budget: 10% of total Google spend.
- RLSA (Remarketing Lists for Search Ads): Bid 30% higher for past visitors searching DSCR terms again

**Facebook Ads scaling plan:**

| Metric | Week 1–4 Average | Month 2 Target | Action |
|--------|-----------------|----------------|--------|
| Daily budget | $50–$75 | $100–$200 | Scale only if CPA <$400 |
| Cost per lead | $15–$40 | $10–$25 | Better creative + targeting |
| Lead-to-app conversion | 5–10% | 10–15% | Better follow-up process |

**Test these Facebook ad concepts in Month 2:**
- Video testimonial ad (use your first closed borrower, even if it's just a 15-second selfie video)
- "DSCR Calculator" demo video (30 seconds showing the tool in action)
- Carousel ad: "3 Reasons Investors Choose DSCR Over Conventional"
- Lead magnet ad: "Free DSCR Investor's Guide — Download Now" (capture email, nurture to application)

### Recruit 10 More Brokers

You should have 40–50 brokers registered by Day 28. Of those, maybe 5–8 have submitted deals. In Month 2, your goal is 10 NEW active brokers (brokers who submit at least 1 deal).

**Broker recruitment plan:**

| Week | New Broker Outreach | Target Registrations | Target Submissions |
|------|-------------------|---------------------|-------------------|
| Week 5 | 30 calls + 50 LinkedIn messages | 8–10 | 2–3 |
| Week 6 | 30 calls + 50 LinkedIn messages | 8–10 | 2–3 |
| Week 7 | 30 calls + 50 LinkedIn messages | 8–10 | 2–3 |
| Week 8 | 30 calls + 50 LinkedIn messages | 8–10 | 2–3 |

**Broker activation playbook:**
1. Broker registers → immediate email with rate sheet + AE direct line
2. Day 1 after registration → AE calls broker. "Welcome aboard. Do you have a scenario we can price right now?"
3. Day 3 → Email with case study of first closed deal
4. Day 7 → Text/call: "Just checking in — any investor clients looking for financing?"
5. Day 14 → Email: "Here's a scenario we just priced in [broker's state] — [details]. Could your clients use similar pricing?"
6. Ongoing → Monthly rate update email + quarterly broker appreciation (gift card, lunch invite)

### Launch Free DSCR Calculator Tool (Marketing Upgrade)

Your calculator is already live, but now it's time to make it a lead-generation weapon:

- **Add email gate:** Users see the DSCR ratio immediately (no gate), but must enter email to see estimated rate range and monthly cash flow.
- **Add portfolio mode:** Let investors enter 5+ properties at once. Email the full portfolio analysis. This captures high-value investors with multiple properties.
- **Add STR toggle:** Let users toggle between LTR and STR income (pull AirDNA/RentCast data if possible). STR investors are the fastest-growing DSCR segment.
- **Add embed code:** Let bloggers, brokers, and REIA websites embed your calculator on their sites — with your branding and backlink.
- **Share on Product Hunt, Hacker News, BiggerPockets:** "I built a free DSCR calculator that shows rate estimates and portfolio analysis. Try it: [link]"

### First Email Nurture Campaigns

**Campaign 1: "DSCR Education Series" (for calculator users who didn't apply)**
- Email 1 (Day 1): "Your DSCR ratio + what it means for your financing options"
- Email 2 (Day 3): "3 things that affect your DSCR rate (that most investors don't know)"
- Email 3 (Day 7): "DSCR vs. conventional — which is better for your next deal?"
- Email 4 (Day 10): "Ready to see your exact rate? Apply in 5 minutes: [link]"
- Email 5 (Day 14): "Rate update: DSCR rates [moved/holding] this week. Lock your rate: [link]"

**Campaign 2: "Broker Activation" (for registered brokers who haven't submitted)**
- Email 1 (Day 1): Rate sheet + commission structure + AE direct line
- Email 2 (Day 3): First closed deal case study + pricing breakdown
- Email 3 (Day 7): "What brokers are saying about us" + testimonial
- Email 4 (Day 14): "Submit your first scenario — I'll price it in 2 hours or less"
- Email 5 (Day 21): First-deal bonus reminder + deadline

**Campaign 3: "Referral Engine" (for closed borrowers)**
- Email 1 (Day 1 after close): Thank you + Google review request
- Email 2 (Day 7): "Refer an investor, get $500 off your next loan"
- Email 3 (Day 14): "Pre-approved for your next DSCR loan — here's your rate: [link]"
- Email 4 (Day 30): Portfolio analysis offer — "Send me your portfolio and I'll run DSCR scenarios on every property"
- Email 5 (Day 60): Referral reminder + market update

### Month 2 Scorecard

| Metric | Month 2 Target | Cumulative (Day 60) |
|--------|---------------|---------------------|
| Applications | 100 net new | 150 cumulative |
| Loans closed | 3–5 | 4–6 cumulative |
| Active brokers (≥1 submission) | 10 new | 15–18 total |
| Broker-originated apps | 40–50% of total | — |
| Calculator submissions | 150–200 net new | 215–295 cumulative |
| Email list size | 300–500 | — |
| Ad spend | $9,000–$12,000 | $15,000–$19,000 cumulative |
| Blog posts | 8 | 16 cumulative |
| YouTube videos | 4 | 5 cumulative |
| Testimonials/case studies | 3–5 | 4–6 cumulative |

---

## MONTH 3 (Days 61–90): "Build the Machine"

**Targets:** 8–12 loans closed (cumulative), 300 cumulative applications (150 net new over 30 days)  
**Strategy:** Systematize, hire, expand. Turn the founder-driven hustle into a repeatable machine.

### Systematize What's Working

By Day 60, you know what works. Now build systems so it doesn't depend on you personally:

**Daily systems:**
- **Morning standup (15 min):** Review pipeline, identify blockers, assign tasks
- **Broker AE block (9–11 AM):** Dedicated outbound call time for broker acquisition and relationship management
- **Underwriting follow-up (11–12 PM):** Push every file forward. Call every borrower/broker with a status update.
- **Content block (2–3 PM):** Write one social post, answer 3 community questions, review/edit any pending blog posts
- **Evening review (5–5:30 PM):** Update CRM, log metrics, plan tomorrow

**Weekly systems:**
- **Monday:** Pipeline review + weekly priority setting
- **Wednesday:** Mid-week metric check — are we on pace for weekly targets?
- **Friday:** Week-in-review — what worked, what didn't, what changes next week

**Monthly systems:**
- **Rate sheet review:** Are you competitive? Adjust if needed
- **Channel ROI audit:** Which channels deserve more/less budget?
- **Broker satisfaction survey:** Send to all active brokers quarterly
- **Content calendar:** Plan next month's blog, video, and social posts

### Hire First Loan Officer or Salesperson

By Day 60, you're the bottleneck. You're doing sales, operations, underwriting coordination, marketing, and customer service. You need to delegate the highest-leverage activity: **sales and broker relationships.**

**Hire profile:**
- 3+ years in mortgage sales (conventional or non-QM)
- Existing network of brokers or investor contacts
- Licensed MLO with clean NMLS record
- Comfortable with startup environment (equity + commission, not base salary)
- Based in or willing to relocate to a top DSCR market (TX, FL, GA, AZ)

**Compensation structure:**
- Base: $3,000–$5,000/month (enough to survive, not enough to coast)
- Commission: 15–25 bps on funded volume
- Override: 5 bps on any loans from brokers they recruit (ongoing)
- Target: $80K–$120K first year if they perform

**When they start (target Day 65):**
- Week 1: Shadow you on every call. Learn the DSCR product inside and out. Study the rate sheet until they can price scenarios from memory.
- Week 2: Take over broker follow-ups. You make the initial call, they do the relationship management.
- Week 3: Start making their own broker cold calls. Target: 25/day.
- Week 4: Full ownership of broker channel. You focus on strategy, partnerships, and scaling.

### Expand Broker Network to 25+

By Day 60, you have 15–18 active brokers. Target 25+ by Day 90.

**Growth strategy:**
- **Referral program for brokers:** "Refer another broker who closes a deal with us, get $500." Brokers know other brokers — this is the cheapest acquisition channel.
- **AIME membership + events:** Join the Association of Independent Mortgage Experts. Attend their next event. This is where DSCR-active brokers congregate.
- **Non-QM Facebook group strategy:** Post helpful content 3x/week in the top groups. When brokers see you consistently answering DSCR questions, they reach out.
- **Broker webinar:** Host a 30-minute webinar: "DSCR Lending Masterclass — How to Close More Investor Deals." Promote in broker groups. Capture registrations. Follow up with rate sheet.
- **Scotsman Guide listing:** Get listed in the Scotsman Guide wholesale lender directory. It's where brokers search for new lenders. Cost: $500–$2,000/year.

### Launch Content Marketing Engine

By Day 61, you should be publishing 2 blog posts/week and 1 YouTube video/week. Scale to:

- **3 blog posts/week** targeting keyword gaps:
  - Week 9: "DSCR Loan for Airbnb/STR" / "DSCR Refinance: When It Makes Sense" / "DSCR Loan Closing Timeline Explained"
  - Week 10: "No-Doc DSCR Loan: What It Is and Who Qualifies" / "DSCR Loan for Foreign Nationals" / "DSCR vs Hard Money: The Real Math"
  - Week 11: "DSCR Loan Down Payment Requirements" / "How to Buy 10 Rentals with DSCR Loans" / "DSCR Loan Pre-Approval Process"
  - Week 12: "DSCR Loan Interest Rates 2026" / "DSCR Loan for Multi-Family Properties" / "DSCR Loan State Availability Guide"
- **2 YouTube videos/week:** One educational (5–10 min), one short (60 sec)
- **Daily social posts:** 1 LinkedIn, 1 Instagram, 1 Facebook group comment/post
- **Monthly email newsletter:** Rate update + market commentary + new blog posts

**Content repurposing system:** Every blog post → 3 social posts + 1 email snippet. Every YouTube video → blog transcript + 3 short clips. One piece of content = 7+ touchpoints.

### Begin SEO Strategy

SEO is a 6–18 month play, but you must start in Month 3:

1. **Technical SEO audit:** Ensure site speed <3 seconds, mobile-responsive, proper H1/H2 structure, schema markup on calculator and rate pages, XML sitemap submitted to Google Search Console
2. **Target featured snippets:** Structure FAQ and "what is" pages with direct, concise answers (40–60 words) above detailed content. Google loves pulling these into Position Zero.
3. **Build backlinks:** Reach out to 20 REI bloggers and offer guest posts. Submit your calculator to "best DSCR calculator" listicles. Get listed on lender directories.
4. **State landing pages:** Create dedicated pages for your top 10 states (TX, FL, GA, AZ, NC, TN, OH, IN, MI, CO). Include state-specific licensing info, average rents, DSCR rate ranges. These target "DSCR loan [state]" keywords with 200–800 searches/month each and low competition.
5. **Internal linking:** Every blog post links to the calculator. Every state page links to "Apply Now." Every FAQ answer links to a related blog post.

### Build Referral Program

**Borrower referral program:**
- "Refer an investor who closes a loan with us → you get $500 off your next DSCR loan OR a $250 Amazon gift card"
- Promote at closing, in post-close email sequence, and on website
- Make it stupid-simple: unique referral link that auto-tracks
- **Expected referral rate:** 15–25% of closed borrowers will refer 1 person within 90 days

**Broker referral program:**
- "Refer a broker who closes their first deal with us → you get a $500 bonus on your next funded file"
- Promote in broker newsletter and AE conversations
- **Expected referral rate:** 20–30% of active brokers will refer another broker within 6 months

**Cross-referral partnerships:**
- Title companies → you (2–5 deals/month each)
- Hard money lenders → you (1–3 refi deals/month each)
- Property managers → you (2–5 deals/month each)
- Real estate attorneys → you (1–2 deals/month each)
- Insurance agents (investment property specialists) → you (1–3 deals/month each)

### Month 3 Scorecard

| Metric | Month 3 Target | Cumulative (Day 90) |
|--------|---------------|---------------------|
| Applications | 150 net new | 300 cumulative |
| Loans closed | 5–7 | 8–12 cumulative |
| Active brokers | 15 new active | 25+ total |
| Loan officer hired | 1 | — |
| Email list | 500+ net new | 800–1,000+ |
| Blog posts | 12 | 28 cumulative |
| YouTube videos | 8 | 13 cumulative |
| Organic traffic | 1,000–2,000 visits/month | Growing |
| Referral partnerships | 10–15 | Title companies, HMLs, PMs, attorneys |
| Ad spend | $12,000–$15,000 | $27,000–$34,000 cumulative |
| Revenue from closed loans | $75,000–$180,000 | Based on 8–12 loans × $150K–$350K avg × 2–3% origination |

---

## THE EMERGENCY PLAYBOOK

**Trigger:** You have ZERO applications after 2 weeks. Or fewer than 3 applications after 3 weeks. This is a five-alarm fire.

### Emergency Move 1: "The Nuclear Option" — Call Every Mortgage Broker You Can Find

**Execution:**
- Buy a list of 500 mortgage brokers from a data provider ($200–$500) or scrape NMLS Consumer Access
- Call 50 brokers per day for 10 days. Not 20. Not 30. **Fifty.**
- Script: "I'm [Name] with [Company]. We fund DSCR loans. 100 bps lender-paid. Same-day pricing. I'll price any scenario you have while you're on the phone. What do you have?"
- Offer a **guaranteed first-deal bonus:** $1,000 to any broker who closes their first deal with us in 30 days. This is aggressive but it buys urgency.
- **Expected result:** 5–10 scenario submissions, 1–3 applications within 7 days

### Emergency Move 2: "The Rescue Deal" — Find a Deal Dying at Another Lender and Save It

**Execution:**
- Post in every non-QM and DSCR Facebook group: "Is your DSCR deal stuck at another lender? I can underwrite it in 48 hours and close in 3 weeks. DM me."
- Call 20 brokers and ask: "Do you have any DSCR files that are stalled or about to die at another lender? Send them to me — I'll give you a yes or no in 24 hours."
- Check BiggerPockets forums for investors complaining about lender issues. DM them: "I saw your post about [issue] — that shouldn't happen. I can take a look at your deal this week if you want a second opinion."
- **Expected result:** 1–2 rescue deals within 2 weeks. These are high-conversion because the borrower is desperate.

### Emergency Move 3: "The Guarantee Offer" — Beat Any DSCR Rate or Pay $500

**Execution:**
- Post on social media: "We guarantee we'll beat any DSCR rate you've been quoted — or we'll pay you $500. No gimmicks. Send us your competing offer and we'll show you ours."
- This is aggressive and you may lose money on the first few deals, but you're buying applications, testimonials, and momentum.
- The $500 payout risk is minimal — you only pay if you truly can't beat the rate, which means your pricing is fundamentally broken (a bigger problem than marketing).
- **Expected result:** 3–5 applications in the first week from investors who are rate-shopping

### Emergency Move 4: "The Partner Up" — Find a Hard Money Lender and Split Their Refi Pipeline

**Execution:**
- Identify 10 local hard money lenders who fund fix-and-flip loans
- Offer an exclusive referral partnership: "Send us every borrower who completes a rehab and needs long-term takeout financing. We'll fund the DSCR refi and pay you [X] bps referral fee on every closed loan."
- Go to their office. Bring lunch. Build a real relationship. Hard money lenders are typically small, local, and relationship-driven. They love this because it adds revenue to deals they've already closed.
- **Expected result:** 2–5 refinance applications within 30 days per partnership

### Emergency Move 5: "Go Local" — Attend Every REIA in a 50-Mile Radius This Week

**Execution:**
- Find every REIA and real estate meetup within 50 miles (search Meetup.com, Facebook Events, Google "real estate investors association near me")
- Attend 3–5 meetings this week. Not as a spectator — as a SPONSOR.
- Offer to present: "How to Finance Your Next 5 Rental Properties with DSCR Loans" — 20-minute presentation with Q&A
- Bring rate sheets, business cards, and a sign-up sheet for free DSCR consultations
- At every meeting, collect 5–10 names and phone numbers. Call them the next morning.
- **Expected result:** 3–8 applications within 2 weeks from concentrated local effort

### Emergency Decision Matrix

| Situation | First Move | Second Move | If Still Zero |
|-----------|-----------|-------------|---------------|
| Zero apps after Week 1 | Nuclear Option (50 broker calls/day) | Guarantee Offer | Audit your website/rate sheet — is something broken? |
| Zero apps after Week 2 | Rescue Deal + Go Local | Partner Up | Pause ads. You have a product/market fit problem, not a marketing problem. |
| Apps but no closes after Week 4 | Push every file manually | Offer to cover appraisal fees | Check your underwriting — are you too conservative? |
| Brokers registered but no submissions | Price a hypothetical deal and email it to them | Offer $1,000 first-deal bonus | Your rate sheet is uncompetitive. Re-price. |

---

## BUDGET BREAKDOWN

### Month 1: "Launch" (Days 1–28)

| Category | Item | Cost |
|----------|------|------|
| **Technology** | Website hosting + domain | $50–$100 |
| | LOS (LendingPad or similar) | $500–$1,500 |
| | CRM (HubSpot/ActiveCampaign) | $0–$50 |
| | Email platform | $0–$50 |
| | Phone system | $30–$100 |
| | DSCR calculator development | $500–$2,000 (if outsourced) |
| | Credit pull integration | $100–$300 |
| **Marketing — Digital** | Google Ads ($150/day × 28 days) | $4,200 |
| | Facebook Ads ($75/day × 28 days) | $2,100 |
| | Landing page optimization | $0–$500 |
| **Marketing — Offline** | Business cards | $100 |
| | One-pagers (borrower + broker) | $200 |
| | Pull-up banner | $150 |
| | Branded apparel | $150 |
| | REIA sponsorship (2–3 events) | $300–$1,500 |
| | Direct mail (500 pieces) | $500–$750 |
| **Personnel** | Founder salary | $0 (deferred or equity) |
| | Administrative support (part-time) | $500–$1,000 |
| **Other** | Appraisal fees (advance for borrowers) | $0–$2,000 |
| | Broker first-deal bonuses | $0–$1,000 |
| | Legal/compliance review | $500–$2,000 |
| | **MONTH 1 TOTAL** | **$9,880–$16,350** |

### Month 2: "Scale" (Days 29–60)

| Category | Item | Cost |
|----------|------|------|
| **Technology** | All tech (recurring) | $800–$2,200 |
| | Calculator enhancements (portfolio mode, STR toggle) | $500–$1,500 |
| **Marketing — Digital** | Google Ads ($250/day × 30 days) | $7,500 |
| | Facebook Ads ($150/day × 30 days) | $4,500 |
| | LinkedIn Sales Navigator | $100 |
| | BiggerPockets Marketplace listing | $500–$1,500 |
| **Marketing — Offline** | REIA sponsorships (4 events) | $600–$3,000 |
| | Direct mail (1,500 pieces) | $1,500–$2,250 |
| | Conference attendance | $500–$2,000 |
| **Personnel** | Founder salary | $5,000–$8,000 |
| | Loan officer (base + commission) | $5,000–$10,000 |
| **Other** | Broker bonuses and incentives | $1,000–$3,000 |
| | Content creation (freelance writer) | $500–$1,500 |
| | **MONTH 2 TOTAL** | **$27,500–$39,550** |

### Month 3: "Build the Machine" (Days 61–90)

| Category | Item | Cost |
|----------|------|------|
| **Technology** | All tech (recurring + enhancements) | $1,000–$2,500 |
| | SEO tools (Ahrefs/Semrush) | $100–$200 |
| **Marketing — Digital** | Google Ads ($350/day × 30 days) | $10,500 |
| | Facebook Ads ($200/day × 30 days) | $6,000 |
| | YouTube ads | $1,000–$3,000 |
| | LinkedIn Ads (broker recruitment) | $500–$1,500 |
| | BiggerPockets Marketplace | $500–$1,500 |
| | Scotsman Guide listing | $500–$2,000 |
| **Marketing — Offline** | REIA sponsorships (6 events) | $900–$4,500 |
| | Direct mail (3,000 pieces) | $3,000–$4,500 |
| | Conference (booth at AIME or regional event) | $2,000–$5,000 |
| **Personnel** | Founder | $5,000–$8,000 |
| | Loan officer | $5,000–$10,000 |
| | Marketing coordinator (part-time) | $1,500–$3,000 |
| **Other** | Broker bonuses/incentives | $2,000–$5,000 |
| | Referral payouts | $500–$2,000 |
| | Content creation | $1,000–$2,000 |
| | **MONTH 3 TOTAL** | **$41,000–$62,200** |

### 90-Day Total Investment

| Period | Low Estimate | High Estimate |
|--------|-------------|---------------|
| Month 1 | $9,880 | $16,350 |
| Month 2 | $27,500 | $39,550 |
| Month 3 | $41,000 | $62,200 |
| **TOTAL** | **$78,380** | **$118,100** |

### Expected Revenue at Each Milestone

| Milestone | Closed Loans | Avg Loan Size | Origination Revenue | Net (after costs) |
|-----------|-------------|---------------|--------------------|--------------------|
| Day 28 (1 close) | 1 | $200K | $4,000 (2% origination) | -$12,000 to -$6,000 |
| Day 60 (4–6 closes) | 4–6 | $200K | $16,000–$24,000 | -$24,000 to +$6,000 |
| Day 90 (8–12 closes) | 8–12 | $200K | $32,000–$48,000 | -$86,000 to -$30,000 |
| Day 180 (projected) | 25–40 | $225K | $112,500–$180,000 | Breakeven to profitable |
| Day 365 (projected) | 80–150 | $250K | $400,000–$750,000 | Profitable |

**Reality check:** You will NOT be profitable in 90 days. The 90-day plan is about building the pipeline and the machine. Profitability comes at Month 6–9 if you execute well. The investment required is $80K–$120K to get through launch, and you need capital reserves beyond this to fund loans.

---

## KEY METRICS TO TRACK WEEKLY

### The Dashboard (Review Every Friday at 3 PM)

| Metric | Definition | Week 1 Target | Week 4 Target | Week 12 Target | Data Source |
|--------|-----------|---------------|---------------|----------------|-------------|
| **Applications received** | Total new loan applications submitted | 5 | 50 | 300 cumulative | CRM/LOS |
| **Applications per channel** | Attribution of each app to acquisition source | Track all sources | Identify top 3 | Top 3 = 80%+ of apps | CRM + UTM tracking |
| **Conversion rate (app → close)** | % of applications that fund | N/A (too early) | 10–20% | 20–30% | CRM/LOS |
| **Time to close** | Days from application to funding | N/A | Target 21–30 days | Target 18–25 days | LOS |
| **Cost per application** | Total marketing spend ÷ applications | $200–$500 | $150–$300 | $100–$200 | Ad platforms + CRM |
| **Cost per closed loan** | Total marketing spend ÷ funded loans | N/A | $2,000–$5,000 | $1,000–$2,500 | Ad platforms + LOS |
| **Broker count** | Total registered brokers | 10–15 | 40–50 | 80–100 | CRM |
| **Active broker count** | Brokers who submitted ≥1 deal | 2–3 | 5–8 | 25+ | CRM |
| **Referral rate** | % of apps from referrals (borrower or broker) | 0% | 5–10% | 20–30% | CRM attribution |
| **Calculator submissions** | New leads from DSCR calculator | 15–25 | 65–95 | 300+ | Website analytics |
| **Email list size** | Total subscribed contacts | 25–50 | 150–250 | 800–1,000 | Email platform |
| **Organic traffic** | Monthly website visits from search | Negligible | 200–500 | 1,000–2,000 | Google Analytics |
| **Net Promoter Score** | Borrower satisfaction (survey post-close) | N/A | Target 8+ | Target 9+ | Post-close survey |

### Weekly Reporting Template

```
WEEK [X] REPORT — [Company Name] DSCR Lending

PIPELINE:
  New applications this week: [X]
  Cumulative applications: [X]
  In underwriting: [X]
  Conditionally approved: [X]
  Clear to close: [X]
  Closed this week: [X]
  Cumulative closed: [X]

CHANNEL PERFORMANCE:
  Google Ads: [X] clicks, [X] leads, [X] apps, $[X] CPA
  Facebook Ads: [X] clicks, [X] leads, [X] apps, $[X] CPA
  Broker channel: [X] scenarios, [X] apps, $[X] CPA
  REIA/in-person: [X] conversations, [X] apps
  Organic/search: [X] visits, [X] apps
  Referrals: [X] apps
  Other: [X] apps

BROKER METRICS:
  New broker registrations: [X]
  Cumulative brokers: [X]
  Active brokers (≥1 submission): [X]
  Scenarios priced this week: [X]
  Avg time to price scenario: [X] hours

CONTENT METRICS:
  Blog posts published: [X]
  Social media posts: [X]
  YouTube videos: [X]
  Email sends: [X]
  Open rate: [X]%
  Click rate: [X]%

FINANCIALS:
  Marketing spend this week: $[X]
  Cumulative marketing spend: $[X]
  Revenue this week: $[X]
  Cumulative revenue: $[X]

WIN THIS WEEK:
  [Best thing that happened]

FIX THIS WEEK:
  [Biggest problem to solve]

NEXT WEEK PRIORITIES:
  1. [Priority 1]
  2. [Priority 2]
  3. [Priority 3]
```

---

## 90-DAY TIMELINE AT A GLANCE

```
PRE-LAUNCH (Days -30 to 0)
├── Days -30 to -21: Licensing, website build, rate sheet
├── Days -21 to -14: Application portal, broker portal, email/CRM setup
├── Days -14 to -7: Calculator, content creation, marketing materials
└── Days -7 to 0: Testing, social profiles, final checklist

WEEK 1 (Days 1-7): GET FIRST 5 APPLICATIONS
├── Day 1: Launch announcement + personal network + REIA
├── Day 2: Broker blitz (20 calls + LinkedIn)
├── Day 3: Calculator push across all platforms
├── Day 4: Follow-up day (abandoned apps + broker scenarios)
├── Day 5: Close the week strong + push for applications
└── Days 6-7: Weekend REIA + Week 2 prep

WEEK 2 (Days 8-14): SCALE TO 15 APPLICATIONS
├── Broker outreach at scale (25 calls/day + 25 LinkedIn/day)
├── Ad optimization (kill low performers, double winners)
├── Content publishing begins (2 blogs, 1 YouTube video)
├── Direct mail test (500 pieces)
└── Online community engagement (BiggerPockets, Reddit, Facebook)

WEEK 3 (Days 15-21): BUILD THE PIPELINE
├── Channel ROI analysis — double down on top 3
├── Title company + hard money lender outreach
├── First broker deal submitted
├── Content engine ramping (3 blogs, 2 videos)
└── Property management company partnerships

WEEK 4 (Days 22-28): FIRST CLOSE
├── Push applications through to closing
├── "No-Surprise Close" protocol in effect
├── Capture first testimonial + Google review
├── Publish first case study
└── Celebrate. Then get back to work.

MONTH 2 (Days 29-60): SCALE WHAT WORKS
├── Channel attribution analysis
├── Scale top 3 channels, cut losers
├── Google Ads to $250-400/day, Facebook to $100-200/day
├── Recruit 10 new active brokers
├── Launch enhanced DSCR calculator (email gate, portfolio mode, STR toggle)
├── Email nurture campaigns live
└── Target: 3-5 closes, 150 cumulative apps

MONTH 3 (Days 61-90): BUILD THE MACHINE
├── Hire first loan officer/salesperson
├── Systematize daily/weekly/monthly processes
├── Expand broker network to 25+ active
├── Content marketing engine: 3 blogs/week, 2 videos/week
├── SEO strategy launch (technical audit + state pages + backlinks)
├── Referral program live (borrower + broker)
├── Cross-referral partnerships (title, HML, PM, attorney)
└── Target: 8-12 closes, 300 cumulative apps

EMERGENCY PLAYBOOK (if zero apps after 2 weeks)
├── Nuclear Option: 50 broker calls/day
├── Rescue Deal: save dying deals from other lenders
├── Guarantee Offer: beat any rate or pay $500
├── Partner Up: hard money lender refi pipeline
└── Go Local: every REIA within 50 miles
```

---

## FINAL NOTES

**This plan assumes you have capital to fund loans.** If you don't have a warehouse line or credit facility, you're not a lender — you're a broker. Get your capital lined up before Day -30 or none of this matters.

**The first 30 days are about HUSTLE, not brand.** You don't need a logo that wins design awards. You need a rate sheet that wins deals. You don't need a 50-page website. You need a calculator that captures emails. You don't need brand awareness. You need 5 people to hand you their property information and say "yes, fund my loan."

**Speed is your only competitive advantage as a new lender.** Kiavi has brand. Visio has tenure. Lima One has product breadth. You have none of those. What you can have is: same-day scenario pricing, 24-hour condition review, a human who answers the phone, and a process that doesn't surprise borrowers at week 3. If you can't be faster and more responsive than the incumbents, you will lose.

**Brokers are your force multiplier.** One broker with 5 investor clients can feed you 15–20 applications per year. Ten brokers = 150–200 applications. Win the broker channel and everything else becomes easier. Your first hire should be someone who can own broker relationships.

**The calculator is your Trojan horse.** Every DSCR lender has a "Contact Us" form. Almost none have a genuinely useful calculator that gives real rate estimates and captures the lead's information. Build the calculator, make it free, make it better than anything else on the market, and watch it become your #1 lead source by Month 4.

**Track everything from Day 1.** If you can't measure it, you can't improve it. The weekly reporting template isn't optional — it's how you know whether to double down or change direction.

**Close the first deal. Everything before that is theory.** Your first closed loan is proof that your product works, your process works, your pricing works, and your team can execute. It's also your first testimonial, your first case study, your first Google review, and your first referral source. Move heaven and earth to get it done in Week 4.

Now stop reading and start calling.
