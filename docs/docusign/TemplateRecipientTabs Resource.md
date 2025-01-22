[eSignature REST API](/docs/esign-rest-api/)

v2.1

# TemplateRecipientTabs Resource

The TemplateRecipientTabs resource provides methods that let you add, update, and delete tabs from an envelope. Tabs are associated with a specific recipient in an envelope and are only used by the recipient types In Person Signers and Signers.

## Tab Types

This table lists the available tab types.

| Tab Type | Description |
| --- | --- |
| Approve (`approve`) | Place this tab on the document if you want the recipient to approve documents in an envelope without placing a signature or initials on the document. If the recipient clicks the Approve tab during the signing process, the recipient is considered to have signed the document. No information is shown on the document for the approval, but it is recorded as a signature in the envelope history. |
| Checkbox (`checkbox`) | Place this tab on the document in a location where the recipient can select a yes/no (on/off) type option. |
| Company (`company`) | Place this tab on the document where you want the recipient's company name to appear. |
| Date Signed (`dateSigned`) | Place this tab on the document where you want the date the recipient signed the document to appear. |
| Date (`date`) | Place this tab on the document where you want the recipient to enter a date. Date tabs are single-line fields that allow date information to be entered in any format. The tooltip for this tab recommends entering the date as YYYY-MM-DD, but this is not enforced. The format entered by the signer is retained. If you need a particular date format enforced, Docusign recommends using a Text tab with a validation pattern and validation message to enforce the format. |
| Decline (`decline`) | Place this tab on the document where you want to give the recipient the option of declining an envelope. If the recipient clicks the Decline tab during the signing process, the envelope is voided. |
| Email Address (`emailAddress`) | Place this tab on a document where you want the recipient's email, as entered in the recipient information, to appear. |
| Email (`email`) | This is a single-line field that accepts all characters. |
| Envelope ID (`envelopeId`) | Place this tab on the document where you want the envelope ID to appear. Recipients cannot enter or change the information in this tab. It is for informational purposes only. |
| First Name (`firstName`) | Place this tab on a document where you want the recipient's first name to appear. This tab splits the recipient's name (as entered in the recipient information) into sections based on spaces and uses the first section as the first name. |
| Formula (`formulaTab`) | This tab is used to add a calculated field to a document. Envelope recipients cannot directly enter information into the tab. The formula tab calculates and displays a new value when changes are made to the reference tab values. The reference tab information and calculation operations are entered in the "formula" element. See the Using the Calculated Fields Feature quick start guide or Docusign Service User Guide for more information about formulas. |
| Full Name (`fullName`) | Place this tab on the document where you want the recipient's full name to appear. |
| Initial Here (`initialHere`) | Place this tab where the recipient must initial the document. This tab can be set to be optional. |
| Last Name (`lastName`) | Place this tab on a document where you want the recipient's last name to appear. This tab splits the recipient's name (as entered in the recipient information) into sections based on spaces and uses the last section as the last name. |
| List (`list`) | This tab has a list of options that a recipient can select. The `listItems` parameter is used to set the options that can be selected. |
| Note (`note`) | Place this tab on the document where you want to add a note for the recipient on a document. |
| Number (`number`) | This tab is a field where the recipient can enter numbers and decimal (.) points. |
| Radio Group (`radioGroup`) | This group tab is used to place radio buttons on a document. The `radios` parameter is used to add and place the radio buttons associated with the group. Only one radio button can be selected in a group. |
| Sign Here (`signHere`) | Place this tab where the recipient must sign the document. This tab can be set to be optional. |
| Signer Attachment (`signerAttachment`) | The signer attachment is where the recipient initiates the process of adding supporting documents to an envelope. |
| SSN (`ssn`) | This tab is a single-line field where the recipient can enter numbers. A Social Security Number can be typed with or without dashes. |
| Text (`text`) | This tab is a field where the recipient can enter any type of characters. |
| Title (`title`) | Place this tab on the document where you want the recipient's title to appear. |
| Zip (`zip`) | This tab is a single-line field where the recipient can enter numbers. |

## Using Custom Tabs in Envelopes and Templates

Custom Tabs can be added to envelopes and templates by setting the `customTabId` property when creating an envelope or template recipient or when adding a new tab for an existing recipient. The custom tab must be added as the correct tab type. For example, if the custom tab type is text, it cannot be used as a number tab.

When the `customTabId` property is set, the new tab inherits all the custom tab properties. Required information that is not included in the custom tab, such as document ID and page ID, must be included when adding the tab. If the custom tab does not have anchor settings, the X and Y positions must be included.

After the tab is created, it is treated as any other tab for updating or deleting.

## Anchoring Tabs

The tab anchoring option allows you to send documents for signature that do not have a fixed layout or format. In these documents, you might not know the absolute location of the tabs when you design your API client application because the tabs must move with text. As an alternative to sending X and Y coordinates for tabs, the Docusign Service can derive an anchor location for the tab by correlating anchor information to data within the document.

When the Docusign Service receives a request that contains tabs with anchor information, it searches the document for instances of the `anchorString` property. When found, it places a tab of the specified type for the designated recipient. Tab positions are established by setting offsets for the tab.

When you apply tabs to the document, Docusign does not remove or replace the text in the `anchorString` property. You can hide codified anchors by using the same font color as the background of the document. So the anchor can be used by Docusign processes and it will not be visible on the document.

### To use an anchoring option:

1. Identify the location in the document by text string. You can use a pre-existing text string or add a new one. For best performance, Docusign recommends using single word anchor strings when possible, especially when there are a large number of pages in the envelope. For example, you might want to add a Sign Here tab to the "Borrower's Signature" lines in a document, but that phrase might occur in places in the document where you don't want the tab to appear. In this case, you could add the text "BorrowerSignHere" in white font color (so that it isn't visible in the document) to all the places you want Sign Here tabs to appear and use "BorrowerSignHere" as the anchor string.
2. Reference the anchor through the `anchorString` property of the tab.
3. Determine the offset from the anchor string location to where the tab should be placed.

Setting a positive value in the `anchorXOffset` property moves the tab right on the page and positive values in the `anchorYOffset` property move the tab down the page. The `anchorUnits` property specifies the units used for the offsets. For Sign Here and Initial Here tabs, the bottom-left of the anchor string is equivalent to position (0,0), and the bottom-left of the tab graphic is placed relative to that. For all other tabs, the bottom-left of the anchor string is equivalent to position (0,0), and the top-left of the tab graphic is placed relative to that. Docusign does not currently provide tools to derive the offset values. Determination of the proper offset will likely require some trial-and-error.

### Rules for working with anchor tags

When anchor tabs are used, all documents in the envelope are searched for the `anchorString` property.

- You set the text of the anchor string in the `anchorString` property. Docusign tabs are created for each instance of the `anchorString` property within the document, so special care must be taken to establish unique anchor strings that do not result in unintentional tabs.
- You cannot use the same anchored tab for different recipients for the same document.
- The Docusign system cannot search for text that is embedded in an image when checking for anchor strings.
- X or Y offsets supplied for a tab apply to all instances of the tab in the document. To use different offsets at different locations in the document for the same recipient, create multiple, unique anchor tabs.
- If the Y offset value of an anchor string would force a tab outside of the page boundaries, the tag is placed at the page boundary. If the X offset value places a tab outside of the page boundaries, the error message `Invalid_User_Offset` is sent. The error message includes the X offset that resulted in the error.
- The system does not support an anchor string embedded in the form of a PDF X-object in the document.
- The system does not re-flow the text that surrounds the anchor tabs. It is the responsibility of the document author to provide sufficient white space to contain the potential width of the ultimate tab value.

### Tips and Tricks

The following are tips for effective use of anchor tags:

- In order to avoid unintentional conflicts between text contained in an `anchorString` property and the text that naturally exists in documents, establish a codified syntax for the anchor string text that is unlikely to appear elsewhere in a document.
- Develop an extensible and consistent syntax that can be used across multiple document types.
- Especially for documents that have variable numbers of tabs or signers, author the source document to include hidden anchor tabs for all potential signers/permutations. Then, control the tabs that are actually placed by including/excluding the anchor tabs in the request. This approach allows a single document to be used for all use cases instead of maintaining separate documents for each scenario.

## Automatically Populating Tabs

If you want similar tab types to automatically populate with the same data, you must follow these guidelines:

- Each `tabLabel` entry must have the characters `\\*` in front of the label. If you omit the `\\*` prefix, only the first occurrence of the tab is populated.

When automatically populating tabs, the `tabLabel` must not contain any spaces. In the JSON example below, the Text tabs properties `StudentLastName` and `StudentFirstName` will be auto-populated as specified ("Doe" and "John") each place they appear throughout the envelope.

```
"tabs": {
    "textTabs": [\
    {\
      "tabLabel": "\\*StudentLastName",\
      "value": "Doe"\
    },\
    {\
      "tabLabel": "\\*StudentFirstName",\
      "value": "John"\
    }]
}

```

- Each occurrence of the tab must have identical properties.

For example, suppose there are two Text tabs in a document,
each with `tabLabel` set to `Name`.
If one tab has the `bold` property set to **true,**
and the other has the `bold` property set to **false,**
only the first one will be populated.
In order to automatically populate both occurrences
of the `Name` Text tabs,
the `bold` property must be set to the same value for both tabs.


## Methods Supported

| Method | Description |
| --- | --- |
| [create](/docs/esign-rest-api/reference/templates/templaterecipienttabs/create/) | POST<br>```css-1cxojf3<br>/restapi/v2.1/accounts/{accountId}/templates/{templateId}/recipients/{recipientId}/tabs<br>```<br>Adds tabs for a recipient. |
| [delete](/docs/esign-rest-api/reference/templates/templaterecipienttabs/delete/) | DEL<br>```css-1cxojf3<br>/restapi/v2.1/accounts/{accountId}/templates/{templateId}/recipients/{recipientId}/tabs<br>```<br>Deletes the tabs associated with a recipient in a template. |
| [list](/docs/esign-rest-api/reference/templates/templaterecipienttabs/list/) | GET<br>```css-1cxojf3<br>/restapi/v2.1/accounts/{accountId}/templates/{templateId}/recipients/{recipientId}/tabs<br>```<br>Gets the tabs information for a signer or sign-in-person recipient in a template. |
| [update](/docs/esign-rest-api/reference/templates/templaterecipienttabs/update/) | PUT<br>```css-1cxojf3<br>/restapi/v2.1/accounts/{accountId}/templates/{templateId}/recipients/{recipientId}/tabs<br>```<br>Updates the tabs for a recipient. |

# : create

Adds one or more tabs for a recipient.

## Request

#### HTTP Request

POST

```css-1cxojf3

/restapi/v2.1/accounts/{accountId}/templates/{templateId}/recipients/{recipientId}/tabs
```

## Parameters

| #### Path Parameters |  |  |
| --- | --- | --- |
| accountId \* | string | The external account number (int) or account ID GUID. |
| recipientId \* | string | A local reference used to map<br>recipients to other objects, such as specific<br>document tabs.<br>A `recipientId` must be<br>either an integer or a GUID,<br>and the `recipientId` must be<br>unique within an envelope.<br>For example, many envelopes assign the first recipient<br>a `recipientId` of `1`. |
| templateId \* | string | The ID of the template. |

\\* Required

## SDK Method

### Templates::createTabs

## Request Body

- Schema

- Definitions


### templateTabs  `object`

# : update

Updates one or more tabs for a recipient in a template.

## Request

#### HTTP Request

PUT

```css-1cxojf3

/restapi/v2.1/accounts/{accountId}/templates/{templateId}/recipients/{recipientId}/tabs
```

## Parameters

| #### Path Parameters |  |  |
| --- | --- | --- |
| accountId \* | string | The external account number (int) or account ID GUID. |
| recipientId \* | string | A local reference used to map<br>recipients to other objects, such as specific<br>document tabs.<br>A `recipientId` must be<br>either an integer or a GUID,<br>and the `recipientId` must be<br>unique within an envelope.<br>For example, many envelopes assign the first recipient<br>a `recipientId` of `1`. |
| templateId \* | string | The ID of the template. |

\\* Required

## SDK Method

### Templates::updateTabs

## Request Body

- Schema

- Definitions


### templateTabs  `object`

# : list

Gets the tabs information for a signer or sign-in-person recipient in a template.

## Request

#### HTTP Request

GET

```css-1cxojf3

/restapi/v2.1/accounts/{accountId}/templates/{templateId}/recipients/{recipientId}/tabs
```

## Parameters

| #### Path Parameters |  |  |
| --- | --- | --- |
| accountId \* | string | The external account number (int) or account ID GUID. |
| recipientId \* | string | A local reference used to map<br>recipients to other objects, such as specific<br>document tabs.<br>A `recipientId` must be<br>either an integer or a GUID,<br>and the `recipientId` must be<br>unique within an envelope.<br>For example, many envelopes assign the first recipient<br>a `recipientId` of `1`. |
| templateId \* | string | The ID of the template. |

| #### Query Parameters |  |  |
| --- | --- | --- |
| include\_anchor\_tab\_locations | string | When **true,** all tabs with anchor tab properties are included in the response. The default value is **false.** |
| include\_metadata | string | When **true,** the response includes metadata indicating which properties are editable. |

\\* Required

## SDK Method

### Templates::listTabs
