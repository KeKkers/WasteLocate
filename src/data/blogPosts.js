// blogPosts.js — single source of truth for all blog content
// Add new posts here and they will automatically appear in both
// the BlogScroller on the homepage AND the full BlogView page.

export const BLOG_POSTS = [
  {
    id: 'ewc-codes-guide',
    tag: 'Classification',
    date: '12 September 2023',
    title: 'Understanding EWC Codes: A Complete Guide for UK Waste Producers',
    excerpt: 'Every business producing waste must identify the correct six-digit code before material can be stored, transported or disposed of legally. Incorrect coding can lead to rejected loads, enforcement action and prosecution.',
    mins: 5,
    image: '/images/ewc-guide-corrected.png',
    imageAlt: 'Understanding EWC codes example',
    content: [
      {
        type: 'p',
        text: "European Waste Catalogue (EWC) codes — sometimes called LoW (List of Waste) codes — are the foundation of waste classification in the UK. Every business that produces waste must identify the correct code before the material can be stored, transported, or disposed of legally. Incorrect coding can lead to rejected loads, enforcement action, financial penalties and, in some cases, prosecution.",
      },
      { type: 'h3', text: 'Why EWC Codes Matter' },
      {
        type: 'p',
        text: 'EWC codes exist to ensure that waste streams are classified consistently across Europe and the UK. The six-digit code tells you what type of waste it is, whether the waste is hazardous or non-hazardous, what regulations apply including Duty of Care and consignment requirements, and which licensed sites can legally accept the waste.',
      },
      { type: 'h3', text: 'Correct Example EWC Codes' },
      {
        type: 'ul',
        items: [
          '17 02 01 — Wood from construction and demolition activities (non-hazardous).',
          '20 03 01 — Mixed municipal waste, commonly produced by businesses and households.',
          '16 01 03 — Used or end-of-life tyres (Chapter 16: wastes not otherwise specified).',
        ],
      },
      { type: 'h3', text: 'How to Identify the Proper EWC Code' },
      {
        type: 'p',
        text: "Follow the government's recommended three-step process: first, identify the source activity (construction, manufacturing, healthcare, etc.); second, check the chapter and sub-chapter descriptions; third, identify the correct six-digit code. If the waste appears in more than one chapter, you must use the chapter relating to the original process that created it.",
      },
      { type: 'h3', text: 'Official Reference Links' },
      {
        type: 'links',
        items: [
          { text: 'GOV.UK – How to classify different types of waste', url: 'https://www.gov.uk/guidance/how-to-classify-different-types-of-waste' },
          { text: 'WM3 Technical Guidance (PDF)', url: 'https://assets.publishing.service.gov.uk/media/6152d0b78fa8f5610b9c222b/Waste_classification_technical_guidance_WM3.pdf' },
        ],
      },
    ],
  },
  {
    id: 'environmental-permits',
    tag: 'Permits',
    date: '4 October 2023',
    title: 'Environmental Permits: What They Are and Why They Matter for Businesses',
    excerpt: 'Environmental permits regulate activities that could pose a risk to human health or the environment. Understanding permitting requirements is essential — permits do not transfer automatically with a property.',
    mins: 4,
    image: '/images/environmental-permits.png',
    imageAlt: 'Environmental permits guidance',
    content: [
      {
        type: 'p',
        text: "Environmental permits exist to regulate activities that could pose a risk to human health or the environment. They apply to waste sites, treatment activities, energy generation, industrial processes, discharges to water, and many other operations. Whether you're buying land, operating a waste site, or establishing new infrastructure, understanding the requirements of environmental permitting is essential to avoid legal and financial pitfalls.",
      },
      { type: 'h3', text: 'What an Environmental Permit Covers' },
      {
        type: 'ul',
        items: [
          'Limits on storage volumes or waste types.',
          'Emission monitoring and controls.',
          'Infrastructure and drainage requirements.',
          'Record-keeping, reporting and inspection obligations.',
        ],
      },
      { type: 'h3', text: 'Permits and Commercial Transactions' },
      {
        type: 'p',
        text: "When buying or leasing a site, undisclosed or incorrectly transferred permits can create major issues. Some businesses assume permits automatically transfer with a property — they do not. The new operator must apply to transfer, vary, or surrender the permit. During due diligence, always check that the permit is valid and active, that it matches the activities taking place, the compliance history including breaches and enforcement notices, and that the site plan boundaries match the permitted boundary.",
      },
      { type: 'h3', text: 'Useful Links' },
      {
        type: 'links',
        items: [
          { text: 'Environmental permit guidance & forms', url: 'https://www.gov.uk/government/collections/environmental-permit-guidance-and-application-forms' },
          { text: 'Check if you need an environmental permit', url: 'https://www.gov.uk/guidance/check-if-you-need-an-environmental-permit' },
        ],
      },
    ],
  },
  {
    id: 'waste-carrier-broker-dealer',
    tag: 'Compliance',
    date: '17 November 2023',
    title: 'What Is a Waste Carrier, Broker or Dealer? A Practical UK Guide',
    excerpt: 'Many businesses are surprised to learn that simply transporting waste — even their own — can require registration. Arranging transport for others may class you as a broker, even without physically handling the waste.',
    mins: 4,
    image: '/images/waste-carrier.png',
    imageAlt: 'Waste carrier, broker and dealer roles',
    content: [
      {
        type: 'p',
        text: "Many businesses are surprised to learn that simply transporting waste — even their own — can require registration. Others do not realise that arranging the transport of waste for someone else (even without physically handling it) may classify them as a waste broker.",
      },
      { type: 'h3', text: 'Waste Carrier' },
      {
        type: 'p',
        text: 'You are a carrier if you transport waste as part of your business. There are two tiers: Upper Tier for most businesses transporting for others, and Lower Tier for organisations transporting their own non-hazardous waste.',
      },
      { type: 'h3', text: 'Waste Broker' },
      {
        type: 'p',
        text: 'A broker organises the movement of waste without physically transporting it — for example, logistics coordinators, facilities managers, or skip brokers.',
      },
      { type: 'h3', text: 'Waste Dealer' },
      { type: 'p', text: 'Dealers buy or sell waste, or act as intermediaries in commercial waste transactions.' },
      { type: 'h3', text: 'Why This Matters' },
      {
        type: 'ul',
        items: ['£5,000+ fines', 'Vehicle seizure', 'Prosecution', 'Loss of site access'],
      },
      { type: 'h3', text: 'Official Links' },
      {
        type: 'links',
        items: [
          { text: 'Register as a carrier/broker/dealer', url: 'https://www.gov.uk/waste-carrier-or-broker-registration' },
          { text: 'Check the public register', url: 'https://environment.data.gov.uk/public-register/view/search-waste-carriers-brokers' },
        ],
      },
    ],
  },
  {
    id: 'do-i-need-a-permit',
    tag: 'Permits',
    date: '8 January 2024',
    title: 'How Do You Know If You Need an Environmental Permit?',
    excerpt: 'Businesses often assume they do not need a permit because their activity seems low-risk. However, the threshold for requiring a permit is sometimes much lower than expected.',
    mins: 4,
    image: '/images/permit-needed.png',
    imageAlt: 'Do I need a permit?',
    content: [
      {
        type: 'p',
        text: "Businesses often assume they don't need a permit because their activity seems low-risk. However, the threshold for requiring a permit is sometimes much lower than expected. Failure to obtain one can lead to enforcement notices, stop-work orders and significant fines.",
      },
      { type: 'h3', text: 'Common Activities That Require a Permit' },
      {
        type: 'ul',
        items: [
          'Storing or treating waste above exemption thresholds',
          'Operating machinery that emits dust, fumes or noise',
          'Fuel storage or combustion equipment',
          'Discharging to surface water or groundwater',
          'Biological waste treatment',
        ],
      },
      { type: 'h3', text: 'Understanding Exemptions vs Permits' },
      {
        type: 'p',
        text: 'Some operations can be carried out under an exemption (e.g., T5, S1, U1), but these often include strict volume limitations. If you exceed them — even unintentionally — you are automatically operating illegally.',
      },
      { type: 'h3', text: 'Helpful Links' },
      {
        type: 'links',
        items: [
          { text: 'Permit checker tool', url: 'https://www.gov.uk/guidance/check-if-you-need-an-environmental-permit' },
          { text: 'Waste exemptions guidance', url: 'https://www.gov.uk/guidance/waste-exemptions-using-waste' },
        ],
      },
    ],
  },
  {
    id: 'duty-of-care',
    tag: 'Duty of Care',
    date: '22 February 2024',
    title: 'Understanding Your Waste Duty of Care Responsibilities',
    excerpt: 'Under Section 34 of the Environmental Protection Act 1990, every business has a legal Duty of Care for the waste it produces — from storage through to final disposal.',
    mins: 3,
    image: '/images/duty-of-care.png',
    imageAlt: 'Duty of Care in waste management',
    content: [
      {
        type: 'p',
        text: "Under Section 34 of the Environmental Protection Act 1990, every business has a legal Duty of Care for the waste it produces. This means ensuring it is stored, transported, and disposed of safely — and only via licensed carriers and permitted sites.",
      },
      { type: 'h3', text: 'Main Duty of Care Requirements' },
      {
        type: 'ul',
        items: [
          'Correct EWC classification',
          'Secure on-site storage',
          'Transfer only to registered carriers',
          'Keep waste transfer notes for at least 2 years',
          'Ensure receiving sites are properly permitted',
        ],
      },
      {
        type: 'p',
        text: "Non-compliance can result in enforcement notices, penalties or being held liable for downstream fly-tipping if your waste ends up in the wrong hands.",
      },
      { type: 'h3', text: 'Official Guidance' },
      {
        type: 'links',
        items: [{ text: 'Waste Duty of Care Code of Practice', url: 'https://www.gov.uk/government/publications/waste-duty-of-care-code-of-practice' }],
      },
    ],
  },
  {
    id: 'unlicensed-carrier-risks',
    tag: 'Risk',
    date: '14 March 2024',
    title: 'The Risks of Using an Unlicensed Waste Carrier',
    excerpt: 'Businesses using unregistered carriers — even unknowingly — can be held partially liable. Prosecution, fixed penalty notices, clean-up costs and reputational damage can follow.',
    mins: 4,
    image: '/images/unlicensed-carrier.png',
    imageAlt: 'Risks of unlicensed waste carriers',
    content: [
      {
        type: 'p',
        text: "The UK waste industry still suffers from fly-tipping and illegal waste movements. Many of these incidents originate from unregistered carriers offering 'cheap' disposal services. Businesses who use them — even unknowingly — can be held partially liable.",
      },
      { type: 'h3', text: 'Consequences of Using an Unlicensed Carrier' },
      {
        type: 'ul',
        items: ['Prosecution under Duty of Care law', 'Fixed penalty notices', 'Costs for clean-up or remediation', 'Reputational damage'],
      },
      { type: 'h3', text: 'How to Stay Compliant' },
      {
        type: 'ul',
        items: [
          'Check the carrier on the EA public register',
          'Request a Waste Transfer Note for every collection',
          'Ensure EWC codes are accurate',
          'Confirm the disposal site is permitted',
        ],
      },
      { type: 'h3', text: 'Verify a Carrier' },
      {
        type: 'links',
        items: [{ text: 'Environment Agency Public Register', url: 'https://environment.data.gov.uk/public-register/view/search-waste-carriers-brokers' }],
      },
    ],
  },
  {
    id: 'waste-transfer-note',
    tag: 'Documentation',
    date: '3 May 2024',
    title: 'What Is a Waste Transfer Note?',
    excerpt: 'A Waste Transfer Note is a legal document required whenever waste changes hands. It must be kept for a minimum of two years and must be available during inspections.',
    mins: 3,
    image: null,
    imageAlt: null,
    content: [
      {
        type: 'p',
        text: "A Waste Transfer Note (WTN) is a legal document required whenever waste changes hands between two parties — whether for collection, transport, or disposal. It forms the audit trail proving that waste has been managed responsibly and in line with UK legislation under the Environmental Protection Act 1990.",
      },
      {
        type: 'p',
        text: 'WTNs apply to most non-hazardous waste, and must be completed for every load unless a "season ticket" arrangement is in place for repeat collections. The note records who produced the waste, who collected it, the carrier registration number, the EWC code, quantity and description, the collection address, and where the waste will be taken.',
      },
      {
        type: 'p',
        text: 'WTNs must be kept for a minimum of two years and must be available during inspections. Electronic versions including PDFs are accepted by regulators.',
      },
      { type: 'h3', text: 'Further Guidance' },
      {
        type: 'links',
        items: [{ text: 'Government – Managing Your Waste', url: 'https://www.gov.uk/managing-your-waste-an-overview' }],
      },
    ],
  },
  {
    id: 'choose-waste-contractor',
    tag: 'Contractors',
    date: '19 June 2024',
    title: 'How to Choose a Compliant Waste Contractor',
    excerpt: 'Under UK Duty of Care laws, you are responsible for ensuring your waste is handled by legitimate and licensed operators. Here is what to check before appointing anyone.',
    mins: 5,
    image: null,
    imageAlt: null,
    content: [
      {
        type: 'p',
        text: "Choosing a compliant waste contractor is essential to protecting your business from legal risk, financial penalties, and environmental harm. Under UK Duty of Care laws, you are responsible for ensuring your waste is handled by legitimate and licensed operators.",
      },
      { type: 'h3', text: 'Before Appointing a Contractor, Check:' },
      {
        type: 'ul',
        items: [
          'Waste Carrier Registration — verify on the EA public register.',
          'Insurance — adequate public liability and pollution cover.',
          'Disposal Routes — confirm destination sites are fully permitted.',
          'Documentation — they must provide compliant WTNs or Consignment Notes.',
          'Vehicle Standards — roadworthy and suitable for the waste stream.',
        ],
      },
      {
        type: 'p',
        text: 'A non-compliant contractor exposes your business to prosecution. Always carry out checks, keep records, and periodically re-verify licences as they can expire or be revoked.',
      },
      { type: 'h3', text: 'Check the Register' },
      {
        type: 'links',
        items: [{ text: 'EA Waste Carrier Registration Search', url: 'https://environment.data.gov.uk/public-register/view/search-waste-carriers-brokers' }],
      },
    ],
  },
  {
    id: 'checks-before-tipping',
    tag: 'Site Checks',
    date: '11 September 2024',
    title: 'What Checks Should You Do Before Tipping at a Waste Site?',
    excerpt: 'Before tipping any waste at a facility, both producers and carriers must verify the site is compliant, permitted, safe and suitable for the waste being deposited.',
    mins: 4,
    image: null,
    imageAlt: null,
    content: [
      {
        type: 'p',
        text: "Before tipping any waste at a disposal or treatment facility, both waste producers and carriers have a responsibility to ensure that the site is compliant, permitted, safe, and suitable for the waste being deposited. This is a key part of the UK Duty of Care framework.",
      },
      { type: 'h3', text: 'Key Checks You Must Carry Out' },
      {
        type: 'ul',
        items: [
          'Check the site\'s permit — verify it covers the specific EWC codes you are delivering.',
          'Check opening times and restrictions — some sites restrict certain waste types or vehicle sizes.',
          'Ensure the waste matches the description — mixed or contaminated loads may be rejected.',
          'Verify safety rules — many sites require PPE, induction procedures, or specific access routes.',
          'Check pricing and acceptance criteria — some sites require pre-approval or booking confirmations.',
          'Confirm duty of care documents — WTN or consignment note must be completed prior to arrival.',
        ],
      },
      {
        type: 'p',
        text: 'A quick verification can prevent rejected loads, delays, or non-compliance issues. Never tip at a site if you are unsure about its legal status or suitability.',
      },
      { type: 'h3', text: 'Verify a Site Permit' },
      {
        type: 'links',
        items: [{ text: 'EA Environmental Permit Public Register', url: 'https://environment.data.gov.uk/public-register/view/search-environmental-permits' }],
      },
    ],
  },
  {
    id: 'construction-demolition-waste',
    tag: 'Construction',
    date: '7 November 2024',
    title: 'Construction & Demolition Waste: How to Classify and Dispose of It Legally',
    excerpt: 'C&D waste accounts for over 60% of total UK waste generated. Despite this, many contractors and site managers still get classification wrong — leading to rejected loads and regulatory notices.',
    mins: 6,
    image: '/images/construction-waste.png',
    imageAlt: 'Construction and demolition waste recycling site',
    content: [
      {
        type: 'p',
        text: 'Construction and demolition (C&D) waste is one of the largest waste streams in the UK, accounting for over 60% of total waste generated. Despite this, many contractors and site managers still get classification wrong — leading to rejected loads, regulatory notices, and unnecessary disposal costs.',
      },
      { type: 'h3', text: 'Common C&D Waste EWC Codes' },
      {
        type: 'ul',
        items: [
          '17 01 01 — Concrete (non-hazardous)',
          '17 01 02 — Bricks (non-hazardous)',
          '17 02 01 — Wood (non-hazardous)',
          '17 02 03 — Plastics (non-hazardous)',
          '17 05 04 — Soil and stones not containing hazardous substances',
          '17 06 05* — Construction materials containing asbestos (hazardous)',
        ],
      },
      { type: 'h3', text: 'Mixed vs Segregated Loads' },
      {
        type: 'p',
        text: 'Mixed C&D waste is typically classified under 17 09 04. However, this is often more expensive to dispose of than segregated streams. Separating concrete, timber, metals and plastics at source allows each fraction to be sent to a more cost-effective facility.',
      },
      { type: 'h3', text: 'Asbestos — the Critical Hazard' },
      {
        type: 'p',
        text: 'Asbestos-containing materials found in older buildings must be handled with extreme care. Removal requires a licensed contractor, and disposal can only go to a facility holding the appropriate hazardous waste permit. Never mix ACMs with other waste streams.',
      },
      { type: 'h3', text: 'Useful Links' },
      {
        type: 'links',
        items: [
          { text: 'GOV.UK – Classifying construction waste', url: 'https://www.gov.uk/guidance/how-to-classify-different-types-of-waste' },
          { text: 'HSE Asbestos guidance', url: 'https://www.hse.gov.uk/asbestos/' },
        ],
      },
    ],
  },
  {
    id: 'hazardous-waste-guide',
    tag: 'Hazardous',
    date: '16 January 2025',
    title: 'Hazardous Waste: A Plain-English Guide for UK Businesses',
    excerpt: 'Hazardous waste rules in the UK are often more demanding than businesses expect. Even small quantities can trigger significant legal obligations — and getting it wrong can mean prosecution.',
    mins: 6,
    image: '/images/hazardous-waste.png',
    imageAlt: 'Labelled hazardous waste drums at a licensed facility',
    content: [
      {
        type: 'p',
        text: "Hazardous waste rules in the UK are often more demanding than businesses expect. Even small quantities — sometimes as little as one drum — can trigger significant legal obligations. Getting it wrong can mean prosecution, remediation costs, and reputational damage.",
      },
      { type: 'h3', text: 'What Makes Waste "Hazardous"?' },
      {
        type: 'p',
        text: 'A waste is hazardous if it possesses one or more of 15 hazardous properties defined in UK legislation, including HP3 (Flammable), HP5 (Specific target organ toxicity), HP6 (Acute toxicity), and HP14 (Ecotoxic). These are assessed using the CLP Regulation and WM3 Technical Guidance.',
      },
      { type: 'h3', text: 'Consignment Notes — Not Transfer Notes' },
      {
        type: 'p',
        text: 'Hazardous waste requires a Hazardous Waste Consignment Note rather than a standard Waste Transfer Note. This must be completed before the waste moves, and all parties must sign it. Consignment notes must be retained for three years.',
      },
      { type: 'h3', text: 'Common Hazardous Waste Types in Business' },
      {
        type: 'ul',
        items: [
          'Fluorescent tubes and LED lighting (mercury-containing)',
          'Batteries and accumulators',
          'IT equipment containing hazardous components',
          'Contaminated oils, solvents and cleaning agents',
          'Paint, adhesives and resins',
          'Clinical or pharmaceutical waste',
        ],
      },
      { type: 'h3', text: 'Useful Links' },
      {
        type: 'links',
        items: [
          { text: 'GOV.UK – Disposing of hazardous waste', url: 'https://www.gov.uk/dispose-hazardous-waste' },
          { text: 'WM3 Technical Guidance (PDF)', url: 'https://assets.publishing.service.gov.uk/media/6152d0b78fa8f5610b9c222b/Waste_classification_technical_guidance_WM3.pdf' },
        ],
      },
    ],
  },
  {
    id: 'skip-hire-law',
    tag: 'Skip Hire',
    date: '5 March 2025',
    title: 'Skip Hire and the Law: What Your Business Needs to Know',
    excerpt: 'The legal responsibilities attached to a skip are more involved than many businesses realise. The Duty of Care for the waste remains with you as the producer — even when a skip hire company collects it.',
    mins: 5,
    image: '/images/skip-hire.png',
    imageAlt: 'Skip hire lorry collecting waste on a UK road',
    content: [
      {
        type: 'p',
        text: "Hiring a skip seems straightforward — but the legal responsibilities attached to that skip are more involved than many businesses realise. From permit requirements to prohibited items, understanding the rules helps you avoid fines and ensures your waste ends up at a legitimate site.",
      },
      { type: 'h3', text: 'Who Is Responsible for the Waste?' },
      {
        type: 'p',
        text: 'Even when you hire a skip, the Duty of Care for the waste remains with you as the waste producer until it is properly received and accepted by a licensed facility. If the skip hire company tips your waste illegally, you can face enforcement action alongside them.',
      },
      { type: 'h3', text: 'Skips on Public Land Require a Permit' },
      {
        type: 'p',
        text: 'If the skip is placed on a public highway, the skip hire company must hold a skip permit from your local council. The skip must also carry reflective markers and lighting after dark.',
      },
      { type: 'h3', text: 'What You Cannot Put in a Skip' },
      {
        type: 'ul',
        items: [
          'Asbestos-containing materials',
          'Batteries and fluorescent tubes',
          'Tyres (above small quantities)',
          'Electrical and electronic equipment (WEEE)',
          'Paint, solvents, oils and chemicals',
          'Clinical or pharmaceutical waste',
        ],
      },
      { type: 'h3', text: 'Useful Links' },
      {
        type: 'links',
        items: [
          { text: 'Check if a skip company is registered', url: 'https://environment.data.gov.uk/public-register/view/search-waste-carriers-brokers' },
          { text: 'Duty of Care Code of Practice', url: 'https://www.gov.uk/guidance/waste-duty-of-care-code-of-practice' },
        ],
      },
    ],
  },
  {
    id: 'pfas-forever-chemicals',
    tag: 'PFAS',
    date: '24 February 2026',
    title: 'PFAS "Forever Chemicals" and Waste: What UK Businesses Need to Know',
    excerpt: "In February 2026, the UK published its landmark PFAS Plan. For businesses that produce, handle or dispose of waste, the implications are significant and the regulatory landscape will change substantially by 2028.",
    mins: 8,
    image: '/images/pfas-forever-chemicals.png',
    imageAlt: 'River water monitoring for PFAS contamination in the UK',
    content: [
      {
        type: 'p',
        text: "In February 2026, the UK government published its landmark PFAS Plan: Building a Safer Future Together — a comprehensive national strategy to address one of the most significant chemical challenges of our time. For businesses that produce, handle or dispose of waste, the implications are significant and growing.",
      },
      { type: 'h3', text: 'What Are PFAS?' },
      {
        type: 'p',
        text: 'PFAS (per- and poly-fluoroalkyl substances) are a group of thousands of man-made chemicals used across a wide range of industries. Their extreme chemical stability means they persist in the environment for decades or centuries without breaking down, earning them the name "forever chemicals." Common uses include non-stick cookware, water-repellent textiles, food packaging, firefighting foams, electronics manufacture, and medical devices.',
      },
      { type: 'h3', text: 'PFAS and POPs: Current Waste Obligations' },
      {
        type: 'p',
        text: 'Certain PFAS are already classified as Persistent Organic Pollutants (POPs) under the Stockholm Convention. These include PFOS, PFOA and PFHxS — chemicals that are now prohibited and subject to strict waste management requirements. Waste containing these substances must be disposed of through high-temperature incineration. Standard landfill is not an acceptable route.',
      },
      { type: 'h3', text: 'What Should Businesses Do Now?' },
      {
        type: 'ul',
        items: [
          'Audit your waste streams — identify whether any processes involve PFAS.',
          'Review disposal routes — ensure PFAS-containing waste goes to a facility with the appropriate permit.',
          'Monitor the regulatory pipeline — the PFAS Plan commits to over 25 specific actions by 2028.',
          'Engage with your waste contractor — ask how they classify and dispose of PFAS-containing waste.',
        ],
      },
      { type: 'h3', text: 'Useful Links' },
      {
        type: 'links',
        items: [
          { text: 'GOV.UK – PFAS Plan: Building a Safer Future Together (2026)', url: 'https://www.gov.uk/government/publications/pfas-plan/pfas-plan-building-a-safer-future-together' },
          { text: 'GOV.UK – Disposing of hazardous waste', url: 'https://www.gov.uk/dispose-hazardous-waste' },
        ],
      },
    ],
  },
  {
    id: 'digital-waste-tracking-october-2026',
    tag: 'Digital Tracking',
    date: '30 March 2026',
    title: 'Mandatory Digital Waste Tracking: What Permit Holders Must Do Before October 2026',
    excerpt: 'From October 2026, every permitted and licensed waste receiving site in England, Wales and Northern Ireland must record all waste receipts digitally. Paper transfer notes alone will no longer be sufficient. Here is what the change means in practice and what you need to do now.',
    mins: 7,
    image: null,
    imageAlt: null,
    content: [
      {
        type: 'p',
        text: "The way waste movements are recorded in the UK is about to change fundamentally. From October 2026, every permitted and licensed waste receiving site in England, Wales and Northern Ireland must record all waste receipts through the government's new Digital Waste Tracking Service (DWTS). Scotland follows in January 2027. For sites that hold an environmental permit to receive waste — transfer stations, MRFs, treatment facilities, incinerators, landfills and household waste recycling centres accepting commercial waste — this is not optional. It will be a legal requirement, and paper-based records alone will no longer be sufficient.",
      },
      {
        type: 'p',
        text: "This is widely regarded as the most significant change to waste regulation in England since the introduction of the Duty of Care in 1990. If your site receives waste, you need to understand what is changing, when it is changing, and what you are expected to have in place.",
      },
      { type: 'h3', text: 'Why Is This Being Introduced?' },
      {
        type: 'p',
        text: "The existing system for recording waste movements is fragmented, inconsistent and heavily reliant on paper. Waste transfer notes and hazardous waste consignment notes are easy to falsify, difficult to trace and provide regulators with information that is often weeks or months out of date by the time it reaches them. The Environment Agency estimates that around 18% of waste in England is criminally managed each year — including fly-tipping, illegal exports, deliberate misclassification and operation of unlicensed sites — at a cost to the UK economy of approximately £1 billion annually.",
      },
      {
        type: 'p',
        text: "Mandatory digital tracking aims to close the information gap. By requiring real-time digital records of every waste movement, regulators will be able to spot patterns of non-compliance far earlier, cross-reference what sites are claiming to receive against what their permits actually allow, and build a much clearer national picture of where waste goes and how it is managed.",
      },
      { type: 'h3', text: 'The Timeline in Full' },
      {
        type: 'ul',
        items: [
          'Autumn 2025 — Private beta launched: invited permitted receiving sites began testing the service.',
          'Spring 2026 — Public beta: all permitted and licensed receiving site operators can voluntarily use the service.',
          'April 2026 — Secondary legislation laid across all four nations mandating use from October.',
          'October 2026 — MANDATORY for all permitted/licensed receiving sites in England, Wales and Northern Ireland.',
          'January 2027 — Mandatory for receiving sites in Scotland.',
          'October 2027 — Phase 2: mandatory for waste carriers, brokers, dealers and exporters.',
        ],
      },
      {
        type: 'p',
        text: "It is worth noting that October 2026 is a Phase 1 deadline only. Phase 2 — which brings in carriers, brokers, dealers and exporters — follows a year later in October 2027. If you are a waste producer or carrier who is not also a permitted receiving site, you are not yet in scope for Phase 1, but you should begin preparing now because your customers and receiving sites will expect digital records from you when Phase 2 arrives.",
      },
      { type: 'h3', text: 'What Specifically Must Receiving Sites Do?' },
      {
        type: 'p',
        text: "From October 2026, permitted and licensed receiving site operators must record the details of every waste receipt in the DWTS. This replaces the existing requirement to retain paper waste transfer notes and hazardous waste consignment notes for receiving sites — though it does not replace all documentation obligations on the producer or carrier side until Phase 2.",
      },
      {
        type: 'p',
        text: "Each record must include: the EWC code of the waste received, the quantity, the carrier details, the producer details, the authorisation number of the delivering carrier, and the intended waste management method — for example, whether the waste will be recycled, recovered or disposed of, and by what process. Sites must also specifically flag any waste containing Persistent Organic Pollutants (POPs) so it can be traced to an authorised destruction facility.",
      },
      {
        type: 'p',
        text: "The service is designed to be API-first. Most operators are expected to integrate the DWTS with their existing waste management software so that records are created automatically at the weighbridge or point of receipt, rather than manually entered after the fact. DEFRA is also providing a manual portal for smaller sites, and a spreadsheet submission route as a temporary fallback — though this is expected to be withdrawn after October 2027.",
      },
      { type: 'h3', text: 'What Does This Mean for Paper Waste Transfer Notes?' },
      {
        type: 'p',
        text: "For receiving sites, the paper WTN as a standalone record becomes legally insufficient from October 2026. A vehicle arriving at your gate with only a paper note will need to have its details entered into the DWTS before the waste can be accepted. Sites that attempt to manually input paper records at the gate will face significant operational pressure. Several major waste processors have already indicated they will refuse loads that are not pre-notified digitally — meaning the carrier must have created a record in the system before arriving.",
      },
      {
        type: 'p',
        text: "Producers and carriers are not mandated until October 2027, but in practice they will need to adapt much sooner, because receiving sites will start demanding digital pre-notification as a condition of accepting loads well before that deadline.",
      },
      { type: 'h3', text: 'The Annual Service Charge' },
      {
        type: 'p',
        text: "Registration for the DWTS carries an upfront annual charge of £26, conferring 12 months of rolling access to the service. This charge applies when the service becomes mandatory. For sites already participating in the private or public beta, DEFRA has indicated that data provided during beta phases will be reviewed by regulators and policy analysts for testing purposes.",
      },
      { type: 'h3', text: 'What About Sites Operating Under Exemptions?' },
      {
        type: 'p',
        text: "Sites operating under registered exemptions rather than full environmental permits are not mandated in Phase 1. The government has acknowledged that this is a much larger and more diverse group and has stated it will determine whether specific sectors within this group will be brought into scope alongside permit holders at a later stage. If you operate under an exemption, you are not currently in scope — but you should monitor the situation as the scope of Phase 2 is confirmed.",
      },
      { type: 'h3', text: 'What Should Permit Holders Be Doing Right Now?' },
      {
        type: 'ul',
        items: [
          'Register for the public beta from spring 2026 — voluntary use before October gives you time to identify problems without compliance risk.',
          'Audit your software — check whether your existing waste management platform has a confirmed DWTS API integration. If it does not, you need to act now. The October 2026 window is tight for custom development.',
          'Review your accepted waste types — the DWTS will make it much easier for regulators to cross-reference what your site is recording against what your permit allows. Clean up any inconsistencies in your records before the data becomes visible to the EA in real time.',
          'Brief your weighbridge and site staff — the operational change at the point of receipt is significant. Staff need to understand the new process well before it becomes mandatory.',
          'Notify your suppliers — even though carriers are not mandated until October 2027, your site may want to require digital pre-notification earlier. Communicate this to regular customers and carriers so they have time to prepare.',
          'Budget for the £26 annual service charge and any software integration costs.',
          'Sign up to the DEFRA Circular Economy newsletter and join the relevant working groups to stay informed as the API documentation and Phase 2 details are confirmed.',
        ],
      },
      { type: 'h3', text: 'The Bigger Picture' },
      {
        type: 'p',
        text: "Digital waste tracking is not arriving in isolation. It sits alongside Simpler Recycling — which became mandatory for workplaces in England from 31 March 2025 — and the broader tightening of Environment Agency enforcement activity. From February 2026, the EA introduced a new hourly charge of £118 for regulatory work linked to non-compliance with Simpler Recycling. The direction of travel is clear: regulators are moving towards real-time data, tighter enforcement and a lower tolerance for documentation gaps.",
      },
      {
        type: 'p',
        text: "For legitimate operators, mandatory digital tracking should ultimately be a levelling-up measure. Sites that operate within their permit conditions, accept the right waste types and maintain accurate records will have nothing to fear. The sites that should be worried are those whose paper records have historically papered over operational gaps. When data is flowing to the EA in real time, those gaps become much harder to hide.",
      },
      { type: 'h3', text: 'Useful Links' },
      {
        type: 'links',
        items: [
          { text: 'GOV.UK — Digital Waste Tracking Service (official page)', url: 'https://www.gov.uk/government/publications/digital-waste-tracking-service/digital-waste-tracking-service' },
          { text: 'Apply to test the receipt of waste service (private beta)', url: 'https://www.gov.uk/government/publications/digital-waste-tracking-service/digital-waste-tracking-service' },
          { text: 'DEFRA Circular Economy newsletter (sign up for updates)', url: 'https://www.gov.uk/government/publications/digital-waste-tracking-service/digital-waste-tracking-service' },
          { text: "GOV.UK — Mandatory digital waste tracking (background)", url: 'https://www.gov.uk/government/publications/digital-waste-tracking-service/mandatory-digital-waste-tracking' },
        ],
      },
    ],
  },
];

export const TAG_STYLES = {
  'Classification':    { bg: '#dbeafe', text: '#1e40af' },
  'Permits':           { bg: '#dcfce7', text: '#166534' },
  'Compliance':        { bg: '#d1fae5', text: '#065f46' },
  'Duty of Care':      { bg: '#fef3c7', text: '#92400e' },
  'Documentation':     { bg: '#ede9fe', text: '#4c1d95' },
  'Risk':              { bg: '#fee2e2', text: '#991b1b' },
  'Contractors':       { bg: '#d1fae5', text: '#065f46' },
  'Site Checks':       { bg: '#fef3c7', text: '#92400e' },
  'Construction':      { bg: '#ffedd5', text: '#9a3412' },
  'Hazardous':         { bg: '#fce7f3', text: '#9d174d' },
  'Skip Hire':         { bg: '#e0e7ff', text: '#3730a3' },
  'PFAS':              { bg: '#f0fdf4', text: '#14532d' },
  'Digital Tracking':  { bg: '#e0f2fe', text: '#0c4a6e' },
};
