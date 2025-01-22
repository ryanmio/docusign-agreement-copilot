# DocuSign Embedded Signing and CSP Configuration

When integrating DocuSign into your application, embedded signing offers a streamlined user experience by allowing users to sign documents without leaving your platform. However, Content Security Policy (CSP) configurations can pose challenges to a smooth embedding process. This article delves into the intricacies of DocuSign embedded signing and how to navigate CSP settings for seamless integration.

## Understanding DocuSign Embedded Signing

DocuSign provides various methods for recipients to sign documents. Traditionally, signers receive an email notification prompting them to access and sign the document through the DocuSign web application. Embedded signing, on the other hand, allows the signing process to be seamlessly integrated into your own application or website. This eliminates the need for signers to leave your platform, providing a more user-friendly and efficient experience.

With embedded signing, you can present the DocuSign signing session in different ways, such as using a minimalist UX wrapper that focuses solely on the document and a signing button, or by leveraging DocuSign's JS library for a more integrated experience.

To enable embedded signing, you need to designate a recipient as embedded by setting a unique clientUserId property for them. This property, along with the recipient's name and email, identifies the embedded recipient and is crucial for generating a unique signing URL for that specific person. This signing URL is then used to initiate the embedded signing session within your application.

It's important to note that while embedded signing generally keeps users within your platform, certain situations might require redirecting them to the DocuSign website. This can occur for identity verification purposes or when specific account settings are enabled.

Furthermore, you can control email notifications for embedded signers using the embeddedRecipientStartURL property. By default, embedded signers might not receive email notifications. However, setting this property to SIGN_AT_DOCUSIGN will prompt DocuSign to send an email notification, even if the "Suppress Emails to Embedded Signers" setting is enabled in your account.

The ability to fine-tune these settings provides flexibility in how you implement embedded signing and manage signer notifications. To ensure a smooth and secure embedded signing experience, it's essential to understand and correctly configure your Content Security Policy (CSP).

## Content Security Policy (CSP) and its Role

Content Security Policy (CSP) is a crucial web security standard that helps mitigate cross-site scripting (XSS) and other code injection attacks. It allows website administrators to control the resources the browser is allowed to load, reducing the risk of malicious content being executed. CSP achieves this by specifying a set of directives, each controlling a specific type of resource.

One of the essential CSP directives for embedded signing is frame-ancestors. This directive dictates which websites are allowed to embed the current page in a frame or iframe. When embedding DocuSign's signing page into your application using an iframe, proper configuration of the frame-ancestors directive is vital.

Without the correct frame-ancestors directive, the browser, acting on security protocols, might block the DocuSign iframe from loading. This would prevent your users from signing documents within your application, disrupting the intended user experience. Therefore, understanding and correctly configuring CSP, particularly the frame-ancestors directive, is paramount for a successful embedded signing implementation.

## Configuring CSP for DocuSign Embedded Signing

To ensure that DocuSign's embedded signing works seamlessly with your CSP settings, you need to add the appropriate frame-ancestors directive to your CSP header. This directive should include the URLs of DocuSign's servers that are involved in the embedded signing process.

Here's how you can configure the frame-ancestors directive:

- Specify Allowed Domains: Explicitly list the DocuSign domains that are allowed to embed your page. For example, to allow embedding from DocuSign's demo environment and your own website, you would use:

  `frame-ancestors https://apps-d.docusign.com https://yourdomain.com;`

- Use Wildcards: If you need to allow embedding from multiple subdomains of DocuSign, you can use wildcards. For example, to allow embedding from all DocuSign subdomains, you would use:

  `frame-ancestors *.docusign.com;`

- Local Development: For local development and testing, you can include http://localhost in your frame-ancestors directive. However, for production environments, ensure that your site uses HTTPS and include the HTTPS URL in the directive.

In addition to configuring the frame-ancestors directive, you should also be aware of DocuSign account settings that can influence embedded signing. One such setting is "Suppress Emails to Embedded Signers." This setting, found in the DocuSign web console under Preferences >> Features, controls whether embedded signers receive email notifications about the signing request. By default, this setting might be enabled, preventing email notifications from being sent. You can adjust this setting based on your specific needs and preferences.

It's important to note that the frame-ancestors directive cannot be set using the <meta> tag or within the <iframe> tag itself. It must be delivered via HTTP headers to be effective.

## DocuSign Allowed Domains Configuration

Beyond CSP, another crucial aspect of integrating DocuSign is configuring allowed domains. This involves ensuring that your security software, including spam filters, allows emails and web requests from DocuSign's domains. Failure to do so might result in legitimate DocuSign emails being blocked or web requests being denied, hindering the signing process.

To manage allowed domains in DocuSign, you can use the DocuSign Admin console. Here, you can add and verify domains, ensuring that your organization's email domain and any subdomains are recognized and trusted by DocuSign. This process typically involves adding DNS records, such as CNAME or TXT records, to your domain's configuration.

By proactively configuring allowed domains, you can prevent potential disruptions to your DocuSign workflows and maintain a smooth and reliable signing experience for your users.

## Best Practices for CSP and Embedded Signing

- Keep CSP Up-to-Date: Regularly review and update your CSP configuration to ensure it aligns with the latest DocuSign domains and your security requirements.
- Use HTTPS: Always use HTTPS for your website, especially when dealing with sensitive information like signatures.
- Test Thoroughly: Test your embedded signing implementation across different browsers and devices to ensure compatibility and a smooth user experience.
- Consider Alternatives: While iframes are a common way to embed content, they come with potential security concerns. Iframes can be vulnerable to clickjacking attacks, where malicious actors trick users into clicking on hidden elements within the iframe. Additionally, iframes can make it difficult for users to verify the authenticity of the DocuSign signing page, potentially exposing them to phishing attempts.

To mitigate these risks, DocuSign offers alternative approaches like using DocuSign JS with focused view. This method provides a more seamless and secure way to embed the signing experience within your application. Focused view uses a minimalist design, displaying only the essential elements of the signing session, and leverages DocuSign's JS library for enhanced integration and control.

When using DocuSign JS with focused view, you'll need to configure the frameAncestors and messageOrigins properties in your code. These properties ensure that communication between your application and DocuSign's servers is secure and authorized.

By following these best practices and considering alternative embedding methods, you can create a secure and user-friendly embedded signing experience that integrates seamlessly with your application.

## Synthesis

This article explored the key aspects of DocuSign embedded signing and its relationship with Content Security Policy (CSP). We learned that embedded signing offers a streamlined and efficient way to integrate DocuSign into your application, enhancing the user experience and potentially increasing completion rates. However, successful implementation requires a thorough understanding of CSP and its role in securing web applications.

We delved into the frame-ancestors directive, a crucial element of CSP that controls which websites can embed your application's pages in iframes. Configuring this directive correctly is essential to prevent browsers from blocking the DocuSign iframe and disrupting the signing process.

Furthermore, we discussed the importance of configuring allowed domains in DocuSign to ensure that emails and web requests from DocuSign are not blocked by your security software.

Finally, we explored best practices for embedded signing, including keeping your CSP up-to-date, using HTTPS, and considering alternative embedding methods like DocuSign JS with focused view to mitigate potential security risks associated with iframes.

By understanding and implementing these concepts, you can confidently integrate DocuSign embedded signing into your application, providing a secure and user-friendly signing experience for your users.