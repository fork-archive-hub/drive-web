import { Disclosure, Transition } from '@headlessui/react';
import { CaretUp } from 'phosphor-react';
import Section from '../../components/Section';

export default function Faq({ className = '' }: { className?: string }): JSX.Element {
  const questions: { title: string; body: string }[] = [
    {
      title: 'Why do I lose all my files if I lose my password?',
      body: 'Your password is the only way to access your account, the Internxt team cannot access your account on change your password. This is to prevent anyone from accessing your account or steal your information. <br/><br/>Among other things your password is used to encrypt your encryption key so not even the Internxt has access to it. Every time you log in you need your password to decrypt this encryption key that way we ensure you are the only one holding the encryption keys.',
    },
    {
      title: 'How can I keep safe my credentials?',
      body: 'We recommend to use a password manager to store your credentials safely not just for accessing the Internxt platform but to keep yourself safe and productive while browsing.',
    },
    {
      title: 'Can I recover my account with the backup key?',
      body: 'If you keep somewhere safe your encryption key, recover your data following the steps outlined in the email you will receive when clicking “forgot password”.',
    },
    {
      title: 'Do I lose all my files if I change my password?',
      body: 'No, since you are already logged in you can change your password without losing anything. Make sure you have chosen a strong password and it is not found in any data breach.',
    },
  ];

  return (
    <Section className={className} title="Did you miss anything?">
      {questions.map((question, i) => (
        <Disclosure defaultOpen={i === 0} key={i}>
          {({ open }) => (
            <>
              <Disclosure.Button
                className={`flex w-full justify-between px-5 text-left transition duration-100 ease-out ${
                  open ? ' rounded-t-lg bg-gray-5 pt-5 font-medium text-gray-80' : 'py-3 text-gray-60'
                }`}
              >
                <p>{question.title}</p>
                <CaretUp
                  className={`ml-4 mt-0.5 flex-shrink-0 text-gray-40 ${open ? '' : 'rotate-180 transform'}`}
                  weight="bold"
                  size={20}
                />
              </Disclosure.Button>
              <Transition
                enterFrom="transform opacity-0"
                enterTo="transform opacity-100"
                leaveFrom="transform opacity-100"
                leaveTo="transform opacity-0"
              >
                <Disclosure.Panel
                  className="rounded-b-lg bg-gray-5 px-5 pt-2 pb-5 text-sm text-gray-60 transition duration-100 ease-out"
                  dangerouslySetInnerHTML={{ __html: question.body }}
                />
              </Transition>
            </>
          )}
        </Disclosure>
      ))}
    </Section>
  );
}
