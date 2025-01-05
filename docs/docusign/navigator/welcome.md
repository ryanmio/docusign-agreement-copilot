
# Docusign Navigator API Closed Beta Program

**External Inbox**

From: Steven Baxter <steven.baxter@docusign.com>  
Sent: 7:28 PM (1 hour ago)

Welcome to the Docusign Navigator API Closed Beta Program! We're excited to have you on board and appreciate your participation. Your feedback is invaluable as we work to refine and enhance the Navigator API. This Beta Program and access to the relevant Developer Tools and Docusign Navigator will end on February 28th, 2025.

Your access to the Docusign Developer Tools, the Docusign Demo environment, and the Navigator API is governed by the Docusign Developer Terms and Conditions.

To enable your use of the Navigator API, we are including a free trial of Docusign Navigator that is limited to 100 agreements and is governed by the Docusign Master Services Agreement and the related AI Attachment for Docusign Services. This free trial will end when your participation in the Beta Program ends.

## Getting Started

To help you begin, please explore the following resources:

- **Getting Started Guide:** Instructions on setting up your test environment.
- **Set Up Test Environment**
- **DocuSign's Beta Workspace for Partners:** A collaborative environment where you can access the latest Postman collections, get early access to new operations and features, and provide feedback directly to our product team as part of our API-design first development process. (note: watch your inbox for a workspace invite)
- **Partner Workspace**
- **API Reference:** Comprehensive documentation of the Navigator API.
- **Sample Agreements:** Access sample agreements to assist with your integration.
- **Navigator API Community Group:** Share your experience, offer feedback, and get answers to your questions in our dedicated community channel.

## Upcoming Updates

We have many updates planned for the Navigator API, introducing new operations and capabilities. We'll keep you informed of these changes via email notifications, so you can stay up-to-date and continue to provide valuable feedback.

## API-Design First at Docusign

With the launch of Docusign's Intelligent Agreement Management, we have embraced an API-design first approach to our next generation APIs. This means we prioritize designing and refining our API interfaces before implementation to ensure a consistent and developer-friendly experience.

As a beta participant, you can actively contribute to this process:

- **Early Access:** Use our Postman Partner Workspace to access early designs of new operations and features.
- **Feedback Loop:** Provide feedback through our, allowing us to quickly iterate and fine-tune the API design.
- **Collaborative Development:** Help us lock down the API definitions upfront by sharing your insights and suggestions.

Your involvement helps us create better tools for the developer community.

If you have any questions or need assistance, please don't hesitate to reach out to us at developers@docusign.com.

Thank you once again for joining the Navigator API Closed Beta Program. We look forward to your contributions!

Best regards,

One-time setup procedures
In addition to the prerequisites, you’ll need to complete these steps:
Create an integration in your Docusign developer account
Add agreements in Navigator (optional)
Fork the Postman collection and set environment variables

After you've completed the one-time setup, follow the steps in Authenticate and execute Navigator API requests whenever you want to test Navigator API requests.

Fork the Postman collection and set environment variables
This procedure enables you to fork the Docusign-provided Navigator API collection into your workspace and configure the forked collection with environment variables required for authentication. This is a one-time setup procedure.

To fork the collection and set environment variables:
Access the Docusign API: Beta APIs Postman workspace via the link that was sent to you when you were accepted to the closed beta.

If you don't see the Docusign API: Beta APIs workspace, then you have not been granted access to participate in the Navigator API closed beta. To apply to participate, fill out the Navigator API Beta: Request Form.

Provide your Postman account credentials.
Select Collections in the Postman left navigation.
In the list of collections, select Navigator API [version]-beta #examples.
Select the ellipsis to the right of Navigator API [version]-beta #examples, and select Create a fork.


Create fork

Enter a Fork label and select your workspace or your team's workspace. Docusign recommends leaving Watch original collection selected so that you'll be notified of any updates.


Fork label and workspace

Select Fork Collection.
In the Workspaces menu, select your workspace to switch to it from the Docusign workspace.


Switch workspace

To the right of the workspace name, select New, and then select Environment.
Select the ellipsis next to the new environment, select Rename, and then supply a name for the environment.


Rename environment

Add these variables with values you obtained when you completed the Create integration in Docusign developer account procedure.

Variable	Initial and Current Value
clientId	The integration key from the integration you created in your Docusign developer account
clientSec	The client secret from the integration you created in your Docusign developer account


The list will look similar to this:


Environment variables

Select Save.

Authenticate and execute Navigator API requests
Once you've completed all the one-time setup procedures in the previous sections, follow this procedure any time you want to test Navigator API requests.

To authenticate and execute Navigator API requests:
Access your Postman workspace.
Select Collections in the Postman left navigation.
In the Collections list, select the forked Navigator API collection that you created in the previous procedure.
In the environment list in the upper right corner, select the environment you created in the previous procedure.


Select environment

Make sure that the environment name appears selected.
Switch to the Authorization tab.
Scroll to the bottom and select Get New Access Token.


Authorization tab

On the Log in to Docusign window, supply your developer account email, click Next, supply your password, and click Next.


Access token login


Note: If the window displays the message The redirect URI is not registered properly with Docusign, follow the steps in Create integration in Docusign developer account to add the required URI to your integration and save it. Then try the authentication steps again.
An Authentication Complete window appears, followed by a Manage Access Tokens window. Select Use Token.


Manage access tokens

In the Collections list, under your forked collection, expand the Auth folder.
Select the User Account Info request.


Get user account info

Select Send. The request is executed and a post-request script will populate the account ID associated with your default account as the accountId environment variable. If you want to use an ID of another account, replace the value of accountId with the preferred value.
You can now execute the Agreements:getAgreement and Agreements:getAgreementsList requests in the Agreements folder. They will return the sample agreement data in your account.


GET requests

Authentication
The Navigator API is currently available as part of a closed beta program. See Learn about the Navigator API beta for details.


All calls to the Docusign Navigator API are authenticated using an access token that your app obtains using one of the standard OAuth 2.0 grants supported by Docusign:
Authenticate with Public Authorization Code Grant
How to get an access token with Confidential Authorization Code Grant
Implicit Grant
JWT Grant
Note: See Choose OAuth type for details on when to use each authentication type.

The only difference between authenticating with the Navigator API and the eSignature API is that, when requesting the access token in your OAuth2 scenario, you must request a special Docusign Navigator scope in addition to your other Docusign eSignature Authentication scopes.
Scope	Description
adm_store_unified_repo_read 	Required to read agreement data from Navigator API.
models_read	Used to the read model schema. Not currently required for any API endpoint methods, but it should be requested by apps making Navigator API calls to support forward-compatibility, as a best practice.

Important: If the required Docusign Navigator API scopes were not explicitly requested, calls to the Docusign Navigator API will fail.