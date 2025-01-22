# Navigator API

## Navigator API Overview
The Navigator API is currently available as part of a closed beta program.
Navigator API offers developers access to AI-extracted data from the Navigator smart agreement repository. Use the data provided by the API to analyze your existing agreements, extract insights, and connect agreement data to your business systems.

## Features
### Mine your agreement data
Navigator API lets you access AI-extracted structured data from Navigator so you can build apps that retrieve relevant data without parsing agreements manually.
### Search, filter and sort
Use the API’s responses to create robust search, filter and sort capabilities in your app, enabling your users to find specific agreements quickly and easily.
### Create apps fast
The simplicity of Navigator API enables developers to integrate it quickly into their apps with minimal setup, streamlining the process and reducing development cycles.


# Navigator Concepts

The Navigator API is currently available as part of a closed beta program. See [Learn about the Navigator API beta](/docs/navigator-api/beta/) for details.

The following sections describe the objects and key terms used by Docusign Navigator and the Navigator API. See [Work with the Navigator API schema](/docs/navigator-api/concepts/work-with-navigator-schema/) for details on the Navigator API object model.

### Agreement

An agreement is a commitment between two or more parties that creates an obligation to perform (or not perform) a particular duty. Typically, agreements will contain a lot of other data, such as documents that describe the agreement being struck, parties who are involved in the agreement, dates defining the boundaries of the agreement, and many more. An agreement stored in Docusign Navigator has the following retrievable data:

- A comprehensive overview of the agreement, including its title, type, status, summary, and more. This includes involved parties and related agreements.
- A full set of provisions that define the terms and conditions of the agreement, used for compliance and auditing purposes.
- A set of metadata that acts as a history for the agreement, such as creation and modification dates, parties, and user-defined fields.

Significant portions of this data may be generated as AI-assisted insights, but you can review, validate, and accept or modify these values manually through the UI.See [Key agreement properties and objects](/docs/navigator-api/concepts/work-with-navigator-schema/#key-agreement-properties-and-objects) for details.

### Document

Documents are artifacts associated with agreements that typically define the terms of the agreement to be made. An agreement’s documents are stored in Docusign Navigator, and AI insights are generated from the contents of your agreement documents.

Unlike in Docusign eSignature, documents in the developer environment that are stored in Navigator are not purged monthly. Instead, they will persist until the admin deletes the account.

### Parties

A party is a person, entity, or group of entities who take part in an agreement. Typically, this means agreeing with other parties to do something together, although it can include other stakeholders. For example, in an agreement to purchase a home, the parties might include the buyer and the seller. If the buyer or seller have agents, these agents may be parties to separate agreements outlining fees, terms of service, etc.

A party can include one or more other parties. This means that you can manually create logical groups of parties such as “Microsoft” that may contain multiple Microsoft parties such as “Legal” or “Azure”, then select and filter results for any or all of them.

### AI Insights

Whenever you upload documents in Docusign Navigator or complete a Docusign envelope, those documents are added to your account’s Navigator repository. Navigator then uses AI to analyze your documents and apply sets of Insights to them, automatically populating metadata about the agreement based on the contents of the documents. This can include (but is not limited to):

- The parties involved in the agreement
- The renewal date for the agreement
- Pricing details for the agreement
- Jurisdiction
- Terms
- The type of agreement
- A set of agreement provisions

Document metadata that has been populated by AI and not manually confirmed by an account user is marked with a purple star to the left of its value. You can open the agreement entry in the Navigator UI and review or update these fields to confirm the data and remove this flag.

![Image of a UI screen showing navigator agreement attributes.](https://images.ctfassets.net/aj9z008chlq0/619RdoXFH8wZLmVXTKGoc4/8af15671d84ce8415f7e0948e9c338a4/NavigatorDetails.png?w=232&h=394&q=50&fm=png)

### Category and type

An agreement’s category object identifies the general purpose of the agreement, each of which is associated with a set of agreement types. For example, an agreement might have a category of Business services and a type of order form or a category of human resources and a type of offer letter.  See [Key agreement properties and objects](/docs/navigator-api/concepts/work-with-navigator-schema/#key-agreement-properties-and-objects) for details.

### Provisions

An agreement's provisions object contains a list of properties that define the agreement parameters. For example, a statement of work's provisions include properties such as an execution date, a total value, and a payment due date. Each agreement has multiple provisions.

# Navigator API use cases

The Navigator API is currently available as part of a closed beta program. See [Learn about the Navigator API beta](/docs/navigator-api/beta/) for details.

The Navigator API is designed for integration into your existing CRM or enterprise system, providing data from your Docusign agreements and any agreements you upload to Navigator. It is useful for any app that needs to query Navigator to get insights such as renewal dates, data for making business decisions, or learning about composition of agreements.

This general flow describes how Navigator API works with Navigator:

1. You use the Navigator UI or (in future releases) call the Navigator API to upload your agreements to your Navigator repository.
2. The Navigator AI engine analyzes your documents and creates a set of AI insights for each one.
3. The AI insights are attached to your agreements.
4. If desired, an account admin can review the AI insights in the Navigator UI to confirm or modify them. They can also manually enter additional fields about the agreement, if necessary.
5. Your app calls the Navigator API `GET /agreements` operation with query parameters that  define filters to return the set of agreements that you want. Typically, this could be searching for agreements with specific renewal dates, including a specific party, or for agreements of a particular type.
6. Navigator API returns a JSON response object that contains data on the agreement(s), parties, documents, and other provisions.
7. Your other apps or services can consume and act on the returned agreement data. For example, you might alert a sales department if an agreement renewal date is approaching, use the data to create a dashboard for a team working with customers in a specific field, or just display data to a user.

![](data:image/svg+xml;charset=utf-8,%3Csvg height='1459' width='1174' xmlns='http://www.w3.org/2000/svg' version='1.1'%3E%3C/svg%3E)

![Image of an example use case involving the Navigator API](https://images.ctfassets.net/aj9z008chlq0/4hT04R0fmOOfBbQydL4vXN/6242767c29345dd3f727f8820a694322/exampleNavigatorFlow.png?w=1174&h=1459&q=50&fm=png)

Common use cases include:

- **Using Navigator as a source of agreement data** and metadata for your system to query, display, and act on.
- **Integrations with copilots or Large Language Models (LLMs)**. A copilot or LLM  enables a user to ask questions about their agreements with natural language. Your copilot or LLM can construct queries from these questions and make Navigator API requests to retrieve agreement data. After the desired agreement data is returned, your copilot or LLM can interpret the response back into a natural language response to your user.
- **Exporting and synchronizing your agreement data**, such as legal and financial provisions, with external systems such as Enterprise Resource Planning (ERP), Customer Relationship Management (CRM), or contract management tools to streamline workflows.
- **Filtering your agreements by type or status, and gathering summaries** of your key provisions across multiple agreements.
- **Auditing or generating reports for your agreements** based on their type, status, or creation date, helping ensure compliance and simplify internal review.
- **Tracking** when your agreements were created or modified, helping **enforce governance**, and **version control**.

# Work with the Navigator API schema

The Navigator API is currently available as part of a closed beta program. See [Learn about the Navigator API beta](/docs/navigator-api/beta/) for details.

The central component of the Navigator API schema is the `agreement` object, which represents an agreement that Navigator has processed. The API returns general agreement information in response to the [Agreements:getAgreement](/docs/navigator-api/reference/navigator/agreements/getagreement/) and [Agreements:getAgreementsList](/docs/navigator-api/reference/navigator/agreements/getagreementslist/) requests.

## Key agreement properties and objects

Several key properties and objects are associated with each `agreement` object. Their relationships are illustrated below, and the next sections provide details. For a complete list of `agreement` properties and objects, see the [API Reference](/docs/navigator-api/reference/).

![](data:image/svg+xml;charset=utf-8,%3Csvg height='856.9999999999999' width='1147' xmlns='http://www.w3.org/2000/svg' version='1.1'%3E%3C/svg%3E)

![Sample agreement and related schema objects](https://images.ctfassets.net/aj9z008chlq0/K274XidrHyDWruWwUFu7r/3a45dff38697435194654431c0963e3a/NavigatorSchema.png?w=1147&h=857&q=50&fm=png)

### Category

An agreement's `category` property reflects a broad classification to which the agreement belongs. Each agreement has one category. The sample agreement shown in the diagram belongs to the business services category. Each agreement category has an associated set of agreement types.

### Type

An agreement's `type` property contains a more specific classification. Each agreement has one type. The diagram shows an agreement whose type is "Statement of Work". The Navigator platform supports a set of [standard agreement types](/docs/navigator-api/concepts/work-with-navigator-schema/#standard-agreement-types), as well as [custom agreement types](/docs/navigator-api/concepts/work-with-navigator-schema/#custom-agreement-types).

### Parties

An agreement's `parties` object consists of an array of individuals or entities who participated in the agreement. For example, a lease agreement's parties might consist of a lessor and a lessee. There is no limit on the number of parties to an agreement.

### Provisions

An agreement's `provisions` object contains a list of properties that define the agreement parameters. For example, a statement of work's provisions include properties such as an execution date, a total value, and one or more payment due dates. Each agreement has multiple provisions.

Each agreement type that Navigator supports has a distinct set of provisions that are available with agreements of that type.

A sample `Agreements:getAgreement` response that includes the above components is shown here:

```css-1cxojf3

{
  "id": "77b85334-xxxx-xxxx-xxxx-f8f029d8c3c5",
  "type": "Statement of Work",
  "category": "BusinessServices",
  "parties": [\
    {\
      "id": "aba3d8ca-xxxx-xxxx-xxxx-bdab40102a2f",\
      "name_in_agreement": "ACME, INC"\
    },\
    {\
      "id": "eb01cef7-xxxx-xxxx-xxxx-3c643357ce18",\
      "name_in_agreement": "TALLY, LTD"\
    }\
  ],
  "provisions": {
    "effective_date": "2024-09-01T00:00:00+02:00",
    "expiration_date": "2029-09-01T00:00:00+02:00",
    "execution_date": "2024-08-15T11:45:00+02:00",
    "total_agreement_value": 150000,
    "total_agreement_value_currency_code": "USD",
    "annual_agreement_value": 50000,
    "annual_agreement_value_currency_code": "USD",
    "term_length": "P3Y",
    "assignment_type": "YES_WITH_CONDITIONS",
    "assignment_change_of_control": "NO_OR_CONSENT_REQUIRED",
    "assignment_termination_rights": "YES",
    "governing_law": "California",
    "jurisdiction": "California",
    "payment_terms_due_date": "THIRTY_DAYS",
    "can_charge_late_payment_fees": true,
    "late_payment_fee_percent": 0,
    "price_cap_percent_increase": 5,
    "liability_cap_fixed_amount": 0,
    "liability_cap_currency_code": "USD",
    "liability_cap_multiplier": 0,
    "liability_cap_duration": "P1Y",
    "renewal_type": "AUTO_RENEW",
    "renewal_notice_period": "P90D",
    "renewal_notice_date": "2024-10-17T14:30:00+02:00",
    "auto_renewal_term_length": "P3Y",
    "renewal_extension_period": "P1Y",
    "renewal_process_owner": "199b3cc9-ec67-47a5-9dff-04ff091d4ca3",
    "renewal_additional_info": "N/A",
    "termination_period_for_cause": "P1Y",
    "termination_period_for_convenience": "P1Y"
  },
  "related_agreement_documents": {
    "parent_agreement_document_id": "f30761c6-xxxx-xxxx-xxxx-e6f3313c95bd"
  },
  "languages": [\
    "en-US"\
  ],
  "source_name": "Docusign eSign",
  "source_id": "8ade6915-xxxx-xxxx-xxxx-9c6ba6aa1bb5",
  "source_account_id": "3b324aff-xxxx-xxxx-xxxx-0a621c8ac141",
  "metadata": {
    "created_at": "2024-10-01T00:00:00Z",
    "created_by": "a7b0e58b-xxxx-xxxx-xxxx-a7d8790cd571",
    "request_id": "b0f2a7c4-xxxx-xxxx-xxxx-567890123abc",
    "response_timestamp": "2024-10-17T14:30:59Z",
    "response_duration_ms": 110
  }
}
```

## Sources for Navigator API schema values

Navigator populates schema values from two sources. The initial source is the data extraction that the Navigator AI performs to identify agreement parameters, including the agreement type, parties, and provisions. For example, the Navigator AI can use agreement attributes to determine that a value is a renewal type, store it in the appropriate schema field, and return it in the `provisions` object's `renewal_type` property in the response to a Navigator API [Agreements:getAgreement](/docs/navigator-api/reference/navigator/agreements/getagreement/) request.

Another possible source of Navigator schema values is user input. The Navigator UI enables users to review an agreement's AI-extracted values and add, modify, or delete them. This updates the schema values for the agreement, and any subsequent Navigator API GET requests will return the user-updated values instead of the original AI-extracted values. In a future release, the Navigator API will support the updating of AI-extracted agreement values via API requests.

## Standard agreement types

Below are lists of standard agreement types that the Navigator API supports in the current release. Select a tab to see the agreement types under that category. The agreement type names and category names are listed as they appear in responses to API requests.

- BusinessServices

- Miscellaneous

- HumanResources


- Certificate of Insurance
- Consulting Agreement
- Credit Card Agreement
- Engagement Letter
- Franchise Agreement
- Investment Account Agreement
- Joint Venture Agreement
- Letter of Intent
- Loan agreement
- Marketing agreement
- Master Service Agreement
- Memorandum of Understanding
- Non-disclosure Agreement
- Order Form
- Partnership Agreement
- Proposal agreement
- Purchase Agreement
- Purchase Order
- Quote agreement
- Service Level Agreement
- Services Agreement
- Statement of Work
- Stock Purchase Agreement
- Subscription agreement
- Supply / Distribution agreement
- Wealth Management Agreement

## Custom agreement types

In addition to a set of standard agreement types, the Navigator platform supports the creation of custom agreement types. In the current release, custom agreement types can only include provisions from the standard list of Navigator provisions. Custom provisions will be supported in a future release. See [Create New Agreement Types﻿](https://support.docusign.com/s/document-item?bundleId=pqz1702943441912&topicId=gke1727282238086.html) for details about creating custom agreement types.

# What is Navigator

The Navigator API is currently available as part of a closed beta program. See [Learn about the Navigator API beta](/docs/navigator-api/beta/) for details.

Docusign Navigator enables you to centrally store, manage, and analyze your agreements with help from AI. When you import an agreement into Navigator or complete a Docusign envelope, Navigator generates a set of AI-assisted insights for that agreement, such as its agreement type, the parties involved, and its key provisions.

- Your organization can use the AI insights generated by Docusign Navigator to help you **find, manage, and report on your agreements** easily, including managing renewals and locating data. For example, Navigator can help you easily compile and understand key terms of your agreements such as when a contract is up for renewal, what is promised to whom and when, liability information, and more. Without these AI insights, this categorizing data would be time-consuming and expensive to generate.
- As a developer, you can integrate this structured insight data seamlessly into your applications, **automatically retrieving relevant information without needing to parse agreements manually**.
- You can **increase security, and facilitate oversight** by gating access to certain categories of agreement data to specific permissions, ensuring that only the right users have access to the right agreements.
- Because agreements are categorized by the AI-insights when they are imported, **migrating documents and agreements from multiple sources is vastly simplified**, even if they use different systems of organization.
- Navigator API is designed for ease-of-use, enabling you to **leverage AI-extracted data for your apps with minimal setup**. For example, you could use AI-insights to check whether an NDA exists for a retrieved document of a particular type and, if no NDA is found, create logic to automatically generate one.
- The metadata and insights attached to each agreement are **designed to provide Large Language Model (LLM) applications with the context they need** to answer detailed queries about an agreement.

Docusign Navigator has a UI layer that you can access through the Agreements screen and an API layer that your integrations can call directly to work with stored agreements and AI-extracted data. For the initial beta release, Navigator API only supports operations to get data for a list of your agreements, get data for a specific agreement, and retrieve the most current lists of possible metadata values.

The following diagrams show the steps of uploading a document in Navigator and querying records in Navigator API.

### **Upload flow**     ![](data:image/svg+xml;charset=utf-8,%3Csvg height='919.9999999999999' width='1260' xmlns='http://www.w3.org/2000/svg' version='1.1'%3E%3C/svg%3E)      ![Diagram showing the steps in an example Navigator upload flow.](https://images.ctfassets.net/aj9z008chlq0/2dGrXprGvEnUyRsxu0gqFU/67778cc1d1364bc90f81a4fcc0433853/Example_Navigator_Flow_1__1_.png?w=1260&h=920&q=50&fm=png)       **Query flow**     ![](data:image/svg+xml;charset=utf-8,%3Csvg height='887' width='1260' xmlns='http://www.w3.org/2000/svg' version='1.1'%3E%3C/svg%3E)      ![A diagram showing the steps for a Navigator query flow.](https://images.ctfassets.net/aj9z008chlq0/7tFAfRNKNLpgVXQUsq6AGL/a192460de792fe1b12f3a1de5a9893fa/NaviagatorQueryFlow.png?w=1260&h=887&q=50&fm=png)

Navigator API is currently in closed beta. See [Learn about the Navigator API beta](/docs/navigator-api/beta/) for details on how to gain access to the beta, the base path for making Navigator API calls, and other details. To request help with using Navigator API, go to [Docusign Support](https://support.docusign.com/s/?language=en_US), select **Navigator**, and submit a ticket.
