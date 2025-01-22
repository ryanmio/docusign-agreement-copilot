# Generate and send personalized agreements with document generation for eSignature
Published Apr 28, 2023
New API calls let you use document generation to dynamically insert data from your systems into your agreements and send them automatically.

We are excited to introduce one of our newest eSignature features—Document Generation—to our [eSignature REST API](https://developers.docusign.com/docs/esign-rest-api/)!

With document generation for eSignature, you can generate personalized, professional-looking agreements at the time of sending your agreement. You can dynamically insert data from your internal systems into your agreement, eliminating the possibility of formatting issues like overlapping or cut-off text. And this can all be done within your eSignature workflow—no need to prepare the agreement in other systems ahead of time!

You can try document generation for free in your developer account. In production accounts, the feature is a paid add-on, so please reach out to a [Docusign representative](https://www.docusign.com/contact-sales) to learn more.

## Sample document generation use cases

While document generation is applicable for any agreement into which you want to dynamically insert data, here are some very common use cases you might consider:

- Generate and send an offer letter that pulls in data from your HR system.

- Generate and send a loan offer that pulls in the terms and conditions from your underwriting and loan management software.

- Generate and send a service request from your internal real estate management system.


Document generation also supports conditional clauses so that text can be automatically shown or removed based on data provided. **This can greatly reduce the number of templates you need to create and manage!** For the HR offer letter use case, the resident state of the candidate receiving the offer may determine if some clauses should be removed. Or with the service request use case, some of the sections of the agreement may be hidden based on what part of the property needs to be serviced.

## Create your template for document generation

You can create an eSignature template that is compatible with document generation the same way you would any eSignature template, with one major difference: the document to be generated must be a **DOCX file with data fields**. (see [Document Generation Syntax](https://support.docusign.com/s/document-item?language=en_US&bundleId=als1679428547895&topicId=ftc1679700030026.html&_LANG=enus) ﻿ for details on adding detail fields). When you add that document to a template (either using the API or using the web app), Docusign eSignature will automatically recognize that it contains data fields and mark the template as compatible with document generation.

## Sending your template for Document Generation via the API

At a high level, the steps required to send an envelope using an existing template that is compatible with document generation are:

1. Create an envelope draft from the template: [Envelopes:create](https://developers.docusign.com/docs/esign-rest-api/reference/envelopes/envelopes/create/)

2. Get the data fields (DocGenFormFields) for each document on the envelope: [DocumentGeneration : getEnvelopeDocGenFormFields](https://developers.docusign.com/docs/esign-rest-api/reference/envelopes/documentgeneration/getenvelopedocgenformfields/)

3. Update the values for each data field (DocGenFormField): \[ [DocumentGeneration : updateEnvelopeDocGenFormFields](https://developers.docusign.com/docs/esign-rest-api/reference/envelopes/documentgeneration/updateenvelopedocgenformfields/)\]

4. Send the envelope: [Envelopes:update](https://developers.docusign.com/docs/esign-rest-api/reference/envelopes/envelopes/update/)


For a more detailed walk-through, see this [how-to guide](https://developers.docusign.com/docs/esign-rest-api/how-to/request-signature-email-document-generation/).

## Example: Generate and send an offer letter to a new hire

As an example, let’s take an HR offer letter that has the following data fields:

- Candidate\_Name

- State\_Of\_Employment

- Annual\_Salary

- Start\_Date


Here’s the letter:

![Document template with dynamic fields](https://images.ctfassets.net/9pvazpst9iwl/6291930921260068/985f26d76bb61dd65857d0aaee2005ed/Blog_DocGen_fig1.png?w=500&fm=avif)

### Get the data fields from the letter

Once you’ve created your envelope draft, you need to get the `docGenFormFields` like so:

**GET**{vx}/accounts/{accountId}/envelopes/{envelopeId}/docGenFormFields

Sample Response:

```
{
    "docGenFormFields": [\
        {\
            "documentId": "d5f70ce4-xxxx-xxxx-xxxx-04535e6ze372",\
            "docGenFormFieldList": [\
                {\
                    "label": "Candidate_Name",\
                    "type": "TextBox",\
                    "required": "True",\
                    "Name": "Candidate_Name"\
                },\
                {\
                    "label": "State_Of_Employment",\
                    "type": "TextBox",\
                    "required": "True",\
                    "Name": "State_Of_Employment"\
                },\
                {\
                    "label": "Annual_Salary",\
                    "type": "TextBox",\
                    "required": "True",\
                    "Name": "Annual_Salary"\
                },\
                {\
                    "label": "Start_Date",\
                    "type": "TextBox",\
                    "required": "True",\
                    "Name": "Start_Date"\
                }\
            ]\
        }\
    ]
}

```

Show more

### Add data field values

Then, you would update the `value` of the `docGenFormFields` object with the appropriate data like so:

**PUT**: {vx}/accounts/{accountId}/envelopes/{envelopeId}/docGenFormFields

```
{
    "docGenFormFields": [\
        {\
            "documentId": "d5f70ce4-xxxx-xxxx-xxxx-04535e6ze372",\
            "docGenFormFieldList": [\
                {\
                    "value": "Carry Candidate",\
                    "Name": "Candidate_Name"\
                },\
                {\
                    "value": "California",\
                    "Name": "State_Of_Employment"\
                },\
                {\
                    "value": "100,000",\
                    "Name": "Annual_Salary"\
                },\
                {\
                    "value": "August 1, 2023",\
                    "Name": "Start_Date"\
                }\
            ]\
        }\
    ]
}

```

Show more

Now your final offer letter has all of the personalized information dynamically merged in, and the clause specific to candidates in the state of California is included. Now, you can send off a clean, professional-looking document to your new hire!

![Generated document with fields inserted](https://images.ctfassets.net/9pvazpst9iwl/4237778117049536/f69e7a1ddd995572723b49ca0364fb0c/Blog_DocGen_fig2.png?w=500&fm=avif)

## Limitations

The major limitation is that you are not able to add the data field values within the [composite template](https://developers.docusign.com/docs/esign-rest-api/esign101/concepts/templates/composite/) API call.

See [Limitations and Considerations for Document Generation](https://support.docusign.com/s/document-item?language=en_US&bundleId=als1679428547895&topicId=cah1680213420771.html&_LANG=enus) for a more detailed list of limitations.

## Additional resources

Take a look at the resources below and take advantage of document generation!

- [API Reference](https://developers.docusign.com/docs/esign-rest-api/reference/envelopes/documentgeneration/)

- [How-to Guide](https://developers.docusign.com/docs/esign-rest-api/how-to/request-signature-email-document-generation/)

- [Document Generation User Guide](https://support.docusign.com/s/document-item?bundleId=als1679428547895&topicId=ldx1679428689631.html)

- [Document Generation Template Library](https://support.docusign.com/en/knowledgemarket/Document-Generation-Template-Library)

- Docusign blog post: [Create Professional Contracts Faster with Document Generation for eSignature](https://www.docusign.com/blog/products/create-contracts-document-generation-esignature)

- [Docusign Developer Center](https://developers.docusign.com/)

- [Docusign for Developers on YouTube](https://www.youtube.com/channel/UCJSJ2kMs_qeQotmw4-lX2NQ)

- [@DocuSignAPI on Twitter](https://twitter.com/docusignapi)

- [Docusign on Twitch](https://www.twitch.tv/docusignapi/)

- [Docusign For Developers on LinkedIn](https://www.linkedin.com/showcase/docusign-for-developers/)

- [Docusign Developer Newsletter](https://developers.docusign.com/#newsletter-signup)


![Author Aaron Prohofsky](https://images.ctfassets.net/9pvazpst9iwl/3pbYHbHNwVdufzZxeNE48T/7290bf68741c61af9f43a8ccbc2246fe/Aaron_Prohofsky?w=500&fm=avif)

Aaron ProhofskyProduct Manager

[Aaron Prohofsky](https://www.linkedin.com/in/aaron-prohofsky/) has been with Docusign since January 2021. He is the product manager for the core sending experience in the Docusign web application. He graduated from UC Berkeley with a degree in engineering and has worked in the tech industry for many years. In his free time he loves playing basketball, beach volleyball and kiteboarding.

[More posts from this author](/blog/author/aaron-prohofsky)

Related posts

- [![Docusign for Developers Public Roadmap: A commitment to innovation and trust](https://images.ctfassets.net/9pvazpst9iwl/1RtQscjrM4R5O7ojCCj2wu/a3bccdc9a5fbfc8826e299d2eeb923c3/illustration-isometric_pyramid-shadow_inkwell.png?w=500&fm=avif)](/blog/developers/docusign-for-developers-public-roadmap)



[Developers](/blog/developers) Published Jan 7, 2025

[**Docusign for Developers Public Roadmap: A commitment to innovation and trust**](/blog/developers/docusign-for-developers-public-roadmap)







![Author Julian Macagno](https://images.ctfassets.net/9pvazpst9iwl/2r6Dxc7NBRF7HEefszaMeE/f15b2451600e956747d28f95e6de0a36/JulianMacagno.jpg?w=500&fm=avif)







Julian Macagno

- [![LaborEdge Streamlines Healthcare Compliance with a Healthy Dose of Docusign](https://images.ctfassets.net/9pvazpst9iwl/48wNteOJWKLZVZAnRcf7dJ/fe70c1a2832242c33ac5c8da4f8bc503/illustration-isometric_cylinder-disks_inkwell.png?w=500&fm=avif)](/blog/developers/laboredge-streamlines-healthcare-compliance-with-a-healthy-dose-of-docusign)



[API Success](/blog/developers/api-success) Published Jan 2, 2025

[**LaborEdge Streamlines Healthcare Compliance with a Healthy Dose of Docusign**](/blog/developers/laboredge-streamlines-healthcare-compliance-with-a-healthy-dose-of-docusign)







![Author Karissa Jacobsen](https://images.ctfassets.net/9pvazpst9iwl/56GSAsknmGi0EtIB92ylgp/8175ea8eb46c4f2ba06d9d41b6d3d7b1/Karissa_Jacobsen?w=500&fm=avif)







Karissa Jacobsen

- [![Ontology vs Taxonomy vs Data Model](https://images.ctfassets.net/9pvazpst9iwl/4Mj2DqufC3TEYX0xSMRTFw/6166c5b08ab3990674088556a63d42ad/Blog_OntTaxDataModel_feature.jpg?w=500&fm=avif)](/blog/developers/ontology-vs-taxonomy-vs-data-model)



[Developers](/blog/developers) Published Dec 31, 2024

[**Ontology vs Taxonomy vs Data Model**](/blog/developers/ontology-vs-taxonomy-vs-data-model)







![Author Dan Selman](https://images.ctfassets.net/9pvazpst9iwl/2dTHDc9fQ7F8wwYw51a1Tk/1f3db0057a7ba8ef2c50d4451e3cfd35/Dan_Selman?w=500&fm=avif)







Dan Selman


[![Docusign for Developers Public Roadmap: A commitment to innovation and trust](https://images.ctfassets.net/9pvazpst9iwl/1RtQscjrM4R5O7ojCCj2wu/a3bccdc9a5fbfc8826e299d2eeb923c3/illustration-isometric_pyramid-shadow_inkwell.png?w=500&fm=avif)](/blog/developers/docusign-for-developers-public-roadmap)

[Developers](/blog/developers) Published Jan 7, 2025

[**Docusign for Developers Public Roadmap: A commitment to innovation and trust**](/blog/developers/docusign-for-developers-public-roadmap)

![Author Julian Macagno](https://images.ctfassets.net/9pvazpst9iwl/2r6Dxc7NBRF7HEefszaMeE/f15b2451600e956747d28f95e6de0a36/JulianMacagno.jpg?w=500&fm=avif)

Julian Macagno

[![LaborEdge Streamlines Healthcare Compliance with a Healthy Dose of Docusign](https://images.ctfassets.net/9pvazpst9iwl/48wNteOJWKLZVZAnRcf7dJ/fe70c1a2832242c33ac5c8da4f8bc503/illustration-isometric_cylinder-disks_inkwell.png?w=500&fm=avif)](/blog/developers/laboredge-streamlines-healthcare-compliance-with-a-healthy-dose-of-docusign)

[API Success](/blog/developers/api-success) Published Jan 2, 2025

[**LaborEdge Streamlines Healthcare Compliance with a Healthy Dose of Docusign**](/blog/developers/laboredge-streamlines-healthcare-compliance-with-a-healthy-dose-of-docusign)

![Author Karissa Jacobsen](https://images.ctfassets.net/9pvazpst9iwl/56GSAsknmGi0EtIB92ylgp/8175ea8eb46c4f2ba06d9d41b6d3d7b1/Karissa_Jacobsen?w=500&fm=avif)

Karissa Jacobsen

[![Ontology vs Taxonomy vs Data Model](https://images.ctfassets.net/9pvazpst9iwl/4Mj2DqufC3TEYX0xSMRTFw/6166c5b08ab3990674088556a63d42ad/Blog_OntTaxDataModel_feature.jpg?w=500&fm=avif)](/blog/developers/ontology-vs-taxonomy-vs-data-model)

[Developers](/blog/developers) Published Dec 31, 2024

[**Ontology vs Taxonomy vs Data Model**](/blog/developers/ontology-vs-taxonomy-vs-data-model)

![Author Dan Selman](https://images.ctfassets.net/9pvazpst9iwl/2dTHDc9fQ7F8wwYw51a1Tk/1f3db0057a7ba8ef2c50d4451e3cfd35/Dan_Selman?w=500&fm=avif)

Dan Selman

## Discover what's new with Docusign IAM or start with eSignature for free

[Explore Docusign IAM](https://www.docusign.com/intelligent-agreement-management) [Try eSignature for Free](https://trial.docusign.com/)

![Person smiling while presenting](https://images.ctfassets.net/9pvazpst9iwl/1gOiICnusnBqWxB11vmsFs/99a7ee68a05fa07fe6e5e35186e45394/smiling-woman-in-bright-sweater-presents-charts-on-laptop.png?w=500&fm=avif)



Document Generation for eSignature

Save selected topic
Save selected topic and subtopics
Save entire publication
Limitations and Considerations for Document Generation﻿
Dec 20, 2024
3 min read
TagsDocusign eSignatureeSignature
Limitations
Document generation is a new feature, and there are some limitations in this early stage. Docusign will continue to develop this feature, and potentially address some of these limitations in future releases.

Note: Many of these limitations apply specifically to the Agreement Template Builder for Document Generation (ATB), which is an option for creating a documentation generation template.
Supported file types
You can only use a .docx file to create a template for document generation. You cannot use ATB if you use any additional file types in your template.
Supported file size
ATB supports files up to 1 MB in size. If you upload a .docx file larger than 1 MB, you will be directed to the Classic Editor.
Documents per template
ATB supports up to five (5) documents per template. (No set limit for the Template Assistant add-on.)
Uploading documents with syntax
For Word documents containing document generation syntax, you must use the Docusign Template Assistant for Word to upload them to Docusign, as described in this help topic. If you attempt to upload a document with syntax directly to a Docusign template, the syntax will not be recognized.
Local file source
Documents for ATB must originate from a local storage source. You cannot upload files to your template from cloud sources, such as Google Drive.
PowerForms
Document generation does not support PowerForms.
Field types
ATB supports the following sender field types: Text, Number, Dropdown, and Date. For the Date field, ATB currently supports MM/dd/yyyy. The Template Assistant supports three date formats.
Headers and footers
ATB does not preserve headers and footers present in uploaded .docx files. If your documents have this feature, use the Template Assistant to prepare and upload your document to a template. See the topic Docusign Template Assistant for Word.
Access to form data
For the initial release, the document generation field data entered by the sender is not accessible for separate download.
Note: Document generation form field data is accessible through the API. See this API reference for details.
Direct template use only
Document generation templates created with ATB cannot be applied to an envelope document. You must use the template directly to create an envelope.
Correcting
When correcting an envelope, once a recipient finishes signing, or if the first recipient in the routing order is a Receives a Copy (CC) recipient, you can no longer edit the document generation form data. Likewise, you cannot add another document generation template to the envelope in this scenario.
Other considerations
Here is some additional information to consider before you develop document generation documents and templates.

Account setting
The Sending Settings option Enable Agreement Template Builder must be enabled for your account by your account administrator. This account setting is documented in this administrator guide on template usage settings.
User permissions
There are no unique document generation user permissions. The permissions required to create or use document generation templates are the same as for standard templates. See the Templates section of the Permission Profile Options guide.
Bulk send
Document generation supports bulk send, allowing you to use a document generation template and import a bulk list to send many envelopes at once. With bulk send, the sender does not enter custom data in a data-entry form prior to sending. Instead, the values for the document generation data fields come from the uploaded bulk send list. See the Bulk Send With Document Generation guide.
Sender field data is limited to a single document
Sender field data does not replicate across template documents. For example, a user is sending a template that has two documents, each with a sender field called “Address”. The sender will have to complete the value for "Address" twice in the web form filling page.
In addition, sender fields are specific to a single file. If you add a sender field to one template document, it can be repeated in that document, but it is not available to add to any other documents in the template.


APIs
eSignature REST API
API Reference
Envelopes
Documentgeneration
DocumentGeneration Resource
Document generation enables you to create reusable templates with professionally formatted documents that include personalized data. For example, you can create a boilerplate employment offer letter that is updated with job details for each candidate from an HR system .

To learn more about using these endpoints with the eSignature API, see Document generation in the eSignature concepts guide.

Methods Supported
Method	Description
getEnvelopeDocGenFormFields
GET
/restapi/v2.1/accounts/{accountId}/envelopes/{envelopeId}/docGenFormFields

Returns sender fields for an envelope.

updateEnvelopeDocGenFormFields
PUT
/restapi/v2.1/accounts/{accountId}/envelopes/{envelopeId}/docGenFormFields

Updates sender fields for an envelope.

Document Generation for eSignature

Save selected topic
Save selected topic and subtopics
Save entire publication
Document Generation for Docusign eSignature﻿
Aug 30, 2024
4 min read
TagsDocusign eSignatureeSignature
Document Generation for eSignature enables senders to generate customized documents where traditional field data is embedded seamlessly into the agreement. Document information is dynamically populated, generating final documents that are professional-looking and well formatted.

Document generation also makes deployment easy, since conditional logic can be inserted to hide or display agreement terms based on business rules. Using conditional content reduces the number of templates needed and saves time and effort in template creation and management.

Note: Data insertion and certain editing features are available to all Docusign eSignature and Docusign IAM customers. Additional functionality such as conditional content, dynamic tables, and API sending is available as an add-on. For more information about the Document Generation for eSignature add-on, contact the Docusign Sales team.
Use cases
Document generation is a valuable solution for high-volume use cases that require customizing or personalizing documents before sending. In these cases, the sender enters custom data using a data-entry form. The custom data is inserted seamlessly, generating finished documents that are highly customized. Signers receive the finished documents ready to review and sign.

The potential applications are vast. Here are a few use cases to illustrate the value of document generation.

Vehicle leasing
A leasing agent enters the customer's personal information and lease terms in the Pre-fill form to generate a fully customized lease.
HR offer letter
A large enterprise hires hundreds of people each quarter. An HR specialist generates offer letters customized with each prospective employee's information. Candidates receive personalized offer letters, helping them feel like valued individuals. The entry form for the custom data makes it fast and easy to enter each candidate's offer details accurately. If the HR specialist needs to send many offer letters at once, they can use bulk send. Each letter is customized with the offer details coming from the bulk send list.
Detailed contracts
A major corporation with complex contracts needs to ensure they are completed accurately. The data-entry form simplifies the sending process, guiding the sender through a list of all the data required to customize the contract.
How does document generation work?
Document Generation for eSignature uses templates and specially encoded Microsoft Word .docx files. The Word file is the document to send for signature, with special sender fields that act as placeholders for the dynamic form data. When you upload a Word file with sender fields to a template, it creates a template for document generation.

When senders use the template to send an envelope, a new step is added to the sending process. After adding recipients and other envelope data, the sender sees a form page to gather the form data. This form is generated automatically from the sender fields in the Word file. The data the sender enters into the form is dynamically inserted into the Word document, generating the customized agreement.

Document generation is built on the following components:

Microsoft Word .docx files with sender fields for dynamic data insertion
Docusign eSignature templates with the coded Word .docx files
Data entry form page for senders to enter custom data
Options to prepare Word files for document generation
There are two options for creating Word .docx files for document generation:

Agreement Template Builder
Edit template documents directly in eSignature to create and edit document generation templates. Just upload a .docx file to your eSignature template. Add sender and signer fields, define conditional logic rules to show or hide content, and preview your results with customized content. See Agreement Template Builder for Document Generation
Docusign Template Assistant for Word
Use a Microsoft Word add-in to help you build finished files for document generation in Docusign eSignature. It assists with adding sender fields, building rules to drive conditional content, and offers a preview option to check results before uploading the file to an eSignature template. See Docusign Template Assistant for Word
Docusign eSignature User Guides
This guide is part of a collection of user guides for Docusign eSignature. The following table provides information about some of the other user documentation available.

Title	Description
eSignature Basics for Senders	Introductory information for new users. Covers how to get started with Docusign eSignature and learn the basics.
Account Preferences and Profile Settings for Docusign eSignature	Information on how to manage your account preferences, including contacts list, notification preferences, managing delegated signers, and more.
Docusign eSignature for Senders - Recipients	Information on adding recipients to your envelopes. Includes advanced recipient techniques, such as setting a signing order, assigning access permissions, and adding optional recipients.
eSignature for Senders - Agreements	Expanded information on preparing documents for signature. Includes details on the different types of recipient and pre-fill fields you can add.
Document Generation for eSignature	Information on using document generation to automatically generate customized documents.
Docusign eSignature - Templates	Information on creating, using, and managing templates.
Docusign eSignature - PowerForms	Information on creating, using, and managing PowerForms. PowerForms is a no-code solution for a signer to generate an agreement on demand.
Web Forms	Information on creating, using, and managing web forms.
Payments User Guide	Information on settting up and using Docusign Payments to collect payments along with signed agreements.
Managing Envelopes for Senders	Information on managing your Docusign eSignature envelopes.
Docusign eSignature Reports	Information for senders and administrators on how to use reports to get insights into their Docusign account.
Docusign eSignature Signing Process	Information for signers on how to sign documents with Docusign eSignature.

Document Generation for eSignature

Save selected topic
Save selected topic and subtopics
Save entire publication
Document Generation Syntax﻿
Jul 10, 2024
3 min read
TagsDocusign eSignatureeSignature
Document generation starts with a properly-coded Microsoft Word .docx file. This file contains the static contents for your eSignature document, plus the data fields to specify the dynamic data for the sender to enter. You can create and edit documents in Microsoft Word or any word processing application that supports saving documents in .docx format. Then manually enter data fields and configure conditional rules.

Alternatively, you can use the Docusign Template Assistant for Word. This Word add-in assists with adding data fields, building rules to drive conditional content, and offers a preview option to check results before uploading the file to an eSignature template.

Important: You must use the Template Assistant to upload documents prepared with syntax. If you attempt to upload a document with syntax directly to a Docusign template, the syntax will not be recognized.
Basic syntax for data fields
The basic syntax for document generation data fields is the field name in double curly brackets, with no spaces.

In the following example .docx file, there are several data fields added to customize the offer letter. When the file is added to an eSignature template, a sender can use it for document generation. The sender fills in the information for each data field. That data is then dynamically inserted to generate a final document to send for signature. Word document with example data fields added.
The following are examples of valid and invalid syntax.

Valid field syntax
{{FieldName}}
{{ FieldName }}
{{fieldName}}
{{field_name}}
{{Field_Name}}
Invalid syntax
{{Field Name}}
{{field name}}
Formatting data fields
The text format of data fields comes from the formatting in the Word document. For example, the data field in the Tally example letter {{Start_Date}} is in bold font. So the value the sender enters for this field will be in bold in the final generated document. You can do the same with other formatting controls, such as font style, size, and color.

Conditional Content
You can construct conditional clauses to customize your generated document based on values entered for merge fields. See Conditional Rules and Syntax to Show Content.

Duplicate data fields
A document generation document may contain multiple instances of the same data field, that is, fields that use the same field name syntax. Fields with the same field name are populated with the same value. Senders see just one field to complete on the data-entry form. The value they enter is inserted into all instances of that data field in the final, generated document.

Data fields across separate documents are not related. If there are multiple document generation files in an envelope, the data-entry form presents the fields for each file separately. If documents have data fields with the same field name, the sender sees the field listed once for each document in which it appears. They can enter the same or different values for each.

Note: When using bulk send with document generation, data fields across separate documents remain linked. In this case, the same value must be used for all data fields that use the same field name syntax. See Limitations and Considerations for Document Generation.
Adding signature and other types of fields
Initially, document generation for eSignature will support only text data fields. The recommended approach for adding other types of eSignature fields is to use AutoPlace functionality. AutoPlace adds fields near each occurrence of a given string of characters. If you use conditional content rules, your final generated document can vary significantly in length and layout. Placing fixed fields on your template document could result in fields not appearing where you intended. AutoPlace places fields precisely where the target text string indicates, no matter where it ends up in your generated document.

You can place Signature or other fields near visible characters in your document, for example, if your document has a signature area and text "Sign here". Or you can add character strings in a font that matches the document background, making them invisible. For more information, see the guide Add Fields Automatically with AutoPlace.

Document Generation for eSignature

Save selected topic
Save selected topic and subtopics
Save entire publication
Conditional Rules and Syntax for Suppressing Text﻿
Apr 12, 2023
2 min read
TagsDocusign eSignatureeSignature
You can specify conditional rules to hide blocks of text based on the value of a data field.

Format for suppressing text
The format for suppressing text requires verbose syntax.

{{ t:"SuppressParagraph", e:"fieldName = ‘value’"}}Text that will be removed if the field name inputted by the sender is ‘value’

t: Indicates that it is a SuppressParagraph tag.
e: The condition that must be met for the suppress paragraph to be invoked.
The text after the t: and the e: must be in double quotes.
There must be a comma separating the t: and e: parameters.
Rules for suppressing text
Line breaks
Using SuppressParagraph will remove any text that is in the same paragraph as the suppress syntax. That is, when there is no explicit line break between the expression and the text to be removed.
In the following example, there is a line break before the second sentence, so it will not be removed.

{{ t:"SuppressParagraph", e:"fieldName = ‘value’"}}Text that will be removed if the field name inputted by the sender is ‘value’.
This sentence will not be removed because it comes after a line break
If there is a line break between the SupressParagraph tag and the conditional text, you will get an error.
In the following example, the SuppressParagraph tag is not in a paragraph of text; there is a line break between it and the text that follows it. This will generate a syntax error.

{{ t:"SuppressParagraph", e:"fieldName = ‘value’"}}
Text that will not be removed because it’s not in the same paragraph as the SuppressParagraph tag