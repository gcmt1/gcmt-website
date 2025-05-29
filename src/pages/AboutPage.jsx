import React from 'react';
import { Mail, Phone, MapPin, Award, Users, Shield } from 'lucide-react';
import Photo from "../assets/GCMT-logo.png";
import "../styles/AboutPage.css"; // Your scoped CSS

export default function AboutPage() {
  return (
    <div className="about-page bg-white min-h-screen">
      {/* Hero Section */}
      <section className="about-page__hero bg-gray-50 py-20">
        <div className="about-page__container container mx-auto px-4 md:px-6">
          <div className="about-page__hero-content flex flex-col items-center text-center">
            <h1 className="about-page__title text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              About Our Company
            </h1>
            <p className="about-page__subtitle text-xl text-gray-600 max-w-3xl mb-10">
              We're dedicated to providing exceptional products with unmatched service. 
              Our journey is built on quality, innovation, and customer satisfaction.
            </p>
            <div className="about-page__divider w-24 h-1 bg-blue-600 rounded" />
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="about-page__story py-16 md:py-24">
        <div className="about-page__container container mx-auto px-4 md:px-6">
          <div className="about-page__story-grid grid md:grid-cols-2 gap-12 items-center">
            <div className="about-page__story-image bg-gray-100 rounded-lg overflow-hidden h-96">
              <img
                src={Photo}
                alt="Our company story"
                className="about-page__story-img w-full h-full object-cover"
              />
            </div>
            <div className="about-page__story-text">
              <h2 className="about-page__story-title text-3xl font-bold text-gray-900 mb-6">
                Our Story
              </h2>
              <p className="about-page__story-paragraph text-gray-600 mb-6">
                Founded in 2010, our company began with a simple mission: to create high-quality products that enhance people's lives. What started as a small operation has grown into a trusted name in the industry, serving customers worldwide.
              </p>
              <p className="about-page__story-paragraph text-gray-600 mb-6">
                Through dedication to craftsmanship and attention to detail, we've built a reputation for excellence. Our team of experts continually researches and develops innovative solutions to meet the evolving needs of our customers.
              </p>
              <p className="about-page__story-paragraph text-gray-600">
                Today, we remain committed to the values that guided us from the beginning: integrity, quality, and exceptional customer service. As we grow, we continue to honor these principles in everything we do.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="about-page__values bg-gray-50 py-16 md:py-24">
        <div className="about-page__container container mx-auto px-4 md:px-6">
          <div className="about-page__values-header text-center mb-16">
            <h2 className="about-page__values-title text-3xl font-bold text-gray-900 mb-4">
              Our Core Values
            </h2>
            <p className="about-page__values-subtitle text-xl text-gray-600 max-w-3xl mx-auto">
              These principles guide our decisions and shape our company culture.
            </p>
          </div>
          <div className="about-page__values-grid grid md:grid-cols-3 gap-8">
            {[
              { Icon: Award, title: 'Quality Excellence', text: 'We never compromise on quality. Every product undergoes rigorous testing to ensure it meets our high standards before reaching our customers.' },
              { Icon: Users, title: 'Customer Focus', text: 'Our customers are at the heart of everything we do. We listen to feedback and continuously improve to better serve their needs.' },
              { Icon: Shield, title: 'Integrity', text: 'We conduct business with honesty and transparency. Our customers and partners can trust us to do what’s right, every time.' },
            ].map(({ Icon, title, text }) => (
              <div key={title} className="about-page__value-card bg-white p-8 rounded-lg shadow-md">
                <div className="about-page__value-icon text-blue-600 mb-4">
                  <Icon size={36} />
                </div>
                <h3 className="about-page__value-title text-xl font-bold text-gray-900 mb-3">
                  {title}
                </h3>
                <p className="about-page__value-text text-gray-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="about-page__team py-16 md:py-24">
        <div className="about-page__container container mx-auto px-4 md:px-6">
          <div className="about-page__team-header text-center mb-16">
            <h2 className="about-page__team-title text-3xl font-bold text-gray-900 mb-4">
              Our Leadership Team
            </h2>
            <p className="about-page__team-subtitle text-xl text-gray-600 max-w-3xl mx-auto">
              Meet the experts who drive our vision and innovation.
            </p>
          </div>
          <div className="about-page__team-grid grid md:grid-cols-3 gap-8">
            {[
              { name: 'Arya Patel', role: 'Product Promoter' }
            ].map(({ name, role }) => (
              <div key={name} className="about-page__team-member text-center">
                <div className="about-page__team-photo w-48 h-48 rounded-full overflow-hidden mx-auto mb-6">
                  <img src={Photo} alt={name} className="w-full h-full object-cover" />
                </div>
                <h3 className="about-page__team-name text-xl font-bold text-gray-900 mb-1">
                  {name}
                </h3>
                <p className="about-page__team-role text-blue-600 mb-4">{role}</p>
                <p className="about-page__team-bio text-gray-600">
                  {/* You can customize each bio as needed */}
                  {role === 'Chief Executive Officer'
                    ? 'With over 15 years of industry experience, Sarah leads our company with vision and dedication.'
                    : role === 'Chief Technology Officer'
                    ? 'Arya is the driving force behind our innovative product promotive solutions, ensuring we stay ahead of the curve.'
                    : 'Arya is the driving force behind our innovative product promotive solutions, ensuring we stay ahead of the curve.'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="about-page__stats bg-blue-600 text-white py-16">
        <div className="about-page__container container mx-auto px-4 md:px-6">
          <div className="about-page__stats-grid grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              ['15+', 'Years in Business'],
              ['50K+', 'Happy Customers'],
              ['100+', 'Products'],
              ['20+', 'Countries Served'],
            ].map(([stat, label]) => (
              <div key={label} className="about-page__stat text-center">
                <p className="about-page__stat-number text-4xl font-bold mb-2">{stat}</p>
                <p className="about-page__stat-label text-lg">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="about-page__contact py-16 md:py-24">
        <div className="about-page__container container mx-auto px-4 md:px-6">
          <div className="about-page__contact-header text-center mb-16">
            <h2 className="about-page__contact-title text-3xl font-bold text-gray-900 mb-4">
              Get in Touch
            </h2>
            <p className="about-page__contact-subtitle text-xl text-gray-600 max-w-3xl mx-auto">
              Have questions or want to learn more? We’d love to hear from you.
            </p>
          </div>
          <div className="about-page__contact-grid grid md:grid-cols-3 gap-8">
            {[
              { Icon: Mail, title: 'Email Us', lines: ['info@yourcompany.com', 'support@yourcompany.com'] },
              { Icon: Phone, title: 'Call Us', lines: ['+1 (555) 123-4567', 'Mon–Fri: 9AM–5PM EST'] },
              { Icon: MapPin, title: 'Visit Us', lines: ['123 Business Avenue', 'New York, NY 10001'] },
            ].map(({ Icon, title, lines }) => (
              <div key={title} className="about-page__contact-card bg-gray-50 p-8 rounded-lg text-center">
                <div className="about-page__contact-icon text-blue-600 mx-auto mb-4"><Icon size={36} /></div>
                <h3 className="about-page__contact-method text-xl font-bold text-gray-900 mb-3">{title}</h3>
                {lines.map(line => (
                  <p key={line} className="about-page__contact-line text-gray-600">{line}</p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="about-page__testimonials bg-gray-50 py-16 md:py-24">
        <div className="about-page__container container mx-auto px-4 md:px-6">
          <div className="about-page__testimonials-header text-center mb-16">
            <h2 className="about-page__testimonials-title text-3xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="about-page__testimonials-subtitle text-xl text-gray-600 max-w-3xl mx-auto">
              Don’t just take our word for it—here’s what our customers have to say.
            </p>
          </div>
          <div className="about-page__testimonials-grid grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                quote: "The quality of their products is outstanding. I've been a loyal customer for years and have never been disappointed.",
                name: "Emma Wilson",
                role: "Loyal Customer",
              },
              {
                quote: "Their customer service is exceptional. When I had an issue, they resolved it quickly and professionally.",
                name: "James Peterson",
                role: "Business Owner",
              },
              {
                quote: "I appreciate their commitment to quality and innovation. Their products are consistently ahead of the competition.",
                name: "Sophia Garcia",
                role: "Retail Partner",
              },
            ].map(({ quote, name, role }) => (
              <div key={name} className="about-page__testimonial bg-white p-8 rounded-lg shadow-md">
                <div className="about-page__testimonial-stars flex items-center text-yellow-400 mb-4">
                  <span>★★★★★</span>
                </div>
                <p className="about-page__testimonial-quote text-gray-600 mb-6 italic">{quote}</p>
                <div className="about-page__testimonial-author flex items-center">
                  <div className="about-page__testimonial-photo w-12 h-12 rounded-full overflow-hidden mr-4">
                    <img src={Photo} alt={name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="about-page__testimonial-name font-bold text-gray-900">{name}</p>
                    <p className="about-page__testimonial-role text-gray-600 text-sm">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call To Action Section */}
      <section className="about-page__cta py-16 md:py-24">
        <div className="about-page__container container mx-auto px-4 md:px-6">
          <div className="about-page__cta-box bg-blue-600 text-white rounded-lg p-8 md:p-12 text-center">
            <h2 className="about-page__cta-title text-3xl font-bold mb-4">
              Ready to Experience Our Products?
            </h2>
            <p className="about-page__cta-text text-xl mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers and discover the difference quality makes.
            </p>
            <button className="about-page__cta-button bg-white text-blue-600 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition duration-300">
              Shop Now
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
