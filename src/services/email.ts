import {
  SendSmtpEmail,
  TransactionalEmailsApi,
  TransactionalEmailsApiApiKeys,
  ContactsApi,
  CreateContact,
  ContactsApiApiKeys,
  type HttpError,
} from "@getbrevo/brevo";

type Template = "userActionRequired" | "information";

interface Receiver {
  name?: string;
  email: string;
}

const TEMPLATE_NAME_TO_ID: Record<Template, number> = {
  userActionRequired: Number(process.env.USER_ACTION_REQUIRED_TEMPLATE_ID),
  information: Number(process.env.INFORMATION_TEMPLATE_ID),
};

export const sendEmail = async (
  subject: string,
  to: Receiver,
  template: Template,
  data?: Record<string, string>,
) => {
  const mailer = new SendSmtpEmail();

  mailer.subject = subject;
  mailer.to = [to];
  mailer.templateId = TEMPLATE_NAME_TO_ID[template];
  mailer.params = data;
  mailer.sender = {
    name: "Bolha",
    email: "noreply@bolha.pt",
  };

  const api = new TransactionalEmailsApi();
  api.setApiKey(TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY as string);

  try {
    return await api.sendTransacEmail(mailer);
  } catch (error) {
    console.error((error as HttpError).body);
    throw error;
  }
};

export const subscribeToNewsletter = async (email: string) => {
  const contact = new CreateContact();
  const api = new ContactsApi();

  contact.email = email;
  contact.listIds = [2];

  api.setApiKey(ContactsApiApiKeys.apiKey, process.env.BREVO_API_KEY as string);

  try {
    await api.createContact(contact);

    return;
  } catch (error) {
    if ((error as HttpError).body.code === "duplicate_parameter") {
      return;
    }

    throw error;
  }
};
