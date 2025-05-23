import React from 'react';
import { Mail, Phone, MapPin, Award, Users, Clock, Shield } from 'lucide-react';
import Photo from "../assets/GCMT-logo.png"

export default function About() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">About Our Company</h1>
            <p className="text-xl text-gray-600 max-w-3xl mb-10">
              We're dedicated to providing exceptional products with unmatched service. 
              Our journey is built on quality, innovation, and customer satisfaction.
            </p>
            <div className="w-24 h-1 bg-blue-600 rounded"></div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="bg-gray-100 rounded-lg overflow-hidden h-96">
              {/* Replace with actual company image */}
              <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                <img src={Photo} alt="Our company story" className="w-full h-full object-cover" />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <p className="text-gray-600 mb-6">
                Founded in 2010, our company began with a simple mission: to create high-quality products that enhance people's lives. What started as a small operation has grown into a trusted name in the industry, serving customers worldwide.
              </p>
              <p className="text-gray-600 mb-6">
                Through dedication to craftsmanship and attention to detail, we've built a reputation for excellence. Our team of experts continually researches and develops innovative solutions to meet the evolving needs of our customers.
              </p>
              <p className="text-gray-600">
                Today, we remain committed to the values that guided us from the beginning: integrity, quality, and exceptional customer service. As we grow, we continue to honor these principles in everything we do.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Core Values</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These principles guide our decisions and shape our company culture.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="text-blue-600 mb-4">
                <Award size={36} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Quality Excellence</h3>
              <p className="text-gray-600">
                We never compromise on quality. Every product undergoes rigorous testing to ensure it meets our high standards before reaching our customers.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="text-blue-600 mb-4">
                <Users size={36} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Customer Focus</h3>
              <p className="text-gray-600">
                Our customers are at the heart of everything we do. We listen to feedback and continuously improve to better serve their needs.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="text-blue-600 mb-4">
                <Shield size={36} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Integrity</h3>
              <p className="text-gray-600">
                We conduct business with honesty and transparency. Our customers and partners can trust us to do what's right, every time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Leadership Team</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Meet the experts who drive our vision and innovation.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Team Member 1 */}
            <div className="text-center">
              <div className="w-48 h-48 rounded-full overflow-hidden mx-auto mb-6">
                <img src={Photo} alt="CEO" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Sarah Johnson</h3>
              <p className="text-blue-600 mb-4">Chief Executive Officer</p>
              <p className="text-gray-600">
                With over 15 years of industry experience, Sarah leads our company with vision and dedication.
              </p>
            </div>
            {/* Team Member 2 */}
            <div className="text-center">
              <div className="w-48 h-48 rounded-full overflow-hidden mx-auto mb-6">
                <img src={Photo} alt="CTO" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Michael Chen</h3>
              <p className="text-blue-600 mb-4">Chief Technology Officer</p>
              <p className="text-gray-600">
                Michael brings innovation to our product development, ensuring we stay at the cutting edge.
              </p>
            </div>
            {/* Team Member 3 */}
            <div className="text-center">
              <div className="w-48 h-48 rounded-full overflow-hidden mx-auto mb-6">
                <img src={Photo} alt="COO" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">David Rodriguez</h3>
              <p className="text-blue-600 mb-4">Chief Operations Officer</p>
              <p className="text-gray-600">
                David oversees our operations, maintaining efficiency and excellence in everything we do.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <p className="text-4xl font-bold mb-2">15+</p>
              <p className="text-lg">Years in Business</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold mb-2">50K+</p>
              <p className="text-lg">Happy Customers</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold mb-2">100+</p>
              <p className="text-lg">Products</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold mb-2">20+</p>
              <p className="text-lg">Countries Served</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Get in Touch</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Have questions or want to learn more? We'd love to hear from you.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-8 rounded-lg text-center">
              <div className="text-blue-600 mx-auto mb-4">
                <Mail size={36} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Email Us</h3>
              <p className="text-gray-600">info@yourcompany.com</p>
              <p className="text-gray-600">support@yourcompany.com</p>
            </div>
            <div className="bg-gray-50 p-8 rounded-lg text-center">
              <div className="text-blue-600 mx-auto mb-4">
                <Phone size={36} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Call Us</h3>
              <p className="text-gray-600">+1 (555) 123-4567</p>
              <p className="text-gray-600">Mon-Fri: 9AM - 5PM EST</p>
            </div>
            <div className="bg-gray-50 p-8 rounded-lg text-center">
              <div className="text-blue-600 mx-auto mb-4">
                <MapPin size={36} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Visit Us</h3>
              <p className="text-gray-600">123 Business Avenue</p>
              <p className="text-gray-600">New York, NY 10001</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Don't just take our word for it - here's what our customers have to say.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="flex items-center text-yellow-400 mb-4">
                <span>★★★★★</span>
              </div>
              <p className="text-gray-600 mb-6 italic">
                "The quality of their products is outstanding. I've been a loyal customer for years and have never been disappointed."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                  <img src={Photo} alt="Customer" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Emma Wilson</p>
                  <p className="text-gray-600 text-sm">Loyal Customer</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="flex items-center text-yellow-400 mb-4">
                <span>★★★★★</span>
              </div>
              <p className="text-gray-600 mb-6 italic">
                "Their customer service is exceptional. When I had an issue, they resolved it quickly and professionally."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                  <img src={Photo} alt="Customer" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">James Peterson</p>
                  <p className="text-gray-600 text-sm">Business Owner</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="flex items-center text-yellow-400 mb-4">
                <span>★★★★★</span>
              </div>
              <p className="text-gray-600 mb-6 italic">
                "I appreciate their commitment to quality and innovation. Their products are consistently ahead of the competition."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                  <img src={Photo} alt="Customer" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Sophia Garcia</p>
                  <p className="text-gray-600 text-sm">Retail Partner</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="bg-blue-600 text-white rounded-lg p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Experience Our Products?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers and discover the difference quality makes.
            </p>
            <button className="bg-white text-blue-600 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition duration-300">
              Shop Now
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}