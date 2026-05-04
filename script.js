const form = document.getElementById("funeralLeadForm");
const formStatus = document.getElementById("formStatus");
const menuToggle = document.querySelector(".menu-toggle");
const nav = document.getElementById("primary-nav");

const chatToggle = document.getElementById("chatToggle");
const chatbot = document.getElementById("chatbot");
const chatClose = document.getElementById("chatClose");
const chatMessages = document.getElementById("chatMessages");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");

const faqs = [
  {
    keywords: ["price", "cost", "package", "how much"],
    answer: "Our pricing depends on the selected services. Share your phone number and preferred service, and our team will give you a clear quote quickly.",
  },
  {
    keywords: ["24/7", "emergency", "urgent", "now"],
    answer: "Yes, we are available 24/7 for urgent assistance and immediate response.",
  },
  {
    keywords: ["cremation"],
    answer: "We provide respectful cremation services, including planning and memorial support.",
  },
  {
    keywords: ["burial"],
    answer: "We offer traditional and personalized burial services with full coordination support.",
  },
  {
    keywords: ["transport", "body", "transfer"],
    answer: "We handle local and long-distance body transport professionally and with dignity.",
  },
  {
    keywords: ["documents", "paperwork", "certificate"],
    answer: "Our team can guide your family on required documentation and practical next steps.",
  },
];

const chatLead = {
  name: "",
  phone: "",
  service: "",
};

function addMessage(text, sender = "bot") {
  const bubble = document.createElement("div");
  bubble.className = `msg ${sender}`;
  bubble.textContent = text;
  chatMessages.appendChild(bubble);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function setWelcomeMessage() {
  addMessage("Hello. I can answer common funeral service questions and help you request a callback.");
  addMessage("You can ask about pricing, burial, cremation, transport, or type 'callback' to leave your details.");
}

function saveLead(data, source = "form") {
  const leads = JSON.parse(localStorage.getItem("tim_funeral_leads") || "[]");
  leads.push({
    ...data,
    source,
    createdAt: new Date().toISOString(),
  });
  localStorage.setItem("tim_funeral_leads", JSON.stringify(leads));
}

function isLikelyPhone(value) {
  return /^[+]?\d[\d\s-]{7,}$/.test(value.trim());
}

function respondToChat(message) {
  const query = message.toLowerCase();

  if (query.includes("callback") || query.includes("lead")) {
    addMessage("Sure. Please share your full name.");
    chatLead.name = "pending";
    return;
  }

  if (chatLead.name === "pending") {
    chatLead.name = message.trim();
    addMessage("Thank you. Please share your phone number.");
    chatLead.phone = "pending";
    return;
  }

  if (chatLead.phone === "pending") {
    if (!isLikelyPhone(message)) {
      addMessage("Please provide a valid phone number, including country code if possible.");
      return;
    }
    chatLead.phone = message.trim();
    addMessage("What service do you need? (Burial, Cremation, Transport, Planning)");
    chatLead.service = "pending";
    return;
  }

  if (chatLead.service === "pending") {
    chatLead.service = message.trim();

    saveLead(
      {
        name: chatLead.name,
        phone: chatLead.phone,
        email: "",
        service: chatLead.service,
        message: "Lead captured from chatbot",
      },
      "chatbot"
    );

    addMessage("Thank you. Your details have been captured and our team will contact you soon.");
    addMessage("You can also complete the full form on this page for email follow-up.");

    chatLead.name = "";
    chatLead.phone = "";
    chatLead.service = "";
    return;
  }

  const matched = faqs.find((item) => item.keywords.some((word) => query.includes(word)));
  if (matched) {
    addMessage(matched.answer);
    if (query.includes("price") || query.includes("cost")) {
      addMessage("If you want, type 'callback' and I will capture your details now.");
    }
    return;
  }

  addMessage("I can help with burial, cremation, transport, planning, and pricing guidance. Type 'callback' to leave your details for a quick response.");
}

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    const expanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!expanded));
    nav.classList.toggle("open");
  });
}

if (form && formStatus) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const lead = {
      name: String(formData.get("name") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      service: String(formData.get("service") || "").trim(),
      message: String(formData.get("message") || "").trim(),
    };

    if (!lead.name || !lead.phone || !lead.email || !lead.service) {
      formStatus.textContent = "Please complete all required fields.";
      return;
    }

    saveLead(lead, "form");
    form.reset();
    formStatus.textContent = "Thank you. Your request has been received. We will contact you shortly.";
  });
}

if (chatToggle && chatbot && chatMessages) {
  let initialized = false;

  chatToggle.addEventListener("click", () => {
    chatbot.hidden = false;
    chatToggle.hidden = true;
    if (!initialized) {
      setWelcomeMessage();
      initialized = true;
    }
  });

  if (chatClose) {
    chatClose.addEventListener("click", () => {
      chatbot.hidden = true;
      chatToggle.hidden = false;
    });
  }
}

if (chatForm && chatInput) {
  chatForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const message = chatInput.value.trim();
    if (!message) {
      return;
    }

    addMessage(message, "user");
    chatInput.value = "";
    respondToChat(message);
  });
}
