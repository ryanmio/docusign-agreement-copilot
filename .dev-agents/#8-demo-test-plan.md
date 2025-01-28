# Demo Components Test Plan

## Components to Test

### 1. Priority Dashboard
- **Component**: `PriorityDashboard`
- **Test Cases**:
  - Display of urgent items
  - Display of today's items
  - Display of this week's items
  - Quick actions (view, sign, remind)
  - Pagination
  - Empty state handling
  - Mobile responsiveness

### 2. Template Selection & Sending
- **Component**: `TemplateSelector`, `RecipientForm`
- **Test Cases**:
  - Template search
  - Template selection
  - Recipient form validation
  - Role assignment
  - Sending flow

### 3. Document Viewer
- **Component**: `DocumentView`, `PDFViewer`
- **Test Cases**:
  - PDF rendering
  - Document navigation
  - Status display
  - Action buttons
  - Mobile view

### 4. Embedded Signing
- **Component**: `SigningView`
- **Test Cases**:
  - iFrame loading
  - Signing completion
  - Return URL handling
  - Error states

### 5. Bulk Operations
- **Component**: `BulkOperationView`
- **Test Cases**:
  - Multiple template selection
  - Recipient mapping
  - Progress tracking
  - Error handling

### 6. Charts & Analytics
- **Component**: `AgreementChart`
- **Test Cases**:
  - Data visualization
  - Interactive features
  - Different chart types
  - Mobile responsiveness

### 7. Navigator Analysis
- **Component**: `NavigatorAnalysis`
- **Test Cases**:
  - Query processing
  - Result display
  - Action buttons
  - Error states

## Required Test Documents

### 1. Priority Dashboard Documents
- **Urgent**:
  - [x] 1x Declined agreement https://apps-d.docusign.com/send/documents/details/dc28a58b-5dfa-4344-9f88-472b183c8122
  - [x] 1x Agreement expiring within 24 hours https://apps-d.docusign.com/send/documents/details/4fe83637-5379-46c0-a952-1ee8717659ef
  - [x] 1x Agreement with stuck recipient
- **Today**:
  - [x] 2x Agreements due in 1-2 days https://apps-d.docusign.com/send/navigator/agreements/259becfa-8655-4a05-81c7-bdfa2750c529
  - [x] 1x Agreement awaiting final signature
- **This Week**:
  - [ ] 2x Vendor renewals 
  - [ ] 1x Regular review cycle agreement

### 2. Templates for Demo
- **NDA Template**:
  - Basic NDA with standard fields
  - Required for multi-step workflow demo
- **Vendor Agreement Template**:
  - Complex template with multiple roles
  - Required for bulk operations demo
- **Employee Onboarding Template**:
  - Multiple document template
  - Required for Navigator analysis demo

### 3. Sample Documents
- **Completed Agreement**:
  - For document viewer testing
  - With multiple recipients and statuses
- **In-Progress Agreement**:
  - For embedded signing testing
  - With pending signatures
- **Bulk Processing Set**:
  - 5x similar agreements
  - For bulk operations demo

## Setup Instructions

1. Create test documents in DocuSign admin portal
2. Set appropriate expiration dates for priority testing
3. Configure template roles and fields
4. Add test recipients with valid email addresses
5. Prepare test data for analytics charts

## Pre-Demo Checklist

- [ ] All test documents created and properly dated
- [ ] Templates configured with correct fields
- [ ] Test recipients available and ready
- [ ] All components load without errors
- [ ] Mobile responsiveness verified
- [ ] Error states can be demonstrated
- [ ] Analytics data populated 