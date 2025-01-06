**TASK:** Create DocuSign Agreement Copilot Component Preview Page

**OBJECTIVE:** Create a documentation/preview page that showcases all AI tool components in a clean, organized manner.

**LOCATION:** Create new route at `app/components/page.tsx`

**COMPONENTS TO SHOWCASE:**
1. Loading States
   - LoadingSpinner (always spinning)
   - Usage: "Used during API calls and tool processing"
   - Props: `{ label?: string }`

2. Template Selector
   - Mock data: 3-4 template examples
   - Usage: "Used to select DocuSign templates"
   - Props: `{ value: string, onChange: (value: string) => void }`

3. Priority Dashboard
   - Mock data: Mix of needs signing/review/sent items
   - Usage: "Shows urgent items needing attention"
   - Props: `{ sections: Section[], onAction: (envelopeId: string, action: string) => void }`

4. Document View
   - Mock PDF or document preview
   - Usage: "Displays document details and status"
   - Props: List from component

5. Recipient Form
   - Mock roles data
   - Usage: "Collects recipient information"
   - Props: Document from component

**STYLING REQUIREMENTS:**
1. Use DocuSign colors:
   - Primary: #4C00FF (Cobalt)
   - Light: #CBC2FF (Mist)
   - Dark: #130032 (Inkwell)
   - Neutral: #F8F3F0 (Ecru)

2. Layout:
   - Clean, documentation-style layout
   - Each component in its own section
   - Component title, description, usage, props
   - Live example
   - Code snippet (optional)

**IMPLEMENTATION APPROACH:**
1. Create static page (no server components needed)
2. Each component section should follow pattern:
```tsx
<section className="space-y-4 p-6 border rounded-lg">
  <h2 className="text-2xl font-medium">Component Name</h2>
  <p className="text-gray-600">Usage description</p>
  <div className="bg-gray-50 p-4 rounded-md">
    <h3 className="text-sm font-medium mb-2">Props</h3>
    {/* Props documentation */}
  </div>
  <div className="bg-white p-4 rounded-md border">
    {/* Live component example */}
  </div>
</section>
```

**MOCK DATA:**
- Create `app/components/mock-data.ts` for reusable mock data
- Keep data minimal but representative

**NOTES:**
- Focus on visual consistency with DocuSign
- Keep it simple - this is a bonus feature
- Ensure all components have proper types
- Add minimal interactivity where it makes sense
- Document any assumptions made

**COMPLETION REPORT REQUIREMENTS:**
1. Screenshot of the completed page
2. List of any deviations from the original plan
3. Any challenges encountered and solutions implemented
4. Suggestions for future improvements 