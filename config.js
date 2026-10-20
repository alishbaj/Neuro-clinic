/* ------------------------------------------------------------------
   Neuro Longevity Care — site configuration
   Edit THIS FILE ONLY to update practice links and contact details.
   Every page reads these values; you do not need to touch the HTML.

   Elation Patient Passport gives the practice three patient-facing
   links once onboarding is complete. Paste them here:
     schedule -> self-scheduling link            (Book a Consultation)
     pay      -> online bill-pay link            (Pay a Bill)
     forms    -> intake / consent forms link     (Complete Forms)
     portal   -> Patient Passport sign-in        (Patient Portal)
   Leave a value empty ("") and every button that uses it will fall
   back to the Contact page instead of a broken link.
------------------------------------------------------------------- */
window.SITE = {
  practice: "Neuro Longevity Care",
  physician: "Alla Al-Habib, M.D.",
  physicianShort: "Dr. Al-Habib",
  phone: "",            // e.g. "(972) 555-0100"
  email: "",            // e.g. "hello@neurolongevitycare.com"
  serviceArea: "Texas", // states where the physician is licensed for telehealth

  links: {
    schedule: "",       // Elation self-scheduling
    pay: "",            // Elation bill pay
    forms: "",          // Elation forms
    portal: "",         // Elation Patient Passport
    professional: "contact.html#professional" // medical-legal / professional inquiries
  },

  fallback: "contact.html"
};
