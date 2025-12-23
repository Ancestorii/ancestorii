export default function Contact() {
  return (
    <section className="bg-white py-16">
      <div className="max-w-screen-md mx-auto px-6 lg:px-8">
        {/* Heading */}
        <h2 className="mb-4 text-4xl md:text-5xl font-extrabold text-center text-[#0F2040]">
          Contact Us
        </h2>
        <p className="mb-10 font-light text-center text-gray-600 sm:text-xl">
          Got a technical issue? Want to send feedback? Need details about our plans? 
          We’d love to hear from you.
        </p>

        {/* Form */}
        <form action="#" className="space-y-8">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block mb-2 text-sm font-medium text-[#0F2040]"
            >
              Your Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="name@example.com"
              required
              className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-[#D4AF37] focus:border-[#D4AF37] block w-full p-3"
            />
          </div>

          {/* Subject */}
          <div>
            <label
              htmlFor="subject"
              className="block mb-2 text-sm font-medium text-[#0F2040]"
            >
              Subject
            </label>
            <input
              type="text"
              id="subject"
              placeholder="Let us know how we can help you"
              required
              className="block w-full p-3 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 shadow-sm focus:ring-[#D4AF37] focus:border-[#D4AF37]"
            />
          </div>

          {/* Message */}
          <div>
            <label
              htmlFor="message"
              className="block mb-2 text-sm font-medium text-[#0F2040]"
            >
              Your Message
            </label>
            <textarea
              id="message"
              rows={6}
              placeholder="Leave your message here..."
              className="block w-full p-3 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 shadow-sm focus:ring-[#D4AF37] focus:border-[#D4AF37]"
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            className="py-3 px-6 text-sm font-medium text-center text-white rounded-lg bg-[#D4AF37] hover:bg-yellow-600 focus:ring-4 focus:outline-none focus:ring-yellow-200 transition"
          >
            Send Message
          </button>
        </form>
      </div>
    </section>
  );
}
