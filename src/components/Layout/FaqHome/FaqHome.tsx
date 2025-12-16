'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

const faqs = [
  {
    question: 'What types of leads do you provide?',
    answer:
      `We specialize in generating high-quality, verified leads for contractors, realtors, and other service professionals. Whether you're in home improvement, real estate, solar installation, or any other service industry, we connect you with prospects actively seeking your services.`,
  },
  {
    question: 'How do you verify the leads?',
    answer:
      `Our verification process combines automated tools and manual checks to ensure the contact information is accurate and that the lead is genuinely interested in your services. We filter out duplicates and incomplete entries to deliver only quality, ready-to-engage prospects.`,
  },
  {
    question: 'How does your payment structure work?',
    answer:
      `There are no setup fees or upfront costs. You only pay as leads are produced and delivered to you. You can choose your preferred method of receiving leads—whether via email, text, or through your preferred CRM—and you are charged only for the verified leads you receive.`,
  },
  {
    question: 'How quickly can I start receiving leads?',
    answer:
      `Once you set up your account and specify your target criteria, you can typically start receiving leads within 24 to 48 hours. We work efficiently to ensure a steady flow tailored to your business needs.`,
  },
  {
    question: 'Can I customize my lead criteria?',
    answer:
      `Yes! You can customize various parameters including geographic location, type of service inquiries, budget ranges, and other demographics to ensure you receive leads matching your specific target audience.`,
  },
  {
    question: 'What support do you offer if I need help?',
    answer:
      `Our dedicated support team is available to assist you anytime. Whether you need help with account setup, adjusting your lead preferences, or have questions about billing, we're here to ensure your experience is smooth and successful.`,
  },
];

function FaqHome() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);

  const toggle = (index: number) => {
    setActiveIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  return (
    <section className="md:py-28 py-12 px-8">
      <div className="max-w-[1000px] mx-auto" data-aos="fade-up">
        <h2 className="md:text-4xl text-2xl text-center text-[#000] font-bold mb-8">
          Frequently Asked Questions
        </h2>
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="border border-[#01010117] overflow-hidden mb-4 rounded-[5px]"
          >
            <div
              onClick={() => toggle(index)}
              className="w-full text-left text-lg font-medium p-4 transition cursor-pointer flex justify-between items-center"
            >
              <p className="font-bold text-lg text-[#000]">{faq.question}</p>
              <span
                className={`transition-transform duration-300 ${activeIndex === index ? 'rotate-180' : ''
                  }`}
              >
                <Image
                  src="/images/icons/Vector-3.png"
                  alt="Arrow"
                  height={20}
                  width={20}
                />
              </span>
            </div>
            <div
              ref={(el) => {
                contentRefs.current[index] = el;
              }}
              className="transition-all duration-500 ease-in-out overflow-hidden"
              style={{
                maxHeight:
                  activeIndex === index
                    ? contentRefs.current[index]?.scrollHeight + 'px'
                    : '0px',
              }}
            >
              <p className="px-4 pb-4 text-[14px]">{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default FaqHome;
