import React, { useState } from 'react';
import { FileDown, X, AlertTriangle, CheckCircle, Loader2, FileText } from 'lucide-react';

/**
 * WasteDocumentButton
 *
 * Non-hazardous → Waste Transfer Note matching EA form LIT_7932 (WMC2A Version 3)
 *   Sections: A (waste description) · B (transferor) · C (transferee) · D (transfer details)
 *
 * Hazardous → Consignment Note matching EA form LIT_6872 (HWCN01v112)
 *   Parts: A (notification) · B (waste description) · C (carrier cert) · D (consignor cert) · E (consignee cert)
 *   Three copies generated: Producer / Carrier / Consignee
 */
export default function WasteDocumentButton({ facility, ewcCode, ewcDescription, isHazardous }) {
  const [isOpen, setIsOpen] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [form, setForm] = useState({
    // Shared / transferor / consignor
    transferorName: '',
    transferorCompany: '',
    transferorAddress: '',
    transferorPostcode: '',
    transferorTel: '',
    transferorEmail: '',
    transferorSic: '',
    transferorType: 'producer',      // producer | importer | local_authority | permit_holder | exemption | carrier
    transferorPermitNumber: '',
    transferorPermitIssuedBy: '',
    transferorRegNumber: '',
    // Waste description
    wasteDescription: '',
    wasteProcess: '',
    containmentType: 'loose',        // loose | sacks | skip | drum | other
    containmentOther: '',
    quantity: '',
    physicalForm: 'solid',           // solid | liquid | gas | powder | sludge | mixed
    hazardCodes: '',
    unNumber: '',
    properShippingName: '',
    unClass: '',
    packingGroup: '',
    chemicalComponents: '',
    // Transfer details
    transferDate: new Date().toISOString().split('T')[0],
    transferTime: '',
    collectionAddress: '',
    // Transferee / consignee
    transfereeName: '',
    transfereeCompany: '',
    transfereeAddress: '',
    transfereePostcode: '',
    transfereeType: 'permit_holder',
    transfereePermitNumber: '',
    transfereePermitIssuedBy: '',
    transfereeRegNumber: '',
    // Carrier (consignment note)
    carrierName: '',
    carrierCompany: '',
    carrierAddress: '',
    carrierPostcode: '',
    carrierTel: '',
    carrierEmail: '',
    carrierRegNumber: '',
    vehicleReg: '',
    // Consignment note specific
    consignmentNoteCode: '',
    multipleCollection: false,
    roundNumber: '',
    collectionNumber: '',
    wasteManagementCode: '',          // R or D code
    // Broker
    brokerName: '',
    brokerRegNumber: '',
  });

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const loadJsPDF = () => new Promise((resolve, reject) => {
    if (window.jspdf) return resolve(window.jspdf);
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.onload = () => resolve(window.jspdf);
    script.onerror = reject;
    document.head.appendChild(script);
  });


  // ═══════════════════════════════════════════════════════════════════════════
  // WASTE TRANSFER NOTE — compact single page, EA form WMC2A Version 3
  // ═══════════════════════════════════════════════════════════════════════════
  const generateWTN = (doc, W, margin) => {
    const cW = W - margin * 2;
    const half = cW / 2 - 1;
    const col2 = margin + half + 2;

    const sf = (style = 'normal', sz = 7.5) => { doc.setFont('helvetica', style); doc.setFontSize(sz); };
    const sc = (r, g, b) => doc.setTextColor(r, g, b);
    const rc = () => doc.setTextColor(30, 30, 30);
    const gr = (r, g, b, lw = 0.25) => { doc.setDrawColor(r, g, b); doc.setLineWidth(lw); };
    const rect = (x, y, w, h) => { gr(160, 160, 160); doc.rect(x, y, w, h); };
    const fill = (x, y, w, h, r, g, b) => { doc.setFillColor(r, g, b); doc.rect(x, y, w, h, 'F'); };
    const secBar = (txt, x, y, w, h = 5) => {
      fill(x, y, w, h, 30, 90, 50);
      sf('bold', 6.5); sc(255, 255, 255); doc.text(txt, x + 1.5, y + 3.5); rc();
      return y + h + 0.5;
    };
    const lbl = (txt, x, y) => { sf('normal', 6); sc(100, 100, 100); doc.text(txt, x, y); rc(); };
    const val = (txt, x, y, mw = 60) => { sf('bold', 7.5); rc(); if (txt) doc.text(String(txt), x, y, { maxWidth: mw }); sf('normal', 7.5); };
    const tick = (x, y, checked) => {
      gr(80, 80, 80, 0.25); doc.rect(x, y, 3, 3);
      if (checked) { sf('bold', 7); rc(); doc.text('X', x + 0.4, y + 2.5); }
    };
    const hline = (x1, y, x2) => { gr(190, 190, 190, 0.2); doc.line(x1, y, x2, y); };
    const today = new Date().toLocaleDateString('en-GB');
    const transferDate = form.transferDate ? new Date(form.transferDate).toLocaleDateString('en-GB') : '';

    // HEADER
    fill(0, 0, W, 12, 30, 90, 50);
    sf('bold', 11); sc(255, 255, 255); doc.text('Duty of Care: Waste Transfer Note', margin, 8);
    sf('normal', 6); sc(180, 220, 190); doc.text('Keep this note and copy it for future use  |  WMC2A Version 3, August 2011  |  Environmental Protection Act 1990, s.34', margin, 11);
    sf('bold', 6); sc(255, 255, 200); doc.text('Generated: ' + today + '  by WasteLocate.co.uk', W - margin, 11, { align: 'right' }); rc();

    let y = 14;

    // SECTION A
    y = secBar('Section A – Description of waste', margin, y, cW);
    rect(margin, y, half, 10);
    lbl('A1 Description of waste transferred:', margin + 1, y + 3);
    val(form.wasteDescription || ewcDescription, margin + 1, y + 7.5, half - 2);
    rect(col2, y, half, 10);
    lbl('List of Waste Regulations code(s) — EWC:', col2 + 1, y + 3);
    sf('bold', 10); sc(20, 60, 120); doc.text(ewcCode || '', col2 + 1, y + 8.5); rc();
    y += 11;

    // A2 — containment. Height 10 to allow "Other" free-text on a second line.
    rect(margin, y, half, 10);
    lbl('A2 How is the waste contained?', margin + 1, y + 3);
    let cx2 = margin + 2;
    ['Loose', 'Sacks', 'Skip', 'Drum', 'Other'].forEach(c => {
      tick(cx2, y + 3.5, form.containmentType === c.toLowerCase() || (c === 'Other' && form.containmentType === 'other'));
      sf('normal', 6); rc(); doc.text(c, cx2 + 3.5, y + 6);
      cx2 += 16;
    });
    if (form.containmentType === 'other' && form.containmentOther) {
      sf('normal', 6); rc(); doc.text('(' + String(form.containmentOther).slice(0, 40) + ')', margin + 2, y + 9, { maxWidth: half - 4 });
    }
    rect(col2, y, half, 10);
    lbl('A3 How much waste?', col2 + 1, y + 3);
    val(form.quantity || '', col2 + 1, y + 6.5, half - 2);
    y += 11;

    // SECTION B — Transferor
    y = secBar('Section B – Current holder of the waste – Transferor', margin, y, cW);
    rect(margin, y, half, 20);
    lbl('B1 Full name:', margin + 1, y + 3); val(form.transferorName, margin + 18, y + 3, half - 20);
    lbl('Company:', margin + 1, y + 7); val(form.transferorCompany, margin + 14, y + 7, half - 16);
    lbl('Address:', margin + 1, y + 11); val(form.transferorAddress, margin + 13, y + 11, half - 15);
    lbl('Postcode:', margin + 1, y + 15); val(form.transferorPostcode, margin + 14, y + 15, 25);
    lbl('SIC (2007):', margin + 1, y + 19); val(form.transferorSic, margin + 17, y + 19, 20);
    rect(col2, y, half, 20);
    lbl('Tel:', col2 + 1, y + 3); val(form.transferorTel, col2 + 8, y + 3, half - 10);
    lbl('Email:', col2 + 1, y + 7); val(form.transferorEmail, col2 + 10, y + 7, half - 12);
    lbl('B2 Unitary authority / council:', col2 + 1, y + 12);
    y += 21;

    rect(margin, y, cW, 18);
    lbl('B3 Are you:', margin + 1, y + 3);
    let bx = margin + 2; const by1 = y + 5;
    [['The producer of the waste?', 'producer'], ['The importer?', 'importer'], ['The local authority?', 'local_authority']].forEach(([txt, v]) => {
      tick(bx, by1, form.transferorType === v); sf('normal', 6); rc(); doc.text(txt, bx + 4, by1 + 2.5); bx += 55;
    });
    const by2 = y + 11;
    tick(margin + 2, by2, form.transferorType === 'permit_holder'); sf('normal', 6); rc(); doc.text('Holder of an environmental permit?  Permit no.:', margin + 6, by2 + 2.5);
    val(form.transferorPermitNumber, margin + 80, by2 + 2.5, 40);
    if (form.transferorPermitIssuedBy) {
      lbl('Issued by:', margin + 122, by2 + 2.5); val(form.transferorPermitIssuedBy, margin + 137, by2 + 2.5, 40);
    }
    const by3 = y + 15;
    tick(margin + 2, by3, form.transferorType === 'exemption' || form.transferorType === 'carrier');
    sf('normal', 6); rc(); doc.text('Registered waste carrier, broker or dealer / exemption?  Reg. no.:', margin + 6, by3 + 2.5);
    val(form.transferorRegNumber, margin + 108, by3 + 2.5, 50);
    y += 19;

    // SECTION C — Transferee
    y = secBar('Section C – Person collecting the waste – Transferee', margin, y, cW);
    fill(margin, y, half, 22, 248, 252, 248);
    rect(margin, y, half, 22);
    lbl('C1 Full name:', margin + 1, y + 3); val(form.transfereeName || facility.operator_name || facility.name, margin + 18, y + 3, half - 20);
    lbl('Address:', margin + 1, y + 7); val(facility.address, margin + 13, y + 7, half - 15);
    lbl('Postcode:', margin + 1, y + 15); val(facility.postcode, margin + 14, y + 15, 25);
    sf('italic', 5.5); sc(40, 100, 60); doc.text('[Pre-filled from WasteLocate]', margin + 1, y + 20); rc();
    rect(col2, y, half, 22);
    lbl('C2 Local authority?', col2 + 1, y + 3); tick(col2 + 30, y + 1.5, false);
    lbl('C3 Environmental permit?', col2 + 1, y + 7); tick(col2 + 36, y + 5.5, true);
    lbl('Permit no.:', col2 + 1, y + 11); val(form.transfereePermitNumber || facility.permit_number, col2 + 14, y + 11, half - 16);
    lbl('Issued by: Environment Agency', col2 + 1, y + 15);
    y += 23;

    // SECTION D — Transfer
    y = secBar('Section D – The transfer', margin, y, cW);
    fill(margin, y, cW, 6.5, 240, 248, 242);
    gr(150, 200, 160, 0.2); doc.rect(margin, y, cW, 6.5);
    sf('italic', 6); sc(30, 80, 50);
    doc.text('By signing below I confirm I have fulfilled my duty to apply the waste hierarchy as required by Regulation 12 of the Waste (England and Wales) Regulations 2011.', margin + 1, y + 3, { maxWidth: cW - 20 });
    tick(margin + cW - 12, y + 1.8, true); sf('normal', 6); rc(); doc.text('Yes', margin + cW - 8, y + 4);
    y += 7.5;

    rect(margin, y, half, 8); lbl('D1 Address of transfer / collection point:', margin + 1, y + 3);
    val(form.collectionAddress || form.transferorAddress || '', margin + 1, y + 7, half - 2);
    rect(col2, y, half / 2 - 1, 8); lbl('Date (DD/MM/YYYY):', col2 + 1, y + 3); val(transferDate, col2 + 1, y + 7, half / 2 - 3);
    rect(col2 + half / 2 + 1, y, half / 2 - 1, 8); lbl('Time:', col2 + half / 2 + 2, y + 3); val(form.transferTime, col2 + half / 2 + 2, y + 7, 20);
    y += 9;

    rect(margin, y, half, 9); lbl('D2 Broker / dealer (if applicable):', margin + 1, y + 3);
    val(form.brokerName, margin + 44, y + 3, half / 2 - 10); lbl('Reg. no.:', margin + 1, y + 7); val(form.brokerRegNumber, margin + 15, y + 7, 30);
    rect(col2, y, half, 9); lbl('Process giving rise to waste:', col2 + 1, y + 3); val(form.wasteProcess, col2 + 1, y + 6.5, half - 2);
    y += 10;

    const sigH = 14;
    rect(margin, y, half, sigH);
    lbl('Transferor signature:', margin + 1, y + 3); hline(margin + 28, y + 3, margin + half - 1);
    lbl('Name:', margin + 1, y + 7.5); hline(margin + 11, y + 7.5, margin + half - 1);
    lbl('Representing:', margin + 1, y + 12); hline(margin + 22, y + 12, margin + half - 1);
    rect(col2, y, half, sigH);
    lbl('Transferee signature:', col2 + 1, y + 3); hline(col2 + 28, y + 3, col2 + half - 1);
    lbl('Name:', col2 + 1, y + 7.5); hline(col2 + 11, y + 7.5, col2 + half - 1);
    lbl('Representing:', col2 + 1, y + 12); hline(col2 + 22, y + 12, col2 + half - 1);
    y += sigH + 2;

    fill(margin, y, cW, 4.5, 240, 248, 242);
    sf('normal', 5.5); sc(80, 80, 80);
    doc.text('Retain for minimum 2 years  |  Environmental Protection Act 1990, s.34  |  Duty of Care Regulations 1991', margin + 1, y + 3.2);
    sf('bold', 5.5); sc(30, 90, 50); doc.text('WasteLocate.co.uk', W - margin - 1, y + 3.2, { align: 'right' }); rc();
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // CONSIGNMENT NOTE — EA form HWCN01v112, single page per copy, 3 copies
  // ═══════════════════════════════════════════════════════════════════════════
  const generateConsignmentNote = (doc, W, margin) => {
    const cW = W - margin * 2;
    const half = cW / 2 - 1;
    const col2 = margin + half + 2;

    const sf = (style = 'normal', sz = 7) => { doc.setFont('helvetica', style); doc.setFontSize(sz); };
    const sc = (r, g, b) => doc.setTextColor(r, g, b);
    const rc = () => doc.setTextColor(30, 30, 30);
    const gr = (r, g, b, lw = 0.25) => { doc.setDrawColor(r, g, b); doc.setLineWidth(lw); };
    const rect = (x, y, w, h) => { gr(180, 100, 100); doc.rect(x, y, w, h); };
    const fill = (x, y, w, h, r, g, b) => { doc.setFillColor(r, g, b); doc.rect(x, y, w, h, 'F'); };
    const lbl = (txt, x, y) => { sf('normal', 5.5); sc(100, 100, 100); doc.text(txt, x, y); rc(); };
    const val = (txt, x, y, mw = 60) => { sf('bold', 7); rc(); if (txt) doc.text(String(txt), x, y, { maxWidth: mw }); sf('normal', 7); };
    const hline = (x1, y, x2) => { gr(200, 140, 140, 0.2); doc.line(x1, y, x2, y); };
    const secBar = (txt, x, y, w, h = 4.5) => {
      fill(x, y, w, h, 140, 30, 30);
      sf('bold', 6); sc(255, 255, 255); doc.text(txt, x + 1.5, y + 3.2); rc();
      return y + h + 0.5;
    };
    const today = new Date().toLocaleDateString('en-GB');
    const transferDate = form.transferDate ? new Date(form.transferDate).toLocaleDateString('en-GB') : '';

    const renderCopy = (copyLabel) => {
      fill(0, 0, W, 12, 140, 30, 30);
      sf('bold', 10); sc(255, 255, 255); doc.text('The Hazardous Waste Regulations 2005: Consignment Note', margin, 7.5);
      sf('normal', 6); sc(255, 190, 190); doc.text('Form HWCN01v112  |  Generated: ' + today + '  by WasteLocate.co.uk', margin, 11);
      sf('bold', 7.5); sc(255, 240, 160); doc.text(copyLabel, W - margin, 9, { align: 'right' }); rc();

      let y = 14;

      fill(margin, y, cW, 5.5, 255, 245, 245); gr(200, 130, 130, 0.2); doc.rect(margin, y, cW, 5.5);
      lbl('1  Consignment note code:', margin + 1, y + 3.8); val(form.consignmentNoteCode || '(to be assigned)', margin + 42, y + 3.8, 60);
      sf('italic', 5.5); sc(140, 30, 30); doc.text('Facility pre-filled from WasteLocate search', W - margin - 1, y + 3.8, { align: 'right' }); rc();
      y += 7;

      // PART A
      y = secBar('PART A  Notification details', margin, y, cW);

      rect(margin, y, half, 18);
      lbl('2  Waste to be removed from (name, address, postcode, tel, email):', margin + 1, y + 3);
      val(form.transferorName || form.transferorCompany, margin + 1, y + 7, half - 2);
      sf('normal', 6.5); rc(); doc.text([form.transferorAddress, form.transferorPostcode].filter(Boolean).join('  '), margin + 1, y + 11, { maxWidth: half - 2 });
      lbl('Tel:', margin + 1, y + 14.5); val(form.transferorTel, margin + 7, y + 14.5, 35);
      lbl('Email:', margin + 42, y + 14.5); val(form.transferorEmail, margin + 52, y + 14.5, half - 54);

      fill(col2, y, half, 22, 255, 246, 246); rect(col2, y, half, 22);
      lbl('3  Waste will be taken to:', col2 + 1, y + 3);
      sf('bold', 7.5); rc(); doc.text(facility.operator_name || facility.name || '', col2 + 1, y + 7, { maxWidth: half - 2 });
      sf('normal', 6.5); doc.text(facility.address || '', col2 + 1, y + 11, { maxWidth: half - 2 });
      doc.text(facility.postcode || '', col2 + 1, y + 15, { maxWidth: half - 2 });
      lbl('Permit no.:', col2 + 1, y + 19); sf('bold', 6.5); sc(40, 40, 140);
      doc.text(facility.permit_number || 'see permit schedule', col2 + 16, y + 19, { maxWidth: half - 18 }); rc();
      sf('italic', 5.5); sc(140, 30, 30); doc.text('[Pre-filled]', col2 + half - 15, y + 19); rc();
      y += 23;

      rect(margin, y, cW, 5.5);
      lbl('4  Waste producer (if different from box 2):', margin + 1, y + 4);
      y += 6.5;

      // PART B
      y = secBar('PART B  Description of the waste', margin, y, cW);

      rect(margin, y, half, 7);
      lbl('1  Process giving rise to the waste:', margin + 1, y + 3); val(form.wasteProcess, margin + 1, y + 6, half - 2);
      rect(col2, y, half / 2 - 1, 7);
      lbl('2  SIC (2007):', col2 + 1, y + 3); val(form.transferorSic, col2 + 1, y + 6, half / 2 - 3);
      y += 8;

      // B3 table
      fill(margin, y, cW, 4, 200, 130, 130);
      const bc = [
        { t: 'EWC code', x: margin, w: 22 },
        { t: 'Description of waste', x: margin + 22, w: 42 },
        { t: 'Qty (kg)', x: margin + 64, w: 16 },
        { t: 'Chemical components & conc.', x: margin + 80, w: 32 },
        { t: 'Physical form', x: margin + 112, w: 16 },
        { t: 'Hazard codes', x: margin + 128, w: 16 },
        { t: 'Container/no./size', x: margin + 144, w: cW - 144 },
      ];
      bc.forEach(c => { sf('bold', 4.8); sc(80, 10, 10); doc.text(c.t, c.x + 0.5, y + 2.8, { maxWidth: c.w - 1 }); }); rc();
      y += 4.5;
      rect(margin, y, cW, 9); gr(180, 100, 100, 0.15);
      bc.forEach((c, i) => { if (i > 0) doc.line(c.x, y, c.x, y + 9); });
      val(ewcCode, bc[0].x + 0.5, y + 4, bc[0].w - 1);
      val(ewcDescription, bc[1].x + 0.5, y + 4, bc[1].w - 1);
      val(form.quantity, bc[2].x + 0.5, y + 4, bc[2].w - 1);
      val(form.chemicalComponents, bc[3].x + 0.5, y + 4, bc[3].w - 1);
      val(form.physicalForm, bc[4].x + 0.5, y + 4, bc[4].w - 1);
      val(form.hazardCodes, bc[5].x + 0.5, y + 4, bc[5].w - 1);
      val([form.containmentType !== 'other' ? form.containmentType : form.containmentOther, form.quantity].filter(Boolean).join(' / '), bc[6].x + 0.5, y + 4, bc[6].w - 1);
      y += 10;

      fill(margin, y, cW, 3.5, 200, 130, 130);
      const uc = [
        { t: 'EWC code', x: margin, w: 22 },
        { t: 'UN identification no.', x: margin + 22, w: 35 },
        { t: 'Proper shipping name', x: margin + 57, w: 40 },
        { t: 'UN class', x: margin + 97, w: 20 },
        { t: 'Packing group', x: margin + 117, w: 22 },
        { t: 'Special handling requirements', x: margin + 139, w: cW - 139 },
      ];
      uc.forEach(c => { sf('bold', 4.8); sc(80, 10, 10); doc.text(c.t, c.x + 0.5, y + 2.5, { maxWidth: c.w - 1 }); }); rc();
      y += 4;
      rect(margin, y, cW, 7); gr(180, 100, 100, 0.15);
      uc.forEach((c, i) => { if (i > 0) doc.line(c.x, y, c.x, y + 7); });
      val(ewcCode, uc[0].x + 0.5, y + 3, uc[0].w - 1);
      val(form.unNumber, uc[1].x + 0.5, y + 3, uc[1].w - 1);
      val(form.properShippingName, uc[2].x + 0.5, y + 3, uc[2].w - 1);
      val(form.unClass, uc[3].x + 0.5, y + 3, uc[3].w - 1);
      val(form.packingGroup, uc[4].x + 0.5, y + 3, uc[4].w - 1);
      val(form.specialHandling, uc[5].x + 0.5, y + 3, uc[5].w - 1);
      y += 8;

      // PART C & D side by side
      fill(margin, y, half, 4.5, 140, 30, 30); sf('bold', 6); sc(255, 255, 255); doc.text('PART C  Carrier\'s certificate', margin + 1.5, y + 3.2); rc();
      fill(col2, y, half, 4.5, 140, 30, 30); sf('bold', 6); sc(255, 255, 255); doc.text('PART D  Consignor\'s certificate', col2 + 1.5, y + 3.2); rc();
      y += 5;

      let cy = y, dy = y;

      rect(margin, cy, half, 7); lbl('1  Carrier name:', margin + 1, cy + 3); val(form.carrierName, margin + 20, cy + 3, half - 22);
      lbl('On behalf of:', margin + 1, cy + 6.5); val([form.carrierCompany, form.carrierAddress].filter(Boolean).join(', '), margin + 18, cy + 6.5, half - 20); cy += 8;
      rect(margin, cy, half, 5); lbl('2  Carrier reg. no. / exemption:', margin + 1, cy + 3.5); val(form.carrierRegNumber, margin + 46, cy + 3.5, half - 48); cy += 6;
      rect(margin, cy, half, 5); lbl('3  Vehicle reg. / mode of transport:', margin + 1, cy + 3.5); val(form.vehicleReg, margin + 52, cy + 3.5, half - 54); cy += 6;
      fill(margin, cy, half, 9, 255, 248, 248); rect(margin, cy, half, 9);
      sf('italic', 5.5); sc(100, 30, 30);
      doc.text('I certify that I today collected the consignment and that the details in A2, A3 and B3 are correct and I have been advised of any specific handling requirements.', margin + 1.5, cy + 3.5, { maxWidth: half - 3 });
      rc(); cy += 10;
      rect(margin, cy, half, 4.5); lbl('Signature:', margin + 1, cy + 3.2); hline(margin + 17, cy + 3.2, margin + half * 0.65);
      lbl('Date: DD/MM/YYYY', margin + half * 0.67, cy + 3.2);

      fill(col2, dy, half, 18, 255, 248, 248); rect(col2, dy, half, 18);
      sf('italic', 5.5); sc(100, 30, 30);
      doc.text('I certify that the information in A, B and C has been completed and is correct, that the carrier is registered or exempt and was advised of the appropriate precautionary measures. All of the waste is packaged and labelled correctly and the carrier has been advised of any special handling requirements.\n\nI confirm that I have fulfilled my duty to apply the waste hierarchy as required by Regulation 12 of the Waste (England and Wales) Regulations 2011.', col2 + 1.5, dy + 3.5, { maxWidth: half - 3 });
      rc(); dy += 19;
      rect(col2, dy, half, 5); lbl('1  Consignor name:', col2 + 1, dy + 3.5); val(form.transferorName, col2 + 26, dy + 3.5, half - 28); dy += 6;
      rect(col2, dy, half, 5); lbl('On behalf of:', col2 + 1, dy + 3.5); val(form.transferorCompany, col2 + 18, dy + 3.5, half - 20); dy += 6;
      rect(col2, dy, half, 4.5); lbl('Signature:', col2 + 1, dy + 3.2); hline(col2 + 17, dy + 3.2, col2 + half * 0.65);
      lbl('Date: DD/MM/YYYY', col2 + half * 0.67, dy + 3.2);

      y = Math.max(cy, dy) + 6;

      // PART E
      y = secBar('PART E  Consignee\'s certificate', margin, y, cW);
      fill(margin, y, cW, 7, 255, 248, 248); rect(margin, y, cW, 7);
      sf('italic', 5.5); sc(100, 30, 30);
      doc.text('I certify that waste permit/exempt waste operation number: ' + (facility.permit_number || '_______________') + ' authorises the management of the waste described in B at the address given in A3.\nWhere the consignment forms part of a multiple collection, I certify that the total number of consignments forming the collection are:', margin + 1.5, y + 3.5, { maxWidth: cW - 3 });
      rc(); y += 8;

      fill(margin, y, cW, 3.5, 200, 130, 130);
      const ec = [
        { t: 'Individual EWC codes received', x: margin, w: 42 },
        { t: 'Qty each EWC received (kg)', x: margin + 42, w: 36 },
        { t: 'EWC accepted / rejected', x: margin + 78, w: 38 },
        { t: 'Waste management operation (R or D code)', x: margin + 116, w: cW - 116 },
      ];
      ec.forEach(c => { sf('bold', 4.8); sc(80, 10, 10); doc.text(c.t, c.x + 0.5, y + 2.5, { maxWidth: c.w - 1 }); }); rc();
      y += 4;
      rect(margin, y, cW, 8); gr(180, 100, 100, 0.15);
      ec.forEach((c, i) => { if (i > 0) doc.line(c.x, y, c.x, y + 8); });
      val(ewcCode, ec[0].x + 0.5, y + 4, ec[0].w - 1);
      val(form.quantity, ec[1].x + 0.5, y + 4, ec[1].w - 1);
      val(form.wasteManagementCode, ec[3].x + 0.5, y + 4, ec[3].w - 1);
      y += 9;

      rect(margin, y, half, 5); lbl('1  I received this waste at A3 on (date):', margin + 1, y + 3.5); lbl('DD / MM / YYYY', margin + 57, y + 3.5);
      rect(col2, y, half, 5); lbl('2  Vehicle reg. / mode of transport:', col2 + 1, y + 3.5); val(form.vehicleReg, col2 + 52, y + 3.5, 30);
      y += 6;
      rect(margin, y, cW, 5); lbl('3  Where waste is rejected, please provide details:', margin + 1, y + 3.5);
      y += 6;
      rect(margin, y, cW, 5.5);
      lbl('Consignee signature:', margin + 1, y + 4); hline(margin + 27, y + 4, margin + cW * 0.42);
      lbl('Date: DD/MM/YYYY', margin + cW * 0.44, y + 4);
      lbl('Time: HH:MM', margin + cW * 0.64, y + 4);
      y += 7;

      fill(margin, y, cW, 4.5, 255, 245, 245);
      sf('normal', 5); sc(100, 80, 80);
      doc.text('Retain for 3 years  |  Hazardous Waste Regulations 2005, reg. 49  |  Consignee must return signed copy to consignor within 1 working day', margin + 1, y + 3);
      sf('bold', 5); sc(140, 30, 30); doc.text('WasteLocate.co.uk', W - margin - 1, y + 3, { align: 'right' }); rc();
    };

    ['PRODUCER\'S / CONSIGNOR\'S COPY', 'CARRIER\'S COPY', 'CONSIGNEE\'S COPY'].forEach((label, i) => {
      if (i > 0) doc.addPage();
      renderCopy(label);
    });
  };

  // ─────────────────────────────────────────────────────────────────────────
  // GENERATE
  // ─────────────────────────────────────────────────────────────────────────
  const generatePDF = async () => {
    if (!form.transferorName.trim() && !form.transferorCompany.trim()) {
      alert('Please enter the transferor / consignor name or company.');
      return;
    }
    setGenerating(true);
    try {
      const { jsPDF } = await loadJsPDF();
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const W = 210, margin = 10;
      if (isHazardous) generateConsignmentNote(doc, W, margin);
      else generateWTN(doc, W, margin);
      const safeCode = (ewcCode || 'EWC').replace(/\s+/g, '_');
      const safeFac = (facility.operator_name || facility.name || 'facility').replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30);
      doc.save(`${isHazardous ? 'Consignment_Note' : 'WTN'}_${safeCode}_${safeFac}.pdf`);
    } catch (err) {
      console.error('PDF failed:', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  const focusRing = isHazardous ? 'focus:ring-red-400' : 'focus:ring-green-500';
  const borderCol = isHazardous ? 'border-red-200' : 'border-green-200';
  const inputCls = `w-full px-3 py-2 border-2 rounded-lg text-sm focus:ring-2 ${focusRing} ${borderCol}`;
  const sectionTitleCls = `text-sm font-bold border-b pb-1 mt-1 ${isHazardous ? 'text-red-800 border-red-200' : 'text-gray-800 border-gray-200'}`;

  const field = (label, key, placeholder, type = 'text', required = false, half = false) => (
    <div className={half ? 'flex-1' : 'w-full'}>
      <label className="block text-xs font-semibold text-gray-700 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={form[key]}
        onChange={e => update(key, (key.toLowerCase().includes('postcode') || key === 'vehicleReg') ? e.target.value.toUpperCase() : e.target.value)}
        placeholder={placeholder}
        className={inputCls}
      />
    </div>
  );

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-2 px-4 py-2 text-white text-sm font-semibold rounded-lg transition-colors ${isHazardous ? 'bg-red-700 hover:bg-red-800' : 'bg-green-700 hover:bg-green-800'}`}
      >
        <FileDown className="w-4 h-4" />
        {isHazardous ? 'Download Consignment Note' : 'Download WTN'}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">

            <div className={`flex items-center justify-between p-5 border-b sticky top-0 z-10 rounded-t-xl ${isHazardous ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
              <div>
                <h3 className={`text-lg font-bold flex items-center gap-2 ${isHazardous ? 'text-red-800' : 'text-green-800'}`}>
                  {isHazardous ? <AlertTriangle className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                  {isHazardous ? 'Hazardous Waste Consignment Note (HWCN01v112)' : 'Duty of Care: Waste Transfer Note (WMC2A)'}
                </h3>
                <p className={`text-xs mt-0.5 ${isHazardous ? 'text-red-600' : 'text-green-600'}`}>
                  {isHazardous
                    ? 'Hazardous Waste Regulations 2005 — 3 copies (Producer / Carrier / Consignee)'
                    : 'Environmental Protection Act 1990, s.34 — Duty of Care Regulations 1991'}
                </p>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg hover:bg-white/60 text-gray-500"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-5 space-y-4">
              {isHazardous ? (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3">
                  <p className="text-xs font-bold text-red-800 flex items-center gap-1.5 mb-1"><AlertTriangle className="w-3.5 h-3.5" />Hazardous — Consignment Note required</p>
                  <p className="text-xs text-red-700">3 copies generated (Producer, Carrier, Consignee). Retain for <strong>3 years</strong>.</p>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-xs font-bold text-green-800 flex items-center gap-1.5 mb-1"><CheckCircle className="w-3.5 h-3.5" />Non-hazardous — Waste Transfer Note applies</p>
                  <p className="text-xs text-green-700">Retain for <strong>2 years</strong>. EPA 1990, s.34.</p>
                </div>
              )}

              <div className={`border rounded-lg p-3 text-xs ${isHazardous ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                <p className={`font-semibold uppercase tracking-wide mb-1 ${isHazardous ? 'text-red-700' : 'text-green-700'}`}>Pre-filled from WasteLocate</p>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono font-bold text-sm">{ewcCode}</span>
                  <span className={`px-2 py-0.5 rounded-full font-semibold ${isHazardous ? 'text-red-700 bg-red-100' : 'text-green-700 bg-green-100'}`}>
                    {isHazardous ? 'Hazardous' : 'Non-hazardous'}
                  </span>
                </div>
                <p className="text-gray-600 mb-1">{ewcDescription}</p>
                <p className="font-semibold text-gray-700">{facility.operator_name || facility.name}</p>
                <p className="text-gray-500">{facility.address}, {facility.postcode} · Permit: {facility.permit_number || 'see schedule'}</p>
              </div>

              {isHazardous && (
                <div>
                  <p className={sectionTitleCls}>Consignment Note Code</p>
                  <div className="mt-2">{field('Consignment note code', 'consignmentNoteCode', 'e.g. CN-2026-001')}</div>
                </div>
              )}

              <div className="space-y-2">
                <p className={sectionTitleCls}>{isHazardous ? 'Part A — Consignor' : 'Section B — Transferor (current holder)'}</p>
                <div className="flex gap-2">
                  {field('Full name', 'transferorName', 'Contact name', 'text', true, true)}
                  {field('Company', 'transferorCompany', 'Business name', 'text', false, true)}
                </div>
                {field('Address', 'transferorAddress', 'Street address')}
                <div className="flex gap-2">
                  {field('Postcode', 'transferorPostcode', 'M1 1AE', 'text', false, true)}
                  {field('SIC code (2007)', 'transferorSic', 'e.g. 41100', 'text', false, true)}
                </div>
                <div className="flex gap-2">
                  {field('Telephone', 'transferorTel', '01234 567890', 'tel', false, true)}
                  {field('Email', 'transferorEmail', 'contact@company.co.uk', 'email', false, true)}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Transferor type (B3)</label>
                  <select value={form.transferorType} onChange={e => update('transferorType', e.target.value)} className={inputCls}>
                    <option value="producer">Producer of the waste</option>
                    <option value="importer">Importer of the waste</option>
                    <option value="local_authority">Local authority</option>
                    <option value="permit_holder">Holder of an environmental permit</option>
                    <option value="exemption">Registered waste exemption</option>
                    <option value="carrier">Registered waste carrier / broker / dealer</option>
                  </select>
                </div>
                {form.transferorType === 'permit_holder' && (
                  <div className="flex gap-2">
                    {field('Permit number', 'transferorPermitNumber', 'EPR/...', 'text', false, true)}
                    {field('Issued by', 'transferorPermitIssuedBy', 'Environment Agency', 'text', false, true)}
                  </div>
                )}
                {(form.transferorType === 'carrier' || form.transferorType === 'exemption') &&
                  field('Registration number', 'transferorRegNumber', 'CBDU00000')
                }
              </div>

              <div className="space-y-2">
                <p className={sectionTitleCls}>Section A — Waste description</p>
                <div className="w-full">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Description of waste (A1)</label>
                  <input type="text" value={form.wasteDescription} onChange={e => update('wasteDescription', e.target.value)} placeholder={ewcDescription} className={inputCls} />
                </div>
                {field('Process giving rise to waste', 'wasteProcess', 'e.g. building demolition, manufacturing process')}
                <div className="flex gap-2">
                  {field('Quantity (A3)', 'quantity', 'e.g. 2.5 tonnes', 'text', false, true)}
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Physical form</label>
                    <select value={form.physicalForm} onChange={e => update('physicalForm', e.target.value)} className={inputCls}>
                      <option value="solid">Solid</option><option value="liquid">Liquid</option>
                      <option value="gas">Gas</option><option value="powder">Powder</option>
                      <option value="sludge">Sludge</option><option value="mixed">Mixed</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Containment type (A2)</label>
                  <select value={form.containmentType} onChange={e => update('containmentType', e.target.value)} className={inputCls}>
                    <option value="loose">Loose</option><option value="sacks">Sacks</option>
                    <option value="skip">Skip</option><option value="drum">Drum</option><option value="other">Other</option>
                  </select>
                  {form.containmentType === 'other' && (
                    <input type="text" value={form.containmentOther} onChange={e => update('containmentOther', e.target.value)} placeholder="Describe container" className={`mt-1 ${inputCls}`} />
                  )}
                </div>
                {isHazardous && (
                  <>
                    <div className="flex gap-2">
                      {field('Hazard codes (HP)', 'hazardCodes', 'e.g. HP3, HP5, HP14', 'text', false, true)}
                      {field('Chemical components & concentrations', 'chemicalComponents', 'e.g. lead 15%, cadmium 2%', 'text', false, true)}
                    </div>
                    <div className="flex gap-2">
                      {field('UN number', 'unNumber', 'e.g. UN1234', 'text', false, true)}
                      {field('Proper shipping name', 'properShippingName', 'e.g. Flammable liquid, n.o.s.', 'text', false, true)}
                    </div>
                    <div className="flex gap-2">
                      {field('UN class', 'unClass', 'e.g. 3', 'text', false, true)}
                      {field('Packing group', 'packingGroup', 'e.g. II', 'text', false, true)}
                    </div>
                    {field('Special handling requirements', 'specialHandling', 'e.g. Keep upright, flammable — see SDS')}
                  </>
                )}
              </div>

              <div className="space-y-2">
                <p className={sectionTitleCls}>Section D — Transfer details</p>
                <div className="flex gap-2">
                  {field('Date of transfer', 'transferDate', '', 'date', false, true)}
                  {field('Time of transfer', 'transferTime', 'e.g. 09:30', 'text', false, true)}
                </div>
                {field('Collection point address (if different)', 'collectionAddress', 'Leave blank if same as transferor address')}
                <div className="flex gap-2">
                  {field('Broker / dealer name (if applicable)', 'brokerName', 'Name or company', 'text', false, true)}
                  {field('Broker registration number', 'brokerRegNumber', 'CBDU00000', 'text', false, true)}
                </div>
              </div>

              <div className="space-y-2">
                <p className={sectionTitleCls}>{isHazardous ? 'Part C — Carrier' : 'Carrier details'}</p>
                <div className="flex gap-2">
                  {field('Carrier name', 'carrierName', 'Contact name', 'text', false, true)}
                  {field('Carrier company', 'carrierCompany', 'Business name', 'text', false, true)}
                </div>
                <div className="flex gap-2">
                  {field('Carrier address', 'carrierAddress', 'Registered address', 'text', false, true)}
                  {field('Carrier postcode', 'carrierPostcode', 'NG1 1AA', 'text', false, true)}
                </div>
                <div className="flex gap-2">
                  {field('Carrier reg. no. / exemption reason', 'carrierRegNumber', 'CBDU00000', 'text', false, true)}
                  {field('Vehicle registration', 'vehicleReg', 'AB12 CDE', 'text', false, true)}
                </div>
              </div>

              <div className="space-y-2">
                <p className={sectionTitleCls}>{isHazardous ? 'Part E — Consignee (pre-filled)' : 'Section C — Transferee (pre-filled)'}</p>
                <p className="text-xs text-gray-500">Facility pre-filled from WasteLocate. Override below only if needed.</p>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Name</label>
                    <input type="text" value={form.transfereeName} onChange={e => update('transfereeName', e.target.value)} placeholder={facility.operator_name || facility.name} className={inputCls} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Permit number</label>
                    <input type="text" value={form.transfereePermitNumber} onChange={e => update('transfereePermitNumber', e.target.value)} placeholder={facility.permit_number || 'EPR/...'} className={inputCls} />
                  </div>
                </div>
                {isHazardous && field('Waste management operation (R or D code)', 'wasteManagementCode', 'e.g. D1, R13')}
              </div>

              <div className="flex gap-3 pt-2 pb-1">
                <button onClick={() => setIsOpen(false)} className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-50">Cancel</button>
                <button onClick={generatePDF} disabled={generating}
                  className={`flex-1 px-4 py-2.5 text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-2 disabled:bg-gray-400 ${isHazardous ? 'bg-red-700 hover:bg-red-800' : 'bg-green-700 hover:bg-green-800'}`}>
                  {generating
                    ? <><Loader2 className="w-4 h-4 animate-spin" />Generating…</>
                    : <><FileDown className="w-4 h-4" />{isHazardous ? 'Download 3-copy Consignment Note' : 'Download Waste Transfer Note'}</>
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
