import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle, ChevronRight, ChevronLeft, HelpCircle, ArrowRight, BookOpen, FileText } from 'lucide-react';

/**
 * WM3Guide
 * A step-by-step wizard based on the EA's WM3 technical guidance
 * for classifying waste as hazardous or non-hazardous.
 * Follows the official 7-step classification process from WM3 (v1.2 GB).
 *
 * Props:
 *   onSelectEWC(result) — called when user confirms a code from the guide
 *   onClose — close the guide
 */
export default function WM3Guide({ onClose, onSelectEWC, searchEWCCodes, isHazardous }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);

  const answer = (key, val, nextStep) => {
    setAnswers(a => ({ ...a, [key]: val }));
    setStep(nextStep !== undefined ? nextStep : s => s + 1);
  };

  const handleSearch = (q) => {
    setSearchQuery(q);
    if (q.trim().length >= 2) setSearchResults(searchEWCCodes(q, 12));
    else setSearchResults([]);
  };

  const handleSelectResult = (r) => {
    setSelectedResult(r);
    setSearchResults([]);
    setSearchQuery(`${r.code} – ${r.description}`);
  };

  const handleConfirm = () => {
    if (selectedResult && onSelectEWC) { onSelectEWC(selectedResult); onClose(); }
  };

  const HP_PROPERTIES = [
    { code: 'HP1',  name: 'Explosive',                                    desc: 'Waste which can cause explosion by flame, shock or friction' },
    { code: 'HP2',  name: 'Oxidising',                                    desc: 'Waste which causes or contributes to combustion of other materials' },
    { code: 'HP3',  name: 'Flammable',                                    desc: 'Flash point ≤60°C (liquid), self-heating, water-reactive, or self-igniting solids/gases' },
    { code: 'HP4',  name: 'Irritant',                                     desc: 'Causes skin irritation (H315) or serious eye irritation (H319)' },
    { code: 'HP5',  name: 'STOT / Aspiration hazard',                     desc: 'Specific target organ toxicity or aspiration hazard' },
    { code: 'HP6',  name: 'Acute toxic',                                  desc: 'Oral, dermal or inhalation toxicity (categories 1–4)' },
    { code: 'HP7',  name: 'Carcinogenic',                                 desc: 'Causes cancer (categories 1A, 1B or 2)' },
    { code: 'HP8',  name: 'Corrosive',                                    desc: 'Causes skin corrosion (H314)' },
    { code: 'HP9',  name: 'Infectious',                                   desc: 'Contains viable micro-organisms or toxins causing disease in humans or animals' },
    { code: 'HP10', name: 'Toxic for reproduction',                       desc: 'Adverse effects on sexual function, fertility or development' },
    { code: 'HP11', name: 'Mutagenic',                                    desc: 'Causes gene mutations in somatic cells (categories 1A, 1B or 2)' },
    { code: 'HP12', name: 'Releases acute toxic gas',                     desc: 'Releases acute toxic gases (H330/H331/H332) on contact with water or acid' },
    { code: 'HP13', name: 'Sensitising',                                  desc: 'Contains substances causing sensitisation of the skin (H317) or respiratory system (H334)' },
    { code: 'HP14', name: 'Ecotoxic',                                     desc: 'Presents immediate or delayed risks to one or more sectors of the aquatic environment' },
    { code: 'HP15', name: 'Waste capable of exhibiting a hazardous property after disposal', desc: 'Can yield another substance with a hazardous property after disposal (e.g. a leachate)' },
  ];

  const POPS_EXAMPLES = [
    'Aldrin','Chlordane','Dieldrin','Endrin','Heptachlor','Hexachlorobenzene (HCB)',
    'Mirex','Toxaphene','Polychlorinated biphenyls (PCBs)','DDT','Chlordecone',
    'Hexabromobiphenyl','Pentachlorobenzene','PCDD/PCDF (dioxins & furans)',
  ];

  const steps = [
    // ── Step 0 — Intro ───────────────────────────────────────────────────────
    {
      title: 'WM3 Waste Classification Guide',
      subtitle: 'Based on EA Technical Guidance WM3 (v1.2 GB)',
      render: () => (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 font-semibold mb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />What is WM3?
            </p>
            <p className="text-sm text-blue-700 leading-relaxed">
              WM3 is the Environment Agency's technical guidance for classifying waste using the European Waste Catalogue (EWC) / List of Wastes (LoW). It determines whether waste is <strong>hazardous</strong> or <strong>non-hazardous</strong> — a legal requirement before waste is moved, recovered or disposed of.
            </p>
          </div>
          <div className="space-y-1.5">
            <p className="text-sm font-semibold text-gray-700">The official 7-step WM3 classification process:</p>
            {[
              'Step 1 — Check if the waste needs to be classified',
              'Step 2 — Identify the EWC/LoW code(s) that may apply',
              'Step 3 — Determine what assessment is needed (entry type)',
              'Step 4 — Determine the chemical composition of the waste',
              'Step 5 — Identify hazardous substances and/or POPs',
              'Step 6 — Assess the hazardous properties (HP1–HP15)',
              'Step 7 — Assign the classification code and complete documentation',
            ].map((s, i) => (
              <div key={i} className="flex gap-2 text-sm text-gray-600">
                <span className="text-green-600 font-bold mt-0.5">→</span><span>{s}</span>
              </div>
            ))}
          </div>
          <button onClick={() => setStep(1)} className="w-full py-3 bg-green-700 hover:bg-green-800 text-white rounded-lg font-semibold flex items-center justify-center gap-2">
            Start Classification <ChevronRight className="w-4 h-4" />
          </button>
          <p className="text-xs text-gray-400 text-center">
            This guide assists with waste identification. Final classification responsibility rests with the waste producer. Refer to the full WM3 guidance at gov.uk for complex cases.
          </p>
        </div>
      ),
    },

    // ── Step 1 — Check if waste needs classifying ────────────────────────────
    {
      title: 'Step 1: Does this waste need to be classified?',
      subtitle: 'Nearly all waste must be classified before it is moved',
      render: () => (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Nearly all household, commercial and industrial waste must be classified. A small number of exclusions apply (WM3 Box 2.1).</p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-xs font-semibold text-amber-800 mb-1 flex items-center gap-1.5"><HelpCircle className="w-4 h-4" />Exclusions from classification (WM3 Box 2.1)</p>
            <ul className="text-xs text-amber-700 space-y-1 list-disc list-inside">
              <li>Radioactive waste (separate legislation applies)</li>
              <li>Gaseous effluent emitted into the atmosphere</li>
              <li>Waste water (other than waste in liquid form)</li>
              <li>Decommissioned explosives</li>
              <li>Faecal matter, straw and other natural, non-dangerous agricultural materials</li>
              <li>Uncontaminated soil and naturally occurring material excavated during construction where it is certain the material is not waste</li>
            </ul>
          </div>
          <p className="text-sm font-semibold text-gray-700">Is your material waste, and does it need to be classified?</p>
          <div className="space-y-2">
            <button onClick={() => answer('needs_classification', 'yes', 2)}
              className="w-full text-left px-4 py-3 border-2 border-green-200 hover:border-green-400 hover:bg-green-50 rounded-lg transition-colors">
              <p className="font-semibold text-sm text-green-800">Yes — it is waste and needs to be classified</p>
              <p className="text-xs text-gray-500 mt-0.5">Proceed to identify the correct EWC/LoW code.</p>
            </button>
            <button onClick={() => answer('needs_classification', 'excluded', 99)}
              className="w-full text-left px-4 py-3 border-2 border-gray-200 hover:border-gray-400 hover:bg-gray-50 rounded-lg transition-colors">
              <p className="font-semibold text-sm text-gray-700">No — it falls within an exclusion listed above</p>
              <p className="text-xs text-gray-500 mt-0.5">Classification is not required. Check the relevant legislation for this excluded material type.</p>
            </button>
            <button onClick={() => answer('needs_classification', 'unsure', 2)}
              className="w-full text-left px-4 py-3 border-2 border-amber-200 hover:border-amber-400 hover:bg-amber-50 rounded-lg transition-colors">
              <p className="font-semibold text-sm text-amber-800">Unsure — proceed with classification to be safe</p>
              <p className="text-xs text-gray-500 mt-0.5">If in doubt, classify the waste. See 'Legal definition of waste guidance' on gov.uk.</p>
            </button>
          </div>
        </div>
      ),
    },

    // ── Step 2 — Identify EWC/LoW code ──────────────────────────────────────
    {
      title: 'Step 2: Identify the EWC/LoW code',
      subtitle: 'Find the code(s) that may apply to your waste',
      render: () => (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">The EWC/LoW is structured primarily by the industry or process generating the waste. Select the best description:</p>
          {[
            { val: 'construction',   label: '🏗️ Construction & demolition',      hint: 'Chapter 17 — concrete, bricks, tiles, mixed C&D waste, asbestos, excavated soil from contaminated sites' },
            { val: 'municipal',      label: '🏠 Municipal / household & commercial', hint: 'Chapter 20 — household & similar commercial/institutional waste, garden waste, bulky items, separately collected fractions' },
            { val: 'packaging',      label: '📦 Packaging & absorbents',          hint: 'Chapter 15 — waste packaging, absorbents, wiping cloths, filter materials, contaminated PPE' },
            { val: 'healthcare',     label: '🏥 Healthcare / veterinary',          hint: 'Chapter 18 — clinical waste, sharps, body parts, infectious waste, pharmaceuticals, dental amalgam' },
            { val: 'oils_solvents',  label: '🛢️ Oils, solvents & fuels',          hint: 'Chapter 13 (waste oil & liquid fuels) and Chapter 14 (organic solvents, refrigerants, propellants)' },
            { val: 'vehicle',        label: '🚗 Vehicles, tyres & batteries',      hint: 'Chapter 16 01 (end-of-life vehicles, tyres, catalytic converters) and Chapter 16 06 (batteries & accumulators)' },
            { val: 'electrical',     label: '💡 Electrical & electronic (WEEE)',   hint: 'Chapter 16 02 — discarded equipment, fluorescent tubes, CRT screens, PCBs, electronic components' },
            { val: 'industrial',     label: '🏭 Industrial / manufacturing process', hint: 'Chapters 04–12 — textiles (04), petroleum (05), inorganic chemicals (06), organic chemicals (07), paints/inks (08), metals (11–12), thermal processes (10)' },
            { val: 'mixed',          label: '♻️ Mixed / non-specific',             hint: 'Chapter 16 — wastes not otherwise specified, off-specification products, mixed wastes from non-household sources' },
            { val: 'other',          label: '🔍 Other / not sure',                 hint: 'Proceed to the EWC search in Step 7 to find your code by keyword' },
          ].map(o => (
            <button key={o.val} onClick={() => answer('origin', o.val, 3)}
              className="w-full text-left px-4 py-3 border-2 border-gray-200 hover:border-green-400 hover:bg-green-50 rounded-lg transition-colors">
              <p className="font-semibold text-sm text-gray-800">{o.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{o.hint}</p>
            </button>
          ))}
        </div>
      ),
    },

    // ── Step 3 — Entry type ──────────────────────────────────────────────────
    {
      title: 'Step 3: Determine the entry type',
      subtitle: 'Look up your code in the List of Wastes (WM3 Appendix A)',
      render: () => (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
            Look up your waste in the List of Wastes (LoW / EWC), available in Appendix A of WM3 on gov.uk. Every entry is one of four types — this determines whether further assessment is needed.
          </div>
          <div className="grid grid-cols-1 gap-3">
            <button onClick={() => answer('entry_type', 'absolute_hazardous', 7)}
              className="text-left px-4 py-3 border-2 border-red-200 hover:border-red-400 hover:bg-red-50 rounded-lg transition-colors">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-white bg-red-600 px-2 py-0.5 rounded">AH</span>
                <p className="font-semibold text-sm text-red-800">Absolute Hazardous entry (marked *)</p>
              </div>
              <p className="text-xs text-gray-500">Only one entry exists — always hazardous. Steps 4–6 are <strong>not needed</strong>. Proceed directly to Step 7 to assign the code and complete a Consignment Note.</p>
            </button>
            <button onClick={() => answer('entry_type', 'absolute_non', 7)}
              className="text-left px-4 py-3 border-2 border-green-200 hover:border-green-400 hover:bg-green-50 rounded-lg transition-colors">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-white bg-green-700 px-2 py-0.5 rounded">AN</span>
                <p className="font-semibold text-sm text-green-800">Absolute Non-Hazardous entry (no * version exists)</p>
              </div>
              <p className="text-xs text-gray-500">Non-hazardous in most cases without further assessment. Proceed to Step 7 (Waste Transfer Note required). Note: if the waste unexpectedly displays a hazardous property, this must be noted on the WTN.</p>
            </button>
            <button onClick={() => answer('entry_type', 'mirror', 4)}
              className="text-left px-4 py-3 border-2 border-amber-200 hover:border-amber-400 hover:bg-amber-50 rounded-lg transition-colors">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-white bg-amber-500 px-2 py-0.5 rounded">Mirror</span>
                <p className="font-semibold text-sm text-amber-800">Mirror entry (both a * and a non-* version exist)</p>
              </div>
              <p className="text-xs text-gray-500">Two paired entries exist — one mirror hazardous (*) and one mirror non-hazardous. You must complete Steps 4–6 to determine which applies. A LoW code cannot be assigned until Steps 4–7 are complete.</p>
            </button>
            <button onClick={() => answer('entry_type', 'unsure', 2)}
              className="text-left px-4 py-3 border-2 border-gray-200 hover:border-gray-400 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="flex items-center gap-2 mb-1">
                <HelpCircle className="w-4 h-4 text-gray-500" />
                <p className="font-semibold text-sm text-gray-700">I haven't found the EWC code yet</p>
              </div>
              <p className="text-xs text-gray-500">Go back to Step 2 to identify the waste origin and search for the correct code.</p>
            </button>
          </div>
        </div>
      ),
    },

    // ── Step 4 — Chemical composition ───────────────────────────────────────
    {
      title: 'Step 4: Determine chemical composition',
      subtitle: 'Mirror entries only — required before HP assessment',
      render: () => (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
            <strong>Mirror entry:</strong> You must determine the chemical composition of the waste before you can assess its hazardous properties. A LoW code cannot be assigned until Steps 4–7 are complete.
          </div>
          <p className="text-sm text-gray-700 font-semibold">How will you determine the composition? (WM3 Step 4)</p>
          <div className="space-y-2">
            {[
              { val: 'sds',              label: '📄 Safety Data Sheet (SDS) / manufacturer information',
                hint: 'Use if the waste is a manufactured product whose composition has not changed. The SDS will list hazardous substances and their H-statement codes.' },
              { val: 'process_knowledge', label: '🏭 Process knowledge / historical data',
                hint: 'Use if you have reliable knowledge of the inputs and process generating the waste (e.g. known production chemistry, previous analyses of the same waste stream).' },
              { val: 'sampling',          label: '🧪 Sampling and analysis by a UKAS-accredited laboratory',
                hint: 'Required for soils and wastes of unknown or variable composition. Testing should target contaminants relevant to the waste\'s history — do not simply request a generic \'WM3 suite\'.' },
              { val: 'worst_case',        label: '⚠️ Worst-case substance assumption',
                hint: 'If you know the components (e.g. \'lead\', \'chromium\') but not the specific substances, identify the worst-case substance for each HP separately. The worst case may differ for each hazardous property.' },
            ].map(o => (
              <button key={o.val} onClick={() => answer('composition_method', o.val, 5)}
                className="w-full text-left px-4 py-3 border-2 border-gray-200 hover:border-green-400 hover:bg-green-50 rounded-lg transition-colors">
                <p className="font-semibold text-sm text-gray-800">{o.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{o.hint}</p>
              </button>
            ))}
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-600">
            <strong>Important (WM3):</strong> Make all reasonable efforts to determine the composition. Direct testing alone cannot classify an unknown-composition waste as non-hazardous. If genuinely uncertain, treat as hazardous as a precaution.
          </div>
        </div>
      ),
    },

    // ── Step 5 — Identify hazardous substances & POPs ────────────────────────
    {
      title: 'Step 5: Identify hazardous substances & POPs',
      subtitle: 'Check substances against CLP and the POPs list',
      render: () => (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Using the composition from Step 4, determine whether any substances are classified as <strong>hazardous substances</strong> under CLP Regulation (EC) 1272/2008, or are <strong>Persistent Organic Pollutants (POPs)</strong>.</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
            <p className="text-xs font-semibold text-blue-800">How to identify hazardous substances (WM3 Appendix B):</p>
            <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
              <li>Search the <strong>ECHA C&L Inventory</strong> (echa.europa.eu) for each substance — it shows Hazard Classes and Hazard Statement (H-) codes</li>
              <li>Check the <strong>Mandatory Classification List (MCL)</strong> in Annex VI of CLP</li>
              <li>Check the manufacturer's SDS (Sections 3 and 15)</li>
              <li>Note: the specific physical form or state of the substance may affect its classification (WM3 v1.2 update)</li>
            </ul>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-xs font-semibold text-amber-800 mb-1">Persistent Organic Pollutants (POPs) — WM3 Box 2.2 / Appendix C16</p>
            <p className="text-xs text-amber-700 mb-2">POPs must be considered for all mirror entry waste. Examples include:</p>
            <div className="flex flex-wrap gap-1">
              {POPS_EXAMPLES.map(p => <span key={p} className="text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">{p}</span>)}
            </div>
            <p className="text-xs text-amber-600 mt-2">Refer to Appendix C16 of WM3 for the full list and concentration limits.</p>
          </div>
          <p className="text-sm font-semibold text-gray-700">What did you find?</p>
          <div className="space-y-2">
            <button onClick={() => answer('substances_found', 'hazardous_found', 6)}
              className="w-full text-left px-4 py-3 border-2 border-red-200 hover:border-red-400 hover:bg-red-50 rounded-lg transition-colors">
              <p className="font-semibold text-sm text-red-800">⚠️ One or more hazardous substances and/or POPs identified</p>
              <p className="text-xs text-gray-500 mt-0.5">Proceed to Step 6 to assess HP properties against concentration thresholds.</p>
            </button>
            <button onClick={() => answer('substances_found', 'none_found', 7)}
              className="w-full text-left px-4 py-3 border-2 border-green-200 hover:border-green-400 hover:bg-green-50 rounded-lg transition-colors">
              <p className="font-semibold text-sm text-green-800">✅ No hazardous substances or POPs identified</p>
              <p className="text-xs text-gray-500 mt-0.5">No hazardous properties should be present. The mirror non-hazardous code can be assigned. Proceed to Step 7.</p>
            </button>
            <button onClick={() => answer('substances_found', 'uncertain', 6)}
              className="w-full text-left px-4 py-3 border-2 border-amber-200 hover:border-amber-400 hover:bg-amber-50 rounded-lg transition-colors">
              <p className="font-semibold text-sm text-amber-800">❓ Uncertain — apply worst-case assumption</p>
              <p className="text-xs text-gray-500 mt-0.5">Assume the worst-case substances are present and proceed to Step 6. Treat as hazardous until confirmed otherwise.</p>
            </button>
          </div>
        </div>
      ),
    },

    // ── Step 6 — HP assessment ───────────────────────────────────────────────
    {
      title: 'Step 6: Assess the hazardous properties',
      subtitle: 'Evaluate HP1–HP15 against Annex III WFD concentration thresholds',
      render: () => (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
            <strong>WM3 Step 6:</strong> Consider all 15 hazardous properties. Three methods: (1) H-statement codes with Annex III concentration thresholds, (2) calculation, or (3) direct testing. Note: direct testing alone cannot confirm non-hazardous for a waste of unknown composition. Also check for POPs above Appendix C16 limits.
          </div>
          <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
            {HP_PROPERTIES.map(hp => (
              <div key={hp.code} className="border border-gray-200 rounded-lg p-2.5">
                <div className="flex items-start gap-2">
                  <span className="font-mono text-xs font-bold text-red-700 bg-red-50 px-1.5 py-0.5 rounded mt-0.5 flex-shrink-0">{hp.code}</span>
                  <div>
                    <p className="text-xs font-semibold text-gray-800">{hp.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{hp.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm font-semibold text-gray-700">Result of HP1–HP15 and POPs assessment:</p>
          <div className="space-y-2">
            <button onClick={() => answer('hp_result', 'hazardous', 7)}
              className="w-full text-left px-4 py-3 border-2 border-red-200 hover:border-red-400 hover:bg-red-50 rounded-lg transition-colors">
              <p className="font-semibold text-sm text-red-800">⚠️ One or more HP properties apply, or POPs above limits — HAZARDOUS</p>
              <p className="text-xs text-gray-500 mt-0.5">Use the mirror hazardous (*) EWC code. A Consignment Note is required.</p>
            </button>
            <button onClick={() => answer('hp_result', 'non_hazardous', 7)}
              className="w-full text-left px-4 py-3 border-2 border-green-200 hover:border-green-400 hover:bg-green-50 rounded-lg transition-colors">
              <p className="font-semibold text-sm text-green-800">✅ No HP properties apply and no POPs above limits — NON-HAZARDOUS</p>
              <p className="text-xs text-gray-500 mt-0.5">Use the mirror non-hazardous (non-*) EWC code. A Waste Transfer Note is required.</p>
            </button>
            <button onClick={() => answer('hp_result', 'uncertain', 7)}
              className="w-full text-left px-4 py-3 border-2 border-amber-200 hover:border-amber-400 hover:bg-amber-50 rounded-lg transition-colors">
              <p className="font-semibold text-sm text-amber-800">❓ Uncertain — laboratory testing required</p>
              <p className="text-xs text-gray-500 mt-0.5">Treat as hazardous as a precaution until testing confirms otherwise. Use a Consignment Note.</p>
            </button>
          </div>
        </div>
      ),
    },

    // ── Step 7 — Assign code & documentation ────────────────────────────────
    {
      title: 'Step 7: Assign EWC code & complete documentation',
      subtitle: 'Confirm your code and the required paperwork',
      render: () => {
        const isHaz = answers.entry_type === 'absolute_hazardous' || answers.hp_result === 'hazardous' || answers.hp_result === 'uncertain';
        const isNonHaz = answers.entry_type === 'absolute_non' || answers.hp_result === 'non_hazardous' || answers.substances_found === 'none_found';

        const classLabel = isHaz
          ? { text: 'HAZARDOUS — Consignment Note required', bg: 'bg-red-50 border-red-300 text-red-800', icon: <AlertTriangle className="w-4 h-4" /> }
          : isNonHaz
            ? { text: 'NON-HAZARDOUS — Waste Transfer Note required', bg: 'bg-green-50 border-green-300 text-green-800', icon: <CheckCircle className="w-4 h-4" /> }
            : { text: 'Classification pending — search for your EWC code below', bg: 'bg-amber-50 border-amber-300 text-amber-800', icon: <HelpCircle className="w-4 h-4" /> };

        return (
          <div className="space-y-4">
            <div className={`border-2 rounded-lg p-3 ${classLabel.bg}`}>
              <p className="text-sm font-bold flex items-center gap-2">{classLabel.icon}{classLabel.text}</p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2">
              <p className="text-xs font-semibold text-gray-700 flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" />Documentation required (WM3 Step 7):</p>
              {isHaz ? (
                <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                  <li>Complete a <strong>Consignment Note</strong> before moving the waste</li>
                  <li>Record the hazardous properties (HP codes) identified in Step 6 on the note</li>
                  <li>Use the hazardous (*) EWC code</li>
                  <li>Ensure carrier holds a waste carrier registration for hazardous waste</li>
                  <li>Ensure the receiving site is permitted/licensed to accept this hazardous waste</li>
                </ul>
              ) : isNonHaz ? (
                <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                  <li>Complete a <strong>Waste Transfer Note (WTN)</strong> before moving the waste</li>
                  <li>Use the non-hazardous EWC code</li>
                  <li>If the waste unexpectedly displays a hazardous property despite an AN classification, record it on the WTN</li>
                </ul>
              ) : (
                <p className="text-xs text-gray-600">Complete the steps above to determine the required documentation type.</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Search for your EWC code by keyword</label>
              <div className="relative">
                <input type="text" value={searchQuery} onChange={e => handleSearch(e.target.value)}
                  placeholder="e.g. asbestos, concrete, used oil, fluorescent tubes..."
                  className="w-full px-3 py-2.5 border-2 border-green-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500" />
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-green-200 rounded-lg shadow-xl z-50 max-h-56 overflow-y-auto">
                    {searchResults.map(r => (
                      <button key={r.code} onClick={() => handleSelectResult(r)}
                        className="w-full text-left px-3 py-2.5 border-b border-gray-100 last:border-0 hover:bg-green-50 transition-colors">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-mono text-xs font-bold text-gray-800">{r.code}</span>
                          {isHazardous(r.description)
                            ? <span className="text-xs text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full font-semibold">Hazardous *</span>
                            : <span className="text-xs text-green-700 bg-green-50 px-1.5 py-0.5 rounded-full font-semibold">Non-hazardous</span>}
                        </div>
                        <p className="text-xs text-gray-600">{r.description}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{r.chapterKey} · {r.subName}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {selectedResult && (
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3">
                <p className="text-xs font-semibold text-green-700 mb-1">Selected EWC code:</p>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-sm font-bold text-gray-800">{selectedResult.code}</span>
                  {isHazardous(selectedResult.description)
                    ? <span className="text-xs text-red-600 bg-red-100 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Hazardous *</span>
                    : <span className="text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1"><CheckCircle className="w-3 h-3" />Non-hazardous</span>}
                </div>
                <p className="text-xs text-gray-600">{selectedResult.description}</p>
                <p className="text-xs text-gray-400 mt-0.5">{selectedResult.chapterKey} · {selectedResult.subName}</p>
              </div>
            )}

            <button onClick={handleConfirm} disabled={!selectedResult}
              className="w-full py-3 bg-green-700 hover:bg-green-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors">
              Use this EWC code & search for facilities <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        );
      },
    },

    // ── Step 99 — Excluded waste ─────────────────────────────────────────────
    {
      title: 'Waste excluded from classification',
      subtitle: 'No EWC/LoW classification required',
      render: () => (
        <div className="space-y-4">
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
            <p className="text-sm font-bold text-green-800 flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4" />This waste does not require EWC classification
            </p>
            <p className="text-sm text-green-700">This material falls within one of the exclusions in WM3 Box 2.1. EWC/LoW classification is not required.</p>
            <p className="text-sm text-green-700 mt-2">You must still comply with any other legislation applicable to this material type (e.g. radioactive waste regulations, water framework directive). Check gov.uk for the relevant guidance.</p>
          </div>
          <button onClick={onClose} className="w-full py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold">Close guide</button>
        </div>
      ),
    },
  ];

  const getStepIndex = () => step === 99 ? steps.length - 1 : Math.min(step, steps.length - 2);
  const currentStep = steps[getStepIndex()];
  const totalProgressSteps = 8;
  const progressStep = step === 99 ? totalProgressSteps : Math.min(step, totalProgressSteps);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto">

        <div className="flex items-center justify-between p-5 border-b border-blue-200 bg-blue-50 rounded-t-xl sticky top-0 z-10">
          <div>
            <h3 className="text-lg font-bold text-blue-800 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />{currentStep.title}
            </h3>
            <p className="text-xs text-blue-600 mt-0.5">{currentStep.subtitle}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/60 text-gray-500"><X className="w-5 h-5" /></button>
        </div>

        <div className="px-5 pt-3 pb-1">
          <div className="flex gap-1">
            {Array.from({ length: totalProgressSteps }).map((_, i) => (
              <div key={i} className={`flex-1 h-1 rounded-full transition-colors ${i < progressStep ? 'bg-blue-500' : 'bg-gray-200'}`} />
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-1">{step === 99 ? 'Complete' : `Step ${step} of 7`}</p>
        </div>

        <div className="p-5">
          {currentStep.render()}
          {step > 0 && step !== 99 && (
            <button onClick={() => setStep(s => Math.max(0, s - 1))} className="mt-4 flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">
              <ChevronLeft className="w-3.5 h-3.5" />Back
            </button>
          )}
        </div>
      </div>
    </div>
  );
}