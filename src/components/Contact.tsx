"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type StatusState = "success" | "error" | null;

export default function Contact() {
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<StatusState>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !subject || !message) return;

    setLoading(true);
    setStatus(null);

    try {
      const { error } = await supabase.functions.invoke(
        "send-contact-email",
        {
          body: {
            name: "Website contact",
            email,
            message: `Subject: ${subject}\n\n${message}`,
          },
        }
      );

      if (error) {
        setStatus("error");
      } else {
        setStatus("success");
        setEmail("");
        setSubject("");
        setMessage("");
      }
    } catch {
      setStatus("error");
    }

    setLoading(false);
  };

  return (
    <section className="bg-white py-16">
      <div className="max-w-screen-md mx-auto px-6 lg:px-8">
        <h2 className="mb-4 text-4xl md:text-5xl font-extrabold text-center text-[#0F2040]">
          Contact Us
        </h2>

        <p className="mb-10 font-light text-center text-gray-600 sm:text-xl">
          Got a technical issue? Want to send feedback? Need details about our
          plans? We’d love to hear from you.
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Email */}
          <div>
            <label className="block mb-2 text-sm font-medium text-[#0F2040]">
              Your Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="shadow-sm bg-gray-50 border border-gray-300 text-sm text-[#0F2040] placeholder-gray-400 rounded-lg w-full p-3"
            />
          </div>

          {/* Subject */}
          <div>
            <label className="block mb-2 text-sm font-medium text-[#0F2040]">
              Subject
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Let us know how we can help"
              className="shadow-sm bg-gray-50 border border-gray-300 text-sm text-[#0F2040] placeholder-gray-400 rounded-lg w-full p-3"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block mb-2 text-sm font-medium text-[#0F2040]">
              Your Message
            </label>
            <textarea
              rows={6}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Leave your message here…"
              className="shadow-sm bg-gray-50 border border-gray-300 text-sm text-[#0F2040] placeholder-gray-400 rounded-lg w-full p-3"
            />
          </div>

          {/* Status */}
          {status === "success" && (
            <p className="text-green-600 text-sm">
              Message sent successfully.
            </p>
          )}
          {status === "error" && (
            <p className="text-red-600 text-sm">
              Something went wrong. Please try again.
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="py-3 px-6 text-sm font-medium text-white rounded-lg bg-[#D4AF37] hover:bg-yellow-600 transition disabled:opacity-60"
          >
            {loading ? "Sending…" : "Send Message"}
          </button>
        </form>
      </div>
    </section>
  );
}
