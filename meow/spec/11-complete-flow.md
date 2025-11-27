# Complete End-to-End Flow

## Full Project Lifecycle

```
Lead Created (status: lead)
    ↓
Customer Agrees (status: lead_interested)
    ↓
Customer Profile Form Filled + Documents Uploaded
    ↓
Auto-update to Lead Processing (status: lead_processing)
    ↓
Survey Scheduled
    ↓
Survey Completed
    ↓
Proposal & Quotation Sent
    ↓
Payment / Loan Path
    ↓
Installation Scheduled
    ↓
Installation Completed
    ↓
Net Meter Applied
    ↓
Commissioning
    ↓
Subsidy Submitted
    ↓
Subsidy Released
    ↓
Project Closed (status: lead_completed)
```

**Customer sees ALL these in timeline.**

---

## Detailed Flow Breakdown

### 1. Lead Creation
- Agent finds potential customer and creates lead OR
- Customer self-signup creates lead
- Lead status: **lead** (initial contact)

### 2. Customer Agreement
- Agent convinces customer to install solar
- Agent/Office updates status to **lead_interested**
- Customer has agreed to proceed

### 3. Customer Profile & Document Collection
- Agent/Office fills customer profile form with:
  - Personal details (name, gender, address, pin code, state, district)
  - Banking info (account holder, account number, bank name, IFSC)
- Upload mandatory documents:
  - Aadhar Front & Back
  - Electricity Bill
  - Bank Passbook
  - Cancelled Cheque
  - PAN Card
  - ITR documents (optional)

### 4. Automatic Status Update
- When customer profile form is submitted with all documents
- System automatically changes status to **lead_processing**
- Timeline steps become active

### 5. Survey Phase
- Office schedules survey
- Installer/Office completes survey
- Survey report uploaded

### 6. Proposal Phase
- Office generates proposal
- Quotation sent to customer
- Customer reviews via portal

### 7. Payment/Loan Phase
- Customer chooses payment method
- If loan: loan application process
- Payment confirmation recorded

### 8. Installation Phase
- Installation scheduled
- Installer assigned
- Installer uploads progress photos
- Installation completed
- Installation certificate uploaded

### 9. Net Metering Phase
- Office applies for net meter
- Documents submitted to DISCOM
- Net meter approval received

### 10. Commissioning
- System commissioning completed
- Final inspection done
- Commissioning certificate uploaded

### 11. Subsidy Phase
- Office submits subsidy application
- Subsidy documents uploaded
- Subsidy approval tracked
- Subsidy released

### 12. Project Closure
- All steps completed
- Final documents archived
- Lead status: "Closed"
- Customer receives completion certificate

---

## User Journey by Role

### Agent Journey
1. Find potential customer
2. Create lead (status: lead)
3. Convince customer to install solar
4. Update status to lead_interested
5. Fill customer profile form + upload documents
6. Track lead progress (read-only)

### Customer Journey
1. Signup/Login
2. View timeline
3. Upload missing documents (if required)
4. Track progress
5. View proposals & payments

### Office Journey
1. View all leads
2. Update lead status (lead → lead_interested)
3. Fill customer profile form + upload documents
4. Process leads through timeline steps
5. Schedule surveys
6. Send proposals
7. Track payments
8. Coordinate installation
9. Apply for net meter & subsidy
10. Close projects (status: lead_completed)

### Installer Journey
1. View assigned installations
2. Upload installation photos
3. Update progress
4. Submit completion certificate

### Admin Journey
1. Full system access
2. Manage users
3. Configure timeline steps
4. Override permissions
5. Resolve issues
6. View analytics
