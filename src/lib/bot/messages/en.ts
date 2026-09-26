export interface Messages {
  welcome: string;
  consent: string;
  identity: string;
  notFound: string;
  wrongPerson: string;
  employment: string;
  supportNeeds: string;
  employer: string;
  employerInvalid: string;
  role: string;
  roleInvalid: string;
  salary: string;
  satisfaction: string;
  relevanceJob: string;
  relevanceSituation: string;
  skillGapsJob: string;
  skillGapsSituation: string;
  additionalJob: string;
  additionalSituation: string;
  goals: string;
  challenges: string;
  recommendations: string;
  selectHint: string;
  selectMore: string;
  invalidOption: string;
  invalidText: string;
  declined: string;
  error: string;
  fallbackName: string;
  complete: string;
  labels: Record<string, string>;
  descriptions: Record<string, string>;
}

export const en: Messages = {
  welcome: `👋 *Hello {name}!*

Welcome to *OutcomeTrack* – the official placement tracking & career guidance platform by the *Maharashtra State Skill Development Society (MSSDS)* under the *Pradhan Mantri Kaushal Vikas Yojana (PMKVY)*.

We're here to understand your career journey after training so we can:
✅ Improve training programs for future batches
✅ Connect you with better job opportunities
✅ Provide personalized career guidance
✅ Help policymakers make data-driven decisions

*Your responses are confidential and used only for program improvement.*

It takes about 3-4 minutes.`,
  consent: `📋 *Consent Required*

Before we proceed, we need your consent to:
1. Collect your employment & training feedback
2. Store your responses securely (encrypted)
3. Use anonymized data for program analytics
4. Contact you for future opportunities (optional)

*You can skip any question or withdraw anytime.*

Do you consent to participate?`,
  identity: `🔍 *Identity Verification*

To link your responses to your training record, please confirm:

*Name:* {name}
*Phone:* {phone}
*Training Program:* {programme}
*Batch:* {cohort}

Is this correct?`,
  notFound: "We couldn't find your training record. Let's continue anyway! 📝",
  wrongPerson: "No worries! We won't link this to any record. Let's continue with the survey. 📝",
  employment: `💼 *Current Employment Status*

What best describes your current situation?`,
  supportNeeds: `🤝 *How can we help you?*

What support would be most useful to you right now?`,
  employer: `🏢 *Employer Details*

What is the name of your current employer/organization?
(If self-employed, type your business name — or type *SKIP*)`,
  employerInvalid: "Please enter a valid employer name (at least 2 characters), or type *SKIP*.",
  role: `👔 *Your Role*

What is your current job title/role?
(e.g. "Software Developer", "Sales Executive", "Electrician") — or type *SKIP*`,
  roleInvalid: "Please enter a valid role (at least 2 characters), or type *SKIP*.",
  salary: `💰 *Monthly Income Range*

What is your approximate monthly income (including incentives)?`,
  satisfaction: `😊 *Job Satisfaction*

How satisfied are you with your current role?`,
  relevanceJob: `🎓 *Training Relevance*

How relevant was your PMKVY training to your current job?`,
  relevanceSituation: `🎓 *Training Relevance*

How relevant is your PMKVY training to your current situation and job search?`,
  skillGapsJob: `📉 *Skill Gaps*

What skills did you *lack* when starting this job that training didn't cover?`,
  skillGapsSituation: `📉 *Skill Gaps*

Which skills do you feel you're *missing* for the jobs you want?`,
  additionalJob: `📚 *Additional Training Needs*

What training would help you grow in your current role or get a better job?`,
  additionalSituation: `📚 *Additional Training Needs*

What training would most improve your chances of getting a good job?`,
  goals: `🎯 *Career Goals (Next 2 Years)*

What are you aiming for?`,
  challenges: `🚧 *Biggest Career Challenges*

What's holding you back?`,
  recommendations: `💡 *Your Suggestions for PMKVY*

How can we improve the training program for future students?`,
  selectHint: "Select all that apply (up to 3). Type *DONE* when finished, or *SKIP* to pass.",
  selectMore: "Got it! ({count}/3) Select more, or type *DONE* to continue.",
  invalidOption: "Please choose one of the options above 👆",
  invalidText: "Please type a valid answer, or type *SKIP*.",
  declined: "No problem! Thank you for your time. You can type *START* anytime to participate later. 🙏",
  error: "Sorry, something went wrong. Please type *START* to begin again.",
  fallbackName: "there",
  complete: `🎉 *Thank You, {name}!*

Your responses have been recorded and will help improve skill training for thousands of students across Maharashtra.

📊 *What happens next:*
• Your feedback goes to MSSDS & NSDC for program improvements
• You'll get personalized job alerts on OutcomeTrack
• We may reach out for follow-up in 6 months

🔗 *Stay Connected:*
• Visit: https://outcometrack.vercel.app
• Job alerts | Skill courses | Career guidance

*Together, building a skilled Maharashtra!* 🇮🇳

— Team OutcomeTrack (MSSDS / PMKVY)`,
  labels: {
    consent_yes: "✅ Yes, I consent",
    consent_no: "❌ No, thank you",
    identity_yes: "✅ Yes, that's me",
    identity_no: "❌ No, wrong person",
    employed_full: "1️⃣ Employed full-time",
    employed_part: "2️⃣ Employed part-time",
    self_employed: "3️⃣ Self-employed / Freelance",
    apprentice: "4️⃣ Apprentice / Intern",
    looking: "5️⃣ Looking for work",
    not_working: "6️⃣ Not working / Studying",
    salary_0_10k: "💵 Below ₹10,000",
    salary_10k_15k: "💵 ₹10,000 - ₹15,000",
    salary_15k_25k: "💵 ₹15,000 - ₹25,000",
    salary_25k_40k: "💵 ₹25,000 - ₹40,000",
    salary_40k_60k: "💵 ₹40,000 - ₹60,000",
    salary_60k_100k: "💵 ₹60,000 - ₹1,00,000",
    salary_100k_plus: "💵 Above ₹1,00,000",
    salary_prefer_not: "🤐 Prefer not to say",
    sat_5: "⭐⭐⭐⭐⭐ Very Satisfied",
    sat_4: "⭐⭐⭐⭐ Satisfied",
    sat_3: "⭐⭐⭐ Neutral",
    sat_2: "⭐⭐ Dissatisfied",
    sat_1: "⭐ Very Dissatisfied",
    support_job_alerts: "🚨 Job alerts & openings",
    support_interview: "🎤 Interview preparation",
    support_training: "📚 More skill training",
    support_counselling: "🧭 Career counselling",
    support_none: "✅ No help needed now",
    relevance_direct: "🎯 Directly relevant",
    relevance_partial: "🔗 Somewhat relevant",
    relevance_basics: "📚 Only basics useful",
    relevance_none: "❌ Not relevant at all",
    gap_technical: "💻 Technical/Digital skills",
    gap_communication: "🗣️ Communication/Soft skills",
    gap_analytical: "📊 Data/Analytical skills",
    gap_domain: "🔧 Domain-specific skills",
    gap_etiquette: "👔 Professional etiquette",
    gap_financial: "💰 Financial literacy",
    gap_none: "✅ No major gaps",
    train_adv_tech: "🚀 Advanced technical skills",
    train_cert: "🎯 Certification courses",
    train_english: "🗣️ English/Communication",
    train_entrepreneur: "💼 Entrepreneurship",
    train_leadership: "📈 Leadership/Management",
    train_digital: "💻 Digital/Computer skills",
    train_interview: "🤝 Interview preparation",
    train_none: "✅ None needed",
    goal_promotion: "📈 Promotion in current role",
    goal_switch: "🔄 Switch to better job",
    goal_education: "🎓 Higher education/degree",
    goal_business: "🏢 Start own business",
    goal_abroad: "🌍 Work abroad",
    goal_stay: "🏠 Stay in current role",
    goal_unsure: "🤔 Not sure yet",
    challenge_salary: "💰 Low salary / No increments",
    challenge_growth: "📉 Limited growth opportunities",
    challenge_skills: "🎓 Skills don't match market needs",
    challenge_location: "📍 Location / Commute issues",
    challenge_balance: "⚖️ Work-life balance",
    challenge_culture: "🤝 Workplace culture",
    challenge_contract: "📋 No formal contract/benefits",
    challenge_family: "👨‍👩‍👧‍👦 Family/personal constraints",
    challenge_none: "✅ No major challenges",
    rec_practical: "🛠️ More practical/hands-on training",
    rec_internship: "🏭 Industry visits & internships",
    rec_tools: "💻 Latest tools & technologies",
    rec_softskills: "🗣️ Soft skills & English focus",
    rec_placement: "🤝 Better placement support",
    rec_certs: "📜 Recognized certifications",
    rec_financial: "💰 Financial literacy module",
    rec_trainers: "👩‍🏫 Better trainer quality",
    rec_good: "✅ Program is good as-is",
  },
  descriptions: {
    gap_technical: "Software, tools, equipment",
    gap_communication: "English, presentation, teamwork",
    gap_analytical: "Excel, reporting, analysis",
    gap_domain: "Industry-specific knowledge",
    gap_etiquette: "Workplace behavior, emails",
    gap_financial: "Salary, taxes, savings",
    gap_none: "Training covered everything",
    train_adv_tech: "Next-level domain skills",
    train_cert: "Industry-recognized certs",
    train_english: "Business communication",
    train_entrepreneur: "Start your own business",
    train_leadership: "Team lead, supervisor skills",
    train_digital: "MS Office, coding, tools",
    train_interview: "Resume, mock interviews",
    train_none: "Happy with current skills",
  },
};
