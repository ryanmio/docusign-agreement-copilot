# Navigator API Integration Plan

## 1. Confirmed Data Structure
Based on API validation, we have access to:

### Core Agreement Data
```typescript
{
  id: string;
  file_name: string;
  type: string;          // e.g., "ConfirmationOfRenewal"
  category: string;      // e.g., "Miscellaneous"
  status: string;        // e.g., "COMPLETE"
  languages: string[];   // e.g., ["en"]
}
```

### Rich Metadata
```typescript
provisions: {
  effective_date: string;
  expiration_date: string;
  execution_date: string;
  term_length: string;          // e.g., "P1Y"
  jurisdiction: string;         // e.g., "California"
  annual_agreement_value: number;
  annual_agreement_value_currency_code: string;
  payment_terms_due_date: string;
}

parties: Array<{
  id: string;
  name_in_agreement: string;    // e.g., "GreenLeaf Analytics Inc."
}>;

metadata: {
  created_at: string;
  modified_at: string;
  modified_by: string;
}
```

## 2. Demo Features Implementation

### 2.1 "Morning Scramble" (Priority Dashboard)
- **Script Requirement**: Show urgent priorities including vendor renewals and offboarding documents
- **Data Source**: 
  - `provisions.expiration_date` for deadline tracking
  - `annual_agreement_value` for financial impact
  - `status` for agreement state
- **Implementation**:
  ```typescript
  interface PriorityItem {
    id: string;
    daysUntilExpiration: number;
    value: number;
    parties: string[];
    type: string;
  }
  ```
- **Logic Flow**:
  1. Fetch agreements with `expiration_date` within next 30 days
  2. Sort by priority using weighted scoring:
     ```typescript
     function calculatePriority(agreement: NavigatorAgreement): number {
       const daysUntilExpiration = calculateDays(agreement.provisions.expiration_date);
       const financialImpact = agreement.provisions.annual_agreement_value;
       const baseScore = (30 - daysUntilExpiration) * 10;  // More urgent as expiration approaches
       const valueScore = Math.log10(financialImpact) * 5;  // Higher value = higher priority
       return baseScore + valueScore;
     }
     ```
  3. Group by urgency categories:
     - Critical (< 3 days): Red highlighting
     - Urgent (< 7 days): Orange highlighting
     - Upcoming (< 30 days): Yellow highlighting
  4. Display in EnvelopeList component with:
     - Expiration countdown
     - Financial value
     - Party names from `parties` array
     - Quick action buttons

### 2.2 "Bulk Vendor Renewals"
- **Script Requirement**: Handle vendor renewals with 5% increase using Tom's pattern
- **Data Source**:
  - `type: "ConfirmationOfRenewal"`
  - `provisions.term_length`
  - `provisions.annual_agreement_value`
  - `parties` for vendor names
- **Implementation**:
  ```typescript
  interface RenewalOperation {
    vendorName: string;
    currentValue: number;
    suggestedIncrease: number;
    newTermLength: string;
  }
  ```
- **Logic Flow**:
  1. Identify renewal candidates:
     ```typescript
     function findRenewalCandidates(): NavigatorAgreement[] {
       return agreements.filter(a => 
         a.type === "ConfirmationOfRenewal" &&
         isWithinDays(a.provisions.expiration_date, 30) &&
         !hasRenewalInProgress(a.parties)
       );
     }
     ```
  2. Calculate new terms:
     ```typescript
     function calculateRenewalTerms(agreement: NavigatorAgreement): RenewalOperation {
       const currentValue = agreement.provisions.annual_agreement_value;
       const vendorName = agreement.parties.find(p => p.name_in_agreement !== "AcmeCorp").name_in_agreement;
       return {
         vendorName,
         currentValue,
         suggestedIncrease: currentValue * 0.05,
         newTermLength: agreement.provisions.term_length // Maintain same term
       };
     }
     ```
  3. Batch process renewals:
     - Group by vendor
     - Apply 5% increase
     - Use term_length from original agreement
     - Track progress in BulkOperationView

### 2.3 "Tuesday Review Tasks"
- **Script Requirement**: Show Tom's typical Tuesday pattern of handling vendor renewals
- **Data Source**:
  - `metadata.created_at` for identifying Tuesday patterns
  - `type: "ConfirmationOfRenewal"` for identifying renewals
  - `provisions.annual_agreement_value` for renewal values
- **Implementation**:
  ```typescript
  interface TuesdayAnalysis {
    renewalCount: number;
    totalValue: number;
    pendingRenewals: Array<{
      vendorName: string;
      currentValue: number;
      expirationDate: string;
    }>;
  }
  ```
- **Logic Flow**:
  1. Analyze Tuesday renewal patterns:
     ```typescript
     function analyzeTuesdayRenewals(): TuesdayAnalysis {
       const tuesdayRenewals = agreements.filter(a => 
         getDayOfWeek(a.metadata.created_at) === 'Tuesday' &&
         a.type === "ConfirmationOfRenewal"
       );
       
       return {
         renewalCount: tuesdayRenewals.length,
         totalValue: sumAgreementValues(tuesdayRenewals),
         averageProcessingTime: calculateProcessingTime(tuesdayRenewals)
       };
     }
     ```
  2. Generate today's task list:
     ```typescript
     function generateTuesdayTasks(): TuesdayTasks {
       const patterns = analyzeTuesdayRenewals();
       const pendingRenewals = findPendingRenewals();
       
       return {
         typicalRenewalCount: patterns.renewalCount,
         pendingItems: pendingRenewals.map(r => ({
           vendorName: r.parties[0].name_in_agreement,
           currentValue: r.provisions.annual_agreement_value,
           expirationDate: r.provisions.expiration_date
         })),
         suggestedActions: generateRenewalActions(pendingRenewals)
       };
     }
     ```
  3. Present focused renewal summary:
     - Number of renewals typically handled on Tuesdays
     - Today's pending renewal reviews
     - Suggested renewal actions with 5% increase calculations

### 2.4 "Employee Transition" (Sarah's Offboarding)
- **Script Requirement**: Find all agreements related to Sarah and handle offboarding
- **Data Source**:
  - `parties.name_in_agreement` for relationship mapping
  - `type` and `category` for agreement classification
  - `provisions` for obligation tracking
- **Implementation**:
  ```typescript
  interface PartyAgreements {
    partyName: string;
    activeAgreements: number;
    totalValue: number;
    jurisdictions: string[];
  }
  ```
- **Logic Flow**:
  1. Find related agreements:
     ```typescript
     function findEmployeeAgreements(employeeName: string): EmployeeAgreements {
       const relatedAgreements = agreements.filter(a =>
         a.parties.some(p => 
           p.name_in_agreement.toLowerCase().includes(employeeName.toLowerCase())
         )
       );

       return {
         active: groupByStatus(relatedAgreements),
         byType: categorizeAgreements(relatedAgreements),
         obligations: extractObligations(relatedAgreements)
       };
     }
     ```
  2. Categorize agreements:
     ```typescript
     function categorizeForOffboarding(agreements: NavigatorAgreement[]): OffboardingTasks {
       return {
         ndas: findAgreementsByType(agreements, 'NDA'),
         ipAgreements: findAgreementsByType(agreements, 'IP'),
         vendorAccounts: findAgreementsByType(agreements, 'VendorAccess'),
         requiredActions: generateRequiredActions(agreements)
       };
     }
     ```
  3. Generate task list:
     - Required signatures
     - Account terminations
     - Document transfers
     - Compliance checklist

### 2.5 "Proactive Support"
- **Script Requirement**: Show upcoming deadlines and pending tasks
- **Data Source**:
  - All agreement metadata
   - Historical patterns
  - Upcoming deadlines
- **Logic Flow**:
  1. Analyze upcoming events:
     ```typescript
     function findUpcomingEvents(): ProactiveAlerts {
       return {
         expirations: findUpcomingExpirations(),
         reviews: findScheduledReviews(),
         renewals: findPendingRenewals(),
         patterns: detectRelevantPatterns()
       };
     }
     ```
  2. Generate suggestions:
     ```typescript
     function generateSuggestions(): ActionItems[] {
       const events = findUpcomingEvents();
       return [
         ...generateRenewalSuggestions(events.renewals),
         ...generateReviewReminders(events.reviews),
         ...generateComplianceAlerts(events.expirations)
       ].sort(byPriority);
     }
     ```
  3. Present proactive notifications:
     - Upcoming deadlines
     - Required preparations
     - Suggested actions
     - Quick action buttons

## 3. Implementation Phases

### Phase 1: Core Integration (Week 1)
1. **Navigator Client Enhancement**
   - Implement robust error handling
   - Add rate limiting protection
   - Cache frequently accessed data

2. **Data Models & Interfaces**
   - Create TypeScript interfaces for all data structures
   - Implement data validation and transformation

3. **Basic Pattern Detection**
   - Time-based patterns using metadata
   - Value-based patterns using provisions
   - Geographic patterns using jurisdiction

### Phase 2: Feature Implementation (Week 2)
1. **Priority Dashboard**
   - Real-time expiration tracking
   - Financial impact visualization
   - Party relationship mapping

2. **Bulk Operations**
   - Vendor renewal workflow
   - Batch processing interface
   - Progress tracking

3. **Pattern Analysis**
   - Day-of-week analytics
   - Value trend analysis
   - Geographic distribution

### Phase 3: Demo Polish (Week 3)
1. **UI/UX Enhancement**
   - Responsive design
   - Loading states
   - Error handling

2. **Performance Optimization**
   - Response caching
   - Batch processing
   - Lazy loading

3. **Demo Preparation**
   - Test data setup
   - Fallback scenarios
   - Documentation

## 4. Success Metrics
- Response time < 200ms for priority dashboard
- 100% accuracy in expiration tracking
- Zero errors in bulk operations
- Reliable pattern detection with confidence scores

## 5. Technical Requirements
- TypeScript for type safety
- React for UI components
- Next.js API routes for backend
- Supabase for data persistence

## 6. Error Handling Strategy
1. **API Errors**
   - Rate limiting
   - Authentication failures
   - Network issues

2. **Data Validation**
   - Missing required fields
   - Invalid date formats
   - Inconsistent data

3. **Fallback Behavior**
   - Cached data display
   - Graceful degradation
   - User notifications

## 7. Monitoring & Logging
- API response times
- Error rates
- Pattern detection accuracy
- User interaction metrics 