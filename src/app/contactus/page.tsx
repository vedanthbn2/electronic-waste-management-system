import dynamic from 'next/dynamic';

const ContactUs = dynamic(() => import('./ContactUs'), { ssr: false });

export default function ContactUsPage() {
  return <ContactUs />;
}
