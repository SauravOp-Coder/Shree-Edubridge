/* EduWorld International - Free booking integrations */
const BOOKING_CONFIG = {
  primaryWhatsApp: "919623738266",
  secondaryWhatsApp: "919623738266",
  businessEmail: "shreeeduworldint@gmail.com",
  formspreeEndpoint: "", // paste free Formspree endpoint here
  googleSheetEndpoint: "", // paste free Google Apps Script Web App URL here
  calendarBookingLink: "" // paste free Calendly / Google Appointment Schedule link here
};

document.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.querySelector('.menu-btn');
  const nav = document.querySelector('.nav-links');
  if (menuBtn && nav) menuBtn.addEventListener('click', () => nav.classList.toggle('mobile-open'));

  document.querySelectorAll('[data-open-meeting]').forEach(btn => btn.addEventListener('click', openMeeting));

  const modal = document.getElementById('meetingModal');
  const closeBtn = modal?.querySelector('.modal-close');
  if (closeBtn) closeBtn.addEventListener('click', closeMeeting);
  if (modal) modal.addEventListener('click', e => { if (e.target === modal) closeMeeting(); });

  document.querySelectorAll('.faq-item').forEach(item => item.querySelector('.faq-q')?.addEventListener('click', () => item.classList.toggle('active')));

  const blogDetails = {
    'russia-vs-kyrgyzstan': {
      title:'MBBS in Russia vs Kyrgyzstan',
      summary:'Understand the differences in tuition, campus life, recognition, and overall support for Indian students.',
      image:'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
      paragraphs:[
        'Russia offers long-standing medical universities with strong academic infrastructure, while Kyrgyzstan is known for lower costs and simpler admission requirements.',
        'This comparison helps you choose based on budget, weather, city comfort, FMGE/NEXT preparation, and student community support.'
      ]
    },
    'documents-required': {
      title:'Documents required for MBBS abroad',
      summary:'A clear checklist for passports, academic records, medical certificates, and admission paperwork.',
      image:'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
      paragraphs:[
        'Collect all transcripts, passports, photographs, medical reports, and notarized documents before applying to universities.',
        'A complete file speeds up admission and visa approval, and avoids last-minute delays during travel preparation.'
      ]
    },
    'visa-arrival': {
      title:'What happens after visa approval',
      summary:'Travel planning, airport pickup, university arrival, and early orientation support for new students.',
      image:'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80',
      paragraphs:[
        'After visa approval, confirm your flight, pack the right documents, and ask your consultancy for airport pickup and hostel arrival assistance.',
        'Early arrival support includes university registration guidance, local SIM setup, and tips for settling into hostels safely.'
      ]
    }
  };

  const blogModal = document.getElementById('blogModal');
  const blogClose = document.querySelector('.blog-close');
  const blogImage = document.querySelector('.blog-modal-image');
  const blogTitle = document.querySelector('.blog-modal-title-main');
  const blogSummary = document.querySelector('.blog-modal-summary');
  const blogTextNodes = document.querySelectorAll('.blog-modal-text');
  const blogContactBtn = document.querySelector('.blog-contact-btn');

  document.querySelectorAll('.blog-card').forEach(card => card.addEventListener('click', () => {
    const details = blogDetails[card.dataset.blog];
    if (!details) return;
    if (blogImage) blogImage.src = details.image;
    if (blogTitle) blogTitle.textContent = details.title;
    if (blogSummary) blogSummary.textContent = details.summary;
    blogTextNodes.forEach((node, index) => node.textContent = details.paragraphs[index] || '');
    if (blogModal) blogModal.classList.add('show');
  }));

  if (blogClose) blogClose.addEventListener('click', () => blogModal?.classList.remove('show'));
  if (blogModal) blogModal.addEventListener('click', e => { if (e.target === blogModal) blogModal.classList.remove('show'); });
  if (blogContactBtn) blogContactBtn.addEventListener('click', openMeeting);

  const countrySearch = document.getElementById('countrySearch');
  const countryFilter = document.getElementById('countryFilter');
  if (countrySearch || countryFilter) {
    const cards = [...document.querySelectorAll('.country-filter-card')];
    const apply = () => {
      const q = (countrySearch?.value || '').toLowerCase().trim();
      const f = (countryFilter?.value || 'all').toLowerCase();
      cards.forEach(card => {
        const text = (card.dataset.search || '').toLowerCase();
        const matchQ = !q || text.includes(q);
        const matchF = f === 'all' || (card.dataset.country || '').toLowerCase() === f;
        card.style.display = matchQ && matchF ? '' : 'none';
      });
    };
    countrySearch?.addEventListener('input', apply);
    countryFilter?.addEventListener('change', apply);
  }

  document.querySelectorAll('#calendlyBtn').forEach(btn => {
    if (BOOKING_CONFIG.calendarBookingLink) btn.href = BOOKING_CONFIG.calendarBookingLink;
    else btn.addEventListener('click', e => { e.preventDefault(); showNotice('Add your free calendar booking link in script.js first.'); });
  });

  document.querySelectorAll('#meetingForm').forEach(form => form.addEventListener('submit', async e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    data.page = document.title;
    data.submittedAt = new Date().toLocaleString();

    await sendToFormspree(data);
    sendToGoogleSheet(data);
    openWhatsApp(data);

    closeMeeting();
    showNotice('WhatsApp enquiry opened. Add Formspree/Google Sheet/Calendar links in script.js for full free automation.');
    form.reset();
  }));

  setTimeout(() => openMeeting(), 7000);
  setInterval(() => { if (!modal?.classList.contains('show')) openMeeting(); }, 180000);
});

function buildText(data){
  return `New Free MBBS Counselling Request\n\nName: ${data.name || ''}\nPhone: ${data.phone || ''}\nEmail: ${data.email || ''}\nCountry: ${data.country || ''}\nPreferred Date: ${data.date || ''}\nPreferred Time: ${data.time || ''}\nMessage: ${data.message || ''}\nPage: ${data.page || ''}`;
}

function openWhatsApp(data){
  window.open(`https://wa.me/${BOOKING_CONFIG.primaryWhatsApp}?text=${encodeURIComponent(buildText(data))}`, '_blank', 'noopener,noreferrer');
}

async function sendToFormspree(data){
  if (!BOOKING_CONFIG.formspreeEndpoint) return;
  try {
    await fetch(BOOKING_CONFIG.formspreeEndpoint, {
      method:'POST',
      headers:{'Content-Type':'application/json','Accept':'application/json'},
      body:JSON.stringify(data)
    });
  } catch (err) { console.warn('Formspree failed', err); }
}

function sendToGoogleSheet(data){
  if (!BOOKING_CONFIG.googleSheetEndpoint) return;
  try {
    fetch(BOOKING_CONFIG.googleSheetEndpoint, {
      method:'POST',
      mode:'no-cors',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(data)
    });
  } catch (err) { console.warn('Google Sheet failed', err); }
}

function showNotice(message){
  const notice = document.getElementById('notice');
  if (!notice) return;
  notice.textContent = message;
  notice.classList.add('show');
  setTimeout(() => notice.classList.remove('show'), 4500);
}

function openMeeting(){ document.getElementById('meetingModal')?.classList.add('show'); }
function closeMeeting(){ document.getElementById('meetingModal')?.classList.remove('show'); }
