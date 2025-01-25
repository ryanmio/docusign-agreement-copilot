## Intro




























-------------------------
I built Agreement Copilot to demonstrate a new way to build with Docusign - where instead of coding against APIs, developers deploy AI agents that dynamically generate both the interface and workflow for any agreement task.

Let me demo this..."

First, let's say my role involves managing contracts. Here's how generative agreement interfaces would help me.

First I type in << WHAT NEEDS TO GET DONE TODAY? >>

The agent calls the Docusign API to fetch contracts expiring or due soon and other documents that need attention like stalled signers, voided contracts, and more. It then renders the revelvant documents in an interactive react component within the chat itself.

FIND EXPIRING - SEND REMINDER

SIGNING DEMO

DECLINED - Send template - 5% increase!

DRAFT CUSTOM CONTRACT

SEARCH BY PARTY

SEARCH BY VALUE

SEARCH BY EXPIRATION DATE

GRAPH CONTRACT VALUE BY PARTY

Now I'll demo how it can handle mutliple steps autonmously. 

VENDOR RENEWALS - send vendor renewal template

BULK SEND - SKIP

This isn't just for roles that manage contracts though. The same approach can used for end-user tasks like signing lease agreements and navigating a mortgage application.

I encourage you to check out the demo, connect your own Docusign account, and try it out. 

Or head to the preview page to see the components without connecting to Docusign.

I'm a true believer in this approach. That's why I extracted what worked into an open source toolkit.

That's available on GitHub now so you can get started integrating docusign-capable agents into your own applications.

I'm excited to see what you build with it.

-----

- Traditional UIs are static and rigid. This approach generates custom React components dynamically, tailored to the user's needs in real time. Instead of navigating menus or predefined processes, users simply describe what they need (e.g., "Send an NDA" or "Remind signers"), and the app builds the workflow step by step. Agents handle all the backend complexity—managing signers, deadlines, templates, and reminders—while keeping humans in control of critical decisions like signing.

- Developers can now integrate agents into Docusign-powered apps, enabling autonomous agreement workflows and seamless AI interaction. The toolkit makes it easy for developers to build scalable, intelligent systems on Docusign technology, reducing development time for advanced use cases. Render signing workflows, analyze agreements, and perform non-signing actions like voiding or reminders—all generated dynamically by agents.

- Agreements often trap critical value and slow down processes. Generative AI makes agreement management seamless by automating backend work. Businesses can deploy AI agents to handle routine agreement tasks, freeing users to focus on decisions and approvals. This approach enables businesses to integrate AI agents into their tools, creating adaptive, scalable systems.

- Key innovation: Traditional integrations require mapping every UI element to Docusign's API. Our agent treats the API as a runtime - it generates both the UI and API calls in real time based on the user's goal. For developers, this means adding complex agreement features becomes as simple as adding a chat component.

- Developer impact: A rental site adds lease signing in 3 steps: 
  - 1. Import our agent toolkit
  - 2. Provide template access
  - 3. Add a chat component saying "Need a lease?"
  - The agent handles template selection, data collection, and workflow routing - no Docusign-specific code.

- Real-world example: A rental website integrates our toolkit to add "Instant Lease" functionality. When a user selects a property:
  - Agent generates a property-specific interface (terms, dates, tenant info)
  - Auto-populates the lease from templates using listing data
  - Presents streamlined signing workflow to tenant
  - Routes to property manager for final review/signing
  - Entire flow created dynamically - no pre-coded lease workflow

- Every company using Docusign can now integrate AI agents to enhance user productivity, automate agreement management, and unlock entirely new use cases. Agreement Copilot showcases this future—where agents handle complexity, and humans focus on decisions.
  - Agent generates a property-specific interface (terms, dates, tenant info)
  - Auto-populates the lease from templates using listing data
  - Presents streamlined signing workflow to tenant
  - Routes to property manager for final review/signing
  - Entire flow created dynamically - no pre-coded lease workflow

- Enterprise value: This turns Docusign from a destination into an invisible layer. Employees can handle agreements through natural language in Slack, customers get tailored flows in web/mobile apps, all powered by Docusign without the traditional UI friction.

Agreement Copilot shows how AI agents can remove the friction from agreement workflows while keeping humans in control. While signing always stays with humans, agents handle everything else - preparing documents, managing recipients, tracking status, sending reminders.

I built Agreement Copilot, It uses Generative UI and tool calling to dynamically create workflows and interfaces on demand.