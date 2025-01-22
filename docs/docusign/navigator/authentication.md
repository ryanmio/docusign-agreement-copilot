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