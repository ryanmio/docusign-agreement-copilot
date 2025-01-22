

# EnvelopeRecipientTabs Resource
Version: eSignature REST API v2.1

The EnvelopeRecipientTabs resource provides methods that enable you
to add,
update,
and delete tabs
from an envelope.
Tabs are associated with a specific recipient
in an envelope
and are only used by the recipient types
In Person Signers and Signers.

**On this page**

- Tab Types
- View Tab
- Requesting Payments
- Using Custom Tabs in Envelopes and Templates
- Anchoring Tabs
- Automatically Populating Tabs

## Tab Types

Some tabs enable values to be entered by the signer.
Those tabs' values can be preset either through the web browser
or via the API. Other tab types use information that is already
recognized by the Docusign platform.
These tabs cannot have their value updated on a per-tab basis
by the API or via the browser. In some cases, the info might be
settable using a different technique.
For example, the Full name tab uses the signer's name,
which is set elsewhere in the request.

Here is the list of tabs and whether you can or cannot set their values in the tab definition:

| Tab Type | Description |
| --- | --- |
| Approve ( `approve`) | Allows the recipient to approve documents without placing a signature or initials on the document. If the recipient clicks the tab during the signing process, the recipient is considered to have signed the document. No information is shown on the document of the approval, but it is recorded as a signature in the envelope history. This value **can't** be set. |
| Checkbox ( `checkbox`) | Allows the recipient to select a yes/no (on/off) option. This value can be set. |
| Commission County ( `commissionCounty`) | Displays the county of a notary's commission. This tab can only be assigned to a remote notary recipient using Docusign Notary. This value **can't** be set in the API call. |
| Commission Expiration ( `commissionExpiration`) | Displays the expiration date of a notary's commission. This tab can only be assigned to a remote notary recipient using Docusign Notary. This value **can't** be set. |
| Commission Number ( `commissionNumber`) | Displays the number of a notary's commission. This tab can only be assigned to a remote notary recipient using Docusign Notary. This value **can't** be set. |
| Commission State ( `commissionState`) | Displays the state in which a notary's commission was granted. This tab can only be assigned to a remote notary recipient using Docusign Notary. This value **can't** be set. |
| Company ( `company`) | Displays the recipient's company name. This value **can't** be set. |
| Date Signed ( `dateSigned`) | Displays the date that the recipient signed the document. This value **can't** be set. |
| Date ( `date`) | Allows the recipient to enter a date. Date tabs are one-line fields that allow date information to be entered in any format. The tooltip for this tab recommends entering the date as YYYY-MM-DD, but this is not enforced. The format entered by the signer is retained. If you need a particular date format enforced, Docusign recommends using a Text tab with a validation pattern and a validation message to enforce the format. This value can be set. |
| Decline ( `decline`) | Allows the recipient the option of declining an envelope. If the recipient clicks the tab during the signing process, the envelope is voided. This value **can't** be set. |
| Email Address ( `emailAddress`) | Displays the recipient's email as entered in the recipient information. This value **can't** be set. |
| Email ( `email`) | Allows the recipient to enter an email address. This is a one-line field that checks that a valid email address is entered. It uses the same parameters as a Text tab, with the validation message and pattern set for email information.<br>When getting information that includes this tab type, the original value of the tab when the associated envelope was sent is included in the response. This value can be set. |
| Envelope ID ( `envelopeId`) | Displays the envelope ID. Recipients cannot enter or change the information in this tab. This value **can't** be set. |
| First Name ( `firstName`) | Displays the recipient's first name. This tab takes the recipient's name as entered in the recipient information, splits it into sections based on spaces and uses the first section as the first name. This value **can't** be set. |
| Formula Tab ( `formulaTab`) | The value of a formula tab is calculated from the values of other number or date tabs in the document. When the recipient completes the underlying fields, the formula tab calculates and displays the result. This value can be set. The `formula` property of the tab contains the references to the underlying tabs. See Calculated Fields in the Docusign Support Center to learn more about formulas. If a formula tab contains a `paymentDetails` property, the tab is considered a payment item. See Requesting Payments Along with Signatures in the Docusign Support Center to learn more about payments. |
| Full Name ( `fullName`) | Displays the recipient's full name. This value **can't** be set. |
| Initial Here ( `initialHere`) | Allows the recipient to initial the document. May be optional. This value **can't** be set. |
| Last Name ( `lastName`) | Displays the recipient's last name. This tab takes the recipient's name as entered in the recipient information, splits it into sections based on spaces and uses the last section as the last name. This value **can't** be set. |
| List ( `list`) | This tab offers a list of options to choose from. The `listItems` property is used to specify the selectable options. This value can be set, |
| Notarize ( `notarize`) | Place this tab on a page to alert Notary recipients that they must take action. Only one notarize tab can appear on a page. This value can be set. |
| Notary Seal ( `notarySeal`) | Enables the recipient to notarize a document. This tab can only be assigned to a remote notary recipient using Docusign Notary. This value **can't** be set. |
| Note ( `note`) | Displays additional information, in the form of a note, for the recipient. This value can be set. |
| Number ( `number`) | Allows the recipient to enter numbers and decimal (.) points. This value can be set. |
| Numerical ( `numerical`) | Numerical tabs provide robust display and validation features, including formatting for different regions and currencies, and minimum and maximum value validation. |
| Phone Number ( `phoneNumber`) | Allows the recipient to enter a phone number. This tab can only be assigned to a remote notary recipient using Docusign Notary. This value **can't** be set. |
| Radio Group ( `radioGroup`) | This group tab is used to place radio buttons on a document. The `radios` property is used to add and place the radio buttons associated with the group. Only one radio button can be selected in a group. This value can be set. |
| Sign Here ( `signHere`) | Allows the recipient to sign a document. May be optional. This value **can't** be set. <br>**Note:** `signHere` tabs can also be used to add a visual representation for an electronic seal in a document. |
| Signer Attachment ( `signerAttachment`) | Allows the recipient to attach supporting documents to an envelope. This value **can't** be set. |
| SSN ( `ssn`) | A one-line field that allows the recipient to enter a Social Security Number. The SSN can be typed with or without dashes. It uses the same parameters as a Text tab, with the validation message and pattern set for SSN information. This value can be set. |
| Text ( `text`) | Allows the recipient to enter any type of text. This value can be set. Maximum length: 4000 bytes. |
| Title ( `title`) | Displays the recipient's title. This value **can't** be set. |
| View ( `view`) | The View tab is used with the Approve tab to handle supplemental documents. This value can be set. |
| Zip ( `zip`) | Allows the recipient to enter a ZIP code. The ZIP code can be five digits or nine digits in the ZIP+4 format. The zip code can be typed with or without dashes. It uses the same parameters as a Text tab, with the validation message and pattern set for ZIP code information. This value can be set. |

## View Tab

The View tab is used on supplemental documents.
To learn more about using the View tab with
supplemental documents, see
Using Supplemental Documents
in the Sending Documents section of
the Envelope: create method.

| Name | Required | Type | Description |
| --- | --- | --- | --- |
| documentId | Yes | String | The document ID number that the tab is placed on. This must refer to an existing Document's ID attribute. |
| pageNumber | Yes | String | Must be set to 1. |
| recipientId | Yes | String | The recipient associated with the tab. Must refer to an existing recipient's ID attribute. |
| required | No | Boolean | When **true,** the recipient is required to select the supplemental document View button during signing. |
| tabLabel | No | String | The label used for the tab. If an empty string is provided for this, an empty sting is used. If no value is provided, the tab type is used as the value. Maximum of 500 characters. |
| templateLocked | No | Boolean | Optional. Used only when working with template tabs. When **true,** the attributes of the tab cannot be changed by the sender. |
| templateRequired | No | Boolean | Optional. Used only when working with template tabs. When **true,** the tab cannot be removed by the sender. |
| xPosition | Yes | String | Required, but can be 0. |
| yPosition | Yes | String | Required, but can be 0. |

## Requesting Payments

The Payments feature of the Docusign eSignature REST API
lets you collect payments
along with signatures and other information.

To send a request for payment
and collect payments,
you need a payment gateway account,
which is the destination for the payments.
Create a payment account
with a supported payment gateway,
and then connect the payment gateway account
to your Docusign account.
To learn how to connect a payment gateway account
to your Docusign account
see Managing Payment Gateways
in the Docusign Support Center.
You must connect and manage payment gateway accounts manually
through the Docusign Admin console
and through your chosen payment gateway.
There is no public API
for connecting payment gateway accounts
to Docusign accounts
or for managing payment gateway accounts.

Currently
Stripe,
Braintree,
Authorize.net,
CyberSource,
Zuora, and
Elavon
are the supported payment gateways.

### How Payments Work

To make a request for payment,
use a formulaTab
that has a
paymentDetails object.
This object includes
a list of paymentLineItem objects.
Each line item refers to a number tab
that contains the value of the each item.
The purpose of the line items
is to transmit them to the payment gateway
as metadata, so that you can use the information
in the payment processor.

**Note:** If the `fileExtension` parameter is not added in an API call, only base64 converted PDF files will be accepted.
Any attempt to send a non-PDF file without using `fileExtension` results in an error.

This is an example request for two books.
Each book is specified in the `number` tabs
labeled "Hamlet" and "Tempest".
The books are referenced as line items
by their tab labels
within the `paymentDetails` object
of a `formula` tab.
The formula of the `formula` tab
add the values of the same two `number` tabs.

**Note:** This example uses US dollars, a decimal currency,
so the price is multiplied
by 100. If you are using a zero-decimal currency,
such as Japanese yen, _do not_ multiply by 100.
